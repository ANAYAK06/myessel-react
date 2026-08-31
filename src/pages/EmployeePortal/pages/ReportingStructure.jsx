import React from 'react';
import { Network, ChevronDown, User } from 'lucide-react';
import { PageHeader, DemoBanner, SectionCard } from '../components/PortalUI';
import { reportingChain } from '../data/dummyData';

const ReportingStructure = ({ fullName }) => (
    <div>
        <PageHeader title="Reporting Structure" subtitle="Who your requests are routed through for verification" icon={Network} />
        <DemoBanner />

        <SectionCard title="Your Reporting Chain" icon={Network}>
            <div className="flex flex-col items-center py-2">
                {reportingChain.map((p, i) => (
                    <React.Fragment key={p.name}>
                        <div
                            className={`w-full max-w-sm rounded-xl p-4 border ${
                                p.level === 'self'
                                    ? 'bg-[#0d1b5e] dark:bg-[#0a1240] border-transparent text-white'
                                    : p.level === 'default'
                                        ? 'bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20'
                                        : 'bg-white dark:bg-white/5 border-gray-200 dark:border-gray-700'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                    p.level === 'self' ? 'bg-white/15 text-orange-300' : 'bg-[#0d1b5e]/10 dark:bg-white/10 text-[#0d1b5e] dark:text-orange-300'
                                }`}>
                                    <User className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className={`text-sm font-bold truncate ${p.level === 'self' ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}>
                                        {p.level === 'self' ? (fullName || 'You') : p.name}
                                    </p>
                                    <p className={`text-xs truncate ${p.level === 'self' ? 'text-orange-200' : 'text-gray-400'}`}>{p.role}</p>
                                </div>
                            </div>
                        </div>
                        {i < reportingChain.length - 1 && (
                            <ChevronDown className="w-5 h-5 text-orange-400 my-2 shrink-0" />
                        )}
                    </React.Fragment>
                ))}
            </div>
            <p className="text-xs text-gray-400 text-center mt-4 max-w-md mx-auto">
                Reporting connections are configured centrally in the main application. Requests you raise are first verified by your direct reporting person before entering the standard approval workflow.
            </p>
        </SectionCard>
    </div>
);

export default ReportingStructure;
