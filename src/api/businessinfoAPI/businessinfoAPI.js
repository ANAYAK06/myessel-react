// api/businessInfoAPI.js
import axios from "axios";


import { API_BASE_URL } from '../../config/apiConfig';

// Workflow Levels Operations
// -------------------------

export const getAllWorkFlowLevels = async () => {
    try {
        console.log('🔍 Getting workflow levels'); // DEBUG
        console.log('🌐 API URL:', `${API_BASE_URL}/Accounts/GetAllWorkFlowLevels`); // DEBUG

        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetAllWorkFlowLevels`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Workflow Levels API Success:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Workflow Levels API Error:', error.response || error);
        console.error('❌ Error status:', error.response?.status);
        console.error('❌ Error data:', error.response?.data);
        
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// User Roles Operations
// --------------------

export const getAllUserRoles = async () => {
    try {
        console.log('🔍 Getting user roles'); // DEBUG
        console.log('🌐 API URL:', `${API_BASE_URL}/Accounts/GetAllUserRoles`); // DEBUG

        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetAllUserRoles`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ User Roles API Success:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ User Roles API Error:', error.response || error);
        console.error('❌ Error status:', error.response?.status);
        console.error('❌ Error data:', error.response?.data);
        
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
        console.log('🔍 Getting master operations'); // DEBUG
        console.log('🌐 API URL:', `${API_BASE_URL}/Accounts/GetAllMasterOperations`); // DEBUG

        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetAllMasterOperations`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Master Operations API Success:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Master Operations API Error:', error.response || error);
        console.error('❌ Error status:', error.response?.status);
        console.error('❌ Error data:', error.response?.data);
        
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
        console.log('🔍 Getting workflow master operations'); // DEBUG
        console.log('🌐 API URL:', `${API_BASE_URL}/Accounts/GetWorkFlowMasterOperations`); // DEBUG

        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetWorkFlowMasterOperations`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Workflow Master Operations API Success:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Workflow Master Operations API Error:', error.response || error);
        console.error('❌ Error status:', error.response?.status);
        console.error('❌ Error data:', error.response?.data);
        
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
        console.log('🔍 Saving approval hierarchy:', hierarchyData); // DEBUG
        console.log('🌐 API URL:', `${API_BASE_URL}/Accounts/SaveApprovalHierarchy`); // DEBUG

        const response = await axios.post(
            `${API_BASE_URL}/Accounts/SaveApprovalHierarchy`,
            hierarchyData,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Save Approval Hierarchy API Success:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Save Approval Hierarchy API Error:', error.response || error);
        console.error('❌ Error status:', error.response?.status);
        console.error('❌ Error data:', error.response?.data);
        
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const saveRoleOperations = async (operationsData) => {
    try {
        console.log('🔍 Saving role operations:', operationsData); // DEBUG
        console.log('🌐 API URL:', `${API_BASE_URL}/Accounts/SaveRoleOperaions`); // DEBUG

        const response = await axios.post(
            `${API_BASE_URL}/Accounts/SaveRoleOperaions`,
            operationsData,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Save Role Operations API Success:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Save Role Operations API Error:', error.response || error);
        console.error('❌ Error status:', error.response?.status);
        console.error('❌ Error data:', error.response?.data);
        
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// Additional CRUD Operations for Future Use
// -----------------------------------------

export const createUser = async (userData) => {
    try {
        console.log('🔍 Creating user:', userData); // DEBUG
        console.log('🌐 API URL:', `${API_BASE_URL}/Accounts/CreateUser`); // DEBUG

        const response = await axios.post(
            `${API_BASE_URL}/Accounts/CreateUser`,
            userData,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Create User API Success:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Create User API Error:', error.response || error);
        console.error('❌ Error status:', error.response?.status);
        console.error('❌ Error data:', error.response?.data);
        
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const updateUser = async (userId, userData) => {
    try {
        console.log('🔍 Updating user:', userId, userData); // DEBUG
        console.log('🌐 API URL:', `${API_BASE_URL}/Accounts/UpdateUser`); // DEBUG

        const response = await axios.put(
            `${API_BASE_URL}/Accounts/UpdateUser`,
            { userId, ...userData },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Update User API Success:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Update User API Error:', error.response || error);
        console.error('❌ Error status:', error.response?.status);
        console.error('❌ Error data:', error.response?.data);
        
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const deleteUser = async (userId) => {
    try {
        console.log('🔍 Deleting user:', userId); // DEBUG
        console.log('🌐 API URL:', `${API_BASE_URL}/Accounts/DeleteUser/${userId}`); // DEBUG

        const response = await axios.delete(
            `${API_BASE_URL}/Accounts/DeleteUser/${userId}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Delete User API Success:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Delete User API Error:', error.response || error);
        console.error('❌ Error status:', error.response?.status);
        console.error('❌ Error data:', error.response?.data);
        
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// Role Management Operations
// -------------------------

export const createRole = async (roleData) => {
    try {
        console.log('🔍 Creating role:', roleData); // DEBUG

        const response = await axios.post(
            `${API_BASE_URL}/Accounts/CreateRole`,
            roleData,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Create Role API Success:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Create Role API Error:', error.response || error);
        
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const updateRole = async (roleId, roleData) => {
    try {
        console.log('🔍 Updating role:', roleId, roleData); // DEBUG

        const response = await axios.put(
            `${API_BASE_URL}/Accounts/UpdateRole`,
            { roleId, ...roleData },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Update Role API Success:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Update Role API Error:', error.response || error);
        
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const assignUserRole = async (userId, roleId) => {
    try {
        console.log('🔍 Assigning role to user:', userId, roleId); // DEBUG

        const response = await axios.post(
            `${API_BASE_URL}/Accounts/AssignUserRole`,
            { userId, roleId },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Assign User Role API Success:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Assign User Role API Error:', error.response || error);
        
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// Firm Information Operations
// --------------------------

export const getFirmInfo = async () => {
    try {
        console.log('🔍 Getting firm information'); // DEBUG

        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetFirmInfo`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Get Firm Info API Success:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Get Firm Info API Error:', error.response || error);
        
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const saveFirmInfo = async (firmData) => {
    try {
        console.log('🔍 Saving firm information:', firmData); // DEBUG

        const response = await axios.post(
            `${API_BASE_URL}/Accounts/SaveFirmInfo`,
            firmData,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Save Firm Info API Success:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Save Firm Info API Error:', error.response || error);
        
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};