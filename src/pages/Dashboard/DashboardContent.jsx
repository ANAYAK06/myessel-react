// Enhanced Dashboard Content Component with Dark Mode Support
import React from 'react';
import { useSelector } from 'react-redux';
import { 
    TrendingUp, TrendingDown, ShoppingCart, Package, AlertTriangle, 
    CheckCircle, Clock, BarChart3, PieChart, Activity, Users, FileText,
    DollarSign, ArrowUpRight, ArrowDownRight, Eye, ExternalLink,
    Zap, Target, Award, Bell
} from 'lucide-react';

const DashboardContent = () => {
    const { roleData, employeeId, roleId, userData } = useSelector((state) => state.auth);

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

    // Get quick access links from menu items
    const getQuickAccessLinks = () => {
        if (!roleData?.menuItems) return [];
        
        // Get most frequently used items (you can track usage later)
        return roleData.menuItems.slice(0, 8).map(item => ({
            name: item.SUBLI || item.FirmFunctionalAreaName || 'Menu Item',
            section: item.LI,
            path: item.Path,
            icon: getIconForItem(item),
            type: item.Type
        }));
    };

    const getIconForItem = (item) => {
        const path = item.Path?.toLowerCase() || '';
        const name = (item.SUBLI || '').toLowerCase();
        
        if (path.includes('report') || name.includes('report')) return BarChart3;
        if (path.includes('employee') || name.includes('employee')) return Users;
        if (path.includes('purchase') || name.includes('purchase')) return ShoppingCart;
        if (path.includes('sale') || name.includes('sale')) return TrendingUp;
        if (path.includes('balance') || name.includes('balance')) return DollarSign;
        if (path.includes('ledger') || name.includes('ledger')) return FileText;
        return Package;
    };

    const quickAccessLinks = getQuickAccessLinks();

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 rounded-lg p-6 text-white transition-colors">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">Welcome Back!</h1>
                        <p className="text-indigo-100 dark:text-indigo-200">Employee: {userData?.firstName} | Role: {userData?.roleCode} </p>
                        <p className="text-indigo-100 dark:text-indigo-200 text-sm">Access to {roleData?.menuItems?.length || 0} system modules</p>
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
                    
                    {/* Mock Chart Area */}
                    <div className="h-48 bg-gradient-to-r from-green-50 to-indigo-50 dark:from-green-900/20 dark:to-indigo-900/20 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 relative transition-colors">
                        <div className="text-center">
                            <BarChart3 className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                            <p className="text-gray-500 dark:text-gray-400 font-medium">Sales Chart</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">₹{dashboardData.sales.thisMonth.toLocaleString()} this month</p>
                        </div>
                        {/* Mock trend line */}
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
                    
                    {/* Mock Chart Area */}
                    <div className="h-48 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 relative transition-colors">
                        <div className="text-center">
                            <PieChart className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                            <p className="text-gray-500 dark:text-gray-400 font-medium">Purchase Distribution</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">₹{dashboardData.purchase.thisMonth.toLocaleString()} this month</p>
                        </div>
                        {/* Mock pie segments */}
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

            {/* Quick Access and Tracking Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quick Access Links */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Access</h3>
                        <div className="flex items-center space-x-1">
                            <Zap className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm text-gray-500 dark:text-gray-400">Frequent Actions</span>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        {quickAccessLinks.map((link, index) => {
                            const IconComponent = link.icon;
                            return (
                                <button
                                    key={index}
                                    className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors group text-left"
                                    title={`${link.section} - ${link.name}`}
                                >
                                    <IconComponent className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 mr-3 flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{link.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{link.section}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Transaction Tracking */}
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardContent;