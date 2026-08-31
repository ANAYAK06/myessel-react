import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as reportingConfigAPI from '../../api/HRAPI/staffReportingConfigAPI';

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchEmployeesForReportingConfig = createAsyncThunk(
    'staffReportingConfig/fetchEmployeesForReportingConfig',
    async (_, { rejectWithValue }) => {
        try {
            return await reportingConfigAPI.getEmployeesForReportingConfig();
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch employee list');
        }
    }
);

export const fetchDefaultReportingPerson = createAsyncThunk(
    'staffReportingConfig/fetchDefaultReportingPerson',
    async (_, { rejectWithValue }) => {
        try {
            return await reportingConfigAPI.getDefaultReportingPerson();
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch default reporting person');
        }
    }
);

export const saveDefaultReportingPerson = createAsyncThunk(
    'staffReportingConfig/saveDefaultReportingPerson',
    async (data, { rejectWithValue }) => {
        try {
            return await reportingConfigAPI.saveDefaultReportingPerson(data);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to save default reporting person');
        }
    }
);

export const fetchReportingConnectionGrid = createAsyncThunk(
    'staffReportingConfig/fetchReportingConnectionGrid',
    async (_, { rejectWithValue }) => {
        try {
            return await reportingConfigAPI.getEmployeesForReportingConnectionGrid();
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch reporting connection grid');
        }
    }
);

export const saveEmployeeReportingConnection = createAsyncThunk(
    'staffReportingConfig/saveEmployeeReportingConnection',
    async (data, { rejectWithValue }) => {
        try {
            return await reportingConfigAPI.saveEmployeeReportingConnection(data);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to save reporting connection');
        }
    }
);

// ─── Helper ───────────────────────────────────────────────────────────────────
const isSubmitSuccess = (dataVal) => {
    if (typeof dataVal !== 'string' || !dataVal) return false;
    return dataVal.toLowerCase().includes('submit');
};

const asArray = (payload) =>
    Array.isArray(payload?.Data) ? payload.Data : Array.isArray(payload) ? payload : [];

// ─── Initial State ────────────────────────────────────────────────────────────
const initialState = {
    employeeOptions: [],
    defaultReportingPerson: null,
    connectionGrid: [],

    defaultSaveResult: null,
    defaultSaveStatus: null,   // null | 'pending' | 'success' | 'failed'

    connectionSaveResult: null,
    connectionSaveStatus: null, // null | 'pending' | 'success' | 'failed'

    loading: {
        employeeOptions: false,
        defaultReportingPerson: false,
        defaultSave: false,
        connectionGrid: false,
        connectionSave: false,
    },
    errors: {
        employeeOptions: null,
        defaultReportingPerson: null,
        defaultSave: null,
        connectionGrid: null,
        connectionSave: null,
    },
};

// ─── Slice ────────────────────────────────────────────────────────────────────
const staffReportingConfigSlice = createSlice({
    name: 'staffReportingConfig',
    initialState,
    reducers: {
        clearDefaultSaveResult(state) {
            state.defaultSaveResult = null;
            state.defaultSaveStatus = null;
            state.errors.defaultSave = null;
        },
        clearConnectionSaveResult(state) {
            state.connectionSaveResult = null;
            state.connectionSaveStatus = null;
            state.errors.connectionSave = null;
        },
        resetAll: () => initialState,
    },
    extraReducers: (builder) => {

        // 1. fetchEmployeesForReportingConfig
        builder
            .addCase(fetchEmployeesForReportingConfig.pending, (state) => {
                state.loading.employeeOptions = true;
                state.errors.employeeOptions = null;
            })
            .addCase(fetchEmployeesForReportingConfig.fulfilled, (state, action) => {
                state.loading.employeeOptions = false;
                state.employeeOptions = asArray(action.payload);
            })
            .addCase(fetchEmployeesForReportingConfig.rejected, (state, action) => {
                state.loading.employeeOptions = false;
                state.errors.employeeOptions = action.payload;
                state.employeeOptions = [];
            });

        // 2. fetchDefaultReportingPerson
        builder
            .addCase(fetchDefaultReportingPerson.pending, (state) => {
                state.loading.defaultReportingPerson = true;
                state.errors.defaultReportingPerson = null;
            })
            .addCase(fetchDefaultReportingPerson.fulfilled, (state, action) => {
                state.loading.defaultReportingPerson = false;
                state.defaultReportingPerson = action.payload?.Data || null;
            })
            .addCase(fetchDefaultReportingPerson.rejected, (state, action) => {
                state.loading.defaultReportingPerson = false;
                state.errors.defaultReportingPerson = action.payload;
                state.defaultReportingPerson = null;
            });

        // 3. saveDefaultReportingPerson
        builder
            .addCase(saveDefaultReportingPerson.pending, (state) => {
                state.loading.defaultSave = true;
                state.defaultSaveStatus = 'pending';
                state.errors.defaultSave = null;
                state.defaultSaveResult = null;
            })
            .addCase(saveDefaultReportingPerson.fulfilled, (state, action) => {
                state.loading.defaultSave = false;
                const resultText = action.payload?.Data;
                state.defaultSaveResult = resultText;
                state.defaultSaveStatus = isSubmitSuccess(resultText) ? 'success' : 'failed';
                if (!isSubmitSuccess(resultText)) {
                    state.errors.defaultSave = resultText || 'Failed to save default reporting person';
                }
            })
            .addCase(saveDefaultReportingPerson.rejected, (state, action) => {
                state.loading.defaultSave = false;
                state.defaultSaveStatus = 'failed';
                state.errors.defaultSave = action.payload;
            });

        // 4. fetchReportingConnectionGrid
        builder
            .addCase(fetchReportingConnectionGrid.pending, (state) => {
                state.loading.connectionGrid = true;
                state.errors.connectionGrid = null;
            })
            .addCase(fetchReportingConnectionGrid.fulfilled, (state, action) => {
                state.loading.connectionGrid = false;
                state.connectionGrid = asArray(action.payload);
            })
            .addCase(fetchReportingConnectionGrid.rejected, (state, action) => {
                state.loading.connectionGrid = false;
                state.errors.connectionGrid = action.payload;
                state.connectionGrid = [];
            });

        // 5. saveEmployeeReportingConnection
        builder
            .addCase(saveEmployeeReportingConnection.pending, (state) => {
                state.loading.connectionSave = true;
                state.connectionSaveStatus = 'pending';
                state.errors.connectionSave = null;
                state.connectionSaveResult = null;
            })
            .addCase(saveEmployeeReportingConnection.fulfilled, (state, action) => {
                state.loading.connectionSave = false;
                const resultText = action.payload?.Data;
                state.connectionSaveResult = resultText;
                state.connectionSaveStatus = isSubmitSuccess(resultText) ? 'success' : 'failed';
                if (!isSubmitSuccess(resultText)) {
                    state.errors.connectionSave = resultText || 'Failed to save reporting connection';
                }
            })
            .addCase(saveEmployeeReportingConnection.rejected, (state, action) => {
                state.loading.connectionSave = false;
                state.connectionSaveStatus = 'failed';
                state.errors.connectionSave = action.payload;
            });
    },
});

export const {
    clearDefaultSaveResult,
    clearConnectionSaveResult,
    resetAll,
} = staffReportingConfigSlice.actions;

export default staffReportingConfigSlice.reducer;
