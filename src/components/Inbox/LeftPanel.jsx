// LeftPanel.jsx - Reusable Collapsible List Panel Component
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { ChevronLeft, ChevronRight, RefreshCw, Clock, CheckCircle, XCircle, Maximize2, X } from 'lucide-react';

/**
 * LeftPanel Component
 *
 * A collapsible left sidebar panel for displaying lists of items.
 * Features hover expansion, refresh button, loading/error/empty states,
 * and an optional popup view for item details.
 *
 * @param {Array} items - Array of items to display
 * @param {Object} selectedItem - Currently selected item
 * @param {function} onItemSelect - Item selection handler
 * @param {function} renderItem - Custom render function for list items
 * @param {boolean} isCollapsed - Collapse state
 * @param {function} onCollapseToggle - Toggle collapse handler
 * @param {boolean} isHovered - Hover state (EXTERNAL - from parent)
 * @param {function} onHoverChange - Hover state change handler (EXTERNAL - from parent)
 * @param {boolean} loading - Loading state
 * @param {string} error - Error message
 * @param {function} onRefresh - Refresh handler
 * @param {Object} config - Configuration object
 * @param {function} renderPopupContent - Optional: render function for popup detail view (same as RightDetailPanel's renderContent)
 * @param {Object} popupConfig - Optional: { title, icon, headerGradient } overrides for the popup header
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

    // Hover control (EXTERNAL - managed by parent)
    isHovered = false,
    onHoverChange,

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
    },

    // Popup feature (optional)
    renderPopupContent,
    popupConfig = {}
}) => {
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

    // Popup state
    const [popupItem, setPopupItem] = useState(null);
    const PopupIcon = popupConfig?.icon || IconComponent;
    const popupTitle = popupConfig?.title || mergedConfig.title;
    const popupHeaderGradient = popupConfig?.headerGradient || 'from-[#0d1b5e]/5 to-orange-50/30 dark:from-[#0d1b5e]/20 dark:to-gray-800';

    // Handle mouse enter - notify parent
    const handleMouseEnter = () => {
        if (mergedConfig.enableHover && onHoverChange) {
            onHoverChange(true);
        }
    };

    // Handle mouse leave - notify parent
    const handleMouseLeave = () => {
        if (mergedConfig.enableHover && onHoverChange) {
            onHoverChange(false);
        }
    };

    const popupModal = popupItem && renderPopupContent ? ReactDOM.createPortal(
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            onClick={() => setPopupItem(null)}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className={`bg-gradient-to-r ${popupHeaderGradient} p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0`}>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                        <div className="p-2 bg-gradient-to-br from-[#0d1b5e] to-orange-500 rounded-lg">
                            <PopupIcon className="w-4 h-4 text-white" />
                        </div>
                        <span>{popupTitle} — Detail View</span>
                    </h2>
                    <button
                        onClick={() => setPopupItem(null)}
                        className="p-2 rounded-lg text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="Close popup"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="overflow-y-auto flex-1 p-6">
                    {renderPopupContent(popupItem)}
                </div>
            </div>
        </div>,
        document.body
    ) : null;

    return (
        <>
            <div
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300 overflow-hidden ${
                    isCollapsed && !isHovered ? 'w-16' : 'w-full'
                }`}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
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
                    style={{
                        height: mergedConfig.maxHeight,
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
                                const isExpanded = !(isCollapsed && !isHovered);

                                return (
                                    <div
                                        key={itemKey}
                                        className={`relative group/item rounded-xl cursor-pointer transition-all hover:shadow-md border-2 ${
                                            isSelected
                                                ? 'border-indigo-500 bg-gradient-to-r from-indigo-50 to-indigo-50 dark:from-indigo-900/20 dark:to-indigo-900/20 shadow-lg'
                                                : 'border-gray-200 dark:border-gray-600 hover:border-indigo-300 bg-white dark:bg-gray-800'
                                        } ${isCollapsed && !isHovered ? 'w-12 h-12 p-1' : ''}`}
                                        onClick={() => onItemSelect && onItemSelect(item)}
                                        title={isCollapsed && !isHovered ? item.title || item.name || `Item ${itemKey}` : ''}
                                    >
                                        {/* Popup button — appears on hover when panel is expanded */}
                                        {renderPopupContent && isExpanded && (
                                            <button
                                                className="absolute top-2 right-2 z-10 opacity-0 group-hover/item:opacity-100 p-1 rounded-md bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-[#0d1b5e] dark:text-orange-400 hover:bg-[#0d1b5e] hover:text-white dark:hover:bg-[#0d1b5e] dark:hover:text-white transition-all shadow-sm"
                                                onClick={(e) => {
                                                e.stopPropagation();
                                                // Also trigger item selection so parent loads detail data into state
                                                if (onItemSelect) onItemSelect(item);
                                                setPopupItem(item);
                                            }}
                                                title="View details in popup"
                                            >
                                                <Maximize2 className="w-3 h-3" />
                                            </button>
                                        )}

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

            {/* Popup portal — rendered at document.body level to escape overflow/stacking context */}
            {popupModal}
        </>
    );
};

export default LeftPanel;
