// components/DebugAuthPanel.js - Add this component for debugging
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../slices/auth/authSlice';
import { useLogout } from '../hooks/useLogout';

const DebugAuthPanel = () => {
    const authState = useSelector((state) => state.auth);
    const { logout: hookLogout } = useLogout();
    const dispatch = useDispatch();

    if (process.env.NODE_ENV !== 'development') {
        return null; // Only show in development
    }

    const handleDirectLogout = () => {
        console.log('🔧 DIRECT LOGOUT - Bypassing hook');
        localStorage.clear();
        dispatch(logout());
        // Force navigation using window.location
        window.location.href = '/';
    };

    const handleHookLogout = () => {
        console.log('🔧 HOOK LOGOUT - Using useLogout hook');
        hookLogout();
    };

    const clearLocalStorage = () => {
        console.log('🧹 CLEARING LOCALSTORAGE ONLY');
        localStorage.clear();
        console.log('✅ LocalStorage cleared');
    };

    const showCurrentState = () => {
        console.log('🔍 CURRENT AUTH STATE:');
        console.log('Auth State:', authState);
        console.log('LocalStorage Contents:');
        console.log('  employeeId:', localStorage.getItem('employeeId'));
        console.log('  roleId:', localStorage.getItem('roleId'));
        console.log('  roleData:', !!localStorage.getItem('roleData'));
        console.log('  employeeData:', !!localStorage.getItem('employeeData'));
    };

    return (
        <div className="fixed top-20 left-4 bg-red-900 text-white p-4 rounded-lg text-xs max-w-sm z-50 border border-red-700">
            <div className="font-bold mb-2 text-red-300">🐛 DEBUG AUTH PANEL</div>
            
            <div className="space-y-1 mb-3">
                <div>Auth: {authState.isAuthenticated ? '✅' : '❌'}</div>
                <div>Type: {authState.loginType || 'None'}</div>
                <div>Employee: {authState.employeeId || 'None'}</div>
                <div>Role: {authState.roleId || 'None'}</div>
                <div>Menu Items: {authState.roleData?.menuItems?.length || 0}</div>
            </div>

            <div className="space-y-1 mb-3">
                <div className="text-red-300 font-semibold">LocalStorage:</div>
                <div>Employee: {localStorage.getItem('employeeId') ? '✅' : '❌'}</div>
                <div>Role: {localStorage.getItem('roleId') ? '✅' : '❌'}</div>
                <div>RoleData: {localStorage.getItem('roleData') ? '✅' : '❌'}</div>
            </div>

            <div className="space-y-2">
                <button
                    onClick={showCurrentState}
                    className="w-full bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
                >
                    🔍 Show State
                </button>
                <button
                    onClick={handleHookLogout}
                    className="w-full bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs"
                >
                    🔧 Hook Logout
                </button>
                <button
                    onClick={handleDirectLogout}
                    className="w-full bg-red-800 hover:bg-red-900 px-2 py-1 rounded text-xs"
                >
                    🚨 Force Logout
                </button>
                <button
                    onClick={clearLocalStorage}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 px-2 py-1 rounded text-xs"
                >
                    🧹 Clear Storage
                </button>
                <button
                    onClick={() => window.location.reload()}
                    className="w-full bg-gray-600 hover:bg-gray-700 px-2 py-1 rounded text-xs"
                >
                    🔄 Reload Page
                </button>
            </div>
        </div>
    );
};

export default DebugAuthPanel;