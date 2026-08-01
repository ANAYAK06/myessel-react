// InboxListPanel.jsx - "Classic" full-width row list view for the inbox
import React, { useState, useEffect } from 'react';
import { RefreshCw, Clock, CheckCircle, XCircle, Pencil } from 'lucide-react';
import DetailPopupModal from './DetailPopupModal';

/**
 * InboxListPanel Component
 *
 * The "classic" list view for the inbox — full-width stacked rows instead of
 * the Outlook-style card grid, matching the layout users of the old MVC app
 * are familiar with. Clicking a row opens the same detail content used by
 * the split view's right panel, in a full-width popup.
 *
 * Row content prefers `renderListItem` (a compact, single-line renderer a
 * page can opt into) and falls back to whatever `renderItem` the page
 * already supplies to LeftPanel — the card-shaped renderer works but wastes
 * vertical space since it wasn't designed for a full-width row.
 *
 * @param {Array} items - Array of items to display
 * @param {Object} selectedItem - Currently selected item (for highlighting)
 * @param {function} onItemSelect - Item selection handler (e.g. to load full detail)
 * @param {function} renderItem - Render function for row content (same as LeftPanel's, fallback)
 * @param {function} renderListItem - Optional compact single-line render function, preferred over renderItem
 * @param {boolean} loading - Loading state
 * @param {string} error - Error message
 * @param {function} onRefresh - Refresh handler
 * @param {Object} config - Configuration object (title, icon, emptyMessage, itemKey...)
 * @param {function} renderPopupContent - Render function for the popup detail view
 * @param {Object} popupConfig - { title, icon, headerGradient } overrides for the popup header
 */
const InboxListPanel = ({
    items = [],
    selectedItem = null,
    onItemSelect,

    renderItem,
    renderListItem,

    loading = false,
    error = null,
    onRefresh,

    config = {},

    renderPopupContent,
    popupConfig = {}
}) => {
    const mergedConfig = {
        title: 'Pending',
        icon: Clock,
        emptyMessage: 'No items found!',
        itemKey: 'id',
        ...config
    };

    const rowContent = renderListItem || renderItem;

    const IconComponent = mergedConfig.icon;
    const [popupItem, setPopupItem] = useState(null);

    // Pages clear selectedItem (setSelectedX(null)) once an approve/reject/verify
    // action succeeds. Mirror that here so the popup — which pages have no direct
    // handle on, since it's local state — closes itself instead of being left open
    // showing stale/reset detail data.
    useEffect(() => {
        if (!selectedItem) {
            setPopupItem(null);
        }
    }, [selectedItem]);

    const handleRowClick = (item) => {
        if (onItemSelect) onItemSelect(item);
        if (renderPopupContent) setPopupItem(item);
    };

    return (
        <>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Header — always a solid dark bar so white text stays readable
                    regardless of each page's (much lighter) split-view gradient */}
                <div className="bg-gradient-to-r from-[#0d1b5e] to-blue-900 p-4 flex items-center justify-between">
                    <h2 className="text-base font-semibold text-white flex items-center space-x-2">
                        <IconComponent className="w-4 h-4 text-white" />
                        <span>{mergedConfig.title} ({items.length})</span>
                    </h2>
                    {onRefresh && (
                        <button
                            onClick={onRefresh}
                            className="p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                            title="Refresh"
                            disabled={loading}
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    )}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="text-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-10">
                        <XCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                        <p className="text-red-500 dark:text-red-400 mb-2">{error}</p>
                        {onRefresh && (
                            <button
                                onClick={onRefresh}
                                className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                Retry
                            </button>
                        )}
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-10">
                        <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                        <p className="text-gray-500 dark:text-gray-400">{mergedConfig.emptyMessage}</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {items.map((item, index) => {
                            const itemKey = item[mergedConfig.itemKey];
                            const isSelected = selectedItem?.[mergedConfig.itemKey] === itemKey;

                            return (
                                <div
                                    // itemKey (e.g. TransactionRefno) isn't guaranteed unique per row —
                                    // some pages have multiple pending items sharing the same value.
                                    // A non-unique React key makes the reconciler lose track of old rows
                                    // on re-render instead of removing them, so refreshes stack up ghost
                                    // rows. Combine with index to guarantee uniqueness within a render.
                                    key={`${itemKey ?? 'row'}-${index}`}
                                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                                        isSelected
                                            ? 'bg-indigo-50 dark:bg-indigo-900/20'
                                            : index % 2 === 0
                                                ? 'bg-white dark:bg-gray-800'
                                                : 'bg-gray-50 dark:bg-gray-800/60'
                                    } hover:bg-indigo-50 dark:hover:bg-indigo-900/20`}
                                    onClick={() => handleRowClick(item)}
                                >
                                    <Pencil className="w-4 h-4 text-[#0d1b5e] dark:text-orange-400 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        {rowContent ? (
                                            rowContent(item, isSelected)
                                        ) : (
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                {item.title || item.name || `Item ${itemKey}`}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {popupItem && renderPopupContent && (
                <DetailPopupModal
                    item={popupItem}
                    onClose={() => setPopupItem(null)}
                    renderContent={renderPopupContent}
                    title={popupConfig?.title || mergedConfig.title}
                    icon={popupConfig?.icon || IconComponent}
                    headerGradient={popupConfig?.headerGradient}
                    maxWidth={popupConfig?.maxWidth}
                />
            )}
        </>
    );
};

export default InboxListPanel;
