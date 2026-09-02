import React from 'react';
import { ScrollText } from 'lucide-react';
import { PageHeader, UnderDevelopment } from '../components/PortalUI';

const TaxDocuments = () => (
    <div>
        <PageHeader title="Form 16 / Tax" subtitle="Your tax-related documents" icon={ScrollText} />
        <UnderDevelopment />
    </div>
);

export default TaxDocuments;
