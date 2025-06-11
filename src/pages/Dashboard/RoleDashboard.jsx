import React from 'react';
import { useSelector } from 'react-redux';
import { 
    LogOut, 
    Shield, 
    Building2, 
    Clock, 
    Settings, 
    Users, 
    BarChart3,
    FileText,
    Database,
    Grid3X3
} from 'lucide-react';
import { useLogout } from '../../hooks/useLogout';

const RoleDashboard = () => {
    const { roleData, employeeId, roleId, lastActivity } = useSelector((state) => state.auth);
    const { logout } = useLogout();

    const handleLogout = () => {
        logout();
    };

    const formatLastActivity = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    };

    // Render menu items based on role data
    const renderMenuItems = () => {
        if (!roleData?.menuItems || !Array.isArray(roleData.menuItems)) {
            return (
                <div className="text-center py-8">
                    <Grid3X3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No menu items available for this role.</p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roleData.menuItems.map((item, index) => (
                    <div 
                        key={index}
                        className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                    >
                        <div className="flex items-center space-x-3 mb-3">
                            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <Settings className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900">{item.name || item.title}</h3>
                                <p className="text-sm text-gray-500">{item.description || 'Menu item'}</p>
                            </div>
                        </div>
                        {item.url && (
                            <p className="text-xs text-gray-400">URL: {item.url}</p>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900">Role Portal</h1>
                                <p className="text-xs text-gray-500">Role ID: {roleId}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Shield className="w-4 h-4" />
                                <span>User: {employeeId}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    
                    {/* Role Info Card */}
                    <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                                        <Shield className="w-6 h-6 text-indigo-600" />
                                    </div>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Role-based Access Portal
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {roleData?.roleName || `Role ${roleId}`}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <Users className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">Employee ID</dt>
                                            <dd className="text-lg font-medium text-gray-900">{employeeId}</dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <Shield className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">Role ID</dt>
                                            <dd className="text-lg font-medium text-gray-900">{roleId}</dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <Grid3X3 className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">Menu Items</dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {roleData?.menuItems?.length || 0}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <Clock className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">Last Activity</dt>
                                            <dd className="text-sm font-medium text-gray-900">
                                                {formatLastActivity(lastActivity)}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                        <div className="px-4 py-5 sm:px-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Available Menu Items
                            </h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                Role-based access to system features and modules.
                            </p>
                        </div>
                        <div className="border-t border-gray-200 p-6">
                            {renderMenuItems()}
                        </div>
                    </div>

                    {/* Role Details */}
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="px-4 py-5 sm:px-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Role Details
                            </h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                Detailed information about your role access.
                            </p>
                        </div>
                        <div className="border-t border-gray-200">
                            <dl>
                                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">
                                        Role Name
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        {roleData?.roleName || 'N/A'}
                                    </dd>
                                </div>
                                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">
                                        Role Description
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        {roleData?.roleDescription || 'N/A'}
                                    </dd>
                                </div>
                                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">
                                        Permissions
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        {roleData?.permissions ? roleData.permissions.join(', ') : 'N/A'}
                                    </dd>
                                </div>
                                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">
                                        Access Level
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        {roleData?.accessLevel || 'Standard'}
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                    {/* Debug Information (Remove in production) */}
                    {roleData && (
                        <div className="mt-6 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-indigo-900 mb-2">Debug - Role Data:</h4>
                            <pre className="text-xs text-indigo-800 overflow-auto max-h-40">
                                {JSON.stringify(roleData, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default RoleDashboard;