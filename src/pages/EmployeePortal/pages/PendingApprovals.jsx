import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { ClipboardCheck, Check, X, CalendarCheck, Wallet } from 'lucide-react';
import { PageHeader, SectionCard, EmptyState, SecondaryButton, PrimaryButton } from '../components/PortalUI';
import {
    fetchPortalPendingApprovals,
    actionPortalRequest,
} from '../../../slices/HRSlice/employeePortalSlice';

const requestTypeIcon = { Leave: CalendarCheck, Advance: Wallet };
const advanceTypeLabel = { LTA: 'Long Term Advance', SA: 'Salary Advance' };
const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

// One-line summary of what the request is, per kind.
const summarise = (r) => {
    if (r.RequestType === 'Advance') {
        const inst = r.NoOfInstallments ? ` × ${Math.round(r.NoOfInstallments)}` : '';
        return `${advanceTypeLabel[r.AdvanceType] || 'Advance'} — ${money(r.Amount)} (EMI ${money(r.EMIAmount)}${inst})`;
    }
    return `${r.LeaveName || 'Leave'} — ${r.NoOfDays} day${Number(r.NoOfDays) === 1 ? '' : 's'} (${r.FromDate} → ${r.ToDate})`;
};
const kindWord = (r) => (r.RequestType === 'Advance' ? 'advance' : 'leave');

const PendingApprovals = ({ employeeData }) => {
    const dispatch = useDispatch();
    const { portalPendingApprovals, loading } = useSelector((state) => state.employeePortal);

    const empRefNo = employeeData?.EmpRefno;

    const [rejectingId, setRejectingId] = useState(null);
    const [rejectRemarks, setRejectRemarks] = useState('');
    const [busyId, setBusyId] = useState(null);

    const load = () => {
        if (empRefNo) dispatch(fetchPortalPendingApprovals(empRefNo));
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, empRefNo]);

    const items = Array.isArray(portalPendingApprovals) ? portalPendingApprovals : [];

    const runAction = async (item, action, remarks) => {
        setBusyId(item.Id);
        try {
            const res = await dispatch(actionPortalRequest({
                Id: item.Id,
                RequestType: item.RequestType,
                Action: action,
                ActionBy: empRefNo,
                RejectRemarks: remarks || null,
            })).unwrap();

            const status = res?.Data || '';
            const ok = status.startsWith('Approved') || status.startsWith('Rejected');
            if (!ok) {
                throw new Error(status.replace('Error$', '') || 'Failed to submit decision');
            }
            const who = item.EmployeeName?.trim() || 'Request';
            toast.success(
                action === 'Approve'
                    ? `${who} — ${kindWord(item)} accepted and sent to the approval workflow.`
                    : `${who} — ${kindWord(item)} rejected.`
            );
            setRejectingId(null);
            setRejectRemarks('');
            load();
        } catch (err) {
            toast.error(typeof err === 'string' ? err : err?.message || 'Failed to submit decision');
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div>
            <PageHeader title="Pending Approvals" subtitle="Verify leave and advance requests from employees who report to you" icon={ClipboardCheck} />

            <SectionCard title={`Awaiting Your Verification (${items.length})`} icon={ClipboardCheck}>
                {loading.portalPendingApprovals ? (
                    <p className="text-sm text-gray-400 py-6 text-center">Loading…</p>
                ) : items.length === 0 ? (
                    <EmptyState icon={ClipboardCheck} title="All caught up" subtitle="No requests are waiting on your verification right now." />
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {items.map((r) => {
                            const Icon = requestTypeIcon[r.RequestType] || ClipboardCheck;
                            const isRejecting = rejectingId === r.Id;
                            const isBusy = busyId === r.Id;
                            return (
                                <div key={`${r.RequestType}-${r.Id}`} className="py-3.5">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                        <div className="min-w-0 flex gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-[#0d1b5e]/10 dark:bg-white/10 flex items-center justify-center shrink-0">
                                                <Icon className="w-4.5 h-4.5 text-[#0d1b5e] dark:text-orange-300" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{r.EmployeeName?.trim()}</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">{summarise(r)}</p>
                                                {r.Reason && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                        {r.RequestType === 'Advance' ? 'Purpose' : 'Reason'}: {r.Reason}
                                                    </p>
                                                )}
                                                {r.RequestType === 'Advance' && r.EMIStartDate && (
                                                    <p className="text-xs text-gray-400 mt-0.5">EMI starts {r.EMIStartDate}</p>
                                                )}
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    {r.RequestType} · {r.EmpRefNo}
                                                    {r.ContactNumber ? ` · ${r.ContactNumber}` : ''} · submitted {r.SubmittedOn}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <SecondaryButton
                                                className="!px-3 !py-1.5 !border-rose-300 dark:!border-rose-500/40 !text-rose-600 dark:!text-rose-400"
                                                disabled={isBusy}
                                                onClick={() => { setRejectingId(isRejecting ? null : r.Id); setRejectRemarks(''); }}
                                            >
                                                <X className="w-3.5 h-3.5" /> Reject
                                            </SecondaryButton>
                                            <PrimaryButton
                                                className="!px-3 !py-1.5"
                                                disabled={isBusy}
                                                onClick={() => runAction(r, 'Approve')}
                                            >
                                                <Check className="w-3.5 h-3.5" /> {isBusy ? 'Working…' : 'Accept'}
                                            </PrimaryButton>
                                        </div>
                                    </div>

                                    {isRejecting && (
                                        <div className="mt-3 sm:ml-12 rounded-lg border border-rose-200 dark:border-rose-500/30 bg-rose-50/60 dark:bg-rose-500/5 p-3">
                                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                                                Reason for rejection <span className="text-rose-500">*</span>
                                            </label>
                                            <textarea
                                                rows={2}
                                                value={rejectRemarks}
                                                onChange={(e) => setRejectRemarks(e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
                                                placeholder="Let the employee know why this request is being rejected"
                                            />
                                            <div className="flex justify-end gap-2 mt-2">
                                                <SecondaryButton className="!px-3 !py-1.5" onClick={() => { setRejectingId(null); setRejectRemarks(''); }}>
                                                    Cancel
                                                </SecondaryButton>
                                                <PrimaryButton
                                                    className="!px-3 !py-1.5 !bg-rose-600 hover:!bg-rose-700"
                                                    disabled={isBusy || !rejectRemarks.trim()}
                                                    onClick={() => runAction(r, 'Reject', rejectRemarks.trim())}
                                                >
                                                    {isBusy ? 'Working…' : 'Confirm Reject'}
                                                </PrimaryButton>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </SectionCard>
        </div>
    );
};

export default PendingApprovals;
