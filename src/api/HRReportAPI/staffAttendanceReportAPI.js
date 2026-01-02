import axios from "axios";

import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// STAFF ATTENDANCE REPORT RELATED APIs
// ==============================================

// 1. Get Attendance Cost Centres by Month
export const getAttendanceCCByMonth = async (params) => {
    try {
        const { month, year } = params;
        console.log('🏢 Getting Attendance Cost Centres for:', { month, year }); // DEBUG
        
        // Validate required parameters
        if (!month) {
            throw new Error('Month is required');
        }
        if (!year) {
            throw new Error('Year is required');
        }
        
        const queryParams = new URLSearchParams({
            Month: month.toString().trim(),
            Year: year.toString().trim()
        });
        
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetAttendancCCByMonth?${queryParams.toString()}`); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/HR/GetAttendancCCByMonth?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Attendance Cost Centres Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Attendance Cost Centres API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 2. Get Attendance Data
export const getAttendanceData = async (params) => {
    try {
        const { typeValue, month, year, reportType } = params;
        console.log('📊 Getting Attendance Data for:', params); // DEBUG
        
        // Validate required parameters
        if (!typeValue) {
            console.error('❌ TypeValue is missing!');
            throw new Error('TypeValue is required (Employee ID or Cost Centre Code)');
        }
        if (!month) {
            console.error('❌ Month is missing!');
            throw new Error('Month is required');
        }
        if (!year) {
            console.error('❌ Year is missing!');
            throw new Error('Year is required');
        }
        if (!reportType) {
            console.error('❌ ReportType is missing!');
            throw new Error('ReportType is required (ID or CCCode)');
        }
        
        // Build query parameters with exact casing expected by backend
        // Backend expects: TypeValue, Month, year (lowercase 'y'), ReportType
        const queryParams = new URLSearchParams({
            TypeValue: typeValue.toString().trim(),
            Month: month.toString().trim(),
            year: year.toString().trim(), // Note: lowercase 'y' as per backend method signature
            ReportType: reportType.toString().trim() // Should be 'ID' or 'CCCode'
        });
        
        console.log('🔗 Full API URL:', `${API_BASE_URL}/HR/GetAttendanceData?${queryParams.toString()}`); // DEBUG
        console.log('📦 Query Parameters:', {
            TypeValue: typeValue.toString().trim(),
            Month: month.toString().trim(),
            year: year.toString().trim(),
            ReportType: reportType.toString().trim()
        }); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/HR/GetAttendanceData?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Attendance Data Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Attendance Data API Error:', error.response || error);
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

// 3. Get Employees for Attendance Report
export const getEmployeesForAttendanceReport = async (params) => {
    try {
        const { prefix, prefixType } = params;
        console.log('👥 Getting Employees for Attendance Report:', params); // DEBUG
        
        // Validate required parameters
        if (!prefix) {
            throw new Error('Prefix is required');
        }
        if (!prefixType) {
            throw new Error('PrefixType is required');
        }
        
        const queryParams = new URLSearchParams({
            Prefix: prefix.toString().trim(),
            PrefixType: prefixType.toString().trim()
        });
        
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetEmployeesForAttendanceReport?${queryParams.toString()}`); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/HR/GetEmployeesForAttendanceReport?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Employees for Attendance Report Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Employees for Attendance Report API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};