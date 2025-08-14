import axios from "axios";

import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// SUPPLIER PO VERIFICATION RELATED APIs
// ==============================================

// 1. Get Verification Supplier PO by Role ID, User ID, and CC Type
export const getVerificationSupplierPO = async (roleId, userId, ccType) => {
    try {
        console.log('📋 Getting Verification Supplier PO for Role ID:', roleId, 'User ID:', userId, 'CC Type:', ccType); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetVerificationSupplierPO?Roleid=${roleId}&Userid=${userId}&CCType=${ccType}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Verification Supplier PO Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Verification Supplier PO API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 2. Get Supplier PO by PO Number and Indent Number
export const getVerificationSupplierPObyPO = async (poNo, indentNo) => {
    try {
        console.log('🔍 Getting Supplier PO for PO No:', poNo, 'Indent No:', indentNo); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetVerificationSupplierPObyPO?PONo=${poNo}&IndentNo=${indentNo}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Supplier PO Data Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Supplier PO Data API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 3. Approve Supplier PO
export const approveSupplierPO = async (approvalData) => {
    try {
        console.log('🎯 Approving Supplier PO...');
        console.log('📊 Payload Summary:', {
            PONo: approvalData.PONo,
            Action: approvalData.Action,
            Roleid: approvalData.Roleid,
            Userid: approvalData.Userid,
            SupplierCode: approvalData.SupplierCode,
            Createdby: approvalData.Createdby,
            totalParameters: Object.keys(approvalData).length
        });
        
        // Log a sample of the data being sent
        console.log('🔍 Sample Data Check:', {
            hasPONo: !!approvalData.PONo,
            hasIndentNo: !!approvalData.IndentNo,
            hasSupplierCode: !!approvalData.SupplierCode,
            hasAction: !!approvalData.Action,
            hasUserid: !!approvalData.Userid,
            amountType: typeof approvalData.Amount,
            poDateType: typeof approvalData.PODate,
            approvalStatusType: typeof approvalData.ApprovalStatus
        });
        
        const response = await axios.put(
            `${API_BASE_URL}/Purchase/ApproveSupplierPO`,
            approvalData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 30000 // 30 second timeout for complex operations
            }
        );
        
        console.log('✅ Supplier PO Approval Response:', {
            status: response.status,
            data: response.data
        });
        
        return response.data;
        
    } catch (error) {
        console.group('❌ Supplier PO Approval API Error');
        
        if (error.response) {
            // Server responded with error status
            console.error('Response Status:', error.response.status);
            console.error('Response Headers:', error.response.headers);
            console.error('Response Data:', error.response.data);
            
            // Log specific error details for 400 errors
            if (error.response.status === 400) {
                console.error('🔍 400 Bad Request Details:', {
                    url: error.config?.url,
                    method: error.config?.method,
                    dataSize: error.config?.data ? error.config.data.length : 0,
                    contentType: error.config?.headers['Content-Type']
                });
            }
            
        } else if (error.request) {
            // Request was made but no response received
            console.error('No Response Received:', error.request);
        } else {
            // Something else happened
            console.error('Request Setup Error:', error.message);
        }
        
        console.error('Full Error Config:', error.config);
        console.groupEnd();
        
        // Return more specific error information
        if (error.response?.data) {
            throw error.response.data;
        } else if (error.response?.status === 400) {
            throw new Error('Bad Request: Invalid data format or missing required fields');
        } else if (error.response?.status === 500) {
            throw new Error('Server Error: Please contact administrator');
        }
        
        throw error;
    }
};