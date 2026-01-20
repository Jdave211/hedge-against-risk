function guessProdApiUrl(): string | null {
  // If someone forgets to set VITE_API_URL in prod, never call localhost.
  if (typeof window === 'undefined') return null;

  const host = window.location.hostname;
  if (host === 'probable.live' || host === 'www.probable.live') {
    // Default to the current Heroku backend if env is missing.
    return 'https://probable-app-778917fd9925.herokuapp.com';
  }

  return null;
}

const envApiUrl = (import.meta.env.VITE_API_URL as string | undefined) || undefined;

export const API_URL =
  envApiUrl ||
  guessProdApiUrl() ||
  (import.meta.env.DEV ? 'http://127.0.0.1:8000' : window.location.origin);


