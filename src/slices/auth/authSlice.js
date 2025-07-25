// slices/auth/authSlice.js - OPTIMIZED VERSION - Improved performance and reduced localStorage operations
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as authAPI from '../../api/securityAPI/authAPI';
import { updateUser } from '../../api/businessinfoAPI/businessinfoAPI';

// IMPROVED: Helper function to batch localStorage operations
const batchLocalStorageUpdate = (updates) => {
    Object.entries(updates).forEach(([key, value]) => {
        if (value === null) {
            localStorage.removeItem(key);
        } else {
            localStorage.setItem(key, typeof value === 'object' ? JSON.stringify(value) : value);
        }
    });
};

// Employee Authentication
export const validateEmployee = createAsyncThunk(
    'auth/validateEmployee',
    async (credentials, { rejectWithValue }) => {
        try {
            console.log('🔍 Calling validateEmployee API with:', credentials);
            
            const response = await authAPI.validateEmployee(credentials);
            
            console.log('🎯 API Response received:', response);
            console.log('🎯 Response.Data:', response.Data);
            console.log('🎯 Response.Data.isValidUser:', response.Data?.isValidUser);
            console.log('🎯 IsSuccessful:', response.IsSuccessful);
            
            if (response && response.Data && response.Data.isValidUser === true) {
                console.log('✅ Employee validation successful');
                // IMPROVED: Only update localStorage once
                batchLocalStorageUpdate({ employeeId: credentials.employeeId });
                return {
                    success: true,
                    data: response.Data,
                    message: response.Message
                };
            }
            // Fallback to original pattern: check IsSuccessful
            else if (response && response.IsSuccessful === true) {
                console.log('✅ Employee validation successful (Original pattern)');
                batchLocalStorageUpdate({ employeeId: credentials.employeeId });
                return {
                    success: true,
                    data: response.Data,
                    message: response.Message
                };
            }
            // Debug mode: show all available properties
            else if (response) {
                console.log('❓ Response structure debug:');
                console.log('❓ Available properties:', Object.keys(response));
                if (response.Data) {
                    console.log('❓ Data properties:', Object.keys(response.Data));
                }
                
                const errorMessage = response.Message || 'Invalid employee credentials';
                return rejectWithValue(errorMessage);
            } else {
                console.log('❌ No response received');
                return rejectWithValue('No response from server');
            }
        } catch (error) {
            console.error('🚨 API Error:', error);
            if (error.response?.data?.Message) {
                return rejectWithValue(error.response.data.Message);
            }
            return rejectWithValue(error.message || 'Failed to validate employee credentials');
        }
    }
);

// Role/User Authentication
export const validateUser = createAsyncThunk(
    'auth/validateUser',
    async (credentials, { rejectWithValue }) => {
        try {
            console.log('🔍 Calling validateUser API');
            
            const response = await authAPI.validateUser(credentials);
            
            console.log('🎯 User API Response:', response);
            console.log('🎯 User Data.isValidUser:', response.Data?.isValidUser);
            console.log('🎯 User Data.UserRoleId:', response.Data?.UserRoleId);
            console.log('🎯 User Data.FirstName:', response.Data?.FirstName);
            console.log('🎯 User Data.UserRoleCode:', response.Data?.UserRoleCode);
            
            // Check if user validation succeeded (Angular pattern)
            if (response && response.Data && response.Data.isValidUser === true) {
                console.log('✅ User validation successful - extracting complete user data');
                
                // Extract roleId and complete user data
                const roleId = response.Data.UserRoleId || response.Data.roleId || response.Data.RoleId;
                
                if (roleId) {
                    console.log('✅ Found roleId:', roleId);
                    console.log('✅ Storing complete user data:', response.Data);
                    
                    // IMPROVED: Extract key fields for easy access
                    const userData = {
                        firstName: response.Data.FirstName,
                        lastName: response.Data.LastName,
                        userName: response.Data.userName || response.Data.UserName,
                        mailId: response.Data.MailId,
                        roleCode: response.Data.UserRoleCode,
                        roleId: roleId,
                        employeeId: credentials.employeeId,
                        ccCodes: response.Data.ccCodes,
                        isFirstTimeLogin: response.Data.IsFirstTimeLogin,
                        isExist: response.Data.IsExist,
                        UID: response.Data.UID,
                    };

                    // IMPROVED: Batch localStorage updates
                    batchLocalStorageUpdate({
                        userData: userData,
                        roleId: roleId
                    });
                    
                    return {
                        success: true,
                        data: response.Data, // Store complete user data
                        roleId: roleId,
                        message: response.Message,
                        userData: userData
                    };
                } else {
                    console.log('❌ No roleId found in response');
                    return rejectWithValue('Role ID not found in response');
                }
            } else {
                console.log('❌ User validation failed or isValidUser not true');
                const errorMessage = response?.Message || 'Invalid role credentials';
                return rejectWithValue(errorMessage);
            }
        } catch (error) {
            console.error('🚨 User API Error:', error);
            return rejectWithValue(error.message || 'Failed to validate user role credentials');
        }
    }
);

// Get Employee Details
export const getEmployeeDetails = createAsyncThunk(
    'auth/getEmployeeDetails',
    async (username, { rejectWithValue }) => {
        try {
            console.log('🔍 Getting employee details for:', username);
            
            const response = await authAPI.getEmployeeDetails(username);
            
            console.log('🎯 Employee Details Response:', response);
            
            if (response && response.IsSuccessful === true) {
                // IMPROVED: Batch localStorage update
                batchLocalStorageUpdate({
                    employeeData: response.Data,
                    loginType: 'employee'
                });
                return {
                    success: true,
                    data: response.Data,
                    message: response.Message
                };
            } else {
                const errorMessage = response?.Message || 'Failed to fetch employee details';
                return rejectWithValue(errorMessage);
            }
        } catch (error) {
            console.error('🚨 Employee Details Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch employee details');
        }
    }
);

// Get Menu/Role Data - UPDATED TO HANDLE MENU DATA PROPERLY
export const getMenu = createAsyncThunk(
    'auth/getMenu',
    async (roleId, { rejectWithValue }) => {
        try {
            console.log('🔍 Getting menu for roleId:', roleId);
            
            const response = await authAPI.getMenu(roleId);
            
            console.log('🎯 Menu Response:', response);
            console.log('🎯 Menu Response.Data:', response.Data);
            console.log('🎯 Menu Response.isSuccessful:', response.isSuccessful);
            console.log('🎯 Menu Response.IsSuccessful:', response.IsSuccessful);
            
            // Updated logic: Check for data presence regardless of success flag
            // Your API returns isSuccessful: false but still has valid data
            if (response && response.Data && Array.isArray(response.Data) && response.Data.length > 0) {
                console.log('✅ Menu data found - processing menu items');
                console.log('✅ Menu items count:', response.Data.length);
                
                // Transform and organize menu data
                const organizedMenuData = {
                    menuItems: response.Data,
                    totalItems: response.Data.length,
                    roleName: `Role ${roleId}`,
                    roleDescription: 'System Role',
                    permissions: [],
                    accessLevel: 'Standard'
                };
                
                // IMPROVED: Batch localStorage updates
                batchLocalStorageUpdate({
                    roleData: organizedMenuData,
                    roleId: roleId,
                    loginType: 'role'
                });
                
                return {
                    success: true,
                    data: organizedMenuData,
                    message: response.Message || 'Menu retrieved successfully'
                };
            }
            // Fallback: check traditional success pattern
            else if (response && (response.IsSuccessful === true || response.isSuccessful === true)) {
                console.log('✅ Menu retrieved via success flag');
                
                const organizedMenuData = {
                    menuItems: response.Data || [],
                    totalItems: response.Data?.length || 0,
                    roleName: `Role ${roleId}`,
                    roleDescription: 'System Role',
                    permissions: [],
                    accessLevel: 'Standard'
                };
                
                batchLocalStorageUpdate({
                    roleData: organizedMenuData,
                    roleId: roleId,
                    loginType: 'role'
                });
                
                return {
                    success: true,
                    data: organizedMenuData,
                    message: response.Message || 'Menu retrieved successfully'
                };
            }
            // No valid data found
            else {
                console.log('❌ No valid menu data found');
                console.log('❌ Response structure:', {
                    hasData: !!response.Data,
                    dataType: typeof response.Data,
                    isArray: Array.isArray(response.Data),
                    dataLength: response.Data?.length,
                    isSuccessful: response.isSuccessful,
                    IsSuccessful: response.IsSuccessful
                });
                
                const errorMessage = response?.Message || 'No menu data available for this role';
                return rejectWithValue(errorMessage);
            }
        } catch (error) {
            console.error('🚨 Menu Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch menu data');
        }
    }
);

// IMPROVED: Load user from localStorage with better error handling
export const loadUserFromStorage = createAsyncThunk(
    'auth/loadUserFromStorage',
    async (_, { rejectWithValue }) => {
        try {
            const employeeId = localStorage.getItem('employeeId');
            const employeeData = localStorage.getItem('employeeData');
            const roleData = localStorage.getItem('roleData');
            const roleId = localStorage.getItem('roleId');
            const userData = localStorage.getItem('userData');
            const loginType = localStorage.getItem('loginType');
            
            if (employeeId) {
                const userInfo = {
                    employeeId,
                    loginType: loginType || null,
                    isAuthenticated: false
                };

                // IMPROVED: Better error handling for JSON parsing
                try {
                    if (employeeData && loginType === 'employee') {
                        userInfo.employeeData = JSON.parse(employeeData);
                        userInfo.loginType = 'employee';
                        userInfo.isAuthenticated = true;
                    }

                    if (roleData && roleId && loginType === 'role') {
                        userInfo.roleData = JSON.parse(roleData);
                        userInfo.roleId = roleId;
                        userInfo.loginType = 'role';
                        userInfo.isAuthenticated = true;
                    }

                    if (userData) {
                        userInfo.userData = JSON.parse(userData);
                        console.log('✅ Loaded userData from storage:', userInfo.userData);
                    }
                } catch (parseError) {
                    console.warn('Failed to parse stored data:', parseError);
                    // Clear corrupted data
                    batchLocalStorageUpdate({
                        employeeData: null,
                        roleData: null,
                        userData: null,
                        roleId: null,
                        loginType: null
                    });
                    return rejectWithValue('Corrupted stored data found and cleared');
                }

                return userInfo;
            } else {
                return rejectWithValue('No stored authentication data found');
            }
        } catch (error) {
            return rejectWithValue('Failed to load user from storage');
        }
    }
);

const initialState = {
    isAuthenticated: false,
    employeeValidated: false,
    loginType: null,
    employeeId: null,
    employeeData: null,
    roleData: null,
    roleId: null,
    userData: null,
    loading: {
        validateEmployee: false,
        validateUser: false,
        getEmployeeDetails: false,
        getMenu: false,
        loadFromStorage: false
    },
    error: {
        validateEmployee: null,
        validateUser: null,
        getEmployeeDetails: null,
        getMenu: null,
        loadFromStorage: null
    },
    success: {
        validateEmployee: false,
        validateUser: false,
        getEmployeeDetails: false,
        getMenu: false
    },
    lastActivity: null
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearErrors: (state) => {
            state.error = initialState.error;
        },
        clearSuccess: (state) => {
            state.success = initialState.success;
        },
        updateLastActivity: (state) => {
            state.lastActivity = new Date().toISOString();
        },
        setShowLoginOptions: (state, action) => {
            // Keeping for backward compatibility, but not used in new routing approach
            state.showLoginOptions = action.payload;
        },
        logout: (state) => {
            // IMPROVED: Batch localStorage clear
            batchLocalStorageUpdate({
                employeeId: null,
                employeeData: null,
                userData: null,
                roleData: null,
                roleId: null,
                loginType: null
            });
            return initialState;
        },
        resetAuth: (state) => {
            // IMPROVED: Batch localStorage clear
            batchLocalStorageUpdate({
                employeeId: null,
                employeeData: null,
                roleData: null,
                roleId: null,
                userData: null,
                loginType: null
            });
            return initialState;
        },
        // IMPROVED: Optimized role data update
        updateRoleData: (state, action) => {
            state.roleData = action.payload;
            localStorage.setItem('roleData', JSON.stringify(action.payload));
        },
        updateUserData: (state, action) => {
            state.userData = action.payload;
            localStorage.setItem('userData', JSON.stringify(action.payload));
        }
    },
    extraReducers: (builder) => {
        builder
            // Validate Employee - UPDATED FOR ROUTING APPROACH
            .addCase(validateEmployee.pending, (state) => {
                state.loading.validateEmployee = true;
                state.error.validateEmployee = null;
                state.success.validateEmployee = false;
            })
            .addCase(validateEmployee.fulfilled, (state, action) => {
                state.loading.validateEmployee = false;
                state.success.validateEmployee = true;
                state.employeeValidated = true;
                state.isAuthenticated = true; // Set to true so user can access /login-options
                state.employeeId = action.meta.arg.employeeId;
                state.lastActivity = new Date().toISOString();
                state.error.validateEmployee = null;
            })
            .addCase(validateEmployee.rejected, (state, action) => {
                state.loading.validateEmployee = false;
                state.error.validateEmployee = action.payload;
                state.success.validateEmployee = false;
                state.employeeValidated = false;
                state.isAuthenticated = false;
            })
            
            // Validate User/Role
            .addCase(validateUser.pending, (state) => {
                state.loading.validateUser = true;
                state.error.validateUser = null;
                state.success.validateUser = false;
            })
            .addCase(validateUser.fulfilled, (state, action) => {
                console.log('✅ validateUser.fulfilled - storing complete user data');
                console.log('✅ User Data received:', action.payload.userData);
                state.loading.validateUser = false;
                state.success.validateUser = true;
                state.error.validateUser = null;
                state.roleId = action.payload.roleId;
                state.userData = action.payload.userData;
                // IMPROVED: No redundant localStorage operations (handled in thunk)
            })
            .addCase(validateUser.rejected, (state, action) => {
                state.loading.validateUser = false;
                state.error.validateUser = action.payload;
                state.success.validateUser = false;
            })
            
            // Get Employee Details - UPDATED FOR ROUTING APPROACH
            .addCase(getEmployeeDetails.pending, (state) => {
                state.loading.getEmployeeDetails = true;
                state.error.getEmployeeDetails = null;
                state.success.getEmployeeDetails = false;
            })
            .addCase(getEmployeeDetails.fulfilled, (state, action) => {
                state.loading.getEmployeeDetails = false;
                state.success.getEmployeeDetails = true;
                state.isAuthenticated = true;
                state.loginType = 'employee';
                state.employeeData = action.payload.data;
                state.error.getEmployeeDetails = null;
                // IMPROVED: No redundant localStorage operations (handled in thunk)
            })
            .addCase(getEmployeeDetails.rejected, (state, action) => {
                state.loading.getEmployeeDetails = false;
                state.error.getEmployeeDetails = action.payload;
                state.success.getEmployeeDetails = false;
            })
            
            // Get Menu - UPDATED FOR ROUTING APPROACH
            .addCase(getMenu.pending, (state) => {
                state.loading.getMenu = true;
                state.error.getMenu = null;
                state.success.getMenu = false;
            })
            .addCase(getMenu.fulfilled, (state, action) => {
                console.log('✅ getMenu.fulfilled - storing organized menu data');
                state.loading.getMenu = false;
                state.success.getMenu = true;
                state.isAuthenticated = true;
                state.loginType = 'role';
                state.roleData = action.payload.data;
                state.roleId = action.meta.arg;
                state.error.getMenu = null;
                state.lastActivity = new Date().toISOString();
                // IMPROVED: No redundant localStorage operations (handled in thunk)
            })
            .addCase(getMenu.rejected, (state, action) => {
                state.loading.getMenu = false;
                state.error.getMenu = action.payload;
                state.success.getMenu = false;
                console.log('❌ getMenu.rejected:', action.payload);
            })
            
            // Load User from Storage - UPDATED FOR ROUTING APPROACH
            .addCase(loadUserFromStorage.pending, (state) => {
                state.loading.loadFromStorage = true;
                state.error.loadFromStorage = null;
            })
            .addCase(loadUserFromStorage.fulfilled, (state, action) => {
                state.loading.loadFromStorage = false;
                state.employeeId = action.payload.employeeId;
                state.employeeData = action.payload.employeeData;
                state.roleData = action.payload.roleData;
                state.roleId = action.payload.roleId;
                state.userData = action.payload.userData || null;
                state.loginType = action.payload.loginType;
                state.isAuthenticated = action.payload.isAuthenticated;
                state.lastActivity = new Date().toISOString();
                state.error.loadFromStorage = null;
            })
            .addCase(loadUserFromStorage.rejected, (state, action) => {
                state.loading.loadFromStorage = false;
                state.error.loadFromStorage = action.payload;
                state.isAuthenticated = false;
                state.employeeId = null;
                state.employeeData = null;
                state.roleData = null;
                state.roleId = null;
            });
    }
});

export const { 
    clearErrors, 
    clearSuccess, 
    updateLastActivity, 
    setShowLoginOptions,
    logout,
    resetAuth,
    updateRoleData,
    updateUserData
} = authSlice.actions;

export default authSlice.reducer;