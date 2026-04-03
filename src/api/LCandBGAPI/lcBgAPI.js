import axios from "axios";

import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// LCBG (Letter of Credit/Bank Guarantee) RELATED APIs
// ==============================================

// 1. Get LCBG Codes
export const getLCBGCodes = async (params) => {
    try {
        const { LCBGType, LCBGStatus } = params;
        console.log('🏦 Getting LCBG Codes with params:', params); // DEBUG
        
        // Validate required parameters
        if (!LCBGType || !LCBGStatus) {
            throw new Error('LCBGType and LCBGStatus are required parameters');
        }
        
        const queryParams = new URLSearchParams({
            LCBGType: LCBGType,
            LCBGStatus: LCBGStatus
        });
        
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetLCBGCodes?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ LCBG Codes Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ LCBG Codes API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 2. Get LCBG Status Report Main Grid
export const getLCBGStatusReportMainGrid = async (params) => {
    try {
        const { StartYear, EndYear, FYYear, LCBGStatus } = params;
        console.log('📊 Getting LCBG Status Report Main Grid with params:', params); // DEBUG
        
        // Validate required parameters
        if (!StartYear || !EndYear || !FYYear || !LCBGStatus) {
            throw new Error('StartYear, EndYear, FYYear, and LCBGStatus are required parameters');
        }
        
        const queryParams = new URLSearchParams({
            StartYear: StartYear,
            EndYear: EndYear,
            FYYear: FYYear,
            LCBGStatus: LCBGStatus
        });
        
        const response = await axios.get(
            `${API_BASE_URL}/Reports/GetLCBGStatusReportMainGrid?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ LCBG Status Report Main Grid Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ LCBG Status Report Main Grid API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// ──────────────────────────────────────────────────────────────────────────────
// LC/BG CREATION APIs
// ──────────────────────────────────────────────────────────────────────────────

// 3. Get LC Vendor Codes (for LC type)
export const getLCVendorCodes = async ({ RoleId, Userid }) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Purchase/GetLCVendorCodes`, {
            params: { RoleId, Userid },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch vendor codes';
    }
};

// 4. Get PO Numbers for a Vendor/Client
export const getPOForLCVendor = async ({ VendorCode }) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Purchase/GetPOForlcvendor`, {
            params: { VendorCode },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch PO numbers';
    }
};

// 5. Get FD Numbers (optional)
export const getLCBGFDs = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Purchase/Getlcbgfds`);
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch FD numbers';
    }
};

// 6. Get BG Client Codes
export const getBGClientCodes = async ({ RoleId, Userid }) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Purchase/GetBGClientCodes`, {
            params: { RoleId, Userid },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch BG client codes';
    }
};

// 7. Get Sub-Clients for a BG Client
export const getSubClientsForBGClient = async ({ ClientCode }) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Purchase/Getsubclientforbgclient`, {
            params: { ClientCode },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch sub-clients';
    }
};

// 8. Get Client POs for BG (ClientCode + Subclient)
export const getClientPOsForBGClient = async ({ ClientCode, Subclient }) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Purchase/Getclientpoforbgclient`, {
            params: { ClientCode, Subclient },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch client PO numbers';
    }
};

// 9. Save LC/BG Data (POST)
export const saveLCBGData = async (payload) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Purchase/SaveLCBGData`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to save LC/BG data';
    }
};