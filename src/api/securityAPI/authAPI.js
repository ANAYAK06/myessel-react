import axios from "axios";

import { API_BASE_URL } from '../../config/apiConfig';

// Employee Authentication Operations
// ---------------------------------

export const validateEmployee = async (credentials) => {
    try {
        // Convert to backend expected format
        const backendPayload = {
            Username: credentials.employeeId,  // Convert employeeId to Username
            Password: credentials.password     // Convert password to Password (capital P)
        };

        console.log('🔍 Sending to backend:', backendPayload); // DEBUG
        console.log('🌐 API URL:', `${API_BASE_URL}/Security/GetValidEmployee`); // DEBUG

        const response = await axios.post(
            `${API_BASE_URL}/Security/GetValidEmployee`,
            backendPayload,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ API Success Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ API Error:', error.response || error);
        console.error('❌ Error status:', error.response?.status);
        console.error('❌ Error data:', error.response?.data);
        
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// Role/User Authentication Operations
// ---------------------------------

export const validateUser = async (credentials) => {
    try {
        // Convert to backend expected format
        const backendPayload = {
            Username: credentials.employeeId,  // Convert employeeId to Username
            Password: credentials.password     // Convert password to Password (capital P)
        };

        console.log('🔍 Sending user validation to backend:', backendPayload); // DEBUG

        const response = await axios.post(
            `${API_BASE_URL}/Security/GetValidUser`,
            backendPayload,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
          console.log('✅ Validated user data:', response.data);
        
        return response.data;
    } catch (error) {
        console.error('User Validation API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// Employee Details Operations
// -------------------------

export const getEmployeeDetails = async (username) => {
    try {
        console.log('🔍 Getting employee details for:', username); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetEmployeeDetailsbyUser?UserName=${username}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
          console.log('✅ GET EmployeeDetails:', response.data);
        return response.data;
    } catch (error) {
        console.error('Employee Details API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// Menu/Role Operations
// ------------------

export const getMenu = async (roleId) => {
    try {
        console.log('🔍 Getting menu for roleId:', roleId); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetMenu?roleId=${roleId}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        return response.data;
    } catch (error) {
        console.error('Menu API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};