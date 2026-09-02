import React from 'react';
import { Network } from 'lucide-react';
import { PageHeader, UnderDevelopment } from '../components/PortalUI';

const ReportingStructure = () => (
    <div>
        <PageHeader title="Reporting Structure" subtitle="Who your requests are routed through for verification" icon={Network} />
        <UnderDevelopment />
    </div>
);

export default ReportingStructure;
