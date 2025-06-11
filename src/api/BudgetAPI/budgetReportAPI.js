import axios from "axios";


import { API_BASE_URL } from '../../config/apiConfig';


// ==============================================

// 1. Get All Financial Years
export const getAllFinancialYears = async () => {
    try {
        console.log('🔍 Getting All Financial Years'); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetAllFinancialYears`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ All Financial Years Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ All Financial Years API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 2. Get Cost Center Budget Report Types
export const getCostCenterBudgetReportTypes = async (roleId) => {
    try {
        console.log('🔍 Getting Cost Center Budget Report Types for roleId:', roleId); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetCostCenterBudgetReportTypes?Roleid=${roleId}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Cost Center Budget Report Types Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Cost Center Budget Report Types API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 3. Get Cost Centers by Type by Role
export const getCostCentersByTypeByRole = async (params) => {
    try {
        const { ccType, subType, uid, rid, ccStatus } = params;
        console.log('🔍 Getting Cost Centers by Type by Role with params:', params); // DEBUG
        
        const queryParams = new URLSearchParams({
            CCType: ccType || '',
            SubType: subType || '',
            UID: uid || '',
            RID: rid || '',
            CCstatus: ccStatus || ''
        });
        
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetCostCentersbyTypebyrole?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Cost Centers by Type by Role Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Cost Centers by Type by Role API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 4. Get CC Budget Details By Code For Report
export const getCCBudgetDetailsByCodeForReport = async (params) => {
    try {
        const { ccCode, year } = params;
        console.log('🔍 Getting CC Budget Details for:', { ccCode, year }); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetCCBudgetDetailsByCodeForReport?CCCode=${ccCode}&Year=${year}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ CC Budget Details Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ CC Budget Details API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 5. Get DCA Budget Details For Report
export const getDCABudgetDetailsForReport = async (params) => {
    try {
        const { ccCode, year } = params;
        console.log('🔍 Getting DCA Budget Details for:', { ccCode, year }); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetDCABudgetDetailsForReport?CCCode=${ccCode}&Year=${year}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ DCA Budget Details Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ DCA Budget Details API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 6. Get CC Depreciation OverHead
export const getCCDepreciationOverHead = async (params) => {
    try {
        const { ccCode, year } = params;
        console.log('🔍 Getting CC Depreciation OverHead for:', { ccCode, year }); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetCCDepreciationOverHead?CCCode=${ccCode}&Year=${year}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ CC Depreciation OverHead Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ CC Depreciation OverHead API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 7. Get DCA Budget Detailed Summary
export const getDCABudgetDetailedSummary = async (params) => {
    try {
        const { role, ccType, ccCode, dcaCode, year, year1 } = params;
        console.log('🔍 Getting DCA Budget Detailed Summary for:', params); // DEBUG
        
        const queryParams = new URLSearchParams({
            Role: role,
            CCType: ccType,
            CCCode: ccCode,
            DCACode: dcaCode,
            Year: year,
            Year1: year1
        });
        
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetDCABudgetDetailedSummary?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ DCA Budget Detailed Summary Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ DCA Budget Detailed Summary API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 8. Get CC Invoice Summary
export const getCCInvoiceSummary = async (params) => {
    try {
        const { ccCode, totalDCABudget, totalConsumedDCABudget } = params;
        console.log('🔍 Getting CC Invoice Summary for:', params); // DEBUG
        
        const queryParams = new URLSearchParams({
            CCCode: ccCode,
            TotalDCABudget: totalDCABudget,
            TotalCosumedDCABudget: totalConsumedDCABudget
        });
        
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetCCInvoiceSummary?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ CC Invoice Summary Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ CC Invoice Summary API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 9. Get All Invoice By CC Code
export const getAllInvoiceByCCCode = async (params) => {
    try {
        const { ccCode, type } = params;
        console.log('🔍 Getting All Invoice by CC Code for:', { ccCode, type }); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetAllInvoicebyCCCode?CCCode=${ccCode}&Type=${type}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ All Invoice by CC Code Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ All Invoice by CC Code API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 10. Get Budget Transfer Summary Popup
export const getBudgetTransferSummaryPopup = async (ccCode) => {
    try {
        console.log('🔍 Getting Budget Transfer Summary Popup for:', ccCode); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/BudgetTransferSummaryPopup?CCcode=${ccCode}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Budget Transfer Summary Popup Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Budget Transfer Summary Popup API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 11. Get CC Upload Docs Exists
export const getCCUploadDocsExists = async (params) => {
    try {
        const { ccCode, uid } = params;
        console.log('🔍 Checking CC Upload Docs Exists for:', { ccCode, uid }); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/Getccuploadocsexists?CCCode=${ccCode}&UID=${uid}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ CC Upload Docs Exists Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ CC Upload Docs Exists API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 12. Save Budget Excel Request
export const saveBudgetExcelRequest = async (data) => {
    try {
        console.log('🔍 Saving Budget Excel Request:', data); // DEBUG
        
        const response = await axios.post(
            `${API_BASE_URL}/Accounts/SaveBudgetExcelRequest`,
            data,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Save Budget Excel Request Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Save Budget Excel Request API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};