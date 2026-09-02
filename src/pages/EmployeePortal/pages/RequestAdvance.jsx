import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Wallet, UserCheck } from 'lucide-react';
import RequestFormBase from '../components/RequestFormBase';
import { SectionCard } from '../components/PortalUI';
import { fetchMyReportingPerson, submitPortalAdvanceRequest } from '../../../slices/HRSlice/employeePortalSlice';

const ADVANCE_TYPES = [
    { label: 'Long Term Advance', value: 'LTA' },
    { label: 'Salary Advance', value: 'SA' },
];

const RequestAdvance = ({ employeeData }) => {
    const dispatch = useDispatch();
    const { reportingPerson, loading } = useSelector((state) => state.employeePortal);

    const empRefNo = employeeData?.EmpRefno;
    const username = employeeData?.Username;

    useEffect(() => {
        if (empRefNo) dispatch(fetchMyReportingPerson(empRefNo));
    }, [dispatch, empRefNo]);

    const fields = [
        { name: 'advanceType', label: 'Advance Type', type: 'select', required: true, options: ADVANCE_TYPES.map((t) => t.label) },
        { name: 'amount', label: 'Amount Requested (₹)', type: 'number', required: true, placeholder: '0.00' },
        { name: 'emiAmount', label: 'Monthly EMI (₹)', type: 'number', required: true, placeholder: '0.00' },
        { name: 'emiStartDate', label: 'EMI Starts From', type: 'date', required: true },
        { name: 'purpose', label: 'Purpose', type: 'textarea', required: true, span: 2, placeholder: 'Briefly describe why the advance is needed' },
    ];

    const handleSubmit = async (values) => {
        if (!empRefNo) throw new Error('Employee reference not found — please log in again.');

        const advanceType = ADVANCE_TYPES.find((t) => t.label === values.advanceType)?.value;
        if (!advanceType) throw new Error('Please choose an advance type');

        const amount = Number(values.amount);
        const emiAmount = Number(values.emiAmount);
        if (!(amount > 0)) throw new Error('Amount must be greater than zero');
        if (!(emiAmount > 0)) throw new Error('EMI must be greater than zero');
        if (advanceType === 'LTA' && emiAmount > amount) throw new Error('EMI cannot be greater than the advance amount');

        try {
            const result = await dispatch(submitPortalAdvanceRequest({
                EmpRefNo: empRefNo,
                AdvanceType: advanceType,
                LTAAmount: amount,
                EmiAmount: emiAmount,
                EMIStartDate: values.emiStartDate,
                Purpose: values.purpose,
                RequestDate: null,
                CreatedBy: username || empRefNo,
            })).unwrap();

            const status = result?.Data || '';
            if (!status.toLowerCase().includes('submit')) {
                throw new Error(status.replace('Error$', '') || 'Failed to submit advance request');
            }
        } catch (err) {
            throw new Error(typeof err === 'string' ? err : err?.message || 'Failed to submit advance request');
        }
    };

    const sidePanel = (
        <SectionCard title="Where This Goes" icon={UserCheck}>
            <div className="space-y-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Your request is first verified by your reporting person. Once accepted it enters the standard
                    advance approval workflow.
                </p>
                <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <UserCheck className="w-4 h-4 text-gray-400 shrink-0" />
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Routes for verification to</p>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                            {loading.reportingPerson ? 'Loading…' : reportingPerson?.EmployeeName?.trim() || 'Not configured'}
                        </p>
                    </div>
                </div>
            </div>
        </SectionCard>
    );

    return (
        <RequestFormBase
            title="Request Advance"
            subtitle="Raise a long term or salary advance request"
            icon={Wallet}
            fields={fields}
            submitLabel="Submit Advance Request"
            onSubmit={handleSubmit}
            sidePanel={sidePanel}
            reportingPersonName={reportingPerson?.EmployeeName?.trim() || 'your reporting person'}
        />
    );
};

export default RequestAdvance;
