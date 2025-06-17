// Enhanced Dashboard Content Component with Centralized Frequency Tracking
import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { 
    TrendingUp, TrendingDown, ShoppingCart, Package, AlertTriangle, 
    CheckCircle, Clock, BarChart3, PieChart, Activity, Users, FileText,
    DollarSign, ArrowUpRight, ArrowDownRight, Eye, ExternalLink,
    Zap, Target, Award, Bell, Star, TrendingUpIcon, Calculator, CreditCard
} from 'lucide-react';

const DashboardContent = ({ onNavigate, linkFrequency = {}, trackMenuUsage }) => {
    const { roleData, userData } = useSelector((state) => state.auth);

    // Mock dashboard data - replace with actual API calls
    const dashboardData = {
        sales: {
            today: 125000,
            thisMonth: 2500000,
            growth: 15.3,
            trend: 'up'
        },
        purchase: {
            today: 85000,
            thisMonth: 1800000,
            growth: -3.2,
            trend: 'down'
        },
        transactions: {
            total: 1456,
            pending: 23,
            approved: 1398,
            rejected: 35
        },
        tracking: {
            inTransit: 45,
            delivered: 234,
            delayed: 8,
            processing: 12
        }
    };

    // Function to handle link clicks from Dashboard Quick Access
    const handleLinkClick = useCallback((linkPath, linkData) => {
        // Track usage via centralized function
        if (trackMenuUsage) {
            trackMenuUsage(linkData);
        }

        // Call the navigation function
        if (onNavigate) {
            onNavigate(linkData.reactRoute, linkData);
        }
        
        console.log('🔗 Dashboard Link clicked:', linkData.name, 'Navigation triggered');
    }, [onNavigate, trackMenuUsage]);

    // Get icon for menu items
    const getIconForItem = (item) => {
        const path = item.Path?.toLowerCase() || '';
        const name = (item.SUBLI || '').toLowerCase();
        
        if (path.includes('report') || name.includes('report')) return BarChart3;
        if (path.includes('employee') || name.includes('employee')) return Users;
        if (path.includes('purchase') || name.includes('purchase')) return ShoppingCart;
        if (path.includes('sale') || name.includes('sale')) return TrendingUp;
        if (path.includes('balance') || name.includes('balance')) return DollarSign;
        if (path.includes('ledger') || name.includes('ledger')) return FileText;
        if (path.includes('inventory') || name.includes('inventory')) return Package;
        if (path.includes('warehouse') || name.includes('warehouse')) return Package;
        if (path.includes('finance') || name.includes('finance')) return Calculator;
        if (path.includes('account') || name.includes('account')) return CreditCard;
        return FileText;
    };

    // Get all available menu items with their frequency data
    const getAllMenuItemsWithFrequency = () => {
        if (!roleData?.menuItems) return [];
        
        return roleData.menuItems.map(item => {
            // Use consistent key format with RoleBasedApplication
            const section = item.LI || 'Other';
            const name = item.SUBLI || item.FirmFunctionalAreaName || 'Unknown';
            const linkKey = `${section}_${name}`;
            const frequency = linkFrequency[linkKey] || 0;
            
            return {
                id: item.FirmFunctionalAreaId,
                name: name,
                section: section,
                path: item.Path,
                icon: getIconForItem(item),
                type: item.Type,
                frequency: frequency,
                reactRoute: `${item.Type?.toLowerCase()}/${name.toLowerCase().replace(/\s+/g, '-')}`,
                originalItem: item,
                // Include all properties for navigation
                li: item.LI,
                subli: item.SUBLI,
                url: item.UL
            };
        });
    };

    // Get frequently accessed links (top 8 most clicked)
    const getFrequentlyAccessedLinks = () => {
        const allItems = getAllMenuItemsWithFrequency();
        
        // If no frequency data exists, return first 8 items as default
        if (Object.keys(linkFrequency).length === 0) {
            console.log('📊 No frequency data, showing default first 8 items');
            return allItems.slice(0, 8);
        }
        
        // Sort by frequency (descending) and take top 8
        const frequentItems = allItems
            .filter(item => item.frequency > 0)
            .sort((a, b) => b.frequency - a.frequency)
            .slice(0, 8);
        
        console.log('📊 Found frequent items:', frequentItems.map(item => `${item.name}: ${item.frequency}`));
        
        // If we have less than 8 frequent items, fill remaining with unclicked items
        if (frequentItems.length < 8) {
            const unclickedItems = allItems
                .filter(item => item.frequency === 0)
                .slice(0, 8 - frequentItems.length);
            
            console.log('📊 Adding unclicked items to fill slots:', unclickedItems.length);
            return [...frequentItems, ...unclickedItems];
        }
        
        return frequentItems;
    };

    // Get recent items (last 4 clicked)
    const getRecentlyAccessedLinks = () => {
        // For now, return items with highest frequency as "recent"
        // In a real app, you'd track timestamps
        return getAllMenuItemsWithFrequency()
            .filter(item => item.frequency > 0)
            .sort((a, b) => b.frequency - a.frequency)
            .slice(0, 4);
    };

    const quickAccessLinks = getFrequentlyAccessedLinks();
    const recentLinks = getRecentlyAccessedLinks();
    const totalClicks = Object.values(linkFrequency).reduce((sum, count) => sum + count, 0);
    const uniqueItemsClicked = Object.keys(linkFrequency).length;

    // Debug logging
    console.log('🔍 Dashboard Debug - Frequency Data:', {
        linkFrequency,
        totalClicks,
        uniqueItemsClicked,
        quickAccessLinks: quickAccessLinks.map(item => ({ name: item.name, frequency: item.frequency }))
    });

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 rounded-lg p-6 text-white transition-colors">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">Welcome Back!</h1>
                        <p className="text-indigo-100 dark:text-indigo-200">Employee: {userData?.firstName} | Role: {userData?.roleCode} </p>
                        <p className="text-indigo-100 dark:text-indigo-200 text-sm">
                            Access to {roleData?.menuItems?.length || 0} system modules
                            {totalClicks > 0 && (
                                <span className="ml-2 inline-flex items-center">
                                    • {totalClicks} clicks on {uniqueItemsClicked} items
                                </span>
                            )}
                        </p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-right text-indigo-100 dark:text-indigo-200">
                            <p className="text-sm">This Month Performance</p>
                            <p className="text-xl font-bold">
                                {dashboardData.sales.growth > 0 ? '📈' : '📉'} {Math.abs(dashboardData.sales.growth)}%
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Key Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Sales Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Sales This Month</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{dashboardData.sales.thisMonth.toLocaleString()}</p>
                            <div className="flex items-center mt-1">
                                <ArrowUpRight className="w-4 h-4 text-green-600 dark:text-green-500" />
                                <span className="text-sm text-green-600 dark:text-green-500 font-medium">+{dashboardData.sales.growth}%</span>
                            </div>
                        </div>
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-500" />
                        </div>
                    </div>
                </div>

                {/* Purchase Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Purchase This Month</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{dashboardData.purchase.thisMonth.toLocaleString()}</p>
                            <div className="flex items-center mt-1">
                                <ArrowDownRight className="w-4 h-4 text-red-600 dark:text-red-500" />
                                <span className="text-sm text-red-600 dark:text-red-500 font-medium">{dashboardData.purchase.growth}%</span>
                            </div>
                        </div>
                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                            <ShoppingCart className="w-6 h-6 text-indigo-600 dark:text-indigo-500" />
                        </div>
                    </div>
                </div>

                {/* Pending Transactions */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Approval</p>
                            <p className="text-2xl font-bold text-orange-600 dark:text-orange-500">{dashboardData.transactions.pending}</p>
                            <p className="text-sm text-orange-600 dark:text-orange-500">Requires attention</p>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                            <Clock className="w-6 h-6 text-orange-600 dark:text-orange-500" />
                        </div>
                    </div>
                </div>

                {/* Rejected Transactions */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Rejected Today</p>
                            <p className="text-2xl font-bold text-red-600 dark:text-red-500">{dashboardData.transactions.rejected}</p>
                            <p className="text-sm text-red-600 dark:text-red-500">Review required</p>
                        </div>
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts and Analytics Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales Graph */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sales Trend</h3>
                        <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center transition-colors">
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                        </button>
                    </div>
                    
                    <div className="h-48 bg-gradient-to-r from-green-50 to-indigo-50 dark:from-green-900/20 dark:to-indigo-900/20 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 relative transition-colors">
                        <div className="text-center">
                            <BarChart3 className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                            <p className="text-gray-500 dark:text-gray-400 font-medium">Sales Chart</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">₹{dashboardData.sales.thisMonth.toLocaleString()} this month</p>
                        </div>
                        <div className="absolute bottom-4 left-4 right-4 h-1 bg-gradient-to-r from-green-400 to-indigo-400 rounded"></div>
                    </div>
                </div>

                {/* Purchase Graph */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Purchase Analysis</h3>
                        <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center transition-colors">
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                        </button>
                    </div>
                    
                    <div className="h-48 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 relative transition-colors">
                        <div className="text-center">
                            <PieChart className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                            <p className="text-gray-500 dark:text-gray-400 font-medium">Purchase Distribution</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">₹{dashboardData.purchase.thisMonth.toLocaleString()} this month</p>
                        </div>
                        <div className="absolute top-4 right-4 space-y-1">
                            <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">Materials</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">Services</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Access and Tracking Row - ENHANCED WITH CENTRALIZED FREQUENCY TRACKING */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Frequent Access Links - UPDATED WITH CENTRALIZED TRACKING */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Frequent Access</h3>
                        <div className="flex items-center space-x-2">
                            <Zap className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                {totalClicks > 0 ? `${totalClicks} total clicks` : 'Click anywhere to start tracking'}
                            </span>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        {quickAccessLinks.map((link, index) => {
                            const IconComponent = link.icon;
                            const isFrequent = link.frequency > 0;
                            
                            return (
                                <button
                                    key={`${link.id}-${index}`}
                                    onClick={() => handleLinkClick(link.path, link)}
                                    className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group text-left relative"
                                    title={`${link.section} - ${link.name}${link.frequency > 0 ? ` (${link.frequency} clicks)` : ''}`}
                                >
                                    {/* Frequency badge */}
                                    {isFrequent && (
                                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                                            {link.frequency}
                                        </div>
                                    )}
                                    
                                    {/* Star indicator for most frequent */}
                                    {index === 0 && isFrequent && (
                                        <Star className="absolute top-1 left-1 w-3 h-3 text-yellow-500 fill-current" />
                                    )}
                                    
                                    <IconComponent className={`w-4 h-4 mr-3 flex-shrink-0 ${
                                        isFrequent 
                                            ? 'text-indigo-600 dark:text-indigo-400' 
                                            : 'text-gray-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                                    }`} />
                                    <div className="min-w-0 flex-1">
                                        <p className={`text-sm font-medium truncate ${
                                            isFrequent 
                                                ? 'text-indigo-900 dark:text-indigo-300' 
                                                : 'text-gray-900 dark:text-white'
                                        }`}>
                                            {link.name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            {link.section}
                                            {isFrequent && (
                                                <span className="ml-1 text-indigo-600 dark:text-indigo-400">
                                                    • {link.frequency} clicks
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Usage Statistics */}
                    {totalClicks > 0 ? (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                <span className="flex items-center space-x-1">
                                    <TrendingUpIcon className="w-3 h-3" />
                                    <span>Most used: {quickAccessLinks[0]?.name}</span>
                                </span>
                                <span>{uniqueItemsClicked} of {roleData?.menuItems?.length} used</span>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                <span className="flex items-center justify-center space-x-1">
                                    <Zap className="w-3 h-3" />
                                    <span>Start clicking menu items to see your most used features!</span>
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Transaction Tracking - UNCHANGED */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Transaction Tracking</h3>
                        <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center transition-colors">
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Track All
                        </button>
                    </div>
                    
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg transition-colors">
                            <div className="flex items-center">
                                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-500 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">Completed</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Successfully processed</p>
                                </div>
                            </div>
                            <span className="text-lg font-bold text-green-600 dark:text-green-500">{dashboardData.transactions.approved}</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg transition-colors">
                            <div className="flex items-center">
                                <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-500 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">In Transit</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Currently processing</p>
                                </div>
                            </div>
                            <span className="text-lg font-bold text-indigo-600 dark:text-indigo-500">{dashboardData.tracking.inTransit}</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 rounded-lg transition-colors">
                            <div className="flex items-center">
                                <Clock className="w-5 h-5 text-orange-600 dark:text-orange-500 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">Processing</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Under review</p>
                                </div>
                            </div>
                            <span className="text-lg font-bold text-orange-600 dark:text-orange-500">{dashboardData.tracking.processing}</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg transition-colors">
                            <div className="flex items-center">
                                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-500 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">Rejected</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Requires attention</p>
                                </div>
                            </div>
                            <span className="text-lg font-bold text-red-600 dark:text-red-500">{dashboardData.transactions.rejected}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity and Notifications */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity Table */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
                        <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors">View All</button>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        ID
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {[
                                    { id: 'TXN001', type: 'Sale', amount: '₹45,000', status: 'Completed' },
                                    { id: 'TXN002', type: 'Purchase', amount: '₹23,500', status: 'Pending' },
                                    { id: 'TXN003', type: 'Sale', amount: '₹67,800', status: 'Completed' },
                                    { id: 'TXN004', type: 'Purchase', amount: '₹12,300', status: 'Rejected' },
                                    { id: 'TXN005', type: 'Sale', amount: '₹89,200', status: 'Completed' }
                                ].map((transaction, index) => (
                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                                            {transaction.id}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                            {transaction.type}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                            {transaction.amount}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                transaction.status === 'Completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                                                transaction.status === 'Pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400' :
                                                'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                                            }`}>
                                                {transaction.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Notifications & Alerts */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Alerts</h3>
                        <Bell className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    </div>
                    
                    <div className="space-y-3">
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg transition-colors">
                            <div className="flex items-start">
                                <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-500 mt-0.5 mr-2" />
                                <div>
                                    <p className="text-sm font-medium text-red-900 dark:text-red-300">High Priority</p>
                                    <p className="text-xs text-red-700 dark:text-red-400">{dashboardData.transactions.rejected} transactions need review</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg transition-colors">
                            <div className="flex items-start">
                                <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-500 mt-0.5 mr-2" />
                                <div>
                                    <p className="text-sm font-medium text-yellow-900 dark:text-yellow-300">Pending Approval</p>
                                    <p className="text-xs text-yellow-700 dark:text-yellow-400">{dashboardData.transactions.pending} items awaiting approval</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg transition-colors">
                            <div className="flex items-start">
                                <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-500 mt-0.5 mr-2" />
                                <div>
                                    <p className="text-sm font-medium text-indigo-900 dark:text-indigo-300">Monthly Target</p>
                                    <p className="text-xs text-indigo-700 dark:text-indigo-400">85% achieved this month</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Usage Summary Alert */}
                        {totalClicks > 0 && (
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg transition-colors">
                                <div className="flex items-start">
                                    <Award className="w-4 h-4 text-green-600 dark:text-green-500 mt-0.5 mr-2" />
                                    <div>
                                        <p className="text-sm font-medium text-green-900 dark:text-green-300">Usage Summary</p>
                                        <p className="text-xs text-green-700 dark:text-green-400">
                                            {totalClicks} clicks on {uniqueItemsClicked} modules today
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardContent;