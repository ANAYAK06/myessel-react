import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    Layers, RefreshCw, Plus, Edit, Trash2, Eye, X,
    Save, AlertCircle, Search, Filter, Check
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
    fetchRoleDesign,
    saveNewUserRole,
    updateUserRole,
    deleteUserRole,
    fetchVerificationPendingRoleDesign,
    resetOperationResults,
    clearError,
    selectRoleDesignArray,
    selectVerificationPendingRoleDesignArray,
    selectRoleDesignLoading,
    selectSaveNewUserRoleLoading,
    selectUpdateUserRoleLoading,
    selectDeleteUserRoleLoading,
    selectOperationStatus,
    selectRoleDesignError,
    selectSaveNewUserRoleError,
    selectUpdateUserRoleError,
    selectDeleteUserRoleError
} from '../../slices/userRolesSlice/userRolesSlice';



// CC Types constant
const CC_TYPES = [
    { id: 1, name: 'Capital' },
    { id: 3, name: 'Non-Performing' },
    { id: 6, name: 'Performing' },
    { id: 7, name: 'Other Capital' }
];

const RolesDesignTab = () => {
    const dispatch = useDispatch();
    const { employeeId, roleId } = useSelector((state) => state.auth);

    // Redux state
    const roleDesign = useSelector(selectRoleDesignArray);
    const verificationPendingRoles = useSelector(selectVerificationPendingRoleDesignArray);
    const loading = useSelector(selectRoleDesignLoading);
    const saveLoading = useSelector(selectSaveNewUserRoleLoading);
    const updateLoading = useSelector(selectUpdateUserRoleLoading);
    const deleteLoading = useSelector(selectDeleteUserRoleLoading);
    const operationStatus = useSelector(selectOperationStatus);
    const errors = {
        roleDesign: useSelector(selectRoleDesignError),
        save: useSelector(selectSaveNewUserRoleError),
        update: useSelector(selectUpdateUserRoleError),
        delete: useSelector(selectDeleteUserRoleError)
    };

    // Local state
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedRole, setSelectedRole] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showPendingOnly, setShowPendingOnly] = useState(false);

    // Form state - Updated to match old application
    const [formData, setFormData] = useState({
        RoleName: '',
        ApplicableForCC: 'No',
        Status: 'Approved',
        selectedCCTypes: [],
        CheckCC: 'No' 
    });

    // Load roles on mount
    useEffect(() => {
        dispatch(fetchRoleDesign());
    }, [dispatch]);

    // Handle operation success
    useEffect(() => {
        if (operationStatus === 'saved') {
            toast.success('Role created successfully!');
            setShowModal(false);
            resetForm();
            dispatch(fetchRoleDesign());
            dispatch(resetOperationResults());
        } else if (operationStatus === 'updated') {
            toast.success('Role updated successfully!');
            setShowModal(false);
            resetForm();
            dispatch(fetchRoleDesign());
            dispatch(resetOperationResults());
        } else if (operationStatus === 'deleted') {
            toast.success('Role deleted successfully!');
            setShowDeleteConfirm(false);
            setRoleToDelete(null);
            dispatch(fetchRoleDesign());
            dispatch(resetOperationResults());
        }
    }, [operationStatus, dispatch]);

    // Handle errors
    useEffect(() => {
        Object.entries(errors).forEach(([key, error]) => {
            if (error) {
                toast.error(`Error: ${error}`);
                dispatch(clearError({ errorType: key }));
            }
        });
    }, [errors, dispatch]);

    const resetForm = () => {
        setFormData({
            RoleName: '',
            ApplicableForCC: 'No',
            Status: 'Approved',
            selectedCCTypes: [],
            CheckCC: 'No'
        });
        setSelectedRole(null);
    };

    const handleOpenModal = (mode, role = null) => {
        setModalMode(mode);
        if (role) {
            setSelectedRole(role);
            // Parse ApplicableCCTypes string to array
            const ccTypesArray = role.ApplicableCCTypes
                ? role.ApplicableCCTypes.split(',').map(id => parseInt(id.trim()))
                : [];

            setFormData({
                RoleName: role.RoleCode || '',
                ApplicableForCC: role.ApplicableForCC || 'No',
                Status: role.Status || 'Approved',
                selectedCCTypes: ccTypesArray,
                CheckCC: 'No'
            });
        } else {
            resetForm();
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        resetForm();
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // If changing ApplicableForCC to "No", clear selected CC types
        if (name === 'ApplicableForCC' && value === 'No') {
            setFormData(prev => ({
                ...prev,
                [name]: value,
                selectedCCTypes: []
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleCCTypeToggle = (ccTypeId) => {
        setFormData(prev => {
            const isSelected = prev.selectedCCTypes.includes(ccTypeId);
            return {
                ...prev,
                selectedCCTypes: isSelected
                    ? prev.selectedCCTypes.filter(id => id !== ccTypeId)
                    : [...prev.selectedCCTypes, ccTypeId]
            };
        });
    };

    const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.RoleName.trim()) {
        toast.error('Role Name is required');
        return;
    }

    if (formData.ApplicableForCC === 'Yes' && formData.selectedCCTypes.length === 0) {
        toast.error('Please select at least one CC Type');
        return;
    }

    let applicableCCTypes = '';
    if (formData.ApplicableForCC === 'No') {
        applicableCCTypes = '1,3,6,7';
    } else {
        applicableCCTypes = formData.selectedCCTypes.sort((a, b) => a - b).join(',');
    }

    const payload = {
        businessRole: {
            RoleName: formData.RoleName.trim(),
            ApplicableForCC: formData.ApplicableForCC,
            Status: formData.Status,
            ApplicableCCTypes: applicableCCTypes,
            CheckCC: 'No',
            Createdby: employeeId || 0
        }
    };

    if (modalMode === 'edit' && selectedRole) {
        payload.businessRole.UserRoleID = selectedRole.RoleID;
        payload.businessRole.Action = 'Update'; // Explicitly add Action for update
    } else {
        payload.businessRole.Action = 'Add'; // Add Action for create
    }

    console.log('📤 Final Submitting Payload:', JSON.stringify(payload, null, 2));

    try {
        if (modalMode === 'create') {
            await dispatch(saveNewUserRole(payload)).unwrap();
        } else if (modalMode === 'edit') {
            await dispatch(updateUserRole(payload)).unwrap();
        }
    } catch (error) {
        console.error('Error submitting role:', error);
    }
};
    const handleDeleteClick = (role) => {
        setRoleToDelete(role);
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = async () => {
        if (!roleToDelete) return;

        const payload = {
            businessRole: {
                UserRoleID: roleToDelete.RoleID,
                RoleName: roleToDelete.RoleCode,
                Status: roleToDelete.Status,
                Createdby: employeeId || 0
            }
        };

        try {
            await dispatch(deleteUserRole(payload)).unwrap();
        } catch (error) {
            console.error('Error deleting role:', error);
        }
    };
    const handleRefresh = () => {
        dispatch(fetchRoleDesign());
        if (showPendingOnly && roleId) {
            dispatch(fetchVerificationPendingRoleDesign(roleId));
        }
    };

    // Filter roles based on search and pending filter
    const filteredRoles = (showPendingOnly ? verificationPendingRoles : roleDesign).filter(role =>
        role.RoleCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.RoleID?.toString().includes(searchTerm) ||
        role.RoleDescription?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && roleDesign.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
                <span className="ml-3 text-gray-600 dark:text-gray-300">Loading roles...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Roles Design</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Design and configure role permissions ({roleDesign.length} roles)
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={handleRefresh}
                        disabled={loading}
                        className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                    </button>
                    <button
                        onClick={() => handleOpenModal('create')}
                        className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>New Role</span>
                    </button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by role code, ID, or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                </div>
                <button
                    onClick={() => {
                        setShowPendingOnly(!showPendingOnly);
                        if (!showPendingOnly && roleId) {
                            dispatch(fetchVerificationPendingRoleDesign(roleId));
                        }
                    }}
                    className={`flex items-center space-x-2 px-4 py-2 border rounded-md transition-colors ${showPendingOnly
                        ? 'bg-purple-100 dark:bg-purple-900 border-purple-500 text-purple-700 dark:text-purple-300'
                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                >
                    <Filter className="w-4 h-4" />
                    <span>{showPendingOnly ? 'Show All' : 'Pending Only'}</span>
                </button>
            </div>

            {/* Roles Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                {filteredRoles.length === 0 ? (
                    <div className="text-center py-12">
                        <Layers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No Roles Found
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            {searchTerm ? 'No roles match your search criteria.' : 'No roles have been configured yet.'}
                        </p>
                        {!searchTerm && (
                            <button
                                onClick={() => handleOpenModal('create')}
                                className="mt-4 flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors mx-auto"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Create First Role</span>
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                            <thead className="bg-indigo-600 text-white">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">
                                        Role ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">
                                        Role Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-center text-sm font-medium uppercase tracking-wider">
                                        Applicable For CC
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">
                                        CC Types
                                    </th>
                                    <th className="px-6 py-3 text-center text-sm font-medium uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                                {filteredRoles.map((role, index) => (
                                    <tr
                                        key={role.RoleID || index}
                                        className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}
                                    >
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                            {role.RoleID || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                            {role.RoleCode || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-md ${role.Status === 'Approved'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                : role.Status === 'Pending'
                                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                }`}>
                                                {role.Status || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-md ${role.ApplicableForCC === 'Yes'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {role.ApplicableForCC || 'No'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                            {role.CCTypeNames && role.CCTypeNames.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {role.CCTypeNames.map((ccType, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded-md"
                                                        >
                                                            {ccType}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : role.ApplicableCCTypes ? (
                                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                                    IDs: {role.ApplicableCCTypes}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center space-x-2">
                                                <button
                                                    onClick={() => handleOpenModal('view', role)}
                                                    className="p-1 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                    title="View"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleOpenModal('edit', role)}
                                                    className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(role)}
                                                    className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Role Modal */}
            {showModal && (
                <RoleModal
                    mode={modalMode}
                    formData={formData}
                    loading={saveLoading || updateLoading}
                    onInputChange={handleInputChange}
                    onCCTypeToggle={handleCCTypeToggle}
                    onSubmit={handleSubmit}
                    onClose={handleCloseModal}
                />
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <DeleteConfirmModal
                    role={roleToDelete}
                    loading={deleteLoading}
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => {
                        setShowDeleteConfirm(false);
                        setRoleToDelete(null);
                    }}
                />
            )}
        </div>
    );
};

// Role Modal Component with Multi-Select CC Types
const RoleModal = ({ mode, formData, loading, onInputChange, onCCTypeToggle, onSubmit, onClose }) => {
    const isViewMode = mode === 'view';
    const title = mode === 'create' ? 'Create New Role' : mode === 'edit' ? 'Edit Role' : 'View Role';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Modal Body */}
                <form onSubmit={onSubmit} className="p-6 space-y-4">
                    {/* Role Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Role Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="RoleName"
                            value={formData.RoleName}
                            onChange={onInputChange}
                            disabled={isViewMode}
                            required
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-900"
                            placeholder="Enter role name (e.g., Consultant, Manager)"
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Status
                        </label>
                        <select
                            name="Status"
                            value={formData.Status}
                            onChange={onInputChange}
                            disabled={isViewMode}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-900"
                        >
                            <option value="Approved">Approved</option>
                            <option value="Pending">Pending</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>

                    {/* Applicable For CC */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Applicable For CC
                        </label>
                        <select
                            name="ApplicableForCC"
                            value={formData.ApplicableForCC}
                            onChange={onInputChange}
                            disabled={isViewMode}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-900"
                        >
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                        </select>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {formData.ApplicableForCC === 'No'
                                ? 'All CC types (1,3,6,7) will be automatically assigned'
                                : 'Select specific CC types below'}
                        </p>
                    </div>

                    {/* CC Types Multi-Select - Only show if ApplicableForCC is Yes */}
                    {formData.ApplicableForCC === 'Yes' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Select CC Types <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {CC_TYPES.map((ccType) => {
                                    const isSelected = formData.selectedCCTypes.includes(ccType.id);
                                    return (
                                        <button
                                            key={ccType.id}
                                            type="button"
                                            onClick={() => !isViewMode && onCCTypeToggle(ccType.id)}
                                            disabled={isViewMode}
                                            className={`flex items-center justify-between px-4 py-3 border rounded-md transition-colors ${isSelected
                                                ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 text-purple-700 dark:text-purple-300'
                                                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                } ${isViewMode ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                                        >
                                            <span className="text-sm font-medium">
                                                {ccType.id} - {ccType.name}
                                            </span>
                                            {isSelected && (
                                                <Check className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                            {formData.selectedCCTypes.length > 0 && (
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                    Selected: {formData.selectedCCTypes.sort((a, b) => a - b).join(', ')}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Info Box */}
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-md p-4">
                        <div className="flex items-start space-x-2">
                            <AlertCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                            <div className="text-sm text-indigo-800 dark:text-indigo-300">
                                <p className="font-medium mb-1">CC Types Information:</p>
                                <ul className="list-disc list-inside space-y-1 text-xs">
                                    <li><strong>1</strong> - Capital</li>
                                    <li><strong>3</strong> - Non-Performing</li>
                                    <li><strong>6</strong> - Performing</li>
                                    <li><strong>7</strong> - Other Capital</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            {isViewMode ? 'Close' : 'Cancel'}
                        </button>
                        {!isViewMode && (
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        <span>{mode === 'create' ? 'Create Role' : 'Update Role'}</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

// Delete Confirmation Modal (unchanged)
const DeleteConfirmModal = ({ role, loading, onConfirm, onCancel }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
                <div className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="flex-shrink-0">
                            <AlertCircle className="w-6 h-6 text-red-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Delete Role
                        </h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Are you sure you want to delete the role <strong>{role?.RoleCode}</strong> (ID: {role?.RoleID})? This action cannot be undone.
                    </p>
                    <div className="flex items-center justify-end space-x-3">
                        <button
                            onClick={onCancel}
                            disabled={loading}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={loading}
                            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    <span>Deleting...</span>
                                </>
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4" />
                                    <span>Delete</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RolesDesignTab;