import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getNatureOfGroups,
    getMasterGroupsByNature,
    getSubGroupsByGroup,
    saveAgency,
} from '../../api/AccountsAPI/agencyCreationAPI';

// ── Thunks ─────────────────────────────────────────────────────────────────────

export const fetchNatureGroups = createAsyncThunk(
    'agencyCreation/fetchNatureGroups',
    async (_, { rejectWithValue }) => {
        try { return await getNatureOfGroups(); }
        catch (err) { return rejectWithValue(err.message || 'Failed to fetch nature groups'); }
    }
);

export const fetchMasterGroups = createAsyncThunk(
    'agencyCreation/fetchMasterGroups',
    async (natureGroupId, { rejectWithValue }) => {
        try { return await getMasterGroupsByNature(natureGroupId); }
        catch (err) { return rejectWithValue(err.message || 'Failed to fetch master groups'); }
    }
);

export const fetchSubGroups = createAsyncThunk(
    'agencyCreation/fetchSubGroups',
    async (groupId, { rejectWithValue }) => {
        try { return await getSubGroupsByGroup(groupId); }
        catch (err) { return rejectWithValue(err.message || 'Failed to fetch sub-groups'); }
    }
);

export const submitAgency = createAsyncThunk(
    'agencyCreation/submit',
    async (payload, { rejectWithValue }) => {
        try { return await saveAgency(payload); }
        catch (err) { return rejectWithValue(err.message || 'Failed to save agency'); }
    }
);

// ── Slice ──────────────────────────────────────────────────────────────────────

const initialState = {
    natureGroups:        [],
    natureGroupsLoading: false,
    natureGroupsError:   null,

    masterGroups:        [],
    masterGroupsLoading: false,
    masterGroupsError:   null,

    subGroups:        [],
    subGroupsLoading: false,
    subGroupsError:   null,

    saveStatus:  null,   // null | 'success' | 'failed'
    saveLoading: false,
    saveError:   null,
};

const agencyCreationSlice = createSlice({
    name: 'agencyCreation',
    initialState,
    reducers: {
        clearMasterGroups: (s) => { s.masterGroups = []; s.masterGroupsError = null; },
        clearSubGroups:    (s) => { s.subGroups = [];    s.subGroupsError    = null; },
        clearSaveResult:   (s) => { s.saveStatus = null; s.saveError = null; },
        resetAgencyCreation: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNatureGroups.pending,   (s) => { s.natureGroupsLoading = true;  s.natureGroupsError = null; })
            .addCase(fetchNatureGroups.fulfilled, (s, a) => { s.natureGroupsLoading = false; s.natureGroups = a.payload?.Data || []; })
            .addCase(fetchNatureGroups.rejected,  (s, a) => { s.natureGroupsLoading = false; s.natureGroupsError = a.payload; });

        builder
            .addCase(fetchMasterGroups.pending,   (s) => { s.masterGroupsLoading = true;  s.masterGroupsError = null; s.masterGroups = []; })
            .addCase(fetchMasterGroups.fulfilled, (s, a) => { s.masterGroupsLoading = false; s.masterGroups = a.payload?.Data || []; })
            .addCase(fetchMasterGroups.rejected,  (s, a) => { s.masterGroupsLoading = false; s.masterGroupsError = a.payload; });

        builder
            .addCase(fetchSubGroups.pending,   (s) => { s.subGroupsLoading = true;  s.subGroupsError = null; s.subGroups = []; })
            .addCase(fetchSubGroups.fulfilled, (s, a) => { s.subGroupsLoading = false; s.subGroups = a.payload?.Data || []; })
            .addCase(fetchSubGroups.rejected,  (s, a) => { s.subGroupsLoading = false; s.subGroupsError = a.payload; });

        builder
            .addCase(submitAgency.pending,   (s) => { s.saveLoading = true; s.saveError = null; s.saveStatus = null; })
            .addCase(submitAgency.fulfilled, (s, a) => {
                s.saveLoading = false;
                const raw = a.payload?.Data || a.payload || '';
                const msg = typeof raw === 'string' ? raw.trim() : '';
                s.saveStatus = (msg === 'Submitted' || a.payload?.IsSuccessful === true) ? 'success' : 'failed';
                if (s.saveStatus === 'failed') s.saveError = msg || 'Save failed';
            })
            .addCase(submitAgency.rejected,  (s, a) => { s.saveLoading = false; s.saveError = a.payload; s.saveStatus = 'failed'; });
    },
});

export const {
    clearMasterGroups, clearSubGroups,
    clearSaveResult, resetAgencyCreation,
} = agencyCreationSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────────

export const selectNatureGroups        = (s) => s.agencyCreation.natureGroups;
export const selectNatureGroupsLoading = (s) => s.agencyCreation.natureGroupsLoading;
export const selectMasterGroups        = (s) => s.agencyCreation.masterGroups;
export const selectMasterGroupsLoading = (s) => s.agencyCreation.masterGroupsLoading;
export const selectSubGroups           = (s) => s.agencyCreation.subGroups;
export const selectSubGroupsLoading    = (s) => s.agencyCreation.subGroupsLoading;
export const selectAgencySaveStatus    = (s) => s.agencyCreation.saveStatus;
export const selectAgencySaveLoading   = (s) => s.agencyCreation.saveLoading;
export const selectAgencySaveError     = (s) => s.agencyCreation.saveError;

export default agencyCreationSlice.reducer;
