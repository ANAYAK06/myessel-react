import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    Users, RefreshCw, Plus, Edit, Eye, X,
    Save, AlertCircle, Search, Filter, UserCheck
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
    fetchEmployeesByCurrentRole,
    fetchAllEmployees,
    saveEmployeeRoleAssignment,
    updateEmployeeRoleAssignment,
    resetOperationResults,
    clearError,
    selectAllEmployeesArray,
    selectEmployeesByRoleArray,
    selectAllEmployeesLoading,
    selectSaveRoleAssignmentLoading,
    selectUpdateRoleAssignmentLoading,
    selectOperationStatus,
    selectErrors,
    fetchUserCCByRoleId
} from '../../slices/userRolesSlice/userRoleAssignSlice';
import {
    fetchRoleDesign,
    selectRoleDesignArray
} from '../../slices/userRolesSlice/userRolesSlice';

const RoleChangeTab = () => {
    const dispatch = useDispatch();
    const { userData } = useSelector((state) => state.auth);
    const loggedInRoleId = userData?.roleId || userData?.RID;
    const loggedInUserId = userData?.UID || userData?.uid;

    // Redux state
    const allEmployees = useSelector(selectAllEmployeesArray);
    const employeesByRole = useSelector(selectEmployeesByRoleArray);
    const availableRoles = useSelector(selectRoleDesignArray);

    // Get cost centers - handle nested Data.UserCC structure
    const availableCostCenters = useSelector((state) => {
        const ccData = state.empRoleAssignment?.userCCByRole;
        console.log('🔍 Raw Redux CC Data:', ccData);

        // Handle different possible data structures
        if (Array.isArray(ccData)) {
            return ccData;
        }
        if (ccData?.Data?.UserCC && Array.isArray(ccData.Data.UserCC)) {
            return ccData.Data.UserCC;
        }
        if (ccData?.UserCC && Array.isArray(ccData.UserCC)) {
            return ccData.UserCC;
        }
        return [];
    });

    const loading = useSelector(selectAllEmployeesLoading);
    const saveLoading = useSelector(selectSaveRoleAssignmentLoading);
    const updateLoading = useSelector(selectUpdateRoleAssignmentLoading);
    const operationStatus = useSelector(selectOperationStatus);
    const errors = useSelector(selectErrors);

    // Local state
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('assign'); // 'assign', 'edit', 'view'
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterByRole, setFilterByRole] = useState('all');
    const [filterByStatus, setFilterByStatus] = useState('all'); // 'all', 'Active', 'InActive'

    // Form state
    const [formData, setFormData] = useState({
        userId: '',
        username: '',
        fullName: '',
        currentRoleId: '',
        currentRoleName: '',
        newRoleId: '',
        effectiveDate: new Date().toISOString().split('T')[0],
        remarks: '',
        existingCostCenters: [], // CCs already assigned to user
        selectedCostCenters: [], // All selected CCs (existing + new)
        isRoleCCApplicable: false // Track if selected role supports CCs
    });

    // Load data on mount
    useEffect(() => {
        dispatch(fetchAllEmployees());
        dispatch(fetchRoleDesign());
    }, [dispatch]);

    // Handle operation success
    useEffect(() => {
        if (operationStatus === 'saved') {
            toast.success('Role assigned successfully!');
            setShowModal(false);
            resetForm();
            dispatch(fetchAllEmployees());
            dispatch(resetOperationResults());
        } else if (operationStatus === 'updated') {
            toast.success('Role updated successfully!');
            setShowModal(false);
            resetForm();
            dispatch(fetchAllEmployees());
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

    // Monitor availableCostCenters changes
    useEffect(() => {
        console.log('📦 Available Cost Centers Updated:', {
            count: availableCostCenters?.length || 0,
            data: availableCostCenters
        });
    }, [availableCostCenters]);

    const resetForm = () => {
        setFormData({
            userId: '',
            username: '',
            fullName: '',
            currentRoleId: '',
            currentRoleName: '',
            newRoleId: '',
            effectiveDate: new Date().toISOString().split('T')[0],
            remarks: '',
            existingCostCenters: [],
            selectedCostCenters: [],
            isRoleCCApplicable: false
        });
        setSelectedEmployee(null);
    };

    const handleOpenModal = (mode, employee = null) => {
        setModalMode(mode);
        if (employee) {

            console.log('🔍 Employee Data for Modal:', {
                fullEmployee: employee,
                Userid: employee.Userid,
                UserID: employee.UserID,
                uid: employee.uid,
                Status: employee.Status,
                Username: employee.Username,
                allKeys: Object.keys(employee)
            });


            setSelectedEmployee(employee);

            // Construct full name
            const fullName = [
                employee.Firstname,
                employee.Middlename,
                employee.Lastname
            ].filter(Boolean).join(' ');

            // Get existing cost center codes
            const existingCCCodes = employee.UserCCList?.map(cc => cc.CC_Code) || [];

            // Check if current role is CC applicable
            const currentRole = availableRoles.find(r => r.RoleID === employee.RoleID);
            const isCurrentRoleCCApplicable = currentRole?.ApplicableForCC === 'Yes';
            const userId = employee.Userid || employee.UserID || employee.userid || employee.UID || '';
            console.log('🔍 Opening Modal:', {
                employeeRoleId: employee.RoleID,
                currentRole: currentRole,
                isCurrentRoleCCApplicable: isCurrentRoleCCApplicable,
                existingCCs: existingCCCodes
            });

            setFormData({
                userId: userId,
                username: employee.Username || '',
                fullName: fullName,
                currentRoleId: employee.RoleID || '',
                currentRoleName: employee.UserRole || '',
                newRoleId: employee.RoleID || '',
                effectiveDate: new Date().toISOString().split('T')[0],
                remarks: '',
                existingCostCenters: existingCCCodes,
                selectedCostCenters: [...existingCCCodes], // Start with all existing CCs selected
                isRoleCCApplicable: isCurrentRoleCCApplicable
            });

            // ALWAYS fetch available cost centers for the role if CC applicable
            if (employee.RoleID && isCurrentRoleCCApplicable) {
                console.log('📥 Fetching CCs for Role ID:', employee.RoleID);
                dispatch(fetchUserCCByRoleId(employee.RoleID));
            } else {
                console.log('⚠️ Not fetching CCs - Role not CC applicable or no RoleID');
            }
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

        // Handle role change specially
        if (name === 'newRoleId') {
            const selectedRole = availableRoles.find(r => r.RoleID === parseInt(value));
            const isCCApplicable = selectedRole?.ApplicableForCC === 'Yes';

            console.log('🔄 Role Changed:', {
                newRoleId: value,
                selectedRole: selectedRole,
                isCCApplicable: isCCApplicable
            });

            setFormData(prev => ({
                ...prev,
                [name]: value,
                isRoleCCApplicable: isCCApplicable,
                // Clear selected CCs if new role is not CC applicable
                selectedCostCenters: isCCApplicable ? prev.existingCostCenters : []
            }));

            // Fetch new cost centers for the selected role if CC applicable
            if (value && isCCApplicable) {
                console.log('📥 Fetching CCs for new Role ID:', value);
                dispatch(fetchUserCCByRoleId(parseInt(value)));
            } else {
                console.log('⚠️ Not fetching CCs - Role not CC applicable');
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
    e.preventDefault();

    const userId = formData.userId || selectedEmployee?.Userid || selectedEmployee?.UserID;

    if (!userId && selectedEmployee?.Status === 'Active') {
        toast.error('User ID is required');
        return;
    }

    if (!formData.newRoleId) {
        toast.error('Please select a role');
        return;
    }

    const action = selectedEmployee?.Status === 'Active' ? 'Update' : 'Add';
    const currentUser = userData?.Username || userData?.username || 'System';

    let payload;

    if (action === 'Add') {
        // 🆕 NEW ROLE ASSIGNMENT - InActive employee getting first role
        // Generate default password (you may want to customize this logic)
        const defaultPassword = generateDefaultPassword(formData.username);
        
        payload = {
            UserId: 0,
            Username: formData.username,
            RoleID: parseInt(formData.newRoleId), // Note: Capital D
            workemail: selectedEmployee?.Email || selectedEmployee?.WorkEmail || '',
            OriginalPassword: defaultPassword,
            Password: btoa(defaultPassword), // Base64 encode
            Action: action
        };
    } else {
        // 🔄 ROLE UPDATE - Active employee changing role
        payload = {
            UserId: parseInt(userId),
            Username: formData.username,
            RoleId: parseInt(formData.newRoleId), // Note: Lowercase d
            Createdby: currentUser,
            Action: action
        };
    }

    // Add trailing comma to CCCode for stored procedure parsing
    if (formData.isRoleCCApplicable && formData.selectedCostCenters?.length > 0) {
        payload.CCCode = formData.selectedCostCenters.join(',') + ',';
    }

    console.log('📤 Final Role Assignment Payload:', JSON.stringify(payload, null, 2));
    console.log(`🔍 Action Type: ${action}`);

    try {
        if (action === 'Add') {
            const result = await dispatch(saveEmployeeRoleAssignment(payload)).unwrap();
            console.log('✅ Save Result (New Role Assignment):', result);
        } else {
            const result = await dispatch(updateEmployeeRoleAssignment(payload)).unwrap();
            console.log('✅ Update Result (Role Change):', result);
        }

        setTimeout(() => {
            dispatch(fetchAllEmployees());
        }, 500);

    } catch (error) {
        console.error('❌ Error:', error);
    }
};

// Helper function to generate default password
const generateDefaultPassword = (username) => {
    // Customize this logic based on your requirements
    // Example: Use a default pattern or random generation
    const randomString = Math.random().toString(36).slice(-8);
    return `${username}@${randomString}`;
};
    const handleRefresh = () => {
        if (filterByRole !== 'all') {
            dispatch(fetchEmployeesByCurrentRole(filterByRole));
        } else {
            dispatch(fetchAllEmployees());
        }
        dispatch(fetchRoleDesign());
    };

    const handleFilterChange = (roleFilter) => {
        setFilterByRole(roleFilter);
        if (roleFilter === 'all') {
            dispatch(fetchAllEmployees());
        } else {
            // Use the selected filter role, not the logged-in user's role
            dispatch(fetchEmployeesByCurrentRole(roleFilter));
        }
    };

    // Get display data based on filter - exclude 'Left' employees
    const displayEmployees = (filterByRole === 'all' ? allEmployees : employeesByRole)
        .filter(emp => emp.Status !== 'Left');

    // Filter employees based on search and status
    const filteredEmployees = displayEmployees.filter(emp => {
        const searchLower = searchTerm.toLowerCase();
        const fullName = [emp.Firstname, emp.Middlename, emp.Lastname].filter(Boolean).join(' ').toLowerCase();

        const matchesSearch = (
            fullName.includes(searchLower) ||
            emp.Username?.toLowerCase().includes(searchLower) ||
            emp.UserRole?.toLowerCase().includes(searchLower)
        );

        const matchesStatus = filterByStatus === 'all' || emp.Status === filterByStatus;

        const userId = emp.Userid || emp.UserID || emp.uid || emp.UID
        const isProtectedUser = (userId === 100 || userId === '100') && (emp.RoleID === 100 || emp.RoleID === '100');

        return matchesSearch && matchesStatus && !isProtectedUser;
    });

    if (loading && allEmployees.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-green-600" />
                <span className="ml-3 text-gray-600 dark:text-gray-300">Loading employees...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Role Change Management</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Assign and manage employee roles ({filteredEmployees.length} employees)
                    </p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={loading}
                    className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                </button>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, username, or role..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <select
                        value={filterByRole}
                        onChange={(e) => handleFilterChange(e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                        <option value="all">All Roles</option>
                        {availableRoles.map(role => (
                            <option key={role.RoleID} value={role.RoleID}>
                                {role.RoleCode}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center space-x-2">
                    <UserCheck className="w-4 h-4 text-gray-500" />
                    <select
                        value={filterByStatus}
                        onChange={(e) => setFilterByStatus(e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                        <option value="all">All Status</option>
                        <option value="Active">Active</option>
                        <option value="InActive">InActive</option>
                    </select>
                </div>
            </div>

            {/* Employees Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                {filteredEmployees.length === 0 ? (
                    <div className="text-center py-12">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No Employees Found
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            {searchTerm ? 'No employees match your search criteria.' : 'No employees found in the system.'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                            <thead className="bg-indigo-600 text-white">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">
                                        Username
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">
                                        Employee Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">
                                        Current Role
                                    </th>
                                    <th className="px-6 py-3 text-center text-sm font-medium uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-center text-sm font-medium uppercase tracking-wider">
                                        Cost Centers
                                    </th>
                                    <th className="px-6 py-3 text-center text-sm font-medium uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                                {filteredEmployees.map((employee, index) => {
                                    const fullName = [
                                        employee.Firstname,
                                        employee.Middlename,
                                        employee.Lastname
                                    ].filter(Boolean).join(' ');

                                    // Check if employee's role is CC applicable
                                    const employeeRole = availableRoles.find(r => r.RoleID === employee.RoleID);
                                    const isEmployeeRoleCCApplicable = employeeRole?.ApplicableForCC === 'Yes';

                                    return (
                                        <tr
                                            key={index}
                                            className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}
                                        >
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                                {employee.Username || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                                {fullName || 'N/A'}
                                                {employee.isSuperAdmin && (
                                                    <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded-md">
                                                        Super Admin
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                                <span className="px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded-md">
                                                    {employee.UserRole || 'No Role'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-md ${employee.Status === 'Active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {employee.Status || 'Active'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {isEmployeeRoleCCApplicable && employee.UserCCList && employee.UserCCList.length > 0 ? (
                                                    <span className="px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded-md">
                                                        {employee.UserCCList.length} CCs
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center space-x-2">
                                                    <button
                                                        onClick={() => handleOpenModal('view', employee)}
                                                        className="p-1 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                        title="View"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenModal('edit', employee)}
                                                        className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                                                        title="Change Role"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Role Assignment Modal */}
            {showModal && (
                <RoleAssignmentModal
                    mode={modalMode}
                    formData={formData}
                    availableRoles={availableRoles}
                    availableCostCenters={availableCostCenters}
                    selectedEmployee={selectedEmployee}
                    loading={saveLoading || updateLoading}
                    onInputChange={handleInputChange}
                    onSubmit={handleSubmit}
                    onClose={handleCloseModal}
                    setFormData={setFormData}
                />
            )}
        </div>
    );
};

// Role Assignment Modal Component
const RoleAssignmentModal = ({
    mode,
    formData,
    availableRoles,
    availableCostCenters,
    selectedEmployee,
    loading,
    onInputChange,
    onSubmit,
    onClose,
    setFormData
}) => {
    const isViewMode = mode === 'view';
    const title = mode === 'assign' ? 'Assign New Role' : mode === 'edit' ? 'Change Employee Role' : 'View Employee Role';

    // Get existing CC codes from formData
    const existingCCCodes = formData.existingCostCenters || [];

    // Get available CCs (those fetched from API for the selected role)
    const availableCCs = Array.isArray(availableCostCenters) ? availableCostCenters : [];

    console.log('🎯 Modal CC Data:', {
        existingCCCodes: existingCCCodes,
        availableCCsCount: availableCCs.length,
        availableCCs: availableCCs,
        isRoleCCApplicable: formData.isRoleCCApplicable
    });

    // Create a combined list: existing CCs + new available CCs
    // Existing CCs that are not in the available list anymore
    const existingCCObjects = selectedEmployee?.UserCCList || [];

    // Filter available CCs to exclude those already in existing
    const newAvailableCCs = availableCCs.filter(cc => !existingCCCodes.includes(cc.CC_Code));

    // Combine for display
    const allCCsForSelection = [
        ...existingCCObjects.map(cc => ({
            CC_Code: cc.CC_Code,
            CC_Name: cc.CC_Name,
            isExisting: true
        })),
        ...newAvailableCCs.map(cc => ({
            CC_Code: cc.CC_Code,
            CC_Name: cc.CC_Name,
            isExisting: false
        }))
    ];

    console.log('📋 Combined CC List for Selection:', {
        totalCount: allCCsForSelection.length,
        existingCount: existingCCObjects.length,
        newAvailableCount: newAvailableCCs.length,
        allCCs: allCCsForSelection
    });

    const handleCostCenterToggle = (ccCode) => {
        if (isViewMode) return;

        setFormData(prev => {
            const currentSelected = prev.selectedCostCenters || [];
            const isSelected = currentSelected.includes(ccCode);

            return {
                ...prev,
                selectedCostCenters: isSelected
                    ? currentSelected.filter(code => code !== ccCode)
                    : [...currentSelected, ccCode]
            };
        });
    };

    // Calculate CCs to be added and removed
    const ccsToAdd = (formData.selectedCostCenters || []).filter(
        cc => !existingCCCodes.includes(cc)
    );
    const ccsToRemove = existingCCCodes.filter(
        cc => !(formData.selectedCostCenters || []).includes(cc)
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-2">
                        <UserCheck className="w-6 h-6 text-green-600" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Modal Body */}
                <form onSubmit={onSubmit} className="p-6 space-y-4">
                    {/* Username */}
                    {formData.username && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Username
                            </label>
                            <input
                                type="text"
                                value={formData.username}
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white"
                            />
                        </div>
                    )}

                    {/* Employee Name */}
                    {formData.fullName && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Employee Name
                            </label>
                            <input
                                type="text"
                                value={formData.fullName}
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white"
                            />
                        </div>
                    )}

                    {/* Current Role */}
                    {formData.currentRoleName && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Current Role
                            </label>
                            <input
                                type="text"
                                value={formData.currentRoleName}
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white"
                            />
                        </div>
                    )}

                    {/* New Role */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {mode === 'assign' ? 'Assign Role' : 'New Role'} <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="newRoleId"
                            value={formData.newRoleId}
                            onChange={onInputChange}
                            disabled={isViewMode}
                            required
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-900"
                        >
                            <option value="">Select a role</option>
                            {availableRoles.map(role => (
                                <option key={role.RoleID} value={role.RoleID}>
                                    {role.RoleCode} {role.ApplicableForCC === 'Yes' ? '(CC Applicable)' : ''}
                                </option>
                            ))}
                        </select>
                        {formData.newRoleId && !formData.isRoleCCApplicable && (
                            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                                ℹ️ This role does not support cost center assignments
                            </p>
                        )}
                    </div>

                    {/* Effective Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Effective Date
                        </label>
                        <input
                            type="date"
                            name="effectiveDate"
                            value={formData.effectiveDate}
                            onChange={onInputChange}
                            disabled={isViewMode}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-900"
                        />
                    </div>

                    {/* Cost Centers Section - Only show if role is CC applicable */}
                    {formData.isRoleCCApplicable && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Manage Cost Centers
                                {!isViewMode && (
                                    <span className="ml-2 text-xs text-gray-500">
                                        (Select/Deselect to add or remove)
                                    </span>
                                )}
                            </label>

                            {allCCsForSelection.length === 0 ? (
                                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700 text-center">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        No cost centers available for this role.
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                        All available cost centers for this role may already be assigned.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700 max-h-64 overflow-y-auto">
                                        <div className="space-y-2">
                                            {allCCsForSelection.map((cc) => {
                                                const isSelected = (formData.selectedCostCenters || []).includes(cc.CC_Code);
                                                const isExisting = cc.isExisting;

                                                return (
                                                    <label
                                                        key={cc.CC_Code}
                                                        className={`flex items-center space-x-3 p-2 rounded-md transition-colors ${isViewMode ? 'cursor-default' : 'cursor-pointer'
                                                            } ${isSelected
                                                                ? 'bg-indigo-100 dark:bg-indigo-900/40 border border-indigo-300 dark:border-indigo-700'
                                                                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                            }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => handleCostCenterToggle(cc.CC_Code)}
                                                            disabled={isViewMode}
                                                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                                        />
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                                    {cc.CC_Code}
                                                                </span>
                                                                {isExisting && (
                                                                    <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 rounded">
                                                                        Currently Assigned
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                {cc.CC_Name}
                                                            </div>
                                                        </div>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Summary of changes */}
                                    {!isViewMode && (ccsToAdd.length > 0 || ccsToRemove.length > 0) && (
                                        <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-xs">
                                            {ccsToAdd.length > 0 && (
                                                <p className="text-green-700 dark:text-green-400">
                                                    ✓ Will add: {ccsToAdd.length} CC(s)
                                                </p>
                                            )}
                                            {ccsToRemove.length > 0 && (
                                                <p className="text-red-700 dark:text-red-400">
                                                    ✗ Will remove: {ccsToRemove.length} CC(s)
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* Show message when role is not CC applicable but user had CCs */}
                    {!formData.isRoleCCApplicable && existingCCCodes.length > 0 && formData.newRoleId && (
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
                            <div className="flex items-start space-x-2">
                                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                                <div className="text-sm text-amber-800 dark:text-amber-300">
                                    <p className="font-medium">Cost Centers Will Be Cleared</p>
                                    <p className="text-xs mt-1">
                                        The selected role does not support cost centers. All existing {existingCCCodes.length} cost center(s) will be removed.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Remarks */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Remarks
                        </label>
                        <textarea
                            name="remarks"
                            value={formData.remarks}
                            onChange={onInputChange}
                            disabled={isViewMode}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-900"
                            placeholder="Enter any remarks or notes (optional)"
                        />
                    </div>

                    {/* Info Box */}
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-md p-4">
                        <div className="flex items-start space-x-2">
                            <AlertCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-indigo-800 dark:text-indigo-300">
                                <p className="font-medium mb-1">Important Notes:</p>
                                <ul className="list-disc list-inside space-y-1 text-xs">
                                    <li>Role changes will take effect from the specified date</li>
                                    <li>Previous role permissions will be revoked automatically</li>
                                    <li>Employee will receive notification about the role change</li>
                                    {formData.isRoleCCApplicable && (
                                        <li>You can add or remove cost centers as needed</li>
                                    )}
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
                                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        <span>{mode === 'assign' ? 'Assign Role' : 'Update Role'}</span>
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

export default RoleChangeTab;