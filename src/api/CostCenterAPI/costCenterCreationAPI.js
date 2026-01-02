import axios from "axios";

import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// COST CENTER CREATION RELATED APIs
// ==============================================

// 1. Get Cost Center Details
export const getCostCenterDetails = async () => {
    try {
        console.log('📋 Getting Cost Center Details...'); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetCostCenterDetails`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Cost Center Details Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Cost Center Details API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 2. Check if CC Code Already Exists
export const checkCCCodeExist = async (ccCode) => {
    try {
        console.log('🔍 Checking CC Code Existence:', ccCode); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/CheckCCCodeExist?CCCode=${ccCode}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ CC Code Exist Check Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ CC Code Exist Check API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 3. Save New Cost Center
export const saveNewCostCenter = async (costCenterData) => {
    try {
        console.log('💾 Saving New Cost Center...');
        console.log('📊 Payload Summary:', {
            CCCode: costCenterData.CCCode,
            CCName: costCenterData.CCName,
            GroupId: costCenterData.GroupId,
            RegionId: costCenterData.RegionId,
            totalParameters: Object.keys(costCenterData).length
        });
        
        // Log a sample of the data being sent
        console.log('🔍 Sample Data Check:', {
            hasCCCode: !!costCenterData.CCCode,
            hasCCName: !!costCenterData.CCName,
            hasGroupId: !!costCenterData.GroupId,
            hasRegionId: !!costCenterData.RegionId,
            hasCreatedby: !!costCenterData.Createdby
        });
        
        const response = await axios.post(
            `${API_BASE_URL}/Accounts/SaveNewCostCenter`,
            costCenterData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 30000 // 30 second timeout for complex operations
            }
        );
        
        console.log('✅ Cost Center Save Response:', {
            status: response.status,
            data: response.data
        });
        
        return response.data;
        
    } catch (error) {
        console.group('❌ Save Cost Center API Error');
        
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

// 4. Get Cost Center States List
export const getCostCenterStatesList = async () => {
    try {
        console.log('📍 Getting Cost Center States List...'); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/HR/GetCostCenterStatesList`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Cost Center States List Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Cost Center States List API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 5. Get Group Regions
export const getGroupRegions = async () => {
    try {
        console.log('🌍 Getting Group Regions...'); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetGroupRegions`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Group Regions Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Group Regions API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};