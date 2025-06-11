import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { loadUserFromStorage } from '../slices/auth/authSlice';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, requiredLoginType = null }) => {
    const dispatch = useDispatch();
    const { isAuthenticated, loginType, loading } = useSelector((state) => state.auth);

    useEffect(() => {
        // Check for stored authentication data
        if (!isAuthenticated) {
            dispatch(loadUserFromStorage());
        }
    }, [dispatch, isAuthenticated]);

    // Show loading while checking authentication
    if (loading.loadFromStorage) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Verifying access...</p>
                </div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    // Check if specific login type is required
    if (requiredLoginType && loginType !== requiredLoginType) {
        // Redirect based on current login type
        if (loginType === 'employee') {
            return <Navigate to="/employee-dashboard" replace />;
        } else if (loginType === 'role') {
            return <Navigate to="/role-dashboard" replace />;
        } else {
            return <Navigate to="/" replace />;
        }
    }

    // Render protected content
    return children;
};

export default ProtectedRoute;
