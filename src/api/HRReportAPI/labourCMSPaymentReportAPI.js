import axios from "axios";
import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// LABOUR CMS PAYMENT REPORT RELATED APIs
// (Labour salary paid through Bank Report)
// ==============================================

// 1. Get CMS Years for Labour (filtered by Labour Type / Contractor)
export const getLBCMSYears = async (params) => {
    try {
        const { labourType, contractor } = params;

        const queryParams = new URLSearchParams({
            LabourType: labourType || '',
            Contractor: contractor || ''
        });

        const response = await axios.get(
            `${API_BASE_URL}/HR/GetLBCMSYears?${queryParams}`,
            { headers: { 'Content-Type': 'application/json' } }
        );

        return response.data;
    } catch (error) {
        console.error('❌ GetLBCMSYears API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};

// 2. Get Contractors list (Own Labour / Contractor dropdown)
export const getSalaryContractors = async () => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/HR/GetSalaryContractors`,
            { headers: { 'Content-Type': 'application/json' } }
        );

        return response.data;
    } catch (error) {
        console.error('❌ GetSalaryContractors API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};

// 3. Get CMS Months by Year (Labour)
export const getCMSMonthsByYear = async (params) => {
    try {
        const { year, lType, contraCode } = params;

        const queryParams = new URLSearchParams({
            Year: year || '',
            LType: lType || '',
            ContraCode: contraCode || '',
            EType: 'Labour'
        });

        const response = await axios.get(
            `${API_BASE_URL}/HR/GetCMSMonthsbyYear?${queryParams}`,
            { headers: { 'Content-Type': 'application/json' } }
        );

        return response.data;
    } catch (error) {
        console.error('❌ GetCMSMonthsbyYear (Labour) API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};

// 4. Get CMS Paid Labour list (Employee view dropdown)
export const getCMSPaidLabour = async (params) => {
    try {
        const { year, month, lType, contraCode } = params;

        const queryParams = new URLSearchParams({
            Year: year || '',
            Month: month || '',
            LType: lType || '',
            ContraCode: contraCode || '',
            EType: 'Labour'
        });

        const response = await axios.get(
            `${API_BASE_URL}/HR/GetCMSPaidEmployee?${queryParams}`,
            { headers: { 'Content-Type': 'application/json' } }
        );

        return response.data;
    } catch (error) {
        console.error('❌ GetCMSPaidEmployee (Labour) API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};

// 5. Get CMS Paid Labour by Cost Centre (Cost Centre view dropdown)
export const getCMSPaidLabourByCC = async (params) => {
    try {
        const { year, month, ccCode, lType, contraCode } = params;

        const queryParams = new URLSearchParams({
            Year: year || '',
            Month: month || '',
            CCCode: ccCode || '',
            LType: lType || '',
            ContraCode: contraCode || '',
            EType: 'Labour'
        });

        const response = await axios.get(
            `${API_BASE_URL}/HR/GetCMSPaidEmployeebyCC?${queryParams}`,
            { headers: { 'Content-Type': 'application/json' } }
        );

        return response.data;
    } catch (error) {
        console.error('❌ GetCMSPaidEmployeebyCC (Labour) API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};

// 6. Get CMS Paid Cost Centres by Month (Labour)
export const getCMSPaidCCbyMonth = async (params) => {
    try {
        const { month, year, lType, contraCode } = params;

        const queryParams = new URLSearchParams({
            Month: month || '',
            Year: year || '',
            LType: lType || '',
            ContraCode: contraCode || '',
            EType: 'Labour'
        });

        const response = await axios.get(
            `${API_BASE_URL}/HR/GetCMSPaidCCbyMonth?${queryParams}`,
            { headers: { 'Content-Type': 'application/json' } }
        );

        return response.data;
    } catch (error) {
        console.error('❌ GetCMSPaidCCbyMonth (Labour) API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};

// 7. Get CMS Pay Report Labour Data (main report data)
export const getCMSPayReportLBData = async (params) => {
    try {
        const { year, month, labourId, ccCode, lType, contraCode } = params;

        const queryParams = new URLSearchParams({
            Year: year || '',
            Month: month || '',
            LabourId: labourId || '',
            CCCode: ccCode || '',
            LType: lType || '',
            ContraCode: contraCode || ''
        });

        const response = await axios.get(
            `${API_BASE_URL}/HR/CMSPayReportLBData?${queryParams}`,
            { headers: { 'Content-Type': 'application/json' } }
        );

        return response.data;
    } catch (error) {
        console.error('❌ CMSPayReportLBData API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};
