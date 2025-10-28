// AttachmentModal.jsx - Reusable Attachment Viewer Modal
import React from 'react';
import { FileDown, X } from 'lucide-react';

/**
 * AttachmentModal Component
 * 
 * A modal for viewing and downloading attachments (images, PDFs, and other files).
 * Automatically detects file type and renders appropriate viewer.
 * 
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Close handler
 * @param {string} fileUrl - URL of the file to display
 * @param {string} fileName - Optional file name for download
 * @param {string} title - Modal title (default: "Supporting Document")
 * @param {function} isImageFile - Function to check if file is an image
 * @param {function} isPdfFile - Function to check if file is a PDF
 */

const AttachmentModal = ({
    isOpen = false,
    onClose,
    fileUrl,
    fileName = 'document',
    title = 'Supporting Document',
    isImageFile,
    isPdfFile,
    className = ''
}) => {
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

    // Handle backdrop click
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
            onClick={handleBackdropClick}
        >
            <div className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden ${className}`}>
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-indigo-50 dark:from-indigo-900/20 dark:to-indigo-900/20">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                        <FileDown className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                        {title}
                    </h3>
                    <div className="flex items-center space-x-2">
                        {/* Download Button */}
                        <a
                            href={fileUrl}
                            download={fileName}
                            className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-1"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <FileDown className="w-4 h-4" />
                            <span>Download</span>
                        </a>
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            title="Close (ESC)"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Modal Body */}
                <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
                    {isImage ? (
                        // Image Viewer
                        <div className="flex items-center justify-center">
                            <img
                                src={fileUrl}
                                alt={fileName || 'Attachment'}
                                className="max-w-full h-auto rounded-lg shadow-lg"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3Ctext fill="%23666" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3EImage not available%3C/text%3E%3C/svg%3E';
                                }}
                            />
                        </div>
                    ) : isPdf ? (
                        // PDF Viewer
                        <iframe
                            src={fileUrl}
                            className="w-full h-[calc(90vh-120px)] rounded-lg border border-gray-300 dark:border-gray-600"
                            title="PDF Viewer"
                        />
                    ) : (
                        // Generic File (Download Only)
                        <div className="text-center py-12">
                            <FileDown className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Preview not available for this file type
                            </p>
                            <a
                                href={fileUrl}
                                download={fileName}
                                className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                <FileDown className="w-4 h-4" />
                                <span>Download File</span>
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AttachmentModal;