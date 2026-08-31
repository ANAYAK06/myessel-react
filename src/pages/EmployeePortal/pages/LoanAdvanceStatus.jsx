import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CreditCard } from 'lucide-react';
import { PageHeader, SectionCard, Badge, EmptyState } from '../components/PortalUI';
import { fetchMyLoanAdvanceStatus } from '../../../slices/HRSlice/employeePortalSlice';

const advanceTypeLabel = { LTA: 'Long Term Advance', SA: 'Salary Advance' };

const statusBadgeClass = (status) =>
    status === 'Running'
        ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400'
        : status === 'Closed'
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
            : 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300';

const formatAmount = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;

const LoanAdvanceStatus = ({ employeeData }) => {
    const dispatch = useDispatch();
    const { loanAdvanceStatus, loading } = useSelector((state) => state.employeePortal);

    const empRefNo = employeeData?.EmpRefno;

    useEffect(() => {
        if (empRefNo) {
            dispatch(fetchMyLoanAdvanceStatus(empRefNo));
        }
    }, [dispatch, empRefNo]);

    const loans = loanAdvanceStatus?.Loans || [];
    const repayments = loanAdvanceStatus?.RepaymentHistory || [];
    const skipped = loanAdvanceStatus?.SkippedMonths || [];

    return (
        <div>
            <PageHeader title="Loan / Advance Status" subtitle="Your LTA and salary advance outstanding balance & EMI history" icon={CreditCard} />

            {loading.loanAdvanceStatus ? (
                <p className="text-sm text-gray-400 py-6 text-center">Loading…</p>
            ) : loans.length === 0 ? (
                <SectionCard>
                    <EmptyState
                        icon={CreditCard}
                        title="No loans or advances found"
                        subtitle="Any approved LTA or salary advance you take will show its EMI status here."
                    />
                </SectionCard>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        {loans.map((loan) => (
                            <SectionCard key={`${loan.TransactionRefNo}-${loan.AdvanceType}`}>
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                            {advanceTypeLabel[loan.AdvanceType] || loan.AdvanceType}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5">Ref: {loan.TransactionRefNo}</p>
                                    </div>
                                    <Badge className={statusBadgeClass(loan.LoanStatus)}>{loan.LoanStatus}</Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <div>
                                        <p className="text-xs text-gray-400">Outstanding Balance</p>
                                        <p className="text-lg font-bold text-[#0d1b5e] dark:text-white">{formatAmount(loan.OutstandingBalance)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400">EMI Amount</p>
                                        <p className="text-lg font-bold text-[#0d1b5e] dark:text-white">{formatAmount(loan.EMIAmount)}</p>
                                    </div>
                                </div>

                                <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden mb-1.5">
                                    <div
                                        className="h-full rounded-full bg-orange-500"
                                        style={{
                                            width: `${loan.NoOfInstallments ? Math.min(100, (loan.NoOfPaidInstallments / loan.NoOfInstallments) * 100) : 0}%`,
                                        }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-gray-400 mb-3">
                                    <span>{loan.NoOfPaidInstallments} paid</span>
                                    <span>{loan.NoOfInstallments} installments</span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-700">
                                    <div>
                                        <span className="block text-gray-400">Principal</span>
                                        <span className="font-medium text-gray-700 dark:text-gray-200">{formatAmount(loan.PrincipalAmount)}</span>
                                    </div>
                                    <div>
                                        <span className="block text-gray-400">Requested</span>
                                        <span className="font-medium text-gray-700 dark:text-gray-200">{loan.RequestedDate || '—'}</span>
                                    </div>
                                    <div>
                                        <span className="block text-gray-400">Disbursed</span>
                                        <span className="font-medium text-gray-700 dark:text-gray-200">{loan.DisbursementDate || '—'}</span>
                                    </div>
                                    <div>
                                        <span className="block text-gray-400">{loan.LoanStatus === 'Closed' ? 'Closed On' : 'Cost Centre'}</span>
                                        <span className="font-medium text-gray-700 dark:text-gray-200">
                                            {loan.LoanStatus === 'Closed' ? (loan.ClosingDate || '—') : (loan.CCName || loan.CCCode || '—')}
                                        </span>
                                    </div>
                                </div>
                            </SectionCard>
                        ))}
                    </div>

                    {repayments.length > 0 && (
                        <SectionCard title="Repayment History" icon={CreditCard} className="mb-6">
                            <div className="overflow-x-auto -mx-4 sm:-mx-5">
                                <table className="w-full min-w-[520px]">
                                    <thead>
                                        <tr className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-gray-100 dark:border-gray-700">
                                            <th className="px-4 sm:px-5 py-2.5">Month</th>
                                            <th className="px-2 py-2.5">Loan</th>
                                            <th className="px-2 py-2.5">Installment</th>
                                            <th className="px-2 py-2.5 text-right">EMI Paid</th>
                                            <th className="px-4 sm:px-5 py-2.5 text-right">Balance After</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700/60">
                                        {repayments.map((r, idx) => (
                                            <tr key={`${r.TransactionRefNo}-${r.PayRollRefno}-${idx}`} className="text-sm">
                                                <td className="px-4 sm:px-5 py-2.5 font-medium text-gray-800 dark:text-gray-100 whitespace-nowrap">{r.RepaymentMonth}</td>
                                                <td className="px-2 py-2.5 text-gray-500 dark:text-gray-400">{advanceTypeLabel[r.AdvanceType] || r.AdvanceType}</td>
                                                <td className="px-2 py-2.5 text-gray-500 dark:text-gray-400">#{r.InstallmentNo}</td>
                                                <td className="px-2 py-2.5 text-right text-gray-800 dark:text-gray-100">{formatAmount(r.EMIPaid)}</td>
                                                <td className="px-4 sm:px-5 py-2.5 text-right text-gray-500 dark:text-gray-400">{formatAmount(r.BalanceAfterPayment)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </SectionCard>
                    )}

                    {skipped.length > 0 && (
                        <SectionCard title="Skipped / Held Deductions" icon={CreditCard}>
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                {skipped.map((s, idx) => (
                                    <div key={`${s.TransactionRefNo}-${idx}`} className="flex items-center justify-between gap-3 py-3">
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                                {advanceTypeLabel[s.AdvanceType] || s.AdvanceType}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5">{s.SkippedOnDate}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{formatAmount(s.SkippedAmount)}</p>
                                            <p className="text-xs text-gray-400">{s.Status}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>
                    )}
                </>
            )}
        </div>
    );
};

export default LoanAdvanceStatus;
