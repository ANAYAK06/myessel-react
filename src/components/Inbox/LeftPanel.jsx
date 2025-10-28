// LeftPanel.jsx - Reusable Collapsible List Panel Component
import React from 'react';
import { ChevronLeft, ChevronRight, RefreshCw, Clock, CheckCircle, XCircle } from 'lucide-react';

/**
 * LeftPanel Component
 * 
 * A collapsible left sidebar panel for displaying lists of items.
 * Features hover expansion, refresh button, loading/error/empty states.
 * 
 * @param {Array} items - Array of items to display
 * @param {Object} selectedItem - Currently selected item
 * @param {function} onItemSelect - Item selection handler
 * @param {function} renderItem - Custom render function for list items
 * @param {boolean} isCollapsed - Collapse state
 * @param {function} onCollapseToggle - Toggle collapse handler
 * @param {boolean} loading - Loading state
 * @param {string} error - Error message
 * @param {function} onRefresh - Refresh handler
 * @param {Object} config - Configuration object
 */

const LeftPanel = ({
    // Data
    items = [],
    selectedItem = null,
    onItemSelect,
    
    // Rendering
    renderItem,
    renderCollapsedItem,
    
    // Collapse control
    isCollapsed = false,
    onCollapseToggle,
    
    // States
    loading = false,
    error = null,
    onRefresh,
    
    // Configuration
    config = {
        title: 'Pending',
        icon: Clock,
        emptyMessage: 'No items found!',
        itemKey: 'id',
        enableCollapse: true,
        enableRefresh: true,
        enableHover: true,
        maxHeight: 'calc(100vh-300px)',
        headerGradient: 'from-indigo-50 to-indigo-50 dark:from-indigo-900/20 dark:to-indigo-900/20'
    }
}) => {
    const [isHovered, setIsHovered] = React.useState(false);
    
    // Merge config with defaults
    const mergedConfig = {
        title: 'Pending',
        icon: Clock,
        emptyMessage: 'No items found!',
        itemKey: 'id',
        enableCollapse: true,
        enableRefresh: true,
        enableHover: true,
        maxHeight: 'calc(100vh-300px)',
        headerGradient: 'from-indigo-50 to-indigo-50 dark:from-indigo-900/20 dark:to-indigo-900/20',
        ...config
    };

    const IconComponent = mergedConfig.icon;
    const shouldExpand = !isCollapsed || (mergedConfig.enableHover && isHovered);

    return (
        <div
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300 overflow-hidden ${
                isCollapsed && !isHovered ? 'w-16' : 'w-full'
            }`}
            onMouseEnter={() => mergedConfig.enableHover && setIsHovered(true)}
            onMouseLeave={() => mergedConfig.enableHover && setIsHovered(false)}
        >
            {/* Header */}
            <div className={`bg-gradient-to-r ${mergedConfig.headerGradient} p-4 border-b border-gray-200 dark:border-gray-700`}>
                <div className="flex items-center justify-between">
                    {isCollapsed && !isHovered ? (
                        // Collapsed Header
                        <div className="flex flex-col items-center space-y-2">
                            <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-500 rounded-lg">
                                <IconComponent className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold transform -rotate-90 whitespace-nowrap">
                                {items.length}
                            </span>
                            {mergedConfig.enableCollapse && (
                                <button
                                    onClick={() => onCollapseToggle && onCollapseToggle(false)}
                                    className="p-1 text-indigo-600 hover:text-indigo-800 dark:hover:text-indigo-300 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/20 transition-colors"
                                    title="Expand Panel"
                                >
                                    <ChevronRight className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    ) : (
                        // Expanded Header
                        <>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                                <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-500 rounded-lg">
                                    <IconComponent className="w-4 h-4 text-white" />
                                </div>
                                <span>{mergedConfig.title} ({items.length})</span>
                            </h2>
                            <div className="flex items-center space-x-2">
                                {mergedConfig.enableCollapse && selectedItem && (
                                    <button
                                        onClick={() => onCollapseToggle && onCollapseToggle(true)}
                                        className="p-2 text-indigo-600 hover:text-indigo-800 dark:hover:text-indigo-300 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/20 transition-colors"
                                        title="Collapse Panel"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                )}
                                {mergedConfig.enableRefresh && onRefresh && (
                                    <button
                                        onClick={onRefresh}
                                        className="p-2 text-indigo-600 hover:text-indigo-800 dark:hover:text-indigo-300 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/20 transition-colors"
                                        title="Refresh"
                                        disabled={loading}
                                    >
                                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Content */}
            <div 
                className={`p-4 overflow-y-auto transition-all duration-300 ${
                    isCollapsed && !isHovered ? 'w-16' : 'w-full'
                }`}
                style={{ height: mergedConfig.maxHeight,
                    minHeight: '200px'
                 }}
            >
                {/* Loading State */}
                {loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                        {shouldExpand && <p className="text-gray-500 dark:text-gray-400">Loading...</p>}
                    </div>
                ) : error ? (
                    // Error State
                    <div className="text-center py-8">
                        <XCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                        {shouldExpand && (
                            <>
                                <p className="text-red-500 dark:text-red-400 mb-2">{error}</p>
                                {onRefresh && (
                                    <button
                                        onClick={onRefresh}
                                        className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                    >
                                        Retry
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                ) : items.length === 0 ? (
                    // Empty State
                    <div className="text-center py-8">
                        <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                        {shouldExpand && <p className="text-gray-500 dark:text-gray-400">{mergedConfig.emptyMessage}</p>}
                    </div>
                ) : (
                    // Items List
                    <div className={`space-y-3 ${isCollapsed && !isHovered ? 'flex flex-col items-center' : ''}`}>
                        {items.map((item) => {
                            const itemKey = item[mergedConfig.itemKey];
                            const isSelected = selectedItem?.[mergedConfig.itemKey] === itemKey;

                            return (
                                <div
                                    key={itemKey}
                                    className={`rounded-xl cursor-pointer transition-all hover:shadow-md border-2 ${
                                        isSelected
                                            ? 'border-indigo-500 bg-gradient-to-r from-indigo-50 to-indigo-50 dark:from-indigo-900/20 dark:to-indigo-900/20 shadow-lg'
                                            : 'border-gray-200 dark:border-gray-600 hover:border-indigo-300 bg-white dark:bg-gray-800'
                                    } ${isCollapsed && !isHovered ? 'w-12 h-12 p-1' : ''}`}
                                    onClick={() => onItemSelect && onItemSelect(item)}
                                    title={isCollapsed && !isHovered ? item.title || item.name || `Item ${itemKey}` : ''}
                                >
                                    {isCollapsed && !isHovered && renderCollapsedItem ? (
                                        // Collapsed item view
                                        renderCollapsedItem(item, isSelected)
                                    ) : renderItem ? (
                                        // Custom item view
                                        renderItem(item, isSelected)
                                    ) : (
                                        // Default item view
                                        <div className="p-4">
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                {item.title || item.name || `Item ${itemKey}`}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeftPanel;