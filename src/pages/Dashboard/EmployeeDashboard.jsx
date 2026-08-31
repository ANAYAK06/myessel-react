import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Menu, LogOut, Bell, ChevronDown } from 'lucide-react';
import { useLogout } from '../../hooks/useLogout';
import ThemeToggle from '../../components/ThemeToggle';
import Sidebar from '../EmployeePortal/components/Sidebar';
import { allMenuItems } from '../EmployeePortal/menuConfig';

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

const EmployeeDashboard = () => {
    const { employeeData, employeeId } = useSelector((state) => state.auth);
    const { logout } = useLogout();

    const [activePage, setActivePage] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [isReportingPerson, setIsReportingPerson] = useState(true);

    const d = employeeData || {};

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

                            <button className="relative p-2 rounded-lg text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full" />
                            </button>

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
