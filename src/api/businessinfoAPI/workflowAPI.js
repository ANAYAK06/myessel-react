// api/userRoleWorkflowAPI.js
import axios from "axios";
import { API_BASE_URL } from '../../config/apiConfig';

// Workflow Levels Operations
// -------------------------

export const getAllWorkFlowLevels = async () => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetAllWorkFlowLevels`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};



export const getUserRolesForRoleAssign = async (currentRoleId) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetUserRolesForRoleAssgin?CurrentRoleId=${currentRoleId}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// Master Operations
// ----------------

export const getAllMasterOperations = async () => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetAllMasterOperations`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// Workflow Master Operations
// -------------------------

export const getWorkFlowMasterOperations = async () => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetWorkFlowMasterOperations`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const getRoleOperationRoles = async (masterOperationid) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetRoleOperationRoles?MasterOperationid=${masterOperationid}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// Save Operations
// --------------

export const saveApprovalHierarchy = async (hierarchyData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Accounts/SaveApprovalHierarchy`,
            hierarchyData,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const saveRoleOperations = async (operationsData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Accounts/SaveRoleOperaions`,
            operationsData,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};



// Workflow Status and Verification Operations
// ------------------------------------------

export const getMasterWorkFlowStatus = async (masterids, roleid) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetMasterWorkFlowStatus?Masterids=${masterids}&Roleid=${roleid}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const getVerificationPendingForRole = async (roleid, masterid, levelno) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetVerificationPendingForRole?Roleid=${roleid}&Masterid=${masterid}&Levelno=${levelno}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const getVerificationPendingForMasterid = async (masterid, checkType) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetVerificationPendingForMasterid?Masterid=${masterid}&CheckType=${checkType}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const updateApprovalHierarchy = async (hierarchyData) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/Accounts/UpdateApprovalHierarchy`,
            hierarchyData,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const updateMasterOperaionStatus = async (statusData) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/Accounts/UpdateMasterOperaionStatus`,
            statusData,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

