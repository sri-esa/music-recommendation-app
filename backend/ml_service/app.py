from flask import Flask, request, jsonify
from dotenv import load_dotenv
import os
import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from lightfm import LightFM
from pymongo import MongoClient
import pickle
import threading
import schedule
import time

# Load environment variables
load_dotenv()

app = Flask(__name__)

# MongoDB connection
client = MongoClient(os.getenv('MONGODB_URI', 'mongodb://localhost:27017/musicify'))
db = client.musicify

# Global variables for models
content_similarity_matrix = None
hybrid_model = None
song_features_matrix = None
user_item_matrix = None
song_ids = []
user_ids = []

def load_song_features():
    """Load and process song features from MongoDB"""
    songs = list(db.songs.find({}, {
        '_id': 1,
        'genre': 1,
        'audioFeatures': 1,
        'mood': 1
    }))
    
    # Create feature matrix
    features = []
    global song_ids
    song_ids = []
    
    for song in songs:
        song_ids.append(str(song['_id']))
        
        # Combine all features
        song_features = []
        # Add audio features
        for feature in ['tempo', 'energy', 'danceability', 'valence']:
            song_features.append(song['audioFeatures'].get(feature, 0))
        
        # One-hot encode genre
        genres = song['genre']
        all_genres = set()
        for g in genres:
            all_genres.add(g)
        
        # One-hot encode mood
        mood = song['mood']
        moods = ['chill', 'energetic', 'sad', 'romantic', 'dark', 'lofi']
        mood_vector = [1 if m == mood else 0 for m in moods]
        
        song_features.extend(mood_vector)
        features.append(song_features)
    
    return np.array(features)

def build_user_item_matrix():
    """Build user-item interaction matrix"""
    interactions = list(db.userinteractions.find({
        'action': {'$in': ['play', 'like']}
    }))
    
    global user_ids
    user_ids = list(set(str(inter['user']) for inter in interactions))
    
    # Create sparse matrix
    matrix = np.zeros((len(user_ids), len(song_ids)))
    
    for interaction in interactions:
        user_idx = user_ids.index(str(interaction['user']))
        song_idx = song_ids.index(str(interaction['song']))
        
        # Weight likes more than plays
        weight = 2 if interaction['action'] == 'like' else 1
        matrix[user_idx][song_idx] += weight
    
    return matrix

def train_hybrid_model():
    """Train LightFM hybrid recommendation model"""
    global hybrid_model, song_features_matrix, user_item_matrix
    
    # Load data
    song_features_matrix = load_song_features()
    user_item_matrix = build_user_item_matrix()
    
    # Initialize and train model
    hybrid_model = LightFM(learning_rate=0.05, loss='warp')
    hybrid_model.fit(
        user_item_matrix,
        item_features=song_features_matrix,
        epochs=30,
        num_threads=4
    )
    
    # Calculate content similarity matrix
    global content_similarity_matrix
    content_similarity_matrix = cosine_similarity(song_features_matrix)
    
    # Save models
    with open('models/hybrid_model.pkl', 'wb') as f:
        pickle.dump(hybrid_model, f)
    with open('models/content_similarity.pkl', 'wb') as f:
        pickle.dump(content_similarity_matrix, f)

def update_models():
    """Periodic model update function"""
    print("Updating recommendation models...")
    train_hybrid_model()
    print("Models updated successfully")

# Schedule model updates
def run_schedule():
    while True:
        schedule.run_pending()
        time.sleep(3600)  # Check every hour

schedule.every().day.at("00:00").do(update_models)
threading.Thread(target=run_schedule, daemon=True).start()

@app.route('/recommend', methods=['POST'])
def get_recommendations():
    data = request.json
    user_id = data.get('userId')
    mood = data.get('mood')
    n_recommendations = data.get('limit', 10)
    
    try:
        # Get user index
        user_idx = user_ids.index(user_id)
        
        # Get hybrid recommendations
        scores = hybrid_model.predict(
            user_idx,
            np.arange(len(song_ids)),
            item_features=song_features_matrix
        )
        
        # Get top song indices
        top_items = np.argsort(-scores)[:n_recommendations]
        
        # Get recommended song IDs
        recommended_songs = [song_ids[idx] for idx in top_items]
        
        # If mood specified, filter by mood
        if mood:
            songs = list(db.songs.find({
                '_id': {'$in': recommended_songs},
                'mood': mood
            }))
        else:
            songs = list(db.songs.find({
                '_id': {'$in': recommended_songs}
            }))
        
        return jsonify({
            'success': True,
            'recommendations': songs
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/similar', methods=['POST'])
def get_similar_songs():
    data = request.json
    song_id = data.get('songId')
    n_recommendations = data.get('limit', 5)
    
    try:
        # Get song index
        song_idx = song_ids.index(song_id)
        
        # Get similar songs
        similar_scores = content_similarity_matrix[song_idx]
        similar_items = np.argsort(-similar_scores)[1:n_recommendations+1]
        
        # Get similar song IDs
        similar_song_ids = [song_ids[idx] for idx in similar_items]
        
        # Get song details
        similar_songs = list(db.songs.find({
            '_id': {'$in': similar_song_ids}
        }))
        
        return jsonify({
            'success': True,
            'similar_songs': similar_songs
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    # Create models directory if it doesn't exist
    os.makedirs('models', exist_ok=True)
    
    # Initial model training
    train_hybrid_model()
    
    # Start Flask app
    app.run(host='0.0.0.0', port=5001) 