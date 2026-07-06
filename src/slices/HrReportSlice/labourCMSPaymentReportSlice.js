import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as lbCmsAPI from '../../api/HRReportAPI/labourCMSPaymentReportAPI';

// ============================================================
// Async Thunks
// ============================================================

export const fetchLBCMSYears = createAsyncThunk(
    'labourcmspaymentreport/fetchLBCMSYears',
    async (params, { rejectWithValue }) => {
        try {
            return await lbCmsAPI.getLBCMSYears(params);
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Labour CMS Years');
        }
    }
);

export const fetchLBCMSContractors = createAsyncThunk(
    'labourcmspaymentreport/fetchLBCMSContractors',
    async (_, { rejectWithValue }) => {
        try {
            return await lbCmsAPI.getSalaryContractors();
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Contractors');
        }
    }
);

export const fetchLBCMSMonthsByYear = createAsyncThunk(
    'labourcmspaymentreport/fetchLBCMSMonthsByYear',
    async (params, { rejectWithValue }) => {
        try {
            return await lbCmsAPI.getCMSMonthsByYear(params);
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Labour CMS Months');
        }
    }
);

export const fetchCMSPaidLabour = createAsyncThunk(
    'labourcmspaymentreport/fetchCMSPaidLabour',
    async (params, { rejectWithValue }) => {
        try {
            return await lbCmsAPI.getCMSPaidLabour(params);
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Paid Labour list');
        }
    }
);

export const fetchCMSPaidLabourByCC = createAsyncThunk(
    'labourcmspaymentreport/fetchCMSPaidLabourByCC',
    async (params, { rejectWithValue }) => {
        try {
            return await lbCmsAPI.getCMSPaidLabourByCC(params);
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Paid Labour by Cost Centre');
        }
    }
);

export const fetchCMSPaidCCbyMonth = createAsyncThunk(
    'labourcmspaymentreport/fetchCMSPaidCCbyMonth',
    async (params, { rejectWithValue }) => {
        try {
            return await lbCmsAPI.getCMSPaidCCbyMonth(params);
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Paid Cost Centres');
        }
    }
);

export const fetchCMSPayReportLBData = createAsyncThunk(
    'labourcmspaymentreport/fetchCMSPayReportLBData',
    async (params, { rejectWithValue }) => {
        try {
            return await lbCmsAPI.getCMSPayReportLBData(params);
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Labour CMS Payment Report data');
        }
    }
);

// ============================================================
// Initial State
// ============================================================
const initialState = {
    lbCmsYears: [],
    lbCmsMonths: [],
    lbCmsContractors: [],
    cmsPaidLabours: [],
    cmsPaidLaboursByCC: [],
    cmsPaidCostCentres: [],
    cmsPayReportLBData: [],

    loading: {
        lbCmsYears: false,
        lbCmsMonths: false,
        lbCmsContractors: false,
        cmsPaidLabours: false,
        cmsPaidLaboursByCC: false,
        cmsPaidCostCentres: false,
        cmsPayReportLBData: false,
    },

    errors: {
        lbCmsYears: null,
        lbCmsMonths: null,
        lbCmsContractors: null,
        cmsPaidLabours: null,
        cmsPaidLaboursByCC: null,
        cmsPaidCostCentres: null,
        cmsPayReportLBData: null,
    },

    filters: {
        labourType: '',      // 'Own Labour' | 'Contractor'
        contractorCode: '',
        selectedYear: '',
        selectedMonth: '',
        ccCode: '',
        labourId: '',
        selectAllLabours: false,
        reportType: 'employee' // 'employee' | 'costcentre' | 'monthwise'
    }
};

// ============================================================
// Slice
// ============================================================
const labourCMSPaymentReportSlice = createSlice({
    name: 'labourcmspaymentreport',
    initialState,
    reducers: {
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        clearFilters: (state) => {
            state.filters = { ...initialState.filters };
        },
        setReportType: (state, action) => {
            state.filters.reportType = action.payload;
        },
        resetLBCMSPaymentData: (state) => {
            state.cmsPaidLabours = [];
            state.cmsPaidLaboursByCC = [];
            state.cmsPaidCostCentres = [];
            state.cmsPayReportLBData = [];
        },
        resetSelectedData: (state) => {
            state.cmsPaidLabours = [];
            state.cmsPaidLaboursByCC = [];
            state.cmsPaidCostCentres = [];
            state.cmsPayReportLBData = [];
        },
        clearMonthsData: (state) => {
            state.lbCmsMonths = [];
            state.cmsPaidLabours = [];
            state.cmsPaidLaboursByCC = [];
            state.cmsPaidCostCentres = [];
            state.cmsPayReportLBData = [];
        },
        clearYearsData: (state) => {
            state.lbCmsYears = [];
            state.lbCmsMonths = [];
            state.cmsPaidLabours = [];
            state.cmsPaidLaboursByCC = [];
            state.cmsPaidCostCentres = [];
            state.cmsPayReportLBData = [];
        },
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors.hasOwnProperty(errorType)) {
                state.errors[errorType] = null;
            }
        },
    },
    extraReducers: (builder) => {
        // Years
        builder
            .addCase(fetchLBCMSYears.pending, (state) => {
                state.loading.lbCmsYears = true;
                state.errors.lbCmsYears = null;
            })
            .addCase(fetchLBCMSYears.fulfilled, (state, action) => {
                state.loading.lbCmsYears = false;
                state.lbCmsYears = action.payload?.Data || action.payload || [];
            })
            .addCase(fetchLBCMSYears.rejected, (state, action) => {
                state.loading.lbCmsYears = false;
                state.errors.lbCmsYears = action.payload;
            });

        // Contractors
        builder
            .addCase(fetchLBCMSContractors.pending, (state) => {
                state.loading.lbCmsContractors = true;
                state.errors.lbCmsContractors = null;
            })
            .addCase(fetchLBCMSContractors.fulfilled, (state, action) => {
                state.loading.lbCmsContractors = false;
                state.lbCmsContractors = action.payload?.Data || action.payload || [];
            })
            .addCase(fetchLBCMSContractors.rejected, (state, action) => {
                state.loading.lbCmsContractors = false;
                state.errors.lbCmsContractors = action.payload;
            });

        // Months by Year
        builder
            .addCase(fetchLBCMSMonthsByYear.pending, (state) => {
                state.loading.lbCmsMonths = true;
                state.errors.lbCmsMonths = null;
            })
            .addCase(fetchLBCMSMonthsByYear.fulfilled, (state, action) => {
                state.loading.lbCmsMonths = false;
                state.lbCmsMonths = action.payload?.Data || action.payload || [];
            })
            .addCase(fetchLBCMSMonthsByYear.rejected, (state, action) => {
                state.loading.lbCmsMonths = false;
                state.errors.lbCmsMonths = action.payload;
            });

        // Paid Labour list (Employee view)
        builder
            .addCase(fetchCMSPaidLabour.pending, (state) => {
                state.loading.cmsPaidLabours = true;
                state.errors.cmsPaidLabours = null;
            })
            .addCase(fetchCMSPaidLabour.fulfilled, (state, action) => {
                state.loading.cmsPaidLabours = false;
                state.cmsPaidLabours = action.payload?.Data || action.payload || [];
            })
            .addCase(fetchCMSPaidLabour.rejected, (state, action) => {
                state.loading.cmsPaidLabours = false;
                state.errors.cmsPaidLabours = action.payload;
            });

        // Paid Labour by Cost Centre
        builder
            .addCase(fetchCMSPaidLabourByCC.pending, (state) => {
                state.loading.cmsPaidLaboursByCC = true;
                state.errors.cmsPaidLaboursByCC = null;
            })
            .addCase(fetchCMSPaidLabourByCC.fulfilled, (state, action) => {
                state.loading.cmsPaidLaboursByCC = false;
                state.cmsPaidLaboursByCC = action.payload?.Data || action.payload || [];
            })
            .addCase(fetchCMSPaidLabourByCC.rejected, (state, action) => {
                state.loading.cmsPaidLaboursByCC = false;
                state.errors.cmsPaidLaboursByCC = action.payload;
            });

        // Paid Cost Centres by Month
        builder
            .addCase(fetchCMSPaidCCbyMonth.pending, (state) => {
                state.loading.cmsPaidCostCentres = true;
                state.errors.cmsPaidCostCentres = null;
            })
            .addCase(fetchCMSPaidCCbyMonth.fulfilled, (state, action) => {
                state.loading.cmsPaidCostCentres = false;
                state.cmsPaidCostCentres = action.payload?.Data || action.payload || [];
            })
            .addCase(fetchCMSPaidCCbyMonth.rejected, (state, action) => {
                state.loading.cmsPaidCostCentres = false;
                state.errors.cmsPaidCostCentres = action.payload;
            });

        // Main Report Data
        builder
            .addCase(fetchCMSPayReportLBData.pending, (state) => {
                state.loading.cmsPayReportLBData = true;
                state.errors.cmsPayReportLBData = null;
            })
            .addCase(fetchCMSPayReportLBData.fulfilled, (state, action) => {
                state.loading.cmsPayReportLBData = false;
                state.cmsPayReportLBData = action.payload;
            })
            .addCase(fetchCMSPayReportLBData.rejected, (state, action) => {
                state.loading.cmsPayReportLBData = false;
                state.errors.cmsPayReportLBData = action.payload;
            });
    },
});

export const {
    setFilters,
    clearFilters,
    setReportType,
    resetLBCMSPaymentData,
    resetSelectedData,
    clearMonthsData,
    clearYearsData,
    clearError,
} = labourCMSPaymentReportSlice.actions;

// ============================================================
// Selectors
// ============================================================
export const selectLBCMSYears = (state) => state.labourcmspaymentreport.lbCmsYears;
export const selectLBCMSMonths = (state) => state.labourcmspaymentreport.lbCmsMonths;
export const selectLBCMSContractors = (state) => state.labourcmspaymentreport.lbCmsContractors;
export const selectCMSPaidLabours = (state) => state.labourcmspaymentreport.cmsPaidLabours;
export const selectCMSPaidLaboursByCC = (state) => state.labourcmspaymentreport.cmsPaidLaboursByCC;
export const selectCMSPaidCostCentres = (state) => state.labourcmspaymentreport.cmsPaidCostCentres;
export const selectCMSPayReportLBData = (state) => state.labourcmspaymentreport.cmsPayReportLBData;

export const selectLoading = (state) => state.labourcmspaymentreport.loading;
export const selectErrors = (state) => state.labourcmspaymentreport.errors;
export const selectFilters = (state) => state.labourcmspaymentreport.filters;

export const selectIsAnyLoading = (state) =>
    Object.values(state.labourcmspaymentreport.loading).some(Boolean);

export default labourCMSPaymentReportSlice.reducer;
