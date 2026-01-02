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
    DollarSign,
    BadgeCheck,
    IndianRupee
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
            minimumFractionDigits: 2
        }).format(amount);
    };

    // Extract and process data
    const actualData = paySlipData?.Data || paySlipData;

    let earnings = [];
    let deductions = [];
    let employeeInfo = {};

    // Handle the actual API response structure
    if (typeof actualData === 'object' && actualData !== null && !Array.isArray(actualData)) {
        // Extract earnings and deductions from lstEarnings and lstDeductions
        earnings = actualData.lstEarnings || actualData.Earnings || [];
        deductions = actualData.lstDeductions || actualData.Deductions || [];

        // Extract employee information from the main data object
        employeeInfo = {
            empRefno: actualData.EmpRefno || actualData.EmpRefNo,
            empName: actualData.EmployeeName || actualData.EmpName,
            monthName: actualData.MonthName,
            year: actualData.Year,
            pfNo: actualData.PFNo,
            paidDays: actualData.PaidDays,
            doj: actualData.DOJ,
            accNo: actualData.ACCNo,
            modeOfPay: actualData.ModeofPay,
            esiNo: actualData.ESINO,
            presentDays: actualData.Presentdays,
            designation: actualData.Designation,
            pan: actualData.PAN,
            uan: actualData.UAN,
            gross: actualData.Gross,
            deduction: actualData.Deduction,
            net: actualData.Net,
            balanceLeaves: actualData.BalanceLeaves,
            payRollDate: actualData.MonthName && actualData.Year ? `${actualData.MonthName} ${actualData.Year}` : null
        };
    } else if (Array.isArray(actualData)) {
        // Fallback: Handle array format (old format)
        earnings = actualData.filter(item =>
            item.HeadType === 'Earning' ||
            item.HeadType === 'E' ||
            item.HeadType === 'EARNING'
        );
        deductions = actualData.filter(item =>
            item.HeadType === 'Deduction' ||
            item.HeadType === 'D' ||
            item.HeadType === 'DEDUCTION'
        );

        if (actualData.length > 0) {
            employeeInfo = {
                empRefno: actualData[0].EmpRefNo || actualData[0].EmpRefno,
                empName: actualData[0].EmployeeName || actualData[0].EmpName,
                payRollDate: actualData[0].PayRollDate
            };
        }
    }

    // Merge with employeeData if provided (from table row)
    if (employeeData) {
        employeeInfo = {
            ...employeeInfo,
            empName: employeeInfo.empName || employeeData.EmpName,
            ccCode: employeeData.CCCode,
            ccName: employeeData.CCName,
            bank: employeeData.Bank || employeeInfo.modeOfPay,
            bankAccountNo: employeeData.BankAccountNo || employeeInfo.accNo,
            transactionRefno: employeeData.CMSTransactionNo
        };
    }

    // Calculate totals
    const totalEarnings = earnings.reduce((sum, item) =>
        sum + parseFloat(item.HeadAmount || item.Amount || 0), 0
    );
    const totalDeductions = deductions.reduce((sum, item) =>
        sum + parseFloat(item.HeadAmount || item.Amount || 0), 0
    );
    const netPay = totalEarnings - totalDeductions;

    // Download as PDF
    const handleDownloadPDF = async () => {
        try {
            const element = paySlipRef.current;
            const canvas = await html2canvas(element, {
                scale: 2,
                logging: false,
                useCORS: true
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210; // A4 width in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`PaySlip_${employeeInfo.empRefno}_${new Date().toISOString().split('T')[0]}.pdf`);
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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="flex items-center justify-center min-h-screen px-4 py-8">
                <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
                    {/* Header with Actions */}
                    <div className="sticky top-0 z-10 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <FileText className="h-6 w-6 text-white" />
                            <h2 className="text-xl font-bold text-white">Employee Pay Slip</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleDownloadPDF}
                                disabled={loading}
                                className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all duration-200 disabled:opacity-50"
                                title="Download PDF"
                            >
                                <Download className="h-5 w-5 text-white" />
                            </button>
                            <button
                                onClick={handlePrint}
                                disabled={loading}
                                className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all duration-200 disabled:opacity-50"
                                title="Print"
                            >
                                <Printer className="h-5 w-5 text-white" />
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all duration-200"
                                title="Close"
                            >
                                <X className="h-5 w-5 text-white" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-16">
                                <div className="relative">
                                    <div className="w-16 h-16 border-4 border-indigo-200 dark:border-indigo-900 rounded-full"></div>
                                    <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                                </div>
                                <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading pay slip details...</p>
                            </div>
                        ) : (
                            <div ref={paySlipRef} className="p-8 bg-white dark:bg-gray-900">
                                {/* Company Header with Logo */}
                                <div className="mb-8 pb-6 border-b-2 border-indigo-200 dark:border-indigo-800">
                                    <div className="flex items-start gap-6">
                                        {/* Company Logo */}
                                        <div className="flex-shrink-0">
                                            <img
                                                src="logo.jpg"
                                                alt="Essel Projects Logo"
                                                className="w-24 h-24 object-contain"
                                            />
                                        </div>

                                        {/* Company Details */}
                                        <div className="flex-1">
                                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                                Essel Projects Pvt Ltd
                                            </h1>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                                No-5, First Floor, Maruti Heritage, Pachpedi Naka,<br />
                                                Raipur- 492 001, Chhattisgarh
                                            </p>
                                        </div>

                                        {/* Salary Slip Title */}
                                        <div className="flex-shrink-0 text-right">
                                            <div className="inline-block border px-6 py-3 rounded-lg  text-indigo-950">
                                                <p className=" text-lg font-semibold uppercase tracking-wider">Salary Slip</p>
                                                <p className=" text-sm font-bold">
                                                    {employeeInfo.payRollDate || 'Monthly Statement'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Employee Information Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    {/* Left Column */}
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Employee Code</p>
                                                <p className="text-base font-bold text-gray-900 dark:text-white">{employeeInfo.empRefno || '-'}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Employee Name</p>
                                                <p className="text-base font-bold text-gray-900 dark:text-white">{employeeInfo.empName || '-'}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <Building2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Cost Centre</p>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">{employeeInfo.ccCode || '-'}</p>
                                                {employeeInfo.ccName && (
                                                    <p className="text-xs text-gray-600 dark:text-gray-400">{employeeInfo.ccName}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column */}
                                    <div className="space-y-4">
                                        {employeeInfo.bank && (
                                            <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <Building2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Bank</p>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{employeeInfo.bank}</p>
                                                    {employeeInfo.bankAccountNo && (
                                                        <p className="text-xs text-gray-600 dark:text-gray-400">A/C: {employeeInfo.bankAccountNo}</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {employeeInfo.transactionRefno && (
                                            <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Transaction Reference</p>
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{employeeInfo.transactionRefno}</p>
                                                </div>
                                            </div>
                                        )}

                                        {employeeInfo.paymentDate && (
                                            <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Payment Date</p>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{employeeInfo.paymentDate}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Earnings and Deductions */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                    {/* Earnings */}
                                    <div className="border-2 border-green-200 dark:border-green-800 rounded-xl overflow-hidden">
                                        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 flex items-center gap-3">
                                            <TrendingUp className="h-5 w-5 text-white" />
                                            <h3 className="text-lg font-bold text-white">Earnings</h3>
                                        </div>
                                        <div className="bg-white dark:bg-gray-800 p-6">
                                            {earnings.length > 0 ? (
                                                <div className="space-y-3">
                                                    {earnings.map((item, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex justify-between items-start pb-3 border-b border-gray-200 dark:border-gray-700 last:border-0"
                                                        >
                                                            <div className="flex-1">
                                                                <p className="font-semibold text-gray-900 dark:text-white">
                                                                    {item.SalaryHead || item.Description || 'Earning'}
                                                                </p>
                                                                {item.PayDays > 0 && (
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                        {item.PayDays} days × ₹{formatCurrency(item.PerDayAmount || 0)}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <p className="font-bold text-green-600 dark:text-green-400 text-lg ml-4">
                                                                ₹{formatCurrency(item.HeadAmount || item.Amount || 0)}
                                                            </p>
                                                        </div>
                                                    ))}
                                                    <div className="flex justify-between items-center pt-4 border-t-2 border-green-600">
                                                        <p className="font-bold text-gray-900 dark:text-white text-lg">Total Earnings</p>
                                                        <p className="font-bold text-green-600 dark:text-green-400 text-2xl">
                                                            ₹{formatCurrency(totalEarnings)}
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                                    No earnings data available
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Deductions */}
                                    <div className="border-2 border-red-200 dark:border-red-800 rounded-xl overflow-hidden">
                                        <div className="bg-gradient-to-r from-red-600 to-rose-600 px-6 py-4 flex items-center gap-3">
                                            <TrendingDown className="h-5 w-5 text-white" />
                                            <h3 className="text-lg font-bold text-white">Deductions</h3>
                                        </div>
                                        <div className="bg-white dark:bg-gray-800 p-6">
                                            {deductions.length > 0 ? (
                                                <div className="space-y-3">
                                                    {deductions.map((item, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex justify-between items-start pb-3 border-b border-gray-200 dark:border-gray-700 last:border-0"
                                                        >
                                                            <div className="flex-1">
                                                                <p className="font-semibold text-gray-900 dark:text-white">
                                                                    {item.SalaryHead || item.Description || 'Deduction'}
                                                                </p>
                                                                {item.PayDays > 0 && (
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                        {item.PayDays} days × ₹{formatCurrency(item.PerDayAmount || 0)}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <p className="font-bold text-red-600 dark:text-red-400 text-lg ml-4">
                                                                ₹{formatCurrency(item.HeadAmount || item.Amount || 0)}
                                                            </p>
                                                        </div>
                                                    ))}
                                                    <div className="flex justify-between items-center pt-4 border-t-2 border-red-600">
                                                        <p className="font-bold text-gray-900 dark:text-white text-lg">Total Deductions</p>
                                                        <p className="font-bold text-red-600 dark:text-red-400 text-2xl">
                                                            ₹{formatCurrency(totalDeductions)}
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                                    No deductions data available
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Net Pay Section */}
                                <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl p-8 text-white shadow-xl">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-white bg-opacity-20 p-4 rounded-full">
                                                <IndianRupee className="h-8 w-8" />
                                            </div>
                                            <div>
                                                <p className="text-sm opacity-90 font-medium">Net Salary Payable</p>
                                                <p className="text-4xl font-bold mt-1">₹{formatCurrency(netPay)}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm opacity-90 mb-2">Calculation</p>
                                            <p className="text-lg">
                                                ₹{formatCurrency(totalEarnings)} <span className="opacity-75">-</span> ₹{formatCurrency(totalDeductions)}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2 justify-end">
                                                <BadgeCheck className="h-4 w-4" />
                                                <p className="text-xs opacity-90">Verified & Approved</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Note */}
                                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                        This is a computer-generated pay slip and does not require a signature.
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-1">
                                        Generated on {new Date().toLocaleString('en-IN')}
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

export default PaySlipModal;