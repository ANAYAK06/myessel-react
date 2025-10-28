// RemarksHistory.jsx - Reusable Approval History Component
import React from 'react';
import { UserCheck, ChevronUp, ChevronDown, User, FileX } from 'lucide-react';

/**
 * RemarksHistory Component
 * 
 * Displays approval/action history with toggle functionality.
 * Shows role, user, action type, comments, and timestamp for each entry.
 * 
 * @param {boolean} isOpen - Controls visibility (expanded/collapsed)
 * @param {function} onToggle - Toggle handler
 * @param {Array} remarks - Array of remark objects
 * @param {boolean} loading - Loading state
 * @param {string} title - Section title (default: "Approval History")
 * @param {string} emptyMessage - Message when no remarks (default: "No approval history found")
 * @param {string} className - Additional wrapper classes
 */

const RemarksHistory = ({
    isOpen = false,
    onToggle,
    remarks = [],
    loading = false,
    title = 'Approval History',
    emptyMessage = 'No approval history found',
    className = ''
}) => {
    // Toggle button (always visible)
    const renderToggleButton = () => (
        <div className={`bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-gray-200 dark:border-gray-700 ${className}`}>
            <button
                onClick={onToggle}
                className="flex items-center justify-between w-full text-left"
            >
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                    <UserCheck className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                    {title} ({remarks.length})
                </h4>
                {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
            </button>
        </div>
    );

    // If not open, just show toggle button
    if (!isOpen) {
        return renderToggleButton();
    }

    // Expanded view
    return (
        <div className={`bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-gray-200 dark:border-gray-700 ${className}`}>
            {/* Header with close button */}
            <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                    <UserCheck className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                    {title} ({remarks.length} Actions)
                </h4>
                <button
                    onClick={onToggle}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    title="Collapse"
                >
                    <ChevronUp className="w-4 h-4" />
                </button>
            </div>

            {/* Content */}
            {loading ? (
                // Loading state
                <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500 mx-auto mb-2"></div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Loading remarks...</p>
                </div>
            ) : remarks.length === 0 ? (
                // Empty state
                <div className="text-center py-4">
                    <FileX className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
                </div>
            ) : (
                // Remarks list
                <div className="space-y-3">
                    {remarks.map((remark, index) => (
                        <RemarkCard key={index} remark={remark} />
                    ))}
                </div>
            )}
        </div>
    );
};

/**
 * RemarkCard Component
 * Individual remark entry card
 */
const RemarkCard = ({ remark }) => {
    // Get action color
    const getActionColor = (action) => {
        const actionLower = action?.toLowerCase() || '';
        if (actionLower.includes('approve') || actionLower.includes('accept')) {
            return 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-600';
        }
        if (actionLower.includes('reject') || actionLower.includes('decline')) {
            return 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-600';
        }
        if (actionLower.includes('return') || actionLower.includes('send back')) {
            return 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-600';
        }
        return 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-600';
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow">
            <div className="flex items-start space-x-3">
                {/* Avatar */}
                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* User and Role Info */}
                    <div className="flex items-center flex-wrap gap-2 mb-1">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {remark.ActionBy || remark.actionBy || 'Unknown User'}
                        </span>
                        
                        {/* Role Badge */}
                        {(remark.ActionRole || remark.actionRole) && (
                            <span className="px-2 py-1 text-xs rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-600">
                                {remark.ActionRole || remark.actionRole}
                            </span>
                        )}
                        
                        {/* Action Badge */}
                        {(remark.Action || remark.action) && (
                            <span className={`px-2 py-1 text-xs rounded-full border ${getActionColor(remark.Action || remark.action)}`}>
                                {remark.Action || remark.action}
                            </span>
                        )}
                    </div>
                    
                    {/* Remarks/Comments */}
                    {(remark.ActionRemarks || remark.actionRemarks || remark.remarks || remark.comment) && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 break-words">
                            {remark.ActionRemarks || remark.actionRemarks || remark.remarks || remark.comment}
                        </p>
                    )}
                    
                    {/* Timestamp */}
                    {(remark.ActionDate || remark.actionDate || remark.timestamp) && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {new Date(remark.ActionDate || remark.actionDate || remark.timestamp).toLocaleString()}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

/**
 * RemarksHistoryWithState Component
 * 
 * Version with built-in state management for toggle
 */
export const RemarksHistoryWithState = ({
    remarks = [],
    loading = false,
    initialOpen = false,
    ...props
}) => {
    const [isOpen, setIsOpen] = React.useState(initialOpen);

    return (
        <RemarksHistory
            isOpen={isOpen}
            onToggle={() => setIsOpen(!isOpen)}
            remarks={remarks}
            loading={loading}
            {...props}
        />
    );
};

export default RemarksHistory;
export { RemarkCard };