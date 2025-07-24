// src/pages/Login/LoginOptions.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { 
    ArrowLeft,
    User, 
    Shield, 
    Eye, 
    EyeOff, 
    Loader2,
    UserCheck,
    Settings
} from 'lucide-react';
import { 
    validateUser, 
    getEmployeeDetails, 
    getMenu,
    clearErrors,
    clearSuccess,
    logout
} from '../../slices/auth/authSlice';
import ThemeToggle from '../../components/ThemeToggle';

// Validation Schema for Role Login
const roleValidationSchema = Yup.object({
    password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Role password is required')
});

const LoginOptions = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [showRolePassword, setShowRolePassword] = useState(false);
    
    const { 
        employeeId,
        loading, 
        error, 
        success,
        isAuthenticated 
    } = useSelector((state) => state.auth);

    // Redirect if not authenticated (shouldn't happen, but good safeguard)
    useEffect(() => {
        if (!isAuthenticated || !employeeId) {
            navigate('/');
        }
    }, [isAuthenticated, employeeId, navigate]);

    // Role login form
    const roleFormik = useFormik({
        initialValues: {
            password: ''
        },
        validationSchema: roleValidationSchema,
        onSubmit: async (values) => {
            const credentials = {
                employeeId: employeeId,
                password: values.password
            };
            
            try {
                console.log('🔍 Attempting role validation...');
                const userResult = await dispatch(validateUser(credentials)).unwrap();
                
                console.log('✅ User validation result:', userResult);
                console.log('🎯 Extracted roleId:', userResult.roleId);
                
                if (userResult.roleId) {
                    console.log('🔍 Calling getMenu with roleId:', userResult.roleId);
                    await dispatch(getMenu(userResult.roleId)).unwrap();
                    toast.success('Role login successful!');
                } else {
                    toast.error('Role ID not found in response');
                }
            } catch (error) {
                console.error('❌ Role login error:', error);
                // Error is already handled by the thunk and shown in UI
            }
        }
    });

    // Handle success states
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

    const handleEmployeeLogin = async () => {
        try {
            await dispatch(getEmployeeDetails(employeeId)).unwrap();
            toast.success('Employee login successful!');
        } catch (error) {
            console.error('Employee details error:', error);
        }
    };

    const handleBackToLogin = () => {
        dispatch(logout());
        dispatch(clearErrors());
        dispatch(clearSuccess());
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 flex items-center justify-center p-4 transition-colors relative overflow-hidden">
            
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-20 dark:opacity-10">
                <div className="absolute top-0 left-0 w-full h-full" style={{
                    backgroundImage: `radial-gradient(circle at 25% 25%, rgba(168, 85, 247, 0.3) 0%, transparent 50%),
                                     radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)`
                }}></div>
            </div>

            {/* Floating shapes */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full opacity-20 blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Theme Toggle */}
            <div className="absolute top-4 right-4 z-10">
                <ThemeToggle variant="simple" showLabel={false} />
            </div>

            {/* Back Button */}
            <button
                onClick={handleBackToLogin}
                className="absolute top-4 left-4 z-10 flex items-center space-x-2 px-3 py-2 bg-white/20 dark:bg-gray-900/40 backdrop-blur-sm rounded-lg text-gray-700 dark:text-gray-200 hover:bg-white/30 dark:hover:bg-gray-900/60 transition-all duration-200 border border-white/30 dark:border-gray-600"
            >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back to Login</span>
            </button>

            {/* Main Container Card - Made more compact */}
            <div className="w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-white/20 dark:border-gray-600 backdrop-blur-sm transition-colors">
                
                {/* Header - Made more compact */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white text-center">
                    <h1 className="text-2xl font-bold mb-1">Choose Your Access Level</h1>
                    <p className="text-indigo-200 text-sm mb-3">Select how you want to proceed with your session</p>
                    <div className="flex items-center justify-center space-x-3 text-sm">
                        <span>Employee ID: <span className="font-semibold">{employeeId}</span></span>
                        <div className="w-1 h-3 bg-indigo-300 rounded-full"></div>
                        <span>Authenticated Successfully</span>
                    </div>
                </div>

                {/* Options Grid - Reduced padding and spacing */}
                <div className="grid grid-cols-1 lg:grid-cols-2">
                    
                    {/* Left Side - Employee Portal */}
                    <div className="p-6 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-600 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
                        <div className="text-center mb-6">
                            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl flex items-center justify-center mb-4 shadow-lg transform hover:scale-105 transition-transform">
                                <User className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                Employee Portal
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">
                                Access your personal employee information and details
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-white dark:bg-gray-800 border border-indigo-100 dark:border-gray-600 rounded-lg p-4 transition-colors">
                                <h3 className="font-semibold text-indigo-900 dark:text-indigo-200 mb-3 text-sm">What you can access:</h3>
                                <ul className="text-gray-700 dark:text-gray-200 space-y-1.5 text-sm">
                                    <li className="flex items-center space-x-2">
                                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full flex-shrink-0"></div>
                                        <span>Personal Information</span>
                                    </li>
                                    <li className="flex items-center space-x-2">
                                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full flex-shrink-0"></div>
                                        <span>Employment Details</span>
                                    </li>
                                    <li className="flex items-center space-x-2">
                                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full flex-shrink-0"></div>
                                        <span>Pay Stubs & Benefits</span>
                                    </li>
                                    <li className="flex items-center space-x-2">
                                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full flex-shrink-0"></div>
                                        <span>Time & Attendance</span>
                                    </li>
                                </ul>
                            </div>

                            <button
                                onClick={handleEmployeeLogin}
                                disabled={loading.getEmployeeDetails}
                                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white py-3 px-4 rounded-lg font-semibold shadow-lg hover:shadow-xl focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {loading.getEmployeeDetails ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span className="text-sm">Loading...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center space-x-2">
                                        <UserCheck className="w-4 h-4" />
                                        <span className="text-sm">Continue as Employee</span>
                                    </div>
                                )}
                            </button>

                            {error.getEmployeeDetails && (
                                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-3 transition-colors">
                                    <p className="text-red-600 dark:text-red-300 text-sm text-center">
                                        {error.getEmployeeDetails}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Side - Role Access */}
                    <div className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
                        <div className="text-center mb-6">
                            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-lg transform hover:scale-105 transition-transform">
                                <Shield className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                Role Access Portal
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">
                                Login with your role credentials to access advanced system features
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-white dark:bg-gray-800 border border-purple-100 dark:border-gray-600 rounded-lg p-4 transition-colors">
                                <h3 className="font-semibold text-purple-900 dark:text-purple-200 mb-3 text-sm">Role-based access to:</h3>
                                <ul className="text-gray-700 dark:text-gray-200 space-y-1.5 text-sm">
                                    <li className="flex items-center space-x-2">
                                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full flex-shrink-0"></div>
                                        <span>Company Reports & Analytics</span>
                                    </li>
                                    <li className="flex items-center space-x-2">
                                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full flex-shrink-0"></div>
                                        <span>Role-specific Modules</span>
                                    </li>
                                    <li className="flex items-center space-x-2">
                                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full flex-shrink-0"></div>
                                        <span>Voucher Management</span>
                                    </li>
                                    <li className="flex items-center space-x-2">
                                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full flex-shrink-0"></div>
                                        <span>Work Order/PO Management</span>
                                    </li>
                                    <li className="flex items-center space-x-2">
                                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full flex-shrink-0"></div>
                                        <span>Inventory Management</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Role Password Form */}
                            <div className="space-y-3">
                                <div className="space-y-2">
                                    <label htmlFor="rolePassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Role Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showRolePassword ? 'text' : 'password'}
                                            id="rolePassword"
                                            name="password"
                                            value={roleFormik.values.password}
                                            onChange={roleFormik.handleChange}
                                            onBlur={roleFormik.handleBlur}
                                            className={`w-full pl-3 pr-10 py-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-sm ${
                                                roleFormik.touched.password && roleFormik.errors.password 
                                                    ? 'border-red-300 dark:border-red-500 bg-red-50 dark:bg-red-900/20' 
                                                    : 'border-gray-300 dark:border-gray-500'
                                            }`}
                                            placeholder="Enter your role password"
                                            disabled={loading.validateUser || loading.getMenu}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowRolePassword(!showRolePassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            disabled={loading.validateUser || loading.getMenu}
                                        >
                                            {showRolePassword ? (
                                                <EyeOff className="h-4 w-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                                            ) : (
                                                <Eye className="h-4 w-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                                            )}
                                        </button>
                                    </div>
                                    {roleFormik.touched.password && roleFormik.errors.password && (
                                        <p className="text-red-600 dark:text-red-300 text-xs">{roleFormik.errors.password}</p>
                                    )}
                                </div>

                                <button
                                    onClick={roleFormik.handleSubmit}
                                    disabled={loading.validateUser || loading.getMenu || !roleFormik.isValid}
                                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 px-4 rounded-lg font-semibold shadow-lg hover:shadow-xl focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    {(loading.validateUser || loading.getMenu) ? (
                                        <div className="flex items-center justify-center space-x-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span className="text-sm">Authenticating...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center space-x-2">
                                            <Settings className="w-4 h-4" />
                                            <span className="text-sm">Access Role Portal</span>
                                        </div>
                                    )}
                                </button>

                                {(error.validateUser || error.getMenu) && (
                                    <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-3 transition-colors">
                                        <p className="text-red-600 dark:text-red-300 text-xs text-center">
                                            {error.validateUser || error.getMenu}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginOptions;