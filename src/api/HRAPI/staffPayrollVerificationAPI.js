import axios from "axios";
import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// VERIFICATION PAYROLL APIs
// ==============================================

// 1. Get CC Verification Payroll List (GET)
export const getVerificationCCPayroll = async (params) => {
    try {
        const { roleId } = params;
        console.log('📋 Getting Verification CC Payroll List:', { roleId });

        if (!roleId) throw new Error('Role ID is required');

        const queryParams = new URLSearchParams({ RoleID: roleId });
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetVerificationCCPayroll?${queryParams}`);

        const response = await axios.get(
            `${API_BASE_URL}/HR/GetVerificationCCPayroll?${queryParams}`,
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('✅ Verification CC Payroll List Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get Verification CC Payroll List API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};

// 2. Get Verification CC Payroll Details by RefNo (POST)
export const getVerificationCCPayrollByRefNo = async (params) => {
    try {
        const {
            transactionRefno,
            conslidateTransNo,
            refno,
            ccCodes,
            payRoleDate,
            month,
            year,
            roleId
        } = params;
        console.log('🔍 Getting Verification CC Payroll by RefNo:', params);

        if (!transactionRefno)   throw new Error('Transaction Ref No is required');
        if (!conslidateTransNo)  throw new Error('Consolidate Trans No is required');
        if (!refno)              throw new Error('Ref No is required');
        if (!ccCodes)            throw new Error('CC Codes are required');
        if (!payRoleDate)        throw new Error('Payroll Date is required');
        if (!month)              throw new Error('Month is required');
        if (!year)               throw new Error('Year is required');
        if (!roleId)             throw new Error('Role ID is required');

        const payload = {
            TransactionRefno: parseInt(transactionRefno),
            ConslidateTransNo: parseInt(conslidateTransNo),
            Refno: refno.toString(),
            CCCodes: ccCodes.toString(),
            PayRoleDate: payRoleDate,
            Month: parseInt(month),
            Year: parseInt(year),
            Roleid: parseInt(roleId)
        };

        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GETVerificationCCPayRollbyRefno`);
        console.log('📦 Payload:', payload);

        const response = await axios.post(
            `${API_BASE_URL}/HR/GETVerificationCCPayRollbyRefno`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('✅ Verification CC Payroll by RefNo Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get Verification CC Payroll by RefNo API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};

// 3. Approve / Verify Payroll - MULTI (Bulk) (PUT)
// PUT api/HR/ApprovePayRollMulti
// Actions: "Verify" | "Approve"
// ✅ FIX: Changed from URLSearchParams/form-encoded to simple JSON payload
export const approvePayRollMulti = async (params) => {
    try {
        const {
            action,
            payRoleDate,
            transactionRefno,
            conslidateTransNo,
            refno,
            note,
            salaryIds,
            empRefNos,
            ccCode
        } = params;
        console.log('✅ Approve Payroll Multi - raw params:', params);

        if (!action)             throw new Error('Action is required (Verify or Approve)');
        if (!payRoleDate)        throw new Error('Payroll Date is required');
        if (!transactionRefno)   throw new Error('Transaction Ref No is required');
        if (!conslidateTransNo)  throw new Error('Consolidate Trans No is required');
        if (!refno)              throw new Error('Ref No is required');
        if (!salaryIds)          throw new Error('Salary IDs are required');
        if (!empRefNos)          throw new Error('Employee Ref Nos are required');
        if (!ccCode)             throw new Error('CC Code is required');

        // ✅ Simple JSON payload — matches what backend stored procedure expects
        const payload = {
            TransactionRefno: parseInt(transactionRefno),
            PayRoleDate: payRoleDate,
            Action: action,
            Note: note || '',
            ConslidateTransNo: parseInt(conslidateTransNo),
            Refno: parseInt(refno),
            Emprefnos: empRefNos,      // with trailing pipe e.g. "SM00049|"
            SalaryIds: salaryIds,      // with trailing pipe e.g. "6438|"
            CCCode: ccCode.toString()
        };

        console.log('🔗 API URL:', `${API_BASE_URL}/HR/ApprovePayRollMulti`);
        console.log('📦 JSON Payload:', payload);

        const response = await axios.put(
            `${API_BASE_URL}/HR/ApprovePayRollMulti`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('✅ Approve Payroll Multi Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Approve Payroll Multi API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};

// 4. Approve / Verify / Reject Payroll - SINGLE (PUT)
// PUT api/HR/ApprovePayRollSingle
// Actions: "Verify" | "Reject" | "Approve"
export const approvePayRollSingle = async (params) => {
    try {
        const {
            action,
            transactionRefno,
            roleId,
            payRoleDate,
            createdBy,
            conslidateTransNo,
            refno,
            note,
            salaryId,
            empRefNo,
            ccCode
        } = params;
        console.log('✅ Approve Payroll Single - raw params:', params);

        if (!action)             throw new Error('Action is required (Verify, Reject, or Approve)');
        if (!transactionRefno)   throw new Error('Transaction Ref No is required');
        if (!roleId)             throw new Error('Role ID is required');
        if (!payRoleDate)        throw new Error('Payroll Date is required');
        if (!createdBy)          throw new Error('Created By is required');
        if (!conslidateTransNo)  throw new Error('Consolidate Trans No is required');
        if (!refno)              throw new Error('Ref No is required');
        if (!salaryId)           throw new Error('Salary ID is required');
        if (!empRefNo)           throw new Error('Employee Ref No is required');
        if (!ccCode)             throw new Error('CC Code is required');

        const payload = {
            Action: action,
            TransactionRefno: transactionRefno.toString(),
            Roleid: parseInt(roleId),
            PayRoleDate: payRoleDate,
            CreatedBy: createdBy.toString(),
            ConslidateTransNo: parseInt(conslidateTransNo),
            Refno: parseInt(refno),
            Note: note || '',
            SalaryId: parseInt(salaryId),
            EmpRefNo: empRefNo.toString(),
            CCCode: ccCode.toString()
        };

        console.log('🔗 API URL:', `${API_BASE_URL}/HR/ApprovePayRollSingle`);
        console.log('📦 Payload:', payload);

        const response = await axios.put(
            `${API_BASE_URL}/HR/ApprovePayRollSingle`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('✅ Approve Payroll Single Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Approve Payroll Single API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};