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