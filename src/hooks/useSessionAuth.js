// hooks/useSessionAuth.js - FIXED VERSION - Optimized session validation
import { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout, resetAuth } from '../slices/auth/authSlice';
import sessionManager from '../utilities/SessionManager';

export const useSessionAuth = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const auth = useSelector((state) => state.auth);
    
    const [sessionStatus, setSessionStatus] = useState({
        isValid: false,
        remainingTime: 0,
        showWarning: false
    });

    // ADDED: Refs to prevent unnecessary calls and track initialization
    const isInitialized = useRef(false);
    const lastAuthState = useRef(null);
    const sessionCallbacksSet = useRef(false);

    // Define routes where session management should be passive/disabled
    const PASSIVE_ROUTES = ['/', '/login-options'];
    const isPassiveRoute = PASSIVE_ROUTES.includes(location.pathname);

    // IMPROVED: Memoized session validation to prevent excessive calls
    const validateSession = useCallback(() => {
        if (isPassiveRoute) {
            return false;
        }

        try {
            return sessionManager.isAuthenticated();
        } catch (error) {
            console.error('Session validation error:', error);
            return false;
        }
    }, [isPassiveRoute]);

    // IMPROVED: Setup session callbacks only once
    useEffect(() => {
        if (isPassiveRoute || sessionCallbacksSet.current) {
            return;
        }

        console.log('🔧 Setting up session callbacks...');
        sessionCallbacksSet.current = true;
        
        // Set up session expiry callback
        sessionManager.onExpired(() => {
            console.log('🚨 Session expired - logging out and redirecting to login');
            dispatch(logout());
            navigate('/', { replace: true });
        });

        // Set up session warning callback
        sessionManager.onWarning(() => {
            console.log('⚠️ Session warning - showing notification');
            setSessionStatus(prev => ({ ...prev, showWarning: true }));
        });

        return () => {
            sessionCallbacksSet.current = false;
        };
    }, [isPassiveRoute, dispatch, navigate]);

    // IMPROVED: Handle initial authentication state and changes more efficiently
    useEffect(() => {
        if (isPassiveRoute) {
            console.log(`🔄 On passive route (${location.pathname}) - minimal session management`);
            return;
        }

        // Check if auth state actually changed to prevent unnecessary processing
        const currentAuthState = `${auth.isAuthenticated}-${auth.loginType}-${auth.employeeId}`;
        if (lastAuthState.current === currentAuthState && isInitialized.current) {
            return; // No change in auth state, skip processing
        }

        lastAuthState.current = currentAuthState;
        
        console.log('🔍 Auth state changed - validating session:', { 
            isAuthenticated: auth.isAuthenticated,
            loginType: auth.loginType,
            currentRoute: location.pathname,
            isInitialized: isInitialized.current
        });
        
        // Validate current session only if we have auth data
        if (auth.isAuthenticated && auth.employeeId) {
            const isValid = validateSession();
            
            // If session is invalid but Redux thinks user is authenticated, reset auth
            if (!isValid) {
                console.log('❌ Session invalid but Redux thinks authenticated - resetting auth');
                dispatch(resetAuth());
                navigate('/', { replace: true });
                return;
            }

            console.log('✅ Session validation passed');
        }

        isInitialized.current = true;
    }, [
        auth.isAuthenticated, 
        auth.loginType, 
        auth.employeeId, 
        location.pathname, 
        isPassiveRoute, 
        dispatch, 
        navigate, 
        validateSession
    ]);

    // IMPROVED: Sync Redux auth state with session manager (only when needed)
    useEffect(() => {
        if (isPassiveRoute || !auth.isAuthenticated || !auth.loginType) {
            return;
        }

        // Only sync if session manager doesn't already have this data
        const currentSessionValid = sessionManager.isAuthenticated();
        if (currentSessionValid) {
            console.log('🔄 Session already valid - skipping sync');
            return;
        }

        console.log('🔄 Syncing auth state with session manager');
        
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

        // ADDED: Small delay to ensure Redux state is fully updated
        setTimeout(() => {
            sessionManager.login(authData);
            
            setSessionStatus({
                isValid: true,
                remainingTime: 30 * 60 * 1000, // 30 minutes
                showWarning: false
            });

            console.log('✅ Session sync completed');
        }, 50);

    }, [auth.isAuthenticated, auth.loginType, auth.employeeData, auth.roleData, auth.roleId, auth.userData, isPassiveRoute]);

    // IMPROVED: Optimized periodic session status check (less frequent, smarter)
    useEffect(() => {
        if (isPassiveRoute || !auth.isAuthenticated) {
            return;
        }

        // CHANGED: Check every 2 minutes instead of 1 minute to reduce noise
        const statusInterval = setInterval(() => {
            const status = sessionManager.getSessionStatus();
            
            setSessionStatus(prev => ({
                ...prev,
                isValid: status.isValid,
                remainingTime: status.remainingTime
            }));

            // Auto-logout if session becomes invalid
            if (!status.isValid && auth.isAuthenticated) {
                console.log('⏰ Session became invalid during periodic check - auto logout');
                dispatch(logout());
                navigate('/', { replace: true });
            }
        }, 120000); // CHANGED: Check every 2 minutes instead of 1

        return () => {
            clearInterval(statusInterval);
        };
    }, [auth.isAuthenticated, dispatch, navigate, isPassiveRoute]);

    const extendSession = useCallback(() => {
        console.log('🔄 Extending session by user request...');
        sessionManager.extendSession();
        setSessionStatus(prev => ({ ...prev, showWarning: false }));
        console.log('✅ Session extended successfully');
    }, []);

    const handleLogout = useCallback(() => {
        console.log('🚪 Handling logout from session manager...');
        sessionManager.logout();
        dispatch(logout());
        navigate('/', { replace: true });
    }, [dispatch, navigate]);

    const dismissWarning = useCallback(() => {
        console.log('🔕 Dismissing session warning');
        setSessionStatus(prev => ({ ...prev, showWarning: false }));
    }, []);

    const formatRemainingTime = useCallback((milliseconds) => {
        const minutes = Math.floor(milliseconds / (1000 * 60));
        const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, []);

    // IMPROVED: Only check authentication for non-passive routes, with caching
    const isAuthenticated = isPassiveRoute ? false : (auth.isAuthenticated && validateSession());

    // REMOVED: Excessive debug logging that was causing console noise
    // Only log significant state changes
    useEffect(() => {
        if (!isPassiveRoute && isInitialized.current) {
            const significantChange = 
                sessionStatus.isValid !== (auth.isAuthenticated && isAuthenticated) ||
                location.pathname !== lastAuthState.current;

            if (significantChange) {
                console.log('🔍 Significant session state change:', {
                    route: location.pathname,
                    sessionManagerAuth: isAuthenticated,
                    reduxAuth: auth.isAuthenticated,
                    loginType: auth.loginType,
                    sessionValid: sessionStatus.isValid
                });
            }
        }
    }, [isAuthenticated, auth.isAuthenticated, auth.loginType, sessionStatus.isValid, location.pathname, isPassiveRoute]);

    return {
        sessionStatus: {
            ...sessionStatus,
            formattedTime: formatRemainingTime(sessionStatus.remainingTime)
        },
        extendSession,
        handleLogout,
        dismissWarning,
        isAuthenticated: isPassiveRoute ? auth.isAuthenticated : isAuthenticated,
        isPassiveRoute,
        currentRoute: location.pathname
    };
};