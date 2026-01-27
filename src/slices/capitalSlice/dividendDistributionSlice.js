import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as dividendDistributionAPI from '../../api/CapitalAPI/dividendDistributionApi';

// Async Thunks for Dividend Distribution APIs
// ============================================

// 1. Get Dividend Distribution Creation Data
export const fetchDividendDistributionCreationData = createAsyncThunk(
    'dividendDistribution/fetchDividendDistributionCreationData',
    async (financialYear, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Dividend Distribution Creation Data for FY:', financialYear);
            const response = await dividendDistributionAPI.getDividendDistributionCreationData({ 
                financialYear 
            });
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch Dividend Distribution Creation Data');
        }
    }
);

// 2. Insert Dividend Distribution
export const insertDividendDistribution = createAsyncThunk(
    'dividendDistribution/insertDividendDistribution',
    async (distributionData, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Inserting Dividend Distribution with data:', distributionData);
            const response = await dividendDistributionAPI.insertDividendDistribution(distributionData);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to insert Dividend Distribution');
        }
    }
);

// 3. Approve/Verify/Reject Dividend Distribution
export const approveDividendDistribution = createAsyncThunk(
    'dividendDistribution/approveDividendDistribution',
    async (approvalData, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Processing Dividend Distribution approval with data:', approvalData);
            const response = await dividendDistributionAPI.approveDividendDistribution(approvalData);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to process Dividend Distribution approval');
        }
    }
);

// 4. Fetch Verify Dividend Distribution Inbox by Role ID
export const fetchVerifyDividendDistribution = createAsyncThunk(
    'dividendDistribution/fetchVerifyDividendDistribution',
    async (roleId, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Verify Dividend Distribution Inbox for RoleID:', roleId);
            const response = await dividendDistributionAPI.getVerifyDividendDistribution({ roleId });
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch Dividend Distribution Verification Inbox');
        }
    }
);

// 5. Fetch Dividend Distribution Details by Reference Number
export const fetchDividendDistributionByRefno = createAsyncThunk(
    'dividendDistribution/fetchDividendDistributionByRefno',
    async (transactionRefno, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Dividend Distribution Details for RefNo:', transactionRefno);
            const response = await dividendDistributionAPI.getDividendDistributionByRefno({ transactionRefno });
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch Dividend Distribution Details');
        }
    }
);

// Initial State
// =============
const initialState = {
    // Data from APIs
    creationData: {
        approvedDeclarations: [],
        shareholders: [],
        esopHolders: [],
        panSources: [],
        summary: null
    },
    verifyDividendDistributionInbox: [],
    dividendDistributionDetails: {
        master: null,
        details: []
    },
    insertResult: null,
    approvalResult: null,

    // Loading states for each API
    loading: {
        creationData: false,
        insertDividendDistribution: false,
        approveDividendDistribution: false,
        verifyDividendDistribution: false,
        dividendDistributionDetails: false,
    },

    // Error states for each API
    errors: {
        creationData: null,
        insertDividendDistribution: null,
        approveDividendDistribution: null,
        verifyDividendDistribution: null,
        dividendDistributionDetails: null,
    },

    // UI State
    selectedFinancialYear: null,
    selectedRoleId: null,
    selectedTransactionRefno: null,
    approvalStatus: null,
    selectedShareholderIds: {
        promoter: [],
        esop: []
    },
};

// Dividend Distribution Slice
// ============================
const dividendDistributionSlice = createSlice({
    name: 'dividendDistribution',
    initialState,
    reducers: {
        // Action to set selected financial year
        setSelectedFinancialYear: (state, action) => {
            state.selectedFinancialYear = action.payload;
        },

        // Action to set selected role ID
        setSelectedRoleId: (state, action) => {
            state.selectedRoleId = action.payload;
        },
        
        // Action to set selected transaction reference number
        setSelectedTransactionRefno: (state, action) => {
            state.selectedTransactionRefno = action.payload;
        },
        
        // Action to set approval status
        setApprovalStatus: (state, action) => {
            state.approvalStatus = action.payload;
        },

        // Action to set selected shareholder IDs
        setSelectedShareholderIds: (state, action) => {
            state.selectedShareholderIds = action.payload;
        },

        // Action to add promoter shareholder ID
        addPromoterShareholderId: (state, action) => {
            if (!state.selectedShareholderIds.promoter.includes(action.payload)) {
                state.selectedShareholderIds.promoter.push(action.payload);
            }
        },

        // Action to remove promoter shareholder ID
        removePromoterShareholderId: (state, action) => {
            state.selectedShareholderIds.promoter = state.selectedShareholderIds.promoter
                .filter(id => id !== action.payload);
        },

        // Action to add ESOP shareholder ID
        addESOPShareholderId: (state, action) => {
            if (!state.selectedShareholderIds.esop.includes(action.payload)) {
                state.selectedShareholderIds.esop.push(action.payload);
            }
        },

        // Action to remove ESOP shareholder ID
        removeESOPShareholderId: (state, action) => {
            state.selectedShareholderIds.esop = state.selectedShareholderIds.esop
                .filter(id => id !== action.payload);
        },

        // Action to clear all selected shareholders
        clearSelectedShareholders: (state) => {
            state.selectedShareholderIds = {
                promoter: [],
                esop: []
            };
        },
        
        // Action to reset dividend distribution details
        resetDividendDistributionDetails: (state) => {
            state.dividendDistributionDetails = {
                master: null,
                details: []
            };
            state.approvalResult = null;
        },

        // Action to clear insert result
        clearInsertResult: (state) => {
            state.insertResult = null;
        },

        // Action to clear approval result
        clearApprovalResult: (state) => {
            state.approvalResult = null;
        },

        // Action to clear creation data
        clearCreationData: (state) => {
            state.creationData = {
                approvedDeclarations: [],
                shareholders: [],
                esopHolders: [],
                panSources: [],
                summary: null
            };
        },

        // Action to clear specific errors
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType]) {
                state.errors[errorType] = null;
            }
        },

        // Action to reset all dividend distribution data
        resetDividendDistributionData: (state) => {
            state.creationData = {
                approvedDeclarations: [],
                shareholders: [],
                esopHolders: [],
                panSources: [],
                summary: null
            };
            state.verifyDividendDistributionInbox = [];
            state.dividendDistributionDetails = {
                master: null,
                details: []
            };
            state.insertResult = null;
            state.approvalResult = null;
            state.selectedFinancialYear = null;
            state.selectedRoleId = null;
            state.selectedTransactionRefno = null;
            state.approvalStatus = null;
            state.selectedShareholderIds = {
                promoter: [],
                esop: []
            };
        },
    },
    extraReducers: (builder) => {
        // 1. Fetch Creation Data - HANDLE API RESPONSE STRUCTURE
        builder
            .addCase(fetchDividendDistributionCreationData.pending, (state) => {
                state.loading.creationData = true;
                state.errors.creationData = null;
            })
            .addCase(fetchDividendDistributionCreationData.fulfilled, (state, action) => {
                state.loading.creationData = false;
                // 🔧 Extract nested Data from API response
                // API returns: { Data: { ApprovedDeclarations: [...], Shareholders: [...], ... }, IsSuccessful: true }
                const data = action.payload?.Data;
                if (data) {
                    state.creationData = {
                        approvedDeclarations: data.ApprovedDeclarations || [],
                        shareholders: data.Shareholders || [],
                        esopHolders: data.ESOPHolders || [],
                        panSources: data.PANSources || [],
                        summary: data.Summary || null
                    };
                }
            })
            .addCase(fetchDividendDistributionCreationData.rejected, (state, action) => {
                state.loading.creationData = false;
                state.errors.creationData = action.payload;
                state.creationData = {
                    approvedDeclarations: [],
                    shareholders: [],
                    esopHolders: [],
                    panSources: [],
                    summary: null
                };
            })

        // 2. Insert Dividend Distribution - HANDLE API RESPONSE STRUCTURE
        builder
            .addCase(insertDividendDistribution.pending, (state) => {
                state.loading.insertDividendDistribution = true;
                state.errors.insertDividendDistribution = null;
            })
            .addCase(insertDividendDistribution.fulfilled, (state, action) => {
                state.loading.insertDividendDistribution = false;
                // 🔧 Extract Data from API response
                // API returns: { Data: "Submited$958672403", IsSuccessful: true, ResponseCode: 200 }
                state.insertResult = action.payload?.Data || action.payload;
            })
            .addCase(insertDividendDistribution.rejected, (state, action) => {
                state.loading.insertDividendDistribution = false;
                state.errors.insertDividendDistribution = action.payload;
                state.insertResult = null;
            })

        // 3. Approve Dividend Distribution - HANDLE API RESPONSE STRUCTURE
        builder
            .addCase(approveDividendDistribution.pending, (state) => {
                state.loading.approveDividendDistribution = true;
                state.errors.approveDividendDistribution = null;
            })
            .addCase(approveDividendDistribution.fulfilled, (state, action) => {
                state.loading.approveDividendDistribution = false;
                // 🔧 Extract Data from API response
                state.approvalResult = action.payload?.Data || action.payload;
                state.approvalStatus = 'approved';
            })
            .addCase(approveDividendDistribution.rejected, (state, action) => {
                state.loading.approveDividendDistribution = false;
                state.errors.approveDividendDistribution = action.payload;
            })

        // 4. Verify Dividend Distribution Inbox - HANDLE API RESPONSE STRUCTURE
        builder
            .addCase(fetchVerifyDividendDistribution.pending, (state) => {
                state.loading.verifyDividendDistribution = true;
                state.errors.verifyDividendDistribution = null;
            })
            .addCase(fetchVerifyDividendDistribution.fulfilled, (state, action) => {
                state.loading.verifyDividendDistribution = false;
                // 🔧 Extract Data array from API response
                // API returns: { Data: [...], IsSuccessful: true, ResponseCode: 200 }
                state.verifyDividendDistributionInbox = action.payload?.Data || [];
            })
            .addCase(fetchVerifyDividendDistribution.rejected, (state, action) => {
                state.loading.verifyDividendDistribution = false;
                state.errors.verifyDividendDistribution = action.payload;
                // 🔧 Reset to empty array on error to prevent filter issues
                state.verifyDividendDistributionInbox = [];
            })

        // 5. Dividend Distribution Details by RefNo - HANDLE API RESPONSE STRUCTURE
        builder
            .addCase(fetchDividendDistributionByRefno.pending, (state) => {
                state.loading.dividendDistributionDetails = true;
                state.errors.dividendDistributionDetails = null;
            })
            .addCase(fetchDividendDistributionByRefno.fulfilled, (state, action) => {
                state.loading.dividendDistributionDetails = false;
                // 🔧 Extract nested Data from API response
                // API returns: { Data: { Master: {...}, Details: [...] }, IsSuccessful: true }
                const data = action.payload?.Data;
                if (data) {
                    state.dividendDistributionDetails = {
                        master: data.Master || null,
                        details: data.Details || []
                    };
                }
            })
            .addCase(fetchDividendDistributionByRefno.rejected, (state, action) => {
                state.loading.dividendDistributionDetails = false;
                state.errors.dividendDistributionDetails = action.payload;
                // 🔧 Reset on error
                state.dividendDistributionDetails = {
                    master: null,
                    details: []
                };
            });
    },
});

// Export actions
export const { 
    setSelectedFinancialYear,
    setSelectedRoleId,
    setSelectedTransactionRefno,
    setApprovalStatus,
    setSelectedShareholderIds,
    addPromoterShareholderId,
    removePromoterShareholderId,
    addESOPShareholderId,
    removeESOPShareholderId,
    clearSelectedShareholders,
    resetDividendDistributionDetails,
    clearInsertResult,
    clearApprovalResult,
    clearCreationData,
    clearError,
    resetDividendDistributionData,
} = dividendDistributionSlice.actions;

// Selectors
// =========

// Data selectors
export const selectCreationData = (state) => 
    state.dividendDistribution.creationData;
export const selectApprovedDeclarations = (state) => 
    state.dividendDistribution.creationData.approvedDeclarations;
export const selectShareholders = (state) => 
    state.dividendDistribution.creationData.shareholders;
export const selectESOPHolders = (state) => 
    state.dividendDistribution.creationData.esopHolders;
export const selectPANSources = (state) => 
    state.dividendDistribution.creationData.panSources;
export const selectDistributionSummary = (state) => 
    state.dividendDistribution.creationData.summary;

export const selectVerifyDividendDistributionInbox = (state) => 
    state.dividendDistribution.verifyDividendDistributionInbox;
export const selectDividendDistributionDetails = (state) => 
    state.dividendDistribution.dividendDistributionDetails;
export const selectDividendDistributionMaster = (state) => 
    state.dividendDistribution.dividendDistributionDetails.master;
export const selectDividendDistributionDetailsList = (state) => 
    state.dividendDistribution.dividendDistributionDetails.details;
export const selectInsertResult = (state) => 
    state.dividendDistribution.insertResult;
export const selectApprovalResult = (state) => 
    state.dividendDistribution.approvalResult;

// 🔧 Helper selectors to get arrays safely - PREVENTS FILTER ERRORS
export const selectVerifyDividendDistributionInboxArray = (state) => {
    const inbox = state.dividendDistribution.verifyDividendDistributionInbox;
    return Array.isArray(inbox) ? inbox : [];
};

export const selectApprovedDeclarationsArray = (state) => {
    const declarations = state.dividendDistribution.creationData.approvedDeclarations;
    return Array.isArray(declarations) ? declarations : [];
};

export const selectShareholdersArray = (state) => {
    const shareholders = state.dividendDistribution.creationData.shareholders;
    return Array.isArray(shareholders) ? shareholders : [];
};

export const selectESOPHoldersArray = (state) => {
    const esopHolders = state.dividendDistribution.creationData.esopHolders;
    return Array.isArray(esopHolders) ? esopHolders : [];
};

export const selectDistributionDetailsArray = (state) => {
    const details = state.dividendDistribution.dividendDistributionDetails.details;
    return Array.isArray(details) ? details : [];
};

// Loading selectors
export const selectLoading = (state) => state.dividendDistribution.loading;
export const selectCreationDataLoading = (state) => 
    state.dividendDistribution.loading.creationData;
export const selectInsertDividendDistributionLoading = (state) => 
    state.dividendDistribution.loading.insertDividendDistribution;
export const selectApproveDividendDistributionLoading = (state) => 
    state.dividendDistribution.loading.approveDividendDistribution;
export const selectVerifyDividendDistributionLoading = (state) => 
    state.dividendDistribution.loading.verifyDividendDistribution;
export const selectDividendDistributionDetailsLoading = (state) => 
    state.dividendDistribution.loading.dividendDistributionDetails;

// Error selectors
export const selectErrors = (state) => state.dividendDistribution.errors;
export const selectCreationDataError = (state) => 
    state.dividendDistribution.errors.creationData;
export const selectInsertDividendDistributionError = (state) => 
    state.dividendDistribution.errors.insertDividendDistribution;
export const selectApproveDividendDistributionError = (state) => 
    state.dividendDistribution.errors.approveDividendDistribution;
export const selectVerifyDividendDistributionError = (state) => 
    state.dividendDistribution.errors.verifyDividendDistribution;
export const selectDividendDistributionDetailsError = (state) => 
    state.dividendDistribution.errors.dividendDistributionDetails;

// UI State selectors
export const selectSelectedFinancialYear = (state) => 
    state.dividendDistribution.selectedFinancialYear;
export const selectSelectedRoleId = (state) => 
    state.dividendDistribution.selectedRoleId;
export const selectSelectedTransactionRefno = (state) => 
    state.dividendDistribution.selectedTransactionRefno;
export const selectApprovalStatus = (state) => 
    state.dividendDistribution.approvalStatus;
export const selectSelectedShareholderIds = (state) => 
    state.dividendDistribution.selectedShareholderIds;
export const selectSelectedPromoterIds = (state) => 
    state.dividendDistribution.selectedShareholderIds.promoter;
export const selectSelectedESOPIds = (state) => 
    state.dividendDistribution.selectedShareholderIds.esop;

// Combined selectors
export const selectIsAnyLoading = (state) => 
    Object.values(state.dividendDistribution.loading).some(loading => loading);
export const selectHasAnyError = (state) => 
    Object.values(state.dividendDistribution.errors).some(error => error !== null);

// 🔧 Specific combined selectors with safe array handling
export const selectDividendDistributionSummary = (state) => {
    const inboxArray = Array.isArray(state.dividendDistribution.verifyDividendDistributionInbox) 
        ? state.dividendDistribution.verifyDividendDistributionInbox 
        : [];
    
    return {
        totalInbox: inboxArray.length,
        selectedDistribution: state.dividendDistribution.dividendDistributionDetails,
        approvalStatus: state.dividendDistribution.approvalStatus,
        isProcessing: state.dividendDistribution.loading.approveDividendDistribution,
        hasInboxItems: inboxArray.length > 0,
        isEmpty: inboxArray.length === 0 && !state.dividendDistribution.loading.verifyDividendDistribution
    };
};

// Creation Data Summary
export const selectCreationDataSummary = (state) => {
    const declarations = Array.isArray(state.dividendDistribution.creationData.approvedDeclarations) 
        ? state.dividendDistribution.creationData.approvedDeclarations 
        : [];
    const shareholders = Array.isArray(state.dividendDistribution.creationData.shareholders) 
        ? state.dividendDistribution.creationData.shareholders 
        : [];
    const esopHolders = Array.isArray(state.dividendDistribution.creationData.esopHolders) 
        ? state.dividendDistribution.creationData.esopHolders 
        : [];
    
    return {
        totalDeclarations: declarations.length,
        totalShareholders: shareholders.length,
        totalESOPHolders: esopHolders.length,
        summary: state.dividendDistribution.creationData.summary,
        isLoading: state.dividendDistribution.loading.creationData,
        error: state.dividendDistribution.errors.creationData,
        hasData: declarations.length > 0,
        isEmpty: declarations.length === 0 && !state.dividendDistribution.loading.creationData
    };
};

// Dividend Distribution Details specific selector
export const selectDividendDistributionDetailsSummary = (state) => {
    const detailsArray = Array.isArray(state.dividendDistribution.dividendDistributionDetails.details) 
        ? state.dividendDistribution.dividendDistributionDetails.details 
        : [];
    
    return {
        master: state.dividendDistribution.dividendDistributionDetails.master,
        details: detailsArray,
        totalDetails: detailsArray.length,
        isLoading: state.dividendDistribution.loading.dividendDistributionDetails,
        error: state.dividendDistribution.errors.dividendDistributionDetails,
        hasDetails: state.dividendDistribution.dividendDistributionDetails.master !== null,
        isEmpty: state.dividendDistribution.dividendDistributionDetails.master === null 
            && !state.dividendDistribution.loading.dividendDistributionDetails
    };
};

// Insert operation status selector
export const selectInsertOperationStatus = (state) => {
    return {
        result: state.dividendDistribution.insertResult,
        isLoading: state.dividendDistribution.loading.insertDividendDistribution,
        error: state.dividendDistribution.errors.insertDividendDistribution,
        isSuccess: state.dividendDistribution.insertResult !== null,
        isFailed: state.dividendDistribution.errors.insertDividendDistribution !== null
    };
};

// Approval operation status selector
export const selectApprovalOperationStatus = (state) => {
    return {
        result: state.dividendDistribution.approvalResult,
        isLoading: state.dividendDistribution.loading.approveDividendDistribution,
        error: state.dividendDistribution.errors.approveDividendDistribution,
        isSuccess: state.dividendDistribution.approvalResult !== null,
        isFailed: state.dividendDistribution.errors.approveDividendDistribution !== null,
        status: state.dividendDistribution.approvalStatus
    };
};

// Selected shareholders summary
export const selectSelectedShareholdersSummary = (state) => {
    const promoterIds = Array.isArray(state.dividendDistribution.selectedShareholderIds.promoter) 
        ? state.dividendDistribution.selectedShareholderIds.promoter 
        : [];
    const esopIds = Array.isArray(state.dividendDistribution.selectedShareholderIds.esop) 
        ? state.dividendDistribution.selectedShareholderIds.esop 
        : [];
    
    return {
        promoterIds,
        esopIds,
        totalPromoters: promoterIds.length,
        totalESOPs: esopIds.length,
        totalSelected: promoterIds.length + esopIds.length,
        hasSelection: promoterIds.length > 0 || esopIds.length > 0,
        isEmpty: promoterIds.length === 0 && esopIds.length === 0
    };
};

// Export reducer
export default dividendDistributionSlice.reducer;