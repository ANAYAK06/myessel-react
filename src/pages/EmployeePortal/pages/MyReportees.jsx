import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Users2, HardHat, Building2, Star, ChevronRight, MapPin } from 'lucide-react';
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
        ? { cover: 'from-amber-400 via-orange-400 to-orange-500' }
        : { cover: 'from-sky-400 via-blue-400 to-indigo-500' };

const initialsOf = (name) =>
    (name || '').trim().split(/\s+/).slice(0, 2).map((s) => s[0] || '').join('').toUpperCase();

const mimeOf = (ft) => ((ft || '').toUpperCase() === 'PNG' ? 'image/png' : 'image/jpeg');

const ctaLabel = (s) => (s === 'Submitted' ? 'Review' : s === 'Draft' ? 'Continue' : 'Evaluate');

const Stars = ({ value }) => {
    const filled = Math.round((Number(value) || 0) / 2); // rating is out of 10 → 5 stars
    return (
        <span className="inline-flex">
            {[1, 2, 3, 4, 5].map((n) => (
                <Star
                    key={n}
                    className={`w-3.5 h-3.5 ${n <= filled ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'}`}
                />
            ))}
        </span>
    );
};

// ── Avatar: builds (and revokes) its own blob URL from the cached base64 ────────
const ReporteeAvatar = ({ base64, fileType, name, cover }) => {
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
        <div className={`w-20 h-20 rounded-full overflow-hidden shrink-0 flex items-center justify-center
            text-lg font-bold text-white shadow-md ring-4 ring-white dark:ring-[#1e2535] bg-gradient-to-br ${cover}`}>
            {url
                ? <img src={url} alt={name || 'Employee'} className="w-full h-full object-cover" />
                : (initialsOf(name) || <Users2 className="w-7 h-7" />)}
        </div>
    );
};

const ReporteeCard = ({ r, photo, onEvaluate }) => {
    const accent = accentOf(r.StaffType);
    return (
        <div className="flex flex-col rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden
            bg-white dark:bg-white/[0.03] transition-all hover:border-orange-300 dark:hover:border-orange-400/40 hover:shadow-lg">

            {/* Cover */}
            <div className={`relative h-20 bg-gradient-to-br ${accent.cover}`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,rgba(255,255,255,0.35),transparent_55%)]" />
            </div>

            {/* Body */}
            <div className="px-4 pb-4 -mt-10 flex flex-col items-center text-center flex-1">
                <ReporteeAvatar base64={photo?.base64} fileType={photo?.fileType} name={r.EmployeeName} cover={accent.cover} />

                <p className="mt-2.5 text-sm font-bold text-gray-800 dark:text-gray-100 truncate max-w-full">
                    {r.EmployeeName?.trim()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate max-w-full">
                    {r.DesignationName || 'Employee'}
                    {r.DepartmentName ? ` · ${r.DepartmentName}` : ''}
                </p>

                <div className="flex flex-wrap justify-center gap-1.5 mt-2">
                    <Badge className={staffTypeBadge(r.StaffType)}>
                        {r.StaffType === 'Site' ? 'Site Staff' : 'Office Staff'}
                    </Badge>
                    {r.MappingType === 'Default' && (
                        <Badge className="bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400">Default</Badge>
                    )}
                </div>

                <p className="flex items-center gap-1 mt-2 text-[11px] text-gray-400 max-w-full">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">
                        {r.JoiningCostCenter || '—'}{r.CCName ? ` · ${r.CCName}` : ''}
                        {r.CCType ? ` (${r.CCType})` : ''}
                    </span>
                </p>

                <div className="flex items-center gap-2 mt-2.5">
                    <Badge className={evalStatusBadge(r.EvaluationStatus)}>{r.EvaluationStatus}</Badge>
                    {r.OverallRating != null && (
                        <span className="inline-flex items-center gap-1">
                            <Stars value={r.OverallRating} />
                            <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                                {Number(r.OverallRating).toFixed(1)}
                            </span>
                        </span>
                    )}
                </div>

                <div className="mt-auto pt-3.5 w-full">
                    <PrimaryButton className="w-full !justify-center" onClick={() => onEvaluate(r)}>
                        {ctaLabel(r.EvaluationStatus)}
                        <ChevronRight className="w-3.5 h-3.5" />
                    </PrimaryButton>
                </div>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
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
