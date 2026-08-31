import React from 'react';
import { PlaneTakeoff } from 'lucide-react';
import RequestFormBase from '../components/RequestFormBase';

const fields = [
    { name: 'travelType', label: 'Travel Type', type: 'select', required: true, options: ['Domestic', 'Family Travel', 'Block Year Claim'] },
    { name: 'travelDate', label: 'Date of Travel', type: 'date', required: true },
    { name: 'destination', label: 'Destination', type: 'text', required: true, placeholder: 'e.g. Kochi to Bengaluru' },
    { name: 'amount', label: 'Claim Amount (₹)', type: 'number', required: true, placeholder: '0.00' },
    { name: 'remarks', label: 'Remarks', type: 'textarea', span: 2, placeholder: 'Additional details, co-travellers etc.' },
];

const RequestLTA = () => (
    <RequestFormBase
        title="Request LTA"
        subtitle="Raise a Leave Travel Allowance claim"
        icon={PlaneTakeoff}
        fields={fields}
        submitLabel="Submit LTA Request"
    />
);

export default RequestLTA;
