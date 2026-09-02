import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Star, ClipboardList, CheckCircle2, Lock, Pencil } from 'lucide-react';
import {
    PageHeader, SectionCard, Badge, EmptyState,
    PrimaryButton, SecondaryButton, inputClass,
} from '../components/PortalUI';
import {
    fetchMyReportees,
    fetchReporteeEvaluation,
    saveReporteeEvaluation,
    clearEvaluationSaveResult,
    clearReporteeEvaluation,
} from '../../../slices/HRSlice/employeePortalSlice';

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - i);

const compactInput =
    'w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 ' +
    'text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 ' +
    'focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-colors';

const staffTypeBadge = (t) =>
    t === 'Site'
        ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400'
        : 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400';

const scoreTone = (n) =>
    n == null ? 'bg-gray-100 text-gray-400 dark:bg-white/10 dark:text-gray-500'
        : n <= 3 ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300'
            : n <= 6 ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300';

const toneHex = (n) =>
    n == null ? '#94a3b8' : n <= 3 ? '#e11d48' : n <= 6 ? '#f59e0b' : '#10b981';

// One evaluation category — compact card with a slider score + an optional-remark pencil.
const CategoryCard = ({ line, rating, remark, remarkOpen, readOnly, onRate, onRemark, onToggleRemark }) => {
    const showRemark = readOnly ? !!remark : remarkOpen;
    return (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-white/[0.03] p-3">
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-gray-800 dark:text-gray-100 leading-tight">{line.CategoryName}</p>
                    {line.Description && (
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{line.Description}</p>
                    )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`w-7 h-7 rounded-md text-[11px] font-bold flex items-center justify-center ${scoreTone(rating)}`}>
                        {rating != null ? rating : '—'}
                    </span>
                    {!readOnly && (
                        <button
                            type="button"
                            onClick={onToggleRemark}
                            title={remark ? 'Edit remark' : 'Add optional remark'}
                            className={`w-7 h-7 rounded-md flex items-center justify-center border transition-colors
                                ${remark || remarkOpen
                                    ? 'border-orange-300 text-orange-500 bg-orange-50 dark:bg-orange-500/10 dark:border-orange-400/40'
                                    : 'border-gray-300 dark:border-gray-600 text-gray-400 hover:text-orange-500 hover:border-orange-400'}`}
                        >
                            <Pencil className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>

            <div className="mt-2">
                <input
                    type="range"
                    min={0}
                    max={10}
                    step={1}
                    disabled={readOnly}
                    value={rating ?? 0}
                    onChange={(e) => { const n = Number(e.target.value); onRate(n === 0 ? null : n); }}
                    style={{ accentColor: toneHex(rating) }}
                    className="w-full h-1.5 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                />
                <div className="flex justify-between text-[9px] text-gray-400 mt-0.5 select-none">
                    <span>1 · Poor</span>
                    <span>{rating == null ? 'Drag to rate' : ''}</span>
                    <span>10 · Excellent</span>
                </div>
            </div>

            {showRemark && (
                <input
                    type="text"
                    disabled={readOnly}
                    value={remark || ''}
                    onChange={(e) => onRemark(e.target.value)}
                    placeholder="Optional note for this category"
                    className={`${compactInput} mt-2 ${readOnly ? 'opacity-70' : ''}`}
                />
            )}
        </div>
    );
};

const PerformanceEvaluation = ({ employeeData, navPayload, onNavigate }) => {
    const dispatch = useDispatch();
    const { myReportees, reporteeEvaluation, loading, errors } = useSelector((state) => state.employeePortal);

    const empRefNo = employeeData?.EmpRefno;
    const createdBy = employeeData?.Username || empRefNo;

    const [selectedEmp, setSelectedEmp] = useState(navPayload?.empRefNo || '');
    const [year, setYear] = useState(navPayload?.year || CURRENT_YEAR);
    const [ratings, setRatings] = useState({});          // { [categoryId]: 1..10 }
    const [remarks, setRemarks] = useState({});          // { [categoryId]: string }
    const [openRemarks, setOpenRemarks] = useState({});  // { [categoryId]: true } — remark row shown
    const [overallRemarks, setOverallRemarks] = useState('');
    const [saving, setSaving] = useState(false);

    // Reportee dropdown source — load once if not already in the store.
    useEffect(() => {
        if (empRefNo && myReportees.length === 0) {
            dispatch(fetchMyReportees({ empRefNo, periodYear: year }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, empRefNo]);

    // Load the selected reportee's evaluation for the chosen year.
    useEffect(() => {
        dispatch(clearEvaluationSaveResult());
        if (empRefNo && selectedEmp) {
            dispatch(fetchReporteeEvaluation({
                empRefNo: selectedEmp,
                reportingPersonEmpRefNo: empRefNo,
                periodYear: year,
            }));
        } else {
            dispatch(clearReporteeEvaluation());
        }
    }, [dispatch, empRefNo, selectedEmp, year]);

    useEffect(() => () => { dispatch(clearReporteeEvaluation()); dispatch(clearEvaluationSaveResult()); }, [dispatch]);

    const ctx = reporteeEvaluation?.Context || null;
    const lines = useMemo(
        () => (Array.isArray(reporteeEvaluation?.Lines) ? reporteeEvaluation.Lines : []),
        [reporteeEvaluation]
    );

    // Seed local form state whenever a fresh evaluation loads.
    useEffect(() => {
        const r = {}; const rm = {}; const or = {};
        lines.forEach((l) => {
            if (l.Rating != null) r[l.CategoryId] = l.Rating;
            if (l.Remarks) { rm[l.CategoryId] = l.Remarks; or[l.CategoryId] = true; }
        });
        setRatings(r);
        setRemarks(rm);
        setOpenRemarks(or);
        setOverallRemarks(ctx?.OverallRemarks || '');
    }, [lines, ctx]);

    const readOnly = ctx?.EvaluationStatus === 'Submitted';
    const ratedCount = lines.filter((l) => ratings[l.CategoryId] != null).length;
    const allRated = lines.length > 0 && ratedCount === lines.length;
    const avg = ratedCount ? (lines.reduce((s, l) => s + (Number(ratings[l.CategoryId]) || 0), 0) / ratedCount) : 0;

    const reporteeOptions = Array.isArray(myReportees) ? myReportees : [];

    const buildDetails = (onlyRated) =>
        lines
            .filter((l) => (onlyRated ? ratings[l.CategoryId] != null : true))
            .map((l) => ({
                CategoryId: l.CategoryId,
                Rating: Number(ratings[l.CategoryId]) || 0,
                Remarks: remarks[l.CategoryId] || null,
            }));

    const save = async (status) => {
        if (!selectedEmp) return toast.error('Pick a reportee first');
        if (status === 'Submitted' && !allRated) {
            return toast.error('Rate every category before submitting');
        }
        const details = buildDetails(status === 'Draft');
        if (details.length === 0) return toast.error('Give at least one rating first');

        setSaving(true);
        try {
            const res = await dispatch(saveReporteeEvaluation({
                EmpRefNo: selectedEmp,
                ReportingPersonId: empRefNo,
                PeriodYear: year,
                OverallRemarks: overallRemarks || null,
                Status: status,
                CreatedBy: createdBy,
                Details: details,
            })).unwrap();

            const txt = res?.Data || '';
            const ok = /^saved$/i.test(txt) || /^submitted$/i.test(txt);
            if (!ok) throw new Error(txt.replace('Error$', '') || 'Failed to save evaluation');

            toast.success(status === 'Submitted' ? 'Evaluation submitted' : 'Draft saved');
            dispatch(fetchReporteeEvaluation({
                empRefNo: selectedEmp, reportingPersonEmpRefNo: empRefNo, periodYear: year,
            }));
            if (empRefNo) dispatch(fetchMyReportees({ empRefNo, periodYear: year }));
        } catch (err) {
            toast.error(typeof err === 'string' ? err : err?.message || 'Failed to save evaluation');
        } finally {
            setSaving(false);
        }
    };

    const ctxPairs = ctx ? [
        ['Emp Ref', ctx.EmpRefNo],
        ['Period', ctx.PeriodYear],
        ['Designation', ctx.DesignationName],
        ['Department', ctx.DepartmentName],
        ['Cost Center', [ctx.JoiningCostCenter, ctx.CCName].filter(Boolean).join(' · ')],
        ['CC Type', ctx.CCType],
        ...(readOnly ? [['Submitted On', ctx.SubmittedOn]] : []),
    ] : [];

    return (
        <div>
            <PageHeader
                title="Performance Evaluation"
                subtitle="Annual review — 1 (poor) to 10 (excellent)"
                icon={Star}
                action={
                    <div className="flex gap-2">
                        <select
                            value={selectedEmp}
                            onChange={(e) => setSelectedEmp(e.target.value)}
                            className={`${inputClass} !w-auto min-w-[12rem]`}
                        >
                            <option value="">Select reportee…</option>
                            {reporteeOptions.map((r) => (
                                <option key={r.EmpRefNo} value={r.EmpRefNo}>
                                    {r.EmployeeName?.trim()} ({r.EmpRefNo})
                                </option>
                            ))}
                        </select>
                        <select
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}
                            className={`${inputClass} !w-auto`}
                        >
                            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                }
            />

            {!selectedEmp ? (
                <SectionCard>
                    <EmptyState icon={Star} title="Pick a reportee" subtitle="Choose an employee above to start their annual evaluation." />
                </SectionCard>
            ) : loading.reporteeEvaluation ? (
                <SectionCard><p className="text-sm text-gray-400 py-6 text-center">Loading…</p></SectionCard>
            ) : errors.reporteeEvaluation ? (
                <SectionCard><EmptyState icon={Star} title="Could not load" subtitle={String(errors.reporteeEvaluation)} /></SectionCard>
            ) : !ctx ? (
                <SectionCard><EmptyState icon={Star} title="No data" subtitle="This reportee's details could not be found." /></SectionCard>
            ) : (
                <div className="space-y-3">
                    {/* Compact context strip */}
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-white/[0.03] px-4 py-3">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2 min-w-0">
                                <ClipboardList className="w-4 h-4 text-orange-400 shrink-0" />
                                <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">{ctx.EmployeeName?.trim()}</p>
                                <Badge className={staffTypeBadge(ctx.StaffType)}>
                                    {ctx.StaffType === 'Site' ? 'Site' : 'Office'}
                                </Badge>
                                {readOnly && (
                                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                                        <Lock className="w-3 h-3 mr-1" /> Submitted
                                    </Badge>
                                )}
                            </div>
                            {readOnly && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    Overall <span className="font-semibold text-gray-800 dark:text-gray-100">{Number(ctx.OverallRating).toFixed(1)}</span> / 10
                                </span>
                            )}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-1.5 mt-2.5">
                            {ctxPairs.map(([k, v]) => (
                                <div key={k} className="min-w-0">
                                    <p className="text-[10px] uppercase tracking-wide text-gray-400">{k}</p>
                                    <p className="text-xs font-medium text-gray-800 dark:text-gray-100 truncate">{v || '—'}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <SectionCard
                        title={`Rating Categories — ${ctx.StaffType === 'Site' ? 'Site Staff' : 'Office Staff'} (${ratedCount}/${lines.length})`}
                        icon={Star}
                        action={
                            !readOnly && ratedCount > 0 && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    Avg <span className="font-semibold text-gray-700 dark:text-gray-200">{avg.toFixed(1)}</span> / 10
                                </span>
                            )
                        }
                    >
                        {lines.length === 0 ? (
                            <EmptyState icon={Star} title="No categories" subtitle="No active evaluation categories are configured for this staff type." />
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                                {lines.map((l) => (
                                    <CategoryCard
                                        key={l.CategoryId}
                                        line={l}
                                        rating={ratings[l.CategoryId] ?? null}
                                        remark={remarks[l.CategoryId] || ''}
                                        remarkOpen={!!openRemarks[l.CategoryId]}
                                        readOnly={readOnly}
                                        onRate={(v) => setRatings((p) => ({ ...p, [l.CategoryId]: v }))}
                                        onRemark={(v) => setRemarks((p) => ({ ...p, [l.CategoryId]: v }))}
                                        onToggleRemark={() => setOpenRemarks((p) => ({ ...p, [l.CategoryId]: !p[l.CategoryId] }))}
                                    />
                                ))}
                            </div>
                        )}

                        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                            <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Overall Remarks</p>
                            <textarea
                                rows={2}
                                disabled={readOnly}
                                value={overallRemarks}
                                onChange={(e) => setOverallRemarks(e.target.value)}
                                placeholder="Summary of the year — strengths, areas to improve, goals"
                                className={`${compactInput} resize-none ${readOnly ? 'opacity-70' : ''}`}
                            />

                            {!readOnly ? (
                                <div className="flex flex-col sm:flex-row sm:justify-end gap-2 mt-3">
                                    <SecondaryButton className="!py-2" onClick={() => onNavigate?.('my-reportees')}>Back to Reportees</SecondaryButton>
                                    <SecondaryButton className="!py-2" disabled={saving || ratedCount === 0} onClick={() => save('Draft')}>
                                        {saving ? 'Saving…' : 'Save Draft'}
                                    </SecondaryButton>
                                    <PrimaryButton className="!py-2" disabled={saving || !allRated} onClick={() => save('Submitted')}>
                                        <CheckCircle2 className="w-4 h-4" /> {saving ? 'Submitting…' : 'Submit Evaluation'}
                                    </PrimaryButton>
                                </div>
                            ) : (
                                <div className="flex justify-end mt-3">
                                    <SecondaryButton className="!py-2" onClick={() => onNavigate?.('my-reportees')}>Back to Reportees</SecondaryButton>
                                </div>
                            )}
                            {!readOnly && !allRated && (
                                <p className="text-[11px] text-gray-400 mt-1.5 text-right">
                                    Rate all {lines.length} categories to enable Submit.
                                </p>
                            )}
                        </div>
                    </SectionCard>
                </div>
            )}
        </div>
    );
};

export default PerformanceEvaluation;
