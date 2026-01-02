import axios from "axios";
import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// LABOUR BASED APPRAISAL VERIFICATION RELATED APIs
// ==============================================

// 1. Get Verify LB Object Goals Inbox (GET)
export const getVerifyLBObjectGoals = async (params) => {
    try {
        const { roleId } = params;
        console.log('📊 Getting Verify LB Object Goals Inbox for RoleID:', roleId); // DEBUG
        
        // Validate required parameters
        if (!roleId) {
            console.error('❌ RoleID is missing!');
            throw new Error('RoleID is required');
        }
        
        const queryParams = new URLSearchParams({
            RoleId: roleId.toString().trim()
        });
        
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetVerifyLBObjectGoals?${queryParams.toString()}`); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/HR/GetVerifyLBObjectGoals?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Verify LB Object Goals Inbox Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Verify LB Object Goals Inbox API Error:', error.response || error);
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

// 2. Get LB Appraisal by ID (GET)
export const getLBAppraisalById = async (params) => {
    try {
        const { id, labourId } = params;
        console.log('📋 Getting LB Appraisal Details for ID:', id, 'LabourId:', labourId); // DEBUG
        
        // Validate required parameters
        if (!id) {
            console.error('❌ ID is missing!');
            throw new Error('ID is required');
        }
        if (!labourId) {
            console.error('❌ LabourId is missing!');
            throw new Error('LabourId is required');
        }
        
        const queryParams = new URLSearchParams({
            Id: id.toString().trim(),
            LabourId: labourId.toString().trim()
        });
        
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetLBAppraisalbyId?${queryParams.toString()}`); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/HR/GetLBAppraisalbyId?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ LB Appraisal Details Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ LB Appraisal Details API Error:', error.response || error);
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


// 3. Approve LB Objects (PUT)
export const approveLBObjects = async (params) => {
    try {
        console.log('✅ Approving LB Objects for:', params); // DEBUG
        
        // Validate required parameters
        if (!params.LabourId) {
            console.error('❌ LabourId is missing!');
            throw new Error('LabourId is required');
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
            LabourId: params.LabourId.toString().trim(),
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
        
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/ApproveLBObjects`); // DEBUG
        console.log('📦 Approval Payload:', payload); // DEBUG
        
        const response = await axios.put(
            `${API_BASE_URL}/HR/ApproveLBObjects`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Approve LB Objects Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Approve LB Objects API Error:', error.response || error);
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