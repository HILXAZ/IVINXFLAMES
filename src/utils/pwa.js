// PWA Registration and Service Worker utilities

// Register service worker
export const registerSW = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
          
          // Handle updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available, notify user
                showUpdateAvailable();
              }
            });
          });
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
};

// Show update notification
const showUpdateAvailable = () => {
  if (Notification.permission === 'granted') {
    new Notification('App Update Available', {
      body: 'A new version is available. Refresh to update.',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png'
    });
  }
  
  // Also show in-app notification
  const updateBanner = document.createElement('div');
  updateBanner.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #3b82f6;
      color: white;
      padding: 12px;
      text-align: center;
      z-index: 10000;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    ">
      <span>New version available! </span>
      <button onclick="window.location.reload()" style="
        background: white;
        color: #3b82f6;
        border: none;
        padding: 4px 12px;
        border-radius: 4px;
        margin-left: 8px;
        cursor: pointer;
        font-weight: 500;
      ">Update Now</button>
      <button onclick="this.parentElement.parentElement.remove()" style="
        background: transparent;
        color: white;
        border: 1px solid white;
        padding: 4px 12px;
        border-radius: 4px;
        margin-left: 8px;
        cursor: pointer;
      ">Later</button>
    </div>
  `;
  document.body.appendChild(updateBanner);
};

// Request notification permission
export const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};

// Show notification
export const showNotification = (title, options = {}) => {
  if (Notification.permission === 'granted') {
    return new Notification(title, {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      ...options
    });
  }
};

// Schedule reminder notifications
export const scheduleReminder = (title, body, delay) => {
  setTimeout(() => {
    showNotification(title, { body });
  }, delay);
};

// Check if app is running as PWA
export const isPWA = () => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true;
};

// Install prompt handling
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  // Show install button
  showInstallButton();
});

const showInstallButton = () => {
  const installButton = document.getElementById('install-button');
  if (installButton) {
    installButton.style.display = 'block';
    installButton.addEventListener('click', installApp);
  }
};

export const installApp = async () => {
  if (deferredPrompt) {
    // Show the prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    
    // Clear the deferredPrompt for next time
    deferredPrompt = null;
    
    // Hide the install button
    const installButton = document.getElementById('install-button');
    if (installButton) {
      installButton.style.display = 'none';
    }
  }
};

// Background sync for offline functionality
export const registerBackgroundSync = (tag) => {
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    navigator.serviceWorker.ready.then((registration) => {
      return registration.sync.register(tag);
    }).catch((error) => {
      console.log('Background sync registration failed:', error);
    });
  }
};

// Store data for offline sync
export const storeForSync = (key, data) => {
  try {
    const existingData = JSON.parse(localStorage.getItem(key) || '[]');
    existingData.push({
      ...data,
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString()
    });
    localStorage.setItem(key, JSON.stringify(existingData));
    
    // Register background sync
    registerBackgroundSync('habit-log-sync');
  } catch (error) {
    console.error('Failed to store data for sync:', error);
  }
};

// Check online status
export const isOnline = () => navigator.onLine;

// Listen for online/offline events
export const setupConnectionListener = (onOnline, onOffline) => {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);
  
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
};

// Get network information
export const getNetworkInfo = () => {
  if ('connection' in navigator) {
    const connection = navigator.connection;
    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    };
  }
  return null;
};

// Check if running on mobile device
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Add to home screen prompt
export const addToHomeScreen = () => {
  if (deferredPrompt) {
    installApp();
  } else if (isMobile()) {
    // Show manual instructions for iOS Safari
    const instructions = `
      To install this app on your device:
      1. Tap the share button in your browser
      2. Select "Add to Home Screen"
      3. Tap "Add" to confirm
    `;
    alert(instructions);
  }
};
