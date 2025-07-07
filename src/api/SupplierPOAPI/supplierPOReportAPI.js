import axios from "axios";

import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// SUPPLIER REPORTS RELATED APIs
// ==============================================

// 1. Get Supplier Cost Centers
export const getSupplierCC = async (params) => {
    try {
        const { Roleid, userid, StoreStatus } = params;
        console.log('🏢 Getting Supplier Cost Centers with params:', params); // DEBUG
        
        // Validate required parameters
        if (!Roleid || !userid) {
            throw new Error('Roleid and userid are required parameters');
        }
        
        const queryParams = new URLSearchParams({
            Roleid: Roleid,
            userid: userid,
            StoreStatus: StoreStatus || ''
        });
        
        const response = await axios.get(
            `${API_BASE_URL}/Reports/GetSupplierCC?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Supplier Cost Centers Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Supplier Cost Centers API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 2. Get Supplier DCA Codes
export const getSupplierDCA = async (params) => {
    try {
        const { CCCode } = params;
        console.log('📋 Getting Supplier DCA with params:', params); // DEBUG
        
        // Validate required parameters
        if (!CCCode) {
            throw new Error('CCCode is a required parameter');
        }
        
        const queryParams = new URLSearchParams({
            CCCode: CCCode
        });
        
        const response = await axios.get(
            `${API_BASE_URL}/Reports/GetSupplierDCA?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Supplier DCA Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Supplier DCA API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 3. Get Supplier Vendors
export const getSupplierVendor = async (params) => {
    try {
        const { CCCode, DCA } = params;
        console.log('🏪 Getting Supplier Vendors with params:', params); // DEBUG
        
        // Validate required parameters
        if (!CCCode || !DCA) {
            throw new Error('CCCode and DCA are required parameters');
        }
        
        const queryParams = new URLSearchParams({
            CCCode: CCCode,
            DCA: DCA
        });
        
        const response = await axios.get(
            `${API_BASE_URL}/Reports/GetSupplierVendor?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Supplier Vendors Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Supplier Vendors API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const getSupplierPOForReport = async (params) => {
    try {
        const { CCCode, DCACode, VendorCode, month, year } = params;
        console.log('📊 Getting Supplier PO Report with params:', params); // DEBUG
        
        // ✅ FIXED: Only validate truly required fields (month can be empty)
        if (!CCCode || !DCACode || !VendorCode || year === undefined || year === null || year === '') {
            throw new Error('CCCode, DCACode, VendorCode, and year are required parameters');
        }
        
        // ✅ Transform parameters to match backend expectations
        const transformedParams = {
            CCCode: CCCode,
            DCACode: DCACode,
            VendorCode: VendorCode === '' ? 'SelectAll' : VendorCode, // ✅ Fixed: Added quotes
            month: month === '' ? 0 : month,                          // ✅ Empty string becomes 0
            year: year === 'Any Year' ? 0 : year                      // ✅ 'Any Year' becomes 0
        };
        
        // ✅ Log what we're actually sending
        console.log('✅ Transformed params sending to API:', transformedParams);
        
        // ✅ FIXED: Send transformed values, not original
        const requestBody = transformedParams;
        
        const response = await axios.post(
            `${API_BASE_URL}/Reports/GetSupplierPOForReport`,
            requestBody,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Supplier PO Report Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Supplier PO Report API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};
// 5. Get Supplier PO by PO Number
export const getSupplierPObyPO = async (params) => {
    try {
        const { PONo } = params;
        console.log('📝 Getting Supplier PO by PO Number with params:', params); // DEBUG
        
        // Validate required parameters
        if (!PONo) {
            throw new Error('PONo is a required parameter');
        }
        
        const queryParams = new URLSearchParams({
            PONo: PONo
        });
        
        const response = await axios.get(
            `${API_BASE_URL}/Reports/GetSupplierPObyPO?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Supplier PO by PO Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Supplier PO by PO API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};