import axios from "axios";
import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// VERIFICATION SALARY DEDUCTIONS APIs
// ==============================================

// 1. Get Verify Salary Deductions List (GET)
export const getVerifySalaryDeductions = async (params) => {
    try {
        const { roleId } = params;
        console.log('📋 Getting Verify Salary Deductions List:', { roleId });

        if (!roleId) throw new Error('Role ID is required');

        const queryParams = new URLSearchParams({ RoleId: roleId });
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetVerifySalaryDeductions?${queryParams}`);

        const response = await axios.get(
            `${API_BASE_URL}/HR/GetVerifySalaryDeductions?${queryParams}`,
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('✅ Verify Salary Deductions List Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get Verify Salary Deductions List API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};

// 2. Get Month Deduction For Verify (GET)
export const getMonthDeductionForVerify = async (params) => {
    try {
        const { empTransactionRefNo, empRefNo } = params;
        console.log('🔍 Getting Month Deduction For Verify:', { empTransactionRefNo, empRefNo });

        if (!empTransactionRefNo) throw new Error('Employee Transaction Ref No is required');
        if (!empRefNo) throw new Error('Employee Ref No is required');

        const queryParams = new URLSearchParams({
            EmpTransactionRefNo: empTransactionRefNo,
            EmpRefNo: empRefNo
        });
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GETMonthDeductionForVerify?${queryParams}`);

        const response = await axios.get(
            `${API_BASE_URL}/HR/GETMonthDeductionForVerify?${queryParams}`,
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('✅ Month Deduction For Verify Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get Month Deduction For Verify API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};

// 3. Approve Single Salary Deduction (PUT)
// PUT api/HR/ApproveSingleSalaryDeduction
// Actions: "Verify" | "Approve" | "Reject"
export const approveSingleSalaryDeduction = async (params) => {
    try {
        const {
            empRefno,
            empTransactionRefNo,
            deductionHeads,
            deductionAmounts,
            deductionHeadIds,
            ccCode,
            roleId,
            createdBy,
            action,
            note,
            transactionRefno
        } = params;
        console.log('✅ Approve Single Salary Deduction - raw params:', params);

        if (!empRefno)             throw new Error('Employee Ref No is required');
        if (!empTransactionRefNo)  throw new Error('Employee Transaction Ref No is required');
        if (!deductionHeads)       throw new Error('Deduction Heads are required');
        if (!deductionAmounts)     throw new Error('Deduction Amounts are required');
        if (!deductionHeadIds)     throw new Error('Deduction Head IDs are required');
        if (!ccCode)               throw new Error('CC Code is required');
        if (!roleId)               throw new Error('Role ID is required');
        if (!createdBy)            throw new Error('Created By is required');
        if (!action)               throw new Error('Action is required (Verify, Approve, or Reject)');
        if (!transactionRefno)     throw new Error('Transaction Ref No is required');

        const payload = {
            EmpRefno: empRefno.toString(),
            EmpTransactionRefNo: empTransactionRefNo.toString(),
            DeductionHeads: deductionHeads,        // pipe-delimited e.g. "Head1|Head2|"
            DeductionAmounts: deductionAmounts,    // pipe-delimited e.g. "500|300|"
            DeductionHeadIds: deductionHeadIds,    // pipe-delimited e.g. "1|2|"
            CCCode: ccCode.toString(),
            RoleId: parseInt(roleId),
            CreatedBy: createdBy.toString(),
            Action: action,
            Note: note || '',
            TransactionRefno: transactionRefno.toString()
        };

        console.log('🔗 API URL:', `${API_BASE_URL}/HR/ApproveSingleSalaryDeduction`);
        console.log('📦 Payload:', payload);

        const response = await axios.put(
            `${API_BASE_URL}/HR/ApproveSingleSalaryDeduction`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('✅ Approve Single Salary Deduction Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Approve Single Salary Deduction API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};

// ==============================================
// VERIFICATION SALARY AREAR APIs
// ==============================================

// 4. Get Verify Salary Arear List (GET)
export const getVerifySalaryArear = async (params) => {
    try {
        const { roleId } = params;
        console.log('📋 Getting Verify Salary Arear List:', { roleId });

        if (!roleId) throw new Error('Role ID is required');

        const queryParams = new URLSearchParams({ Roleid: roleId });
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetVerifySalaryArear?${queryParams}`);

        const response = await axios.get(
            `${API_BASE_URL}/HR/GetVerifySalaryArear?${queryParams}`,
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('✅ Verify Salary Arear List Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get Verify Salary Arear List API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};

// 5. Get Arear CC Amount (GET)
export const getArearCCAmount = async (params) => {
    try {
        const { empRefno, empTransno, head } = params;
        console.log('🔍 Getting Arear CC Amount:', { empRefno, empTransno, head });

        if (!empRefno)   throw new Error('Employee Ref No is required');
        if (!empTransno) throw new Error('Employee Trans No is required');
        if (!head)       throw new Error('Head is required');

        const queryParams = new URLSearchParams({
            Emprefno: empRefno,
            EmpTransno: empTransno,
            Head: head
        });
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetArearCCAmount?${queryParams}`);

        const response = await axios.get(
            `${API_BASE_URL}/HR/GetArearCCAmount?${queryParams}`,
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('✅ Arear CC Amount Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get Arear CC Amount API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};

// 6. Approve Salary Arear (PUT)
// PUT api/HR/ApproveSalaryArear
// Actions: "Verify" | "Approve" | "Reject"
export const approveSalaryArear = async (params) => {
    try {
        const {
            empRefno,
            empTransactionRefNo,
            totalAmount,
            ccJsonstring,
            ccCode,
            roleId,
            createdBy,
            action,
            note,
            transactionRefno,
            id
        } = params;
        console.log('✅ Approve Salary Arear - raw params:', params);

        if (!empRefno)            throw new Error('Employee Ref No is required');
        if (!empTransactionRefNo) throw new Error('Employee Transaction Ref No is required');
        if (!totalAmount)         throw new Error('Total Amount is required');
        if (!ccJsonstring)        throw new Error('CC JSON string is required');
        if (!ccCode)              throw new Error('CC Code is required');
        if (!roleId)              throw new Error('Role ID is required');
        if (!createdBy)           throw new Error('Created By is required');
        if (!action)              throw new Error('Action is required (Verify, Approve, or Reject)');
        if (!transactionRefno)    throw new Error('Transaction Ref No is required');
        if (!id)                  throw new Error('ID is required');

        const payload = {
            EmpRefno: empRefno.toString(),
            EmpTransactionRefNo: empTransactionRefNo.toString(),
            TotalAmount: totalAmount.toString(),
            CCJsonstring: ccJsonstring,     // JSON string of CC allocation details
            CCCode: ccCode.toString(),
            RoleId: parseInt(roleId),
            CreatedBy: createdBy.toString(),
            Action: action,
            Note: note || '',
            TransactionRefno: transactionRefno.toString(),
            Id: id.toString()
        };

        console.log('🔗 API URL:', `${API_BASE_URL}/HR/ApproveSalaryArear`);
        console.log('📦 Payload:', payload);

        const response = await axios.put(
            `${API_BASE_URL}/HR/ApproveSalaryArear`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('✅ Approve Salary Arear Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Approve Salary Arear API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};