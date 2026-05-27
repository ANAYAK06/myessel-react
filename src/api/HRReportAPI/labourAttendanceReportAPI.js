import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// LABOUR ATTENDANCE REPORT RELATED APIs
// ==============================================

// 1. Get Contractors for Attendance Report
export const getAttReportContractors = async () => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/HR/GetAttReportContractors`,
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    } catch (error) {
        console.error('❌ GetAttReportContractors Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};

// 2. Get Labour Attendance Data (ID-wise or CC-wise day-by-day report)
export const getLabourAttData = async (params) => {
    try {
        const { typeValue, month, year, reportType, contractorCode, labourType } = params;

        const queryParams = new URLSearchParams({
            TypeValue: typeValue?.toString().trim() ?? '',
            Month: month?.toString().trim() ?? '',
            year: year?.toString().trim() ?? '',
            ReportType: reportType?.toString().trim() ?? '',
            ContractorCode: contractorCode?.toString().trim() ?? '',
            Labourtype: labourType?.toString().trim() ?? '',
        });

        const response = await axios.get(
            `${API_BASE_URL}/HR/GetLabourAttData?${queryParams}`,
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    } catch (error) {
        console.error('❌ GetLabourAttData Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};

// 3. Get Labour Monthly Attendance Summary (CC-wise aggregated)
export const getLabourMonthAttData = async (params) => {
    try {
        const { month, year, contractorCode, labourType } = params;

        const queryParams = new URLSearchParams({
            Month: month?.toString().trim() ?? '',
            year: year?.toString().trim() ?? '',
            ContractorCode: contractorCode?.toString().trim() ?? '',
            Labourtype: labourType?.toString().trim() ?? '',
        });

        const response = await axios.get(
            `${API_BASE_URL}/HR/GetLabourMonthAttData?${queryParams}`,
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    } catch (error) {
        console.error('❌ GetLabourMonthAttData Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};

// 4. Get CC list for Labour Attendance Report (CC dropdown)
export const getLabourCCForAttReport = async (params) => {
    try {
        const { month, year, labourType, contractor } = params;

        const queryParams = new URLSearchParams({
            Month: month?.toString().trim() ?? '',
            Year: year?.toString().trim() ?? '',
            LabourType: labourType?.toString().trim() ?? '',
            Contractor: contractor?.toString().trim() ?? '',
        });

        const response = await axios.get(
            `${API_BASE_URL}/HR/GetLabourCCForAttReport?${queryParams}`,
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    } catch (error) {
        console.error('❌ GetLabourCCForAttReport Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};

// 5. Labour autocomplete search (by prefix / ID)
export const getAttLabourById = async (params) => {
    try {
        const { prefix, labourType, contractor } = params;

        const queryParams = new URLSearchParams({
            prefix: prefix?.toString().trim() ?? '',
            LabourType: labourType?.toString().trim() ?? '',
            Contractor: contractor?.toString().trim() ?? '',
        });

        const response = await axios.get(
            `${API_BASE_URL}/HR/GetAttLabourbyId?${queryParams}`,
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    } catch (error) {
        console.error('❌ GetAttLabourbyId Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};
