import React from 'react';
import { Users2, Star } from 'lucide-react';
import { PageHeader, DemoBanner, SectionCard } from '../components/PortalUI';
import { reportees } from '../data/dummyData';

const MyReportees = ({ onNavigate }) => (
    <div>
        <PageHeader title="My Reportees" subtitle="Employees who report to you" icon={Users2} />
        <DemoBanner />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportees.map((r) => (
                <SectionCard key={r.id}>
                    <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-full ${r.avatarColor} text-white flex items-center justify-center text-sm font-bold shrink-0`}>
                            {r.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{r.name}</p>
                            <p className="text-xs text-gray-400 truncate">{r.designation}</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <div>
                            <p className="text-xs text-gray-400">Department</p>
                            <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">{r.department}</p>
                        </div>
                        <button
                            onClick={() => onNavigate && onNavigate('performance-evaluation')}
                            className="flex items-center gap-1 text-xs font-semibold text-orange-500 hover:text-orange-600"
                        >
                            <Star className="w-3.5 h-3.5" /> Evaluate
                        </button>
                    </div>
                </SectionCard>
            ))}
        </div>
    </div>
);

export default MyReportees;
