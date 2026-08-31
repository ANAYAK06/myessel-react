import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CalendarCheck, Wallet, CalendarClock, UserCheck } from 'lucide-react';
import RequestFormBase from '../components/RequestFormBase';
import { SectionCard } from '../components/PortalUI';
import { fetchLeaveTypesForPortal, fetchLeaveApplicationContext, fetchMyReportingPerson, submitPortalLeaveRequest } from '../../../slices/HRSlice/employeePortalSlice';

const RequestLeave = ({ employeeData }) => {
    const dispatch = useDispatch();
    const { leaveTypes, leaveApplicationContext, reportingPerson, loading } = useSelector((state) => state.employeePortal);

    const username = employeeData?.Username;
    const empRefNo = employeeData?.EmpRefno;

    useEffect(() => {
        if (username) {
            dispatch(fetchLeaveTypesForPortal(username));
        }
    }, [dispatch, username]);

    useEffect(() => {
        if (empRefNo) {
            dispatch(fetchLeaveApplicationContext(empRefNo));
            dispatch(fetchMyReportingPerson(empRefNo));
        }
    }, [dispatch, empRefNo]);

    const leaveTypeByName = useMemo(
        () => Object.fromEntries((leaveTypes || []).map((lt) => [lt.LeaveName, lt.LeaveId])),
        [leaveTypes]
    );

    const fields = [
        {
            name: 'leaveType',
            label: 'Leave Type',
            type: 'select',
            required: true,
            options: (leaveTypes || []).map((lt) => lt.LeaveName),
        },
        { name: 'fromDate', label: 'From Date', type: 'date', required: true },
        { name: 'toDate', label: 'To Date', type: 'date', required: true },
        { name: 'contact', label: 'Contact Number During Leave', type: 'text', placeholder: '+91 98765 43210' },
        { name: 'reason', label: 'Reason', type: 'textarea', required: true, span: 2, placeholder: 'Briefly describe the reason for leave' },
    ];

    const handleSubmit = async (values) => {
        if (!empRefNo) {
            throw new Error('Employee reference not found — please log in again.');
        }

        const fromDate = new Date(values.fromDate);
        const toDate = new Date(values.toDate);
        const noOfDays = Math.floor((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1;
        if (!(noOfDays > 0)) {
            throw new Error('To Date must be on or after From Date');
        }

        try {
            const result = await dispatch(submitPortalLeaveRequest({
                EmpRefNo: empRefNo,
                LeaveTypeId: leaveTypeByName[values.leaveType],
                FromDate: values.fromDate,
                ToDate: values.toDate,
                NoOfDays: noOfDays,
                ContactNumber: values.contact,
                Reason: values.reason,
                CreatedBy: username || empRefNo,
            })).unwrap();

            const status = result?.Data || '';
            if (!status.toLowerCase().includes('submit')) {
                throw new Error(status.replace('Error$', '') || 'Failed to submit leave request');
            }
        } catch (err) {
            throw new Error(typeof err === 'string' ? err : err?.message || 'Failed to submit leave request');
        }
    };

    const sidePanel = (
        <SectionCard title="Leave Balance" icon={Wallet}>
            {loading.leaveApplicationContext ? (
                <p className="text-sm text-gray-400">Loading…</p>
            ) : (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Balance (current year)</span>
                        <span className="text-lg font-bold text-[#0d1b5e] dark:text-white">
                            {leaveApplicationContext?.Balanceleaves ?? '—'} {leaveApplicationContext?.Balanceleaves != null && 'days'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                        <CalendarClock className="w-4 h-4 text-gray-400 shrink-0" />
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Return from last leave</p>
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                {leaveApplicationContext?.PreviousLRDate || '—'}
                            </p>
                        </div>
                    </div>
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
            )}
        </SectionCard>
    );

    return (
        <RequestFormBase
            title="Request Leave"
            subtitle="Raise a leave request for approval"
            icon={CalendarCheck}
            fields={fields}
            submitLabel="Submit Leave Request"
            onSubmit={handleSubmit}
            isDemo={false}
            sidePanel={sidePanel}
            reportingPersonName={reportingPerson?.EmployeeName?.trim() || 'your reporting person'}
        />
    );
};

export default RequestLeave;
