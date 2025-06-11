import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as budgetAPI from '../../api/BudgetAPI/budgetReportAPI';

// Async Thunks for 12 Budget Report APIs
// ======================================

// 1. Fetch All Financial Years
export const fetchAllFinancialYears = createAsyncThunk(
    'budgetreport/fetchAllFinancialYears',
    async (_, { rejectWithValue }) => {
        try {
            const response = await budgetAPI.getAllFinancialYears();
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch All Financial Years');
        }
    }
);

// 2. Fetch Cost Center Budget Report Types
export const fetchCostCenterBudgetReportTypes = createAsyncThunk(
    'budgetreport/fetchCostCenterBudgetReportTypes',
    async (roleId, { rejectWithValue }) => {
        try {
            const response = await budgetAPI.getCostCenterBudgetReportTypes(roleId);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Cost Center Budget Report Types');
        }
    }
);

// 3. Fetch Cost Centers by Type by Role
export const fetchCostCentersByTypeByRole = createAsyncThunk(
    'budgetreport/fetchCostCentersByTypeByRole',
    async (params, { rejectWithValue }) => {
        try {
            const response = await budgetAPI.getCostCentersByTypeByRole(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Cost Centers by Type by Role');
        }
    }
);

// 4. Fetch CC Budget Details By Code For Report
export const fetchCCBudgetDetailsByCodeForReport = createAsyncThunk(
    'budgetreport/fetchCCBudgetDetailsByCodeForReport',
    async (params, { rejectWithValue }) => {
        try {
            const response = await budgetAPI.getCCBudgetDetailsByCodeForReport(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch CC Budget Details');
        }
    }
);

// 5. Fetch DCA Budget Details For Report
export const fetchDCABudgetDetailsForReport = createAsyncThunk(
    'budgetreport/fetchDCABudgetDetailsForReport',
    async (params, { rejectWithValue }) => {
        try {
            const response = await budgetAPI.getDCABudgetDetailsForReport(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch DCA Budget Details');
        }
    }
);

// 6. Fetch CC Depreciation OverHead
export const fetchCCDepreciationOverHead = createAsyncThunk(
    'budgetreport/fetchCCDepreciationOverHead',
    async (params, { rejectWithValue }) => {
        try {
            const response = await budgetAPI.getCCDepreciationOverHead(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch CC Depreciation OverHead');
        }
    }
);

// 7. Fetch DCA Budget Detailed Summary
export const fetchDCABudgetDetailedSummary = createAsyncThunk(
    'budgetreport/fetchDCABudgetDetailedSummary',
    async (params, { rejectWithValue }) => {
        try {
            const response = await budgetAPI.getDCABudgetDetailedSummary(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch DCA Budget Detailed Summary');
        }
    }
);

// 8. Fetch CC Invoice Summary
export const fetchCCInvoiceSummary = createAsyncThunk(
    'budgetreport/fetchCCInvoiceSummary',
    async (params, { rejectWithValue }) => {
        try {
            const response = await budgetAPI.getCCInvoiceSummary(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch CC Invoice Summary');
        }
    }
);

// 9. Fetch All Invoice By CC Code
export const fetchAllInvoiceByCCCode = createAsyncThunk(
    'budgetreport/fetchAllInvoiceByCCCode',
    async (params, { rejectWithValue }) => {
        try {
            const response = await budgetAPI.getAllInvoiceByCCCode(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch All Invoice by CC Code');
        }
    }
);

// 10. Fetch Budget Transfer Summary Popup
export const fetchBudgetTransferSummaryPopup = createAsyncThunk(
    'budgetreport/fetchBudgetTransferSummaryPopup',
    async (ccCode, { rejectWithValue }) => {
        try {
            const response = await budgetAPI.getBudgetTransferSummaryPopup(ccCode);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Budget Transfer Summary');
        }
    }
);

// 11. Fetch CC Upload Docs Exists
export const fetchCCUploadDocsExists = createAsyncThunk(
    'budgetreport/fetchCCUploadDocsExists',
    async (params, { rejectWithValue }) => {
        try {
            const response = await budgetAPI.getCCUploadDocsExists(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to check CC Upload Docs');
        }
    }
);

// 12. Save Budget Excel Request
export const saveBudgetExcelRequest = createAsyncThunk(
    'budgetreport/saveBudgetExcelRequest',
    async (data, { rejectWithValue }) => {
        try {
            const response = await budgetAPI.saveBudgetExcelRequest(data);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to save Budget Excel Request');
        }
    }
);

// Initial State
// =============
const initialState = {
    // Data from APIs
    allFinancialYears: [],
    costCenterBudgetReportTypes: [],
    costCentersByTypeByRole: [],
    ccBudgetDetailsByCodeForReport: null,
    dcaBudgetDetailsForReport: [],
    ccDepreciationOverHead: [],
    dcaBudgetDetailedSummary: [],
    ccInvoiceSummary: null,
    allInvoiceByCCCode: [],
    budgetTransferSummaryPopup: null,
    ccUploadDocsExists: null,
    budgetExcelRequestResult: null,

    // Loading states for each API
    loading: {
        allFinancialYears: false,
        costCenterBudgetReportTypes: false,
        costCentersByTypeByRole: false,
        ccBudgetDetailsByCodeForReport: false,
        dcaBudgetDetailsForReport: false,
        ccDepreciationOverHead: false,
        dcaBudgetDetailedSummary: false,
        ccInvoiceSummary: false,
        allInvoiceByCCCode: false,
        budgetTransferSummaryPopup: false,
        ccUploadDocsExists: false,
        saveBudgetExcelRequest: false,
    },

    // Error states for each API
    errors: {
        allFinancialYears: null,
        costCenterBudgetReportTypes: null,
        costCentersByTypeByRole: null,
        ccBudgetDetailsByCodeForReport: null,
        dcaBudgetDetailsForReport: null,
        ccDepreciationOverHead: null,
        dcaBudgetDetailedSummary: null,
        ccInvoiceSummary: null,
        allInvoiceByCCCode: null,
        budgetTransferSummaryPopup: null,
        ccUploadDocsExists: null,
        saveBudgetExcelRequest: null,
    },

    // UI State
    filters: {
        costCenterType: '',
        subType: '',
        costCenterStatus: '',
        costCenter: '',
        financialYear: '',
        roleId: ''
    }
};

// Budget Report Slice
// ==================
const budgetReportSlice = createSlice({
    name: 'budgetreport',
    initialState,
    reducers: {
        // Action to set filters
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        
        // Action to clear filters
        clearFilters: (state) => {
            state.filters = {
                costCenterType: '',
                subType: '',
                costCenterStatus: '',
                costCenter: '',
                financialYear: '',
                roleId: ''
            };
        },
        
        // Action to reset all budget data
        resetBudgetData: (state) => {
            state.ccBudgetDetailsByCodeForReport = null;
            state.dcaBudgetDetailsForReport = [];
            state.ccDepreciationOverHead = [];
            state.dcaBudgetDetailedSummary = [];
            state.ccInvoiceSummary = null;
            state.allInvoiceByCCCode = [];
            state.budgetTransferSummaryPopup = null;
            state.ccUploadDocsExists = null;
        },

        // Action to clear specific errors
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType]) {
                state.errors[errorType] = null;
            }
        },

        // Action to reset selected cost center data
        resetSelectedCCData: (state) => {
            state.ccBudgetDetailsByCodeForReport = null;
            state.dcaBudgetDetailsForReport = [];
            state.ccDepreciationOverHead = [];
            state.ccInvoiceSummary = null;
            state.allInvoiceByCCCode = [];
            state.budgetTransferSummaryPopup = null;
        }
    },
    extraReducers: (builder) => {
        // 1. All Financial Years
        builder
            .addCase(fetchAllFinancialYears.pending, (state) => {
                state.loading.allFinancialYears = true;
                state.errors.allFinancialYears = null;
            })
            .addCase(fetchAllFinancialYears.fulfilled, (state, action) => {
                state.loading.allFinancialYears = false;
                state.allFinancialYears = action.payload;
            })
            .addCase(fetchAllFinancialYears.rejected, (state, action) => {
                state.loading.allFinancialYears = false;
                state.errors.allFinancialYears = action.payload;
            })

        // 2. Cost Center Budget Report Types
        builder
            .addCase(fetchCostCenterBudgetReportTypes.pending, (state) => {
                state.loading.costCenterBudgetReportTypes = true;
                state.errors.costCenterBudgetReportTypes = null;
            })
            .addCase(fetchCostCenterBudgetReportTypes.fulfilled, (state, action) => {
                state.loading.costCenterBudgetReportTypes = false;
                state.costCenterBudgetReportTypes = action.payload;
            })
            .addCase(fetchCostCenterBudgetReportTypes.rejected, (state, action) => {
                state.loading.costCenterBudgetReportTypes = false;
                state.errors.costCenterBudgetReportTypes = action.payload;
            })

        // 3. Cost Centers by Type by Role
        builder
            .addCase(fetchCostCentersByTypeByRole.pending, (state) => {
                state.loading.costCentersByTypeByRole = true;
                state.errors.costCentersByTypeByRole = null;
            })
            .addCase(fetchCostCentersByTypeByRole.fulfilled, (state, action) => {
                state.loading.costCentersByTypeByRole = false;
                state.costCentersByTypeByRole = action.payload;
            })
            .addCase(fetchCostCentersByTypeByRole.rejected, (state, action) => {
                state.loading.costCentersByTypeByRole = false;
                state.errors.costCentersByTypeByRole = action.payload;
            })

        // 4. CC Budget Details By Code For Report
        builder
            .addCase(fetchCCBudgetDetailsByCodeForReport.pending, (state) => {
                state.loading.ccBudgetDetailsByCodeForReport = true;
                state.errors.ccBudgetDetailsByCodeForReport = null;
            })
            .addCase(fetchCCBudgetDetailsByCodeForReport.fulfilled, (state, action) => {
                state.loading.ccBudgetDetailsByCodeForReport = false;
                state.ccBudgetDetailsByCodeForReport = action.payload;
            })
            .addCase(fetchCCBudgetDetailsByCodeForReport.rejected, (state, action) => {
                state.loading.ccBudgetDetailsByCodeForReport = false;
                state.errors.ccBudgetDetailsByCodeForReport = action.payload;
            })

        // 5. DCA Budget Details For Report
        builder
            .addCase(fetchDCABudgetDetailsForReport.pending, (state) => {
                state.loading.dcaBudgetDetailsForReport = true;
                state.errors.dcaBudgetDetailsForReport = null;
            })
            .addCase(fetchDCABudgetDetailsForReport.fulfilled, (state, action) => {
                state.loading.dcaBudgetDetailsForReport = false;
                state.dcaBudgetDetailsForReport = action.payload;
            })
            .addCase(fetchDCABudgetDetailsForReport.rejected, (state, action) => {
                state.loading.dcaBudgetDetailsForReport = false;
                state.errors.dcaBudgetDetailsForReport = action.payload;
            })

        // 6. CC Depreciation OverHead
        builder
            .addCase(fetchCCDepreciationOverHead.pending, (state) => {
                state.loading.ccDepreciationOverHead = true;
                state.errors.ccDepreciationOverHead = null;
            })
            .addCase(fetchCCDepreciationOverHead.fulfilled, (state, action) => {
                state.loading.ccDepreciationOverHead = false;
                state.ccDepreciationOverHead = action.payload;
            })
            .addCase(fetchCCDepreciationOverHead.rejected, (state, action) => {
                state.loading.ccDepreciationOverHead = false;
                state.errors.ccDepreciationOverHead = action.payload;
            })

        // 7. DCA Budget Detailed Summary
        builder
            .addCase(fetchDCABudgetDetailedSummary.pending, (state) => {
                state.loading.dcaBudgetDetailedSummary = true;
                state.errors.dcaBudgetDetailedSummary = null;
            })
            .addCase(fetchDCABudgetDetailedSummary.fulfilled, (state, action) => {
                state.loading.dcaBudgetDetailedSummary = false;
                state.dcaBudgetDetailedSummary = action.payload;
            })
            .addCase(fetchDCABudgetDetailedSummary.rejected, (state, action) => {
                state.loading.dcaBudgetDetailedSummary = false;
                state.errors.dcaBudgetDetailedSummary = action.payload;
            })

        // 8. CC Invoice Summary
        builder
            .addCase(fetchCCInvoiceSummary.pending, (state) => {
                state.loading.ccInvoiceSummary = true;
                state.errors.ccInvoiceSummary = null;
            })
            .addCase(fetchCCInvoiceSummary.fulfilled, (state, action) => {
                state.loading.ccInvoiceSummary = false;
                state.ccInvoiceSummary = action.payload;
            })
            .addCase(fetchCCInvoiceSummary.rejected, (state, action) => {
                state.loading.ccInvoiceSummary = false;
                state.errors.ccInvoiceSummary = action.payload;
            })

        // 9. All Invoice By CC Code
        builder
            .addCase(fetchAllInvoiceByCCCode.pending, (state) => {
                state.loading.allInvoiceByCCCode = true;
                state.errors.allInvoiceByCCCode = null;
            })
            .addCase(fetchAllInvoiceByCCCode.fulfilled, (state, action) => {
                state.loading.allInvoiceByCCCode = false;
                state.allInvoiceByCCCode = action.payload;
            })
            .addCase(fetchAllInvoiceByCCCode.rejected, (state, action) => {
                state.loading.allInvoiceByCCCode = false;
                state.errors.allInvoiceByCCCode = action.payload;
            })

        // 10. Budget Transfer Summary Popup
        builder
            .addCase(fetchBudgetTransferSummaryPopup.pending, (state) => {
                state.loading.budgetTransferSummaryPopup = true;
                state.errors.budgetTransferSummaryPopup = null;
            })
            .addCase(fetchBudgetTransferSummaryPopup.fulfilled, (state, action) => {
                state.loading.budgetTransferSummaryPopup = false;
                state.budgetTransferSummaryPopup = action.payload;
            })
            .addCase(fetchBudgetTransferSummaryPopup.rejected, (state, action) => {
                state.loading.budgetTransferSummaryPopup = false;
                state.errors.budgetTransferSummaryPopup = action.payload;
            })

        // 11. CC Upload Docs Exists
        builder
            .addCase(fetchCCUploadDocsExists.pending, (state) => {
                state.loading.ccUploadDocsExists = true;
                state.errors.ccUploadDocsExists = null;
            })
            .addCase(fetchCCUploadDocsExists.fulfilled, (state, action) => {
                state.loading.ccUploadDocsExists = false;
                state.ccUploadDocsExists = action.payload;
            })
            .addCase(fetchCCUploadDocsExists.rejected, (state, action) => {
                state.loading.ccUploadDocsExists = false;
                state.errors.ccUploadDocsExists = action.payload;
            })

        // 12. Save Budget Excel Request
        builder
            .addCase(saveBudgetExcelRequest.pending, (state) => {
                state.loading.saveBudgetExcelRequest = true;
                state.errors.saveBudgetExcelRequest = null;
            })
            .addCase(saveBudgetExcelRequest.fulfilled, (state, action) => {
                state.loading.saveBudgetExcelRequest = false;
                state.budgetExcelRequestResult = action.payload;
            })
            .addCase(saveBudgetExcelRequest.rejected, (state, action) => {
                state.loading.saveBudgetExcelRequest = false;
                state.errors.saveBudgetExcelRequest = action.payload;
            });
    },
});

// Export actions
export const { 
    setFilters, 
    clearFilters, 
    resetBudgetData, 
    clearError, 
    resetSelectedCCData 
} = budgetReportSlice.actions;

// Selectors
// =========

// Data selectors
export const selectAllFinancialYears = (state) => state.budgetreport.allFinancialYears;
export const selectCostCenterBudgetReportTypes = (state) => state.budgetreport.costCenterBudgetReportTypes;
export const selectCostCentersByTypeByRole = (state) => state.budgetreport.costCentersByTypeByRole;
export const selectCCBudgetDetailsByCodeForReport = (state) => state.budgetreport.ccBudgetDetailsByCodeForReport;
export const selectDCABudgetDetailsForReport = (state) => state.budgetreport.dcaBudgetDetailsForReport;
export const selectCCDepreciationOverHead = (state) => state.budgetreport.ccDepreciationOverHead;
export const selectDCABudgetDetailedSummary = (state) => state.budgetreport.dcaBudgetDetailedSummary;
export const selectCCInvoiceSummary = (state) => state.budgetreport.ccInvoiceSummary;
export const selectAllInvoiceByCCCode = (state) => state.budgetreport.allInvoiceByCCCode;
export const selectBudgetTransferSummaryPopup = (state) => state.budgetreport.budgetTransferSummaryPopup;
export const selectCCUploadDocsExists = (state) => state.budgetreport.ccUploadDocsExists;
export const selectBudgetExcelRequestResult = (state) => state.budgetreport.budgetExcelRequestResult;

// Loading selectors
export const selectLoading = (state) => state.budgetreport.loading;
export const selectAllFinancialYearsLoading = (state) => state.budgetreport.loading.allFinancialYears;
export const selectCostCenterBudgetReportTypesLoading = (state) => state.budgetreport.loading.costCenterBudgetReportTypes;
export const selectCCBudgetDetailsLoading = (state) => state.budgetreport.loading.ccBudgetDetailsByCodeForReport;
export const selectDCABudgetDetailsLoading = (state) => state.budgetreport.loading.dcaBudgetDetailsForReport;

// Error selectors
export const selectErrors = (state) => state.budgetreport.errors;
export const selectAllFinancialYearsError = (state) => state.budgetreport.errors.allFinancialYears;
export const selectCostCenterBudgetReportTypesError = (state) => state.budgetreport.errors.costCenterBudgetReportTypes;
export const selectCCBudgetDetailsError = (state) => state.budgetreport.errors.ccBudgetDetailsByCodeForReport;
export const selectDCABudgetDetailsError = (state) => state.budgetreport.errors.dcaBudgetDetailsForReport;

// Filter selectors
export const selectFilters = (state) => state.budgetreport.filters;
export const selectSelectedFinancialYear = (state) => state.budgetreport.filters.financialYear;
export const selectSelectedCostCenter = (state) => state.budgetreport.filters.costCenter;
export const selectSelectedCostCenterType = (state) => state.budgetreport.filters.costCenterType;

// Combined selectors
export const selectIsAnyLoading = (state) => Object.values(state.budgetreport.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.budgetreport.errors).some(error => error !== null);

// Business logic selectors
export const selectBudgetSummary = (state) => {
    const ccBudget = state.budgetreport.ccBudgetDetailsByCodeForReport;
    const dcaBudgetsResponse = state.budgetreport.dcaBudgetDetailsForReport;
    const overheadResponse = state.budgetreport.ccDepreciationOverHead;
    
    if (!ccBudget || !dcaBudgetsResponse) return null;
    
    // Extract Data arrays from API responses
    const ccBudgetData = ccBudget?.Data?.[0] || ccBudget?.[0] || ccBudget;
    const dcaBudgets = dcaBudgetsResponse?.Data || dcaBudgetsResponse || [];
    const overhead = overheadResponse?.Data || overheadResponse || [];
    
    // Ensure dcaBudgets is an array before using reduce
    if (!Array.isArray(dcaBudgets)) {
        console.warn('dcaBudgets is not an array:', dcaBudgets);
        return null;
    }
    
    const totalDCABudget = dcaBudgets.reduce((sum, dca) => sum + parseFloat(dca.DCABudgetValue || 0), 0);
    const totalConsumed = dcaBudgets.reduce((sum, dca) => sum + parseFloat(dca.ConsumedBudget || 0), 0);
    const totalOverhead = Array.isArray(overhead) ? overhead.reduce((sum, item) => sum + parseFloat(item.DCABudgetValue || 0), 0) : 0;
    
    return {
        totalBudget: parseFloat(ccBudgetData?.BudgetValue || ccBudgetData?.budgetAmount || 0),
        totalDCABudget,
        totalConsumed,
        totalOverhead,
        balanceBudget: parseFloat(ccBudgetData?.BalanceBudget || ccBudgetData?.budgetBalance || 0),
        utilizationPercentage: totalDCABudget > 0 ? ((totalConsumed / totalDCABudget) * 100).toFixed(2) : 0
    };
};

// Export reducer
export default budgetReportSlice.reducer;