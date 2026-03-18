import axios from "axios";
import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// SALARY DEDUCTION & ARREAR MANAGEMENT APIs
// ==============================================

// 1. Get Salary Deduction Employees (GET) - Search by prefix
export const getSalaryDeductionEmp = async (params) => {
    try {
        const { prefix } = params;
        console.log('🔍 Getting Salary Deduction Employees:', { prefix });

        if (!prefix) throw new Error('Prefix is required');

        const queryParams = new URLSearchParams({ Prefix: prefix });
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetSalaryDeductionEmp?${queryParams}`);

        const response = await axios.get(
            `${API_BASE_URL}/HR/GetSalaryDeductionEmp?${queryParams}`,
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('✅ Salary Deduction Employees Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get Salary Deduction Employees API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};

// 2. Get Salary Pending Years for Employee (GET)
export const getSalaryPendingYear = async (params) => {
    try {
        const { empRefNo } = params;
        console.log('📅 Getting Salary Pending Years:', { empRefNo });

        if (!empRefNo) throw new Error('Employee Reference Number is required');

        const queryParams = new URLSearchParams({ Emprefno: empRefNo });
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/SalaryPendingYear?${queryParams}`);

        const response = await axios.get(
            `${API_BASE_URL}/HR/SalaryPendingYear?${queryParams}`,
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('✅ Salary Pending Years Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get Salary Pending Years API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};

// 3. Bind Salary Deduction Months (GET)
export const bindSalaryDeductionMonths = async (params) => {
    try {
        const { year, empRefNo } = params;
        console.log('🗓️ Binding Salary Deduction Months:', { year, empRefNo });

        if (!year)     throw new Error('Year is required');
        if (!empRefNo) throw new Error('Employee Reference Number is required');

        const queryParams = new URLSearchParams({ Year: year, Emprefno: empRefNo });
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/BindSalaryDeductionMonths?${queryParams}`);

        const response = await axios.get(
            `${API_BASE_URL}/HR/BindSalaryDeductionMonths?${queryParams}`,
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('✅ Bind Salary Deduction Months Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Bind Salary Deduction Months API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};

// 4. Get Employee Deductions For Month (GET)
export const getEmpDeductionsForMonth = async (params) => {
    try {
        const { year, empRefNo, month } = params;
        console.log('💸 Getting Employee Deductions For Month:', { year, empRefNo, month });

        if (!year)     throw new Error('Year is required');
        if (!empRefNo) throw new Error('Employee Reference Number is required');
        if (!month)    throw new Error('Month is required');

        const queryParams = new URLSearchParams({ Year: year, Emprefno: empRefNo, Month: month });
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GETEmpDeductionsForMonth?${queryParams}`);

        const response = await axios.get(
            `${API_BASE_URL}/HR/GETEmpDeductionsForMonth?${queryParams}`,
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('✅ Employee Deductions For Month Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get Employee Deductions For Month API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};

// 5. Save Single Employee Salary Deduction (POST) - Calls spInsertSingleEmpSalaryDeduction
export const saveSingleEmpSalaryDeduction = async (params) => {
    try {
        console.log('💾 Saving Single Employee Salary Deduction - raw params:', params);

        // ── Validate required fields ──────────────────────────────────────────
        if (!params.empRefNo)         throw new Error('Employee Reference Number is required');
        if (!params.month)            throw new Error('Month is required');
        if (!params.year)             throw new Error('Year is required');
        if (!params.deductionHeads)   throw new Error('Deduction Heads are required');
        if (!params.deductionAmounts) throw new Error('Deduction Amounts are required');
        if (!params.ccCode)           throw new Error('Cost Center Code is required');
        if (!params.roleId)           throw new Error('Role ID is required');
        if (!params.createdBy)        throw new Error('Created By is required');

        // ── Build payload matching spInsertSingleEmpSalaryDeduction SP ────────
        // SP Parameters:
        //   @Emprefno        → EmpRefno        (string)
        //   @Month           → Month           (int)
        //   @Year            → Year            (int)
        //   @DeductionHeads  → DeductionHeads  (string)
        //   @DeductionAmounts→ DeductionAmounts(string)
        //   @CCCode          → CCCode          (string)
        //   @Roleid          → RoleId          (int)
        //   @Createdby       → CreatedBy       (string)
        //   @AddStatus (output)
        const payload = {
            EmpRefno: params.empRefNo.toString(),
            Month: parseInt(params.month),
            Year: parseInt(params.year),
            DeductionHeads: params.deductionHeads,
            DeductionAmounts: params.deductionAmounts,
            CCCode: params.ccCode.toString(),
            RoleId: parseInt(params.roleId),
            CreatedBy: params.createdBy.toString()
        };

        console.log('🔗 API URL:', `${API_BASE_URL}/HR/SaveSingleEmpSalaryDeduction`);
        console.log('📦 Payload:', payload);

        const response = await axios.post(
            `${API_BASE_URL}/HR/SaveSingleEmpSalaryDeduction`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );

        console.log('✅ Save Single Employee Salary Deduction Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Save Single Employee Salary Deduction API Error:', error.response || error);
        console.error('❌ Error Details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to save Single Employee Salary Deduction';
    }
};

// 6. Update Single Employee Salary Deduction (PUT) - Calls UpdateSingleEmpSalaryDeduction
export const updateSingleSalaryDeduction = async (params) => {
    try {
        console.log('✏️ Updating Single Employee Salary Deduction - raw params:', params);

        // ── Validate required fields ──────────────────────────────────────────
        if (!params.empRefNo)              throw new Error('Employee Reference Number is required');
        if (!params.empTransactionRefNo)   throw new Error('Employee Transaction Reference Number is required');
        if (!params.deductionHeads)        throw new Error('Deduction Heads are required');
        if (!params.deductionAmounts)      throw new Error('Deduction Amounts are required');
        if (!params.ccCode)                throw new Error('Cost Center Code is required');
        if (!params.roleId)                throw new Error('Role ID is required');
        if (!params.createdBy)             throw new Error('Created By is required');

        // ── Build payload matching UpdateSingleEmpSalaryDeduction SP ─────────
        // SP Parameters:
        //   @Emprefno              → EmpRefno              (string)
        //   @EmpTransactionRefNo   → EmpTransactionRefNo   (int)
        //   @DeductionHeads        → DeductionHeads        (string)
        //   @DeductionAmounts      → DeductionAmounts      (string)
        //   @CCCode                → CCCode                (string)
        //   @Roleid                → RoleId                (int)
        //   @Createdby             → CreatedBy             (string)
        //   @AddStatus (output)
        const payload = {
            EmpRefno: params.empRefNo.toString(),
            EmpTransactionRefNo: parseInt(params.empTransactionRefNo),
            DeductionHeads: params.deductionHeads,
            DeductionAmounts: params.deductionAmounts,
            CCCode: params.ccCode.toString(),
            RoleId: parseInt(params.roleId),
            CreatedBy: params.createdBy.toString()
        };

        console.log('🔗 API URL:', `${API_BASE_URL}/HR/UpdateSingleSalaryDeduction`);
        console.log('📦 Payload:', payload);

        const response = await axios.put(
            `${API_BASE_URL}/HR/UpdateSingleSalaryDeduction`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );

        console.log('✅ Update Single Employee Salary Deduction Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Update Single Employee Salary Deduction API Error:', error.response || error);
        console.error('❌ Error Details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to update Single Employee Salary Deduction';
    }
};

// 7. Save Salary Deductions Bulk (PUT) - Calls spInsertEmpSalaryDeduction
export const saveSalaryDeductions = async (params) => {
    try {
        console.log('💾 Saving Salary Deductions (Bulk) - raw params:', params);

        // ── Validate required fields ──────────────────────────────────────────
        if (!params.ids)        throw new Error('Ids are required');
        if (!params.empRefNos)  throw new Error('Employee Reference Numbers are required');
        if (!params.empTransNos)throw new Error('Employee Transaction Numbers are required');
        if (!params.months)     throw new Error('Months are required');
        if (!params.years)      throw new Error('Years are required');
        if (!params.payDates)   throw new Error('Pay Dates are required');
        if (!params.ccCodes)    throw new Error('Cost Center Codes are required');
        if (!params.roleId)     throw new Error('Role ID is required');
        if (!params.createdBy)  throw new Error('Created By is required');

        // ── Build payload matching spInsertEmpSalaryDeduction SP ──────────────
        // SP Parameters:
        //   @Ids           → Ids           (string - comma-delimited with trailing comma)
        //   @EmpRefnos     → EmpRefnos     (string - comma-delimited with trailing comma)
        //   @EmpTransNos   → EmpTransNos   (string - comma-delimited with trailing comma)
        //   @Months        → Months        (string - comma-delimited with trailing comma)
        //   @Years         → Years         (string - comma-delimited with trailing comma)
        //   @PayRollDates  → PayDates      (string - comma-delimited, format "MM/DD/YYYY 12:00:00 AM,")
        //   @CostCenters   → CCCodes       (string - comma-delimited with trailing comma)
        //   @Roleid        → RoleId        (int)
        //   @Createdby     → CreatedBy     (string)
        //   @AddStatus  (output)
        //   @ErrorStatus (output)
        // NOTE: old app uses comma-separated values (not pipe), matching Image 1 payload format
        const payload = {
            Ids: params.ids.toString(),
            EmpRefnos: params.empRefNos.toString(),
            EmpTransNos: params.empTransNos.toString(),
            Months: params.months.toString(),
            Years: params.years.toString(),
            PayDates: params.payDates.toString(),
            CCCodes: params.ccCodes.toString(),
            RoleId: parseInt(params.roleId),
            CreatedBy: params.createdBy.toString()
        };

        console.log('🔗 API URL:', `${API_BASE_URL}/HR/SaveSalaryDeductions`);
        console.log('📦 Payload:', payload);

        const response = await axios.put(
            `${API_BASE_URL}/HR/SaveSalaryDeductions`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );

        console.log('✅ Save Salary Deductions (Bulk) Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Save Salary Deductions (Bulk) API Error:', error.response || error);
        console.error('❌ Error Details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to save Salary Deductions';
    }
};

// 8. Get Pending Salary Deductions (GET) - Fetches single-emp saved records for bulk submission table
export const getPendingSalaryDeductions = async () => {
    try {
        console.log('📋 Getting Pending Salary Deductions');
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetPendingSalaryDeductions`);

        const response = await axios.get(
            `${API_BASE_URL}/HR/GetPendingSalaryDeductions`,
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('✅ Pending Salary Deductions Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get Pending Salary Deductions API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};

// 9. Get Salary Deductions by EmpTransactionRefNo (GET)
export const getSalaryDeductionsByEmpTransNo = async (params) => {
    try {
        const { empTransactionRefNo, empRefNo } = params;
        console.log('📋 Getting Salary Deductions by EmpTransactionRefNo:', { empTransactionRefNo, empRefNo });

        if (!empTransactionRefNo) throw new Error('Employee Transaction Reference Number is required');
        if (!empRefNo)            throw new Error('Employee Reference Number is required');

        const queryParams = new URLSearchParams({
            EmpTransactionRefNo: empTransactionRefNo,
            EmpRefNo: empRefNo,
        });
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetSalaryDeductionsbyEmpTransNo?${queryParams}`);

        const response = await axios.get(
            `${API_BASE_URL}/HR/GetSalaryDeductionsbyEmpTransNo?${queryParams}`,
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('✅ Salary Deductions by EmpTransactionRefNo Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get Salary Deductions by EmpTransactionRefNo API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};


// ==============================================
// ARREAR MANAGEMENT APIs
// ==============================================

// 10. Get Arrear Heads (GET)
export const getArearHeads = async () => {
    try {
        console.log('📋 Getting Arrear Heads');
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetArearHeads`);

        const response = await axios.get(
            `${API_BASE_URL}/HR/GetArearHeads`,
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('✅ Arrear Heads Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get Arrear Heads API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};

// 11. Get Arrears Cost Centers for Employee (GET)
export const getArearsCC = async (params) => {
    try {
        const { empRefNo } = params;
        console.log('🏢 Getting Arrears Cost Centers:', { empRefNo });

        if (!empRefNo) throw new Error('Employee Reference Number is required');

        const queryParams = new URLSearchParams({ Emprefno: empRefNo });
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetArearsCC?${queryParams}`);

        const response = await axios.get(
            `${API_BASE_URL}/HR/GetArearsCC?${queryParams}`,
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('✅ Arrears Cost Centers Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get Arrears Cost Centers API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};


// 12. Get Pending Salary Arrears (GET)
export const getPendingSalaryArear = async () => {
    try {
        console.log('📋 Getting Pending Salary Arrears');
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetPendingSalaryArear`);

        const response = await axios.get(
            `${API_BASE_URL}/HR/GetPendingSalaryArear`,
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('✅ Pending Salary Arrears Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get Pending Salary Arrears API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};

// 13. Update Single Employee Arrear (PUT) - Calls spUpdateArear
export const updateArear = async (params) => {
    try {
        console.log('✏️ Updating Arrear - raw params:', params);

        // ── Validate required fields ──────────────────────────────────────────
        if (!params.empRefNo)              throw new Error('Employee Reference Number is required');
        if (!params.empTransactionRefNo)   throw new Error('Employee Transaction Reference Number is required');
        if (!params.totalAmount)           throw new Error('Total Amount is required');
        if (!params.ccJsonString)          throw new Error('CC JSON String is required');
        if (!params.roleId)                throw new Error('Role ID is required');
        if (!params.createdBy)             throw new Error('Created By is required');

        // ── Build payload matching spUpdateArear SP ───────────────────────────
        // SP Parameters:
        //   @Emprefno              → EmpRefno              (string)
        //   @EmpTransactionRefNo   → EmpTransactionRefNo   (int)
        //   @TotalAmount           → TotalAmount           (string)
        //   @CCJsonstring          → CCJsonstring          (string)
        //   @Roleid                → RoleId                (int)
        //   @Createdby             → CreatedBy             (string)
        //   @AddStatus (output)
        // Note: @ArearAmount and @BudgetCC are commented out in the SP — omitted here.
        const payload = {
            EmpRefno:            params.empRefNo.toString(),
            EmpTransactionRefNo: parseInt(params.empTransactionRefNo),
            TotalAmount:         params.totalAmount.toString(),
            CCJsonstring:        params.ccJsonString,
            RoleId:              parseInt(params.roleId),
            CreatedBy:           params.createdBy.toString(),
        };

        console.log('🔗 API URL:', `${API_BASE_URL}/HR/UpdateArear`);
        console.log('📦 Payload:', payload);

        const response = await axios.put(
            `${API_BASE_URL}/HR/UpdateArear`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('✅ Update Arrear Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Update Arrear API Error:', error.response || error);
        console.error('❌ Error Details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to update Arrear';
    }
};

// 14. Save Salary Arrears Bulk (PUT) - Calls spInsertEmpSalaryArear
export const saveSalaryArears = async (params) => {
    try {
        console.log('💾 Saving Salary Arrears (Bulk) - raw params:', params);

        // ── Validate required fields ──────────────────────────────────────────
        if (!params.ids)         throw new Error('Ids are required');
        if (!params.empRefNos)   throw new Error('Employee Reference Numbers are required');
        if (!params.empTransNos) throw new Error('Employee Transaction Numbers are required');
        if (!params.months)      throw new Error('Months are required');
        if (!params.years)       throw new Error('Years are required');
        if (!params.payDates)    throw new Error('Pay Dates are required');
        if (!params.ccCodes)     throw new Error('Cost Center Codes are required');
        if (!params.roleId)      throw new Error('Role ID is required');
        if (!params.createdBy)   throw new Error('Created By is required');

        // ── Build payload matching spInsertEmpSalaryArear SP ─────────────────
        // SP Parameters (identical structure to spInsertEmpSalaryDeduction):
        //   @Ids           → Ids           (string - comma-delimited with trailing comma)
        //   @EmpRefnos     → EmpRefnos     (string - comma-delimited with trailing comma)
        //   @EmpTransNos   → EmpTransNos   (string - comma-delimited with trailing comma)
        //   @Months        → Months        (string - comma-delimited with trailing comma)
        //   @Years         → Years         (string - comma-delimited with trailing comma)
        //   @PayRollDates  → PayDates      (string - comma-delimited, format "MM/DD/YYYY 12:00:00 AM,")
        //   @CostCenters   → CCCodes       (string - comma-delimited with trailing comma)
        //   @Roleid        → RoleId        (int)
        //   @Createdby     → CreatedBy     (string)
        //   @AddStatus  (output)
        //   @ErrorStatus (output)
        const payload = {
            Ids:        params.ids.toString(),
            EmpRefnos:  params.empRefNos.toString(),
            EmpTransNos:params.empTransNos.toString(),
            Months:     params.months.toString(),
            Years:      params.years.toString(),
            PayDates:   params.payDates.toString(),
            CCCodes:    params.ccCodes.toString(),
            RoleId:     parseInt(params.roleId),
            CreatedBy:  params.createdBy.toString(),
        };

        console.log('🔗 API URL:', `${API_BASE_URL}/HR/SaveSalaryArears`);
        console.log('📦 Payload:', payload);

        const response = await axios.put(
            `${API_BASE_URL}/HR/SaveSalaryArears`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('✅ Save Salary Arrears (Bulk) Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Save Salary Arrears (Bulk) API Error:', error.response || error);
        console.error('❌ Error Details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to save Salary Arrears';
    }
};

// 15. Save Arrear (POST) - Calls spInsertArearHead
export const saveArear = async (params) => {
    try {
        console.log('💾 Saving Arrear - raw params:', params);

        // ── Validate required fields ──────────────────────────────────────────
        if (!params.empRefNo)      throw new Error('Employee Reference Number is required');
        if (!params.month)         throw new Error('Month is required');
        if (!params.year)          throw new Error('Year is required');
        if (!params.salaryHead)    throw new Error('Salary Head (HeadName) is required');
        if (!params.totalAmount)   throw new Error('Total Amount (HeadAmount) is required');
        if (!params.ccCode)        throw new Error('Cost Center Code is required');
        if (!params.roleId)        throw new Error('Role ID is required');
        if (!params.createdBy)     throw new Error('Created By is required');
        if (!params.ccJsonString)  throw new Error('CC JSON String is required');

        // ── Build payload matching spInsertArearHead SP ───────────────────────
        // SP Parameters:
        //   @Emprefno      → EmpRefno      (string)
        //   @Month         → Month         (int)
        //   @Year          → Year          (int)
        //   @HeadName      → SalaryHead    (string)
        //   @HeadAmount    → TotalAmount   (string)
        //   @CCCode        → CCCode        (string)
        //   @Roleid        → RoleId        (int)
        //   @Createdby     → CreatedBy     (string)
        //   @CCJsonstring  → CCJsonstring  (string)
        //   @AddStatus (output)
        const payload = {
            EmpRefno: params.empRefNo.toString(),
            Month: parseInt(params.month),
            Year: parseInt(params.year),
            SalaryHead: params.salaryHead.toString(),
            TotalAmount: params.totalAmount.toString(),
            CCCode: params.ccCode.toString(),
            RoleId: parseInt(params.roleId),
            CreatedBy: params.createdBy.toString(),
            CCJsonstring: params.ccJsonString
        };

        console.log('🔗 API URL:', `${API_BASE_URL}/HR/SaveArear`);
        console.log('📦 Payload:', payload);

        const response = await axios.post(
            `${API_BASE_URL}/HR/SaveArear`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );

        console.log('✅ Save Arrear Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Save Arrear API Error:', error.response || error);
        console.error('❌ Error Details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to save Arrear';
    }
};