// AttachmentModal.jsx - Enhanced Reusable Attachment Viewer Modal
import React from 'react';
import { FileText, Download, X, ExternalLink, AlertCircle } from 'lucide-react';

/**
 * AttachmentModal Component (Enhanced Version)
 * 
 * A professional modal for viewing and downloading attachments (images, PDFs, and other files).
 * Matches the advanced design of the PDF modal with backdrop blur, better header, and more actions.
 * 
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Close handler
 * @param {string} fileUrl - URL of the file to display
 * @param {string} fileName - Optional file name for download
 * @param {string} title - Modal title (default: "Supporting Document")
 * @param {string} subtitle - Optional subtitle for context
 * @param {function} isImageFile - Function to check if file is an image
 * @param {function} isPdfFile - Function to check if file is a PDF
 * @param {function} onError - Optional error callback
 * @param {string} theme - Color theme: 'purple' (default), 'indigo', 'blue', 'green'
 */

const AttachmentModal = ({
    isOpen = false,
    onClose,
    fileUrl,
    fileName = 'document',
    title = 'Supporting Document',
    subtitle = '',
    isImageFile,
    isPdfFile,
    onError,
    theme = 'purple',
    className = ''
}) => {
    // Theme color configurations
    const themeColors = {
        purple: {
            gradient: 'from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20',
            icon: 'from-purple-500 to-indigo-500',
            button: 'text-purple-600 hover:text-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/20'
        },
        indigo: {
            gradient: 'from-indigo-50 to-indigo-50 dark:from-indigo-900/20 dark:to-indigo-900/20',
            icon: 'from-indigo-500 to-indigo-600',
            button: 'text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/20'
        },
        blue: {
            gradient: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
            icon: 'from-blue-500 to-cyan-500',
            button: 'text-blue-600 hover:text-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/20'
        },
        green: {
            gradient: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
            icon: 'from-green-500 to-emerald-500',
            button: 'text-green-600 hover:text-green-800 hover:bg-green-100 dark:hover:bg-green-900/20'
        }
    };

    const colors = themeColors[theme] || themeColors.purple;

    // Handle ESC key - MUST be before any early returns
    React.useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && onClose) {
                onClose();
            }
        };
        
        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        }
        
        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    // Early return AFTER all hooks
    if (!isOpen || !fileUrl) return null;

    // Determine file type
    const isImage = isImageFile ? isImageFile(fileUrl) : /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(fileUrl);
    const isPdf = isPdfFile ? isPdfFile(fileUrl) : /\.pdf$/i.test(fileUrl);

    // Get file extension for subtitle
    const fileExtension = fileUrl.split('.').pop()?.toUpperCase() || 'FILE';

    // Handle backdrop click
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // Handle file load error
    const handleFileError = () => {
        if (onError) {
            onError();
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop with blur effect */}
            <div
                className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
                onClick={handleBackdropClick}
            ></div>

            {/* Modal Container */}
            <div className="relative w-full h-full flex items-center justify-center p-4">
                <div className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-600 max-w-6xl w-full h-[90vh] flex flex-col ${className}`}>
                    
                    {/* Modal Header */}
                    <div className={`flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600 bg-gradient-to-r ${colors.gradient} rounded-t-2xl`}>
                        <div className="flex items-center space-x-3">
                            <div className={`p-2 bg-gradient-to-br ${colors.icon} rounded-lg shadow-lg`}>
                                <FileText className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {title}
                                </h3>
                                {subtitle && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {subtitle}
                                    </p>
                                )}
                                {!subtitle && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {isPdf ? 'PDF Document' : isImage ? 'Image File' : `${fileExtension} File`}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            {/* Download Button */}
                            <a
                                href={fileUrl}
                                download={fileName}
                                className={`p-2 ${colors.button} rounded-lg transition-colors`}
                                title="Download File"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Download className="w-5 h-5" />
                            </a>

                            {/* Open in New Tab Button */}
                            <a
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`p-2 ${colors.button} rounded-lg transition-colors`}
                                title="Open in New Tab"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <ExternalLink className="w-5 h-5" />
                            </a>

                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                title="Close (ESC)"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Modal Body / Content Area */}
                    <div className="flex-1 p-2 bg-gray-50 dark:bg-gray-900 rounded-b-2xl overflow-hidden">
                        {isImage ? (
                            // Image Viewer
                            <div className="w-full h-full flex items-center justify-center overflow-auto p-4">
                                <img
                                    src={fileUrl}
                                    alt={fileName || title || 'Attachment'}
                                    className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.style.display = 'none';
                                        handleFileError();
                                        
                                        // Show error message
                                        const errorDiv = document.createElement('div');
                                        errorDiv.className = 'text-center py-12';
                                        errorDiv.innerHTML = `
                                            <div class="flex flex-col items-center">
                                                <svg class="w-16 h-16 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                                <p class="text-gray-600 dark:text-gray-400 mb-4">Failed to load image</p>
                                            </div>
                                        `;
                                        e.target.parentElement.appendChild(errorDiv);
                                    }}
                                />
                            </div>
                        ) : isPdf ? (
                            // PDF Viewer
                            <iframe
                                src={fileUrl}
                                className="w-full h-full border-0 rounded-lg shadow-inner"
                                title={title || 'PDF Viewer'}
                                onError={handleFileError}
                            />
                        ) : (
                            // Generic File (Download Only)
                            <div className="w-full h-full flex items-center justify-center">
                                <div className="text-center py-12">
                                    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                                        <FileText className="w-10 h-10 text-gray-500 dark:text-gray-300" />
                                    </div>
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                        Preview Not Available
                                    </h4>
                                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                                        This file type cannot be previewed in the browser. Please download the file to view it.
                                    </p>
                                    <div className="flex items-center justify-center space-x-3">
                                        <a
                                            href={fileUrl}
                                            download={fileName}
                                            className={`inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-br ${colors.icon} text-white rounded-lg hover:shadow-lg transition-all font-medium`}
                                        >
                                            <Download className="w-5 h-5" />
                                            <span>Download File</span>
                                        </a>
                                        <a
                                            href={fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center space-x-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all font-medium"
                                        >
                                            <ExternalLink className="w-5 h-5" />
                                            <span>Open in New Tab</span>
                                        </a>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
                                        File Type: {fileExtension}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttachmentModal;