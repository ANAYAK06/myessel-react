import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { KeyRound, Loader2, Eye, EyeOff } from 'lucide-react';
import { changePassword } from '../slices/auth/authSlice';

const ChangePasswordModal = ({ isOpen, username, loginType = '', onSuccess }) => {
    const dispatch = useDispatch();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e?.preventDefault();
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await dispatch(changePassword({ username, newPassword, loginType })).unwrap();
            setNewPassword('');
            setConfirmPassword('');
            onSuccess?.();
        } catch (err) {
            setError(typeof err === 'string' ? err : 'Unable to update password. Please contact IT Support.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop - not dismissible, this step is mandatory */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="h-1.5 bg-gradient-to-r from-[#0d1b5e] via-orange-400 to-[#0d1b5e]" />

                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#0d1b5e] to-blue-900 flex items-center justify-center shadow-sm">
                        <KeyRound className="w-4 h-4 text-orange-400" />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Set a New Password</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            First-time login detected — please change your password to continue
                        </p>
                    </div>
                </div>

                <div className="px-6 py-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                                    className="w-full px-4 py-3 pr-12 border-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none transition-colors border-gray-200 dark:border-gray-700 focus:border-orange-500"
                                    placeholder="Enter new password"
                                    disabled={loading}
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Confirm Password
                            </label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                                className={`w-full px-4 py-3 border-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none transition-colors placeholder-gray-400 dark:placeholder-gray-500 ${
                                    error
                                        ? 'border-red-400 dark:border-red-500 focus:border-red-500'
                                        : 'border-gray-200 dark:border-gray-700 focus:border-orange-500'
                                }`}
                                placeholder="Re-enter new password"
                                disabled={loading}
                            />
                            {error && (
                                <p className="text-red-500 dark:text-red-400 text-sm mt-1.5">{error}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !newPassword || !confirmPassword}
                            className="w-full bg-gradient-to-r from-[#0d1b5e] to-orange-500 hover:from-[#0a1545] hover:to-orange-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.01] active:scale-[0.99]"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Updating...</span>
                                </div>
                            ) : (
                                'Update Password'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChangePasswordModal;
