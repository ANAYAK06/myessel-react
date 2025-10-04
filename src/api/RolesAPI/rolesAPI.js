import axios from "axios";
import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// USER ROLE MANAGEMENT RELATED APIs
// ==============================================

// 1. Get Role Design
export const getRoleDesign = async () => {
    try {
        console.log('🎭 Getting Role Design...'); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetRoleDesign`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Role Design Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Role Design API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 2. Save New User Role (POST - for creating)
export const saveNewUserRole = async (roleData) => {
    try {
        console.log('💾 Saving New User Role...');
        
        const directPayload = {
            Action: roleData.businessRole.Action || 'Add',
            RoleName: roleData.businessRole.RoleName,
            Status: roleData.businessRole.Status,
            ApplicableForCC: roleData.businessRole.ApplicableForCC,
            ApplicableCCTypes: roleData.businessRole.ApplicableCCTypes || '',
            CheckCC: roleData.businessRole.CheckCC || 'No',
            Createdby: roleData.businessRole.Createdby
        };
        
        console.log('📤 Direct Payload:', JSON.stringify(directPayload, null, 2));
        
        const response = await axios.post(
            `${API_BASE_URL}/Accounts/SaveNewUserRole`,
            directPayload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 30000
            }
        );
        
        console.log('✅ Save Response:', response.data);
        return response.data;
        
    } catch (error) {
        console.error('❌ Save Error:', error.response?.data || error);
        throw error.response?.data || error;
    }
};

// 3. Update User Role (PUT - for updating)
// 3. Update User Role (PUT - for updating) - Uses Form Data format
export const updateUserRole = async (roleData) => {
    try {
        console.log('🔄 Updating User Role...');
        console.log('📊 Original Payload:', JSON.stringify(roleData, null, 2));
        
        // Extract direct fields from businessRole wrapper
        const directPayload = {
            Action: roleData.businessRole.Action || 'Update',
            UserRoleID: roleData.businessRole.UserRoleID,
            RoleName: roleData.businessRole.RoleName,
            Status: roleData.businessRole.Status,
            ApplicableForCC: roleData.businessRole.ApplicableForCC,
            ApplicableCCTypes: roleData.businessRole.ApplicableCCTypes || '',
            CheckCC: roleData.businessRole.CheckCC || 'No',
            Createdby: roleData.businessRole.Createdby
        };
        
        console.log('📤 Direct Payload:', JSON.stringify(directPayload, null, 2));
        
        const response = await axios.put(
            `${API_BASE_URL}/Accounts/UpdateUserRole`,
            directPayload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 30000
            }
        );
        
        console.log('✅ Update Response:', response.data);
        return response.data;
        
    } catch (error) {
        console.error('❌ Update Error:', error.response?.data || error);
        throw error.response?.data || error;
    }
};
// 4. Get Verification Pending Role Design by Role ID
export const getVerificationPendingRoleDesign = async (roleId) => {
    try {
        console.log('⏳ Getting Verification Pending Role Design for Role ID:', roleId);
        
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetVerificationPendingRoleDesign?Roleid=${roleId}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Verification Pending Role Design Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Verification Pending Role Design API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};