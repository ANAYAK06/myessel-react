// components/Inbox/InboxItemPlaceholder.js
import React from 'react';
import { 
    ArrowLeft, Bell, FileText, AlertCircle, Clock, Code, 
    Building2, User, Calendar, MapPin, Settings
} from 'lucide-react';

const InboxItemPlaceholder = ({ notificationData, onNavigate }) => {
    const handleBackToInbox = () => {
        if (onNavigate) {
            onNavigate('dashboard', { name: 'Dashboard', type: 'dashboard' });
        }
    };

    // Handle case where no notification data is provided
    if (!notificationData) {
        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={handleBackToInbox}
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                title="Back to Dashboard"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Invalid Notification
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    No notification data provided
                                </p>
                            </div>
                        </div>
                        <div className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs rounded-full transition-colors">
                            Error
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 border border-gray-200 dark:border-gray-700 text-center transition-colors">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No Notification Data
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                        The notification data is missing or invalid. Please try clicking the notification again.
                    </p>
                </div>
            </div>
        );
    }

    // Extract notification data
    const {
        InboxTitle,
        ModuleDisplayName,
        ModuleCategory,
        NavigationPath,
        TotalPendingCount,
        Status,
        Priority,
        CCCodes,
        MasterId,
        RoleId,
        CreatedDate,
        WorkflowType
    } = notificationData;

    // Get status info
    const getStatusInfo = (status) => {
        switch (status) {
            case 1:
                return { color: 'red', label: 'Urgent', icon: AlertCircle };
            case 2:
                return { color: 'orange', label: 'Active', icon: Clock };
            default:
                return { color: 'indigo', label: 'Pending', icon: Clock };
        }
    };

    const statusInfo = getStatusInfo(Status);
    const StatusIcon = statusInfo.icon;

    // Generate component name suggestion
    const generateComponentName = (moduleCategory, moduleDisplayName, inboxTitle) => {
        const title = inboxTitle || moduleDisplayName || 'Unknown';
        // Convert to PascalCase and remove special characters
        const componentName = title
            .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join('');
        
        return componentName || 'UnknownVerification';
    };

    const suggestedComponentName = generateComponentName(ModuleCategory, ModuleDisplayName, InboxTitle);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={handleBackToInbox}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Back to Dashboard"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {InboxTitle || ModuleDisplayName || 'Verification Required'}
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {ModuleCategory} • Verification Component Not Implemented
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className={`px-3 py-1 bg-${statusInfo.color}-100 dark:bg-${statusInfo.color}-900 text-${statusInfo.color}-800 dark:text-${statusInfo.color}-200 text-xs rounded-full transition-colors flex items-center space-x-1`}>
                            <StatusIcon className="w-3 h-3" />
                            <span>{statusInfo.label}</span>
                        </div>
                        <div className="px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-xs rounded-full transition-colors">
                            Not Implemented
                        </div>
                    </div>
                </div>

                {/* Breadcrumb */}
                <nav className="text-sm text-gray-500 dark:text-gray-400">
                    <span>Dashboard</span>
                    <span className="mx-2">›</span>
                    <span>Inbox</span>
                    <span className="mx-2">›</span>
                    <span>{ModuleCategory}</span>
                    <span className="mx-2">›</span>
                    <span className="text-gray-900 dark:text-white">{ModuleDisplayName}</span>
                </nav>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Notification Details */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                            <Bell className="w-5 h-5 text-indigo-600" />
                            <span>Notification Details</span>
                        </h2>
                    </div>

                    <div className="p-4 space-y-4">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 gap-3">
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Title:</span>
                                <span className="text-sm text-gray-900 dark:text-white">{InboxTitle}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Module:</span>
                                <span className="text-sm text-gray-900 dark:text-white">{ModuleDisplayName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Category:</span>
                                <span className="text-sm text-gray-900 dark:text-white">{ModuleCategory}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Count:</span>
                                <span className="text-sm font-semibold text-red-600 dark:text-red-400">{TotalPendingCount}</span>
                            </div>
                            {NavigationPath && (
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Path:</span>
                                    <span className="text-xs font-mono text-gray-600 dark:text-gray-300 break-all">{NavigationPath}</span>
                                </div>
                            )}
                            {MasterId && (
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Master ID:</span>
                                    <span className="text-xs font-mono text-gray-600 dark:text-gray-300">{MasterId}</span>
                                </div>
                            )}
                            {RoleId && (
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Role ID:</span>
                                    <span className="text-xs font-mono text-gray-600 dark:text-gray-300">{RoleId}</span>
                                </div>
                            )}
                            {WorkflowType && (
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Workflow:</span>
                                    <span className="text-xs font-mono text-gray-600 dark:text-gray-300">{WorkflowType}</span>
                                </div>
                            )}
                            {CCCodes && CCCodes.length > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">CC Codes:</span>
                                    <span className="text-xs font-mono text-gray-600 dark:text-gray-300">
                                        {CCCodes.join(', ')}
                                    </span>
                                </div>
                            )}
                            {CreatedDate && (
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Created:</span>
                                    <span className="text-xs text-gray-600 dark:text-gray-300">
                                        {new Date(CreatedDate).toLocaleString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Implementation Guide */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                            <Code className="w-5 h-5 text-green-600" />
                            <span>Implementation Guide</span>
                        </h2>
                    </div>

                    <div className="p-4 space-y-4">
                        {/* Suggested Component Name */}
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 transition-colors">
                            <h3 className="font-medium text-green-900 dark:text-green-300 mb-2">Suggested Component</h3>
                            <code className="text-sm bg-green-100 dark:bg-green-800 px-2 py-1 rounded text-green-800 dark:text-green-200">
                                {suggestedComponentName}.js
                            </code>
                        </div>

                        {/* Quick Steps */}
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 transition-colors">
                            <h3 className="font-medium text-indigo-900 dark:text-indigo-300 mb-3">Implementation Steps</h3>
                            <ol className="text-sm text-indigo-800 dark:text-indigo-200 space-y-2 list-decimal list-inside">
                                <li>Create component: <code className="bg-indigo-100 dark:bg-indigo-800 px-1 rounded text-xs">components/{ModuleCategory}/{suggestedComponentName}.js</code></li>
                                <li>Import in InboxRouter: <code className="bg-indigo-100 dark:bg-indigo-800 px-1 rounded text-xs">import {suggestedComponentName} from '../{ModuleCategory}/{suggestedComponentName}';</code></li>
                                <li>Add detection function for path: <code className="bg-indigo-100 dark:bg-indigo-800 px-1 rounded text-xs">{NavigationPath}</code></li>
                                <li>Add routing logic in InboxRouter</li>
                                <li>Connect to your verification API endpoints</li>
                            </ol>
                        </div>

                        {/* Path Detection */}
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 transition-colors">
                            <h3 className="font-medium text-yellow-900 dark:text-yellow-300 mb-2">Path Detection Code</h3>
                            <pre className="text-xs bg-yellow-100 dark:bg-yellow-800 p-2 rounded text-yellow-800 dark:text-yellow-200 overflow-x-auto">
{`const is${suggestedComponentName} = (path) => {
    return path.includes('${NavigationPath?.toLowerCase()}');
};`}
                            </pre>
                        </div>

                        {/* Expected APIs */}
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 transition-colors">
                            <h3 className="font-medium text-gray-900 dark:text-gray-300 mb-2">Expected API Endpoints</h3>
                            <div className="space-y-1 text-xs text-gray-700 dark:text-gray-300">
                                <div>• <strong>Get Items:</strong> GET /api/{ModuleCategory}/GetPending{suggestedComponentName}s</div>
                                <div>• <strong>Approve:</strong> POST /api/{ModuleCategory}/Approve{suggestedComponentName}</div>
                                <div>• <strong>Reject:</strong> POST /api/{ModuleCategory}/Reject{suggestedComponentName}</div>
                                <div>• <strong>Details:</strong> GET /api/{ModuleCategory}/Get{suggestedComponentName}Details</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Placeholder Content */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="p-8 text-center">
                    <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">🚧</div>
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-4">
                        {InboxTitle || ModuleDisplayName} Verification
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                        This verification workflow is not implemented yet. Create the <strong>{suggestedComponentName}</strong> component 
                        to handle {ModuleCategory} verifications for "{InboxTitle || ModuleDisplayName}".
                    </p>
                    
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 max-w-md mx-auto transition-colors">
                        <p className="text-sm text-indigo-800 dark:text-indigo-200">
                            <strong>Pending Items:</strong> {TotalPendingCount} items waiting for verification
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InboxItemPlaceholder;