import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    LogOut, Shield, Building2, Users, BarChart3, Settings, ChevronDown,
    Search, Mail, Home, FileText, Package, Warehouse, ShoppingCart,
    Database, TrendingUp, Calculator, CreditCard, Briefcase, FolderOpen, X,
    Bell, CheckCheck, AlertCircle
} from 'lucide-react';
import { useLogout } from '../hooks/useLogout';
import ThemeToggle from './ThemeToggle';

// Import inbox notification actions and selectors
import {
    fetchUserInboxNotifications,
    selectNotificationsSummary,
    selectNotificationsLoading,
    selectTotalPendingCount,
    selectNotificationsByCategory
} from '../slices/notificationSlice/userInboxNotificationSlice';

// Import rejection alert actions and selectors
import {
    fetchRejectionAlertCount,
    fetchRejectionAlerts,
    updateAlertStatus,
    markAlertRead,
    dismissAlert,
    selectRejectionAlerts,
    selectRejectionAlertCount,
    selectRejectionAlertsLoading,
} from '../slices/rejectionAlertSlice/rejectionAlertSlice';

const TopNavbarLayout = ({ children, currentPage, onNavigate }) => {
    // UPDATED: Get userData from Redux state
    const { 
        roleData, 
        employeeId, 
        roleId, 
        lastActivity, 
        employeeData,
        userData  // Get complete user data
    } = useSelector((state) => state.auth);

    // Inbox notifications selectors
    const notificationsSummary = useSelector(selectNotificationsSummary);
    const notificationsLoading = useSelector(selectNotificationsLoading);
    const totalPendingCount = useSelector(selectTotalPendingCount);
    const notificationsByCategory = useSelector(selectNotificationsByCategory);
    
    const { logout } = useLogout();
    
    // Rejection alert selectors
    const rejectionAlerts = useSelector(selectRejectionAlerts);
    const rejectionAlertCount = useSelector(selectRejectionAlertCount);
    const rejectionAlertsLoading = useSelector(selectRejectionAlertsLoading);

    const [activeDropdown, setActiveDropdown] = useState(null);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false);
    const [isRejectionAlertOpen, setIsRejectionAlertOpen] = useState(false);
    const [expandedAlerts, setExpandedAlerts] = useState(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const dropdownRef = useRef(null);
    const notificationDropdownRef = useRef(null);
    const rejectionAlertDropdownRef = useRef(null);
    const searchModalRef = useRef(null);
    const searchInputRef = useRef(null);
    const logoutButtonRef = useRef(null);
    const dispatch = useDispatch();

    // Get user data for notifications
    const notificationRoleId = userData?.roleId || userData?.RID;
    const notificationUid = userData?.UID || userData?.uid;

    // Fetch notifications on component mount
    useEffect(() => {
        if (notificationUid && notificationRoleId) {
            console.log('🔔 Fetching inbox notifications for:', { 
                userId: notificationUid, 
                roleId: notificationRoleId 
            });
            dispatch(fetchUserInboxNotifications({ 
                userId: notificationUid, 
                roleId: notificationRoleId 
            }));
        }
    }, [dispatch, notificationUid, notificationRoleId]);

    // Auto-refresh notifications every 5 minutes
    useEffect(() => {
        if (notificationUid && notificationRoleId) {
            const interval = setInterval(() => {
                dispatch(fetchUserInboxNotifications({
                    userId: notificationUid,
                    roleId: notificationRoleId
                }));
            }, 5 * 60 * 1000); // 5 minutes

            return () => clearInterval(interval);
        }
    }, [dispatch, notificationUid, notificationRoleId]);

    // Rejection alerts — fetch full list on mount (count is derived from the list in the slice)
    useEffect(() => {
        if (notificationUid) {
            dispatch(fetchRejectionAlerts(notificationUid));
        }
    }, [dispatch, notificationUid]);

    // Auto-refresh rejection alerts every 5 minutes
    useEffect(() => {
        if (notificationUid) {
            const interval = setInterval(() => {
                dispatch(fetchRejectionAlerts(notificationUid));
            }, 5 * 60 * 1000);
            return () => clearInterval(interval);
        }
    }, [dispatch, notificationUid]);

    // Icon mapping for main menu items (UL)
    const menuIcons = {
        'Reports': BarChart3,
        'Hr': Users,
        'HR': Users,
        'Configuration': Settings,
        'Masters': Database,
        'Sales': TrendingUp,
        'Purchase': ShoppingCart,
        'Inventory': Package,
        'Warehouse': Warehouse,
        'Finance': Calculator,
        'Accounts': CreditCard
    };

    // Get priority badge color for notifications
    const getPriorityColor = (notification) => {
        if (notification.Status === 1) return 'bg-red-500'; // High priority
        if (notification.Priority === 'High') return 'bg-orange-500';
        return 'bg-[#0d1b5e]'; // Normal priority
    };

    // Get category icon for notifications
    const getCategoryIcon = (category) => {
        console.log('🔍 Category for icon:', category); // Debug log
        
        const iconMap = {
            'HR': Users,
            'Finance': Calculator,
            'Accounts': CreditCard,
            'Purchase': ShoppingCart,
            'Sales': TrendingUp,
            'Inventory': Package,
            'General': FileText,
            'Warehouse': Warehouse,
            'Reports': BarChart3
        };
        
        const selectedIcon = iconMap[category] || FileText;
        console.log('🎯 Selected icon for', category, ':', selectedIcon.name || 'FileText'); // Debug log
        
        return selectedIcon;
    };

    // Handle notification item click
   const handleNotificationClick = (notification) => {
    console.log('🔔 Notification clicked:', notification);
    
    if (notification.NavigationPath && onNavigate) {
        // Close notification dropdown
        setIsNotificationMenuOpen(false);
        
        // ✅ NEW: Navigate to inbox-item route with complete notification data
        onNavigate('inbox-item', {
            // ========================================================================
            // ESSENTIAL NOTIFICATION DATA FOR INBOXROUTER
            // ========================================================================
            type: 'notification',                           // Identifies this as notification
            InboxTitle: notification.InboxTitle,            // Main title for verification page
            ModuleDisplayName: notification.ModuleDisplayName, // Module/feature name
            ModuleCategory: notification.ModuleCategory,    // HR, Finance, Purchase, etc.
            NavigationPath: notification.NavigationPath,    // Original path from API
            MasterId: notification.MasterId,               // Unique identifier
            RoleId: notification.RoleId,                   // User's role ID
            TotalPendingCount: notification.TotalPendingCount, // Number of pending items
            Status: notification.Status,                   // Urgency status (1=Urgent, 2=Active, etc.)
            Priority: notification.Priority,               // High, Medium, Low
            CCCodes: notification.CCCodes || [],           // Cost center codes
            CreatedDate: notification.CreatedDate,         // When notification was created
            WorkflowType: notification.WorkflowType || notification.Type, // Workflow identifier
            
            // ========================================================================
            // ADDITIONAL METADATA FOR TRACKING AND COMPATIBILITY
            // ========================================================================
            id: notification.MasterId,                     // For compatibility
            name: notification.InboxTitle || notification.ModuleDisplayName, // Display name
            path: notification.NavigationPath,             // Original path
            ccCode: notification.CCCode,                   // Single CC code (if exists)
            pendingCount: notification.TotalPendingCount,  // For compatibility
            
            // ========================================================================
            // ORIGINAL NOTIFICATION OBJECT (For debugging and future use)
            // ========================================================================
            _originalNotification: notification            // Complete original data
        });
        
        console.log('✅ Navigated to inbox-item with data:', {
            inboxTitle: notification.InboxTitle,
            moduleCategory: notification.ModuleCategory,
            navigationPath: notification.NavigationPath,
            masterId: notification.MasterId
        });
    } else {
        console.warn('⚠️ Navigation failed - missing NavigationPath or onNavigate function');
    }
};

    // Refresh notifications manually
    const handleRefreshNotifications = () => {
        if (notificationUid && notificationRoleId) {
            dispatch(fetchUserInboxNotifications({
                userId: notificationUid,
                roleId: notificationRoleId
            }));
        }
    };

    // Toggle rejection alert dropdown
    const handleRejectionAlertToggle = () => {
        setIsRejectionAlertOpen(prev => !prev);
        setIsNotificationMenuOpen(false);
        setIsUserMenuOpen(false);
    };

    // Mark an alert as read (Status: 1) — keeps it in list, removes from count
    const handleMarkAlertRead = (alert) => {
        if (alert.IsRead) return;
        dispatch(markAlertRead(alert.RejectionAlertId));
        dispatch(updateAlertStatus({
            RejectionAlertId: alert.RejectionAlertId,
            UserId: notificationUid,
            Status: 1,
        }));
    };

    // Dismiss an alert permanently (Status: 2) — removes from list entirely
    const handleDismissAlert = (alert) => {
        dispatch(dismissAlert(alert.RejectionAlertId));
        dispatch(updateAlertStatus({
            RejectionAlertId: alert.RejectionAlertId,
            UserId: notificationUid,
            Status: 2,
        }));
    };

    // Toggle AI message expand for a specific alert
    const handleToggleAiExpand = (alertId) => {
        setExpandedAlerts(prev => {
            const next = new Set(prev);
            if (next.has(alertId)) next.delete(alertId);
            else next.add(alertId);
            return next;
        });
    };

    // Transform API menu data using actual UL, LI, SUBLI structure
    const organizeMenuFromAPI = (menuItems) => {
        if (!menuItems || !Array.isArray(menuItems)) return {};

        const organized = {};

        menuItems.forEach(item => {
            // Extract the main menu name from UL tag (remove HTML tags)
            const ulText = item.UL ? item.UL.replace(/<[^>]*>/g, '').trim() : item.Type;
            const liText = item.LI || 'Other';
            const subliText = item.SUBLI || item.FirmFunctionalAreaName || 'Unknown';

            // Initialize main menu if it doesn't exist
            if (!organized[ulText]) {
                organized[ulText] = {
                    icon: menuIcons[ulText] || FileText,
                    color: getMenuColor(ulText),
                    sections: {}
                };
            }

            // Initialize section (LI) if it doesn't exist
            if (!organized[ulText].sections[liText]) {
                organized[ulText].sections[liText] = [];
            }

            // Add the menu item (SUBLI)
            organized[ulText].sections[liText].push({
                id: item.FirmFunctionalAreaId,
                name: subliText,
                path: item.Path,
                url: item.UL,
                type: item.Type,
                li: item.LI,
                subli: item.SUBLI,
                reactRoute: `${ulText.toLowerCase()}/${subliText.toLowerCase().replace(/\s+/g, '-')}`
            });
        });

        return organized;
    };

    // Get color for menu items - Navy/orange theme
    const getMenuColor = (menuName) => {
        return 'text-[#0d1b5e] dark:text-blue-200';
    };

    // Get gradient backgrounds for menu headers - Navy/orange theme
    const getMenuGradient = (menuName) => {
        const gradientMap = {
            'Purchase': 'from-[#0d1b5e] to-orange-600',
            'Accounts': 'from-[#0d1b5e] to-orange-600',
        };
        return gradientMap[menuName] || 'from-[#0d1b5e] to-[#0a1240]';
    };

    // Get background colors for section headers - Navy/orange theme
    const getMenuBgColor = (menuName) => {
        return 'bg-[#0d1b5e]/8';
    };

    // Get text colors for section headers - Navy/orange theme
    const getMenuTextColor = (menuName) => {
        return 'text-[#0d1b5e]';
    };

    // Get hover gradient for menu items - Navy/orange theme
    const getMenuHoverGradient = (menuName) => {
        return 'from-[#0d1b5e] to-orange-500';
    };

    const [organizedMenu, setOrganizedMenu] = useState({});
    const [menuButtonRefs, setMenuButtonRefs] = useState({});

    useEffect(() => {
        if (roleData?.menuItems) {
            const organized = organizeMenuFromAPI(roleData.menuItems);
            setOrganizedMenu(organized);
            console.log('🎯 Organized Menu Structure:', organized);
        }
    }, [roleData]);

    // Create refs for menu buttons
    useEffect(() => {
        const refs = {};
        Object.keys(organizedMenu).forEach(menuKey => {
            refs[menuKey] = React.createRef();
        });
        setMenuButtonRefs(refs);
    }, [organizedMenu]);

    // Handle search functionality
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }

        if (roleData?.menuItems) {
            const results = roleData.menuItems.filter(item => {
                const searchText = searchQuery.toLowerCase();
                const itemName = (item.SUBLI || item.FirmFunctionalAreaName || '').toLowerCase();
                const itemSection = (item.LI || '').toLowerCase();
                const itemPath = (item.Path || '').toLowerCase();
                
                return itemName.includes(searchText) || 
                       itemSection.includes(searchText) || 
                       itemPath.includes(searchText);
            }).slice(0, 10); // Increased to 10 results for modal

            setSearchResults(results);
            setShowSearchResults(results.length > 0);
        }
    }, [searchQuery, roleData]);

    // Handle clicks outside dropdown and search modal + window resize + scroll
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Don't close dropdown if clicking on logout button
            if (logoutButtonRef.current && logoutButtonRef.current.contains(event.target)) {
                console.log('🎯 Logout button area clicked - ignoring outside click handler');
                return;
            }
            
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setActiveDropdown(null);
                setIsUserMenuOpen(false);
            }

            // Handle notification dropdown
            if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target)) {
                setIsNotificationMenuOpen(false);
            }

            // Handle rejection alert dropdown
            if (rejectionAlertDropdownRef.current && !rejectionAlertDropdownRef.current.contains(event.target)) {
                setIsRejectionAlertOpen(false);
            }
            
            // Close search modal if clicking outside
            if (searchModalRef.current && !searchModalRef.current.contains(event.target)) {
                setIsSearchModalOpen(false);
                setSearchQuery('');
                setSearchResults([]);
                setShowSearchResults(false);
            }
        };

        const handleResize = () => {
            if (activeDropdown) setActiveDropdown(null);
            if (isNotificationMenuOpen) setIsNotificationMenuOpen(false);
            if (isRejectionAlertOpen) setIsRejectionAlertOpen(false);
        };

        const handleScroll = () => {
            if (activeDropdown) setActiveDropdown(null);
            if (isNotificationMenuOpen) setIsNotificationMenuOpen(false);
            if (isRejectionAlertOpen) setIsRejectionAlertOpen(false);
        };

        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('resize', handleResize);
        window.addEventListener('scroll', handleScroll);
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleScroll);
        };
    }, [activeDropdown, isNotificationMenuOpen, isRejectionAlertOpen]);

    // Handle search modal open
    const handleSearchModalOpen = () => {
        setIsSearchModalOpen(true);
        // Focus the search input after modal is rendered
        setTimeout(() => {
            if (searchInputRef.current) {
                searchInputRef.current.focus();
            }
        }, 100);
    };

    // Handle search modal close
    const handleSearchModalClose = () => {
        setIsSearchModalOpen(false);
        setSearchQuery('');
        setSearchResults([]);
        setShowSearchResults(false);
    };

    // Handle ESC key to close modal and dropdowns
    useEffect(() => {
        const handleEscKey = (event) => {
            if (event.key === 'Escape') {
                if (isSearchModalOpen) {
                    handleSearchModalClose();
                } else if (activeDropdown) {
                    setActiveDropdown(null);
                } else if (isUserMenuOpen) {
                    setIsUserMenuOpen(false);
                } else if (isNotificationMenuOpen) {
                    setIsNotificationMenuOpen(false);
                } else if (isRejectionAlertOpen) {
                    setIsRejectionAlertOpen(false);
                }
            }
        };

        document.addEventListener('keydown', handleEscKey);
        return () => document.removeEventListener('keydown', handleEscKey);
    }, [isSearchModalOpen, activeDropdown, isUserMenuOpen, isNotificationMenuOpen, isRejectionAlertOpen]);

    const handleMenuClick = (item) => {
        if (onNavigate) {
            onNavigate(item.reactRoute, item);
        }
        setActiveDropdown(null);
        console.log('🔗 Navigate to:', item.reactRoute, 'Original path:', item.path);
    };

    const handleSearchItemClick = (item) => {
        if (onNavigate) {
            const reactRoute = `${item.Type?.toLowerCase()}/${(item.SUBLI || item.FirmFunctionalAreaName || '').toLowerCase().replace(/\s+/g, '-')}`;
            onNavigate(reactRoute, {
                id: item.FirmFunctionalAreaId,
                name: item.SUBLI || item.FirmFunctionalAreaName || 'Unknown',
                path: item.Path,
                url: item.UL,
                type: item.Type,
                li: item.LI,
                subli: item.SUBLI,
                reactRoute: reactRoute
            });
        }
        handleSearchModalClose();
    };

    const handleDropdownToggle = (menuKey) => {
        const newActiveDropdown = activeDropdown === menuKey ? null : menuKey;
        setActiveDropdown(newActiveDropdown);
        setIsUserMenuOpen(false);
        setIsNotificationMenuOpen(false);
        
        // Small delay to ensure button ref is ready for positioning calculations
        if (newActiveDropdown) {
            setTimeout(() => {
                // Force a re-render to ensure positioning is calculated correctly
                setActiveDropdown(prev => prev === newActiveDropdown ? newActiveDropdown : prev);
            }, 10);
        }
    };

    const handleLogout = (e) => {
        console.log('🎯 === LOGOUT BUTTON CLICKED ===');
        
        if (e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('✅ Event prevented and stopped');
        }
        
        setIsUserMenuOpen(false);
        console.log('✅ User menu closed');
        
        console.log('🔍 Logout function type:', typeof logout);
        console.log('🔍 Logout function available:', !!logout);
        
        if (!logout) {
            console.error('❌ Logout function is not available!');
            return;
        }
        
        console.log('🚀 Calling logout function...');
        
        try {
            logout();
            console.log('✅ Logout function called - waiting for redirect...');
        } catch (error) {
            console.error('❌ Error calling logout function:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
        }
    };

    const handleDirectLogout = () => {
        console.log('🔧 DIRECT LOGOUT - Bypassing hook');
        localStorage.clear();
        dispatch(logout());
        // Force navigation using window.location
        window.location.href = '/';
    };

    const formatLastActivity = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    };

    // UPDATED: Get employee name from userData first, then fallback to other sources
    const getEmployeeName = () => {
        // First priority: userData from validateUser API (has FirstName, LastName, etc.)
        if (userData?.firstName) {
            const fullName = `${userData.firstName}${userData.lastName ? ' ' + userData.lastName : ''}`.trim();
            return fullName || userData.firstName;
        }
        
        // Second priority: employeeData from getEmployeeDetails API
        if (employeeData?.name) return employeeData.name;
        if (employeeData?.employeeName) return employeeData.employeeName;
        if (employeeData?.Name) return employeeData.Name;
        if (employeeData?.FirstName) {
            const fullName = `${employeeData.FirstName}${employeeData.LastName ? ' ' + employeeData.LastName : ''}`.trim();
            return fullName || employeeData.FirstName;
        }
        
        // Fallback to employeeId
        return employeeId || 'Unknown Employee';
    };

    // UPDATED: Get role name from userData first, then fallback to other sources
    const getRoleName = () => {
        // First priority: userData from validateUser API (has UserRoleCode)
        if (userData?.roleCode) return userData.roleCode;
        
        // Second priority: roleData from getMenu API
        if (roleData?.roleName) return roleData.roleName;
        if (roleData?.RoleName) return roleData.RoleName;
        
        // Fallback to generic role with ID
        return `Role ${roleId}` || 'Unknown Role';
    };

    // UPDATED: Get user details for display
    const getUserDetails = () => {
        return {
            name: getEmployeeName(),
            roleName: getRoleName(),
            employeeId: employeeId || userData?.employeeId || 'Unknown',
            roleId: roleId || userData?.roleId || 'Unknown',
            mailId: userData?.mailId || employeeData?.MailId || 'N/A',
            ccCodes: userData?.ccCodes || 'N/A',
            userName: userData?.userName || employeeData?.UserName || employeeId || 'N/A',
            UID: userData?.UID || employeeData?.UID || 'N/A'
        };
    };

    // Log user data for debugging
    useEffect(() => {
        console.log('🔍 TopNavbar Debug - User Data Sources:');
        console.log('userData:', userData);
        console.log('employeeData:', employeeData);
        console.log('roleData:', roleData);
        console.log('employeeId:', employeeId);
        console.log('roleId:', roleId);
        console.log('Final display values:', getUserDetails());
        console.log('🔔 Notifications Debug:', {
            notificationsSummary,
            totalPendingCount,
            notificationsLoading
        });
    }, [userData, employeeData, roleData, employeeId, roleId, notificationsSummary, totalPendingCount, notificationsLoading]);

    const userDetails = getUserDetails();

    // Calculate mega menu positioning and width with better viewport handling
    const getMegaMenuProps = (sections, menuKey, buttonRef) => {
        const sectionCount = Object.keys(sections).length;
        const maxColumns = Math.min(sectionCount, 4); // Max 4 columns
        const columnWidth = 300;
        const baseWidth = maxColumns * columnWidth;
        
        // Get viewport dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const scrollY = window.scrollY;
        
        // Calculate maximum possible width
        const maxPossibleWidth = Math.min(baseWidth, viewportWidth - 40); // Leave 20px margin on each side
        
        let positioning = { left: '50%', transform: 'translateX(-50%)', right: 'auto', top: '4rem' };
        
        if (buttonRef) {
            const buttonRect = buttonRef.getBoundingClientRect();
            const navbarHeight = 64; // Height of navbar
            const dropdownHeight = Math.min(500, viewportHeight - 120);
            
            // Check if dropdown would go below viewport
            const spaceBelow = viewportHeight - buttonRect.bottom;
            const spaceAbove = buttonRect.top;
            
            // Start with default positioning below navbar
            positioning.top = '4rem';
            
            // If not enough space below and more space above, position above
            if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow && spaceAbove > 200) {
                positioning = {
                    ...positioning,
                    top: 'auto',
                    bottom: `${viewportHeight - buttonRect.top + 8}px`
                };
            }
            
            // Calculate available space on left and right
            const spaceOnLeft = buttonRect.left;
            const spaceOnRight = viewportWidth - buttonRect.right;
            const spaceInMiddle = viewportWidth - 40; // Total available width with margins
            
            // Determine horizontal positioning strategy
            if (maxPossibleWidth <= spaceInMiddle) {
                // If menu fits in viewport with margins
                if (buttonRect.left + maxPossibleWidth <= viewportWidth - 20) {
                    // Left align if it fits
                    positioning = {
                        ...positioning,
                        left: `${Math.max(20, buttonRect.left)}px`,
                        transform: 'none',
                        right: 'auto'
                    };
                } else if (buttonRect.right - maxPossibleWidth >= 20) {
                    // Right align if left doesn't fit
                    positioning = {
                        ...positioning,
                        right: `${Math.max(20, viewportWidth - buttonRect.right)}px`,
                        transform: 'none',
                        left: 'auto'
                    };
                } else {
                    // Center if neither left nor right alignment works
                    positioning = {
                        ...positioning,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        right: 'auto'
                    };
                }
            } else {
                // If menu is too wide, center it and make it fit viewport
                positioning = {
                    ...positioning,
                    left: '20px',
                    right: '20px',
                    transform: 'none'
                };
            }
        }
        
        return {
            columns: maxColumns,
            width: maxPossibleWidth,
            positioning,
            maxHeight: Math.min(500, viewportHeight - 120) // Leave space for navbar and some margin
        };
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            {/* Top Navigation Bar */}
            <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors">
                <div className="max-w-full px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo and Company Name */}
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gradient-to-r rounded-lg flex items-center justify-center">
                                    <img src="/logoicon.png" alt="slt" className='rounded-full shadow-lg' />
                                </div>
                                <div>
                                    {/* <h2 className="text-lg font-bold text-gray-900 dark:text-white">HAIP</h2> */}
                                    {/* <p className="text-xs text-gray-500 dark:text-gray-400">Management</p> */}
                                </div>
                            </div>
                        </div>

                        {/* Main Navigation Menu - Removed max-width constraint */}
                        <div className="hidden md:flex items-center space-x-1 flex-1 justify-center overflow-x-auto" ref={dropdownRef}>
                            {/* Home/Dashboard */}
                            <button
                                onClick={() => onNavigate && onNavigate('dashboard', { name: 'Dashboard', type: 'dashboard' })}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                                    currentPage === 'dashboard'
                                        ? 'bg-[#0d1b5e]/10 dark:bg-[#0d1b5e]/40 text-[#0d1b5e] dark:text-orange-300'
                                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                            >
                                <div className="flex items-center space-x-2">
                                    <Home className="w-4 h-4" />
                                    <span>Dashboard</span>
                                </div>
                            </button>

                            {/* Dynamic Menu Items from API */}
                            {Object.entries(organizedMenu).map(([menuKey, menuData]) => {
                                const IconComponent = menuData.icon;
                                const hasSections = Object.keys(menuData.sections).length > 0;
                                const buttonRef = menuButtonRefs[menuKey];

                                return (
                                    <div key={menuKey} className="relative flex-shrink-0">
                                        <button
                                            ref={buttonRef}
                                            onClick={() => hasSections ? handleDropdownToggle(menuKey) : null}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 whitespace-nowrap ${
                                                activeDropdown === menuKey || currentPage?.startsWith(menuKey.toLowerCase())
                                                    ? `bg-[#0d1b5e]/10 dark:bg-[#0d1b5e]/40 text-[#0d1b5e] dark:text-orange-300 border-b-2 border-orange-500`
                                                    : `text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 ${menuData.color}`
                                            }`}
                                        >
                                            <IconComponent className="w-4 h-4" />
                                            <span>{menuKey}</span>
                                            {hasSections && <ChevronDown className="w-4 h-4" />}
                                        </button>

                                        {/* Mega Menu Dropdown with Better Positioning */}
                                        {activeDropdown === menuKey && hasSections && buttonRef?.current && (() => {
                                            const menuProps = getMegaMenuProps(menuData.sections, menuKey, buttonRef.current);
                                            const isFullWidth = menuProps.positioning.left === '20px' && menuProps.positioning.right === '20px';
                                            
                                            return (
                                                <div 
                                                    className="fixed bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-50 transition-colors"
                                                    style={{ 
                                                        width: isFullWidth ? 'auto' : `${menuProps.width}px`,
                                                        maxHeight: `${menuProps.maxHeight}px`,
                                                        ...menuProps.positioning
                                                    }}
                                                >
                                                    {/* Menu Header with Color Theme */}
                                                    <div className={`px-6 py-3 border-b border-gray-200 bg-gradient-to-r ${getMenuGradient(menuKey)}`}>
                                                        <div className="flex items-center space-x-2">
                                                            <IconComponent className="w-5 h-5 text-white" />
                                                            <h3 className="text-sm font-semibold text-white">{menuKey} Menu</h3>
                                                            <span className="ml-auto text-xs text-white/80">
                                                                {Object.values(menuData.sections).flat().length} items
                                                            </span>
                                                        </div>
                                                    </div>
                                                    
                                                    <div 
                                                        className="overflow-y-auto"
                                                        style={{ 
                                                            maxHeight: `calc(${menuProps.maxHeight}px - 60px)`,
                                                            display: 'grid',
                                                            gridTemplateColumns: `repeat(${menuProps.columns}, 1fr)`,
                                                            gap: '0'
                                                        }}
                                                    >
                                                        {Object.entries(menuData.sections).map(([sectionKey, items], colIndex) => (
                                                            <div key={colIndex} className="border-r border-gray-100 dark:border-gray-600 last:border-r-0">
                                                                {/* Section Header (LI) */}
                                                                <div className={`sticky top-0 bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600 ${getMenuBgColor(menuKey)} transition-colors`}>
                                                                    <h4 className={`text-xs font-bold uppercase tracking-wider ${getMenuTextColor(menuKey)} dark:text-gray-300`}>
                                                                        {sectionKey}
                                                                        <span className="ml-2 text-gray-400 font-normal">({items.length})</span>
                                                                    </h4>
                                                                </div>
                                                                
                                                                {/* Menu Items (SUBLI) - Scrollable */}
                                                                <div className="max-h-80 overflow-y-auto">
                                                                    <div className="p-2 space-y-1">
                                                                        {items.map((item, itemIndex) => (
                                                                            <button
                                                                                key={itemIndex}
                                                                                onClick={() => handleMenuClick(item)}
                                                                                className={`block w-full text-left px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r ${getMenuHoverGradient(menuKey)} hover:text-white rounded-md transition-all duration-200 group`}
                                                                                title={`Path: ${item.path}`}
                                                                            >
                                                                                <div className="flex items-center space-x-3">
                                                                                    <FileText className="w-4 h-4 text-gray-400 group-hover:text-white/80 flex-shrink-0" />
                                                                                    <span className="text-sm leading-tight break-words">{item.name}</span>
                                                                                </div>
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Menu Footer */}
                                                    <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700  border-t border-gray-200 dark:border-gray-600 rounded-b-lg transition-colors">
                                                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                                            <span>Click any item to navigate</span>
                                                            <span className="flex items-center space-x-1">
                                                                <span>{Object.keys(menuData.sections).length} sections</span>
                                                                <span>•</span>
                                                                <span>{Object.values(menuData.sections).flat().length} total items</span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Right Side Actions */}
                        <div className="flex items-center space-x-4">
                            {/* Search Icon Button */}
                            <button 
                                onClick={handleSearchModalOpen}
                                className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                title="Search menu items"
                            >
                                <Search className="w-5 h-5" />
                            </button>

                            {/* Theme Toggle */}
                            <ThemeToggle variant="dropdown" showLabel={false} />

                            {/* Rejection Alerts */}
                            <div className="relative" ref={rejectionAlertDropdownRef}>
                                <button
                                    onClick={handleRejectionAlertToggle}
                                    className={`relative flex flex-col items-center justify-center px-2 py-1.5 rounded-lg transition-all duration-200 ${
                                        rejectionAlertCount > 0
                                            ? isRejectionAlertOpen
                                                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                                : 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30'
                                            : isRejectionAlertOpen
                                                ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                                    title={rejectionAlertCount > 0 ? `${rejectionAlertCount} unread rejection alert${rejectionAlertCount !== 1 ? 's' : ''}` : 'Rejection Alerts'}
                                >
                                    {/* Bell + badge */}
                                    <div className="relative">
                                        <Bell className="w-5 h-5" />
                                        {rejectionAlertCount > 0 && (
                                            <>
                                                {/* Pulsing ring */}
                                                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-400 rounded-full animate-ping opacity-70 pointer-events-none" />
                                                {/* Count badge */}
                                                <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 z-10 leading-none">
                                                    {rejectionAlertCount > 99 ? '99+' : rejectionAlertCount}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    {/* "NEW" label below icon — only when unread */}
                                    {rejectionAlertCount > 0 && (
                                        <span className="text-[8px] font-black uppercase tracking-widest text-red-500 dark:text-red-400 leading-none mt-0.5">
                                            new
                                        </span>
                                    )}
                                </button>

                                {/* Rejection Alerts Dropdown */}
                                {isRejectionAlertOpen && (
                                    <div className="absolute right-0 top-full mt-1 w-[26rem] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 max-h-[32rem] flex flex-col">

                                        {/* Header */}
                                        <div className="px-4 py-3 bg-gradient-to-r from-red-600 to-rose-500 rounded-t-xl flex-shrink-0">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Bell className="w-4 h-4 text-white" />
                                                    <h3 className="text-sm font-bold text-white tracking-wide">Rejection Alerts</h3>
                                                </div>
                                                {rejectionAlertCount > 0 && (
                                                    <span className="text-[11px] font-semibold bg-white/20 text-white px-2 py-0.5 rounded-full">
                                                        {rejectionAlertCount} unread
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Body */}
                                        <div className="overflow-y-auto flex-1">
                                            {rejectionAlertsLoading ? (
                                                <div className="p-8 text-center">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-3" />
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Loading alerts...</p>
                                                </div>
                                            ) : rejectionAlerts.length === 0 ? (
                                                <div className="p-8 text-center">
                                                    <CheckCheck className="w-10 h-10 mx-auto mb-3 text-emerald-400" />
                                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">All clear!</p>
                                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">No rejection alerts</p>
                                                </div>
                                            ) : (
                                                <div className="p-2 space-y-2">
                                                    {rejectionAlerts.map((alert, index) => {
                                                        const isRead = alert.Status === 1 || alert.IsRead;
                                                        const isAiExpanded = expandedAlerts.has(alert.RejectionAlertId);
                                                        return (
                                                            <div
                                                                key={alert.RejectionAlertId ?? index}
                                                                className={`rounded-xl border overflow-hidden transition-all duration-200 ${
                                                                    isRead
                                                                        ? 'bg-gray-50 dark:bg-gray-700/40 border-gray-200 dark:border-gray-700'
                                                                        : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
                                                                }`}
                                                            >
                                                                {/* Main row */}
                                                                <div
                                                                    className="p-3 flex items-start gap-3 cursor-pointer"
                                                                    onClick={() => handleMarkAlertRead(alert)}
                                                                >
                                                                    {/* Status dot */}
                                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                                                        isRead ? 'bg-gray-300 dark:bg-gray-600' : 'bg-red-500'
                                                                    }`}>
                                                                        <AlertCircle className="w-4 h-4 text-white" />
                                                                    </div>

                                                                    <div className="flex-1 min-w-0">
                                                                        {/* Module + unread dot */}
                                                                        <div className="flex items-center gap-2 mb-0.5">
                                                                            <span className={`text-xs font-bold truncate ${
                                                                                isRead ? 'text-gray-500 dark:text-gray-400' : 'text-red-600 dark:text-red-400'
                                                                            }`}>
                                                                                {alert.ModuleName || 'Rejection'}
                                                                            </span>
                                                                            {!isRead && <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />}
                                                                        </div>

                                                                        {/* Rejected by + date */}
                                                                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                                                            Rejected by <span className="font-semibold text-gray-600 dark:text-gray-300">{alert.RejectedBy}</span>
                                                                            {alert.RejectedOn && <> · {alert.RejectedOn}</>}
                                                                        </p>

                                                                        {/* Ref no */}
                                                                        {alert.Refno && (
                                                                            <p className="text-[11px] font-mono text-gray-400 dark:text-gray-500 mt-0.5">
                                                                                {alert.Refno}
                                                                            </p>
                                                                        )}

                                                                        {/* Rejection remarks */}
                                                                        {alert.Remarks && (
                                                                            <p className={`text-xs mt-1.5 leading-relaxed line-clamp-2 ${
                                                                                isRead ? 'text-gray-500 dark:text-gray-400 italic' : 'text-gray-700 dark:text-gray-200 italic'
                                                                            }`}>
                                                                                "{alert.Remarks}"
                                                                            </p>
                                                                        )}

                                                                        {!isRead && (
                                                                            <span className="inline-block mt-1 text-[10px] text-red-500 dark:text-red-400">
                                                                                Click to mark as read
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    {/* Dismiss */}
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); handleDismissAlert(alert); }}
                                                                        className="flex-shrink-0 p-1 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                                        title="Dismiss permanently"
                                                                    >
                                                                        <X className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </div>

                                                                {/* AI Message — expand toggle */}
                                                                {alert.AiMessage && (
                                                                    <>
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); handleToggleAiExpand(alert.RejectionAlertId); }}
                                                                            className="w-full flex items-center justify-between px-3 py-1.5 bg-violet-50 dark:bg-violet-900/20 border-t border-violet-100 dark:border-violet-800/50 text-[11px] font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors"
                                                                        >
                                                                            <span className="flex items-center gap-1.5">
                                                                                ✨ AI Insight
                                                                            </span>
                                                                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isAiExpanded ? 'rotate-180' : ''}`} />
                                                                        </button>
                                                                        {isAiExpanded && (
                                                                            <div className="px-3 py-3 bg-violet-50/60 dark:bg-violet-900/10 border-t border-violet-100 dark:border-violet-800/50 text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed">
                                                                                {alert.AiMessage}
                                                                            </div>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Footer */}
                                        {rejectionAlerts.length > 0 && (
                                            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/60 border-t border-gray-200 dark:border-gray-700 rounded-b-xl flex-shrink-0">
                                                <div className="flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500">
                                                    <span className="flex items-center gap-1.5">
                                                        <CheckCheck className="w-3.5 h-3.5" />
                                                        Click to mark read
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        ✨ Expand for AI insight
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Inbox Notifications */}
                            <div className="relative" ref={notificationDropdownRef}>
                                <button 
                                    onClick={() => setIsNotificationMenuOpen(!isNotificationMenuOpen)}
                                    className={`p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 relative transition-colors ${
                                        isNotificationMenuOpen ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' : ''
                                    }`}
                                    title="Inbox Notifications"
                                >
                                    <Mail className="w-5 h-5" />
                                    {totalPendingCount > 0 && (
                                        <span className="absolute -top-1 -right-1 min-w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-1">
                                            {totalPendingCount > 99 ? '99+' : totalPendingCount}
                                        </span>
                                    )}
                                    {notificationsLoading && (
                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full animate-pulse"></div>
                                    )}
                                </button>

                                {/* Notifications Dropdown */}
                                {isNotificationMenuOpen && (
                                    <div className="absolute right-0 top-full mt-1 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 transition-colors max-h-96 overflow-hidden">
                                        {/* Notifications Header */}
                                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-[#0d1b5e] to-[#0a1240]">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <Mail className="w-5 h-5 text-white" />
                                                    <h3 className="text-sm font-semibold text-white">Inbox Notifications</h3>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-xs text-white/80">
                                                        {totalPendingCount} pending
                                                    </span>
                                                    <button
                                                        onClick={handleRefreshNotifications}
                                                        className="p-1 text-white/80 hover:text-white rounded-md hover:bg-white/10 transition-colors"
                                                        title="Refresh notifications"
                                                        disabled={notificationsLoading}
                                                    >
                                                        <svg className={`w-4 h-4 ${notificationsLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Notifications Content */}
                                        <div className="max-h-80 overflow-y-auto">
                                            {notificationsLoading ? (
                                                <div className="p-6 text-center">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Loading notifications...</p>
                                                </div>
                                            ) : notificationsSummary.length === 0 ? (
                                                <div className="p-6 text-center">
                                                    <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">No pending notifications</p>
                                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">All caught up!</p>
                                                </div>
                                            ) : (
                                                <div className="p-2 space-y-1">
                                                    {notificationsSummary.map((notification, index) => {
                                                        const CategoryIcon = getCategoryIcon(notification.ModuleCategory);
                                                        console.log('🔔 Rendering notification:', notification.ModuleDisplayName, 'Category:', notification.ModuleCategory, 'Icon:', CategoryIcon?.name);
                                                        
                                                        return (
                                                            <button
                                                                key={index}
                                                                onClick={() => handleNotificationClick(notification)}
                                                                className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg border border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-200 group"
                                                                title={`Click to navigate to ${notification.ModuleDisplayName}`}
                                                            >
                                                                <div className="flex items-center space-x-3">
                                                                    <div className="flex-shrink-0">
                                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getPriorityColor(notification)}`}>
                                                                            {CategoryIcon ? (
                                                                                <CategoryIcon className="w-4 h-4 text-white" />
                                                                            ) : (
                                                                                <FileText className="w-4 h-4 text-white" />
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center justify-between">
                                                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                                                {notification.InboxTitle}
                                                                            </p>
                                                                            <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(notification)} text-white`}>
                                                                                {notification.TotalPendingCount}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex items-center space-x-2 mt-1">
                                                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                                {notification.ModuleCategory}
                                                                            </span>
                                                                            {notification.CCCodes && notification.CCCodes.length > 0 && (
                                                                                <>
                                                                                    <span className="text-xs text-gray-400">•</span>
                                                                                    <span className="text-xs text-orange-600 dark:text-orange-400 font-mono">
                                                                                        {notification.CCCodes.length} CC{notification.CCCodes.length > 1 ? 's' : ''}
                                                                                    </span>
                                                                                </>
                                                                            )}
                                                                            <span className="text-xs text-gray-400">•</span>
                                                                            <span className={`text-xs px-1.5 py-0.5 rounded text-white ${
                                                                                notification.Status === 1 ? 'bg-red-500' : 
                                                                                notification.Status === 2 ? 'bg-orange-500' : 'bg-[#0d1b5e]'
                                                                            }`}>
                                                                                {notification.Status === 1 ? 'Urgent' : 
                                                                                 notification.Status === 2 ? 'Active' : 'Pending'}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Notifications Footer */}
                                        {notificationsSummary.length > 0 && (
                                            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 rounded-b-lg transition-colors">
                                                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                                    <span>Click any notification to view details</span>
                                                    <span className="flex items-center space-x-1">
                                                        <span>{notificationsSummary.length} modules</span>
                                                        <span>•</span>
                                                        <span>{totalPendingCount} total pending</span>
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* User Menu - UPDATED WITH REAL USER DATA */}
                            <div className="relative">
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setIsUserMenuOpen(!isUserMenuOpen);
                                        setIsNotificationMenuOpen(false);
                                    }}
                                    className="flex items-center space-x-2 p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <div className="w-8 h-8 bg-gradient-to-r from-[#0d1b5e] to-orange-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-sm font-bold">
                                            {userDetails.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="text-left hidden lg:block">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {userDetails.name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {userDetails.roleName}
                                        </p>
                                    </div>
                                    <ChevronDown className="w-4 h-4" />
                                </button>

                                {/* User Dropdown - UPDATED WITH COMPLETE USER INFO */}
                                {isUserMenuOpen && (
                                    <div className="absolute right-0 top-full mt-1 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 transition-colors">
                                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center space-x-3 mb-3">
                                                <div className="w-12 h-12 bg-gradient-to-r from-[#0d1b5e] to-orange-500 rounded-full flex items-center justify-center">
                                                    <span className="text-white text-lg font-bold">
                                                        {userDetails.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                        {userDetails.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {userDetails.roleName}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                                                <div className="flex justify-between">
                                                    <span>Employee ID:</span>
                                                    <span className="font-mono">{userDetails.employeeId}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Role ID:</span>
                                                    <span className="font-mono">{userDetails.roleId}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Email:</span>
                                                    <span className="font-mono text-xs truncate max-w-32" title={userDetails.mailId}>
                                                        {userDetails.mailId}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Last Activity:</span>
                                                    <span>{formatLastActivity(lastActivity)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Menu Items:</span>
                                                    <span>{roleData?.menuItems?.length || 0}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Notifications:</span>
                                                    <span className="text-red-600 font-semibold">{totalPendingCount}</span>
                                                </div>
                                                {userDetails.ccCodes && userDetails.ccCodes !== 'N/A' && (
                                                    <div className="flex justify-between">
                                                        <span>CC Access:</span>
                                                        <span className="font-mono text-xs">Available</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="py-2">
                                            <button className="w-full text-left px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                                <span className="flex items-center space-x-2">
                                                    <Shield className="w-4 h-4" />
                                                    <span>My Account</span>
                                                </span>
                                            </button>
                                            <button className="w-full text-left px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                                <span className="flex items-center space-x-2">
                                                    <Settings className="w-4 h-4" />
                                                    <span>Support</span>
                                                </span>
                                            </button>
                                            <hr className="my-2 border-gray-200 dark:border-gray-700" />
                                            <button
                                                ref={logoutButtonRef}
                                                onClick={handleLogout}
                                                onDoubleClick={handleDirectLogout}
                                                onMouseDown={(e) => {
                                                    // Prevent any interference from other events
                                                    console.log('🎯 Logout button mousedown');
                                                    e.stopPropagation();
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2 transition-colors"
                                                title="Click to logout | Double-click for direct logout"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                <span>Logout</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Search Modal */}
            {isSearchModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
                    <div 
                        ref={searchModalRef}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl mx-4 transition-colors"
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center space-x-2">
                                <Search className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Search Menu Items</h2>
                            </div>
                            <button
                                onClick={handleSearchModalClose}
                                className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Search Input */}
                        <div className="p-4">
                            <div className="relative">
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Type to search menu items..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                                />
                                <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                            </div>
                        </div>

                        {/* Search Results */}
                        <div className="max-h-96 overflow-y-auto">
                            {searchQuery.trim() === '' ? (
                                <div className="p-8 text-center text-gray-500">
                                    <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                    <p>Start typing to search menu items...</p>
                                    <p className="text-sm mt-1">You can search by item name, section, or path</p>
                                </div>
                            ) : searchResults.length > 0 ? (
                                <div className="p-2">
                                    {searchResults.map((item, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleSearchItemClick(item)}
                                            className="w-full text-left p-4 hover:bg-gray-50 transition-colors rounded-lg border-b border-gray-100 last:border-b-0"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="flex-shrink-0">
                                                    <FileText className="w-5 h-5 text-gray-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-300 hover:dark:text-gray-600 truncate">
                                                        {item.SUBLI || item.FirmFunctionalAreaName}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {item.LI} • {item.Type}
                                                    </p>
                                                    {item.Path && (
                                                        <p className="text-xs text-gray-400 mt-1 font-mono">
                                                            {item.Path}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-gray-500">
                                    <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                    <p>No menu items found</p>
                                    <p className="text-sm mt-1">Try searching with different keywords</p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>Press ESC to close</span>
                                <span>{roleData?.menuItems?.length || 0} total menu items</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <main className="max-w-full mx-auto py-6 px-4 sm:px-6 lg:px-8 pb-14">
                {children}
            </main>

            {/* Footer */}
            <footer className="fixed bottom-0 left-0 right-0 z-40 bg-[#0d1b5e] dark:bg-[#0a1240] text-white py-4 transition-colors">
                <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        <p className="text-sm">Copyright © . All Rights Reserved</p>
                        <img src="/image.png" alt="applogo" className='h-10' />
                        <p className="text-sm">Powered By SL Touch IT Solutions Pvt Ltd.</p>
                    </div>
                </div>
            </footer>

            {/* Debug Panel (Remove in production) */}
           {/*  {process.env.NODE_ENV === 'development' && (
                <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-3 rounded-lg text-xs max-w-sm">
                    <div className="font-bold mb-1">Debug Info:</div>
                    <div>Current Page: {currentPage}</div>
                    <div>Active Dropdown: {activeDropdown}</div>
                    <div>Menu Count: {Object.keys(organizedMenu).length}</div>
                    <div>Total Items: {roleData?.menuItems?.length || 0}</div>
                    <div>User Name: {userDetails.name}</div>
                    <div>Role Name: {userDetails.roleName}</div>
                    <div>User ID: {userDetails.UID}</div>
                    <div>Role ID: {userDetails.role}</div>
                </div>
            )} */}
        </div>
    );
};

export default TopNavbarLayout;