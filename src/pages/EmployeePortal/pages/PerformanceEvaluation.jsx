import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Star, ClipboardList, CheckCircle2, Lock } from 'lucide-react';
import {
    PageHeader, SectionCard, Badge, EmptyState, InfoRow,
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
const SCALE = Array.from({ length: 10 }, (_, i) => i + 1);

const staffTypeBadge = (t) =>
    t === 'Site'
        ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400'
        : 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400';

const RatingScale = ({ value, onChange, disabled }) => (
    <div className="flex flex-wrap gap-1.5">
        {SCALE.map((n) => {
            const active = Number(value) === n;
            return (
                <button
                    key={n}
                    type="button"
                    disabled={disabled}
                    onClick={() => onChange(active ? null : n)}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold border transition-colors
                        ${active
                            ? 'bg-[#0d1b5e] dark:bg-orange-500 text-white border-transparent'
                            : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-orange-400'}
                        ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                    {n}
                </button>
            );
        })}
    </div>
);

const PerformanceEvaluation = ({ employeeData, navPayload, onNavigate }) => {
    const dispatch = useDispatch();
    const { myReportees, reporteeEvaluation, loading, errors } = useSelector((state) => state.employeePortal);

    const empRefNo = employeeData?.EmpRefno;
    const createdBy = employeeData?.Username || empRefNo;

    const [selectedEmp, setSelectedEmp] = useState(navPayload?.empRefNo || '');
    const [year, setYear] = useState(navPayload?.year || CURRENT_YEAR);
    const [ratings, setRatings] = useState({});      // { [categoryId]: 1..10 }
    const [remarks, setRemarks] = useState({});      // { [categoryId]: string }
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
        const r = {}; const rm = {};
        lines.forEach((l) => {
            if (l.Rating != null) r[l.CategoryId] = l.Rating;
            if (l.Remarks) rm[l.CategoryId] = l.Remarks;
        });
        setRatings(r);
        setRemarks(rm);
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

    return (
        <div>
            <PageHeader
                title="Performance Evaluation"
                subtitle="Rate the employees who report to you — annual review, 1 (poor) to 10 (excellent)"
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
                <div className="space-y-5">
                    <SectionCard title={ctx.EmployeeName?.trim()} icon={ClipboardList} action={
                        <div className="flex items-center gap-2">
                            <Badge className={staffTypeBadge(ctx.StaffType)}>
                                {ctx.StaffType === 'Site' ? 'Site Staff' : 'Office Staff'}
                            </Badge>
                            {readOnly && (
                                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                                    <Lock className="w-3 h-3 mr-1" /> Submitted
                                </Badge>
                            )}
                        </div>
                    }>
                        <div className="grid sm:grid-cols-2 gap-x-6">
                            <InfoRow label="Emp Ref" value={ctx.EmpRefNo} />
                            <InfoRow label="Period" value={ctx.PeriodYear} />
                            <InfoRow label="Designation" value={ctx.DesignationName} />
                            <InfoRow label="Department" value={ctx.DepartmentName} />
                            <InfoRow label="Cost Center" value={[ctx.JoiningCostCenter, ctx.CCName].filter(Boolean).join(' · ')} />
                            <InfoRow label="CC Type" value={ctx.CCType} />
                            {readOnly && <InfoRow label="Submitted On" value={ctx.SubmittedOn} />}
                            {readOnly && <InfoRow label="Overall Score" value={`${Number(ctx.OverallRating).toFixed(1)} / 10`} />}
                        </div>
                    </SectionCard>

                    <SectionCard
                        title={`Rating Categories — ${ctx.StaffType === 'Site' ? 'Site Staff' : 'Office Staff'} (${ratedCount}/${lines.length})`}
                        icon={Star}
                        action={
                            !readOnly && ratedCount > 0 && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    Running average <span className="font-semibold text-gray-700 dark:text-gray-200">{avg.toFixed(1)}</span> / 10
                                </span>
                            )
                        }
                    >
                        {lines.length === 0 ? (
                            <EmptyState icon={Star} title="No categories" subtitle="No active evaluation categories are configured for this staff type." />
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                {lines.map((l) => (
                                    <div key={l.CategoryId} className="py-4 first:pt-0 last:pb-0">
                                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                                            <div className="min-w-0 lg:max-w-sm">
                                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{l.CategoryName}</p>
                                                {l.Description && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{l.Description}</p>
                                                )}
                                            </div>
                                            <div className="shrink-0">
                                                <RatingScale
                                                    value={ratings[l.CategoryId]}
                                                    disabled={readOnly}
                                                    onChange={(v) => setRatings((p) => ({ ...p, [l.CategoryId]: v }))}
                                                />
                                            </div>
                                        </div>
                                        <input
                                            type="text"
                                            disabled={readOnly}
                                            value={remarks[l.CategoryId] || ''}
                                            onChange={(e) => setRemarks((p) => ({ ...p, [l.CategoryId]: e.target.value }))}
                                            placeholder="Optional note for this category"
                                            className={`${inputClass} mt-2.5 ${readOnly ? 'opacity-70' : ''}`}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </SectionCard>

                    <SectionCard title="Overall Remarks" icon={ClipboardList}>
                        <textarea
                            rows={3}
                            disabled={readOnly}
                            value={overallRemarks}
                            onChange={(e) => setOverallRemarks(e.target.value)}
                            placeholder="Summary of the year — strengths, areas to improve, goals"
                            className={`${inputClass} ${readOnly ? 'opacity-70' : ''}`}
                        />
                        {!readOnly && (
                            <div className="flex flex-col sm:flex-row sm:justify-end gap-2 mt-4">
                                <SecondaryButton onClick={() => onNavigate?.('my-reportees')}>Back to Reportees</SecondaryButton>
                                <SecondaryButton disabled={saving || ratedCount === 0} onClick={() => save('Draft')}>
                                    {saving ? 'Saving…' : 'Save Draft'}
                                </SecondaryButton>
                                <PrimaryButton disabled={saving || !allRated} onClick={() => save('Submitted')}>
                                    <CheckCircle2 className="w-4 h-4" /> {saving ? 'Submitting…' : 'Submit Evaluation'}
                                </PrimaryButton>
                            </div>
                        )}
                        {readOnly && (
                            <div className="flex justify-end mt-4">
                                <SecondaryButton onClick={() => onNavigate?.('my-reportees')}>Back to Reportees</SecondaryButton>
                            </div>
                        )}
                        {!readOnly && !allRated && (
                            <p className="text-xs text-gray-400 mt-2 text-right">
                                Rate all {lines.length} categories to enable Submit.
                            </p>
                        )}
                    </SectionCard>
                </div>
            )}
        </div>
    );
};

export default PerformanceEvaluation;
