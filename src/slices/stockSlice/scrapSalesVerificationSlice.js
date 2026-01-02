import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as scrapSaleAPI from '../../api/Stock/scrapSaleVerificationAPI';

// Async Thunks
export const fetchVerifyScrapSaleGrid = createAsyncThunk(
    'scrapSale/fetchVerifyScrapSaleGrid',
    async ({ roleId, created, userId }, { rejectWithValue }) => {
        try {
            console.log('🔵 Fetching Scrap Sale Grid:', { roleId, created, userId });
            const response = await scrapSaleAPI.getVerifyScrapSaleGrid(roleId, created, userId);
            console.log('✅ Grid API Response:', response);
            return response;
        } catch (error) {
            console.error('❌ Grid Fetch Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch Scrap Sale Grid');
        }
    }
);

export const fetchScrapSaleDetails = createAsyncThunk(
    'scrapSale/fetchScrapSaleDetails',
    async ({ requestNo, rid }, { rejectWithValue }) => {
        try {
            console.log('🔵 Fetching Scrap Sale Details:', { requestNo, rid });
            const response = await scrapSaleAPI.getScrapSaleDetails(requestNo, rid);
            console.log('✅ Details API Response:', response);
            return response;
        } catch (error) {
            console.error('❌ Details Fetch Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch Scrap Sale Details');
        }
    }
);

export const fetchScrapSaleDataDetails = createAsyncThunk(
    'scrapSale/fetchScrapSaleDataDetails',
    async ({ requestNo, rid }, { rejectWithValue }) => {
        try {
            console.log('🔵 Fetching Scrap Sale Data Details (Items):', { requestNo, rid });
            const response = await scrapSaleAPI.getScrapSaleDataDetails(requestNo, rid);
            console.log('✅ Data Details API Response:', response);
            return response;
        } catch (error) {
            console.error('❌ Data Details Fetch Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch Scrap Sale Data Details');
        }
    }
);

export const approveScrapSale = createAsyncThunk(
    'scrapSale/approveScrapSale',
    async (approvalData, { rejectWithValue }) => {
        try {
            console.log('🔵 Approving Scrap Sale:', approvalData);
            const response = await scrapSaleAPI.approveScrapSale(approvalData);
            console.log('✅ Approval API Response:', response);
            return response;
        } catch (error) {
            console.error('❌ Approval Error:', error);
            return rejectWithValue(error.message || 'Failed to approve Scrap Sale');
        }
    }
);

const initialState = {
    scrapSaleGrid: [],
    scrapSaleDetails: null,
    scrapSaleDataDetails: null,
    approvalResult: null,
    loading: {
        scrapSaleGrid: false,
        scrapSaleDetails: false,
        scrapSaleDataDetails: false,
        approveScrapSale: false,
    },
    errors: {
        scrapSaleGrid: null,
        scrapSaleDetails: null,
        scrapSaleDataDetails: null,
        approveScrapSale: null,
    },
    selectedRoleId: null,
    selectedCreated: null,
    selectedUserId: null,
    selectedRequestNo: null,
    selectedRid: null,
    approvalStatus: null,
};

const scrapSaleSlice = createSlice({
    name: 'scrapSale',
    initialState,
    reducers: {
        setSelectedRoleId: (state, action) => {
            state.selectedRoleId = action.payload;
        },
        setSelectedCreated: (state, action) => {
            state.selectedCreated = action.payload;
        },
        setSelectedUserId: (state, action) => {
            state.selectedUserId = action.payload;
        },
        setSelectedRequestNo: (state, action) => {
            state.selectedRequestNo = action.payload;
        },
        setSelectedRid: (state, action) => {
            state.selectedRid = action.payload;
        },
        setApprovalStatus: (state, action) => {
            state.approvalStatus = action.payload;
        },
        resetScrapSaleDetails: (state) => {
            state.scrapSaleDetails = null;
            state.scrapSaleDataDetails = null;
            state.approvalResult = null;
        },
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType]) {
                state.errors[errorType] = null;
            }
        },
        resetScrapSaleState: (state) => {
            state.scrapSaleGrid = [];
            state.scrapSaleDetails = null;
            state.scrapSaleDataDetails = null;
            state.approvalResult = null;
            state.selectedRoleId = null;
            state.selectedCreated = null;
            state.selectedUserId = null;
            state.selectedRequestNo = null;
            state.selectedRid = null;
            state.approvalStatus = null;
        },
        clearApprovalResult: (state) => {
            state.approvalResult = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Scrap Sale Grid
            .addCase(fetchVerifyScrapSaleGrid.pending, (state) => {
                state.loading.scrapSaleGrid = true;
                state.errors.scrapSaleGrid = null;
            })
            .addCase(fetchVerifyScrapSaleGrid.fulfilled, (state, action) => {
                state.loading.scrapSaleGrid = false;
                const apiResponse = action.payload;
                
                console.log('🔍 Processing Grid Data:', apiResponse);
                
                // API returns Data array directly with scrap sale items
                if (apiResponse?.Data && Array.isArray(apiResponse.Data)) {
                    console.log('✅ Grid Data is array with', apiResponse.Data.length, 'items');
                    
                    // Map the grid items with correct field names
                    state.scrapSaleGrid = apiResponse.Data.map(item => ({
                        ...item,
                        // Add Tranno alias for RequestNo to maintain compatibility
                        Tranno: item.RequestNo,
                        // Keep original fields
                        RequestNo: item.RequestNo,
                        Rid: item.RId, // Note: API uses RId, not Rid
                        Date: item.RequestDate,
                        FromCC: item.CCCode,
                        Status: item.Status,
                        MOID: item.MOID,
                        Amount: item.Amount,
                        ClientName: item.ClientName
                    }));
                    
                    console.log('✅ Processed Grid Data:', state.scrapSaleGrid);
                } else {
                    console.log('⚠️ No Data array in Grid API response');
                    state.scrapSaleGrid = [];
                }
            })
            .addCase(fetchVerifyScrapSaleGrid.rejected, (state, action) => {
                state.loading.scrapSaleGrid = false;
                state.errors.scrapSaleGrid = action.payload;
                state.scrapSaleGrid = [];
            })

            // Fetch Scrap Sale Details
            .addCase(fetchScrapSaleDetails.pending, (state) => {
                state.loading.scrapSaleDetails = true;
                state.errors.scrapSaleDetails = null;
            })
            .addCase(fetchScrapSaleDetails.fulfilled, (state, action) => {
                state.loading.scrapSaleDetails = false;
                const apiResponse = action.payload;
                
                console.log('🔍 Processing Scrap Sale Details:', apiResponse);
                
                // API returns single item in Data array
                if (apiResponse?.Data && Array.isArray(apiResponse.Data) && apiResponse.Data.length > 0) {
                    const detailItem = apiResponse.Data[0];
                    console.log('✅ Details Item:', detailItem);
                    
                    state.scrapSaleDetails = {
                        ...detailItem,
                        RequestNo: detailItem.RequestNo,
                        ItemId: detailItem.ItemId,
                        MOID: detailItem.MOID,
                        SubmitDate: detailItem.SubmitDate,
                        ClientName: detailItem.ClientName,
                        SubclientName: detailItem.SubclientName,
                        VAmount: detailItem.VAmount,
                        Remarks: detailItem.Remarks || '',
                        PartyName: detailItem.PartyName,
                        PartyAddress: detailItem.PartyAddress
                    };
                    
                    console.log('✅ Processed Details:', state.scrapSaleDetails);
                    console.log('🎯 MOID:', state.scrapSaleDetails.MOID);
                } else {
                    console.log('⚠️ No Data in Details API response');
                    state.scrapSaleDetails = null;
                }
            })
            .addCase(fetchScrapSaleDetails.rejected, (state, action) => {
                state.loading.scrapSaleDetails = false;
                state.errors.scrapSaleDetails = action.payload;
                state.scrapSaleDetails = null;
            })

            // Fetch Scrap Sale Data Details (Items List)
            .addCase(fetchScrapSaleDataDetails.pending, (state) => {
                state.loading.scrapSaleDataDetails = true;
                state.errors.scrapSaleDataDetails = null;
            })
            .addCase(fetchScrapSaleDataDetails.fulfilled, (state, action) => {
                state.loading.scrapSaleDataDetails = false;
                const apiResponse = action.payload;
                
                console.log('🔍 Processing Data Details (Items):', apiResponse);
                
                // API returns items array in Data
                if (apiResponse?.Data && Array.isArray(apiResponse.Data)) {
                    console.log('✅ Items array with', apiResponse.Data.length, 'items');
                    
                    state.scrapSaleDataDetails = apiResponse.Data.map(item => ({
                        ...item,
                        ItemCode: item.ItemCode,
                        ItemName: item.ItemName,
                        Specification: item.Specification,
                        Quantity: item.Quantity,
                        Units: item.Units,
                        BasicPrice: item.BasicPrice,
                        Amount: item.Amount,
                        DcaCode: item.DcaCode,
                        SubDcaCode: item.SubDcaCode
                    }));
                    
                    console.log('✅ Processed Items:', state.scrapSaleDataDetails);
                } else {
                    console.log('⚠️ No Data array in Items API response');
                    state.scrapSaleDataDetails = [];
                }
            })
            .addCase(fetchScrapSaleDataDetails.rejected, (state, action) => {
                state.loading.scrapSaleDataDetails = false;
                state.errors.scrapSaleDataDetails = action.payload;
                state.scrapSaleDataDetails = [];
            })

            // Approve Scrap Sale
            .addCase(approveScrapSale.pending, (state) => {
                state.loading.approveScrapSale = true;
                state.errors.approveScrapSale = null;
            })
            .addCase(approveScrapSale.fulfilled, (state, action) => {
                state.loading.approveScrapSale = false;
                state.approvalResult = action.payload;
                state.approvalStatus = 'approved';
            })
            .addCase(approveScrapSale.rejected, (state, action) => {
                state.loading.approveScrapSale = false;
                state.errors.approveScrapSale = action.payload;
            });
    },
});

export const { 
    setSelectedRoleId,
    setSelectedCreated,
    setSelectedUserId,
    setSelectedRequestNo,
    setSelectedRid,
    setApprovalStatus,
    resetScrapSaleDetails,
    clearError,
    resetScrapSaleState,
    clearApprovalResult
} = scrapSaleSlice.actions;

// Selectors
export const selectScrapSaleGrid = (state) => state.scrapSale.scrapSaleGrid;
export const selectScrapSaleDetails = (state) => state.scrapSale.scrapSaleDetails;
export const selectScrapSaleDataDetails = (state) => state.scrapSale.scrapSaleDataDetails;
export const selectApprovalResult = (state) => state.scrapSale.approvalResult;
export const selectScrapSaleGridArray = (state) => {
    const grid = state.scrapSale.scrapSaleGrid;
    return Array.isArray(grid) ? grid : [];
};

export const selectLoading = (state) => state.scrapSale.loading;
export const selectScrapSaleGridLoading = (state) => state.scrapSale.loading.scrapSaleGrid;
export const selectScrapSaleDetailsLoading = (state) => state.scrapSale.loading.scrapSaleDetails;
export const selectScrapSaleDataDetailsLoading = (state) => state.scrapSale.loading.scrapSaleDataDetails;
export const selectApproveScrapSaleLoading = (state) => state.scrapSale.loading.approveScrapSale;

export const selectErrors = (state) => state.scrapSale.errors;
export const selectScrapSaleGridError = (state) => state.scrapSale.errors.scrapSaleGrid;
export const selectScrapSaleDetailsError = (state) => state.scrapSale.errors.scrapSaleDetails;
export const selectScrapSaleDataDetailsError = (state) => state.scrapSale.errors.scrapSaleDataDetails;
export const selectApproveScrapSaleError = (state) => state.scrapSale.errors.approveScrapSale;

export const selectSelectedRoleId = (state) => state.scrapSale.selectedRoleId;
export const selectSelectedCreated = (state) => state.scrapSale.selectedCreated;
export const selectSelectedUserId = (state) => state.scrapSale.selectedUserId;
export const selectSelectedRequestNo = (state) => state.scrapSale.selectedRequestNo;
export const selectSelectedRid = (state) => state.scrapSale.selectedRid;
export const selectApprovalStatus = (state) => state.scrapSale.approvalStatus;

export const selectIsAnyLoading = (state) => Object.values(state.scrapSale.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.scrapSale.errors).some(error => error !== null);

export const selectScrapSaleSummary = (state) => {
    const gridArray = Array.isArray(state.scrapSale.scrapSaleGrid) ? state.scrapSale.scrapSaleGrid : [];
    return {
        totalScrapSales: gridArray.length,
        selectedScrapSale: state.scrapSale.scrapSaleDetails,
        approvalStatus: state.scrapSale.approvalStatus,
        isProcessing: state.scrapSale.loading.approveScrapSale,
        hasScrapSales: gridArray.length > 0
    };
};

export const selectScrapSaleFullDetails = (state) => {
    const gridArray = Array.isArray(state.scrapSale.scrapSaleGrid) ? state.scrapSale.scrapSaleGrid : [];
    return {
        grid: gridArray,
        totalScrapSales: gridArray.length,
        selectedDetails: state.scrapSale.scrapSaleDetails,
        dataDetails: state.scrapSale.scrapSaleDataDetails,
        isLoading: state.scrapSale.loading.scrapSaleDetails,
        error: state.scrapSale.errors.scrapSaleDetails,
        hasScrapSales: gridArray.length > 0,
        isEmpty: gridArray.length === 0 && !state.scrapSale.loading.scrapSaleGrid
    };
};

export default scrapSaleSlice.reducer;