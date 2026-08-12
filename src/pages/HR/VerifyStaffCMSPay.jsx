import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import {
    Clock, Users,
    Calendar, Hash,
    Banknote,
    Receipt, Download} from 'lucide-react';

import InboxHeader       from '../../components/Inbox/InboxHeader';
import ActionButtons     from '../../components/Inbox/ActionButtons';
import RemarksHistory    from '../../components/Inbox/RemarksHistory';
import InboxSplitLayout  from '../../components/Inbox/InboxSplitLayout';
import VerificationInput from '../../components/Inbox/VerificationInput';

import {
    fetchVerifyCMSPay,
    fetchCMSDataByTransNo,
    approveCMSPay,
    setSelectedRoleId,
    setSelectedCMSTransactionNo,
    setSelectedConsolidateNo,
    setSelectedTransactionRefno,
    resetCMSPayDetails,
    resetCMSPayVerificationData,
    clearApprovalResult,
    selectVerifyCMSPayInboxArray,
    selectCMSPayDetails,
    selectCMSReportDataArray,
    selectVerifyCMSPayLoading,
    selectCMSPayDetailsLoading,
    selectApproveCMSPayLoading,
    selectVerifyCMSPayError,
    selectCMSPayDetailsError,
    selectApprovalResult
} from '../../slices/HRSlice/staffCMSPayVerificationSlice';

import {
    fetchRemarks,
    selectRemarks,
    selectRemarksLoading,
    setSelectedMOID
} from '../../slices/supplierPOSlice/purcahseHelperSlice';

import { getStaffDetailsByRefNo } from '../../api/HRReportAPI/StaffReportAPI';

import {
    fetchStatusList,
    selectEnabledActions,
    selectHasActions,
    selectStatusListLoading,
    selectStatusListError,
    resetApprovalData,
    setShowReturnButton
} from '../../slices/CommonSlice/getStatusSlice';

const BANK_HEADERS = [
    'Transaction Type', 'Beneficiary Code', 'Beneficiary Account Number',
    'Instrument Amount', 'Beneficiary Name', 'Drawee Location', 'Print Location',
    'Bene Address 1', 'Bene Address 2', 'Bene Address 3', 'Bene Address 4', 'Bene Address 5',
    'Instruction Reference Number', 'Customer Reference Number',
    'Payment details 1', 'Payment details 2', 'Payment details 3', 'Payment details 4',
    'Payment details 5', 'Payment details 6', 'Payment details 7',
    'Cheque Number', 'Chq / Trn Date', 'MICR Number', 'IFSC Code',
    'Bene Bank Name', 'Bene Bank Branch Name', 'Beneficiary email id',
];

// Confirmed against the raw GetCMSDatatbyTransNo response: BeneficiaryEmail
// is present but null, and there's no bank-name field at all on this payload.
// Email is looked up live per-employee from GetStaffDetailsbyRefNo
// (employeeinfo.WorkEmail) via emailMap until the backend starts returning it
// directly. Bank name reads straight off the record — swap in a live lookup
// here too if the backend fix doesn't end up covering it.
const resolveBeneficiaryEmail = (b, emailMap = {}) => {
    const empRefNo = b.Emprefno || b.EmpRefNo;
    return emailMap[empRefNo] || b.Email || b.EmailId || b.EmailID || b.WorkEmail || b.MailId || b.EmailAddress || '';
};

const generateStaffCMSBankExcel = (beneficiaries, cmsInfo, emailMap = {}) => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dateStr = `${dd}/${mm}/${today.getFullYear()}`;

    const refNo = `${cmsInfo.Month || ''}-${cmsInfo.Year || ''}-${cmsInfo.ConsolidateNo || ''}`;

    const rows = beneficiaries.map((b) => [
        'N',                                       // Transaction Type
        '',                                        // Beneficiary Code
        b.BeneficiaryAcNo || b.AccountNo || '',     // Beneficiary Account Number
        parseFloat(b.Amount || 0),                  // Instrument Amount
        b.BeneficiaryName || '',                    // Beneficiary Name
        '', '',                                     // Drawee/Print Location
        '', '', '', '', '',                         // Bene Address 1-5
        refNo,                                       // Instruction Reference Number
        refNo,                                       // Customer Reference Number
        '', '', '', '', '', '', '',                 // Payment details 1-7
        '',                                          // Cheque Number
        dateStr,                                     // Chq / Trn Date
        '',                                          // MICR Number
        b.IFSC || b.IFSCCode || '',                  // IFSC Code
        b.BeneficiaryBank || b.BeneficiaryBankName || b.BankName || b.Bank || b.BeneBankName || '',            // Bene Bank Name
        b.BeneficiaryBranch || b.BeneficiaryBranchName || b.BranchName || b.Branch || b.BeneBankBranchName || '', // Bene Bank Branch Name
        resolveBeneficiaryEmail(b, emailMap),        // Beneficiary email id
    ]);

    const ws = XLSX.utils.aoa_to_sheet([BANK_HEADERS, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bank Transfer');
    XLSX.writeFile(wb, `StaffCMS_BankTransfer_${cmsInfo.CMSTransactionNo || 'export'}.xlsx`);
};

const VerifyStaffCMSPay = ({ notificationData, onNavigate }) => {
    const dispatch = useDispatch();

    // Selectors
    const cmsPayInbox = useSelector(selectVerifyCMSPayInboxArray);
    const inboxLoading = useSelector(selectVerifyCMSPayLoading);
    const inboxError = useSelector(selectVerifyCMSPayError);

    const cmsPayDetails = useSelector(selectCMSPayDetails);
    const cmsReportData = useSelector(selectCMSReportDataArray);
    const detailsLoading = useSelector(selectCMSPayDetailsLoading);
    const detailsError = useSelector(selectCMSPayDetailsError);

    const approvalLoading = useSelector(selectApproveCMSPayLoading);
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
    const [filterMonth, setFilterMonth] = useState('All');
    const [filterYear, setFilterYear] = useState('All');
    const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
    const [isLeftPanelHovered, setIsLeftPanelHovered] = useState(false);
    const [isDownloadingExcel, setIsDownloadingExcel] = useState(false);

    const { InboxTitle, ModuleDisplayName } = notificationData || {};

    // Extract unique values for filters
    const months = [...new Set(cmsPayInbox.map(item => item.Month))].filter(Boolean);
    const years = [...new Set(cmsPayInbox.map(item => item.Year))].filter(Boolean);

    const getCurrentUser = () => {
        return userData?.userName || userDetails?.userName || 'system';
    };

    const getCurrentRoleName = () => {
        return userDetails?.roleName || userData?.roleName ||
            notificationData?.InboxTitle ||
            notificationData?.ModuleDisplayName ||
            'CMS Pay Verifier';
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

    // Initialize - Fetch CMS pay inbox
    useEffect(() => {
        if (roleId) {
            console.log('💰 Initializing CMS Pay Verification with RoleID:', roleId);
            dispatch(setSelectedRoleId(roleId));
            dispatch(fetchVerifyCMSPay(roleId));
        }
    }, [roleId, dispatch]);

    useEffect(() => {
        dispatch(setShowReturnButton('Yes'));
        return () => {
            dispatch(resetCMSPayVerificationData());
            dispatch(resetApprovalData());
            dispatch(clearApprovalResult());
        };
    }, [dispatch]);

    // Fetch CMS pay details when item is selected
    useEffect(() => {
        if (selectedItem) {
            console.log('🔍 Fetching CMS Pay Details for:', selectedItem);

            const params = {
                cmsTransactionNo: selectedItem.CMSTransactionNo,
                consolidateNo: selectedItem.ConsolidateNo,
                transactionRefno: selectedItem.TransactionRefno,
                month: selectedItem.EffectiveMonth,
                year: selectedItem.Year
            };

            dispatch(setSelectedCMSTransactionNo(selectedItem.CMSTransactionNo));
            dispatch(setSelectedConsolidateNo(selectedItem.ConsolidateNo));
            dispatch(setSelectedTransactionRefno(selectedItem.TransactionRefno));
            dispatch(fetchCMSDataByTransNo(params));

            setIsVerified(false);
            setVerificationComment('');
            setShowRemarksHistory(false);
        }
    }, [selectedItem, dispatch]);

    // Fetch status list when CMS pay details are loaded
    useEffect(() => {
        if (selectedItem && roleId && cmsPayDetails) {
            const moid = cmsPayDetails?.MOID || 528;

            console.log('📊 Fetching Status List for MOID:', moid);
            dispatch(fetchStatusList({
                MOID: moid,
                ROID: roleId,
                ChkAmt: cmsPayDetails?.Total || 0
            }));
        }
    }, [selectedItem, roleId, cmsPayDetails, dispatch]);

    // Fetch remarks history
    useEffect(() => {
        if (selectedItem && cmsPayDetails) {
            const moid = cmsPayDetails?.MOID || 528;

            console.log('💬 Fetching Remarks for MOID:', moid);
            dispatch(setSelectedMOID(moid));
            dispatch(fetchRemarks({
                trno: cmsPayDetails.CMSTransactionNo?.toString() || selectedItem.CMSTransactionNo?.toString() || '',
                moid: moid
            }));
        }
    }, [selectedItem, cmsPayDetails, dispatch]);

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
            console.log('🔄 Refreshing CMS Pay list');
            dispatch(fetchVerifyCMSPay(roleId));

            if (selectedItem) {
                const params = {
                    cmsTransactionNo: selectedItem.CMSTransactionNo,
                    consolidateNo: selectedItem.ConsolidateNo,
                    transactionRefno: selectedItem.TransactionRefno,
                    month: selectedItem.EffectiveMonth,
                    year: selectedItem.Year
                };
                dispatch(fetchCMSDataByTransNo(params));
            }
        }
    };

    const handleItemSelect = (item) => {
        console.log('✅ Selected CMS Pay Item:', item);
        setSelectedItem(item);
    };

    // Shared by the manual "Export Excel" button and the auto-download that
    // fires after a final Approve. Looks up beneficiary emails (not stored
    // against the CMS payment record) live via GetStaffDetailsbyRefNo, then
    // builds the bank-transfer XLSX. Throws on failure so callers can decide
    // how to surface it.
    const exportStaffCMSBankExcel = async () => {
        const uniqueEmpRefNos = [...new Set(
            cmsReportData.map((b) => b.Emprefno || b.EmpRefNo).filter(Boolean)
        )];
        const emailMap = {};
        await Promise.all(uniqueEmpRefNos.map(async (empRefNo) => {
            try {
                const res = await getStaffDetailsByRefNo({ empRefNo, roleId });
                const data = res?.Data || res;
                if (data?.WorkEmail) emailMap[empRefNo] = data.WorkEmail;
            } catch (err) {
                console.warn('⚠️ Could not fetch email for', empRefNo, err);
            }
        }));

        const displayData = cmsPayDetails || selectedItem;
        generateStaffCMSBankExcel(cmsReportData, {
            Month: displayData?.Month,
            Year: displayData?.Year,
            ConsolidateNo: displayData?.ConsolidateNo || selectedItem?.ConsolidateNo,
            CMSTransactionNo: displayData?.CMSTransactionNo || selectedItem?.CMSTransactionNo,
        }, emailMap);
    };

    const handleDownloadExcel = async () => {
        if (!cmsReportData || cmsReportData.length === 0) {
            toast.error('No beneficiary data available to export');
            return;
        }
        setIsDownloadingExcel(true);
        try {
            await exportStaffCMSBankExcel();
            toast.success('Excel downloaded');
        } finally {
            setIsDownloadingExcel(false);
        }
    };

    const buildApprovalPayload = (actionValue) => {
        const currentUser = getCurrentUser();

        const payload = {
            cmsTransactionNo: cmsPayDetails?.CMSTransactionNo || selectedItem?.CMSTransactionNo || '',
            transactionRefno: cmsPayDetails?.TransactionRefno || selectedItem?.TransactionRefno || '',
            consolidateNo: cmsPayDetails?.ConsolidateNo || selectedItem?.ConsolidateNo || '',
            roleId: roleId,
            action: actionValue,
            note: verificationComment.trim(),
            createdBy: currentUser
        };

        console.log('📤 CMS Pay Approval Payload:', payload);
        return payload;
    };

    const handleActionClick = async (action) => {
        if (!selectedItem) {
            toast.error('No CMS pay record selected');
            return;
        }

        if (!verificationComment || verificationComment.trim() === '') {
            toast.error('Verification comment is mandatory. Please add your comments before proceeding.');
            return;
        }

        if (!isVerified) {
            toast.error('Please verify the CMS payment details by checking the verification checkbox.');
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

            const result = await dispatch(approveCMSPay(payload)).unwrap();

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

            if (actionValue.toLowerCase() === 'approve' && cmsReportData.length > 0) {
                try {
                    await exportStaffCMSBankExcel();
                    toast.success('Bank transfer Excel downloaded');
                } catch (excelError) {
                    console.error('❌ Auto excel export failed:', excelError);
                    toast.error('Approved, but the bank transfer Excel could not be generated automatically. Use "Export Excel" to download it manually.', { autoClose: 10000 });
                }
            }

            setTimeout(() => {
                dispatch(fetchVerifyCMSPay(roleId));
                setSelectedItem(null);
                setVerificationComment('');
                setIsVerified(false);
                setShowRemarksHistory(false);
                setIsLeftPanelCollapsed(false);
                dispatch(resetCMSPayDetails());
                dispatch(resetApprovalData());
                dispatch(clearApprovalResult());
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

    const filteredItems = cmsPayInbox.filter(item => {
        const matchesSearch = searchQuery === '' ||
            item.CMSTransactionNo?.toString().includes(searchQuery) ||
            item.TransactionRefno?.toString().includes(searchQuery) ||
            item.ConsolidateNo?.toString().includes(searchQuery) ||
            item.Month?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesMonth = filterMonth === 'All' || item.Month === filterMonth;
        const matchesYear = filterYear === 'All' || item.Year === filterYear;

        return matchesSearch && matchesMonth && matchesYear;
    });

    const renderItemCard = (item, isSelected) => {
        return (
            <div className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full border-2 border-blue-200 dark:border-blue-600 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-800/50 dark:to-purple-800/50 flex items-center justify-center">
                            <Receipt className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                            CMS: {item.CMSTransactionNo}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            Consolidate: {item.ConsolidateNo}
                        </p>
                    </div>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-1">
                            <Hash className="w-3 h-3" />
                            <span className="truncate">{item.TransactionRefno}</span>
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{item.Month} {item.Year}</span>
                        </span>
                        <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                            ₹{item.Total?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    // Compact single-line row for the "classic" list view — same fields as
    // renderItemCard, laid out horizontally instead of stacked.
    const renderListItem = (item) => (
        <div className="flex items-center gap-x-6 gap-y-1 flex-wrap text-sm">
            <span className="font-semibold text-gray-900 dark:text-white min-w-[140px]">
                CMS: {item.CMSTransactionNo}
            </span>
            <span className="text-gray-500 dark:text-gray-400 min-w-[130px]">
                Consolidate: {item.ConsolidateNo}
            </span>
            <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400 min-w-[90px]">
                <Hash className="w-3 h-3" />
                {item.TransactionRefno}
            </span>
            <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400 min-w-[100px]">
                <Calendar className="w-3 h-3" />
                {item.Month} {item.Year}
            </span>
            <span className="ml-auto px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium whitespace-nowrap">
                ₹{item.Total?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </span>
        </div>
    );

    const renderCollapsedItem = (item, isSelected) => (
        <div className="w-full h-full rounded-lg border-2 border-blue-200 dark:border-blue-600 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-800/50 dark:to-purple-800/50 flex items-center justify-center">
            <Receipt className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
    );

    const renderBeneficiariesTable = () => {
        if (!cmsReportData || cmsReportData.length === 0) return null;

        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                        <Users className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                        Beneficiary Payment Details ({cmsReportData.length})
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                            <tr>
                                <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                    Emp Ref No
                                </th>
                                <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                    Beneficiary Name
                                </th>
                                <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                    Account No
                                </th>
                                <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                    IFSC
                                </th>
                                <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                    Bank
                                </th>
                                <th className="px-3 py-2 text-right text-[11px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                    Date
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {cmsReportData.map((beneficiary, index) => (
                                <tr key={index} className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                                    <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900 dark:text-white">
                                        {beneficiary.Emprefno || '-'}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700 dark:text-gray-300">
                                        {beneficiary.BeneficiaryName || '-'}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700 dark:text-gray-300 font-mono">
                                        {beneficiary.BeneficiaryAcNo || '-'}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700 dark:text-gray-300 font-mono">
                                        {beneficiary.IFSC || '-'}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700 dark:text-gray-300">
                                        {beneficiary.BeneficiaryBank || beneficiary.BeneficiaryBankName || beneficiary.BankName || beneficiary.Bank || '-'}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-xs font-semibold text-right text-green-600 dark:text-green-400">
                                        ₹{parseFloat(beneficiary.Amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700 dark:text-gray-300">
                                        {beneficiary.Date || '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                            <tr>
                                <td colSpan="5" className="px-3 py-2 text-right text-xs font-bold text-gray-900 dark:text-white">
                                    Total:
                                </td>
                                <td className="px-3 py-2 text-right text-xs font-bold text-green-600 dark:text-green-400">
                                    ₹{cmsReportData.reduce((sum, b) => sum + parseFloat(b.Amount || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        );
    };

    const renderDetailContent = (isPopup = false) => {
        if (!selectedItem) return null;

        const displayData = cmsPayDetails || selectedItem;
        const hasDetailedData = !!cmsPayDetails;

        return (
            <div className="space-y-4">
                {detailsLoading && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                        <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span className="text-blue-700 dark:text-blue-400 text-xs">
                                Loading CMS payment details...
                            </span>
                        </div>
                    </div>
                )}

                {/* CUSTOM HEADER */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                            <div className="relative flex-shrink-0">
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                                    <Receipt className="w-5 h-5 text-white" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                                    <Banknote className="w-2.5 h-2.5 text-white" />
                                </div>
                            </div>

                            <div className="flex-1">
                                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-0.5">
                                    CMS Payment Verification
                                </h2>
                                <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-2">
                                    CMS: {displayData.CMSTransactionNo} • Consolidate: {displayData.ConsolidateNo}
                                </p>

                                <div className="flex flex-wrap gap-1.5">
                                    <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-[11px] font-medium">
                                        {displayData.Month} {displayData.Year}
                                    </span>
                                    <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-[11px] font-medium">
                                        Transaction: {displayData.TransactionRefno}
                                    </span>
                                    {hasDetailedData && displayData.MOID && (
                                        <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-[11px] font-medium">
                                            MOID: {displayData.MOID}
                                        </span>
                                    )}
                                    {hasDetailedData && displayData.CMSId && (
                                        <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-[11px] font-medium">
                                            CMS ID: {displayData.CMSId}
                                        </span>
                                    )}
                                    {displayData.EffectiveMonth && (
                                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-[11px] font-medium">
                                            Effective: {displayData.EffectiveMonth}
                                        </span>
                                    )}
                                    {hasDetailedData && cmsReportData.length > 0 && (
                                        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-[11px] font-medium">
                                            {cmsReportData.length} Beneficiaries
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                            {displayData.Total > 0 && (
                                <div className="text-right">
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400">Total Amount</p>
                                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                        ₹{displayData.Total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                </div>
                            )}
                            <button
                                onClick={handleDownloadExcel}
                                disabled={isDownloadingExcel}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold transition-all disabled:opacity-60"
                            >
                                <Download className="h-3.5 w-3.5" />
                                {isDownloadingExcel ? 'Preparing…' : 'Export Excel'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Beneficiaries Table */}
                {hasDetailedData && renderBeneficiariesTable()}

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
                        checkboxLabel: '✓ I have verified all CMS payment details and beneficiary information',
                        checkboxDescription: 'Including transaction numbers, consolidation details, beneficiary accounts, IFSC codes, amounts, and payment dates accuracy',
                        commentLabel: 'Verification Comments',
                        commentPlaceholder: 'Please verify CMS payment details, beneficiary information, account numbers, amounts, and any discrepancies...',
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
                            ℹ️ No actions available for this CMS payment record
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
        <div className="space-y-6">
            <InboxHeader
                title={`${InboxTitle || 'CMS Payment Verification'} (${cmsPayInbox.length})`}
                subtitle={ModuleDisplayName}
                itemCount={cmsPayInbox.length}
                onBackClick={handleBackToInbox}
                HeaderIcon={Receipt}
                badgeText="CMS Pay Verification"
                badgeCount={cmsPayInbox.length}
                searchConfig={{
                    enabled: true,
                    placeholder: 'Search by CMS transaction, consolidate no, payroll ref...',
                    value: searchQuery,
                    onChange: (e) => setSearchQuery(e.target.value)
                }}
                filters={[
                    {
                        value: filterMonth,
                        onChange: (e) => setFilterMonth(e.target.value),
                        defaultLabel: 'All Months',
                        options: months
                    },
                    {
                        value: filterYear,
                        onChange: (e) => setFilterYear(e.target.value),
                        defaultLabel: 'All Years',
                        options: years
                    }
                ]}
                enableViewToggle
            />

            <InboxSplitLayout
                isLeftPanelCollapsed={isLeftPanelCollapsed}
                onLeftPanelCollapseToggle={setIsLeftPanelCollapsed}
                isLeftPanelHovered={isLeftPanelHovered}
                onLeftPanelHoverChange={setIsLeftPanelHovered}
                left={{
                    items: filteredItems,
                    selectedItem: selectedItem,
                    onItemSelect: handleItemSelect,
                    renderItem: renderItemCard,
                    renderListItem: renderListItem,
                    renderCollapsedItem: renderCollapsedItem,
                    loading: inboxLoading,
                    error: inboxError,
                    onRefresh: handleRefresh,
                    config: {
                        title: 'Pending Verification',
                        icon: Clock,
                        emptyMessage: 'No CMS payment records found!',
                        itemKey: 'CMSTransactionNo',
                        enableCollapse: true,
                        enableRefresh: true,
                        enableHover: true,
                        maxHeight: '100%',
                        headerGradient: 'from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20'
                    },
                    renderPopupContent: (_item) => renderDetailContent(true),
                    popupConfig: {
                        title: 'CMS Payment Verification',
                        icon: Receipt,
                        headerGradient: 'from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20',
                        maxWidth: 'max-w-[80vw]',
                    },
                }}
                right={{
                    selectedItem: selectedItem,
                    loading: false,
                    renderContent: renderDetailContent,
                    config: {
                        title: 'CMS Payment Details',
                        icon: Receipt,
                        selectedTitle: 'CMS Payment Verification',
                        emptyTitle: 'No CMS Payment Selected',
                        emptyMessage: 'Select a CMS payment record from the list to view details and verify payment information.',
                        headerGradient: 'from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20',
                        maxHeight: 'calc(100vh - 200px)',
                        sticky: true,
                        stickyTop: '1.5rem',
                    },
                }}
            />
        </div>
    );
};

export default VerifyStaffCMSPay;