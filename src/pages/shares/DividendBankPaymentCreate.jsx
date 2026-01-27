import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import clsx from 'clsx';
import {
    CreditCard,
    Building2,
    Calendar,
    FileText,
    Save,
    RotateCcw,
    AlertTriangle,
    Info,
    CheckCircle,
    DollarSign,
    Hash,
    User,
    Wallet,
    TrendingUp,
    Clock,
    MessageSquare,
    ChevronDown,
    Banknote,
    Receipt,
    Activity
} from 'lucide-react';
import CustomDatePicker from '../../components/CustomDatePicker';
import {
    fetchApprovedDistributionsForPayment,
    insertDividendBankPayment,
    selectApprovedDistributionsArray,
    selectApprovedDistributionsLoading,
    selectInsertOperationStatus,
    setSelectedDistributionId,
    setSelectedBankId,
    setPaymentMode,
    clearInsertResult,
} from '../../slices/capitalSlice/dividendBankPaymentSlice';
import {
    fetchBankDetailsWithAvailableBalance,
    selectBankDetailsArray,
    selectBankDetailsLoading,
} from '../../slices/CommonSlice/bankDetailsSlice';
import {
    fetchChequeNumbers,
    selectChequeNumbersArray,
    selectChequeNumbersLoading,
    clearChequeNumbers,
} from '../../slices/bankSlice/chequeNumbersSlice';
import {
    convertAmountToWords,
    formatIndianCurrency,
    getAmountDisplay,
    isValidAmount
} from '../../utilities/amountToTextHelper';

const DividendBankPaymentCreate = ({ menuData }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Get userData from auth state
    const { userData } = useSelector((state) => state.auth);
    const userId = userData?.userName || userData?.UserName || userData?.userId || userData?.UserID || userData?.employeeId;
    const roleId = userData?.roleId || userData?.RoleId || userData?.roleID || userData?.RoleID;

    

    // Get data from Redux
    const approvedDistributions = useSelector(selectApprovedDistributionsArray);
    const distributionsLoading = useSelector(selectApprovedDistributionsLoading);
    const bankDetails = useSelector(selectBankDetailsArray);
    const bankDetailsLoading = useSelector(selectBankDetailsLoading);
    const chequeNumbers = useSelector(selectChequeNumbersArray);
    const chequeNumbersLoading = useSelector(selectChequeNumbersLoading);
    const { isLoading, isSuccess, error, result } = useSelector(selectInsertOperationStatus);

    // Local state
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [selectedDistribution, setSelectedDistribution] = useState(null);
    const [selectedBank, setSelectedBank] = useState(null);
    const [showBankDetails, setShowBankDetails] = useState(false);
    const [showPaymentSummary, setShowPaymentSummary] = useState(false);

    // Payment modes
    const paymentModes = [
        { value: 'NEFT', label: 'NEFT - National Electronic Funds Transfer' },
        { value: 'RTGS', label: 'RTGS - Real Time Gross Settlement' },
        { value: 'IMPS', label: 'IMPS - Immediate Payment Service' },
        { value: 'Cheque', label: 'Cheque' },
        { value: 'DD', label: 'DD - Demand Draft' }
    ];

    // Validation Schema
    const validationSchema = Yup.object({
        distributionId: Yup.number()
            .required('Distribution selection is required')
            .positive('Please select a valid distribution'),
        bankId: Yup.number()
            .required('Bank selection is required')
            .positive('Please select a valid bank'),
        paymentMode: Yup.string()
            .required('Payment mode is required'),
        chequeNo: Yup.string()
            .when('paymentMode', {
                is: (val) => val === 'Cheque' || val === 'DD',
                then: (schema) => schema.required('Cheque/DD number is required'),
                otherwise: (schema) => schema.notRequired()
            }),
        chequeDate: Yup.date()
            .nullable()
            .when('paymentMode', {
                is: (val) => val === 'Cheque' || val === 'DD',
                then: (schema) => schema
                    .required('Cheque/DD date is required')
                    .typeError('Invalid date format'),
                otherwise: (schema) => schema.notRequired()
            }),
        paymentDate: Yup.date()
            .required('Payment date is required')
            .nullable()
            .typeError('Invalid date format'),
        remarks: Yup.string()
            .required('Remarks are required')
            .trim()
            .min(10, 'Remarks must be at least 10 characters')
            .max(500, 'Remarks cannot exceed 500 characters')
    });

    // Formik Setup
    const formik = useFormik({
        initialValues: {
            distributionId: '',
            bankId: '',
            paymentMode: '',
            chequeNo: '',
            chequeDate: null,
            paymentDate: null,
            remarks: ''
        },
        validationSchema,
        validateOnChange: false,
        validateOnBlur: true,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            setFormSubmitted(true);

            if (!userId) {
                toast.error('User information is missing. Please login again.');
                setSubmitting(false);
                return;
            }

            // Validate bank balance
            if (selectedBank && selectedDistribution) {
                const availableBalance = selectedBank.AvailableBalance || 0;
                const paymentAmount = selectedDistribution.NetPayableAmount || 0;

                if (availableBalance < paymentAmount) {
                    toast.error(
                        <div>
                            <strong>Insufficient Balance!</strong>
                            <br />
                            <span className="text-sm">Available: ₹{formatCurrency(availableBalance)}</span>
                            <br />
                            <span className="text-sm">Required: ₹{formatCurrency(paymentAmount)}</span>
                        </div>,
                        { autoClose: 5000 }
                    );
                    setSubmitting(false);
                    return;
                }
            }

            try {
                const payload = {
                    distributionId: parseInt(values.distributionId),
                    bankId: parseInt(values.bankId),
                    paymentMode: values.paymentMode,
                    chequeNo: values.chequeNo || '',
                    chequeDate: values.chequeDate ? formatDateForAPI(values.chequeDate) : null,
                    paymentDate: formatDateForAPI(values.paymentDate),
                    userId: userId.toString(),
                    roleId: parseInt(roleId),
                    remarks: values.remarks.trim()
                };

                console.log('📤 Submitting Dividend Bank Payment:', payload);

                const result = await dispatch(insertDividendBankPayment(payload)).unwrap();

                console.log('✅ Submission Result:', result);

                if (result?.IsSuccessful || result?.Data?.includes('Submited')) {
                    const transactionRefNo = result?.Data?.replace('Submited$', '') || 'N/A';

                    toast.success(
                        <div>
                            <strong>Dividend Payment Initiated Successfully!</strong>
                            <br />
                            <span className="text-sm">Transaction Ref: {transactionRefNo}</span>
                        </div>,
                        { autoClose: 5000 }
                    );

                    setTimeout(() => {
                        handleReset(resetForm);
                        dispatch(fetchApprovedDistributionsForPayment());
                        toast.info('Form has been reset for next entry', {
                            autoClose: 3000,
                            position: 'bottom-right'
                        });
                    }, 1500);

                } else {
                    toast.error(result?.Message || 'Failed to create Dividend Bank Payment');
                }

            } catch (err) {
                console.error('❌ Submission Error:', err);
                toast.error(err?.Message || err?.message || 'Failed to create Dividend Bank Payment');
            } finally {
                setSubmitting(false);
            }
        }
    });

    // Load data on mount
    useEffect(() => {
        dispatch(fetchApprovedDistributionsForPayment());
        dispatch(fetchBankDetailsWithAvailableBalance());
    }, [dispatch]);

    // Handle distribution selection
    const handleDistributionChange = (e) => {
        const distributionId = parseInt(e.target.value);
        formik.setFieldValue('distributionId', distributionId);

        const distribution = approvedDistributions.find(d => d.DistributionId === distributionId);
        setSelectedDistribution(distribution || null);
        dispatch(setSelectedDistributionId(distributionId));

        // Hide payment summary when distribution changes
        setShowPaymentSummary(false);
    };

    // Handle bank selection
    const handleBankChange = (e) => {
        const bankId = parseInt(e.target.value);
        formik.setFieldValue('bankId', bankId);

        const bank = bankDetails.find(b => b.BankId === bankId);
        setSelectedBank(bank || null);
        dispatch(setSelectedBankId(bankId));
        setShowBankDetails(!!bank);

        // Fetch cheque numbers for selected bank
        if (bank) {
            dispatch(fetchChequeNumbers(bank.BankName));
        } else {
            dispatch(clearChequeNumbers());
        }

        // Clear cheque number when bank changes
        formik.setFieldValue('chequeNo', '');

        // Update payment summary visibility
        updatePaymentSummaryVisibility(bank, formik.values.paymentMode);
    };

    // Handle payment mode change
    const handlePaymentModeChange = (e) => {
        const mode = e.target.value;
        formik.setFieldValue('paymentMode', mode);
        dispatch(setPaymentMode(mode));

        // Clear cheque fields if not cheque/DD
        if (mode !== 'Cheque' && mode !== 'DD') {
            formik.setFieldValue('chequeNo', '');
            formik.setFieldValue('chequeDate', null);
        }

        // Update payment summary visibility
        updatePaymentSummaryVisibility(selectedBank, mode);
    };

    // Update payment summary visibility
    const updatePaymentSummaryVisibility = (bank, paymentMode) => {
        setShowPaymentSummary(!!(bank && paymentMode && selectedDistribution));
    };

    // Date formatting utilities
    const formatDateForAPI = (date) => {
        if (!date) return '';
        if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return date;
        }
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';
        return d.toISOString().split('T')[0];
    };

    // Format currency
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    // Format number
    const formatNumber = (num) => {
        if (!num && num !== 0) return '0';
        return new Intl.NumberFormat('en-IN', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(num);
    };

    // Handle Reset
    const handleReset = (resetForm) => {
        if (resetForm) {
            resetForm();
        } else {
            formik.resetForm();
        }
        setFormSubmitted(false);
        setSelectedDistribution(null);
        setSelectedBank(null);
        setShowBankDetails(false);
        setShowPaymentSummary(false);
        dispatch(clearInsertResult());
        dispatch(clearChequeNumbers());
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            dispatch(clearInsertResult());
            dispatch(clearChequeNumbers());
        };
    }, [dispatch]);

    // Helper to determine if error should show
    const shouldShowError = (field) => {
        return (formSubmitted || formik.touched[field]) && formik.errors[field];
    };

    // Check if cheque/DD fields are required
    const isChequeFieldsRequired = formik.values.paymentMode === 'Cheque' || formik.values.paymentMode === 'DD';

    // Check if account is overdraft
    const isOverdraftAccount = selectedBank?.AccountType === 'Over Draft';

    return (
        <div className="space-y-6 p-6">
            {/* Compact Page Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2.5 rounded-lg">
                            <CreditCard className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Dividend Bank Payment
                            </h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Process payment for approved dividend distributions
                            </p>
                        </div>
                    </div>
                    {userId && (
                        <div className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                            User: {userId}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Form */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="bg-gradient-to-r from-blue-600 to-purple-700 dark:from-blue-700 dark:to-purple-800 px-4 py-3">
                    <div className="flex items-center gap-2 text-white">
                        <Receipt className="h-5 w-5" />
                        <h2 className="text-lg font-bold">Payment Details</h2>
                    </div>
                </div>

                <form onSubmit={formik.handleSubmit} className="p-6 space-y-5">
                    {/* Distribution and Bank Selection - Compact Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Distribution Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Select Distribution <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
                                <select
                                    name="distributionId"
                                    value={formik.values.distributionId}
                                    onChange={handleDistributionChange}
                                    onBlur={formik.handleBlur}
                                    disabled={distributionsLoading}
                                    className={clsx(
                                        "w-full pl-10 pr-10 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors appearance-none",
                                        shouldShowError('distributionId')
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500",
                                        "dark:bg-gray-700 dark:text-white"
                                    )}
                                >
                                    <option value="">
                                        {distributionsLoading ? 'Loading...' : 'Select Distribution'}
                                    </option>
                                    {approvedDistributions.map((dist) => (
                                        <option key={dist.DistributionId} value={dist.DistributionId}>
                                            {dist.LotName} - FY {dist.FinancialYear} - ₹{formatCurrency(dist.NetPayableAmount)}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                            </div>
                            {shouldShowError('distributionId') && (
                                <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3" />
                                    {formik.errors.distributionId}
                                </p>
                            )}
                        </div>

                        {/* Bank Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Select Bank Account <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
                                <select
                                    name="bankId"
                                    value={formik.values.bankId}
                                    onChange={handleBankChange}
                                    onBlur={formik.handleBlur}
                                    disabled={bankDetailsLoading}
                                    className={clsx(
                                        "w-full pl-10 pr-10 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors appearance-none",
                                        shouldShowError('bankId')
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500",
                                        "dark:bg-gray-700 dark:text-white"
                                    )}
                                >
                                    <option value="">
                                        {bankDetailsLoading ? 'Loading...' : 'Select Bank'}
                                    </option>
                                    {bankDetails.map((bank) => (
                                        <option key={bank.BankId} value={bank.BankId}>
                                            {bank.BankName} - {bank.AccountNo}
                                            {bank.AccountType === 'Over Draft' ? ' (OD)' : ''}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                            </div>
                            {shouldShowError('bankId') && (
                                <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3" />
                                    {formik.errors.bankId}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Selected Bank Details - Compact */}
                    {showBankDetails && selectedBank && (
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                <div>
                                    <p className="text-gray-600 dark:text-gray-400">Bank</p>
                                    <p className="font-bold text-gray-900 dark:text-white">{selectedBank.BankName}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600 dark:text-gray-400">Account</p>
                                    <p className="font-bold text-gray-900 dark:text-white font-mono">{selectedBank.AccountNo}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600 dark:text-gray-400">Type</p>
                                    <p className="font-bold text-gray-900 dark:text-white">{selectedBank.AccountType}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600 dark:text-gray-400">Available</p>
                                    <p className={clsx(
                                        "font-bold",
                                        selectedDistribution && (selectedBank.AvailableBalance || 0) >= (selectedDistribution.NetPayableAmount || 0)
                                            ? "text-green-600 dark:text-green-400"
                                            : "text-red-600 dark:text-red-400"
                                    )}>
                                        ₹{formatCurrency(selectedBank.AvailableBalance)}
                                    </p>
                                </div>
                            </div>

                            {/* Balance Check Warning */}
                            {selectedDistribution && selectedBank.AvailableBalance < selectedDistribution.NetPayableAmount && (
                                <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                                    <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                                        <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                                        <span>
                                            Insufficient! Required: ₹{formatCurrency(selectedDistribution.NetPayableAmount)}
                                        </span>
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Payment Mode and Details - Compact Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Payment Mode */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Payment Mode <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Banknote className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
                                <select
                                    name="paymentMode"
                                    value={formik.values.paymentMode}
                                    onChange={handlePaymentModeChange}
                                    onBlur={formik.handleBlur}
                                    className={clsx(
                                        "w-full pl-10 pr-10 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors appearance-none",
                                        shouldShowError('paymentMode')
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500",
                                        "dark:bg-gray-700 dark:text-white"
                                    )}
                                >
                                    <option value="">Select Mode</option>
                                    {paymentModes.map((mode) => (
                                        <option key={mode.value} value={mode.value}>
                                            {mode.value}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                            </div>
                            {shouldShowError('paymentMode') && (
                                <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3" />
                                    {formik.errors.paymentMode}
                                </p>
                            )}
                        </div>

                        {/* Cheque Number - Conditional */}
                        {/* Cheque Number - Conditional */}
                        {isChequeFieldsRequired && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    {formik.values.paymentMode} Number <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
                                    <select
                                        name="chequeNo"
                                        value={formik.values.chequeNo}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        disabled={chequeNumbersLoading || !selectedBank}
                                        className={clsx(
                                            "w-full pl-10 pr-10 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors appearance-none",
                                            shouldShowError('chequeNo')
                                                ? "border-red-500 focus:ring-red-500"
                                                : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500",
                                            "dark:bg-gray-700 dark:text-white"
                                        )}
                                    >
                                        <option value="">
                                            {chequeNumbersLoading ? 'Loading cheque numbers...' :
                                                chequeNumbers.length === 0 ? 'No cheque numbers available' :
                                                    'Select Cheque Number'}
                                        </option>
                                        {chequeNumbers.map((cheque) => (
                                            <option
                                                key={cheque.Cheque_Id}
                                                value={cheque.Cheque_No}
                                            >
                                                {cheque.Cheque_No}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                </div>
                                {shouldShowError('chequeNo') && (
                                    <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                                        <AlertTriangle className="h-3 w-3" />
                                        {formik.errors.chequeNo}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Cheque Date - Conditional */}
                        {isChequeFieldsRequired && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    {formik.values.paymentMode} Date <span className="text-red-500">*</span>
                                </label>
                                <CustomDatePicker
                                    selected={formik.values.chequeDate}
                                    onChange={(date) => {
                                        formik.setFieldValue('chequeDate', date, false);
                                    }}
                                    placeholderText="Select Date"
                                    closeOnSelect={true}
                                />
                                {shouldShowError('chequeDate') && (
                                    <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                                        <AlertTriangle className="h-3 w-3" />
                                        {formik.errors.chequeDate}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Payment Date */}
                        <div className={isChequeFieldsRequired ? '' : 'md:col-span-2'}>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Payment Date <span className="text-red-500">*</span>
                            </label>
                            <CustomDatePicker
                                selected={formik.values.paymentDate}
                                onChange={(date) => {
                                    formik.setFieldValue('paymentDate', date, false);
                                }}
                                placeholderText="Select Payment Date"
                                closeOnSelect={true}
                            />
                            {shouldShowError('paymentDate') && (
                                <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3" />
                                    {formik.errors.paymentDate}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Payment Amount Summary with Amount in Words */}
                    {showPaymentSummary && selectedDistribution && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                    Payment Amount
                                </h3>
                            </div>

                            <div className="space-y-3">
                                {/* Amount in Numbers */}
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-700">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Payable Amount</p>
                                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                                        ₹{formatIndianCurrency(selectedDistribution.NetPayableAmount)}
                                    </p>
                                </div>

                                {/* Amount in Words */}
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-700">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Amount in Words</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white italic">
                                        {convertAmountToWords(selectedDistribution.NetPayableAmount)}
                                    </p>
                                </div>

                                {/* Additional Details */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-green-200 dark:border-green-700">
                                        <p className="text-xs text-gray-600 dark:text-gray-400">Distribution</p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedDistribution.LotName}</p>
                                    </div>
                                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-green-200 dark:border-green-700">
                                        <p className="text-xs text-gray-600 dark:text-gray-400">Shareholders</p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{formatNumber(selectedDistribution.ShareholderCount)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Remarks */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Remarks <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none z-10" />
                            <textarea
                                name="remarks"
                                value={formik.values.remarks}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder="Enter payment remarks (minimum 10 characters)"
                                rows="3"
                                maxLength="500"
                                className={clsx(
                                    "w-full pl-10 pr-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors resize-none",
                                    shouldShowError('remarks')
                                        ? "border-red-500 focus:ring-red-500"
                                        : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500",
                                    "dark:bg-gray-700 dark:text-white"
                                )}
                            />
                        </div>
                        {shouldShowError('remarks') && (
                            <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                {formik.errors.remarks}
                            </p>
                        )}
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {formik.values.remarks.length}/500 characters
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="submit"
                            disabled={isLoading || formik.isSubmitting || (selectedBank && selectedDistribution && selectedBank.AvailableBalance < selectedDistribution.NetPayableAmount)}
                            className="flex-1 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                            {isLoading || formik.isSubmitting ? (
                                <>
                                    <RotateCcw className="h-4 w-4 animate-spin" />
                                    Processing Payment...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Initiate Payment
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => handleReset()}
                            disabled={isLoading || formik.isSubmitting}
                            className="px-5 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white text-sm font-medium rounded-lg hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                            <RotateCcw className="h-4 w-4" />
                            Reset
                        </button>
                    </div>
                </form>
            </div>

            {/* Important Notes */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-2.5">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-1.5 rounded-lg mt-0.5">
                        <Info className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">
                            Important Information
                        </h3>
                        <ul className="space-y-1.5 text-xs text-gray-700 dark:text-gray-300">
                            <li className="flex items-start gap-1.5">
                                <CheckCircle className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                <span>Only approved distributions are available for payment processing</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                                <CheckCircle className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                <span>Available balance includes overdraft facility for OD accounts</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                                <CheckCircle className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                <span>Cheque/DD numbers are fetched from the selected bank</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                                <CheckCircle className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                <span>Payment goes through multi-level approval workflow before processing</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                                <CheckCircle className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                <span>Bank balance will be updated only after final approval</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DividendBankPaymentCreate;