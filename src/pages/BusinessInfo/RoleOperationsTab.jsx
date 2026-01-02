import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
    RefreshCw, Save, AlertCircle, CheckCircle, Cog, Info 
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
    fetchWorkflowMasterOperations,
    fetchRoleOperationRoles,
    saveRoleOperations,
    selectWorkflowMasterOperations,
    selectRoleOperationRoles,
    selectLoading,
    selectErrors
} from '../../slices/workflowSlice/workflowSlice';

const RoleOperationsTab = () => {
    const dispatch = useDispatch();
    const { employeeId } = useSelector((state) => state.auth);
    
    // Redux state - slice already extracts .Data, so these are the actual data
    const workflowMasterOperations = useSelector(selectWorkflowMasterOperations);
    const roleOperationRoles = useSelector(selectRoleOperationRoles);
    const loading = useSelector(selectLoading);
    const errors = useSelector(selectErrors);

    // Local state
    const [selectedOperation, setSelectedOperation] = useState(null);
    const [permissions, setPermissions] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Fetch workflow master operations on component mount
    useEffect(() => {
        dispatch(fetchWorkflowMasterOperations());
    }, [dispatch]);

    // No auto-selection - user must explicitly select an operation from dropdown

    // Initialize permissions when roleOperationRoles loads
    useEffect(() => {
        console.log('🔄 roleOperationRoles changed:', roleOperationRoles);
        console.log('🔍 Type:', typeof roleOperationRoles);
        console.log('🔍 Keys:', roleOperationRoles ? Object.keys(roleOperationRoles) : 'null');
        
        if (!roleOperationRoles) {
            return;
        }

        // Handle different possible data structures
        let workflowData = null;
        
        // Check if it's an object with WorlkFlowData property (API typo - missing 'f')
        if (roleOperationRoles.WorlkFlowData && Array.isArray(roleOperationRoles.WorlkFlowData)) {
            workflowData = roleOperationRoles.WorlkFlowData;
            console.log('✅ Found WorlkFlowData:', workflowData);
        }
        // Check if it's an object with WorkflowData property (correct spelling)
        else if (roleOperationRoles.WorkflowData && Array.isArray(roleOperationRoles.WorkflowData)) {
            workflowData = roleOperationRoles.WorkflowData;
            console.log('✅ Found WorkflowData:', workflowData);
        }
        // Check if it's directly an array
        else if (Array.isArray(roleOperationRoles)) {
            workflowData = roleOperationRoles;
            console.log('✅ Found direct array:', workflowData);
        }
        else {
            console.log('❌ Could not find workflow data in expected structure');
            console.log('❌ Full object:', JSON.stringify(roleOperationRoles, null, 2));
        }
        
        if (workflowData && workflowData.length > 0) {
            const initialPermissions = {};
            workflowData.forEach((role, index) => {
                const roleId = role.RoleId || role.RoleID;
                console.log(`Processing role ${index}:`, role);
                // First role gets all CRUD permissions, others get only Read, Update, Delete
                initialPermissions[roleId] = {
                    create: index === 0,
                    read: true,
                    update: true,
                    delete: true
                };
            });
            console.log('✅ Setting permissions:', initialPermissions);
            setPermissions(initialPermissions);
        } else {
            // Clear permissions if no workflow data
            setPermissions({});
        }
    }, [roleOperationRoles]);

    // Handle operation selection change
    const handleOperationChange = (e) => {
        const operationId = e.target.value;
        
        // If empty/placeholder value selected, clear everything
        if (!operationId || operationId === '') {
            console.log('🧹 Clearing selection');
            setSelectedOperation(null);
            setPermissions({});
            setSaveSuccess(false);
            return;
        }

        const operation = workflowMasterOperations.find(
            op => op.MasterOperationID === parseInt(operationId)
        );
        
        console.log('📝 Operation changed - ID:', operationId, 'Operation:', operation);
        
        if (operation) {
            setSelectedOperation(operation);
            setPermissions({});
            setSaveSuccess(false);
            console.log('📞 Fetching role operation roles for operation ID:', operation.MasterOperationID);
            dispatch(fetchRoleOperationRoles(operation.MasterOperationID));
        }
    };

    // Handle permission checkbox change
    const handlePermissionChange = (roleId, permission) => {
        setPermissions(prev => ({
            ...prev,
            [roleId]: {
                ...prev[roleId],
                [permission]: !prev[roleId]?.[permission]
            }
        }));
    };

    // Handle save operations
    const handleSaveOperations = async () => {
        if (!selectedOperation) {
            toast.error('Please select an operation');
            return;
        }

        // Validate that at least one permission is selected
        const hasPermissions = Object.values(permissions).some(perms => 
            perms.create || perms.read || perms.update || perms.delete
        );

        if (!hasPermissions) {
            toast.error('Please select at least one permission for a role');
            return;
        }

        // Build the payload according to the required format
        const createRoleIds = [];
        const readRoleIds = [];
        const updateRoleIds = [];
        const deleteRoleIds = [];

        Object.keys(permissions).forEach(roleId => {
            const perms = permissions[roleId];
            if (perms.create) createRoleIds.push(roleId);
            if (perms.read) readRoleIds.push(roleId);
            if (perms.update) updateRoleIds.push(roleId);
            if (perms.delete) deleteRoleIds.push(roleId);
        });

        const payload = {
            masterOperationId: selectedOperation.MasterOperationID,
            createStatus: createRoleIds.length > 0 ? 1 : 0,
            updateStatus: updateRoleIds.length > 0 ? 1 : 0,
            readStatus: readRoleIds.length > 0 ? 1 : 0,
            deleteStatus: deleteRoleIds.length > 0 ? 1 : 0,
            createOperRoleIds: createRoleIds.join(','),
            updateOperRoleIds: updateRoleIds.join(','),
            readOperRoleIds: readRoleIds.join(','),
            deleteOperRoleIds: deleteRoleIds.join(','),
            createdBy: employeeId || 'Admin',
            workFlowType: 0
        };

        console.log('💾 Saving with payload:', payload);

        try {
            setIsSaving(true);
            setSaveSuccess(false);
            await dispatch(saveRoleOperations(payload)).unwrap();
            toast.success('Role operations saved successfully!');
            
            // Show success state
            setSaveSuccess(true);
            
            // Refresh workflow master operations list
            await dispatch(fetchWorkflowMasterOperations()).unwrap();
            
            // Clear the selected operation and permissions to reset the form
            setSelectedOperation(null);
            setPermissions({});
            
            // Hide success state after 3 seconds
            setTimeout(() => setSaveSuccess(false), 3000);
            
        } catch (error) {
            toast.error(error || 'Failed to save role operations');
            console.error('❌ Save error:', error);
            setSaveSuccess(false);
        } finally {
            setIsSaving(false);
        }
    };

    // Handle reset
    const handleReset = () => {
        // Extract workflow data
        let workflowData = null;
        if (roleOperationRoles) {
            // Check for API typo: WorlkFlowData (missing 'f')
            if (roleOperationRoles.WorlkFlowData && Array.isArray(roleOperationRoles.WorlkFlowData)) {
                workflowData = roleOperationRoles.WorlkFlowData;
            }
            // Check for correct spelling
            else if (roleOperationRoles.WorkflowData && Array.isArray(roleOperationRoles.WorkflowData)) {
                workflowData = roleOperationRoles.WorkflowData;
            }
            // Check if it's a direct array
            else if (Array.isArray(roleOperationRoles)) {
                workflowData = roleOperationRoles;
            }
        }
        
        if (workflowData && workflowData.length > 0) {
            const initialPermissions = {};
            workflowData.forEach((role, index) => {
                const roleId = role.RoleId || role.RoleID;
                // First role gets all CRUD permissions, others get only Read, Update, Delete
                initialPermissions[roleId] = {
                    create: index === 0,
                    read: true,
                    update: true,
                    delete: true
                };
            });
            setPermissions(initialPermissions);
        } else {
            setPermissions({});
        }
        toast.info('Permissions reset to default state');
    };

    // Handle refresh
    const handleRefresh = () => {
        dispatch(fetchWorkflowMasterOperations());
        if (selectedOperation?.MasterOperationID) {
            dispatch(fetchRoleOperationRoles(selectedOperation.MasterOperationID));
        }
    };

    // Get workflow data for rendering
    const getWorkflowData = () => {
        if (!roleOperationRoles) {
            return null;
        }
        
        // Check for API typo: WorlkFlowData (missing 'f') - this is what the API actually returns
        if (roleOperationRoles.WorlkFlowData && Array.isArray(roleOperationRoles.WorlkFlowData)) {
            return roleOperationRoles.WorlkFlowData;
        }
        // Check for correct spelling
        if (roleOperationRoles.WorkflowData && Array.isArray(roleOperationRoles.WorkflowData)) {
            return roleOperationRoles.WorkflowData;
        }
        // Check if it's a direct array
        if (Array.isArray(roleOperationRoles)) {
            return roleOperationRoles;
        }
        
        return null;
    };

    const workflowData = getWorkflowData();

    if (loading.workflowMasterOperations) {
        return (
            <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-orange-600" />
                <span className="ml-3 text-gray-600 dark:text-gray-300">Loading workflow operations...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
           
           

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Role Operations</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Configure CRUD permissions for roles on workflow operations
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={handleRefresh}
                        disabled={loading.workflowMasterOperations || loading.roleOperationRoles}
                        className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading.workflowMasterOperations || loading.roleOperationRoles ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            {/* Error Display */}
            {(errors.workflowMasterOperations || errors.roleOperationRoles || errors.saving) && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-start">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-3" />
                        <div className="flex-1">
                            <h4 className="text-sm font-medium text-red-800 dark:text-red-300">Error</h4>
                            <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                                {errors.workflowMasterOperations || errors.roleOperationRoles || errors.saving}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Display */}
            {saveSuccess && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 animate-fade-in">
                    <div className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 mr-3" />
                        <div className="flex-1">
                            <h4 className="text-sm font-medium text-green-800 dark:text-green-300">Success</h4>
                            <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                                Role operations have been saved successfully. The form has been cleared.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                {!workflowMasterOperations || !Array.isArray(workflowMasterOperations) || workflowMasterOperations.length === 0 ? (
                    <div className="text-center py-12">
                        <Cog className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Operations Found</h3>
                        <p className="text-gray-500 dark:text-gray-400">No workflow operations have been configured yet.</p>
                    </div>
                ) : (
                    <>
                        {/* Operation Selection */}
                        <div className="mb-6">
                            <label className="block text-lg font-semibold text-gray-900 dark:text-white text-center mb-4">
                                Role Operations
                            </label>
                            <select
                                value={selectedOperation?.MasterOperationID || ''}
                                onChange={handleOperationChange}
                                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            >
                                <option value="">Select an operation...</option>
                                {workflowMasterOperations.map((operation) => (
                                    <option 
                                        key={operation.MasterOperationID} 
                                        value={operation.MasterOperationID}
                                    >
                                        {operation.MasterOperationDescription || operation.OperationName || `Operation ${operation.MasterOperationID}`}
                                    </option>
                                ))}
                            </select>
                            
                            
                            {/* Show Functional Area Name if available */}
                            {selectedOperation && roleOperationRoles && (roleOperationRoles.FirmFunctionalAreaName || roleOperationRoles.FunctionalAreaName) && (
                                <div className="mt-3 flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
                                    <Info className="w-4 h-4 mr-2" />
                                    <span>Functional Area: <span className="font-medium text-gray-900 dark:text-white">{roleOperationRoles.FirmFunctionalAreaName || roleOperationRoles.FunctionalAreaName}</span></span>
                                </div>
                            )}
                        </div>

                        {/* Show content only when operation is selected */}
                        {!selectedOperation ? (
                            <div className="text-center py-12">
                                <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Select an Operation</h3>
                                <p className="text-gray-500 dark:text-gray-400">Please select an operation from the dropdown above to configure role permissions</p>
                            </div>
                        ) : loading.roleOperationRoles ? (
                            <div className="flex items-center justify-center py-8">
                                <RefreshCw className="w-6 h-6 animate-spin text-orange-600" />
                                <span className="ml-3 text-gray-600 dark:text-gray-300">Loading roles...</span>
                            </div>
                        ) : !workflowData || workflowData.length === 0 ? (
                            <div className="text-center py-8">
                                <AlertCircle className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-500 dark:text-gray-400">No roles found for this operation</p>
                                <p className="text-xs text-gray-400 mt-2">Check the debug panel above for API response details</p>
                            </div>
                        ) : (
                            <>
                                {/* Permissions Table */}
                                <div className="overflow-x-auto border border-gray-200 dark:border-gray-600 rounded-lg">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                                        <thead className="bg-gray-800 dark:bg-gray-900">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-base font-semibold text-white uppercase tracking-wider">
                                                    Role
                                                </th>
                                                <th className="px-6 py-4 text-center text-base font-semibold text-white uppercase tracking-wider">
                                                    Create
                                                </th>
                                                <th className="px-6 py-4 text-center text-base font-semibold text-white uppercase tracking-wider">
                                                    Read
                                                </th>
                                                <th className="px-6 py-4 text-center text-base font-semibold text-white uppercase tracking-wider">
                                                    Update
                                                </th>
                                                <th className="px-6 py-4 text-center text-base font-semibold text-white uppercase tracking-wider">
                                                    Delete
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                                            {workflowData.map((role, index) => {
                                                const roleId = role.RoleId || role.RoleID;
                                                const roleName = role.RoleCode || role.RoleName || `Role ${roleId}`;
                                                
                                                return (
                                                    <tr key={roleId || index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                                            {roleName}
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={permissions[roleId]?.create || false}
                                                                onChange={() => handlePermissionChange(roleId, 'create')}
                                                                className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500 cursor-pointer"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={permissions[roleId]?.read || false}
                                                                onChange={() => handlePermissionChange(roleId, 'read')}
                                                                className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500 cursor-pointer"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={permissions[roleId]?.update || false}
                                                                onChange={() => handlePermissionChange(roleId, 'update')}
                                                                className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500 cursor-pointer"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={permissions[roleId]?.delete || false}
                                                                onChange={() => handlePermissionChange(roleId, 'delete')}
                                                                className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500 cursor-pointer"
                                                            />
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Action Buttons */}
                                <div className="mt-6 flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <button
                                            onClick={handleSaveOperations}
                                            disabled={isSaving || loading.saving || Object.keys(permissions).length === 0}
                                            className="flex items-center space-x-2 px-6 py-3 bg-gray-800 text-white rounded-md hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                                        >
                                            {isSaving || loading.saving ? (
                                                <>
                                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                                    <span>Saving...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-5 h-5" />
                                                    <span>Add Role Operations</span>
                                                </>
                                            )}
                                        </button>
                                        <button 
                                            onClick={handleReset}
                                            disabled={isSaving || loading.saving || Object.keys(permissions).length === 0}
                                            className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Reset
                                        </button>
                                    </div>
                                    {Object.keys(permissions).length > 0 && (
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            <Info className="w-4 h-4 inline mr-1" />
                                            {Object.values(permissions).filter(p => p.create || p.read || p.update || p.delete).length} role(s) configured
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default RoleOperationsTab;