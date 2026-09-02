import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ListChecks } from 'lucide-react';
import { PageHeader, SectionCard, Badge, EmptyState } from '../components/PortalUI';
import { requestStatusStyles } from '../data/dummyData';
import { fetchMyPortalRequests } from '../../../slices/HRSlice/employeePortalSlice';

const tabs = ['All', 'Pending', 'Approved', 'Rejected'];

const advanceTypeLabel = { LTA: 'Long Term Advance', SA: 'Salary Advance' };
const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const titleOf = (r) => {
    if (r.RequestType === 'Advance') {
        return `${advanceTypeLabel[r.AdvanceType] || 'Advance'} — ${money(r.Amount)}`;
    }
    return `${r.LeaveName || 'Leave'} — ${r.NoOfDays} day${Number(r.NoOfDays) === 1 ? '' : 's'}`;
};

const subOf = (r) => {
    if (r.RequestType === 'Advance') {
        const inst = r.NoOfInstallments ? ` × ${Math.round(r.NoOfInstallments)}` : '';
        return `Advance · EMI ${money(r.EMIAmount)}${inst}${r.EMIStartDate ? ` from ${r.EMIStartDate}` : ''}`;
    }
    return `Leave · ${r.FromDate} → ${r.ToDate}`;
};

const MyRequests = ({ employeeData }) => {
    const dispatch = useDispatch();
    const { myPortalRequests, loading } = useSelector((state) => state.employeePortal);

    const empRefNo = employeeData?.EmpRefno;
    const [tab, setTab] = useState('All');

    useEffect(() => {
        if (empRefNo) dispatch(fetchMyPortalRequests(empRefNo));
    }, [dispatch, empRefNo]);

    const rows = Array.isArray(myPortalRequests) ? myPortalRequests : [];
    const filtered = tab === 'All' ? rows : rows.filter((r) => r.Status === tab);

    return (
        <div>
            <PageHeader title="My Requests" subtitle="Track the status of everything you have submitted from the portal" icon={ListChecks} />

            <SectionCard title="Request History" icon={ListChecks}>
                <div className="flex gap-2 mb-4 overflow-x-auto pb-1 -mx-1 px-1">
                    {tabs.map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                                tab === t
                                    ? 'bg-[#0d1b5e] dark:bg-orange-500 text-white'
                                    : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'
                            }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {loading.myPortalRequests ? (
                    <p className="text-sm text-gray-400 py-6 text-center">Loading…</p>
                ) : filtered.length === 0 ? (
                    <EmptyState icon={ListChecks} title="No requests found" subtitle="Nothing matches this filter yet." />
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {filtered.map((r) => (
                            <div key={`${r.RequestType}-${r.Id}`} className="flex items-start justify-between gap-3 py-3">
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{titleOf(r)}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {subOf(r)} · submitted {r.SubmittedOn}
                                        {r.Status === 'Approved' && r.TransactionRefNo ? ` · Ref ${r.TransactionRefNo}` : ''}
                                    </p>
                                    {r.Reason && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                            {r.RequestType === 'Advance' ? 'Purpose' : 'Reason'}: {r.Reason}
                                        </p>
                                    )}
                                    {r.Status === 'Rejected' && r.RejectRemarks && (
                                        <p className="text-xs text-rose-500 mt-0.5">Rejected: {r.RejectRemarks}</p>
                                    )}
                                </div>
                                <Badge className={`${requestStatusStyles[r.Status] || ''} shrink-0`}>{r.Status}</Badge>
                            </div>
                        ))}
                    </div>
                )}
            </SectionCard>
        </div>
    );
};

export default MyRequests;
