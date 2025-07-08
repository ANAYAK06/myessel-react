import axios from "axios";

import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// SPPO REPORTS RELATED APIs
// ==============================================

// 1. Get Cost Centers for SPPO Close by Vendor
export const getCCForSPPOCloseByVendor = async (params) => {
    try {
        const { Userid, Roleid, CCStatusval } = params;
        console.log('🏢 Getting Cost Centers for SPPO Close by Vendor with params:', params); // DEBUG
        
        // Validate required parameters
        if (!Userid || !Roleid) {
            throw new Error('Userid and Roleid are required parameters');
        }
        
        const queryParams = new URLSearchParams({
            Userid: Userid,
            Roleid: Roleid,
            CCStatusval: CCStatusval || ''
        });
        
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetCCForSPPOClsobyVendor?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Cost Centers for SPPO Close Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Cost Centers for SPPO Close API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 2. Get DCA for PO Report
export const getDCAForPOReport = async (params) => {
    try {
        const { CCCode } = params;
        console.log('📋 Getting DCA for PO Report with params:', params); // DEBUG
        
        // Validate required parameters
        if (!CCCode) {
            throw new Error('CCCode is a required parameter');
        }
        
        const queryParams = new URLSearchParams({
            CCCode: CCCode
        });
        
        const response = await axios.get(
            `${API_BASE_URL}/Reports/GetDCAForPOReport?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ DCA for PO Report Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ DCA for PO Report API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 3. Get Vendors for SPPO Report
export const getVendorsForSPPOReport = async (params) => {
    try {
        const { CCCode, DCA } = params;
        console.log('🏪 Getting Vendors for SPPO Report with params:', params); // DEBUG
        
        // Validate required parameters
        if (!CCCode || !DCA) {
            throw new Error('CCCode and DCA are required parameters');
        }
        
        const queryParams = new URLSearchParams({
            CCCode: CCCode,
            DCA: DCA
        });
        
        const response = await axios.get(
            `${API_BASE_URL}/Reports/GetVendorsForSPPOReport?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Vendors for SPPO Report Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Vendors for SPPO Report API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 4. Get SPPO Report Data (POST)
export const getSPPOReportData = async (params) => {
    try {
        const { CCCode, DCACode, VendorCode, month, year, Status } = params;
        console.log('📊 Getting SPPO Report Data with params:', params); // DEBUG
        
        // Validate required parameters (month can be empty)
        if (!CCCode || !DCACode || !VendorCode || year === undefined || year === null || year === '' || !Status) {
            throw new Error('CCCode, DCACode, VendorCode, year, and Status are required parameters');
        }
        
        // Validate Status parameter
        if (Status !== 'Running' && Status !== 'Closed') {
            throw new Error('Status must be either "Running" or "Closed"');
        }
        
        // Transform parameters to match backend expectations
        const transformedParams = {
            CCCode: CCCode,
            DCACode: DCACode,
            VendorCode: VendorCode === '' ? 'SelectAll' : VendorCode,
            month: month === '' ? 0 : month,
            year: year, // Keep financial year format (e.g., 2025-26)
            Status: Status // Running or Closed
        };
        
        // Log what we're actually sending
        console.log('✅ Transformed params sending to API:', transformedParams);
        
        const requestBody = transformedParams;
        
        const response = await axios.post(
            `${API_BASE_URL}/Reports/GetSPPOReportData`,
            requestBody,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ SPPO Report Data Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ SPPO Report Data API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 5. Get SPPO for Print
export const getSPPOForPrint = async (params) => {
    try {
        const { SPPONO } = params;
        console.log('🖨️ Getting SPPO for Print with params:', params); // DEBUG
        
        // Validate required parameters
        if (!SPPONO) {
            throw new Error('SPPONO is a required parameter');
        }
        
        const queryParams = new URLSearchParams({
            SPPONO: SPPONO
        });
        
        const response = await axios.get(
            `${API_BASE_URL}/Reports/GetSPPOForPrint?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ SPPO for Print Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ SPPO for Print API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};