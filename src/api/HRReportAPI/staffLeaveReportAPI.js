import axios from "axios";

import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// LEAVE REPORT RELATED APIs
// ==============================================

// 1. Get Leave Report Grid by Date Range
export const getLeaveReportGrid = async (params) => {
    try {
        const { fromDate, toDate } = params;
        console.log('📅 Getting Leave Report Grid for:', { fromDate, toDate }); // DEBUG
        
        // Validate required parameters
        if (!fromDate) {
            throw new Error('FromDate is required');
        }
        if (!toDate) {
            throw new Error('ToDate is required');
        }
        
        const queryParams = new URLSearchParams({
            FromDate: fromDate.toString().trim(),
            ToDate: toDate.toString().trim()
        });
        
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/ViewLeaveReportGrid?${queryParams.toString()}`); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/HR/ViewLeaveReportGrid?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Leave Report Grid Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Leave Report Grid API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};