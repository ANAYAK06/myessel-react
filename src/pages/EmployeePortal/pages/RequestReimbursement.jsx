import React from 'react';
import { Receipt } from 'lucide-react';
import RequestFormBase from '../components/RequestFormBase';

const fields = [
    { name: 'category', label: 'Expense Category', type: 'select', required: true, options: ['Travel & Conveyance', 'Site Expenses', 'Communication', 'Client Entertainment', 'Other'] },
    { name: 'expenseDate', label: 'Expense Date', type: 'date', required: true },
    { name: 'amount', label: 'Amount (₹)', type: 'number', required: true, placeholder: '0.00' },
    { name: 'project', label: 'Project / Site', type: 'text', placeholder: 'e.g. Site B — Phase 2' },
    { name: 'description', label: 'Description', type: 'textarea', required: true, span: 2, placeholder: 'Describe the expense — bills to be attached during review' },
];

const RequestReimbursement = () => (
    <RequestFormBase
        title="Request Reimbursement"
        subtitle="Raise an expense claim"
        icon={Receipt}
        fields={fields}
        submitLabel="Submit Reimbursement"
    />
);

export default RequestReimbursement;
