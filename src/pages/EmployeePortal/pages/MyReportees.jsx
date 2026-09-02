import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Users2, HardHat, Building2, Star, ChevronRight, MapPin, IdCard } from 'lucide-react';
import {
    PageHeader, SectionCard, StatCard, Badge, EmptyState, SearchInput, PrimaryButton, inputClass,
} from '../components/PortalUI';
import { fetchMyReportees, fetchReporteePhoto } from '../../../slices/HRSlice/employeePortalSlice';

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - i);

const staffTypeBadge = (t) =>
    t === 'Site'
        ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400'
        : 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400';

const evalStatusBadge = (s) => ({
    Submitted: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
    Draft: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
    'Not Started': 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300',
}[s] || 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300');

const accentOf = (t) =>
    t === 'Site'
        ? { ring: 'ring-amber-300/70 dark:ring-amber-500/40', grad: 'from-amber-400 to-orange-500' }
        : { ring: 'ring-sky-300/70 dark:ring-sky-500/40', grad: 'from-sky-400 to-blue-500' };

const initialsOf = (name) =>
    (name || '').trim().split(/\s+/).slice(0, 2).map((s) => s[0] || '').join('').toUpperCase();

const mimeOf = (ft) => ((ft || '').toUpperCase() === 'PNG' ? 'image/png' : 'image/jpeg');

const ctaLabel = (s) => (s === 'Submitted' ? 'Review' : s === 'Draft' ? 'Continue' : 'Evaluate');

// ── Avatar: builds (and revokes) its own blob URL from the cached base64 ────────
const ReporteeAvatar = ({ base64, fileType, name, accent }) => {
    const url = useMemo(() => {
        if (!base64) return null;
        try {
            const bin = atob(base64);
            const bytes = new Uint8Array(bin.length);
            for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
            return URL.createObjectURL(new Blob([bytes], { type: mimeOf(fileType) }));
        } catch {
            return null;
        }
    }, [base64, fileType]);

    useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);

    return (
        <div className={`w-16 h-16 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center
            text-base font-bold text-white ring-2 ${accent.ring} bg-gradient-to-br ${accent.grad}`}>
            {url
                ? <img src={url} alt={name || 'Employee'} className="w-full h-full object-cover" />
                : (initialsOf(name) || <Users2 className="w-6 h-6" />)}
        </div>
    );
};

const ReporteeCard = ({ r, photo, onEvaluate }) => {
    const accent = accentOf(r.StaffType);
    return (
        <div className="group flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-gray-200 dark:border-gray-700
            bg-white dark:bg-white/[0.03] p-4 transition-all hover:border-orange-300 dark:hover:border-orange-400/40 hover:shadow-md">

            <div className="flex items-center gap-4 min-w-0 flex-1">
                <ReporteeAvatar base64={photo?.base64} fileType={photo?.fileType} name={r.EmployeeName} accent={accent} />

                <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">{r.EmployeeName?.trim()}</p>
                        <Badge className={staffTypeBadge(r.StaffType)}>
                            {r.StaffType === 'Site' ? 'Site Staff' : 'Office Staff'}
                        </Badge>
                        {r.MappingType === 'Default' && (
                            <Badge className="bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400">Default</Badge>
                        )}
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1.5">
                        <IdCard className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                        <span className="truncate">
                            {r.EmpRefNo}
                            {r.DesignationName ? ` · ${r.DesignationName}` : ''}
                            {r.DepartmentName ? ` · ${r.DepartmentName}` : ''}
                        </span>
                    </p>

                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">
                            {r.JoiningCostCenter || '—'}{r.CCName ? ` · ${r.CCName}` : ''}
                            {r.CCType ? ` (${r.CCType})` : ''}
                        </span>
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4 sm:shrink-0
                border-t sm:border-t-0 border-gray-100 dark:border-gray-700/60 pt-3 sm:pt-0">
                <div className="text-left sm:text-right">
                    <Badge className={evalStatusBadge(r.EvaluationStatus)}>{r.EvaluationStatus}</Badge>
                    {r.OverallRating != null && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Score <span className="font-semibold text-gray-700 dark:text-gray-200">{Number(r.OverallRating).toFixed(1)}</span> / 10
                        </p>
                    )}
                </div>
                <PrimaryButton className="!px-3 !py-1.5" onClick={() => onEvaluate(r)}>
                    {ctaLabel(r.EvaluationStatus)}
                    <ChevronRight className="w-3.5 h-3.5" />
                </PrimaryButton>
            </div>
        </div>
    );
};

const MyReportees = ({ employeeData, onNavigate }) => {
    const dispatch = useDispatch();
    const { myReportees, reporteePhotos, reporteePhotoLoading, loading } = useSelector((state) => state.employeePortal);

    const empRefNo = employeeData?.EmpRefno;
    const [year, setYear] = useState(CURRENT_YEAR);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (empRefNo) dispatch(fetchMyReportees({ empRefNo, periodYear: year }));
    }, [dispatch, empRefNo, year]);

    const rows = useMemo(() => (Array.isArray(myReportees) ? myReportees : []), [myReportees]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return rows;
        return rows.filter((r) =>
            [r.EmployeeName, r.EmpRefNo, r.DesignationName, r.DepartmentName, r.CCName]
                .filter(Boolean)
                .some((v) => v.toLowerCase().includes(q))
        );
    }, [rows, search]);

    // Lazily pull each reportee's photo once, cached by EmpRefNo in the slice.
    useEffect(() => {
        filtered.forEach((r) => {
            const known = Object.prototype.hasOwnProperty.call(reporteePhotos, r.EmpRefNo);
            if (r.EmpRefNo && !known && !reporteePhotoLoading[r.EmpRefNo]) {
                dispatch(fetchReporteePhoto(r.EmpRefNo));
            }
        });
    }, [dispatch, filtered, reporteePhotos, reporteePhotoLoading]);

    const siteCount = rows.filter((r) => r.StaffType === 'Site').length;
    const officeCount = rows.filter((r) => r.StaffType === 'Office').length;
    const doneCount = rows.filter((r) => r.EvaluationStatus === 'Submitted').length;

    const goEvaluate = (r) =>
        onNavigate?.('performance-evaluation', { empRefNo: r.EmpRefNo, year });

    return (
        <div>
            <PageHeader
                title="My Reportees"
                subtitle="Employees who report to you — with their current site/office posting"
                icon={Users2}
                action={
                    <select
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className={`${inputClass} !w-auto`}
                    >
                        {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                }
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                <StatCard label="Total Reportees" value={rows.length} icon={Users2} tone="navy" />
                <StatCard label="Site Staff" value={siteCount} sub="Project-site cost centers" icon={HardHat} tone="orange" />
                <StatCard label="Office Staff" value={officeCount} sub="Office cost centers" icon={Building2} tone="white" />
                <StatCard label={`Evaluated ${year}`} value={`${doneCount} / ${rows.length}`} icon={Star} tone="white" />
            </div>

            <SectionCard
                title={`Reportees (${filtered.length})`}
                icon={Users2}
                action={<SearchInput value={search} onChange={setSearch} placeholder="Search name, ID, CC…" />}
            >
                {loading.myReportees ? (
                    <p className="text-sm text-gray-400 py-6 text-center">Loading…</p>
                ) : filtered.length === 0 ? (
                    <EmptyState
                        icon={Users2}
                        title="No reportees"
                        subtitle="Nobody is mapped to report to you yet. Ask HR to configure Employee Connections."
                    />
                ) : (
                    <div className="space-y-3">
                        {filtered.map((r) => (
                            <ReporteeCard
                                key={r.EmpRefNo}
                                r={r}
                                photo={reporteePhotos[r.EmpRefNo]}
                                onEvaluate={goEvaluate}
                            />
                        ))}
                    </div>
                )}
            </SectionCard>
        </div>
    );
};

export default MyReportees;
