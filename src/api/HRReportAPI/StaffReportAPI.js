import axios from "axios";
import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// STAFF RELATED APIs
// ==============================================

// 1. Get All Staff by Role ID
export const getAllStaff = async (params) => {
    try {
        const { roleId } = params;
        console.log('👥 Getting All Staff for Role ID:', roleId); // DEBUG
        
        // Validate required parameters
        if (!roleId) {
            throw new Error('RoleID is required');
        }
        
        const queryParams = new URLSearchParams({
            RoleID: roleId.toString().trim()
        });
        
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetAllStaff?${queryParams.toString()}`); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/HR/GetAllStaff?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );
        
        console.log('✅ All Staff Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Get All Staff API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 2. Get Staff Details by Reference Number
export const getStaffDetailsByRefNo = async (params) => {
    try {
        const { empRefNo, roleId } = params;
        console.log('🔍 Getting Staff Details for:', { empRefNo, roleId }); // DEBUG
        
        // Validate required parameters
        if (!empRefNo) {
            throw new Error('EmpRefNo is required');
        }
        if (!roleId) {
            throw new Error('RoleId is required');
        }
        
        const queryParams = new URLSearchParams({
            EmpRefNo: empRefNo.toString().trim(),
            RoleId: roleId.toString().trim()
        });
        
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetStaffDetailsbyRefNo?${queryParams.toString()}`); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/HR/GetStaffDetailsbyRefNo?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );
        
        console.log('✅ Staff Details Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Get Staff Details API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};