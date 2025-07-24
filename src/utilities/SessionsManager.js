// utils/SessionManager.js - Complete Session Management Service
class SessionManager {
    constructor() {
        this.STORAGE_KEY_PREFIX = 'auth_';
        this.SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
        this.WARNING_TIME = 5 * 60 * 1000; // 5 minutes before expiry
        this.inactivityTimer = null;
        this.warningTimer = null;
        this.onSessionExpired = null;
        this.onSessionWarning = null;
        
        this.initializeSessionTracking();
    }

    // Initialize session tracking and browser close detection
    initializeSessionTracking() {
        // Track browser close
        window.addEventListener('beforeunload', () => {
            this.clearSession();
        });

        window.addEventListener('pagehide', () => {
            this.clearSession();
        });

        // Track user activity
        const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        activityEvents.forEach(event => {
            document.addEventListener(event, () => this.resetInactivityTimer(), true);
        });

        // Check for existing session on page load
        this.validateSession();
    }

    // Set session data with expiration
    setSession(key, value, useSessionStorage = true) {
        const storage = useSessionStorage ? sessionStorage : localStorage;
        const sessionData = {
            value: value,
            timestamp: Date.now(),
            expiresAt: Date.now() + this.SESSION_TIMEOUT
        };

        storage.setItem(this.STORAGE_KEY_PREFIX + key, JSON.stringify(sessionData));
        this.resetInactivityTimer();
        
        console.log(`✅ Session data saved: ${key}`, { expiresAt: new Date(sessionData.expiresAt) });
    }

    // Get session data and check expiration
    getSession(key, useSessionStorage = true) {
        const storage = useSessionStorage ? sessionStorage : localStorage;
        const storedData = storage.getItem(this.STORAGE_KEY_PREFIX + key);
        
        if (!storedData) {
            return null;
        }

        try {
            const sessionData = JSON.parse(storedData);
            
            // Check if session has expired
            if (Date.now() > sessionData.expiresAt) {
                console.log(`⚠️ Session expired for key: ${key}`);
                this.removeSession(key, useSessionStorage);
                return null;
            }

            return sessionData.value;
        } catch (error) {
            console.error('Error parsing session data:', error);
            this.removeSession(key, useSessionStorage);
            return null;
        }
    }

    // Remove specific session data
    removeSession(key, useSessionStorage = true) {
        const storage = useSessionStorage ? sessionStorage : localStorage;
        storage.removeItem(this.STORAGE_KEY_PREFIX + key);
    }

    // Clear all session data
    clearSession() {
        console.log('🧹 Clearing all session data');
        
        // Clear sessionStorage
        Object.keys(sessionStorage).forEach(key => {
            if (key.startsWith(this.STORAGE_KEY_PREFIX)) {
                sessionStorage.removeItem(key);
            }
        });

        // Clear localStorage auth data
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(this.STORAGE_KEY_PREFIX) || 
                ['employeeId', 'employeeData', 'userData', 'roleData', 'roleId'].includes(key)) {
                localStorage.removeItem(key);
            }
        });

        this.clearInactivityTimer();
    }

    // Validate current session
    validateSession() {
        const employeeId = this.getSession('employeeId');
        const userData = this.getSession('userData');
        
        if (!employeeId && !userData) {
            console.log('❌ No valid session found');
            return false;
        }

        // Check if any session data has expired
        const sessionKeys = ['employeeId', 'userData', 'roleData', 'roleId', 'employeeData'];
        let hasValidSession = false;

        sessionKeys.forEach(key => {
            const data = this.getSession(key);
            if (data) {
                hasValidSession = true;
            }
        });

        if (hasValidSession) {
            console.log('✅ Valid session found');
            this.resetInactivityTimer();
            return true;
        } else {
            console.log('❌ Session validation failed');
            this.clearSession();
            return false;
        }
    }

    // Reset inactivity timer
    resetInactivityTimer() {
        this.clearInactivityTimer();
        
        // Set warning timer (5 minutes before expiry)
        this.warningTimer = setTimeout(() => {
            console.log('⚠️ Session warning - 5 minutes remaining');
            if (this.onSessionWarning) {
                this.onSessionWarning();
            }
        }, this.SESSION_TIMEOUT - this.WARNING_TIME);

        // Set expiry timer
        this.inactivityTimer = setTimeout(() => {
            console.log('⏰ Session expired due to inactivity');
            this.handleSessionExpiry();
        }, this.SESSION_TIMEOUT);
    }

    // Clear inactivity timers
    clearInactivityTimer() {
        if (this.inactivityTimer) {
            clearTimeout(this.inactivityTimer);
            this.inactivityTimer = null;
        }
        if (this.warningTimer) {
            clearTimeout(this.warningTimer);
            this.warningTimer = null;
        }
    }

    // Handle session expiry
    handleSessionExpiry() {
        console.log('🚨 Handling session expiry');
        this.clearSession();
        
        if (this.onSessionExpired) {
            this.onSessionExpired();
        } else {
            // Default behavior - redirect to login
            window.location.href = '/login';
        }
    }

    // Set callback for session expiry
    onExpired(callback) {
        this.onSessionExpired = callback;
    }

    // Set callback for session warning
    onWarning(callback) {
        this.onSessionWarning = callback;
    }

    // Extend session (refresh expiry time)
    extendSession() {
        const sessionKeys = ['employeeId', 'userData', 'roleData', 'roleId', 'employeeData'];
        
        sessionKeys.forEach(key => {
            const data = this.getSession(key);
            if (data) {
                this.setSession(key, data);
            }
        });
        
        console.log('🔄 Session extended');
    }

    // Get session status
    getSessionStatus() {
        const employeeId = this.getSession('employeeId');
        const userData = this.getSession('userData');
        
        if (!employeeId && !userData) {
            return {
                isValid: false,
                remainingTime: 0,
                message: 'No active session'
            };
        }

        // Calculate remaining time based on the latest session data
        const sessionData = sessionStorage.getItem(this.STORAGE_KEY_PREFIX + 'employeeId') || 
                           sessionStorage.getItem(this.STORAGE_KEY_PREFIX + 'userData');
        
        if (sessionData) {
            try {
                const parsed = JSON.parse(sessionData);
                const remainingTime = parsed.expiresAt - Date.now();
                
                return {
                    isValid: remainingTime > 0,
                    remainingTime: Math.max(0, remainingTime),
                    message: remainingTime > 0 ? 'Session active' : 'Session expired'
                };
            } catch (error) {
                return {
                    isValid: false,
                    remainingTime: 0,
                    message: 'Invalid session data'
                };
            }
        }

        return {
            isValid: false,
            remainingTime: 0,
            message: 'No session data found'
        };
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.validateSession();
    }

    // Login method - save authentication data
    login(authData) {
        console.log('🔐 Logging in user with session management');
        
        if (authData.employeeId) {
            this.setSession('employeeId', authData.employeeId);
        }
        
        if (authData.userData) {
            this.setSession('userData', authData.userData);
        }
        
        if (authData.roleData) {
            this.setSession('roleData', authData.roleData);
        }
        
        if (authData.roleId) {
            this.setSession('roleId', authData.roleId);
        }
        
        if (authData.employeeData) {
            this.setSession('employeeData', authData.employeeData);
        }

        this.resetInactivityTimer();
    }

    // Logout method
    logout() {
        console.log('🚪 Logging out user');
        this.clearSession();
    }
}

// Create singleton instance
const sessionManager = new SessionManager();

export default sessionManager;