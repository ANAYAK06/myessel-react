import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    FileText, Clock, CheckCircle2, Users,
    Calendar, Building2, Hash, User,
    TrendingUp, AlertCircle, CalendarCheck,
    CalendarDays, UserCheck, UserX, CheckSquare,
    Pencil, RotateCcw
} from 'lucide-react';

import InboxHeader from '../../components/Inbox/InboxHeader';
import StatsCards from '../../components/Inbox/StatsCards';
import ActionButtons from '../../components/Inbox/ActionButtons';
import RemarksHistory from '../../components/Inbox/RemarksHistory';
import LeftPanel from '../../components/Inbox/LeftPanel';
import VerificationInput from '../../components/Inbox/VerificationInput';

import {
    fetchVerificationAttendance,
    fetchAttendanceByTransactionNo,
    approveStaffAttendance,
    setSelectedTransNo,
    setSelectedRoleId,
    resetAttendanceDetails,
    resetStaffDailyAttendanceData,
    clearApprovalResult,
    selectVerificationAttendanceInboxArray,
    selectAttendanceDetails,
    selectVerificationAttendanceLoading,
    selectAttendanceDetailsLoading,
    selectApproveAttendanceLoading,
    selectVerificationAttendanceError,
    selectAttendanceDetailsError,
    selectApprovalResult
} from '../../slices/HRSlice/staffDailyAttendanceSlice';

import {
    fetchRemarks,
    selectRemarks,
    selectRemarksLoading,
    setSelectedMOID
} from '../../slices/supplierPOSlice/purcahseHelperSlice';

import {
    fetchStatusList,
    selectEnabledActions,
    selectHasActions,
    selectStatusListLoading,
    selectStatusListError,
    resetApprovalData,
    setShowReturnButton
} from '../../slices/CommonSlice/getStatusSlice';

const VerifyStaffDailyAttendance = ({ notificationData, onNavigate }) => {
    const dispatch = useDispatch();

    // Selectors
    const attendanceInbox = useSelector(selectVerificationAttendanceInboxArray);
    const inboxLoading = useSelector(selectVerificationAttendanceLoading);
    const inboxError = useSelector(selectVerificationAttendanceError);

    const attendanceDetails = useSelector(selectAttendanceDetails);
    const detailsLoading = useSelector(selectAttendanceDetailsLoading);
    const detailsError = useSelector(selectAttendanceDetailsError);

    const approvalLoading = useSelector(selectApproveAttendanceLoading);
    const approvalResult = useSelector(selectApprovalResult);

    const remarks = useSelector(selectRemarks);
    const remarksLoading = useSelector(selectRemarksLoading);

    const statusLoading = useSelector(selectStatusListLoading);
    const statusError = useSelector(selectStatusListError);
    const enabledActions = useSelector(selectEnabledActions);
    const hasActions = useSelector(selectHasActions);

    const { userData, userDetails } = useSelector((state) => state.auth);
    const roleId = userData?.roleId || userData?.RID;
    const uid = userData?.UID || userData?.uid;

    // Local State
    const [selectedItem, setSelectedItem] = useState(null);
    const [isVerified, setIsVerified] = useState(false);
    const [verificationComment, setVerificationComment] = useState('');
    const [showRemarksHistory, setShowRemarksHistory] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCostCenter, setFilterCostCenter] = useState('All');
    const [filterDate, setFilterDate] = useState('All');
    const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
    const [isLeftPanelHovered, setIsLeftPanelHovered] = useState(false);
    // editedAttendance: { [EmpId]: 'P' | 'A' | 'L' | 'H' } — overrides from the verifier
    const [editedAttendance, setEditedAttendance] = useState({});

    const { InboxTitle, ModuleDisplayName } = notificationData || {};

    // Extract unique values for filters
    const costCenters = [...new Set(attendanceInbox.map(item => item.CostCenter))].filter(Boolean);
    const dates = [...new Set(attendanceInbox.map(item => item.AttendanceDate))].filter(Boolean);

    const getCurrentUser = () => {
        return userData?.userName || userDetails?.userName || 'system';
    };

    const getCurrentRoleName = () => {
        return userDetails?.roleName || userData?.roleName ||
            notificationData?.InboxTitle ||
            notificationData?.ModuleDisplayName ||
            'Attendance Verifier';
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

    // ── Attendance edit helpers ────────────────────────────────────────────────
    /** Returns the effective (possibly edited) attendance type for an employee */
    const getEffectiveAttendance = (emp) =>
        editedAttendance[emp.EmpId] ?? emp.AttendanceType;

    /** Toggle attendance type for a single employee */
    const handleAttendanceChange = (empId, newType) => {
        setEditedAttendance(prev => ({ ...prev, [empId]: newType }));
    };

    /** Reset a single employee's attendance to the original value */
    const handleAttendanceReset = (empId) => {
        setEditedAttendance(prev => {
            const next = { ...prev };
            delete next[empId];
            return next;
        });
    };

    /** Count of rows where the verifier changed the value */
    const editedCount = Object.keys(editedAttendance).length;

    // Initialize - Fetch attendance inbox
    useEffect(() => {
        if (roleId) {
            console.log('🎯 Initializing Staff Daily Attendance Verification with RoleID:', roleId);
            dispatch(setSelectedRoleId(roleId));
            dispatch(fetchVerificationAttendance(roleId));
        }
    }, [roleId, dispatch]);

    useEffect(() => {
        dispatch(setShowReturnButton('Yes'));
        return () => {
            dispatch(resetStaffDailyAttendanceData());
            dispatch(resetApprovalData());
            dispatch(clearApprovalResult());
        };
    }, [dispatch]);

    // Fetch attendance details when item is selected
    useEffect(() => {
        if (selectedItem?.TransactionNo) {
            console.log('🔍 Fetching Staff Attendance Details for TransNo:', selectedItem.TransactionNo);

            dispatch(setSelectedTransNo(selectedItem.TransactionNo));
            dispatch(fetchAttendanceByTransactionNo(selectedItem.TransactionNo));

            setIsVerified(false);
            setVerificationComment('');
            setShowRemarksHistory(false);
            setEditedAttendance({});   // clear any previous edits when switching records
        }
    }, [selectedItem, dispatch]);

    // Fetch status list when attendance details are loaded
    useEffect(() => {
        if (selectedItem && roleId && attendanceDetails) {
            const moid = attendanceDetails?.MOID || 362;

            console.log('📊 Fetching Status List for MOID:', moid);
            dispatch(fetchStatusList({
                MOID: moid,
                ROID: roleId,
                ChkAmt: 0
            }));
        }
    }, [selectedItem, roleId, attendanceDetails, dispatch]);

    // Fetch remarks history
    useEffect(() => {
        if (selectedItem && attendanceDetails) {
            const moid = attendanceDetails?.MOID || 362;

            console.log('💬 Fetching Remarks for MOID:', moid);
            dispatch(setSelectedMOID(moid));
            dispatch(fetchRemarks({
                trno: attendanceDetails.TransactionNo || selectedItem.TransactionNo || '',
                moid: moid
            }));
        }
    }, [selectedItem, attendanceDetails, dispatch]);

    useEffect(() => {
        if (selectedItem) {
            setIsLeftPanelCollapsed(true);
        }
    }, [selectedItem]);

    const handleBackToInbox = () => {
        if (onNavigate) {
            onNavigate('dashboard', { name: 'Dashboard', type: 'dashboard' });
        }
    };

    const handleRefresh = () => {
        if (roleId) {
            console.log('🔄 Refreshing Staff Daily Attendance list');
            dispatch(fetchVerificationAttendance(roleId));

            if (selectedItem) {
                dispatch(fetchAttendanceByTransactionNo(selectedItem.TransactionNo));
            }
        }
    };

    const handleItemSelect = (item) => {
        console.log('✅ Selected Staff Attendance Item:', item);
        setSelectedItem(item);
    };

    const buildApprovalPayload = (actionValue) => {
    const currentUser = getCurrentUser();
    const currentRoleName = getCurrentRoleName();

    const updatedRemarks = updateRemarksHistory(
        attendanceDetails?.ApprovalNote || '',
        currentRoleName,
        currentUser,
        verificationComment.trim()
    );

    // Extract employee IDs and attendance types — use verifier overrides where set
    const employeeIds = attendanceDetails?.CCEmplistforDate
        ?.map(emp => emp.EmpId)
        .join(',') + ',' || '';

    const attendanceTypes = attendanceDetails?.CCEmplistforDate
        ?.map(emp => editedAttendance[emp.EmpId] ?? emp.AttendanceType)
        .join(',') + ',' || '';

    const payload = {
        TransactionNo: attendanceDetails?.TransactionNo || selectedItem?.TransactionNo || '',
        CostCenter: attendanceDetails?.CostCenter || selectedItem?.CostCenter || '',
        AttendanceDate: attendanceDetails?.AttendanceDate || selectedItem?.AttendanceDate || '',
        EmployeeIds: employeeIds,
        Attendancetypes: attendanceTypes,
        RoleId: roleId,
        Createdby: currentUser,
        Action: actionValue,
        ApprovalNote: updatedRemarks
    };

    console.log('📤 Staff Attendance Approval Payload:', payload);
    return payload;
};
    const handleActionClick = async (action) => {
        if (!selectedItem) {
            toast.error('No attendance record selected');
            return;
        }

        if (!verificationComment || verificationComment.trim() === '') {
            toast.error('Verification comment is mandatory. Please add your comments before proceeding.');
            return;
        }

        if (!isVerified) {
            toast.error('Please verify the attendance details by checking the verification checkbox.');
            return;
        }

        let actionValue = action.value || action.text || action.type;

        if (!actionValue || actionValue.trim() === '') {
            const typeToValueMap = {
                'approve': 'Approve',
                'verify': 'Verify',
                'reject': 'Reject',
                'return': 'Return'
            };
            actionValue = typeToValueMap[action.type?.toLowerCase()] || 'Verify';
        }

        try {
            const payload = buildApprovalPayload(actionValue);
            const result  = await dispatch(approveStaffAttendance(payload)).unwrap();

            // ── Resolve the Data string from whatever shape the API returns ──
            // API returns: { Data: "Submited" | "<business-rule message>", IsSuccessful: bool, ... }
            // Older APIs may return a plain string directly.
            const dataVal = typeof result === 'string'
                ? result
                : (result?.Data ?? result?.Message ?? '');

            // Handle "$"-delimited extra info (e.g. "Submited$Some note")
            const [dataCore, extraInfo] = typeof dataVal === 'string'
                ? dataVal.split('$')
                : [dataVal, null];

            const isRealSuccess =
                typeof dataCore === 'string' &&
                dataCore.trim().toLowerCase() === 'submited';

            if (isRealSuccess) {
                // ── Genuine success ──────────────────────────────────────────
                toast.success(`${action.text || actionValue} completed successfully!`);
                if (extraInfo?.trim()) {
                    setTimeout(() => toast.info(extraInfo.trim(), { autoClose: 6000 }), 500);
                }

                setTimeout(() => {
                    dispatch(fetchVerificationAttendance(roleId));
                    setSelectedItem(null);
                    setVerificationComment('');
                    setIsVerified(false);
                    setShowRemarksHistory(false);
                    setIsLeftPanelCollapsed(false);
                    setEditedAttendance({});
                    dispatch(resetAttendanceDetails());
                    dispatch(resetApprovalData());
                    dispatch(clearApprovalResult());
                }, 1000);

            } else {
                // ── Business-rule block — show the actual backend message ──
                const displayMsg = dataCore?.trim() ||
                    'Approval could not be completed. Please check the details and try again.';

                toast.warning(displayMsg, { autoClose: false });

                // Re-fetch inbox in case any partial state changed on the server,
                // but keep the current record selected so the user can take action.
                dispatch(fetchVerificationAttendance(roleId));
            }

        } catch (error) {
            console.error('❌ Approval Error:', error);

            const errorMessage =
                (typeof error === 'string' ? error : null) ||
                error?.message ||
                `Failed to ${action.text?.toLowerCase() || actionValue.toLowerCase()}`;

            toast.error(errorMessage, { autoClose: 10000 });
        }
    };

    const filteredItems = attendanceInbox.filter(item => {
        const matchesSearch = searchQuery === '' ||
            item.TransactionNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.CostCenter?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.CCName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.AttendanceDate?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCostCenter = filterCostCenter === 'All' || item.CostCenter === filterCostCenter;
        const matchesDate = filterDate === 'All' || item.AttendanceDate === filterDate;

        return matchesSearch && matchesCostCenter && matchesDate;
    });

    const statsCards = [
        {
            icon: CalendarCheck,
            value: attendanceInbox.length,
            label: 'Total Records',
            color: 'blue'
        },
        {
            icon: Clock,
            value: attendanceInbox.length,
            label: 'Pending Verification',
            color: 'purple'
        },
        {
            icon: Users,
            value: attendanceDetails?.CCEmplistforDate?.length || 0,
            label: 'Total Employees',
            color: 'indigo'
        },
        {
            icon: Building2,
            value: attendanceDetails?.CostCenter || '-',
            label: 'Cost Center',
            color: 'violet'
        }
    ];

    const renderItemCard = (item, isSelected) => {
        return (
            <div className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full border-2 border-blue-200 dark:border-blue-600 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-800/50 dark:to-purple-800/50 flex items-center justify-center">
                            <CalendarCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                            {item.CCName || item.CostCenter}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {item.TransactionNo}
                        </p>
                    </div>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-1">
                            <Building2 className="w-3 h-3" />
                            <span>{item.CostCenter}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{item.AttendanceDate}</span>
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-1">
                            <Hash className="w-3 h-3" />
                            <span>ID: {item.AttendanceId}</span>
                        </span>
                        <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                            Daily
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    const renderCollapsedItem = (item, isSelected) => (
        <div className="w-full h-full rounded-lg border-2 border-blue-200 dark:border-blue-600 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-800/50 dark:to-purple-800/50 flex items-center justify-center">
            <CalendarCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
    );

    // colour maps for attendance type buttons
    const ATT_ACTIVE = {
        P: 'bg-green-500 text-white border-green-500 shadow-sm shadow-green-200 dark:shadow-green-900',
        A: 'bg-red-500   text-white border-red-500   shadow-sm shadow-red-200   dark:shadow-red-900',
        L: 'bg-yellow-500 text-white border-yellow-500 shadow-sm shadow-yellow-200 dark:shadow-yellow-900',
        H: 'bg-blue-500  text-white border-blue-500  shadow-sm shadow-blue-200  dark:shadow-blue-900',
    };
    const ATT_IDLE = {
        P: 'border-green-300  text-green-600  dark:border-green-600 dark:text-green-400 hover:bg-green-50  dark:hover:bg-green-900/20',
        A: 'border-red-300    text-red-600    dark:border-red-600   dark:text-red-400   hover:bg-red-50    dark:hover:bg-red-900/20',
        L: 'border-yellow-300 text-yellow-600 dark:border-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20',
        H: 'border-blue-300   text-blue-600   dark:border-blue-600  dark:text-blue-400  hover:bg-blue-50   dark:hover:bg-blue-900/20',
    };
    const ATT_TYPES = ['P', 'A', 'L', 'H'];
    const ATT_LABELS = { P: 'Present', A: 'Absent', L: 'Leave', H: 'Holiday' };

    const renderAttendanceTable = () => {
        if (!attendanceDetails?.CCEmplistforDate || attendanceDetails.CCEmplistforDate.length === 0) {
            return null;
        }

        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700">
                {/* ── Table header ── */}
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                                Employee Attendance List
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                                <Pencil className="w-3 h-3" />
                                Click <span className="font-semibold">P / A / L / H</span> buttons to change attendance
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Changed-rows badge */}
                        {editedCount > 0 && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-semibold border border-amber-300 dark:border-amber-600">
                                <Pencil className="w-3 h-3" />
                                {editedCount} row{editedCount > 1 ? 's' : ''} edited
                            </span>
                        )}

                        {/* Legend */}
                        <div className="flex items-center gap-3 text-xs">
                            {ATT_TYPES.map(t => (
                                <span key={t} className="flex items-center gap-1">
                                    <span className={`inline-flex items-center justify-center w-5 h-5 rounded text-white text-[10px] font-bold ${ATT_ACTIVE[t]}`}>{t}</span>
                                    <span className="text-gray-500 dark:text-gray-400">{ATT_LABELS[t]}</span>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">#</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider min-w-[180px]">Employee Name</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Employee ID</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Category</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Group</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider min-w-[180px]">
                                    <span className="flex items-center justify-center gap-1">
                                        <Pencil className="w-3 h-3 text-blue-500" />
                                        Attendance
                                    </span>
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">LOP Status</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Reports To</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {attendanceDetails.CCEmplistforDate.map((employee, index) => {
                                const effective   = getEffectiveAttendance(employee);
                                const wasEdited   = editedAttendance[employee.EmpId] !== undefined;
                                const original    = employee.AttendanceType;

                                return (
                                    <tr
                                        key={employee.EmpId || index}
                                        className={`transition-colors ${
                                            wasEdited
                                                ? 'bg-amber-50 dark:bg-amber-900/10 hover:bg-amber-100 dark:hover:bg-amber-900/20'
                                                : 'hover:bg-blue-50 dark:hover:bg-blue-900/10'
                                        }`}
                                    >
                                        {/* # */}
                                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                            {index + 1}
                                        </td>

                                        {/* Name — show edit dot if changed */}
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                                            <div className="flex items-center gap-2">
                                                {wasEdited && (
                                                    <span className="flex-shrink-0 w-2 h-2 rounded-full bg-amber-500" title="Attendance changed by verifier" />
                                                )}
                                                {employee.EmpName}
                                            </div>
                                        </td>

                                        {/* EmpId */}
                                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                            {employee.EmpId}
                                        </td>

                                        {/* Category */}
                                        <td className="px-4 py-3 text-center">
                                            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs font-medium">
                                                {employee.Category}
                                            </span>
                                        </td>

                                        {/* Group */}
                                        <td className="px-4 py-3 text-center">
                                            <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded text-xs font-medium">
                                                {employee.GroupName}
                                            </span>
                                        </td>

                                        {/* ── Editable Attendance column ── */}
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                {ATT_TYPES.map(type => (
                                                    <button
                                                        key={type}
                                                        type="button"
                                                        onClick={() => handleAttendanceChange(employee.EmpId, type)}
                                                        title={`Mark ${ATT_LABELS[type]}`}
                                                        className={`w-8 h-8 rounded-lg text-xs font-bold border-2 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400 ${
                                                            effective === type
                                                                ? ATT_ACTIVE[type]
                                                                : `bg-white dark:bg-gray-800 ${ATT_IDLE[type]}`
                                                        }`}
                                                    >
                                                        {type}
                                                    </button>
                                                ))}

                                                {/* Reset button — only visible when this row was edited */}
                                                {wasEdited && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleAttendanceReset(employee.EmpId)}
                                                        title={`Reset to original (${original})`}
                                                        className="w-7 h-7 ml-1 rounded-md flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 transition-colors"
                                                    >
                                                        <RotateCcw className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Show original value when it was changed */}
                                            {wasEdited && (
                                                <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">
                                                    was: <span className="font-semibold">{original || '—'}</span>
                                                </p>
                                            )}
                                        </td>

                                        {/* LOP Status */}
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                employee.LOPStatus === 'NoLOP'
                                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                            }`}>
                                                {employee.LOPStatus || '-'}
                                            </span>
                                        </td>

                                        {/* Reports To */}
                                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                            {employee.ReportToName || '-'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* ── Bottom summary when there are edits ── */}
                {editedCount > 0 && (
                    <div className="mt-4 flex items-center justify-between flex-wrap gap-2 px-2 py-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-700">
                        <p className="text-sm text-amber-700 dark:text-amber-300 flex items-center gap-2">
                            <Pencil className="w-4 h-4" />
                            <span>
                                <span className="font-bold">{editedCount}</span> attendance value{editedCount > 1 ? 's' : ''} changed — these will be submitted with your approval.
                            </span>
                        </p>
                        <button
                            type="button"
                            onClick={() => setEditedAttendance({})}
                            className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 font-medium underline underline-offset-2 transition-colors"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Reset all changes
                        </button>
                    </div>
                )}
            </div>
        );
    };

    const renderDetailContent = () => {
        if (!selectedItem) return null;

        const displayData = attendanceDetails || selectedItem;
        const hasDetailedData = !!attendanceDetails;

        return (
            <div className="space-y-6">
                {detailsLoading && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                        <div className="flex items-center space-x-3">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                            <span className="text-blue-700 dark:text-blue-400 text-sm">
                                Loading attendance details...
                            </span>
                        </div>
                    </div>
                )}

                {/* CUSTOM HEADER */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-700">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                                    <CalendarCheck className="w-8 h-8 text-white" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-500 rounded-full border-3 border-white dark:border-gray-800 flex items-center justify-center">
                                    <AlertCircle className="w-4 h-4 text-white" />
                                </div>
                            </div>

                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                    {displayData.CCName || displayData.CostCenter}
                                </h2>
                                <p className="text-blue-600 dark:text-blue-400 font-semibold mb-3">
                                    {displayData.AttendanceDate} • ID: {displayData.AttendanceId}
                                </p>

                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                                        Daily Attendance
                                    </span>
                                    {displayData.Status && (
                                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                                            {displayData.Status}
                                        </span>
                                    )}
                                    {hasDetailedData && displayData.WeekDayName && (
                                        <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                                            {displayData.WeekDayName}
                                        </span>
                                    )}
                                    {hasDetailedData && displayData.IsHoliday === 'Yes' && (
                                        <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-xs font-medium">
                                            Holiday
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {hasDetailedData && attendanceDetails.CCEmplistforDate && (
                            <div className="text-right">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Employees</p>
                                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                    {attendanceDetails.CCEmplistforDate.length}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-blue-200 dark:border-blue-700">
                        {hasDetailedData && displayData.MOID && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">MOID</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                    {displayData.MOID}
                                </p>
                            </div>
                        )}
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Transaction No</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                {displayData.TransactionNo}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Cost Center</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                {displayData.CostCenter}
                            </p>
                        </div>
                        {hasDetailedData && displayData.IsHoliday && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Holiday Status</p>
                                <p className={`text-sm font-bold ${
                                    displayData.IsHoliday === 'Yes' 
                                        ? 'text-red-600 dark:text-red-400' 
                                        : 'text-green-600 dark:text-green-400'
                                }`}>
                                    {displayData.IsHoliday === 'Yes' ? 'Holiday' : 'Working Day'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Attendance Table */}
                {hasDetailedData && renderAttendanceTable()}

                <RemarksHistory
                    isOpen={showRemarksHistory}
                    onToggle={() => setShowRemarksHistory(!showRemarksHistory)}
                    remarks={remarks}
                    loading={remarksLoading}
                    title="Approval History"
                />

                <VerificationInput
                    isVerified={isVerified}
                    onVerifiedChange={setIsVerified}
                    comment={verificationComment}
                    onCommentChange={(e) => setVerificationComment(e.target.value)}
                    config={{
                        checkboxLabel: '✓ I have verified all attendance details',
                        checkboxDescription: 'Including employee attendance records, cost center information, and status verification',
                        commentLabel: 'Verification Comments',
                        commentPlaceholder: 'Please verify attendance records, employee data accuracy, and any discrepancies...',
                        commentRequired: true,
                        commentRows: 4,
                        commentMaxLength: 1000,
                        showCharCount: true,
                        validationStyle: 'dynamic',
                        checkboxGradient: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
                        commentGradient: 'from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20',
                        commentBorder: 'border-blue-200 dark:border-blue-700'
                    }}
                />

                {statusLoading ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-center space-x-3">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            <span className="text-gray-600 dark:text-gray-400">Loading actions...</span>
                        </div>
                    </div>
                ) : statusError ? (
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-700">
                        <p className="text-red-600 dark:text-red-400 text-center">
                            ⚠️ Error loading actions: {statusError}
                        </p>
                    </div>
                ) : !hasActions || !enabledActions || enabledActions.length === 0 ? (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-700">
                        <p className="text-yellow-700 dark:text-yellow-400 text-center">
                            ℹ️ No actions available for this attendance record
                        </p>
                    </div>
                ) : (
                    <ActionButtons
                        actions={enabledActions}
                        onActionClick={handleActionClick}
                        loading={approvalLoading}
                        isVerified={isVerified}
                        comment={verificationComment}
                        showValidation={true}
                        excludeActions={['send back']}
                    />
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <InboxHeader
                title={`${InboxTitle || 'Daily Staff Attendance Verification'} (${attendanceInbox.length})`}
                subtitle={ModuleDisplayName}
                itemCount={attendanceInbox.length}
                onBackClick={handleBackToInbox}
                HeaderIcon={CalendarCheck}
                badgeText="Daily Attendance"
                badgeCount={attendanceInbox.length}
                searchConfig={{
                    enabled: true,
                    placeholder: 'Search by transaction no, cost center, date...',
                    value: searchQuery,
                    onChange: (e) => setSearchQuery(e.target.value)
                }}
                filters={[
                    {
                        value: filterCostCenter,
                        onChange: (e) => setFilterCostCenter(e.target.value),
                        defaultLabel: 'All Cost Centers',
                        options: costCenters
                    },
                    {
                        value: filterDate,
                        onChange: (e) => setFilterDate(e.target.value),
                        defaultLabel: 'All Dates',
                        options: dates
                    }
                ]}
                className="bg-gradient-to-r from-blue-600 via-purple-500 to-purple-600"
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
                        if (selectedItem && isLeftPanelCollapsed) {
                            setIsLeftPanelHovered(false);
                        }
                    }}
                >
                    <div className={isLeftPanelCollapsed && !isLeftPanelHovered ? 'lg:col-span-1' : 'lg:col-span-1'}>
                        <LeftPanel
                            items={filteredItems}
                            selectedItem={selectedItem}
                            onItemSelect={handleItemSelect}
                            renderItem={renderItemCard}
                            renderCollapsedItem={renderCollapsedItem}
                            isCollapsed={isLeftPanelCollapsed}
                            onCollapseToggle={setIsLeftPanelCollapsed}
                            isHovered={isLeftPanelHovered}
                            onHoverChange={setIsLeftPanelHovered}
                            loading={inboxLoading}
                            error={inboxError}
                            onRefresh={handleRefresh}
                            config={{
                                title: 'Pending Verification',
                                icon: Clock,
                                emptyMessage: 'No attendance records found!',
                                itemKey: 'AttendanceId',
                                enableCollapse: true,
                                enableRefresh: true,
                                enableHover: true,
                                maxHeight: '100%',
                                headerGradient: 'from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20'
                            }}
                        />
                    </div>

                    <div className={isLeftPanelCollapsed && !isLeftPanelHovered ? 'lg:col-span-11' : 'lg:col-span-2'}>
                        <div
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
                            onMouseEnter={() => {
                                if (selectedItem && !isLeftPanelHovered) {
                                    setIsLeftPanelHovered(false);
                                }
                            }}
                        >
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 border-b border-gray-200 dark:border-gray-700 rounded-t-xl">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                                    <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                                        <CalendarCheck className="w-4 h-4 text-white" />
                                    </div>
                                    <span>
                                        {selectedItem ? 'Attendance Verification' : 'Attendance Details'}
                                    </span>
                                </h2>
                            </div>

                            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                                {selectedItem ? (
                                    renderDetailContent()
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CalendarCheck className="w-12 h-12 text-blue-500 dark:text-blue-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                            No Attendance Selected
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400">
                                            Select an attendance record from the list to view details and verify.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyStaffDailyAttendance;