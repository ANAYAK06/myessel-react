import axios from "axios";

import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// DCA BUDGET AMENDMENT RELATED APIs
// ==============================================

// 1. Get Budget Assigned CC
export const getBudgetAssignedCC = async () => {
    try {
        console.log('📋 Getting Budget Assigned CC...'); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetBudgetAssignedCC`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Budget Assigned CC Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Budget Assigned CC API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 2. Get DCA Budget Details
export const getDCABudgetDetails = async (ccCode, subtype, year, ccTypeId) => {
    try {
        console.log('📊 Getting DCA Budget Details:', { ccCode, subtype, year, ccTypeId }); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetDCABudgetDetails?CCCode=${ccCode}&Subtype=${subtype}&Year=${year}&CCTypeId=${ccTypeId}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ DCA Budget Details Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ DCA Budget Details API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 3. Get Budget Assigned CC By ID
export const getBudgetAssignedCCById = async (ccCode, year) => {
    try {
        console.log('🔍 Getting Budget Assigned CC by ID:', { ccCode, year }); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetBudgetAssignedCCByID?CCCode=${ccCode}&Year=${year}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Budget Assigned CC by ID Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Budget Assigned CC by ID API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 4. Save Single DCA Amend Budget
export const saveSingleDCAAmendBudget = async (budgetData) => {
    try {
        console.log('💾 Saving Single DCA Amend Budget...');
        console.log('📊 Budget Data Summary:', {
            CCCode: budgetData.CCCode,
            Year: budgetData.Year,
            Userid: budgetData.Userid,
            Createdby: budgetData.Createdby,
            totalParameters: Object.keys(budgetData).length
        });
        
        const response = await axios.post(
            `${API_BASE_URL}/Accounts/SaveSingleDCAAmendBudget`,
            budgetData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 30000
            }
        );
        
        console.log('✅ Save Single DCA Amend Budget Response:', {
            status: response.status,
            data: response.data
        });
        
        return response.data;
        
    } catch (error) {
        console.group('❌ Save Single DCA Amend Budget API Error');
        
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

// 5. Multiple DCA Amend
export const multipleDCAAmend = async (amendData) => {
    try {
        console.log('💾 Processing Multiple DCA Amend...');
        console.log('📊 Amend Data Summary:', {
            recordCount: Array.isArray(amendData) ? amendData.length : 'N/A',
            Userid: amendData.Userid || (Array.isArray(amendData) && amendData[0]?.Userid),
            Createdby: amendData.Createdby || (Array.isArray(amendData) && amendData[0]?.Createdby),
            totalParameters: Object.keys(amendData).length
        });
        
        const response = await axios.post(
            `${API_BASE_URL}/Accounts/MultipleDCAAmend`,
            amendData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 30000
            }
        );
        
        console.log('✅ Multiple DCA Amend Response:', {
            status: response.status,
            data: response.data
        });
        
        return response.data;
        
    } catch (error) {
        console.group('❌ Multiple DCA Amend API Error');
        
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
            throw new Error('Bad Request: Invalid amendment data or missing required fields');
        } else if (error.response?.status === 500) {
            throw new Error('Server Error: Please contact administrator');
        }
        
        throw error;
    }
};

// 6. Get Verification DCA Amends
export const getVerificationDCAAmends = async (roleId, userId) => {
    try {
        console.log('🔍 Getting Verification DCA Amends:', { roleId, userId }); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetVerificationDCAAmends?Roleid=${roleId}&Userid=${userId}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Verification DCA Amends Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Verification DCA Amends API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 7. Get Verify DCA Budget Amend by ID (NEW API)
export const getVerifyDCABudgetAmendById = async (ccCode, fyear, ctype, status) => {
    try {
        console.log('🔍 Getting Verify DCA Budget Amend by ID:', { ccCode, fyear, ctype, status }); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetVerifyDCABudgetAmendbyId?CCCode=${ccCode}&Fyear=${fyear}&Ctype=${ctype}&Status=${status}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Verify DCA Budget Amend by ID Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Verify DCA Budget Amend by ID API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 8. Get DCA Budget Amend Grid
export const getDCABudgetAmendGrid = async (ccCode, fyear, status) => {
    try {
        console.log('📋 Getting DCA Budget Amend Grid:', { ccCode, fyear, status }); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetDCABudgetAmendgrid?CCCode=${ccCode}&Fyear=${fyear}&Status=${status}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ DCA Budget Amend Grid Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ DCA Budget Amend Grid API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 9. Update Approval DCA Budget Amend (Return Handler)
export const updateApprovalDCABudgetAmend = async (updateData) => {
    try {
        console.log('🔄 Updating Approval DCA Budget Amend (Return)...');
        console.log('📊 Update Data Summary:', {
            AmendId: updateData.AmendId,
            Action: updateData.Action,
            Userid: updateData.Userid,
            Createdby: updateData.Createdby,
            totalParameters: Object.keys(updateData).length
        });
        
        // Log a sample of the data being sent
        console.log('🔍 Sample Data Check:', {
            hasAmendId: !!updateData.AmendId,
            hasAction: !!updateData.Action,
            hasUserid: !!updateData.Userid,
            hasCreatedby: !!updateData.Createdby,
            actionType: typeof updateData.Action
        });
        
        const response = await axios.put(
            `${API_BASE_URL}/Accounts/UpdateApprovalDCABudgetAmend`,
            updateData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 30000
            }
        );
        
        console.log('✅ Update Approval DCA Budget Amend Response:', {
            status: response.status,
            data: response.data
        });
        
        return response.data;
        
    } catch (error) {
        console.group('❌ Update Approval DCA Budget Amend API Error');
        
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

// 10. Approve DCA Budget Amend
export const approveDCABudgetAmend = async (approvalData) => {
    try {
        console.log('🎯 Approving DCA Budget Amendment...');
        console.log('📊 Payload Summary:', {
            AmendId: approvalData.AmendId,
            Action: approvalData.Action,
            RoleId: approvalData.RoleId,
            Userid: approvalData.Userid,
            Createdby: approvalData.Createdby,
            totalParameters: Object.keys(approvalData).length
        });
        
        // Log a sample of the data being sent
        console.log('🔍 Sample Data Check:', {
            hasAmendId: !!approvalData.AmendId,
            hasAction: !!approvalData.Action,
            hasUserid: !!approvalData.Userid,
            hasRoleId: !!approvalData.RoleId,
            hasCreatedby: !!approvalData.Createdby,
            approvalStatusType: typeof approvalData.ApprovalStatus,
            dateType: typeof approvalData.ApprovalDate
        });
        
        const response = await axios.put(
            `${API_BASE_URL}/Accounts/ApproveDCABudgetAmend`,
            approvalData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 30000 // 30 second timeout for complex operations
            }
        );
        
        console.log('✅ DCA Budget Amendment Approval Response:', {
            status: response.status,
            data: response.data
        });
        
        return response.data;
        
    } catch (error) {
        console.group('❌ DCA Budget Amendment Approval API Error');
        
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