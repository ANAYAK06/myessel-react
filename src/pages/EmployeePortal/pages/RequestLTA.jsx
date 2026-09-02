import React from 'react';
import { PlaneTakeoff } from 'lucide-react';
import { PageHeader, UnderDevelopment } from '../components/PortalUI';

const RequestLTA = () => (
    <div>
        <PageHeader title="Request LTA" subtitle="Raise a Leave Travel Allowance claim" icon={PlaneTakeoff} />
        <UnderDevelopment />
    </div>
);

export default RequestLTA;
