// Enhanced Dashboard Content Component with Centralized Frequency Tracking
import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

import { useSelector, useDispatch } from 'react-redux';
import {
    TrendingUp, TrendingDown, ShoppingCart, Package, AlertTriangle,
    CheckCircle, Clock, BarChart3, PieChart, Activity, Users, FileText,
    DollarSign, ArrowUpRight, ArrowDownRight, Eye, ExternalLink,
    Zap, Target, Award, Bell, Star, TrendingUpIcon, Calculator, CreditCard,
    X, ChevronRight, Loader2, ListChecks, LayoutList, IndentIcon,
} from 'lucide-react';
import {
    fetchTodayTransactionLog,
    selectTodayTransactionLog,
    selectTodayTransactionLogLoading,
    fetchmonthlyTransactionLog,
    fetchMonthlyClientInvoiceLog,
    fetchMonthlyVendorInvoiceLog,
    fetchPreviousMonthVendorInvoiceLog,
    fetchPreviousMonthClientInvoiceLog,
    selectMonthlyVendorInvoiceLog,
    selectMonthlyClientInvoiceLog,
    selectPreviousMonthVendorInvoiceLog,
    selectPreviousMonthClientInvoiceLog

} from '../../slices/financialReportSlice/transactionLogSlice';
import {
    fetchTrackingValues,
    fetchTrackingNos,
    fetchTrackingData,
    setSelectedMoid,
    setSelectedRole,
    clearTrackingDetail,
    selectTrackingValues,
    selectTrackingNos,
    selectTrackingData,
    selectSelectedMoid,
    selectSelectedRoleId,
    selectSelectedRoleName,
    selectTrackingValuesLoading,
    selectTrackingNosLoading,
    selectTrackingDataLoading,
} from '../../slices/dashboardSlice/pendingTrackingSlice';
import DonutChart from './DonutChart';

const DashboardContent = ({ onNavigate, linkFrequency = {}, trackMenuUsage }) => {
    const { roleData, userData } = useSelector((state) => state.auth);

    const dispatch = useDispatch();

    const todayTransactions = useSelector(selectTodayTransactionLog);
    const todayTransactionsLoading = useSelector(selectTodayTransactionLogLoading);
    const monthlyVendorData = useSelector(selectMonthlyVendorInvoiceLog);
    const monthlyClientData = useSelector(selectMonthlyClientInvoiceLog);
    const previousMonthVendorData = useSelector(selectPreviousMonthVendorInvoiceLog);
    const previousMonthClientData = useSelector(selectPreviousMonthClientInvoiceLog);

    // Rejected transactions
    const [rejectedData,    setRejectedData]    = useState([]);
    const [rejectedLoading, setRejectedLoading] = useState(false);
    const [showRejectedModal, setShowRejectedModal] = useState(false);

    // Pending tracking
    const [showPendingModal, setShowPendingModal] = useState(false);
    const trackingValues      = useSelector(selectTrackingValues);
    const trackingNos         = useSelector(selectTrackingNos);
    const trackingData        = useSelector(selectTrackingData);
    const selectedMoid        = useSelector(selectSelectedMoid);
    const selectedRoleId      = useSelector(selectSelectedRoleId);
    const selectedRoleName    = useSelector(selectSelectedRoleName);
    const trackingValuesLoading = useSelector(selectTrackingValuesLoading);
    const trackingNosLoading    = useSelector(selectTrackingNosLoading);
    const trackingDataLoading   = useSelector(selectTrackingDataLoading);

    const userId  = userData?.userId  || userData?.UID  || userData?.employeeId || '';
    const roleId  = userData?.roleId  || userData?.RID  || 0;
    const groupId = userData?.groupId || userData?.GroupId || 0;
    const ccCodes = userData?.ccCodes || '';

    useEffect(() => {
        dispatch(fetchTodayTransactionLog());
        dispatch(fetchMonthlyVendorInvoiceLog());
        dispatch(fetchMonthlyClientInvoiceLog());
        dispatch(fetchPreviousMonthVendorInvoiceLog());
        dispatch(fetchPreviousMonthClientInvoiceLog());
    }, [dispatch]);

    useEffect(() => {
        if (roleId) dispatch(fetchTrackingValues(roleId));
    }, [dispatch, roleId]);

    useEffect(() => {
        if (!userId || !roleId) return;
        setRejectedLoading(true);
        axios.get(`${API_BASE_URL}/Accounts/GetRejectedData`, { params: { UserId: userId, RoleId: roleId } })
            .then(res => setRejectedData(res.data?.Data || []))
            .catch(() => setRejectedData([]))
            .finally(() => setRejectedLoading(false));
    }, [userId, roleId]);

    // Step 1 — pick transaction type: fetch approval chain only
    const handleSelectTrackingType = (moid) => {
        dispatch(setSelectedMoid(moid));
        dispatch(fetchTrackingNos({ roleId, moid, ccCodes, userId }));
    };

    // Step 2 — pick a role in the approval chain: fetch that role's pending data
    const handleSelectApprovalRole = (nos) => {
        if (nos.No === 0) return; // no pending items for this role
        dispatch(setSelectedRole({ roleId: nos.UserRoleID, roleName: nos.UserRoleCode }));
        dispatch(fetchTrackingData({ roleId: nos.UserRoleID, moid: selectedMoid, ccCodes, groupId }));
    };

    const handleClosePendingModal = () => {
        setShowPendingModal(false);
        dispatch(clearTrackingDetail());
    };

    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'decimal',
            minimumFractionDigits: 2
        }).format(amount);
    }



    // Calculate totals from transaction data
    const calculateTransactionTotals = (data) => {
        if (!data?.Data || !Array.isArray(data.Data)) return 0;

        return data.Data.reduce((total, transaction) => {
            const debit = parseFloat(transaction.DebitValue || transaction.Debit || 0);
            const credit = parseFloat(transaction.CreditValue || transaction.Credit || 0);
            return total + debit + credit; // or adjust logic based on your needs
        }, 0);
    };

    // Calculate current month totals
    const currentMonthSales = calculateTransactionTotals(monthlyClientData);
    const currentMonthPurchase = calculateTransactionTotals(monthlyVendorData);

    // Calculate previous month totals
    const previousMonthSales = calculateTransactionTotals(previousMonthClientData);
    const previousMonthPurchase = calculateTransactionTotals(previousMonthVendorData);

    // Calculate growth percentages
    const salesGrowth = previousMonthSales > 0
        ? ((currentMonthSales - previousMonthSales) / previousMonthSales * 100).toFixed(1)
        : 0;

    const purchaseGrowth = previousMonthPurchase > 0
        ? ((currentMonthPurchase - previousMonthPurchase) / previousMonthPurchase * 100).toFixed(1)
        : 0;
    const recentTransactions = Array.isArray(todayTransactions?.Data) ? todayTransactions.Data.slice(0, 5) :
        Array.isArray(todayTransactions) ? todayTransactions.slice(0, 5) : [];

    // Mock dashboard data - replace with actual API calls
    const dashboardData = {
        sales: {
            today: 0,
            thisMonth: currentMonthSales,
            growth: parseFloat(salesGrowth),
            trend: salesGrowth >= 0 ? 'up' : 'down'
        },
        purchase: {
            today: 0,
            thisMonth: currentMonthPurchase,
            growth: parseFloat(purchaseGrowth),
            trend: purchaseGrowth >= 0 ? 'up' : 'down'
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

            return allItems.slice(0, 8);
        }

        // Sort by frequency (descending) and take top 8
        const frequentItems = allItems
            .filter(item => item.frequency > 0)
            .sort((a, b) => b.frequency - a.frequency)
            .slice(0, 8);



        // If we have less than 8 frequent items, fill remaining with unclicked items
        if (frequentItems.length < 8) {
            const unclickedItems = allItems
                .filter(item => item.frequency === 0)
                .slice(0, 8 - frequentItems.length);


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



    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-[#0d1b5e] to-[#0a1240] dark:from-[#0a1240] dark:to-gray-900 rounded-lg p-6 text-white transition-colors">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">Welcome Back!</h1>
                        <p className="text-orange-200 dark:text-orange-300">Employee: {userData?.firstName} | Role: {userData?.roleCode} </p>
                        <p className="text-orange-200 dark:text-orange-300 text-sm">
                            Access to {roleData?.menuItems?.length || 0} system modules
                            {totalClicks > 0 && (
                                <span className="ml-2 inline-flex items-center">
                                    • {totalClicks} clicks on {uniqueItemsClicked} items
                                </span>
                            )}
                        </p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-right text-orange-200 dark:text-orange-300">
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
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{formatCurrency(dashboardData.sales.thisMonth)}</p>
                            <div className="flex items-center mt-1">
                                {/* Conditional Arrow and Color based on growth */}
                                {dashboardData.sales.growth >= 0 ? (
                                    <>
                                        <ArrowUpRight className="w-4 h-4 text-green-600 dark:text-green-500" />
                                        <span className="text-sm text-green-600 dark:text-green-500 font-medium">
                                            +{dashboardData.sales.growth}%
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <ArrowDownRight className="w-4 h-4 text-red-600 dark:text-red-500" />
                                        <span className="text-sm text-red-600 dark:text-red-500 font-medium">
                                            {dashboardData.sales.growth}%
                                        </span>
                                    </>
                                )}
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
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{formatCurrency(dashboardData.purchase.thisMonth)}</p>
                            <div className="flex items-center mt-1">
                                {/* Conditional Arrow and Color based on growth */}
                                {dashboardData.purchase.growth >= 0 ? (
                                    <>
                                        <ArrowUpRight className="w-4 h-4 text-red-600 dark:text-red-500" />
                                        <span className="text-sm text-red-600 dark:text-red-500 font-medium">
                                            +{dashboardData.purchase.growth}%
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <ArrowDownRight className="w-4 h-4 text-green-600 dark:text-green-500" />
                                        <span className="text-sm text-green-600 dark:text-green-500 font-medium">
                                            {dashboardData.purchase.growth}%
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="w-12 h-12 bg-[#0d1b5e]/10 dark:bg-[#0d1b5e]/30 rounded-lg flex items-center justify-center">
                            <ShoppingCart className="w-6 h-6 text-[#0d1b5e] dark:text-blue-300" />
                        </div>
                    </div>
                </div>
                                
                {/* <div className="fixed top-4 right-4 z-50 max-w-sm">
                    <div className="bg-black/80 backdrop-blur-sm border border-yellow-400/50 p-4 rounded-lg shadow-2xl">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-yellow-400 text-sm">🐛 Debug Info</h4>
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        </div>
                        <div className="text-xs text-yellow-100 space-y-1 font-mono">
                            <p><span className="text-yellow-400">Client Records:</span> {monthlyClientData?.Data?.length || 0}</p>
                            <p><span className="text-yellow-400">Vendor Records:</span> {monthlyVendorData?.Data?.length || 0}</p>
                            <div className="border-t border-yellow-400/30 pt-2 mt-2">
                                <p><span className="text-green-400">Current Sales:</span> ₹{currentMonthSales.toLocaleString()}</p>
                                <p><span className="text-blue-400">Current Purchase:</span> ₹{currentMonthPurchase.toLocaleString()}</p>
                            </div>
                            <div className="border-t border-yellow-400/30 pt-2 mt-2">
                                <p><span className="text-green-300">Previous Sales:</span> ₹{previousMonthSales.toLocaleString()}</p>
                                <p><span className="text-blue-300">Previous Purchase:</span> ₹{previousMonthPurchase.toLocaleString()}</p>
                            </div>
                            <div className="border-t border-yellow-400/30 pt-2 mt-2">
                                <p><span className="text-purple-400">Sales Growth:</span>
                                    <span className={salesGrowth >= 0 ? "text-green-400" : "text-red-400"}>
                                        {salesGrowth}%
                                    </span>
                                </p>
                                <p><span className="text-purple-400">Purchase Growth:</span>
                                    <span className={purchaseGrowth >= 0 ? "text-green-400" : "text-red-400"}>
                                        {purchaseGrowth}%
                                    </span>
                                </p>
                            </div>
                            <div className="border-t border-yellow-400/30 pt-2 mt-2">
                                <p className="text-gray-300">Today: {new Date().toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                </div> */}


                {/* Pending Transactions */}
                <button
                    onClick={() => trackingValues.length > 0 && setShowPendingModal(true)}
                    className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-lg hover:border-orange-300 dark:hover:border-orange-700 transition-all text-left w-full group"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Approval</p>
                            <p className="text-2xl font-bold text-orange-600 dark:text-orange-500">
                                {trackingValuesLoading ? '—' : trackingValues.length}
                            </p>
                            <p className="text-sm text-orange-500 dark:text-orange-400 flex items-center gap-1 mt-0.5">
                                {trackingValues.length > 0 ? (
                                    <><ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" /> Click to view details</>
                                ) : trackingValuesLoading ? 'Loading…' : 'No pending transactions'}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                            <Clock className="w-6 h-6 text-orange-600 dark:text-orange-500" />
                        </div>
                    </div>
                </button>

                {/* Rejected Transactions */}
                <button
                    onClick={() => rejectedData.length > 0 && setShowRejectedModal(true)}
                    className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-lg hover:border-red-300 dark:hover:border-red-700 transition-all text-left w-full group"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Rejected Transactions</p>
                            <p className="text-2xl font-bold text-red-600 dark:text-red-500">
                                {rejectedLoading ? '—' : rejectedData.length}
                            </p>
                            <p className="text-sm text-red-500 dark:text-red-400 flex items-center gap-1 mt-0.5">
                                {rejectedData.length > 0 ? (
                                    <><ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" /> Click to view details</>
                                ) : 'No rejected transactions'}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-500" />
                        </div>
                    </div>
                </button>
            </div>

            {/* Charts and Analytics Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales Graph */}
               <DonutChart 
                current={currentMonthSales}
                previous={previousMonthSales}
                type="sales"
                title="Sales"   
                />

                {/* Purchase Graph */}
                <DonutChart
                    current={currentMonthPurchase}
                    previous={previousMonthPurchase}
                    type="purchase"
                    title="Purchase"
                />
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
                                    className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-orange-300 dark:hover:border-orange-600 hover:bg-orange-50 dark:hover:bg-[#0d1b5e]/10 transition-all group text-left relative"
                                    title={`${link.section} - ${link.name}${link.frequency > 0 ? ` (${link.frequency} clicks)` : ''}`}
                                >
                                    {/* Frequency badge */}
                                    {isFrequent && (
                                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#0d1b5e] text-white text-xs rounded-full flex items-center justify-center font-bold">
                                            {link.frequency}
                                        </div>
                                    )}

                                    {/* Star indicator for most frequent */}
                                    {index === 0 && isFrequent && (
                                        <Star className="absolute top-1 left-1 w-3 h-3 text-yellow-500 fill-current" />
                                    )}

                                    <IconComponent className={`w-4 h-4 mr-3 flex-shrink-0 ${isFrequent
                                        ? 'text-[#0d1b5e] dark:text-orange-400'
                                        : 'text-gray-400 dark:text-gray-500 group-hover:text-[#0d1b5e] dark:group-hover:text-orange-400'
                                        }`} />
                                    <div className="min-w-0 flex-1">
                                        <p className={`text-sm font-medium truncate ${isFrequent
                                            ? 'text-[#0d1b5e] dark:text-white'
                                            : 'text-gray-900 dark:text-white'
                                            }`}>
                                            {link.name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            {link.section}
                                            {isFrequent && (
                                                <span className="ml-1 text-orange-600 dark:text-orange-400">
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
                        <button className="text-sm text-[#0d1b5e] dark:text-orange-400 hover:text-[#0a1240] dark:hover:text-orange-300 flex items-center transition-colors">
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

                        <div className="flex items-center justify-between p-3 bg-[#0d1b5e]/5 dark:bg-[#0d1b5e]/20 border border-[#0d1b5e]/15 dark:border-[#0d1b5e]/30 rounded-lg transition-colors">
                            <div className="flex items-center">
                                <Activity className="w-5 h-5 text-[#0d1b5e] dark:text-blue-300 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">In Transit</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Currently processing</p>
                                </div>
                            </div>
                            <span className="text-lg font-bold text-[#0d1b5e] dark:text-blue-300">{dashboardData.tracking.inTransit}</span>
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
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Today's Recent Activity</h3>
                        <button className="text-sm text-[#0d1b5e] dark:text-orange-400 hover:text-[#0a1240] dark:hover:text-orange-300 transition-colors">View All</button>
                    </div>

                    {todayTransactionsLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0d1b5e] dark:border-orange-400"></div>
                            <span className="ml-2 text-gray-500 dark:text-gray-400">Loading today's transactions...</span>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Entry Date
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Account Name
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Voucher Type
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Debit
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Credit
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {recentTransactions.length > 0 ? recentTransactions.map((transaction, index) => (
                                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                                {transaction.EntryDate || transaction.Date || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                                <div className="max-w-xs truncate" title={transaction.NameofAccount || transaction.AccountName || transaction.Description || transaction.Name}>
                                                    {transaction.NameofAccount || transaction.AccountName || transaction.Description || transaction.Name || '-'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                                <span className="px-2 py-1 text-xs font-medium bg-[#0d1b5e]/10 dark:bg-[#0d1b5e]/30 text-[#0d1b5e] dark:text-white rounded-full">
                                                    {transaction.VoucherType || transaction.TranType || transaction.TransactionType || '-'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right font-medium">
                                                <span className="text-red-600 dark:text-red-400">
                                                    ₹{formatCurrency(transaction.DebitValue || transaction.Debit || 0)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right font-medium">
                                                <span className="text-green-600 dark:text-green-400">
                                                    ₹{formatCurrency(transaction.CreditValue || transaction.Credit || 0)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${(transaction.Status || 'Approved').toLowerCase() === 'approved'
                                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                                                    : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                                                    }`}>
                                                    {transaction.Status || 'Approved'}
                                                </span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="6" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                                No transactions found for today
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
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

                        <div className="p-3 bg-[#0d1b5e]/5 dark:bg-[#0d1b5e]/20 border border-[#0d1b5e]/20 dark:border-[#0d1b5e]/40 rounded-lg transition-colors">
                            <div className="flex items-start">
                                <Target className="w-4 h-4 text-[#0d1b5e] dark:text-blue-300 mt-0.5 mr-2" />
                                <div>
                                    <p className="text-sm font-medium text-[#0d1b5e] dark:text-white">Monthly Target</p>
                                    <p className="text-xs text-[#0d1b5e]/70 dark:text-white/60">85% achieved this month</p>
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

            {/* Pending Transactions Modal */}
            {showPendingModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClosePendingModal} />
                    <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-6xl max-h-[90vh] flex flex-col">

                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-orange-50 dark:bg-orange-900/20 rounded-t-2xl flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-gray-800 dark:text-gray-100">Pending Transactions</h2>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{trackingValues.length} transaction type{trackingValues.length !== 1 ? 's' : ''} pending approval</p>
                                </div>
                            </div>
                            <button onClick={handleClosePendingModal}
                                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body — 2 columns */}
                        <div className="flex flex-1 min-h-0 overflow-hidden">

                            {/* Left: Transaction type list */}
                            <div className="w-64 flex-shrink-0 border-r border-gray-100 dark:border-gray-700 flex flex-col">
                                <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900/40 border-b border-gray-100 dark:border-gray-700">
                                    <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <LayoutList className="w-3.5 h-3.5" /> Transaction Types
                                    </p>
                                </div>
                                <div className="overflow-y-auto flex-1 py-1">
                                    {trackingValues.map((item) => {
                                        const label = (item.Value || '').trim();
                                        const active = selectedMoid === item.MOID;
                                        return (
                                            <button
                                                key={item.MOID}
                                                onClick={() => handleSelectTrackingType(item.MOID)}
                                                className={`w-full flex items-center gap-2 px-4 py-2.5 text-left text-xs transition-colors
                                                    ${active
                                                        ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 font-semibold border-r-2 border-orange-500'
                                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/40'}`}
                                            >
                                                <ListChecks className={`w-3.5 h-3.5 flex-shrink-0 ${active ? 'text-orange-500' : 'text-gray-400'}`} />
                                                <span className="leading-tight">{label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Right: Details panel */}
                            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                                {/* Step prompt: nothing selected yet */}
                                {!selectedMoid ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 gap-3">
                                        <Clock className="w-12 h-12 opacity-20" />
                                        <p className="text-sm font-medium">Step 1 — Select a transaction type on the left</p>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col overflow-hidden">

                                        {/* Approval Flow — Step 2 */}
                                        <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/30 flex-shrink-0">
                                            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5">
                                                Step 2 — Click a role with pending items to view transactions
                                            </p>
                                            {trackingNosLoading ? (
                                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading approval chain…
                                                </div>
                                            ) : (
                                                <div className="flex flex-wrap gap-2">
                                                    {trackingNos.map((nos, idx) => {
                                                        const hasPending = nos.No > 0;
                                                        const isSelected = selectedRoleId === nos.UserRoleID;
                                                        return (
                                                            <div key={nos.UserRoleID} className="flex items-center gap-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleSelectApprovalRole(nos)}
                                                                    disabled={!hasPending}
                                                                    title={hasPending ? `Click to view ${nos.No} pending items for ${nos.UserRoleCode}` : `No pending items for ${nos.UserRoleCode}`}
                                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                                                                        ${isSelected
                                                                            ? 'bg-orange-500 text-white border-orange-500 shadow-md scale-105'
                                                                            : hasPending
                                                                                ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700 shadow-sm hover:bg-orange-200 dark:hover:bg-orange-900/50 cursor-pointer'
                                                                                : 'bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-60'}`}
                                                                >
                                                                    <span>{nos.UserRoleCode}</span>
                                                                    {hasPending && (
                                                                        <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${isSelected ? 'bg-white text-orange-600' : 'bg-orange-500 text-white'}`}>
                                                                            {nos.No}
                                                                        </span>
                                                                    )}
                                                                </button>
                                                                {idx < trackingNos.length - 1 && (
                                                                    <ChevronRight className="w-3 h-3 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Transaction Table — Step 3 */}
                                        <div className="flex-1 overflow-auto">
                                            {!selectedRoleId ? (
                                                <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 gap-2 py-12">
                                                    <ChevronRight className="w-8 h-8 opacity-20" />
                                                    <p className="text-sm">Step 3 — Click an orange role pill above to see its pending transactions</p>
                                                </div>
                                            ) : trackingDataLoading ? (
                                                <div className="flex items-center justify-center h-32 gap-2 text-gray-400">
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    <span className="text-sm">Loading transactions for <strong>{selectedRoleName}</strong>…</span>
                                                </div>
                                            ) : trackingData.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center h-32 text-gray-400 dark:text-gray-500 gap-2">
                                                    <CheckCircle className="w-8 h-8 opacity-30" />
                                                    <p className="text-sm">No pending transactions found for <strong>{selectedRoleName}</strong></p>
                                                </div>
                                            ) : (
                                                <>
                                                    {/* Sub-header showing which role's data is shown */}
                                                    <div className="px-4 py-2 bg-orange-50 dark:bg-orange-900/10 border-b border-orange-100 dark:border-orange-900/30 flex items-center gap-2">
                                                        <span className="text-xs font-bold text-orange-700 dark:text-orange-300">
                                                            Pending at: {selectedRoleName}
                                                        </span>
                                                        <span className="text-[10px] text-orange-500 bg-orange-100 dark:bg-orange-900/30 px-1.5 py-0.5 rounded-full font-semibold">
                                                            {trackingData.length} record{trackingData.length !== 1 ? 's' : ''}
                                                        </span>
                                                    </div>
                                                    <table className="w-full text-sm">
                                                        <thead className="sticky top-0 bg-gray-50 dark:bg-gray-900/70 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                            <tr>
                                                                <th className="px-4 py-3 text-left">#</th>
                                                                <th className="px-4 py-3 text-left">Date</th>
                                                                <th className="px-4 py-3 text-left">CC Code</th>
                                                                <th className="px-4 py-3 text-left">Transaction No</th>
                                                                <th className="px-4 py-3 text-left">Name</th>
                                                                <th className="px-4 py-3 text-right">Amount (₹)</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                            {trackingData.map((row, idx) => (
                                                                <tr key={idx} className={`transition-colors hover:bg-orange-50/40 dark:hover:bg-orange-900/10 ${idx % 2 === 0 ? '' : 'bg-gray-50/50 dark:bg-gray-800/50'}`}>
                                                                    <td className="px-4 py-2.5 text-gray-400 text-xs">{idx + 1}</td>
                                                                    <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400 text-xs whitespace-nowrap">{row.Date || '—'}</td>
                                                                    <td className="px-4 py-2.5">
                                                                        <span className="text-xs font-mono font-bold text-[#0d1b5e] dark:text-blue-300 bg-[#0d1b5e]/8 dark:bg-[#0d1b5e]/30 px-2 py-0.5 rounded">
                                                                            {row.CCCode || '—'}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-4 py-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300">{row.TransactionNo || '—'}</td>
                                                                    <td className="px-4 py-2.5 text-xs text-gray-600 dark:text-gray-400 max-w-[160px]">
                                                                        <span className="truncate block" title={row.Name}>{row.Name || '—'}</span>
                                                                    </td>
                                                                    <td className="px-4 py-2.5 text-right font-bold text-gray-800 dark:text-gray-200 text-xs whitespace-nowrap">
                                                                        {formatCurrency(row.Amount)}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                        <tfoot className="bg-gray-50 dark:bg-gray-900/50 text-xs font-bold">
                                                            <tr>
                                                                <td colSpan={5} className="px-4 py-2.5 text-right text-gray-600 dark:text-gray-400">Total</td>
                                                                <td className="px-4 py-2.5 text-right text-orange-600 dark:text-orange-400">
                                                                    {formatCurrency(trackingData.reduce((s, r) => s + (r.Amount || 0), 0))}
                                                                </td>
                                                            </tr>
                                                        </tfoot>
                                                    </table>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between rounded-b-2xl bg-gray-50/60 dark:bg-gray-900/40 flex-shrink-0">
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                                {selectedRoleName && trackingData.length > 0
                                    ? `${trackingData.length} record${trackingData.length !== 1 ? 's' : ''} pending at ${selectedRoleName}`
                                    : ''}
                            </p>
                            <button onClick={handleClosePendingModal}
                                className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rejected Transactions Modal */}
            {showRejectedModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowRejectedModal(false)} />

                    {/* Modal */}
                    <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-4xl max-h-[85vh] flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-red-50 dark:bg-red-900/20 rounded-t-2xl">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-gray-800 dark:text-gray-100">Rejected Transactions</h2>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{rejectedData.length} record{rejectedData.length !== 1 ? 's' : ''} found</p>
                                </div>
                            </div>
                            <button onClick={() => setShowRejectedModal(false)}
                                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Table */}
                        <div className="overflow-auto flex-1">
                            <table className="w-full text-sm">
                                <thead className="sticky top-0 bg-gray-50 dark:bg-gray-900/60 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-4 py-3 text-left">#</th>
                                        <th className="px-4 py-3 text-left">Ref No</th>
                                        <th className="px-4 py-3 text-left">Module</th>
                                        <th className="px-4 py-3 text-left">CC</th>
                                        <th className="px-4 py-3 text-left">Rejected By</th>
                                        <th className="px-4 py-3 text-left">Date</th>
                                        <th className="px-4 py-3 text-left">Remarks</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {rejectedData.map((row, idx) => {
                                        const [, moduleName] = (row.MCode || '').split(',');
                                        const [, ccName]     = (row.CCName || '').split(',');
                                        return (
                                            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                                <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                                                <td className="px-4 py-3">
                                                    <span className="text-xs font-mono font-bold text-[#0d1b5e] dark:text-orange-300 bg-[#0d1b5e]/8 dark:bg-[#0d1b5e]/30 px-2 py-0.5 rounded">
                                                        {row.Refno || '—'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-gray-700 dark:text-gray-300 max-w-[160px]">
                                                    <span className="text-xs">{(moduleName || row.MCode || '—').trim()}</span>
                                                </td>
                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs whitespace-nowrap">
                                                    {(ccName || row.CCName || '—').trim()}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                                                        {(row.RejectedBy || '—').trim()}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">
                                                    {row.Rejectedate || '—'}
                                                </td>
                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-300 text-xs max-w-[200px]">
                                                    <span title={row.Remarks} className="line-clamp-2 block">
                                                        {row.Remarks || '—'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-700 flex justify-end rounded-b-2xl bg-gray-50/60 dark:bg-gray-900/40">
                            <button onClick={() => setShowRejectedModal(false)}
                                className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardContent;