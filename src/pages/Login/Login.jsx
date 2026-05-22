// src/pages/Login/Login.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { Eye, EyeOff, Shield, Loader2, BarChart3, Users, HardHat } from 'lucide-react';
import {
    validateEmployee,
    clearErrors,
    clearSuccess,
    loadUserFromStorage,
    logout
} from '../../slices/auth/authSlice';
import ThemeToggle from '../../components/ThemeToggle';
import sessionManager from '../../utilities/SessionManager';
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

    const {
        loading,
        error,
        success,
        isAuthenticated,
        loginType
    } = useSelector((state) => state.auth);

    useEffect(() => {
        console.log('🔄 Login page mounted - clearing any existing sessions');
        sessionManager.clearSession();
        dispatch(loadUserFromStorage());
    }, [dispatch]);

    const formik = useFormik({
        initialValues: {
            employeeId: '',
            password: '',
            rememberMe: false
        },
        validationSchema,
        onSubmit: async (values) => {
            const credentials = {
                employeeId: values.employeeId,
                password: values.password
            };
            dispatch(validateEmployee(credentials));
        }
    });

    useEffect(() => {
        if (success.validateEmployee) {
            dispatch(clearSuccess());
            navigate('/login-options');
        }
    }, [success.validateEmployee, dispatch, navigate]);

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

    useEffect(() => {
        if (error.validateEmployee) {
            toast.error(error.validateEmployee);
            dispatch(clearErrors());
        }
    }, [error.validateEmployee, dispatch]);

    useEffect(() => {
        if (isAuthenticated && loginType) {
            const isSessionValid = sessionManager.isAuthenticated();
            if (isSessionValid) {
                if (loginType === 'employee') navigate('/employee-dashboard');
                else if (loginType === 'role') navigate('/role-dashboard');
            } else {
                dispatch(logout());
            }
        }
    }, [isAuthenticated, loginType, navigate, dispatch]);

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

    const shouldShowFloatingLabel = (fieldName) => {
        return formik.values[fieldName] || focusedField === fieldName;
    };

    // ─── Loading screen ───────────────────────────────────────────────────────
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

    // ─── Main render ─────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-orange-50 dark:from-gray-900 dark:via-[#0d1b5e] dark:to-gray-900 flex items-center justify-center p-4 transition-colors relative overflow-hidden">

            {/* Background pattern */}
            <div className="absolute inset-0 opacity-30 dark:opacity-10">
                <div className="absolute top-0 left-0 w-full h-full" style={{
                    backgroundImage: `radial-gradient(circle at 20% 30%, rgba(13,27,94,0.12) 0%, transparent 50%),
                                     radial-gradient(circle at 80% 70%, rgba(234,88,12,0.10) 0%, transparent 50%)`
                }} />
            </div>

            {/* Floating ambient blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/6 w-72 h-72 bg-gradient-to-r from-[#0d1b5e] to-blue-800 rounded-full opacity-10 blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/6 w-80 h-80 bg-gradient-to-r from-orange-500 to-orange-300 rounded-full opacity-10 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            {/* Theme Toggle */}
            <div className="absolute top-4 right-4 z-10">
                <ThemeToggle variant="simple" showLabel={false} />
            </div>

            {/* ── Card ─────────────────────────────────────────────────────── */}
            <div className="w-full max-w-5xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-white/20 dark:border-gray-700 backdrop-blur-sm transition-colors">
                <div className="grid md:grid-cols-2 min-h-[600px]">

                    {/* ══════════════════════════════════════════════════════
                        LEFT PANEL — Login Form
                        Light mode : Navy blue  (#0d1b5e)  background
                        Dark mode  : Deeper navy (#0a1240)  background
                        Fonts      : white / orange-tinted whites
                    ══════════════════════════════════════════════════════ */}
                    <div className="p-8 md:p-12 flex flex-col justify-between
                                    bg-[#0d1b5e] dark:bg-[#0a1240]
                                    transition-colors">

                        <div className="flex flex-col justify-center flex-1">

                            {/* Logo / heading */}
                            <div className="text-center mb-8">
                                {/* <div className="flex items-center justify-center mb-4">
                                    <div className="relative">
                                        <img
                                            src="/logoicon.png"
                                            alt="Corex logo"
                                            className="w-16 h-16 rounded-full border-2 border-orange-400 shadow-lg"
                                        />
                                    </div>
                                </div> */}

                                {/* ── Title ── */}
                                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                                    Log In
                                </h1>
                                {/* ── Subtitle ── */}
                                <p className="text-orange-200 dark:text-orange-300">
                                    Welcome back to your account
                                </p>
                            </div>

                            {/* ── Form ── */}
                            <div className="space-y-6">

                                {/* General error banner */}
                                {error.validateEmployee && (
                                    <div className="bg-red-500/20 border border-red-400/40 rounded-lg p-4 flex items-center space-x-3">
                                        <Shield className="w-5 h-5 text-red-300 flex-shrink-0" />
                                        <p className="text-red-200 text-sm">{error.validateEmployee}</p>
                                    </div>
                                )}

                                {/* Employee ID */}
                                <div className="relative">
                                    <input
                                        type="text"
                                        id="employeeId"
                                        name="employeeId"
                                        value={formik.values.employeeId}
                                        onChange={formik.handleChange}
                                        onBlur={(e) => { formik.handleBlur(e); setFocusedField(''); }}
                                        onFocus={() => setFocusedField('employeeId')}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Employee ID"
                                        disabled={loading.validateEmployee}
                                        required
                                        className={`w-full px-4 py-4 border-2 rounded-xl transition-all duration-200
                                            bg-white/10 dark:bg-white/5
                                            text-white dark:text-white
                                            placeholder-transparent
                                            focus:bg-white/15 dark:focus:bg-white/10
                                            focus:outline-none
                                            ${focusedField === 'employeeId' || formik.values.employeeId
                                                ? 'border-orange-400 focus:border-orange-300'
                                                : formik.touched.employeeId && formik.errors.employeeId
                                                    ? 'border-red-400'
                                                    : 'border-white/25 focus:border-orange-400'
                                            }`}
                                    />
                                    {/* Floating label */}
                                    <label
                                        htmlFor="employeeId"
                                        className={`absolute left-4 transition-all duration-200 pointer-events-none
                                            ${shouldShowFloatingLabel('employeeId')
                                                ? '-top-2.5 text-sm bg-[#0d1b5e] dark:bg-[#0a1240] px-2 text-orange-400 font-medium'
                                                : 'top-4 text-white/50'
                                            }`}
                                    >
                                        Employee ID
                                    </label>
                                    {formik.touched.employeeId && formik.errors.employeeId && (
                                        <p className="text-red-300 text-sm mt-1">{formik.errors.employeeId}</p>
                                    )}
                                </div>

                                {/* Password */}
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        name="password"
                                        value={formik.values.password}
                                        onChange={formik.handleChange}
                                        onBlur={(e) => { formik.handleBlur(e); setFocusedField(''); }}
                                        onFocus={() => setFocusedField('password')}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Password"
                                        disabled={loading.validateEmployee}
                                        required
                                        className={`w-full px-4 py-4 pr-12 border-2 rounded-xl transition-all duration-200
                                            bg-white/10 dark:bg-white/5
                                            text-white dark:text-white
                                            placeholder-transparent
                                            focus:bg-white/15 dark:focus:bg-white/10
                                            focus:outline-none
                                            ${focusedField === 'password' || formik.values.password
                                                ? 'border-orange-400 focus:border-orange-300'
                                                : formik.touched.password && formik.errors.password
                                                    ? 'border-red-400'
                                                    : 'border-white/25 focus:border-orange-400'
                                            }`}
                                    />
                                    {/* Floating label */}
                                    <label
                                        htmlFor="password"
                                        className={`absolute left-4 transition-all duration-200 pointer-events-none
                                            ${shouldShowFloatingLabel('password')
                                                ? '-top-2.5 text-sm bg-[#0d1b5e] dark:bg-[#0a1240] px-2 text-orange-400 font-medium'
                                                : 'top-4 text-white/50'
                                            }`}
                                    >
                                        Password
                                    </label>
                                    {/* Eye toggle */}
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={loading.validateEmployee}
                                        className="absolute right-4 top-4 text-white/40 hover:text-orange-400 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                    {formik.touched.password && formik.errors.password && (
                                        <p className="text-red-300 text-sm mt-1">{formik.errors.password}</p>
                                    )}
                                </div>

                                {/* Remember me + Forgot password */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <input
                                            id="rememberMe"
                                            name="rememberMe"
                                            type="checkbox"
                                            checked={formik.values.rememberMe}
                                            onChange={formik.handleChange}
                                            disabled={loading.validateEmployee}
                                            className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-white/30 rounded bg-white/10"
                                        />
                                        {/* ── Remember me label ── */}
                                        <label htmlFor="rememberMe" className="ml-2 text-sm text-white/80 dark:text-white/70">
                                            Remember me
                                        </label>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowForgotPassword(true)}
                                        className="text-sm text-orange-400 hover:text-orange-300 dark:text-orange-400 dark:hover:text-orange-300 font-medium transition-colors"
                                    >
                                        Forgot password?
                                    </button>
                                </div>

                                {/* Submit button */}
                                <button
                                    type="submit"
                                    onClick={formik.handleSubmit}
                                    disabled={loading.validateEmployee || !formik.isValid}
                                    className="w-full bg-gradient-to-r from-blue-900 to-orange-500 hover:from-blue-950 hover:to-orange-600
                                               text-white py-4 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl
                                               focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-[#0d1b5e]
                                               dark:focus:ring-offset-[#0a1240]
                                               transition-all duration-200
                                               disabled:opacity-50 disabled:cursor-not-allowed
                                               transform hover:scale-[1.02] active:scale-[0.98]"
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

                                {/* IT Support */}
                                <div className="text-center">
                                    {/* ── Support text ── */}
                                    <p className="text-sm text-white/50 dark:text-white/40">
                                        Having trouble? Contact{' '}
                                        <a
                                            href="mailto:it-support@sltouch.in"
                                            className="text-orange-400 hover:text-orange-300 dark:text-orange-400 dark:hover:text-orange-300 font-medium transition-colors"
                                        >
                                            IT Support
                                        </a>
                                    </p>
                                </div>

                            </div>{/* end space-y-6 */}
                        </div>

                        {/* ── Copyright footer ── */}
                        <div className="mt-8 pt-4 border-t border-white/10">
                            <p className="text-xs text-white/35 dark:text-white/30 text-center">
                                © 2026 SL Touch IT Solutions Pvt Ltd &nbsp;·&nbsp;
                                Powered by{' '} <br />
                                <span className="text-orange-400 font-medium">
                                   <img src="/corexlogo-full.png" alt="SL Touch logo" className=" inline w-16" />
                                </span>
                                <br />
                                 All rights reserved
                            </p>
                        </div>

                    </div>{/* end LEFT PANEL */}


                    {/* ══════════════════════════════════════════════════════
                        RIGHT PANEL — Branding
                        Light mode : White background — logo/text in navy + orange
                        Dark mode  : Soft dark card (#1e2535) — logo/text in light tones
                    ══════════════════════════════════════════════════════ */}
                    <div className="p-8 md:p-12 flex flex-col justify-center items-center relative overflow-hidden
                                    bg-white dark:bg-[#1e2535]
                                    transition-colors">

                        {/* Orange top accent stripe */}
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-600 via-orange-400 to-orange-600" />
                        {/* Subtle bottom stripe */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-700 via-orange-500 to-orange-700 opacity-40" />

                        {/* Decorative shapes — navy in light, white-tinted in dark */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute top-10 right-10 w-20 h-20 border-2 border-orange-400/30 dark:border-orange-400/20 rounded-full animate-bounce" />
                            <div className="absolute bottom-10 left-10 w-16 h-16 border-2 border-[#0d1b5e]/15 dark:border-white/10 rotate-45" />
                            <div className="absolute top-1/2 left-8 w-12 h-12 border-2 border-[#0d1b5e]/10 dark:border-white/8 rounded-full" />
                        </div>

                        {/* Ambient glow */}
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-orange-400 opacity-5 dark:opacity-10 rounded-full blur-3xl" />

                        <div className="relative z-10 text-center">


                            {/* ── SL Logo — diamond with flat bottom, matching actual logo shape ── */}
                            {/* ── SL Logo — diamond with flat bottom, no border ── */}
                            <div className="relative mx-auto mb-8" style={{ width: '150px', height: '150px' }}>

                                {/* Shape fill only — no border */}
                                <div
                                    className="absolute inset-0 bg-white dark:bg-[#1e2535]"
                                    style={{
                                        clipPath: 'polygon(50% 0%, 100% 50%, 70% 88%, 30% 88%, 0% 50%)'
                                    }}
                                />

                                {/* Logo centered inside */}
                                <div
                                    className="absolute flex items-center justify-center"
                                    style={{
                                        top: '50%', left: '50%',
                                        transform: 'translate(-50%, -48%)',
                                        width: '150px', height: '150px',
                                        zIndex: 10,
                                    }}
                                >
                                    <img
                                        src="/sllogo.png"
                                        alt="Essel Projects logo"
                                        className="w-full h-full object-contain"
                                    />
                                </div>

                            </div>

                            {/* ── Company name ── */}
                            <h2 className="text-3xl md:text-4xl font-bold mb-3 leading-tight
                                           text-[#0d1b5e] dark:text-white">
                                Essel Projects Pvt Ltd
                            </h2>

                            {/* ── Tagline ── */}
                            <p className="text-base tracking-wide mb-8
                                          text-orange-600 dark:text-orange-400">
                                Built On Integrity. Driven By Performance
                            </p>

                            {/* ── Stats grid ── */}
                            <div className="grid grid-cols-3 gap-4 mb-8">

                                {/* Projects */}
                                <div className="text-center">
                                    <div className="w-12 h-12 mx-auto rounded-lg flex items-center justify-center mb-2
                                                    bg-[#0d1b5e]/8 dark:bg-white/8
                                                    border border-[#0d1b5e]/15 dark:border-white/10">
                                        <BarChart3 className="w-6 h-6 text-orange-500 dark:text-orange-400" />
                                    </div>
                                    <div className="text-2xl font-bold text-[#0d1b5e] dark:text-white">150+</div>
                                    <div className="text-xs text-[#0d1b5e]/55 dark:text-white/55">Projects</div>
                                </div>

                                {/* Employees */}
                                <div className="text-center">
                                    <div className="w-12 h-12 mx-auto rounded-lg flex items-center justify-center mb-2
                                                    bg-[#0d1b5e]/8 dark:bg-white/8
                                                    border border-[#0d1b5e]/15 dark:border-white/10">
                                        <Users className="w-6 h-6 text-orange-500 dark:text-orange-400" />
                                    </div>
                                    <div className="text-2xl font-bold text-[#0d1b5e] dark:text-white">800+</div>
                                    <div className="text-xs text-[#0d1b5e]/55 dark:text-white/55">Employees</div>
                                </div>

                                {/* Safety */}
                                <div className="text-center">
                                    <div className="w-12 h-12 mx-auto rounded-lg flex items-center justify-center mb-2
                                                    bg-[#0d1b5e]/8 dark:bg-white/8
                                                    border border-[#0d1b5e]/15 dark:border-white/10">
                                        <HardHat className="w-6 h-6 text-orange-500 dark:text-orange-400" />
                                    </div>
                                    <div className="text-2xl font-bold text-[#0d1b5e] dark:text-white">100%</div>
                                    <div className="text-xs text-[#0d1b5e]/55 dark:text-white/55">Safety Record</div>
                                </div>

                            </div>

                            {/* ── Trust badge ── */}
                            <div className="rounded-xl p-4
                                            bg-[#0d1b5e]/5 dark:bg-white/5
                                            border border-[#0d1b5e]/12 dark:border-white/10">
                                <p className="text-sm font-medium text-center
                                              text-[#0d1b5e]/65 dark:text-white/60">
                                    Trusted by leading construction and manufacturing companies
                                </p>
                            </div>

                        </div>
                    </div>{/* end RIGHT PANEL */}

                </div>
            </div>{/* end card */}

            <ForgotPasswordModal
                isOpen={showForgotPassword}
                onClose={() => setShowForgotPassword(false)}
                loginType=""
            />

        </div>
    );
};

export default Login;