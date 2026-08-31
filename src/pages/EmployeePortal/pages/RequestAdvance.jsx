import React from 'react';
import { Wallet } from 'lucide-react';
import RequestFormBase from '../components/RequestFormBase';

const fields = [
    { name: 'advanceType', label: 'Advance Type', type: 'select', required: true, options: ['Salary Advance', 'Travel Advance', 'Medical Advance'] },
    { name: 'amount', label: 'Amount Requested (₹)', type: 'number', required: true, placeholder: '0.00' },
    { name: 'requiredBy', label: 'Required By', type: 'date', required: true },
    { name: 'repayment', label: 'Preferred Repayment', type: 'select', options: ['Lump sum next salary', '2 installments', '3 installments'] },
    { name: 'reason', label: 'Reason', type: 'textarea', required: true, span: 2, placeholder: 'Briefly describe why the advance is needed' },
];

const RequestAdvance = () => (
    <RequestFormBase
        title="Request Advance"
        subtitle="Raise a salary or travel advance request"
        icon={Wallet}
        fields={fields}
        submitLabel="Submit Advance Request"
    />
);

export default RequestAdvance;
