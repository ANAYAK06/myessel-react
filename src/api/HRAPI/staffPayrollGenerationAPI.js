import axios from "axios";
import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// SALARY & PAYROLL MANAGEMENT APIs
// ==============================================

// 1. Get Salary Employee Cost Centers (GET)
export const getSalaryEmpCC = async (params) => {
    try {
        const { year, month } = params;
        console.log('🏢 Getting Salary Employee Cost Centers:', { year, month });

        if (!year)  throw new Error('Year is required');
        if (!month) throw new Error('Month is required');

        const queryParams = new URLSearchParams({ Year: year, Month: month });
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetSalaryEmpCC?${queryParams}`);

        const response = await axios.get(
            `${API_BASE_URL}/HR/GetSalaryEmpCC?${queryParams}`,
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('✅ Salary Employee Cost Centers Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get Salary Employee Cost Centers API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};

// 2. Get Cost Center Payroll Employees (GET)
export const getCCPayrollEmp = async (params) => {
    try {
        const { year, month, ccCode } = params;
        console.log('👥 Getting Cost Center Payroll Employees:', { year, month, ccCode });

        if (!year)   throw new Error('Year is required');
        if (!month)  throw new Error('Month is required');
        if (!ccCode) throw new Error('Cost Center Code is required');

        const queryParams = new URLSearchParams({ Year: year, Month: month, CCCode: ccCode });
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetCCPayrollEmp?${queryParams}`);

        const response = await axios.get(
            `${API_BASE_URL}/HR/GetCCPayrollEmp?${queryParams}`,
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('✅ Cost Center Payroll Employees Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get Cost Center Payroll Employees API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};

// 3. Check Employee Payroll Requirements (GET)
export const checkEmpPayRollRequirements = async (params) => {
    try {
        const { month, year, roleId, ccCode, empRefNos } = params;
        console.log('✔️ Checking Employee Payroll Requirements:', { month, year, roleId, ccCode, empRefNos });

        if (!month)      throw new Error('Month is required');
        if (!year)       throw new Error('Year is required');
        if (!roleId)     throw new Error('Role ID is required');
        if (!ccCode)     throw new Error('Cost Center Code is required');
        if (!empRefNos)  throw new Error('Employee Reference Numbers are required');

        const queryParams = new URLSearchParams({
            Month: month, Year: year, RoleId: roleId,
            CCCode: ccCode, EmpRefNos: empRefNos
        });
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/CheckEmpPayRollRequirements?${queryParams}`);

        const response = await axios.get(
            `${API_BASE_URL}/HR/CheckEmpPayRollRequirements?${queryParams}`,
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('✅ Check Employee Payroll Requirements Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Check Employee Payroll Requirements API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};

// 4. Get Employee Wise Generated Payroll Data (GET)
export const getEmployeeWiseGeneratedPayRollData = async (params) => {
    try {
        const { month, createdBy, year, roleId, ccCode, empRefNos } = params;
        console.log('📊 Getting Employee Wise Generated Payroll Data:', { month, createdBy, year, roleId, ccCode, empRefNos });

        if (!month)      throw new Error('Month is required');
        if (!createdBy)  throw new Error('Created By is required');
        if (!year)       throw new Error('Year is required');
        if (!roleId)     throw new Error('Role ID is required');
        if (!ccCode)     throw new Error('Cost Center Code is required');
        if (!empRefNos)  throw new Error('Employee Reference Numbers are required');

        const queryParams = new URLSearchParams({
            Month: month, Createdby: createdBy, Year: year,
            RoleID: roleId, CCCode: ccCode, EmpRefNos: empRefNos
        });
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetEmployeeWiseGenaratedPayRollData?${queryParams}`);

        const response = await axios.get(
            `${API_BASE_URL}/HR/GetEmployeeWiseGenaratedPayRollData?${queryParams}`,
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('✅ Employee Wise Generated Payroll Data Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get Employee Wise Generated Payroll Data API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};

// 5. Get Bonus Heads for Employee (GET)
export const getBonusHeadsForEmployee = async (params) => {
    try {
        const { employeeId, type } = params;
        console.log('🎁 Getting Bonus Heads for Employee:', { employeeId, type });

        if (!employeeId) throw new Error('Employee ID is required');
        if (!type)       throw new Error('Type is required');

        const queryParams = new URLSearchParams({ Employeeid: employeeId, Type: type });
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetBonusHeadsForEmployee?${queryParams}`);

        const response = await axios.get(
            `${API_BASE_URL}/HR/GetBonusHeadsForEmployee?${queryParams}`,
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('✅ Bonus Heads for Employee Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get Bonus Heads for Employee API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};

// 6. Save Single Employee Salary (POST) - Calls spInsertSingleEmpSalary
// This is the CORRECT endpoint that the old MVC app uses for individual employee payroll submission
export const saveSingleEmployeeSalary = async (params) => {
    try {
        console.log('💾 Saving Single Employee Salary - raw params:', params);

        // ── Validate required fields ──────────────────────────────────────────
        if (!params.payRollForDate)       throw new Error('PayRoll Date is required');
        if (!params.empRefNo)             throw new Error('Employee Reference Number is required');
        if (!params.transactionRefNo)     throw new Error('Transaction Reference Number is required');
        if (!params.consolidateTransNo)   throw new Error('Consolidate Transaction Number is required');
        if (!params.salaryHeadJsonString) throw new Error('Salary Head JSON data is required');
        if (!params.roleId)               throw new Error('Role ID is required');
        if (!params.createdBy)            throw new Error('Created By is required');

        // ── Format date ──────────────────────────────────────────────────────
        const formattedDate = params.payRollForDate instanceof Date
            ? params.payRollForDate.toISOString().split('T')[0]
            : params.payRollForDate;

        // ── Build payload matching EmpSalaryfinalData model ───────────────────
        // Backend expects these exact field names for spInsertSingleEmpSalary SP:
        //   @TransactionRefNo    → TransactionRefNo    (string)
        //   @EmpRefNo            → EmpRefNo            (string)
        //   @ConslidateTransNo   → ConslidateTransNo   (int)
        //   @Payrolldate         → PayrollDate         (string)
        //   @MainJsonString      → MainJsonString      (string - JSON)
        //   @SalaryHeadJsonString→ SalaryHeadJsonString(string - JSON array)
        //   @PFESIJsonString     → PFESIJsonString     (string - JSON array)
        //   @AdvanceJsonString   → AdvanceJsonString   (string - JSON array)
        //   @Roleid              → Roleid              (int)
        //   @Createdby           → CreatedBy           (string)
        //   @AddStatus (output)
        const payload = {
            ConslidateTransNo: parseInt(params.consolidateTransNo),
            TransactionRefNo: params.transactionRefNo.toString(),
            EmpRefNo: params.empRefNo.toString(),
            PayrollDate: formattedDate,
            MainJsonString: params.mainJsonString || '',
            SalaryHeadJsonString: params.salaryHeadJsonString,
            PFESIJsonString: params.pfesiJsonString || '[]',
            AdvanceJsonString: params.advanceJsonString || '[]',
            Roleid: parseInt(params.roleId),
            CreatedBy: params.createdBy.toString()
        };

        console.log('🔗 API URL:', `${API_BASE_URL}/HR/SaveSingleEmployeeSalary`);
        console.log('📦 Payload:', payload);

        const response = await axios.post(
            `${API_BASE_URL}/HR/SaveSingleEmployeeSalary`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );

        console.log('✅ Save Single Employee Salary Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Save Single Employee Salary API Error:', error.response || error);
        console.error('❌ Error Details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to save Single Employee Salary';
    }
};

// 7. Save Payroll (POST) - BULK SUBMISSION - MATCHES OLD MVC APP
// This is what the old MVC application actually uses!
export const savePayRoll = async (params) => {
    try {
        console.log('💾 Saving Payroll (Bulk) - raw params:', params);

        // ── Validate required fields ──────────────────────────────────────────
        if (!params.payRollForDate)       throw new Error('PayRoll Date is required');
        if (!params.empRefNo)             throw new Error('Employee Reference Number is required');
        if (!params.transactionRefNo)     throw new Error('Transaction Reference Number is required');
        if (!params.consolidateTransNo)   throw new Error('Consolidate Transaction Number is required');
        if (!params.salaryHeadJsonString) throw new Error('Salary Head JSON data is required');
        if (!params.roleId)               throw new Error('Role ID is required');
        if (!params.createdBy)            throw new Error('Created By is required');

        // ── Format date ──────────────────────────────────────────────────────
        const formattedDate = params.payRollForDate instanceof Date
            ? params.payRollForDate.toISOString().split('T')[0]
            : params.payRollForDate;

        // ── Build payload matching old MVC app Form Data structure ────────────
        // The old app sends this as application/x-www-form-urlencoded Form Data:
        //   payRoll[ConslidateTransNo]: 19
        //   payRoll[TransactionRefNo]: 270432691
        //   payRoll[EmpRefNo]: MS00208
        //   payRoll[PayrollDate]: 2025-09-30
        //   payRoll[Roleid]: "142"
        //   payRoll[Createdby]: "52M40005088"
        //   payRoll[MainJsonString]: {...employee data...}
        //   payRoll[SalaryHeadJsonString]: [{...salary head objects...}]
        //   payRoll[PFESIJsonString]: []
        //   payRoll[AdvanceJsonString]: []
        
        // Build the form data exactly like the old MVC app
        const formData = new URLSearchParams();
        formData.append('payRoll[ConslidateTransNo]', params.consolidateTransNo);
        formData.append('payRoll[TransactionRefNo]', params.transactionRefNo);
        formData.append('payRoll[EmpRefNo]', params.empRefNo);
        formData.append('payRoll[PayrollDate]', formattedDate);
        formData.append('payRoll[Roleid]', params.roleId.toString());           // ✅ CRITICAL: SP needs this
        formData.append('payRoll[Createdby]', params.createdBy.toString());      // ✅ CRITICAL: SP needs this
        formData.append('payRoll[MainJsonString]', params.mainJsonString || '');
        formData.append('payRoll[SalaryHeadJsonString]', params.salaryHeadJsonString);
        formData.append('payRoll[PFESIJsonString]', params.pfesiJsonString || '[]');
        formData.append('payRoll[AdvanceJsonString]', params.advanceJsonString || '[]');

        console.log('🔗 API URL:', `${API_BASE_URL}/HR/SavePayRoll`);
        console.log('📦 Form Data Payload:', Object.fromEntries(formData.entries()));

        const response = await axios.post(
            `${API_BASE_URL}/HR/SavePayRoll`,
            formData,
            { 
                headers: { 
                    'Content-Type': 'application/x-www-form-urlencoded'
                } 
            }
        );

        console.log('✅ Save Payroll Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Save Payroll API Error:', error.response || error);
        console.error('❌ Error Details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to save Payroll';
    }
};