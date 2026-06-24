import React, { useRef } from 'react';
import { X, Download, Printer } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const NAVY = '#032847';
const ORANGE = '#F96509';
const NAVY_LIGHT = '#0a3d66';
const NAVY_BG = '#f0f4f8';

const PaySlipModal = ({ isOpen, onClose, paySlipData, loading, employeeData }) => {
    const paySlipRef = useRef(null);

    if (!isOpen) return null;

    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    const actualData = paySlipData?.Data || paySlipData;

    if (!actualData || !actualData.EmpRefno) {
        return (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-60 backdrop-blur-sm">
                <div className="flex items-center justify-center min-h-screen px-4 py-8">
                    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-8">
                        <div className="text-center">
                            <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#fee2e2' }}>
                                <X style={{ color: '#dc2626', width: 32, height: 32 }} />
                            </div>
                            <h3 className="text-xl font-bold mb-2" style={{ color: NAVY }}>Failed to Load Pay Slip</h3>
                            <p className="text-gray-600 mb-6">
                                {paySlipData?.Message || 'Unable to fetch pay slip data. Please try again.'}
                            </p>
                            <button
                                onClick={onClose}
                                className="px-6 py-3 text-white rounded-lg font-medium transition-opacity hover:opacity-90"
                                style={{ backgroundColor: NAVY }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const earnings = (actualData.lstEarnings || []).filter(item => item.HeadAmount && parseFloat(item.HeadAmount) > 0);
    const deductions = (actualData.lstDeductions || []).filter(item => item.HeadAmount && parseFloat(item.HeadAmount) > 0);

    const employeeInfo = {
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

    const totalEarnings = employeeInfo.gross || earnings.reduce((sum, item) => sum + parseFloat(item.HeadAmount || 0), 0);
    const totalDeductions = employeeInfo.deduction || deductions.reduce((sum, item) => sum + parseFloat(item.HeadAmount || 0), 0);
    const netPay = employeeInfo.net || (totalEarnings - totalDeductions);

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

    const handlePrint = () => window.print();

    const infoRow = (label, value, mono = false) =>
        value ? (
            <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
                    {label}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: NAVY, fontFamily: mono ? 'monospace' : 'inherit' }}>
                    {value}
                </div>
            </div>
        ) : null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-60 backdrop-blur-sm">
            <div className="flex items-center justify-center min-h-screen px-4 py-8">
                <div className="relative w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden" style={{ maxHeight: '95vh', display: 'flex', flexDirection: 'column' }}>

                    {/* Modal toolbar — not part of PDF */}
                    <div style={{ backgroundColor: NAVY, padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <img src="/essel.svg" alt="Essel" style={{ height: 32, width: 'auto', filter: 'brightness(0) invert(1)' }} />
                            <div>
                                <div style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>Salary Statement</div>
                                <div style={{ color: '#93c5fd', fontSize: 11 }}>Confidential — {employeeInfo.payRollDate}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button
                                onClick={handleDownloadPDF}
                                disabled={loading}
                                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, backgroundColor: ORANGE, color: 'white', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
                            >
                                <Download size={15} /> Download PDF
                            </button>
                            <button
                                onClick={handlePrint}
                                disabled={loading}
                                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
                            >
                                <Printer size={15} /> Print
                            </button>
                            <button
                                onClick={onClose}
                                style={{ padding: '8px 10px', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }}
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Scrollable content */}
                    <div style={{ overflowY: 'auto', backgroundColor: '#e5e7eb', padding: '24px' }}>
                        {loading ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0' }}>
                                <div style={{ position: 'relative', width: 64, height: 64 }}>
                                    <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `4px solid ${ORANGE}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
                                </div>
                                <p style={{ marginTop: 20, color: NAVY, fontWeight: 600 }}>Loading salary details...</p>
                                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                            </div>
                        ) : (
                            /* ─── PDF-captured content ─── */
                            <div ref={paySlipRef} style={{ backgroundColor: 'white', fontFamily: "'Segoe UI', Arial, sans-serif" }}>

                                {/* ── Letterhead ── */}
                                <div style={{ backgroundColor: 'white', padding: '24px 32px 0 32px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        {/* Logo + company name */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                            <img src="/essel.svg" alt="Essel Projects" style={{ height:'5rem', width: 'auto' }} />
                                            <div>
                                                <div style={{ color: NAVY, fontSize: 22, fontWeight: 800, letterSpacing: '0.04em', lineHeight: 1.2 }}>
                                                    ESSEL PROJECTS PVT LTD
                                                </div>
                                                <div style={{ color: '#6b7280', fontSize: 11, marginTop: 3 }}>
                                                    No-5, First Floor, Maruti Heritage, Pachpedi Naka, Raipur – 492 001, Chhattisgarh
                                                </div>
                                            </div>
                                        </div>

                                        {/* Pay Slip badge */}
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ backgroundColor: ORANGE, color: 'white', borderRadius: '8px 8px 0 0', padding: '10px 22px', display: 'inline-block' }}>
                                                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.9 }}>Salary Slip</div>
                                                <div style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>{employeeInfo.payRollDate || 'Monthly'}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Orange accent bar */}
                                    <div style={{ height: 4, backgroundColor: ORANGE, marginTop: 20, marginLeft: -32, marginRight: -32 }} />
                                </div>

                                <div style={{ padding: '28px 32px' }}>

                                    {/* ── Employee Info ── */}
                                    <div style={{ border: `1px solid #e2e8f0`, borderRadius: 10, overflow: 'hidden', marginBottom: 24 }}>
                                        <div style={{ backgroundColor: NAVY, padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ width: 3, height: 16, backgroundColor: ORANGE, borderRadius: 2 }} />
                                            <span style={{ color: 'white', fontWeight: 700, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                                                Employee Details
                                            </span>
                                        </div>
                                        <div style={{ backgroundColor: NAVY_BG, padding: '18px 22px' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 32px' }}>
                                                {/* Col 1 */}
                                                <div>
                                                    {infoRow('Employee Code', employeeInfo.empRefno)}
                                                    {infoRow('Employee Name', employeeInfo.empName)}
                                                    {infoRow('Designation', employeeInfo.designation)}
                                                    {infoRow('Location', employeeInfo.location)}
                                                </div>
                                                {/* Col 2 */}
                                                <div>
                                                    {infoRow('Date of Joining', employeeInfo.doj)}
                                                    {infoRow('Cost Centre', employeeInfo.ccCode)}
                                                    {employeeInfo.ccName && (
                                                        <div style={{ marginTop: -6, marginBottom: 10, fontSize: 11, color: '#6b7280' }}>{employeeInfo.ccName}</div>
                                                    )}
                                                    {(employeeInfo.workingDays || employeeInfo.totalSalaryDays) && infoRow(
                                                        'Attendance (Present / Paid)',
                                                        `${employeeInfo.workingDays ?? 0} / ${employeeInfo.totalSalaryDays ?? 0} days`
                                                    )}
                                                </div>
                                                {/* Col 3 */}
                                                <div>
                                                    {infoRow('Bank / Mode of Pay', employeeInfo.bankName)}
                                                    {infoRow('Account Number', employeeInfo.bankAccountNo, true)}
                                                    {(employeeInfo.pfNumber || employeeInfo.uanNumber || employeeInfo.panNumber) && (
                                                        <div style={{ marginBottom: 10 }}>
                                                            <div style={{ fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                                                                Statutory Details
                                                            </div>
                                                            {employeeInfo.pfNumber && <div style={{ fontSize: 12, color: NAVY, fontFamily: 'monospace' }}>PF: {employeeInfo.pfNumber}</div>}
                                                            {employeeInfo.uanNumber && <div style={{ fontSize: 12, color: NAVY, fontFamily: 'monospace' }}>UAN: {employeeInfo.uanNumber}</div>}
                                                            {employeeInfo.panNumber && <div style={{ fontSize: 12, color: NAVY, fontFamily: 'monospace' }}>PAN: {employeeInfo.panNumber}</div>}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ── Earnings & Deductions ── */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>

                                        {/* Earnings */}
                                        <div style={{ border: `1px solid #e2e8f0`, borderRadius: 10, overflow: 'hidden' }}>
                                            <div style={{ backgroundColor: NAVY, padding: '10px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <div style={{ width: 3, height: 16, backgroundColor: ORANGE, borderRadius: 2 }} />
                                                    <span style={{ color: 'white', fontWeight: 700, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Earnings</span>
                                                </div>
                                                <span style={{ color: '#93c5fd', fontSize: 11 }}>Amount (₹)</span>
                                            </div>
                                            <div style={{ backgroundColor: 'white', padding: '6px 0' }}>
                                                {earnings.length > 0 ? (
                                                    <>
                                                        {earnings.map((item, index) => (
                                                            <div key={index} style={{
                                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                                padding: '9px 18px',
                                                                backgroundColor: index % 2 === 0 ? 'white' : NAVY_BG,
                                                                borderBottom: '1px solid #f1f5f9'
                                                            }}>
                                                                <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{item.SalaryHead}</span>
                                                                <span style={{ fontSize: 13, fontWeight: 700, color: '#065f46', fontVariantNumeric: 'tabular-nums' }}>
                                                                    {formatCurrency(item.HeadAmount)}
                                                                </span>
                                                            </div>
                                                        ))}
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 18px', borderTop: `2px solid ${NAVY}`, backgroundColor: NAVY_BG }}>
                                                            <span style={{ fontSize: 13, fontWeight: 800, color: NAVY, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Earnings</span>
                                                            <span style={{ fontSize: 15, fontWeight: 800, color: NAVY }}>{formatCurrency(totalEarnings)}</span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <p style={{ textAlign: 'center', color: '#9ca3af', padding: '24px 0', fontSize: 13 }}>No earnings recorded</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Deductions */}
                                        <div style={{ border: `1px solid #e2e8f0`, borderRadius: 10, overflow: 'hidden' }}>
                                            <div style={{ backgroundColor: '#7f1d1d', padding: '10px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <div style={{ width: 3, height: 16, backgroundColor: '#fca5a5', borderRadius: 2 }} />
                                                    <span style={{ color: 'white', fontWeight: 700, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Deductions</span>
                                                </div>
                                                <span style={{ color: '#fca5a5', fontSize: 11 }}>Amount (₹)</span>
                                            </div>
                                            <div style={{ backgroundColor: 'white', padding: '6px 0' }}>
                                                {deductions.length > 0 ? (
                                                    <>
                                                        {deductions.map((item, index) => (
                                                            <div key={index} style={{
                                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                                padding: '9px 18px',
                                                                backgroundColor: index % 2 === 0 ? 'white' : '#fff5f5',
                                                                borderBottom: '1px solid #f1f5f9'
                                                            }}>
                                                                <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{item.SalaryHead}</span>
                                                                <span style={{ fontSize: 13, fontWeight: 700, color: '#991b1b', fontVariantNumeric: 'tabular-nums' }}>
                                                                    {formatCurrency(item.HeadAmount)}
                                                                </span>
                                                            </div>
                                                        ))}
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 18px', borderTop: '2px solid #7f1d1d', backgroundColor: '#fff5f5' }}>
                                                            <span style={{ fontSize: 13, fontWeight: 800, color: '#7f1d1d', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Deductions</span>
                                                            <span style={{ fontSize: 15, fontWeight: 800, color: '#7f1d1d' }}>{formatCurrency(totalDeductions)}</span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <p style={{ textAlign: 'center', color: '#9ca3af', padding: '24px 0', fontSize: 13 }}>No deductions recorded</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* ── Net Pay ── */}
                                    <div style={{
                                        background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_LIGHT} 100%)`,
                                        borderRadius: 12, padding: '22px 28px', marginBottom: 24,
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        borderLeft: `5px solid ${ORANGE}`
                                    }}>
                                        <div>
                                            <div style={{ color: '#93c5fd', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
                                                Net Salary Payable
                                            </div>
                                            <div style={{ color: 'white', fontSize: 36, fontWeight: 900, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.5px' }}>
                                                ₹ {formatCurrency(netPay)}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ color: '#93c5fd', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Calculation</div>
                                            <div style={{ color: 'white', fontSize: 14, fontVariantNumeric: 'tabular-nums', marginBottom: 10 }}>
                                                ₹ {formatCurrency(totalEarnings)}
                                                <span style={{ color: '#93c5fd', margin: '0 8px' }}>−</span>
                                                ₹ {formatCurrency(totalDeductions)}
                                            </div>
                                            <div style={{
                                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                                backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 6,
                                                padding: '5px 12px', border: '1px solid rgba(255,255,255,0.2)'
                                            }}>
                                                <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#34d399' }} />
                                                <span style={{ color: 'white', fontSize: 12, fontWeight: 600 }}>Verified & Approved</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ── Footer ── */}
                                    <div style={{ borderTop: `2px solid #e2e8f0`, paddingTop: 18 }}>
                                        <div style={{
                                            backgroundColor: '#fffbeb', borderLeft: `4px solid ${ORANGE}`,
                                            borderRadius: 6, padding: '10px 14px', marginBottom: 14
                                        }}>
                                            <p style={{ fontSize: 11, color: '#374151', lineHeight: 1.6, margin: 0 }}>
                                                <strong>Note:</strong> This is a computer-generated salary statement and does not require a physical signature.
                                                Please verify all details and contact the HR department for any discrepancies.
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ fontSize: 11, color: '#9ca3af' }}>
                                                Generated: {new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <div style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'monospace' }}>
                                                Doc ID: {employeeInfo.transactionRefno || 'N/A'}
                                            </div>
                                        </div>
                                    </div>

                                </div>

                                {/* Bottom brand strip */}
                                <div style={{ backgroundColor: NAVY, height: 6 }}>
                                    <div style={{ backgroundColor: ORANGE, height: 3 }} />
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
