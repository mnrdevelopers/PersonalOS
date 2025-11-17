// onesignal-config.js
class OneSignalManager {
    constructor() {
        this.initialized = false;
        this.onesignalAppId = null;
        this.currentUser = null;
        this.serviceWorkerPath = this.getServiceWorkerPath();
    }

    getServiceWorkerPath() {
        // For GitHub Pages, use absolute paths
        if (window.location.hostname.includes('github.io')) {
            return '/expiry-tracker/OneSignalSDKWorker.js';
        }
        // For local development
        return '/OneSignalSDKWorker.js';
    }

    async init() {
        try {
            console.log('Initializing OneSignal...');
            
            // Get OneSignal config from Firebase Remote Config
            await this.fetchOneSignalConfig();
            
            if (!this.onesignalAppId) {
                console.warn('OneSignal App ID not configured in Remote Config');
                return false;
            }

            // Initialize OneSignal SDK
            await this.initializeOneSignalSDK();
            
            this.initialized = true;
            console.log('OneSignal initialized successfully');
            return true;
            
        } catch (error) {
            console.error('OneSignal initialization failed:', error);
            return false;
        }
    }

    async fetchOneSignalConfig() {
        try {
            console.log('Fetching OneSignal configuration from Remote Config...');
            
            // Wait for Remote Config to be initialized
            if (typeof initializeRemoteConfig === 'function') {
                await initializeRemoteConfig();
            }
            
            if (!window.remoteConfig) {
                console.error('Remote Config not available');
                return;
            }

            this.onesignalAppId = remoteConfig.getString('onesignal_app_id');
            
            if (this.onesignalAppId) {
                console.log('OneSignal App ID loaded from Remote Config');
            } else {
                console.warn('No OneSignal App ID found in Remote Config');
            }
            
        } catch (error) {
            console.error('Error fetching OneSignal config from Remote Config:', error);
        }
    }

    initializeOneSignalSDK() {
        return new Promise((resolve, reject) => {
            // Use the proper initialization pattern to avoid "already defined" error
            if (window.OneSignal && typeof window.OneSignal === 'function') {
                console.log('OneSignal already initialized, reusing instance');
                this.setupOneSignal(resolve, reject);
                return;
            }

            // Reset to array format to avoid conflicts
            window.OneSignal = window.OneSignal || [];
            
            const script = document.createElement('script');
            script.src = 'https://cdn.onesignal.com/sdks/OneSignalSDK.js';
            script.async = true;
            
            script.onload = () => {
                console.log('OneSignal SDK loaded successfully');
                this.setupOneSignal(resolve, reject);
            };
            
            script.onerror = (error) => {
                console.error('Failed to load OneSignal SDK:', error);
                reject(error);
            };
            
            document.head.appendChild(script);
        });
    }

    setupOneSignal(resolve, reject) {
        try {
            // Use the array push method for initialization
            window.OneSignal.push(function() {
                OneSignal.init({
                    appId: this.onesignalAppId,
                    safari_web_id: "",
                    allowLocalhostAsSecureOrigin: true,
                    notifyButton: {
                        enable: false,
                    },
                    serviceWorkerParam: { 
                        scope: this.getServiceWorkerScope() 
                    },
                    serviceWorkerPath: this.serviceWorkerPath,
                    promptOptions: {
                        slidedown: {
                            enabled: true,
                            autoPrompt: false,
                            timeDelay: 3,
                            pageViews: 1
                        }
                    }
                });

                // Set up event listeners
                this.setupOneSignalEvents();

                // Get current user ID and save it
                this.getAndSaveOneSignalUserId();

                resolve();
                
            }.bind(this));
            
        } catch (error) {
            console.error('Error setting up OneSignal:', error);
            reject(error);
        }
    }

    getServiceWorkerScope() {
        if (window.location.hostname.includes('github.io')) {
            return '/expiry-tracker/';
        }
        return '/';
    }

    setupOneSignalEvents() {
        window.OneSignal.push(function() {
            // Listen for subscription changes
            OneSignal.on('subscriptionChange', (isSubscribed) => {
                console.log("User subscription changed:", isSubscribed);
                this.handleSubscriptionChange(isSubscribed);
            }.bind(this));

            // Listen for notification permission changes
            OneSignal.on('notificationPermissionChange', (permission) => {
                console.log("Notification permission changed:", permission);
            });

            // Handle service worker registration errors gracefully
            OneSignal.on('notificationPermissionChange', (permission) => {
                if (permission === 'denied') {
                    console.log('User denied notification permissions');
                }
            });
        }.bind(this));
    }

    async handleSubscriptionChange(isSubscribed) {
        console.log('Subscription change detected:', isSubscribed);
        
        if (isSubscribed && this.currentUser) {
            const userId = await this.getOneSignalUserId();
            if (userId) {
                await this.saveOneSignalUserId(userId);
            }
        }
    }

    async getOneSignalUserId() {
        return new Promise((resolve) => {
            window.OneSignal.push(function() {
                OneSignal.getUserId().then((userId) => {
                    resolve(userId);
                }).catch(() => {
                    resolve(null);
                });
            });
        });
    }

    async getAndSaveOneSignalUserId() {
        if (!this.currentUser) return;

        try {
            const oneSignalUserId = await this.getOneSignalUserId();
            if (oneSignalUserId) {
                await this.saveOneSignalUserId(oneSignalUserId);
            }
        } catch (error) {
            console.error('Error getting/saving OneSignal user ID:', error);
        }
    }

    async saveOneSignalUserId(oneSignalUserId) {
        if (!this.currentUser) {
            console.warn('No current user, cannot save OneSignal user ID');
            return;
        }

        try {
            await db.collection('users').doc(this.currentUser.uid).set({
                oneSignalUserId: oneSignalUserId,
                pushEnabled: true,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            
            console.log('OneSignal user ID saved to Firestore');
        } catch (error) {
            console.error('Error saving OneSignal user ID to Firestore:', error);
        }
    }

    // Check if push notifications are enabled
    async isPushEnabled() {
        if (!this.initialized) return false;
        
        return new Promise((resolve) => {
            window.OneSignal.push(function() {
                OneSignal.isPushNotificationsEnabled((isEnabled) => {
                    resolve(isEnabled);
                });
            });
        });
    }

    // Get notification permission status
    async getPermissionState() {
        if (!this.initialized) return 'unknown';
        
        return new Promise((resolve) => {
            window.OneSignal.push(function() {
                OneSignal.getNotificationPermission((permission) => {
                    resolve(permission);
                });
            });
        });
    }

    // Request notification permission
    async requestPermission() {
        if (!this.initialized) {
            console.warn('OneSignal not initialized');
            return false;
        }

        try {
            const result = await new Promise((resolve) => {
                window.OneSignal.push(function() {
                    OneSignal.showSlidedownPrompt().then(resolve).catch(() => resolve(false));
                });
            });
            
            return result;
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return false;
        }
    }

    // Send push notification
    async sendPushNotification(userId, title, message, data = {}) {
        console.log('Sending push notification simulation:', {
            userId: userId,
            title: title,
            message: message,
            data: data
        });

        // In production, this would call your backend API
        return true;
    }
}

// Create global instance
window.oneSignalManager = new OneSignalManager();
