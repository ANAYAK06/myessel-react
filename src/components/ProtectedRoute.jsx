// components/ProtectedRoute.js - OPTIMIZED VERSION - Reduced redundant validation
import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { loadUserFromStorage, logout } from '../slices/auth/authSlice';
import { Loader2 } from 'lucide-react';
import sessionManager from '../utilities/SessionManager';

const ProtectedRoute = ({ children, requiredLoginType = null }) => {
    const dispatch = useDispatch();
    const location = useLocation();
    
    // Get all auth state at once
    const { 
        isAuthenticated, 
        loginType, 
        loading, 
        employeeValidated, 
        employeeId,
        roleData,
        roleId,
        employeeData
    } = useSelector((state) => state.auth);

    // ADDED: Refs to prevent excessive validation calls
    const lastValidationRoute = useRef(null);
    const lastAuthState = useRef(null);

    // Define routes where session management should be minimal
    const PASSIVE_ROUTES = ['/', '/login-options'];
    const isPassiveRoute = PASSIVE_ROUTES.includes(location.pathname);

    // IMPROVED: Only check stored auth data if not already authenticated
    useEffect(() => {
        if (!isAuthenticated && !loading.loadFromStorage) {
            console.log('🔍 Loading user from storage on route:', location.pathname);
            dispatch(loadUserFromStorage());
        }
    }, [dispatch, isAuthenticated, loading.loadFromStorage, location.pathname]);

    // IMPROVED: More efficient session validation with caching
    useEffect(() => {
        // Skip validation for passive routes or during loading
        if (isPassiveRoute || loading.loadFromStorage || !isAuthenticated || !loginType) {
            return;
        }

        // ADDED: Only validate if route or auth state actually changed
        const currentAuthState = `${isAuthenticated}-${loginType}-${employeeId}`;
        const currentRoute = location.pathname;
        
        if (lastValidationRoute.current === currentRoute && lastAuthState.current === currentAuthState) {
            return; // No change, skip validation
        }

        lastValidationRoute.current = currentRoute;
        lastAuthState.current = currentAuthState;

        console.log('🔍 Validating session for route change:', { 
            route: currentRoute,
            loginType,
            isAuthenticated
        });
        
        // Double-check session validity for authenticated users
        const isSessionValid = sessionManager.isAuthenticated();
        
        if (!isSessionValid) {
            console.log('❌ Session invalid but Redux thinks authenticated - clearing auth');
            dispatch(logout());
        } else {
            console.log('✅ Session validation passed for:', currentRoute);
        }
    }, [isAuthenticated, loginType, employeeId, location.pathname, isPassiveRoute, loading.loadFromStorage, dispatch]);

    // Show loading while checking authentication
    if (loading.loadFromStorage) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600 dark:text-indigo-400" />
                    <p className="text-gray-600 dark:text-gray-300">Verifying access...</p>
                </div>
            </div>
        );
    }

    // IMPROVED: Special handling for login-options route with better logging
    if (location.pathname === '/login-options') {
        // Allow access if employee is validated (first step complete)
        if (employeeValidated && employeeId && isAuthenticated) {
            // IMPROVED: Only log once per session to reduce noise
            if (lastValidationRoute.current !== '/login-options') {
                console.log('✅ Access granted to login-options - employee validated');
            }
            return children;
        }
        
        // Redirect to login if not validated
        console.log('❌ Access denied to login-options - redirecting to login');
        return <Navigate to="/" replace />;
    }

    // IMPROVED: Simplified authentication check for dashboard routes
    if (!isAuthenticated) {
        console.log('❌ Access denied - not authenticated, redirecting to login');
        return <Navigate to="/" replace />;
    }

    // IMPROVED: Session validation for non-passive routes
    if (!isPassiveRoute) {
        const sessionValid = sessionManager.isAuthenticated();
        if (!sessionValid) {
            console.log('❌ Session validation failed - redirecting to login');
            return <Navigate to="/" replace />;
        }
    }

    // IMPROVED: Streamlined login type validation
    if (requiredLoginType && loginType !== requiredLoginType) {
        console.log('❌ Access denied - wrong login type:', {
            required: requiredLoginType,
            current: loginType
        });
        
        // Redirect based on current login type
        if (loginType === 'employee') {
            return <Navigate to="/employee-dashboard" replace />;
        } else if (loginType === 'role') {
            return <Navigate to="/role-dashboard" replace />;
        } else {
            return <Navigate to="/" replace />;
        }
    }

    // IMPROVED: Simplified data validation for specific route types
    if (requiredLoginType === 'role' && (!roleData || !roleId)) {
        console.log('❌ Role access denied - missing role data, redirecting to options');
        return <Navigate to="/login-options" replace />;
    }

    if (requiredLoginType === 'employee' && !employeeData) {
        console.log('❌ Employee access denied - missing employee data, redirecting to options');
        return <Navigate to="/login-options" replace />;
    }

    // IMPROVED: Only log successful access on route changes to reduce noise
    if (lastValidationRoute.current !== location.pathname) {
        console.log('✅ Access granted to protected route:', {
            route: location.pathname,
            loginType,
            requiredType: requiredLoginType
        });
    }

    // Render protected content
    return children;
};

export default ProtectedRoute;