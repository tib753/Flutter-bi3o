(function () {
  const sdkSources = {
    firebaseApp: 'https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js',
    firebaseMessaging: 'https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js',
    appleSignin: 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js',
    facebook: 'https://connect.facebook.net/en_US/sdk.js',
    facebookAppId: '380903914182154',
    facebookVersion: 'v15.0',
    googleMaps: 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBe6uNrQf38NT6AjdSLq23YxFOPM5OnpMs&libraries=places&loading=async',
    googleGsi: 'https://accounts.google.com/gsi/client'
  };

  const cachedPromises = new Map();

  function injectScript(key, src, { async = true, defer = false, attrs = {} } = {}) {
    if (cachedPromises.has(key)) {
      return cachedPromises.get(key);
    }

    const promise = new Promise((resolve, reject) => {
      let script = document.querySelector(`script[data-sdk="${key}"]`);

      if (script && script.dataset.loaded === 'true') {
        resolve(script);
        return;
      }

      if (!script) {
        script = document.createElement('script');
        script.dataset.sdk = key;
        script.async = async;
        script.defer = defer;
        Object.entries(attrs).forEach(([attrKey, attrValue]) => {
          if (attrValue !== undefined && attrValue !== null) {
            script.setAttribute(attrKey, attrValue);
          }
        });
        script.src = src;
      }

      script.addEventListener('load', () => {
        script.dataset.loaded = 'true';
        resolve(script);
      }, { once: true });

      script.addEventListener('error', (error) => {
        reject(error);
      }, { once: true });

      if (!script.parentNode) {
        document.head.appendChild(script);
      }
    });

    cachedPromises.set(key, promise);
    return promise;
  }

  function loadFirebaseMessaging() {
    return injectScript('firebase-app', sdkSources.firebaseApp)
      .then(() => injectScript('firebase-messaging', sdkSources.firebaseMessaging));
  }

  function loadAppleSignin() {
    return injectScript('apple-signin', sdkSources.appleSignin);
  }

  function loadFacebookSdk() {
    window.fbAsyncInit = window.fbAsyncInit || function () {
      if (window.FB && !window.FB.__bi3oInitialized) {
        window.FB.init({
          appId: sdkSources.facebookAppId,
          cookie: true,
          xfbml: true,
          version: sdkSources.facebookVersion
        });
        window.FB.__bi3oInitialized = true;
      }
    };

    return injectScript('facebook-sdk', sdkSources.facebook, {
      attrs: { crossorigin: 'anonymous' }
    });
  }

  function loadGoogleMaps(extraParams) {
    const query = extraParams ? `&${extraParams.replace(/^\?/, '')}` : '';
    return injectScript('google-maps', `${sdkSources.googleMaps}${query}`);
  }

  function loadGoogleSignIn() {
    return injectScript('google-gsi', sdkSources.googleGsi);
  }

  function setupLazyTrigger(loader, events = ['pointerdown', 'keydown', 'touchstart']) {
    const handler = () => {
      events.forEach((eventName) => {
        window.removeEventListener(eventName, handler, true);
      });
      loader();
    };

    events.forEach((eventName) => {
      window.addEventListener(eventName, handler, { once: true, passive: true, capture: true });
    });
  }

  const api = {
    loadFirebaseMessaging,
    loadAppleSignin,
    loadFacebookSdk,
    loadGoogleMaps,
    loadGoogleSignIn,
    scheduleFirebaseAfterInteraction() {
      setupLazyTrigger(() => {
        loadFirebaseMessaging().catch((error) => console.warn('Firebase SDK failed to load', error));
      });
    }
  };
  setupLazyTrigger(() => {
    loadGoogleMaps().catch((error) => console.warn('Google Maps SDK failed to load', error));
  });

  window.LazySdkLoader = api;

  window.addEventListener('bi3o:require-firebase', () => loadFirebaseMessaging());
  window.addEventListener('bi3o:require-facebook', () => loadFacebookSdk());
  window.addEventListener('bi3o:require-apple', () => loadAppleSignin());
  window.addEventListener('bi3o:require-maps', (event) => {
    loadGoogleMaps(event?.detail?.query).catch((error) => console.warn('Maps SDK failed to load', error));
  });
  window.addEventListener('bi3o:require-google-signin', () => {
    loadGoogleSignIn().catch((error) => console.warn('Google Sign-In SDK failed to load', error));
  });

  api.scheduleFirebaseAfterInteraction();
})();
