import axios from "axios";

import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// EMPLOYEE EXIT REPORT RELATED APIs
// ==============================================

// 1. Get Employee Exit Report by Date Range
export const getEmpExit = async (params) => {
    try {
        const { fromDate, toDate } = params;
        console.log('🚪 Getting Employee Exit Report for:', { fromDate, toDate }); // DEBUG
        
        // Validate required parameters
        if (!fromDate) {
            throw new Error('FromDate is required');
        }
        if (!toDate) {
            throw new Error('ToDate is required');
        }
        
        const queryParams = new URLSearchParams({
            Fromdate: fromDate.toString().trim(),
            Todate: toDate.toString().trim()
        });
        
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetEmpExit?${queryParams.toString()}`); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/HR/GetEmpExit?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Employee Exit Report Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Employee Exit Report API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 2. Get Employee Exit Report Details by ID
export const getReportEmpExitById = async (params) => {
    try {
        const { empRefNo, id, roleId } = params;
        console.log('📋 Getting Employee Exit Report Details for:', params); // DEBUG
        
        // Validate required parameters
        if (!empRefNo) {
            console.error('❌ EmpRefNo is missing!');
            throw new Error('EmpRefNo is required');
        }
        if (!id) {
            console.error('❌ Id is missing!');
            throw new Error('Id is required');
        }
        if (!roleId) {
            console.error('❌ RoleId is missing!');
            throw new Error('RoleId is required');
        }
        
        const queryParams = new URLSearchParams({
            Emprefno: empRefNo.toString().trim(),
            Id: id.toString().trim(),
            RoleId: roleId.toString().trim()
        });
        
        console.log('🔗 Full API URL:', `${API_BASE_URL}/HR/GetReportEmpExitbyId?${queryParams.toString()}`); // DEBUG
        console.log('📦 Query Parameters:', {
            Emprefno: empRefNo.toString().trim(),
            Id: id.toString().trim(),
            RoleId: roleId.toString().trim()
        }); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/HR/GetReportEmpExitbyId?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Employee Exit Report Details Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Employee Exit Report Details API Error:', error.response || error);
        console.error('❌ Error Details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};