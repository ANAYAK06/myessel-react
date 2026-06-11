import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import clsx from 'clsx';
import {
    Users,
    Download,
    RotateCcw,
    Eye,
    Search,
    AlertTriangle,
    Info,
    Calendar,
    Building2,
    Award,
    Briefcase,
    FileText,
    Mail,
    Phone,
    MapPin,
    User,
    ChevronRight,
    ChevronDown,
    Activity,
    GraduationCap,
    Zap,
    Target,
    CreditCard,
    IdCard,
    Globe,
    X
} from 'lucide-react';
import { toast } from 'react-toastify';

// Import slice actions and selectors
import {
    fetchAllStaff,
    fetchStaffDetailsByRefNo,
    setFilters,
    clearFilters,
    resetStaffData,
    resetStaffDetails,
    clearError,
    selectStaffList,
    selectStaffDetails,
    selectStaffListLoading,
    selectStaffDetailsLoading,
    selectStaffListError,
    selectStaffDetailsError,
    selectFilters,
    selectIsAnyLoading
} from '../../slices/HrReportSlice/staffReportSlice';

// Import Attachment Modal
import AttachmentModal from '../../components/Inbox/AttachmentModal';

// Tooltip Component
const Tooltip = ({ children, content }) => {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            {children}
            {showTooltip && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded-lg shadow-lg whitespace-nowrap z-50">
                    {content}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                </div>
            )}
        </div>
    );
};

// Staff Details Component (Expandable Row Content)
const StaffDetailsExpanded = ({ staffData, loading, onDocumentView }) => {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <RotateCcw className="h-6 w-6 text-purple-500 animate-spin mr-3" />
                <p className="text-purple-700 dark:text-purple-300">Loading staff details...</p>
            </div>
        );
    }

    if (!staffData) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No staff details available</p>
            </div>
        );
    }

    const getFullName = () => {
        const parts = [staffData.FirstName, staffData.MiddleName, staffData.LastName].filter(Boolean);
        return parts.length > 0 ? parts.join(' ') : 'Unknown';
    };

    return (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10 p-6 space-y-6">
            {/* Header Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-purple-200 dark:border-purple-700">
                <div className="flex items-start space-x-4">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                            <User className="w-8 h-8 text-white" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-white dark:border-gray-800"></div>
                    </div>

                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                            {getFullName()}
                        </h2>
                        <p className="text-purple-600 dark:text-purple-400 font-semibold mb-3">
                            {staffData.DesignatedAs || 'N/A'} • {staffData.Department || 'N/A'}
                        </p>

                        <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                                {staffData.EmpRefNo}
                            </span>
                            <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                                {staffData.Category}
                            </span>
                            {staffData.Status && (
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    staffData.Status === 'Active'
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                }`}>
                                    {staffData.Status}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-purple-200 dark:border-purple-700">
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                        <p className="text-xs text-purple-600 dark:text-purple-400 mb-1">Joining Date</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {staffData.JoiningDate || 'N/A'}
                        </p>
                    </div>
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3">
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 mb-1">Job Type</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {staffData.JobType || 'N/A'}
                        </p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                        <p className="text-xs text-green-600 dark:text-green-400 mb-1">Experience</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {staffData.Experience || 'N/A'}
                        </p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                        <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Joining Type</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {staffData.JoiningType || 'N/A'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-indigo-200 dark:border-indigo-700">
                    <h4 className="font-semibold text-indigo-800 dark:text-indigo-300 mb-4 flex items-center">
                        <User className="w-5 h-5 mr-2" />
                        Personal Information
                    </h4>
                    <div className="space-y-3 text-sm">
                        {staffData.DateofBirth && (
                            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                                <span className="text-gray-600 dark:text-gray-400 flex items-center">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Date of Birth
                                </span>
                                <span className="font-medium text-gray-900 dark:text-white">{staffData.DateofBirth}</span>
                            </div>
                        )}
                        {staffData.EmpAge && (
                            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                                <span className="text-gray-600 dark:text-gray-400">Age</span>
                                <span className="font-medium text-gray-900 dark:text-white">{staffData.EmpAge} years</span>
                            </div>
                        )}
                        {staffData.Gender && (
                            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                                <span className="text-gray-600 dark:text-gray-400">Gender</span>
                                <span className="font-medium text-gray-900 dark:text-white">{staffData.Gender}</span>
                            </div>
                        )}
                        {staffData.MartialStatus && (
                            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                                <span className="text-gray-600 dark:text-gray-400">Marital Status</span>
                                <span className="font-medium text-gray-900 dark:text-white">{staffData.MartialStatus}</span>
                            </div>
                        )}
                        {staffData.DateofMarriage && (
                            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                                <span className="text-gray-600 dark:text-gray-400">Marriage Date</span>
                                <span className="font-medium text-gray-900 dark:text-white">{staffData.DateofMarriage}</span>
                            </div>
                        )}
                        {staffData.PlaceofBirth && (
                            <div className="flex justify-between items-center py-2">
                                <span className="text-gray-600 dark:text-gray-400">Place of Birth</span>
                                <span className="font-medium text-gray-900 dark:text-white">{staffData.PlaceofBirth}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-purple-200 dark:border-purple-700">
                    <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-4 flex items-center">
                        <Mail className="w-5 h-5 mr-2" />
                        Contact Information
                    </h4>
                    <div className="space-y-3 text-sm">
                        {staffData.WorkEmail && (
                            <div className="py-2 border-b border-gray-200 dark:border-gray-700">
                                <span className="text-gray-600 dark:text-gray-400 block text-xs mb-1  items-center">
                                    <Mail className="w-3 h-3 mr-1" />
                                    Email
                                </span>
                                <span className="font-medium text-gray-900 dark:text-white break-all">{staffData.WorkEmail}</span>
                            </div>
                        )}
                        {staffData.ContactMobile && (
                            <div className="py-2 border-b border-gray-200 dark:border-gray-700">
                                <span className="text-gray-600 dark:text-gray-400 block text-xs mb-1 items-center">
                                    <Phone className="w-3 h-3 mr-1" />
                                    Mobile
                                </span>
                                <span className="font-medium text-gray-900 dark:text-white">{staffData.ContactMobile}</span>
                            </div>
                        )}
                        {staffData.ContactWorkPhone && (
                            <div className="py-2 border-b border-gray-200 dark:border-gray-700">
                                <span className="text-gray-600 dark:text-gray-400 block text-xs mb-1">Work Phone</span>
                                <span className="font-medium text-gray-900 dark:text-white">{staffData.ContactWorkPhone}</span>
                            </div>
                        )}
                        {staffData.PermanentAddress && (
                            <div className="py-2 border-b border-gray-200 dark:border-gray-700">
                                <span className="text-gray-600 dark:text-gray-400 block text-xs mb-1  items-center">
                                    <MapPin className="w-3 h-3 mr-1" />
                                    Permanent Address
                                </span>
                                <p className="font-medium text-gray-900 dark:text-white text-sm">{staffData.PermanentAddress}</p>
                            </div>
                        )}
                        {staffData.PresentAddress && (
                            <div className="py-2">
                                <span className="text-gray-600 dark:text-gray-400 block text-xs mb-1 items-center">
                                    <MapPin className="w-3 h-3 mr-1" />
                                    Present Address
                                </span>
                                <p className="font-medium text-gray-900 dark:text-white text-sm">{staffData.PresentAddress}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Employment Details */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-green-200 dark:border-green-700">
                    <h4 className="font-semibold text-green-800 dark:text-green-300 mb-4 flex items-center">
                        <Briefcase className="w-5 h-5 mr-2" />
                        Employment Details
                    </h4>
                    <div className="space-y-3 text-sm">
                        {staffData.Appointmenttype && (
                            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                                <span className="text-gray-600 dark:text-gray-400">Appointment Type</span>
                                <span className="font-medium text-gray-900 dark:text-white">{staffData.Appointmenttype}</span>
                            </div>
                        )}
                        {staffData.JoiningCCName && (
                            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                                <span className="text-gray-600 dark:text-gray-400">Cost Center</span>
                                <span className="font-medium text-gray-900 dark:text-white">{staffData.JoiningCCName}</span>
                            </div>
                        )}
                        {staffData.ReportToName && (
                            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                                <span className="text-gray-600 dark:text-gray-400">Reports To</span>
                                <span className="font-medium text-gray-900 dark:text-white">{staffData.ReportToName}</span>
                            </div>
                        )}
                        {staffData.ReportToRole && (
                            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                                <span className="text-gray-600 dark:text-gray-400">Reporting Role</span>
                                <span className="font-medium text-gray-900 dark:text-white">{staffData.ReportToRole}</span>
                            </div>
                        )}
                        {staffData.GroupName && (
                            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                                <span className="text-gray-600 dark:text-gray-400">Group</span>
                                <span className="font-medium text-gray-900 dark:text-white">{staffData.GroupName}</span>
                            </div>
                        )}
                        {staffData.Probationdays > 0 && (
                            <div className="flex justify-between items-center py-2">
                                <span className="text-gray-600 dark:text-gray-400">Probation Period</span>
                                <span className="font-medium text-gray-900 dark:text-white">{staffData.Probationdays} days</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bank Details */}
                {(staffData.BankAccountNo || staffData.BankName) && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-blue-200 dark:border-blue-700">
                        <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-4 flex items-center">
                            <CreditCard className="w-5 h-5 mr-2" />
                            Bank Details
                        </h4>
                        <div className="space-y-3 text-sm">
                            {staffData.BankName && (
                                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                                    <span className="text-gray-600 dark:text-gray-400">Bank Name</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{staffData.BankName}</span>
                                </div>
                            )}
                            {staffData.BankAccountNo && (
                                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                                    <span className="text-gray-600 dark:text-gray-400">Account Number</span>
                                    <span className="font-medium text-gray-900 dark:text-white font-mono">{staffData.BankAccountNo}</span>
                                </div>
                            )}
                            {staffData.IFSCcode && (
                                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                                    <span className="text-gray-600 dark:text-gray-400">IFSC Code</span>
                                    <span className="font-medium text-gray-900 dark:text-white font-mono">{staffData.IFSCcode}</span>
                                </div>
                            )}
                            {staffData.BankAddress && (
                                <div className="py-2">
                                    <span className="text-gray-600 dark:text-gray-400 block text-xs mb-1">Bank Address</span>
                                    <p className="font-medium text-gray-900 dark:text-white text-sm">{staffData.BankAddress}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Government IDs */}
            {(staffData.AdharNo || staffData.PanNo || staffData.PFNumber || staffData.ESINumber || staffData.UANNumber) && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-red-200 dark:border-red-700">
                    <h4 className="font-semibold text-red-800 dark:text-red-300 mb-4 flex items-center">
                        <IdCard className="w-5 h-5 mr-2" />
                        Government IDs & Documents
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        {staffData.AdharNo && (
                            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                                <span className="text-red-600 dark:text-red-400 block text-xs mb-1">Aadhar Number</span>
                                <span className="font-medium text-gray-900 dark:text-white font-mono">{staffData.AdharNo}</span>
                            </div>
                        )}
                        {staffData.PanNo && (
                            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                                <span className="text-red-600 dark:text-red-400 block text-xs mb-1">PAN Number</span>
                                <span className="font-medium text-gray-900 dark:text-white font-mono">{staffData.PanNo}</span>
                            </div>
                        )}
                        {staffData.PFNumber && (
                            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                                <span className="text-red-600 dark:text-red-400 block text-xs mb-1">PF Number</span>
                                <span className="font-medium text-gray-900 dark:text-white font-mono">{staffData.PFNumber}</span>
                            </div>
                        )}
                        {staffData.ESINumber && (
                            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                                <span className="text-red-600 dark:text-red-400 block text-xs mb-1">ESI Number</span>
                                <span className="font-medium text-gray-900 dark:text-white font-mono">{staffData.ESINumber}</span>
                            </div>
                        )}
                        {staffData.UANNumber && (
                            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                                <span className="text-red-600 dark:text-red-400 block text-xs mb-1">UAN Number</span>
                                <span className="font-medium text-gray-900 dark:text-white font-mono">{staffData.UANNumber}</span>
                            </div>
                        )}
                    </div>

                    {(staffData.PFExist || staffData.ESIExist) && (
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            {staffData.PFExist && (
                                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                                    <span className="text-red-600 dark:text-red-400 text-xs block mb-1">PF Status</span>
                                    <span className={`font-medium text-sm ${staffData.PFExist === 'Yes' ? 'text-green-600' : 'text-red-600'}`}>
                                        {staffData.PFExist === 'Yes' ? '✓ Eligible' : '✗ Not Eligible'}
                                    </span>
                                </div>
                            )}
                            {staffData.ESIExist && (
                                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                                    <span className="text-red-600 dark:text-red-400 text-xs block mb-1">ESI Status</span>
                                    <span className={`font-medium text-sm ${staffData.ESIExist === 'Yes' ? 'text-green-600' : 'text-red-600'}`}>
                                        {staffData.ESIExist === 'Yes' ? '✓ Eligible' : '✗ Not Eligible'}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Nominee Information */}
            {(staffData.NomineeName || staffData.NomineeRelation) && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-yellow-200 dark:border-yellow-700">
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-4 flex items-center">
                        <Users className="w-5 h-5 mr-2" />
                        Nominee Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        {staffData.NomineeName && (
                            <div>
                                <span className="text-yellow-600 dark:text-yellow-400 block text-xs mb-1">Nominee Name</span>
                                <span className="font-medium text-gray-900 dark:text-white">{staffData.NomineeName}</span>
                            </div>
                        )}
                        {staffData.NomineeRelation && (
                            <div>
                                <span className="text-yellow-600 dark:text-yellow-400 block text-xs mb-1">Relation</span>
                                <span className="font-medium text-gray-900 dark:text-white">{staffData.NomineeRelation}</span>
                            </div>
                        )}
                        {staffData.NomineeDateofBirth && (
                            <div>
                                <span className="text-yellow-600 dark:text-yellow-400 block text-xs mb-1">Date of Birth</span>
                                <span className="font-medium text-gray-900 dark:text-white">{staffData.NomineeDateofBirth}</span>
                            </div>
                        )}
                        {staffData.NomineeAge && (
                            <div>
                                <span className="text-yellow-600 dark:text-yellow-400 block text-xs mb-1">Age</span>
                                <span className="font-medium text-gray-900 dark:text-white">{staffData.NomineeAge} years</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Family Members */}
            {staffData.FamilyMemberData && staffData.FamilyMemberData.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-teal-200 dark:border-teal-700">
                    <h4 className="font-semibold text-teal-800 dark:text-teal-300 mb-4 flex items-center">
                        <Users className="w-5 h-5 mr-2" />
                        Family Members ({staffData.FamilyMemberData.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {staffData.FamilyMemberData.map((member, index) => (
                            <div key={index} className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-lg border border-teal-200 dark:border-teal-600">
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-gray-900 dark:text-white">{member.FMName}</span>
                                        <span className="text-xs bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 px-2 py-1 rounded-full">
                                            {member.FMRelation}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                                        <span>DOB: {member.FMDateofBirth}</span>
                                        <span>Age: {member.FMAge} years</span>
                                        <span>Gender: {member.FMGender}</span>
                                        {member.FMMobileNo && <span>Mobile: {member.FMMobileNo}</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Children */}
            {staffData.ChildrensData && staffData.ChildrensData.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-pink-200 dark:border-pink-700">
                    <h4 className="font-semibold text-pink-800 dark:text-pink-300 mb-4 flex items-center">
                        <Users className="w-5 h-5 mr-2" />
                        Children ({staffData.ChildrensData.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {staffData.ChildrensData.map((child, index) => (
                            <div key={index} className="bg-pink-50 dark:bg-pink-900/20 p-4 rounded-lg border border-pink-200 dark:border-pink-600">
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-gray-900 dark:text-white">{child.ChildName}</span>
                                        <span className="text-xs bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 px-2 py-1 rounded-full">
                                            {child.ChildGender}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                                        <span>DOB: {child.ChildDateofBirth}</span>
                                        <span>Age: {child.ChildAge} years</span>
                                        <span colSpan={2}>Status: {child.ChildMaritalStatus}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Academic Qualifications */}
            {staffData.AcademicQualificationData && staffData.AcademicQualificationData.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-indigo-200 dark:border-indigo-700">
                    <h4 className="font-semibold text-indigo-800 dark:text-indigo-300 mb-4 flex items-center">
                        <GraduationCap className="w-5 h-5 mr-2" />
                        Academic Qualifications ({staffData.AcademicQualificationData.length})
                    </h4>
                    <div className="space-y-3">
                        {staffData.AcademicQualificationData.map((qualification, index) => (
                            <div key={index} className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-200 dark:border-indigo-600">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                                    <div>
                                        <span className="text-indigo-600 dark:text-indigo-400 block text-xs mb-1">Qualification</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{qualification.AcademicClass}</span>
                                    </div>
                                    <div>
                                        <span className="text-indigo-600 dark:text-indigo-400 block text-xs mb-1">University/Board</span>
                                        <span className="font-medium text-gray-800 dark:text-gray-200">{qualification.NameofUniversity}</span>
                                    </div>
                                    <div>
                                        <span className="text-indigo-600 dark:text-indigo-400 block text-xs mb-1">Duration</span>
                                        <span className="font-medium text-gray-800 dark:text-gray-200">{qualification.FromYear} - {qualification.ToYear}</span>
                                    </div>
                                    <div>
                                        <span className="text-indigo-600 dark:text-indigo-400 block text-xs mb-1">Percentage</span>
                                        <span className="font-medium text-green-600 dark:text-green-400">{qualification.Percentage}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Technical Skills */}
            {staffData.TechnicalData && staffData.TechnicalData.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-orange-200 dark:border-orange-700">
                    <h4 className="font-semibold text-orange-800 dark:text-orange-300 mb-4 flex items-center">
                        <Zap className="w-5 h-5 mr-2" />
                        Technical Skills ({staffData.TechnicalData.length})
                    </h4>
                    <div className="space-y-3">
                        {staffData.TechnicalData.map((tech, index) => (
                            <div key={index} className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-600">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                                    <div>
                                        <span className="text-orange-600 dark:text-orange-400 block text-xs mb-1">Skill</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{tech.TechnicalSkill}</span>
                                    </div>
                                    <div>
                                        <span className="text-orange-600 dark:text-orange-400 block text-xs mb-1">Institution</span>
                                        <span className="font-medium text-gray-800 dark:text-gray-200">{tech.TechInstitutionName}</span>
                                    </div>
                                    <div>
                                        <span className="text-orange-600 dark:text-orange-400 block text-xs mb-1">Duration</span>
                                        <span className="font-medium text-gray-800 dark:text-gray-200">{tech.TechFromYear} - {tech.TechToYear}</span>
                                    </div>
                                    <div>
                                        <span className="text-orange-600 dark:text-orange-400 block text-xs mb-1">Score</span>
                                        <span className="font-medium text-green-600 dark:text-green-400">{tech.TechPercentage}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Work Experience */}
            {staffData.ExperienceData && staffData.ExperienceData.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-purple-200 dark:border-purple-700">
                    <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-4 flex items-center">
                        <Target className="w-5 h-5 mr-2" />
                        Work Experience ({staffData.ExperienceData.length})
                    </h4>
                    <div className="space-y-3">
                        {staffData.ExperienceData.map((exp, index) => (
                            <div key={index} className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-600">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                                    <div>
                                        <span className="text-purple-600 dark:text-purple-400 block text-xs mb-1">Organization</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{exp.OrganisationName}</span>
                                    </div>
                                    <div>
                                        <span className="text-purple-600 dark:text-purple-400 block text-xs mb-1">Role</span>
                                        <span className="font-medium text-gray-800 dark:text-gray-200">{exp.Role}</span>
                                    </div>
                                    <div>
                                        <span className="text-purple-600 dark:text-purple-400 block text-xs mb-1">Duration</span>
                                        <span className="font-medium text-gray-800 dark:text-gray-200">{exp.ExpFromYear} - {exp.ExpToYear}</span>
                                    </div>
                                    {exp.ExperienceYears && (
                                        <div>
                                            <span className="text-purple-600 dark:text-purple-400 block text-xs mb-1">Experience</span>
                                            <span className="font-medium text-green-600 dark:text-green-400">{exp.ExperienceYears} years</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Employee Documents */}
            {staffData.DocumentData && staffData.DocumentData.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-300 mb-4 flex items-center">
                        <FileText className="w-5 h-5 mr-2" />
                        Employee Documents ({staffData.DocumentData.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {staffData.DocumentData.map((doc, index) => (
                            <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                                            <FileText className="w-4 h-4 text-purple-600" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{doc.DocName}</div>
                                            <div className="text-xs text-gray-500">{doc.FileType}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xs text-green-600 font-medium">✓ Available</span>
                                        <button
                                            onClick={() => onDocumentView(doc)}
                                            className="text-purple-600 hover:text-purple-800 p-1 hover:bg-purple-100 dark:hover:bg-purple-900/20 rounded"
                                            title="View Document"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Salary Information */}
            {staffData.SalaryAccess === 'Exist' && staffData.SalaryRuleData && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-green-200 dark:border-green-700">
                    <h4 className="font-semibold text-green-800 dark:text-green-300 mb-4 flex items-center">
                        <Award className="w-5 h-5 mr-2" />
                        Salary Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                            <p className="text-xs text-green-600 dark:text-green-400 mb-1">Gross Amount</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">₹ {staffData.SalaryRuleData.GrossAmount}</p>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-center">
                            <p className="text-xs text-red-600 dark:text-red-400 mb-1">Total Deduction</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">₹ {staffData.SalaryRuleData.TotalDeduction}</p>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                            <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Net Amount</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">₹ {staffData.SalaryRuleData.NetAmount}</p>
                        </div>
                    </div>

                    {/* Earnings */}
                    {staffData.SalaryRuleData.EarningSalaryHeadList && staffData.SalaryRuleData.EarningSalaryHeadList.length > 0 && (
                        <div className="mb-4">
                            <h5 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">Earnings</h5>
                            <div className="space-y-2">
                                {staffData.SalaryRuleData.EarningSalaryHeadList.map((head, index) => (
                                    head.StaffAmount > 0 && (
                                        <div key={index} className="flex justify-between items-center py-2 px-3 bg-green-50 dark:bg-green-900/20 rounded">
                                            <span className="text-sm text-gray-700 dark:text-gray-300">{head.HeadName}</span>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">₹ {head.StaffAmount.toFixed(2)}</span>
                                        </div>
                                    )
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Deductions */}
                    {staffData.SalaryRuleData.DeductionSalaryHeadList && staffData.SalaryRuleData.DeductionSalaryHeadList.length > 0 && (
                        <div>
                            <h5 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">Deductions</h5>
                            <div className="space-y-2">
                                {staffData.SalaryRuleData.DeductionSalaryHeadList.map((head, index) => (
                                    head.StaffAmount > 0 && (
                                        <div key={index} className="flex justify-between items-center py-2 px-3 bg-red-50 dark:bg-red-900/20 rounded">
                                            <span className="text-sm text-gray-700 dark:text-gray-300">{head.HeadName}</span>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">₹ {head.StaffAmount.toFixed(2)}</span>
                                        </div>
                                    )
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Additional Information */}
            {(staffData.MOID || staffData.joiningcategory || staffData.SalaryAccess || staffData.UsernameAccess) && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-300 mb-4 flex items-center">
                        <Info className="w-5 h-5 mr-2" />
                        Additional Information
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {staffData.MOID > 0 && (
                            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                <span className="text-gray-600 dark:text-gray-400 block text-xs mb-1">MOID</span>
                                <span className="font-medium text-gray-900 dark:text-white">{staffData.MOID}</span>
                            </div>
                        )}
                        {staffData.joiningcategory && (
                            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                <span className="text-gray-600 dark:text-gray-400 block text-xs mb-1">Joining Category</span>
                                <span className="font-medium text-gray-900 dark:text-white">{staffData.joiningcategory}</span>
                            </div>
                        )}
                        {staffData.UsernameAccess && (
                            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                <span className="text-gray-600 dark:text-gray-400 block text-xs mb-1">Username Access</span>
                                <span className="font-medium text-gray-900 dark:text-white">{staffData.UsernameAccess}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Approval Notes */}
            {staffData.ApprovalNote && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-5 border border-yellow-200 dark:border-yellow-700">
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-3 flex items-center">
                        <FileText className="w-5 h-5 mr-2" />
                        Approval Notes
                    </h4>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">{staffData.ApprovalNote}</p>
                </div>
            )}
        </div>
    );
};

// Helper function to download data as Excel
const downloadAsExcel = (data, filename) => {
    try {
        const csvContent = convertToCSV(data);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('Excel file downloaded successfully');
    } catch (error) {
        console.error('Error downloading Excel:', error);
        toast.error('Error downloading Excel file');
    }
};

const convertToCSV = (data) => {
    if (!Array.isArray(data) || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row =>
            headers.map(header => {
                const value = row[header];
                return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
            }).join(',')
        )
    ].join('\n');

    return csvContent;
};

const StaffReportPage = () => {
    const dispatch = useDispatch();

    // Redux selectors
    const staffList = useSelector(selectStaffList);
    const staffDetails = useSelector(selectStaffDetails);
    const staffListLoading = useSelector(selectStaffListLoading);
    const staffDetailsLoading = useSelector(selectStaffDetailsLoading);
    const staffListError = useSelector(selectStaffListError);
    const filters = useSelector(selectFilters);
    const isAnyLoading = useSelector(selectIsAnyLoading);

    // Get userData from auth state
    const { userData } = useSelector((state) => state.auth);
    const roleId = userData?.roleId || userData?.RID;
    const uid = userData?.UID || userData?.uid;

    // Local state
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [loadingRow, setLoadingRow] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showDocumentModal, setShowDocumentModal] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);

    // Load initial data
    useEffect(() => {
        console.log('🚀 Staff Report - User Data:', userData);
        console.log('🚀 Role ID:', roleId, 'UID:', uid);
    }, [userData, roleId, uid]);

    // Show error messages via toast
    useEffect(() => {
        if (staffListError) {
            toast.error(`Error: ${staffListError}`);
            dispatch(clearError({ errorType: 'staffList' }));
        }
    }, [staffListError, dispatch]);

    // Handle generate report
    const handleGenerateReport = async () => {
        if (!roleId) {
            toast.warning('Role ID is required');
            return;
        }

        try {
            await dispatch(fetchAllStaff({ roleId })).unwrap();
            toast.success('Staff report generated successfully');
        } catch (error) {
            console.error('❌ Error generating report:', error);
            toast.error('Failed to generate report. Please try again.');
        }
    };

    // Handle reset
    const handleReset = () => {
        dispatch(clearFilters());
        dispatch(resetStaffData());
        setSearchQuery('');
        setExpandedRows(new Set());
        setLoadingRow(null);
    };

    // Handle row expand/collapse
    const handleRowToggle = async (staff) => {
        if (loadingRow) return;

        const newExpandedRows = new Set(expandedRows);

        if (newExpandedRows.has(staff.EmpRefNo)) {
            newExpandedRows.delete(staff.EmpRefNo);
            setExpandedRows(newExpandedRows);
            return;
        }

        setLoadingRow(staff.EmpRefNo);
        try {
            await dispatch(fetchStaffDetailsByRefNo({ empRefNo: staff.EmpRefNo, roleId })).unwrap();
            newExpandedRows.add(staff.EmpRefNo);
            setExpandedRows(newExpandedRows);
        } catch (error) {
            console.error('❌ Error fetching staff details:', error);
            toast.error('Failed to load staff details');
        } finally {
            setLoadingRow(null);
        }
    };

    // Document handling functions
    const getDocumentUrl = (document) => {
        if (!document) return null;

        const base64Data = document.PDFBaseData || document.DocBinaryData;
        if (!base64Data) {
            console.error('No document data found');
            return null;
        }

        if (base64Data.startsWith('http')) {
            return base64Data;
        }

        try {
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);

            let mimeType = 'application/octet-stream';
            if (document.FileType) {
                const fileType = document.FileType.toUpperCase();
                switch (fileType) {
                    case 'PDF':
                        mimeType = 'application/pdf';
                        break;
                    case 'IMAGE':
                    case 'JPG':
                    case 'JPEG':
                        mimeType = 'image/jpeg';
                        break;
                    case 'PNG':
                        mimeType = 'image/png';
                        break;
                    case 'GIF':
                        mimeType = 'image/gif';
                        break;
                    default:
                        mimeType = 'application/octet-stream';
                }
            }

            const blob = new Blob([byteArray], { type: mimeType });
            return URL.createObjectURL(blob);
        } catch (error) {
            console.error('Error creating document URL:', error);
            return null;
        }
    };

    const handleDocumentView = (document) => {
        console.log('📄 Opening document:', document.DocName);
        const base64Data = document.PDFBaseData || document.DocBinaryData;
        if (!base64Data) {
            toast.error('Document data not available');
            return;
        }
        setSelectedDocument(document);
        setShowDocumentModal(true);
    };

    // Handle Excel download
    const handleExcelDownload = () => {
        try {
            const data = Array.isArray(staffList?.Data) ? staffList.Data : staffList || [];
            if (!Array.isArray(data) || data.length === 0) {
                toast.warning('No data available to download');
                return;
            }

            const excelData = data.map(item => ({
                'Employee Code': item.EmpRefNo || '-',
                'Full Name': [item.FirstName, item.MiddleName, item.LastName].filter(Boolean).join(' ') || '-',
                'Designation': item.DesignatedAs || '-',
                'Department': item.Department || '-',
                'Category': item.Category || '-',
                'Joining Date': item.JoiningDate || '-',
                'Job Type': item.JobType || '-',
                'Status': item.Status || '-'
            }));

            const filename = `Staff_Report_${new Date().toISOString().split('T')[0]}`;
            downloadAsExcel(excelData, filename);
        } catch (error) {
            console.error('❌ Excel Download Error:', error);
            toast.error('Excel download failed. Please try again.');
        }
    };

    // Get staff data for display
    const staffData = Array.isArray(staffList?.Data) ? staffList.Data : staffList || [];

    // Filter staff data based on search
    const filteredStaffData = staffData.filter(staff => {
        const fullName = [staff.FirstName, staff.MiddleName, staff.LastName].filter(Boolean).join(' ').toLowerCase();
        const searchLower = searchQuery.toLowerCase();
        return (
            fullName.includes(searchLower) ||
            staff.EmpRefNo?.toLowerCase().includes(searchLower) ||
            staff.Department?.toLowerCase().includes(searchLower) ||
            staff.DesignatedAs?.toLowerCase().includes(searchLower) ||
            staff.Category?.toLowerCase().includes(searchLower)
        );
    });

    // Calculate stats
    const totalStaff = staffData.length;
    const departments = [...new Set(staffData.map(s => s.Department).filter(Boolean))].length;
    const categories = [...new Set(staffData.map(s => s.Category).filter(Boolean))].length;
    const activeStaff = staffData.filter(s => s.Status === 'Active').length;

    return (
        <div className="space-y-6 p-6">
            {/* Page Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <Users className="h-8 w-8 text-purple-600" />
                            Staff Report
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            View comprehensive staff information with expandable details
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="px-4 py-2 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900 text-purple-800 dark:text-purple-200 text-sm rounded-full transition-colors">
                            HR Reports
                        </div>
                        {staffListLoading && (
                            <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400">
                                <RotateCcw className="w-4 h-4 animate-spin" />
                                <span className="text-sm">Loading...</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Breadcrumb */}
                <nav className="text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-2">
                        <span>Dashboard</span>
                        <ChevronRight className="w-4 h-4" />
                        <span>HR Reports</span>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-gray-900 dark:text-white">Staff Report</span>
                    </div>
                </nav>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200 dark:border-purple-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">Total Staff</p>
                            <p className="text-2xl font-bold text-purple-900 dark:text-white">{totalStaff}</p>
                        </div>
                        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-3 rounded-lg">
                            <Users className="h-6 w-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">Departments</p>
                            <p className="text-2xl font-bold text-blue-900 dark:text-white">{departments}</p>
                        </div>
                        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-3 rounded-lg">
                            <Building2 className="h-6 w-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 border border-green-200 dark:border-green-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1">Categories</p>
                            <p className="text-2xl font-bold text-green-900 dark:text-white">{categories}</p>
                        </div>
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-lg">
                            <Award className="h-6 w-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-xl p-4 border border-indigo-200 dark:border-indigo-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">Active Staff</p>
                            <p className="text-2xl font-bold text-indigo-900 dark:text-white">{activeStaff}</p>
                        </div>
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-3 rounded-lg">
                            <Activity className="h-6 w-6 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Search */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Search Staff
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name, employee code, department..."
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white transition-colors"
                            />
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex gap-3">
                        <button
                            onClick={handleGenerateReport}
                            disabled={isAnyLoading || !roleId}
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            {staffListLoading ? (
                                <RotateCcw className="h-5 w-5 animate-spin" />
                            ) : (
                                <Eye className="h-5 w-5" />
                            )}
                            Generate Report
                        </button>
                        <button
                            onClick={handleReset}
                            className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            <RotateCcw className="h-5 w-5" />
                            Reset
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Export:</span>

                        <Tooltip content="Download staff report as Excel file">
                            <button
                                onClick={handleExcelDownload}
                                disabled={!Array.isArray(filteredStaffData) || filteredStaffData.length === 0}
                                className="px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                <Download className="h-5 w-5" />
                                Excel
                            </button>
                        </Tooltip>
                    </div>
                </div>
            </div>

            {/* Staff Table with Expandable Rows */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
                {Array.isArray(filteredStaffData) && filteredStaffData.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gradient-to-r from-purple-600 to-indigo-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider w-12"></th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Employee Code</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Full Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Designation</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Department</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Joining Date</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredStaffData.map((staff, index) => (
                                    <React.Fragment key={index}>
                                        <tr
                                            className={clsx(
                                                'transition-colors',
                                                loadingRow === staff.EmpRefNo
                                                    ? 'bg-purple-50 dark:bg-purple-900/20 cursor-wait'
                                                    : loadingRow
                                                        ? 'opacity-50 cursor-not-allowed'
                                                        : 'hover:bg-purple-50 dark:hover:bg-purple-900/10 cursor-pointer'
                                            )}
                                            onClick={() => handleRowToggle(staff)}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {loadingRow === staff.EmpRefNo ? (
                                                    <RotateCcw className="h-5 w-5 text-purple-500 animate-spin" />
                                                ) : expandedRows.has(staff.EmpRefNo) ? (
                                                    <ChevronDown className="h-5 w-5 text-purple-600" />
                                                ) : (
                                                    <ChevronRight className="h-5 w-5 text-gray-400" />
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-600 dark:text-purple-400">
                                                {staff.EmpRefNo || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                                {[staff.FirstName, staff.MiddleName, staff.LastName].filter(Boolean).join(' ') || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                {staff.DesignatedAs || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                {staff.Department || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                                                    {staff.Category || '-'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                {staff.JoiningDate || '-'}
                                            </td>
                                        </tr>
                                        {expandedRows.has(staff.EmpRefNo) && (
                                            <tr>
                                                <td colSpan="7" className="px-0 py-0">
                                                    <StaffDetailsExpanded
                                                        staffData={staffDetails?.Data || staffDetails}
                                                        loading={staffDetailsLoading}
                                                        onDocumentView={handleDocumentView}
                                                    />
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <>
                        {/* Empty State */}
                        {!staffListLoading && (
                            <div className="p-12 text-center">
                                <div className="flex flex-col items-center">
                                    <div className="bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900 rounded-full p-4 mb-4">
                                        <Search className="h-12 w-12 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Staff Data Found</h3>
                                    <p className="text-gray-600 dark:text-gray-400 max-w-md">
                                        Click "Generate Report" to load staff data. Click on any row to expand and view detailed information.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Loading State */}
                        {staffListLoading && (
                            <div className="p-12 text-center">
                                <div className="flex flex-col items-center">
                                    <div className="bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900 rounded-full p-4 mb-4">
                                        <RotateCcw className="h-12 w-12 text-purple-500 animate-spin" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Loading Staff Data</h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Fetching staff information...
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Attachment Modal */}
            {showDocumentModal && selectedDocument && (
                <AttachmentModal
                    isOpen={showDocumentModal}
                    onClose={() => {
                        setShowDocumentModal(false);
                        setSelectedDocument(null);
                    }}
                    fileUrl={getDocumentUrl(selectedDocument)}
                    fileName={`${selectedDocument.DocName}.${selectedDocument.FileType?.toLowerCase() || 'pdf'}`}
                    title={selectedDocument.DocName}
                    subtitle={`Document Type: ${selectedDocument.FileType}`}
                    theme="purple"
                    isImageFile={(url) => {
                        return selectedDocument.FileType?.toLowerCase() === 'image' ||
                            selectedDocument.FileType?.toLowerCase() === 'jpg' ||
                            selectedDocument.FileType?.toLowerCase() === 'jpeg' ||
                            selectedDocument.FileType?.toLowerCase() === 'png';
                    }}
                    isPdfFile={(url) => {
                        return selectedDocument.FileType?.toLowerCase() === 'pdf';
                    }}
                    onError={() => {
                        toast.error('Failed to load document');
                    }}
                />
            )}

            {/* Information Note */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                    <Info className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                    <div className="text-purple-800 dark:text-purple-200 text-sm">
                        <p className="font-semibold mb-1">Staff Report Features:</p>
                        <p className="text-gray-600 dark:text-purple-200">
                            1. <strong>Expandable Rows:</strong> Click on any staff row to expand and view comprehensive details<br />
                            2. <strong>Search Functionality:</strong> Search by name, employee code, department, or designation<br />
                            3. <strong>Document Viewing:</strong> View employee documents in a popup modal<br />
                            4. <strong>Comprehensive Details:</strong> Personal info, contact details, employment, bank, qualifications, experience, salary, and more<br />
                            5. <strong>Export Capability:</strong> Download staff data as Excel for offline analysis<br />
                            6. <strong>Real-time Statistics:</strong> Track total staff, departments, categories, and active employees<br />
                            7. <strong>Role-based Access:</strong> Data filtered based on your role permissions
                        </p>
                    </div>
                </div>
            </div>

            {/* Error Display */}
            {staffListError && (
                <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-center">
                        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
                        <span className="text-red-800 dark:text-red-200 text-sm">
                            {staffListError}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffReportPage;