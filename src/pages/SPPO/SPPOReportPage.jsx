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
    IndianRupee,
    History,
    Plus,
    CheckCircle,
    XCircle,
    Clock,
    Scale
} from 'lucide-react';
import { toast } from 'react-toastify';

// Import SPPO slice actions and selectors
import {
    fetchCCForSPPOCloseByVendor,
    fetchDCAForPOReport,
    fetchVendorsForSPPOReport,
    fetchSPPOReportData,
    fetchSPPOForPrint,
    setFilters,
    clearFilters,
    resetReportData,
    resetDependentDropdowns,
    resetVendorDropdown,
    setDCACode,
    setStatus,
    clearError,
    selectSPPOCostCenters,
    selectSPPODCACodes,
    selectSPPOVendors,
    selectSPPOReportData,
    selectSPPOPrintData,
    selectLoading,
    selectErrors,
    selectFilters,
    selectIsAnyLoading,
    selectCanFetchCostCenters,
    selectCanFetchDCACodes,
    selectCanFetchVendors,
    selectCanGenerateReport,
    selectSPPOReportSummary,
} from '../../slices/spPOSlice/spPOReportSlice';

// Import budget slice for financial years
import {
    fetchAllFinancialYears,
    selectAllFinancialYears
} from '../../slices/budgetSlice/budgetReportSlice';

// Utility functions
const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '0.00';
    return new Intl.NumberFormat('en-IN', {
        style: 'decimal',
        minimumFractionDigits: 2
    }).format(amount);
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB');
    } catch {
        return dateString;
    }
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

// SPPO Print Component
const SPPOPrint = ({ sppoData, onClose }) => {
    const printRef = useRef();

    const handlePrint = () => {
        const printContent = printRef.current;
        const winPrint = window.open('', '', 'left=0,top=0,width=800,height=600,toolbar=0,scrollbars=0,status=0');
        
        winPrint.document.write(`
            <html>
                <head>
                    <title>SPPO - ${sppoData?.InitialPOData?.SPPONo}</title>
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: white; color: #333; line-height: 1.4; }
                        .sppo-container { max-width: 210mm; margin: 0 auto; background: white; box-shadow: 0 0 20px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; position: relative; }
                        .header::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #ff9a9e, #fecfef, #fecfef); }
                        .header-content { display: flex; justify-content: space-between; align-items: flex-start; }
                        .company-section { flex: 1; }
                        .company-logo { width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 15px; backdrop-filter: blur(10px); }
                        .company-name { font-size: 28px; font-weight: 700; margin-bottom: 8px; text-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                        .company-tagline { font-size: 14px; opacity: 0.9; margin-bottom: 15px; font-style: italic; }
                        .company-details { font-size: 13px; line-height: 1.6; opacity: 0.95; }
                        .sppo-title-section { text-align: right; flex-shrink: 0; margin-left: 30px; }
                        .sppo-title { font-size: 32px; font-weight: 800; margin-bottom: 8px; text-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                        .sppo-number { background: rgba(255,255,255,0.2); padding: 12px 20px; border-radius: 25px; font-size: 16px; font-weight: 600; backdrop-filter: blur(10px); }
                        .content { padding: 30px; }
                        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
                        .info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; position: relative; }
                        .info-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #667eea, #764ba2); border-radius: 12px 12px 0 0; }
                        .info-card h3 { color: #2d3748; font-size: 16px; font-weight: 600; margin-bottom: 15px; display: flex; align-items: center; }
                        .info-card h3::before { content: ''; width: 6px; height: 6px; background: #667eea; border-radius: 50%; margin-right: 8px; }
                        .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
                        .info-label { color: #64748b; font-weight: 500; }
                        .info-value { color: #1e293b; font-weight: 600; }
                        .items-section { margin: 30px 0; }
                        .section-title { font-size: 20px; font-weight: 700; color: #2d3748; margin-bottom: 20px; display: flex; align-items: center; }
                        .section-title::before { content: ''; width: 4px; height: 20px; background: linear-gradient(135deg, #667eea, #764ba2); margin-right: 12px; border-radius: 2px; }
                        .items-table { width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.07); }
                        .items-table thead { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
                        .items-table th { padding: 15px 12px; text-align: left; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
                        .items-table td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #374151; }
                        .items-table tbody tr:hover { background: #f8fafc; }
                        .items-table .text-right { text-align: right; }
                        .items-table .text-center { text-align: center; }
                        .total-row { background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); font-weight: 700; color: #1e293b; }
                        .total-row td { border-bottom: none; font-size: 16px; padding: 18px 12px; }
                        .amount-highlight { color: #059669; font-weight: 700; }
                        .terms-section { margin: 30px 0; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; }
                        .terms-content { font-size: 13px; line-height: 1.6; color: #4b5563; }
                        .terms-content p { margin-bottom: 6px; }
                        .amendment-section { margin: 30px 0; background: #fef3c7; border: 1px solid #f59e0b; border-radius: 12px; padding: 20px; }
                        .amendment-item { background: white; border-radius: 8px; padding: 15px; margin-bottom: 10px; border-left: 4px solid #f59e0b; }
                        .signature-section { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; margin-top: 50px; padding-top: 30px; border-top: 2px solid #e2e8f0; }
                        .signature-box { text-align: center; }
                        .signature-label { font-weight: 600; color: #374151; margin-bottom: 40px; font-size: 14px; }
                        .signature-line { height: 2px; background: linear-gradient(90deg, #667eea, #764ba2); margin: 0 auto 10px; width: 200px; border-radius: 1px; }
                        .signature-name { font-size: 12px; color: #6b7280; font-weight: 500; }
                        .footer { background: #f8fafc; padding: 20px 30px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e2e8f0; }
                        @media print {
                            body { margin: 0; padding: 0; background: white; }
                            .sppo-container { box-shadow: none; border-radius: 0; max-width: none; }
                            .header { background: #667eea !important; -webkit-print-color-adjust: exact; color-adjust: exact; }
                            .items-table thead { background: #667eea !important; -webkit-print-color-adjust: exact; color-adjust: exact; }
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

    const initialData = sppoData?.InitialPOData || {};
    const amendData = sppoData?.SPPOAmendData || [];
    const items = sppoData?.POItems || [];

    // Parse terms and conditions
    const parseTermsAndConditions = (remarks) => {
        if (!remarks) return [];
        return remarks.split('|').filter(term => term.trim()).map(term => term.trim());
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="SPPO Print Preview" size="full">
            <div className="flex justify-end mb-4 space-x-2">
                <button
                    onClick={handlePrint}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 flex items-center gap-2 shadow-lg transition-all duration-300"
                >
                    <Printer className="h-5 w-5" />
                    Print SPPO
                </button>
                <button
                    onClick={onClose}
                    className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 shadow-lg transition-all duration-300"
                >
                    Close Preview
                </button>
            </div>
            
            <div ref={printRef} className="bg-white">
                <div className="sppo-container">
                    {/* Professional Header */}
                    <div className="header">
                        <div className="header-content">
                            <div className="company-section">
                                <div className="company-logo">
                                    {/* <Building2 size={32} color="white" /> */}
                                    <img src="/logo.jpg" alt="Company Logo" />
                                </div>
                                <div className="company-name">ESSEL PROJECTS PVT LTD</div>
                                <div className="company-tagline">Commited Towards Quality, Safety and Customer Satisfaction</div>
                                <div className="company-details">
                                    <div>6/D, Heavy Industrial Area, Hathkhoj</div>
                                    <div>Bhilai, Chhattisgarh - 490026</div>
                                    <div>Contact: +91 9898190247</div>
                                </div>
                            </div>
                            <div className="sppo-title-section">
                                <div className="sppo-title">PURCHASE ORDER</div>
                                <div className="sppo-number">PO # {initialData.SPPONo || 'N/A'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="content">
                        {/* Info Grid */}
                        <div className="info-grid">
                            {/* Order Information */}
                            <div className="info-card">
                                <h3>SPPO Information</h3>
                                <div className="info-row">
                                    <span className="info-label">SPPO No:</span>
                                    <span className="info-value">{initialData.SPPONo || 'N/A'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Start Date:</span>
                                    <span className="info-value">{initialData.SPPOStartDate || 'N/A'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">End Date:</span>
                                    <span className="info-value">{initialData.SPPOEndDate || 'N/A'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Cost Center:</span>
                                    <span className="info-value">{initialData.CCCode || 'N/A'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">DCA Code:</span>
                                    <span className="info-value">{initialData.DCACode || 'N/A'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Sub DCA:</span>
                                    <span className="info-value">{initialData.SubDcaCode || 'N/A'}</span>
                                </div>
                            </div>

                            {/* Vendor Information */}
                            <div className="info-card">
                                <h3>Vendor Details</h3>
                                <div className="info-row">
                                    <span className="info-label">Vendor Name:</span>
                                    <span className="info-value">{initialData.VendorName || 'N/A'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Vendor Code:</span>
                                    <span className="info-value">{initialData.VendorCode || 'N/A'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Address:</span>
                                    <span className="info-value">{initialData.VendorAddress || 'N/A'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Phone:</span>
                                    <span className="info-value">{initialData.VendorPhoneNo || 'N/A'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Total Value:</span>
                                    <span className="info-value">₹{formatCurrency(initialData.TotalValue || 0)}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Balance:</span>
                                    <span className="info-value">₹{formatCurrency(initialData.Balance || 0)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Amendment History */}
                        {amendData && amendData.length > 0 && (
                            <div className="amendment-section">
                                <h2 className="section-title">Amendment History</h2>
                                {amendData.map((amend, index) => (
                                    <div key={index} className="amendment-item">
                                        <div className="info-row">
                                            <span className="info-label">Amendment Date:</span>
                                            <span className="info-value">{amend.AmendedDate}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">Added Amount:</span>
                                            <span className="info-value">₹{formatCurrency(amend.AddAmount || 0)}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">Remarks:</span>
                                            <span className="info-value">{amend.Remarks}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Items Section */}
                        <div className="items-section">
                            <h2 className="section-title">Order Items</h2>
                            <table className="items-table">
                                <thead>
                                    <tr>
                                        <th className="text-center">S.No</th>
                                        <th>Description</th>
                                        <th className="text-center">Unit</th>
                                        <th className="text-center">Qty</th>
                                        <th className="text-right">Rate (₹)</th>
                                        <th className="text-right">Amount (₹)</th>
                                        <th className="text-center">Type</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.length > 0 ? items.map((item, index) => (
                                        <tr key={index}>
                                            <td className="text-center">{index + 1}</td>
                                            <td>{item.Description || '-'}</td>
                                            <td className="text-center">{item.Unit || '-'}</td>
                                            <td className="text-center">{item.Quantity || 0}</td>
                                            <td className="text-right">₹{formatCurrency(item.Rate || 0)}</td>
                                            <td className="text-right amount-highlight">₹{formatCurrency(item.Amount || 0)}</td>
                                            <td className="text-center">{item.Type || '-'}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="7" style={{padding: '40px', textAlign: 'center', color: '#6b7280'}}>
                                                No items found for this SPPO
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                                <tfoot>
                                    <tr className="total-row">
                                        <td colSpan="5" className="text-right">
                                            <strong>TOTAL AMOUNT:</strong>
                                        </td>
                                        <td className="text-right">
                                            <strong className="amount-highlight">₹{formatCurrency(initialData.TotalValue || 0)}</strong>
                                        </td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* Terms and Conditions */}
                        {initialData.Remarks && (
                            <div className="terms-section">
                                <h2 className="section-title">Terms & Conditions</h2>
                                <div className="terms-content">
                                    {parseTermsAndConditions(initialData.Remarks).map((term, index) => (
                                        <p key={index}>{term}</p>
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
                                <div className="signature-name">ESSEL PROJECTS PVT LTD</div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="footer">
                        This is a system-generated SPPO. Please retain for your records.
                        <br />
                        For any queries, contact our procurement department.
                    </div>
                </div>
            </div>
        </Modal>
    );
};

// SPPO Details Modal Component
const SPPODetailsModal = ({ isOpen, onClose, sppoData, loading }) => {
    const [showPrintModal, setShowPrintModal] = useState(false);

    const initialData = sppoData?.Data?.InitialPOData || sppoData?.InitialPOData || {};
    const amendData = sppoData?.Data?.SPPOAmendData || sppoData?.SPPOAmendData || [];
    const items = sppoData?.Data?.POItems || sppoData?.POItems || [];

    // Parse terms and conditions
    const parseTermsAndConditions = (remarks) => {
        if (!remarks) return [];
        return remarks.split('|').filter(term => term.trim()).map(term => term.trim());
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title="SPPO Details" size="full">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <RotateCcw className="h-6 w-6 text-indigo-500 animate-spin mr-3" />
                        <p className="text-indigo-700 dark:text-indigo-300">Loading SPPO details...</p>
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
                                Print SPPO
                            </button>
                        </div>

                        {/* SPPO Header Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                            <div className="bg-gray-50 dark:bg-gray-700 dark:text-indigo-100 p-4 rounded-lg">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Basic Information</h4>
                                <p><strong>SPPO No:</strong> {initialData.SPPONo || '-'}</p>
                                <p><strong>Start Date:</strong> {initialData.SPPOStartDate || '-'}</p>
                                <p><strong>End Date:</strong> {initialData.SPPOEndDate || '-'}</p>
                                <p><strong>Status:</strong> {initialData.POStatus || '-'}</p>
                            </div>
                            
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 dark:text-indigo-100 rounded-lg">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Vendor Information</h4>
                                <p><strong>Vendor:</strong> {initialData.VendorName || '-'}</p>
                                <p><strong>Code:</strong> {initialData.VendorCode || '-'}</p>
                                <p><strong>Phone:</strong> {initialData.VendorPhoneNo || '-'}</p>
                                <p><strong>Address:</strong> {initialData.VendorAddress || '-'}</p>
                            </div>
                            
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 dark:text-indigo-100 rounded-lg">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Cost Center Details</h4>
                                <p><strong>CC Code:</strong> {initialData.CCCode || '-'}</p>
                                <p><strong>DCA Code:</strong> {initialData.DCACode || '-'}</p>
                                <p><strong>Sub DCA:</strong> {initialData.SubDcaCode || '-'}</p>
                                <p><strong>Total Value:</strong> ₹{formatCurrency(initialData.TotalValue || 0)}</p>
                                <p><strong>Balance:</strong> ₹{formatCurrency(initialData.Balance || 0)}</p>
                            </div>
                        </div>

                        {/* Amendment History */}
                        {amendData && amendData.length > 0 && (
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <History className="h-5 w-5 text-amber-600" />
                                    Amendment History ({amendData.length} amendments)
                                </h4>
                                <div className="space-y-3">
                                    {amendData.map((amend, index) => (
                                        <div key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                                                <div><strong>Date:</strong> {amend.AmendedDate}</div>
                                                <div><strong>Added Amount:</strong> ₹{formatCurrency(amend.AddAmount || 0)}</div>
                                                <div><strong>Subtract Amount:</strong> ₹{formatCurrency(amend.SubstractAmount || 0)}</div>
                                            </div>
                                            {amend.Remarks && (
                                                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                                    <strong>Remarks:</strong> {amend.Remarks}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Items Table */}
                        <div className="overflow-x-auto">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Item Details</h4>
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gradient-to-r from-indigo-600 to-purple-700">
                                    <tr>
                                        <th className="px-4 py-3 text-xs font-bold text-white uppercase">S.No</th>
                                        <th className="px-4 py-3 text-xs font-bold text-white uppercase">Description</th>
                                        <th className="px-4 py-3 text-xs font-bold text-white uppercase">Unit</th>
                                        <th className="px-4 py-3 text-xs font-bold text-white uppercase text-right">Quantity</th>
                                        <th className="px-4 py-3 text-xs font-bold text-white uppercase text-right">Rate</th>
                                        <th className="px-4 py-3 text-xs font-bold text-white uppercase text-right">Amount</th>
                                        <th className="px-4 py-3 text-xs font-bold text-white uppercase">Type</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {items.length > 0 ? items.map((item, index) => (
                                        <tr key={index} className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${item.Type === 'Amend' ? 'bg-amber-50 dark:bg-amber-900/10' : ''}`}>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{index + 1}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                                <div className="max-w-md">
                                                    {item.Description || '-'}
                                                    {item.Type === 'Amend' && (
                                                        <span className="ml-2 px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">
                                                            Amendment
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.Unit || '-'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-right">{item.Quantity || 0}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-right font-medium">
                                                ₹{formatCurrency(item.Rate || 0)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-right font-bold">
                                                ₹{formatCurrency(item.Amount || 0)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                                <span className={clsx(
                                                    "px-2 py-1 rounded-full text-xs font-medium",
                                                    item.Type === 'Direct' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                    item.Type === 'Amend' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' :
                                                    'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                                )}>
                                                    {item.Type || 'Direct'}
                                                </span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="7" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                                No item details available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Terms & Conditions */}
                        {initialData.Remarks && (
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Terms & Conditions</h4>
                                <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                                    {parseTermsAndConditions(initialData.Remarks).map((term, index) => (
                                        <p key={index} className="flex items-start gap-2">
                                            <span className="text-indigo-600 dark:text-indigo-400 mt-1">•</span>
                                            <span>{term}</span>
                                        </p>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* Print Modal */}
            {showPrintModal && (
                <SPPOPrint
                    sppoData={sppoData?.Data || sppoData}
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
            title: 'Total SPPOs',
            value: reportSummary.totalSPPOs,
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
            title: 'Balance Order Value',
            value: reportSummary.totalBalance,
            icon: Scale,
            color: 'from-orange-500 to-red-600',
            bgColor: 'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
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

const SPPOReportPage = () => {
    const dispatch = useDispatch();
    
    // Get userData from auth state
    const { userData } = useSelector((state) => state.auth);
    const roleId = userData?.roleId || userData?.RID;
    const uid = userData?.UID || userData?.uid;
    
    // Redux selectors
    const sppoCostCenters = useSelector(selectSPPOCostCenters);
    const sppoDCACodes = useSelector(selectSPPODCACodes);
    const sppoVendors = useSelector(selectSPPOVendors);
    const sppoReportData = useSelector(selectSPPOReportData);
    const sppoPrintData = useSelector(selectSPPOPrintData);
    const loading = useSelector(selectLoading);
    const errors = useSelector(selectErrors);
    const filters = useSelector(selectFilters);
    const isAnyLoading = useSelector(selectIsAnyLoading);
    const canFetchCostCenters = useSelector(selectCanFetchCostCenters);
    const canFetchDCACodes = useSelector(selectCanFetchDCACodes);
    const canFetchVendors = useSelector(selectCanFetchVendors);
    const canGenerateReport = useSelector(selectCanGenerateReport);
    const reportSummary = useSelector(selectSPPOReportSummary);
    
    // Financial years from budget slice
    const allFinancialYears = useSelector(selectAllFinancialYears) || [];

    // Local state for form inputs
    const [localFilters, setLocalFilters] = useState({
        Userid: uid || '',
        Roleid: roleId || '',
        CCStatusval: '',
        CCCode: '',
        DCA: '',
        DCACode: '',
        VendorCode: '',
        month: '',
        year: '',
        Status: '',
        SPPONO: ''
    });

    // Modal state
    const [isSPPODetailsModalOpen, setIsSPPODetailsModalOpen] = useState(false);
    const [selectedSPPOData, setSelectedSPPOData] = useState(null);

    // Local validation function
    const canGenerateReportLocal = () => {
        const required = [
            localFilters.CCStatusval,
            localFilters.CCCode,
            localFilters.DCA || localFilters.DCACode,
            localFilters.VendorCode,
            localFilters.year,
            localFilters.Status
        ];
        
        const isValid = required.every(field => field && field.trim() !== '');
        console.log('🎯 SPPO Local Validation:', {
            CCStatusval: !!localFilters.CCStatusval,
            CCCode: !!localFilters.CCCode,
            DCA: !!(localFilters.DCA || localFilters.DCACode),
            VendorCode: !!localFilters.VendorCode,
            year: !!localFilters.year,
            Status: !!localFilters.Status,
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
        if (roleId && uid) {
            setLocalFilters(prev => ({
                ...prev,
                Roleid: roleId,
                Userid: uid
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
        console.log(`🔄 SPPO Filter Change: ${filterName} = ${value}`);
        
        // Handle cascading dropdowns
        if (filterName === 'CCStatusval') {
            dispatch(resetDependentDropdowns());
            const newFilters = {
                ...localFilters,
                CCStatusval: value,
                CCCode: '',
                DCA: '',
                DCACode: '',
                VendorCode: '',
                Userid: localFilters.Userid || uid || '',
                Roleid: localFilters.Roleid || roleId || ''
            };
            setLocalFilters(newFilters);
            dispatch(setFilters(newFilters));
            
        } else if (filterName === 'CCCode') {
            dispatch(resetDependentDropdowns());
            const newFilters = {
                ...localFilters,
                CCCode: value,
                DCA: '',
                DCACode: '',
                VendorCode: '',
                Userid: localFilters.Userid || uid || '',
                Roleid: localFilters.Roleid || roleId || ''
            };
            setLocalFilters(newFilters);
            dispatch(setFilters(newFilters));
            
        } else if (filterName === 'DCA') {
            const newFilters = {
                ...localFilters,
                DCA: value,
                DCACode: value,
                VendorCode: '',
                Userid: localFilters.Userid || uid || '',
                Roleid: localFilters.Roleid || roleId || ''
            };
            setLocalFilters(newFilters);
            dispatch(setFilters(newFilters));
            dispatch(resetVendorDropdown());
            
        } else {
            const newFilters = {
                ...localFilters,
                [filterName]: value,
                Userid: localFilters.Userid || uid || '',
                Roleid: localFilters.Roleid || roleId || ''
            };
            setLocalFilters(newFilters);
            dispatch(setFilters(newFilters));
        }

        dispatch(resetReportData());
    };

    // Load cost centers when CC status, roleId, and userid are available
    useEffect(() => {
        if (localFilters.CCStatusval && localFilters.Roleid && localFilters.Userid) {
            const params = {
                Userid: localFilters.Userid,
                Roleid: localFilters.Roleid,
                CCStatusval: localFilters.CCStatusval
            };
            console.log('🏢 Fetching SPPO Cost Centers with params:', params);
            dispatch(fetchCCForSPPOCloseByVendor(params));
        }
    }, [localFilters.CCStatusval, localFilters.Roleid, localFilters.Userid, dispatch]);

    // Load DCA codes when cost center is selected
    useEffect(() => {
        if (localFilters.CCCode) {
            const params = { CCCode: localFilters.CCCode };
            console.log('📋 Fetching SPPO DCA codes with params:', params);
            dispatch(fetchDCAForPOReport(params));
        }
    }, [localFilters.CCCode, dispatch]);

    // Load vendors when both cost center and DCA are selected
    useEffect(() => {
        if (localFilters.CCCode && localFilters.DCA) {
            const params = {
                CCCode: localFilters.CCCode,
                DCA: localFilters.DCA
            };
            console.log('🏪 Fetching SPPO Vendors with params:', params);
            dispatch(fetchVendorsForSPPOReport(params));
        }
    }, [localFilters.CCCode, localFilters.DCA, dispatch]);

    // Handle generate report
    const handleGenerateReport = async () => {
        const canGenerate = canGenerateReportLocal();
        
        if (!canGenerate) {
            toast.warning('Please fill all required fields to generate SPPO report (CC Status, Cost Center, DCA Code, Vendor, Financial Year, and Status are required. Month is optional)');
            return;
        }

        try {
            dispatch(setFilters(localFilters));
            
            const params = {
                CCCode: localFilters.CCCode,
                DCACode: localFilters.DCACode || localFilters.DCA,
                VendorCode: localFilters.VendorCode,
                month: localFilters.month || '',
                year: localFilters.year,
                Status: localFilters.Status
            };
            
            console.log('📊 Generating SPPO report with params:', params);
            await dispatch(fetchSPPOReportData(params)).unwrap();
            toast.success('SPPO report generated successfully');
            
        } catch (error) {
            console.error('❌ Error generating SPPO report:', error);
            toast.error('Failed to generate SPPO report. Please try again.');
        }
    };

    // Handle reset
    const handleReset = () => {
        setLocalFilters({
            Userid: uid || '',
            Roleid: roleId || '',
            CCStatusval: '',
            CCCode: '',
            DCA: '',
            DCACode: '',
            VendorCode: '',
            month: '',
            year: '',
            Status: '',
            SPPONO: ''
        });
        dispatch(clearFilters());
        dispatch(resetReportData());
    };

    // Handle row click to view SPPO details
    const handleRowClick = async (rowData) => {
        try {
            setSelectedSPPOData(rowData);
            setIsSPPODetailsModalOpen(true);
            
            if (rowData.SPPONo) {
                const params = { SPPONO: rowData.SPPONo };
                await dispatch(fetchSPPOForPrint(params)).unwrap();
            }
            
        } catch (error) {
            console.error('❌ Error fetching SPPO details:', error);
            toast.error('Failed to load SPPO details');
            setIsSPPODetailsModalOpen(false);
        }
    };

    // Handle Excel download
    const handleExcelDownload = () => {
        try {
            const data = sppoReportData?.Data || [];
            if (!Array.isArray(data) || data.length === 0) {
                toast.warning('No data available to download');
                return;
            }

            const excelData = data.map(item => ({
                'SPPO Number': item.SPPONo || '-',
                'Start Date': formatDate(item.SPPOStartDate),
                'End Date': formatDate(item.SPPOEndDate),
                'Vendor Name': item.VendorName || '-',
                'Vendor Code': item.VendorCode || '-',
                'Cost Center': item.CCCode || '-',
                'DCA Code': item.DCACode || '-',
                'Total Value': item.TotalValue || 0,
                'Balance': item.Balance || 0,
                'Status': item.Status || '-',
                'PO Status': item.POStatus || '-'
            }));

            const vendorText = localFilters.VendorCode === 'SelectAll' ? 'AllVendors' : localFilters.VendorCode;
            const monthText = localFilters.month ? `Month${localFilters.month}` : 'AllMonths';
            const filename = `SPPO_Report_${localFilters.CCCode}_${vendorText}_${localFilters.Status}_${monthText}_${localFilters.year}_${new Date().toISOString().split('T')[0]}`;
            downloadAsExcel(excelData, filename);
            toast.success('Excel file downloaded successfully');
            
        } catch (error) {
            console.error('❌ Excel Download Error:', error);
            toast.error('Excel download failed. Please try again.');
        }
    };

    // Get report data for display
    const reportData = sppoReportData?.Data || [];

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
                            <Package className="h-8 w-8 text-indigo-600" />
                            SPPO Report
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Generate and analyze Service Provider's Purchase Order (SPPO) reports with detailed breakdowns
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 text-indigo-800 dark:text-indigo-200 text-sm rounded-full transition-colors">
                            SPPO Reports
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
                        <span className="text-gray-900 dark:text-white">SPPO Report</span>
                    </div>
                </nav>
            </div>

            {/* Filters Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    {/* CC Status */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Cost Center Status <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={localFilters.CCStatusval}
                            onChange={(e) => handleFilterChange('CCStatusval', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-colors"
                        >
                            <option value="">Select CC Status</option>
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
                            disabled={loading.sppoCostCenters || !localFilters.CCStatusval}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <option value="">Select Cost Center</option>
                            {Array.isArray(sppoCostCenters?.Data) && sppoCostCenters.Data.map((cc, index) => {
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
                        
                        {loading.sppoCostCenters && (
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
                            disabled={loading.sppoDCACodes || !localFilters.CCCode}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <option value="">Select DCA Code</option>
                            {Array.isArray(sppoDCACodes?.Data) && sppoDCACodes.Data.map((dca, index) => {
                                const dcaCode = dca?.DCACode || dca?.dcaCode || dca?.code;
                                const dcaName = dca?.DCAIDSTR || dca?.dcaName || dca?.name;
                                
                                if (!dcaCode) return null;
                                
                                return (
                                    <option key={dcaCode || index} value={dcaCode}>
                                        {dcaName || dcaCode}
                                    </option>
                                );
                            })}
                        </select>
                        
                        {loading.sppoDCACodes && (
                            <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-2">
                                Loading DCA codes...
                            </p>
                        )}
                    </div>

                    {/* Vendor */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Vendor <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={localFilters.VendorCode}
                            onChange={(e) => handleFilterChange('VendorCode', e.target.value)}
                            disabled={loading.sppoVendors || !localFilters.DCA}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <option value="">Select Vendor</option>
                            <option value="SelectAll" className="font-semibold text-indigo-600">
                                📊 Select All Vendors
                            </option>
                            {Array.isArray(sppoVendors?.Data) && sppoVendors.Data.map((vendor, index) => {
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
                        
                        {loading.sppoVendors && (
                            <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-2">
                                Loading vendors...
                            </p>
                        )}
                        
                        {localFilters.VendorCode === 'SelectAll' && (
                            <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-medium">
                                ✅ All vendors selected for this DCA code
                            </p>
                        )}
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Status <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={localFilters.Status}
                            onChange={(e) => handleFilterChange('Status', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-colors"
                        >
                            <option value="">Select Status</option>
                            <option value="Running" className="flex items-center">
                                🔄 Running
                            </option>
                            <option value="Closed" className="flex items-center">
                                ✅ Closed
                            </option>
                        </select>
                        
                        {localFilters.Status && (
                            <p className="text-xs mt-2 font-medium flex items-center gap-1">
                                {localFilters.Status === 'Running' ? (
                                    <>
                                        <Clock className="h-3 w-3 text-indigo-500" />
                                        <span className="text-indigo-600 dark:text-indigo-400">Running SPPOs selected</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="h-3 w-3 text-green-500" />
                                        <span className="text-green-600 dark:text-green-400">Closed SPPOs selected</span>
                                    </>
                                )}
                            </p>
                        )}
                    </div>

                    {/* Financial Year */}
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
                            {loading.sppoReportData ? (
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
                        <Tooltip content="Download SPPO report as Excel file">
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
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">SPPO Number</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Start Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">End Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Vendor Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Cost Center</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">DCA Code</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Total Value</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Balance</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {reportData.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                            {item.SPPONo || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {formatDate(item.SPPOStartDate)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {formatDate(item.SPPOEndDate)}
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
                                                ₹{formatCurrency(item.TotalValue || 0)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-bold">
                                            <span className="text-indigo-600 dark:text-indigo-400">
                                                ₹{formatCurrency(item.Balance || 0)}
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
                        {!loading.sppoReportData && (
                            <div className="p-12 text-center">
                                <div className="flex flex-col items-center">
                                    <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full p-4 mb-4">
                                        <Package className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No SPPO Report Data Found</h3>
                                    <p className="text-gray-600 dark:text-gray-400 max-w-md">
                                        Select CC status, cost center, DCA code, vendor, status, and financial year, then click "Generate Report" to view SPPO data.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Loading State */}
                        {loading.sppoReportData && (
                            <div className="p-12 text-center">
                                <div className="flex flex-col items-center">
                                    <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full p-4 mb-4">
                                        <RotateCcw className="h-12 w-12 text-indigo-500 animate-spin" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Generating SPPO Report</h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Fetching SPPO data for the selected criteria...
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* SPPO Details Modal */}
            <SPPODetailsModal
                isOpen={isSPPODetailsModalOpen}
                onClose={() => setIsSPPODetailsModalOpen(false)}
                sppoData={sppoPrintData}
                loading={loading.sppoPrintData}
            />

            {/* Information Note */}
            <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                    <Info className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <div className="text-indigo-800 dark:text-indigo-200 text-sm">
                        <p className="font-semibold mb-1">✨ Enhanced SPPO Report Features:</p>
                        <p className="text-gray-600 dark:text-indigo-200">
                            1. <strong>📊 Status Filter:</strong> Filter by Running or Closed SPPOs<br/>
                            2. <strong>🔍 Amendment Tracking:</strong> View amendment history in detail view<br/>
                            3. <strong>📄 Terms Processing:</strong> Terms and conditions parsed from remarks<br/>
                            4. <strong>💰 Financial Summary:</strong> Total value, balance, and vendor metrics<br/>
                            5. <strong>🖨️ Professional Print:</strong> Comprehensive SPPO print layout<br/>
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

export default SPPOReportPage;