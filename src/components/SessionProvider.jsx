// components/SessionProvider.js - OPTIMIZED VERSION - Fixed dependencies and improved performance
import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../slices/auth/authSlice';
import sessionManager from '../utilities/SessionManager';
import SessionWarningModal from './SessionWarningModal';

const SessionContext = createContext(null);

export const useSession = () => {
    const context = useContext(SessionContext);
    if (!context) {
        return {
            sessionStatus: { isValid: false, remainingTime: 0, showWarning: false, formattedTime: '0:00' },
            extendSession: () => {},
            handleLogout: () => {},
            dismissWarning: () => {},
            isAuthenticated: false,
            isPassiveRoute: true,
            currentRoute: '/'
        };
    }
    return context;
};

const SessionProvider = ({ children }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const auth = useSelector((state) => state.auth);
    
    // IMPROVED: Better state management and refs to prevent dependency cycles
    const [sessionStatus, setSessionStatus] = useState({
        isValid: false,
        remainingTime: 0,
        showWarning: false
    });

    // IMPROVED: Use refs to prevent stale closures and dependency issues
    const authRef = useRef(auth);
    const locationRef = useRef(location);
    const sessionCallbacksSet = useRef(false);
    const statusIntervalRef = useRef(null);
    const lastSyncedAuth = useRef(null);

    // Keep refs updated
    useEffect(() => {
        authRef.current = auth;
    }, [auth]);

    useEffect(() => {
        locationRef.current = location;
    }, [location]);

    // Define routes where session management should be minimal
    const PASSIVE_ROUTES = ['/', '/login-options'];
    const isPassiveRoute = PASSIVE_ROUTES.includes(location.pathname);

    // IMPROVED: Memoized callback functions to prevent recreations
    const handleSessionExpiry = useCallback(() => {
        console.log('🚨 Session expired - auto logout');
        setSessionStatus({ isValid: false, remainingTime: 0, showWarning: false });
        dispatch(logout());
        navigate('/', { replace: true });
    }, [dispatch, navigate]);

    const handleSessionWarning = useCallback(() => {
        console.log('⚠️ Session warning - 5 minutes remaining');
        setSessionStatus(prev => ({ ...prev, showWarning: true }));
    }, []);

    // IMPROVED: Session management setup with better dependency management
    useEffect(() => {
        if (isPassiveRoute || !auth.isAuthenticated || !auth.loginType) {
            // Clear any existing session management for passive routes
            if (sessionCallbacksSet.current) {
                console.log('🔄 Clearing session management for passive route');
                if (statusIntervalRef.current) {
                    clearInterval(statusIntervalRef.current);
                    statusIntervalRef.current = null;
                }
                sessionCallbacksSet.current = false;
            }
            return;
        }

        // Only set up session management once per authenticated session
        if (sessionCallbacksSet.current) {
            return;
        }

        console.log('🔧 Setting up session management for:', location.pathname);
        sessionCallbacksSet.current = true;
        
        // Set up session callbacks using stable references
        sessionManager.onExpired(handleSessionExpiry);
        sessionManager.onWarning(handleSessionWarning);

        // Set initial session status
        setSessionStatus({
            isValid: true,
            remainingTime: 30 * 60 * 1000, // 30 minutes
            showWarning: false
        });

        // IMPROVED: Set up session status monitoring with better performance
        statusIntervalRef.current = setInterval(() => {
            const status = sessionManager.getSessionStatus();
            
            setSessionStatus(prev => ({
                ...prev,
                isValid: status.isValid,
                remainingTime: status.remainingTime
            }));

            // Auto-logout if session becomes invalid - use current ref values
            if (!status.isValid && authRef.current.isAuthenticated) {
                console.log('⏰ Session became invalid during monitoring - auto logout');
                handleSessionExpiry();
            }
        }, 120000); // IMPROVED: Check every 2 minutes instead of 1 to reduce overhead

        // Cleanup function
        return () => {
            if (statusIntervalRef.current) {
                clearInterval(statusIntervalRef.current);
                statusIntervalRef.current = null;
            }
            sessionCallbacksSet.current = false;
        };
    }, [location.pathname, isPassiveRoute, auth.isAuthenticated, auth.loginType, handleSessionExpiry, handleSessionWarning]);

    // IMPROVED: Optimized auth data sync with session manager
    useEffect(() => {
        if (isPassiveRoute || !auth.isAuthenticated || !auth.loginType) {
            return;
        }

        // ADDED: Only sync if auth data actually changed
        const currentAuthData = JSON.stringify({
            employeeId: auth.employeeId,
            loginType: auth.loginType,
            employeeData: auth.employeeData ? 'present' : null,
            roleData: auth.roleData ? 'present' : null,
            roleId: auth.roleId,
            userData: auth.userData ? 'present' : null
        });

        if (lastSyncedAuth.current === currentAuthData) {
            return; // No change in auth data, skip sync
        }

        lastSyncedAuth.current = currentAuthData;

        console.log('🔄 Auth data changed - syncing with session manager');

        const authData = {
            employeeId: auth.employeeId,
            loginType: auth.loginType
        };

        if (auth.loginType === 'employee' && auth.employeeData) {
            authData.employeeData = auth.employeeData;
        }

        if (auth.loginType === 'role' && auth.roleData) {
            authData.roleData = auth.roleData;
            authData.roleId = auth.roleId;
            authData.userData = auth.userData;
        }

        // IMPROVED: Use setTimeout to ensure sync happens after Redux state is stable
        const syncTimeout = setTimeout(() => {
            sessionManager.login(authData);
            console.log('✅ Auth data synced with session manager');
        }, 100);

        return () => {
            clearTimeout(syncTimeout);
        };
    }, [
        isPassiveRoute,
        auth.isAuthenticated,
        auth.loginType,
        auth.employeeId,
        auth.employeeData,
        auth.roleData,
        auth.roleId,
        auth.userData
    ]);

    // IMPROVED: Memoized session management functions
    const extendSession = useCallback(() => {
        console.log('🔄 Extending session by user request');
        sessionManager.extendSession();
        setSessionStatus(prev => ({ ...prev, showWarning: false }));
        console.log('✅ Session extended successfully');
    }, []);

    const handleLogout = useCallback(() => {
        console.log('🚪 Manual logout from session manager');
        sessionManager.logout();
        setSessionStatus({ isValid: false, remainingTime: 0, showWarning: false });
        
        // Clear intervals and reset flags
        if (statusIntervalRef.current) {
            clearInterval(statusIntervalRef.current);
            statusIntervalRef.current = null;
        }
        sessionCallbacksSet.current = false;
        lastSyncedAuth.current = null;
        
        dispatch(logout());
        navigate('/', { replace: true });
    }, [dispatch, navigate]);

    const dismissWarning = useCallback(() => {
        console.log('🔕 Dismissing session warning');
        setSessionStatus(prev => ({ ...prev, showWarning: false }));
    }, []);

    // IMPROVED: Memoized time formatter
    const formatRemainingTime = useCallback((milliseconds) => {
        const minutes = Math.floor(milliseconds / (1000 * 60));
        const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, []);

    // IMPROVED: Memoized context value to prevent unnecessary re-renders
    const contextValue = React.useMemo(() => ({
        sessionStatus: {
            ...sessionStatus,
            formattedTime: formatRemainingTime(sessionStatus.remainingTime)
        },
        extendSession,
        handleLogout,
        dismissWarning,
        isAuthenticated: isPassiveRoute ? false : sessionManager.isAuthenticated(),
        isPassiveRoute,
        currentRoute: location.pathname
    }), [
        sessionStatus,
        formatRemainingTime,
        extendSession,
        handleLogout,
        dismissWarning,
        isPassiveRoute,
        location.pathname
    ]);

    return (
        <SessionContext.Provider value={contextValue}>
            {children}
            
            {/* Session Warning Modal - Only show on dashboard routes */}
            {!isPassiveRoute && (
                <SessionWarningModal
                    show={sessionStatus.showWarning}
                    onExtend={extendSession}
                    onLogout={handleLogout}
                    onDismiss={dismissWarning}
                    remainingTime={contextValue.sessionStatus.formattedTime}
                />
            )}
        </SessionContext.Provider>
    );
};

export default SessionProvider;