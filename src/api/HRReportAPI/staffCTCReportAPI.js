import axios from "axios";
import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// EMPLOYEE CTC RELATED APIs
// ==============================================

// 1. Get CTC Employee Cost Centers
export const getCTCEmpCostCenter = async () => {
    try {
        console.log('🏢 Getting CTC Employee Cost Centers'); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/HR/GetCTCEmpCostCenter`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ CTC Employee Cost Centers Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ CTC Employee Cost Centers API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 2. Get Employee CTC by Cost Center
export const getEmployeeCTCbyCC = async (ccCode) => {
    try {
        console.log('👥 Getting Employee CTC for Cost Center:', ccCode); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/HR/GETEmployeeCTCbyCC?CCCode=${ccCode}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Employee CTC by Cost Center Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Employee CTC by Cost Center API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 3. Get Employee CTC by Employee Reference Number
export const getEmployeeCTCbyEmp = async (emprefNo) => {
    try {
        console.log('💰 Getting Employee CTC for Employee:', emprefNo); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/HR/GETEmployeeCTCbyEmp?Emprefno=${emprefNo}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Employee CTC by Employee Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Employee CTC by Employee API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 4. Get Employee CTC for Report
export const getEmpCTCforReport = async (params) => {
    try {
        const { empRefNo, revisionNo } = params;
        console.log('📊 Getting Employee CTC for Report:', { empRefNo, revisionNo }); // DEBUG
        
        const queryParams = new URLSearchParams({
            EmpRefNo: empRefNo || '',
            RevisionNo: revisionNo || ''
        });
        
        const response = await axios.get(
            `${API_BASE_URL}/HR/GetEmpCTCforReport?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Employee CTC for Report Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Employee CTC for Report API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 5. Get Auto Complete CTC Employee
export const getAutoCompleteCTCEmp = async (prefix) => {
    try {
        console.log('🔍 Getting Auto Complete CTC Employees for prefix:', prefix); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/HR/GetAutoCompleteCTCEmp?Prefix=${prefix}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Auto Complete CTC Employee Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Auto Complete CTC Employee API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};