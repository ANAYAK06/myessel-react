import axios from "axios";

import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// TERM LOAN REPORT APIs
// ==============================================

// 1. Get Agency Codes for Dropdown
export const getAgencyCodes = async () => {
    try {
        console.log('🔍 Getting Agency Codes...'); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetAgencyCodes`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Agency Codes Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Agency Codes API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 2. Get Loan Numbers by Agency Code
export const getLoanNumbersByAgency = async (agencyCode) => {
    try {
        console.log('🔍 Getting Loan Numbers for Agency:', agencyCode); // DEBUG
        
        const queryParams = new URLSearchParams();
        if (agencyCode && agencyCode !== 'SelectAll') {
            queryParams.append('AgencyCode', agencyCode);
        }
        
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/BindLoannos?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Loan Numbers Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Loan Numbers API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 3. Get Term Loan Report Grid (Main Report)
export const getTermLoanReportGrid = async (params) => {
    try {
        const { agency, loanNo, fromDate, toDate } = params;
        console.log('🔍 Getting Term Loan Report for:', params); // DEBUG
        
        const queryParams = new URLSearchParams();
        
        // Handle Agency parameter (support SelectAll)
        if (agency) {
            queryParams.append('Agency', agency);
        }
        
        // Handle Loan Number parameter (support SelectAll)
        if (loanNo) {
            queryParams.append('LoanNo', loanNo);
        }
        
        // Handle optional date parameters
        if (fromDate && fromDate.trim() !== '') {
            queryParams.append('FromDate', fromDate);
        }
        if (toDate && toDate.trim() !== '') {
            queryParams.append('ToDate', toDate);
        }
        
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetTermLoanReportGrid?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Term Loan Report Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Term Loan Report API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};