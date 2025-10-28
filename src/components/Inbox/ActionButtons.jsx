// ActionButtons.jsx - Reusable Action Buttons Component
import React from 'react';
import { CheckCircle, XCircle, ArrowLeft, Clock, FileText } from 'lucide-react';

/**
 * ActionButtons Component
 * 
 * Renders dynamic action buttons (Approve, Reject, Return, etc.) with validation states.
 * Supports loading states, disabled states, and custom button configurations.
 * 
 * @param {Array} actions - Array of action objects from status list
 * @param {function} onActionClick - Click handler for actions
 * @param {boolean} loading - Loading state for all buttons
 * @param {boolean} disabled - Disabled state for all buttons
 * @param {boolean} isVerified - Verification checkbox state
 * @param {string} comment - Verification comment
 * @param {boolean} showValidation - Show validation status (default: true)
 * @param {Array} excludeActions - Array of action types to exclude (e.g., ['send back'])
 * @param {function} getActionIcon - Custom function to get icon for action type
 * @param {string} className - Additional wrapper classes
 */

const ActionButtons = ({
    actions = [],
    onActionClick,
    loading = false,
    disabled = false,
    isVerified = false,
    comment = '',
    showValidation = true,
    excludeActions = [],
    getActionIcon: customGetActionIcon,
    className = ''
}) => {
    // Default icon mapper
    const defaultGetActionIcon = (actionType) => {
        const type = actionType.toLowerCase();
        const iconMap = {
            'approve': CheckCircle,
            'verify': CheckCircle,
            'accept': CheckCircle,
            'return': ArrowLeft,
            'send back': ArrowLeft,
            'reject': XCircle,
            'decline': XCircle,
            'forward': ArrowLeft,
            'escalate': ArrowLeft,
            'hold': Clock,
            'pending': Clock
        };
        return iconMap[type] || CheckCircle;
    };

    const getActionIcon = customGetActionIcon || defaultGetActionIcon;

    // Filter actions
    const filteredActions = actions.filter(action => 
        !excludeActions.some(excluded => 
            action.type.toLowerCase() === excluded.toLowerCase()
        )
    );

    // No actions available
    if (filteredActions.length === 0) {
        return (
            <div className="text-center py-6">
                <div className="text-gray-500 dark:text-gray-400 mb-2">
                    {actions.length === 0 ? 'No actions available' : 'No applicable actions available'}
                </div>
                {excludeActions.length > 0 && (
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                        Some actions are hidden for this module
                    </div>
                )}
            </div>
        );
    }

    // Determine grid layout based on action count
    const actionCount = filteredActions.length;
    const gridCols = actionCount === 1 ? 'grid-cols-1' :
        actionCount === 2 ? 'grid-cols-1 md:grid-cols-2' :
        actionCount === 3 ? 'grid-cols-1 md:grid-cols-3' :
        'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

    // Check if buttons should be disabled
    const isDisabled = disabled || loading || comment.trim() === '' || !isVerified;

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Validation Status */}
            {showValidation && (
                <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Available Actions ({filteredActions.length})
                    </p>
                    <div className="flex items-center justify-center space-x-4 mb-4">
                        {/* Verification Status */}
                        <div className={`flex items-center space-x-1 text-sm ${isVerified ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                            <CheckCircle className={`w-4 h-4 ${isVerified ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`} />
                            <span>Verification: {isVerified ? 'Completed' : 'Required'}</span>
                        </div>
                        {/* Comment Status */}
                        <div className={`flex items-center space-x-1 text-sm ${comment.trim() ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                            <FileText className={`w-4 h-4 ${comment.trim() ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`} />
                            <span>Comments: {comment.trim() ? 'Added' : 'Required'}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Buttons Grid */}
            <div className={`grid ${gridCols} gap-4`}>
                {filteredActions.map((action, index) => {
                    const IconComponent = getActionIcon(action.type);

                    return (
                        <button
                            key={`${action.type}-${index}`}
                            onClick={() => onActionClick(action)}
                            disabled={isDisabled}
                            className={`
                                flex items-center justify-center space-x-2 px-6 py-4 
                                ${action.className || 'bg-indigo-600 hover:bg-indigo-700'} 
                                text-white rounded-lg transition-all 
                                disabled:opacity-50 disabled:cursor-not-allowed 
                                font-medium shadow-lg hover:shadow-xl
                                min-h-[60px]
                            `}
                            title={
                                comment.trim() === '' ? 'Please add verification comments first' :
                                !isVerified ? 'Please check the verification checkbox' :
                                `${action.text} (${action.type}: ${action.value})`
                            }
                        >
                            <IconComponent className="w-5 h-5 flex-shrink-0" />
                            <span className="truncate">
                                {loading ? 'Processing...' : action.text}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

/**
 * ActionButtonsWithLoading Component
 * 
 * Wrapper that includes loading and error states
 */
export const ActionButtonsWithLoading = ({
    loading = false,
    error = null,
    hasActions = true,
    onRetry,
    ...props
}) => {
    // Loading state
    if (loading) {
        return (
            <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500 mx-auto mb-2"></div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Loading available actions...</p>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="text-center py-4">
                <p className="text-red-500 dark:text-red-400 text-sm mb-2">Error loading actions: {error}</p>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="mt-2 px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition-colors"
                    >
                        Retry
                    </button>
                )}
            </div>
        );
    }

    // No actions state
    if (!hasActions) {
        return (
            <div className="text-center py-6">
                <div className="text-gray-500 dark:text-gray-400 mb-2">
                    No actions available for this item
                </div>
            </div>
        );
    }

    // Render action buttons
    return <ActionButtons {...props} />;
};

export default ActionButtons;