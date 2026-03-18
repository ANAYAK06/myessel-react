import axios from "axios";
import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// CMS PAYMENT RELATED APIs
// ==============================================

// 1. Get CMS Years (GET)
export const getCMSYears = async () => {
    try {
        console.log('📅 Getting CMS Years');
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetCMSYears`);

        const response = await axios.get(
            `${API_BASE_URL}/HR/GetCMSYears`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ CMS Years Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get CMS Years API Error:', error.response || error);
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

// 2. Get CMS Months by Year (GET)
export const getCMSMonthsByYear = async (params) => {
    try {
        const { year, lType, contraCode, eType } = params;
        console.log('📆 Getting CMS Months by Year:', { year, lType, contraCode, eType });

        // Validate required parameters
        if (!year) {
            throw new Error('Year is required');
        }

        // Build query parameters
        const queryParams = new URLSearchParams({
            Year: year,
            LType: lType || '',
            ContraCode: contraCode || '',
            EType: eType || ''
        });

        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetCMSMonthsbyYear?${queryParams}`);

        const response = await axios.get(
            `${API_BASE_URL}/HR/GetCMSMonthsbyYear?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ CMS Months Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get CMS Months API Error:', error.response || error);
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

// 3. Get Cost Centers for CMS Payment (GET)
export const getCCForCMSPayment = async (params) => {
    try {
        const { year, month } = params;
        console.log('🏢 Getting Cost Centers for CMS Payment:', { year, month });

        // Validate required parameters
        if (!year) {
            throw new Error('Year is required');
        }
        if (!month) {
            throw new Error('Month is required');
        }

        // Build query parameters
        const queryParams = new URLSearchParams({
            Year: year,
            Month: month
        });

        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetCCForCMSPayment?${queryParams}`);

        const response = await axios.get(
            `${API_BASE_URL}/HR/GetCCForCMSPayment?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ Cost Centers for CMS Payment Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get Cost Centers for CMS Payment API Error:', error.response || error);
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

// 4. Get Groups for CMS Payment (POST) - FIXED TO SEND ARRAY
export const getGroupForCMSPay = async (params) => {
    try {
        console.log('👥 Getting Groups for CMS Payment:', params);

        // Validate required parameters
        if (!params.year) {
            throw new Error('Year is required');
        }
        if (!params.month) {
            throw new Error('Month is required');
        }
        if (!params.ccCodes || !Array.isArray(params.ccCodes) || params.ccCodes.length === 0) {
            throw new Error('Cost Center Codes array is required');
        }

        // ✅ Send array format - backend will handle the conversion
        const payload = {
            Year: params.year.toString(),
            EffectiveMonth: params.month.toString(),
            SelectedCC: params.ccCodes  // Send as array ["CC-143", "CC-144"]
        };

        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetGroupForCMSPay`);
        console.log('📦 Get Groups Payload:', payload);

        const response = await axios.post(
            `${API_BASE_URL}/HR/GetGroupForCMSPay`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ Groups for CMS Payment Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get Groups for CMS Payment API Error:', error.response || error);
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

// 5. Get Consolidate Numbers for CMS Payment (POST) - FIXED TO SEND ARRAYS
export const getConsolidateNoForCMSPay = async (params) => {
    try {
        console.log('📋 Getting Consolidate Numbers for CMS Payment:', params);

        // Validate required parameters
        if (!params.year) {
            throw new Error('Year is required');
        }
        if (!params.month) {
            throw new Error('Month is required');
        }
        if (!params.ccCodes || !Array.isArray(params.ccCodes) || params.ccCodes.length === 0) {
            throw new Error('Cost Center Codes array is required');
        }
        if (!params.groups || !Array.isArray(params.groups) || params.groups.length === 0) {
            throw new Error('Groups array is required');
        }

        // ✅ Send array format - backend will handle the conversion
        const payload = {
            Year: params.year.toString(),
            EffectiveMonth: params.month.toString(),
            SelectedCC: params.ccCodes,     // Send as array
            SelectedGroup: params.groups    // Send as array
        };

        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetConsolidateNoForCMSPay`);
        console.log('📦 Get Consolidate Numbers Payload:', payload);

        const response = await axios.post(
            `${API_BASE_URL}/HR/GetConsolidateNoForCMSPay`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ Consolidate Numbers for CMS Payment Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get Consolidate Numbers for CMS Payment API Error:', error.response || error);
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

// 6. Get Employees for CMS Data (POST) - FIXED TO SEND ARRAYS
export const getEmpForCMSData = async (params) => {
    try {
        console.log('👤 Getting Employees for CMS Data:', params);

        // Validate required parameters
        if (!params.year) {
            throw new Error('Year is required');
        }
        if (!params.month) {
            throw new Error('Month is required');
        }
        if (!params.ccCodes || !Array.isArray(params.ccCodes) || params.ccCodes.length === 0) {
            throw new Error('Cost Center Codes array is required');
        }
        if (!params.consolidateNos || !Array.isArray(params.consolidateNos) || params.consolidateNos.length === 0) {
            throw new Error('Consolidate Numbers array is required');
        }
        if (!params.groups || !Array.isArray(params.groups) || params.groups.length === 0) {
            throw new Error('Groups array is required');
        }

        // ✅ Send array format - backend will handle the conversion
        const payload = {
            Year: params.year.toString(),
            EffectiveMonth: params.month.toString(),
            SelectedCC: params.ccCodes,              // Send as array
            SelectedConsolidateNo: params.consolidateNos,  // Send as array
            SelectedGroup: params.groups             // Send as array
        };

        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetEmpForCMSData`);
        console.log('📦 Get Employees Payload:', payload);

        const response = await axios.post(
            `${API_BASE_URL}/HR/GetEmpForCMSData`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ Employees for CMS Data Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get Employees for CMS Data API Error:', error.response || error);
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

// 7. Save CMS Employees Data (POST)
export const saveCMSEmployeesData = async (params) => {
    try {
        console.log('💾 Saving CMS Employees Data:', params);

        // Validate required parameters
        if (!params.year) {
            throw new Error('Year is required');
        }
        if (!params.month) {
            throw new Error('Month is required');
        }
        if (!params.empRefNos) {
            throw new Error('Employee Reference Numbers are required');
        }
        if (!params.consolidateNos) {
            throw new Error('Consolidate Numbers are required');
        }
        if (!params.ccCodes) {
            throw new Error('Cost Center Codes are required');
        }
        if (!params.netAmts) {
            throw new Error('Net Amounts are required');
        }
        if (!params.payrollTranNo) {
            throw new Error('Payroll Transaction Number is required');
        }
        if (!params.roleId) {
            throw new Error('Role ID is required');
        }
        if (!params.createdBy) {
            throw new Error('Created By is required');
        }
        if (!params.payDate) {
            throw new Error('Payment Date is required');
        }

        // Format the date
        const formattedDate = params.payDate instanceof Date 
            ? params.payDate.toISOString().split('T')[0]
            : params.payDate;

        // ✅ Use PascalCase to match C# model properties
        const payload = {
            Year: parseInt(params.year),
            EffectiveMonth: parseInt(params.month),
            CMSEmprefnos: params.empRefNos.toString().trim(),
            CMSCosnosidatenos: params.consolidateNos.toString().trim(),
            CMSCCs: params.ccCodes.toString().trim(),
            CMSAmts: params.netAmts.toString().trim(),
            TransactionRefno: params.payrollTranNo.toString().trim(),
            Roleid: parseInt(params.roleId),
            CreatedBy: params.createdBy.toString().trim(),
            PaymentDate: formattedDate
        };

        console.log('🔗 API URL:', `${API_BASE_URL}/HR/SaveCMSEmployeesData`);
        console.log('📦 Save CMS Employees Payload:', payload);

        const response = await axios.post(
            `${API_BASE_URL}/HR/SaveCMSEmployeesData`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ Save CMS Employees Data Response:', response.data);
        
        // Return the response data directly
        return response.data;
    } catch (error) {
        console.error('❌ Save CMS Employees Data API Error:', error.response || error);
        console.error('❌ Error Details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });

        if (error.response?.data) {
            throw error.response.data;
        }
        throw error.message || 'Failed to save CMS Employees Data';
    }
};