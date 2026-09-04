import axios from "axios";
import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// EMPLOYEE FULL & FINAL SALARY APIs
// ==============================================

// 1. Get Employees For Final Salary (GET) - Returns all employees eligible for full & final
//    No search params — returns a fixed list of employees pending full & final settlement
export const getEmpForFinalSalary = async () => {
    try {
        console.log('🔍 Getting Employees For Final Salary');
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetEmpForFinalSalary`);

        const response = await axios.get(
            `${API_BASE_URL}/HR/GetEmpForFinalSalary`,
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('✅ Get Employees For Final Salary Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get Employees For Final Salary API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to get employees for final salary';
    }
};

// 2. Generate Final Salary (POST) - Runs spCheckForFinalSalary + spGenerateFinalSalary
//
// ── FLOW ──────────────────────────────────────────────────────────────────────
// 1. spCheckForFinalSalary (@EmpRefNo) → "Valid" | error
// 2. spGenerateFinalSalary (@EmpRefNo, @Createdby) → GenerateStatus = "Generated" | "InValid"
//    If "Generated", returns: FinalSalary + EmpMonthlyDATA + FinalSalaryHeads[]
//                             + PayRollAdvance[] + OptionalSalHeads[]
// Returns: GenerateStatus = "Generated" on success
// ─────────────────────────────────────────────────────────────────────────────
export const generateFinalSalary = async (params) => {
    try {
        console.log('⚙️ Generating Final Salary - raw params:', params);

        if (!params.empRefNo)   throw new Error('Employee Ref No is required');
        if (!params.createdBy)  throw new Error('Created By is required');

        const payload = {
            EmpRefNo:  params.empRefNo?.toString()  || '',
            Createdby: params.createdBy?.toString() || '',
        };

        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GenerateFinalSalary`);
        console.log('📦 Payload:', payload);

        const response = await axios.post(
            `${API_BASE_URL}/HR/GenerateFinalSalary`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('✅ Generate Final Salary Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Generate Final Salary API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to generate final salary';
    }
};

// 3. Save Final Salary (POST) - Final submission after user reviews generated values
//
// ── FIELD NAME CONTRACT ───────────────────────────────────────────────────────
// spUpdateFinalSalary locates the draft rows by @TransactionRefno + @EmpRefno
// (Status IS NULL) and re-applies the head amounts, then spSaveFinalSalary runs
// the budget check and finalises. The whole payload below is required — omitting
// TransactionRefNo makes the SP guard fail with "Error$Some thing Went Wrong",
// and an empty Salaryheads string makes it skip the update and return blank.
//
// SP params: @TransactionRefno, @CCCode, @EmpRefno, @MonthGross, @MonthDeduction,
//   @MonthNet, @FinalNet, @FinalGross, @FinalDeduction, @RecoverAmt,
//   @PayRollFortheDate, @Salaryheads, @Headtypes, @HeadAmounts, @ApplicablePLs,
//   @ApplicableESIs, @Createdby, @PaymentAmount  (+ @Roleid for spSaveFinalSalary)
// Returns SaveStatus = "Submited$" on success.
// ─────────────────────────────────────────────────────────────────────────────
export const saveFinalSalary = async (params) => {
    try {
        console.log('💾 Saving Final Salary - raw params:', params);

        if (!params.empRefNo)          throw new Error('Employee Ref No is required');
        if (!params.createdBy)         throw new Error('Created By is required');
        if (!params.transactionRefNo)  throw new Error('Transaction Ref No is required — generate the settlement first');

        const num = (v) => {
            const n = parseFloat(v);
            return isNaN(n) ? 0 : n;
        };

        const payload = {
            EmpRefNo:          params.empRefNo?.toString()          || '',
            Createdby:         params.createdBy?.toString()         || '',
            TransactionRefNo:  params.transactionRefNo?.toString()  || '',
            CCCode:            params.ccCode?.toString()            || '',
            RoleId:            parseInt(params.roleId, 10) || 0,
            PayRollFortheDate: params.payRollFortheDate?.toString() || '',

            MonthGross:        num(params.monthGross),
            MonthDeduction:    num(params.monthDeduction),
            MonthNet:          num(params.monthNet),

            FinalGross:        num(params.finalGross),
            FinalDeduction:    num(params.finalDeduction),
            FinalNet:          num(params.finalNet),
            RecoverAmt:        num(params.recoverAmt),
            PaymentAmount:     num(params.paymentAmount),

            Salaryheads:       params.salaryheads    || '',
            Headtypes:         params.headtypes      || '',
            HeadAmounts:       params.headAmounts    || '',
            ApplicablePLs:     params.applicablePLs  || '',
            ApplicableESIs:    params.applicableESIs || '',
        };

        console.log('🔗 API URL:', `${API_BASE_URL}/HR/SaveFinalSalary`);
        console.log('📦 Payload:', payload);

        const response = await axios.post(
            `${API_BASE_URL}/HR/SaveFinalSalary`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('✅ Save Final Salary Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Save Final Salary API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to save final salary';
    }
};

// 4. Get Verify Final Salary Grid (GET) - Inbox list by role
export const getVerifyFinalSalary = async (roleId) => {
    try {
        console.log('📋 Getting Verify Final Salary Grid');
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetVerifyFinalSalary`);
        console.log('📦 Params:', { Roleid: roleId });

        const response = await axios.get(
            `${API_BASE_URL}/HR/GetVerifyFinalSalary`,
            {
                params: { Roleid: roleId },
                headers: { 'Content-Type': 'application/json' },
            }
        );
        console.log('✅ Get Verify Final Salary Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get Verify Final Salary API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to get verify final salary grid';
    }
};

// 5. Get Final Salary By ID (GET) - Detail view for a single final salary record
export const getFinalSalaryById = async (params) => {
    try {
        console.log('🔎 Getting Final Salary By ID');
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetFinalSalarybyId`);
        console.log('📦 Params:', { TransNo: params.transNo, Id: params.id, EmpRefNo: params.empRefNo });

        const response = await axios.get(
            `${API_BASE_URL}/HR/GetFinalSalarybyId`,
            {
                params: {
                    TransNo:  params.transNo,
                    Id:       params.id,
                    EmpRefNo: params.empRefNo,
                },
                headers: { 'Content-Type': 'application/json' },
            }
        );
        console.log('✅ Get Final Salary By ID Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get Final Salary By ID API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to get final salary by id';
    }
};

// 6. Approve / Verify / Reject Final Salary (PUT)
//
// ── FIELD NAME CONTRACT ───────────────────────────────────────────────────────
// Action = "Verify"  → spVerifyFinalSalary  → @VerifyStatus  = "Submited"
// Action = "Reject"  → spRejectFinalSalary  → @RejectStatus  = "Submited"
// Action = "Approve" → spApproveFinalSalary → output param   = "Submited"
// SP params: @TransactionRefNo, @Id, @EmpRefno, @CCCode, @GroupId,
//            @Note, @Roleid, @Createdby, @Action
// ─────────────────────────────────────────────────────────────────────────────
export const approveFinalSalary = async (params) => {
    try {
        console.log('✅ Approving Final Salary - raw params:', params);

        if (!params.id)                throw new Error('Record ID is required');
        if (!params.Action)            throw new Error('Action is required (Approve / Verify / Reject)');
        if (!params.Createdby)         throw new Error('Createdby is required');
        if (!params.RoleId)            throw new Error('RoleId is required');

        const payload = {
            TransactionRefNo: params.transactionRefNo?.toString() || '',
            Id:               parseInt(params.id),
            EmpRefNo:         params.empRefNo?.toString()         || '',
            CCCode:           params.ccCode?.toString()           || '',
            GroupId:          parseInt(params.groupId)            || 0,
            Note:             params.Note?.toString()             || '',
            RoleId:           parseInt(params.RoleId),
            Createdby:        params.Createdby?.toString()        || '',
            Action:           params.Action?.toString()           || '',
        };

        console.log('🔗 API URL:', `${API_BASE_URL}/HR/ApproveFinalSalary`);
        console.log('📦 Payload:', payload);

        const response = await axios.put(
            `${API_BASE_URL}/HR/ApproveFinalSalary`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('✅ Approve Final Salary Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Approve Final Salary API Error:', error.response || error);
        console.error('❌ Error Details:', {
            message:  error.message,
            response: error.response?.data,
            status:   error.response?.status,
        });
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to approve final salary';
    }
};
