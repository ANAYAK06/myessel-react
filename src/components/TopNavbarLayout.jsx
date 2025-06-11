import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    LogOut, Shield, Building2, Users, BarChart3, Settings, ChevronDown,
    Search, Bell, Home, FileText, Package, Warehouse, ShoppingCart,
    Database, TrendingUp, Calculator, CreditCard, Briefcase, FolderOpen, X
} from 'lucide-react';
import { useLogout } from '../hooks/useLogout';
import ThemeToggle from './ThemeToggle';

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
    
    const { logout } = useLogout();
    
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const dropdownRef = useRef(null);
    const searchModalRef = useRef(null);
    const searchInputRef = useRef(null);
    const logoutButtonRef = useRef(null);
    const dispatch = useDispatch();

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

    // Get color for menu items - Professional indigo/purple theme
    const getMenuColor = (menuName) => {
        const colorMap = {
            'Reports': 'text-indigo-600',
            'Hr': 'text-indigo-600',
            'HR': 'text-indigo-600',
            'Configuration': 'text-purple-600',
            'Masters': 'text-indigo-700',
            'Sales': 'text-indigo-600',
            'Purchase': 'text-purple-600',
            'Inventory': 'text-indigo-700',
            'Warehouse': 'text-purple-700',
            'Finance': 'text-indigo-600',
            'Accounts': 'text-purple-600'
        };
        return colorMap[menuName] || 'text-indigo-600';
    };

    // Get gradient backgrounds for menu headers - Professional theme
    const getMenuGradient = (menuName) => {
        const gradientMap = {
            'Reports': 'from-indigo-500 to-indigo-600',
            'Hr': 'from-indigo-500 to-purple-600',
            'HR': 'from-indigo-500 to-purple-600',
            'Configuration': 'from-purple-500 to-purple-600',
            'Masters': 'from-indigo-600 to-indigo-700',
            'Sales': 'from-indigo-500 to-indigo-600',
            'Purchase': 'from-purple-500 to-indigo-600',
            'Inventory': 'from-indigo-600 to-purple-600',
            'Warehouse': 'from-purple-600 to-purple-700',
            'Finance': 'from-indigo-500 to-indigo-600',
            'Accounts': 'from-purple-500 to-purple-600'
        };
        return gradientMap[menuName] || 'from-indigo-500 to-indigo-600';
    };

    // Get background colors for section headers - Professional theme
    const getMenuBgColor = (menuName) => {
        const bgMap = {
            'Reports': 'bg-indigo-50',
            'Hr': 'bg-indigo-50',
            'HR': 'bg-indigo-50',
            'Configuration': 'bg-purple-50',
            'Masters': 'bg-indigo-50',
            'Sales': 'bg-indigo-50',
            'Purchase': 'bg-purple-50',
            'Inventory': 'bg-indigo-50',
            'Warehouse': 'bg-purple-50',
            'Finance': 'bg-indigo-50',
            'Accounts': 'bg-purple-50'
        };
        return bgMap[menuName] || 'bg-indigo-50';
    };

    // Get text colors for section headers - Professional theme
    const getMenuTextColor = (menuName) => {
        const textMap = {
            'Reports': 'text-indigo-700',
            'Hr': 'text-indigo-700',
            'HR': 'text-indigo-700',
            'Configuration': 'text-purple-700',
            'Masters': 'text-indigo-800',
            'Sales': 'text-indigo-700',
            'Purchase': 'text-purple-700',
            'Inventory': 'text-indigo-800',
            'Warehouse': 'text-purple-800',
            'Finance': 'text-indigo-700',
            'Accounts': 'text-purple-700'
        };
        return textMap[menuName] || 'text-indigo-700';
    };

    // Get hover gradient for menu items - Professional theme
    const getMenuHoverGradient = (menuName) => {
        const hoverMap = {
            'Reports': 'from-indigo-500 to-indigo-600',
            'Hr': 'from-indigo-500 to-purple-600',
            'HR': 'from-indigo-500 to-purple-600',
            'Configuration': 'from-purple-500 to-purple-600',
            'Masters': 'from-indigo-600 to-indigo-700',
            'Sales': 'from-indigo-500 to-indigo-600',
            'Purchase': 'from-purple-500 to-indigo-600',
            'Inventory': 'from-indigo-600 to-purple-600',
            'Warehouse': 'from-purple-600 to-purple-700',
            'Finance': 'from-indigo-500 to-indigo-600',
            'Accounts': 'from-purple-500 to-purple-600'
        };
        return hoverMap[menuName] || 'from-indigo-500 to-indigo-600';
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
            
            // Close search modal if clicking outside
            if (searchModalRef.current && !searchModalRef.current.contains(event.target)) {
                setIsSearchModalOpen(false);
                setSearchQuery('');
                setSearchResults([]);
                setShowSearchResults(false);
            }
        };

        const handleResize = () => {
            // Close dropdown on window resize to prevent positioning issues
            if (activeDropdown) {
                setActiveDropdown(null);
            }
        };

        const handleScroll = () => {
            // Close dropdown on scroll to prevent positioning issues
            if (activeDropdown) {
                setActiveDropdown(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('resize', handleResize);
        window.addEventListener('scroll', handleScroll);
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleScroll);
        };
    }, [activeDropdown]);

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
                }
            }
        };

        document.addEventListener('keydown', handleEscKey);
        return () => document.removeEventListener('keydown', handleEscKey);
    }, [isSearchModalOpen, activeDropdown, isUserMenuOpen]);

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
    }, [userData, employeeData, roleData, employeeId, roleId]);

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
                                <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                                    <img src="/logohaip.png" alt="slt" className='rounded-lg shadow-lg' />
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold text-gray-900 dark:text-white">HAIP</h1>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Management Modules</p>
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
                                        ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
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
                                                    ? `bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border-b-2 border-indigo-500`
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

                            {/* Notifications */}
                            <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 relative transition-colors" title="Notifications">
                                <Bell className="w-5 h-5" />
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                    1
                                </span>
                            </button>

                            {/* User Menu - UPDATED WITH REAL USER DATA */}
                            <div className="relative">
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setIsUserMenuOpen(!isUserMenuOpen);
                                    }}
                                    className="flex items-center space-x-2 p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
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
                                                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
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
                                    className="w-full pl-10 pr-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
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
                                                    <p className="text-sm font-medium text-gray-900 truncate">
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
            <main className="max-w-full mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-gray-800 dark:bg-gray-900 text-white py-4 mt-auto transition-colors">
                <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        <p className="text-sm">Copyright © . All Rights Reserved</p>
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