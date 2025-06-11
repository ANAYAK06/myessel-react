// src/pages/Login/Login.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { Eye, EyeOff, Building2, Shield, User, Loader2 } from 'lucide-react';
import { 
    validateEmployee, 
    clearErrors, 
    clearSuccess, 
    loadUserFromStorage 
} from '../../slices/auth/authSlice';
import LoginOptionsPopup from '../../components/LoginOptionPopup';
import ThemeToggle from '../../components/ThemeToggle';


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
    
    // Redux state
    const { 
        loading, 
        error, 
        success, 
        isAuthenticated,
        showLoginOptions,
        loginType
    } = useSelector((state) => state.auth);

    // Check for existing session on component mount
    useEffect(() => {
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
            console.log('Dispatching validateEmployee with:', credentials); //
            
            dispatch(validateEmployee(credentials));
        }
    });

    // Handle success states
    useEffect(() => {
        if (success.getEmployeeDetails) {
            dispatch(clearSuccess());
            // Navigate to employee dashboard
            navigate('/employee-dashboard');
        }
    }, [success.getEmployeeDetails, dispatch, navigate]);

    useEffect(() => {
        if (success.getMenu) {
            dispatch(clearSuccess());
            // Navigate to role dashboard
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

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated && loginType) {
            if (loginType === 'employee') {
                navigate('/employee-dashboard');
            } else if (loginType === 'role') {
                navigate('/role-dashboard');
            }
        }
    }, [isAuthenticated, loginType, navigate]);

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

    // Show loading screen while checking authentication
    if (loading.loadFromStorage) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center transition-colors">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600 dark:text-indigo-400" />
                    <p className="text-gray-600 dark:text-gray-300">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 transition-colors">
                {/* Theme Toggle - Top Right */}
                <div className="absolute top-4 right-4 z-10">
                    <ThemeToggle variant="simple" showLabel={false} />
                </div>

                <div className="w-full max-w-md">
                    {/* Company Logo/Header */}
                    <div className="text-center mb-8">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-r rounded-xl flex items-center justify-center ">
                            {/* <Building2 className="w-8 h-8 text-white" /> */}
                            <img 
                                src="/logo.jpg" 
                                alt="Essel Projects Pvt Ltd Logo" 
                                className="w-16 h-16 object-contain mx-auto mb-6 shadow-lg"
                            />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">
                            Essel Projects Pvt Ltd
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 transition-colors">
                            Sign in to access your account
                        </p>
                    </div>

                    {/* Login Form */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 transition-colors">
                        <div className="space-y-6">
                            {/* General Error */}
                            {error.validateEmployee && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center space-x-3">
                                    <Shield className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0" />
                                    <p className="text-red-700 dark:text-red-300 text-sm">{error.validateEmployee}</p>
                                </div>
                            )}

                            {/* Employee ID Field */}
                            <div className="space-y-2">
                                <label htmlFor="employeeId" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Employee ID
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <input
                                        type="text"
                                        id="employeeId"
                                        name="employeeId"
                                        value={formik.values.employeeId}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        onKeyPress={handleKeyPress}
                                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                                            formik.touched.employeeId && formik.errors.employeeId 
                                                ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20' 
                                                : 'border-gray-300 dark:border-gray-600'
                                        }`}
                                        placeholder="Enter your employee ID"
                                        disabled={loading.validateEmployee}
                                    />
                                </div>
                                {formik.touched.employeeId && formik.errors.employeeId && (
                                    <p className="text-red-600 dark:text-red-400 text-sm">{formik.errors.employeeId}</p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        name="password"
                                        value={formik.values.password}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        onKeyPress={handleKeyPress}
                                        className={`w-full pl-4 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                                            formik.touched.password && formik.errors.password 
                                                ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20' 
                                                : 'border-gray-300 dark:border-gray-600'
                                        }`}
                                        placeholder="Enter your password"
                                        disabled={loading.validateEmployee}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        disabled={loading.validateEmployee}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" />
                                        )}
                                    </button>
                                </div>
                                {formik.touched.password && formik.errors.password && (
                                    <p className="text-red-600 dark:text-red-400 text-sm">{formik.errors.password}</p>
                                )}
                            </div>

                            {/* Remember Me */}
                            <div className="flex items-center">
                                <input
                                    id="rememberMe"
                                    name="rememberMe"
                                    type="checkbox"
                                    checked={formik.values.rememberMe}
                                    onChange={formik.handleChange}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                                    disabled={loading.validateEmployee}
                                />
                                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                    Remember me
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button
                                type='submit'
                                onClick={formik.handleSubmit}
                                disabled={loading.validateEmployee || !formik.isValid}
                                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-600 hover:from-indigo-700 hover:to-indigo-700 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading.validateEmployee ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Verifying...</span>
                                    </div>
                                ) : (
                                    'Sign In'
                                )}
                            </button>
                        </div>

                        {/* Footer */}
                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Having trouble? Contact IT support at{' '}
                                <span className="text-indigo-600 dark:text-indigo-400 font-medium">it-support@sltouch.in</span>
                            </p>
                        </div>
                    </div>

                    {/* Security Notice */}
                    <div className="mt-6 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            This is a secure company portal. Unauthorized access is prohibited.
                        </p>
                    </div>
                </div>
            </div>

            {/* Login Options Popup */}
            {showLoginOptions && <LoginOptionsPopup />}
        </>
    );
};

export default Login;