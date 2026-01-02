import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
    fetchCostCenterDetails,
    checkCCCodeExistence,
    saveNewCostCenter,
    fetchCostCenterStatesList,
    fetchGroupRegions,
    resetFormData,
    resetCCCodeExists,
    clearSaveResult,
    selectCostCenterDetailsArray,
    selectCCCodeExists,
    selectSaveResult,
    selectStatesListArray,
    selectGroupRegionsArray,
    selectCostCenterDetailsLoading,
    selectCCCodeCheckLoading,
    selectSaveCostCenterLoading,
    selectStatesListLoading,
    selectGroupRegionsLoading,
    selectCCCodeCheckError,
    selectSaveCostCenterError,
} from '../../slices/costCenterSlice/costCenterCreationSlice';
import CustomDatePicker from '../../components/CustomDatePicker';
import {
    Building, Plus, X, CheckCircle, XCircle, AlertCircle,
    Loader2, Save, Search,  ChevronDown, ChevronUp,
    MapPin, User, Phone, Home,  IndianRupee,
    FileText, Globe, Briefcase,  TrendingUp,
     Package, Shield, RefreshCw
} from 'lucide-react';

const CostCenterCreationManagement = () => {
    const dispatch = useDispatch();

    // Auth State
    const { userData, userDetails } = useSelector((state) => state.auth);
    const roleId = userData?.roleId || userData?.RID;
    const uid = userData?.UID || userData?.uid;

    // Redux State
    const costCenterDetails = useSelector(selectCostCenterDetailsArray);
    const ccCodeExists = useSelector(selectCCCodeExists);
    const saveResult = useSelector(selectSaveResult);
    const statesList = useSelector(selectStatesListArray);
   
    const costCenterDetailsLoading = useSelector(selectCostCenterDetailsLoading);
    const ccCodeCheckLoading = useSelector(selectCCCodeCheckLoading);
    const saveCostCenterLoading = useSelector(selectSaveCostCenterLoading);
    const statesListLoading = useSelector(selectStatesListLoading);
    const groupRegionsLoading = useSelector(selectGroupRegionsLoading);
    const ccCodeCheckError = useSelector(selectCCCodeCheckError);
    const saveCostCenterError = useSelector(selectSaveCostCenterError);

    const groupRegions = useSelector(selectGroupRegionsArray);


    // Local State
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [expandedCCId, setExpandedCCId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [filterState, setFilterState] = useState('All');
    const [ccCodeInput, setCCCodeInput] = useState('');
    const [ccCodeTouched, setCCCodeTouched] = useState(false);

    // Static dropdowns
    const costCenterTypes = ['Performing', 'Non-Performing', 'Capital', 'Other Capital'];
    const subTypes = ['Manufacturing', 'Service', 'Trading'];
    const storeTypes = ['Yes', 'No'];

    // Validation Schema
    const validationSchema = Yup.object({
        CCCode: Yup.string()
            .required('Cost Center Code is required')
            .matches(/^\d+$/, 'CC Code must contain only numbers'),
        CCName: Yup.string()
            .required('Cost Center Name is required')
            .min(3, 'Name must be at least 3 characters'),
        CCType: Yup.string().required('Cost Center Type is required'),
        SubType: Yup.string().when('CCType', {
            is: 'Performing',
            then: () => Yup.string().required('Sub Type is required for Performing CC'),
            otherwise: () => Yup.string()
        }),
        StateID: Yup.number().required('State is required'),
        GroupID: Yup.number().required('Group is required'),
        CCInchargeName: Yup.string().required('Incharge Name is required'),
        InchargePhNo: Yup.string()
            .required('Incharge Phone is required')
            .matches(/^[0-9]{10}$/, 'Phone must be 10 digits'),
        SiteAddress: Yup.string().required('Site Address is required'),
        DayLimit: Yup.number()
            .required('Day Limit is required')
            .min(0, 'Day Limit must be positive'),
        VoucherLimit: Yup.number()
            .min(0, 'Voucher Limit must be positive'),
        StoreType: Yup.string().required('Store Type is required'),
    });

    // Formik Setup
    const formik = useFormik({
        initialValues: {
            CCCode: '',
            CCName: '',
            CCType: '',
            SubType: '',
            StateID: '',
            GroupID: '',
            CCInchargeName: '',
            InchargePhNo: '',
            SiteAddress: '',
            PhoneNo: '',
            DayLimit: 0,
            VoucherLimit: 0,
            StoreType: '',
            EPPLFinalOfferNo: '',
            FinalOfferDate: '',
            ClientAcceptanceReferenceNo: '',
            ClientAcceptanceDate: '',
            ClientInchargeName: '',
            ClientInchargePhNo: '',
            ClientInchargemailid: '',
            Createdby: uid || null,
        },
        validationSchema,
        onSubmit: async (values) => {
            console.log('📝 Submitting Cost Center Creation Form');
            console.log('Form Values:', values);

            // Validation checks
            if (ccCodeExists === true) {
                toast.error('CC Code already exists. Please use a different code.');
                return;
            }

            if (ccCodeExists === null && ccCodeTouched) {
                toast.error('Please wait for CC Code validation to complete');
                return;
            }

            try {
                const payload = {
                    ...values,
                    CCCode: `CC-${values.CCCode}`, // Add CC- prefix for API
                    StateID: parseInt(values.StateID),
                    GroupID: parseInt(values.GroupID),
                    DayLimit: parseFloat(values.DayLimit),
                    VoucherLimit: parseFloat(values.VoucherLimit),
                };

                await dispatch(saveNewCostCenter(payload)).unwrap();
            } catch (error) {
                console.error('❌ Error saving cost center:', error);
            }
        },
    });

    // Initial data load
    useEffect(() => {
        console.log('🎯 CostCenterCreationManagement Component Mounted');
        console.log('🎯 User Data:', userData);
        console.log('🎯 Role ID:', roleId, 'UID:', uid);
        
        dispatch(fetchCostCenterDetails());
        dispatch(fetchCostCenterStatesList());
        dispatch(fetchGroupRegions());

        return () => {
            console.log('🔄 Component Unmounting - Resetting State');
            dispatch(resetFormData());
            dispatch(resetCCCodeExists());
            dispatch(clearSaveResult());
        };
    }, [dispatch, roleId, uid, userData]);

  

    // Handle Save Result
    useEffect(() => {
        if (saveResult) {
            console.log('💾 Save Result:', saveResult);

            if (saveResult.IsSuccessful) {
                toast.success('Cost Center created successfully!');
                setTimeout(() => {
                    dispatch(fetchCostCenterDetails());
                    formik.resetForm();
                    setCCCodeInput('');
                    setCCCodeTouched(false);
                    dispatch(resetCCCodeExists());
                    setShowCreateForm(false);
                }, 1000);
            } else {
                toast.error(saveResult.ResponseCode || 'Failed to save Cost Center');
            }
        }
    }, [saveResult, dispatch]);

    // Handle Save Error
    useEffect(() => {
        if (saveCostCenterError) {
            toast.error(saveCostCenterError);
        }
    }, [saveCostCenterError]);

    // Handle CC Code Input Change
    const handleCCCodeChange = (e) => {
    const value = e.target.value;
    // Only allow numbers
    if (/^\d*$/.test(value)) {
        setCCCodeInput(value);
        formik.setFieldValue('CCCode', value);
        
        // Reset validation state when user is typing
        if (ccCodeExists !== null) {
            dispatch(resetCCCodeExists());
        }
    }
};

const handleCCCodeBlur = (e) => {
    formik.handleBlur(e);
    setCCCodeTouched(true);
    
    const value = formik.values.CCCode.trim();
    if (value.length > 0) {
        const fullCCCode = `CC-${value}`;
        console.log('🔍 Checking CC Code on blur:', fullCCCode);
        dispatch(checkCCCodeExistence(fullCCCode));
    }
};

    // CC Code Validation Status Component
    const CCCodeValidationStatus = () => {
        if (!ccCodeTouched || !formik.values.CCCode || formik.values.CCCode.trim().length === 0) {
            return null;
        }

        if (ccCodeCheckLoading) {
            return (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <Loader2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400 animate-spin" />
                    <span className="text-sm text-indigo-600 dark:text-indigo-400">Checking...</span>
                </div>
            );
        }

        if (ccCodeCheckError) {
            return (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                    <span className="text-sm text-amber-600 dark:text-amber-400">Check failed</span>
                </div>
            );
        }

        if (ccCodeExists === true) {
            return (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-500" />
                    <span className="text-sm text-red-600 dark:text-red-400 font-medium">Already exists</span>
                </div>
            );
        }

        if (ccCodeExists === false) {
            return (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">Available</span>
                </div>
            );
        }

        return null;
    };

    // Filter Cost Centers
    const filteredCostCenters = costCenterDetails.filter(cc => {
        const matchesSearch = cc.CCName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cc.CCCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cc.CCInchargeName?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesType = filterType === 'All' || cc.CCType === filterType;
        const matchesState = filterState === 'All' || cc.State === filterState;

        return matchesSearch && matchesType && matchesState;
    });

    const uniqueTypes = [...new Set(costCenterDetails.map(cc => cc.CCType).filter(Boolean))];
    const uniqueStates = [...new Set(costCenterDetails.map(cc => cc.State).filter(Boolean))];

    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'decimal',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200';
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200';
            case 'rejected': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-200';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 rounded-2xl shadow-xl p-8 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Building className="h-10 w-10" />
                            <div>
                                <h1 className="text-3xl font-bold">Cost Center Management</h1>
                                <p className="text-indigo-100 dark:text-indigo-200 text-lg mt-1">
                                    Create and manage cost centers across your organization
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => dispatch(fetchCostCenterDetails())}
                                className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all"
                                title="Refresh"
                            >
                                <RefreshCw className={`h-5 w-5 ${costCenterDetailsLoading ? 'animate-spin' : ''}`} />
                            </button>
                            <button
                                onClick={() => setShowCreateForm(!showCreateForm)}
                                className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 dark:bg-gray-800 dark:text-indigo-400 rounded-xl font-semibold hover:shadow-lg transition-all"
                            >
                                {showCreateForm ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                                {showCreateForm ? 'Cancel' : 'Add Cost Center'}
                            </button>
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <Building className="h-8 w-8" />
                                <div>
                                    <p className="text-sm text-indigo-100 dark:text-indigo-200">Total Centers</p>
                                    <p className="text-2xl font-bold">{costCenterDetails.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <TrendingUp className="h-8 w-8" />
                                <div>
                                    <p className="text-sm text-indigo-100 dark:text-indigo-200">Performing</p>
                                    <p className="text-2xl font-bold">
                                        {costCenterDetails.filter(cc => cc.CCType === 'Performing').length}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <Shield className="h-8 w-8" />
                                <div>
                                    <p className="text-sm text-indigo-100 dark:text-indigo-200">Non-Performing</p>
                                    <p className="text-2xl font-bold">
                                        {costCenterDetails.filter(cc => cc.CCType === 'Non-Performing').length}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <Globe className="h-8 w-8" />
                                <div>
                                    <p className="text-sm text-indigo-100 dark:text-indigo-200">States</p>
                                    <p className="text-2xl font-bold">{uniqueStates.length}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto">
                {/* Create Form */}
                {showCreateForm && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-6">
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Plus className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                Create New Cost Center
                            </h2>
                        </div>

                        <form onSubmit={formik.handleSubmit} className="p-8">
                            <div className="space-y-8">
                                {/* Basic Information */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                        Basic Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* CC Code */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Cost Center Code <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
                                                    CC-
                                                </div>
                                                <input
                                                    type="text"
                                                    name="CCCode"
                                                    value={ccCodeInput}
                                                    onChange={handleCCCodeChange}
                                                    onBlur={handleCCCodeBlur}
                                                    placeholder="001"
                                                    className={`w-full pl-12 pr-32 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all dark:bg-gray-700 dark:text-white ${
                                                        ccCodeExists === true 
                                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200 dark:border-red-600' 
                                                            : ccCodeExists === false
                                                            ? 'border-green-300 focus:border-green-500 focus:ring-green-200 dark:border-green-600'
                                                            : formik.touched.CCCode && formik.errors.CCCode
                                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200 dark:border-red-600'
                                                            : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200 dark:border-gray-600'
                                                    }`}
                                                />
                                                <CCCodeValidationStatus />
                                            </div>
                                            {formik.touched.CCCode && formik.errors.CCCode && (
                                                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formik.errors.CCCode}</p>
                                            )}
                                            {ccCodeExists === true && (
                                                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                                                    CC-{formik.values.CCCode} already exists. Please choose a different code.
                                                </p>
                                            )}
                                            {formik.values.CCCode && (
                                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                                    Full Code: CC-{formik.values.CCCode}
                                                </p>
                                            )}
                                        </div>

                                        {/* CC Name */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Cost Center Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="CCName"
                                                value={formik.values.CCName}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                placeholder="Enter Cost Center Name"
                                                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all dark:bg-gray-700 dark:text-white ${
                                                    formik.touched.CCName && formik.errors.CCName
                                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200 dark:border-red-600'
                                                        : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200 dark:border-gray-600'
                                                }`}
                                            />
                                            {formik.touched.CCName && formik.errors.CCName && (
                                                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formik.errors.CCName}</p>
                                            )}
                                        </div>

                                        {/* CC Type */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Cost Center Type <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                name="CCType"
                                                value={formik.values.CCType}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all dark:bg-gray-700 dark:text-white ${
                                                    formik.touched.CCType && formik.errors.CCType
                                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200 dark:border-red-600'
                                                        : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200 dark:border-gray-600'
                                                }`}
                                            >
                                                <option value="">Select Type</option>
                                                {costCenterTypes.map((type) => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                            {formik.touched.CCType && formik.errors.CCType && (
                                                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formik.errors.CCType}</p>
                                            )}
                                        </div>

                                        {/* Sub Type - Only for Performing */}
                                        {formik.values.CCType === 'Performing' && (
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                    Sub Type <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    name="SubType"
                                                    value={formik.values.SubType}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all dark:bg-gray-700 dark:text-white ${
                                                        formik.touched.SubType && formik.errors.SubType
                                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200 dark:border-red-600'
                                                            : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200 dark:border-gray-600'
                                                    }`}
                                                >
                                                    <option value="">Select Sub Type</option>
                                                    {subTypes.map((type) => (
                                                        <option key={type} value={type}>{type}</option>
                                                    ))}
                                                </select>
                                                {formik.touched.SubType && formik.errors.SubType && (
                                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formik.errors.SubType}</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Location Information */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                        Location Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* State */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                State <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                name="StateID"
                                                value={formik.values.StateID}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                disabled={statesListLoading}
                                                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all dark:bg-gray-700 dark:text-white ${
                                                    formik.touched.StateID && formik.errors.StateID
                                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200 dark:border-red-600'
                                                        : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200 dark:border-gray-600'
                                                }`}
                                            >
                                                <option value="">
                                                    {statesListLoading ? 'Loading states...' : 'Select State'}
                                                </option>
                                                {statesList.map((state) => (
                                                    <option key={state.State_ID} value={state.State_ID}>
                                                        {state.State_Name}
                                                    </option>
                                                ))}
                                            </select>
                                            {formik.touched.StateID && formik.errors.StateID && (
                                                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formik.errors.StateID}</p>
                                            )}
                                        </div>

                                        {/* Group */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Group <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                name="GroupID"
                                                value={formik.values.GroupID}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                disabled={groupRegionsLoading}
                                                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all dark:bg-gray-700 dark:text-white ${
                                                    formik.touched.GroupID && formik.errors.GroupID
                                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200 dark:border-red-600'
                                                        : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200 dark:border-gray-600'
                                                }`}
                                            >
                                                <option value="">
                                                    {groupRegionsLoading ? 'Loading groups...' : 'Select Group'}
                                                </option>
                                                {groupRegions.map((group) => (
                                                    <option key={group.GroupID} value={group.GroupID}>
                                                        {group.GroupName}
                                                    </option>
                                                ))}
                                            </select>
                                            {formik.touched.GroupID && formik.errors.GroupID && (
                                                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formik.errors.GroupID}</p>
                                            )}
                                        </div>

                                        {/* Site Address */}
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Site Address <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                name="SiteAddress"
                                                value={formik.values.SiteAddress}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                placeholder="Enter complete site address"
                                                rows="3"
                                                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all dark:bg-gray-700 dark:text-white ${
                                                    formik.touched.SiteAddress && formik.errors.SiteAddress
                                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200 dark:border-red-600'
                                                        : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200 dark:border-gray-600'
                                                }`}
                                            />
                                            {formik.touched.SiteAddress && formik.errors.SiteAddress && (
                                                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formik.errors.SiteAddress}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Incharge Information */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                        Incharge Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Incharge Name */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Incharge Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="CCInchargeName"
                                                value={formik.values.CCInchargeName}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                placeholder="Enter Incharge Name"
                                                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all dark:bg-gray-700 dark:text-white ${
                                                    formik.touched.CCInchargeName && formik.errors.CCInchargeName
                                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200 dark:border-red-600'
                                                        : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200 dark:border-gray-600'
                                                }`}
                                            />
                                            {formik.touched.CCInchargeName && formik.errors.CCInchargeName && (
                                                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formik.errors.CCInchargeName}</p>
                                            )}
                                        </div>

                                        {/* Incharge Phone */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Incharge Phone <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="InchargePhNo"
                                                value={formik.values.InchargePhNo}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                placeholder="10 digit phone number"
                                                maxLength="10"
                                                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all dark:bg-gray-700 dark:text-white ${
                                                    formik.touched.InchargePhNo && formik.errors.InchargePhNo
                                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200 dark:border-red-600'
                                                        : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200 dark:border-gray-600'
                                                }`}
                                            />
                                            {formik.touched.InchargePhNo && formik.errors.InchargePhNo && (
                                                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formik.errors.InchargePhNo}</p>
                                            )}
                                        </div>

                                        {/* CC Phone */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Cost Center Phone
                                            </label>
                                            <input
                                                type="text"
                                                name="PhoneNo"
                                                value={formik.values.PhoneNo}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                placeholder="10 digit phone number"
                                                maxLength="10"
                                                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Financial Limits */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <IndianRupee className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                        Financial Limits
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* Day Limit */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Day Limit <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                name="DayLimit"
                                                value={formik.values.DayLimit}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                placeholder="0.00"
                                                step="0.01"
                                                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all dark:bg-gray-700 dark:text-white ${
                                                    formik.touched.DayLimit && formik.errors.DayLimit
                                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200 dark:border-red-600'
                                                        : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200 dark:border-gray-600'
                                                }`}
                                            />
                                            {formik.touched.DayLimit && formik.errors.DayLimit && (
                                                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formik.errors.DayLimit}</p>
                                            )}
                                        </div>

                                        {/* Voucher Limit */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Voucher Limit
                                            </label>
                                            <input
                                                type="number"
                                                name="VoucherLimit"
                                                value={formik.values.VoucherLimit}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                placeholder="0.00"
                                                step="0.01"
                                                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>

                                        {/* Store Type */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Store Type <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                name="StoreType"
                                                value={formik.values.StoreType}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all dark:bg-gray-700 dark:text-white ${
                                                    formik.touched.StoreType && formik.errors.StoreType
                                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200 dark:border-red-600'
                                                        : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200 dark:border-gray-600'
                                                }`}
                                            >
                                                <option value="">Select Store Type</option>
                                                {storeTypes.map((type) => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                            {formik.touched.StoreType && formik.errors.StoreType && (
                                                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formik.errors.StoreType}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Client & Contract Information */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <Briefcase className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                        Client & Contract Information (Optional)
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Final Offer No */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Final Offer Number
                                            </label>
                                            <input
                                                type="text"
                                                name="EPPLFinalOfferNo"
                                                value={formik.values.EPPLFinalOfferNo}
                                                onChange={formik.handleChange}
                                                placeholder="Enter Final Offer Number"
                                                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>

                                        {/* Final Offer Date */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Final Offer Date
                                            </label>
                                            <CustomDatePicker
                                                selected={formik.values.FinalOfferDate}
                                                onChange={(date) => formik.setFieldValue('FinalOfferDate', date)}
                                                placeholderText="Select Final Offer Date"
                                                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>

                                        {/* Client Acceptance Reference */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Client Acceptance Reference
                                            </label>
                                            <input
                                                type="text"
                                                name="ClientAcceptanceReferenceNo"
                                                value={formik.values.ClientAcceptanceReferenceNo}
                                                onChange={formik.handleChange}
                                                placeholder="Enter Reference Number"
                                                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>

                                        {/* Client Acceptance Date */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Client Acceptance Date
                                            </label>
                                            <CustomDatePicker
                                                selected={formik.values.ClientAcceptanceDate}
                                                onChange={(date) => formik.setFieldValue('ClientAcceptanceDate', date)}
                                                placeholderText="Select Client Acceptance Date"
                                                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>

                                        {/* Client Incharge Name */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Client Incharge Name
                                            </label>
                                            <input
                                                type="text"
                                                name="ClientInchargeName"
                                                value={formik.values.ClientInchargeName}
                                                onChange={formik.handleChange}
                                                placeholder="Enter Client Incharge Name"
                                                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>

                                        {/* Client Incharge Phone */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Client Incharge Phone
                                            </label>
                                            <input
                                                type="text"
                                                name="ClientInchargePhNo"
                                                value={formik.values.ClientInchargePhNo}
                                                onChange={formik.handleChange}
                                                placeholder="10 digit phone number"
                                                maxLength="10"
                                                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>

                                        {/* Client Incharge Email */}
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Client Incharge Email
                                            </label>
                                            <input
                                                type="email"
                                                name="ClientInchargemailid"
                                                value={formik.values.ClientInchargemailid}
                                                onChange={formik.handleChange}
                                                placeholder="Enter Email Address"
                                                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Form Actions */}
                                <div className="flex gap-4 pt-6 border-t dark:border-gray-700">
                                    <button
                                        type="submit"
                                        disabled={!formik.isValid || saveCostCenterLoading || ccCodeExists !== false}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold transition-all transform ${
                                            formik.isValid && !saveCostCenterLoading && ccCodeExists === false
                                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                                                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                        }`}
                                    >
                                        {saveCostCenterLoading ? (
                                            <>
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                <span>Creating...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-5 w-5" />
                                                <span>Create Cost Center</span>
                                            </>
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            formik.resetForm();
                                            setCCCodeInput('');
                                            setCCCodeTouched(false);
                                            dispatch(resetCCCodeExists());
                                        }}
                                        disabled={saveCostCenterLoading}
                                        className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Reset
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setShowCreateForm(false)}
                                        disabled={saveCostCenterLoading}
                                        className="px-6 py-3 border-2 border-red-300 dark:border-red-600 text-red-700 dark:text-red-400 rounded-xl font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                )}

                {/* Cost Centers List */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Building className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                Existing Cost Centers ({filteredCostCenters.length})
                            </h2>

                            {/* Search and Filters */}
                            <div className="flex flex-col md:flex-row gap-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 pr-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="All">All Types</option>
                                    {uniqueTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                                <select
                                    value={filterState}
                                    onChange={(e) => setFilterState(e.target.value)}
                                    className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="All">All States</option>
                                    {uniqueStates.map(state => (
                                        <option key={state} value={state}>{state}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        {costCenterDetailsLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 text-indigo-600 dark:text-indigo-400 animate-spin mr-3" />
                                <p className="text-gray-600 dark:text-gray-400">Loading cost centers...</p>
                            </div>
                        ) : filteredCostCenters.length === 0 ? (
                            <div className="text-center py-12">
                                <Building className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                <p className="text-gray-500 dark:text-gray-400">No cost centers found!</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredCostCenters.map((cc) => (
                                    <div key={cc.CC_Id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        {/* Summary Row */}
                                        <div
                                            className="p-6 cursor-pointer"
                                            onClick={() => setExpandedCCId(expandedCCId === cc.CC_Id ? null : cc.CC_Id)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4 flex-1">
                                                    <div className="w-12 h-12 rounded-full border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-indigo-100 dark:from-indigo-800/50 dark:to-indigo-800/50 flex items-center justify-center">
                                                        <Building className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <h3 className="font-bold text-gray-900 dark:text-white">{cc.CCName}</h3>
                                                            <span className="px-3 py-1 text-xs rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-700">
                                                                {cc.CCCode}
                                                            </span>
                                                            <span className={`px-3 py-1 text-xs rounded-full border ${getStatusColor(cc.CCStatus)}`}>
                                                                {cc.CCStatus}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                                            <span className="flex items-center gap-1">
                                                                <Package className="w-4 h-4" />
                                                                {cc.CCType}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <MapPin className="w-4 h-4" />
                                                                {cc.State}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <User className="w-4 h-4" />
                                                                {cc.CCInchargeName}
                                                            </span>
                                                            <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                                                                <IndianRupee className="w-4 h-4" />
                                                                ₹{formatCurrency(cc.DayLimit)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {expandedCCId === cc.CC_Id ? (
                                                    <ChevronUp className="w-5 h-5 text-gray-400" />
                                                ) : (
                                                    <ChevronDown className="w-5 h-5 text-gray-400" />
                                                )}
                                            </div>
                                        </div>

                                        {/* Expanded Details */}
                                        {expandedCCId === cc.CC_Id && (
                                            <div className="px-6 pb-6 bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-800 dark:to-indigo-900/20">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Basic Info</span>
                                                        </div>
                                                        <div className="space-y-1 text-sm">
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-500 dark:text-gray-400">Type:</span>
                                                                <span className="font-medium dark:text-white">{cc.CCType}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-500 dark:text-gray-400">Sub Type:</span>
                                                                <span className="font-medium dark:text-white">{cc.SubType || 'N/A'}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-500 dark:text-gray-400">Store Type:</span>
                                                                <span className="font-medium dark:text-white">{cc.StoreType || 'N/A'}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <IndianRupee className="w-4 h-4 text-green-600 dark:text-green-400" />
                                                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Financial</span>
                                                        </div>
                                                        <div className="space-y-1 text-sm">
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-500 dark:text-gray-400">Day Limit:</span>
                                                                <span className="font-medium text-green-600 dark:text-green-400">₹{formatCurrency(cc.DayLimit)}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-500 dark:text-gray-400">Voucher Limit:</span>
                                                                <span className="font-medium text-orange-600 dark:text-orange-400">₹{formatCurrency(cc.VoucherLimit)}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Phone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Contact</span>
                                                        </div>
                                                        <div className="space-y-1 text-sm">
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-500 dark:text-gray-400">Incharge Ph:</span>
                                                                <span className="font-medium dark:text-white">{cc.InchargePhNo}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-500 dark:text-gray-400">CC Phone:</span>
                                                                <span className="font-medium dark:text-white">{cc.PhoneNo || 'N/A'}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 md:col-span-2">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Home className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Location</span>
                                                        </div>
                                                        <div className="text-sm">
                                                            <div className="flex justify-between mb-1">
                                                                <span className="text-gray-500 dark:text-gray-400">State:</span>
                                                                <span className="font-medium dark:text-white">{cc.State}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500 dark:text-gray-400">Address:</span>
                                                                <p className="font-medium mt-1 dark:text-white">{cc.SiteAddress}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {(cc.ClientInchargeName || cc.EPPLFinalOfferNo) && (
                                                        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <Briefcase className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Client Info</span>
                                                            </div>
                                                            <div className="space-y-1 text-sm">
                                                                {cc.ClientInchargeName && (
                                                                    <div className="flex justify-between">
                                                                        <span className="text-gray-500 dark:text-gray-400">Client Name:</span>
                                                                        <span className="font-medium dark:text-white">{cc.ClientInchargeName}</span>
                                                                    </div>
                                                                )}
                                                                {cc.EPPLFinalOfferNo && (
                                                                    <div className="flex justify-between">
                                                                        <span className="text-gray-500 dark:text-gray-400">Offer No:</span>
                                                                        <span className="font-medium dark:text-white">{cc.EPPLFinalOfferNo}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CostCenterCreationManagement;