


import axios from "axios";

const API_BASE_URL = 'http://localhost:57771/api';


// Employee Role Assignment Operations
// ----------------------------------

export const getAllEmployeeDetailsByCurrentRole = async (currentRoleId) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetAllEmployeeDetailsByCurrentRole?CurrentRoleId=${currentRoleId}`,
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

export const saveEmpRoleAssign = async (empRoleData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Accounts/SaveEmpRoleAssign`,
            empRoleData,
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

export const updateEmpRoleAssign = async (empRoleData) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/Accounts/UpdateEmpRoleAssign`,
            empRoleData,
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

export const getAllEmployeeDetails = async () => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetAllEmployeeDetails`,
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

export const getEmployeeDetailsByUser = async (userName) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetEmployeeDetailsbyUser?UserName=${userName}`,
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
