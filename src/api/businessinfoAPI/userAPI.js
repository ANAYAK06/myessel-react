import axios from "axios";

const API_BASE_URL = 'http://localhost:57771/api';

// User Management Operations
// -------------------------

export const saveNewUser = async (userData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Accounts/SaveNewUser`,
            userData,
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

export const getAllUserDetails = async () => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetAllUserDetails`,
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

export const updateUser = async (userData) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/Accounts/UpdateUser`,
            userData,
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

export const updatePassword = async (passwordData) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/Accounts/UpdatePassword`,
            passwordData,
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

export const getUserByUsername = async (username, logintype) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetUserbyUsername?Username=${username}&Logintype=${logintype}`,
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

export const checkUserByUsername = async (username, logintype) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/CheckUserbyUsername?Username=${username}&Logintype=${logintype}`,
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

export const getVerificationUsers = async (roleid) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetVerificationUsers?Roleid=${roleid}`,
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

export const viewApproveUserById = async (userid, roleid) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/ViewApproveUserbyid?userid=${userid}&Roleid=${roleid}`,
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

export const approveUser = async (userData) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/Accounts/ApproveUser`,
            userData,
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