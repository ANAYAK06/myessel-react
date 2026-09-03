import {
    LayoutDashboard, User, Clock, CalendarCheck, FileText, ScrollText,
    ShieldCheck, PlaneTakeoff, Wallet, Receipt, ListChecks, Users2,
    ClipboardCheck, Star, Network, CreditCard,
} from 'lucide-react';

export const employeeMenu = [
    { key: 'dashboard', label: 'Dashboard', desc: 'Overview & alerts', icon: LayoutDashboard },
    { key: 'profile', label: 'My Profile', desc: 'Personal details', icon: User },
    { key: 'attendance', label: 'Attendance / Time', desc: 'Daily attendance record', icon: Clock },
    { key: 'leave-balance', label: 'Leave Balance', desc: 'Entitlement & used', icon: CalendarCheck },
    // { key: 'payslips', label: 'Payslips', desc: 'Monthly salary slips', icon: FileText },
    { key: 'tax', label: 'Form 16 / Tax', desc: 'Tax documents', icon: ScrollText },
    { key: 'pf-esi', label: 'PF / ESI Details', desc: 'Statutory contributions', icon: ShieldCheck },
    { key: 'loan-advance-status', label: 'Loan / Advance Status', desc: 'Outstanding balance & EMI history', icon: CreditCard },
];

export const requestMenu = [
    { key: 'request-leave', label: 'Request Leave', desc: 'Raise a leave request', icon: CalendarCheck },
    { key: 'request-lta', label: 'Request LTA', desc: 'Raise an LTA request', icon: PlaneTakeoff },
    { key: 'request-advance', label: 'Request Advance', desc: 'Salary / travel advance', icon: Wallet },
    { key: 'request-reimbursement', label: 'Request Reimbursement', desc: 'Expense claims', icon: Receipt },
    { key: 'my-requests', label: 'My Requests', desc: 'Track status of all requests', icon: ListChecks },
    { key: 'reporting-structure', label: 'Reporting Structure', desc: 'Who I report to', icon: Network },
];

export const reportingPersonMenu = [
    { key: 'pending-approvals', label: 'Pending Approvals', desc: 'Verify / accept team requests', icon: ClipboardCheck },
    { key: 'my-reportees', label: 'My Reportees', desc: 'Employees reporting to me', icon: Users2 },
    { key: 'performance-evaluation', label: 'Performance Evaluation', desc: 'Rate & review reportees', icon: Star },
];

export const allMenuItems = [...employeeMenu, ...requestMenu, ...reportingPersonMenu];
