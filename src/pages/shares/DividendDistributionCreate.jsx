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
    Users,
    PieChart,
    FileText,
    Calculator,
    Coins,
    MessageSquare,
    Package,
    UserCheck,
    Building2,
    Search,
    Filter,
    X,
    ShieldAlert
} from 'lucide-react';
import {
    fetchDividendDistributionCreationData,
    insertDividendDistribution,
    selectCreationData,
    selectCreationDataLoading,
    selectCreationDataError,
    selectInsertOperationStatus,
    selectApprovedDeclarationsArray,
    selectShareholdersArray,
    selectESOPHoldersArray,
    selectDistributionSummary,
    setSelectedFinancialYear,
    setSelectedShareholderIds,
    addPromoterShareholderId,
    removePromoterShareholderId,
    addESOPShareholderId,
    removeESOPShareholderId,
    clearSelectedShareholders,
    clearInsertResult,
    clearCreationData,
} from '../../slices/capitalSlice/dividendDistributionSlice';

const DividendDistributionCreate = ({ menuData }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Get userData from auth state
    const { userData } = useSelector((state) => state.auth);
    const roleId = userData?.roleId || userData?.RID;

    console.log('👤 User Data:', userData);

    // Get creation data from Redux
    const approvedDeclarations = useSelector(selectApprovedDeclarationsArray);
    const shareholders = useSelector(selectShareholdersArray);
    const esopHolders = useSelector(selectESOPHoldersArray);
    const summary = useSelector(selectDistributionSummary);
    const isLoadingCreationData = useSelector(selectCreationDataLoading);
    const creationDataError = useSelector(selectCreationDataError);

    // Get insert operation status from Redux
    const { isLoading, isSuccess, error, result } = useSelector(selectInsertOperationStatus);

    // Local state
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [selectedDeclaration, setSelectedDeclaration] = useState(null);
    const [shareholderSearchTerm, setShareholderSearchTerm] = useState('');
    const [esopSearchTerm, setEsopSearchTerm] = useState('');
    const [selectedPromoterIds, setSelectedPromoterIds] = useState([]);
    const [selectedESOPIds, setSelectedESOPIds] = useState([]);

    // NEW: TDS Selection State - Track which shareholders have TDS applicable
    const [shareholderTDSSelection, setShareholderTDSSelection] = useState({
        promoters: {}, // { shareholderId: boolean }
        esop: {}       // { shareholderId: boolean }
    });

    // Calculated values state
    const [calculatedValues, setCalculatedValues] = useState({
        totalSharesSelected: 0,
        grossDividendAmount: 0,
        netPayableAmount: 0,
        totalTDSAmount: 0,
        tdsApplicableCount: 0
    });

    // Validation Schema
    const validationSchema = Yup.object({
        financialYear: Yup.string().required('Financial Year is required'),
        lotName: Yup.string()
            .required('Lot Name is required')
            .trim()
            .min(3, 'Lot Name must be at least 3 characters'),
        lotDescription: Yup.string()
            .trim(),
        tdsPercentage: Yup.number()
            .required('TDS Percentage is required')
            .min(0, 'TDS Percentage cannot be negative')
            .max(100, 'TDS Percentage cannot exceed 100')
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
            lotName: '',
            lotDescription: '',
            tdsPercentage: 0,
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

            if (!selectedDeclaration) {
                toast.error('Please select a financial year first.');
                setSubmitting(false);
                return;
            }

            if (selectedPromoterIds.length === 0 && selectedESOPIds.length === 0) {
                toast.error('Please select at least one shareholder.');
                setSubmitting(false);
                return;
            }

            // Check if TDS percentage is set but no shareholders have TDS applicable
            const hasTDSApplicable = Object.values(shareholderTDSSelection.promoters).some(v => v) ||
                                    Object.values(shareholderTDSSelection.esop).some(v => v);

            if (values.tdsPercentage > 0 && !hasTDSApplicable) {
                toast.warning('TDS percentage is set but no shareholders are marked for TDS deduction. Continue anyway?', {
                    autoClose: 5000
                });
            }

            const createdBy = userData?.userName ||
                userData?.UserName ||
                userData?.displayName ||
                userData?.employeeId ||
                'admin';

            try {
                // Get TDS-applicable shareholder IDs
                const tdsApplicablePromoters = selectedPromoterIds
                    .filter(id => shareholderTDSSelection.promoters[id])
                    .join(',');

                const tdsApplicableESOP = selectedESOPIds
                    .filter(id => shareholderTDSSelection.esop[id])
                    .join(',');

                const payload = {
                    dividendDeclarationId: selectedDeclaration.DividendDeclarationId,
                    lotName: values.lotName.trim(),
                    lotDescription: values.lotDescription.trim(),
                    tdsPercentage: parseFloat(values.tdsPercentage),
                    shareholderIdsPromoter: selectedPromoterIds.join(','),
                    shareholderIdsESOP: selectedESOPIds.join(','),
                    // NEW: TDS applicability
                    tdsApplicablePromoters: tdsApplicablePromoters,
                    tdsApplicableESOP: tdsApplicableESOP,
                    remarks: values.remarks.trim(),
                    createdby: createdBy,
                    roleId: parseInt(roleId)
                };

                console.log('📤 Submitting Dividend Distribution:', payload);
                console.log('👤 Created By:', createdBy);
                console.log('🔒 TDS Applicable - Promoters:', tdsApplicablePromoters);
                console.log('🔒 TDS Applicable - ESOP:', tdsApplicableESOP);

                const result = await dispatch(insertDividendDistribution(payload)).unwrap();

                console.log('✅ Submission Result:', result);

                if (result?.IsSuccessful || result?.Data?.includes('Submited')) {
                    const transactionRefNo = result?.Data?.replace('Submited$', '') || 'N/A';

                    toast.success(
                        <div>
                            <strong>Dividend Distribution Created Successfully!</strong>
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
                    toast.error(result?.Message || 'Failed to create Dividend Distribution');
                }

            } catch (err) {
                console.error('❌ Submission Error:', err);
                toast.error(err?.Message || err?.message || 'Failed to create Dividend Distribution');
            } finally {
                setSubmitting(false);
            }
        }
    });

    // Load creation data when financial year is selected
    const handleFinancialYearChange = async (financialYear) => {
        formik.setFieldValue('financialYear', financialYear);
        formik.setFieldTouched('financialYear', true, false);
        
        if (financialYear) {
            try {
                await dispatch(fetchDividendDistributionCreationData(financialYear)).unwrap();
                dispatch(setSelectedFinancialYear(financialYear));
            } catch (error) {
                console.error('Error loading creation data:', error);
                toast.error('Failed to load declaration data');
            }
        } else {
            setSelectedDeclaration(null);
            dispatch(clearCreationData());
        }
    };

    // Set selected declaration when data is loaded
    useEffect(() => {
        if (approvedDeclarations.length > 0 && formik.values.financialYear) {
            const declaration = approvedDeclarations.find(
                d => d.FinancialYear === formik.values.financialYear
            );
            setSelectedDeclaration(declaration || null);
        }
    }, [approvedDeclarations, formik.values.financialYear]);

    // NEW: Calculate values with selective TDS
    useEffect(() => {
        if (!selectedDeclaration) {
            setCalculatedValues({
                totalSharesSelected: 0,
                grossDividendAmount: 0,
                netPayableAmount: 0,
                totalTDSAmount: 0,
                tdsApplicableCount: 0
            });
            return;
        }

        const perShareValue = parseFloat(selectedDeclaration.PerShareValue) || 0;
        const tdsPercentage = parseFloat(formik.values.tdsPercentage) || 0;

        // Calculate for promoters with selective TDS
        const promoterDetails = shareholders
            .filter(s => selectedPromoterIds.includes(s.ShareHolderId))
            .map(s => {
                const shares = s.NoofShares || 0;
                const grossAmount = shares * perShareValue;
                const tdsApplicable = shareholderTDSSelection.promoters[s.ShareHolderId] || false;
                const tdsAmount = tdsApplicable ? (grossAmount * tdsPercentage) / 100 : 0;
                return { 
                    shares, 
                    grossAmount, 
                    tdsAmount,
                    tdsApplicable: tdsApplicable ? 1 : 0
                };
            });

        // Calculate for ESOP holders with selective TDS
        const esopDetails = esopHolders
            .filter(e => selectedESOPIds.includes(e.ShareHolderId))
            .map(e => {
                const shares = e.NoofShares || 0;
                const grossAmount = shares * perShareValue;
                const tdsApplicable = shareholderTDSSelection.esop[e.ShareHolderId] || false;
                const tdsAmount = tdsApplicable ? (grossAmount * tdsPercentage) / 100 : 0;
                return { 
                    shares, 
                    grossAmount, 
                    tdsAmount,
                    tdsApplicable: tdsApplicable ? 1 : 0
                };
            });

        const allDetails = [...promoterDetails, ...esopDetails];
        
        const totalShares = allDetails.reduce((sum, d) => sum + d.shares, 0);
        const grossAmount = allDetails.reduce((sum, d) => sum + d.grossAmount, 0);
        const tdsAmount = allDetails.reduce((sum, d) => sum + d.tdsAmount, 0);
        const netAmount = grossAmount - tdsAmount;
        const tdsApplicableCount = allDetails.reduce((sum, d) => sum + d.tdsApplicable, 0);

        setCalculatedValues({
            totalSharesSelected: totalShares,
            grossDividendAmount: grossAmount,
            totalTDSAmount: tdsAmount,
            netPayableAmount: netAmount,
            tdsApplicableCount: tdsApplicableCount
        });

    }, [selectedDeclaration, selectedPromoterIds, selectedESOPIds, formik.values.tdsPercentage, 
        shareholders, esopHolders, shareholderTDSSelection]);

    // Handle shareholder selection
    const handlePromoterToggle = (shareholderId) => {
        if (selectedPromoterIds.includes(shareholderId)) {
            setSelectedPromoterIds(prev => prev.filter(id => id !== shareholderId));
            dispatch(removePromoterShareholderId(shareholderId));
            // Clear TDS selection when deselecting shareholder
            setShareholderTDSSelection(prev => ({
                ...prev,
                promoters: {
                    ...prev.promoters,
                    [shareholderId]: false
                }
            }));
        } else {
            setSelectedPromoterIds(prev => [...prev, shareholderId]);
            dispatch(addPromoterShareholderId(shareholderId));
        }
    };

    const handleESOPToggle = (shareholderId) => {
        if (selectedESOPIds.includes(shareholderId)) {
            setSelectedESOPIds(prev => prev.filter(id => id !== shareholderId));
            dispatch(removeESOPShareholderId(shareholderId));
            // Clear TDS selection when deselecting shareholder
            setShareholderTDSSelection(prev => ({
                ...prev,
                esop: {
                    ...prev.esop,
                    [shareholderId]: false
                }
            }));
        } else {
            setSelectedESOPIds(prev => [...prev, shareholderId]);
            dispatch(addESOPShareholderId(shareholderId));
        }
    };

    // NEW: Handle TDS checkbox toggle
    const handleTDSToggle = (shareholderId, type) => {
        if (type === 'promoter') {
            setShareholderTDSSelection(prev => ({
                ...prev,
                promoters: {
                    ...prev.promoters,
                    [shareholderId]: !prev.promoters[shareholderId]
                }
            }));
        } else {
            setShareholderTDSSelection(prev => ({
                ...prev,
                esop: {
                    ...prev.esop,
                    [shareholderId]: !prev.esop[shareholderId]
                }
            }));
        }
    };

    // NEW: Select/Deselect all TDS for promoters
    const handleSelectAllPromoterTDS = () => {
        const newSelection = {};
        selectedPromoterIds.forEach(id => {
            newSelection[id] = true;
        });
        setShareholderTDSSelection(prev => ({
            ...prev,
            promoters: newSelection
        }));
    };

    const handleClearAllPromoterTDS = () => {
        setShareholderTDSSelection(prev => ({
            ...prev,
            promoters: {}
        }));
    };

    // NEW: Select/Deselect all TDS for ESOP
    const handleSelectAllESOPTDS = () => {
        const newSelection = {};
        selectedESOPIds.forEach(id => {
            newSelection[id] = true;
        });
        setShareholderTDSSelection(prev => ({
            ...prev,
            esop: newSelection
        }));
    };

    const handleClearAllESOPTDS = () => {
        setShareholderTDSSelection(prev => ({
            ...prev,
            esop: {}
        }));
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

    // Handle Reset
    const handleReset = (resetForm) => {
        if (resetForm) {
            resetForm();
        } else {
            formik.resetForm();
        }
        setFormSubmitted(false);
        setSelectedDeclaration(null);
        setSelectedPromoterIds([]);
        setSelectedESOPIds([]);
        setShareholderSearchTerm('');
        setEsopSearchTerm('');
        // Reset TDS selection
        setShareholderTDSSelection({
            promoters: {},
            esop: {}
        });
        dispatch(clearSelectedShareholders());
        dispatch(clearInsertResult());
        dispatch(clearCreationData());
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            dispatch(clearInsertResult());
            dispatch(clearCreationData());
        };
    }, [dispatch]);

    // Helper to determine if error should show
    const shouldShowError = (field) => {
        return (formSubmitted || formik.touched[field]) && formik.errors[field];
    };

    // Filter shareholders based on search
    const filteredShareholders = shareholders.filter(s =>
        s.ShareHolderName?.toLowerCase().includes(shareholderSearchTerm.toLowerCase()) ||
        s.ShareHolderId?.toString().includes(shareholderSearchTerm)
    );

    const filteredESOPHolders = esopHolders.filter(e =>
        e.ShareHolderName?.toLowerCase().includes(esopSearchTerm.toLowerCase()) ||
        e.ShareHolderId?.toString().includes(esopSearchTerm)
    );

    // Count TDS selections
    const promoterTDSCount = Object.values(shareholderTDSSelection.promoters).filter(Boolean).length;
    const esopTDSCount = Object.values(shareholderTDSSelection.esop).filter(Boolean).length;

    return (
        <div className="space-y-6 p-6">
            {/* Compact Page Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2.5 rounded-lg">
                            <Package className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Dividend Distribution
                            </h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Create distribution lot for approved dividend declaration
                            </p>
                        </div>
                    </div>
                    {roleId && (
                        <div className="px-3 py-1.5 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 text-indigo-800 dark:text-indigo-200 text-xs rounded-full">
                            Role: {roleId}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Form */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="bg-gradient-to-r from-blue-600 to-purple-700 dark:from-blue-700 dark:to-purple-800 px-4 py-3">
                    <div className="flex items-center gap-2 text-white">
                        <FileText className="h-5 w-5" />
                        <h2 className="text-lg font-bold">Distribution Lot Details</h2>
                    </div>
                </div>

                <form onSubmit={formik.handleSubmit} className="p-6 space-y-5">
                    {/* Step 1: Select Financial Year */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                                1
                            </div>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                Select Approved Declaration
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Financial Year Selector */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Financial Year <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="financialYear"
                                    value={formik.values.financialYear}
                                    onChange={(e) => handleFinancialYearChange(e.target.value)}
                                    disabled={isLoadingCreationData}
                                    className={clsx(
                                        "w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors",
                                        shouldShowError('financialYear')
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500",
                                        "dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                    )}
                                >
                                    <option value="">Select Financial Year</option>
                                    {/* Will be populated from backend in real implementation */}
                                    <option value="2024-25">2024-25</option>
                                    <option value="2023-24">2023-24</option>
                                    <option value="2022-23">2022-23</option>
                                </select>
                                {shouldShowError('financialYear') && (
                                    <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                                        <AlertTriangle className="h-3 w-3" />
                                        {formik.errors.financialYear}
                                    </p>
                                )}
                            </div>

                            {/* Declaration Info */}
                            {selectedDeclaration && (
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-600 dark:text-gray-400">Total Dividend:</span>
                                            <span className="font-bold text-gray-900 dark:text-white">
                                                ₹{formatCurrency(selectedDeclaration.TotalDividendAmount)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-600 dark:text-gray-400">Available Balance:</span>
                                            <span className="font-bold text-blue-600 dark:text-blue-400">
                                                ₹{formatCurrency(selectedDeclaration.DividendBalance)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-600 dark:text-gray-400">Per Share Value:</span>
                                            <span className="font-bold text-purple-600 dark:text-purple-400">
                                                ₹{formatCurrency(selectedDeclaration.PerShareValue)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {isLoadingCreationData && (
                            <div className="mt-3 p-2.5 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700">
                                <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                                    <RotateCcw className="h-3.5 w-3.5 animate-spin" />
                                    Loading declaration data...
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Step 2: Lot Information (Only show if declaration selected) */}
                    {selectedDeclaration && (
                        <>
                            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                                        2
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                        Lot Information
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Lot Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                            Lot Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="lotName"
                                            value={formik.values.lotName}
                                            onChange={(e) => {
                                                formik.handleChange(e);
                                                formik.setFieldTouched('lotName', true, false);
                                            }}
                                            placeholder="e.g., Lot-A, Batch-1"
                                            className={clsx(
                                                "w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors",
                                                shouldShowError('lotName')
                                                    ? "border-red-500 focus:ring-red-500"
                                                    : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500",
                                                "dark:bg-gray-700 dark:text-white"
                                            )}
                                        />
                                        {shouldShowError('lotName') && (
                                            <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                                                <AlertTriangle className="h-3 w-3" />
                                                {formik.errors.lotName}
                                            </p>
                                        )}
                                    </div>

                                    {/* TDS Percentage */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                            TDS Percentage (%) <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
                                            <input
                                                type="number"
                                                name="tdsPercentage"
                                                step="0.01"
                                                min="0"
                                                max="100"
                                                value={formik.values.tdsPercentage}
                                                onChange={(e) => {
                                                    formik.handleChange(e);
                                                    formik.setFieldTouched('tdsPercentage', true, false);
                                                }}
                                                placeholder="0-100"
                                                className={clsx(
                                                    "w-full pl-10 pr-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors",
                                                    shouldShowError('tdsPercentage')
                                                        ? "border-red-500 focus:ring-red-500"
                                                        : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500",
                                                    "dark:bg-gray-700 dark:text-white"
                                                )}
                                            />
                                        </div>
                                        {shouldShowError('tdsPercentage') && (
                                            <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                                                <AlertTriangle className="h-3 w-3" />
                                                {formik.errors.tdsPercentage}
                                            </p>
                                        )}
                                    </div>

                                    {/* Lot Description */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                            Lot Description
                                        </label>
                                        <input
                                            type="text"
                                            name="lotDescription"
                                            value={formik.values.lotDescription}
                                            onChange={formik.handleChange}
                                            placeholder="Optional description"
                                            className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Step 3: Select Shareholders */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                                        3
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                        Select Shareholders
                                    </h3>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        ({selectedPromoterIds.length + selectedESOPIds.length} selected)
                                    </span>
                                    {formik.values.tdsPercentage > 0 && (
                                        <span className="text-xs text-orange-600 dark:text-orange-400 flex items-center gap-1">
                                            <ShieldAlert className="h-3 w-3" />
                                            TDS: {calculatedValues.tdsApplicableCount} applicable
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Promoters/Shareholders */}
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                                                    Promoters
                                                </h4>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    ({selectedPromoterIds.length}/{shareholders.length})
                                                </span>
                                            </div>
                                            {selectedPromoterIds.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedPromoterIds([]);
                                                        handleClearAllPromoterTDS();
                                                    }}
                                                    className="text-xs text-red-600 hover:text-red-700 dark:text-red-400"
                                                >
                                                    Clear All
                                                </button>
                                            )}
                                        </div>

                                        {/* TDS Bulk Actions */}
                                        {formik.values.tdsPercentage > 0 && selectedPromoterIds.length > 0 && (
                                            <div className="mb-3 flex items-center gap-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                                                <ShieldAlert className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
                                                <span className="text-xs text-orange-700 dark:text-orange-400 flex-1">
                                                    TDS Bulk: {promoterTDSCount}/{selectedPromoterIds.length}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={handleSelectAllPromoterTDS}
                                                    className="text-xs text-orange-700 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300 font-medium"
                                                >
                                                    Select All
                                                </button>
                                                <span className="text-orange-300 dark:text-orange-700">|</span>
                                                <button
                                                    type="button"
                                                    onClick={handleClearAllPromoterTDS}
                                                    className="text-xs text-orange-700 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300 font-medium"
                                                >
                                                    Clear All
                                                </button>
                                            </div>
                                        )}

                                        {/* Search */}
                                        <div className="relative mb-3">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Search shareholders..."
                                                value={shareholderSearchTerm}
                                                onChange={(e) => setShareholderSearchTerm(e.target.value)}
                                                className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>

                                        {/* Shareholders List */}
                                        <div className="space-y-2 max-h-80 overflow-y-auto">
                                            {filteredShareholders.length === 0 ? (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-4">
                                                    No shareholders found
                                                </p>
                                            ) : (
                                                filteredShareholders.map((shareholder) => {
                                                    const isSelected = selectedPromoterIds.includes(shareholder.ShareHolderId);
                                                    const isTDSApplicable = shareholderTDSSelection.promoters[shareholder.ShareHolderId] || false;
                                                    const hasPAN = shareholder.PanNo;

                                                    return (
                                                        <div
                                                            key={shareholder.ShareHolderId}
                                                            className={clsx(
                                                                "rounded-lg border transition-all",
                                                                isSelected
                                                                    ? "bg-blue-100 dark:bg-blue-900/30 border-blue-500 dark:border-blue-600"
                                                                    : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                                                            )}
                                                        >
                                                            <label className="flex items-center gap-3 p-3 cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelected}
                                                                    onChange={() => handlePromoterToggle(shareholder.ShareHolderId)}
                                                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                                />
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                                        {shareholder.ShareHolderName}
                                                                    </p>
                                                                    <div className="flex items-center gap-3 mt-1">
                                                                        <span className="text-xs text-gray-600 dark:text-gray-400">
                                                                            Shares: {formatNumber(shareholder.NoofShares)}
                                                                        </span>
                                                                        <span className="text-xs text-blue-600 dark:text-blue-400">
                                                                            ₹{formatCurrency(shareholder.CalculatedDividendAmount)}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                {hasPAN && (
                                                                    <div className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded">
                                                                        PAN
                                                                    </div>
                                                                )}
                                                            </label>

                                                            {/* TDS Checkbox - Only show if shareholder is selected and TDS % > 0 */}
                                                            {isSelected && formik.values.tdsPercentage > 0 && (
                                                                <div className="px-3 pb-3">
                                                                    <div 
                                                                        className={clsx(
                                                                            "flex items-center gap-2 p-2 rounded border cursor-pointer transition-all",
                                                                            isTDSApplicable
                                                                                ? "bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700"
                                                                                : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-orange-200 dark:hover:border-orange-800"
                                                                        )}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            if (!hasPAN) {
                                                                                toast.warning('PAN is required for TDS deduction');
                                                                                return;
                                                                            }
                                                                            handleTDSToggle(shareholder.ShareHolderId, 'promoter');
                                                                        }}
                                                                    >
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={isTDSApplicable}
                                                                            onChange={(e) => {
                                                                                e.stopPropagation();
                                                                                if (!hasPAN) {
                                                                                    toast.warning('PAN is required for TDS deduction');
                                                                                    return;
                                                                                }
                                                                                handleTDSToggle(shareholder.ShareHolderId, 'promoter');
                                                                            }}
                                                                            disabled={!hasPAN}
                                                                            className="w-3.5 h-3.5 text-orange-600 rounded focus:ring-orange-500"
                                                                        />
                                                                        <ShieldAlert className={clsx(
                                                                            "h-3.5 w-3.5",
                                                                            isTDSApplicable ? "text-orange-600 dark:text-orange-400" : "text-gray-400"
                                                                        )} />
                                                                        <span className={clsx(
                                                                            "text-xs font-medium flex-1",
                                                                            isTDSApplicable ? "text-orange-700 dark:text-orange-400" : "text-gray-600 dark:text-gray-400"
                                                                        )}>
                                                                            Apply TDS ({formik.values.tdsPercentage}%)
                                                                        </span>
                                                                        {!hasPAN && (
                                                                            <span className="text-xs text-red-600 dark:text-red-400">
                                                                                No PAN
                                                                            </span>
                                                                        )}
                                                                        {isTDSApplicable && (
                                                                            <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                                                                                ₹{formatCurrency((shareholder.CalculatedDividendAmount * formik.values.tdsPercentage) / 100)}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>

                                    {/* ESOP Holders */}
                                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <UserCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                                                    ESOP Holders
                                                </h4>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    ({selectedESOPIds.length}/{esopHolders.length})
                                                </span>
                                            </div>
                                            {selectedESOPIds.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedESOPIds([]);
                                                        handleClearAllESOPTDS();
                                                    }}
                                                    className="text-xs text-red-600 hover:text-red-700 dark:text-red-400"
                                                >
                                                    Clear All
                                                </button>
                                            )}
                                        </div>

                                        {/* TDS Bulk Actions */}
                                        {formik.values.tdsPercentage > 0 && selectedESOPIds.length > 0 && (
                                            <div className="mb-3 flex items-center gap-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                                                <ShieldAlert className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
                                                <span className="text-xs text-orange-700 dark:text-orange-400 flex-1">
                                                    TDS Bulk: {esopTDSCount}/{selectedESOPIds.length}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={handleSelectAllESOPTDS}
                                                    className="text-xs text-orange-700 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300 font-medium"
                                                >
                                                    Select All
                                                </button>
                                                <span className="text-orange-300 dark:text-orange-700">|</span>
                                                <button
                                                    type="button"
                                                    onClick={handleClearAllESOPTDS}
                                                    className="text-xs text-orange-700 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300 font-medium"
                                                >
                                                    Clear All
                                                </button>
                                            </div>
                                        )}

                                        {/* Search */}
                                        <div className="relative mb-3">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Search ESOP holders..."
                                                value={esopSearchTerm}
                                                onChange={(e) => setEsopSearchTerm(e.target.value)}
                                                className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>

                                        {/* ESOP List */}
                                        <div className="space-y-2 max-h-80 overflow-y-auto">
                                            {filteredESOPHolders.length === 0 ? (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-4">
                                                    No ESOP holders found
                                                </p>
                                            ) : (
                                                filteredESOPHolders.map((holder) => {
                                                    const isSelected = selectedESOPIds.includes(holder.ShareHolderId);
                                                    const isTDSApplicable = shareholderTDSSelection.esop[holder.ShareHolderId] || false;
                                                    const hasPAN = holder.PanNo;

                                                    return (
                                                        <div
                                                            key={holder.ShareHolderId}
                                                            className={clsx(
                                                                "rounded-lg border transition-all",
                                                                isSelected
                                                                    ? "bg-purple-100 dark:bg-purple-900/30 border-purple-500 dark:border-purple-600"
                                                                    : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                                                            )}
                                                        >
                                                            <label className="flex items-center gap-3 p-3 cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelected}
                                                                    onChange={() => handleESOPToggle(holder.ShareHolderId)}
                                                                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                                                                />
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                                        {holder.ShareHolderName}
                                                                    </p>
                                                                    <div className="flex items-center gap-3 mt-1">
                                                                        <span className="text-xs text-gray-600 dark:text-gray-400">
                                                                            Shares: {formatNumber(holder.NoofShares)}
                                                                        </span>
                                                                        <span className="text-xs text-purple-600 dark:text-purple-400">
                                                                            ₹{formatCurrency(holder.CalculatedDividendAmount)}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                {hasPAN && (
                                                                    <div className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded">
                                                                        PAN
                                                                    </div>
                                                                )}
                                                            </label>

                                                            {/* TDS Checkbox - Only show if holder is selected and TDS % > 0 */}
                                                            {isSelected && formik.values.tdsPercentage > 0 && (
                                                                <div className="px-3 pb-3">
                                                                    <div 
                                                                        className={clsx(
                                                                            "flex items-center gap-2 p-2 rounded border cursor-pointer transition-all",
                                                                            isTDSApplicable
                                                                                ? "bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700"
                                                                                : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-orange-200 dark:hover:border-orange-800"
                                                                        )}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            if (!hasPAN) {
                                                                                toast.warning('PAN is required for TDS deduction');
                                                                                return;
                                                                            }
                                                                            handleTDSToggle(holder.ShareHolderId, 'esop');
                                                                        }}
                                                                    >
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={isTDSApplicable}
                                                                            onChange={(e) => {
                                                                                e.stopPropagation();
                                                                                if (!hasPAN) {
                                                                                    toast.warning('PAN is required for TDS deduction');
                                                                                    return;
                                                                                }
                                                                                handleTDSToggle(holder.ShareHolderId, 'esop');
                                                                            }}
                                                                            disabled={!hasPAN}
                                                                            className="w-3.5 h-3.5 text-orange-600 rounded focus:ring-orange-500"
                                                                        />
                                                                        <ShieldAlert className={clsx(
                                                                            "h-3.5 w-3.5",
                                                                            isTDSApplicable ? "text-orange-600 dark:text-orange-400" : "text-gray-400"
                                                                        )} />
                                                                        <span className={clsx(
                                                                            "text-xs font-medium flex-1",
                                                                            isTDSApplicable ? "text-orange-700 dark:text-orange-400" : "text-gray-600 dark:text-gray-400"
                                                                        )}>
                                                                            Apply TDS ({formik.values.tdsPercentage}%)
                                                                        </span>
                                                                        {!hasPAN && (
                                                                            <span className="text-xs text-red-600 dark:text-red-400">
                                                                                No PAN
                                                                            </span>
                                                                        )}
                                                                        {isTDSApplicable && (
                                                                            <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                                                                                ₹{formatCurrency((holder.CalculatedDividendAmount * formik.values.tdsPercentage) / 100)}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Calculated Summary */}
                            {calculatedValues.totalSharesSelected > 0 && (
                                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Calculator className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                            Distribution Summary
                                        </h3>
                                        {formik.values.tdsPercentage > 0 && (
                                            <span className="text-xs text-orange-600 dark:text-orange-400 flex items-center gap-1 ml-auto">
                                                <ShieldAlert className="h-3 w-3" />
                                                TDS applicable to {calculatedValues.tdsApplicableCount} of {selectedPromoterIds.length + selectedESOPIds.length} shareholders
                                            </span>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {/* Total Shares */}
                                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <Users className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                                <span className="text-xs text-gray-600 dark:text-gray-400">Total Shares</span>
                                            </div>
                                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                                                {formatNumber(calculatedValues.totalSharesSelected)}
                                            </p>
                                        </div>

                                        {/* Gross Amount */}
                                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <DollarSign className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                                                <span className="text-xs text-gray-600 dark:text-gray-400">Gross Amount</span>
                                            </div>
                                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                                                ₹{formatCurrency(calculatedValues.grossDividendAmount)}
                                            </p>
                                        </div>

                                        {/* TDS Amount */}
                                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <Percent className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
                                                <span className="text-xs text-gray-600 dark:text-gray-400">TDS Amount</span>
                                            </div>
                                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                                                ₹{formatCurrency(calculatedValues.totalTDSAmount)}
                                            </p>
                                        </div>

                                        {/* Net Payable */}
                                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <Coins className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                                                <span className="text-xs text-gray-600 dark:text-gray-400">Net Payable</span>
                                            </div>
                                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                                                ₹{formatCurrency(calculatedValues.netPayableAmount)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Validation Warning */}
                                    {calculatedValues.grossDividendAmount > selectedDeclaration.DividendBalance && (
                                        <div className="mt-3 p-2.5 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                            <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5">
                                                <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                                                <span>
                                                    Distribution amount (₹{formatCurrency(calculatedValues.grossDividendAmount)}) exceeds available balance (₹{formatCurrency(selectedDeclaration.DividendBalance)})
                                                </span>
                                            </p>
                                        </div>
                                    )}
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
                                        onChange={(e) => {
                                            formik.handleChange(e);
                                            formik.setFieldTouched('remarks', true, false);
                                        }}
                                        placeholder="Enter remarks for this distribution lot"
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
                        </>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="submit"
                            disabled={isLoading || formik.isSubmitting || !selectedDeclaration || (selectedPromoterIds.length === 0 && selectedESOPIds.length === 0)}
                            className="flex-1 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                            {isLoading || formik.isSubmitting ? (
                                <>
                                    <RotateCcw className="h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Create Distribution Lot
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
                                <span>Select shareholders from approved dividend declaration only</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                                <CheckCircle className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                <span>System auto-fetches bank details for promoters (ShareholderBankDetails) and ESOP holders (EmpolyeeInfo)</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                                <ShieldAlert className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                                <span><strong>NEW:</strong> Select individual shareholders for TDS deduction. Only selected shareholders will have TDS deducted at the specified percentage.</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                                <CheckCircle className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                <span>PAN is mandatory only for shareholders with TDS applicable</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                                <CheckCircle className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                <span>Distribution amount must not exceed available dividend balance</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                                <CheckCircle className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                <span>After approval, dividend balance is deducted and TDS records are created automatically for TDS-applicable shareholders only</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DividendDistributionCreate;