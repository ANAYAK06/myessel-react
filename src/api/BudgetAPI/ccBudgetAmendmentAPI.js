import axios from "axios";

import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// CC BUDGET AMENDMENT RELATED APIs
// ==============================================

// 1. Get Approval CC Amend Budget Details (Main Grid)
export const getApprovalCCAmendBudgetDetails = async (roleId, uid) => {
    try {
        console.log('📋 Getting Approval CC Amend Budget Details:', { roleId, uid }); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetApprovalCCAmendBudgetCDetails?Roleid=${roleId}&UID=${uid}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Approval CC Amend Budget Details Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Approval CC Amend Budget Details API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 2. Get Approval CC Amend Budget by ID (Detail View)
export const getApprovalCCAmendBudgetById = async (amendId, amendType) => {
    try {
        console.log('🔍 Getting Approval CC Amend Budget by ID:', { amendId, amendType }); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetApprovalCCAmendBudgetById?AmendId=${amendId}&AmendType=${amendType}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Approval CC Amend Budget by ID Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Approval CC Amend Budget by ID API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 3. Get CC Upload Documents Exists
export const getCCUploadDocsExists = async (ccCode, uid) => {
    try {
        console.log('📄 Checking CC Upload Documents Exists:', { ccCode, uid }); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/Getccuploadocsexists?CCCode=${ccCode}&UID=${uid}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ CC Upload Documents Exists Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ CC Upload Documents Exists API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 4. Approve Cost Center Budget Amendment
export const approveCostCenterBudgetAmend = async (approvalData) => {
    try {
        console.log('🎯 Approving Cost Center Budget Amendment...');
        console.log('📊 Payload Summary:', {
            AmendId: approvalData.AmendId,
            AmendType: approvalData.AmendType,
            Action: approvalData.Action,
            RoleId: approvalData.RoleId,
            Userid: approvalData.Userid,
            Createdby: approvalData.Createdby,
            totalParameters: Object.keys(approvalData).length
        });
        
        // Log a sample of the data being sent
        console.log('🔍 Sample Data Check:', {
            hasAmendId: !!approvalData.AmendId,
            hasAmendType: !!approvalData.AmendType,
            hasAction: !!approvalData.Action,
            hasUserid: !!approvalData.Userid,
            hasRoleId: !!approvalData.RoleId,
            hasCreatedby: !!approvalData.Createdby,
            approvalStatusType: typeof approvalData.ApprovalStatus,
            dateType: typeof approvalData.ApprovalDate
        });
        
        const response = await axios.put(
            `${API_BASE_URL}/Accounts/ApproveCostCenterBudgetAmend`,
            approvalData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 30000 // 30 second timeout for complex operations
            }
        );
        
        console.log('✅ Cost Center Budget Amendment Approval Response:', {
            status: response.status,
            data: response.data
        });
        
        return response.data;
        
    } catch (error) {
        console.group('❌ Cost Center Budget Amendment Approval API Error');
        
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

// 5. Save CC Amend Budget (Creation)
export const saveCCAmendBudget = async (budgetData) => {
    try {
        console.log('💾 Saving CC Amend Budget...');
        console.log('📊 Budget Data Summary:', {
            CCCode: budgetData.CCCode,
            AmendType: budgetData.AmendType,
            Userid: budgetData.Userid,
            Createdby: budgetData.Createdby,
            totalParameters: Object.keys(budgetData).length
        });
        
        const response = await axios.post(
            `${API_BASE_URL}/Accounts/SaveCCAmendBudget`,
            budgetData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 30000
            }
        );
        
        console.log('✅ Save CC Amend Budget Response:', {
            status: response.status,
            data: response.data
        });
        
        return response.data;
        
    } catch (error) {
        console.group('❌ Save CC Amend Budget API Error');
        
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', error.response.data);
        } else if (error.request) {
            console.error('No Response Received:', error.request);
        } else {
            console.error('Request Setup Error:', error.message);
        }
        
        console.groupEnd();
        
        if (error.response?.data) {
            throw error.response.data;
        } else if (error.response?.status === 400) {
            throw new Error('Bad Request: Invalid budget data or missing required fields');
        } else if (error.response?.status === 500) {
            throw new Error('Server Error: Please contact administrator');
        }
        
        throw error;
    }
};

// 6. Update CC Amend Budget (Return/Update/Correction Submission)
export const updateCCAmendBudget = async (updateData) => {
    try {
        console.log('🔄 Updating CC Amend Budget...');
        console.log('📊 Update Data Summary:', {
            AmendId: updateData.AmendId,
            AmendType: updateData.AmendType,
            Action: updateData.Action,
            Userid: updateData.Userid,
            Createdby: updateData.Createdby,
            totalParameters: Object.keys(updateData).length
        });
        
        // Log a sample of the data being sent
        console.log('🔍 Sample Data Check:', {
            hasAmendId: !!updateData.AmendId,
            hasAmendType: !!updateData.AmendType,
            hasAction: !!updateData.Action,
            hasUserid: !!updateData.Userid,
            hasCreatedby: !!updateData.Createdby,
            actionType: typeof updateData.Action
        });
        
        const response = await axios.put(
            `${API_BASE_URL}/Accounts/UpdateCCAmendBudget`,
            updateData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 30000
            }
        );
        
        console.log('✅ Update CC Amend Budget Response:', {
            status: response.status,
            data: response.data
        });
        
        return response.data;
        
    } catch (error) {
        console.group('❌ Update CC Amend Budget API Error');
        
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Headers:', error.response.headers);
            console.error('Response Data:', error.response.data);
            
            if (error.response.status === 400) {
                console.error('🔍 400 Bad Request Details:', {
                    url: error.config?.url,
                    method: error.config?.method,
                    dataSize: error.config?.data ? error.config.data.length : 0,
                    contentType: error.config?.headers['Content-Type']
                });
            }
            
        } else if (error.request) {
            console.error('No Response Received:', error.request);
        } else {
            console.error('Request Setup Error:', error.message);
        }
        
        console.error('Full Error Config:', error.config);
        console.groupEnd();
        
        if (error.response?.data) {
            throw error.response.data;
        } else if (error.response?.status === 400) {
            throw new Error('Bad Request: Invalid update data or missing required fields');
        } else if (error.response?.status === 500) {
            throw new Error('Server Error: Please contact administrator');
        }
        
        throw error;
    }
};