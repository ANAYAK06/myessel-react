import React from 'react';
import { Receipt } from 'lucide-react';
import { PageHeader, UnderDevelopment } from '../components/PortalUI';

const RequestReimbursement = () => (
    <div>
        <PageHeader title="Request Reimbursement" subtitle="Raise an expense claim" icon={Receipt} />
        <UnderDevelopment />
    </div>
);

export default RequestReimbursement;
