import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as notificationAPI from '../../api/NotificationAPI/inboxNotificationAPI';

// Async Thunk for Inbox Notifications API
// =======================================

// Fetch User Inbox Notifications
export const fetchUserInboxNotifications = createAsyncThunk(
    'inboxnotifications/fetchUserInboxNotifications',
    async (params, { rejectWithValue }) => {
        try {
            const response = await notificationAPI.getUserInboxNotifications(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch User Inbox Notifications');
        }
    }
);

// Initial State
// =============
const initialState = {
    // Data from API
    notifications: [],
    notificationsSummary: [],

    // Loading states
    loading: {
        notifications: false,
    },

    // Error states
    errors: {
        notifications: null,
    },

    // UI State
    filters: {
        userId: null,
        roleId: null
    }
};

// Helper function to create notifications summary
const createNotificationsSummary = (notifications) => {
    if (!notifications || !Array.isArray(notifications)) return [];
    
    // Group by masterId only (since userId and roleId are already filtered via API params)
    const groupedNotifications = notifications.reduce((acc, notification) => {
        const { 
            MasterId, 
            RoleId, 
            CCCode, 
            HasCCRestriction, 
            ModuleDisplayName, 
            PendingCount,
            ModuleCategory,
            NavigationPath,
            ActionButtonText,
            Priority,
            Status,
            AssignedUserId
        } = notification;

        // Create grouping key using only masterId
        const groupKey = `${MasterId}`;

        if (!acc[groupKey]) {
            acc[groupKey] = {
                MasterId,
                RoleId,
                ModuleDisplayName,
                ModuleCategory,
                NavigationPath,
                ActionButtonText,
                Priority,
                Status,
                TotalPendingCount: 0,
                NotificationCount: 0,
                InboxTitle: '',
                Items: [],
                CCCodes: [] // Track all CC codes for this master
            };
        }

        acc[groupKey].TotalPendingCount += PendingCount || 0;
        acc[groupKey].NotificationCount += 1;
        acc[groupKey].Items.push(notification);
        
        // Collect unique CC codes
        if (CCCode && !acc[groupKey].CCCodes.includes(CCCode)) {
            acc[groupKey].CCCodes.push(CCCode);
        }

        // Create InboxTitle with total count
        acc[groupKey].InboxTitle = `${ModuleDisplayName} (${acc[groupKey].TotalPendingCount})`;

        return acc;
    }, {});

    // Convert grouped object to array and sort by priority/status
    return Object.values(groupedNotifications).sort((a, b) => {
        // Sort by Status first (lower status = higher priority)
        if (a.Status !== b.Status) {
            return a.Status - b.Status;
        }
        // Then by TotalPendingCount (higher count = higher priority)
        return b.TotalPendingCount - a.TotalPendingCount;
    });
};

// Inbox Notifications Slice
// =========================
const inboxNotificationsSlice = createSlice({
    name: 'inboxnotifications',
    initialState,
    reducers: {
        // Action to set filters
        setNotificationFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        
        // Action to clear filters
        clearNotificationFilters: (state) => {
            state.filters = {
                userId: null,
                roleId: null
            };
        },
        
        // Action to reset notifications data
        resetNotificationsData: (state) => {
            state.notifications = [];
            state.notificationsSummary = [];
        },

        // Action to clear specific errors
        clearNotificationError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType]) {
                state.errors[errorType] = null;
            }
        },

        // Action to refresh summary manually (if needed)
        refreshNotificationsSummary: (state) => {
            state.notificationsSummary = createNotificationsSummary(state.notifications);
        }
    },
    extraReducers: (builder) => {
        // User Inbox Notifications
        builder
            .addCase(fetchUserInboxNotifications.pending, (state) => {
                state.loading.notifications = true;
                state.errors.notifications = null;
            })
            .addCase(fetchUserInboxNotifications.fulfilled, (state, action) => {
                state.loading.notifications = false;
                state.notifications = action.payload?.Data || [];
                // Create summary automatically when data is loaded
                state.notificationsSummary = createNotificationsSummary(action.payload?.Data || []);
            })
            .addCase(fetchUserInboxNotifications.rejected, (state, action) => {
                state.loading.notifications = false;
                state.errors.notifications = action.payload;
                state.notifications = [];
                state.notificationsSummary = [];
            });
    },
});

// Export actions
export const { 
    setNotificationFilters, 
    clearNotificationFilters, 
    resetNotificationsData, 
    clearNotificationError,
    refreshNotificationsSummary
} = inboxNotificationsSlice.actions;

// Selectors
// =========

// Data selectors
export const selectNotifications = (state) => state.inboxnotifications.notifications;
export const selectNotificationsSummary = (state) => state.inboxnotifications.notificationsSummary;

// Loading selectors
export const selectNotificationsLoading = (state) => state.inboxnotifications.loading.notifications;

// Error selectors
export const selectNotificationsError = (state) => state.inboxnotifications.errors.notifications;

// Filter selectors
export const selectNotificationFilters = (state) => state.inboxnotifications.filters;
export const selectSelectedUserId = (state) => state.inboxnotifications.filters.userId;
export const selectSelectedRoleId = (state) => state.inboxnotifications.filters.roleId;

// Combined selectors
export const selectIsNotificationsLoading = (state) => state.inboxnotifications.loading.notifications;
export const selectHasNotificationsError = (state) => state.inboxnotifications.errors.notifications !== null;

// Specific summary selectors
export const selectNotificationsByCategory = (state) => {
    const notifications = state.inboxnotifications.notificationsSummary;
    return notifications.reduce((acc, notification) => {
        const category = notification.ModuleCategory || 'General';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(notification);
        return acc;
    }, {});
};

export const selectTotalPendingCount = (state) => {
    return state.inboxnotifications.notificationsSummary.reduce((total, notification) => {
        return total + (notification.TotalPendingCount || 0);
    }, 0);
};

export const selectHighPriorityNotifications = (state) => {
    return state.inboxnotifications.notificationsSummary.filter(notification => 
        notification.Status === 1 || notification.Priority === 'High'
    );
};

// Export reducer
export default inboxNotificationsSlice.reducer;