import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import clsx from 'clsx';
import {
    DollarSign,
    TrendingUp,
    Percent,
    Save,
    RotateCcw,
    AlertTriangle,
    Info,
    CheckCircle,
    Calendar,
    Users,
    PieChart,
    FileText,
    Calculator,
    Coins,
    MessageSquare
} from 'lucide-react';
import CustomDatePicker from '../../components/CustomDatePicker';
import {
    insertDividendDeclaration,
    selectInsertOperationStatus,
    clearInsertResult,
} from '../../slices/capitalSlice/dividendDeclarationSlice';

const DividendDeclarationCreate = ({ menuData }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Get userData from auth state
    const { userData } = useSelector((state) => state.auth);
    const roleId = userData?.roleId || userData?.RID;

    console.log('👤 User Data:', userData);

    // Get insert operation status from Redux
    const { isLoading, isSuccess, error, result } = useSelector(selectInsertOperationStatus);

    // Track if form has been submitted (to show validation errors)
    const [formSubmitted, setFormSubmitted] = useState(false);

    // Calculated values state
    const [calculatedValues, setCalculatedValues] = useState({
        totalDividendAmount: 0,
        totalShares: 0,
        perShareValue: 0,
        dividendBalance: 0
    });

    // Show calculated summary from backend after submission
    const [backendCalculated, setBackendCalculated] = useState(false);

    // Financial years
    const currentYear = new Date().getFullYear();
    const financialYears = [
        `${currentYear}-${(currentYear + 1).toString().slice(-2)}`,
        `${currentYear - 1}-${currentYear.toString().slice(-2)}`,
        `${currentYear - 2}-${(currentYear - 1).toString().slice(-2)}`,
    ];

    // Validation Schema
    const validationSchema = Yup.object({
        financialYear: Yup.string().required('Financial Year is required'),
        declarationDate: Yup.date()
            .required('Declaration Date is required')
            .nullable()
            .typeError('Invalid date format'),
        netProfitAfterTax: Yup.number()
            .required('Net Profit After Tax is required')
            .positive('Net Profit must be greater than 0')
            .typeError('Must be a valid number'),
        dividendPercentage: Yup.number()
            .required('Dividend Percentage is required')
            .positive('Dividend Percentage must be greater than 0')
            .max(100, 'Dividend Percentage cannot exceed 100')
            .typeError('Must be a valid number'),
        remarks: Yup.string()
            .required('Remarks are required')
            .trim()
            .min(1, 'Remarks cannot be empty')
    });

    // Formik Setup
    const formik = useFormik({
        initialValues: {
            financialYear: '',
            declarationDate: null,
            netProfitAfterTax: '',
            dividendPercentage: '',
            remarks: ''
        },
        validationSchema,
        validateOnChange: true,
        validateOnBlur: false,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            setFormSubmitted(true);

            if (!roleId) {
                toast.error('Role information is missing. Please login again.');
                setSubmitting(false);
                return;
            }

            const createdBy = userData?.userName ||
                userData?.UserName ||
                userData?.displayName ||
                userData?.employeeId ||
                'admin';

            try {
                const payload = {
                    financialYear: values.financialYear,
                    declarationDate: formatDateForAPI(values.declarationDate),
                    netProfitAfterTax: parseFloat(values.netProfitAfterTax),
                    dividendPercentage: parseFloat(values.dividendPercentage),
                    remarks: values.remarks.trim(),
                    createdby: createdBy,
                    roleId: parseInt(roleId)
                };

                console.log('📤 Submitting Dividend Declaration:', payload);
                console.log('👤 Created By:', createdBy);

                const result = await dispatch(insertDividendDeclaration(payload)).unwrap();

                console.log('✅ Submission Result:', result);

                if (result?.IsSuccessful || result?.Data?.includes('Submited')) {
                    const transactionRefNo = result?.Data?.replace('Submited$', '') || 'N/A';

                    toast.success(
                        <div>
                            <strong>Dividend Declaration Created Successfully!</strong>
                            <br />
                            <span className="text-sm">Transaction Ref: {transactionRefNo}</span>
                        </div>,
                        { autoClose: 5000 }
                    );

                    setTimeout(() => {
                        handleReset(resetForm);
                        toast.info('Form has been reset for next entry', {
                            autoClose: 3000,
                            position: 'bottom-right'
                        });
                    }, 1500);

                } else {
                    toast.error(result?.Message || 'Failed to create Dividend Declaration');
                }

            } catch (err) {
                console.error('❌ Submission Error:', err);
                toast.error(err?.Message || err?.message || 'Failed to create Dividend Declaration');
            } finally {
                setSubmitting(false);
            }
        }
    });

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

    // Format number (for shares)
    const formatNumber = (num) => {
        if (!num && num !== 0) return '0';
        return new Intl.NumberFormat('en-IN', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(num);
    };

    // Calculate dividend amount in real-time
    useEffect(() => {
        const netProfit = parseFloat(formik.values.netProfitAfterTax) || 0;
        const percentage = parseFloat(formik.values.dividendPercentage) || 0;

        if (netProfit > 0 && percentage > 0) {
            const totalDividend = (netProfit * percentage) / 100;

            setCalculatedValues(prev => ({
                ...prev,
                totalDividendAmount: totalDividend,
                dividendBalance: totalDividend,
                totalShares: backendCalculated ? prev.totalShares : 0,
                perShareValue: backendCalculated ? prev.perShareValue : 0
            }));
        } else {
            setCalculatedValues({
                totalDividendAmount: 0,
                totalShares: 0,
                perShareValue: 0,
                dividendBalance: 0
            });
            setBackendCalculated(false);
        }
    }, [formik.values.netProfitAfterTax, formik.values.dividendPercentage, backendCalculated]);

    // Handle Reset
    const handleReset = (resetForm) => {
        if (resetForm) {
            resetForm();
        } else {
            formik.resetForm();
        }
        setFormSubmitted(false);
        setCalculatedValues({
            totalDividendAmount: 0,
            totalShares: 0,
            perShareValue: 0,
            dividendBalance: 0
        });
        setBackendCalculated(false);
        dispatch(clearInsertResult());
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            dispatch(clearInsertResult());
        };
    }, [dispatch]);

    // Helper to determine if error should show
    const shouldShowError = (field) => {
        return (formSubmitted || formik.touched[field]) && formik.errors[field];
    };

    return (
        <div className="space-y-6 p-6">
            {/* Compact Page Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-2.5 rounded-lg">
                            <DollarSign className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Dividend Declaration
                            </h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Create new dividend declaration for shareholders
                            </p>
                        </div>
                    </div>
                    {roleId && (
                        <div className="px-3 py-1.5 bg-gradient-to-r from-indigo-100 to-cyan-100 dark:from-indigo-900 dark:to-cyan-900 text-indigo-800 dark:text-indigo-200 text-xs rounded-full">
                            Role: {roleId}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Form */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="bg-gradient-to-r from-green-600 to-emerald-700 dark:from-green-700 dark:to-emerald-800 px-4 py-3">
                    <div className="flex items-center gap-2 text-white">
                        <FileText className="h-5 w-5" />
                        <h2 className="text-lg font-bold">Declaration Details</h2>
                    </div>
                </div>

                <form onSubmit={formik.handleSubmit} className="p-6 space-y-5">
                    {/* Input Fields - Row 1 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Financial Year */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Financial Year <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
                                <select
                                    name="financialYear"
                                    value={formik.values.financialYear}
                                    onChange={(e) => {
                                        formik.handleChange(e);
                                        formik.setFieldTouched('financialYear', true, false);
                                    }}
                                    className={clsx(
                                        "w-full pl-10 pr-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors",
                                        shouldShowError('financialYear')
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-gray-300 dark:border-gray-600 focus:ring-green-500 focus:border-green-500",
                                        "dark:bg-gray-700 dark:text-white"
                                    )}
                                >
                                    <option value="">Select Year</option>
                                    {financialYears.map((year) => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {shouldShowError('financialYear') && (
                                <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3" />
                                    {formik.errors.financialYear}
                                </p>
                            )}
                        </div>

                        {/* Declaration Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Declaration Date <span className="text-red-500">*</span>
                            </label>
                            <CustomDatePicker
                                selected={formik.values.declarationDate}
                                onChange={(date) => {
                                    formik.setFieldValue('declarationDate', date);
                                    formik.setFieldTouched('declarationDate', true, false);
                                }}
                                placeholderText="Select Date"
                                closeOnSelect={true}
                            />
                            {shouldShowError('declarationDate') && (
                                <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3" />
                                    {formik.errors.declarationDate}
                                </p>
                            )}
                        </div>

                        {/* Net Profit After Tax */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Net Profit After Tax (₹) <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
                                <input
                                    type="number"
                                    name="netProfitAfterTax"
                                    step="0.01"
                                    min="0"
                                    value={formik.values.netProfitAfterTax}
                                    onChange={(e) => {
                                        formik.handleChange(e);
                                        formik.setFieldTouched('netProfitAfterTax', true, false);
                                    }}
                                    placeholder="Enter amount"
                                    className={clsx(
                                        "w-full pl-10 pr-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors",
                                        shouldShowError('netProfitAfterTax')
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-gray-300 dark:border-gray-600 focus:ring-green-500 focus:border-green-500",
                                        "dark:bg-gray-700 dark:text-white"
                                    )}
                                />
                            </div>
                            {shouldShowError('netProfitAfterTax') && (
                                <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3" />
                                    {formik.errors.netProfitAfterTax}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Input Fields - Row 2 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Dividend Percentage */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Dividend Percentage (%) <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
                                <input
                                    type="number"
                                    name="dividendPercentage"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    value={formik.values.dividendPercentage}
                                    onChange={(e) => {
                                        formik.handleChange(e);
                                        formik.setFieldTouched('dividendPercentage', true, false);
                                    }}
                                    placeholder="0-100"
                                    className={clsx(
                                        "w-full pl-10 pr-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors",
                                        shouldShowError('dividendPercentage')
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-gray-300 dark:border-gray-600 focus:ring-green-500 focus:border-green-500",
                                        "dark:bg-gray-700 dark:text-white"
                                    )}
                                />
                            </div>
                            {shouldShowError('dividendPercentage') && (
                                <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3" />
                                    {formik.errors.dividendPercentage}
                                </p>
                            )}
                        </div>

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
                                    onChange={(e) => {
                                        formik.handleChange(e);
                                        formik.setFieldTouched('remarks', true, false);
                                    }}
                                    placeholder="Enter remarks for this declaration"
                                    rows="2"
                                    maxLength="500"
                                    className={clsx(
                                        "w-full pl-10 pr-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors resize-none",
                                        shouldShowError('remarks')
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-gray-300 dark:border-gray-600 focus:ring-green-500 focus:border-green-500",
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
                    </div>

                    {/* Calculated Summary */}
                    {calculatedValues.totalDividendAmount > 0 && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Calculator className="h-4 w-4 text-green-600 dark:text-green-400" />
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                    Calculated Values
                                </h3>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {/* Total Dividend */}
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-green-200 dark:border-green-700">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <DollarSign className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                                        <span className="text-xs text-gray-600 dark:text-gray-400">Total Dividend</span>
                                    </div>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                                        ₹{formatCurrency(calculatedValues.totalDividendAmount)}
                                    </p>
                                </div>

                                {/* Total Shares */}
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-green-200 dark:border-green-700">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <Users className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                        <span className="text-xs text-gray-600 dark:text-gray-400">Total Shares</span>
                                    </div>
                                    {backendCalculated && calculatedValues.totalShares > 0 ? (
                                        <>
                                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                                                {formatNumber(calculatedValues.totalShares)}
                                            </p>
                                            <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                                                Calculated
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                                Auto-calculated
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                By system
                                            </p>
                                        </>
                                    )}
                                </div>

                                {/* Per Share Value */}
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-green-200 dark:border-green-700">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <Coins className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                                        <span className="text-xs text-gray-600 dark:text-gray-400">Per Share</span>
                                    </div>
                                    {backendCalculated && calculatedValues.perShareValue > 0 ? (
                                        <>
                                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                                                ₹{formatCurrency(calculatedValues.perShareValue)}
                                            </p>
                                            <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                                                Calculated
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                                Auto-calculated
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                By system
                                            </p>
                                        </>
                                    )}
                                </div>

                                {/* Available Balance */}
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-green-200 dark:border-green-700">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <PieChart className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
                                        <span className="text-xs text-gray-600 dark:text-gray-400">Available</span>
                                    </div>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                                        ₹{formatCurrency(calculatedValues.dividendBalance)}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-3 p-2.5 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-700">
                                <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                                    <Info className="h-3.5 w-3.5 flex-shrink-0" />
                                    <span>
                                        {backendCalculated
                                            ? "Values have been calculated by the system based on approved shareholders and ESOP holders"
                                            : "Total shares and per-share value will be calculated after submission based on approved shareholders and ESOP holders"
                                        }
                                    </span>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="submit"
                            disabled={isLoading || formik.isSubmitting}
                            className="flex-1 px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-medium rounded-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                            {isLoading || formik.isSubmitting ? (
                                <>
                                    <RotateCcw className="h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Create Declaration
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
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-2.5">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-1.5 rounded-lg mt-0.5">
                        <Info className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">
                            Important Information
                        </h3>
                        <ul className="space-y-1.5 text-xs text-gray-700 dark:text-gray-300">
                            <li className="flex items-start gap-1.5">
                                <CheckCircle className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                <span>Only one declaration allowed per financial year</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                                <CheckCircle className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                <span>System calculates shares from: Shareholderinfo table + ESOPExerciseOptionDetails (Status='Approved')</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                                <CheckCircle className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                <span>Per-share value = Total Dividend Amount ÷ Total Shares</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                                <CheckCircle className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                <span>Goes through multi-level approval workflow before finalization</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                                <CheckCircle className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                <span>Declaration locked (IsLocked=1) after final approval</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DividendDeclarationCreate;