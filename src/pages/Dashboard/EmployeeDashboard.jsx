import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Menu, LogOut, Bell, ChevronDown, CalendarCheck, ClipboardCheck, Wallet } from 'lucide-react';
import { useLogout } from '../../hooks/useLogout';
import ThemeToggle from '../../components/ThemeToggle';
import Sidebar from '../EmployeePortal/components/Sidebar';
import { allMenuItems } from '../EmployeePortal/menuConfig';
import {
    fetchIsPortalReportingPerson,
    fetchPortalPendingApprovals,
} from '../../slices/HRSlice/employeePortalSlice';

import DashboardHome from '../EmployeePortal/pages/DashboardHome';
import MyProfile from '../EmployeePortal/pages/MyProfile';
import Attendance from '../EmployeePortal/pages/Attendance';
import LeaveBalance from '../EmployeePortal/pages/LeaveBalance';
import Payslips from '../EmployeePortal/pages/Payslips';
import TaxDocuments from '../EmployeePortal/pages/TaxDocuments';
import PFESI from '../EmployeePortal/pages/PFESI';
import LoanAdvanceStatus from '../EmployeePortal/pages/LoanAdvanceStatus';
import RequestLeave from '../EmployeePortal/pages/RequestLeave';
import RequestLTA from '../EmployeePortal/pages/RequestLTA';
import RequestAdvance from '../EmployeePortal/pages/RequestAdvance';
import RequestReimbursement from '../EmployeePortal/pages/RequestReimbursement';
import MyRequests from '../EmployeePortal/pages/MyRequests';
import ReportingStructure from '../EmployeePortal/pages/ReportingStructure';
import PendingApprovals from '../EmployeePortal/pages/PendingApprovals';
import MyReportees from '../EmployeePortal/pages/MyReportees';
import PerformanceEvaluation from '../EmployeePortal/pages/PerformanceEvaluation';

const requestTypeIcon = { Leave: CalendarCheck, Advance: Wallet };
const advanceTypeLabel = { LTA: 'Long Term Advance', SA: 'Salary Advance' };
const notifSubLine = (r) =>
    r.RequestType === 'Advance'
        ? `${advanceTypeLabel[r.AdvanceType] || 'Advance'} · ₹${Number(r.Amount || 0).toLocaleString('en-IN')}`
        : `${r.LeaveName || 'Leave'} · ${r.NoOfDays} day${Number(r.NoOfDays) === 1 ? '' : 's'} · ${r.FromDate}`;

const EmployeeDashboard = () => {
    const { employeeData, employeeId } = useSelector((state) => state.auth);
    const { isPortalReportingPerson, portalPendingApprovals } = useSelector((state) => state.employeePortal);
    const dispatch = useDispatch();
    const { logout } = useLogout();

    const [activePage, setActivePage] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    // seeded from the API once resolved; still toggleable for testing before reporting
    // connections are configured
    const [isReportingPerson, setIsReportingPerson] = useState(false);

    const d = employeeData || {};
    const empRefNo = d.EmpRefno;

    useEffect(() => {
        if (empRefNo) {
            dispatch(fetchIsPortalReportingPerson(empRefNo));
            dispatch(fetchPortalPendingApprovals(empRefNo));
        }
    }, [dispatch, empRefNo]);

    useEffect(() => {
        setIsReportingPerson(isPortalReportingPerson === true);
    }, [isPortalReportingPerson]);

    const pendingApprovals = Array.isArray(portalPendingApprovals) ? portalPendingApprovals : [];
    const pendingCount = isReportingPerson ? pendingApprovals.length : 0;

    const fullName = [d.Firstname, d.Middlename, d.Lastname]
        .filter(Boolean)
        .map((n) => n.trim())
        .join(' ');

    const initials = [d.Firstname, d.Lastname]
        .filter(Boolean)
        .map((n) => n[0])
        .join('');

    const handleNavigate = (key) => {
        setActivePage(key);
        setSidebarOpen(false);
    };

    const goToApprovals = () => {
        setNotifOpen(false);
        setActivePage('pending-approvals');
    };

    const activeMeta = allMenuItems.find((m) => m.key === activePage);

    const pageProps = {
        fullName,
        designation: d.Appointed || d.UserRole,
        employeeData,
        employeeId,
        initials,
        onNavigate: handleNavigate,
        isReportingPerson,
    };

    const renderPage = () => {
        switch (activePage) {
            case 'dashboard': return <DashboardHome {...pageProps} />;
            case 'profile': return <MyProfile {...pageProps} />;
            case 'attendance': return <Attendance {...pageProps} />;
            case 'leave-balance': return <LeaveBalance {...pageProps} />;
            case 'payslips': return <Payslips {...pageProps} />;
            case 'tax': return <TaxDocuments {...pageProps} />;
            case 'pf-esi': return <PFESI {...pageProps} />;
            case 'loan-advance-status': return <LoanAdvanceStatus {...pageProps} />;
            case 'request-leave': return <RequestLeave {...pageProps} />;
            case 'request-lta': return <RequestLTA {...pageProps} />;
            case 'request-advance': return <RequestAdvance {...pageProps} />;
            case 'request-reimbursement': return <RequestReimbursement {...pageProps} />;
            case 'my-requests': return <MyRequests {...pageProps} />;
            case 'reporting-structure': return <ReportingStructure {...pageProps} />;
            case 'pending-approvals': return <PendingApprovals {...pageProps} />;
            case 'my-reportees': return <MyReportees {...pageProps} />;
            case 'performance-evaluation': return <PerformanceEvaluation {...pageProps} />;
            default: return <DashboardHome {...pageProps} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex transition-colors">
            <Sidebar
                activePage={activePage}
                onNavigate={handleNavigate}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                isReportingPerson={isReportingPerson}
                onToggleReportingPerson={() => setIsReportingPerson((v) => !v)}
                fullName={fullName}
                designation={d.Appointed}
            />

            <div className="flex-1 min-w-0 flex flex-col">
                {/* Top bar */}
                <header className="bg-white dark:bg-[#1e2535] border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
                    <div className="flex items-center justify-between h-16 px-3 sm:px-5 gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 -ml-1 rounded-lg text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10"
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                            <div className="min-w-0">
                                <p className="text-sm sm:text-base font-bold text-[#0d1b5e] dark:text-white truncate">
                                    {activeMeta?.label || 'Dashboard'}
                                </p>
                                <p className="hidden sm:block text-xs text-gray-400 truncate">{activeMeta?.desc}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                            <ThemeToggle variant="default" showLabel={false} />

                            <div className="relative">
                                <button
                                    onClick={() => setNotifOpen((v) => !v)}
                                    className="relative p-2 rounded-lg text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10"
                                >
                                    <Bell className="w-5 h-5" />
                                    {pendingCount > 0 && (
                                        <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center text-[10px] font-bold text-white bg-orange-500 rounded-full">
                                            {pendingCount > 9 ? '9+' : pendingCount}
                                        </span>
                                    )}
                                </button>

                                {notifOpen && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
                                        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-[#1e2535] rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-20 overflow-hidden">
                                            <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Notifications</p>
                                                {pendingCount > 0 && (
                                                    <span className="text-[11px] font-semibold text-orange-500">{pendingCount} pending</span>
                                                )}
                                            </div>

                                            <div className="max-h-80 overflow-y-auto">
                                                {!isReportingPerson || pendingApprovals.length === 0 ? (
                                                    <div className="px-4 py-6 text-center">
                                                        <ClipboardCheck className="w-6 h-6 text-gray-300 dark:text-gray-600 mx-auto mb-1.5" />
                                                        <p className="text-xs text-gray-400">You're all caught up.</p>
                                                    </div>
                                                ) : (
                                                    pendingApprovals.map((r) => {
                                                        const Icon = requestTypeIcon[r.RequestType] || ClipboardCheck;
                                                        return (
                                                            <button
                                                                key={`${r.RequestType}-${r.Id}`}
                                                                onClick={goToApprovals}
                                                                className="w-full text-left px-4 py-3 flex gap-3 hover:bg-gray-50 dark:hover:bg-white/5 border-b border-gray-50 dark:border-gray-700/60"
                                                            >
                                                                <div className="w-8 h-8 rounded-lg bg-[#0d1b5e]/10 dark:bg-white/10 flex items-center justify-center shrink-0">
                                                                    <Icon className="w-4 h-4 text-[#0d1b5e] dark:text-orange-300" />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                                                                        {r.EmployeeName?.trim()} — {r.RequestType} request
                                                                    </p>
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                                        {notifSubLine(r)}
                                                                    </p>
                                                                    <p className="text-[11px] text-gray-400 mt-0.5">submitted {r.SubmittedOn}</p>
                                                                </div>
                                                            </button>
                                                        );
                                                    })
                                                )}
                                            </div>

                                            {isReportingPerson && pendingApprovals.length > 0 && (
                                                <button
                                                    onClick={goToApprovals}
                                                    className="w-full px-4 py-2.5 text-xs font-semibold text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/5 border-t border-gray-100 dark:border-gray-700"
                                                >
                                                    Review all in Pending Approvals
                                                </button>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="relative">
                                <button
                                    onClick={() => setProfileMenuOpen((v) => !v)}
                                    className="flex items-center gap-2 pl-1.5 pr-1 sm:pr-2.5 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-full bg-[#0d1b5e] dark:bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs font-bold shrink-0">
                                        {initials || '--'}
                                    </div>
                                    <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-200 max-w-[140px] truncate">
                                        {fullName || employeeId}
                                    </span>
                                    <ChevronDown className="hidden sm:block w-4 h-4 text-gray-400" />
                                </button>

                                {profileMenuOpen && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setProfileMenuOpen(false)} />
                                        <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-[#1e2535] rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1.5 z-20">
                                            <div className="px-3.5 py-2 border-b border-gray-100 dark:border-gray-700">
                                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{fullName || 'Employee'}</p>
                                                <p className="text-xs text-gray-400 truncate">{d.EmpRefno || employeeId}</p>
                                            </div>
                                            <button
                                                onClick={() => { setActivePage('profile'); setProfileMenuOpen(false); }}
                                                className="w-full text-left px-3.5 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                                            >
                                                My Profile
                                            </button>
                                            <button
                                                onClick={logout}
                                                className="w-full flex items-center gap-2 px-3.5 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                                            >
                                                <LogOut className="w-4 h-4" /> Logout
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-3 sm:p-5 lg:p-6 max-w-7xl w-full mx-auto">
                    {renderPage()}
                </main>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
