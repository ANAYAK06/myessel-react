import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as bulkWorkerAPI from '../../api/HRAPI/bulkWorkerRegistrationAPI';

// ==============================================
// ASYNC THUNKS
// ==============================================

export const validateWorkerData = createAsyncThunk(
    'bulkWorkerReg/validateWorkerData',
    async (params, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Validating Worker Data');
            const response = await bulkWorkerAPI.validateWorkerExcelData(params);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Validation failed');
        }
    }
);

export const saveWorkerRegistration = createAsyncThunk(
    'bulkWorkerReg/saveWorkerRegistration',
    async (params, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Saving Worker Registration');
            const response = await bulkWorkerAPI.saveWorkerStaffRegistration(params);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Registration failed');
        }
    }
);

// ==============================================
// INITIAL STATE
// ==============================================
const initialState = {
    workerList: [],
    note: '',
    validationResult: null,
    saveResult: null,
    loading: {
        validate: false,
        save: false,
    },
    errors: {
        validate: null,
        save: null,
    },
};

// ==============================================
// SLICE
// ==============================================
const bulkWorkerRegistrationSlice = createSlice({
    name: 'bulkWorkerReg',
    initialState,
    reducers: {
        setWorkerList: (state, action) => {
            state.workerList = action.payload;
            state.validationResult = null;
            state.saveResult = null;
        },
        setNote: (state, action) => {
            state.note = action.payload;
        },
        setValidationResult: (state, action) => {
            state.validationResult = action.payload;
            state.loading.validate = false;
            state.errors.validate = null;
        },
        clearValidationResult: (state) => {
            state.validationResult = null;
            state.errors.validate = null;
        },
        clearSaveResult: (state) => {
            state.saveResult = null;
            state.errors.save = null;
        },
        resetAll: (state) => {
            state.workerList = [];
            state.note = '';
            state.validationResult = null;
            state.saveResult = null;
            state.loading = { validate: false, save: false };
            state.errors = { validate: null, save: null };
        },
    },
    extraReducers: (builder) => {
        // Validate
        builder
            .addCase(validateWorkerData.pending, (state) => {
                state.loading.validate = true;
                state.errors.validate = null;
                state.validationResult = null;
            })
            .addCase(validateWorkerData.fulfilled, (state, action) => {
                state.loading.validate = false;
                state.validationResult = action.payload;
            })
            .addCase(validateWorkerData.rejected, (state, action) => {
                state.loading.validate = false;
                state.errors.validate = action.payload;
                state.validationResult = null;
            });

        // Save
        builder
            .addCase(saveWorkerRegistration.pending, (state) => {
                state.loading.save = true;
                state.errors.save = null;
                state.saveResult = null;
            })
            .addCase(saveWorkerRegistration.fulfilled, (state, action) => {
                state.loading.save = false;
                state.saveResult = action.payload;
            })
            .addCase(saveWorkerRegistration.rejected, (state, action) => {
                state.loading.save = false;
                state.errors.save = action.payload;
                state.saveResult = null;
            });
    },
});

export const {
    setWorkerList,
    setNote,
    setValidationResult,
    clearValidationResult,
    clearSaveResult,
    resetAll,
} = bulkWorkerRegistrationSlice.actions;

// ==============================================
// SELECTORS
// ==============================================
export const selectWorkerList = (state) => state.bulkWorkerReg.workerList;
export const selectWorkerListArray = (state) => {
    const list = state.bulkWorkerReg.workerList;
    return Array.isArray(list) ? list : [];
};
export const selectNote = (state) => state.bulkWorkerReg.note;
export const selectValidationResult = (state) => state.bulkWorkerReg.validationResult;
export const selectSaveResult = (state) => state.bulkWorkerReg.saveResult;
export const selectValidateLoading = (state) => state.bulkWorkerReg.loading.validate;
export const selectSaveLoading = (state) => state.bulkWorkerReg.loading.save;
export const selectValidateError = (state) => state.bulkWorkerReg.errors.validate;
export const selectSaveError = (state) => state.bulkWorkerReg.errors.save;

export const selectRegistrationSummary = (state) => {
    const workers = state.bulkWorkerReg.workerList;
    const workerArr = Array.isArray(workers) ? workers : [];
    const validationResult = state.bulkWorkerReg.validationResult;
    return {
        workerCount: workerArr.length,
        hasWorkers: workerArr.length > 0,
        isValidated: validationResult?.ErrorStatus === 'Valid',
        hasValidationErrors: (validationResult?.lstError || []).length > 0,
    };
};

export default bulkWorkerRegistrationSlice.reducer;
