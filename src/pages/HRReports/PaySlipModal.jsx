import React, { useRef } from 'react';
import {
    X,
    Download,
    Printer,
    Calendar,
    Building2,
    User,
    FileText,
    TrendingUp,
    TrendingDown,
    IndianRupee,
    BadgeCheck,
    Mail,
    Phone,
    MapPin,
    Briefcase,
    CreditCard
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const PaySlipModal = ({ isOpen, onClose, paySlipData, loading, employeeData }) => {
    const paySlipRef = useRef(null);

    if (!isOpen) return null;

    // Format currency
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    console.log('🔍 PaySlip Modal Data:', { paySlipData, employeeData });

    const actualData = paySlipData?.Data || paySlipData;

    if (!actualData || !actualData.EmpRefno) {
        return (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 backdrop-blur-sm">
                <div className="flex items-center justify-center min-h-screen px-4 py-8">
                    <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-8">
                        <div className="text-center">
                            <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                                <X className="h-8 w-8 text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                Failed to Load Pay Slip
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                {paySlipData?.Message || 'Unable to fetch pay slip data. Please try again.'}
                            </p>
                            <button
                                onClick={onClose}
                                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    let earnings = [];
    let deductions = [];
    let employeeInfo = {};

    if (actualData) {
        earnings = (actualData.lstEarnings || [])
            .filter(item => item.HeadAmount && parseFloat(item.HeadAmount) > 0);

        deductions = (actualData.lstDeductions || [])
            .filter(item => item.HeadAmount && parseFloat(item.HeadAmount) > 0);

        employeeInfo = {
            empRefno: actualData.EmpRefno,
            empName: actualData.EmployeeName,
            designation: actualData.Designation,
            location: actualData.Location,
            ccCode: actualData.CurrentCC || employeeData?.CurrentCC,
            ccName: employeeData?.CurrentCCName,
            pfNumber: actualData.PFNo,
            esiNumber: actualData.ESINO,
            panNumber: actualData.PAN,
            uanNumber: actualData.UAN,
            workingDays: actualData.Presentdays,
            totalSalaryDays: actualData.PaidDays,
            bankName: actualData.ModeofPay,
            bankAccountNo: actualData.ACCNo,
            balanceLeaves: actualData.BalanceLeaves,
            doj: actualData.DOJ,
            monthName: actualData.MonthName,
            year: actualData.Year,
            payRollDate: `${actualData.MonthName} ${actualData.Year}`,
            transactionRefno: employeeData?.TransactionRefno,
            gross: actualData.Gross,
            deduction: actualData.Deduction,
            net: actualData.Net
        };
    }

    const totalEarnings = employeeInfo.gross || earnings.reduce((sum, item) =>
        sum + parseFloat(item.HeadAmount || 0), 0
    );
    const totalDeductions = employeeInfo.deduction || deductions.reduce((sum, item) =>
        sum + parseFloat(item.HeadAmount || 0), 0
    );
    const netPay = employeeInfo.net || (totalEarnings - totalDeductions);

    // Download as PDF
    const handleDownloadPDF = async () => {
        try {
            const element = paySlipRef.current;
            const canvas = await html2canvas(element, {
                scale: 2,
                logging: false,
                useCORS: true,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`PaySlip_${employeeInfo.empRefno}_${employeeInfo.monthName}_${employeeInfo.year}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        }
    };

    // Print
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-60 backdrop-blur-sm">
            <div className="flex items-center justify-center min-h-screen px-4 py-8">
                <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
                    {/* Professional Header */}
                    <div className="sticky top-0 z-10 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 px-8 py-5 border-b border-slate-600">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-white bg-opacity-10 p-2 rounded-lg">
                                    <FileText className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Salary Statement</h2>
                                    <p className="text-xs text-slate-300">Confidential Document</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleDownloadPDF}
                                    disabled={loading}
                                    className="px-4 py-2 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center gap-2 text-white text-sm font-medium"
                                    title="Download PDF"
                                >
                                    <Download className="h-4 w-4" />
                                    <span className="hidden sm:inline">Download</span>
                                </button>
                                <button
                                    onClick={handlePrint}
                                    disabled={loading}
                                    className="px-4 py-2 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center gap-2 text-white text-sm font-medium"
                                    title="Print"
                                >
                                    <Printer className="h-4 w-4" />
                                    <span className="hidden sm:inline">Print</span>
                                </button>
                                <button
                                    onClick={onClose}
                                    className="p-2 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg transition-all duration-200 text-white"
                                    title="Close"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="overflow-y-auto max-h-[calc(95vh-85px)]">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="relative">
                                    <div className="w-20 h-20 border-4 border-slate-200 dark:border-slate-800 rounded-full"></div>
                                    <div className="w-20 h-20 border-4 border-slate-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                                </div>
                                <p className="mt-6 text-gray-600 dark:text-gray-400 font-medium">Loading salary details...</p>
                            </div>
                        ) : (
                            <div ref={paySlipRef} className="bg-white dark:bg-gray-900">
                                {/* Company Letterhead */}
                                <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-800 dark:to-gray-850 px-8 py-8 border-b-4 border-slate-700">
                                    <div className="flex items-start justify-between">
                                        {/* Company Logo & Info */}
                                        <div className="flex items-start gap-6">
                                            <div className="flex-shrink-0 bg-white p-3 rounded-lg shadow-md">
                                                <img
                                                    src="/logo.jpg"
                                                    alt="Essel Projects"
                                                    className="w-20 h-20 object-contain"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                                                    ESSEL PROJECTS PVT LTD
                                                </h1>
                                                <div className="space-y-0.5 text-sm text-slate-600 dark:text-slate-400">
                                                    <p className="flex items-center gap-2">
                                                        <MapPin className="h-3.5 w-3.5" />
                                                        No-5, First Floor, Maruti Heritage, Pachpedi Naka
                                                    </p>
                                                    <p className="ml-5">Raipur - 492 001, Chhattisgarh</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Pay Slip Badge */}
                                        <div className="text-right">
                                            <div className="inline-block bg-slate-800 text-white px-6 py-3 rounded-lg shadow-lg">
                                                <p className="text-xs font-semibold uppercase tracking-wider opacity-90">Pay Slip</p>
                                                <p className="text-lg font-bold mt-1 opacity-90">{employeeInfo.payRollDate || 'Monthly'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-8 py-6">
                                    {/* Employee Info Section */}
                                    <div className="mb-8">
                                        <div className="flex items-center gap-2 mb-4">
                                            <User className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                                                Employee Information
                                            </h3>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-gray-800 rounded-xl p-6 border border-slate-200 dark:border-gray-700">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4">
                                                {/* Column 1 */}
                                                <div className="space-y-3">
                                                    <div>
                                                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                                                            Employee Code
                                                        </p>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                            {employeeInfo.empRefno || '-'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                                                            Employee Name
                                                        </p>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                            {employeeInfo.empName || '-'}
                                                        </p>
                                                    </div>
                                                    {employeeInfo.designation && (
                                                        <div>
                                                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                                                                Designation
                                                            </p>
                                                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                                {employeeInfo.designation}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Column 2 */}
                                                <div className="space-y-3">
                                                    {employeeInfo.doj && (
                                                        <div>
                                                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                                                                Date of Joining
                                                            </p>
                                                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                                {employeeInfo.doj}
                                                            </p>
                                                        </div>
                                                    )}
                                                    {(employeeInfo.ccCode || employeeInfo.ccName) && (
                                                        <div>
                                                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                                                                Cost Centre
                                                            </p>
                                                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                                {employeeInfo.ccCode}
                                                            </p>
                                                            {employeeInfo.ccName && (
                                                                <p className="text-xs text-slate-600 dark:text-slate-400">
                                                                    {employeeInfo.ccName}
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}
                                                    {(employeeInfo.workingDays || employeeInfo.totalSalaryDays) && (
                                                        <div>
                                                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                                                                Attendance
                                                            </p>
                                                            <p className="text-sm text-slate-900 dark:text-white">
                                                                Present: <span className="font-semibold">{employeeInfo.workingDays || 0}</span> | 
                                                                Paid: <span className="font-semibold">{employeeInfo.totalSalaryDays || 0}</span>
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Column 3 */}
                                                <div className="space-y-3">
                                                    {employeeInfo.bankName && (
                                                        <div>
                                                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                                                                Bank Name
                                                            </p>
                                                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                                {employeeInfo.bankName}
                                                            </p>
                                                            {employeeInfo.bankAccountNo && (
                                                                <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                                                                    A/C: {employeeInfo.bankAccountNo}
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}
                                                    {(employeeInfo.pfNumber || employeeInfo.uanNumber) && (
                                                        <div>
                                                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                                                                Statutory Details
                                                            </p>
                                                            {employeeInfo.pfNumber && (
                                                                <p className="text-xs text-slate-900 dark:text-white">
                                                                    PF: <span className="font-mono">{employeeInfo.pfNumber}</span>
                                                                </p>
                                                            )}
                                                            {employeeInfo.uanNumber && (
                                                                <p className="text-xs text-slate-900 dark:text-white">
                                                                    UAN: <span className="font-mono">{employeeInfo.uanNumber}</span>
                                                                </p>
                                                            )}
                                                            {employeeInfo.panNumber && (
                                                                <p className="text-xs text-slate-900 dark:text-white">
                                                                    PAN: <span className="font-mono">{employeeInfo.panNumber}</span>
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Earnings and Deductions */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                        {/* Earnings */}
                                        <div className="border-2 border-emerald-200 dark:border-emerald-800 rounded-xl overflow-hidden">
                                            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3.5">
                                                <div className="flex items-center gap-2">
                                                    <TrendingUp className="h-5 w-5 text-white" />
                                                    <h3 className="text-base font-bold text-white uppercase tracking-wide">Earnings</h3>
                                                </div>
                                            </div>
                                            <div className="bg-white dark:bg-gray-800 p-5">
                                                {earnings.length > 0 ? (
                                                    <div className="space-y-2.5">
                                                        {earnings.map((item, index) => (
                                                            <div
                                                                key={index}
                                                                className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-gray-700 last:border-0"
                                                            >
                                                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                                    {item.SalaryHead}
                                                                </p>
                                                                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                                                                    ₹ {formatCurrency(item.HeadAmount)}
                                                                </p>
                                                            </div>
                                                        ))}
                                                        <div className="flex justify-between items-center pt-3 mt-2 border-t-2 border-emerald-600">
                                                            <p className="text-base font-bold text-slate-900 dark:text-white uppercase">
                                                                Total Earnings
                                                            </p>
                                                            <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                                                                ₹ {formatCurrency(totalEarnings)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-center text-slate-500 dark:text-slate-400 py-8 text-sm">
                                                        No earnings recorded
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Deductions */}
                                        <div className="border-2 border-rose-200 dark:border-rose-800 rounded-xl overflow-hidden">
                                            <div className="bg-gradient-to-r from-rose-600 to-pink-600 px-5 py-3.5">
                                                <div className="flex items-center gap-2">
                                                    <TrendingDown className="h-5 w-5 text-white" />
                                                    <h3 className="text-base font-bold text-white uppercase tracking-wide">Deductions</h3>
                                                </div>
                                            </div>
                                            <div className="bg-white dark:bg-gray-800 p-5">
                                                {deductions.length > 0 ? (
                                                    <div className="space-y-2.5">
                                                        {deductions.map((item, index) => (
                                                            <div
                                                                key={index}
                                                                className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-gray-700 last:border-0"
                                                            >
                                                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                                    {item.SalaryHead}
                                                                </p>
                                                                <p className="text-sm font-bold text-rose-700 dark:text-rose-400 tabular-nums">
                                                                    ₹ {formatCurrency(item.HeadAmount)}
                                                                </p>
                                                            </div>
                                                        ))}
                                                        <div className="flex justify-between items-center pt-3 mt-2 border-t-2 border-rose-600">
                                                            <p className="text-base font-bold text-slate-900 dark:text-white uppercase">
                                                                Total Deductions
                                                            </p>
                                                            <p className="text-lg font-bold text-rose-700 dark:text-rose-400 tabular-nums">
                                                                ₹ {formatCurrency(totalDeductions)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-center text-slate-500 dark:text-slate-400 py-8 text-sm">
                                                        No deductions recorded
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Net Pay Section */}
                                    <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-xl p-6 shadow-xl mb-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-5">
                                                <div className="bg-white bg-opacity-15 p-4 rounded-xl">
                                                    <IndianRupee className="h-8 w-8 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-300 font-medium uppercase tracking-wide mb-1">
                                                        Net Salary Payable
                                                    </p>
                                                    <p className="text-4xl font-bold text-white tabular-nums">
                                                        ₹ {formatCurrency(netPay)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-slate-300 uppercase tracking-wide mb-2">Calculation</p>
                                                <p className="text-base text-white mb-3 tabular-nums">
                                                    ₹ {formatCurrency(totalEarnings)} <span className="text-slate-400 mx-1">−</span> ₹ {formatCurrency(totalDeductions)}
                                                </p>
                                                <div className="inline-flex items-center gap-2 bg-white bg-opacity-15 px-3 py-1.5 rounded-lg">
                                                    <BadgeCheck className="h-4 w-4 text-emerald-400" />
                                                    <p className="text-xs text-slate-200 font-medium">Verified & Approved</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="border-t-2 border-slate-200 dark:border-gray-700 pt-6">
                                        <div className="bg-amber-50 dark:bg-amber-900/10 border-l-4 border-amber-500 p-4 rounded mb-4">
                                            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                                                <strong>Note:</strong> This is a computer-generated salary statement and does not require a physical signature. 
                                                Please verify all details and contact HR department for any discrepancies.
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                                            <p>Generated on: {new Date().toLocaleString('en-IN', { 
                                                day: '2-digit', 
                                                month: 'short', 
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}</p>
                                            <p className="font-mono">Document ID: {employeeInfo.transactionRefno || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaySlipModal;