import axios from "axios";

import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// CMS PAYMENT REPORT RELATED APIs
// (Salary paid through Bank Report)
// ==============================================

// 1. Get CMS Years
export const getCMSYears = async () => {
    try {
        console.log('📅 Getting CMS Years'); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/HR/GetCMSYears`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ CMS Years Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ CMS Years API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 2. Get CMS Months by Year
export const getCMSMonthsByYear = async (year) => {
    try {
        console.log('📅 Getting CMS Months for Year:', year); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/HR/GetCMSMonthsbyYear?Year=${year}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ CMS Months by Year Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ CMS Months by Year API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 3. Get CMS Paid Employees
export const getCMSPaidEmployee = async (params) => {
    try {
        const { year, month } = params;
        console.log('👥 Getting CMS Paid Employees for:', { year, month }); // DEBUG
        
        const queryParams = new URLSearchParams({
            Year: year || '',
            Month: month || ''
        });
        
        const response = await axios.get(
            `${API_BASE_URL}/HR/GetCMSPaidEmployee?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ CMS Paid Employees Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ CMS Paid Employees API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 4. Get CMS Pay Report Employee Data
export const getCMSPayReportEmployeeData = async (params) => {
    try {
        const { year, month, emprefNo, ccCode } = params;
        console.log('📊 Getting CMS Pay Report Employee Data for:', params); // DEBUG
        
        const queryParams = new URLSearchParams({
            Year: year || '',
            Month: month || '',
            EmprefNo: emprefNo || '',
            CCCode: ccCode || ''
        });
        
        const response = await axios.get(
            `${API_BASE_URL}/HR/CMSPayReportEmployeeData?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ CMS Pay Report Employee Data Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ CMS Pay Report Employee Data API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 5. Get Employee Pay Slip Data (POST Request)
export const getEmpPaySlipData = async (paySlipData) => {
    try {

          const payload = {
            TransactionRefno: paySlipData.TransactionRefno || 
                            paySlipData.transactionRefno || 
                            "",
            EmpRefno: paySlipData.EmpRefno || 
                     paySlipData.employeeName || 
                     paySlipData.EmployeeName || 
                     "",
            CurrentCC: paySlipData.CurrentCC || 
                      paySlipData.CCCode || 
                      paySlipData.ccCode || 
                      "",
            CategoryId: paySlipData.CategoryId || 
                       paySlipData.categoryId || 
                       0,
            ConslidateTransNo: paySlipData.ConslidateTransNo || 
                              paySlipData.consolidateTransNo || 
                              ""
        };
        
        // 🔍 ADD THIS INTERCEPTOR
        const interceptor = axios.interceptors.request.use(config => {
            console.log('🚀 AXIOS IS SENDING:');
            console.log('   URL:', config.url);
            console.log('   Data:', config.data);
            console.log('   Data Type:', typeof config.data);
            console.log('   Headers:', config.headers);
            return config;
        });
        
        console.log('💰 Getting Employee Pay Slip Data with params:', paySlipData); // DEBUG
        
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

// 6. Get CMS Paid Cost Centre by Month
export const getCMSPaidCCbyMonth = async (params) => {
    try {
        const { month, year } = params;
        console.log('🏢 Getting CMS Paid Cost Centre for:', { month, year }); // DEBUG
        
        const queryParams = new URLSearchParams({
            Month: month || '',
            Year: year || ''
        });
        
        const response = await axios.get(
            `${API_BASE_URL}/HR/GetCMSPaidCCbyMonth?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ CMS Paid Cost Centre by Month Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ CMS Paid Cost Centre by Month API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// ==============================================
// HELPER FUNCTIONS FOR CMS PAYMENT REPORTS
// ==============================================

// Helper function to format pay slip data for POST request
export const formatPaySlipData = (params) => {
    return {
        CCCode: params.ccCode || "",
        CategoryId: params.categoryId || 0,
        ConslidateTransNo: params.consolidateTransNo || "",
        EmployeeName: params.employeeName || "",
        PayRollDate: params.payRollDate || "",
        TransactionRefno: params.transactionRefno || ""
    };
};