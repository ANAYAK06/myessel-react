import axios from "axios";
import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// EXCEL ATTENDANCE VERIFICATION RELATED APIs
// ==============================================

// 1. Get Verify Excel Attendance Inbox (GET)
export const getVerifyExcelAttendance = async (params) => {
    try {
        const { roleId } = params;
        console.log('📊 Getting Excel Attendance Verification Inbox for RoleID:', roleId); // DEBUG
        
        // Validate required parameters
        if (!roleId) {
            console.error('❌ RoleID is missing!');
            throw new Error('RoleID is required');
        }
        
        const queryParams = new URLSearchParams({
            RoleID: roleId.toString().trim()
        });
        
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetVerifyExcelAttendance?${queryParams.toString()}`); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/HR/GetVerifyExcelAttendance?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Excel Attendance Verification Inbox Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Excel Attendance Verification Inbox API Error:', error.response || error);
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

// 2. Get Excel Attendance Details (POST)
export const getExcelAttendance = async (payload) => {
    try {
        console.log('📋 Getting Excel Attendance Details with payload:', payload); // DEBUG
        
        // Validate required parameters
        if (!payload.AttendanceId) {
            console.error('❌ AttendanceId is missing!');
            throw new Error('AttendanceId is required');
        }
        if (!payload.RoleId) {
            console.error('❌ RoleId is missing!');
            throw new Error('RoleId is required');
        }
        
        // Build the complete payload
        const requestPayload = {
            CostCenter: payload.CostCenter || '',
            GenerateFor: payload.GenerateFor || 'Month',
            AttendanceDate: payload.AttendanceDate || '',
            MonthName: payload.MonthName || '',
            Year: payload.Year || '',
            ExcelRefno: payload.ExcelRefno || '',
            AttendanceId: payload.AttendanceId?.toString() || '',
            TransactionNo: payload.TransactionNo || '',
            CCName: payload.CCName || '',
            LabourType: payload.LabourType || '',
            ContractorCode: payload.ContractorCode || '',
            ContractorName: payload.ContractorName || '',
            RoleId: payload.RoleId?.toString() || '' // Add RoleId to payload if needed
        };
        
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetExcelAttendance`); // DEBUG
        console.log('📦 Request Payload:', requestPayload); // DEBUG
        
        const response = await axios.post(
            `${API_BASE_URL}/HR/GetExcelAttendance`,
            requestPayload,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Excel Attendance Details Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Excel Attendance Details API Error:', error.response || error);
        console.error('❌ Error Details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            payload: payload
        });
        
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 3. Approve Excel Month Attendance (PUT)
export const approveExcelMonthAttendance = async (params) => {
    try {
        console.log('✅ Approving Excel Month Attendance for:', params); // DEBUG
        
        // Validate required parameters
        if (!params.AttendanceJson) {
            console.error('❌ AttendanceJson is missing!');
            throw new Error('AttendanceJson is required');
        }
        if (!params.CostCenter) {
            console.error('❌ CostCenter is missing!');
            throw new Error('CostCenter is required');
        }
        if (!params.GenerateFor) {
            console.error('❌ GenerateFor is missing!');
            throw new Error('GenerateFor is required');
        }
        if (!params.RoleId) {
            console.error('❌ RoleId is missing!');
            throw new Error('RoleId is required');
        }
        if (!params.Createdby) {
            console.error('❌ Createdby is missing!');
            throw new Error('Createdby is required');
        }
        if (!params.Remarks) {
            console.error('❌ Remarks is missing!');
            throw new Error('Remarks is required');
        }
        if (!params.ExcelRefno) {
            console.error('❌ ExcelRefno is missing!');
            throw new Error('ExcelRefno is required');
        }
        if (!params.LabourType) {
            console.error('❌ LabourType is missing!');
            throw new Error('LabourType is required');
        }
        // ContractorCode is NOT mandatory - only required if LabourType is not "Own Labour"
        
        const payload = {
            AttendanceJson: params.AttendanceJson, 
            CostCenter: params.CostCenter.toString().trim(), 
            GenerateFor: params.GenerateFor.toString().trim(), 
            RoleId: parseInt(params.RoleId), // 
            Createdby: params.Createdby.toString().trim(), 
            Remarks: params.Remarks.toString().trim(), 
            ExcelRefno: params.ExcelRefno.toString().trim(),
            LabourType: params.LabourType.toString().trim(), 
            ContractorCode: params.ContractorCode?.toString().trim() || ''
        };
        
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/ApproveExcelMonthAttendance`); // DEBUG
        console.log('📦 Approval Payload:', payload); // DEBUG
        console.log(`📝 Labour Type: ${payload.LabourType}, Contractor Code: "${payload.ContractorCode}"`); // DEBUG
        
        const response = await axios.put(
            `${API_BASE_URL}/HR/ApproveExcelMonthAttendance`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Approve Excel Month Attendance Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Approve Excel Month Attendance API Error:', error.response || error);
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