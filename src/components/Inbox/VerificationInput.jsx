// VerificationInput.jsx - Reusable Verification Comments Component
import React from 'react';
import { FileText, CheckCircle, AlertCircle } from 'lucide-react';

/**
 * VerificationInput Component
 * 
 * A combined verification checkbox and comments input component.
 * Features validation, character count, and customizable styling.
 * 
 * @param {boolean} isVerified - Checkbox state
 * @param {function} onVerifiedChange - Checkbox change handler
 * @param {string} comment - Comment text
 * @param {function} onCommentChange - Comment change handler
 * @param {Object} config - Configuration object
 */

const VerificationInput = ({
    // Checkbox
    isVerified = false,
    onVerifiedChange,
    
    // Comment
    comment = '',
    onCommentChange,
    
    // Configuration
    config = {
        checkboxLabel: '✓ I have verified all details',
        checkboxDescription: 'Including all amounts, codes, documentation, and authorization',
        commentLabel: 'Verification Comments',
        commentPlaceholder: 'Enter your verification comments...',
        commentRequired: true,
        commentRows: 4,
        commentMinLength: 0,
        commentMaxLength: 1000,
        showCharCount: false,
        checkboxGradient: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
        checkboxBorder: 'border-green-200 dark:border-green-700',
        commentGradient: 'from-indigo-50 to-indigo-50 dark:from-indigo-900/20 dark:to-indigo-900/20',
        commentBorder: 'border-indigo-200 dark:border-indigo-700',
        validationStyle: 'dynamic' // 'dynamic', 'border-only', 'none'
    },
    
    className = ''
}) => {
    // Merge config with defaults
    const mergedConfig = {
        checkboxLabel: '✓ I have verified all details',
        checkboxDescription: 'Including all amounts, codes, documentation, and authorization',
        commentLabel: 'Verification Comments',
        commentPlaceholder: 'Enter your verification comments...',
        commentRequired: true,
        commentRows: 4,
        commentMinLength: 0,
        commentMaxLength: 1000,
        showCharCount: false,
        checkboxGradient: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
        checkboxBorder: 'border-green-200 dark:border-green-700',
        commentGradient: 'from-indigo-50 to-indigo-50 dark:from-indigo-900/20 dark:to-indigo-900/20',
        commentBorder: 'border-indigo-200 dark:border-indigo-700',
        validationStyle: 'dynamic',
        ...config
    };

    // Validation helpers
    const commentTrimmed = comment.trim();
    const isCommentValid = commentTrimmed.length >= mergedConfig.commentMinLength;
    const isCommentEmpty = commentTrimmed === '';
    const charCount = comment.length;
    const charRemaining = mergedConfig.commentMaxLength - charCount;

    // Dynamic border color based on validation
    const getCommentBorderClass = () => {
        if (mergedConfig.validationStyle === 'none') return mergedConfig.commentBorder;
        if (mergedConfig.validationStyle === 'dynamic') {
            if (isCommentEmpty) {
                return 'border-red-400 dark:border-red-600';
            }
            return 'border-green-400 dark:border-green-600';
        }
        return mergedConfig.commentBorder;
    };

    // Dynamic background based on validation
    const getCommentBgClass = () => {
        if (mergedConfig.validationStyle === 'dynamic') {
            if (isCommentEmpty) {
                return 'bg-red-50 dark:bg-red-900/20';
            }
            return 'bg-green-50 dark:bg-green-900/20';
        }
        return 'bg-white dark:bg-gray-800';
    };

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Verification Checkbox */}
            <div className={`bg-gradient-to-br ${mergedConfig.checkboxGradient} p-5 rounded-xl border-2 ${mergedConfig.checkboxBorder}`}>
                <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={isVerified}
                        onChange={(e) => onVerifiedChange && onVerifiedChange(e.target.checked)}
                        className="w-5 h-5 mt-1 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <div>
                        <span className="font-semibold text-green-800 dark:text-green-200 block">
                            {mergedConfig.checkboxLabel}
                        </span>
                        {mergedConfig.checkboxDescription && (
                            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                                {mergedConfig.checkboxDescription}
                            </p>
                        )}
                    </div>
                </label>
            </div>

            {/* Verification Comments */}
            <div className={`bg-gradient-to-br ${mergedConfig.commentGradient} p-5 rounded-xl border-2 ${mergedConfig.commentBorder}`}>
                <label className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    {mergedConfig.commentRequired && (
                        <span className="text-red-600 dark:text-red-400 mr-1">*</span>
                    )}
                    {mergedConfig.commentLabel}
                    {mergedConfig.commentRequired && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">(Mandatory)</span>
                    )}
                </label>
                
                <textarea
                    value={comment}
                    onChange={(e) => {
                        const newValue = e.target.value;
                        if (newValue.length <= mergedConfig.commentMaxLength) {
                            onCommentChange && onCommentChange(e);
                        }
                    }}
                    className={`w-full px-4 py-3 border-2 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 transition-all ${getCommentBorderClass()} ${getCommentBgClass()}`}
                    rows={mergedConfig.commentRows}
                    placeholder={mergedConfig.commentPlaceholder}
                    required={mergedConfig.commentRequired}
                />
                
                {/* Footer with validation and char count */}
                <div className="flex items-center justify-between mt-2">
                    {/* Validation Message */}
                    {mergedConfig.commentRequired && isCommentEmpty && (
                        <p className="text-xs text-red-500 dark:text-red-400 flex items-center">
                            <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                            Verification comment is required before proceeding
                        </p>
                    )}
                    
                    {mergedConfig.commentRequired && !isCommentEmpty && isCommentValid && (
                        <p className="text-xs text-green-500 dark:text-green-400 flex items-center">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Comment added
                        </p>
                    )}
                    
                    {/* Character Count */}
                    {mergedConfig.showCharCount && (
                        <p className={`text-xs ml-auto ${
                            charRemaining < 50 ? 'text-orange-500 dark:text-orange-400' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                            {charCount} / {mergedConfig.commentMaxLength}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

/**
 * SimpleVerificationCheckbox Component
 * 
 * A simpler version with just the checkbox (no comments)
 */
export const SimpleVerificationCheckbox = ({
    isVerified = false,
    onVerifiedChange,
    label = '✓ I have verified all details',
    description,
    className = ''
}) => {
    return (
        <div className={`bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-5 rounded-xl border-2 border-green-200 dark:border-green-700 ${className}`}>
            <label className="flex items-start space-x-3 cursor-pointer">
                <input
                    type="checkbox"
                    checked={isVerified}
                    onChange={(e) => onVerifiedChange && onVerifiedChange(e.target.checked)}
                    className="w-5 h-5 mt-1 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <div>
                    <span className="font-semibold text-green-800 dark:text-green-200 block">
                        {label}
                    </span>
                    {description && (
                        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                            {description}
                        </p>
                    )}
                </div>
            </label>
        </div>
    );
};

/**
 * SimpleCommentInput Component
 * 
 * A simpler version with just the comment field (no checkbox)
 */
export const SimpleCommentInput = ({
    comment = '',
    onCommentChange,
    label = 'Comments',
    placeholder = 'Enter your comments...',
    required = false,
    rows = 4,
    maxLength = 1000,
    showCharCount = false,
    className = ''
}) => {
    const commentTrimmed = comment.trim();
    const isCommentEmpty = commentTrimmed === '';
    const charCount = comment.length;
    const charRemaining = maxLength - charCount;

    return (
        <div className={`bg-gradient-to-br from-indigo-50 to-indigo-50 dark:from-indigo-900/20 dark:to-indigo-900/20 p-5 rounded-xl border-2 border-indigo-200 dark:border-indigo-700 ${className}`}>
            <label className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                {required && <span className="text-red-600 dark:text-red-400 mr-1">*</span>}
                {label}
                {required && <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">(Mandatory)</span>}
            </label>
            
            <textarea
                value={comment}
                onChange={(e) => {
                    const newValue = e.target.value;
                    if (newValue.length <= maxLength) {
                        onCommentChange && onCommentChange(e);
                    }
                }}
                className={`w-full px-4 py-3 border-2 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 transition-all ${
                    isCommentEmpty
                        ? 'border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                        : 'border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-900/20'
                }`}
                rows={rows}
                placeholder={placeholder}
                required={required}
            />
            
            <div className="flex items-center justify-between mt-2">
                {required && isCommentEmpty && (
                    <p className="text-xs text-red-500 dark:text-red-400 flex items-center">
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                        Comment is required
                    </p>
                )}
                
                {required && !isCommentEmpty && (
                    <p className="text-xs text-green-500 dark:text-green-400 flex items-center">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Comment added
                    </p>
                )}
                
                {showCharCount && (
                    <p className={`text-xs ml-auto ${
                        charRemaining < 50 ? 'text-orange-500 dark:text-orange-400' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                        {charCount} / {maxLength}
                    </p>
                )}
            </div>
        </div>
    );
};

export default VerificationInput;