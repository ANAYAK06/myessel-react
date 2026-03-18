import axios from "axios";

import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// PF & ESI PAYMENT REPORT RELATED APIs
// (PF and ESI Reports for Staff and Labour)
// ==============================================

// 1. Get PF/ESI Paid Years
export const getPFESIPaidYears = async (params) => {
    try {
        const { reportType, lType, contraCode, eType } = params;
        console.log('📅 Getting PF/ESI Paid Years for:', params); // DEBUG
        
        const queryParams = new URLSearchParams({
            ReportType: reportType || '',
            LType: lType || '',
            ContraCode: contraCode || '',
            EType: eType || ''
        });
        
        const response = await axios.get(
            `${API_BASE_URL}/HR/GetPFESIPaidYears?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ PF/ESI Paid Years Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ PF/ESI Paid Years API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 2. Get PF/ESI Paid Months by Year
export const getPfEsiPaidMonthsByYear = async (params) => {
    try {
        const { year, reportType, lType, contraCode, eType } = params;
        console.log('📅 Getting PF/ESI Paid Months for Year:', params); // DEBUG
        
        const queryParams = new URLSearchParams({
            Year: year || '',
            ReportType: reportType || '',
            LType: lType || '',
            ContraCode: contraCode || '',
            EType: eType || ''
        });
        
        const response = await axios.get(
            `${API_BASE_URL}/HR/GetPfEsiPaidMonthsbyYear?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ PF/ESI Paid Months by Year Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ PF/ESI Paid Months by Year API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 3. Get PF/ESI Paid Cost Centre
export const getPFESIPaidCC = async (params) => {
    try {
        const { month, year, reportType, lType, contraCode, eType } = params;
        console.log('🏢 Getting PF/ESI Paid Cost Centre for:', params); // DEBUG
        
        const queryParams = new URLSearchParams({
            Month: month || '',
            Year: year || '',
            ReportType: reportType || '',
            LType: lType || '',
            ContraCode: contraCode || '',
            EType: eType || ''
        });
        
        const response = await axios.get(
            `${API_BASE_URL}/HR/GetPFESIPaidCC?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ PF/ESI Paid Cost Centre Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ PF/ESI Paid Cost Centre API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 4. Get Paid PF Data (Staff)
export const getPaidPFData = async (reportData) => {
    try {
        console.log('💰 Getting Paid PF Data (Staff) with params:', reportData); // DEBUG
        
        const payload = {
            ReportType: reportData.ReportType || 
                       reportData.reportType || 
                       "EPF",
            CCCode: reportData.CCCode || 
                   reportData.ccCode || 
                   reportData.CurrentCC || 
                   "", // Use "0" for "Select All" cost centres
            Month: reportData.Month || 
                  reportData.month || 
                  "",
            Year: reportData.Year || 
                 reportData.year || 
                 ""
        };
        
        console.log('📤 Sending Paid PF Data (Staff) Payload:', payload); // DEBUG
        
        const response = await axios.post(
            `${API_BASE_URL}/HR/GetPaidPFData`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Paid PF Data (Staff) Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Paid PF Data (Staff) API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 5. Get Labour Paid PF Data
export const getLBPaidPFData = async (reportData) => {
    try {
        console.log('💰 Getting Labour Paid PF Data with params:', reportData); // DEBUG
        
        const payload = {
            ReportType: reportData.ReportType || 
                       reportData.reportType || 
                       "EPF",
            CCCode: reportData.CCCode || 
                   reportData.ccCode || 
                   "", // Use "0" for "Select All" cost centres
            ContractorCode: reportData.ContractorCode || 
                          reportData.contractorCode || 
                          reportData.ContraCode ||
                          "NA", // Use "NA" for non-contractor or when not applicable
            LabourType: reportData.LabourType || 
                       reportData.labourType || 
                       reportData.LType ||
                       "", // Values: "Own Labour" or "Contractor"
            Month: reportData.Month || 
                  reportData.month || 
                  "",
            Year: reportData.Year || 
                 reportData.year || 
                 ""
        };
        
        console.log('📤 Sending Labour Paid PF Data Payload:', payload); // DEBUG
        
        const response = await axios.post(
            `${API_BASE_URL}/HR/GetLBPaidPFData`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Labour Paid PF Data Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Labour Paid PF Data API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 6. Get Labour Paid ESI Data
export const getLBPaidESIData = async (reportData) => {
    try {
        console.log('💰 Getting Labour Paid ESI Data with params:', reportData); // DEBUG
        
        const payload = {
            ReportType: reportData.ReportType || 
                       reportData.reportType || 
                       "ESIC",
            CCCode: reportData.CCCode || 
                   reportData.ccCode || 
                   "", // Use "0" for "Select All" cost centres
            ContractorCode: reportData.ContractorCode || 
                          reportData.contractorCode || 
                          reportData.ContraCode ||
                          "NA", // Use "NA" for non-contractor or when not applicable
            LabourType: reportData.LabourType || 
                       reportData.labourType || 
                       reportData.LType ||
                       "", // Values: "Own Labour" or "Contractor"
            Month: reportData.Month || 
                  reportData.month || 
                  "",
            Year: reportData.Year || 
                 reportData.year || 
                 ""
        };
        
        console.log('📤 Sending Labour Paid ESI Data Payload:', payload); // DEBUG
        
        const response = await axios.post(
            `${API_BASE_URL}/HR/GetLBPaidESIData`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Labour Paid ESI Data Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Labour Paid ESI Data API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 7. Get Paid ESI Data (Staff)
export const getPaidESIData = async (reportData) => {
    try {
        console.log('💰 Getting Paid ESI Data (Staff) with params:', reportData); // DEBUG
        
        const payload = {
            ReportType: reportData.ReportType || 
                       reportData.reportType || 
                       "ESIC",
            CCCode: reportData.CCCode || 
                   reportData.ccCode || 
                   reportData.CurrentCC || 
                   "", // Use "0" for "Select All" cost centres
            Month: reportData.Month || 
                  reportData.month || 
                  "",
            Year: reportData.Year || 
                 reportData.year || 
                 ""
        };
        
        console.log('📤 Sending Paid ESI Data (Staff) Payload:', payload); // DEBUG
        
        const response = await axios.post(
            `${API_BASE_URL}/HR/GetPaidESIData`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Paid ESI Data (Staff) Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Paid ESI Data (Staff) API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// ==============================================
// HELPER FUNCTIONS FOR PF & ESI REPORTS
// ==============================================

// Helper function to format Staff PF/ESI data for POST requests
export const formatStaffPFESIData = (params) => {
    return {
        ReportType: params.reportType || "EPF",
        CCCode: params.ccCode || "", // Use "0" for "Select All"
        Month: params.month || "",
        Year: params.year || ""
    };
};

// Helper function to format Labour PF/ESI data for POST requests
export const formatLabourPFESIData = (params) => {
    return {
        ReportType: params.reportType || "EPF",
        CCCode: params.ccCode || "", // Use "0" for "Select All"
        ContractorCode: params.contractorCode || "NA",
        LabourType: params.labourType || "", // "Own Labour" or "Contractor"
        Month: params.month || "",
        Year: params.year || ""
    };
};

// Helper function to format PF/ESI filter parameters for GET requests
export const formatPFESIFilterParams = (params) => {
    return {
        reportType: params.reportType || "",
        lType: params.lType || params.labourType || "",
        contraCode: params.contraCode || params.contractorCode || "",
        eType: params.eType || "",
        year: params.year || "",
        month: params.month || ""
    };
};