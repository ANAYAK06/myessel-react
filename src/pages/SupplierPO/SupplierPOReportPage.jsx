import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import clsx from 'clsx';
import { 
    Building2,
    FileText,
    Download,
    RotateCcw,
    Eye,
    Search,
    AlertTriangle,
    FileSpreadsheet,
    Info,
    Calendar,
    TrendingUp,
    DollarSign,
    X,
    Filter,
    RefreshCw,
    ChevronRight,
    Activity,
    ShoppingCart,
    Package,
    Users,
    Printer,
    FileDown,
    IndianRupee
} from 'lucide-react';
import { toast } from 'react-toastify';

// Import slice actions and selectors
import {
    fetchSupplierCC,
    fetchSupplierDCA,
    fetchSupplierVendor,
    fetchSupplierPOForReport,
    fetchSupplierPObyPO,
    setFilters,
    clearFilters,
    resetReportData,
    resetDependentDropdowns,
    resetVendorDropdown,
    setDCACode, // NEW: Proper DCA handling
    clearError,
    selectSupplierCostCenters,
    selectSupplierDCACodes,
    selectSupplierVendors,
    selectSupplierPOReport,
    selectSupplierPODetails,
    selectLoading,
    selectErrors,
    selectFilters,
    selectIsAnyLoading,
    selectCanFetchCostCenters,
    selectCanFetchDCACodes,
    selectCanFetchVendors,
    selectCanGenerateReport,
    selectReportSummary,
    
} from '../../slices/supplierPOSlice/supplierReportSlice';

// Import budget slice for financial years
import {
    fetchAllFinancialYears,
    selectAllFinancialYears
} from '../../slices/budgetSlice/budgetReportSlice';

// Utility functions for date handling
const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '0.00';
    return new Intl.NumberFormat('en-IN', {
        style: 'decimal',
        minimumFractionDigits: 2
    }).format(amount);
};

// Tooltip Component
const Tooltip = ({ children, content }) => {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <div 
            className="relative inline-block"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            {children}
            {showTooltip && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded-lg shadow-lg whitespace-nowrap z-50">
                    {content}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                </div>
            )}
        </div>
    );
};

// Modal Component
const Modal = ({ isOpen, onClose, title, children, size = 'xl' }) => {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-4xl',
        xl: 'max-w-6xl',
        full: 'max-w-7xl'
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>
                
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                
                <div className={clsx(
                    "inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full",
                    sizeClasses[size]
                )}>
                    <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                {title}
                            </h3>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ENHANCED Professional Purchase Order Print Component
const PurchaseOrderPrint = ({ poData, onClose }) => {
    const printRef = useRef();

    const handlePrint = () => {
        const printContent = printRef.current;
        const winPrint = window.open('', '', 'left=0,top=0,width=800,height=600,toolbar=0,scrollbars=0,status=0');
        
        winPrint.document.write(`
            <html>
                <head>
                    <title>Purchase Order - ${poData?.PONo}</title>
                    <style>
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        
                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            margin: 0;
                            padding: 20px;
                            background: white;
                            color: #333;
                            line-height: 1.4;
                        }
                        
                        .po-container {
                            max-width: 210mm;
                            margin: 0 auto;
                            background: white;
                            box-shadow: 0 0 20px rgba(0,0,0,0.1);
                            border-radius: 8px;
                            overflow: hidden;
                        }
                        
                        .header {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            padding: 30px;
                            position: relative;
                        }
                        
                        .header::after {
                            content: '';
                            position: absolute;
                            bottom: 0;
                            left: 0;
                            right: 0;
                            height: 4px;
                            background: linear-gradient(90deg, #ff9a9e, #fecfef, #fecfef);
                        }
                        
                        .header-content {
                            display: flex;
                            justify-content: space-between;
                            align-items: flex-start;
                        }
                        
                        .company-section {
                            flex: 1;
                        }
                        
                        .company-logo {
                            width: 60px;
                            height: 60px;
                            background: rgba(255,255,255,0.2);
                            border-radius: 12px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            margin-bottom: 15px;
                            backdrop-filter: blur(10px);
                        }
                        
                        .company-name {
                            font-size: 28px;
                            font-weight: 700;
                            margin-bottom: 8px;
                            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        }
                        
                        .company-tagline {
                            font-size: 14px;
                            opacity: 0.9;
                            margin-bottom: 15px;
                            font-style: italic;
                        }
                        
                        .company-details {
                            font-size: 13px;
                            line-height: 1.6;
                            opacity: 0.95;
                        }
                        
                        .po-title-section {
                            text-align: right;
                            flex-shrink: 0;
                            margin-left: 30px;
                        }
                        
                        .po-title {
                            font-size: 32px;
                            font-weight: 800;
                            margin-bottom: 8px;
                            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        }
                        
                        .po-number {
                            background: rgba(255,255,255,0.2);
                            padding: 12px 20px;
                            border-radius: 25px;
                            font-size: 16px;
                            font-weight: 600;
                            backdrop-filter: blur(10px);
                        }
                        
                        .content {
                            padding: 30px;
                        }
                        
                        .info-grid {
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: 30px;
                            margin-bottom: 30px;
                        }
                        
                        .info-card {
                            background: #f8fafc;
                            border: 1px solid #e2e8f0;
                            border-radius: 12px;
                            padding: 20px;
                            position: relative;
                        }
                        
                        .info-card::before {
                            content: '';
                            position: absolute;
                            top: 0;
                            left: 0;
                            right: 0;
                            height: 3px;
                            background: linear-gradient(90deg, #667eea, #764ba2);
                            border-radius: 12px 12px 0 0;
                        }
                        
                        .info-card h3 {
                            color: #2d3748;
                            font-size: 16px;
                            font-weight: 600;
                            margin-bottom: 15px;
                            display: flex;
                            align-items: center;
                        }
                        
                        .info-card h3::before {
                            content: '';
                            width: 6px;
                            height: 6px;
                            background: #667eea;
                            border-radius: 50%;
                            margin-right: 8px;
                        }
                        
                        .info-row {
                            display: flex;
                            justify-content: space-between;
                            margin-bottom: 8px;
                            font-size: 14px;
                        }
                        
                        .info-label {
                            color: #64748b;
                            font-weight: 500;
                        }
                        
                        .info-value {
                            color: #1e293b;
                            font-weight: 600;
                        }
                        
                        .items-section {
                            margin: 30px 0;
                        }
                        
                        .section-title {
                            font-size: 20px;
                            font-weight: 700;
                            color: #2d3748;
                            margin-bottom: 20px;
                            display: flex;
                            align-items: center;
                        }
                        
                        .section-title::before {
                            content: '';
                            width: 4px;
                            height: 20px;
                            background: linear-gradient(135deg, #667eea, #764ba2);
                            margin-right: 12px;
                            border-radius: 2px;
                        }
                        
                        .items-table {
                            width: 100%;
                            border-collapse: collapse;
                            background: white;
                            border-radius: 12px;
                            overflow: hidden;
                            box-shadow: 0 4px 6px rgba(0,0,0,0.07);
                        }
                        
                        .items-table thead {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                        }
                        
                        .items-table th {
                            padding: 15px 12px;
                            text-align: left;
                            font-weight: 600;
                            font-size: 13px;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                        }
                        
                        .items-table td {
                            padding: 12px;
                            border-bottom: 1px solid #e2e8f0;
                            font-size: 13px;
                            color: #374151;
                        }
                        
                        .items-table tbody tr:hover {
                            background: #f8fafc;
                        }
                        
                        .items-table .text-right {
                            text-align: right;
                        }
                        
                        .items-table .text-center {
                            text-align: center;
                        }
                        
                        .total-row {
                            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                            font-weight: 700;
                            color: #1e293b;
                        }
                        
                        .total-row td {
                            border-bottom: none;
                            font-size: 16px;
                            padding: 18px 12px;
                        }
                        
                        .amount-highlight {
                            color: #059669;
                            font-weight: 700;
                        }
                        
                        .terms-section {
                            margin: 30px 0;
                            background: #f8fafc;
                            border: 1px solid #e2e8f0;
                            border-radius: 12px;
                            padding: 20px;
                        }
                        
                        .terms-content {
                            font-size: 13px;
                            line-height: 1.6;
                            color: #4b5563;
                        }
                        
                        .terms-content p {
                            margin-bottom: 6px;
                        }
                        
                        .signature-section {
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: 60px;
                            margin-top: 50px;
                            padding-top: 30px;
                            border-top: 2px solid #e2e8f0;
                        }
                        
                        .signature-box {
                            text-align: center;
                        }
                        
                        .signature-label {
                            font-weight: 600;
                            color: #374151;
                            margin-bottom: 40px;
                            font-size: 14px;
                        }
                        
                        .signature-line {
                            height: 2px;
                            background: linear-gradient(90deg, #667eea, #764ba2);
                            margin: 0 auto 10px;
                            width: 200px;
                            border-radius: 1px;
                        }
                        
                        .signature-name {
                            font-size: 12px;
                            color: #6b7280;
                            font-weight: 500;
                        }
                        
                        .footer {
                            background: #f8fafc;
                            padding: 20px 30px;
                            text-align: center;
                            font-size: 12px;
                            color: #6b7280;
                            border-top: 1px solid #e2e8f0;
                        }
                        
                        @media print {
                            body {
                                margin: 0;
                                padding: 0;
                                background: white;
                            }
                            
                            .po-container {
                                box-shadow: none;
                                border-radius: 0;
                                max-width: none;
                            }
                            
                            .header {
                                background: #667eea !important;
                                -webkit-print-color-adjust: exact;
                                color-adjust: exact;
                            }
                            
                            .items-table thead {
                                background: #667eea !important;
                                -webkit-print-color-adjust: exact;
                                color-adjust: exact;
                            }
                        }
                    </style>
                </head>
                <body>
                    ${printContent.innerHTML}
                </body>
            </html>
        `);
        
        winPrint.document.close();
        winPrint.focus();
        winPrint.print();
        winPrint.close();
    };

    const items = poData?.PODataList || [];

    return (
        <Modal isOpen={true} onClose={onClose} title="Purchase Order Print Preview" size="full">
            <div className="flex justify-end mb-4 space-x-2">
                <button
                    onClick={handlePrint}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 flex items-center gap-2 shadow-lg transition-all duration-300"
                >
                    <Printer className="h-5 w-5" />
                    Print Purchase Order
                </button>
                <button
                    onClick={onClose}
                    className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 shadow-lg transition-all duration-300"
                >
                    Close Preview
                </button>
            </div>
            
            <div ref={printRef} className="bg-white">
                <div className="po-container">
                    {/* Professional Header */}
                    <div className="header">
                        <div className="header-content">
                            <div className="company-section">
                                <div className="company-logo">
                                    <Building2 size={32} color="white" />
                                </div>
                                <div className="company-name">ESSEL PROJECTS PVT LTD</div>
                                <div className="company-tagline">Excellence in Construction & Infrastructure</div>
                                <div className="company-details">
                                    <div>6/D, Heavy Industrial Area, Hathkhoj</div>
                                    <div>Bhilai, Chhattisgarh - 490026</div>
                                    <div>GST No: {poData?.GstNo || '22AABCE7701Q1ZK'}</div>
                                    <div>Contact: {poData?.MobileNo || '+91 9898190247'}</div>
                                </div>
                            </div>
                            <div className="po-title-section">
                                <div className="po-title">PURCHASE ORDER</div>
                                <div className="po-number">PO # {poData?.PONo || 'N/A'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="content">
                        {/* Info Grid */}
                        <div className="info-grid">
                            {/* Order Information */}
                            <div className="info-card">
                                <h3>Order Information</h3>
                                <div className="info-row">
                                    <span className="info-label">PO Date:</span>
                                    <span className="info-value">{poData?.PODate || 'N/A'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Reference No:</span>
                                    <span className="info-value">{poData?.RefNo || 'Verbal'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Reference Date:</span>
                                    <span className="info-value">{poData?.RefDate || 'N/A'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Expire Date:</span>
                                    <span className="info-value">{poData?.POExpireDate || 'N/A'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Cost Center:</span>
                                    <span className="info-value">{poData?.CCCode || 'N/A'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">DCA Code:</span>
                                    <span className="info-value">{poData?.DCACode || 'N/A'}</span>
                                </div>
                            </div>

                            {/* Vendor Information */}
                            <div className="info-card">
                                <h3>Vendor Details</h3>
                                <div className="info-row">
                                    <span className="info-label">Vendor Name:</span>
                                    <span className="info-value">{poData?.VendorName || 'N/A'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Vendor Code:</span>
                                    <span className="info-value">{poData?.VendorCode || 'N/A'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">GST Number:</span>
                                    <span className="info-value">{poData?.VendorGST || 'N/A'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Contact Person:</span>
                                    <span className="info-value">{poData?.Contact || 'N/A'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Mobile:</span>
                                    <span className="info-value">{poData?.SiteMobileNo || 'N/A'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Address:</span>
                                    <span className="info-value">{poData?.VendorAddress || 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Items Section */}
                        <div className="items-section">
                            <h2 className="section-title">Order Items</h2>
                            <table className="items-table">
                                <thead>
                                    <tr>
                                        <th className="text-center">S.No</th>
                                        <th>Item Code</th>
                                        <th>Description</th>
                                        <th>Specification</th>
                                        <th className="text-center">HSN</th>
                                        <th className="text-center">Qty</th>
                                        <th className="text-center">Unit</th>
                                        <th className="text-right">Unit Price (₹)</th>
                                        <th className="text-right">Total (₹)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.length > 0 ? items.map((item, index) => (
                                        <tr key={index}>
                                            <td className="text-center">{index + 1}</td>
                                            <td>{item.itemcode || '-'}</td>
                                            <td>{item.itemname || '-'}</td>
                                            <td>{item.specification || '-'}</td>
                                            <td className="text-center">{item.HSNCode || '-'}</td>
                                            <td className="text-center">{item.quantity || 0}</td>
                                            <td className="text-center">{item.units || '-'}</td>
                                            <td className="text-right">₹{formatCurrency(item.NewBasicprice || item.basicprice || 0)}</td>
                                            <td className="text-right amount-highlight">₹{formatCurrency(item.Amount || 0)}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="9" style={{padding: '40px', textAlign: 'center', color: '#6b7280'}}>
                                                No items found for this purchase order
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                                <tfoot>
                                    <tr className="total-row">
                                        <td colSpan="8" className="text-right">
                                            <strong>TOTAL AMOUNT:</strong>
                                        </td>
                                        <td className="text-right">
                                            <strong className="amount-highlight">₹{formatCurrency(poData?.NewpricePOTotal || 0)}</strong>
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* Terms and Conditions */}
                        {poData?.Remarks && (
                            <div className="terms-section">
                                <h2 className="section-title">Terms & Conditions</h2>
                                <div className="terms-content">
                                    {poData.Remarks.split('\t|').map((term, index) => (
                                        <p key={index}>{term.trim()}</p>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Signature Section */}
                        <div className="signature-section">
                            <div className="signature-box">
                                <div className="signature-label">Vendor Acknowledgment</div>
                                <div className="signature-line"></div>
                                <div className="signature-name">Authorized Representative</div>
                            </div>
                            <div className="signature-box">
                                <div className="signature-label">Company Authorization</div>
                                <div className="signature-line"></div>
                                <div className="signature-name">{poData?.AuthorizedSign || 'ESSEL PROJECTS PVT LTD'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="footer">
                        This is a system-generated purchase order. Please retain for your records.
                        <br />
                        For any queries, contact our procurement department.
                    </div>
                </div>
            </div>
        </Modal>
    );
};

// PO Details Modal Component
const PODetailsModal = ({ isOpen, onClose, poData, loading }) => {
    const [showPrintModal, setShowPrintModal] = useState(false);

    const items = Array.isArray(poData?.Data?.PODataList) ? poData.Data.PODataList : 
                 Array.isArray(poData?.PODataList) ? poData.PODataList : [];

    const detailData = poData?.Data || poData || {};

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title="Purchase Order Details" size="full">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <RotateCcw className="h-6 w-6 text-indigo-500 animate-spin mr-3" />
                        <p className="text-indigo-700 dark:text-indigo-300">Loading PO details...</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-2 mb-4">
                            <button
                                onClick={() => setShowPrintModal(true)}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                            >
                                <Printer className="h-4 w-4" />
                                Print PO
                            </button>
                        </div>

                        {/* PO Header Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                            <div className="bg-gray-50 dark:bg-gray-700 dark:text-indigo-100 p-4 rounded-lg">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Basic Information</h4>
                                <p><strong>PO No:</strong> {detailData.PONo || '-'}</p>
                                <p><strong>PO Date:</strong> {detailData.PODate || '-'}</p>
                                <p><strong>Indent No:</strong> {detailData.IndentNo || '-'}</p>
                                <p><strong>Status:</strong> {detailData.Status || '-'}</p>
                            </div>
                            
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 dark:text-indigo-100 rounded-lg">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Vendor Information</h4>
                                <p><strong>Vendor:</strong> {detailData.VendorName || '-'}</p>
                                <p><strong>Code:</strong> {detailData.VendorCode || '-'}</p>
                                <p><strong>GST:</strong> {detailData.VendorGST || '-'}</p>
                                <p><strong>Contact:</strong> {detailData.Contact || '-'}</p>
                            </div>
                            
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 dark:text-indigo-100 rounded-lg">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Cost Center Details</h4>
                                <p><strong>CC Code:</strong> {detailData.CCCode || '-'}</p>
                                <p><strong>DCA Code:</strong> {detailData.DCACode || '-'}</p>
                                <p><strong>Total Amount:</strong> ₹{formatCurrency(detailData.NewpricePOTotal || 0)}</p>
                                <p><strong>Expire Date:</strong> {detailData.POExpireDate || '-'}</p>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="overflow-x-auto">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Item Details</h4>
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gradient-to-r from-indigo-600 to-purple-700">
                                    <tr>
                                        <th className="px-4 py-3 text-xs font-bold text-white uppercase">Item Code</th>
                                        <th className="px-4 py-3 text-xs font-bold text-white uppercase">Item Name</th>
                                        <th className="px-4 py-3 text-xs font-bold text-white uppercase">Specification</th>
                                        <th className="px-4 py-3 text-xs font-bold text-white uppercase">HSN Code</th>
                                        <th className="px-4 py-3 text-xs font-bold text-white uppercase text-right">Qty</th>
                                        <th className="px-4 py-3 text-xs font-bold text-white uppercase">Unit</th>
                                        <th className="px-4 py-3 text-xs font-bold text-white uppercase text-right">Unit Price</th>
                                        <th className="px-4 py-3 text-xs font-bold text-white uppercase text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {items.length > 0 ? items.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.itemcode || '-'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.itemname || '-'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.specification || '-'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.HSNCode || '-'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-right">{item.quantity || 0}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.units || '-'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-right font-medium">
                                                ₹{formatCurrency(item.NewBasicprice || item.basicprice || 0)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-right font-bold">
                                                ₹{formatCurrency(item.Amount || 0)}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="8" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                                No item details available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Remarks */}
                        {detailData.Remarks && (
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Terms & Conditions</h4>
                                <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                    {detailData.Remarks.replace(/\t\|/g, '\n')}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* Print Modal */}
            {showPrintModal && (
                <PurchaseOrderPrint
                    poData={detailData}
                    onClose={() => setShowPrintModal(false)}
                />
            )}
        </>
    );
};

// Summary Cards Component
const SummaryCards = ({ reportSummary }) => {
    const cards = [
        {
            title: 'Total POs',
            value: reportSummary.totalPOs,
            icon: FileText,
            color: 'from-indigo-500 to-cyan-600',
            bgColor: 'from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20',
            isCount: true
        },
        {
            title: 'Total Amount',
            value: reportSummary.totalAmount,
            icon: IndianRupee,
            color: 'from-green-500 to-emerald-600',
            bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
        },
        {
            title: 'Unique Vendors',
            value: reportSummary.uniqueVendors,
            icon: Users,
            color: 'from-purple-500 to-indigo-600',
            bgColor: 'from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20',
            isCount: true
        },
        {
            title: 'Avg Order Value',
            value: reportSummary.avgOrderValue,
            icon: TrendingUp,
            color: 'from-orange-500 to-red-600',
            bgColor: 'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 ">
            {cards.map((card, index) => (
                <div key={index} className={`bg-gradient-to-r ${card.bgColor} rounded-xl p-6 border border-gray-200 dark:border-gray-700`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                                {card.title}
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {card.isCount ? card.value : `₹${formatCurrency(card.value)}`}
                            </p>
                        </div>
                        <div className={`bg-gradient-to-r ${card.color} p-3 rounded-lg`}>
                            <card.icon className="h-6 w-6 text-white" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// Helper function to download data as Excel
const downloadAsExcel = (data, filename) => {
    try {
        const csvContent = convertToCSV(data);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error downloading Excel:', error);
        toast.error('Error downloading Excel file');
    }
};

const convertToCSV = (data) => {
    if (!Array.isArray(data) || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => 
            headers.map(header => {
                const value = row[header];
                return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
            }).join(',')
        )
    ].join('\n');
    
    return csvContent;
};

const SupplierPOReportPage = () => {
    const dispatch = useDispatch();
    
    // Get userData from auth state (includes UID and roleId)
    const { userData } = useSelector((state) => state.auth);
    const roleId = userData?.roleId || userData?.RID;
    const uid = userData?.UID || userData?.uid;
    
    // Redux selectors
    const supplierCostCenters = useSelector(selectSupplierCostCenters);
    const supplierDCACodes = useSelector(selectSupplierDCACodes);
    const supplierVendors = useSelector(selectSupplierVendors);
    const supplierPOReport = useSelector(selectSupplierPOReport);
    const supplierPODetails = useSelector(selectSupplierPODetails);
    const loading = useSelector(selectLoading);
    const errors = useSelector(selectErrors);
    const filters = useSelector(selectFilters);
    const isAnyLoading = useSelector(selectIsAnyLoading);
    const canFetchCostCenters = useSelector(selectCanFetchCostCenters);
    const canFetchDCACodes = useSelector(selectCanFetchDCACodes);
    const canFetchVendors = useSelector(selectCanFetchVendors);
    const canGenerateReport = useSelector(selectCanGenerateReport);
    const reportSummary = useSelector(selectReportSummary);
    
    // Financial years from budget slice
    const allFinancialYears = useSelector(selectAllFinancialYears) || [];

    // FIXED: Local state for form inputs with clear DCA/DCACode handling
    const [localFilters, setLocalFilters] = useState({
        Roleid: roleId || '',
        userid: uid || '',
        StoreStatus: '',
        CCCode: '',
        DCA: '', // Used for vendor fetching
        DCACode: '', // Used for report generation (same value as DCA)
        VendorCode: '',
        month: '', // Optional
        year: '',
        PONo: ''
    });

    // Modal state
    const [isPODetailsModalOpen, setIsPODetailsModalOpen] = useState(false);
    const [selectedPOData, setSelectedPOData] = useState(null);

    // ENHANCED: Local validation function - month is optional
    const canGenerateReportLocal = () => {
        const required = [
            localFilters.StoreStatus,
            localFilters.CCCode,
            localFilters.DCA || localFilters.DCACode,
            localFilters.VendorCode,
            localFilters.year
        ];
        
        const isValid = required.every(field => field && field.trim() !== '');
        console.log('🎯 Local Validation:', {
            StoreStatus: !!localFilters.StoreStatus,
            CCCode: !!localFilters.CCCode,
            DCA: !!(localFilters.DCA || localFilters.DCACode),
            VendorCode: !!localFilters.VendorCode,
            year: !!localFilters.year,
            month: !!localFilters.month + ' (optional)',
            isValid
        });
        return isValid;
    };

    // Load initial data
    useEffect(() => {
        dispatch(fetchAllFinancialYears());
    }, [dispatch]);

    // Update local filters when auth data changes
    useEffect(() => {
        console.log('👤 Auth Data:', { userData, roleId, uid });
        if (roleId && uid) {
            setLocalFilters(prev => ({
                ...prev,
                Roleid: roleId,
                userid: uid
            }));
        }
    }, [roleId, uid, userData]);

  

    // Show error messages via toast
    useEffect(() => {
        Object.entries(errors).forEach(([key, error]) => {
            if (error && error !== null) {
                console.error(`❌ Error in ${key}:`, error);
                toast.error(`Error with ${key}: ${error}`);
                dispatch(clearError({ errorType: key }));
            }
        });
    }, [errors, dispatch]);

 
const handleFilterChange = (filterName, value) => {
    console.log(`🔄 Filter Change: ${filterName} = ${value}`);
    
    // Handle cascading dropdowns with proper state preservation
    if (filterName === 'StoreStatus') {
        // Reset dependent data when store status changes
        dispatch(resetDependentDropdowns());
        const newFilters = {
            ...localFilters,
            StoreStatus: value,
            CCCode: '',
            DCA: '',
            DCACode: '',
            VendorCode: '',
            Roleid: localFilters.Roleid || roleId || '',
            userid: localFilters.userid || uid || ''
        };
        setLocalFilters(newFilters);
        dispatch(setFilters(newFilters));
        
    } else if (filterName === 'CCCode') {
        // Reset DCA and vendor when cost center changes
        dispatch(resetDependentDropdowns());
        const newFilters = {
            ...localFilters,
            CCCode: value,
            DCA: '',
            DCACode: '',
            VendorCode: '',
            Roleid: localFilters.Roleid || roleId || '',
            userid: localFilters.userid || uid || ''
        };
        setLocalFilters(newFilters);
        dispatch(setFilters(newFilters));
        
    } else if (filterName === 'DCA') {
        // ✅ FIXED: Only reset vendor, preserve StoreStatus and CCCode
        const newFilters = {
            ...localFilters,
            DCA: value,
            DCACode: value, // Keep both in sync
            VendorCode: '', // Reset only vendor
            Roleid: localFilters.Roleid || roleId || '',
            userid: localFilters.userid || uid || ''
            // ✅ StoreStatus and CCCode are preserved from localFilters
        };
        setLocalFilters(newFilters);
        dispatch(setFilters(newFilters)); // Update Redux with complete state
        dispatch(resetVendorDropdown()); // Reset vendor dropdown data
        
    } else {
        // For all other filter changes (VendorCode, month, year, etc.)
        const newFilters = {
            ...localFilters,
            [filterName]: value,
            Roleid: localFilters.Roleid || roleId || '',
            userid: localFilters.userid || uid || ''
        };
        setLocalFilters(newFilters);
        dispatch(setFilters(newFilters));
    }

    // Reset report data when any filter changes
    dispatch(resetReportData());
};
    // FIXED: Load cost centers when store status, roleId, and userid are available
    useEffect(() => {
        if (localFilters.StoreStatus && localFilters.Roleid && localFilters.userid) {
            const params = {
                Roleid: localFilters.Roleid,
                userid: localFilters.userid,
                StoreStatus: localFilters.StoreStatus
            };
            console.log('🏢 Fetching Cost Centers with params:', params);
            dispatch(fetchSupplierCC(params));
        }
    }, [localFilters.StoreStatus, localFilters.Roleid, localFilters.userid, dispatch]);

    // Load DCA codes when cost center is selected
    useEffect(() => {
        if (localFilters.CCCode) {
            const params = { CCCode: localFilters.CCCode };
            console.log('📋 Fetching DCA codes with params:', params);
            dispatch(fetchSupplierDCA(params));
        }
    }, [localFilters.CCCode, dispatch]);

    // FIXED: Load vendors when both cost center and DCA are selected
    useEffect(() => {
        if (localFilters.CCCode && localFilters.DCA) {
            const params = {
                CCCode: localFilters.CCCode,
                DCA: localFilters.DCA // Use DCA for vendor fetching
            };
            console.log('🏪 Fetching Vendors with params:', params);
            dispatch(fetchSupplierVendor(params));
        }
    }, [localFilters.CCCode, localFilters.DCA, dispatch]);

    // ENHANCED: Handle generate report with Select All and optional month
    const handleGenerateReport = async () => {
        const canGenerate = canGenerateReportLocal();
        
        if (!canGenerate) {
            toast.warning('Please fill all required fields to generate report (Store Status, Cost Center, DCA Code, Vendor, and Financial Year are required. Month is optional)');
            return;
        }

        try {
            dispatch(setFilters(localFilters));
            
            const params = {
                CCCode: localFilters.CCCode,
                DCACode: localFilters.DCACode || localFilters.DCA,
                VendorCode: localFilters.VendorCode, // Can be 'Select All'
                month: localFilters.month || '', // Optional - can be empty
                year: localFilters.year // Can be 'Any Year'
            };
            
            console.log('📊 Generating report with params:', params);
            await dispatch(fetchSupplierPOForReport(params)).unwrap();
            toast.success('Supplier PO report generated successfully');
            
        } catch (error) {
            console.error('❌ Error generating report:', error);
            toast.error('Failed to generate report. Please try again.');
        }
    };

    // Handle reset
    const handleReset = () => {
        setLocalFilters({
            Roleid: roleId || '',
            userid: uid || '',
            StoreStatus: '',
            CCCode: '',
            DCA: '',
            DCACode: '',
            VendorCode: '',
            month: '',
            year: '',
            PONo: ''
        });
        dispatch(clearFilters());
        dispatch(resetReportData());
    };

    // Handle row click to view PO details
    const handleRowClick = async (rowData) => {
        try {
            setSelectedPOData(rowData);
            setIsPODetailsModalOpen(true);
            
            if (rowData.PONo) {
                const params = { PONo: rowData.PONo };
                await dispatch(fetchSupplierPObyPO(params)).unwrap();
            }
            
        } catch (error) {
            console.error('❌ Error fetching PO details:', error);
            toast.error('Failed to load PO details');
            setIsPODetailsModalOpen(false);
        }
    };

    // ENHANCED: Handle Excel download with Select All support
    const handleExcelDownload = () => {
        try {
            const data = supplierPOReport?.Data || [];
            if (!Array.isArray(data) || data.length === 0) {
                toast.warning('No data available to download');
                return;
            }

            const excelData = data.map(item => ({
                'PO Number': item.PONo || '-',
                'PO Date': item.PODate || '-',
                'Vendor Name': item.VendorName || '-',
                'Vendor Code': item.VendorCode || '-',
                'Cost Center': item.CCCode || '-',
                'DCA Code': item.DCACode || '-',
                'Total Amount': item.NewpricePOTotal || 0,
                'Status': item.Status || '-',
                'Indent No': item.IndentNo || '-'
            }));

            const vendorText = localFilters.VendorCode === 'Select All' ? 'AllVendors' : localFilters.VendorCode;
            const monthText = localFilters.month ? `Month${localFilters.month}` : 'AllMonths';
            const filename = `Supplier_PO_Report_${localFilters.CCCode}_${vendorText}_${monthText}_${localFilters.year}_${new Date().toISOString().split('T')[0]}`;
            downloadAsExcel(excelData, filename);
            toast.success('Excel file downloaded successfully');
            
        } catch (error) {
            console.error('❌ Excel Download Error:', error);
            toast.error('Excel download failed. Please try again.');
        }
    };

    // Get report data for display
    const reportData = supplierPOReport?.Data || [];

    // Month options
    const monthOptions = [
        { value: '1', label: 'January' },
        { value: '2', label: 'February' },
        { value: '3', label: 'March' },
        { value: '4', label: 'April' },
        { value: '5', label: 'May' },
        { value: '6', label: 'June' },
        { value: '7', label: 'July' },
        { value: '8', label: 'August' },
        { value: '9', label: 'September' },
        { value: '10', label: 'October' },
        { value: '11', label: 'November' },
        { value: '12', label: 'December' }
    ];

    return (
        <div className="space-y-6 p-6">
            {/* Page Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <ShoppingCart className="h-8 w-8 text-indigo-600" />
                            Supplier PO Report
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Generate and analyze supplier purchase order reports with detailed breakdowns
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 text-indigo-800 dark:text-indigo-200 text-sm rounded-full transition-colors">
                            Purchase Reports
                        </div>
                        {isAnyLoading && (
                            <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                <span className="text-sm">Loading...</span>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Breadcrumb */}
                <nav className="text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-2">
                        <span>Dashboard</span>
                        <ChevronRight className="w-4 h-4" />
                        <span>Reports</span>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-gray-900 dark:text-white">Supplier PO Report</span>
                    </div>
                </nav>
            </div>

            {/* Filters Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    {/* Store Status */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Store Status <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={localFilters.StoreStatus}
                            onChange={(e) => handleFilterChange('StoreStatus', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-colors"
                        >
                            <option value="">Select Store Status</option>
                            <option value="Active">Active</option>
                            <option value="Closed">Closed</option>
                        </select>
                    </div>

                    {/* Cost Center */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Cost Center <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={localFilters.CCCode}
                            onChange={(e) => handleFilterChange('CCCode', e.target.value)}
                            disabled={loading.supplierCostCenters || !localFilters.StoreStatus}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <option value="">Select Cost Center</option>
                            {Array.isArray(supplierCostCenters?.Data) && supplierCostCenters.Data.map((cc, index) => {
                                const ccCode = cc?.CC_Code || cc?.costCenterCode || cc?.code;
                                const ccName = cc?.CC_Name || cc?.costCenterName || cc?.name;
                                
                                if (!ccCode) return null;
                                
                                return (
                                    <option key={ccCode || index} value={ccCode}>
                                        {ccName || ccCode}
                                    </option>
                                );
                            })}
                        </select>
                        
                        {loading.supplierCostCenters && (
                            <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-2">
                                Loading cost centers...
                            </p>
                        )}
                    </div>

                    {/* DCA Code */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            DCA Code <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={localFilters.DCA}
                            onChange={(e) => handleFilterChange('DCA', e.target.value)}
                            disabled={loading.supplierDCACodes || !localFilters.CCCode}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <option value="">Select DCA Code</option>
                            {Array.isArray(supplierDCACodes?.Data) && supplierDCACodes.Data.map((dca, index) => {
                                const dcaCode = dca?.DCACode || dca?.dcaCode || dca?.code;
                                const dcaName = dca?.DCAName || dca?.dcaName || dca?.name;
                                
                                if (!dcaCode) return null;
                                
                                return (
                                    <option key={dcaCode || index} value={dcaCode}>
                                        {dcaName || dcaCode}
                                    </option>
                                );
                            })}
                        </select>
                        
                        {loading.supplierDCACodes && (
                            <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-2">
                                Loading DCA codes...
                            </p>
                        )}
                    </div>

                    {/* ENHANCED: Vendor with Select All option */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Vendor <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={localFilters.VendorCode}
                            onChange={(e) => handleFilterChange('VendorCode', e.target.value)}
                            disabled={loading.supplierVendors || !localFilters.DCA}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <option value="">Select Vendor</option>
                            <option value="SelectAll" className="font-semibold text-indigo-600">
                                📊 Select All Vendors
                            </option>
                            {Array.isArray(supplierVendors?.Data) && supplierVendors.Data.map((vendor, index) => {
                                const vendorCode = vendor?.VendorCode || vendor?.vendorCode || vendor?.code;
                                const vendorName = vendor?.VendorName || vendor?.vendorName || vendor?.name;
                                
                                if (!vendorCode) return null;
                                
                                return (
                                    <option key={vendorCode || index} value={vendorCode}>
                                        {vendorName || vendorCode}
                                    </option>
                                );
                            })}
                        </select>
                        
                        {loading.supplierVendors && (
                            <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-2">
                                Loading vendors...
                            </p>
                        )}
                        
                        {localFilters.VendorCode === 'Select All' && (
                            <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-medium">
                                ✅ All vendors selected for this DCA code
                            </p>
                        )}
                    </div>

                    {/* ENHANCED: Month - Clearly marked as optional */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Month <span className="text-gray-400 font-normal">(Optional)</span>
                        </label>
                        <select
                            value={localFilters.month}
                            onChange={(e) => handleFilterChange('month', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-colors"
                        >
                            <option value="" className="font-semibold text-indigo-600">📅 All Months</option>
                            {monthOptions.map((month) => (
                                <option key={month.value} value={month.value}>
                                    {month.label}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Leave empty to include all months in the selected year
                        </p>
                    </div>

                    {/* ENHANCED: Financial Year with Any Year option */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Financial Year <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={localFilters.year}
                            onChange={(e) => handleFilterChange('year', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-colors"
                        >
                            <option value="">Select Financial Year</option>
                            <option value="Any Year" className="font-semibold text-indigo-600">
                                🌐 Any Year (All Years)
                            </option>
                            {Array.isArray(allFinancialYears?.Data) && allFinancialYears.Data.map((year, index) => {
                                const yearValue = year?.Year || year?.financialYear || year?.year;
                                const yearName = year?.YearName || year?.yearName || yearValue;
                                
                                if (!yearValue) return null;
                                
                                return (
                                    <option key={yearValue || index} value={yearValue}>
                                        {yearName || yearValue}
                                    </option>
                                );
                            })}
                        </select>
                        
                        {localFilters.year === 'Any Year' && (
                            <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-medium">
                                ✅ All financial years selected
                            </p>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex gap-3">
                        <button
                            onClick={handleGenerateReport}
                            disabled={isAnyLoading || !canGenerateReportLocal()}
                            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            {loading.supplierPOReport ? (
                                <RotateCcw className="h-5 w-5 animate-spin" />
                            ) : (
                                <Activity className="h-5 w-5" />
                            )}
                            Generate Report
                        </button>
                        <button
                            onClick={handleReset}
                            className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            <RotateCcw className="h-5 w-5" />
                            Reset
                        </button>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Export:</span>
                        
                        {/* Excel Download Button */}
                        <Tooltip content="Download supplier PO report as Excel file">
                            <button
                                onClick={handleExcelDownload}
                                disabled={!Array.isArray(reportData) || reportData.length === 0}
                                className="px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                <Download className="h-5 w-5" />
                                Excel
                            </button>
                        </Tooltip>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            {Array.isArray(reportData) && reportData.length > 0 && (
                <SummaryCards reportSummary={reportSummary} />
            )}

            {/* Report Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
                {Array.isArray(reportData) && reportData.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gradient-to-r from-indigo-600 to-purple-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">PO Number</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">PO Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Vendor Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Cost Center</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">DCA Code</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Total Amount</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {reportData.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                            {item.PONo || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {item.PODate || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                            <div className="max-w-xs truncate" title={item.VendorName}>
                                                {item.VendorName || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {item.CCCode || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {item.DCACode || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-bold">
                                            <span className="text-green-600 dark:text-green-400">
                                                ₹{formatCurrency(item.NewpricePOTotal || 0)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            <span className={clsx(
                                                "px-2 py-1 rounded-full text-xs font-medium",
                                                item.Status === 'Approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                item.Status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                                'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                            )}>
                                                {item.Status || 'Unknown'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <button
                                                onClick={() => handleRowClick(item)}
                                                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                                            >
                                                <Eye className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <>
                        {/* Empty State */}
                        {!loading.supplierPOReport && (
                            <div className="p-12 text-center">
                                <div className="flex flex-col items-center">
                                    <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full p-4 mb-4">
                                        <FileText className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Supplier PO Report Data Found</h3>
                                    <p className="text-gray-600 dark:text-gray-400 max-w-md">
                                        Select store status, cost center, DCA code, vendor, and financial year, then click "Generate Report" to view supplier PO data.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Loading State */}
                        {loading.supplierPOReport && (
                            <div className="p-12 text-center">
                                <div className="flex flex-col items-center">
                                    <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full p-4 mb-4">
                                        <RotateCcw className="h-12 w-12 text-indigo-500 animate-spin" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Generating Supplier PO Report</h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Fetching supplier purchase order data for the selected criteria...
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* PO Details Modal */}
            <PODetailsModal
                isOpen={isPODetailsModalOpen}
                onClose={() => setIsPODetailsModalOpen(false)}
                poData={supplierPODetails}
                loading={loading.supplierPODetails}
            />

            {/* ENHANCED: Information Note with debug info */}
            <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                    <Info className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <div className="text-indigo-800 dark:text-indigo-200 text-sm">
                        <p className="font-semibold mb-1">✨ Enhanced Supplier PO Report Features:</p>
                        <p className="text-gray-600 dark:text-indigo-200">
                            1. <strong>✅ Month is Optional:</strong> Leave empty for all months<br/>
                            2. <strong>🌐 Year Options:</strong> Select specific year or "Any Year" for all years<br/>
                            3. <strong>📊 Vendor Options:</strong> Select specific vendor or "Select All" for all vendors<br/>
                            4. <strong>🔄 Loading States:</strong> Visual feedback while fetching data<br/>
                            5. <strong>Debug:</strong> DCA={localFilters.DCA}, DCACode={localFilters.DCACode}, Vendor={localFilters.VendorCode || 'None'}<br/>
                            6. <strong>Validation:</strong> {canGenerateReportLocal() ? '✅ Ready to Generate' : '❌ Missing Required Fields'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Error Display */}
            {Object.values(errors).some(error => error) && (
                <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-center">
                        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
                        <span className="text-red-800 dark:text-red-200 text-sm">
                            {Object.values(errors).find(error => error)}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupplierPOReportPage;