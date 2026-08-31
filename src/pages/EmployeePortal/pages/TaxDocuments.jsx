import React from 'react';
import { ScrollText, Download } from 'lucide-react';
import { toast } from 'react-toastify';
import { PageHeader, DemoBanner, SectionCard, SecondaryButton } from '../components/PortalUI';
import { taxDocuments } from '../data/dummyData';

const TaxDocuments = () => (
    <div>
        <PageHeader title="Form 16 / Tax" subtitle="Your tax-related documents" icon={ScrollText} />
        <DemoBanner />

        <SectionCard title="Documents" icon={ScrollText}>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {taxDocuments.map((doc) => (
                    <div key={doc.name} className="flex items-center justify-between gap-3 py-3">
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{doc.name}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{doc.type} · {doc.date}</p>
                        </div>
                        <SecondaryButton
                            className="!px-3 !py-1.5 shrink-0"
                            onClick={() => toast.info('Demo preview — document download will be enabled once connected to live records.')}
                        >
                            <Download className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Download</span>
                        </SecondaryButton>
                    </div>
                ))}
            </div>
        </SectionCard>
    </div>
);

export default TaxDocuments;
