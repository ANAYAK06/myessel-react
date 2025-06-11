import axios from "axios";

const API_BASE_URL = 'http://localhost:57771/api';


// User Roles Operations
// --------------------

export const getAllUserRoles = async () => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetAllUserRoles`,
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

export const saveNewUserRole = async (roleData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Accounts/SaveNewUserRole`,
            roleData,
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

export const updateUserRole = async (roleData) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/Accounts/UpdateUserRole`,
            roleData,
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