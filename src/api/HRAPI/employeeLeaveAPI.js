import axios from "axios";
import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// HR LEAVE REQUEST VERIFICATION RELATED APIs
// ==============================================

// 1. Get Verify Leave Requests Inbox (GET)
export const getVerifyLeaveRequests = async (params) => {
    try {
        const { roleId } = params;
        console.log('📊 Getting Verify Leave Requests Inbox for RoleID:', roleId); // DEBUG
        
        // Validate required parameters
        if (!roleId) {
            console.error('❌ RoleID is missing!');
            throw new Error('RoleID is required');
        }
        
        const queryParams = new URLSearchParams({
            RoleId: roleId.toString().trim()
        });
        
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetVerifyLeaveRequests?${queryParams.toString()}`); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/HR/GetVerifyLeaveRequests?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Verify Leave Requests Inbox Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Verify Leave Requests Inbox API Error:', error.response || error);
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

// 2. Get Single Employee for Leave Request (GET)
export const getSingleEmpForLeaveRequest = async (params) => {
    try {
        const { empRefno } = params;
        console.log('📋 Getting Employee Leave Request Details for EmpRefno:', empRefno); // DEBUG
        
        // Validate required parameters
        if (!empRefno) {
            console.error('❌ EmpRefno is missing!');
            throw new Error('EmpRefno is required');
        }
        
        const queryParams = new URLSearchParams({
            EmpRefno: empRefno.toString().trim()
        });
        
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetSingleEmpForLeaveRequest?${queryParams.toString()}`); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/HR/GetSingleEmpForLeaveRequest?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Employee Leave Request Details Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Employee Leave Request Details API Error:', error.response || error);
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

// 3. Approve HR Leave Request (PUT)
export const approveHRLeaveRequest = async (params) => {
    try {
        console.log('✅ Approving HR Leave Request for:', params); // DEBUG
        
        // Validate required parameters
        if (!params.EmpRefNo) {
            console.error('❌ EmpRefNo is missing!');
            throw new Error('EmpRefNo is required');
        }
        if (!params.TransactionRefNo) {
            console.error('❌ TransactionRefNo is missing!');
            throw new Error('TransactionRefNo is required');
        }
        if (!params.Roleid) {
            console.error('❌ Roleid is missing!');
            throw new Error('Roleid is required');
        }
        if (!params.Action) {
            console.error('❌ Action is missing!');
            throw new Error('Action is required');
        }
        if (!params.CreatedBy) {
            console.error('❌ CreatedBy is missing!');
            throw new Error('CreatedBy is required');
        }
        if (!params.UserName) {
            console.error('❌ UserName is missing!');
            throw new Error('UserName is required');
        }
        if (!params.Noofleaves) {
            console.error('❌ Noofleaves is missing!');
            throw new Error('Noofleaves is required');
        }
        if (!params.LeaveTypeId) {
            console.error('❌ LeaveTypeId is missing!');
            throw new Error('LeaveTypeId is required');
        }
        if (!params.JoiningCostCenter) {
            console.error('❌ JoiningCostCenter is missing!');
            throw new Error('JoiningCostCenter is required');
        }
        if (!params.FromDate) {
            console.error('❌ FromDate is missing!');
            throw new Error('FromDate is required');
        }
        if (!params.ToDate) {
            console.error('❌ ToDate is missing!');
            throw new Error('ToDate is required');
        }
        
        const payload = {
            EmpRefNo: params.EmpRefNo.toString().trim(),
            TransactionRefNo: params.TransactionRefNo.toString().trim(),
            Roleid: parseInt(params.Roleid),
            Action: params.Action.toString().trim(),
            Note: params.Note?.toString().trim() || '',
            CreatedBy: params.CreatedBy.toString().trim(),
            UserName: params.UserName.toString().trim(),
            Noofleaves: parseInt(params.Noofleaves),
            LeaveTypeId: parseInt(params.LeaveTypeId),
            JoiningCostCenter: params.JoiningCostCenter.toString().trim(),
            FromDate: params.FromDate.toString().trim(),
            ToDate: params.ToDate.toString().trim(),
            Remarks: params.Remarks?.toString().trim() || '',
            SubmitAction: params.SubmitAction?.toString().trim() || 'CheckLeaves'
        };
        
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/ApproveHRLeaveRequest`); // DEBUG
        console.log('📦 Approval Payload:', payload); // DEBUG
        
        const response = await axios.put(
            `${API_BASE_URL}/HR/ApproveHRLeaveRequest`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Approve HR Leave Request Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Approve HR Leave Request API Error:', error.response || error);
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