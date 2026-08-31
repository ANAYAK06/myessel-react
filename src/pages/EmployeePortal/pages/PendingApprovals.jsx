import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { ClipboardCheck, Check, X } from 'lucide-react';
import { PageHeader, DemoBanner, SectionCard, EmptyState, SecondaryButton, PrimaryButton } from '../components/PortalUI';
import { pendingApprovals as initialApprovals } from '../data/dummyData';

const PendingApprovals = () => {
    const [items, setItems] = useState(initialApprovals);

    const resolve = (id, action) => {
        setItems((prev) => prev.filter((i) => i.id !== id));
        toast[action === 'accept' ? 'success' : 'warn'](
            action === 'accept'
                ? 'Request accepted — sent to the standard approval workflow (demo).'
                : 'Request rejected (demo).'
        );
    };

    return (
        <div>
            <PageHeader title="Pending Approvals" subtitle="Verify requests from employees who report to you" icon={ClipboardCheck} />
            <DemoBanner text="Demo preview — accepting or rejecting here does not affect real records." />

            <SectionCard title={`Awaiting Your Verification (${items.length})`} icon={ClipboardCheck}>
                {items.length === 0 ? (
                    <EmptyState icon={ClipboardCheck} title="All caught up" subtitle="No requests are waiting on your verification right now." />
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {items.map((r) => (
                            <div key={r.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5">
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{r.employee}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">{r.description}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{r.id} · {r.type} · submitted {r.submitted}</p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <SecondaryButton className="!px-3 !py-1.5 !border-rose-300 dark:!border-rose-500/40 !text-rose-600 dark:!text-rose-400" onClick={() => resolve(r.id, 'reject')}>
                                        <X className="w-3.5 h-3.5" /> Reject
                                    </SecondaryButton>
                                    <PrimaryButton className="!px-3 !py-1.5" onClick={() => resolve(r.id, 'accept')}>
                                        <Check className="w-3.5 h-3.5" /> Accept
                                    </PrimaryButton>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </SectionCard>
        </div>
    );
};

export default PendingApprovals;
