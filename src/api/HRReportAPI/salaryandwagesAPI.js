import axios from "axios";
import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// PAYROLL REPORT RELATED APIs
// (Staff and Labour Payroll/Salary Reports)
// ==============================================

// 1. Get All Employee Categories
export const getAllEmpCategories = async () => {
    try {
        console.log('📋 Getting All Employee Categories'); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/HR/GetAllEmpCategories`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Employee Categories Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Employee Categories API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 2. Get PayRoll Cost Centres by Category
export const getPayRollCCbyCategory = async (categoryId) => {
    try {
        console.log('🏢 Getting PayRoll CC by Category:', categoryId); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/HR/GetPayRollCCbyCategory?CategoryId=${categoryId || 0}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ PayRoll CC by Category Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ PayRoll CC by Category API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 3. Get PayRoll Groups
export const getPayRollGroups = async (params) => {
    try {
        const { category, ccCode, labourType, contractor, empType } = params;
        console.log('👥 Getting PayRoll Groups for:', params); // DEBUG
        
        const queryParams = new URLSearchParams({
            Category: category || '',
            CCCode: ccCode || '',
            LabourType: labourType || '',
            Contractor: contractor || '',
            EmpType: empType || ''
        });
        
        const response = await axios.get(
            `${API_BASE_URL}/HR/GetPayRollGroups?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ PayRoll Groups Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ PayRoll Groups API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 4. Get PayRoll Employees
export const getPayRollEmployees = async (params) => {
    try {
        const { category, ccCode, groupId, labourType, contractor, empType } = params;
        console.log('👤 Getting PayRoll Employees for:', params); // DEBUG
        
        const queryParams = new URLSearchParams({
            Category: category || '',
            CCCode: ccCode || '',
            GroupId: groupId || '',
            LabourType: labourType || '',
            Contractor: contractor || '',
            EmpType: empType || ''
        });
        
        const response = await axios.get(
            `${API_BASE_URL}/HR/GetPayRollEmployees?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ PayRoll Employees Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ PayRoll Employees API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 5. Get Salary Contractors
export const getSalaryContractors = async () => {
    try {
        console.log('🏗️ Getting Salary Contractors'); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/HR/GetSalaryContractors`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Salary Contractors Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Salary Contractors API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 6. Get Employee Salary Months
export const getEmployeeSalaryMonths = async (reportData) => {
    try {
        console.log('📅 Getting Employee Salary Months with params:', reportData); // DEBUG
        
        const payload = {
            EmpCategory: reportData.EmpCategory || 
                        reportData.empCategory || 
                        "",
            CCCode: reportData.CCCode || 
                   reportData.ccCode || 
                   "",
            GroupId: reportData.GroupId || 
                    reportData.groupId || 
                    "",
            EmpRefNo: reportData.EmpRefNo || 
                     reportData.empRefNo || 
                     "",
            Year: reportData.Year || 
                 reportData.year || 
                 "",
            FromMonth: reportData.FromMonth || 
                      reportData.fromMonth || 
                      "",
            LabourType: reportData.LabourType || 
                       reportData.labourType || 
                       "",
            ContractorCode: reportData.ContractorCode || 
                          reportData.contractorCode || 
                          "",
            EmployeeType: reportData.EmployeeType || 
                         reportData.employeeType || 
                         ""
        };
        
        console.log('📤 Sending Employee Salary Months Payload:', payload); // DEBUG
        
        const response = await axios.post(
            `${API_BASE_URL}/HR/GetEmployeeSalaryMonths`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Employee Salary Months Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Employee Salary Months API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 7. Get Employee Salary Years by Month
export const getEmpSalaryYearsByMonth = async (reportData) => {
    try {
        console.log('📅 Getting Employee Salary Years by Month with params:', reportData); // DEBUG
        
        const payload = {
            EmpCategory: reportData.EmpCategory || 
                        reportData.empCategory || 
                        "",
            CCCode: reportData.CCCode || 
                   reportData.ccCode || 
                   "",
            GroupId: reportData.GroupId || 
                    reportData.groupId || 
                    "",
            EmpRefNo: reportData.EmpRefNo || 
                     reportData.empRefNo || 
                     "",
            Month: reportData.Month || 
                  reportData.month || 
                  "",
            LabourType: reportData.LabourType || 
                       reportData.labourType || 
                       "",
            ContractorCode: reportData.ContractorCode || 
                          reportData.contractorCode || 
                          "NA",
            EmployeeType: reportData.EmployeeType || 
                         reportData.employeeType || 
                         ""
        };
        
        console.log('📤 Sending Employee Salary Years by Month Payload:', payload); // DEBUG
        
        const response = await axios.post(
            `${API_BASE_URL}/HR/GetEmpSalaryYearsByMonth`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Employee Salary Years by Month Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Employee Salary Years by Month API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 8. Get Labour Cost Centre for Salary Report
export const getLabourCCForSalaryReport = async (params) => {
    try {
        const { labourType, contractor } = params;
        console.log('🏢 Getting Labour CC for Salary Report:', params); // DEBUG
        
        const queryParams = new URLSearchParams({
            LabourType: labourType || '',
            Contractor: contractor || ''
        });
        
        const response = await axios.get(
            `${API_BASE_URL}/HR/GetLabourCCForSalaryReport?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Labour CC for Salary Report Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Labour CC for Salary Report API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 9. Get Months Salary Report (Staff - Normal data)
export const getMonthsSalaryForReport = async (reportData) => {
    try {
        console.log('💰 Getting Months Salary Report (Staff) with params:', reportData); // DEBUG
        
        const payload = {
            EmpCategory: reportData.EmpCategory || 
                        reportData.empCategory || 
                        "",
            CCCode: reportData.CCCode || 
                   reportData.ccCode || 
                   "",
            EmpRefNo: reportData.EmpRefNo || 
                     reportData.empRefNo || 
                     "",
            GroupId: reportData.GroupId || 
                    reportData.groupId || 
                    "",
            Year: reportData.Year || 
                 reportData.year || 
                 "",
            FromMonth: reportData.FromMonth || 
                      reportData.fromMonth || 
                      "",
            ToMonth: reportData.ToMonth || 
                    reportData.toMonth || 
                    ""
        };
        
        console.log('📤 Sending Months Salary Report (Staff) Payload:', payload); // DEBUG
        
        const response = await axios.post(
            `${API_BASE_URL}/HR/GetMonthsSalaryForReport`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Months Salary Report (Staff) Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Months Salary Report (Staff) API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 10. Get Single Employee Salary Data for Report (Staff - Details view)
export const getSingleEmpSalaryDataForReport = async (reportData) => {
    try {
        console.log('📊 Getting Single Employee Salary Data for Report with params:', reportData); // DEBUG
        
        const payload = {
            EmpCategory: reportData.EmpCategory || 
                        reportData.empCategory || 
                        "",
            CCCode: reportData.CCCode || 
                   reportData.ccCode || 
                   "",
            GroupId: reportData.GroupId || 
                    reportData.groupId || 
                    "",
            EmpRefNo: reportData.EmpRefNo || 
                     reportData.empRefNo || 
                     "",
            Year: reportData.Year || 
                 reportData.year || 
                 "",
            FromMonth: reportData.FromMonth || 
                      reportData.fromMonth || 
                      "",
            ToMonth: reportData.ToMonth || 
                    reportData.toMonth || 
                    ""
        };
        
        console.log('📤 Sending Single Employee Salary Data Payload:', payload); // DEBUG
        
        const response = await axios.post(
            `${API_BASE_URL}/HR/GetSingleEmpSalaryDataForReport`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Single Employee Salary Data Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Single Employee Salary Data API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 11. Get Employee Pay Slip Data (Staff)
export const getEmpPaySlipData = async (reportData) => {
    try {
        console.log('📄 Getting Employee Pay Slip Data with params:', reportData); // DEBUG
        
        const payload = {
            TransactionRefno: reportData.TransactionRefno || 
                            reportData.transactionRefno || 
                            "",
            EmpRefno: reportData.EmpRefno || 
                     reportData.empRefno || 
                     "",
            CurrentCC: reportData.CurrentCC || 
                      reportData.currentCC || 
                      "",
            CategoryId: reportData.CategoryId || 
                       reportData.categoryId || 
                       "",
            ConslidateTransNo: reportData.ConslidateTransNo || 
                             reportData.conslidateTransNo || 
                             ""
        };
        
        console.log('📤 Sending Employee Pay Slip Data Payload:', payload); // DEBUG
        
        const response = await axios.post(
            `${API_BASE_URL}/HR/GetEmpPaySlipData`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Employee Pay Slip Data Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Employee Pay Slip Data API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 12. Get Labour Pay Slip Data
export const getLBPaySlipData = async (reportData) => {
    try {
        console.log('📄 Getting Labour Pay Slip Data with params:', reportData); // DEBUG
        
        const payload = {
            TransactionRefno: reportData.TransactionRefno || 
                            reportData.transactionRefno || 
                            "",
            LabourId: reportData.LabourId || 
                     reportData.labourId || 
                     "",
            CurrentCC: reportData.CurrentCC || 
                      reportData.currentCC || 
                      "",
            ConslidateTransNo: reportData.ConslidateTransNo || 
                             reportData.conslidateTransNo || 
                             ""
        };
        
        console.log('📤 Sending Labour Pay Slip Data Payload:', payload); // DEBUG
        
        const response = await axios.post(
            `${API_BASE_URL}/HR/GetLBPaySlipData`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Labour Pay Slip Data Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Labour Pay Slip Data API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 13. Get Labour Months Salary Report
export const getLBMonthsSalaryForReport = async (reportData) => {
    try {
        console.log('💰 Getting Labour Months Salary Report with params:', reportData); // DEBUG
        
        const payload = {
            LabourType: reportData.LabourType || 
                       reportData.labourType || 
                       "",
            CCCode: reportData.CCCode || 
                   reportData.ccCode || 
                   "",
            LabourId: reportData.LabourId || 
                     reportData.labourId || 
                     "",
            GroupId: reportData.GroupId || 
                    reportData.groupId || 
                    "",
            Year: reportData.Year || 
                 reportData.year || 
                 "",
            FromMonth: reportData.FromMonth || 
                      reportData.fromMonth || 
                      "",
            ToMonth: reportData.ToMonth || 
                    reportData.toMonth || 
                    "",
            ContractorCode: reportData.ContractorCode || 
                          reportData.contractorCode || 
                          ""
        };
        
        console.log('📤 Sending Labour Months Salary Report Payload:', payload); // DEBUG
        
        const response = await axios.post(
            `${API_BASE_URL}/HR/GetLBMonthsSalaryForReport`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Labour Months Salary Report Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Labour Months Salary Report API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 14. Get Single Labour Salary Data for Report (Details view)
export const getSingleLBSalaryDataForReport = async (reportData) => {
    try {
        console.log('📊 Getting Single Labour Salary Data for Report with params:', reportData); // DEBUG
        
        const payload = {
            LabourType: reportData.LabourType || 
                       reportData.labourType || 
                       "",
            CCCode: reportData.CCCode || 
                   reportData.ccCode || 
                   "",
            GroupId: reportData.GroupId || 
                    reportData.groupId || 
                    "",
            LabourId: reportData.LabourId || 
                     reportData.labourId || 
                     "",
            Year: reportData.Year || 
                 reportData.year || 
                 "",
            FromMonth: reportData.FromMonth || 
                      reportData.fromMonth || 
                      "",
            ToMonth: reportData.ToMonth || 
                    reportData.toMonth || 
                    "",
            ContractorCode: reportData.ContractorCode || 
                          reportData.contractorCode || 
                            "NA"
        };
        
        console.log('📤 Sending Single Labour Salary Data Payload:', payload); // DEBUG
        
        const response = await axios.post(
            `${API_BASE_URL}/HR/GetSingleLBSalaryDataForReport`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Single Labour Salary Data Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Single Labour Salary Data API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};
// 15. Get Employee Salary Years
export const getEmployeeSalaryYears = async (reportData) => {
    try {
        console.log('📅 Getting Employee Salary Years with params:', reportData); // DEBUG
        
        // ✅ Determine employee type and set smart defaults
        const employeeType = reportData.EmployeeType || reportData.employeeType || 'Staff';
        const labourType = employeeType === 'Staff' ? 'NA' : (reportData.LabourType || reportData.labourType || '');
        const contractorCode = employeeType === 'Staff' ? 'NA' : (reportData.ContractorCode || reportData.contractorCode || '');
        
        const payload = {
            EmpCategory: reportData.EmpCategory || reportData.empCategory || "",
            CCCode: reportData.CCCode || reportData.ccCode || "",
            GroupId: reportData.GroupId || reportData.groupId || "",
            EmpRefNo: reportData.EmpRefNo || reportData.empRefNo || "",
            LabourType: labourType,
            ContractorCode: contractorCode,
            EmployeeType: employeeType
        };
        
        console.log('📤 Sending Employee Salary Years Payload:', payload); // DEBUG
        
        const response = await axios.post(
            `${API_BASE_URL}/HR/GetEmployeeSalaryYears`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Employee Salary Years Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Employee Salary Years API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// ==============================================
// HELPER FUNCTIONS FOR PAYROLL REPORTS
// ==============================================

// Helper function to format Staff Payroll Report Data
export const formatStaffPayrollReportData = (params) => {
    return {
        EmpCategory: params.empCategory || "",
        CCCode: params.ccCode || "",
        GroupId: params.groupId || "",
        EmpRefNo: params.empRefNo || "",
        Year: params.year || "",
        FromMonth: params.fromMonth || "",
        ToMonth: params.toMonth || ""
    };
};

// Helper function to format Labour Payroll Report Data
export const formatLabourPayrollReportData = (params) => {
    return {
        LabourType: params.labourType || "",
        CCCode: params.ccCode || "",
        GroupId: params.groupId || "",
        LabourId: params.labourId || "",
        Year: params.year || "",
        FromMonth: params.fromMonth || "",
        ToMonth: params.toMonth || "",
        ContractorCode: params.contractorCode || ""
    };
};

// Helper function to format Pay Slip Data
export const formatPaySlipData = (params, isLabour = false) => {
    if (isLabour) {
        return {
            TransactionRefno: params.transactionRefno || "",
            LabourId: params.labourId || "",
            CurrentCC: params.currentCC || "",
            ConslidateTransNo: params.conslidateTransNo || ""
        };
    } else {
        return {
            TransactionRefno: params.transactionRefno || "",
            EmpRefno: params.empRefno || "",
            CurrentCC: params.currentCC || "",
            CategoryId: params.categoryId || "",
            ConslidateTransNo: params.conslidateTransNo || ""
        };
    }
};

// Helper function to format filter parameters for GET requests
export const formatPayrollFilterParams = (params) => {
    return {
        category: params.category || "",
        ccCode: params.ccCode || "",
        groupId: params.groupId || "",
        labourType: params.labourType || "",
        contractor: params.contractor || "",
        empType: params.empType || ""
    };
};