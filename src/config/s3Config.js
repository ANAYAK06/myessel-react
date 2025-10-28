// src/config/s3Config.js

/**
 * S3 Bucket Configuration
 * Central configuration for all S3 file paths
 */

// S3 Base URL
export const S3_BASE_URL = 'https://sltouch-rdsbackup-bucket.s3.us-east-2.amazonaws.com';

// Upload docs base path
export const UPLOAD_DOCS_PATH = 'Upload+docs';

// Module-specific folder names
export const S3_FOLDERS = {
    CC_BUDGET_AMENDMENT: 'AmendCCBudgetPROD',
    PURCHASE_ORDER: 'PurchaseOrders',
    SUPPLIER_PO: 'SupplierPO',
    STAFF_DOCUMENTS: 'StaffDocuments',
    LEAVE_ATTACHMENTS: 'LeaveAttachments',
    // Add more folders as needed
};

/**
 * Build complete S3 URL
 * @param {string} folderName - Folder name from S3_FOLDERS
 * @param {string} filePath - File path/name from API
 * @returns {string} Complete S3 URL
 */
export const buildS3Url = (folderName, filePath) => {
    if (!filePath) return null;
    
    // If already a full URL, return as is
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        return filePath;
    }
    
    // Remove leading slash if present
    const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
    
    // Construct: S3_BASE_URL + UPLOAD_DOCS_PATH + FOLDER + FILE_PATH
    return `${S3_BASE_URL}/${UPLOAD_DOCS_PATH}/${folderName}/${cleanPath}`;
};

/**
 * Module-specific helper functions
 */
export const buildCCBudgetAmendmentUrl = (filePath) => {
    return buildS3Url(S3_FOLDERS.CC_BUDGET_AMENDMENT, filePath);
};

export const buildPurchaseOrderUrl = (filePath) => {
    return buildS3Url(S3_FOLDERS.PURCHASE_ORDER, filePath);
};

export const buildSupplierPOUrl = (filePath) => {
    return buildS3Url(S3_FOLDERS.SUPPLIER_PO, filePath);
};

export const buildStaffDocumentUrl = (filePath) => {
    return buildS3Url(S3_FOLDERS.STAFF_DOCUMENTS, filePath);
};

export const buildLeaveAttachmentUrl = (filePath) => {
    return buildS3Url(S3_FOLDERS.LEAVE_ATTACHMENTS, filePath);
};

/**
 * Get file name from path
 * @param {string} filePath - Full or partial file path
 * @returns {string} File name only
 */
export const getFileName = (filePath) => {
    if (!filePath) return '';
    return filePath.split('/').pop();
};

/**
 * Check if file is an image
 * @param {string} filePath - File path or URL
 * @returns {boolean}
 */
export const isImageFile = (filePath) => {
    return /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(filePath);
};

/**
 * Check if file is a PDF
 * @param {string} filePath - File path or URL
 * @returns {boolean}
 */
export const isPdfFile = (filePath) => {
    return /\.pdf$/i.test(filePath);
};

/**
 * Get file extension
 * @param {string} filePath - File path or URL
 * @returns {string} File extension (without dot)
 */
export const getFileExtension = (filePath) => {
    if (!filePath) return '';
    const parts = filePath.split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : '';
};

export default {
    S3_BASE_URL,
    UPLOAD_DOCS_PATH,
    S3_FOLDERS,
    buildS3Url,
    buildCCBudgetAmendmentUrl,
    buildPurchaseOrderUrl,
    buildSupplierPOUrl,
    buildStaffDocumentUrl,
    buildLeaveAttachmentUrl,
    getFileName,
    isImageFile,
    isPdfFile,
    getFileExtension
};