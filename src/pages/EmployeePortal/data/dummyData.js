// Dummy / illustrative data for the Employee Portal proposal build.
// Replace with live API data once the corresponding endpoints are available.

export const taxDocuments = [
    { name: 'Form 16 — FY 2025-26', type: 'Form 16', date: '2026-06-15' },
    { name: 'Form 16 — FY 2024-25', type: 'Form 16', date: '2025-06-12' },
    { name: 'Investment Declaration — FY 2026-27', type: 'Declaration', date: '2026-04-05' },
    { name: 'TDS Statement — Q1 FY 2026-27', type: 'TDS', date: '2026-07-10' },
];

export const myRequests = [
    { id: 'REQ-2026-0142', type: 'Leave', description: 'Casual Leave — 2 days', date: '2026-08-14', status: 'Pending' },
    { id: 'REQ-2026-0139', type: 'Reimbursement', description: 'Travel expense — client site visit', date: '2026-08-10', status: 'Approved' },
    { id: 'REQ-2026-0131', type: 'LTA', description: 'LTA claim — family travel', date: '2026-08-02', status: 'Verified' },
    { id: 'REQ-2026-0118', type: 'Advance', description: 'Salary advance — ₹15,000', date: '2026-07-22', status: 'Rejected' },
    { id: 'REQ-2026-0104', type: 'Leave', description: 'Sick Leave — 1 day', date: '2026-07-15', status: 'Approved' },
];

export const requestStatusStyles = {
    Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
    Verified: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
    Approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
    Rejected: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400',
};

export const reportees = [
    { id: 'EMP-2041', name: 'Anitha Suresh', designation: 'Site Engineer', department: 'Civil', avatarColor: 'bg-blue-600' },
    { id: 'EMP-2058', name: 'Ravi Kumar', designation: 'Junior Accountant', department: 'Finance', avatarColor: 'bg-orange-500' },
    { id: 'EMP-2077', name: 'Divya Menon', designation: 'Store Assistant', department: 'Procurement', avatarColor: 'bg-emerald-600' },
    { id: 'EMP-2093', name: 'Faisal Ahmed', designation: 'Safety Officer', department: 'HSE', avatarColor: 'bg-rose-500' },
];

export const pendingApprovals = [
    { id: 'REQ-2026-0143', employee: 'Anitha Suresh', type: 'Leave', description: 'Earned Leave — 3 days (26–28 Aug)', submitted: '2026-08-20' },
    { id: 'REQ-2026-0140', employee: 'Ravi Kumar', type: 'Reimbursement', description: 'Local conveyance — ₹1,240', submitted: '2026-08-19' },
    { id: 'REQ-2026-0136', employee: 'Divya Menon', type: 'Advance', description: 'Travel advance — ₹8,000', submitted: '2026-08-17' },
];

export const reportingChain = [
    { name: 'You', role: 'Site Supervisor', level: 'self' },
    { name: 'Manoj Pillai', role: 'Project Manager', level: 'reports to' },
    { name: 'Suresh Nair', role: 'Regional Head — Operations', level: 'reports to' },
    { name: 'Default Approver — HR Assist', role: 'Fallback for unmapped cases', level: 'default' },
];
