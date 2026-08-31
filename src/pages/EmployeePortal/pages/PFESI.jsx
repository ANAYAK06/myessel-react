import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ShieldCheck } from 'lucide-react';
import { PageHeader, SectionCard, InfoRow, StatCard, Badge, EmptyState, SearchInput, Pagination } from '../components/PortalUI';
import { fetchMyPFESIHistory } from '../../../slices/HRSlice/employeePortalSlice';

const typeBadgeClass = {
    PF: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
    ESI: 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400',
};

const formatAmount = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;

const PAGE_SIZE = 8;

const PFESI = ({ employeeData }) => {
    const dispatch = useDispatch();
    const { pfEsiHistory, loading } = useSelector((state) => state.employeePortal);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    const empRefNo = employeeData?.EmpRefno;

    useEffect(() => {
        if (empRefNo) {
            dispatch(fetchMyPFESIHistory(empRefNo));
        }
    }, [dispatch, empRefNo]);

    const history = useMemo(() => pfEsiHistory?.History || [], [pfEsiHistory]);

    const latestPF = useMemo(() => history.find((h) => h.Type === 'PF'), [history]);
    const latestESI = useMemo(() => history.find((h) => h.Type === 'ESI'), [history]);

    const filteredHistory = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return history;
        return history.filter((h) =>
            `${h.Type} ${h.MonthName} ${h.Year} ${h.CCName || ''} ${h.CCCode || ''}`.toLowerCase().includes(term)
        );
    }, [history, search]);

    const totalPages = Math.max(1, Math.ceil(filteredHistory.length / PAGE_SIZE));
    const pagedHistory = filteredHistory.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    useEffect(() => {
        setPage(1);
    }, [search, history]);

    return (
        <div>
            <PageHeader title="PF / ESI Details" subtitle="Your statutory contribution details" icon={ShieldCheck} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                <StatCard
                    label={latestPF ? `PF Contribution — ${latestPF.MonthName} ${latestPF.Year}` : 'PF Contribution'}
                    value={loading.pfEsiHistory ? '…' : formatAmount(latestPF?.EmployeeContAmt)}
                    sub={latestPF ? `Employer: ${formatAmount(latestPF.EmployerContAmt)}` : 'No PF contributions recorded yet'}
                    tone="navy"
                />
                <StatCard
                    label={latestESI ? `ESI Contribution — ${latestESI.MonthName} ${latestESI.Year}` : 'ESI Contribution'}
                    value={loading.pfEsiHistory ? '…' : formatAmount(latestESI?.EmployeeContAmt)}
                    sub={latestESI ? `Employer: ${formatAmount(latestESI.EmployerContAmt)}` : 'No ESI contributions recorded yet'}
                    tone="orange"
                />
            </div>

            <SectionCard title="Statutory Identifiers" icon={ShieldCheck} className="mb-5">
                <InfoRow label="UAN" value={pfEsiHistory?.UANNumber} />
                <InfoRow label="PF Number" value={pfEsiHistory?.PFNumber} />
                <InfoRow label="ESI Number" value={pfEsiHistory?.ESINumber} />
            </SectionCard>

            <SectionCard
                title="Contribution History"
                icon={ShieldCheck}
                action={
                    history.length > 0 && (
                        <SearchInput value={search} onChange={setSearch} placeholder="Search by type, month, year, CC…" />
                    )
                }
            >
                {loading.pfEsiHistory ? (
                    <p className="text-sm text-gray-400 py-6 text-center">Loading…</p>
                ) : history.length === 0 ? (
                    <EmptyState
                        icon={ShieldCheck}
                        title="No PF/ESI history found"
                        subtitle="Contribution records will appear here once a payroll run has been approved for you."
                    />
                ) : filteredHistory.length === 0 ? (
                    <EmptyState icon={ShieldCheck} title="No matching records" subtitle="Try a different search term." />
                ) : (
                    <>
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {pagedHistory.map((h) => (
                            <div key={`${h.Type}-${h.Year}-${h.Month}-${h.CCCode}`} className="flex items-center justify-between gap-3 py-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <Badge className={typeBadgeClass[h.Type] || 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300'}>
                                        {h.Type}
                                    </Badge>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                            {h.MonthName} {h.Year}
                                        </p>
                                        <p className="text-xs text-gray-400">{h.CCName || h.CCCode}</p>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                        {formatAmount(h.EmployeeContAmt)}
                                    </p>
                                    <p className="text-xs text-gray-400">Employer: {formatAmount(h.EmployerContAmt)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Pagination
                        page={page}
                        totalPages={totalPages}
                        totalItems={filteredHistory.length}
                        pageSize={PAGE_SIZE}
                        onPageChange={setPage}
                    />
                    </>
                )}
            </SectionCard>
        </div>
    );
};

export default PFESI;
