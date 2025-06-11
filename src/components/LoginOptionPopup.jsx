// src/components/LoginOptionsPopup.js
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { 
    X, 
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
    setShowLoginOptions,
    clearErrors,
    clearSuccess 
} from '../slices/auth/authSlice';

// Validation Schema for Role Login
const roleValidationSchema = Yup.object({
    password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Role password is required')
});

const LoginOptionsPopup = () => {
    const dispatch = useDispatch();
    const [showRolePassword, setShowRolePassword] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    
    const { 
        employeeId,
        loading, 
        error, 
        success 
    } = useSelector((state) => state.auth);

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

    const handleEmployeeLogin = async () => {
        try {
            await dispatch(getEmployeeDetails(employeeId)).unwrap();
            toast.success('Employee login successful!');
        } catch (error) {
            console.error('Employee details error:', error);
        }
    };

    const handleClosePopup = () => {
        dispatch(setShowLoginOptions(false));
        dispatch(clearErrors());
        dispatch(clearSuccess());
    };

    const handleOptionSelect = (option) => {
        setSelectedOption(option);
        if (option === 'employee') {
            handleEmployeeLogin();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden transition-colors">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Choose Login Type</h2>
                    <button
                        onClick={handleClosePopup}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 min-h-[400px]">
                    
                    {/* Left Side - Employee Login */}
                    <div className="p-8 border-r border-gray-200 dark:border-gray-700">
                        <div className="text-center mb-6">
                            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                                <User className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                Employee Portal
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">
                                Access your personal employee information and details
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg p-4 transition-colors">
                                <h4 className="font-medium text-indigo-900 dark:text-indigo-300 mb-2">What you can access:</h4>
                                <ul className="text-sm text-indigo-800 dark:text-indigo-200 space-y-1">
                                    <li>• Personal Information</li>
                                    <li>• Employment Details</li>
                                    <li>• Pay Stubs & Benefits</li>
                                    <li>• Time & Attendance</li>
                                </ul>
                            </div>

                            <button
                                onClick={() => handleOptionSelect('employee')}
                                disabled={loading.getEmployeeDetails}
                                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading.getEmployeeDetails ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Loading...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center space-x-2">
                                        <UserCheck className="w-4 h-4" />
                                        <span>Continue as Employee</span>
                                    </div>
                                )}
                            </button>

                            {error.getEmployeeDetails && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 transition-colors">
                                    <p className="text-red-600 dark:text-red-400 text-sm text-center">
                                        {error.getEmployeeDetails}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Side - Role Login */}
                    <div className="p-8 bg-gray-50 dark:bg-gray-800/50 transition-colors">
                        <div className="text-center mb-6">
                            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                                <Shield className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                Role Access
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">
                                Login with your role credentials to access system features
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-lg p-4 transition-colors">
                                <h4 className="font-medium text-purple-900 dark:text-purple-300 mb-2">Role-based access to:</h4>
                                <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
                                    <li>• To Access Company Reports</li>
                                    <li>• Role-specific Modules</li>
                                    <li>• Voucher Management</li>
                                    <li>• Work Order/PO Management</li>
                                    <li>• Inventory Management</li>
                                </ul>
                            </div>

                            {/* Role Password Form */}
                            <div className="space-y-4">
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
                                            className={`w-full pl-4 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                                                roleFormik.touched.password && roleFormik.errors.password 
                                                    ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20' 
                                                    : 'border-gray-300 dark:border-gray-600'
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
                                                <EyeOff className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                                            ) : (
                                                <Eye className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                                            )}
                                        </button>
                                    </div>
                                    {roleFormik.touched.password && roleFormik.errors.password && (
                                        <p className="text-red-600 dark:text-red-400 text-sm">{roleFormik.errors.password}</p>
                                    )}
                                </div>

                                <button
                                    onClick={roleFormik.handleSubmit}
                                    disabled={loading.validateUser || loading.getMenu || !roleFormik.isValid}
                                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {(loading.validateUser || loading.getMenu) ? (
                                        <div className="flex items-center justify-center space-x-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Authenticating...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center space-x-2">
                                            <Settings className="w-4 h-4" />
                                            <span>Access Role Portal</span>
                                        </div>
                                    )}
                                </button>

                                {(error.validateUser || error.getMenu) && (
                                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 transition-colors">
                                        <p className="text-red-600 dark:text-red-400 text-sm text-center">
                                            {error.validateUser || error.getMenu}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 transition-colors">
                    <div className="flex items-center justify-center space-x-4">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            Employee ID: <span className="font-medium text-gray-900 dark:text-white">{employeeId}</span>
                        </p>
                        <div className="w-1 h-1 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Choose your access level
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginOptionsPopup;