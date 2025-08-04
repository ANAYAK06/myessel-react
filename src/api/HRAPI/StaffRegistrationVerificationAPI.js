import axios from "axios";

import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// STAFF REGISTRATION & APPROVAL RELATED APIs
// ==============================================

// 1. Get Verification Staff by Role ID
export const getVerificationStaff = async (roleId) => {
    try {
        console.log('👥 Getting Verification Staff for Role ID:', roleId); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/HR/GetVerificationStaff?Roleid=${roleId}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Verification Staff Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Verification Staff API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 2. Get Verification Staff Data by ID
export const getVerificationStaffDataById = async (params) => {
    try {
        const { empRefNo, roleId } = params;
        console.log('🔍 Getting Verification Staff Data for:', { empRefNo, roleId }); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/HR/GetVerificationStaffDatabyId?EmpRefNo=${empRefNo}&RoleId=${roleId}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Verification Staff Data Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Verification Staff Data API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 3. Approve Staff Registration
export const approveStaffRegistration = async (approvalData) => {
    try {
        console.log('✅ Approving Staff Registration with data:', approvalData); // DEBUG
        
        const response = await axios.put(
            `${API_BASE_URL}/HR/ApproveStaffRegistration`,
            approvalData,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Staff Registration Approval Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Staff Registration Approval API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};