import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as labourAttAPI from '../../api/HRReportAPI/labourAttendanceReportAPI';

// ============================================================
// Async Thunks
// ============================================================

export const fetchAttReportContractors = createAsyncThunk(
    'labourattendancereport/fetchContractors',
    async (_, { rejectWithValue }) => {
        try {
            return await labourAttAPI.getAttReportContractors();
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch contractors');
        }
    }
);

export const fetchLabourAttData = createAsyncThunk(
    'labourattendancereport/fetchLabourAttData',
    async (params, { rejectWithValue }) => {
        try {
            return await labourAttAPI.getLabourAttData(params);
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch labour attendance data');
        }
    }
);

export const fetchLabourMonthAttData = createAsyncThunk(
    'labourattendancereport/fetchLabourMonthAttData',
    async (params, { rejectWithValue }) => {
        try {
            return await labourAttAPI.getLabourMonthAttData(params);
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch monthly attendance summary');
        }
    }
);

export const fetchLabourCCForAttReport = createAsyncThunk(
    'labourattendancereport/fetchLabourCCList',
    async (params, { rejectWithValue }) => {
        try {
            return await labourAttAPI.getLabourCCForAttReport(params);
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch CC list');
        }
    }
);

export const fetchAttLabourById = createAsyncThunk(
    'labourattendancereport/fetchLabourSearch',
    async (params, { rejectWithValue }) => {
        try {
            return await labourAttAPI.getAttLabourById(params);
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to search labours');
        }
    }
);

// ============================================================
// Initial State
// ============================================================
const initialState = {
    contractors: [],
    labourAttData: [],
    labourMonthAttData: [],
    labourCCList: [],
    labourSearchResults: [],

    loading: {
        contractors: false,
        labourAttData: false,
        labourMonthAttData: false,
        labourCCList: false,
        labourSearch: false,
    },
    errors: {
        contractors: null,
        labourAttData: null,
        labourMonthAttData: null,
        labourCCList: null,
        labourSearch: null,
    },

    // UI Filters
    filters: {
        searchType: 'id',           // 'id' | 'cc'
        labourType: 'Own Labour',   // 'Own Labour' | 'Contractor'
        contractorCode: '',
        selectedMonth: '',
        selectedYear: '',
        typeValue: '',              // LabourId or CC Code
    },
};

// ============================================================
// Slice
// ============================================================
const labourAttendanceReportSlice = createSlice({
    name: 'labourattendancereport',
    initialState,
    reducers: {
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        clearFilters: (state) => {
            state.filters = { ...initialState.filters };
        },
        resetLabourAttData: (state) => {
            state.labourAttData = [];
            state.labourMonthAttData = [];
        },
        resetLabourCCList: (state) => {
            state.labourCCList = [];
        },
        resetLabourSearch: (state) => {
            state.labourSearchResults = [];
        },
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors.hasOwnProperty(errorType)) {
                state.errors[errorType] = null;
            }
        },
    },
    extraReducers: (builder) => {
        // Contractors
        builder
            .addCase(fetchAttReportContractors.pending, (state) => {
                state.loading.contractors = true;
                state.errors.contractors = null;
            })
            .addCase(fetchAttReportContractors.fulfilled, (state, action) => {
                state.loading.contractors = false;
                state.contractors = action.payload;
            })
            .addCase(fetchAttReportContractors.rejected, (state, action) => {
                state.loading.contractors = false;
                state.errors.contractors = action.payload;
            });

        // Labour Att Data (day-by-day)
        builder
            .addCase(fetchLabourAttData.pending, (state) => {
                state.loading.labourAttData = true;
                state.errors.labourAttData = null;
            })
            .addCase(fetchLabourAttData.fulfilled, (state, action) => {
                state.loading.labourAttData = false;
                state.labourAttData = action.payload;
            })
            .addCase(fetchLabourAttData.rejected, (state, action) => {
                state.loading.labourAttData = false;
                state.errors.labourAttData = action.payload;
            });

        // Monthly Summary
        builder
            .addCase(fetchLabourMonthAttData.pending, (state) => {
                state.loading.labourMonthAttData = true;
                state.errors.labourMonthAttData = null;
            })
            .addCase(fetchLabourMonthAttData.fulfilled, (state, action) => {
                state.loading.labourMonthAttData = false;
                state.labourMonthAttData = action.payload;
            })
            .addCase(fetchLabourMonthAttData.rejected, (state, action) => {
                state.loading.labourMonthAttData = false;
                state.errors.labourMonthAttData = action.payload;
            });

        // CC List
        builder
            .addCase(fetchLabourCCForAttReport.pending, (state) => {
                state.loading.labourCCList = true;
                state.errors.labourCCList = null;
            })
            .addCase(fetchLabourCCForAttReport.fulfilled, (state, action) => {
                state.loading.labourCCList = false;
                state.labourCCList = action.payload;
            })
            .addCase(fetchLabourCCForAttReport.rejected, (state, action) => {
                state.loading.labourCCList = false;
                state.errors.labourCCList = action.payload;
            });

        // Labour Search
        builder
            .addCase(fetchAttLabourById.pending, (state) => {
                state.loading.labourSearch = true;
                state.errors.labourSearch = null;
            })
            .addCase(fetchAttLabourById.fulfilled, (state, action) => {
                state.loading.labourSearch = false;
                state.labourSearchResults = action.payload;
            })
            .addCase(fetchAttLabourById.rejected, (state, action) => {
                state.loading.labourSearch = false;
                state.errors.labourSearch = action.payload;
            });
    },
});

export const {
    setFilters,
    clearFilters,
    resetLabourAttData,
    resetLabourCCList,
    resetLabourSearch,
    clearError,
} = labourAttendanceReportSlice.actions;

// ============================================================
// Selectors
// ============================================================
export const selectContractors        = (state) => state.labourattendancereport.contractors;
export const selectLabourAttData      = (state) => state.labourattendancereport.labourAttData;
export const selectLabourMonthAttData = (state) => state.labourattendancereport.labourMonthAttData;
export const selectLabourCCList       = (state) => state.labourattendancereport.labourCCList;
export const selectLabourSearchResults= (state) => state.labourattendancereport.labourSearchResults;
export const selectLoading            = (state) => state.labourattendancereport.loading;
export const selectErrors             = (state) => state.labourattendancereport.errors;
export const selectFilters            = (state) => state.labourattendancereport.filters;
export const selectIsAnyLoading       = (state) =>
    Object.values(state.labourattendancereport.loading).some(Boolean);

export default labourAttendanceReportSlice.reducer;
