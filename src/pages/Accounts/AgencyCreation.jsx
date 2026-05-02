import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    Landmark, ChevronDown, Loader2, RotateCcw, Send, CheckCircle,
    Navigation, FileText, Eye, Building2, MapPin, Layers, Tag,
} from 'lucide-react';

import {
    fetchNatureGroups, fetchMasterGroups, fetchSubGroups, submitAgency,
    clearMasterGroups, clearSubGroups, clearSaveResult, resetAgencyCreation,
    selectNatureGroups, selectNatureGroupsLoading,
    selectMasterGroups, selectMasterGroupsLoading,
    selectSubGroups, selectSubGroupsLoading,
    selectAgencySaveStatus, selectAgencySaveLoading, selectAgencySaveError,
} from '../../slices/accountsSlice/agencyCreationSlice';

// ── Constants ──────────────────────────────────────────────────────────────────

const STEPS = ['Agency Details', 'Review'];

// ── Shared UI ──────────────────────────────────────────────────────────────────

const inputCls =
    'w-full px-3.5 py-2.5 rounded-xl border-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:border-indigo-500 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 hover:border-gray-300 transition-all disabled:opacity-60 disabled:cursor-not-allowed';

const selectCls = inputCls + ' appearance-none pr-10';

const Label = ({ children, required }) => (
    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
        {children}{required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
);

const SelectIcon = ({ loading }) => (
    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
        {loading
            ? <Loader2 className="h-4 w-4 text-indigo-500 animate-spin" />
            : <ChevronDown className="h-4 w-4 text-gray-400" />}
    </div>
);

const SectionHeader = ({ icon: Icon, title, subtitle }) => (
    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3 bg-gray-50/60 dark:bg-gray-900/40 rounded-t-2xl">
        <Icon className="h-4 w-4 text-indigo-500" />
        <div>
            <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">{title}</h2>
            {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500">{subtitle}</p>}
        </div>
    </div>
);

const StepIndicator = ({ current }) => (
    <div className="flex items-center">
        {STEPS.map((label, i) => {
            const idx    = i + 1;
            const done   = idx < current;
            const active = idx === current;
            return (
                <React.Fragment key={idx}>
                    <div className="flex flex-col items-center">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
                            ${done   ? 'bg-white border-white text-indigo-600'
                            : active ? 'bg-white/20 border-white text-white'
                            :          'bg-white/10 border-white/30 text-white/50'}`}>
                            {done ? <CheckCircle className="h-4 w-4" /> : idx}
                        </div>
                        <span className={`mt-1 text-xs font-medium hidden sm:block ${active ? 'text-white' : done ? 'text-indigo-200' : 'text-white/40'}`}>
                            {label}
                        </span>
                    </div>
                    {i < STEPS.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-2 mb-4 rounded ${done ? 'bg-white/60' : 'bg-white/20'}`} />
                    )}
                </React.Fragment>
            );
        })}
    </div>
);

const ReviewRow = ({ label, value, highlight }) => (
    <div className="flex justify-between items-start py-2.5 border-b border-gray-100 dark:border-gray-700 last:border-0">
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</span>
        <span className={`text-xs font-semibold text-right max-w-[60%] ${highlight ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-800 dark:text-gray-200'}`}>
            {value || <span className="text-gray-300 dark:text-gray-600">—</span>}
        </span>
    </div>
);

// ── Cascade step indicator (visual trail for dropdowns) ────────────────────────

const CascadeStep = ({ num, label, done, active }) => (
    <div className={`flex items-center gap-2 text-xs font-semibold transition-all ${
        done   ? 'text-indigo-600 dark:text-indigo-400'
        : active ? 'text-gray-700 dark:text-gray-200'
        :          'text-gray-300 dark:text-gray-600'}`}>
        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border shrink-0 ${
            done   ? 'bg-indigo-100 dark:bg-indigo-900/40 border-indigo-300 dark:border-indigo-700'
            : active ? 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
            :          'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
            {done ? <CheckCircle className="h-3 w-3" /> : num}
        </div>
        {label}
    </div>
);

// ── Main Component ─────────────────────────────────────────────────────────────

const AgencyCreation = ({ menuData }) => {
    const dispatch = useDispatch();
    const { userData } = useSelector((s) => s.auth);

    const roleId    = userData?.roleId    || userData?.RID  || 0;
    const createdBy = userData?.empCode   || userData?.userId || userData?.UID || '';

    const natureGroups        = useSelector(selectNatureGroups);
    const natureGroupsLoading = useSelector(selectNatureGroupsLoading);
    const masterGroups        = useSelector(selectMasterGroups);
    const masterGroupsLoading = useSelector(selectMasterGroupsLoading);
    const subGroups           = useSelector(selectSubGroups);
    const subGroupsLoading    = useSelector(selectSubGroupsLoading);
    const saveStatus          = useSelector(selectAgencySaveStatus);
    const saveLoading         = useSelector(selectAgencySaveLoading);
    const saveError           = useSelector(selectAgencySaveError);

    // ── Form state ────────────────────────────────────────────────────────────

    const [step,           setStep]          = useState(1);
    const [submitted,      setSubmitted]     = useState(false);

    const [agencyName,     setAgencyName]    = useState('');
    const [agencyAddress,  setAgencyAddress] = useState('');
    const [natureGroupId,  setNatureGroupId] = useState('');
    const [groupId,        setGroupId]       = useState('');
    const [subGroupId,     setSubGroupId]    = useState('');

    // ── Derived labels for review ─────────────────────────────────────────────

    const selectedNature   = natureGroups.find(n => n.NatureGroupId === natureGroupId);
    const selectedGroup    = masterGroups.find(g => g.GroupId       === groupId);
    const selectedSubGroup = subGroups.find(s  => String(s.Id)      === String(subGroupId));

    // ── On mount ──────────────────────────────────────────────────────────────

    useEffect(() => {
        dispatch(fetchNatureGroups());
        return () => dispatch(resetAgencyCreation());
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]);

    // ── Cascade: Nature Group → Master Group ──────────────────────────────────

    useEffect(() => {
        if (natureGroupId) {
            setGroupId('');
            setSubGroupId('');
            dispatch(clearSubGroups());
            dispatch(fetchMasterGroups(natureGroupId));
        } else {
            dispatch(clearMasterGroups());
            dispatch(clearSubGroups());
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [natureGroupId]);

    // ── Cascade: Master Group → Sub Group ─────────────────────────────────────

    useEffect(() => {
        if (groupId) {
            setSubGroupId('');
            dispatch(fetchSubGroups(groupId));
        } else {
            dispatch(clearSubGroups());
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [groupId]);

    // ── Toast on save result ──────────────────────────────────────────────────

    useEffect(() => {
        if (saveStatus === 'success') {
            toast.success('Agency created successfully!');
            setSubmitted(true);
        } else if (saveStatus === 'failed') {
            toast.error(saveError || 'Save failed. Please try again.');
            dispatch(clearSaveResult());
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [saveStatus]);

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleReset = useCallback(() => {
        setStep(1); setSubmitted(false);
        setAgencyName(''); setAgencyAddress('');
        setNatureGroupId(''); setGroupId(''); setSubGroupId('');
        dispatch(resetAgencyCreation());
        dispatch(fetchNatureGroups());
    }, [dispatch]);

    const handleSubmit = () => {
        dispatch(submitAgency({
            AgencyName:    agencyName,
            AgencyAddress: agencyAddress,
            NatureGroupId: natureGroupId,
            GroupId:       groupId,
            SubGroupId:    parseInt(subGroupId, 10),
            Action:        'Add',
            RoleId:        parseInt(roleId, 10),
            Createdby:     String(createdBy),
        }));
    };

    // ── Validation ────────────────────────────────────────────────────────────

    const step1Valid = agencyName.trim() && natureGroupId && groupId && subGroupId;

    // ── Success screen ────────────────────────────────────────────────────────

    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 md:p-6 flex items-center justify-center">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-10 max-w-sm w-full text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-5 shadow-lg">
                        <CheckCircle className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">Agency Created</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">{agencyName}</span> has been added successfully.
                    </p>
                    <p className="text-xs text-gray-400 mb-6">
                        {selectedNature?.NatureGroupName} › {selectedGroup?.GroupName} › {selectedSubGroup?.Name}
                    </p>
                    <button onClick={handleReset}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold shadow-md hover:from-indigo-700 hover:to-purple-700 transition-all">
                        Add Another Agency
                    </button>
                </div>
            </div>
        );
    }

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 md:p-6">

            {/* ── Page Header ───────────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto mb-6">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-700 shadow-xl shadow-indigo-500/20 p-7 text-white">
                    <div className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                    <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500 rounded-full -translate-y-1/2 translate-x-1/4 opacity-20 blur-3xl" />

                    <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shadow-lg border border-white/20">
                                <Landmark className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full">Accounts Module</span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                                    {menuData?.name || 'Term Loan Agency'}
                                </h1>
                                <p className="text-indigo-200 text-sm mt-0.5">Register a new lending agency / financial institution</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={handleReset}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-semibold transition-all">
                                <RotateCcw className="h-3.5 w-3.5" /> Reset
                            </button>
                            <div className="hidden sm:flex items-center gap-2 text-indigo-200">
                                <div className="text-right">
                                    <p className="text-xs uppercase tracking-wider">Module</p>
                                    <p className="text-sm font-bold text-white">Accounts / Term Loan</p>
                                </div>
                                <Navigation className="h-5 w-5 opacity-60" />
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <StepIndicator current={step} />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto space-y-6">

                {/* ── STEP 1: Agency Details ────────────────────────────────── */}
                {step === 1 && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <SectionHeader icon={FileText} title="Agency Details"
                            subtitle="Name, address and ledger group classification"
                        />
                        <div className="p-6 md:p-8 space-y-6">

                            {/* Agency Name + Address */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label required>Agency / Lender Name</Label>
                                    <div className="relative">
                                        <input type="text" className={inputCls + ' pl-9'} placeholder="e.g. Kotak Mahindra Bank Ltd."
                                            value={agencyName} onChange={e => setAgencyName(e.target.value)} />
                                        <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                                            <Building2 className="h-4 w-4 text-gray-400" />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <Label>Agency Address</Label>
                                    <div className="relative">
                                        <input type="text" className={inputCls + ' pl-9'} placeholder="Branch address (optional)"
                                            value={agencyAddress} onChange={e => setAgencyAddress(e.target.value)} />
                                        <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                                            <MapPin className="h-4 w-4 text-gray-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Ledger Group Classification */}
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <Layers className="h-4 w-4 text-indigo-500" />
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Ledger Group Classification</span>
                                </div>

                                {/* Cascade trail */}
                                <div className="flex items-center gap-3 mb-4 flex-wrap">
                                    <CascadeStep num={1} label="Nature Group" done={!!natureGroupId} active={!natureGroupId} />
                                    <div className="h-px w-6 bg-gray-200 dark:bg-gray-700 hidden sm:block" />
                                    <CascadeStep num={2} label="Master Group" done={!!groupId} active={!!natureGroupId && !groupId} />
                                    <div className="h-px w-6 bg-gray-200 dark:bg-gray-700 hidden sm:block" />
                                    <CascadeStep num={3} label="Sub Group"    done={!!subGroupId} active={!!groupId && !subGroupId} />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                                    {/* Nature Group */}
                                    <div>
                                        <Label required>Nature Group</Label>
                                        <div className="relative">
                                            <select className={selectCls} value={natureGroupId}
                                                onChange={e => setNatureGroupId(e.target.value)}
                                                disabled={natureGroupsLoading}>
                                                <option value="">{natureGroupsLoading ? 'Loading…' : '— Select —'}</option>
                                                {natureGroups.map(n => (
                                                    <option key={n.NatureGroupId} value={n.NatureGroupId}>{n.NatureGroupName}</option>
                                                ))}
                                            </select>
                                            <SelectIcon loading={natureGroupsLoading} />
                                        </div>
                                    </div>

                                    {/* Master Group */}
                                    <div>
                                        <Label required>Master Group</Label>
                                        <div className="relative">
                                            <select className={selectCls} value={groupId}
                                                onChange={e => setGroupId(e.target.value)}
                                                disabled={!natureGroupId || masterGroupsLoading}>
                                                <option value="">
                                                    {masterGroupsLoading ? 'Loading…'
                                                        : !natureGroupId ? '— Select nature group first —'
                                                        : '— Select —'}
                                                </option>
                                                {masterGroups.map(g => (
                                                    <option key={g.GroupId} value={g.GroupId}>{g.GroupName}</option>
                                                ))}
                                            </select>
                                            <SelectIcon loading={masterGroupsLoading} />
                                        </div>
                                    </div>

                                    {/* Sub Group */}
                                    <div>
                                        <Label required>Sub Group</Label>
                                        <div className="relative">
                                            <select className={selectCls} value={subGroupId}
                                                onChange={e => setSubGroupId(e.target.value)}
                                                disabled={!groupId || subGroupsLoading}>
                                                <option value="">
                                                    {subGroupsLoading ? 'Loading…'
                                                        : !groupId ? '— Select master group first —'
                                                        : '— Select —'}
                                                </option>
                                                {subGroups.map(s => (
                                                    <option key={s.Id} value={s.Id}>{s.Name}</option>
                                                ))}
                                            </select>
                                            <SelectIcon loading={subGroupsLoading} />
                                        </div>
                                    </div>
                                </div>

                                {/* Selected path breadcrumb */}
                                {(natureGroupId || groupId || subGroupId) && (
                                    <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                                        <Tag className="h-3.5 w-3.5 text-indigo-400" />
                                        {selectedNature && (
                                            <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 font-medium border border-indigo-100 dark:border-indigo-800/40">
                                                {selectedNature.NatureGroupName}
                                            </span>
                                        )}
                                        {selectedGroup && (
                                            <>
                                                <span className="text-xs text-gray-300 dark:text-gray-600">›</span>
                                                <span className="text-xs px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 font-medium border border-purple-100 dark:border-purple-800/40">
                                                    {selectedGroup.GroupName}
                                                </span>
                                            </>
                                        )}
                                        {selectedSubGroup && (
                                            <>
                                                <span className="text-xs text-gray-300 dark:text-gray-600">›</span>
                                                <span className="text-xs px-2 py-0.5 rounded-md bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-300 font-medium border border-violet-100 dark:border-violet-800/40">
                                                    {selectedSubGroup.Name}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end pt-2">
                                <button type="button" onClick={() => setStep(2)} disabled={!step1Valid}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold shadow-md hover:from-indigo-700 hover:to-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                                    <Eye className="h-4 w-4" /> Review
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── STEP 2: Review & Submit ───────────────────────────────── */}
                {step === 2 && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <SectionHeader icon={Eye} title="Review & Submit"
                            subtitle="Confirm agency details before saving"
                        />
                        <div className="p-6 md:p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

                                {/* Agency Identity */}
                                <div className="bg-gray-50/60 dark:bg-gray-900/30 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Agency Identity</p>
                                    <ReviewRow label="Agency Name"    value={agencyName}    highlight />
                                    <ReviewRow label="Agency Address" value={agencyAddress} />
                                </div>

                                {/* Ledger Classification */}
                                <div className="bg-gray-50/60 dark:bg-gray-900/30 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Ledger Classification</p>
                                    <ReviewRow label="Nature Group"  value={selectedNature?.NatureGroupName}   />
                                    <ReviewRow label="Master Group"  value={selectedGroup?.GroupName}          />
                                    <ReviewRow label="Sub Group"     value={selectedSubGroup?.Name} highlight  />
                                </div>
                            </div>

                            {/* Navigation */}
                            <div className="flex justify-between">
                                <button type="button" onClick={() => setStep(1)} disabled={saveLoading}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:border-indigo-300 dark:hover:border-indigo-700 disabled:opacity-40 transition-all">
                                    Back
                                </button>
                                <button type="button" onClick={handleSubmit} disabled={saveLoading}
                                    className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold shadow-md hover:from-indigo-700 hover:to-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                                    {saveLoading
                                        ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
                                        : <><Send className="h-4 w-4" /> Submit</>}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AgencyCreation;
