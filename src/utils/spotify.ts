// src/utils/spotify.ts

export class SpotifyApiError extends Error {
  constructor(message: string, public status: number, public responseData?: any) {
    super(message);
    this.name = 'SpotifyApiError';
  }
}

export const callSpotifyApi = async <T = any>(
  endpoint: string,
  accessToken: string,
  options: RequestInit = {}
): Promise<T> => {
  const baseUrl = 'https://api.spotify.com/v1';
  const url = endpoint.startsWith('https://') ? endpoint : `${baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${accessToken}`);
  if (options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH') {
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json'); // Default Content-Type for mutation requests
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      // If response is not JSON, use text
      errorData = await response.text();
    }
    console.error(`Spotify API Error: ${response.status} - ${url}`, errorData);
    throw new SpotifyApiError(
      `Spotify API request failed with status ${response.status}`,
      response.status,
      errorData
    );
  }

  // If response is ok but status is 204 (No Content) or 202 (Accepted),
  // there might be no body or it might not be JSON.
  if (response.status === 204 || response.status === 202) {
    return undefined as T; // Or an appropriate representation for "no content"
  }

  // Try to parse as JSON, but handle cases where it might not be (though Spotify API usually is)
  const responseText = await response.text();
  try {
    return JSON.parse(responseText) as T;
  } catch (e) {
    // If it's not JSON but the request was OK (e.g. some edge case API)
    // return the text itself, or handle as an unexpected response format error
    console.warn('Spotify API response was not JSON, returning as text:', responseText);
    return responseText as unknown as T;
  }
};
