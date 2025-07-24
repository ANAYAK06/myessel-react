// hooks/useSessionAuth.js - CORRECTED VERSION
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout, resetAuth } from '../slices/auth/authSlice';
import sessionManager from '../utilities/SessionsManager';

export const useSessionAuth = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const auth = useSelector((state) => state.auth);
    
    const [sessionStatus, setSessionStatus] = useState({
        isValid: false,
        remainingTime: 0,
        showWarning: false
    });

    const [isPassiveMode, setIsPassiveMode] = useState(false);

    useEffect(() => {
        if (auth.showLoginOptions) {
            console.log('🚪 Popup opened - useSessionAuth entering passive mode');
            setIsPassiveMode(true);
            return;
        } else {
            const timer = setTimeout(() => {
                console.log('🔄 Popup closed - useSessionAuth exiting passive mode');
                setIsPassiveMode(false);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [auth.showLoginOptions]);

    useEffect(() => {
        if (isPassiveMode) {
            console.log('⏸️ useSessionAuth in passive mode - skipping initialization');
            return;
        }

        console.log('🔧 Initializing session management...');
        
        sessionManager.onExpired(() => {
            console.log('🚨 Session expired - logging out');
            dispatch(logout());
            navigate('/');
        });

        sessionManager.onWarning(() => {
            console.log('⚠️ Session warning - showing notification');
            setSessionStatus(prev => ({ ...prev, showWarning: true }));
        });

        if (!isPassiveMode) {
            const isValid = sessionManager.isAuthenticated();
            console.log('🔍 Initial session check:', { isValid, reduxAuth: auth.isAuthenticated });
            
            if (!isValid && auth.isAuthenticated && !auth.showLoginOptions) {
                console.log('❌ Session invalid but Redux thinks authenticated - resetting auth');
                dispatch(resetAuth());
            }
        }

        const statusInterval = setInterval(() => {
            if (isPassiveMode) {
                return;
            }
            
            const status = sessionManager.getSessionStatus();
            setSessionStatus(prev => ({
                ...prev,
                isValid: status.isValid,
                remainingTime: status.remainingTime
            }));
        }, 60000);

        return () => {
            clearInterval(statusInterval);
        };
    }, [dispatch, auth.isAuthenticated, auth.showLoginOptions, navigate, isPassiveMode]);

    const extendSession = () => {
        console.log('🔄 Extending session...');
        sessionManager.extendSession();
        setSessionStatus(prev => ({ ...prev, showWarning: false }));
        console.log('✅ Session extended by user');
    };

    const handleLogout = () => {
        console.log('🚪 Handling logout...');
        sessionManager.logout();
        dispatch(logout());
        navigate('/');
    };

    const handleLogin = (authData) => {
        console.log('🔐 Setting up session with data:', authData);
        
        sessionManager.login(authData);
        
        setSessionStatus({
            isValid: true,
            remainingTime: 30 * 60 * 1000,
            showWarning: false
        });
        
        console.log('✅ Session setup complete');
    };

    const dismissWarning = () => {
        setSessionStatus(prev => ({ ...prev, showWarning: false }));
    };

    const formatRemainingTime = (milliseconds) => {
        const minutes = Math.floor(milliseconds / (1000 * 60));
        const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const isAuthenticated = isPassiveMode ? false : sessionManager.isAuthenticated();

    useEffect(() => {
        if (!isPassiveMode) {
            console.log('🔍 Session state update:', {
                sessionManagerAuth: isAuthenticated,
                reduxAuth: auth.isAuthenticated,
                loginType: auth.loginType,
                showPopup: auth.showLoginOptions,
                passiveMode: isPassiveMode,
                sessionValid: sessionStatus.isValid
            });
        }
    }, [isAuthenticated, auth.isAuthenticated, auth.loginType, auth.showLoginOptions, isPassiveMode, sessionStatus.isValid]);

    return {
        sessionStatus: {
            ...sessionStatus,
            formattedTime: formatRemainingTime(sessionStatus.remainingTime)
        },
        extendSession,
        handleLogout,
        handleLogin,
        dismissWarning,
        isAuthenticated,
        isPassiveMode
    };
};