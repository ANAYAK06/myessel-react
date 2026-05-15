// src/pages/Login/Login.js - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { Eye, EyeOff, Building2, Shield, User, Loader2, CheckCircle, BarChart3, Users, HardHat, ShieldCheck } from 'lucide-react';
import {
    validateEmployee,
    clearErrors,
    clearSuccess,
    loadUserFromStorage,
    logout
} from '../../slices/auth/authSlice';
import ThemeToggle from '../../components/ThemeToggle';
import sessionManager from '../../utilities/SessionManager'; // FIXED: Removed 's' from SessionsManager
import ForgotPasswordModal from '../../components/ForgotPasswordModal';

// Validation Schema
const validationSchema = Yup.object({
    employeeId: Yup.string()
        .min(3, 'Employee ID must be at least 3 characters')
        .required('Employee ID is required'),
    password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required')
});

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState('');
    const [showForgotPassword, setShowForgotPassword] = useState(false);

    // Redux state
    const {
        loading,
        error,
        success,
        isAuthenticated,
        loginType
    } = useSelector((state) => state.auth);

    // Check for existing session on component mount
    useEffect(() => {
        console.log('🔄 Login page mounted - clearing any existing sessions');
        sessionManager.clearSession();
        dispatch(loadUserFromStorage());
    }, [dispatch]);

    // Formik setup
    const formik = useFormik({
        initialValues: {
            employeeId: '',
            password: '',
            rememberMe: false
        },
        validationSchema,
        onSubmit: async (values) => {
            console.log('Form submitted with values:', values); // DEBUG
            const credentials = {
                employeeId: values.employeeId,
                password: values.password
            };
            console.log('Dispatching validateEmployee with:', credentials);

            dispatch(validateEmployee(credentials));
        }
    });

    // Handle success states - Navigate to options page after successful employee validation
    useEffect(() => {
        if (success.validateEmployee) {
            console.log('✅ Employee validation successful - navigating to options page');
            dispatch(clearSuccess());
            navigate('/login-options');
        }
    }, [success.validateEmployee, dispatch, navigate]);

    // Handle direct dashboard redirects (for already authenticated users)
    useEffect(() => {
        if (success.getEmployeeDetails) {
            dispatch(clearSuccess());
            navigate('/employee-dashboard');
        }
    }, [success.getEmployeeDetails, dispatch, navigate]);

    useEffect(() => {
        if (success.getMenu) {
            dispatch(clearSuccess());
            navigate('/role-dashboard');
        }
    }, [success.getMenu, dispatch, navigate]);

    // Handle error states
    useEffect(() => {
        if (error.validateEmployee) {
            console.log('Employee validation error:', error.validateEmployee); // DEBUG
            toast.error(error.validateEmployee);
            dispatch(clearErrors());
        }
    }, [error.validateEmployee, dispatch]);

    // Redirect if already authenticated (with session validation)
    useEffect(() => {
        if (isAuthenticated && loginType) {
            // Check if session is still valid
            const isSessionValid = sessionManager.isAuthenticated();
            
            if (isSessionValid) {
                console.log('✅ Valid session found - redirecting to dashboard');
                if (loginType === 'employee') {
                    navigate('/employee-dashboard');
                } else if (loginType === 'role') {
                    navigate('/role-dashboard');
                }
            } else {
                console.log('❌ Session invalid - clearing auth state');
                dispatch(logout());
            }
        }
    }, [isAuthenticated, loginType, navigate, dispatch]);

    // Clear errors when user starts typing
    useEffect(() => {
        if (formik.touched.employeeId || formik.touched.password) {
            dispatch(clearErrors());
        }
    }, [formik.touched, dispatch]);

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !loading.validateEmployee && formik.isValid) {
            formik.handleSubmit();
        }
    };

    // Floating label logic
    const shouldShowFloatingLabel = (fieldName) => {
        return formik.values[fieldName] || focusedField === fieldName;
    };

    // Show loading screen while checking authentication
    if (loading.loadFromStorage) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center transition-colors">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600 dark:text-indigo-400" />
                    <p className="text-gray-600 dark:text-gray-300">Checking session...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-orange-50 dark:from-gray-900 dark:via-[#0d1b5e] dark:to-gray-900 flex items-center justify-center p-4 transition-colors relative overflow-hidden">

            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-30 dark:opacity-10">
                <div className="absolute top-0 left-0 w-full h-full" style={{
                    backgroundImage: `radial-gradient(circle at 20% 30%, rgba(13, 27, 94, 0.12) 0%, transparent 50%),
                                     radial-gradient(circle at 80% 70%, rgba(234, 88, 12, 0.10) 0%, transparent 50%)`
                }}></div>
            </div>

            {/* Floating shapes */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/6 w-72 h-72 bg-gradient-to-r from-[#0d1b5e] to-blue-800 rounded-full opacity-10 blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/6 w-80 h-80 bg-gradient-to-r from-orange-500 to-orange-300 rounded-full opacity-10 blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Theme Toggle */}
            <div className="absolute top-4 right-4 z-10">
                <ThemeToggle variant="simple" showLabel={false} />
            </div>

            {/* Main Container Card */}
            <div className="w-full max-w-5xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-white/20 dark:border-gray-700 backdrop-blur-sm transition-colors">
                <div className="grid md:grid-cols-2 min-h-[600px]">

                    {/* Left Side - Login Form */}
                    <div className="p-8 md:p-12 flex flex-col justify-center bg-white dark:bg-gray-800 transition-colors">

                        {/* Logo Section */}
                        <div className="text-center mb-8">
                            <div className="flex items-center justify-center mb-4">
                                <div className="relative">
                                    <div className=" rounded-full flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                                        {/* <User className="w-10 h-10 text-white" /> */}
                                        <img src="/logoicon.png" alt="logoicon"  className="w-16 h-16 rounded-full"/>
                                    </div>
                                    {/* <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                                        <CheckCircle className="w-2.5 h-2.5 text-white" />
                                    </div> */}
                                </div>
                            </div>

                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">
                                Log In
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300 transition-colors">
                                Welcome back to your account
                            </p>
                        </div>

                        {/* Login Form */}
                        <div className="space-y-6">

                            {/* General Error */}
                            {error.validateEmployee && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center space-x-3">
                                    <Shield className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0" />
                                    <p className="text-red-700 dark:text-red-300 text-sm">{error.validateEmployee}</p>
                                </div>
                            )}

                            {/* Employee ID Field */}
                            <div className="relative">
                                <input
                                    type="text"
                                    id="employeeId"
                                    name="employeeId"
                                    value={formik.values.employeeId}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    onFocus={() => setFocusedField('employeeId')}
                                    onKeyPress={handleKeyPress}
                                    className={`w-full px-4 py-4 border-2 rounded-xl transition-all duration-200 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-transparent focus:bg-white dark:focus:bg-gray-600 focus:outline-none ${focusedField === 'employeeId' || formik.values.employeeId
                                            ? 'border-orange-500 focus:border-orange-600'
                                            : formik.touched.employeeId && formik.errors.employeeId
                                                ? 'border-red-300 dark:border-red-600'
                                                : 'border-gray-200 dark:border-gray-600 focus:border-orange-500'
                                        }`}
                                    placeholder="Employee ID"
                                    disabled={loading.validateEmployee}
                                    required
                                />
                                <label
                                    htmlFor="employeeId"
                                    className={`absolute left-4 transition-all duration-200 pointer-events-none ${shouldShowFloatingLabel('employeeId')
                                            ? '-top-2.5 text-sm bg-white dark:bg-gray-800 px-2 text-orange-600 dark:text-orange-400 font-medium'
                                            : 'top-4 text-gray-500 dark:text-gray-400'
                                        }`}
                                >
                                    Employee ID
                                </label>
                                {formik.touched.employeeId && formik.errors.employeeId && (
                                    <p className="text-red-600 dark:text-red-400 text-sm mt-1">{formik.errors.employeeId}</p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={formik.values.password}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    onFocus={() => setFocusedField('password')}
                                    onKeyPress={handleKeyPress}
                                    className={`w-full px-4 py-4 pr-12 border-2 rounded-xl transition-all duration-200 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-transparent focus:bg-white dark:focus:bg-gray-600 focus:outline-none ${focusedField === 'password' || formik.values.password
                                            ? 'border-orange-500 focus:border-orange-600'
                                            : formik.touched.password && formik.errors.password
                                                ? 'border-red-300 dark:border-red-600'
                                                : 'border-gray-200 dark:border-gray-600 focus:border-orange-500'
                                        }`}
                                    placeholder="Password"
                                    disabled={loading.validateEmployee}
                                    required
                                />
                                <label
                                    htmlFor="password"
                                    className={`absolute left-4 transition-all duration-200 pointer-events-none ${shouldShowFloatingLabel('password')
                                            ? '-top-2.5 text-sm bg-white dark:bg-gray-800 px-2 text-orange-600 dark:text-orange-400 font-medium'
                                            : 'top-4 text-gray-500 dark:text-gray-400'
                                        }`}
                                >
                                    Password
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-4 text-gray-400 dark:text-gray-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                                    disabled={loading.validateEmployee}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                                {formik.touched.password && formik.errors.password && (
                                    <p className="text-red-600 dark:text-red-400 text-sm mt-1">{formik.errors.password}</p>
                                )}
                            </div>

                            {/* Remember Me & Forgot Password */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="rememberMe"
                                        name="rememberMe"
                                        type="checkbox"
                                        checked={formik.values.rememberMe}
                                        onChange={formik.handleChange}
                                        className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 dark:border-gray-600 rounded"
                                        disabled={loading.validateEmployee}
                                    />
                                    <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                                        Remember me
                                    </label>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowForgotPassword(true)}
                                    className="text-sm text-orange-600 dark:text-orange-400 hover:text-orange-500 dark:hover:text-orange-300 font-medium"
                                >
                                    Forgot password?
                                </button>
                            </div>

                            {/* Submit Button */}
                            <button
                                type='submit'
                                onClick={formik.handleSubmit}
                                disabled={loading.validateEmployee || !formik.isValid}
                                className="w-full bg-gradient-to-r from-blue-900 to-orange-500 hover:from-blue-950 hover:to-orange-600 text-white py-4 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {loading.validateEmployee ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Verifying...</span>
                                    </div>
                                ) : (
                                    'Log In'
                                )}
                            </button>

                            {/* Support Contact */}
                            <div className="text-center">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Having trouble? Contact{' '}
                                    <a href="mailto:it-support@sltouch.in" className="text-orange-600 dark:text-orange-400 hover:text-orange-500 font-medium">
                                        IT Support
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Compact Visual Content */}
                    <div className="bg-gradient-to-br from-[#0d1b5e] via-[#112272] to-[#0a1545] p-8 md:p-12 flex flex-col justify-center items-center text-white relative overflow-hidden">

                        {/* Orange accent stripe — echoes the logo's horizontal orange bands */}
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-600 via-orange-400 to-orange-600"></div>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-700 via-orange-500 to-orange-700 opacity-60"></div>

                        {/* Background decorative elements */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-10 right-10 w-20 h-20 border-2 border-orange-400 rounded-full animate-bounce"></div>
                            <div className="absolute bottom-10 left-10 w-16 h-16 border-2 border-orange-300 rotate-45"></div>
                            <div className="absolute top-1/2 left-10 w-12 h-12 border-2 border-white rounded-full"></div>
                        </div>

                        {/* Subtle orange radial glow */}
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-orange-500 opacity-5 rounded-full blur-3xl"></div>

                        <div className="relative z-10 text-center">
                            {/* Main Visual Element */}
                            <div className="mb-8">
                                <div className="w-32 h-32 mx-auto bg-white/80 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm ring-4 ring-orange-400/40 shadow-lg shadow-orange-500/20">
                                    <img src="/sllogo.png" alt="logo" className='w-28 h-28 object-contain rounded-full' />
                                </div>

                                <h2 className="text-3xl md:text-4xl font-bold mb-3 leading-tight">
                                    Essel Projects Pvt Ltd
                                </h2>

                                <p className="text-orange-200 text-base tracking-wide">
                                    Built On Integrity. Driven By Performance
                                </p>
                            </div>

                            {/* Key Stats Grid */}
                            <div className="grid grid-cols-3 gap-4 mb-8">
                                <div className="text-center">
                                    <div className="w-12 h-12 mx-auto bg-white/10 border border-orange-400/30 rounded-lg flex items-center justify-center mb-2">
                                        <BarChart3 className="w-6 h-6 text-orange-300" />
                                    </div>
                                    <div className="text-2xl font-bold">150+</div>
                                    <div className="text-xs text-orange-200">Projects</div>
                                </div>
                                <div className="text-center">
                                    <div className="w-12 h-12 mx-auto bg-white/10 border border-orange-400/30 rounded-lg flex items-center justify-center mb-2">
                                        <Users className="w-6 h-6 text-orange-300" />
                                    </div>
                                    <div className="text-2xl font-bold">800+</div>
                                    <div className="text-xs text-orange-200">Employees</div>
                                </div>
                                <div className="text-center">
                                    <div className="w-12 h-12 mx-auto bg-white/10 border border-orange-400/30 rounded-lg flex items-center justify-center mb-2">
                                        <HardHat className="w-6 h-6 text-orange-300" />
                                    </div>
                                    <div className="text-2xl font-bold">100%</div>
                                    <div className="text-xs text-orange-200">Safety Record</div>
                                </div>
                            </div>

                            {/* Trust Badge */}
                            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-orange-400/20">
                                <p className="text-sm font-medium text-center text-orange-100">
                                    Trusted by leading construction and manufacturing companies
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        <ForgotPasswordModal
            isOpen={showForgotPassword}
            onClose={() => setShowForgotPassword(false)}
            loginType=""
        />
        </div>
    );
};

export default Login;