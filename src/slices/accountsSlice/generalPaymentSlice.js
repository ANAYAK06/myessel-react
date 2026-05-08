import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as generalPaymentAPI from '../../api/AccountsAPI/generalPaymentAPI';

export const submitGeneralPayment = createAsyncThunk(
    'generalPayment/submit',
    async (params, { rejectWithValue }) => {
        try {
            return await generalPaymentAPI.saveGeneralPayment(params);
        } catch (err) {
            return rejectWithValue(err?.Message || err?.message || 'Failed to save general payment');
        }
    }
);

const initialState = {
    saveStatus: null,   // null | 'pending' | 'success' | 'failed'
    saveError:  null,
};

const generalPaymentSlice = createSlice({
    name: 'generalPayment',
    initialState,
    reducers: {
        clearSaveResult: (state) => {
            state.saveStatus = null;
            state.saveError  = null;
        },
        resetGeneralPayment: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(submitGeneralPayment.pending, (state) => {
                state.saveStatus = 'pending';
                state.saveError  = null;
            })
            .addCase(submitGeneralPayment.fulfilled, (state, action) => {
                const result = action.payload?.GeneralPaymentSucess
                    || action.payload?.Data
                    || action.payload?.Message
                    || '';
                state.saveStatus = result.toLowerCase().includes('submitted') || result.toLowerCase().includes('success')
                    ? 'success'
                    : 'failed';
                state.saveError = state.saveStatus === 'failed' ? (result || 'Submission failed') : null;
            })
            .addCase(submitGeneralPayment.rejected, (state, action) => {
                state.saveStatus = 'failed';
                state.saveError  = action.payload;
            });
    },
});

export const { clearSaveResult, resetGeneralPayment } = generalPaymentSlice.actions;

export const selectGpSaveStatus  = (s) => s.generalPayment.saveStatus;
export const selectGpSaveLoading = (s) => s.generalPayment.saveStatus === 'pending';
export const selectGpSaveError   = (s) => s.generalPayment.saveError;

export default generalPaymentSlice.reducer;
