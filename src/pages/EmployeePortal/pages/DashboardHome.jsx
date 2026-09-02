import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    CalendarCheck, Clock, Wallet, ListChecks, ArrowRight, Bell,
    CreditCard, ClipboardCheck,
} from 'lucide-react';
import { PageHeader, SectionCard, StatCard, Badge, requestStatusStyles } from '../components/PortalUI';
import {
    fetchMyLeaveBalances, fetchMyPayslipList, fetchMyAttendance, fetchMyPortalRequests,
} from '../../../slices/HRSlice/employeePortalSlice';

const leaveBarColors = ['bg-blue-500', 'bg-orange-500', 'bg-emerald-500', 'bg-rose-500', 'bg-purple-500', 'bg-cyan-500'];

const quickActions = [
    { key: 'request-leave', label: 'Request Leave', icon: CalendarCheck },
    { key: 'request-advance', label: 'Request Advance', icon: Wallet },
    { key: 'my-requests', label: 'My Requests', icon: ListChecks },
    { key: 'loan-advance-status', label: 'Loan / Advance', icon: CreditCard },
];

const DashboardHome = ({ fullName, designation, onNavigate, isReportingPerson, employeeData }) => {
    const dispatch = useDispatch();
    const {
        leaveBalances, payslipList, attendanceData, loading,
        myPortalRequests, portalPendingApprovals,
    } = useSelector((state) => state.employeePortal);

    const empRefNo = employeeData?.EmpRefno;

    const myReqs = Array.isArray(myPortalRequests) ? myPortalRequests : [];
    const teamPending = Array.isArray(portalPendingApprovals) ? portalPendingApprovals : [];

    const today = useMemo(() => new Date(), []);
    const currentMonthName = useMemo(() => today.toLocaleString('en-US', { month: 'long' }), [today]);
    const currentYear = today.getFullYear();

    useEffect(() => {
        if (empRefNo) {
            dispatch(fetchMyLeaveBalances(empRefNo));
            dispatch(fetchMyPayslipList(empRefNo));
            dispatch(fetchMyAttendance({ empRefNo, month: currentMonthName, year: currentYear }));
            dispatch(fetchMyPortalRequests(empRefNo));
        }
    }, [dispatch, empRefNo, currentMonthName, currentYear]);

    const totalBalance = leaveBalances.reduce((s, l) => s + Number(l.BalanceLeaves || 0), 0);
    const totalAssigned = leaveBalances.reduce((s, l) => s + Number(l.AssignedLeaves || 0), 0);
    const totalUsed = Math.max(0, totalAssigned - totalBalance);

    const attendanceRecord = attendanceData?.Data?.[0];
    const attendancePresent = useMemo(() => {
        if (!attendanceRecord) return 0;
        return Object.keys(attendanceRecord).filter((key) => key.includes('#') && attendanceRecord[key] === 'P').length;
    }, [attendanceRecord]);

    const lastPayslip = payslipList[0];

    return (
        <div>
            <PageHeader
                title={`Welcome back${fullName ? `, ${fullName.split(' ')[0]}` : ''}`}
                subtitle={designation || 'Here is what is happening with your account today.'}
                icon={Bell}
            />

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                <StatCard
                    label="Leave Balance"
                    value={loading.leaveBalances ? '…' : `${totalBalance} days`}
                    sub={loading.leaveBalances ? undefined : `${totalUsed} of ${totalAssigned} used`}
                    icon={CalendarCheck}
                    tone="navy"
                />
                <StatCard
                    label="Attendance"
                    value={loading.attendanceData ? '…' : `${attendancePresent}/${attendanceRecord?.TotalMonthDays ?? '—'}`}
                    sub={`${currentMonthName} ${currentYear}`}
                    icon={Clock}
                    tone="orange"
                />
                <StatCard
                    label="Last Payslip"
                    value={loading.payslipList ? '…' : lastPayslip ? `₹${Number(lastPayslip.NetValue || 0).toLocaleString('en-IN')}` : '—'}
                    sub={lastPayslip ? `${lastPayslip.MonthName} ${lastPayslip.Year}` : 'No payslip yet'}
                    icon={Wallet}
                    tone="white"
                />
                <StatCard
                    label="Open Requests"
                    value={loading.myPortalRequests ? '…' : myReqs.filter((r) => r.Status === 'Pending').length}
                    sub="Awaiting verification"
                    icon={ListChecks}
                    tone="white"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Quick actions */}
                <SectionCard title="Quick Actions" className="lg:col-span-1">
                    <div className="grid grid-cols-2 gap-2.5">
                        {quickActions.map(({ key, label, icon: Icon }) => (
                            <button
                                key={key}
                                onClick={() => onNavigate(key)}
                                className="flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-400/40 hover:bg-orange-50 dark:hover:bg-orange-500/5 transition-colors"
                            >
                                <div className="w-9 h-9 rounded-lg bg-[#0d1b5e] dark:bg-orange-500/15 flex items-center justify-center">
                                    <Icon className="w-4.5 h-4.5 text-orange-400" />
                                </div>
                                <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 text-center leading-tight">{label}</span>
                            </button>
                        ))}
                    </div>
                </SectionCard>

                {/* Recent requests */}
                <SectionCard
                    title="Recent Requests"
                    className="lg:col-span-2"
                    action={
                        <button onClick={() => onNavigate('my-requests')} className="text-xs font-semibold text-orange-500 hover:text-orange-600 flex items-center gap-1">
                            View all <ArrowRight className="w-3 h-3" />
                        </button>
                    }
                >
                    {loading.myPortalRequests ? (
                        <p className="text-sm text-gray-400 py-4 text-center">Loading…</p>
                    ) : myReqs.length === 0 ? (
                        <p className="text-sm text-gray-400 py-4 text-center">You haven't raised any requests yet.</p>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {myReqs.slice(0, 4).map((r) => (
                                <div key={`${r.RequestType}-${r.Id}`} className="flex items-center justify-between gap-3 py-2.5">
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                                            {r.RequestType === 'Advance'
                                                ? `${r.AdvanceType === 'LTA' ? 'Long Term Advance' : 'Salary Advance'} — ₹${Number(r.Amount || 0).toLocaleString('en-IN')}`
                                                : `${r.LeaveName || 'Leave'} — ${r.NoOfDays} day${Number(r.NoOfDays) === 1 ? '' : 's'}`}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5">{r.RequestType} · {r.SubmittedOn}</p>
                                    </div>
                                    <Badge className={requestStatusStyles[r.Status] || ''}>{r.Status}</Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </SectionCard>
            </div>

            <div className="mt-5">
                {/* Reporting person callout */}
                {isReportingPerson ? (
                    <SectionCard title="Team Approvals" icon={ClipboardCheck}>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                            {teamPending.length} request{teamPending.length !== 1 ? 's' : ''} from your team awaiting your verification.
                        </p>
                        <button
                            onClick={() => onNavigate('pending-approvals')}
                            className="w-full text-sm font-semibold text-white bg-gradient-to-r from-blue-900 to-orange-500 hover:from-blue-950 hover:to-orange-600 rounded-lg py-2.5 transition-all"
                        >
                            Review Now
                        </button>
                    </SectionCard>
                ) : (
                    <SectionCard title="Leave Snapshot">
                        {loading.leaveBalances ? (
                            <p className="text-sm text-gray-400 py-4 text-center">Loading…</p>
                        ) : leaveBalances.length === 0 ? (
                            <p className="text-sm text-gray-400 py-4 text-center">No leave balance found.</p>
                        ) : (
                            <div className="space-y-3">
                                {leaveBalances.map((l, index) => {
                                    const assigned = Number(l.AssignedLeaves || 0);
                                    const balance = Math.max(0, Number(l.BalanceLeaves || 0));
                                    const used = Math.max(0, assigned - balance);
                                    return (
                                        <div key={l.LeaveTypeId}>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="font-medium text-gray-600 dark:text-gray-300">{l.LeaveName}</span>
                                                <span className="text-gray-400">{used}/{assigned}</span>
                                            </div>
                                            <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${leaveBarColors[index % leaveBarColors.length]}`}
                                                    style={{ width: `${assigned ? Math.min(100, (used / assigned) * 100) : 0}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </SectionCard>
                )}
            </div>
        </div>
    );
};

export default DashboardHome;
