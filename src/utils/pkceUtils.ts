// src/utils/pkceUtils.ts

/**
 * Generates a cryptographically random string for use as a PKCE code verifier.
 * @param length The length of the random string to generate (default: 64, results in 86 Base64 URL chars).
 *               Spotify requires verifier to be between 43 and 128 characters.
 * @returns A Base64 URL encoded random string.
 */
export function generateCodeVerifier(length: number = 64): string {
  // The initial charset-based approach in the comment was revised to a more standard byte array to Base64 URL encoding.
  // Let's use a more standard approach for raw byte generation and encoding:

  const buffer = new Uint8Array(length); // Length of raw bytes
  window.crypto.getRandomValues(buffer);
  return base64UrlEncode(buffer);
}

/**
 * Hashes a string using SHA-256 and then Base64 URL encodes the hash.
 * @param verifier The string to hash (the PKCE code_verifier).
 * @returns A Promise that resolves to the Base64 URL encoded SHA-256 hash (the code_challenge).
 */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier); // Encode verifier string to Uint8Array
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(hashBuffer));
}

/**
 * Encodes an ArrayBuffer or Uint8Array into a Base64 URL string.
 * @param buffer The buffer to encode.
 * @returns The Base64 URL encoded string.
 */
function base64UrlEncode(buffer: ArrayBuffer | Uint8Array): string {
  // Convert buffer to a string of characters
  const uint8Array = new Uint8Array(buffer);
  let binaryString = '';
  uint8Array.forEach((byte) => {
    binaryString += String.fromCharCode(byte);
  });

  // Use btoa for Base64 encoding
  const base64 = btoa(binaryString);

  // Convert Base64 to Base64 URL:
  // Replace + with -
  // Replace / with _
  // Remove = padding
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Example Usage (for testing, not part of the actual file usually):
// async function testPkce() {
//   const verifier = generateCodeVerifier();
//   console.log("Verifier:", verifier, verifier.length);
//   const challenge = await generateCodeChallenge(verifier);
//   console.log("Challenge:", challenge);
// }
// testPkce();
