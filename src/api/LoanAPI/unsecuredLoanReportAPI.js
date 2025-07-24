import axios from "axios";

import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// UNSECURED LOAN REPORT APIs
// ==============================================

// 1. Get All Unsecured Loans by Role ID
export const getAllUnsecuredLoans = async (roleId) => {
    try {
        console.log('🔍 Getting All Unsecured Loans for Role ID:', roleId); // DEBUG
        
        const queryParams = new URLSearchParams();
        if (roleId) {
            queryParams.append('Roleid', roleId);
        }
        
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetAllUnsecuredLoan?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ All Unsecured Loans Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ All Unsecured Loans API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 2. Get Unsecured Loan Years by Loan Number
export const getUnsecuredLoanYears = async (loanNo) => {
    try {
        console.log('🔍 Getting Unsecured Loan Years for Loan No:', loanNo); // DEBUG
        
        const queryParams = new URLSearchParams();
        if (loanNo) {
            queryParams.append('Loanno', loanNo);
        }
        
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetUnsLoanYears?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Unsecured Loan Years Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Unsecured Loan Years API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 3. Get Unsecured Loan Months by Loan Number and Year
export const getUnsecuredLoanMonths = async (loanNo, year) => {
    try {
        console.log('🔍 Getting Unsecured Loan Months for:', { loanNo, year }); // DEBUG
        
        const queryParams = new URLSearchParams();
        if (loanNo) {
            queryParams.append('Loanno', loanNo);
        }
        if (year) {
            queryParams.append('Year', year);
        }
        
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetUnsYearMonth?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Unsecured Loan Months Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Unsecured Loan Months API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 4. Get Unsecured Loan Banks for Dropdown
export const getUnsecuredLoanBanks = async (unsLoan) => {
    try {
        console.log('🔍 Getting Unsecured Loan Banks for:', unsLoan); // DEBUG
        
        const queryParams = new URLSearchParams();
        if (unsLoan) {
            queryParams.append('Unsloan', unsLoan);
        }
        
        const response = await axios.get(
            `${API_BASE_URL}/Reports/BindUnsLoanBanks?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Unsecured Loan Banks Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Unsecured Loan Banks API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 5. Get Unsecured Loan Report Data (Main Report)
// 5. Get Unsecured Loan Report Data (Main Report)
export const getUnsecuredLoanReportData = async (params) => {
    try {
        const { loanNo, year, month, bankId } = params;
        console.log('🔍 Getting Unsecured Loan Report Data for:', params); // DEBUG
        
        const queryParams = new URLSearchParams();
        
        if (loanNo) {
            queryParams.append('LoanNo', loanNo);
        }
        if (year) {
            queryParams.append('Year', year);
        }
        
        // ✅ FIXED: Check for !== undefined instead of truthiness
        // This ensures that 0 values (All Months, All Banks) are still sent to the API
        if (month !== undefined && month !== null) {
            queryParams.append('Month', month);
        }
        if (bankId !== undefined && bankId !== null) {
            queryParams.append('Bankid', bankId);
        }
        
        console.log('📤 Final Query Params:', queryParams.toString()); // DEBUG - Log final query string
        
        const response = await axios.get(
            `${API_BASE_URL}/Reports/GetUnsLoanReportData?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Unsecured Loan Report Data Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Unsecured Loan Report Data API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};