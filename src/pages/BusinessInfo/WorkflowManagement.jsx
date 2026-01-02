import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    Plus, Edit, Trash2, Eye, Users, ChevronDown, ChevronUp,
    Save, X, AlertTriangle, RefreshCw, Building2, Shield,
    ArrowRight, MoreVertical, Search, Filter
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
    fetchWorkflowLevels,
    fetchUserRolesForAssign,
    fetchMasterOperations,
    fetchWorkflowMasterOperations,
    fetchVerificationPendingForRole,
    fetchVerificationPendingForMaster,
    saveApprovalHierarchy,
    updateApprovalHierarchy,
    setSelectedWorkflow,
    selectWorkflowLevels,
    selectUserRolesForAssign,
    selectMasterOperations,
    selectLoading,
    selectSelectedWorkflow,
    selectIsSaving
} from '../../slices/workflowSlice/workflowSlice';

// Helper function to get logged-in user's role ID
const getLoggedInRoleId = (userData) => {
    return userData?.roleId || userData?.RID || null;
};

const WorkflowManagement = () => {
    const dispatch = useDispatch();

    // Redux state
    const workflowLevels = useSelector(selectWorkflowLevels) || [];
    const masterOperations = useSelector(selectMasterOperations) || [];
    const loading = useSelector(selectLoading) || {};
    const selectedWorkflow = useSelector(selectSelectedWorkflow) || null;
    const isSaving = useSelector(selectIsSaving) || false;

    // Local state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    // Helper function to get flow details
    const getFlowDetails = (workflow) => {
        if (!workflow) return null;

        const methods = [
            () => workflow['1stFlowDetails'],
            () => workflow.lstFlowDetails,
            () => Object.getOwnPropertyDescriptor(workflow, '1stFlowDetails')?.value,
            () => {
                const flowKey = Object.keys(workflow).find(key =>
                    key.includes('FlowDetails') || key.includes('1stFlow')
                );
                return flowKey ? workflow[flowKey] : null;
            },
            () => Object.entries(workflow).find(([key, value]) =>
                key.includes('FlowDetails') && Array.isArray(value)
            )?.[1]
        ];

        for (const method of methods) {
            try {
                const result = method();
                if (result && Array.isArray(result)) {
                    return result;
                }
            } catch (e) {
                continue;
            }
        }
        return null;
    };

    // Helper function to check if workflow has valid flow details
    const hasValidFlowDetails = (workflow) => {
        if (!workflow) return false;
        const flowDetails = getFlowDetails(workflow);
        return flowDetails &&
            Array.isArray(flowDetails) &&
            flowDetails.length > 0 &&
            flowDetails.some(flow => flow && flow.UserRoleCode && flow.UserRoleCode.trim() !== '');
    };

    // Load initial data
    useEffect(() => {
        dispatch(fetchWorkflowLevels());
        dispatch(fetchMasterOperations());
        dispatch(fetchWorkflowMasterOperations());
    }, [dispatch]);

    // Filter workflows
    const filteredWorkflows = React.useMemo(() => {
        if (!Array.isArray(workflowLevels)) return [];

        return workflowLevels.filter(workflow => {
            if (!workflow) return false;

            const matchesSearch = workflow.MasterOperationDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
            const matchesFilter = filterStatus === 'all' ||
                (filterStatus === 'active' && hasValidFlowDetails(workflow)) ||
                (filterStatus === 'inactive' && !hasValidFlowDetails(workflow));
            return matchesSearch && matchesFilter;
        });
    }, [workflowLevels, searchTerm, filterStatus]);

    // Get unassigned master operations
    const unassignedOperations = React.useMemo(() => {
        if (!Array.isArray(masterOperations) || !Array.isArray(workflowLevels)) return [];

        return masterOperations.filter(operation =>
            operation && !workflowLevels.find(workflow =>
                workflow && workflow.MasterOperationID === operation.MasterOperationID
            )
        );
    }, [masterOperations, workflowLevels]);

    const toggleRowExpansion = (index) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(index)) {
            newExpanded.delete(index);
        } else {
            newExpanded.add(index);
        }
        setExpandedRows(newExpanded);
    };

    const handleCreateWorkflow = () => {
        setShowCreateModal(true);
    };

    const handleEditWorkflow = (workflow) => {
        dispatch(setSelectedWorkflow(workflow));
        setShowEditModal(true);
    };

    const handleViewWorkflow = (workflow) => {
        dispatch(setSelectedWorkflow(workflow));
        setShowViewModal(true);
    };

    const handleDeleteWorkflow = async (workflow) => {
        try {
            const pendingResult = await dispatch(fetchVerificationPendingForMaster({
                masterId: workflow.MasterOperationID,
                checkType: 'delete'
            }));

            if (pendingResult.payload && pendingResult.payload.length > 0) {
                toast.error('Cannot delete workflow with pending verifications');
                return;
            }

            toast.success('Workflow deleted successfully');
        } catch (error) {
            toast.error('Error checking pending verifications');
        }
    };

    const getWorkflowStatusColor = (workflow) => {
        if (!hasValidFlowDetails(workflow)) {
            return 'bg-gray-100 text-gray-800 border-gray-300';
        }
        return 'bg-green-100 text-green-800 border-green-300';
    };

    const getWorkflowStatusText = (workflow) => {
        if (!hasValidFlowDetails(workflow)) {
            return 'No Workflow';
        }
        const flowDetails = getFlowDetails(workflow);
        const validFlows = flowDetails?.filter(flow => flow && flow.UserRoleCode && flow.UserRoleCode.trim() !== '') || [];
        return `${validFlows.length} Levels`;
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Workflow Management</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Manage approval workflows and role assignments
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => dispatch(fetchWorkflowLevels())}
                        disabled={loading.workflowLevels}
                        className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading.workflowLevels ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                    </button>
                    <button
                        onClick={handleCreateWorkflow}
                        className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>New Workflow</span>
                    </button>
                </div>
            </div>

            {/* Search and Filter Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search workflows..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            <option value="all">All Workflows</option>
                            <option value="active">Active Workflows</option>
                            <option value="inactive">Inactive Workflows</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Workflows List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                {loading.workflowLevels ? (
                    <div className="flex items-center justify-center py-12">
                        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
                        <span className="ml-3 text-gray-600 dark:text-gray-300">Loading workflows...</span>
                    </div>
                ) : filteredWorkflows.length === 0 ? (
                    <div className="text-center py-12">
                        <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            {searchTerm || filterStatus !== 'all' ? 'No matching workflows' : 'No workflows found'}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                            {searchTerm || filterStatus !== 'all'
                                ? 'Try adjusting your search or filter criteria'
                                : 'Get started by creating your first workflow'
                            }
                        </p>
                        {!searchTerm && filterStatus === 'all' && (
                            <button
                                onClick={handleCreateWorkflow}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                Create First Workflow
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-600">
                        {filteredWorkflows.map((workflow, index) => {
                            if (!workflow) return null;

                            return (
                                <div key={workflow.MasterOperationID || index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    {/* Main Row */}
                                    <div className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4 flex-1">
                                                <div className="flex-shrink-0">
                                                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                                                        <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center space-x-3">
                                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                                            {workflow.MasterOperationDescription || 'Unnamed Workflow'}
                                                        </h3>
                                                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getWorkflowStatusColor(workflow)}`}>
                                                            {getWorkflowStatusText(workflow)}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                        Master Operation ID: {workflow.MasterOperationID || 'N/A'}
                                                    </p>
                                                    {hasValidFlowDetails(workflow) && (
                                                        <div className="flex items-center space-x-2 mt-2">
                                                            <Users className="w-4 h-4 text-gray-400" />
                                                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                                                {(getFlowDetails(workflow) || [])
                                                                    .filter(flow => flow && flow.UserRoleCode && flow.UserRoleCode.trim() !== '')
                                                                    .map(flow => flow.UserRoleCode)
                                                                    .join(' → ')
                                                                }
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => toggleRowExpansion(index)}
                                                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                                >
                                                    {expandedRows.has(index) ?
                                                        <ChevronUp className="w-5 h-5" /> :
                                                        <ChevronDown className="w-5 h-5" />
                                                    }
                                                </button>
                                                <WorkflowActionMenu
                                                    workflow={workflow}
                                                    onView={handleViewWorkflow}
                                                    onEdit={handleEditWorkflow}
                                                    onDelete={handleDeleteWorkflow}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    {expandedRows.has(index) && (
                                        <div className="px-6 pb-6 border-t border-gray-100 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
                                            <WorkflowDetails workflow={workflow} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modals */}
            {showCreateModal && (
                <CreateWorkflowModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    unassignedOperations={unassignedOperations}
                />
            )}

            {showEditModal && selectedWorkflow && (
                <EditWorkflowModal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    workflow={selectedWorkflow}
                />
            )}

            {showViewModal && selectedWorkflow && (
                <ViewWorkflowModal
                    isOpen={showViewModal}
                    onClose={() => setShowViewModal(false)}
                    workflow={selectedWorkflow}
                />
            )}
        </div>
    );
};

// Workflow Action Menu Component
const WorkflowActionMenu = ({ workflow, onView, onEdit, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
                <MoreVertical className="w-5 h-5" />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-20">
                        <div className="py-1">
                            <button
                                onClick={() => { onView(workflow); setIsOpen(false); }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <Eye className="w-4 h-4 mr-3" />
                                View Details
                            </button>
                            <button
                                onClick={() => { onEdit(workflow); setIsOpen(false); }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <Edit className="w-4 h-4 mr-3" />
                                Edit Workflow
                            </button>
                            <button
                                onClick={() => { onDelete(workflow); setIsOpen(false); }}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                                <Trash2 className="w-4 h-4 mr-3" />
                                Delete Workflow
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

// Workflow Details Component
const WorkflowDetails = ({ workflow }) => {
    const getFlowDetails = (workflow) => {
        if (!workflow) return null;

        const methods = [
            () => workflow['1stFlowDetails'],
            () => workflow.lstFlowDetails,
            () => Object.getOwnPropertyDescriptor(workflow, '1stFlowDetails')?.value,
            () => {
                const flowKey = Object.keys(workflow).find(key =>
                    key.includes('FlowDetails') || key.includes('1stFlow')
                );
                return flowKey ? workflow[flowKey] : null;
            }
        ];

        for (const method of methods) {
            try {
                const result = method();
                if (result && Array.isArray(result)) {
                    return result;
                }
            } catch (e) {
                continue;
            }
        }
        return null;
    };

    const hasValidFlowDetails = (workflow) => {
        const flowDetails = getFlowDetails(workflow);
        return flowDetails &&
            Array.isArray(flowDetails) &&
            flowDetails.length > 0 &&
            flowDetails.some(flow => flow && flow.UserRoleCode && flow.UserRoleCode.trim() !== '');
    };

    if (!hasValidFlowDetails(workflow)) {
        return (
            <div className="text-center py-6">
                <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-gray-600 dark:text-gray-400">No workflow levels configured</p>
            </div>
        );
    }

    const validFlowDetails = (getFlowDetails(workflow) || []).filter(flow =>
        flow && flow.UserRoleCode && flow.UserRoleCode.trim() !== ''
    );

    return (
        <div className="mt-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Workflow Hierarchy</h4>
            <div className="space-y-3">
                {validFlowDetails.map((level, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                                <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                                    {level.LevelOfApproval || index + 1}
                                </span>
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center space-x-2">
                                <Shield className="w-4 h-4 text-gray-400" />
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {level.UserRoleCode || 'Unknown Role'}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Level {level.LevelOfApproval || index + 1} Verification
                                {level.UserRoleID && ` (Role ID: ${level.UserRoleID})`}
                            </p>
                        </div>
                        {index < validFlowDetails.length - 1 && (
                            <ArrowRight className="w-4 h-4 text-gray-400" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// Create Workflow Modal Component
const CreateWorkflowModal = ({ isOpen, onClose, unassignedOperations = [] }) => {
    const dispatch = useDispatch();
    const userRolesForAssign = useSelector(selectUserRolesForAssign) || [];
    const loading = useSelector(selectLoading) || {};
    const isSaving = useSelector(selectIsSaving) || false;
    const { userData } = useSelector((state) => state.auth);

    const [selectedOperation, setSelectedOperation] = useState('');
    const [workflowLevels, setWorkflowLevels] = useState([
        { level: 1, roleId: '', roleName: '', isEditable: true }
    ]);

    // Get logged-in user's role ID
    const loggedInRoleId = getLoggedInRoleId(userData);

    useEffect(() => {
        if (selectedOperation && loggedInRoleId) {
            // Fetch roles that can be assigned based on current user's role
            dispatch(fetchUserRolesForAssign(loggedInRoleId));
        }
    }, [selectedOperation, loggedInRoleId, dispatch]);

    const addWorkflowLevel = () => {
        const newLevel = workflowLevels.length + 1;
        setWorkflowLevels([...workflowLevels, {
            level: newLevel,
            roleId: '',
            roleName: '',
            isEditable: true
        }]);
    };

    const removeWorkflowLevel = (index) => {
        if (workflowLevels.length > 1) {
            const updated = workflowLevels.filter((_, i) => i !== index);
            // Renumber levels
            const renumbered = updated.map((level, idx) => ({
                ...level,
                level: idx + 1
            }));
            setWorkflowLevels(renumbered);
        }
    };

    const updateWorkflowLevel = (index, field, value) => {
        const updated = [...workflowLevels];
        updated[index] = { ...updated[index], [field]: value };

        if (field === 'roleId' && userRolesForAssign) {
            const selectedRole = userRolesForAssign.find(role => role.UserRoleID === value);
            updated[index].roleName = selectedRole?.UserRoleCode || '';
        }

        setWorkflowLevels(updated);
    };

    const handleSubmit = async () => {
        if (!selectedOperation) {
            toast.error('Please select a master operation');
            return;
        }

        if (!loggedInRoleId) {
            toast.error('Unable to determine user role. Please login again.');
            return;
        }

        // Check if all levels have roles selected
        const invalidLevels = workflowLevels.filter(level => !level.roleId);
        if (invalidLevels.length > 0) {
            toast.error('Please select roles for all workflow levels');
            return;
        }

        // Prepare data arrays
        const masterIds = workflowLevels.map(() => selectedOperation);
        const roleIds = workflowLevels.map(level => level.roleId);
        const levelIds = workflowLevels.map(level => level.level);

        // Format that works (whichever option worked for you in Postman)
        const hierarchyData = {
            MasterIds: masterIds.join(',') + ',',
            RoleIds: roleIds.join(',') + ',',
            LevelIds: levelIds.join(',') + ','
        };

        try {
            await dispatch(saveApprovalHierarchy(hierarchyData)).unwrap();
            toast.success('Workflow created successfully');
            dispatch(fetchWorkflowLevels());
            onClose();
        } catch (error) {
            toast.error(error || 'Error creating workflow');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Create New Workflow</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    <div className="space-y-6">
                        {/* Warning if no role ID */}
                        {!loggedInRoleId && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start space-x-3">
                                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                                <div className="text-sm text-red-800 dark:text-red-200">
                                    <p className="font-medium mb-1">User role not found</p>
                                    <p>Unable to load available roles. Please login again or contact support.</p>
                                </div>
                            </div>
                        )}

                        {/* Master Operation Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Master Operation *
                            </label>
                            <select
                                value={selectedOperation}
                                onChange={(e) => setSelectedOperation(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                <option value="">Select Master Operation</option>
                                {unassignedOperations.map(operation => (
                                    <option key={operation.MasterOperationID} value={operation.MasterOperationID}>
                                        {operation.MasterOperationDescription}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Workflow Levels */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Workflow Levels
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Level 1 is the request initiation role
                                    </p>
                                </div>
                                <button
                                    onClick={addWorkflowLevel}
                                    disabled={!selectedOperation}
                                    className="flex items-center space-x-1 px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Add Level</span>
                                </button>
                            </div>

                            <div className="space-y-3">
                                {workflowLevels.map((level, index) => (
                                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div className="flex-shrink-0 w-20">
                                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                                Level {level.level}
                                                {level.level === 1 && (
                                                    <span className="block text-xs text-indigo-600 dark:text-indigo-400">
                                                        (Initiate)
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <select
                                                value={level.roleId}
                                                onChange={(e) => updateWorkflowLevel(index, 'roleId', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                                disabled={loading.userRolesForAssign || !selectedOperation || !loggedInRoleId}
                                            >
                                                <option value="">
                                                    {loading.userRolesForAssign
                                                        ? 'Loading roles...'
                                                        : !selectedOperation
                                                            ? 'Select Master Operation first'
                                                            : !loggedInRoleId
                                                                ? 'User role not available'
                                                                : 'Select Role'
                                                    }
                                                </option>
                                                {userRolesForAssign?.map(role => (
                                                    <option key={role.UserRoleID} value={role.UserRoleID}>
                                                        {role.UserRoleCode}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        {workflowLevels.length > 1 && (
                                            <button
                                                onClick={() => removeWorkflowLevel(index)}
                                                className="p-1 text-red-500 hover:text-red-700 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-600">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSaving || !selectedOperation}
                        className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSaving ? (
                            <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                <span>Creating...</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                <span>Create Workflow</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// // Edit Workflow Modal Component
// const EditWorkflowModal = ({ isOpen, onClose, workflow }) => {
//     const dispatch = useDispatch();
//     const userRolesForAssign = useSelector(selectUserRolesForAssign) || [];
//     const loading = useSelector(selectLoading) || {};
//     const isSaving = useSelector(selectIsSaving) || false;
//     const { userData } = useSelector((state) => state.auth);

//     const [workflowLevels, setWorkflowLevels] = useState([]);
//     const [pendingVerifications, setPendingVerifications] = useState({});
//     const [checkingPending, setCheckingPending] = useState(true);

//     // Get logged-in user's role ID
//     const loggedInRoleId = getLoggedInRoleId(userData);

//     // Helper function to get flow details
//     const getFlowDetails = (workflow) => {
//         if (!workflow) return null;

//         const methods = [
//             () => workflow['1stFlowDetails'],
//             () => workflow.lstFlowDetails,
//             () => Object.getOwnPropertyDescriptor(workflow, '1stFlowDetails')?.value,
//             () => {
//                 const flowKey = Object.keys(workflow).find(key =>
//                     key.includes('FlowDetails') || key.includes('1stFlow')
//                 );
//                 return flowKey ? workflow[flowKey] : null;
//             }
//         ];

//         for (const method of methods) {
//             try {
//                 const result = method();
//                 if (result && Array.isArray(result)) {
//                     return result;
//                 }
//             } catch (e) {
//                 continue;
//             }
//         }
//         return null;
//     };

//     // Load workflow levels and check for pending verifications
//     useEffect(() => {
//         const loadWorkflowData = async () => {
//             if (!workflow || !loggedInRoleId) return;

//             setCheckingPending(true);

//             // Fetch available roles based on current user's role
//             dispatch(fetchUserRolesForAssign(loggedInRoleId));

//             const flowDetails = getFlowDetails(workflow);

//             if (flowDetails && Array.isArray(flowDetails)) {
//                 const validFlowDetails = flowDetails.filter(detail =>
//                     detail && detail.UserRoleCode && detail.UserRoleCode.trim() !== ''
//                 );

//                 // Check for pending verifications for each role
//                 const pendingChecks = {};

//                 for (const detail of validFlowDetails) {
//                     if (detail.UserRoleID) {
//                         try {
//                             const result = await dispatch(fetchVerificationPendingForRole({
//                                 roleId: detail.UserRoleID,
//                                 masterId: workflow.MasterOperationID,
//                                 levelNo: detail.LevelOfApproval
//                             })).unwrap();

//                             // If there are pending items, mark this level and all below as locked
//                             if (result && Array.isArray(result) && result.length > 0) {
//                                 const currentLevel = detail.LevelOfApproval;
//                                 // Lock this level and all levels below it
//                                 validFlowDetails.forEach(flow => {
//                                     if (flow.LevelOfApproval <= currentLevel) {
//                                         pendingChecks[flow.LevelOfApproval] = true;
//                                     }
//                                 });
//                             }
//                         } catch (error) {
//                             console.error(`Error checking pending for level ${detail.LevelOfApproval}:`, error);
//                         }
//                     }
//                 }

//                 setPendingVerifications(pendingChecks);

//                 // Set workflow levels with editability
//                 const levels = validFlowDetails.map(detail => ({
//                     level: detail.LevelOfApproval,
//                     roleId: detail.UserRoleID ? String(detail.UserRoleID) : '',
//                     roleName: detail.UserRoleCode,
//                     isEditable: !pendingChecks[detail.LevelOfApproval],
//                     canDelete: !pendingChecks[detail.LevelOfApproval],
//                     originalRoleId: detail.UserRoleID
//                 }));

//                 setWorkflowLevels(levels);
//             }

//             setCheckingPending(false);
//         };

//         loadWorkflowData();
//     }, [workflow, loggedInRoleId, dispatch]);

//     const handleRoleChange = (index, newRoleId) => {
//         const updated = [...workflowLevels];
//         updated[index].roleId = newRoleId;
//         const selectedRole = userRolesForAssign?.find(role => String(role.UserRoleID) === String(newRoleId));
//         updated[index].roleName = selectedRole?.UserRoleCode || '';
//         setWorkflowLevels(updated);
//     };

//     const handleDeleteLevel = async (index) => {
//         const level = workflowLevels[index];

//         if (!level.canDelete) {
//             toast.error('Cannot delete level with pending verifications');
//             return;
//         }

//         try {
//             const result = await dispatch(fetchVerificationPendingForRole({
//                 roleId: level.originalRoleId,
//                 masterId: workflow.MasterOperationID,
//                 levelNo: level.level
//             })).unwrap();

//             if (result && Array.isArray(result) && result.length > 0) {
//                 toast.error('Cannot delete level with pending verifications');
//                 return;
//             }

//             const updated = workflowLevels.filter((_, i) => i !== index);
//             // Renumber levels
//             const renumbered = updated.map((lvl, idx) => ({
//                 ...lvl,
//                 level: idx + 1
//             }));
//             setWorkflowLevels(renumbered);
//             toast.success('Level removed');
//         } catch (error) {
//             toast.error('Error checking pending verifications');
//         }
//     };

//     const handleSubmit = async () => {
//         if (!loggedInRoleId) {
//             toast.error('Unable to determine user role. Please login again.');
//             return;
//         }

//         const invalidLevels = workflowLevels.filter(level => !level.roleId || level.roleId === '');
//         if (invalidLevels.length > 0) {
//             toast.error('Please select roles for all workflow levels');
//             return;
//         }

//         // For UPDATE: Single MasterId, but multiple RoleIds and LevelIds
//         const roleIds = workflowLevels.map(level => level.roleId);
//         const levelIds = workflowLevels.map((_, index) => index + 1);

//         const hierarchyData = {
//             MasterId: workflow.MasterOperationID,
//             RoleIds: roleIds.join(',') + ',',
//             LevelIds: levelIds.join(',') + ','
//         };

//         try {
//             await dispatch(updateApprovalHierarchy(hierarchyData)).unwrap();
//             toast.success('Workflow updated successfully');
//             dispatch(fetchWorkflowLevels());
//             onClose();
//         } catch (error) {
//             toast.error(error || 'Error updating workflow');
//         }
//     };
//     if (!isOpen || !workflow) return null;

//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center">
//             <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
//             <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
//                 {/* Header */}
//                 <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
//                     <div>
//                         <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
//                             Edit Workflow
//                         </h2>
//                         <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
//                             {workflow.MasterOperationDescription}
//                         </p>
//                     </div>
//                     <button
//                         onClick={onClose}
//                         className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
//                     >
//                         <X className="w-5 h-5" />
//                     </button>
//                 </div>

//                 {/* Content */}
//                 <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
//                     {!loggedInRoleId ? (
//                         <div className="text-center py-8">
//                             <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
//                             <p className="text-gray-600 dark:text-gray-400 mb-2">
//                                 User role not found
//                             </p>
//                             <p className="text-sm text-gray-500 dark:text-gray-400">
//                                 Unable to load available roles. Please login again.
//                             </p>
//                         </div>
//                     ) : checkingPending ? (
//                         <div className="flex items-center justify-center py-8">
//                             <RefreshCw className="w-6 h-6 animate-spin text-indigo-600 mr-3" />
//                             <span className="text-gray-600 dark:text-gray-300">
//                                 Checking for pending verifications...
//                             </span>
//                         </div>
//                     ) : workflowLevels.length === 0 ? (
//                         <div className="text-center py-8">
//                             <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
//                             <p className="text-gray-600 dark:text-gray-400">
//                                 No workflow levels found
//                             </p>
//                         </div>
//                     ) : (
//                         <div className="space-y-4">
//                             {/* Info banner if any levels are locked */}
//                             {Object.keys(pendingVerifications).length > 0 && (
//                                 <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-start space-x-3">
//                                     <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
//                                     <div className="text-sm text-yellow-800 dark:text-yellow-200">
//                                         <p className="font-medium mb-1">Some levels are locked</p>
//                                         <p>Levels with pending verifications (and all levels below them) cannot be edited or deleted until all pending items are processed.</p>
//                                     </div>
//                                 </div>
//                             )}

//                             {/* Add Level Button */}
//                             <div className="flex justify-end">
//                                 <button
//                                     onClick={() => {
//                                         const newLevel = workflowLevels.length + 1;
//                                         setWorkflowLevels([...workflowLevels, {
//                                             level: newLevel,
//                                             roleId: '',
//                                             roleName: '',
//                                             isEditable: true,
//                                             canDelete: true,
//                                             originalRoleId: null
//                                         }]);
//                                     }}
//                                     className="flex items-center space-x-1 px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
//                                 >
//                                     <Plus className="w-4 h-4" />
//                                     <span>Add Level</span>
//                                 </button>
//                             </div>

//                             {/* Workflow Levels */}
//                             {workflowLevels.map((level, index) => (
//                                 <div
//                                     key={index}
//                                     className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-colors ${level.isEditable
//                                         ? 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
//                                         : 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-300 dark:border-yellow-700'
//                                         }`}
//                                 >
//                                     <div className="flex-shrink-0 w-24">
//                                         <div className="flex items-center space-x-2">
//                                             <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
//                                                 <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
//                                                     {index + 1}
//                                                 </span>
//                                             </div>
//                                             <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
//                                                 Level {index + 1}
//                                             </span>
//                                         </div>
//                                     </div>

//                                     <div className="flex-1">
//                                         <select
//                                             value={level.roleId}
//                                             onChange={(e) => handleRoleChange(index, e.target.value)}
//                                             disabled={!level.isEditable || loading.userRolesForAssign}
//                                             className={`w-full px-3 py-2 border rounded-md text-sm transition-colors ${level.isEditable
//                                                 ? 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500'
//                                                 : 'border-yellow-300 dark:border-yellow-700 bg-yellow-100 dark:bg-yellow-900/20 text-gray-600 dark:text-gray-400 cursor-not-allowed'
//                                                 }`}
//                                         >
//                                             <option value="">Select Role</option>
//                                             {userRolesForAssign?.map(role => (
//                                                 <option key={role.UserRoleID} value={String(role.UserRoleID)}>
//                                                     {role.UserRoleCode}
//                                                 </option>
//                                             ))}
//                                         </select>
//                                         {!level.isEditable && (
//                                             <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1 flex items-center">
//                                                 <AlertTriangle className="w-3 h-3 mr-1" />
//                                                 Has pending verifications or level below has pending - cannot edit
//                                             </p>
//                                         )}
//                                     </div>

//                                     {workflowLevels.length > 1 && (
//                                         <button
//                                             onClick={() => handleDeleteLevel(index)}
//                                             disabled={!level.isEditable}
//                                             className={`p-2 rounded-md transition-colors ${level.isEditable
//                                                 ? 'text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20'
//                                                 : 'text-gray-400 cursor-not-allowed opacity-50'
//                                                 }`}
//                                             title={level.isEditable ? 'Delete level' : 'Cannot delete - has pending verifications or level below has pending'}
//                                         >
//                                             <Trash2 className="w-4 h-4" />
//                                         </button>
//                                     )}
//                                 </div>
//                             ))}
//                         </div>
//                     )}
//                 </div>

//                 {/* Footer */}
//                 <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-600">
//                     <button
//                         onClick={onClose}
//                         disabled={isSaving}
//                         className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors disabled:opacity-50"
//                     >
//                         Cancel
//                     </button>
//                     <button
//                         onClick={handleSubmit}
//                         disabled={isSaving || checkingPending || workflowLevels.length === 0}
//                         className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                     >
//                         {isSaving ? (
//                             <>
//                                 <RefreshCw className="w-4 h-4 animate-spin" />
//                                 <span>Updating...</span>
//                             </>
//                         ) : (
//                             <>
//                                 <Save className="w-4 h-4" />
//                                 <span>Update Workflow</span>
//                             </>
//                         )}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };
const EditWorkflowModal = ({ isOpen, onClose, workflow }) => {
    const dispatch = useDispatch();
    const userRolesForAssign = useSelector(selectUserRolesForAssign) || [];
    const loading = useSelector(selectLoading) || {};
    const isSaving = useSelector(selectIsSaving) || false;
    const { userData } = useSelector((state) => state.auth);

    const [workflowLevels, setWorkflowLevels] = useState([]);
    const [pendingVerifications, setPendingVerifications] = useState({});
    const [checkingPending, setCheckingPending] = useState(true);

    // Get logged-in user's role ID
    const loggedInRoleId = getLoggedInRoleId(userData);

    // Helper function to get flow details
    const getFlowDetails = (workflow) => {
        if (!workflow) return null;

        const methods = [
            () => workflow['1stFlowDetails'],
            () => workflow.lstFlowDetails,
            () => Object.getOwnPropertyDescriptor(workflow, '1stFlowDetails')?.value,
            () => {
                const flowKey = Object.keys(workflow).find(key =>
                    key.includes('FlowDetails') || key.includes('1stFlow')
                );
                return flowKey ? workflow[flowKey] : null;
            }
        ];

        for (const method of methods) {
            try {
                const result = method();
                if (result && Array.isArray(result)) {
                    return result;
                }
            } catch (e) {
                continue;
            }
        }
        return null;
    };

    // Load workflow levels and check for pending verifications
    useEffect(() => {
        const loadWorkflowData = async () => {
            if (!workflow || !loggedInRoleId) return;

            setCheckingPending(true);

            // Fetch available roles based on current user's role
            dispatch(fetchUserRolesForAssign(loggedInRoleId));

            const flowDetails = getFlowDetails(workflow);

            if (flowDetails && Array.isArray(flowDetails)) {
                const validFlowDetails = flowDetails.filter(detail =>
                    detail && detail.UserRoleCode && detail.UserRoleCode.trim() !== ''
                );

                // Check for pending verifications for each role
                const pendingChecks = {};

                for (const detail of validFlowDetails) {
                    if (detail.UserRoleID) {
                        try {
                            const result = await dispatch(fetchVerificationPendingForRole({
                                roleId: detail.UserRoleID,
                                masterId: workflow.MasterOperationID,
                                levelNo: detail.LevelOfApproval
                            })).unwrap();

                            // If there are pending items, mark this level and all below as locked
                            if (result && Array.isArray(result) && result.length > 0) {
                                const currentLevel = detail.LevelOfApproval;
                                // Lock this level and all levels below it
                                validFlowDetails.forEach(flow => {
                                    if (flow.LevelOfApproval <= currentLevel) {
                                        pendingChecks[flow.LevelOfApproval] = true;
                                    }
                                });
                            }
                        } catch (error) {
                            console.error(`Error checking pending for level ${detail.LevelOfApproval}:`, error);
                        }
                    }
                }

                setPendingVerifications(pendingChecks);

                // Set workflow levels with editability
                const levels = validFlowDetails.map(detail => ({
                    level: detail.LevelOfApproval,
                    roleId: detail.UserRoleID ? String(detail.UserRoleID) : '',
                    roleName: detail.UserRoleCode,
                    isEditable: !pendingChecks[detail.LevelOfApproval],
                    canDelete: !pendingChecks[detail.LevelOfApproval],
                    originalRoleId: detail.UserRoleID
                }));

                setWorkflowLevels(levels);
            }

            setCheckingPending(false);
        };

        loadWorkflowData();
    }, [workflow, loggedInRoleId, dispatch]);

    const handleRoleChange = (index, newRoleId) => {
        const updated = [...workflowLevels];
        updated[index].roleId = newRoleId;
        const selectedRole = userRolesForAssign?.find(role => String(role.UserRoleID) === String(newRoleId));
        updated[index].roleName = selectedRole?.UserRoleCode || '';
        setWorkflowLevels(updated);
    };

    const handleDeleteLevel = async (index) => {
        const level = workflowLevels[index];

        if (!level.canDelete) {
            toast.error('Cannot delete level with pending verifications');
            return;
        }

        try {
            const result = await dispatch(fetchVerificationPendingForRole({
                roleId: level.originalRoleId,
                masterId: workflow.MasterOperationID,
                levelNo: level.level
            })).unwrap();

            if (result && Array.isArray(result) && result.length > 0) {
                toast.error('Cannot delete level with pending verifications');
                return;
            }

            const updated = workflowLevels.filter((_, i) => i !== index);
            // Renumber levels
            const renumbered = updated.map((lvl, idx) => ({
                ...lvl,
                level: idx + 1
            }));
            setWorkflowLevels(renumbered);
            toast.success('Level removed');
        } catch (error) {
            toast.error('Error checking pending verifications');
        }
    };

    const handleSubmit = async () => {
        if (!loggedInRoleId) {
            toast.error('Unable to determine user role. Please login again.');
            return;
        }

        const invalidLevels = workflowLevels.filter(level => !level.roleId || level.roleId === '');
        if (invalidLevels.length > 0) {
            toast.error('Please select roles for all workflow levels');
            return;
        }

        // For UPDATE: Single MasterId, but multiple RoleIds and LevelIds
        const roleIds = workflowLevels.map(level => level.roleId);
        const levelIds = workflowLevels.map((_, index) => index + 1);

        const hierarchyData = {
            MasterId: workflow.MasterOperationID,
            RoleIds: roleIds.join(',') + ',',
            LevelIds: levelIds.join(',') + ','
        };

        try {
            await dispatch(updateApprovalHierarchy(hierarchyData)).unwrap();
            toast.success('Workflow updated successfully');
            dispatch(fetchWorkflowLevels());
            onClose();
        } catch (error) {
            toast.error(error || 'Error updating workflow');
        }
    };

    if (!isOpen || !workflow) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Edit Workflow
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {workflow.MasterOperationDescription}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    {!loggedInRoleId ? (
                        <div className="text-center py-8">
                            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                            <p className="text-gray-600 dark:text-gray-400 mb-2">
                                User role not found
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Unable to load available roles. Please login again.
                            </p>
                        </div>
                    ) : checkingPending ? (
                        <div className="flex items-center justify-center py-8">
                            <RefreshCw className="w-6 h-6 animate-spin text-indigo-600 mr-3" />
                            <span className="text-gray-600 dark:text-gray-300">
                                Checking for pending verifications...
                            </span>
                        </div>
                    ) : workflowLevels.length === 0 ? (
                        <div className="text-center py-8">
                            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                            <p className="text-gray-600 dark:text-gray-400">
                                No workflow levels found
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Info banner if any levels are locked */}
                            {Object.keys(pendingVerifications).length > 0 && (
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-start space-x-3">
                                    <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                                    <div className="text-sm text-yellow-800 dark:text-yellow-200">
                                        <p className="font-medium mb-1">Some levels are locked</p>
                                        <p>Levels with pending verifications (and all levels below them) cannot be edited or deleted until all pending items are processed.</p>
                                    </div>
                                </div>
                            )}

                            {/* ❌ REMOVED FROM HERE - WAS AT TOP */}

                            {/* Workflow Levels List */}
                            {workflowLevels.map((level, index) => (
                                <div
                                    key={index}
                                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-colors ${level.isEditable
                                        ? 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                                        : 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-300 dark:border-yellow-700'
                                        }`}
                                >
                                    <div className="flex-shrink-0 w-24">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                                                <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                                                    {index + 1}
                                                </span>
                                            </div>
                                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                                Level {index + 1}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <select
                                            value={level.roleId}
                                            onChange={(e) => handleRoleChange(index, e.target.value)}
                                            disabled={!level.isEditable || loading.userRolesForAssign}
                                            className={`w-full px-3 py-2 border rounded-md text-sm transition-colors ${level.isEditable
                                                ? 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500'
                                                : 'border-yellow-300 dark:border-yellow-700 bg-yellow-100 dark:bg-yellow-900/20 text-gray-600 dark:text-gray-400 cursor-not-allowed'
                                                }`}
                                        >
                                            <option value="">Select Role</option>
                                            {userRolesForAssign?.map(role => (
                                                <option key={role.UserRoleID} value={String(role.UserRoleID)}>
                                                    {role.UserRoleCode}
                                                </option>
                                            ))}
                                        </select>
                                        {!level.isEditable && (
                                            <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1 flex items-center">
                                                <AlertTriangle className="w-3 h-3 mr-1" />
                                                Has pending verifications or level below has pending - cannot edit
                                            </p>
                                        )}
                                    </div>

                                    {workflowLevels.length > 1 && (
                                        <button
                                            onClick={() => handleDeleteLevel(index)}
                                            disabled={!level.isEditable}
                                            className={`p-2 rounded-md transition-colors ${level.isEditable
                                                ? 'text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20'
                                                : 'text-gray-400 cursor-not-allowed opacity-50'
                                                }`}
                                            title={level.isEditable ? 'Delete level' : 'Cannot delete - has pending verifications or level below has pending'}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}

                            {/* ✅ ADD LEVEL BUTTON - MOVED TO BOTTOM */}
                            <div className="flex justify-end pt-2">
                                <button
                                    onClick={() => {
                                        const newLevel = workflowLevels.length + 1;
                                        setWorkflowLevels([...workflowLevels, {
                                            level: newLevel,
                                            roleId: '',
                                            roleName: '',
                                            isEditable: true,
                                            canDelete: true,
                                            originalRoleId: null
                                        }]);
                                    }}
                                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    <Plus className="w-5 h-5" />
                                    <span>Add Level</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-600">
                    <button
                        onClick={onClose}
                        disabled={isSaving}
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSaving || checkingPending || workflowLevels.length === 0}
                        className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSaving ? (
                            <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                <span>Updating...</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                <span>Update Workflow</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// View Workflow Modal Component
const ViewWorkflowModal = ({ isOpen, onClose, workflow }) => {
    if (!isOpen || !workflow) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        View Workflow: {workflow.MasterOperationDescription}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <WorkflowDetails workflow={workflow} />
                </div>

                <div className="flex items-center justify-end p-6 border-t border-gray-200 dark:border-gray-600">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WorkflowManagement;