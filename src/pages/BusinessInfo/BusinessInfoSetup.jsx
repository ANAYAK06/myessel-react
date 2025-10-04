import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
    Users, Settings, Shield, CheckCircle, AlertCircle, 
    Building2, UserCheck, Layers, Cog, ChevronRight,
    Save, RefreshCw, Eye, Edit, Trash2, Plus, Search,
    Filter, Download, Upload, Info
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
    fetchWorkflowLevels,
    fetchUserRoles,
    fetchMasterOperations,
    fetchWorkflowOperations,
    saveApprovalHierarchy,
    saveRoleOperations,
    setActiveTab,
    clearErrors,
    smartFetchData,
    selectWorkflowLevels,
    selectUserRoles,
    selectMasterOperations,
    selectWorkflowOperations,
    selectLoading,
    selectErrors,
    selectActiveTab
} from '../../slices/businessinfosetup/businessInfoSlice';
import WorkflowManagement from './WorkflowManagement';
import RolesDesignTab from './RolesDesignTab';

const BasicBusinessInfoSetup = () => {
    const dispatch = useDispatch();
    const { roleData, employeeId, roleId } = useSelector((state) => state.auth);
    
    // Redux state - getting real data from database
    const workflowLevels = useSelector(selectWorkflowLevels);
    const userRoles = useSelector(selectUserRoles);
    const masterOperations = useSelector(selectMasterOperations);
    const workflowOperations = useSelector(selectWorkflowOperations);
    const loading = useSelector(selectLoading);
    const errors = useSelector(selectErrors);
    const activeTab = useSelector(selectActiveTab);

    // Check if user is super admin (Role 100)
    const isSuperAdmin = roleId === "100" || roleId === 100;

    // Define available tabs with their configurations
    const tabsConfig = {
        'approval-hierarchy': {
            id: 'approval-hierarchy',
            label: 'Approval Hierarchy',
            icon: CheckCircle,
            color: 'indigo',
            mid: null,
            alwaysVisible: true
        },
        'firm-info': {
            id: 'firm-info',
            label: 'Firm Info',
            icon: Building2,
            color: 'blue',
            mid: 190
        },
        'role-change': {
            id: 'role-change',
            label: 'Role Change',
            icon: UserCheck,
            color: 'green',
            mid: 102
        },
        'roles-design': {
            id: 'roles-design',
            label: 'Roles Design',
            icon: Layers,
            color: 'purple',
            mid: 192
        },
        'role-operations': {
            id: 'role-operations',
            label: 'Role Operations',
            icon: Cog,
            color: 'orange',
            mid: 196
        }
    };

    // Calculate visible tabs based on permissions
    const getVisibleTabs = () => {
        if (isSuperAdmin) {
            return Object.values(tabsConfig).filter(tab => tab.id !== 'firm-info');
        }

        const visibleTabs = [];
        visibleTabs.push(tabsConfig['approval-hierarchy']);

        if (roleData?.statuslist) {
            roleData.statuslist.forEach(item => {
                Object.values(tabsConfig).forEach(tab => {
                    if (tab.mid === item.MID && item.WorkflowExist === true) {
                        visibleTabs.push(tab);
                    }
                });
            });
        }

        return visibleTabs;
    };

    const visibleTabs = getVisibleTabs();

    // Set default active tab to first visible tab
    useEffect(() => {
        if (visibleTabs.length > 0 && !visibleTabs.find(tab => tab.id === activeTab)) {
            dispatch(setActiveTab(visibleTabs[0].id));
        }
    }, [visibleTabs, activeTab, dispatch]);

    // Load data on component mount using smart fetching
    useEffect(() => {
        dispatch(smartFetchData());
        dispatch(clearErrors());
    }, [dispatch]);

    // Show error messages via toast
    useEffect(() => {
        Object.entries(errors).forEach(([key, error]) => {
            if (error && error !== null) {
                toast.error(`Error with ${key}: ${error}`);
            }
        });
    }, [errors]);

    // Get tab color classes
    const getTabColorClasses = (color, isActive) => {
        const colorMap = {
            indigo: {
                active: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border-indigo-500',
                inactive: 'text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
            },
            blue: {
                active: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-500',
                inactive: 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
            },
            green: {
                active: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-500',
                inactive: 'text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
            },
            purple: {
                active: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border-purple-500',
                inactive: 'text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20'
            },
            orange: {
                active: 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 border-orange-500',
                inactive: 'text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20'
            }
        };
        return colorMap[color]?.[isActive ? 'active' : 'inactive'] || colorMap.indigo[isActive ? 'active' : 'inactive'];
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Basic Business Info Setup</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Configure business settings, roles, and approval workflows
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs rounded-full">
                            {isSuperAdmin ? 'Super Admin' : `Role ${roleId}`}
                        </div>
                        {loading.workflowLevels && (
                            <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                <span className="text-sm">Loading...</span>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Breadcrumb */}
                <nav className="text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-2">
                        <span>Dashboard</span>
                        <ChevronRight className="w-4 h-4" />
                        <span>Configuration</span>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-gray-900 dark:text-white">Basic Business Info Setup</span>
                    </div>
                </nav>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                        {visibleTabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => dispatch(setActiveTab(tab.id))}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center space-x-2 ${
                                        isActive
                                            ? `border-current ${getTabColorClasses(tab.color, true)}`
                                            : `border-transparent ${getTabColorClasses(tab.color, false)} border-transparent`
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {activeTab === 'approval-hierarchy' && (
                        <ApprovalHierarchyTab 
                            workflowLevels={workflowLevels}
                            loading={loading.workflowLevels}
                            onRefresh={() => dispatch(fetchWorkflowLevels())}
                            onSave={(data) => dispatch(saveApprovalHierarchy(data))}
                        />
                    )}
                    {activeTab === 'firm-info' && (
                        <FirmInfoTab />
                    )}
                    {activeTab === 'role-change' && (
                        <RoleChangeTab 
                            userRoles={userRoles}
                            loading={loading.userRoles}
                            onRefresh={() => dispatch(fetchUserRoles())}
                        />
                    )}
                    {activeTab === 'roles-design' && (
                        <RolesDesignTab 
                            masterOperations={masterOperations}
                            loading={loading.masterOperations}
                            onRefresh={() => dispatch(fetchMasterOperations())}
                        />
                    )}
                    {activeTab === 'role-operations' && (
                        <RoleOperationsTab 
                            workflowOperations={workflowOperations}
                            loading={loading.workflowOperations}
                            saving={loading.saving}
                            onRefresh={() => dispatch(fetchWorkflowOperations())}
                            onSave={(data) => dispatch(saveRoleOperations(data))}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

// FIXED: Approval Hierarchy Tab Component - Using correct API data structure
const ApprovalHierarchyTab = ({ workflowLevels, loading, onRefresh, onSave }) => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Approval Hierarchy</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Configure workflow approval levels and hierarchy</p>
                </div>
            </div>

            {/* Use the new WorkflowManagement component */}
            <WorkflowManagement />
        </div>
    );
};
// FIXED: Role Change Tab Component - Using correct API data structure
const RoleChangeTab = ({ userRoles, loading, onRefresh }) => {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-green-600" />
                <span className="ml-3 text-gray-600 dark:text-gray-300">Loading user roles...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Role Change</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage user roles and permissions</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={onRefresh}
                        disabled={loading}
                        className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                {!userRoles || userRoles.length === 0 ? (
                    <div className="text-center py-12">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Users Found</h3>
                        <p className="text-gray-500 dark:text-gray-400">No user roles have been configured yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                            <thead className="bg-indigo-600 text-white">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Role ID</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Role Code</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Role Description</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Level Verification</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Applicable For CC</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                                {userRoles.map((role, index) => (
                                    <tr key={role.RoleID || index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{role.RoleID || 'N/A'}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{role.RoleCode || 'N/A'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{role.RoleDescription || 'No Description'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{role.LevelOfVerification || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-md ${
                                                role.ApplicableForCC 
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {role.ApplicableForCC ? 'Yes' : 'No'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
                                                <option>-Select-</option>
                                                <option>Edit Role</option>
                                                <option>View Details</option>
                                                <option>Deactivate</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};




// FIXED: Role Operations Tab Component - Using correct API data structure
const RoleOperationsTab = ({ workflowOperations, loading, saving, onRefresh, onSave }) => {
    const [selectedOperation, setSelectedOperation] = useState('');
    const [permissions, setPermissions] = useState({});

    // Set default operation when data loads
    useEffect(() => {
        if (workflowOperations && workflowOperations.length > 0 && !selectedOperation) {
            setSelectedOperation(workflowOperations[0].MasterOperationDescription || workflowOperations[0].MasterOperationID || '');
        }
    }, [workflowOperations, selectedOperation]);

    const handlePermissionChange = (roleIndex, permission, value) => {
        setPermissions(prev => ({
            ...prev,
            [`${roleIndex}_${permission}`]: value
        }));
    };

    const handleSaveOperations = async () => {
        try {
            const operationData = {
                operationName: selectedOperation,
                permissions: permissions
            };
            await onSave(operationData);
            toast.success('Role operations saved successfully');
        } catch (error) {
            toast.error('Error saving role operations');
            console.error('Error:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-orange-600" />
                <span className="ml-3 text-gray-600 dark:text-gray-300">Loading workflow operations...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Role Operations</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Configure operational permissions for roles</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={onRefresh}
                        disabled={loading}
                        className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                {!workflowOperations || workflowOperations.length === 0 ? (
                    <div className="text-center py-12">
                        <Cog className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Operations Found</h3>
                        <p className="text-gray-500 dark:text-gray-400">No workflow operations have been configured yet.</p>
                    </div>
                ) : (
                    <>
                        {/* Role Operations Dropdown */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Role Operations
                            </label>
                            <select
                                value={selectedOperation}
                                onChange={(e) => setSelectedOperation(e.target.value)}
                                className="w-full max-w-md px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                {workflowOperations.map((operation, index) => (
                                    <option key={index} value={operation.MasterOperationDescription || operation.MasterOperationID || ''}>
                                        {operation.MasterOperationDescription || `Operation ${operation.MasterOperationID}` || `Operation ${index + 1}`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Permissions Matrix */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                                <thead className="bg-indigo-600 text-white">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Operation</th>
                                        <th className="px-6 py-3 text-center text-sm font-medium uppercase tracking-wider">Master ID</th>
                                        <th className="px-6 py-3 text-center text-sm font-medium uppercase tracking-wider">Max Pending Level</th>
                                        <th className="px-6 py-3 text-center text-sm font-medium uppercase tracking-wider">Verification Pending</th>
                                        <th className="px-6 py-3 text-center text-sm font-medium uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                                    {workflowOperations.map((operation, index) => (
                                        <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                                {operation.MasterOperationDescription || `Operation ${operation.MasterOperationID}`}
                                            </td>
                                            <td className="px-6 py-4 text-center text-sm text-gray-900 dark:text-white">
                                                {operation.MasterOperationID || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-center text-sm text-gray-900 dark:text-white">
                                                {operation.MaxPendingLevel || 0}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-md ${
                                                    operation.VerificationPendingExist 
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-green-100 text-green-800'
                                                }`}>
                                                    {operation.VerificationPendingExist ? 'Pending' : 'Clear'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <select className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
                                                    <option>Select</option>
                                                    <option>Edit</option>
                                                    <option>View Details</option>
                                                    <option>Configure</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-6 flex items-center space-x-4">
                            <button
                                onClick={handleSaveOperations}
                                disabled={saving}
                                className="flex items-center space-x-2 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {saving ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                <span>{saving ? 'Saving...' : 'Add Role Operations'}</span>
                            </button>
                            <button 
                                onClick={() => setPermissions({})}
                                className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                            >
                                Reset
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

// Firm Info Tab Component (for non-super admin users)
const FirmInfoTab = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Firm Information</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage basic firm information and settings</p>
                </div>
                <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                </button>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Firm Name
                            </label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                placeholder="Enter firm name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Registration Number
                            </label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                placeholder="Enter registration number"
                            />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Address
                            </label>
                            <textarea
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                placeholder="Enter firm address"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Contact Information
                            </label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                placeholder="Enter contact details"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BasicBusinessInfoSetup;