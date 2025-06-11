// store/slices/budgetSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as budgetAPI from '../../api/businessinfoAPI/budgetAPI';

// Cost Center Budget Operations Async Thunks
// ------------------------------------------

export const fetchCCFinancialYear = createAsyncThunk(
    'budget/fetchCCFinancialYear',
    async (_, { rejectWithValue }) => {
        try {
            console.log('🔍 Fetching CC financial year');
            const response = await budgetAPI.getCCFinancialYear();
            console.log('✅ CC financial year data:', response);
            
            if (response && (response.IsSuccessful === true || Array.isArray(response) || response.Data)) {
                return response.Data || response;
            } else {
                const errorMessage = response?.Message || 'No CC financial year data available';
                return rejectWithValue(errorMessage);
            }
        } catch (error) {
            console.error('❌ CC financial year error:', error);
            return rejectWithValue(error.Message || error.message || 'Failed to fetch CC financial year');
        }
    }
);

export const saveCCAssignedBudget = createAsyncThunk(
    'budget/saveCCAssignedBudget',
    async (budgetData, { rejectWithValue }) => {
        try {
            console.log('🔍 Saving CC assigned budget, data:', budgetData);
            const response = await budgetAPI.saveCCAssignedBudget(budgetData);
            console.log('✅ Save CC assigned budget response:', response);
            
            if (response && (response.IsSuccessful === true || response.success)) {
                return response.Data || { success: true, message: response.Message };
            } else {
                const errorMessage = response?.Message || 'Failed to save CC assigned budget';
                return rejectWithValue(errorMessage);
            }
        } catch (error) {
            console.error('❌ Save CC assigned budget error:', error);
            return rejectWithValue(error.Message || error.message || 'Failed to save CC assigned budget');
        }
    }
);

export const fetchCCDetails = createAsyncThunk(
    'budget/fetchCCDetails',
    async ({ roleid, fnYear, ccSubType, ccType }, { rejectWithValue }) => {
        try {
            console.log('🔍 Fetching CC details, params:', { roleid, fnYear, ccSubType, ccType });
            const response = await budgetAPI.getCCDetails(roleid, fnYear, ccSubType, ccType);
            console.log('✅ CC details data:', response);
            
            if (response && (response.IsSuccessful === true || Array.isArray(response) || response.Data)) {
                return response.Data || response;
            } else {
                const errorMessage = response?.Message || 'No CC details data available';
                return rejectWithValue(errorMessage);
            }
        } catch (error) {
            console.error('❌ CC details error:', error);
            return rejectWithValue(error.Message || error.message || 'Failed to fetch CC details');
        }
    }
);

export const fetchBudgetCostCenters = createAsyncThunk(
    'budget/fetchBudgetCostCenters',
    async (_, { rejectWithValue }) => {
        try {
            console.log('🔍 Fetching budget cost centers');
            const response = await budgetAPI.getBudgetCostCenters();
            console.log('✅ Budget cost centers data:', response);
            
            if (response && (response.IsSuccessful === true || Array.isArray(response) || response.Data)) {
                return response.Data || response;
            } else {
                const errorMessage = response?.Message || 'No budget cost centers data available';
                return rejectWithValue(errorMessage);
            }
        } catch (error) {
            console.error('❌ Budget cost centers error:', error);
            return rejectWithValue(error.Message || error.message || 'Failed to fetch budget cost centers');
        }
    }
);

export const fetchBudgetAssignedCC = createAsyncThunk(
    'budget/fetchBudgetAssignedCC',
    async (_, { rejectWithValue }) => {
        try {
            console.log('🔍 Fetching budget assigned CC');
            const response = await budgetAPI.getBudgetAssignedCC();
            console.log('✅ Budget assigned CC data:', response);
            
            if (response && (response.IsSuccessful === true || Array.isArray(response) || response.Data)) {
                return response.Data || response;
            } else {
                const errorMessage = response?.Message || 'No budget assigned CC data available';
                return rejectWithValue(errorMessage);
            }
        } catch (error) {
            console.error('❌ Budget assigned CC error:', error);
            return rejectWithValue(error.Message || error.message || 'Failed to fetch budget assigned CC');
        }
    }
);

export const fetchBudgetAssignedCCByID = createAsyncThunk(
    'budget/fetchBudgetAssignedCCByID',
    async ({ ccCode, year }, { rejectWithValue }) => {
        try {
            console.log('🔍 Fetching budget assigned CC by ID, params:', { ccCode, year });
            const response = await budgetAPI.getBudgetAssignedCCByID(ccCode, year);
            console.log('✅ Budget assigned CC by ID data:', response);
            
            if (response && (response.IsSuccessful === true || response.Data)) {
                return response.Data || response;
            } else {
                const errorMessage = response?.Message || 'No budget assigned CC by ID data available';
                return rejectWithValue(errorMessage);
            }
        } catch (error) {
            console.error('❌ Budget assigned CC by ID error:', error);
            return rejectWithValue(error.Message || error.message || 'Failed to fetch budget assigned CC by ID');
        }
    }
);

export const fetchBudgetAssignedCCByCCType = createAsyncThunk(
    'budget/fetchBudgetAssignedCCByCCType',
    async ({ cctypeId, subType, fnYear }, { rejectWithValue }) => {
        try {
            console.log('🔍 Fetching budget assigned CC by CC type, params:', { cctypeId, subType, fnYear });
            const response = await budgetAPI.getBudgetAssignedCCByCCType(cctypeId, subType, fnYear);
            console.log('✅ Budget assigned CC by CC type data:', response);
            
            if (response && (response.IsSuccessful === true || Array.isArray(response) || response.Data)) {
                return response.Data || response;
            } else {
                const errorMessage = response?.Message || 'No budget assigned CC by CC type data available';
                return rejectWithValue(errorMessage);
            }
        } catch (error) {
            console.error('❌ Budget assigned CC by CC type error:', error);
            return rejectWithValue(error.Message || error.message || 'Failed to fetch budget assigned CC by CC type');
        }
    }
);

// DCA Budget Operations Async Thunks
// ----------------------------------

export const fetchBudgetDCADetails = createAsyncThunk(
    'budget/fetchBudgetDCADetails',
    async (ccTypeID, { rejectWithValue }) => {
        try {
            console.log('🔍 Fetching budget DCA details, ccTypeID:', ccTypeID);
            const response = await budgetAPI.getBudgetDCADetails(ccTypeID);
            console.log('✅ Budget DCA details data:', response);
            
            if (response && (response.IsSuccessful === true || Array.isArray(response) || response.Data)) {
                return response.Data || response;
            } else {
                const errorMessage = response?.Message || 'No budget DCA details data available';
                return rejectWithValue(errorMessage);
            }
        } catch (error) {
            console.error('❌ Budget DCA details error:', error);
            return rejectWithValue(error.Message || error.message || 'Failed to fetch budget DCA details');
        }
    }
);

export const saveDCAAssignedBudget = createAsyncThunk(
    'budget/saveDCAAssignedBudget',
    async (budgetData, { rejectWithValue }) => {
        try {
            console.log('🔍 Saving DCA assigned budget, data:', budgetData);
            const response = await budgetAPI.saveDCAAssignedBudget(budgetData);
            console.log('✅ Save DCA assigned budget response:', response);
            
            if (response && (response.IsSuccessful === true || response.success)) {
                return response.Data || { success: true, message: response.Message };
            } else {
                const errorMessage = response?.Message || 'Failed to save DCA assigned budget';
                return rejectWithValue(errorMessage);
            }
        } catch (error) {
            console.error('❌ Save DCA assigned budget error:', error);
            return rejectWithValue(error.Message || error.message || 'Failed to save DCA assigned budget');
        }
    }
);

export const updateDCAAssignedBudget = createAsyncThunk(
    'budget/updateDCAAssignedBudget',
    async (budgetData, { rejectWithValue }) => {
        try {
            console.log('🔍 Updating DCA assigned budget, data:', budgetData);
            const response = await budgetAPI.updateDCAAssignedBudget(budgetData);
            console.log('✅ Update DCA assigned budget response:', response);
            
            if (response && (response.IsSuccessful === true || response.success)) {
                return response.Data || { success: true, message: response.Message };
            } else {
                const errorMessage = response?.Message || 'Failed to update DCA assigned budget';
                return rejectWithValue(errorMessage);
            }
        } catch (error) {
            console.error('❌ Update DCA assigned budget error:', error);
            return rejectWithValue(error.Message || error.message || 'Failed to update DCA assigned budget');
        }
    }
);

export const fetchDCABudgetDetails = createAsyncThunk(
    'budget/fetchDCABudgetDetails',
    async ({ ccCode, subtype, year, ccTypeId }, { rejectWithValue }) => {
        try {
            console.log('🔍 Fetching DCA budget details, params:', { ccCode, subtype, year, ccTypeId });
            const response = await budgetAPI.getDCABudgetDetails(ccCode, subtype, year, ccTypeId);
            console.log('✅ DCA budget details data:', response);
            
            if (response && (response.IsSuccessful === true || Array.isArray(response) || response.Data)) {
                return response.Data || response;
            } else {
                const errorMessage = response?.Message || 'No DCA budget details data available';
                return rejectWithValue(errorMessage);
            }
        } catch (error) {
            console.error('❌ DCA budget details error:', error);
            return rejectWithValue(error.Message || error.message || 'Failed to fetch DCA budget details');
        }
    }
);

// Budget Amendment Operations Async Thunks
// ----------------------------------------

export const saveCCAmendBudget = createAsyncThunk(
    'budget/saveCCAmendBudget',
    async (amendData, { rejectWithValue }) => {
        try {
            console.log('🔍 Saving CC amend budget, data:', amendData);
            const response = await budgetAPI.saveCCAmendBudget(amendData);
            console.log('✅ Save CC amend budget response:', response);
            
            if (response && (response.IsSuccessful === true || response.success)) {
                return response.Data || { success: true, message: response.Message };
            } else {
                const errorMessage = response?.Message || 'Failed to save CC amend budget';
                return rejectWithValue(errorMessage);
            }
        } catch (error) {
            console.error('❌ Save CC amend budget error:', error);
            return rejectWithValue(error.Message || error.message || 'Failed to save CC amend budget');
        }
    }
);

export const amendDCABudgetTemp = createAsyncThunk(
    'budget/amendDCABudgetTemp',
    async (amendData, { rejectWithValue }) => {
        try {
            console.log('🔍 Amending DCA budget temp, data:', amendData);
            const response = await budgetAPI.amendDCABudgetTemp(amendData);
            console.log('✅ Amend DCA budget temp response:', response);
            
            if (response && (response.IsSuccessful === true || response.success)) {
                return response.Data || { success: true, message: response.Message };
            } else {
                const errorMessage = response?.Message || 'Failed to amend DCA budget temp';
                return rejectWithValue(errorMessage);
            }
        } catch (error) {
            console.error('❌ Amend DCA budget temp error:', error);
            return rejectWithValue(error.Message || error.message || 'Failed to amend DCA budget temp');
        }
    }
);

export const saveSingleDCAAmendBudget = createAsyncThunk(
    'budget/saveSingleDCAAmendBudget',
    async (amendData, { rejectWithValue }) => {
        try {
            console.log('🔍 Saving single DCA amend budget, data:', amendData);
            const response = await budgetAPI.saveSingleDCAAmendBudget(amendData);
            console.log('✅ Save single DCA amend budget response:', response);
            
            if (response && (response.IsSuccessful === true || response.success)) {
                return response.Data || { success: true, message: response.Message };
            } else {
                const errorMessage = response?.Message || 'Failed to save single DCA amend budget';
                return rejectWithValue(errorMessage);
            }
        } catch (error) {
            console.error('❌ Save single DCA amend budget error:', error);
            return rejectWithValue(error.Message || error.message || 'Failed to save single DCA amend budget');
        }
    }
);

export const fetchAmendedDCA = createAsyncThunk(
    'budget/fetchAmendedDCA',
    async (ccCode, { rejectWithValue }) => {
        try {
            console.log('🔍 Fetching amended DCA, ccCode:', ccCode);
            const response = await budgetAPI.getAmendedDCA(ccCode);
            console.log('✅ Amended DCA data:', response);
            
            if (response && (response.IsSuccessful === true || Array.isArray(response) || response.Data)) {
                return response.Data || response;
            } else {
                const errorMessage = response?.Message || 'No amended DCA data available';
                return rejectWithValue(errorMessage);
            }
        } catch (error) {
            console.error('❌ Amended DCA error:', error);
            return rejectWithValue(error.Message || error.message || 'Failed to fetch amended DCA');
        }
    }
);

export const deleteDCAAmendBudget = createAsyncThunk(
    'budget/deleteDCAAmendBudget',
    async (amendData, { rejectWithValue }) => {
        try {
            console.log('🔍 Deleting DCA amend budget, data:', amendData);
            const response = await budgetAPI.deleteDCAAmendBudget(amendData);
            console.log('✅ Delete DCA amend budget response:', response);
            
            if (response && (response.IsSuccessful === true || response.success)) {
                return response.Data || { success: true, message: response.Message };
            } else {
                const errorMessage = response?.Message || 'Failed to delete DCA amend budget';
                return rejectWithValue(errorMessage);
            }
        } catch (error) {
            console.error('❌ Delete DCA amend budget error:', error);
            return rejectWithValue(error.Message || error.message || 'Failed to delete DCA amend budget');
        }
    }
);

export const multipleDCAAmend = createAsyncThunk(
    'budget/multipleDCAAmend',
    async (amendData, { rejectWithValue }) => {
        try {
            console.log('🔍 Multiple DCA amend, data:', amendData);
            const response = await budgetAPI.multipleDCAAmend(amendData);
            console.log('✅ Multiple DCA amend response:', response);
            
            if (response && (response.IsSuccessful === true || response.success)) {
                return response.Data || { success: true, message: response.Message };
            } else {
                const errorMessage = response?.Message || 'Failed to perform multiple DCA amend';
                return rejectWithValue(errorMessage);
            }
        } catch (error) {
            console.error('❌ Multiple DCA amend error:', error);
            return rejectWithValue(error.Message || error.message || 'Failed to perform multiple DCA amend');
        }
    }
);

export const fetchUnAmendedDCAByCCID = createAsyncThunk(
    'budget/fetchUnAmendedDCAByCCID',
    async ({ ccCode, cctype, subType, fnYear }, { rejectWithValue }) => {
        try {
            console.log('🔍 Fetching unamended DCA by CCID, params:', { ccCode, cctype, subType, fnYear });
            const response = await budgetAPI.getUnAmendedDCAByCCID(ccCode, cctype, subType, fnYear);
            console.log('✅ Unamended DCA by CCID data:', response);
            
            if (response && (response.IsSuccessful === true || Array.isArray(response) || response.Data)) {
                return response.Data || response;
            } else {
                const errorMessage = response?.Message || 'No unamended DCA by CCID data available';
                return rejectWithValue(errorMessage);
            }
        } catch (error) {
            console.error('❌ Unamended DCA by CCID error:', error);
            return rejectWithValue(error.Message || error.message || 'Failed to fetch unamended DCA by CCID');
        }
    }
);

export const assignDCABudgetFromAmendment = createAsyncThunk(
    'budget/assignDCABudgetFromAmendment',
    async (assignData, { rejectWithValue }) => {
        try {
            console.log('🔍 Assigning DCA budget from amendment, data:', assignData);
            const response = await budgetAPI.assignDCABudgetFromAmendment(assignData);
            console.log('✅ Assign DCA budget from amendment response:', response);
            
            if (response && (response.IsSuccessful === true || response.success)) {
                return response.Data || { success: true, message: response.Message };
            } else {
                const errorMessage = response?.Message || 'Failed to assign DCA budget from amendment';
                return rejectWithValue(errorMessage);
            }
        } catch (error) {
            console.error('❌ Assign DCA budget from amendment error:', error);
            return rejectWithValue(error.Message || error.message || 'Failed to assign DCA budget from amendment');
        }
    }
);

// Budget Verification Operations Async Thunks
// -------------------------------------------

export const fetchVerificationCCBudget = createAsyncThunk(
    'budget/fetchVerificationCCBudget',
    async ({ roleid, uid }, { rejectWithValue }) => {
        try {
            console.log('🔍 Fetching verification CC budget, params:', { roleid, uid });
            const response = await budgetAPI.getVerificationCCBudget(roleid, uid);
            console.log('✅ Verification CC budget data:', response);
            
            if (response && (response.IsSuccessful === true || Array.isArray(response) || response.Data)) {
                return response.Data || response;
            } else {
                const errorMessage = response?.Message || 'No verification CC budget data available';
                return rejectWithValue(errorMessage);
            }
        } catch (error) {
            console.error('❌ Verification CC budget error:', error);
            return rejectWithValue(error.Message || error.message || 'Failed to fetch verification CC budget');
        }
    }
);

export const fetchCCBudgetById = createAsyncThunk(
    'budget/fetchCCBudgetById',
    async (budgetId, { rejectWithValue }) => {
        try {
            console.log('🔍 Fetching CC budget by ID, budgetId:', budgetId);
            const response = await budgetAPI.getCCBudgetById(budgetId);
            console.log('✅ CC budget by ID data:', response);
            
            if (response && (response.IsSuccessful === true || response.Data)) {
                return response.Data || response;
            } else {
                const errorMessage = response?.Message || 'No CC budget by ID data available';
                return rejectWithValue(errorMessage);
            }
        } catch (error) {
            console.error('❌ CC budget by ID error:', error);
            return rejectWithValue(error.Message || error.message || 'Failed to fetch CC budget by ID');
        }
    }
);

export const fetchApprovalCBudgetById = createAsyncThunk(
    'budget/fetchApprovalCBudgetById',
    async (budgetId, { rejectWithValue }) => {
        try {
            console.log('🔍 Fetching approval C budget by ID, budgetId:', budgetId);
            const response = await budgetAPI.getApprovalCBudgetById(budgetId);
            console.log('✅ Approval C budget by ID data:', response);
            
            if (response && (response.IsSuccessful === true || response.Data)) {
                return response.Data || response;
            } else {
                const errorMessage = response?.Message || 'No approval C budget by ID data available';
                return rejectWithValue(errorMessage);
            }
        } catch (error) {
            console.error('❌ Approval C budget by ID error:', error);
            return rejectWithValue(error.Message || error.message || 'Failed to fetch approval C budget by ID');
        }
    }
);

export const approveCostCenterBudget = createAsyncThunk(
    'budget/approveCostCenterBudget',
    async (budgetData, { rejectWithValue }) => {
        try {
            console.log('🔍 Approving cost center budget, data:', budgetData);
            const response = await budgetAPI.approveCostCenterBudget(budgetData);
            console.log('✅ Approve cost center budget response:', response);
            
            if (response && (response.IsSuccessful === true || response.success)) {
                return response.Data || { success: true, message: response.Message };
            } else {
                const errorMessage = response?.Message || 'Failed to approve cost center budget';
                return rejectWithValue(errorMessage);
            }
        } catch (error) {
            console.error('❌ Approve cost center budget error:', error);
            return rejectWithValue(error.Message || error.message || 'Failed to approve cost center budget');
        }
    }
);

export const updateCCBudget = createAsyncThunk(
    'budget/updateCCBudget',
    async (budgetData, { rejectWithValue }) => {
        try {
            console.log('🔍 Updating CC budget, data:', budgetData);
            const response = await budgetAPI.updateCCBudget(budgetData);
            console.log('✅ Update CC budget response:', response);
            
            if (response && (response.IsSuccessful === true || response.success)) {
                return response.Data || { success: true, message: response.Message };
            } else {
                const errorMessage = response?.Message || 'Failed to update CC budget';
                return rejectWithValue(errorMessage);
            }
        } catch (error) {
            console.error('❌ Update CC budget error:', error);
            return rejectWithValue(error.Message || error.message || 'Failed to update CC budget');
        }
    }
);

// Budget Check Operations Async Thunks
// ------------------------------------

export const checkBudgetForSupplierPO = createAsyncThunk(
    'budget/checkBudgetForSupplierPO',
    async (budgetData, { rejectWithValue }) => {
        try {
            console.log('🔍 Checking budget for supplier PO, data:', budgetData);
            const response = await budgetAPI.checkBudgetForSupplierPO(budgetData);
            console.log('✅ Check budget for supplier PO response:', response);
            
            if (response && (response.IsSuccessful === true || response.Data)) {
                return response.Data || response;
            } else {
                const errorMessage = response?.Message || 'Budget check failed';
                return rejectWithValue(errorMessage);
            }
        } catch (error) {
            console.error('❌ Check budget for supplier PO error:', error);
            return rejectWithValue(error.Message || error.message || 'Failed to check budget for supplier PO');
        }
    }
);

// Budget Reports Operations Async Thunks
// --------------------------------------

export const fetchCCBudgetDetailsByCodeForReport = createAsyncThunk(
    'budget/fetchCCBudgetDetailsByCodeForReport',
    async ({ ccCode, year }, { rejectWithValue }) => {
        try {
            console.log('🔍 Fetching CC budget details by code for report, params:', { ccCode, year });
            const response = await budgetAPI.getCCBudgetDetailsByCodeForReport(ccCode, year);
            console.log('✅ CC budget details by code for report data:', response);
            
            if (response && (response.IsSuccessful === true || Array.isArray(response) || response.Data)) {
                return response.Data || response;
            } else {
                const errorMessage = response?.Message || 'No CC budget details for report data available';
                return rejectWithValue(errorMessage);
            }
        } catch (error) {
            console.error('❌ CC budget details by code for report error:', error);
            return rejectWithValue(error.Message || error.message || 'Failed to fetch CC budget details by code for report');
        }
    }
);

export const fetchDCABudgetDetailsForReport = createAsyncThunk(
    'budget/fetchDCABudgetDetailsForReport',
    async ({ ccCode, year }, { rejectWithValue }) => {
        try {
            console.log('🔍 Fetching DCA budget details for report, params:', { ccCode, year });
            const response = await budgetAPI.getDCABudgetDetailsForReport(ccCode, year);
            console.log('✅ DCA budget details for report data:', response);
            
            if (response && (response.IsSuccessful === true || Array.isArray(response) || response.Data)) {
                return response.Data || response;
            } else {
                const errorMessage = response?.Message || 'No DCA budget details for report data available';
                return rejectWithValue(errorMessage);
            }
        } catch (error) {
            console.error('❌ DCA budget details for report error:', error);
            return rejectWithValue(error.Message || error.message || 'Failed to fetch DCA budget details for report');
        }
    }
);

export const fetchDCABudgetDetailedSummary = createAsyncThunk(
    'budget/fetchDCABudgetDetailedSummary',
    async ({ role, ccType, ccCode, dcaCode, year, year1 }, { rejectWithValue }) => {
        try {
            console.log('🔍 Fetching DCA budget detailed summary, params:', { role, ccType, ccCode, dcaCode, year, year1 });
            const response = await budgetAPI.getDCABudgetDetailedSummary(role, ccType, ccCode, dcaCode, year, year1);
            console.log('✅ DCA budget detailed summary data:', response);
            
            if (response && (response.IsSuccessful === true || Array.isArray(response) || response.Data)) {
                return response.Data || response;
            } else {
                const errorMessage = response?.Message || 'No DCA budget detailed summary data available';
                return rejectWithValue(errorMessage);
            }
        } catch (error) {
            console.error('❌ DCA budget detailed summary error:', error);
            return rejectWithValue(error.Message || error.message || 'Failed to fetch DCA budget detailed summary');
        }
    }
);

export const fetchCostCenterBudgetReportTypes = createAsyncThunk(
    'budget/fetchCostCenterBudgetReportTypes',
    async (roleid, { rejectWithValue }) => {
        try {
            console.log('🔍 Fetching cost center budget report types, roleid:', roleid);
            const response = await budgetAPI.getCostCenterBudgetReportTypes(roleid);
            console.log('✅ Cost center budget report types data:', response);
            
            if (response && (response.IsSuccessful === true || Array.isArray(response) || response.Data)) {
                return response.Data || response;
            } else {
                const errorMessage = response?.Message || 'No cost center budget report types data available';
                return rejectWithValue(errorMessage);
            }
        } catch (error) {
            console.error('❌ Cost center budget report types error:', error);
            return rejectWithValue(error.Message || error.message || 'Failed to fetch cost center budget report types');
        }
    }
);

// Client PO Budget Operations Async Thunks
// ----------------------------------------

export const fetchClientPOBudgetCostCenters = createAsyncThunk(
    'budget/fetchClientPOBudgetCostCenters',
    async (_, { rejectWithValue }) => {
        try {
            console.log('🔍 Fetching client PO budget cost centers');
            const response = await budgetAPI.getClientPOBudgetCostCenters();
            console.log('✅ Client PO budget cost centers data:', response);
            
            if (response && (response.IsSuccessful === true || Array.isArray(response) || response.Data)) {
                return response.Data || response;
            } else {
                const errorMessage = response?.Message || 'No client PO budget cost centers data available';
                return rejectWithValue(errorMessage);
            }
        } catch (error) {
            console.error('❌ Client PO budget cost centers error:', error);
            return rejectWithValue(error.Message || error.message || 'Failed to fetch client PO budget cost centers');
        }
    }
);

export const saveClientPOPercentDetails = createAsyncThunk(
    'budget/saveClientPOPercentDetails',
    async (percentData, { rejectWithValue }) => {
        try {
            console.log('🔍 Saving CC client PO percent details, data:', percentData);
            const response = await budgetAPI.saveCCClientPOPercentDetails(percentData);
            console.log('✅ Save CC client PO percent details response:', response);
            
            if (response && (response.IsSuccessful === true || response.success)) {
                return response.Data || { success: true, message: response.Message };
            } else {
                const errorMessage = response?.Message || 'Failed to save CC client PO percent details';
                return rejectWithValue(errorMessage);
            }
        } catch (error) {
            console.error('❌ Save CC client PO percent details error:', error);
            return rejectWithValue(error.Message || error.message || 'Failed to save CC client PO percent details');
        }
    }
);

// Other Budget Operations Async Thunks
// ------------------------------------

export const fetchOtherBudgetCCs = createAsyncThunk(
    'budget/fetchOtherBudgetCCs',
    async (ccCode, { rejectWithValue }) => {
        try {
            console.log('🔍 Fetching other budget CCs, ccCode:', ccCode);
            const response = await budgetAPI.getOtherBudgetCCs(ccCode);
            console.log('✅ Other budget CCs data:', response);
            
            if (response && (response.IsSuccessful === true || Array.isArray(response) || response.Data)) {
                return response.Data || response;
            } else {
                const errorMessage = response?.Message || 'No other budget CCs data available';
                return rejectWithValue(errorMessage);
            }
        } catch (error) {
            console.error('❌ Other budget CCs error:', error);
            return rejectWithValue(error.Message || error.message || 'Failed to fetch other budget CCs');
        }
    }
);

export const saveBudgetExcelRequest = createAsyncThunk(
    'budget/saveBudgetExcelRequest',
    async (excelData, { rejectWithValue }) => {
        try {
            console.log('🔍 Saving budget excel request, data:', excelData);
            const response = await budgetAPI.saveBudgetExcelRequest(excelData);
            console.log('✅ Save budget excel request response:', response);
            
            if (response && (response.IsSuccessful === true || response.success)) {
                return response.Data || { success: true, message: response.Message };
            } else {
                const errorMessage = response?.Message || 'Failed to save budget excel request';
                return rejectWithValue(errorMessage);
            }
        } catch (error) {
            console.error('❌ Save budget excel request error:', error);
            return rejectWithValue(error.Message || error.message || 'Failed to save budget excel request');
        }
    }
);

const initialState = {
    // Data states
    ccFinancialYear: [],
    ccDetails: [],
    budgetCostCenters: [],
    budgetAssignedCC: [],
    budgetAssignedCCByID: null,
    budgetAssignedCCByCCType: [],
    
    // DCA Budget Data
    budgetDCADetails: [],
    dcaBudgetDetails: [],
    
    // Amendment Data
    amendedDCA: [],
    unAmendedDCAByCCID: [],
    
    // Verification Data
    verificationCCBudget: [],
    ccBudgetById: null,
    approvalCBudgetById: null,
    
    // Reports Data
    ccBudgetDetailsByCodeForReport: [],
    dcaBudgetDetailsForReport: [],
    dcaBudgetDetailedSummary: [],
    costCenterBudgetReportTypes: [],
    
    // Client PO Data
    clientPOBudgetCostCenters: [],
    
    // Other Data
    otherBudgetCCs: [],
    budgetCheckResult: null,
    
    // Loading states
    loading: {
        ccFinancialYear: false,
        ccDetails: false,
        budgetCostCenters: false,
        budgetAssignedCC: false,
        budgetAssignedCCByID: false,
        budgetAssignedCCByCCType: false,
        budgetDCADetails: false,
        dcaBudgetDetails: false,
        amendedDCA: false,
        unAmendedDCAByCCID: false,
        verificationCCBudget: false,
        ccBudgetById: false,
        approvalCBudgetById: false,
        ccBudgetDetailsByCodeForReport: false,
        dcaBudgetDetailsForReport: false,
        dcaBudgetDetailedSummary: false,
        costCenterBudgetReportTypes: false,
        clientPOBudgetCostCenters: false,
        otherBudgetCCs: false,
        budgetCheck: false,
        saving: false,
        updating: false,
        approving: false,
        deleting: false
    },
    
    // Error states
    errors: {
        ccFinancialYear: null,
        ccDetails: null,
        budgetCostCenters: null,
        budgetAssignedCC: null,
        budgetAssignedCCByID: null,
        budgetAssignedCCByCCType: null,
        budgetDCADetails: null,
        dcaBudgetDetails: null,
        amendedDCA: null,
        unAmendedDCAByCCID: null,
        verificationCCBudget: null,
        ccBudgetById: null,
        approvalCBudgetById: null,
        ccBudgetDetailsByCodeForReport: null,
        dcaBudgetDetailsForReport: null,
        dcaBudgetDetailedSummary: null,
        costCenterBudgetReportTypes: null,
        clientPOBudgetCostCenters: null,
        otherBudgetCCs: null,
        budgetCheck: null,
        saving: null,
        updating: null,
        approving: null,
        deleting: null
    },
    
    // UI state
    activeTab: 'budget-assignment',
    editMode: false,
    selectedBudget: null,
    selectedCCCode: null,
    selectedYear: null,
    viewMode: 'list', // 'list', 'grid', 'details'
    lastUpdated: null,
    
    // Filters
    filters: {
        ccType: null,
        subType: null,
        year: null,
        status: null,
        roleid: null
    },
    
    // Cache timestamps to prevent unnecessary API calls
    cacheTimestamps: {
        ccFinancialYear: null,
        ccDetails: null,
        budgetCostCenters: null,
        budgetAssignedCC: null,
        budgetDCADetails: null,
        verificationCCBudget: null,
        costCenterBudgetReportTypes: null,
        clientPOBudgetCostCenters: null,
        otherBudgetCCs: null
    }
};

const budgetSlice = createSlice({
    name: 'budget',
    initialState,
    reducers: {
        setActiveTab: (state, action) => {
            state.activeTab = action.payload;
        },
        setEditMode: (state, action) => {
            state.editMode = action.payload;
        },
        setSelectedBudget: (state, action) => {
            state.selectedBudget = action.payload;
        },
        setSelectedCCCode: (state, action) => {
            state.selectedCCCode = action.payload;
        },
        setSelectedYear: (state, action) => {
            state.selectedYear = action.payload;
        },
        setViewMode: (state, action) => {
            state.viewMode = action.payload;
        },
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        clearFilters: (state) => {
            state.filters = {
                ccType: null,
                subType: null,
                year: null,
                status: null,
                roleid: null
            };
        },
        clearErrors: (state) => {
            Object.keys(state.errors).forEach(key => {
                state.errors[key] = null;
            });
        },
        clearSpecificError: (state, action) => {
            const errorType = action.payload;
            if (state.errors[errorType]) {
                state.errors[errorType] = null;
            }
        },
        updateBudgetItem: (state, action) => {
            const { dataType, index, updatedItem } = action.payload;
            if (state[dataType] && state[dataType][index]) {
                state[dataType][index] = { ...state[dataType][index], ...updatedItem };
            }
        },
        addBudgetItem: (state, action) => {
            const { dataType, item } = action.payload;
            if (state[dataType] && Array.isArray(state[dataType])) {
                state[dataType].push(item);
            }
        },
        removeBudgetItem: (state, action) => {
            const { dataType, index } = action.payload;
            if (state[dataType] && Array.isArray(state[dataType])) {
                state[dataType].splice(index, 1);
            }
        },
        resetBudgetData: (state) => {
            state.selectedBudget = null;
            state.selectedCCCode = null;
            state.selectedYear = null;
            state.editMode = false;
            state.budgetAssignedCCByID = null;
            state.ccBudgetById = null;
            state.approvalCBudgetById = null;
            state.budgetCheckResult = null;
        },
        setBudgetCheckResult: (state, action) => {
            state.budgetCheckResult = action.payload;
        }
    },
    extraReducers: (builder) => {
        // CC Financial Year
        builder
            .addCase(fetchCCFinancialYear.pending, (state) => {
                state.loading.ccFinancialYear = true;
                state.errors.ccFinancialYear = null;
            })
            .addCase(fetchCCFinancialYear.fulfilled, (state, action) => {
                state.loading.ccFinancialYear = false;
                state.ccFinancialYear = action.payload;
                state.cacheTimestamps.ccFinancialYear = Date.now();
                state.lastUpdated = Date.now();
            })
            .addCase(fetchCCFinancialYear.rejected, (state, action) => {
                state.loading.ccFinancialYear = false;
                state.errors.ccFinancialYear = action.payload || 'Failed to fetch CC financial year';
            })

        // CC Details
        builder
            .addCase(fetchCCDetails.pending, (state) => {
                state.loading.ccDetails = true;
                state.errors.ccDetails = null;
            })
            .addCase(fetchCCDetails.fulfilled, (state, action) => {
                state.loading.ccDetails = false;
                state.ccDetails = action.payload;
                state.cacheTimestamps.ccDetails = Date.now();
                state.lastUpdated = Date.now();
            })
            .addCase(fetchCCDetails.rejected, (state, action) => {
                state.loading.ccDetails = false;
                state.errors.ccDetails = action.payload || 'Failed to fetch CC details';
            })

        // Budget Cost Centers
        builder
            .addCase(fetchBudgetCostCenters.pending, (state) => {
                state.loading.budgetCostCenters = true;
                state.errors.budgetCostCenters = null;
            })
            .addCase(fetchBudgetCostCenters.fulfilled, (state, action) => {
                state.loading.budgetCostCenters = false;
                state.budgetCostCenters = action.payload;
                state.cacheTimestamps.budgetCostCenters = Date.now();
                state.lastUpdated = Date.now();
            })
            .addCase(fetchBudgetCostCenters.rejected, (state, action) => {
                state.loading.budgetCostCenters = false;
                state.errors.budgetCostCenters = action.payload || 'Failed to fetch budget cost centers';
            })

        // Budget Assigned CC
        builder
            .addCase(fetchBudgetAssignedCC.pending, (state) => {
                state.loading.budgetAssignedCC = true;
                state.errors.budgetAssignedCC = null;
            })
            .addCase(fetchBudgetAssignedCC.fulfilled, (state, action) => {
                state.loading.budgetAssignedCC = false;
                state.budgetAssignedCC = action.payload;
                state.lastUpdated = Date.now();
            })
            .addCase(fetchBudgetAssignedCC.rejected, (state, action) => {
                state.loading.budgetAssignedCC = false;
                state.errors.budgetAssignedCC = action.payload || 'Failed to fetch budget assigned CC';
            })

        // Budget Assigned CC By ID
        builder
            .addCase(fetchBudgetAssignedCCByID.pending, (state) => {
                state.loading.budgetAssignedCCByID = true;
                state.errors.budgetAssignedCCByID = null;
            })
            .addCase(fetchBudgetAssignedCCByID.fulfilled, (state, action) => {
                state.loading.budgetAssignedCCByID = false;
                state.budgetAssignedCCByID = action.payload;
                state.lastUpdated = Date.now();
            })
            .addCase(fetchBudgetAssignedCCByID.rejected, (state, action) => {
                state.loading.budgetAssignedCCByID = false;
                state.errors.budgetAssignedCCByID = action.payload || 'Failed to fetch budget assigned CC by ID';
            })

        // Budget Assigned CC By CC Type
        builder
            .addCase(fetchBudgetAssignedCCByCCType.pending, (state) => {
                state.loading.budgetAssignedCCByCCType = true;
                state.errors.budgetAssignedCCByCCType = null;
            })
            .addCase(fetchBudgetAssignedCCByCCType.fulfilled, (state, action) => {
                state.loading.budgetAssignedCCByCCType = false;
                state.budgetAssignedCCByCCType = action.payload;
                state.lastUpdated = Date.now();
            })
            .addCase(fetchBudgetAssignedCCByCCType.rejected, (state, action) => {
                state.loading.budgetAssignedCCByCCType = false;
                state.errors.budgetAssignedCCByCCType = action.payload || 'Failed to fetch budget assigned CC by CC type';
            })

        // Budget DCA Details
        builder
            .addCase(fetchBudgetDCADetails.pending, (state) => {
                state.loading.budgetDCADetails = true;
                state.errors.budgetDCADetails = null;
            })
            .addCase(fetchBudgetDCADetails.fulfilled, (state, action) => {
                state.loading.budgetDCADetails = false;
                state.budgetDCADetails = action.payload;
                state.cacheTimestamps.budgetDCADetails = Date.now();
                state.lastUpdated = Date.now();
            })
            .addCase(fetchBudgetDCADetails.rejected, (state, action) => {
                state.loading.budgetDCADetails = false;
                state.errors.budgetDCADetails = action.payload || 'Failed to fetch budget DCA details';
            })

        // DCA Budget Details
        builder
            .addCase(fetchDCABudgetDetails.pending, (state) => {
                state.loading.dcaBudgetDetails = true;
                state.errors.dcaBudgetDetails = null;
            })
            .addCase(fetchDCABudgetDetails.fulfilled, (state, action) => {
                state.loading.dcaBudgetDetails = false;
                state.dcaBudgetDetails = action.payload;
                state.lastUpdated = Date.now();
            })
            .addCase(fetchDCABudgetDetails.rejected, (state, action) => {
                state.loading.dcaBudgetDetails = false;
                state.errors.dcaBudgetDetails = action.payload || 'Failed to fetch DCA budget details';
            })

        // Amended DCA
        builder
            .addCase(fetchAmendedDCA.pending, (state) => {
                state.loading.amendedDCA = true;
                state.errors.amendedDCA = null;
            })
            .addCase(fetchAmendedDCA.fulfilled, (state, action) => {
                state.loading.amendedDCA = false;
                state.amendedDCA = action.payload;
                state.lastUpdated = Date.now();
            })
            .addCase(fetchAmendedDCA.rejected, (state, action) => {
                state.loading.amendedDCA = false;
                state.errors.amendedDCA = action.payload || 'Failed to fetch amended DCA';
            })

        // Verification CC Budget
        builder
            .addCase(fetchVerificationCCBudget.pending, (state) => {
                state.loading.verificationCCBudget = true;
                state.errors.verificationCCBudget = null;
            })
            .addCase(fetchVerificationCCBudget.fulfilled, (state, action) => {
                state.loading.verificationCCBudget = false;
                state.verificationCCBudget = action.payload;
                state.cacheTimestamps.verificationCCBudget = Date.now();
                state.lastUpdated = Date.now();
            })
            .addCase(fetchVerificationCCBudget.rejected, (state, action) => {
                state.loading.verificationCCBudget = false;
                state.errors.verificationCCBudget = action.payload || 'Failed to fetch verification CC budget';
            })

        // CC Budget By ID
        builder
            .addCase(fetchCCBudgetById.pending, (state) => {
                state.loading.ccBudgetById = true;
                state.errors.ccBudgetById = null;
            })
            .addCase(fetchCCBudgetById.fulfilled, (state, action) => {
                state.loading.ccBudgetById = false;
                state.ccBudgetById = action.payload;
                state.lastUpdated = Date.now();
            })
            .addCase(fetchCCBudgetById.rejected, (state, action) => {
                state.loading.ccBudgetById = false;
                state.errors.ccBudgetById = action.payload || 'Failed to fetch CC budget by ID';
            })

        // Budget Check
        builder
            .addCase(checkBudgetForSupplierPO.pending, (state) => {
                state.loading.budgetCheck = true;
                state.errors.budgetCheck = null;
            })
            .addCase(checkBudgetForSupplierPO.fulfilled, (state, action) => {
                state.loading.budgetCheck = false;
                state.budgetCheckResult = action.payload;
                state.lastUpdated = Date.now();
            })
            .addCase(checkBudgetForSupplierPO.rejected, (state, action) => {
                state.loading.budgetCheck = false;
                state.errors.budgetCheck = action.payload || 'Failed to check budget';
            })

        // Save Operations
        builder
            .addCase(saveCCAssignedBudget.pending, (state) => {
                state.loading.saving = true;
                state.errors.saving = null;
            })
            .addCase(saveCCAssignedBudget.fulfilled, (state, action) => {
                state.loading.saving = false;
                state.lastUpdated = Date.now();
            })
            .addCase(saveCCAssignedBudget.rejected, (state, action) => {
                state.loading.saving = false;
                state.errors.saving = action.payload || 'Failed to save CC assigned budget';
            })

        builder
            .addCase(saveDCAAssignedBudget.pending, (state) => {
                state.loading.saving = true;
                state.errors.saving = null;
            })
            .addCase(saveDCAAssignedBudget.fulfilled, (state, action) => {
                state.loading.saving = false;
                state.lastUpdated = Date.now();
            })
            .addCase(saveDCAAssignedBudget.rejected, (state, action) => {
                state.loading.saving = false;
                state.errors.saving = action.payload || 'Failed to save DCA assigned budget';
            })

        // Update Operations
        builder
            .addCase(updateDCAAssignedBudget.pending, (state) => {
                state.loading.updating = true;
                state.errors.updating = null;
            })
            .addCase(updateDCAAssignedBudget.fulfilled, (state, action) => {
                state.loading.updating = false;
                state.lastUpdated = Date.now();
            })
            .addCase(updateDCAAssignedBudget.rejected, (state, action) => {
                state.loading.updating = false;
                state.errors.updating = action.payload || 'Failed to update DCA assigned budget';
            })

        builder
            .addCase(updateCCBudget.pending, (state) => {
                state.loading.updating = true;
                state.errors.updating = null;
            })
            .addCase(updateCCBudget.fulfilled, (state, action) => {
                state.loading.updating = false;
                state.lastUpdated = Date.now();
            })
            .addCase(updateCCBudget.rejected, (state, action) => {
                state.loading.updating = false;
                state.errors.updating = action.payload || 'Failed to update CC budget';
            })

        // Approval Operations
        builder
            .addCase(approveCostCenterBudget.pending, (state) => {
                state.loading.approving = true;
                state.errors.approving = null;
            })
            .addCase(approveCostCenterBudget.fulfilled, (state, action) => {
                state.loading.approving = false;
                state.lastUpdated = Date.now();
            })
            .addCase(approveCostCenterBudget.rejected, (state, action) => {
                state.loading.approving = false;
                state.errors.approving = action.payload || 'Failed to approve cost center budget';
            })

        // Delete Operations
        builder
            .addCase(deleteDCAAmendBudget.pending, (state) => {
                state.loading.deleting = true;
                state.errors.deleting = null;
            })
            .addCase(deleteDCAAmendBudget.fulfilled, (state, action) => {
                state.loading.deleting = false;
                state.lastUpdated = Date.now();
            })
            .addCase(deleteDCAAmendBudget.rejected, (state, action) => {
                state.loading.deleting = false;
                state.errors.deleting = action.payload || 'Failed to delete DCA amend budget';
            })

        // CC Budget Details By Code For Report
        builder
            .addCase(fetchCCBudgetDetailsByCodeForReport.pending, (state) => {
                state.loading.ccBudgetDetailsByCodeForReport = true;
                state.errors.ccBudgetDetailsByCodeForReport = null;
            })
            .addCase(fetchCCBudgetDetailsByCodeForReport.fulfilled, (state, action) => {
                state.loading.ccBudgetDetailsByCodeForReport = false;
                state.ccBudgetDetailsByCodeForReport = action.payload;
                state.lastUpdated = Date.now();
            })
            .addCase(fetchCCBudgetDetailsByCodeForReport.rejected, (state, action) => {
                state.loading.ccBudgetDetailsByCodeForReport = false;
                state.errors.ccBudgetDetailsByCodeForReport = action.payload || 'Failed to fetch CC budget details by code for report';
            })

        // DCA Budget Details For Report
        builder
            .addCase(fetchDCABudgetDetailsForReport.pending, (state) => {
                state.loading.dcaBudgetDetailsForReport = true;
                state.errors.dcaBudgetDetailsForReport = null;
            })
            .addCase(fetchDCABudgetDetailsForReport.fulfilled, (state, action) => {
                state.loading.dcaBudgetDetailsForReport = false;
                state.dcaBudgetDetailsForReport = action.payload;
                state.lastUpdated = Date.now();
            })
            .addCase(fetchDCABudgetDetailsForReport.rejected, (state, action) => {
                state.loading.dcaBudgetDetailsForReport = false;
                state.errors.dcaBudgetDetailsForReport = action.payload || 'Failed to fetch DCA budget details for report';
            })

        // DCA Budget Detailed Summary
        builder
            .addCase(fetchDCABudgetDetailedSummary.pending, (state) => {
                state.loading.dcaBudgetDetailedSummary = true;
                state.errors.dcaBudgetDetailedSummary = null;
            })
            .addCase(fetchDCABudgetDetailedSummary.fulfilled, (state, action) => {
                state.loading.dcaBudgetDetailedSummary = false;
                state.dcaBudgetDetailedSummary = action.payload;
                state.lastUpdated = Date.now();
            })
            .addCase(fetchDCABudgetDetailedSummary.rejected, (state, action) => {
                state.loading.dcaBudgetDetailedSummary = false;
                state.errors.dcaBudgetDetailedSummary = action.payload || 'Failed to fetch DCA budget detailed summary';
            })

        // Cost Center Budget Report Types
        builder
            .addCase(fetchCostCenterBudgetReportTypes.pending, (state) => {
                state.loading.costCenterBudgetReportTypes = true;
                state.errors.costCenterBudgetReportTypes = null;
            })
            .addCase(fetchCostCenterBudgetReportTypes.fulfilled, (state, action) => {
                state.loading.costCenterBudgetReportTypes = false;
                state.costCenterBudgetReportTypes = action.payload;
                state.cacheTimestamps.costCenterBudgetReportTypes = Date.now();
                state.lastUpdated = Date.now();
            })
            .addCase(fetchCostCenterBudgetReportTypes.rejected, (state, action) => {
                state.loading.costCenterBudgetReportTypes = false;
                state.errors.costCenterBudgetReportTypes = action.payload || 'Failed to fetch cost center budget report types';
            });
    }
});

// Action creators are generated for each case reducer function
export const {
    setActiveTab,
    setEditMode,
    setSelectedBudget,
    setSelectedCCCode,
    setSelectedYear,
    setViewMode,
    setFilters,
    clearFilters,
    clearErrors,
    clearSpecificError,
    updateBudgetItem,
    addBudgetItem,
    removeBudgetItem,
    resetBudgetData,
    setBudgetCheckResult
} = budgetSlice.actions;

// Basic Selectors
export const selectCCFinancialYear = (state) => state.budget.ccFinancialYear;
export const selectCCDetails = (state) => state.budget.ccDetails;
export const selectBudgetCostCenters = (state) => state.budget.budgetCostCenters;
export const selectBudgetAssignedCC = (state) => state.budget.budgetAssignedCC;
export const selectBudgetAssignedCCByID = (state) => state.budget.budgetAssignedCCByID;
export const selectBudgetAssignedCCByCCType = (state) => state.budget.budgetAssignedCCByCCType;
export const selectBudgetDCADetails = (state) => state.budget.budgetDCADetails;
export const selectDCABudgetDetails = (state) => state.budget.dcaBudgetDetails;
export const selectAmendedDCA = (state) => state.budget.amendedDCA;
export const selectVerificationCCBudget = (state) => state.budget.verificationCCBudget;
export const selectCCBudgetById = (state) => state.budget.ccBudgetById;
export const selectBudgetCheckResult = (state) => state.budget.budgetCheckResult;

// Reports Selectors
export const selectCCBudgetDetailsByCodeForReport = (state) => state.budget.ccBudgetDetailsByCodeForReport;
export const selectDCABudgetDetailsForReport = (state) => state.budget.dcaBudgetDetailsForReport;
export const selectDCABudgetDetailedSummary = (state) => state.budget.dcaBudgetDetailedSummary;
export const selectCostCenterBudgetReportTypes = (state) => state.budget.costCenterBudgetReportTypes;

// UI Selectors
export const selectLoading = (state) => state.budget.loading;
export const selectErrors = (state) => state.budget.errors;
export const selectActiveTab = (state) => state.budget.activeTab;
export const selectEditMode = (state) => state.budget.editMode;
export const selectSelectedBudget = (state) => state.budget.selectedBudget;
export const selectSelectedCCCode = (state) => state.budget.selectedCCCode;
export const selectSelectedYear = (state) => state.budget.selectedYear;
export const selectViewMode = (state) => state.budget.viewMode;
export const selectFilters = (state) => state.budget.filters;
export const selectLastUpdated = (state) => state.budget.lastUpdated;

// Complex selectors
export const selectIsAnyLoading = (state) => {
    const loading = state.budget.loading;
    return Object.values(loading).some(isLoading => isLoading);
};

export const selectHasAnyError = (state) => {
    const errors = state.budget.errors;
    return Object.values(errors).some(error => error !== null);
};

export const selectIsSaving = (state) => {
    const { saving, updating, approving } = state.budget.loading;
    return saving || updating || approving;
};

export const selectIsProcessing = (state) => {
    const { saving, updating, approving, deleting } = state.budget.loading;
    return saving || updating || approving || deleting;
};

// Filtered data selectors
export const selectFilteredBudgetAssignedCC = (state) => {
    const budgetAssignedCC = state.budget.budgetAssignedCC;
    const filters = state.budget.filters;
    
    if (!budgetAssignedCC || budgetAssignedCC.length === 0) return [];
    
    return budgetAssignedCC.filter(item => {
        if (filters.ccType && item.ccType !== filters.ccType) return false;
        if (filters.subType && item.subType !== filters.subType) return false;
        if (filters.year && item.year !== filters.year) return false;
        if (filters.status && item.status !== filters.status) return false;
        return true;
    });
};

export const selectBudgetSummary = (state) => {
    const budgetAssignedCC = state.budget.budgetAssignedCC;
    
    if (!budgetAssignedCC || budgetAssignedCC.length === 0) {
        return {
            totalBudgets: 0,
            totalAmount: 0,
            approvedCount: 0,
            pendingCount: 0,
            rejectedCount: 0
        };
    }
    
    return budgetAssignedCC.reduce((summary, budget) => {
        summary.totalBudgets += 1;
        summary.totalAmount += budget.amount || 0;
        
        switch (budget.status?.toLowerCase()) {
            case 'approved':
                summary.approvedCount += 1;
                break;
            case 'pending':
                summary.pendingCount += 1;
                break;
            case 'rejected':
                summary.rejectedCount += 1;
                break;
            default:
                break;
        }
        
        return summary;
    }, {
        totalBudgets: 0,
        totalAmount: 0,
        approvedCount: 0,
        pendingCount: 0,
        rejectedCount: 0
    });
};

// Thunk for refreshing all budget data
export const refreshAllBudgetData = () => async (dispatch) => {
    const promises = [
        dispatch(fetchCCFinancialYear()),
        dispatch(fetchBudgetCostCenters()),
        dispatch(fetchBudgetAssignedCC())
    ];
    
    try {
        await Promise.all(promises);
    } catch (error) {
        console.error('Error refreshing budget data:', error);
    }
};

// Thunk for smart data fetching (only fetch if cache is old)
export const smartFetchBudgetData = (maxCacheAge = 5 * 60 * 1000) => (dispatch, getState) => {
    const state = getState();
    const now = Date.now();
    const { cacheTimestamps } = state.budget;
    
    const promises = [];
    
    // Check each data type and fetch if cache is old or doesn't exist
    if (!cacheTimestamps.ccFinancialYear || now - cacheTimestamps.ccFinancialYear > maxCacheAge) {
        promises.push(dispatch(fetchCCFinancialYear()));
    }
    
    if (!cacheTimestamps.budgetCostCenters || now - cacheTimestamps.budgetCostCenters > maxCacheAge) {
        promises.push(dispatch(fetchBudgetCostCenters()));
    }
    
    if (!cacheTimestamps.budgetDCADetails || now - cacheTimestamps.budgetDCADetails > maxCacheAge) {
        promises.push(dispatch(fetchBudgetDCADetails()));
    }
    
    return Promise.all(promises);
};

// Thunk for batch budget operations
export const batchBudgetOperations = (operations) => async (dispatch) => {
    const results = [];
    
    for (const operation of operations) {
        try {
            let result;
            switch (operation.type) {
                case 'save':
                    result = await dispatch(saveCCAssignedBudget(operation.data));
                    break;
                case 'update':
                    result = await dispatch(updateDCAAssignedBudget(operation.data));
                    break;
                case 'approve':
                    result = await dispatch(approveCostCenterBudget(operation.data));
                    break;
                default:
                    throw new Error(`Unknown operation type: ${operation.type}`);
            }
            results.push({ success: true, operation, result });
        } catch (error) {
            results.push({ success: false, operation, error });
        }
    }
    
    return results;
};

export default budgetSlice.reducer;