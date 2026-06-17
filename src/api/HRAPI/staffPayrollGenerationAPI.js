import axios from "axios";
import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// SALARY & PAYROLL MANAGEMENT APIs
// ==============================================

// 1. Get Salary Employee Cost Centers (GET)
export const getSalaryEmpCC = async (params) => {
    try {
        const { year, month } = params;

        if (!year)  throw new Error('Year is required');
        if (!month) throw new Error('Month is required');

        const queryParams = new URLSearchParams({ Year: year, Month: month });

        const response = await axios.get(
            `${API_BASE_URL}/HR/GetSalaryEmpCC?${queryParams}`,
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};

// 2. Get Cost Center Payroll Employees (GET)
export const getCCPayrollEmp = async (params) => {
    try {
        const { year, month, ccCode } = params;

        if (!year)   throw new Error('Year is required');
        if (!month)  throw new Error('Month is required');
        if (!ccCode) throw new Error('Cost Center Code is required');

        const queryParams = new URLSearchParams({ Year: year, Month: month, CCCode: ccCode });

        const response = await axios.get(
            `${API_BASE_URL}/HR/GetCCPayrollEmp?${queryParams}`,
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};

// 3. Check Employee Payroll Requirements (GET)
export const checkEmpPayRollRequirements = async (params) => {
    try {
        const { month, year, roleId, ccCode, empRefNos } = params;

        if (!month)      throw new Error('Month is required');
        if (!year)       throw new Error('Year is required');
        if (!roleId)     throw new Error('Role ID is required');
        if (!ccCode)     throw new Error('Cost Center Code is required');
        if (!empRefNos)  throw new Error('Employee Reference Numbers are required');

        const queryParams = new URLSearchParams({
            Month: month, Year: year, RoleId: roleId,
            CCCode: ccCode, EmpRefNos: empRefNos
        });

        const response = await axios.get(
            `${API_BASE_URL}/HR/CheckEmpPayRollRequirements?${queryParams}`,
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};

// 4. Get Employee Wise Generated Payroll Data (GET)
export const getEmployeeWiseGeneratedPayRollData = async (params) => {
    try {
        const { month, createdBy, year, roleId, ccCode, empRefNos } = params;

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

        const response = await axios.get(
            `${API_BASE_URL}/HR/GetEmployeeWiseGenaratedPayRollData?${queryParams}`,
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};

// 5. Get Bonus Heads for Employee (GET)
export const getBonusHeadsForEmployee = async (params) => {
    try {
        const { employeeId, type } = params;

        if (!employeeId) throw new Error('Employee ID is required');
        if (!type)       throw new Error('Type is required');

        const queryParams = new URLSearchParams({ Employeeid: employeeId, Type: type });

        const response = await axios.get(
            `${API_BASE_URL}/HR/GetBonusHeadsForEmployee?${queryParams}`,
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};

// 6. Save Single Employee Salary (POST) - Calls spInsertSingleEmpSalary
export const saveSingleEmployeeSalary = async (params) => {
    try {
        if (!params.payRollForDate)       throw new Error('PayRoll Date is required');
        if (!params.empRefNo)             throw new Error('Employee Reference Number is required');
        if (!params.transactionRefNo)     throw new Error('Transaction Reference Number is required');
        if (!params.consolidateTransNo)   throw new Error('Consolidate Transaction Number is required');
        if (!params.salaryHeadJsonString) throw new Error('Salary Head JSON data is required');
        if (!params.roleId)               throw new Error('Role ID is required');
        if (!params.createdBy)            throw new Error('Created By is required');

        const formattedDate = params.payRollForDate instanceof Date
            ? params.payRollForDate.toISOString().split('T')[0]
            : params.payRollForDate;

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

        const response = await axios.post(
            `${API_BASE_URL}/HR/SaveSingleEmployeeSalary`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );

        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to save Single Employee Salary';
    }
};

// 7. Save Payroll (POST) - BULK SUBMISSION
export const savePayRoll = async (params) => {
    try {
        if (!params.payRollForDate)       throw new Error('PayRoll Date is required');
        if (!params.empRefNo)             throw new Error('Employee Reference Number is required');
        if (!params.transactionRefNo)     throw new Error('Transaction Reference Number is required');
        if (!params.consolidateTransNo)   throw new Error('Consolidate Transaction Number is required');
        if (!params.salaryHeadJsonString) throw new Error('Salary Head JSON data is required');
        if (!params.roleId)               throw new Error('Role ID is required');
        if (!params.createdBy)            throw new Error('Created By is required');

        const formattedDate = params.payRollForDate instanceof Date
            ? params.payRollForDate.toISOString().split('T')[0]
            : params.payRollForDate;

        const formData = new URLSearchParams();
        formData.append('payRoll[ConslidateTransNo]', params.consolidateTransNo);
        formData.append('payRoll[TransactionRefNo]', params.transactionRefNo);
        formData.append('payRoll[EmpRefNo]', params.empRefNo);
        formData.append('payRoll[PayrollDate]', formattedDate);
        formData.append('payRoll[Roleid]', params.roleId.toString());
        formData.append('payRoll[Createdby]', params.createdBy.toString());
        formData.append('payRoll[MainJsonString]', params.mainJsonString || '');
        formData.append('payRoll[SalaryHeadJsonString]', params.salaryHeadJsonString);
        formData.append('payRoll[PFESIJsonString]', params.pfesiJsonString || '[]');
        formData.append('payRoll[AdvanceJsonString]', params.advanceJsonString || '[]');

        const response = await axios.post(
            `${API_BASE_URL}/HR/SavePayRoll`,
            formData,
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to save Payroll';
    }
};
