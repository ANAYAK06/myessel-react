import React from 'react';
import { Users2 } from 'lucide-react';
import { PageHeader, UnderDevelopment } from '../components/PortalUI';

const MyReportees = () => (
    <div>
        <PageHeader title="My Reportees" subtitle="Employees who report to you" icon={Users2} />
        <UnderDevelopment />
    </div>
);

export default MyReportees;
