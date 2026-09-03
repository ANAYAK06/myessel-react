import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { User, Phone, Heart, KeyRound, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import { PageHeader, SectionCard, InfoRow, Badge } from '../components/PortalUI';
import { fetchMyDocuments } from '../../../slices/HRSlice/employeePortalSlice';
import { changePassword } from '../../../slices/auth/authSlice';
import { showToast } from '../../../utilities/toastUtilities';

const photoMimeType = (fileType) => {
    const ft = (fileType || '').toUpperCase();
    if (ft === 'PNG') return 'image/png';
    if (['IMAGE', 'JPG', 'JPEG'].includes(ft)) return 'image/jpeg';
    return 'image/jpeg';
};

// Inline password change — same endpoint/flow as the first-time-login ChangePasswordModal
const ChangePasswordCard = ({ username }) => {
    const dispatch = useDispatch();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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
            await dispatch(changePassword({ username, newPassword, loginType: '' })).unwrap();
            setNewPassword('');
            setConfirmPassword('');
            setShowPassword(false);
            showToast('success', 'Password updated successfully');
        } catch (err) {
            setError(typeof err === 'string' ? err : 'Unable to update password. Please contact IT Support.');
        } finally {
            setLoading(false);
        }
    };

    const inputBase =
        'w-full px-3 py-2 pr-10 border rounded-lg bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400 transition-colors placeholder-gray-400 dark:placeholder-gray-500';

    return (
        <SectionCard title="Change Password" icon={KeyRound}>
            <form onSubmit={handleSubmit} className="space-y-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    New password for your login. Minimum 6 characters.
                </p>

                <div>
                    <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                        New Password
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                            className={`${inputBase} border-gray-200 dark:border-gray-700`}
                            placeholder="Enter new password"
                            disabled={loading}
                            autoComplete="new-password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
                            tabIndex={-1}
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                        Confirm Password
                    </label>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                        className={`${inputBase} ${
                            error
                                ? 'border-red-400 dark:border-red-500'
                                : 'border-gray-200 dark:border-gray-700'
                        }`}
                        placeholder="Re-enter new password"
                        disabled={loading}
                        autoComplete="new-password"
                    />
                    {error && (
                        <p className="text-red-500 dark:text-red-400 text-xs mt-1">{error}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading || !newPassword || !confirmPassword}
                    className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#0d1b5e] to-orange-500 hover:from-[#0a1545] hover:to-orange-600 text-white text-sm py-2.5 px-4 rounded-lg font-semibold shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Updating…</span>
                        </>
                    ) : (
                        <>
                            <ShieldCheck className="w-4 h-4" />
                            <span>Update Password</span>
                        </>
                    )}
                </button>
            </form>
        </SectionCard>
    );
};

const MyProfile = ({ employeeData, employeeId, fullName, initials }) => {
    const dispatch = useDispatch();
    const { documents } = useSelector((state) => state.employeePortal);
    const d = employeeData || {};

    const empRefNo = d.EmpRefno || employeeId;

    useEffect(() => {
        if (empRefNo) {
            dispatch(fetchMyDocuments(empRefNo));
        }
    }, [dispatch, empRefNo]);

    const photoDoc = useMemo(() => documents.find((doc) => doc.DocName === 'Photo'), [documents]);

    const photoUrl = useMemo(() => {
        if (!photoDoc?.DocBinaryData) return null;
        try {
            const byteCharacters = atob(photoDoc.DocBinaryData);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
            const byteArray = new Uint8Array(byteNumbers);
            return URL.createObjectURL(new Blob([byteArray], { type: photoMimeType(photoDoc.FileType) }));
        } catch {
            return null;
        }
    }, [photoDoc]);

    useEffect(() => () => {
        if (photoUrl) URL.revokeObjectURL(photoUrl);
    }, [photoUrl]);

    return (
        <div>
            <PageHeader title="My Profile" subtitle="Your personal details and login security" icon={User} />

            <div className="flex flex-col lg:flex-row gap-4 items-start">
                {/* Left — identity + details */}
                <div className="flex-1 min-w-0 w-full space-y-4">
                    {/* Identity card */}
                    <div className="bg-[#0d1b5e] dark:bg-[#0a1240] rounded-xl p-4 text-white shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl" />
                        <div className="flex items-center gap-3 relative">
                            <div className="w-14 h-14 rounded-full bg-white/10 border-2 border-orange-400/60 flex items-center justify-center text-white text-lg font-bold flex-shrink-0 overflow-hidden">
                                {photoUrl ? (
                                    <img src={photoUrl} alt={fullName || 'Employee'} className="w-full h-full object-cover" />
                                ) : (
                                    initials || <User className="w-6 h-6" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h1 className="text-base font-bold truncate">{fullName || 'Employee'}</h1>
                                {/* <p className="text-orange-200 text-xs mt-0.5 truncate">{d.Appointed || d.UserRole || '—'}</p> */}
                                <p className="text-white/50 text-[11px] mt-0.5 truncate">{d.DepartmentName || '—'}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                <Badge className={d.Status === 'Active' ? 'bg-emerald-400/20 text-emerald-100 border border-emerald-400/30' : 'bg-amber-400/20 text-amber-100 border border-amber-400/30'}>
                                    {d.Status || 'Unknown'}
                                </Badge>
                                <Badge className="bg-white/10 text-orange-100 border border-white/20">
                                    {d.EmpRefno || employeeId}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <SectionCard title="Personal Information" icon={User}>
                            <InfoRow label="Full Name" value={fullName} />
                            <InfoRow label="Date of Birth" value={d.UpDob} />
                            <InfoRow label="Age" value={d.Age ? `${d.Age} years` : null} />
                            <InfoRow label="Gender" value={d.Gender} />
                            <InfoRow label="Marital Status" value={d.MartialStatus} />
                            {d.MartialStatus === 'Married' && (
                                <InfoRow label="Date of Marriage" value={d.UpDateofMarriage} />
                            )}
                        </SectionCard>

                        <SectionCard title="Contact & Address" icon={Phone}>
                            <InfoRow label="Mobile" value={d.Mobile} />
                            <InfoRow label="Work Email" value={d.workemail} />
                            <InfoRow label="Permanent Address" value={d.PermanentAddress} />
                        </SectionCard>

                        <SectionCard title="Family & Nominee" icon={Heart} className="sm:col-span-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-6">
                                {d.MartialStatus === 'Married' && (
                                    <InfoRow label="Spouse Name" value={d.SpouseName} />
                                )}
                                <InfoRow label="Nominee Name" value={d.NomineeName} />
                                <InfoRow label="Relation" value={d.Relation} />
                                <InfoRow label="Nominee Gender" value={d.NomineeGender} />
                            </div>
                        </SectionCard>
                    </div>
                </div>

                {/* Right — password change */}
                <div className="w-full lg:w-80 lg:flex-shrink-0 lg:sticky lg:top-4">
                    <ChangePasswordCard username={employeeId} />
                </div>
            </div>
        </div>
    );
};

export default MyProfile;
