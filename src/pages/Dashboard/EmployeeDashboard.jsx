import React from 'react';
import { useSelector } from 'react-redux';
import {
    LogOut, User, Building2, Mail, Phone, MapPin,
    Briefcase, Calendar, Heart, Shield, Badge
} from 'lucide-react';
import { useLogout } from '../../hooks/useLogout';

const InfoRow = ({ label, value, className = '' }) => (
    <div className={`flex flex-col sm:flex-row sm:items-center py-2.5 border-b border-gray-100 last:border-0 ${className}`}>
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide sm:w-40 shrink-0 mb-0.5 sm:mb-0">
            {label}
        </span>
        <span className="text-sm text-gray-900 font-medium">
            {value || <span className="text-gray-400 font-normal">—</span>}
        </span>
    </div>
);

const SectionCard = ({ title, icon: Icon, iconColor, children }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-100 bg-gray-50">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${iconColor}`}>
                <Icon className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        </div>
        <div className="px-5 py-1">{children}</div>
    </div>
);

const EmployeeDashboard = () => {
    const { employeeData, employeeId } = useSelector((state) => state.auth);
    const { logout } = useLogout();

    const d = employeeData || {};

    const fullName = [d.Firstname, d.Middlename, d.Lastname]
        .filter(Boolean)
        .map(n => n.trim())
        .join(' ');

    const initials = [d.Firstname, d.Lastname]
        .filter(Boolean)
        .map(n => n[0])
        .join('');

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navigation */}
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="flex justify-between items-center h-14">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                                <Building2 className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <span className="text-sm font-semibold text-gray-900">Employee Portal</span>
                                <span className="hidden sm:inline text-gray-400 text-xs ml-2">Essel Projects</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="hidden sm:block text-sm text-gray-600">
                                {fullName || employeeId}
                            </span>
                            <button
                                onClick={logout}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
                {/* Profile Hero */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 mb-6 text-white shadow-lg">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                            {initials || <User className="w-7 h-7" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl font-bold truncate">{fullName || 'Employee'}</h1>
                            <p className="text-indigo-200 text-sm mt-0.5">{d.Appointed || d.UserRole || '—'}</p>
                            <p className="text-indigo-200 text-xs mt-0.5">{d.DepartmentName || '—'}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end sm:gap-1.5">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                d.Status === 'Active'
                                    ? 'bg-green-400/20 text-green-100 border border-green-400/30'
                                    : 'bg-yellow-400/20 text-yellow-100 border border-yellow-400/30'
                            }`}>
                                {d.Status || 'Unknown'}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/10 text-indigo-100 border border-white/20">
                                {d.EmpRefno || employeeId}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-white/20">
                        {[
                            { label: 'Employee ID', value: d.Username || employeeId },
                            { label: 'Job Type', value: d.Jobtype },
                            { label: 'Category', value: d.Category },
                            { label: 'Role', value: d.UserRole },
                        ].map(({ label, value }) => (
                            <div key={label}>
                                <p className="text-indigo-200 text-xs">{label}</p>
                                <p className="text-white text-sm font-semibold truncate">{value || '—'}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Personal Information */}
                    <SectionCard title="Personal Information" icon={User} iconColor="bg-indigo-500">
                        <InfoRow label="Full Name" value={fullName} />
                        <InfoRow label="Date of Birth" value={d.UpDob} />
                        <InfoRow label="Age" value={d.Age ? `${d.Age} years` : null} />
                        <InfoRow label="Gender" value={d.Gender} />
                        <InfoRow label="Marital Status" value={d.MartialStatus} />
                        {d.MartialStatus === 'Married' && (
                            <InfoRow label="Date of Marriage" value={d.UpDateofMarriage} />
                        )}
                    </SectionCard>

                    {/* Employment Details */}
                    <SectionCard title="Employment Details" icon={Briefcase} iconColor="bg-purple-500">
                        <InfoRow label="Ref No" value={d.EmpRefno} />
                        <InfoRow label="Department" value={d.DepartmentName} />
                        <InfoRow label="Designation" value={d.Appointed} />
                        <InfoRow label="Job Type" value={d.Jobtype} />
                        <InfoRow label="Joining Category" value={d.joiningcategory} />
                        <InfoRow label="Joining Type" value={d.JoiningType} />
                        <InfoRow label="Appointment" value={d.Appointmenttype} />
                    </SectionCard>

                    {/* Contact & Address */}
                    <SectionCard title="Contact & Address" icon={Phone} iconColor="bg-blue-500">
                        <InfoRow label="Mobile" value={d.Mobile} />
                        <InfoRow label="Work Email" value={d.workemail} />
                        <InfoRow label="Permanent Address" value={d.PermanentAddress} />
                    </SectionCard>

                    {/* Family & Nominee */}
                    <SectionCard title="Family & Nominee" icon={Heart} iconColor="bg-rose-500">
                        {d.MartialStatus === 'Married' && (
                            <InfoRow label="Spouse Name" value={d.SpouseName} />
                        )}
                        <InfoRow label="Nominee Name" value={d.NomineeName} />
                        <InfoRow label="Relation" value={d.Relation} />
                        <InfoRow label="Nominee Gender" value={d.NomineeGender} />
                    </SectionCard>
                </div>
            </main>
        </div>
    );
};

export default EmployeeDashboard;
