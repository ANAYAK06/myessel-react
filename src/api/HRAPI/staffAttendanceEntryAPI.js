import axios from "axios";
import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// STAFF ATTENDANCE ENTRY APIs
// ==============================================

// 1. Get All Employee Cost Centers (GET)
export const getAllEmpCostCenters = async () => {
    try {
        console.log('🔍 Getting All Emp Cost Centers');
        const response = await axios.get(
            `${API_BASE_URL}/HR/GetAllEmpCostCenters`,
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('✅ Get All Emp Cost Centers Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get All Emp Cost Centers API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to get cost centers';
    }
};

// 2. Get CC Holidays (GET)
//    Returns RuleStatus + AllHolidays array for the given cost center
export const getCCHolidays = async (ccCode) => {
    try {
        console.log('🔍 Getting CC Holidays for:', ccCode);
        const response = await axios.get(
            `${API_BASE_URL}/HR/GetCCHolidays`,
            {
                params: { CCCode: ccCode },
                headers: { 'Content-Type': 'application/json' },
            }
        );
        console.log('✅ Get CC Holidays Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get CC Holidays API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to get holidays';
    }
};

// 3. Get CC Minimum Joining Date (GET)
//    Returns minimum allowed attendance date for the cost center
export const getCCMinJoiningDate = async (ccCode) => {
    try {
        console.log('🔍 Getting CC Min Joining Date for:', ccCode);
        const response = await axios.get(
            `${API_BASE_URL}/HR/GetCCMinJoiningDate`,
            {
                params: { CCCode: ccCode },
                headers: { 'Content-Type': 'application/json' },
            }
        );
        console.log('✅ Get CC Min Joining Date Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get CC Min Joining Date API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to get min joining date';
    }
};

// 4. Check Previous Attendance (GET)
//    Checks if previous Saturday/Sunday attendance is already submitted
//    AttDate format: "28-Feb-2026"
export const checkPreviousAttendance = async (ccCode, attDate) => {
    try {
        console.log('🔍 Checking Previous Attendance:', { ccCode, attDate });
        const response = await axios.get(
            `${API_BASE_URL}/HR/CheckPreviousAttendance`,
            {
                params: { CCCode: ccCode, AttDate: attDate },
                headers: { 'Content-Type': 'application/json' },
            }
        );
        console.log('✅ Check Previous Attendance Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Check Previous Attendance API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to check previous attendance';
    }
};

// 5. Get CC Employee Data For Attendance (GET)
//    Returns employee list with their default AttendanceType for the selected date
//    AttDate format: "28-Feb-2026"
export const getCCEmpDataForAttendance = async (ccCode, attDate) => {
    try {
        console.log('🔍 Getting Emp Data For Attendance:', { ccCode, attDate });
        const response = await axios.get(
            `${API_BASE_URL}/HR/GetCCEmpDataForAttendance`,
            {
                params: { CCCode: ccCode, AttDate: attDate },
                headers: { 'Content-Type': 'application/json' },
            }
        );
        console.log('✅ Get CC Emp Data For Attendance Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get CC Emp Data For Attendance API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to get employee attendance data';
    }
};

// 6. Save Staff Attendance (POST)
//
// ── FIELD NAME CONTRACT ───────────────────────────────────────────────────────
// SP flow: spCheckLeavesForAttendance → if Valid → spInsertEmployeeAttendance
// Model fields (C# attendance object):
//   CostCenter, AttendanceDate, EmployeeIds, Attendancetypes,
//   InsertType ("New" = fresh entry), RoleId, Createdby
// Output: @AddStatus = "Submited" on success
// ─────────────────────────────────────────────────────────────────────────────
export const saveStaffAttendance = async (params) => {
    try {
        console.log('💾 Saving Staff Attendance - raw params:', params);

        if (!params.ccCode)          throw new Error('Cost Center is required');
        if (!params.attDate)         throw new Error('Attendance Date is required');
        if (!params.employeeIds)     throw new Error('Employee IDs are required');
        if (!params.attendanceTypes) throw new Error('Attendance Types are required');
        if (!params.createdBy)       throw new Error('Created By is required');

        const payload = {
            CostCenter:      params.ccCode.toString(),
            AttendanceDate:  params.attDate.toString(),
            EmployeeIds:     params.employeeIds.toString(),
            Attendancetypes: params.attendanceTypes.toString(),
            InsertType:      'New',
            RoleId:          parseInt(params.roleId) || 0,
            Createdby:       params.createdBy.toString(),
            Remarks:         params.remarks?.toString() || '',
        };

        console.log('🔗 API URL:', `${API_BASE_URL}/HR/SaveStaffAttendance`);
        console.log('📦 Payload:', payload);

        const response = await axios.post(
            `${API_BASE_URL}/HR/SaveStaffAttendance`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('✅ Save Staff Attendance Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Save Staff Attendance API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to save staff attendance';
    }
};
