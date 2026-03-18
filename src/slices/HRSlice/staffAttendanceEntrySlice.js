import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as staffAttendanceEntryAPI from '../../api/HRAPI/staffAttendanceEntryAPI';

// ==============================================
// ASYNC THUNKS
// ==============================================

export const fetchAllEmpCostCenters = createAsyncThunk(
    'staffAttendanceEntry/fetchAllEmpCostCenters',
    async (_, { rejectWithValue }) => {
        try {
            const response = await staffAttendanceEntryAPI.getAllEmpCostCenters();
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch cost centers');
        }
    }
);

export const fetchCCHolidays = createAsyncThunk(
    'staffAttendanceEntry/fetchCCHolidays',
    async (ccCode, { rejectWithValue }) => {
        try {
            const response = await staffAttendanceEntryAPI.getCCHolidays(ccCode);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch holidays');
        }
    }
);

export const fetchCCMinJoiningDate = createAsyncThunk(
    'staffAttendanceEntry/fetchCCMinJoiningDate',
    async (ccCode, { rejectWithValue }) => {
        try {
            const response = await staffAttendanceEntryAPI.getCCMinJoiningDate(ccCode);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch min joining date');
        }
    }
);

export const fetchCheckPreviousAttendance = createAsyncThunk(
    'staffAttendanceEntry/fetchCheckPreviousAttendance',
    async ({ ccCode, attDate }, { rejectWithValue }) => {
        try {
            const response = await staffAttendanceEntryAPI.checkPreviousAttendance(ccCode, attDate);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to check previous attendance');
        }
    }
);

export const fetchCCEmpDataForAttendance = createAsyncThunk(
    'staffAttendanceEntry/fetchCCEmpDataForAttendance',
    async ({ ccCode, attDate }, { rejectWithValue }) => {
        try {
            const response = await staffAttendanceEntryAPI.getCCEmpDataForAttendance(ccCode, attDate);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch employee attendance data');
        }
    }
);

export const saveStaffAttendance = createAsyncThunk(
    'staffAttendanceEntry/saveStaffAttendance',
    async (params, { rejectWithValue }) => {
        try {
            const response = await staffAttendanceEntryAPI.saveStaffAttendance(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to save staff attendance');
        }
    }
);

// ==============================================
// HELPERS
// ==============================================

// Map backend AttendanceType (full word) → short code used in UI/save
const mapDefaultAttType = (attType) => {
    switch ((attType || '').toLowerCase()) {
        case 'sunday':   return 'S';
        case 'saturday': return 'S';
        case 'holiday':  return 'H';
        default:         return 'P';
    }
};

// Save succeeds when Data === "Submited" or IsSuccessful === true
const resolveSaveStatus = (payload) => {
    const dataVal = payload?.Data;
    const responseStr = typeof dataVal === 'string'
        ? dataVal
        : (payload?.Message || 'Save failed');
    const isSuccess = payload?.IsSuccessful === true ||
        (typeof responseStr === 'string' && responseStr.toLowerCase().includes('submit'));
    return { isSuccess, responseStr };
};

// ==============================================
// INITIAL STATE
// ==============================================
const initialState = {
    // ── Filter Data ─────────────────────────────────────────────────────────────
    costCenters:      [],
    holidays:         [],      // array of holiday date strings from GetCCHolidays
    minDate:          null,    // string "01-Jan-2023"
    prevAttendance:   null,    // { SundayAttendance, SaturdayAttendance }

    // ── Employee List + Local Attendance State ───────────────────────────────────
    employeeList:     [],      // raw lstEmps from API
    localAttendance:  {},      // { [EmpId]: 'P' | 'H' | 'A' | 'HD' | 'S' | 'PL' | 'T' }

    // ── Save ─────────────────────────────────────────────────────────────────────
    saveResult:   null,
    saveStatus:   null,

    // ── Loading ──────────────────────────────────────────────────────────────────
    loading: {
        costCenters:    false,
        holidays:       false,
        minDate:        false,
        prevAttendance: false,
        employeeList:   false,
        save:           false,
    },

    // ── Errors ───────────────────────────────────────────────────────────────────
    errors: {
        costCenters:    null,
        holidays:       null,
        minDate:        null,
        prevAttendance: null,
        employeeList:   null,
        save:           null,
    },
};

// ==============================================
// SLICE
// ==============================================
const staffAttendanceEntrySlice = createSlice({
    name: 'staffAttendanceEntry',
    initialState,
    reducers: {
        // Set single employee attendance type
        setAttendanceType: (state, action) => {
            const { empId, attType } = action.payload;
            state.localAttendance[empId] = attType;
        },

        // Bulk set all employees to same type
        setAllAttendanceType: (state, action) => {
            const { attType } = action.payload;
            Object.keys(state.localAttendance).forEach((empId) => {
                state.localAttendance[empId] = attType;
            });
        },

        clearEmployeeList: (state) => {
            state.employeeList    = [];
            state.localAttendance = {};
            state.prevAttendance  = null;
            state.errors.employeeList   = null;
            state.errors.prevAttendance = null;
        },

        clearCCData: (state) => {
            state.holidays    = [];
            state.minDate     = null;
            state.employeeList    = [];
            state.localAttendance = {};
            state.prevAttendance  = null;
        },

        clearSaveResult: (state) => {
            state.saveResult  = null;
            state.saveStatus  = null;
            state.errors.save = null;
        },

        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType] !== undefined) {
                state.errors[errorType] = null;
            }
        },

        resetAll: () => initialState,
    },

    extraReducers: (builder) => {

        // ── Fetch Cost Centers ───────────────────────────────────────────────────
        builder
            .addCase(fetchAllEmpCostCenters.pending, (state) => {
                state.loading.costCenters = true;
                state.errors.costCenters  = null;
            })
            .addCase(fetchAllEmpCostCenters.fulfilled, (state, action) => {
                state.loading.costCenters = false;
                state.costCenters = action.payload?.Data || action.payload || [];
            })
            .addCase(fetchAllEmpCostCenters.rejected, (state, action) => {
                state.loading.costCenters = false;
                state.errors.costCenters  = action.payload;
                state.costCenters         = [];
            });

        // ── Fetch Holidays ───────────────────────────────────────────────────────
        builder
            .addCase(fetchCCHolidays.pending, (state) => {
                state.loading.holidays = true;
                state.errors.holidays  = null;
            })
            .addCase(fetchCCHolidays.fulfilled, (state, action) => {
                state.loading.holidays = false;
                const data = action.payload?.Data || {};
                state.holidays = data.AllHolidays?.map((h) => h.holiday) || [];
            })
            .addCase(fetchCCHolidays.rejected, (state, action) => {
                state.loading.holidays = false;
                state.errors.holidays  = action.payload;
                state.holidays         = [];
            });

        // ── Fetch Min Joining Date ───────────────────────────────────────────────
        builder
            .addCase(fetchCCMinJoiningDate.pending, (state) => {
                state.loading.minDate = true;
                state.errors.minDate  = null;
            })
            .addCase(fetchCCMinJoiningDate.fulfilled, (state, action) => {
                state.loading.minDate = false;
                state.minDate = action.payload?.Data || null;
            })
            .addCase(fetchCCMinJoiningDate.rejected, (state, action) => {
                state.loading.minDate = false;
                state.errors.minDate  = action.payload;
                state.minDate         = null;
            });

        // ── Check Previous Attendance ────────────────────────────────────────────
        builder
            .addCase(fetchCheckPreviousAttendance.pending, (state) => {
                state.loading.prevAttendance = true;
                state.errors.prevAttendance  = null;
            })
            .addCase(fetchCheckPreviousAttendance.fulfilled, (state, action) => {
                state.loading.prevAttendance = false;
                state.prevAttendance = action.payload?.Data || null;
            })
            .addCase(fetchCheckPreviousAttendance.rejected, (state, action) => {
                state.loading.prevAttendance = false;
                state.errors.prevAttendance  = action.payload;
                state.prevAttendance         = null;
            });

        // ── Fetch Employee Data For Attendance ───────────────────────────────────
        builder
            .addCase(fetchCCEmpDataForAttendance.pending, (state) => {
                state.loading.employeeList = true;
                state.errors.employeeList  = null;
                state.employeeList    = [];
                state.localAttendance = {};
            })
            .addCase(fetchCCEmpDataForAttendance.fulfilled, (state, action) => {
                state.loading.employeeList = false;
                console.log('✅ Emp Data For Attendance fulfilled:', action.payload);
                const data = action.payload?.Data || action.payload || {};
                const emps = data.lstEmps || [];
                state.employeeList = emps;
                // Initialize local attendance from API defaults
                const defaults = {};
                emps.forEach((emp) => {
                    defaults[emp.EmpId] = mapDefaultAttType(emp.AttendanceType);
                });
                state.localAttendance = defaults;
            })
            .addCase(fetchCCEmpDataForAttendance.rejected, (state, action) => {
                state.loading.employeeList = false;
                state.errors.employeeList  = action.payload;
                state.employeeList    = [];
                state.localAttendance = {};
            });

        // ── Save Staff Attendance ────────────────────────────────────────────────
        builder
            .addCase(saveStaffAttendance.pending, (state) => {
                state.loading.save = true;
                state.errors.save  = null;
                state.saveStatus   = 'pending';
            })
            .addCase(saveStaffAttendance.fulfilled, (state, action) => {
                state.loading.save = false;
                console.log('✅ Save Staff Attendance fulfilled - Raw Response:', action.payload);
                state.saveResult = action.payload;
                const { isSuccess, responseStr } = resolveSaveStatus(action.payload);
                if (isSuccess) {
                    state.saveStatus = 'success';
                } else {
                    state.saveStatus  = 'failed';
                    state.errors.save = responseStr || 'Save attendance failed';
                }
            })
            .addCase(saveStaffAttendance.rejected, (state, action) => {
                state.loading.save = false;
                state.errors.save  = action.payload;
                state.saveStatus   = 'failed';
                state.saveResult   = null;
            });
    },
});

// ==============================================
// EXPORT ACTIONS
// ==============================================
export const {
    setAttendanceType,
    setAllAttendanceType,
    clearEmployeeList,
    clearCCData,
    clearSaveResult,
    clearError,
    resetAll,
} = staffAttendanceEntrySlice.actions;

// ==============================================
// SELECTORS
// ==============================================
export const selectCostCenters        = (state) => state.staffAttendanceEntry.costCenters;
export const selectCostCentersArray   = (state) => {
    const d = state.staffAttendanceEntry.costCenters;
    return Array.isArray(d) ? d : [];
};
export const selectCostCentersLoading = (state) => state.staffAttendanceEntry.loading.costCenters;

export const selectHolidays           = (state) => state.staffAttendanceEntry.holidays;
export const selectMinDate            = (state) => state.staffAttendanceEntry.minDate;
export const selectPrevAttendance     = (state) => state.staffAttendanceEntry.prevAttendance;

export const selectEmployeeList       = (state) => state.staffAttendanceEntry.employeeList;
export const selectEmployeeListArray  = (state) => {
    const d = state.staffAttendanceEntry.employeeList;
    return Array.isArray(d) ? d : [];
};
export const selectLocalAttendance    = (state) => state.staffAttendanceEntry.localAttendance;
export const selectEmployeeListLoading = (state) => state.staffAttendanceEntry.loading.employeeList;
export const selectEmployeeListError   = (state) => state.staffAttendanceEntry.errors.employeeList;

export const selectPrevAttendanceLoading = (state) => state.staffAttendanceEntry.loading.prevAttendance;
export const selectMinDateLoading        = (state) => state.staffAttendanceEntry.loading.minDate;

export const selectSaveResult   = (state) => state.staffAttendanceEntry.saveResult;
export const selectSaveStatus   = (state) => state.staffAttendanceEntry.saveStatus;
export const selectSaveLoading  = (state) => state.staffAttendanceEntry.loading.save;
export const selectSaveError    = (state) => state.staffAttendanceEntry.errors.save;

export const selectIsAnyLoading = (state) =>
    Object.values(state.staffAttendanceEntry.loading).some(Boolean);

// Attendance summary counts
export const selectAttendanceSummary = (state) => {
    const att = state.staffAttendanceEntry.localAttendance;
    const counts = { P: 0, H: 0, A: 0, HD: 0, S: 0, PL: 0, T: 0 };
    Object.values(att).forEach((t) => { if (counts[t] !== undefined) counts[t]++; });
    return { ...counts, total: Object.keys(att).length };
};

// ==============================================
// EXPORT REDUCER
// ==============================================
export default staffAttendanceEntrySlice.reducer;
