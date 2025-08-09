// VerifyStaffRegistration.jsx - Main component (cleaner and focused on UI)
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    ArrowLeft, User, Phone, Mail, MapPin, Calendar, FileText,
    CheckCircle, XCircle, Clock, AlertCircle, Download, Eye,
    Building2, IdCard, Users, Award, Briefcase, GraduationCap,
    DollarSign, Search, RefreshCw, X, CreditCard, Globe,
    Maximize2, Minimize2, FileCheck, Zap, Target, Bug
} from 'lucide-react';

import PayloadDebugger from '../../components/debug/payloadDebugger';

// ✅ STAFF REGISTRATION SLICE IMPORTS
import {
    // Async Thunks
    fetchVerificationStaff,
    fetchVerificationStaffDataById,
    approveStaffRegistration,
    fetchEmployeeDocuments,

    // Data Selectors
    selectVerificationStaff,
    selectVerificationStaffArray,
    selectVerificationStaffData,
    selectEmployeeDocuments,
    selectSelectedRoleId,

    // Loading Selectors
    selectVerificationStaffLoading,
    selectVerificationStaffDataLoading,
    selectApproveStaffRegistrationLoading,
    selectEmployeeDocumentsLoading,

    // Error Selectors
    selectVerificationStaffError,
    selectEmployeeDocumentsError,

    // Actions
    setSelectedRoleId,
    setSelectedEmpRefNo,
    resetVerificationStaffData,
    clearError
} from '../../slices/HRSlice/staffRegistrationSlice';

// ✅ APPROVAL SLICE IMPORTS (Generic/Reusable)
import {
    // Async Thunks
    fetchStatusList,

    // Data Selectors
    selectStatusList,
    selectAvailableActions,
    selectEnabledActions,
    selectHasActions,
    selectDebugInfo,

    // Loading Selectors  
    selectStatusListLoading,

    // Error Selectors
    selectStatusListError,

    // Actions
    resetApprovalData,
    clearError as clearApprovalError
} from '../../slices/CommonSlice/getStatusSlice';

// ✅ IMPORT HANDLER FUNCTIONS
import {
    createStaffVerificationHandler,
    VerificationCommentsSection,
    buildVerificationPayload

} from './staffVerificationHandler';

const VerifyStaffRegistration = ({ notificationData, onNavigate }) => {
    const dispatch = useDispatch();

    // ✅ STAFF REGISTRATION STATE
    const verificationStaff = useSelector(selectVerificationStaffArray);
    const selectedStaffData = useSelector(selectVerificationStaffData);
    const staffLoading = useSelector(selectVerificationStaffLoading);
    const staffDataLoading = useSelector(selectVerificationStaffDataLoading);
    const approvalLoading = useSelector(selectApproveStaffRegistrationLoading);
    const staffError = useSelector(selectVerificationStaffError);
    const selectedRoleId = useSelector(selectSelectedRoleId);
    const employeeDocuments = useSelector(selectEmployeeDocuments);
    const documentsLoading = useSelector(selectEmployeeDocumentsLoading);
    const documentsError = useSelector(selectEmployeeDocumentsError);

    // ✅ APPROVAL STATE (Generic/Reusable)
    const statusLoading = useSelector(selectStatusListLoading);
    const statusError = useSelector(selectStatusListError);
    const statusList = useSelector(selectStatusList);
    const availableActions = useSelector(selectAvailableActions);
    const enabledActions = useSelector(selectEnabledActions);
    const hasActions = useSelector(selectHasActions);
    const debugInfo = useSelector(selectDebugInfo);

    // ✅ LOCAL STATE
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [verificationComment, setVerificationComment] = useState('');
    const [showDocumentModal, setShowDocumentModal] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('All');
    const [filterCategory, setFilterCategory] = useState('All');
    const [documentModalPosition, setDocumentModalPosition] = useState({ x: 100, y: 100 });
    const [isModalDragging, setIsModalDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [isModalMaximized, setIsModalMaximized] = useState(false);
    const [showPayloadDebugger, setShowPayloadDebugger] = useState(false);
    const [debugPayload, setDebugPayload] = useState(null);
    const [currentAction, setCurrentAction] = useState(null);

    const STAFF_VERIFICATION_CONFIG = {
        requiredFields: [
            'EmpRefNo', 'Roleid', 'Createdby', 'Action', 'Note',
            'FirstName', 'LastName', 'MailId', 'JoiningType',
            'EmpCategory', 'Appointmenttype', 'DesignationId', 'DepartmentId'
        ],
        arrayFields: [
            'FMNames', 'FMDOBs', 'FMAges', 'FMGenders', 'FMRelations', 'FMMobilenos',
            'ChildNames', 'ChildDOBs', 'ChildAges', 'ChildGenders', 'ChildMaritals',
            'AdClasses', 'AdUniversities', 'AdFromyears', 'AdToyears', 'AdPercents',
            'TechSkills', 'TechInstitutionName', 'TechFromYear', 'TechToYear', 'TechPercentage',
            'HTOrganisations', 'HTFromyears', 'HTToyears', 'HTRoles', 'HTMobilenos',
            'RefNames', 'RefRelations', 'RefMobileNos', 'RefRemarks'
        ],
        criticalFields: [
            'EmpRefNo', 'MailId', 'FirstName', 'LastName',
            'DesignationId', 'DepartmentId', 'Joiningdate'
        ]
    };

    // ✅ EXTRACT NOTIFICATION DATA
    const {
        InboxTitle,
        ModuleDisplayName,
        RoleId
    } = notificationData || {};

    // ✅ CREATE ACTION HANDLER
    const { handleStatusAction } = createStaffVerificationHandler(dispatch, {
        approveStaffRegistration,
        fetchVerificationStaff,
        resetVerificationStaffData,
        resetApprovalData
    });

    // ✅ INITIALIZE WITH ROLE ID FROM NOTIFICATION
    useEffect(() => {
        if (RoleId && RoleId !== selectedRoleId) {
            dispatch(setSelectedRoleId(RoleId));
            dispatch(fetchVerificationStaff(RoleId));
        }
    }, [RoleId, selectedRoleId, dispatch]);

    // ✅ FETCH STATUS LIST WHEN STAFF IS SELECTED
    useEffect(() => {
        if (selectedStaffData?.MOID && RoleId) {
            const statusParams = {
                MOID: selectedStaffData.MOID,
                ROID: RoleId,
                ChkAmt: 0
            };
            dispatch(fetchStatusList(statusParams));
        }
    }, [selectedStaffData?.MOID, RoleId, dispatch]);

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

    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200';
            case 'low': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-200';
        }
    };

    const getActionIcon = (actionType) => {
        const type = actionType.toLowerCase();
        const iconMap = {
            'approve': CheckCircle,
            'verify': CheckCircle,
            'accept': CheckCircle,
            'return': ArrowLeft,
            'send back': ArrowLeft,
            'reject': XCircle,
            'decline': XCircle,
            'forward': ArrowLeft,
            'escalate': ArrowLeft,
            'hold': Clock,
            'pending': Clock
        };
        return iconMap[type] || CheckCircle;
    };

    // ✅ EVENT HANDLERS
    const handleBackToInbox = () => {
        if (onNavigate) {
            onNavigate('dashboard', { name: 'Dashboard', type: 'dashboard' });
        }
    };

    const handleStaffSelect = async (staff) => {
        setSelectedStaff(staff);
        dispatch(setSelectedEmpRefNo(staff.EmpRefNo));

        const params = {
            empRefNo: staff.EmpRefNo,
            roleId: RoleId || selectedRoleId
        };
        dispatch(fetchVerificationStaffDataById(params));
        dispatch(fetchEmployeeDocuments(staff.EmpRefNo));
    };
    // ✅ ENHANCED ACTION HANDLER WITH DEBUG SUPPORT
    const onActionClick = (action) => {
        // Basic validations first
        if (!selectedStaff) {
            toast.error('No staff selected');
            return;
        }

        if (!verificationComment || verificationComment.trim() === '') {
            toast.error('Verification comment is mandatory. Please add your comments before proceeding.');
            return;
        }

        // Ensure staff data is loaded for verify/approve actions
        if (!selectedStaffData && (action.type.toLowerCase() === 'verify' || action.type.toLowerCase() === 'approve')) {
            toast.error('Employee details not loaded yet. Please wait a moment and try again.');
            return;
        }

        // Store current action for continue functionality
        setCurrentAction(action);

        // Build payload for debugging
        const payload = buildVerificationPayload(
            action.value || action.type,
            selectedStaff,
            selectedStaffData,
            verificationComment,
            RoleId,
            selectedRoleId
        );

        // Store payload for debugging
        setDebugPayload(payload);

        // Development mode: Show debugger for verify/approve actions
        if (process.env.NODE_ENV === 'development' &&
            ['verify', 'approve'].includes(action.type.toLowerCase())) {

            console.log('🔍 Development Mode: Showing payload debugger for', action.type);
            setShowPayloadDebugger(true);
            return; // Stop here to review payload
        }

        // Production or other actions (like reject): proceed directly
        proceedWithAction(action);
    };

    // ✅ HELPER FUNCTION TO PROCEED WITH ACTION
    const proceedWithAction = (action) => {
        handleStatusAction(
            action,
            selectedStaff,
            selectedStaffData,
            verificationComment,
            RoleId,
            selectedRoleId,
            getFullName,
            setSelectedStaff,
            setVerificationComment
        );
    };

    // ✅ CONTINUE AFTER DEBUG REVIEW
    const continueAfterDebugReview = () => {
        console.log('▶️ Continuing with action after debug review:', currentAction?.type);
        setShowPayloadDebugger(false);
        if (currentAction) {
            proceedWithAction(currentAction);
        }
    };

    // ✅ DOCUMENT HANDLERS
    const handleDocumentView = (document) => {
        setSelectedDocument(document);
        setShowDocumentModal(true);
        setIsModalMaximized(false);
    };

    const openDocumentInBrowser = (document) => {
        if (!document.DocBinaryData) {
            toast.error('Document data not available');
            return;
        }

        try {
            if (document.DocBinaryData.startsWith('http')) {
                window.open(document.DocBinaryData, '_blank');
                toast.success('Document opened in new tab');
            } else {
                const byteCharacters = atob(document.DocBinaryData);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const mimeType = document.FileType === 'PDF' ? 'application/pdf' : 'application/octet-stream';
                const blob = new Blob([byteArray], { type: mimeType });
                const url = URL.createObjectURL(blob);
                window.open(url, '_blank');
                toast.success('Document opened in new tab');
                setTimeout(() => URL.revokeObjectURL(url), 1000);
            }
        } catch (error) {
            console.error('Error opening document:', error);
            toast.error('Error opening document. The file may be corrupted.');
        }
    };

    const handleDocumentDownload = (document) => {
        if (!document.DocBinaryData) {
            toast.error('Document data not available');
            return;
        }

        try {
            const fileName = `${document.DocName}.${document.FileType?.toLowerCase() || 'pdf'}`;

            if (document.DocBinaryData.startsWith('http')) {
                const link = document.createElement('a');
                link.href = document.DocBinaryData;
                link.download = fileName;
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.success(`Document "${fileName}" download started`);
            } else {
                const byteCharacters = atob(document.DocBinaryData);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const mimeType = document.FileType === 'PDF' ? 'application/pdf' : 'application/octet-stream';
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

    // ✅ MODAL DRAGGING FUNCTIONALITY
    const handleMouseDown = (e) => {
        if (isModalMaximized) return;
        setIsModalDragging(true);
        setDragOffset({
            x: e.clientX - documentModalPosition.x,
            y: e.clientY - documentModalPosition.y
        });
    };

    const handleMouseMove = (e) => {
        if (isModalDragging && !isModalMaximized) {
            setDocumentModalPosition({
                x: e.clientX - dragOffset.x,
                y: e.clientY - dragOffset.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsModalDragging(false);
    };

    useEffect(() => {
        if (isModalDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isModalDragging, dragOffset]);

    // ✅ FILTER STAFF BASED ON SEARCH AND FILTERS
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

    // ✅ ACTION BUTTONS RENDER FUNCTION
    // ✅ ACTION BUTTONS RENDER FUNCTION - UPDATED WITH DEBUG SECTION
    const renderActionButtons = () => {
        // ========================================
        // 🟦 YOUR EXISTING LOADING CHECK (KEEP AS IS)
        // ========================================
        if (statusLoading) {
            return (
                <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500 mx-auto mb-2"></div>
                    <p className="text-gray-500 text-sm">Loading available actions...</p>
                </div>
            );
        }

        // ========================================
        // 🟦 YOUR EXISTING ERROR CHECK (KEEP AS IS)
        // ========================================
        if (statusError) {
            return (
                <div className="text-center py-4">
                    <p className="text-red-500 text-sm">Error loading actions: {statusError}</p>
                    <button
                        onClick={() => {
                            if (selectedStaffData?.MOID && RoleId) {
                                dispatch(fetchStatusList({
                                    MOID: selectedStaffData.MOID,
                                    ROID: RoleId,
                                    ChkAmt: 0
                                }));
                            }
                        }}
                        className="mt-2 px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                    >
                        Retry
                    </button>
                </div>
            );
        }

        // ========================================
        // 🟦 YOUR EXISTING NO ACTIONS CHECK (KEEP AS IS)
        // ========================================
        if (!hasActions) {
            return (
                <div className="text-center py-6">
                    <div className="text-gray-500 mb-2">No actions available for this record</div>
                    <div className="text-xs text-gray-400">MOID: {selectedStaffData?.MOID}, Role: {RoleId}</div>
                    <div className="text-xs text-gray-400 mt-1">
                        Status items: {statusList?.length || 0}
                    </div>
                </div>
            );
        }

        // ========================================
        // 🟦 YOUR EXISTING FILTERED ACTIONS (KEEP AS IS)
        // ========================================
        // Filter out return actions
        const filteredActions = enabledActions.filter(action =>
            !['return', 'send back'].includes(action.type.toLowerCase())
        );

        if (filteredActions.length === 0) {
            return (
                <div className="text-center py-6">
                    <div className="text-gray-500 mb-2">No applicable actions available</div>
                    <div className="text-xs text-gray-400">Return actions are hidden for this module</div>
                </div>
            );
        }

        const actionCount = filteredActions.length;
        const gridCols = actionCount === 1 ? 'grid-cols-1' :
            actionCount === 2 ? 'grid-cols-1 md:grid-cols-2' :
                actionCount === 3 ? 'grid-cols-1 md:grid-cols-3' :
                    'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

        // ========================================
        // 🟢 ADD THE DEBUG SECTION HERE - THIS IS NEW
        // ========================================
        return (
            <div className="space-y-4">
                {/* 🟢 NEW: DEBUG SECTION FOR DEVELOPMENT */}
                {process.env.NODE_ENV === 'development' && selectedStaffData && (
                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                                <Bug className="w-5 h-5 text-yellow-600" />
                                <span className="font-semibold text-yellow-800">Development Debug Mode</span>
                            </div>
                            <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                                DEV ONLY
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <button
                                onClick={() => {
                                    const payload = buildVerificationPayload(
                                        'Debug',
                                        selectedStaff,
                                        selectedStaffData,
                                        verificationComment || 'Debug mode - test comment',
                                        RoleId,
                                        selectedRoleId
                                    );
                                    setDebugPayload(payload);
                                    setCurrentAction({ type: 'debug', text: 'Debug' });
                                    setShowPayloadDebugger(true);
                                }}
                                className="flex items-center justify-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm"
                            >
                                <Bug className="w-4 h-4" />
                                <span>Debug Current Payload</span>
                            </button>

                            <button
                                onClick={() => {
                                    // Quick validation function
                                    const payload = buildVerificationPayload('Quick-Check', selectedStaff, selectedStaffData, 'test', RoleId, selectedRoleId);
                                    const issues = [];

                                    // Check critical fields
                                    STAFF_VERIFICATION_CONFIG.criticalFields.forEach(field => {
                                        if (!payload[field] || payload[field] === null || payload[field] === undefined) {
                                            issues.push(field);
                                        }
                                    });

                                    if (issues.length > 0) {
                                        toast.error(`Missing critical fields: ${issues.join(', ')}`);
                                    } else {
                                        toast.success('All critical fields are present!');
                                    }
                                }}
                                className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                            >
                                <CheckCircle className="w-4 h-4" />
                                <span>Quick Validate</span>
                            </button>
                        </div>

                        <p className="text-xs text-yellow-700 mt-2">
                            💡 Tip: Verify/Approve actions will automatically show the debugger in development mode
                        </p>
                    </div>
                )}

                {/* ========================================*/}
                {/* 🟦 YOUR EXISTING ACTION BUTTONS SECTION (KEEP AS IS) */}
                {/* ========================================*/}
                <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Available Actions ({filteredActions.length})
                    </p>
                </div>

                <div className={`grid ${gridCols} gap-4`}>
                    {filteredActions.map((action, index) => {
                        const IconComponent = getActionIcon(action.type);

                        return (
                            <button
                                key={`${action.type}-${index}`}
                                onClick={() => onActionClick(action)}
                                disabled={approvalLoading}
                                className={`
                                flex items-center justify-center space-x-2 px-6 py-4 
                                ${action.className} 
                                text-white rounded-lg transition-all 
                                disabled:opacity-50 disabled:cursor-not-allowed 
                                font-medium shadow-lg hover:shadow-xl
                                min-h-[60px]
                            `}
                                title={`${action.text} (${action.type}: ${action.value})`}
                            >
                                <IconComponent className="w-5 h-5 flex-shrink-0" />
                                <span className="truncate">
                                    {approvalLoading ? 'Processing...' : action.text}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* 🟦 YOUR EXISTING DEBUG INFO (KEEP AS IS) */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs">
                        <details>
                            <summary className="cursor-pointer text-gray-600 dark:text-gray-400">
                                Debug: Available Actions ({availableActions.length} total, {filteredActions.length} shown)
                            </summary>
                            <div className="mt-2 space-y-2">
                                <div>
                                    <strong>All Actions:</strong>
                                    <pre className="text-gray-500 overflow-x-auto text-xs">
                                        {JSON.stringify(availableActions.map(a => ({ type: a.type, value: a.value, text: a.text })), null, 2)}
                                    </pre>
                                </div>
                                <div>
                                    <strong>Filtered Actions (no return):</strong>
                                    <pre className="text-gray-500 overflow-x-auto text-xs">
                                        {JSON.stringify(filteredActions.map(a => ({ type: a.type, value: a.value, text: a.text })), null, 2)}
                                    </pre>
                                </div>
                            </div>
                        </details>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={handleBackToInbox}
                            className="p-2 text-purple-100 hover:text-white hover:bg-purple-500 rounded-lg transition-colors"
                            title="Back to Dashboard"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-purple-500 rounded-xl shadow-inner">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">
                                    {InboxTitle || 'Staff Registration Verification'}
                                </h1>
                                <p className="text-purple-100 mt-1">
                                    {ModuleDisplayName} • {verificationStaff.length} applications pending
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="px-4 py-2 bg-purple-500 text-purple-100 text-sm rounded-full border border-purple-400">
                            HR Verification
                        </div>
                        <div className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm rounded-full shadow-md">
                            {verificationStaff.length} Pending
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 w-4 h-4 text-purple-200" />
                            <input
                                type="text"
                                placeholder="Search by name, ID, department, or designation..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-purple-500/50 text-white placeholder-purple-200 border border-purple-400 rounded-xl focus:ring-2 focus:ring-purple-300 focus:border-purple-300 backdrop-blur-sm"
                            />
                        </div>
                    </div>
                    <div>
                        <select
                            value={filterDepartment}
                            onChange={(e) => setFilterDepartment(e.target.value)}
                            className="w-full px-3 py-2.5 bg-purple-500/50 text-white border border-purple-400 rounded-xl focus:ring-2 focus:ring-purple-300 backdrop-blur-sm"
                        >
                            <option value="All">All Departments</option>
                            {departments.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="w-full px-3 py-2.5 bg-purple-500/50 text-white border border-purple-400 rounded-xl focus:ring-2 focus:ring-purple-300 backdrop-blur-sm"
                        >
                            <option value="All">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 p-6 border border-indigo-200 dark:border-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/10 rounded-full -mr-10 -mt-10"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-3 bg-indigo-500 rounded-xl shadow-lg">
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{verificationStaff.length}</p>
                                <p className="text-sm text-indigo-600 dark:text-indigo-400">Total Applications</p>
                            </div>
                        </div>
                        <div className="w-full bg-indigo-200 dark:bg-indigo-800 rounded-full h-2 mt-3">
                            <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                    </div>
                </div>

                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-6 border border-red-200 dark:border-red-700 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full -mr-10 -mt-10"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-3 bg-red-500 rounded-xl shadow-lg">
                                <AlertCircle className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                                    {verificationStaff.filter(s => getPriority(s) === 'High').length}
                                </p>
                                <p className="text-sm text-red-600 dark:text-red-400">High Priority</p>
                            </div>
                        </div>
                        <div className="w-full bg-red-200 dark:bg-red-800 rounded-full h-2 mt-3">
                            <div className="bg-red-500 h-2 rounded-full" style={{ width: `${(verificationStaff.filter(s => getPriority(s) === 'High').length / verificationStaff.length) * 100}%` }}></div>
                        </div>
                    </div>
                </div>

                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 border border-green-200 dark:border-green-700 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -mr-10 -mt-10"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-3 bg-green-500 rounded-xl shadow-lg">
                                <Building2 className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{departments.length}</p>
                                <p className="text-sm text-green-600 dark:text-green-400">Departments</p>
                            </div>
                        </div>
                        <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-2 mt-3">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                        </div>
                    </div>
                </div>

                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 border border-purple-200 dark:border-purple-700 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -mr-10 -mt-10"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-3 bg-purple-500 rounded-xl shadow-lg">
                                <Award className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{categories.length}</p>
                                <p className="text-sm text-purple-600 dark:text-purple-400">Categories</p>
                            </div>
                        </div>
                        <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-2 mt-3">
                            <div className="bg-purple-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Staff Registrations List */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-colors overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
                                        <Clock className="w-4 h-4 text-white" />
                                    </div>
                                    <span>Pending ({filteredStaff.length})</span>
                                </h2>
                                <button
                                    onClick={() => dispatch(fetchVerificationStaff(RoleId || selectedRoleId))}
                                    className="p-2 text-indigo-600 hover:text-indigo-800 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/20 transition-colors"
                                    title="Refresh"
                                    disabled={staffLoading}
                                >
                                    <RefreshCw className={`w-4 h-4 ${staffLoading ? 'animate-spin' : ''}`} />
                                </button>
                            </div>
                        </div>

                        <div className="p-4 max-h-[calc(100vh-300px)] overflow-y-auto">
                            {staffLoading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                                    <p className="text-gray-500">Loading...</p>
                                </div>
                            ) : staffError ? (
                                <div className="text-center py-8">
                                    <XCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                                    <p className="text-red-500 mb-2">Error loading data</p>
                                    <button
                                        onClick={() => dispatch(fetchVerificationStaff(RoleId || selectedRoleId))}
                                        className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                    >
                                        Retry
                                    </button>
                                </div>
                            ) : filteredStaff.length === 0 ? (
                                <div className="text-center py-8">
                                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                                    <p className="text-gray-500">No applications found!</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredStaff.map((staff) => {
                                        const priority = getPriority(staff);
                                        return (
                                            <div
                                                key={staff.Id}
                                                className={`rounded-xl cursor-pointer transition-all hover:shadow-md border-2 ${selectedStaff?.Id === staff.Id
                                                    ? 'border-indigo-500 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 shadow-lg'
                                                    : 'border-gray-200 dark:border-gray-600 hover:border-indigo-300 bg-white dark:bg-gray-800'
                                                    }`}
                                                onClick={() => handleStaffSelect(staff)}
                                            >
                                                <div className="p-4">
                                                    <div className="flex items-center space-x-3 mb-3">
                                                        <div className="relative">
                                                            <div className="w-12 h-12 rounded-full border-2 border-indigo-200 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                                                                <User className="w-5 h-5 text-indigo-600" />
                                                            </div>
                                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                                                                {getFullName(staff)}
                                                            </h3>
                                                            <p className="text-xs text-gray-500 truncate">{staff.DesignatedAs}</p>
                                                        </div>
                                                        <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(priority)}`}>
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
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Staff Details Panel */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-colors sticky top-6">
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 border-b border-gray-200 dark:border-gray-700 rounded-t-xl">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
                                    <FileCheck className="w-4 h-4 text-white" />
                                </div>
                                <span>{selectedStaff ? 'Staff Details & Verification' : 'Select an Application'}</span>
                            </h2>
                        </div>

                        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                            {selectedStaff ? (
                                <div className="space-y-6">
                                    {staffDataLoading ? (
                                        <div className="text-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                                            <p className="text-gray-500">Loading detailed information...</p>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Staff Photo and Basic Info */}




                                            {selectedStaffData && (
                                                <>
                                                    {/* Staff Photo and Basic Info */}
                                                    <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-indigo-200 dark:border-indigo-700">
                                                        <div className="flex items-center space-x-6">
                                                            <div className="relative">
                                                                <div className="w-24 h-24 rounded-full border-4 border-gradient-to-r from-indigo-200 to-purple-200 bg-gradient-to-br dark:from-indigo-900/20 dark:to-purple-900/20 flex items-center justify-center shadow-lg">
                                                                    <User className="w-12 h-12 text-indigo-600" />
                                                                </div>
                                                                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                                                                    <CheckCircle className="w-4 h-4 text-white" />
                                                                </div>
                                                            </div>
                                                            <div className="flex-1">
                                                                <h3 className="font-bold text-2xl text-gray-900 dark:text-white">{getFullName(selectedStaff)}</h3>
                                                                <p className="text-indigo-600 dark:text-indigo-400 font-semibold text-lg">{selectedStaffData.DesignatedAs}</p>
                                                                <p className="text-gray-600 dark:text-gray-300">{selectedStaffData.Department}</p>
                                                                <div className="flex items-center space-x-4 mt-3">
                                                                    <span className={`px-3 py-1 text-sm rounded-full ${getPriorityColor(getPriority(selectedStaff))}`}>
                                                                        {getPriority(selectedStaff)} Priority
                                                                    </span>
                                                                    <span className="text-sm font-medium text-purple-600 bg-purple-100 dark:bg-purple-900/20 px-3 py-1 rounded-full">
                                                                        {selectedStaffData.Category}
                                                                    </span>
                                                                    <span className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                                                                        {selectedStaffData.EmpRefNo}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

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


                                            {/* Verification Comments - Now using separate component */}
                                            <VerificationCommentsSection
                                                verificationComment={verificationComment}
                                                setVerificationComment={setVerificationComment}
                                                FileText={FileText}
                                            />

                                            {/* Action Buttons */}
                                            <div className="space-y-4">
                                                {renderActionButtons()}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <AlertCircle className="w-12 h-12 text-indigo-500" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Application Selected</h3>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        Select a staff registration from the list to view details and take action.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {showPayloadDebugger && debugPayload && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
                        <div className="max-w-7xl w-full max-h-[95vh] overflow-hidden">
                            <PayloadDebugger
                                payload={debugPayload}
                                title={`Staff Verification Debug - ${selectedStaff ? getFullName(selectedStaff) : 'Unknown'}`}
                                requiredFields={STAFF_VERIFICATION_CONFIG.requiredFields}
                                arrayFields={STAFF_VERIFICATION_CONFIG.arrayFields}
                                onClose={() => setShowPayloadDebugger(false)}
                                onContinue={continueAfterDebugReview}
                                actionType={currentAction?.type || 'Action'}
                                className="max-h-[95vh] overflow-y-auto"
                            />
                        </div>
                    </div>
                )}

            </div>

            {/* Document Modal */}
            {showDocumentModal && selectedDocument && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div
                        className={`bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-300 dark:border-gray-600 ${isModalMaximized ? 'w-full h-full' : 'max-w-md w-full'}`}
                        style={!isModalMaximized ? {
                            position: 'fixed',
                            left: documentModalPosition.x,
                            top: documentModalPosition.y,
                            transform: 'none'
                        } : {}}
                    >
                        {/* Modal Header */}
                        <div
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4 rounded-t-xl cursor-move select-none"
                            onMouseDown={handleMouseDown}
                        >
                            <div className="flex items-center justify-between text-white">
                                <h3 className="text-lg font-semibold flex items-center">
                                    <FileText className="w-5 h-5 mr-2" />
                                    {selectedDocument.DocName}
                                </h3>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => setIsModalMaximized(!isModalMaximized)}
                                        className="text-white hover:text-indigo-200 p-1 hover:bg-indigo-600 rounded"
                                        title={isModalMaximized ? "Restore" : "Maximize"}
                                    >
                                        {isModalMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                                    </button>
                                    <button
                                        onClick={() => setShowDocumentModal(false)}
                                        className="text-white hover:text-indigo-200 p-1 hover:bg-red-600 rounded"
                                        title="Close"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            <div className="space-y-4">
                                <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 p-4 rounded-lg">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Document Type:</span>
                                            <p className="text-gray-900 dark:text-white font-semibold">{selectedDocument.DocName}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">File Type:</span>
                                            <p className="text-gray-900 dark:text-white font-semibold">{selectedDocument.FileType}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Employee ID:</span>
                                            <p className="text-gray-900 dark:text-white font-mono font-semibold">{selectedDocument.EmployeeId}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Status:</span>
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                ✓ Available
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Document Preview Area */}
                                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-8 text-center">
                                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">Document Preview</p>
                                    <p className="text-sm text-gray-500">Click actions below to view or download</p>
                                </div>

                                {/* Action Buttons */}
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => openDocumentInBrowser(selectedDocument)}
                                        className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-all shadow-lg hover:shadow-xl"
                                    >
                                        <Globe className="w-4 h-4" />
                                        <span>Open in Browser</span>
                                    </button>
                                    <button
                                        onClick={() => handleDocumentDownload(selectedDocument)}
                                        className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg transition-all shadow-lg hover:shadow-xl"
                                    >
                                        <Download className="w-4 h-4" />
                                        <span>Download</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VerifyStaffRegistration;