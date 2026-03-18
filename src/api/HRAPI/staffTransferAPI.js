import axios from "axios";
import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// EMPLOYEE TRANSFER APIs
// ==============================================

// 1. Get Employee Extender (GET) - Search employees by prefix
export const getEmployeeExtender = async (prefix) => {
    try {
        console.log('🔍 Getting Employee Extender');
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetEmployeeExtender`);
        console.log('📦 Params:', { Prefix: prefix });

        const response = await axios.get(
            `${API_BASE_URL}/HR/GetEmployeeExtender`,
            {
                params: { Prefix: prefix },
                headers: { 'Content-Type': 'application/json' },
            }
        );
        console.log('✅ Get Employee Extender Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get Employee Extender API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to get employee extender';
    }
};

// 2. Get Employee CC Code (GET) - Get cost center code for an employee
export const getEmployeeCCCode = async (empId) => {
    try {
        console.log('🏗️ Getting Employee CC Code');
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetEmployeeCCCode`);
        console.log('📦 Params:', { Empid: empId });

        const response = await axios.get(
            `${API_BASE_URL}/HR/GetEmployeeCCCode`,
            {
                params: { Empid: empId },
                headers: { 'Content-Type': 'application/json' },
            }
        );
        console.log('✅ Get Employee CC Code Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get Employee CC Code API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to get employee CC code';
    }
};

// 3. Get All Employee Cost Centers (GET) - Get all CCs filtered by cc
export const getAllEmpCC = async (cc) => {
    try {
        console.log('🏢 Getting All Employee Cost Centers');
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetAllEmpCC`);
        console.log('📦 Params:', { cc });

        const response = await axios.get(
            `${API_BASE_URL}/HR/GetAllEmpCC`,
            {
                params: { cc },
                headers: { 'Content-Type': 'application/json' },
            }
        );
        console.log('✅ Get All Employee CC Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get All Employee CC API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to get all employee cost centers';
    }
};

// 4. Save Employee Transfer Details (POST) - Calls spSaveEmployeeTransferDetails
export const saveEmployeeTransferDetails = async (params) => {
    try {
        console.log('💾 Saving Employee Transfer Details - raw params:', params);

        if (!params.employeeId)    throw new Error('Employee ID is required');
        if (!params.fromCC)        throw new Error('Relieving Cost Center is required');
        if (!params.toCC)          throw new Error('Joining Cost Center is required');
        if (!params.relievingDate) throw new Error('Relieving Date is required');
        if (!params.joiningDate)   throw new Error('Joining Date is required');
        if (!params.createdBy)     throw new Error('Created By is required');
        if (!params.roleId)        throw new Error('Role ID is required');

        const payload = {
            EmployeeId:   params.employeeId?.toString()    || '',
            FromCC:       params.fromCC?.toString()        || '',
            ToCC:         params.toCC?.toString()          || '',
            RelievingDate: params.relievingDate?.toString() || '',
            JoiningDate:  params.joiningDate?.toString()   || '',
            Remarks:      params.remarks?.toString()       || '',
            Createdby:    params.createdBy?.toString()     || '',
            RoleID:       parseInt(params.roleId),
        };

        console.log('🔗 API URL:', `${API_BASE_URL}/HR/SaveEmployeeTransferDetails`);
        console.log('📦 Payload:', payload);

        const response = await axios.post(
            `${API_BASE_URL}/HR/SaveEmployeeTransferDetails`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('✅ Save Employee Transfer Details Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Save Employee Transfer Details API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to save employee transfer details';
    }
};

// 5. Get Verify Employee Transfer Grid (GET) - Inbox list by role
export const getVerifyEmployeeTransferGrid = async (roleId) => {
    try {
        console.log('📋 Getting Verify Employee Transfer Grid');
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/VerifyEmployeeTransferGrid`);
        console.log('📦 Params:', { Roleid: roleId });

        const response = await axios.get(
            `${API_BASE_URL}/HR/VerifyEmployeeTransferGrid`,
            {
                params: { Roleid: roleId },
                headers: { 'Content-Type': 'application/json' },
            }
        );
        console.log('✅ Get Verify Employee Transfer Grid Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get Verify Employee Transfer Grid API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to get verify employee transfer grid';
    }
};

// 6. Get Verify Employee Transfer View (GET) - Detail view of a single transfer record
export const getVerifyEmployeeTransferView = async (lvId) => {
    try {
        console.log('🔎 Getting Verify Employee Transfer View');
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/VerifyEmployeeTransferView`);
        console.log('📦 Params:', { Lvid: lvId });

        const response = await axios.get(
            `${API_BASE_URL}/HR/VerifyEmployeeTransferView`,
            {
                params: { Lvid: lvId },
                headers: { 'Content-Type': 'application/json' },
            }
        );
        console.log('✅ Get Verify Employee Transfer View Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get Verify Employee Transfer View API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to get verify employee transfer view';
    }
};

// 7. Approve Employee Transfer (PUT) - Calls spApproveEmployeeTransfer
//
// ── FIELD NAME CONTRACT ───────────────────────────────────────────────────────
// The component (VerifyEmployeeTransfer.jsx) calls this function via the Redux
// thunk with the following payload shape (built in buildApprovalPayload):
//
//   { lid, EmployeeId, FromCC, ToCC, RelievingDate, JoiningDate,
//     Roleid, CreatedBy, Action, Note, Remarks }
//
// The SP (spApproveEmployeeTransfer) expects:
//   lid, Status, ReturnNotes, Createdby, RoleID
//
// This function is the translation layer between those two shapes.
// NEVER add validation for keys that are not in the incoming params shape.
// ─────────────────────────────────────────────────────────────────────────────
export const approveEmployeeTransfer = async (params) => {
    try {
        console.log('✅ Approving Employee Transfer - raw params:', params);

        // ── Validate using the ACTUAL keys the component sends ────────────────
        if (!params.lid)       throw new Error('Record ID (lid) is required');
        if (!params.Action)    throw new Error('Action is required (Approve / Verify / Reject)');
        if (!params.CreatedBy) throw new Error('CreatedBy is required');
        if (!params.Roleid)    throw new Error('Roleid is required');

        // ── Map component field names → SP field names ────────────────────────
        //   params.Action    → Status       (SP param name)
        //   params.Note      → ReturnNotes  (SP param name)
        //   params.CreatedBy → Createdby    (SP param name, lowercase 'b')
        //   params.Roleid    → RoleID       (SP param name)
        const payload = {
            lid:         params.lid?.toString()      || '',
            Status:      params.Action?.toString()   || '',   // "Approve" | "Verify" | "Reject"
            ReturnNotes: params.Note?.toString()     || '',
            Createdby:   params.CreatedBy?.toString() || '',
            RoleID:      params.Roleid?.toString()   || '',
        };

        console.log('🔗 API URL:', `${API_BASE_URL}/HR/ApproveEmployeeTransfer`);
        console.log('📦 Payload:', payload);

        const response = await axios.put(
            `${API_BASE_URL}/HR/ApproveEmployeeTransfer`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('✅ Approve Employee Transfer Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Approve Employee Transfer API Error:', error.response || error);
        console.error('❌ Error Details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
        });
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to approve employee transfer';
    }
};

// 8. Get Employee Extender Report (GET) - Report search by prefix
export const getEmployeeExtenderReport = async (prefix) => {
    try {
        console.log('📊 Getting Employee Extender Report');
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetEmployeeExtenderReport`);
        console.log('📦 Params:', { Prefix: prefix });

        const response = await axios.get(
            `${API_BASE_URL}/HR/GetEmployeeExtenderReport`,
            {
                params: { Prefix: prefix },
                headers: { 'Content-Type': 'application/json' },
            }
        );
        console.log('✅ Get Employee Extender Report Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get Employee Extender Report API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to get employee extender report';
    }
};

// 9. Get Verify Employee Transfer Report View (GET) - Report detail view
export const getVerifyEmployeeTransferReportView = async (lvId) => {
    try {
        console.log('📄 Getting Verify Employee Transfer Report View');
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/VerifyEmployeeTransferReportView`);
        console.log('📦 Params:', { Lvid: lvId });

        const response = await axios.get(
            `${API_BASE_URL}/HR/VerifyEmployeeTransferReportView`,
            {
                params: { Lvid: lvId },
                headers: { 'Content-Type': 'application/json' },
            }
        );
        console.log('✅ Get Verify Employee Transfer Report View Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get Verify Employee Transfer Report View API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to get verify employee transfer report view';
    }
};