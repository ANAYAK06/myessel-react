import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    User, Phone, Mail, MapPin, Calendar, FileText,
    CheckCircle, XCircle, Clock, AlertCircle, Download, Eye,
    Building2, IdCard, Users, Award, Briefcase, GraduationCap,
    DollarSign, Globe, Zap, Target, CreditCard, FileCheck
} from 'lucide-react';

// ✅ REUSABLE COMPONENT IMPORTS
import InboxHeader from '../../components/Inbox/InboxHeader';
import StatsCards from '../../components/Inbox/StatsCards';
import ActionButtons from '../../components/Inbox/ActionButtons';
import LeftPanel from '../../components/Inbox/LeftPanel';
import VerificationInput from '../../components/Inbox/VerificationInput';
import AttachmentModal from '../../components/Inbox/AttachmentModal';

// ✅ STAFF REGISTRATION SLICE IMPORTS
import {
    fetchVerificationStaff,
    fetchVerificationStaffDataById,
    approveStaffRegistration,
    fetchEmployeeDocuments,
    selectVerificationStaffArray,
    selectVerificationStaffData,
    selectEmployeeDocuments,
    selectVerificationStaffLoading,
    selectVerificationStaffDataLoading,
    selectApproveStaffRegistrationLoading,
    selectEmployeeDocumentsLoading,
    selectVerificationStaffError,
    selectEmployeeDocumentsError,
    setSelectedRoleId,
    setSelectedEmpRefNo,
    resetVerificationStaffData,
    resetStaffRegistrationData
} from '../../slices/HRSlice/staffRegistrationSlice';

// ✅ APPROVAL SLICE IMPORTS
import {
    fetchStatusList,
    selectEnabledActions,
    selectHasActions,
    selectStatusListLoading,
    selectStatusListError,
    resetApprovalData,
    setShowReturnButton
} from '../../slices/CommonSlice/getStatusSlice';

const VerifyStaffRegistration = ({ notificationData, onNavigate }) => {
    const dispatch = useDispatch();

    // ✅ SELECTORS
    const verificationStaff = useSelector(selectVerificationStaffArray);
    const selectedStaffData = useSelector(selectVerificationStaffData);
    const staffLoading = useSelector(selectVerificationStaffLoading);
    const staffDataLoading = useSelector(selectVerificationStaffDataLoading);
    const approvalLoading = useSelector(selectApproveStaffRegistrationLoading);
    const staffError = useSelector(selectVerificationStaffError);
    const employeeDocuments = useSelector(selectEmployeeDocuments);
    const documentsLoading = useSelector(selectEmployeeDocumentsLoading);
    const documentsError = useSelector(selectEmployeeDocumentsError);

    const statusLoading = useSelector(selectStatusListLoading);
    const statusError = useSelector(selectStatusListError);
    const enabledActions = useSelector(selectEnabledActions);
    const hasActions = useSelector(selectHasActions);

    const { userData } = useSelector((state) => state.auth);
    const roleId = userData?.roleId || userData?.RID;
    const uid = userData?.UID || userData?.uid;

    // ✅ LOCAL STATE
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [isVerified, setIsVerified] = useState(false);
    const [verificationComment, setVerificationComment] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('All');
    const [filterCategory, setFilterCategory] = useState('All');
    const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
    const [isLeftPanelHovered, setIsLeftPanelHovered] = useState(false);

    const [showDocumentModal, setShowDocumentModal] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);

    const { InboxTitle, ModuleDisplayName } = notificationData || {};

    // ✅ HELPER FUNCTIONS
    const getFullName = (staff) => {
        if (!staff) return 'Unknown';
        const parts = [staff.FirstName, staff.MiddleName, staff.LastName].filter(Boolean);
        return parts.length > 0 ? parts.join(' ') : 'Unknown';
    };

    const getPriority = (staff) => {
        if (!staff) return 'Low';
        const category = staff.Category?.toLowerCase() || '';
        const joiningDate = staff.JoiningDate ? new Date(staff.JoiningDate) : new Date();
        const today = new Date();
        const daysUntilJoining = Math.ceil((joiningDate - today) / (1000 * 60 * 60 * 24));

        if (category.includes('management') || daysUntilJoining <= 7) return 'High';
        if (category.includes('contract') || daysUntilJoining <= 15) return 'Medium';
        return 'Low';
    };

    const getCurrentUser = () => {
        return userData?.userName || userData?.UID || 'system';
    };

    const getCurrentRoleName = () => {
        return userData?.roleName || notificationData?.InboxTitle || 'Staff Registration Verifier';
    };

    const formatApprovalComment = (roleName, userName, comment) => {
        return `${roleName} : ${userName} : ${comment}`;
    };

    const updateRemarksHistory = (existingRemarks, newRoleName, newUserName, newComment) => {
        const formattedNewComment = formatApprovalComment(newRoleName, newUserName, newComment);
        if (!existingRemarks || existingRemarks.trim() === '') {
            return formattedNewComment;
        }
        return `${existingRemarks.trim()}||${formattedNewComment}`;
    };

    const formatArrayForSP = (array) => {
        if (!array || !Array.isArray(array) || array.length === 0) return '';
        return array.filter(item => item && item.toString().trim() !== '').join(',') + ',';
    };

    const ensureNotNull = (value, fallback = '') => {
        return (value === null || value === undefined) ? fallback : value;
    };

    // ✅ INITIALIZE
    useEffect(() => {
        if (roleId) {
            console.log('🎯 Initializing Staff Registration Verification with RoleID:', roleId);
            dispatch(setSelectedRoleId(roleId));
            dispatch(fetchVerificationStaff(roleId));
        }
    }, [roleId, dispatch]);

    useEffect(() => {
        dispatch(setShowReturnButton('No')); // Hide return button for staff registration
        return () => {
            dispatch(resetStaffRegistrationData());
            dispatch(resetApprovalData());
        };
    }, [dispatch]);

    // ✅ FETCH STATUS LIST
    useEffect(() => {
        if (selectedStaffData?.MOID && roleId) {
            console.log('📊 Fetching Status List for MOID:', selectedStaffData.MOID);
            dispatch(fetchStatusList({
                MOID: selectedStaffData.MOID,
                ROID: roleId,
                ChkAmt: 0
            }));
        }
    }, [selectedStaffData?.MOID, roleId, dispatch]);

    // ✅ COLLAPSE PANEL WHEN ITEM SELECTED
    useEffect(() => {
        if (selectedStaff) {
            setIsLeftPanelCollapsed(true);
        }
    }, [selectedStaff]);

    // ✅ EVENT HANDLERS
    const handleBackToInbox = () => {
        if (onNavigate) {
            onNavigate('dashboard', { name: 'Dashboard', type: 'dashboard' });
        }
    };

    const handleRefresh = () => {
        if (roleId) {
            console.log('🔄 Refreshing Staff Registration list');
            dispatch(fetchVerificationStaff(roleId));
            if (selectedStaff?.EmpRefNo) {
                dispatch(fetchVerificationStaffDataById({
                    empRefNo: selectedStaff.EmpRefNo,
                    roleId: roleId
                }));
            }
        }
    };

    const handleItemSelect = async (staff) => {
        console.log('✅ Selected Staff:', staff);
        setSelectedStaff(staff);
        dispatch(setSelectedEmpRefNo(staff.EmpRefNo));

        const params = {
            empRefNo: staff.EmpRefNo,
            roleId: roleId
        };
        dispatch(fetchVerificationStaffDataById(params));
        dispatch(fetchEmployeeDocuments(staff.EmpRefNo));

        // Reset verification state
        setIsVerified(false);
        setVerificationComment('');
    };

    // ✅ BUILD APPROVAL PAYLOAD
    const buildApprovalPayload = (actionValue) => {
        const currentUser = getCurrentUser();
        const currentRoleName = getCurrentRoleName();

        const updatedRemarks = updateRemarksHistory(
            selectedStaffData?.ApprovalNote || '',
            currentRoleName,
            currentUser,
            verificationComment.trim()
        );

        // ✅ For Reject - minimal payload
        if (actionValue === 'Reject') {
            return {
                EmpRefNo: selectedStaff.EmpRefNo,
                RoleId: roleId,
                Createdby: currentUser,
                Action: actionValue,
                ApprovalNote: verificationComment.trim()
            };
        }

        // ✅ For Verify/Approve - complete payload
        const emailValue = selectedStaffData?.WorkEmail || selectedStaffData?.MailId ||
            `${selectedStaffData?.FirstName?.toLowerCase()}.${selectedStaff?.EmpRefNo}@company.com`;

        const payload = {
            // Core fields
            EmpRefNo: selectedStaff.EmpRefNo,
            RoleId: roleId,
            Createdby: currentUser,
            Action: actionValue,
            ApprovalNote: verificationComment.trim(),

            // Basic info
            JoiningType: ensureNotNull(selectedStaffData?.JoiningType, 'New'),
            Category: ensureNotNull(selectedStaffData?.Category, 'Staff'),
            Appointmenttype: ensureNotNull(selectedStaffData?.Appointmenttype, 'Normal'),
            FirstName: ensureNotNull(selectedStaffData?.FirstName),
            LastName: ensureNotNull(selectedStaffData?.LastName),
            MiddleName: ensureNotNull(selectedStaffData?.MiddleName),

            // Personal details
            DateofBirth: ensureNotNull(selectedStaffData?.DateofBirth),
            EmpAge: ensureNotNull(selectedStaffData?.EmpAge, '25'),
            Gender: ensureNotNull(selectedStaffData?.Gender, 'Male'),
            MartialStatus: ensureNotNull(selectedStaffData?.MartialStatus, 'Single'),
            DateofMarriage: ensureNotNull(selectedStaffData?.DateofMarriage),

            // Nominee
            NomineeName: ensureNotNull(selectedStaffData?.NomineeName),
            NomineeRelation: ensureNotNull(selectedStaffData?.NomineeRelation),
            NomineeDateofBirth: ensureNotNull(selectedStaffData?.NomineeDateofBirth),
            NomineeAge: ensureNotNull(selectedStaffData?.NomineeAge, '0'),

            // Contact
            WorkEmail: emailValue,
            ContactWorkPhone: ensureNotNull(selectedStaffData?.ContactWorkPhone),
            ContactMobile: ensureNotNull(selectedStaffData?.ContactMobile),
            PlaceofBirth: ensureNotNull(selectedStaffData?.PlaceofBirth),
            PermanentAddress: ensureNotNull(selectedStaffData?.PermanentAddress),
            PresentAddress: ensureNotNull(selectedStaffData?.PresentAddress),

            // Employment
            Experience: ensureNotNull(selectedStaffData?.Experience, 'Fresher'),
            DesignationId: ensureNotNull(selectedStaffData?.DesignationId, 1),
            JoiningDate: ensureNotNull(selectedStaffData?.JoiningDate),
            JobType: ensureNotNull(selectedStaffData?.JobType, 'Permanent'),
            JoiningCostCenter: ensureNotNull(selectedStaffData?.JoiningCostCenter),
            TransitDay: ensureNotNull(selectedStaffData?.TransitDay, 0),
            ReportTo: ensureNotNull(selectedStaffData?.ReportTo),
            DepartmentId: ensureNotNull(selectedStaffData?.DepartmentId, 1),

            // Bank
            BankName: ensureNotNull(selectedStaffData?.BankName),
            BankAccountNo: ensureNotNull(selectedStaffData?.BankAccountNo),
            IFSCcode: ensureNotNull(selectedStaffData?.IFSCcode),
            BankAddress: ensureNotNull(selectedStaffData?.BankAddress),

            // Arrays - Family Members
            FMName: formatArrayForSP(selectedStaffData?.FamilyMemberData?.map(fm => fm.FMName)),
            FMDateofBirth: formatArrayForSP(selectedStaffData?.FamilyMemberData?.map(fm => fm.FMDateofBirth)),
            FMAge: formatArrayForSP(selectedStaffData?.FamilyMemberData?.map(fm => fm.FMAge)),
            FMGender: formatArrayForSP(selectedStaffData?.FamilyMemberData?.map(fm => fm.FMGender)),
            FMRelation: formatArrayForSP(selectedStaffData?.FamilyMemberData?.map(fm => fm.FMRelation)),
            FMMobileNo: formatArrayForSP(selectedStaffData?.FamilyMemberData?.map(fm => fm.FMMobileNo)),

            // Arrays - Children
            ChildName: formatArrayForSP(selectedStaffData?.ChildrensData?.map(child => child.ChildName)),
            ChildDateofBirth: formatArrayForSP(selectedStaffData?.ChildrensData?.map(child => child.ChildDateofBirth)),
            ChildAge: formatArrayForSP(selectedStaffData?.ChildrensData?.map(child => child.ChildAge)),
            ChildGender: formatArrayForSP(selectedStaffData?.ChildrensData?.map(child => child.ChildGender)),
            ChildMaritalStatus: formatArrayForSP(selectedStaffData?.ChildrensData?.map(child => child.ChildMaritalStatus)),

            // Arrays - Academic
            AcademicClass: formatArrayForSP(selectedStaffData?.AcademicQualificationData?.map(aq => aq.AcademicClass)),
            NameofUniversity: formatArrayForSP(selectedStaffData?.AcademicQualificationData?.map(aq => aq.NameofUniversity)),
            FromYear: formatArrayForSP(selectedStaffData?.AcademicQualificationData?.map(aq => aq.FromYear)),
            ToYear: formatArrayForSP(selectedStaffData?.AcademicQualificationData?.map(aq => aq.ToYear)),
            Percentage: formatArrayForSP(selectedStaffData?.AcademicQualificationData?.map(aq => aq.Percentage)),

            // Arrays - Technical
            TechnicalSkill: formatArrayForSP(selectedStaffData?.TechnicalData?.map(tech => tech.TechnicalSkill)),
            TechInstitutionName: formatArrayForSP(selectedStaffData?.TechnicalData?.map(tech => tech.TechInstitutionName)),
            TechFromYear: formatArrayForSP(selectedStaffData?.TechnicalData?.map(tech => tech.TechFromYear)),
            TechToYear: formatArrayForSP(selectedStaffData?.TechnicalData?.map(tech => tech.TechToYear)),
            TechPercentage: formatArrayForSP(selectedStaffData?.TechnicalData?.map(tech => tech.TechPercentage)),

            // Arrays - Experience
            OrganisationName: formatArrayForSP(selectedStaffData?.ExperienceData?.map(exp => exp.OrganisationName)),
            ExpFromYear: formatArrayForSP(selectedStaffData?.ExperienceData?.map(exp => exp.ExpFromYear)),
            ExpToYear: formatArrayForSP(selectedStaffData?.ExperienceData?.map(exp => exp.ExpToYear)),
            Role: formatArrayForSP(selectedStaffData?.ExperienceData?.map(exp => exp.Role)),
            Mobilenos: formatArrayForSP(selectedStaffData?.ExperienceData?.map(exp => exp.Mobilenos)),

            // Government IDs
            UANExist: ensureNotNull(selectedStaffData?.UANExist, false),
            UANNumber: ensureNotNull(selectedStaffData?.UANNumber),
            ESINumber: ensureNotNull(selectedStaffData?.ESINumber),
            UserName: ensureNotNull(selectedStaffData?.UserName),
            Pwd: ensureNotNull(selectedStaffData?.Pwd, 'temp123'),
            AdharNo: ensureNotNull(selectedStaffData?.AdharNo),
            PanNo: ensureNotNull(selectedStaffData?.PanNo),
            ReportToRoleId: ensureNotNull(selectedStaffData?.ReportToRoleId, 0),
            PFExist: ensureNotNull(selectedStaffData?.PFExist, 'No'),
            ESIExist: ensureNotNull(selectedStaffData?.ESIExist, 'No'),
            GroupId: ensureNotNull(selectedStaffData?.GroupId, 1),
            Probationdays: ensureNotNull(selectedStaffData?.Probationdays, 90),
            ContractStartDate: ensureNotNull(selectedStaffData?.ContractStartDate),
            ContractEndDate: ensureNotNull(selectedStaffData?.ContractEndDate),

            // Arrays - References
            RefName: formatArrayForSP(selectedStaffData?.EmpReferenceData?.map(ref => ref.RefName)),
            RefRelation: formatArrayForSP(selectedStaffData?.EmpReferenceData?.map(ref => ref.RefRelation)),
            RefMobileNo: formatArrayForSP(selectedStaffData?.EmpReferenceData?.map(ref => ref.RefMobileNo)),
            RefRemarks: formatArrayForSP(selectedStaffData?.EmpReferenceData?.map(ref => ref.RefRemarks)),

            // Additional
            ExpRemarks: ensureNotNull(selectedStaffData?.ExpRemarks),
            ExpContactNames: ensureNotNull(selectedStaffData?.ExpContactNames),

            // Documents
            DocumentData: employeeDocuments || []
        };

        console.log('📤 Staff Registration Approval Payload:', payload);
        return payload;
    };

    const handleActionClick = async (action) => {
        if (!selectedStaff) {
            toast.error('No staff registration selected');
            return;
        }

        if (!verificationComment || verificationComment.trim() === '') {
            toast.error('Verification comment is mandatory. Please add your comments before proceeding.');
            return;
        }

        if (!isVerified) {
            toast.error('Please verify the staff registration details by checking the verification checkbox.');
            return;
        }

        let actionValue = action.value || action.text || action.type;

        if (!actionValue || actionValue.trim() === '') {
            const typeToValueMap = {
                'approve': 'Approve',
                'verify': 'Verify',
                'reject': 'Reject'
            };
            actionValue = typeToValueMap[action.type?.toLowerCase()] || 'Verify';
        }

        try {
            const payload = buildApprovalPayload(actionValue);

            const result = await dispatch(approveStaffRegistration(payload)).unwrap();

            if (result && typeof result === 'string') {
                if (result.includes('$')) {
                    const [status, additionalInfo] = result.split('$');
                    toast.success(`${action.text || actionValue} completed successfully!`);
                    if (additionalInfo) {
                        setTimeout(() => {
                            toast.info(additionalInfo, { autoClose: 6000 });
                        }, 500);
                    }
                } else {
                    toast.success(result || `${action.text || actionValue} completed successfully!`);
                }
            } else {
                toast.success(`${action.text || actionValue} completed successfully!`);
            }

            setTimeout(() => {
                dispatch(fetchVerificationStaff(roleId));
                setSelectedStaff(null);
                setVerificationComment('');
                setIsVerified(false);
                setIsLeftPanelCollapsed(false);
                dispatch(resetVerificationStaffData());
                dispatch(resetApprovalData());
            }, 1000);

        } catch (error) {
            console.error('❌ Approval Error:', error);

            let errorMessage = `Failed to ${action.text?.toLowerCase() || actionValue.toLowerCase()}`;

            if (error && typeof error === 'string') {
                errorMessage = error;
            } else if (error?.message) {
                errorMessage = error.message;
            } else if (error?.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            toast.error(errorMessage, { autoClose: 10000 });
        }
    };

    // ✅ FILTER DATA
    const filteredStaff = verificationStaff.filter(staff => {
        const fullName = getFullName(staff).toLowerCase();
        const matchesSearch = fullName.includes(searchQuery.toLowerCase()) ||
            staff.EmpRefNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            staff.Department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            staff.DesignatedAs?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesDepartment = filterDepartment === 'All' || staff.Department === filterDepartment;
        const matchesCategory = filterCategory === 'All' || staff.Category === filterCategory;

        return matchesSearch && matchesDepartment && matchesCategory;
    });

    const departments = [...new Set(verificationStaff.map(s => s.Department).filter(Boolean))];
    const categories = [...new Set(verificationStaff.map(s => s.Category).filter(Boolean))];

    // ✅ STATS CARDS
    const statsCards = [
        {
            icon: FileText,
            value: verificationStaff.length,
            label: 'Total Applications',
            color: 'blue'
        },
        {
            icon: AlertCircle,
            value: verificationStaff.filter(s => getPriority(s) === 'High').length,
            label: 'High Priority',
            color: 'red'
        },
        {
            icon: Building2,
            value: departments.length,
            label: 'Departments',
            color: 'green'
        },
        {
            icon: Award,
            value: categories.length,
            label: 'Categories',
            color: 'purple'
        }
    ];

    // ✅ RENDER LEFT PANEL ITEM
    const renderItemCard = (staff, isSelected) => {
        const priority = getPriority(staff);
        const priorityColors = {
            'High': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200',
            'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200',
            'Low': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200'
        };

        return (
            <div className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-800/50 dark:to-purple-800/50 flex items-center justify-center">
                            <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                            {getFullName(staff)}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {staff.DesignatedAs}
                        </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full border ${priorityColors[priority]}`}>
                        {priority}
                    </span>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-1">
                            <Building2 className="w-3 h-3" />
                            <span className="truncate">{staff.Department}</span>
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-indigo-600 dark:text-indigo-400 font-medium">{staff.Category}</span>
                        <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded text-xs">{staff.EmpRefNo}</span>
                    </div>
                </div>
            </div>
        );
    };

    const renderCollapsedItem = (staff, isSelected) => (
        <div className="w-full h-full rounded-lg border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-800/50 dark:to-purple-800/50 flex items-center justify-center">
            <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        </div>
    );

    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200';
            case 'low': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-200';
        }
    };
    // Update the getDocumentUrl function to use PDFBaseData instead of DocBinaryData
    const getDocumentUrl = (document) => {
        if (!document) return null;

        // Priority 1: Check PDFBaseData (database stored base64)
        const base64Data = document.PDFBaseData || document.DocBinaryData;

        if (!base64Data) {
            console.error('No document data found in PDFBaseData or DocBinaryData');
            return null;
        }

        // If it's already a URL, return it
        if (base64Data.startsWith('http')) {
            return base64Data;
        }

        // Convert base64 to blob URL
        try {
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);

            // Determine MIME type based on FileType
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

    // Update handleDocumentView
    const handleDocumentView = (document) => {
        console.log('📄 Opening document:', document.DocName);

        // Check if document has data
        const base64Data = document.PDFBaseData || document.DocBinaryData;
        if (!base64Data) {
            toast.error('Document data not available');
            return;
        }

        setSelectedDocument(document);
        setShowDocumentModal(true);
    };

    // Update openDocumentInBrowser
    const openDocumentInBrowser = (document) => {
        const base64Data = document.PDFBaseData || document.DocBinaryData;

        if (!base64Data) {
            toast.error('Document data not available');
            return;
        }

        try {
            // Check if it's a URL or base64
            if (base64Data.startsWith('http')) {
                window.open(base64Data, '_blank');
                toast.success('Document opened in new tab');
            } else {
                // Convert base64 to blob and open
                const byteCharacters = atob(base64Data);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);

                // Determine MIME type
                let mimeType = 'application/pdf';
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
                        default:
                            mimeType = 'application/pdf';
                    }
                }

                const blob = new Blob([byteArray], { type: mimeType });
                const url = URL.createObjectURL(blob);
                window.open(url, '_blank');
                toast.success('Document opened in new tab');

                // Clean up after a delay
                setTimeout(() => URL.revokeObjectURL(url), 1000);
            }
        } catch (error) {
            console.error('Error opening document:', error);
            toast.error('Error opening document. The file may be corrupted.');
        }
    };

    // Update handleDocumentDownload
    const handleDocumentDownload = (document) => {
        const base64Data = document.PDFBaseData || document.DocBinaryData;

        if (!base64Data) {
            toast.error('Document data not available');
            return;
        }

        try {
            const fileName = `${document.DocName}.${document.FileType?.toLowerCase() || 'pdf'}`;

            if (base64Data.startsWith('http')) {
                // Direct URL download
                const link = document.createElement('a');
                link.href = base64Data;
                link.download = fileName;
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.success(`Document "${fileName}" download started`);
            } else {
                // Base64 download
                const byteCharacters = atob(base64Data);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);

                // Determine MIME type
                let mimeType = 'application/pdf';
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
                        default:
                            mimeType = 'application/pdf';
                    }
                }

                const blob = new Blob([byteArray], { type: mimeType });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                toast.success(`Document "${fileName}" downloaded successfully`);
            }
        } catch (error) {
            console.error('Error downloading document:', error);
            toast.error('Error downloading document. The file may be corrupted.');
        }
    };

    // ✅ RENDER DETAIL CONTENT (Keeping your existing detailed staff information display)
    const renderDetailContent = () => {
        if (!selectedStaff) return null;

        return (
            <div className="space-y-6">
                {staffDataLoading && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                        <div className="flex items-center space-x-3">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                            <span className="text-blue-700 dark:text-blue-400 text-sm">
                                Loading staff registration details...
                            </span>
                        </div>
                    </div>
                )}

                {selectedStaffData && (
                    <>
                        {/* CUSTOM HEADER */}
                        <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-indigo-900/20 p-6 rounded-2xl border-2 border-indigo-200 dark:border-indigo-700">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-4">
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                                            <User className="w-8 h-8 text-white" />
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-white dark:border-gray-800 flex items-center justify-center">
                                            <CheckCircle className="w-4 h-4 text-white" />
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                            {getFullName(selectedStaff)}
                                        </h2>
                                        <p className="text-indigo-600 dark:text-indigo-400 font-semibold mb-3">
                                            {selectedStaffData.DesignatedAs} • {selectedStaffData.Department}
                                        </p>

                                        <div className="flex flex-wrap gap-2">
                                            <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                                                {selectedStaffData.EmpRefNo}
                                            </span>
                                            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                                                {selectedStaffData.Category}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriority(selectedStaff) === 'High' ? 'bg-red-100 text-red-800 border-red-200' :
                                                getPriority(selectedStaff) === 'Medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                                    'bg-green-100 text-green-800 border-green-200'
                                                }`}>
                                                {getPriority(selectedStaff)} Priority
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-indigo-200 dark:border-indigo-700">
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">MOID</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                                        {selectedStaffData.MOID}
                                    </p>
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Joining Date</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                                        {selectedStaffData.JoiningDate}
                                    </p>
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Job Type</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                                        {selectedStaffData.JobType}
                                    </p>
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Experience</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                                        {selectedStaffData.Experience}
                                    </p>
                                </div>
                            </div>
                        </div>


                        {selectedStaffData && (
                            <>
                                {/* Staff Photo and Basic Info */}


                                {/* Information Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Personal Information */}
                                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 p-5 rounded-xl border border-indigo-200 dark:border-indigo-700">
                                        <h4 className="font-semibold text-indigo-800 dark:text-indigo-300 mb-4 flex items-center">
                                            <User className="w-5 h-5 mr-2" />
                                            Personal Information
                                        </h4>
                                        <div className="space-y-3 text-sm">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <span className="text-indigo-600 dark:text-indigo-400 block text-xs">Full Name</span>
                                                    <span className="font-medium text-gray-800 dark:text-gray-200">{selectedStaffData.FirstName} {selectedStaffData.MiddleName} {selectedStaffData.LastName}</span>
                                                </div>
                                                <div>
                                                    <span className="text-indigo-600 dark:text-indigo-400 block text-xs">Age</span>
                                                    <span className="font-medium text-gray-800 dark:text-gray-200">{selectedStaffData.EmpAge} years</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <span className="text-indigo-600 dark:text-indigo-400 block text-xs  items-center">
                                                        <Calendar className="w-3 h-3 mr-1" />
                                                        Date of Birth
                                                    </span>
                                                    <span className="font-medium text-gray-800 dark:text-gray-200">{selectedStaffData.DateofBirth}</span>
                                                </div>
                                                <div>
                                                    <span className="text-indigo-600 dark:text-indigo-400 block text-xs">Gender</span>
                                                    <span className="font-medium text-gray-800 dark:text-gray-200">{selectedStaffData.Gender}</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <span className="text-indigo-600 dark:text-indigo-400 block text-xs">Marital Status</span>
                                                    <span className="font-medium text-gray-800 dark:text-gray-200">{selectedStaffData.MartialStatus}</span>
                                                </div>
                                                {selectedStaffData.DateofMarriage && (
                                                    <div>
                                                        <span className="text-indigo-600 dark:text-indigo-400 block text-xs">Marriage Date</span>
                                                        <span className="font-medium text-gray-800 dark:text-gray-200">{selectedStaffData.DateofMarriage}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <span className="text-indigo-600 dark:text-indigo-400 block text-xs">Place of Birth</span>
                                                    <span className="font-medium text-gray-800 dark:text-gray-200">{selectedStaffData.PlaceofBirth}</span>
                                                </div>
                                                <div>
                                                    <span className="text-indigo-600 dark:text-indigo-400 block text-xs  items-center">
                                                        <Phone className="w-3 h-3 mr-1" />
                                                        Mobile
                                                    </span>
                                                    <span className="font-medium text-gray-800 dark:text-gray-200">{selectedStaffData.ContactMobile}</span>
                                                </div>
                                            </div>

                                            {selectedStaffData.ContactWorkPhone && (
                                                <div>
                                                    <span className="text-indigo-600 dark:text-indigo-400 block text-xs">Work Phone</span>
                                                    <span className="font-medium text-gray-800 dark:text-gray-200">{selectedStaffData.ContactWorkPhone}</span>
                                                </div>
                                            )}

                                            {selectedStaffData.WorkEmail && (
                                                <div>
                                                    <span className="text-indigo-600 dark:text-indigo-400 block text-xs  items-center">
                                                        <Mail className="w-3 h-3 mr-1" />
                                                        Email
                                                    </span>
                                                    <span className="font-medium text-gray-800 dark:text-gray-200">{selectedStaffData.WorkEmail}</span>
                                                </div>
                                            )}

                                            {selectedStaffData.PermanentAddress && (
                                                <div>
                                                    <span className="text-indigo-600 dark:text-indigo-400 block text-xs items-center mb-1">
                                                        <MapPin className="w-3 h-3 mr-1" />
                                                        Permanent Address
                                                    </span>
                                                    <p className="font-medium text-gray-800 dark:text-gray-200 text-sm bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded">{selectedStaffData.PermanentAddress}</p>
                                                </div>
                                            )}

                                            {selectedStaffData.PresentAddress && (
                                                <div>
                                                    <span className="text-indigo-600 dark:text-indigo-400 block text-xs items-center mb-1">
                                                        <MapPin className="w-3 h-3 mr-1" />
                                                        Present Address
                                                    </span>
                                                    <p className="font-medium text-gray-800 dark:text-gray-200 text-sm bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded">{selectedStaffData.PresentAddress}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Government IDs & Documents */}
                                    <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-5 rounded-xl border border-red-200 dark:border-red-700">
                                        <h4 className="font-semibold text-red-800 dark:text-red-300 mb-4 flex items-center">
                                            <IdCard className="w-5 h-5 mr-2" />
                                            Government IDs & Documents
                                        </h4>
                                        <div className="space-y-3 text-sm">
                                            {selectedStaffData.AdharNo && (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-red-600 dark:text-red-400">Aadhar Number</span>
                                                    <span className="font-medium text-gray-800 dark:text-gray-200 font-mono">{selectedStaffData.AdharNo}</span>
                                                </div>
                                            )}
                                            {selectedStaffData.PanNo && (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-red-600 dark:text-red-400">PAN Number</span>
                                                    <span className="font-medium text-gray-800 dark:text-gray-200 font-mono">{selectedStaffData.PanNo}</span>
                                                </div>
                                            )}
                                            {selectedStaffData.PFNumber && (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-red-600 dark:text-red-400">PF Number</span>
                                                    <span className="font-medium text-gray-800 dark:text-gray-200 font-mono">{selectedStaffData.PFNumber}</span>
                                                </div>
                                            )}
                                            {selectedStaffData.ESINumber && (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-red-600 dark:text-red-400">ESI Number</span>
                                                    <span className="font-medium text-gray-800 dark:text-gray-200 font-mono">{selectedStaffData.ESINumber}</span>
                                                </div>
                                            )}
                                            {selectedStaffData.UANNumber && (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-red-600 dark:text-red-400">UAN Number</span>
                                                    <span className="font-medium text-gray-800 dark:text-gray-200 font-mono">{selectedStaffData.UANNumber}</span>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-2 gap-4 mt-4">
                                                <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded">
                                                    <span className="text-red-600 dark:text-red-400 text-xs block">PF Status</span>
                                                    <span className={`font-medium text-sm ${selectedStaffData.PFExist === 'Yes' ? 'text-green-600' : 'text-red-600'}`}>
                                                        {selectedStaffData.PFExist === 'Yes' ? '✓ Eligible' : '✗ Not Eligible'}
                                                    </span>
                                                </div>
                                                <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded">
                                                    <span className="text-red-600 dark:text-red-400 text-xs block">ESI Status</span>
                                                    <span className={`font-medium text-sm ${selectedStaffData.ESIExist === 'Yes' ? 'text-green-600' : 'text-red-600'}`}>
                                                        {selectedStaffData.ESIExist === 'Yes' ? '✓ Eligible' : '✗ Not Eligible'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Employment Details */}
                                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-5 rounded-xl border border-green-200 dark:border-green-700">
                                        <h4 className="font-semibold text-green-800 dark:text-green-300 mb-4 flex items-center">
                                            <Briefcase className="w-5 h-5 mr-2" />
                                            Employment Details
                                        </h4>
                                        <div className="space-y-3 text-sm">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <span className="text-green-600 dark:text-green-400 block text-xs">Joining Type</span>
                                                    <span className="font-medium text-gray-800 dark:text-gray-200">{selectedStaffData.JoiningType}</span>
                                                </div>
                                                <div>
                                                    <span className="text-green-600 dark:text-green-400 block text-xs">Appointment Type</span>
                                                    <span className="font-medium text-gray-800 dark:text-gray-200">{selectedStaffData.Appointmenttype}</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <span className="text-green-600 dark:text-green-400 block text-xs">Joining Date</span>
                                                    <span className="font-medium text-gray-800 dark:text-gray-200">{selectedStaffData.JoiningDate}</span>
                                                </div>
                                                <div>
                                                    <span className="text-green-600 dark:text-green-400 block text-xs">Job Type</span>
                                                    <span className="font-medium text-gray-800 dark:text-gray-200">{selectedStaffData.JobType}</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <span className="text-green-600 dark:text-green-400 block text-xs">Experience</span>
                                                    <span className="font-medium text-gray-800 dark:text-gray-200">{selectedStaffData.Experience}</span>
                                                </div>
                                                <div>
                                                    <span className="text-green-600 dark:text-green-400 block text-xs">Transit Days</span>
                                                    <span className="font-medium text-gray-800 dark:text-gray-200">{selectedStaffData.TransitDay || 0}</span>
                                                </div>
                                            </div>

                                            {selectedStaffData.JoiningCCName && (
                                                <div>
                                                    <span className="text-green-600 dark:text-green-400 block text-xs">Cost Center</span>
                                                    <span className="font-medium text-gray-800 dark:text-gray-200">{selectedStaffData.JoiningCCName}</span>
                                                </div>
                                            )}

                                            {selectedStaffData.GroupName && (
                                                <div>
                                                    <span className="text-green-600 dark:text-green-400 block text-xs">Group</span>
                                                    <span className="font-medium text-gray-800 dark:text-gray-200">{selectedStaffData.GroupName}</span>
                                                </div>
                                            )}

                                            {selectedStaffData.ReportToName && (
                                                <div>
                                                    <span className="text-green-600 dark:text-green-400 block text-xs">Reports To</span>
                                                    <span className="font-medium text-gray-800 dark:text-gray-200">{selectedStaffData.ReportToName}</span>
                                                </div>
                                            )}

                                            {selectedStaffData.ReportToRole && (
                                                <div>
                                                    <span className="text-green-600 dark:text-green-400 block text-xs">Reporting Role</span>
                                                    <span className="font-medium text-gray-800 dark:text-gray-200">{selectedStaffData.ReportToRole}</span>
                                                </div>
                                            )}

                                            {(selectedStaffData.ContractStartDate || selectedStaffData.ContractEndDate) && (
                                                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded">
                                                    <span className="text-green-600 dark:text-green-400 text-xs block">Contract Period</span>
                                                    <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                                                        {selectedStaffData.ContractStartDate} to {selectedStaffData.ContractEndDate}
                                                    </p>
                                                </div>
                                            )}

                                            {selectedStaffData.Probationdays > 0 && (
                                                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded">
                                                    <span className="text-green-600 dark:text-green-400 text-xs block">Probation Period</span>
                                                    <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">{selectedStaffData.Probationdays} days</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Bank Details */}
                                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-5 rounded-xl border border-purple-200 dark:border-purple-700">
                                        <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-4 flex items-center">
                                            <CreditCard className="w-5 h-5 mr-2" />
                                            Bank Details
                                        </h4>
                                        <div className="space-y-3 text-sm">
                                            {selectedStaffData.BankAccountNo && (
                                                <div>
                                                    <span className="text-purple-600 dark:text-purple-400 block text-xs">Account Number</span>
                                                    <span className="font-medium text-gray-800 dark:text-gray-200 font-mono">{selectedStaffData.BankAccountNo}</span>
                                                </div>
                                            )}
                                            {selectedStaffData.BankName && (
                                                <div>
                                                    <span className="text-purple-600 dark:text-purple-400 block text-xs">Bank Name</span>
                                                    <span className="font-medium text-gray-800 dark:text-gray-200">{selectedStaffData.BankName}</span>
                                                </div>
                                            )}
                                            {selectedStaffData.IFSCcode && (
                                                <div>
                                                    <span className="text-purple-600 dark:text-purple-400 block text-xs">IFSC Code</span>
                                                    <span className="font-medium text-gray-800 dark:text-gray-200 font-mono">{selectedStaffData.IFSCcode}</span>
                                                </div>
                                            )}
                                            {selectedStaffData.BankAddress && (
                                                <div>
                                                    <span className="text-purple-600 dark:text-purple-400 block text-xs mb-1">Bank Address</span>
                                                    <p className="font-medium text-gray-800 dark:text-gray-200 text-sm bg-purple-100 dark:bg-purple-900/30 p-2 rounded whitespace-pre-line">{selectedStaffData.BankAddress}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Nominee Information */}
                                {(selectedStaffData.NomineeName || selectedStaffData.NomineeRelation) && (
                                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-5 rounded-xl border border-yellow-200 dark:border-yellow-700">
                                        <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-4 flex items-center">
                                            <Users className="w-5 h-5 mr-2" />
                                            Nominee Information
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                            {selectedStaffData.NomineeName && (
                                                <div>
                                                    <span className="text-yellow-600 dark:text-yellow-400 block text-xs">Nominee Name</span>
                                                    <span className="font-medium text-gray-800 dark:text-gray-200">{selectedStaffData.NomineeName}</span>
                                                </div>
                                            )}
                                            {selectedStaffData.NomineeRelation && (
                                                <div>
                                                    <span className="text-yellow-600 dark:text-yellow-400 block text-xs">Relation</span>
                                                    <span className="font-medium text-gray-800 dark:text-gray-200">{selectedStaffData.NomineeRelation}</span>
                                                </div>
                                            )}
                                            {selectedStaffData.NomineeDateofBirth && (
                                                <div>
                                                    <span className="text-yellow-600 dark:text-yellow-400 block text-xs">Date of Birth</span>
                                                    <span className="font-medium text-gray-800 dark:text-gray-200">{selectedStaffData.NomineeDateofBirth}</span>
                                                </div>
                                            )}
                                            {selectedStaffData.NomineeAge && (
                                                <div>
                                                    <span className="text-yellow-600 dark:text-yellow-400 block text-xs">Age</span>
                                                    <span className="font-medium text-gray-800 dark:text-gray-200">{selectedStaffData.NomineeAge} years</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Family Members */}
                                {selectedStaffData.FamilyMemberData && selectedStaffData.FamilyMemberData.length > 0 && (
                                    <div className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 p-5 rounded-xl border border-teal-200 dark:border-teal-700">
                                        <h4 className="font-semibold text-teal-800 dark:text-teal-300 mb-4 flex items-center">
                                            <Users className="w-5 h-5 mr-2" />
                                            Family Members ({selectedStaffData.FamilyMemberData.length})
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {selectedStaffData.FamilyMemberData.map((member, index) => (
                                                <div key={index} className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-teal-200 dark:border-teal-600">
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
                                                        {member.FMWork && (
                                                            <div className="text-xs text-gray-600 dark:text-gray-400">
                                                                Work: {member.FMWork}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Academic Qualifications */}
                                {selectedStaffData.AcademicQualificationData && selectedStaffData.AcademicQualificationData.length > 0 && (
                                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 p-5 rounded-xl border border-indigo-200 dark:border-indigo-700">
                                        <h4 className="font-semibold text-indigo-800 dark:text-indigo-300 mb-4 flex items-center">
                                            <GraduationCap className="w-5 h-5 mr-2" />
                                            Academic Qualifications ({selectedStaffData.AcademicQualificationData.length})
                                        </h4>
                                        <div className="space-y-3">
                                            {selectedStaffData.AcademicQualificationData.map((qualification, index) => (
                                                <div key={index} className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-indigo-200 dark:border-indigo-600">
                                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                                                        <div>
                                                            <span className="text-indigo-600 dark:text-indigo-400 block text-xs">Qualification</span>
                                                            <span className="font-medium text-gray-900 dark:text-white">{qualification.AcademicClass}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-indigo-600 dark:text-indigo-400 block text-xs">University/Board</span>
                                                            <span className="font-medium text-gray-800 dark:text-gray-200">{qualification.NameofUniversity}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-indigo-600 dark:text-indigo-400 block text-xs">Duration</span>
                                                            <span className="font-medium text-gray-800 dark:text-gray-200">{qualification.FromYear} - {qualification.ToYear}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-indigo-600 dark:text-indigo-400 block text-xs">Percentage</span>
                                                            <span className="font-medium text-green-600 dark:text-green-400">{qualification.Percentage}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Technical Skills */}
                                {selectedStaffData.TechnicalData && selectedStaffData.TechnicalData.length > 0 && (
                                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-5 rounded-xl border border-orange-200 dark:border-orange-700">
                                        <h4 className="font-semibold text-orange-800 dark:text-orange-300 mb-4 flex items-center">
                                            <Zap className="w-5 h-5 mr-2" />
                                            Technical Skills ({selectedStaffData.TechnicalData.length})
                                        </h4>
                                        <div className="space-y-3">
                                            {selectedStaffData.TechnicalData.map((tech, index) => (
                                                <div key={index} className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-orange-200 dark:border-orange-600">
                                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                                                        <div>
                                                            <span className="text-orange-600 dark:text-orange-400 block text-xs">Skill</span>
                                                            <span className="font-medium text-gray-900 dark:text-white">{tech.TechnicalSkill}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-orange-600 dark:text-orange-400 block text-xs">Institution</span>
                                                            <span className="font-medium text-gray-800 dark:text-gray-200">{tech.TechInstitutionName}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-orange-600 dark:text-orange-400 block text-xs">Duration</span>
                                                            <span className="font-medium text-gray-800 dark:text-gray-200">{tech.TechFromYear} - {tech.TechToYear}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-orange-600 dark:text-orange-400 block text-xs">Score</span>
                                                            <span className="font-medium text-green-600 dark:text-green-400">{tech.TechPercentage}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Work Experience */}
                                {selectedStaffData.ExperienceData && selectedStaffData.ExperienceData.length > 0 && (
                                    <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 p-5 rounded-xl border border-pink-200 dark:border-pink-700">
                                        <h4 className="font-semibold text-pink-800 dark:text-pink-300 mb-4 flex items-center">
                                            <Target className="w-5 h-5 mr-2" />
                                            Work Experience ({selectedStaffData.ExperienceData.length})
                                        </h4>
                                        <div className="space-y-3">
                                            {selectedStaffData.ExperienceData.map((exp, index) => (
                                                <div key={index} className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-pink-200 dark:border-pink-600">
                                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                                                        <div>
                                                            <span className="text-pink-600 dark:text-pink-400 block text-xs">Organization</span>
                                                            <span className="font-medium text-gray-900 dark:text-white">{exp.OrganisationName}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-pink-600 dark:text-pink-400 block text-xs">Role</span>
                                                            <span className="font-medium text-gray-800 dark:text-gray-200">{exp.Role}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-pink-600 dark:text-pink-400 block text-xs">Duration</span>
                                                            <span className="font-medium text-gray-800 dark:text-gray-200">{exp.ExpFromYear} - {exp.ExpToYear}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-pink-600 dark:text-pink-400 block text-xs">Experience</span>
                                                            <span className="font-medium text-green-600 dark:text-green-400">{exp.ExperienceYears} years</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* References */}
                                {selectedStaffData.EmpReferenceData && selectedStaffData.EmpReferenceData.length > 0 && (
                                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
                                        <h4 className="font-semibold text-gray-800 dark:text-gray-300 mb-4 flex items-center">
                                            <Users className="w-5 h-5 mr-2" />
                                            References ({selectedStaffData.EmpReferenceData.length})
                                        </h4>
                                        <div className="space-y-3">
                                            {selectedStaffData.EmpReferenceData.map((ref, index) => (
                                                <div key={index} className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                                        <div>
                                                            <span className="text-gray-600 dark:text-gray-400 block text-xs">Reference Name</span>
                                                            <span className="font-medium text-gray-900 dark:text-white">{ref.RefName}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-600 dark:text-gray-400 block text-xs">Relation</span>
                                                            <span className="font-medium text-gray-800 dark:text-gray-200">{ref.RefRelation}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-600 dark:text-gray-400 block text-xs">Mobile</span>
                                                            <span className="font-medium text-gray-800 dark:text-gray-200">{ref.RefMobileNo}</span>
                                                        </div>
                                                    </div>
                                                    {ref.RefRemarks && (
                                                        <div className="mt-2">
                                                            <span className="text-gray-600 dark:text-gray-400 block text-xs">Remarks</span>
                                                            <p className="text-gray-800 dark:text-gray-200 text-sm">{ref.RefRemarks}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Additional Information */}
                                <div className="bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-indigo-900/20 dark:to-purple-800/20 p-5 rounded-xl border border-indigo-200 dark:border-indigo-700">
                                    <h4 className="font-semibold text-indigo-800 dark:text-indigo-300 mb-4 flex items-center">
                                        <FileText className="w-5 h-5 mr-2" />
                                        Additional Information
                                    </h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div className="bg-white dark:bg-gray-700 p-3 rounded-lg">
                                            <span className="text-indigo-600 dark:text-indigo-400 block text-xs">MOID</span>
                                            <span className="font-medium text-gray-900 dark:text-white">{selectedStaffData.MOID}</span>
                                        </div>
                                        <div className="bg-white dark:bg-gray-700 p-3 rounded-lg">
                                            <span className="text-indigo-600 dark:text-indigo-400 block text-xs">Joining Category</span>
                                            <span className="font-medium text-gray-900 dark:text-white">{selectedStaffData.joiningcategory}</span>
                                        </div>
                                        <div className="bg-white dark:bg-gray-700 p-3 rounded-lg">
                                            <span className="text-indigo-600 dark:text-indigo-400 block text-xs">Salary Access</span>
                                            <span className="font-medium text-gray-900 dark:text-white">{selectedStaffData.SalaryAccess}</span>
                                        </div>
                                        <div className="bg-white dark:bg-gray-700 p-3 rounded-lg">
                                            <span className="text-indigo-600 dark:text-indigo-400 block text-xs">Username Access</span>
                                            <span className="font-medium text-gray-900 dark:text-white">{selectedStaffData.UsernameAccess}</span>
                                        </div>
                                    </div>

                                    {selectedStaffData.ExpRemarks && (
                                        <div className="mt-4">
                                            <span className="text-indigo-600 dark:text-indigo-400 block text-xs mb-1">Experience Remarks</span>
                                            <p className="font-medium text-gray-800 dark:text-gray-200 text-sm bg-white dark:bg-gray-700 p-3 rounded-lg">{selectedStaffData.ExpRemarks}</p>
                                        </div>
                                    )}

                                    {selectedStaffData.ExpContactNames && (
                                        <div className="mt-3">
                                            <span className="text-indigo-600 dark:text-indigo-400 block text-xs mb-1">Experience Contact Names</span>
                                            <p className="font-medium text-gray-800 dark:text-gray-200 text-sm bg-white dark:bg-gray-700 p-3 rounded-lg">{selectedStaffData.ExpContactNames}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Documents Section - Keep your existing documents section here */}
                                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <h4 className="font-semibold text-gray-800 dark:text-gray-300 mb-4 flex items-center justify-between">
                                        <span className="flex items-center">
                                            <FileText className="w-5 h-5 mr-2" />
                                            Employee Documents ({employeeDocuments.length})
                                        </span>
                                        {documentsLoading && (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                                        )}
                                    </h4>

                                    {documentsLoading ? (
                                        <div className="text-center py-4">
                                            <p className="text-gray-500">Loading documents...</p>
                                        </div>
                                    ) : documentsError ? (
                                        <div className="text-center py-4">
                                            <p className="text-red-500">Error loading documents: {documentsError}</p>
                                        </div>
                                    ) : employeeDocuments.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {employeeDocuments.map((doc, index) => (
                                                <div key={index} className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                                                                <FileText className="w-4 h-4 text-indigo-600" />
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900 dark:text-white">{doc.DocName}</div>
                                                                <div className="text-xs text-gray-500">{doc.FileType}</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-xs text-green-600 font-medium">✓ Available</span>
                                                            <button
                                                                onClick={() => openDocumentInBrowser(doc)}
                                                                className="text-indigo-600 hover:text-indigo-800 p-1 hover:bg-indigo-100 dark:hover:bg-indigo-900/20 rounded"
                                                                title="Open in Browser"
                                                            >
                                                                <Globe className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDocumentView(doc)}
                                                                className="text-purple-600 hover:text-purple-800 p-1 hover:bg-purple-100 dark:hover:bg-purple-900/20 rounded"
                                                                title="View in Modal"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDocumentDownload(doc)}
                                                                className="text-green-600 hover:text-green-800 p-1 hover:bg-green-100 dark:hover:bg-green-900/20 rounded"
                                                                title="Download"
                                                            >
                                                                <Download className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-4">
                                            <p className="text-gray-500">No documents available</p>
                                        </div>
                                    )}
                                </div>

                                {/* Previous Approval Notes */}
                                {selectedStaffData.ApprovalNote && (
                                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-5 rounded-xl border border-yellow-200 dark:border-yellow-700">
                                        <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-3 flex items-center">
                                            <FileCheck className="w-5 h-5 mr-2" />
                                            Previous Approval Notes
                                        </h4>
                                        <div className="bg-white dark:bg-gray-700 p-3 rounded-lg border border-yellow-200 dark:border-yellow-600">
                                            <p className="text-yellow-800 dark:text-yellow-200 text-sm">{selectedStaffData.ApprovalNote}</p>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}


                        {/* VERIFICATION INPUT */}
                        <VerificationInput
                            isVerified={isVerified}
                            onVerifiedChange={setIsVerified}
                            comment={verificationComment}
                            onCommentChange={(e) => setVerificationComment(e.target.value)}
                            config={{
                                checkboxLabel: '✓ I have verified all staff registration details and documents',
                                checkboxDescription: 'Including personal information, employment details, qualifications, and all uploaded documents',
                                commentLabel: 'Verification Comments',
                                commentPlaceholder: 'Please provide detailed comments about the staff registration verification...',
                                commentRequired: true,
                                commentRows: 4,
                                commentMaxLength: 1000,
                                showCharCount: true,
                                validationStyle: 'dynamic',
                                checkboxGradient: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
                                commentGradient: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20',
                                commentBorder: 'border-indigo-200 dark:border-indigo-700'
                            }}
                        />

                        {/* ACTION BUTTONS */}
                        <ActionButtons
                            actions={enabledActions}
                            onActionClick={handleActionClick}
                            loading={approvalLoading}
                            isVerified={isVerified}
                            comment={verificationComment}
                            showValidation={true}
                            excludeActions={['send back', 'return']}
                        />
                    </>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <InboxHeader
                title={`${InboxTitle || 'Staff Registration Verification'} (${verificationStaff.length})`}
                subtitle={ModuleDisplayName}
                itemCount={verificationStaff.length}
                onBackClick={handleBackToInbox}
                HeaderIcon={Users}
                badgeText="HR Verification"
                badgeCount={verificationStaff.length}
                searchConfig={{
                    enabled: true,
                    placeholder: 'Search by name, employee code, department, designation...',
                    value: searchQuery,
                    onChange: (e) => setSearchQuery(e.target.value)
                }}
                filters={[
                    {
                        value: filterDepartment,
                        onChange: (e) => setFilterDepartment(e.target.value),
                        defaultLabel: 'All Departments',
                        options: departments
                    },
                    {
                        value: filterCategory,
                        onChange: (e) => setFilterCategory(e.target.value),
                        defaultLabel: 'All Categories',
                        options: categories
                    }
                ]}
                className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700"
            />

            <div className="px-6 -mt-auto mb-6">
                <StatsCards
                    cards={statsCards}
                    variant="simple"
                    gridCols="grid-cols-1 md:grid-cols-4"
                    gap="gap-4"
                />
            </div>

            <div className="container mx-auto px-6">
                <div
                    className={`grid transition-all duration-300 ${isLeftPanelCollapsed && !isLeftPanelHovered
                        ? 'grid-cols-1 lg:grid-cols-12 gap-2'
                        : 'grid-cols-1 lg:grid-cols-3 gap-6'
                        }`}
                    onMouseLeave={() => {
                        if (selectedStaff && isLeftPanelCollapsed) {
                            setIsLeftPanelHovered(false);
                        }
                    }}
                >
                    <div className={isLeftPanelCollapsed && !isLeftPanelHovered ? 'lg:col-span-1' : 'lg:col-span-1'}>
                        <LeftPanel
                            items={filteredStaff}
                            selectedItem={selectedStaff}
                            onItemSelect={handleItemSelect}
                            renderItem={renderItemCard}
                            renderCollapsedItem={renderCollapsedItem}
                            isCollapsed={isLeftPanelCollapsed}
                            onCollapseToggle={setIsLeftPanelCollapsed}
                            isHovered={isLeftPanelHovered}
                            onHoverChange={setIsLeftPanelHovered}
                            loading={staffLoading}
                            error={staffError}
                            onRefresh={handleRefresh}
                            config={{
                                title: 'Pending Verification',
                                icon: Clock,
                                emptyMessage: 'No staff registrations found!',
                                itemKey: 'Id',
                                enableCollapse: true,
                                enableRefresh: true,
                                enableHover: true,
                                maxHeight: '100%',
                                headerGradient: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20'
                            }}
                        />
                    </div>

                    <div className={isLeftPanelCollapsed && !isLeftPanelHovered ? 'lg:col-span-11' : 'lg:col-span-2'}>
                        <div
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
                            onMouseEnter={() => {
                                if (selectedStaff && !isLeftPanelHovered) {
                                    setIsLeftPanelHovered(false);
                                }
                            }}
                        >
                            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 border-b border-gray-200 dark:border-gray-700 rounded-t-xl">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                                        <FileText className="w-4 h-4 text-white" />
                                    </div>
                                    <span>
                                        {selectedStaff ? 'Staff Registration Details' : 'Select an Application'}
                                    </span>
                                </h2>
                            </div>

                            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                                {selectedStaff ? (
                                    renderDetailContent()
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <User className="w-12 h-12 text-indigo-500 dark:text-indigo-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                            No Application Selected
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400">
                                            Select a staff registration from the list to view details and verify.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
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
                    subtitle={`Employee: ${getFullName(selectedStaff)} | Type: ${selectedDocument.FileType}`}
                    theme="indigo"
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
        </div>

    );
};

export default VerifyStaffRegistration;