import { awsConfig } from './aws-config.js?v=20260816';

const TOKEN_KEY = 'millbrae-listing-session';
let googleLibraryPromise = null;

function decodeJwt(token) {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

function loadGoogleLibrary() {
  if (window.google?.accounts?.id) return Promise.resolve(window.google);
  if (googleLibraryPromise) return googleLibraryPromise;
  googleLibraryPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => resolve(window.google);
    script.onerror = () => reject(new Error('Google sign-in could not be loaded.'));
    document.head.append(script);
  });
  return googleLibraryPromise;
}

export function getSession() {
  try {
    const session = JSON.parse(sessionStorage.getItem(TOKEN_KEY));
    const claims = decodeJwt(session?.idToken || '');
    if (!claims?.exp || claims.exp * 1000 <= Date.now()) {
      sessionStorage.removeItem(TOKEN_KEY);
      return null;
    }
    return { ...session, claims, provider: 'Google' };
  } catch {
    return null;
  }
}

export async function renderGoogleSignIn(container, onSignIn) {
  if (!awsConfig.enabled || !awsConfig.googleClientId) throw new Error('Self-service setup is not connected yet.');
  const google = await loadGoogleLibrary();
  google.accounts.id.initialize({
    client_id: awsConfig.googleClientId,
    callback: ({ credential }) => {
      if (!credential) return;
      sessionStorage.setItem(TOKEN_KEY, JSON.stringify({ idToken: credential }));
      onSignIn(getSession());
    },
    auto_select: false,
    cancel_on_tap_outside: true
  });
  google.accounts.id.renderButton(container, {
    type: 'standard',
    theme: 'outline',
    size: 'large',
    shape: 'rectangular',
    text: 'continue_with',
    width: 320
  });
}

export function signOut() {
  sessionStorage.removeItem(TOKEN_KEY);
  window.google?.accounts?.id?.disableAutoSelect();
}

export async function apiRequest(path, options = {}) {
  if (!awsConfig.enabled) throw new Error('Self-service setup is not connected yet.');
  const session = getSession();
  const headers = { accept: 'application/json', ...(options.headers || {}) };
  if (options.body) headers['content-type'] = 'application/json';
  if (session?.idToken) headers.authorization = `Bearer ${session.idToken}`;
  const response = await fetch(new URL(path, awsConfig.apiBaseUrl), { ...options, headers });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || 'The request could not be completed.');
  return body;
}
