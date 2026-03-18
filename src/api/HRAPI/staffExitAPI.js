import axios from "axios";
import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// EMPLOYEE EXIT APIs
// ==============================================

// 1. Get Employees For Exit (GET) - Search employees by prefix (autocomplete)
export const getEmployeesForExit = async (prefix) => {
    try {
        console.log('🔍 Getting Employees For Exit');
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetEmployeesForExit`);
        console.log('📦 Params:', { Prefix: prefix });

        const response = await axios.get(
            `${API_BASE_URL}/HR/GetEmployeesForExit`,
            {
                params: { Prefix: prefix },
                headers: { 'Content-Type': 'application/json' },
            }
        );
        console.log('✅ Get Employees For Exit Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get Employees For Exit API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to get employees for exit';
    }
};

// 2. Get Employee For Exit (GET) - Get employee details by EmpRefNo
export const getEmployeeForExit = async (empRefNo) => {
    try {
        console.log('👤 Getting Employee For Exit');
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetEmployeeForExit`);
        console.log('📦 Params:', { EmpRefno: empRefNo });

        const response = await axios.get(
            `${API_BASE_URL}/HR/GetEmployeeForExit`,
            {
                params: { EmpRefno: empRefNo },
                headers: { 'Content-Type': 'application/json' },
            }
        );
        console.log('✅ Get Employee For Exit Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get Employee For Exit API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to get employee for exit';
    }
};

// 3. Save Employee Exit (POST) - Calls spInsertEmpExit
//
// ── FIELD NAME CONTRACT ───────────────────────────────────────────────────────
// SP params: @CCCode, @EmpRefNo, @GroupId, @ResignationDate, @RelievingDate,
//            @Remarks, @DocBaseString (binary), @DocBase, @DocType,
//            @Createdby, @RoleId
// Returns "@AddStatus" = "Submited" on success
// ─────────────────────────────────────────────────────────────────────────────
export const saveEmpExit = async (params) => {
    try {
        console.log('💾 Saving Employee Exit - raw params:', params);

        if (!params.costCenter)       throw new Error('Cost Center is required');
        if (!params.empRefNo)         throw new Error('Employee Ref No is required');
        if (!params.groupId)          throw new Error('Group ID is required');
        if (!params.resignationDate)  throw new Error('Resignation Date is required');
        if (!params.relievingDate)    throw new Error('Relieving Date is required');
        if (!params.createdBy)        throw new Error('Created By is required');
        if (!params.roleId)           throw new Error('Role ID is required');

        const payload = {
            CostCenter:      params.costCenter?.toString()      || '',
            EmpRefNo:        params.empRefNo?.toString()        || '',
            GroupId:         parseInt(params.groupId),
            ResignationDate: params.resignationDate?.toString() || '',
            RelievingDate:   params.relievingDate?.toString()   || '',
            Remarks:         params.remarks?.toString()         || '',
            DocBaseString:   params.docBaseString?.toString()   || '',
            DocType:         params.docType?.toString()         || '',
            Createdby:       params.createdBy?.toString()       || '',
            RoleId:          parseInt(params.roleId),
        };

        console.log('🔗 API URL:', `${API_BASE_URL}/HR/SaveEmpExit`);
        console.log('📦 Payload:', payload);

        const response = await axios.post(
            `${API_BASE_URL}/HR/SaveEmpExit`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('✅ Save Employee Exit Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Save Employee Exit API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to save employee exit';
    }
};

// 4. Get Verify Employee Exit Grid (GET) - Inbox list by role
export const getVerifyEmpExit = async (roleId) => {
    try {
        console.log('📋 Getting Verify Employee Exit Grid');
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetVerifyEmpExit`);
        console.log('📦 Params:', { RoleID: roleId });

        const response = await axios.get(
            `${API_BASE_URL}/HR/GetVerifyEmpExit`,
            {
                params: { RoleID: roleId },
                headers: { 'Content-Type': 'application/json' },
            }
        );
        console.log('✅ Get Verify Employee Exit Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get Verify Employee Exit API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to get verify employee exit grid';
    }
};

// 5. Get Employee Exit By ID (GET) - Detail view for a single exit record
export const getEmpExitById = async (params) => {
    try {
        console.log('🔎 Getting Employee Exit By ID');
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetEmpExitbyId`);
        console.log('📦 Params:', { Emprefno: params.empRefNo, Id: params.id, RoleId: params.roleId });

        const response = await axios.get(
            `${API_BASE_URL}/HR/GetEmpExitbyId`,
            {
                params: {
                    Emprefno: params.empRefNo,
                    Id:       params.id,
                    RoleId:   params.roleId,
                },
                headers: { 'Content-Type': 'application/json' },
            }
        );
        console.log('✅ Get Employee Exit By ID Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get Employee Exit By ID API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to get employee exit by id';
    }
};

// 6. Approve Employee Exit (PUT) - Calls spApproveEmpExit
//
// ── FIELD NAME CONTRACT ───────────────────────────────────────────────────────
// SP params: @Id, @CCCode, @Emprefno, @GroupId, @ResignationDate,
//            @RelievingDate, @Roleid, @Createdby, @Action, @Note
// ─────────────────────────────────────────────────────────────────────────────
export const approveEmpExit = async (params) => {
    try {
        console.log('✅ Approving Employee Exit - raw params:', params);

        if (!params.id)        throw new Error('Record ID is required');
        if (!params.Action)    throw new Error('Action is required (Approve / Verify / Reject)');
        if (!params.CreatedBy) throw new Error('CreatedBy is required');
        if (!params.RoleId)    throw new Error('RoleId is required');

        const payload = {
            Id:              parseInt(params.id),
            CostCenter:      params.costCenter?.toString()      || '',
            EmpRefNo:        params.empRefNo?.toString()        || '',
            GroupId:         parseInt(params.groupId)           || 0,
            ResignationDate: params.resignationDate?.toString() || '',
            RelievingDate:   params.relievingDate?.toString()   || '',
            RoleId:          parseInt(params.RoleId),
            Createdby:       params.CreatedBy?.toString()       || '',
            Action:          params.Action?.toString()          || '',
            Note:            params.Note?.toString()            || '',
        };

        console.log('🔗 API URL:', `${API_BASE_URL}/HR/ApproveEmpExit`);
        console.log('📦 Payload:', payload);

        const response = await axios.put(
            `${API_BASE_URL}/HR/ApproveEmpExit`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('✅ Approve Employee Exit Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Approve Employee Exit API Error:', error.response || error);
        console.error('❌ Error Details:', {
            message:  error.message,
            response: error.response?.data,
            status:   error.response?.status,
        });
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to approve employee exit';
    }
};
