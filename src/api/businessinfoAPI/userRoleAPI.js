import axios from "axios";
import { API_BASE_URL } from '../../config/apiConfig';


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