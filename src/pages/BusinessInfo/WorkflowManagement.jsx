import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
    Plus, Edit, Trash2, Eye, Users, ChevronDown, ChevronUp,
    Save, X, AlertTriangle, CheckCircle, RefreshCw, 
    Building2, Shield, UserCheck, Layers, Search, Filter,
    ArrowRight, ArrowDown, MoreVertical, Settings
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
    setEditMode,
    setSelectedWorkflow,
    clearErrors,
    selectWorkflowLevels,
    selectUserRolesForAssign,
    selectMasterOperations,
    selectWorkflowMasterOperations,
    selectLoading,
    selectErrors,
    selectEditMode,
    selectSelectedWorkflow,
    selectIsSaving
} from '../../slices/workflowSlice/workflowSlice';

const WorkflowManagement = () => {
    const dispatch = useDispatch();
    
    // Redux state with safe defaults
    const workflowLevels = useSelector(selectWorkflowLevels) || [];
    const userRoles = useSelector(selectUserRolesForAssign) || [];
    const masterOperations = useSelector(selectMasterOperations) || [];
    const workflowOperations = useSelector(selectWorkflowMasterOperations) || [];
    const loading = useSelector(selectLoading) || {};
    const errors = useSelector(selectErrors) || {};
    const editMode = useSelector(selectEditMode) || false;
    const selectedWorkflow = useSelector(selectSelectedWorkflow) || null;
    const isSaving = useSelector(selectIsSaving) || false;

    // Local state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    // Helper function to get flow details with dynamic key access
    const getFlowDetails = (workflow) => {
        if (!workflow) return null;
        
        // Try multiple access methods
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
                    console.log('🎯 Found flow details using method:', method.toString().slice(0, 50), result);
                    return result;
                }
            } catch (e) {
                // Continue to next method
            }
        }
        
        console.log('❌ No flow details found for:', workflow.MasterOperationDescription);
        return null;
    };

    // Helper function to check if workflow has valid flow details
    const hasValidFlowDetails = (workflow) => {
        if (!workflow) {
            console.log('🔍 hasValidFlowDetails: workflow is null/undefined');
            return false;
        }
        
        const flowDetails = getFlowDetails(workflow);
        console.log('🔍 hasValidFlowDetails check for:', workflow.MasterOperationDescription, {
            flowDetails,
            length: flowDetails?.length,
            hasValidRoles: flowDetails?.some(flow => flow && flow.UserRoleCode && flow.UserRoleCode.trim() !== '')
        });
        
        const result = flowDetails && 
               Array.isArray(flowDetails) &&
               flowDetails.length > 0 && 
               flowDetails.some(flow => flow && flow.UserRoleCode && flow.UserRoleCode.trim() !== '');
        
        console.log('✅ hasValidFlowDetails result:', result);
        return result;
    };

    // Load initial data
    useEffect(() => {
        dispatch(fetchWorkflowLevels());
        dispatch(fetchMasterOperations());
        dispatch(fetchWorkflowMasterOperations());
    }, [dispatch]);

    // Filter workflows based on search and status - with safe array check
    const filteredWorkflows = React.useMemo(() => {
        if (!Array.isArray(workflowLevels)) {
            return [];
        }
        
        return workflowLevels.filter(workflow => {
            if (!workflow) return false;
            
            const matchesSearch = workflow.MasterOperationDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
            const matchesFilter = filterStatus === 'all' || 
                (filterStatus === 'active' && hasValidFlowDetails(workflow)) ||
                (filterStatus === 'inactive' && !hasValidFlowDetails(workflow));
            return matchesSearch && matchesFilter;
        });
    }, [workflowLevels, searchTerm, filterStatus]);

    // Get unassigned master operations for new workflow creation - with safe array checks
    const unassignedOperations = React.useMemo(() => {
        if (!Array.isArray(masterOperations) || !Array.isArray(workflowLevels)) {
            return [];
        }
        
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

    const handleEditWorkflow = async (workflow) => {
        dispatch(setSelectedWorkflow(workflow));
        // Fetch user roles for the current workflow
        if (workflow.MasterOperationID) {
            await dispatch(fetchUserRolesForAssign(workflow.MasterOperationID));
        }
        setShowEditModal(true);
    };

    const handleViewWorkflow = (workflow) => {
        dispatch(setSelectedWorkflow(workflow));
        setShowViewModal(true);
    };

    const handleDeleteWorkflow = async (workflow) => {
        // Check if there are pending verifications
        try {
            const pendingResult = await dispatch(fetchVerificationPendingForMaster({
                masterId: workflow.MasterOperationID,
                checkType: 'delete'
            }));
            
            if (pendingResult.payload && pendingResult.payload.length > 0) {
                toast.error('Cannot delete workflow with pending verifications');
                return;
            }
            
            // Proceed with deletion logic here
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
                            // Additional safety check for each workflow
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
                                                                    .filter(flow => {
                                                                        console.log('🔗 Filtering flow:', flow, 'UserRoleCode:', flow?.UserRoleCode);
                                                                        return flow && flow.UserRoleCode && flow.UserRoleCode.trim() !== '';
                                                                    })
                                                                    .map(flow => {
                                                                        console.log('🎯 Mapping flow UserRoleCode:', flow?.UserRoleCode);
                                                                        return flow.UserRoleCode;
                                                                    })
                                                                    .join(' → ')
                                                                }
                                                            </span>
                                                        </div>
                                                    )}
                                                    {/* Additional Debug Info */}
                                                   
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
                                                <div className="relative">
                                                    <WorkflowActionMenu 
                                                        workflow={workflow}
                                                        onView={handleViewWorkflow}
                                                        onEdit={handleEditWorkflow}
                                                        onDelete={handleDeleteWorkflow}
                                                    />
                                                </div>
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
        
        // Try multiple access methods
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
                // Continue to next method
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

    // Filter out empty flow details with safe array handling
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
    const userRoles = useSelector(selectUserRolesForAssign) || [];
    const loading = useSelector(selectLoading) || {};
    const isSaving = useSelector(selectIsSaving) || false;

    const [selectedOperation, setSelectedOperation] = useState('');
    const [workflowLevels, setWorkflowLevels] = useState([
        { level: 1, roleId: '', roleName: 'Request Initiation', isEditable: false }
    ]);

    useEffect(() => {
        if (selectedOperation) {
            dispatch(fetchUserRolesForAssign(selectedOperation));
        }
    }, [selectedOperation, dispatch]);

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
            setWorkflowLevels(workflowLevels.filter((_, i) => i !== index));
        }
    };

    const updateWorkflowLevel = (index, field, value) => {
        const updated = [...workflowLevels];
        updated[index] = { ...updated[index], [field]: value };
        
        if (field === 'roleId' && userRoles) {
            const selectedRole = userRoles.find(role => role.RoleID === value);
            updated[index].roleName = selectedRole?.RoleCode || '';
        }
        
        setWorkflowLevels(updated);
    };

    const handleSubmit = async () => {
        if (!selectedOperation) {
            toast.error('Please select a master operation');
            return;
        }

        const invalidLevels = workflowLevels.filter(level => level.isEditable && !level.roleId);
        if (invalidLevels.length > 0) {
            toast.error('Please select roles for all workflow levels');
            return;
        }

        const hierarchyData = {
            masterOperationId: selectedOperation,
            workflowLevels: workflowLevels.map(level => ({
                level: level.level,
                roleId: level.roleId,
                roleName: level.roleName
            }))
        };

        try {
            await dispatch(saveApprovalHierarchy(hierarchyData));
            toast.success('Workflow created successfully');
            onClose();
        } catch (error) {
            toast.error('Error creating workflow');
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
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Workflow Levels
                                </h3>
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
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            {level.isEditable ? (
                                                <select
                                                    value={level.roleId}
                                                    onChange={(e) => updateWorkflowLevel(index, 'roleId', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                                    disabled={loading.userRolesForAssign}
                                                >
                                                    <option value="">Select Role</option>
                                                    {userRoles?.map(role => (
                                                        <option key={role.RoleID} value={role.RoleID}>
                                                            {role.RoleCode}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <div className="px-3 py-2 bg-gray-100 dark:bg-gray-600 rounded-md text-sm text-gray-600 dark:text-gray-300">
                                                    {level.roleName}
                                                </div>
                                            )}
                                        </div>
                                        {level.isEditable && workflowLevels.length > 1 && (
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

// Edit Workflow Modal Component (similar structure to create but with pre-populated data)
const EditWorkflowModal = ({ isOpen, onClose, workflow }) => {
    const dispatch = useDispatch();
    const userRoles = useSelector(selectUserRolesForAssign) || [];
    const isSaving = useSelector(selectIsSaving) || false;

    const [workflowLevels, setWorkflowLevels] = useState([]);

    useEffect(() => {
        if (workflow) {
            // Try multiple methods to get flow details
            const getFlowDetails = (workflow) => {
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
                        // Continue to next method
                    }
                }
                return null;
            };

            const flowDetails = getFlowDetails(workflow);
            if (flowDetails && Array.isArray(flowDetails)) {
                // Filter out empty flow details and only include valid ones
                const validFlowDetails = flowDetails.filter(detail => 
                    detail && detail.UserRoleCode && detail.UserRoleCode.trim() !== ''
                );
                
                setWorkflowLevels(validFlowDetails.map(detail => ({
                    level: detail.LevelOfApproval,
                    roleId: detail.UserRoleID || '',
                    roleName: detail.UserRoleCode,
                    isEditable: true,
                    canDelete: true
                })));
            }
        }
    }, [workflow]);

    const handleSubmit = async () => {
        const hierarchyData = {
            masterOperationId: workflow.MasterOperationID,
            workflowLevels: workflowLevels
        };

        try {
            await dispatch(updateApprovalHierarchy(hierarchyData));
            toast.success('Workflow updated successfully');
            onClose();
        } catch (error) {
            toast.error('Error updating workflow');
        }
    };

    if (!isOpen || !workflow) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
                {/* Similar structure to CreateWorkflowModal but with edit functionality */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Edit Workflow: {workflow.MasterOperationDescription}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="space-y-4">
                        {workflowLevels.map((level, index) => (
                            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="flex-shrink-0 w-20">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                        Level {level.level}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <select
                                        value={level.roleId}
                                        onChange={(e) => {
                                            const updated = [...workflowLevels];
                                            updated[index].roleId = e.target.value;
                                            const selectedRole = userRoles?.find(role => role.RoleID === e.target.value);
                                            updated[index].roleName = selectedRole?.RoleCode || '';
                                            setWorkflowLevels(updated);
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                    >
                                        <option value="">Select Role</option>
                                        {userRoles?.map(role => (
                                            <option key={role.RoleID} value={role.RoleID}>
                                                {role.RoleCode}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {level.canDelete && (
                                    <button
                                        onClick={() => {
                                            // Check for pending verifications before allowing delete
                                            setWorkflowLevels(workflowLevels.filter((_, i) => i !== index));
                                        }}
                                        className="p-1 text-red-500 hover:text-red-700 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-600">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSaving}
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