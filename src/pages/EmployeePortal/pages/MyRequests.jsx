import React, { useState } from 'react';
import { ListChecks } from 'lucide-react';
import { PageHeader, DemoBanner, SectionCard, Badge, EmptyState } from '../components/PortalUI';
import { myRequests, requestStatusStyles } from '../data/dummyData';

const tabs = ['All', 'Pending', 'Verified', 'Approved', 'Rejected'];

const MyRequests = () => {
    const [tab, setTab] = useState('All');
    const filtered = tab === 'All' ? myRequests : myRequests.filter((r) => r.status === tab);

    return (
        <div>
            <PageHeader title="My Requests" subtitle="Track the status of everything you have submitted" icon={ListChecks} />
            <DemoBanner />

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

                {filtered.length === 0 ? (
                    <EmptyState icon={ListChecks} title="No requests found" subtitle="Nothing matches this filter yet." />
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {filtered.map((r) => (
                            <div key={r.id} className="flex items-center justify-between gap-3 py-3">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{r.description}</p>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-0.5">{r.id} · {r.type} · {r.date}</p>
                                </div>
                                <Badge className={`${requestStatusStyles[r.status]} shrink-0`}>{r.status}</Badge>
                            </div>
                        ))}
                    </div>
                )}
            </SectionCard>
        </div>
    );
};

export default MyRequests;
