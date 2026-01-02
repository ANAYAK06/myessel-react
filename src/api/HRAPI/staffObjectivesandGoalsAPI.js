import axios from "axios";
import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// STAFF OBJECTIVES AND GOALS VERIFICATION RELATED APIs
// ==============================================

// 1. Get Verify Objects And Goals Inbox (GET)
export const getVerifyObjectsAndGoals = async (params) => {
    try {
        const { roleId } = params;
        console.log('📊 Getting Verify Objects And Goals Inbox for RoleID:', roleId); // DEBUG
        
        // Validate required parameters
        if (!roleId) {
            console.error('❌ RoleID is missing!');
            throw new Error('RoleID is required');
        }
        
        const queryParams = new URLSearchParams({
            RoleId: roleId.toString().trim()
        });
        
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetVerifyObjectsAndGoals?${queryParams.toString()}`); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/HR/GetVerifyObjectsAndGoals?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Verify Objects And Goals Inbox Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Verify Objects And Goals Inbox API Error:', error.response || error);
        console.error('❌ Error Details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 2. Get Appraisal by ID (GET)
export const getAppraisalById = async (params) => {
    try {
        const { id, empRefNo } = params;
        console.log('📋 Getting Appraisal Details for ID:', id, 'EmpRefNo:', empRefNo); // DEBUG
        
        // Validate required parameters
        if (!id) {
            console.error('❌ ID is missing!');
            throw new Error('ID is required');
        }
        if (!empRefNo) {
            console.error('❌ EmpRefNo is missing!');
            throw new Error('EmpRefNo is required');
        }
        
        const queryParams = new URLSearchParams({
            Id: id.toString().trim(),
            EmpRefNo: empRefNo.toString().trim()
        });
        
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetAppraisalbyId?${queryParams.toString()}`); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/HR/GetAppraisalbyId?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Appraisal Details Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Appraisal Details API Error:', error.response || error);
        console.error('❌ Error Details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 3. Approve Emp Objects (PUT)
export const approveEmpObjects = async (params) => {
    try {
        console.log('✅ Approving Emp Objects for:', params); // DEBUG
        
        // Validate required parameters
        if (!params.EmpRefNo) {
            console.error('❌ EmpRefNo is missing!');
            throw new Error('EmpRefNo is required');
        }
        if (!params.Id) {
            console.error('❌ Id is missing!');
            throw new Error('Id is required');
        }
        if (!params.RoleId) {
            console.error('❌ RoleId is missing!');
            throw new Error('RoleId is required');
        }
        if (!params.Createdby) {
            console.error('❌ Createdby is missing!');
            throw new Error('Createdby is required');
        }
        if (!params.Action) {
            console.error('❌ Action is missing!');
            throw new Error('Action is required');
        }
        
        const payload = {
            EmpRefNo: params.EmpRefNo.toString().trim(),
            Id: parseInt(params.Id),
            Remarks: params.Remarks?.toString().trim() || '',
            Year: params.Year ? parseInt(params.Year) : 0,
            Month: params.Month ? parseInt(params.Month) : 0,
            CCCode: params.CCCode?.toString().trim() || '',
            RoleId: parseInt(params.RoleId),
            Createdby: params.Createdby.toString().trim(),
            Action: params.Action.toString().trim(),
            Note: params.Note?.toString().trim() || ''
        };
        
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/ApproveEmpObjects`); // DEBUG
        console.log('📦 Approval Payload:', payload); // DEBUG
        
        const response = await axios.put(
            `${API_BASE_URL}/HR/ApproveEmpObjects`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Approve Emp Objects Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Approve Emp Objects API Error:', error.response || error);
        console.error('❌ Error Details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};