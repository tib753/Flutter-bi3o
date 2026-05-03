// Firebase messaging is temporarily disabled on the web build to
// avoid loading Firebase SDKs before the user interacts with the UI.
// Flutter still looks for this file when registering the service worker,
// so we keep a no-op handler instead of deleting it.

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});