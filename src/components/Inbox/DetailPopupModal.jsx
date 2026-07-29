// DetailPopupModal.jsx - Reusable full-detail popup modal
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';

/**
 * DetailPopupModal Component
 *
 * A portal-rendered, full-detail popup modal used to show an item's detail
 * content (same content shown in RightDetailPanel) over the whole viewport.
 * Same visuals as the popup already built into LeftPanel's "maximize" button.
 *
 * Auto-closes itself once renderContent has nothing left to show — e.g. after
 * a successful approve/reject clears the page's selectedItem, the detail
 * content function returns null and this popup would otherwise stay open
 * showing nothing, requiring a manual close.
 *
 * @param {Object} item - The item whose detail content should be shown
 * @param {function} onClose - Called to close the popup
 * @param {function} renderContent - Render function for the detail content, given `item`
 * @param {string} title - Popup header title
 * @param {React.ComponentType} icon - Icon component shown in the header
 * @param {string} headerGradient - Tailwind gradient classes for the header background
 * @param {string} maxWidth - Tailwind max-width class for the modal (default max-w-4xl)
 */
const DetailPopupModal = ({
    item,
    onClose,
    renderContent,
    title = 'Detail View',
    icon: Icon,
    headerGradient = 'from-[#0d1b5e]/5 to-orange-50/30 dark:from-[#0d1b5e]/20 dark:to-gray-800',
    maxWidth = 'max-w-4xl'
}) => {
    const shouldShow = Boolean(item && renderContent);
    const content = shouldShow ? renderContent(item) : null;

    useEffect(() => {
        if (shouldShow && content == null) {
            onClose();
        }
    }, [shouldShow, content, onClose]);

    if (!shouldShow || content == null) return null;

    return ReactDOM.createPortal(
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full ${maxWidth} max-h-[90vh] flex flex-col overflow-hidden`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className={`bg-gradient-to-r ${headerGradient} p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0`}>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                        {Icon && (
                            <div className="p-2 bg-gradient-to-br from-[#0d1b5e] to-orange-500 rounded-lg">
                                <Icon className="w-4 h-4 text-white" />
                            </div>
                        )}
                        <span>{title} — Detail View</span>
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="Close popup"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="overflow-y-auto flex-1 p-6">
                    {content}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default DetailPopupModal;
