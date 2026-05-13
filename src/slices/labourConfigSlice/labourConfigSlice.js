import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getAllCostCenters,
    getDCAForHR,
    getSubDCAByDCA,
    getMinWageConfig,
    saveMinWageConfig,
    getDesignations,
    saveDesignation,
    getWageAccountConfig,
    saveWageAccountConfig,
    getWageComponents,
    getHolidays,
    saveHoliday,
    deleteHoliday,
    getPFConfig,
    savePFConfig,
    getESIConfig,
    saveESIConfig,
    getPTConfig,
    savePTConfig,
    getPTSlabs,
    savePTSlab,
    deletePTSlab,
    getLWFConfig,
    saveLWFConfig,
} from '../../api/LabourConfigAPI/labourConfigAPI';

// ── Async Thunks ───────────────────────────────────────────────────────────────

export const fetchAllCostCenters = createAsyncThunk(
    'labourConfig/fetchAllCostCenters',
    async (_, { rejectWithValue }) => {
        try {
            const res = await getAllCostCenters();
            return res?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.Message || err?.message || 'Failed to fetch cost centres');
        }
    }
);

export const fetchDCAForHR = createAsyncThunk(
    'labourConfig/fetchDCAForHR',
    async (_, { rejectWithValue }) => {
        try {
            const res = await getDCAForHR();
            return res?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.Message || err?.message || 'Failed to fetch DCA list');
        }
    }
);

export const fetchSubDCAByDCA = createAsyncThunk(
    'labourConfig/fetchSubDCAByDCA',
    async (dcaCode, { rejectWithValue }) => {
        try {
            const res = await getSubDCAByDCA(dcaCode);
            return res?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.Message || err?.message || 'Failed to fetch Sub DCA list');
        }
    }
);

export const fetchMinWageConfig = createAsyncThunk(
    'labourConfig/fetchMinWageConfig',
    async ({ ccCode, category } = {}, { rejectWithValue }) => {
        try {
            const res = await getMinWageConfig({ ccCode, category });
            return res?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.Message || err?.message || 'Failed to fetch minimum wage config');
        }
    }
);

export const submitMinWageConfig = createAsyncThunk(
    'labourConfig/submitMinWageConfig',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await saveMinWageConfig(payload);
            return res?.Data || res;
        } catch (err) {
            return rejectWithValue(err?.Message || err?.message || 'Failed to save minimum wage config');
        }
    }
);

export const fetchDesignations = createAsyncThunk(
    'labourConfig/fetchDesignations',
    async ({ status } = {}, { rejectWithValue }) => {
        try {
            const res = await getDesignations({ status });
            return res?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.Message || err?.message || 'Failed to fetch designations');
        }
    }
);

export const submitDesignation = createAsyncThunk(
    'labourConfig/submitDesignation',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await saveDesignation(payload);
            return res?.Data || res;
        } catch (err) {
            return rejectWithValue(err?.Message || err?.message || 'Failed to save designation');
        }
    }
);

export const fetchWageComponents = createAsyncThunk(
    'labourConfig/fetchWageComponents',
    async (_, { rejectWithValue }) => {
        try {
            const res = await getWageComponents();
            return res?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.Message || err?.message || 'Failed to fetch wage components');
        }
    }
);

export const fetchWageAccountConfig = createAsyncThunk(
    'labourConfig/fetchWageAccountConfig',
    async ({ ccCode } = {}, { rejectWithValue }) => {
        try {
            const res = await getWageAccountConfig({ ccCode });
            return res?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.Message || err?.message || 'Failed to fetch wage account config');
        }
    }
);

export const submitWageAccountConfig = createAsyncThunk(
    'labourConfig/submitWageAccountConfig',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await saveWageAccountConfig(payload);
            return res?.Data || res;
        } catch (err) {
            const detail = err?.ErrorDetails?.ErrorMessage;
            const msg = err?.Message || err?.message || 'Failed to save wage account config';
            return rejectWithValue(detail ? `${msg}: ${detail}` : msg);
        }
    }
);

export const fetchHolidays = createAsyncThunk(
    'labourConfig/fetchHolidays',
    async ({ ccCode, year } = {}, { rejectWithValue }) => {
        try {
            const res = await getHolidays({ ccCode, year });
            return res?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.Message || err?.message || 'Failed to fetch holidays');
        }
    }
);

export const submitHoliday = createAsyncThunk(
    'labourConfig/submitHoliday',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await saveHoliday(payload);
            return res?.Data || res;
        } catch (err) {
            return rejectWithValue(err?.Message || err?.message || 'Failed to save holiday');
        }
    }
);

export const removeHoliday = createAsyncThunk(
    'labourConfig/removeHoliday',
    async ({ holidayId, actionBy }, { rejectWithValue }) => {
        try {
            const res = await deleteHoliday(holidayId, actionBy);
            return { holidayId, result: res?.Data || res };
        } catch (err) {
            return rejectWithValue(err?.Message || err?.message || 'Failed to delete holiday');
        }
    }
);

export const fetchPFConfig = createAsyncThunk(
    'labourConfig/fetchPFConfig',
    async (ccCode, { rejectWithValue }) => {
        try {
            const res = await getPFConfig(ccCode || null);
            return res?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.Message || err?.message || 'Failed to fetch PF config');
        }
    }
);

export const submitPFConfig = createAsyncThunk(
    'labourConfig/submitPFConfig',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await savePFConfig(payload);
            return res?.Data || res;
        } catch (err) {
            return rejectWithValue(err?.Message || err?.message || 'Failed to save PF config');
        }
    }
);

export const fetchESIConfig = createAsyncThunk(
    'labourConfig/fetchESIConfig',
    async (ccCode, { rejectWithValue }) => {
        try {
            const res = await getESIConfig(ccCode || null);
            return res?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.Message || err?.message || 'Failed to fetch ESI config');
        }
    }
);

export const submitESIConfig = createAsyncThunk(
    'labourConfig/submitESIConfig',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await saveESIConfig(payload);
            return res?.Data || res;
        } catch (err) {
            return rejectWithValue(err?.Message || err?.message || 'Failed to save ESI config');
        }
    }
);

export const fetchPTConfig = createAsyncThunk(
    'labourConfig/fetchPTConfig',
    async (ccCode, { rejectWithValue }) => {
        try {
            const res = await getPTConfig(ccCode || null);
            return res?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.Message || err?.message || 'Failed to fetch PT config');
        }
    }
);

export const submitPTConfig = createAsyncThunk(
    'labourConfig/submitPTConfig',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await savePTConfig(payload);
            return res?.Data || res;
        } catch (err) {
            return rejectWithValue(err?.Message || err?.message || 'Failed to save PT config');
        }
    }
);

export const fetchPTSlabs = createAsyncThunk(
    'labourConfig/fetchPTSlabs',
    async (configId, { rejectWithValue }) => {
        try {
            const res = await getPTSlabs(configId);
            return res?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.Message || err?.message || 'Failed to fetch PT slabs');
        }
    }
);

export const submitPTSlab = createAsyncThunk(
    'labourConfig/submitPTSlab',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await savePTSlab(payload);
            return res?.Data || res;
        } catch (err) {
            return rejectWithValue(err?.Message || err?.message || 'Failed to save PT slab');
        }
    }
);

export const removePTSlab = createAsyncThunk(
    'labourConfig/removePTSlab',
    async (slabId, { rejectWithValue }) => {
        try {
            const res = await deletePTSlab(slabId);
            return { slabId, result: res?.Data || res };
        } catch (err) {
            return rejectWithValue(err?.Message || err?.message || 'Failed to delete PT slab');
        }
    }
);

export const fetchLWFConfig = createAsyncThunk(
    'labourConfig/fetchLWFConfig',
    async (ccCode, { rejectWithValue }) => {
        try {
            const res = await getLWFConfig(ccCode || null);
            return res?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.Message || err?.message || 'Failed to fetch LWF config');
        }
    }
);

export const submitLWFConfig = createAsyncThunk(
    'labourConfig/submitLWFConfig',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await saveLWFConfig(payload);
            return res?.Data || res;
        } catch (err) {
            return rejectWithValue(err?.Message || err?.message || 'Failed to save LWF config');
        }
    }
);

// ── Initial State ──────────────────────────────────────────────────────────────

const initialState = {
    // Lookups
    costCenters:         [],
    costCentersLoading:  false,
    costCentersError:    null,

    dcaList:             [],
    dcaLoading:          false,
    dcaError:            null,

    subDcaList:          [],
    subDcaLoading:       false,
    subDcaError:         null,

    // Minimum Wage
    minWageData:         [],
    minWageLoading:      false,
    minWageError:        null,

    // Designations
    designations:        [],
    designationsLoading: false,
    designationsError:   null,

    // Wage Components (lookup)
    wageComponents:          [],
    wageComponentsLoading:   false,
    wageComponentsError:     null,

    // Wage Account Config
    wageAccountData:         [],
    wageAccountLoading:      false,
    wageAccountError:        null,

    // Holidays
    holidays:            [],
    holidaysLoading:     false,
    holidaysError:       null,

    // PF Config
    pfConfigData:        [],
    pfConfigLoading:     false,
    pfConfigError:       null,

    // ESI Config
    esiConfigData:       [],
    esiConfigLoading:    false,
    esiConfigError:      null,

    // PT Config
    ptConfigData:        [],
    ptConfigLoading:     false,
    ptConfigError:       null,

    // PT Slabs (for currently selected config)
    ptSlabData:          [],
    ptSlabLoading:       false,
    ptSlabError:         null,

    // LWF Config
    lwfConfigData:       [],
    lwfConfigLoading:    false,
    lwfConfigError:      null,

    // Shared save state
    saveLoading:  false,
    saveError:    null,
    saveResult:   null,
};

// ── Slice ──────────────────────────────────────────────────────────────────────

const labourConfigSlice = createSlice({
    name: 'labourConfig',
    initialState,
    reducers: {
        clearSaveResult: (state) => {
            state.saveLoading = false;
            state.saveError   = null;
            state.saveResult  = null;
        },
        clearPTSlabs: (state) => {
            state.ptSlabData    = [];
            state.ptSlabLoading = false;
            state.ptSlabError   = null;
        },
        clearSubDca: (state) => {
            state.subDcaList    = [];
            state.subDcaLoading = false;
            state.subDcaError   = null;
        },
        resetLabourConfig: () => initialState,
    },
    extraReducers: (builder) => {
        // ── Lookups ──
        builder
            .addCase(fetchAllCostCenters.pending,  (s) => { s.costCentersLoading = true;  s.costCentersError = null; })
            .addCase(fetchAllCostCenters.fulfilled, (s, a) => { s.costCentersLoading = false; s.costCenters = a.payload; })
            .addCase(fetchAllCostCenters.rejected,  (s, a) => { s.costCentersLoading = false; s.costCentersError = a.payload; })

            .addCase(fetchDCAForHR.pending,  (s) => { s.dcaLoading = true;  s.dcaError = null; })
            .addCase(fetchDCAForHR.fulfilled, (s, a) => { s.dcaLoading = false; s.dcaList = a.payload; })
            .addCase(fetchDCAForHR.rejected,  (s, a) => { s.dcaLoading = false; s.dcaError = a.payload; })

            .addCase(fetchSubDCAByDCA.pending,  (s) => { s.subDcaLoading = true;  s.subDcaError = null; s.subDcaList = []; })
            .addCase(fetchSubDCAByDCA.fulfilled, (s, a) => { s.subDcaLoading = false; s.subDcaList = a.payload; })
            .addCase(fetchSubDCAByDCA.rejected,  (s, a) => { s.subDcaLoading = false; s.subDcaError = a.payload; })

        // ── Min Wage ──
            .addCase(fetchMinWageConfig.pending,  (s) => { s.minWageLoading = true;  s.minWageError = null; })
            .addCase(fetchMinWageConfig.fulfilled, (s, a) => { s.minWageLoading = false; s.minWageData = a.payload; })
            .addCase(fetchMinWageConfig.rejected,  (s, a) => { s.minWageLoading = false; s.minWageError = a.payload; })

        // ── Designations ──
            .addCase(fetchDesignations.pending,  (s) => { s.designationsLoading = true;  s.designationsError = null; })
            .addCase(fetchDesignations.fulfilled, (s, a) => { s.designationsLoading = false; s.designations = a.payload; })
            .addCase(fetchDesignations.rejected,  (s, a) => { s.designationsLoading = false; s.designationsError = a.payload; })

        // ── Wage Components ──
            .addCase(fetchWageComponents.pending,  (s) => { s.wageComponentsLoading = true;  s.wageComponentsError = null; })
            .addCase(fetchWageComponents.fulfilled, (s, a) => { s.wageComponentsLoading = false; s.wageComponents = a.payload; })
            .addCase(fetchWageComponents.rejected,  (s, a) => { s.wageComponentsLoading = false; s.wageComponentsError = a.payload; })

        // ── Wage Account Config ──
            .addCase(fetchWageAccountConfig.pending,  (s) => { s.wageAccountLoading = true;  s.wageAccountError = null; })
            .addCase(fetchWageAccountConfig.fulfilled, (s, a) => { s.wageAccountLoading = false; s.wageAccountData = a.payload; })
            .addCase(fetchWageAccountConfig.rejected,  (s, a) => { s.wageAccountLoading = false; s.wageAccountError = a.payload; })

        // ── Holidays ──
            .addCase(fetchHolidays.pending,  (s) => { s.holidaysLoading = true;  s.holidaysError = null; })
            .addCase(fetchHolidays.fulfilled, (s, a) => { s.holidaysLoading = false; s.holidays = a.payload; })
            .addCase(fetchHolidays.rejected,  (s, a) => { s.holidaysLoading = false; s.holidaysError = a.payload; })

        // ── Delete Holiday (optimistic remove) ──
            .addCase(removeHoliday.fulfilled, (s, a) => {
                s.holidays = s.holidays.filter(h => h.HolidayId !== a.payload.holidayId);
            })

        // ── PF Config ──
            .addCase(fetchPFConfig.pending,   (s) => { s.pfConfigLoading = true;  s.pfConfigError = null; })
            .addCase(fetchPFConfig.fulfilled,  (s, a) => { s.pfConfigLoading = false; s.pfConfigData = a.payload; })
            .addCase(fetchPFConfig.rejected,   (s, a) => { s.pfConfigLoading = false; s.pfConfigError = a.payload; })

        // ── ESI Config ──
            .addCase(fetchESIConfig.pending,   (s) => { s.esiConfigLoading = true;  s.esiConfigError = null; })
            .addCase(fetchESIConfig.fulfilled,  (s, a) => { s.esiConfigLoading = false; s.esiConfigData = a.payload; })
            .addCase(fetchESIConfig.rejected,   (s, a) => { s.esiConfigLoading = false; s.esiConfigError = a.payload; })

        // ── PT Config ──
            .addCase(fetchPTConfig.pending,    (s) => { s.ptConfigLoading = true;  s.ptConfigError = null; })
            .addCase(fetchPTConfig.fulfilled,   (s, a) => { s.ptConfigLoading = false; s.ptConfigData = a.payload; })
            .addCase(fetchPTConfig.rejected,    (s, a) => { s.ptConfigLoading = false; s.ptConfigError = a.payload; })

        // ── PT Slabs ──
            .addCase(fetchPTSlabs.pending,     (s) => { s.ptSlabLoading = true;  s.ptSlabError = null; })
            .addCase(fetchPTSlabs.fulfilled,    (s, a) => { s.ptSlabLoading = false; s.ptSlabData = a.payload; })
            .addCase(fetchPTSlabs.rejected,     (s, a) => { s.ptSlabLoading = false; s.ptSlabError = a.payload; })

        // ── Delete PT Slab (optimistic remove) ──
            .addCase(removePTSlab.pending,     (s) => { s.ptSlabLoading = true; })
            .addCase(removePTSlab.fulfilled,    (s, a) => {
                s.ptSlabLoading = false;
                s.ptSlabData = s.ptSlabData.filter(x => x.SlabId !== a.payload.slabId);
            })
            .addCase(removePTSlab.rejected,     (s, a) => { s.ptSlabLoading = false; s.ptSlabError = a.payload; })

        // ── LWF Config ──
            .addCase(fetchLWFConfig.pending,   (s) => { s.lwfConfigLoading = true;  s.lwfConfigError = null; })
            .addCase(fetchLWFConfig.fulfilled,  (s, a) => { s.lwfConfigLoading = false; s.lwfConfigData = a.payload; })
            .addCase(fetchLWFConfig.rejected,   (s, a) => { s.lwfConfigLoading = false; s.lwfConfigError = a.payload; })

        // ── All save thunks share the same loading/error/result ──
            .addMatcher(
                (action) => [
                    submitMinWageConfig.pending.type,
                    submitDesignation.pending.type,
                    submitWageAccountConfig.pending.type,
                    submitHoliday.pending.type,
                    removeHoliday.pending.type,
                    submitPFConfig.pending.type,
                    submitESIConfig.pending.type,
                    submitPTConfig.pending.type,
                    submitPTSlab.pending.type,
                    submitLWFConfig.pending.type,
                ].includes(action.type),
                (s) => { s.saveLoading = true; s.saveError = null; s.saveResult = null; }
            )
            .addMatcher(
                (action) => [
                    submitMinWageConfig.fulfilled.type,
                    submitDesignation.fulfilled.type,
                    submitWageAccountConfig.fulfilled.type,
                    submitHoliday.fulfilled.type,
                    removeHoliday.fulfilled.type,
                    submitPFConfig.fulfilled.type,
                    submitESIConfig.fulfilled.type,
                    submitPTConfig.fulfilled.type,
                    submitPTSlab.fulfilled.type,
                    submitLWFConfig.fulfilled.type,
                ].includes(action.type),
                (s, a) => { s.saveLoading = false; s.saveResult = a.payload; }
            )
            .addMatcher(
                (action) => [
                    submitMinWageConfig.rejected.type,
                    submitDesignation.rejected.type,
                    submitWageAccountConfig.rejected.type,
                    submitHoliday.rejected.type,
                    removeHoliday.rejected.type,
                    submitPFConfig.rejected.type,
                    submitESIConfig.rejected.type,
                    submitPTConfig.rejected.type,
                    submitPTSlab.rejected.type,
                    submitLWFConfig.rejected.type,
                ].includes(action.type),
                (s, a) => { s.saveLoading = false; s.saveError = a.payload; }
            );
    },
});

export const { clearSaveResult, clearPTSlabs, clearSubDca, resetLabourConfig } = labourConfigSlice.actions;
export default labourConfigSlice.reducer;
