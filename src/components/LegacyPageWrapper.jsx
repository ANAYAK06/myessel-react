// components/LegacyPageWrapper.jsx
import React from 'react';
import { LEGACY_APP_URL } from '../config/legecyurlConfig';

const LegacyPageWrapper = ({ menuData, legacyUrl, onNavigate }) => {
    const getFullLegacyUrl = () => {
        if (legacyUrl) {
            return legacyUrl;
        }
        const basePath = menuData?.path || '';
        return `${LEGACY_APP_URL}${basePath}`;
    };

    const fullUrl = getFullLegacyUrl();

    const openInNewTab = () => {
        window.open(fullUrl, '_blank', 'noopener,noreferrer');
    };

    const openInNewWindow = () => {
        window.open(
            fullUrl, 
            'LegacyReport',
            'width=1400,height=900,menubar=yes,toolbar=yes,location=yes,scrollbars=yes,resizable=yes'
        );
    };

    const handleGoBack = () => {
        if (onNavigate) {
            // Navigate back to dashboard
            onNavigate('dashboard', { name: 'Dashboard', type: 'dashboard' });
        } else {
            // Fallback to browser back
            window.history.back();
        }
    };

    return (
        <div className="space-y-6">
            {/* Breadcrumb Navigation - Similar to your Budget Report */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                        {/* Back Button */}
                        <button
                            onClick={handleGoBack}
                            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        >
                            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back
                        </button>
                        <span className="text-gray-400">|</span>
                        {/* Breadcrumb */}
                        <nav className="text-sm text-gray-500 dark:text-gray-400">
                            <button 
                                onClick={handleGoBack}
                                className="hover:text-indigo-600 dark:hover:text-indigo-400"
                            >
                                Dashboard
                            </button>
                            <span className="mx-2">›</span>
                            <span>{menuData?.li || 'Reports'}</span>
                            <span className="mx-2">›</span>
                            <span className="text-gray-900 dark:text-white">{menuData?.name || 'Legacy Report'}</span>
                        </nav>
                    </div>
                    <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                        Legacy System
                    </div>
                </div>
            </div>

            {/* Page Header - Similar to Budget Report Style */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="text-3xl">📊</div>
                            <h1 className="text-2xl font-bold">
                                {menuData?.name || 'Legacy Report'}
                            </h1>
                        </div>
                        <p className="text-indigo-100 text-sm">
                            {menuData?.li || 'Reports'} - This report opens in the legacy system
                        </p>
                    </div>
                    <div className="hidden md:block">
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-sm">
                            <div className="text-indigo-100">Legacy Report</div>
                            <div className="font-semibold">External System</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content - Compact Design */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-8">
                    <div className="max-w-3xl mx-auto">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 dark:bg-indigo-900 rounded-full mb-4">
                                <span className="text-4xl">🔗</span>
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                Access Legacy Report
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300">
                                This report will open in a new window with your current session
                            </p>
                        </div>

                        {/* Action Buttons - Grid Layout */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <button
                                onClick={openInNewTab}
                                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex flex-col items-center justify-center gap-2 min-h-[100px]"
                            >
                                <span className="text-2xl">🗗</span>
                                <span>New Tab</span>
                            </button>

                            <button
                                onClick={openInNewWindow}
                                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex flex-col items-center justify-center gap-2 min-h-[100px]"
                            >
                                <span className="text-2xl">🪟</span>
                                <span>New Window</span>
                            </button>
                            <a
                            
                                href={fullUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-3 bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium flex flex-col items-center justify-center gap-2 min-h-[100px]"
                            >
                                <span className="text-2xl">🔗</span>
                                <span>Direct Link</span>
                            </a>
                        </div>

                        {/* URL Info - Collapsible */}
                        <details className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden">
                            <summary className="px-4 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors font-medium text-gray-700 dark:text-gray-300">
                                View Report URL
                            </summary>
                            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-600">
                                <code className="text-xs text-gray-600 dark:text-gray-300 break-all block bg-white dark:bg-gray-800 p-3 rounded">
                                    {fullUrl}
                                </code>
                            </div>
                        </details>
                    </div>
                </div>
            </div>

            {/* Information Footer */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <span className="text-blue-600 dark:text-blue-400 text-xl flex-shrink-0">ℹ️</span>
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                        <p className="font-medium mb-1">About Legacy Reports</p>
                        <p>Legacy reports open in a separate window for security reasons. Your session will be automatically maintained across both systems.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LegacyPageWrapper;