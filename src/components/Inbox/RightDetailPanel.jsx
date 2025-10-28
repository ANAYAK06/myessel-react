// RightDetailPanel.jsx - Reusable Detail View Panel Component
import React from 'react';
import { FileCheck, AlertCircle } from 'lucide-react';

/**
 * RightDetailPanel Component
 * 
 * A detail view panel that displays selected item information.
 * Features loading states, empty states, and custom content rendering.
 * 
 * @param {Object} selectedItem - Currently selected item
 * @param {boolean} loading - Loading state for item details
 * @param {string} error - Error message
 * @param {function} renderContent - Custom render function for content
 * @param {Object} config - Configuration object
 * @param {string} className - Additional classes for the panel
 */

const RightDetailPanel = ({
    // Data
    selectedItem = null,
    loading = false,
    error = null,
    
    // Rendering
    renderContent,
    
    // Configuration
    config = {
        title: 'Details',
        icon: FileCheck,
        selectedTitle: 'Item Verification',
        emptyTitle: 'No Item Selected',
        emptyMessage: 'Select an item from the list to view details and take action.',
        headerGradient: 'from-indigo-50 to-indigo-50 dark:from-indigo-900/20 dark:to-indigo-900/20',
        maxHeight: 'calc(100vh-200px)',
        sticky: true,
        stickyTop: '1.5rem'
    },
    
    className = ''
}) => {
    // Merge config with defaults
    const mergedConfig = {
        title: 'Details',
        icon: FileCheck,
        selectedTitle: 'Item Verification',
        emptyTitle: 'No Item Selected',
        emptyMessage: 'Select an item from the list to view details and take action.',
        headerGradient: 'from-indigo-50 to-indigo-50 dark:from-indigo-900/20 dark:to-indigo-900/20',
        maxHeight: 'calc(100vh-200px)',
        sticky: true,
        stickyTop: '1.5rem',
        ...config
    };

    const IconComponent = mergedConfig.icon;

    return (
        <div 
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-colors ${
                mergedConfig.sticky ? 'sticky' : ''
            } ${className}`}
            style={mergedConfig.sticky ? { top: mergedConfig.stickyTop } : {}}
        >
            {/* Header */}
            <div className={`bg-gradient-to-r ${mergedConfig.headerGradient} p-4 border-b border-gray-200 dark:border-gray-700 rounded-t-xl`}>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-500 rounded-lg">
                        <IconComponent className="w-4 h-4 text-white" />
                    </div>
                    <span>
                        {selectedItem ? mergedConfig.selectedTitle : mergedConfig.title}
                    </span>
                </h2>
            </div>

            {/* Content */}
            <div 
                className="p-6 overflow-y-auto"
                style={{ maxHeight: mergedConfig.maxHeight }}
            >
                {selectedItem ? (
                    <div className="space-y-6">
                        {/* Loading State */}
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                                <p className="text-gray-500 dark:text-gray-400">Loading detailed information...</p>
                            </div>
                        ) : error ? (
                            // Error State
                            <div className="text-center py-8">
                                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                                <p className="text-red-500 dark:text-red-400">{error}</p>
                            </div>
                        ) : renderContent ? (
                            // Custom Content
                            renderContent(selectedItem)
                        ) : (
                            // Default Content
                            <div className="text-center py-8">
                                <p className="text-gray-500 dark:text-gray-400">No render function provided</p>
                            </div>
                        )}
                    </div>
                ) : (
                    // Empty State (No Item Selected)
                    <div className="text-center py-12">
                        <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-12 h-12 text-indigo-500 dark:text-indigo-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            {mergedConfig.emptyTitle}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            {mergedConfig.emptyMessage}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * DetailSection Component
 * 
 * A reusable section component for organizing content within the detail panel
 */
export const DetailSection = ({
    title,
    icon: Icon,
    children,
    className = '',
    gradient = 'from-indigo-50 to-indigo-50 dark:from-indigo-900/20 dark:to-indigo-900/20',
    borderColor = 'border-indigo-200 dark:border-indigo-700'
}) => {
    return (
        <div className={`p-6 rounded-xl border-2 bg-gradient-to-r ${gradient} ${borderColor} ${className}`}>
            {title && (
                <div className="flex items-center space-x-2 mb-4">
                    {Icon && (
                        <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-500 rounded-lg">
                            <Icon className="w-4 h-4 text-white" />
                        </div>
                    )}
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                        {title}
                    </h3>
                </div>
            )}
            {children}
        </div>
    );
};

/**
 * DetailRow Component
 * 
 * A simple row component for displaying label-value pairs
 */
export const DetailRow = ({
    label,
    value,
    icon: Icon,
    className = ''
}) => {
    return (
        <div className={`flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-0 ${className}`}>
            <div className="flex items-center space-x-2">
                {Icon && <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />}
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {label}
                </span>
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {value}
            </span>
        </div>
    );
};

/**
 * DetailGrid Component
 * 
 * A grid layout for displaying multiple detail items
 */
export const DetailGrid = ({
    items = [],
    columns = 2,
    className = ''
}) => {
    const gridCols = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-3',
        4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
    };

    return (
        <div className={`grid ${gridCols[columns] || gridCols[2]} gap-4 ${className}`}>
            {items.map((item, index) => (
                <div 
                    key={index}
                    className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {item.label}
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {item.value}
                    </p>
                </div>
            ))}
        </div>
    );
};

export default RightDetailPanel;