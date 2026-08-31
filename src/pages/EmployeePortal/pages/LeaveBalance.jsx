import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CalendarCheck } from 'lucide-react';
import { PageHeader, SectionCard, EmptyState } from '../components/PortalUI';
import { fetchMyLeaveBalances } from '../../../slices/HRSlice/employeePortalSlice';

const barColors = ['bg-blue-500', 'bg-orange-500', 'bg-emerald-500', 'bg-rose-500', 'bg-purple-500', 'bg-cyan-500'];

const LeaveBalance = ({ employeeData }) => {
    const dispatch = useDispatch();
    const { leaveBalances, loading } = useSelector((state) => state.employeePortal);

    const empRefNo = employeeData?.EmpRefno;

    useEffect(() => {
        if (empRefNo) {
            dispatch(fetchMyLeaveBalances(empRefNo));
        }
    }, [dispatch, empRefNo]);

    return (
        <div>
            <PageHeader title="Leave Balance" subtitle="Your entitlement and usage by leave type" icon={CalendarCheck} />

            {loading.leaveBalances ? (
                <p className="text-sm text-gray-400 py-6 text-center">Loading…</p>
            ) : leaveBalances.length === 0 ? (
                <SectionCard>
                    <EmptyState
                        icon={CalendarCheck}
                        title="No leave balance found"
                        subtitle="Your leave entitlements will appear here once assigned."
                    />
                </SectionCard>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {leaveBalances.map((l, index) => {
                        const assigned = Number(l.AssignedLeaves || 0);
                        const balance = Math.max(0, Number(l.BalanceLeaves || 0));
                        const used = Math.max(0, assigned - balance);
                        const pct = assigned ? Math.min(100, (used / assigned) * 100) : 0;
                        return (
                            <SectionCard key={l.LeaveTypeId}>
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{l.LeaveName}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-bold text-[#0d1b5e] dark:text-white">{balance}</p>
                                        <p className="text-xs text-gray-400">days left</p>
                                    </div>
                                </div>
                                <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                                    <div className={`h-full rounded-full ${barColors[index % barColors.length]}`} style={{ width: `${pct}%` }} />
                                </div>
                                <div className="flex justify-between text-xs text-gray-400 mt-1.5">
                                    <span>{used} used</span>
                                    <span>{assigned} entitled</span>
                                </div>
                            </SectionCard>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default LeaveBalance;
