import React, { useState } from 'react';
import { X, KeyRound, Loader2, CheckCircle, Mail } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';

const ForgotPasswordModal = ({ isOpen, onClose, loginType = '' }) => {
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleClose = () => {
        setUsername('');
        setLoading(false);
        setSent(false);
        setError('');
        onClose();
    };

    const handleSubmit = async (e) => {
        e?.preventDefault();
        if (!username.trim()) {
            setError('Please enter your Username');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await axios.get(`${API_BASE_URL}/Accounts/CheckUserbyUsername`, {
                params: { Username: username.trim(), Logintype: loginType }
            });
            setSent(true);
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data;
            setError(typeof msg === 'string' ? msg : 'Unable to process request. Please contact IT Support.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

            {/* Modal card */}
            <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">

                {/* Top accent stripe matching SL logo palette */}
                <div className="h-1.5 bg-gradient-to-r from-[#0d1b5e] via-orange-400 to-[#0d1b5e]" />

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#0d1b5e] to-blue-900 flex items-center justify-center shadow-sm">
                            <KeyRound className="w-4 h-4 text-orange-400" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Reset Password</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {loginType === 'role' ? 'Role account recovery' : 'Employee account recovery'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="px-6 py-6">
                    {!sent ? (
                        <>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-5">
                                Enter your Employee ID or Username and we'll send a password reset link to your registered email address.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => { setUsername(e.target.value); setError(''); }}
                                        className={`w-full px-4 py-3 border-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none transition-colors placeholder-gray-400 dark:placeholder-gray-500 ${
                                            error
                                                ? 'border-red-400 dark:border-red-500 focus:border-red-500'
                                                : 'border-gray-200 dark:border-gray-700 focus:border-orange-500'
                                        }`}
                                        placeholder="e.g. 2CM0010001"
                                        disabled={loading}
                                        autoFocus
                                    />
                                    {error && (
                                        <p className="text-red-500 dark:text-red-400 text-sm mt-1.5">{error}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !username.trim()}
                                    className="w-full bg-gradient-to-r from-[#0d1b5e] to-orange-500 hover:from-[#0a1545] hover:to-orange-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.01] active:scale-[0.99]"
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Sending...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center gap-2">
                                            <Mail className="w-4 h-4" />
                                            <span>Send Reset Link</span>
                                        </div>
                                    )}
                                </button>
                            </form>

                            <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-4">
                                Didn't receive an email? Contact{' '}
                                <a href="mailto:it-support@sltouch.in" className="text-orange-600 dark:text-orange-400 hover:text-orange-500 font-medium">
                                    IT Support
                                </a>
                            </p>
                        </>
                    ) : (
                        /* Success state */
                        <div className="text-center py-2">
                            <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Check Your Email</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                                If an account exists for{' '}
                                <span className="font-semibold text-orange-600 dark:text-orange-400">{username}</span>,
                                a password reset link has been sent to the registered email address.
                            </p>
                            <button
                                onClick={handleClose}
                                className="w-full bg-gradient-to-r from-[#0d1b5e] to-orange-500 hover:from-[#0a1545] hover:to-orange-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.01]"
                            >
                                Back to Login
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordModal;
