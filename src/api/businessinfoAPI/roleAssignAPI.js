import axios from "axios";
import { API_BASE_URL } from '../../config/apiConfig';

// Employee Role Assignment Operations
// ----------------------------------

export const getAllEmployeeDetailsByCurrentRole = async (currentRoleId) => {
    try {
        console.log('🔍 API Call: GetAllEmployeeDetailsByCurrentRole', {
            currentRoleId,
            url: `${API_BASE_URL}/Accounts/GetAllEmployeeDetailsByCurrentRole?CurrentRoleId=${currentRoleId}`
        });

        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetAllEmployeeDetailsByCurrentRole?CurrentRoleId=${currentRoleId}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ Response: GetAllEmployeeDetailsByCurrentRole', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Error: GetAllEmployeeDetailsByCurrentRole', {
            error: error.response?.data || error.message,
            status: error.response?.status
        });
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const saveEmpRoleAssign = async (empRoleData) => {
    try {
        console.log('📤 API Call: SaveEmpRoleAssign (POST)', {
            url: `${API_BASE_URL}/Accounts/SaveEmpRoleAssign`,
            payload: empRoleData,
            payloadString: JSON.stringify(empRoleData, null, 2)
        });

        const response = await axios.post(
            `${API_BASE_URL}/Accounts/SaveEmpRoleAssign`,
            empRoleData,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ Response: SaveEmpRoleAssign', {
            status: response.status,
            data: response.data
        });
        
        return response.data;
    } catch (error) {
        console.error('❌ Error: SaveEmpRoleAssign', {
            error: error.response?.data || error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            fullError: error.response
        });
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const updateEmpRoleAssign = async (empRoleData) => {
    try {
        console.log('📤 API Call: UpdateEmpRoleAssign (PUT)', {
            url: `${API_BASE_URL}/Accounts/UpdateEmpRoleAssign`,
            payload: empRoleData,
            payloadString: JSON.stringify(empRoleData, null, 2)
        });

        const response = await axios.put(
            `${API_BASE_URL}/Accounts/UpdateEmpRoleAssign`,
            empRoleData,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ Response: UpdateEmpRoleAssign', {
            status: response.status,
            data: response.data
        });

        return response.data;
    } catch (error) {
        console.error('❌ Error: UpdateEmpRoleAssign', {
            error: error.response?.data || error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            fullError: error.response
        });
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const getAllEmployeeDetails = async () => {
    try {
        console.log('🔍 API Call: GetAllEmployeeDetails', {
            url: `${API_BASE_URL}/Accounts/GetAllEmployeeDetails`
        });

        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetAllEmployeeDetails`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ Response: GetAllEmployeeDetails', {
            count: response.data?.Data?.length || 0
        });

        return response.data;
    } catch (error) {
        console.error('❌ Error: GetAllEmployeeDetails', {
            error: error.response?.data || error.message,
            status: error.response?.status
        });
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const getEmployeeDetailsByUser = async (userName) => {
    try {
        console.log('🔍 API Call: GetEmployeeDetailsbyUser', {
            userName,
            url: `${API_BASE_URL}/Accounts/GetEmployeeDetailsbyUser?UserName=${userName}`
        });

        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetEmployeeDetailsbyUser?UserName=${userName}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ Response: GetEmployeeDetailsbyUser', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Error: GetEmployeeDetailsbyUser', {
            error: error.response?.data || error.message,
            status: error.response?.status
        });
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const getUserCCByRoleId = async (roleId) => {
    try {
        console.log('🔍 API Call: GetUserCCByRoleid', {
            roleId,
            url: `${API_BASE_URL}/Accounts/GetUserCCByRoleid?Roleid=${roleId}`
        });

        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetUserCCByRoleid?Roleid=${roleId}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ Response: GetUserCCByRoleid', {
            count: response.data?.Data?.UserCC?.length || 0,
            data: response.data
        });

        return response.data;
    } catch (error) {
        console.error('❌ Error: GetUserCCByRoleid', {
            error: error.response?.data || error.message,
            status: error.response?.status
        });
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};