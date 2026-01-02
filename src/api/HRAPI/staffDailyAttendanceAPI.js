import axios from "axios";
import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// DAILY STAFF ATTENDANCE VERIFICATION RELATED APIs
// ==============================================

// 1. Get Verification Attendance Inbox (GET)
export const getVerificationAttendance = async (params) => {
    try {
        const { roleId } = params;
        console.log('📊 Getting Verification Attendance Inbox for RoleID:', roleId); // DEBUG
        
        // Validate required parameters
        if (!roleId) {
            console.error('❌ RoleID is missing!');
            throw new Error('RoleID is required');
        }
        
        const queryParams = new URLSearchParams({
            Roleid: roleId.toString().trim()
        });
        
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetVerificationAttendance?${queryParams.toString()}`); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/HR/GetVerificationAttendance?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Verification Attendance Inbox Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Verification Attendance Inbox API Error:', error.response || error);
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

// 2. Get Attendance by Transaction Number (GET)
export const getAttendanceByTransactionNo = async (params) => {
    try {
        const { transNo } = params;
        console.log('📋 Getting Attendance Details for TransNo:', transNo); // DEBUG
        
        // Validate required parameters
        if (!transNo) {
            console.error('❌ TransNo is missing!');
            throw new Error('TransNo is required');
        }
        
        const queryParams = new URLSearchParams({
            TransNo: transNo.toString().trim()
        });
        
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetAttendancebyTransactionNo?${queryParams.toString()}`); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/HR/GetAttendancebyTransactionNo?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Attendance Details Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Attendance Details API Error:', error.response || error);
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

// 3. Approve Staff Attendance (PUT)
// 3. Approve Staff Attendance (PUT)
export const approveStaffAttendance = async (params) => {
    try {
        console.log('✅ Approving Staff Attendance for:', params); // DEBUG
        
        // Validate required parameters
        if (!params.TransactionNo) {
            console.error('❌ TransactionNo is missing!');
            throw new Error('TransactionNo is required');
        }
        if (!params.CostCenter) {
            console.error('❌ CostCenter is missing!');
            throw new Error('CostCenter is required');
        }
        if (!params.AttendanceDate) {
            console.error('❌ AttendanceDate is missing!');
            throw new Error('AttendanceDate is required');
        }
        if (!params.EmployeeIds) {
            console.error('❌ EmployeeIds is missing!');
            throw new Error('EmployeeIds is required');
        }
        if (!params.Attendancetypes) {
            console.error('❌ Attendancetypes is missing!');
            throw new Error('Attendancetypes is required');
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
            TransactionNo: params.TransactionNo.toString().trim(),
            CostCenter: params.CostCenter.toString().trim(),
            AttendanceDate: params.AttendanceDate.toString().trim(),
            EmployeeIds: params.EmployeeIds.toString().trim(),
            Attendancetypes: params.Attendancetypes.toString().trim(),
            RoleId: parseInt(params.RoleId),
            Createdby: params.Createdby.toString().trim(),
            Action: params.Action.toString().trim(),
            ApprovalNote: params.ApprovalNote?.toString().trim() || ''
        };
        
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/ApproveStaffAttendance`); // DEBUG
        console.log('📦 Approval Payload:', payload); // DEBUG
        
        const response = await axios.put(
            `${API_BASE_URL}/HR/ApproveStaffAttendance`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Approve Staff Attendance Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Approve Staff Attendance API Error:', error.response || error);
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