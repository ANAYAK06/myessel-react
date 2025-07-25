// utilities/SessionManager.js - OPTIMIZED VERSION - Reduced console noise and improved performance
class SessionManager {
    constructor() {
        this.STORAGE_KEY_PREFIX = 'auth_';
        this.SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
        this.WARNING_TIME = 5 * 60 * 1000; // 5 minutes before expiry
        this.inactivityTimer = null;
        this.warningTimer = null;
        this.onSessionExpired = null;
        this.onSessionWarning = null;

        // ADDED: Caching to reduce frequent validation calls
        this.lastValidationTime = 0;
        this.lastValidationResult = false;
        this.validationCacheTimeout = 5000; // Cache validation result for 5 seconds

        // ADDED: Flag to track if we're in a context where session validation is expected
        this.expectSession = false;

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

        // REMOVED: Check for existing session on page load - this was causing early validation
        // this.validateSession();
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

        // IMPROVED: Only log in development or when explicitly needed
        if (process.env.NODE_ENV === 'development') {
            console.log(`✅ Session data saved: ${key}`, { expiresAt: new Date(sessionData.expiresAt) });
        }

        // ADDED: Clear validation cache when new session is set
        this.lastValidationTime = 0;
        this.expectSession = true;
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
                // IMPROVED: Only log expiration if we expected a session
                if (this.expectSession) {
                    console.log(`⚠️ Session expired for key: ${key}`);
                }
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
        // IMPROVED: Only log when there's actually something to clear
        const hasSessionData = this.hasAnySessionData();
        
        if (hasSessionData) {
            console.log('🧹 Clearing all session data');
        }

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
        
        // ADDED: Reset validation cache and expectation
        this.lastValidationTime = 0;
        this.lastValidationResult = false;
        this.expectSession = false;
    }

    // ADDED: Helper method to check if any session data exists
    hasAnySessionData() {
        // Quick check for any session-related data
        const hasSessionStorage = Object.keys(sessionStorage).some(key => 
            key.startsWith(this.STORAGE_KEY_PREFIX)
        );
        
        const hasLocalStorage = Object.keys(localStorage).some(key => 
            key.startsWith(this.STORAGE_KEY_PREFIX) || 
            ['employeeId', 'employeeData', 'userData', 'roleData', 'roleId'].includes(key)
        );

        return hasSessionStorage || hasLocalStorage;
    }

    // IMPROVED: Validate current session with caching
    validateSession() {
        // ADDED: Use cached result if recent validation was done
        const now = Date.now();
        if (now - this.lastValidationTime < this.validationCacheTimeout) {
            return this.lastValidationResult;
        }

        const employeeId = this.getSession('employeeId');
        const userData = this.getSession('userData');

        if (!employeeId && !userData) {
            // IMPROVED: Only log if we expected a session to exist
            if (this.expectSession) {
                console.log('ℹ️ No valid session found');
            }
            this.lastValidationResult = false;
            this.lastValidationTime = now;
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
            // IMPROVED: Only log significant validations
            if (!this.lastValidationResult || this.expectSession) {
                console.log('✅ Valid session found');
            }
            this.resetInactivityTimer();
            this.lastValidationResult = true;
            this.expectSession = true;
        } else {
            // IMPROVED: Only log if we expected a session
            if (this.expectSession) {
                console.log('❌ Session validation failed');
            }
            this.clearSession();
            this.lastValidationResult = false;
        }

        this.lastValidationTime = now;
        return this.lastValidationResult;
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
        
        // ADDED: Clear validation cache after extension
        this.lastValidationTime = 0;
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

    // IMPROVED: Check if user is authenticated with better performance
    isAuthenticated() {
        try {
            // IMPROVED: Quick check first - if no basic session data, return false quietly
            const hasAnySession = localStorage.getItem('employeeId') ||
                sessionStorage.getItem('auth_employeeId') ||
                sessionStorage.getItem('auth_userData');

            if (!hasAnySession) {
                return false; // Don't log - this is normal for login pages
            }

            // ADDED: Use cached validation if available and recent, or if forced valid after login
            const now = Date.now();
            if ((now - this.lastValidationTime < this.validationCacheTimeout) || this.lastValidationResult === true) {
                return this.lastValidationResult;
            }

            // Only do full validation if we have session data
            this.expectSession = true;
            return this.validateSession();
        } catch (error) {
            // IMPROVED: Only log actual errors, not normal cases
            console.error('Authentication check error:', error);
            return false;
        }
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
        
        // IMPROVED: Force immediate validation update after login
        this.expectSession = true;
        this.lastValidationTime = 0;
        this.lastValidationResult = true; // Force immediate valid state
        
        console.log('✅ Session login completed and validation updated');
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