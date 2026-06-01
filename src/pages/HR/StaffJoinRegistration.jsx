import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import CustomDatePicker from '../../components/CustomDatePicker';
import { fileToBase64, getFileType, getStaffDataForRejoin } from '../../api/HRAPI/staffRegistrationAPI';

import {
    fetchAllEmpGroups,
    fetchAllEmpCategories,
    fetchAllDesignations,
    fetchAllDepartments,
    fetchEmployeeBanks,
    fetchEmpDegrees,
    fetchEmpDocuments,
    fetchReportToRole,
    fetchAllCostCenters,
    fetchOldEmpForRejoin,
    saveStaffRegistration,
    updateRejoinStaffRegistration,
    saveDesignation,
    saveDepartment,
    saveEmployeeBank,
    clearSaveResult,
    clearUpdateRejoinResult,
    clearOldEmpForRejoin,
    clearDesignationResult,
    clearDepartmentResult,
    clearEmployeeBankResult,
    selectEmpGroupsArray,
    selectEmpCategoriesArray,
    selectDesignationsArray,
    selectDepartmentsArray,
    selectEmployeeBanksArray,
    selectEmpDegreesArray,
    selectEmpDocumentsArray,
    selectReportToRoleArray,
    selectCostCentersArray,
    selectOldEmpForRejoinArray,
    selectEmpGroupsLoading,
    selectEmpCategoriesLoading,
    selectDesignationsLoading,
    selectDepartmentsLoading,
    selectEmployeeBanksLoading,
    selectOldEmpForRejoinLoading,
    selectSaveLoading,
    selectUpdateRejoinLoading,
    selectSaveDesignationLoading,
    selectSaveDepartmentLoading,
    selectSaveEmployeeBankLoading,
    selectSaveStatus,
    selectSaveError,
    selectUpdateRejoinStatus,
    selectUpdateRejoinError,
    selectSaveDesignationStatus,
    selectSaveDepartmentStatus,
    selectSaveEmployeeBankStatus,
    selectSaveDesignationError,
    selectSaveDepartmentError,
    resetAll,
} from '../../slices/HRSlice/staffJoinSlice';

import {
    User, ChevronRight, ChevronDown, Users, FileText,
    Phone, Mail, Briefcase, GraduationCap, Heart, Baby,
    UserPlus, RotateCcw, Save, CheckCircle,
    AlertCircle, Loader2, Calendar, X, ChevronUp,
    Shield, BookOpen, List, PhoneCall,
    ArrowRight, Layout, Star, Plus, Upload,
    Paperclip, Trash2, Eye, ImageIcon, FileCheck,
    Building2, CreditCard, Search,
} from 'lucide-react';

const Layers = Layout;
const Contact = PhoneCall;
const ClipboardList = List;
const Landmark = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="22" x2="21" y2="22" /><line x1="6" y1="18" x2="6" y2="11" />
        <line x1="10" y1="18" x2="10" y2="11" /><line x1="14" y1="18" x2="14" y2="11" />
        <line x1="18" y1="18" x2="18" y2="11" /><polygon points="12 2 20 7 4 7" />
    </svg>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const calculateAge = (dob) => {
    if (!dob) return '';
    const today = new Date();
    const birth = new Date(dob);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age > 0 ? String(age) : '';
};

/**
 * Returns dd-MMM-yyyy (e.g. "01-Mar-2026") matching the legacy MVC app format
 * expected by the backend stored procedure.
 */
const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const formatDateForAPI = (date) => {
    if (!date) return '';
    // Already dd-MMM-yyyy
    if (typeof date === 'string' && /^\d{2}-[A-Za-z]{3}-\d{4}$/.test(date)) return date;
    // Parse "YYYY-MM-DD" without timezone shift
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}/.test(date)) {
        const [yyyy, mm, dd] = date.split('T')[0].split('-');
        return `${dd}-${MONTH_ABBR[parseInt(mm, 10) - 1]}-${yyyy}`;
    }
    // Date object fallback
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return `${String(d.getDate()).padStart(2, '0')}-${MONTH_ABBR[d.getMonth()]}-${d.getFullYear()}`;
};

/**
 * ── FIX: Safely serialize any value to a date string (YYYY-MM-DD).
 *    Prevents Date objects from ever reaching React's render tree or
 *    Redux state, which causes "Objects are not valid as a React child".
 */
const serializeDate = (val) => {
    if (!val) return '';
    if (val instanceof Date) {
        const yyyy = val.getFullYear();
        const mm = String(val.getMonth() + 1).padStart(2, '0');
        const dd = String(val.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }
    return String(val);
};

/**
 * Converts backend "dd-MMM-yyyy" (e.g. "06-May-1981") to "YYYY-MM-DD" for Formik / CustomDatePicker.
 */
const MONTH_MAP = { Jan:1, Feb:2, Mar:3, Apr:4, May:5, Jun:6, Jul:7, Aug:8, Sep:9, Oct:10, Nov:11, Dec:12 };
const parseLegacyDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return '';
    const month = MONTH_MAP[parts[1]];
    if (!month) return '';
    return `${parts[2]}-${String(month).padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
};

// ─── Step Config ───────────────────────────────────────────────────────────────
const STEPS = [
    { id: 1, label: 'Setup', icon: Layers, desc: 'Joining type & category' },
    { id: 2, label: 'Personal', icon: User, desc: 'Basic personal info' },
    { id: 3, label: 'Contact', icon: Phone, desc: 'Contact & address' },
    { id: 4, label: 'Nominee', icon: Heart, desc: 'Nominee details' },
    { id: 5, label: 'Job', icon: Briefcase, desc: 'Job & department' },
    { id: 6, label: 'Bank', icon: Landmark, desc: 'Banking details' },
    { id: 7, label: 'Education', icon: GraduationCap, desc: 'Academic & skills' },
    { id: 8, label: 'Experience', icon: ClipboardList, desc: 'Work history' },
    { id: 9, label: 'Family', icon: Users, desc: 'Family & children' },
    { id: 10, label: 'PF & ESI', icon: Shield, desc: 'Statutory info' },
    { id: 11, label: 'Documents', icon: FileText, desc: 'Upload documents' },
];

const GENDER_OPTIONS = ['Male', 'Female', 'Other'];
const MARITAL_OPTIONS = ['Single', 'Married', 'Divorced', 'Widowed'];
const RELATION_OPTIONS = ['Spouse', 'Parent', 'Sibling', 'Child', 'Other'];
const JOB_TYPES = ['Permanent', 'Full Time', 'Part Time', 'Contract', 'Internship'];
const PF_OPTIONS = ['Yes', 'No'];

// Mandatory docs that must be uploaded
const MANDATORY_DOCS = ['Photo', 'Aadhar Card', 'BankDetails'];

// ─── Add-New Popup Component ───────────────────────────────────────────────────
const AddNewPopup = ({ title, icon: Icon, fields, onSave, onClose, saving }) => {
    const [values, setValues] = useState({});
    const ref = useRef();

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [onClose]);

    const handleSubmit = () => {
        const missing = fields.filter(f => f.required && !values[f.key]?.trim());
        if (missing.length) { toast.error(`${missing[0].label} is required`); return; }
        onSave(values);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div ref={ref} className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 bg-linear-to-r from-blue-600 to-purple-600 text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                            <Icon className="h-4 w-4" />
                        </div>
                        <h3 className="text-sm font-bold">{title}</h3>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    {fields.map(f => (
                        <div key={f.key}>
                            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                {f.label} {f.required && <span className="text-rose-500">*</span>}
                            </label>
                            <input
                                type={f.type || 'text'}
                                placeholder={f.placeholder || f.label}
                                value={values[f.key] || ''}
                                onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value }))}
                                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all"
                            />
                        </div>
                    ))}
                </div>
                <div className="flex gap-3 px-6 pb-6">
                    <button onClick={onClose}
                        className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={saving}
                        className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold bg-linear-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 disabled:opacity-60 transition-all flex items-center justify-center gap-2 shadow-md">
                        {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <><Save className="h-4 w-4" /> Save</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Dropdown with Add-New Link ────────────────────────────────────────────────
const DropdownWithAdd = ({
    label, required, error, touched, value, onChange, onBlur,
    options, valueKey, labelKey, placeholder, loading,
    onAddNew, addLabel,
    searchable = false,
}) => {
    const [search, setSearch] = useState('');
    const filtered = searchable
        ? options.filter(o => (o[labelKey] || '').toLowerCase().includes(search.toLowerCase()))
        : options;

    return (
        <div>
            <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    {label} {required && <span className="text-rose-500 ml-0.5">*</span>}
                </label>
                {onAddNew && (
                    <button type="button" onClick={onAddNew}
                        className="flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-700 transition-colors">
                        <Plus className="h-2.5 w-2.5" /> {addLabel || 'Add New'}
                    </button>
                )}
            </div>
            <div className="relative">
                <select
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    className={`w-full px-3.5 py-2.5 rounded-xl border-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 transition-all cursor-pointer
                        ${touched && error
                            ? 'border-rose-300 dark:border-rose-600 focus:border-rose-500 focus:ring-rose-100'
                            : 'border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-100 dark:focus:ring-blue-900/30 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                >
                    <option value="">{loading ? 'Loading…' : (placeholder || `Select ${label}`)}</option>
                    {filtered.map(o => (
                        <option key={o[valueKey]} value={o[valueKey]}>{o[labelKey]}</option>
                    ))}
                </select>
                {loading && <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-blue-500" />}
            </div>
            {touched && error && (
                <p className="text-[10px] text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />{error}
                </p>
            )}
        </div>
    );
};

// ─── Document Upload Row ───────────────────────────────────────────────────────
const DocumentRow = ({ docName, mandatory, file, onUpload, onRemove, onPreview }) => {
    const fileRef = useRef();
    const isImage = file && file.type?.startsWith('image/');
    const isPdf = file && file.type === 'application/pdf';

    return (
        <div className={`flex items-center gap-4 p-3.5 rounded-xl border-2 transition-all
            ${file
                ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10'
                : mandatory
                    ? 'border-rose-200 dark:border-rose-800 bg-rose-50/30 dark:bg-rose-900/10'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
            }`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0
                ${file ? 'bg-green-100 dark:bg-green-900/40' : mandatory ? 'bg-rose-100 dark:bg-rose-900/40' : 'bg-gray-100 dark:bg-gray-700'}`}>
                {file
                    ? <FileCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                    : <FileText className="h-4 w-4 text-gray-400" />
                }
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 truncate">{docName}</p>
                    {mandatory && (
                        <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded-md">Required</span>
                    )}
                </div>
                {file
                    ? <p className="text-[10px] text-green-600 dark:text-green-400 mt-0.5 truncate">{file.name} ({(file.size / 1024).toFixed(0)} KB)</p>
                    : <p className="text-[10px] text-gray-400 mt-0.5">No file uploaded</p>
                }
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
                {file && (isImage || isPdf) && (
                    <button type="button" onClick={() => onPreview(file)}
                        className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 transition-colors">
                        <Eye className="h-3.5 w-3.5" />
                    </button>
                )}
                {file && (
                    <button type="button" onClick={() => onRemove(docName)}
                        className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 flex items-center justify-center text-rose-500 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                )}
                <button type="button" onClick={() => fileRef.current?.click()}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                        ${file
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                            : 'bg-linear-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-sm'
                        }`}>
                    <Upload className="h-3 w-3" />
                    {file ? 'Replace' : 'Upload'}
                </button>
                <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden"
                    onChange={e => { if (e.target.files?.[0]) { onUpload(docName, e.target.files[0]); e.target.value = ''; } }} />
            </div>
        </div>
    );
};

// ─── Preview Modal ─────────────────────────────────────────────────────────────
const PreviewModal = ({ file, onClose }) => {
    const url = file ? URL.createObjectURL(file) : null;
    useEffect(() => { return () => { if (url) URL.revokeObjectURL(url); }; }, [url]);
    if (!file) return null;
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="max-w-3xl w-full max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-200 truncate">{file.name}</p>
                    <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <div className="overflow-auto max-h-[80vh] flex items-center justify-center p-4">
                    {file.type?.startsWith('image/')
                        ? <img src={url} alt={file.name} className="max-w-full max-h-full rounded-lg object-contain" />
                        : <iframe src={url} title={file.name} className="w-full h-[70vh] rounded-lg border-0" />
                    }
                </div>
            </div>
        </div>
    );
};

// ─── Sub-Components ────────────────────────────────────────────────────────────
const StepIndicator = ({ steps, currentStep, completedSteps, onStepClick }) => (
    <div className="hidden lg:flex flex-col gap-1 w-56 shrink-0">
        {steps.map((step) => {
            const done = completedSteps.includes(step.id);
            const active = currentStep === step.id;
            // A step is unlocked if it is: already done, currently active,
            // or step 1 (always accessible). All others locked until previous is done.
            const unlocked = step.id === 1 || done || active || completedSteps.includes(step.id - 1);
            const Icon = step.icon;
            return (
                <button key={step.id}
                    onClick={() => unlocked && onStepClick(step.id)}
                    disabled={!unlocked}
                    title={!unlocked ? 'Complete previous steps first' : ''}
                    className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200
                        ${active
                            ? 'bg-linear-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20 scale-[1.02]'
                            : done
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 cursor-pointer'
                                : unlocked
                                    ? 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/60 border border-gray-200 dark:border-gray-700 cursor-pointer'
                                    : 'bg-gray-50 dark:bg-gray-900 text-gray-300 dark:text-gray-600 border border-gray-100 dark:border-gray-800 cursor-not-allowed opacity-50'
                        }`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all
                        ${active ? 'bg-white/20' : done ? 'bg-blue-100 dark:bg-blue-800' : 'bg-gray-100 dark:bg-gray-700'}`}>
                        {done && !active
                            ? <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            : <Icon className={`h-4 w-4 ${active ? 'text-white' : unlocked ? 'text-gray-400 dark:text-gray-500' : 'text-gray-300 dark:text-gray-600'}`} />}
                    </div>
                    <div className="min-w-0">
                        <p className={`text-xs font-bold leading-tight ${active ? 'text-white' : done ? 'text-blue-700 dark:text-blue-300' : unlocked ? 'text-gray-500 dark:text-gray-400' : 'text-gray-300 dark:text-gray-600'}`}>
                            {step.label}
                        </p>
                        <p className={`text-[10px] leading-tight truncate ${active ? 'text-white/70' : 'text-gray-400 dark:text-gray-500'}`}>
                            {step.desc}
                        </p>
                    </div>
                    {done && !active && <CheckCircle className="h-3.5 w-3.5 text-blue-500 ml-auto shrink-0" />}
                </button>
            );
        })}
    </div>
);

const FormField = ({ label, required, error, touched, children, hint, className = '' }) => (
    <div className={className}>
        <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
            {label} {required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
        {children}
        {hint && !error && <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{hint}</p>}
        {touched && error && (
            <p className="text-[10px] text-rose-500 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />{error}
            </p>
        )}
    </div>
);

const inputCls = (error, touched) =>
    `w-full px-3.5 py-2.5 rounded-xl border-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 
     focus:outline-none focus:ring-2 transition-all duration-150
     ${touched && error
        ? 'border-rose-300 dark:border-rose-600 focus:border-rose-500 focus:ring-rose-100 dark:focus:ring-rose-900/30'
        : 'border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-100 dark:focus:ring-blue-900/30 hover:border-gray-300 dark:hover:border-gray-600'
    }`;

const selectCls = (error, touched) =>
    `w-full px-3.5 py-2.5 rounded-xl border-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100
     focus:outline-none focus:ring-2 transition-all duration-150 cursor-pointer
     ${touched && error
        ? 'border-rose-300 dark:border-rose-600 focus:border-rose-500 focus:ring-rose-100'
        : 'border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-100 dark:focus:ring-blue-900/30 hover:border-gray-300 dark:hover:border-gray-600'
    }`;

const SectionHeader = ({ icon: Icon, title, subtitle, gradient = 'from-blue-600 to-purple-600' }) => (
    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
        <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${gradient} flex items-center justify-center shrink-0 shadow-md`}>
            <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">{title}</h3>
            {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
    </div>
);

const OptionCard = ({ label, desc, icon: Icon, selected, onClick, color = 'blue' }) => {
    const colors = {
        blue: { ring: 'ring-blue-500 border-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30', icon: 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300', text: 'text-blue-700 dark:text-blue-300' },
        purple: { ring: 'ring-purple-500 border-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/30', icon: 'bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-300', text: 'text-purple-700 dark:text-purple-300' },
        green: { ring: 'ring-green-500 border-green-400', bg: 'bg-green-50 dark:bg-green-900/30', icon: 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300', text: 'text-green-700 dark:text-green-300' },
        amber: { ring: 'ring-amber-500 border-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30', icon: 'bg-amber-100 dark:bg-amber-800 text-amber-600 dark:text-amber-300', text: 'text-amber-700 dark:text-amber-300' },
    };
    const c = colors[color] || colors.blue;
    return (
        <button type="button" onClick={onClick}
            className={`group relative flex items-center gap-4 p-4 rounded-2xl border-2 w-full text-left transition-all duration-200
                        ${selected ? `${c.ring} ${c.bg} ring-2 shadow-md` : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm'}`}>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all ${selected ? c.icon : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'}`}>
                <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold ${selected ? c.text : 'text-gray-700 dark:text-gray-300'}`}>{label}</p>
                {desc && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 leading-tight">{desc}</p>}
            </div>
            {selected && <CheckCircle className={`h-5 w-5 shrink-0 ${c.text}`} />}
        </button>
    );
};

const CollapsibleSection = ({ title, icon: Icon, children, defaultOpen = true }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden mb-4">
            <button type="button" onClick={() => setOpen(v => !v)}
                className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors">
                <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{title}</span>
                </div>
                {open ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
            </button>
            {open && <div className="p-5 bg-white dark:bg-gray-800">{children}</div>}
        </div>
    );
};

const DynamicTable = ({ label, icon: Icon, columns, rows, onAdd, onRemove, onChange, addLabel = 'Add Row' }) => (
    <div>
        <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-blue-500" />
                <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">{label}</span>
            </div>
            <button type="button" onClick={onAdd}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors border border-blue-200 dark:border-blue-700">
                <UserPlus className="h-3.5 w-3.5" /> {addLabel}
            </button>
        </div>
        {rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-gray-400">
                <Icon className="h-8 w-8 mb-2 opacity-30" />
                <p className="text-xs">No entries yet. Click "{addLabel}" to add.</p>
            </div>
        ) : (
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <div className="grid text-xs font-bold text-white px-4 py-2.5 bg-linear-to-r from-blue-600 to-purple-600"
                    style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr) 40px` }}>
                    {columns.map(c => <div key={c.key}>{c.label}</div>)}
                    <div></div>
                </div>
                {rows.map((row, ridx) => (
                    <div key={ridx}
                        className={`grid items-center px-4 py-2 gap-2 border-b border-gray-100 dark:border-gray-700 last:border-0 ${ridx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/60 dark:bg-gray-800/60'}`}
                        style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr) 40px` }}>
                        {columns.map(col => (
                            <div key={col.key}>
                                {col.type === 'select' ? (
                                    <select value={row[col.key] || ''} onChange={e => onChange(ridx, col.key, e.target.value)}
                                        className="w-full text-xs px-2 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-blue-400">
                                        <option value="">Select</option>
                                        {col.options?.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                ) : col.type === 'date' ? (
                                    <input
                                        type="date"
                                        value={serializeDate(row[col.key])}
                                        onChange={e => onChange(ridx, col.key, e.target.value)}
                                        className="w-full text-xs px-2 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-blue-400"
                                    />
                                ) : col.type === 'apiSelect' ? (
                                    <select value={row[col.key] || ''} onChange={e => onChange(ridx, col.key, e.target.value)}
                                        className="w-full text-xs px-2 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-blue-400">
                                        <option value="">Select</option>
                                        {col.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                    </select>
                                ) : (
                                    <input
                                        type={col.type || 'text'}
                                        placeholder={col.placeholder || col.label}
                                        value={serializeDate(row[col.key])}
                                        onChange={e => onChange(ridx, col.key, e.target.value)}
                                        className="w-full text-xs px-2 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-blue-400"
                                    />
                                )}
                            </div>
                        ))}
                        <button type="button" onClick={() => onRemove(ridx)}
                            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/30 text-rose-400 transition-colors">
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                ))}
            </div>
        )}
    </div>
);

// ─── Validation Schema ─────────────────────────────────────────────────────────
// Validation is split by step.
// Only Step 1 fields are in Yup schema (blocks goNext on Step 1).
// All other fields are validated manually inside goNext() and onSubmit().
const validationSchema = Yup.object({});

// ─── Main Component ────────────────────────────────────────────────────────────
const StaffJoinRegistration = () => {
    const dispatch = useDispatch();

    const { userData } = useSelector(s => s.auth);
    const roleId = userData?.roleId || userData?.RID || '';
    const userName = userData?.userName || userData?.username || 'User';

    // ── Selectors ──────────────────────────────────────────────────────────
    const empGroups = useSelector(selectEmpGroupsArray);
    const empCategories = useSelector(selectEmpCategoriesArray);
    const designations = useSelector(selectDesignationsArray);
    const departments = useSelector(selectDepartmentsArray);
    const employeeBanks = useSelector(selectEmployeeBanksArray);
    const empDegrees = useSelector(selectEmpDegreesArray);
    const empDocuments = useSelector(selectEmpDocumentsArray);
    const reportToList = useSelector(selectReportToRoleArray);
    const costCenters = useSelector(selectCostCentersArray);
    const oldEmpList = useSelector(selectOldEmpForRejoinArray);

    const groupsLoading = useSelector(selectEmpGroupsLoading);
    const catLoading = useSelector(selectEmpCategoriesLoading);
    const designationsLoading = useSelector(selectDesignationsLoading);
    const departmentsLoading = useSelector(selectDepartmentsLoading);
    const banksLoading = useSelector(selectEmployeeBanksLoading);
    const oldEmpSearchLoading = useSelector(selectOldEmpForRejoinLoading);

    const saveLoading = useSelector(selectSaveLoading);
    const updateRejoinLoading = useSelector(selectUpdateRejoinLoading);
    const saveDesignationLoading = useSelector(selectSaveDesignationLoading);
    const saveDepartmentLoading = useSelector(selectSaveDepartmentLoading);
    const saveEmployeeBankLoading = useSelector(selectSaveEmployeeBankLoading);

    const saveStatus = useSelector(selectSaveStatus);
    const saveError = useSelector(selectSaveError);
    const updateRejoinStatus = useSelector(selectUpdateRejoinStatus);
    const updateRejoinError = useSelector(selectUpdateRejoinError);
    const saveDesignationStatus = useSelector(selectSaveDesignationStatus);
    const saveDepartmentStatus = useSelector(selectSaveDepartmentStatus);
    const saveEmployeeBankStatus = useSelector(selectSaveEmployeeBankStatus);
    const saveDesignationError = useSelector(selectSaveDesignationError);
    const saveDepartmentError = useSelector(selectSaveDepartmentError);

    // ── Local UI State ─────────────────────────────────────────────────────
    const [currentStep, setCurrentStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState([]);

    // Popup states
    const [showAddDesignation, setShowAddDesignation] = useState(false);
    const [showAddDepartment, setShowAddDepartment] = useState(false);
    const [showAddBank, setShowAddBank] = useState(false);

    // Document uploads: { [docName]: File }
    const [uploadedDocs, setUploadedDocs] = useState({});
    const [previewFile, setPreviewFile] = useState(null);

    // Rejoin search state
    const [rejoinPrefix, setRejoinPrefix] = useState('');
    const [rejoinSelectedEmp, setRejoinSelectedEmp] = useState(null);
    const [rejoinEmpRefNo, setRejoinEmpRefNo] = useState('');
    const [rejoinDataLoading, setRejoinDataLoading] = useState(false);

    // Experience type toggle: 'fresher' | 'experienced'
    const [experienceType, setExperienceType] = useState('');
    const [expError, setExpError] = useState('');

    // Dynamic table rows
    const [familyRows, setFamilyRows] = useState([]);
    const [childRows, setChildRows] = useState([]);
    const [academicRows, setAcademicRows] = useState([]);
    const [techRows, setTechRows] = useState([]);
    const [expRows, setExpRows] = useState([]);
    const [refRows, setRefRows] = useState([]);

    // ── Data Fetching ──────────────────────────────────────────────────────
    useEffect(() => {
        dispatch(fetchAllEmpGroups());
        dispatch(fetchAllDesignations());
        dispatch(fetchAllDepartments());
        dispatch(fetchEmployeeBanks());
        dispatch(fetchEmpDegrees());
        dispatch(fetchEmpDocuments());
        dispatch(fetchAllCostCenters());
        return () => dispatch(resetAll());
    }, [dispatch]);

    // ── Watch save status ──────────────────────────────────────────────────
    useEffect(() => {
        if (saveStatus === 'success') {
            toast.success('Staff registration saved successfully!');
            formik.resetForm();
            setCurrentStep(1);
            setCompletedSteps([]);
            setUploadedDocs({});
            setExperienceType('');
            setExpRows([]);
            dispatch(clearSaveResult());
        } else if (saveStatus === 'failed' && saveError) {
            toast.error(typeof saveError === 'string' ? saveError : 'Registration failed. Please try again.');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [saveStatus, saveError]);

    // ── Watch rejoin update status ─────────────────────────────────────────
    useEffect(() => {
        if (updateRejoinStatus === 'success') {
            toast.success('Rejoin registration updated successfully!');
            formik.resetForm();
            setCurrentStep(1);
            setCompletedSteps([]);
            setUploadedDocs({});
            setExperienceType('');
            setExpRows([]);
            setRejoinSelectedEmp(null);
            setRejoinEmpRefNo('');
            setRejoinPrefix('');
            dispatch(clearUpdateRejoinResult());
            dispatch(clearOldEmpForRejoin());
        } else if (updateRejoinStatus === 'failed' && updateRejoinError) {
            toast.error(typeof updateRejoinError === 'string' ? updateRejoinError : 'Rejoin update failed. Please try again.');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [updateRejoinStatus, updateRejoinError]);

    useEffect(() => {
        if (saveDesignationStatus === 'success') {
            toast.success('Designation added!');
            dispatch(fetchAllDesignations());
            dispatch(clearDesignationResult());
            setShowAddDesignation(false);
        } else if (saveDesignationStatus === 'failed') {
            const errMsg = typeof saveDesignationError === 'string' ? saveDesignationError : '';
            if (errMsg.toLowerCase() === 'exist') {
                toast.warning('Designation already exists!');
            } else {
                toast.error(errMsg || 'Failed to add designation');
            }
            dispatch(clearDesignationResult());
        }
    }, [saveDesignationStatus, saveDesignationError, dispatch]);

    useEffect(() => {
        if (saveDepartmentStatus === 'success') {
            toast.success('Department added!');
            dispatch(fetchAllDepartments());
            dispatch(clearDepartmentResult());
            setShowAddDepartment(false);
        } else if (saveDepartmentStatus === 'failed') {
            const errMsg = typeof saveDepartmentError === 'string' ? saveDepartmentError : '';
            if (errMsg.toLowerCase() === 'exist') {
                toast.warning('Department already exists!');
            } else {
                toast.error(errMsg || 'Failed to add department');
            }
            dispatch(clearDepartmentResult());
        }
    }, [saveDepartmentStatus, saveDepartmentError, dispatch]);

    useEffect(() => {
        if (saveEmployeeBankStatus === 'success') {
            toast.success('Bank added!');
            dispatch(fetchEmployeeBanks());
            dispatch(clearEmployeeBankResult());
            setShowAddBank(false);
        } else if (saveEmployeeBankStatus === 'failed') {
            toast.error('Failed to add bank');
        }
    }, [saveEmployeeBankStatus, dispatch]);

    // ── Formik ─────────────────────────────────────────────────────────────
    const formik = useFormik({
        initialValues: {
            appointmentType: 'Normal',
            joiningType: '',
            groupId: '',
            category: '',
            firstName: '',
            middleName: '',
            lastName: '',
            dob: '',
            empAge: '',
            gender: '',
            martialStatus: '',
            dateofMarriage: '',
            placeofBirth: '',
            contactMobile: '',
            contactWorkPhone: '',
            workEmail: '',
            permanentAddress: '',
            presentAddress: '',
            experience: '',
            nomineeName: '',
            nomineeRelation: '',
            nomineeDob: '',
            nomineeAge: '',
            designationId: '',
            departmentId: '',
            joiningDate: '',
            jobType: '',
            joiningCostCenter: '',
            transitDay: '0',
            reportTo: '',
            reportToRoleId: '',
            bankName: '',
            bankAccountNo: '',
            ifscCode: '',
            bankAddress: '',
            pfExist: '',
            esiExist: '',
            uanExist: false,
            uanNumber: '',
            esiNumber: '',
            adharNo: '',
            panNo: '',
            probationdays: '0',
            contractStartDate: '',
            contractEndDate: '',
        },
        validationSchema,
        validateOnChange: false,
        validateOnBlur: true,
        onSubmit: async (values) => {
            console.log('✅ onSubmit called — payload:', values);
            if (!experienceType) {
                toast.error('Please select Fresher or Experienced in the Experience step.');
                setCurrentStep(8);
                return;
            }
            if (experienceType === 'experienced' && expRows.length === 0) {
                toast.error('Please add at least one work experience entry.');
                setCurrentStep(8);
                return;
            }

            const missingDocs = MANDATORY_DOCS.filter(d => !uploadedDocs[d]);
            if (missingDocs.length > 0) {
                toast.error(`Please upload required documents: ${missingDocs.join(', ')}`);
                setCurrentStep(11);
                return;
            }

            // Comma-separated join (legacy MVC format: "val1,val2,")
            const joinComma = (arr, key) =>
                arr.map(r => String(r[key] ?? '')).join(',') + (arr.length ? ',' : '');
            // Date comma-join — each cell in dd-MMM-yyyy
            const joinCommaDate = (arr, key) =>
                arr.map(r => formatDateForAPI(r[key] || '')).join(',') + (arr.length ? ',' : '');
            // Percentage with % suffix per legacy format: "60%,"
            const joinCommaPercent = (arr, key) =>
                arr.map(r => r[key] ? `${r[key]}%` : '').join(',') + (arr.length ? ',' : '');

            // Resolve category NAME from the ID stored in values.category
            const categoryName = empCategories.find(
                c => String(c.CategoryId || c.Id) === String(values.category)
            )?.CategoryName || values.category;

            const payload = {
                ...values,
                // ── Category must be the NAME string, not the ID ──────────
                category: categoryName,
                // ── All scalar date fields → dd-MMM-yyyy ─────────────────
                dob: formatDateForAPI(values.dob),
                joiningDate: formatDateForAPI(values.joiningDate),
                nomineeDob: formatDateForAPI(values.nomineeDob),
                dateofMarriage: formatDateForAPI(values.dateofMarriage),
                contractStartDate: formatDateForAPI(values.contractStartDate),
                contractEndDate: formatDateForAPI(values.contractEndDate),
                // ── Experience field: the SP wants the label string ───────
                experience: experienceType === 'experienced' ? 'Experienced'
                    : experienceType === 'fresher' ? 'Fresher'
                        : '',
                // ── ReportToRoleId gets the employee ID (reportTo value) ──
                // The old app sent ReportToRoleId=104 (the emp ID), not the role ID
                reportToRoleId: values.reportTo,
                // ── Numeric fields coerced to strings ─────────────────────
                probationdays: String(values.probationdays ?? '0'),
                transitDay: String(values.transitDay ?? '0'),
                empAge: String(values.empAge ?? ''),
                nomineeAge: String(values.nomineeAge ?? ''),
                // ── DocName (empty string, field required by SP) ──────────
                docName: '',
                // ── Family rows (comma-delimited) ─────────────────────────
                fmName: joinComma(familyRows, 'name'),
                fmDateofBirth: joinCommaDate(familyRows, 'dob'),
                fmAge: joinComma(familyRows, 'age'),
                fmGender: joinComma(familyRows, 'gender'),
                fmRelation: joinComma(familyRows, 'relation'),
                fmMobileNo: joinComma(familyRows, 'mobile'),
                // ── Child rows ────────────────────────────────────────────
                childName: joinComma(childRows, 'name'),
                childDateofBirth: joinCommaDate(childRows, 'dob'),
                childAge: joinComma(childRows, 'age'),
                childGender: joinComma(childRows, 'gender'),
                childMaritalStatus: joinComma(childRows, 'maritalStatus'),
                // ── Academic rows ─────────────────────────────────────────
                academicClass: joinComma(academicRows, 'class'),
                nameofUniversity: joinComma(academicRows, 'university'),
                fromYear: joinComma(academicRows, 'fromYear'),
                toYear: joinComma(academicRows, 'toYear'),
                percentage: joinCommaPercent(academicRows, 'percentage'), // "60%,"
                // ── Technical rows ────────────────────────────────────────
                technicalSkill: joinComma(techRows, 'skill'),
                techInstitutionName: joinComma(techRows, 'institution'),
                techFromYear: joinComma(techRows, 'fromYear'),
                techToYear: joinComma(techRows, 'toYear'),
                techPercentage: joinCommaPercent(techRows, 'percentage'),
                // ── Experience rows ───────────────────────────────────────
                organisationName: experienceType === 'experienced' ? joinComma(expRows, 'organisation') : '',
                expFromYear: experienceType === 'experienced' ? joinComma(expRows, 'fromYear') : '',
                expToYear: experienceType === 'experienced' ? joinComma(expRows, 'toYear') : '',
                role: experienceType === 'experienced' ? joinComma(expRows, 'role') : '',
                mobilenos: experienceType === 'experienced' ? joinComma(expRows, 'mobile') : '',
                expContactNames: experienceType === 'experienced' ? joinComma(expRows, 'contactName') : '',
                expRemarks: experienceType === 'experienced' ? joinComma(expRows, 'remarks') : '',
                // ── Reference rows ────────────────────────────────────────
                refName: joinComma(refRows, 'name'),
                refRelation: joinComma(refRows, 'relation'),
                refMobileNo: joinComma(refRows, 'mobile'),
                refRemarks: joinComma(refRows, 'remarks'),
                createdBy: userName,
                roleId: roleId,
            };

            const preparedDocs = await Promise.all(
                Object.entries(uploadedDocs).map(async ([docName, file]) => ({
                    docName,
                    base64: await fileToBase64(file),
                    fileType: getFileType(file),
                }))
            );

            try {
                if (values.joiningType === 'Rejoin') {
                    if (!rejoinEmpRefNo) {
                        toast.error('Please search and select the old employee before submitting.');
                        setCurrentStep(1);
                        return;
                    }
                    await dispatch(updateRejoinStaffRegistration({
                        ...payload,
                        empRefNo: rejoinEmpRefNo,
                        documents: preparedDocs,
                    })).unwrap();
                } else {
                    await dispatch(saveStaffRegistration({
                        ...payload,
                        documents: preparedDocs,
                    })).unwrap();
                }
            } catch {
                toast.error('Submission failed. Please check all fields.');
            }
        },
    });

    // ── FIX: Central date change handler ──────────────────────────────────
    // Ensures CustomDatePicker never stores a Date object in Formik state.
    // All CustomDatePicker onChange calls must use this instead of setFieldValue.
    const handleDateChange = useCallback((fieldName, val) => {
        formik.setFieldValue(fieldName, serializeDate(val));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Auto-fill ages
    useEffect(() => {
        if (formik.values.dob) formik.setFieldValue('empAge', calculateAge(formik.values.dob));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formik.values.dob]);

    useEffect(() => {
        if (formik.values.nomineeDob) formik.setFieldValue('nomineeAge', calculateAge(formik.values.nomineeDob));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formik.values.nomineeDob]);

    // Fetch categories when group changes
    useEffect(() => {
        if (formik.values.groupId) {
            formik.setFieldValue('category', '');
            dispatch(fetchAllEmpCategories());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formik.values.groupId]);

    // Fetch reportToRole when category changes
    useEffect(() => {
        if (formik.values.category) {
            formik.setFieldValue('reportTo', '');
            formik.setFieldValue('reportToRoleId', '');
            dispatch(fetchReportToRole(formik.values.category));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formik.values.category]);

    // Clear rejoin search results when joining type changes away from Rejoin
    useEffect(() => {
        if (formik.values.joiningType !== 'Rejoin') {
            setRejoinSelectedEmp(null);
            setRejoinEmpRefNo('');
            setRejoinPrefix('');
            dispatch(clearOldEmpForRejoin());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formik.values.joiningType]);

    // ── Navigation ─────────────────────────────────────────────────────────
    const markStepDone = (step) => { if (!completedSteps.includes(step)) setCompletedSteps(prev => [...prev, step]); };
    // Per-step manual validation (replaces Yup schema to avoid silent submit block)
    const validateStep = (step, values) => {
        const v = values || formik.values;
        const err = {};
        if (step === 1) {
            if (!v.appointmentType) err.appointmentType = 'Select appointment type';
            if (!v.joiningType) err.joiningType = 'Select joining type';
            if (!v.groupId) err.groupId = 'Select employee group';
            if (!v.category) err.category = 'Select employee category';
        }
        if (step === 2) {
            if (!v.firstName || v.firstName.length < 2) err.firstName = 'First name required (min 2 chars)';
            if (!v.lastName || v.lastName.length < 2) err.lastName = 'Last name required (min 2 chars)';
            if (!v.dob) err.dob = 'Date of birth is required';
            if (!v.gender) err.gender = 'Select gender';
            if (!v.martialStatus) err.martialStatus = 'Select marital status';
            if (!v.placeofBirth) err.placeofBirth = 'Place of birth is required';
            if (!v.adharNo || !/^\d{12}$/.test(v.adharNo)) err.adharNo = 'Enter valid 12-digit Aadhaar';
            if (!v.panNo || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v.panNo)) err.panNo = 'Enter valid PAN (e.g. ABCDE1234F)';
        }
        if (step === 3) {
            if (!v.contactMobile || !/^\d{10}$/.test(v.contactMobile)) err.contactMobile = 'Enter valid 10-digit mobile';
            if (!v.workEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.workEmail)) err.workEmail = 'Enter valid work email';
            if (!v.permanentAddress) err.permanentAddress = 'Permanent address is required';
            if (!v.presentAddress) err.presentAddress = 'Present address is required';
        }
        if (step === 4) {
            if (!v.nomineeName) err.nomineeName = 'Nominee name is required';
            if (!v.nomineeRelation) err.nomineeRelation = 'Select nominee relation';
            if (!v.nomineeDob) err.nomineeDob = 'Nominee DOB is required';
        }
        if (step === 5) {
            if (!v.designationId) err.designationId = 'Designation is required';
            if (!v.departmentId) err.departmentId = 'Department is required';
            if (!v.joiningDate) err.joiningDate = 'Joining date is required';
            if (!v.jobType) err.jobType = 'Select job type';
            if (!v.joiningCostCenter) err.joiningCostCenter = 'Cost center is required';
            if (!v.reportTo) err.reportTo = 'Report to is required';
        }
        if (step === 6) {
            if (!v.bankName) err.bankName = 'Bank name is required';
            if (!v.bankAccountNo) err.bankAccountNo = 'Account number is required';
            if (!v.ifscCode || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(v.ifscCode)) err.ifscCode = 'Invalid IFSC format (e.g. SBIN0001234)';
        }
        if (step === 10) {
            if (!v.pfExist) err.pfExist = 'Select PF status';
            if (!v.esiExist) err.esiExist = 'Select ESI status';
        }
        return err;
    };

    const goNext = () => {
        const errors = validateStep(currentStep);
        if (Object.keys(errors).length > 0) {
            // Show first error as toast
            toast.error(Object.values(errors)[0]);
            // Mark all failing fields touched so red inline errors appear
            formik.setTouched({
                ...formik.touched,
                ...Object.fromEntries(Object.keys(errors).map(k => [k, true]))
            });
            return;
        }
        // Validation passed — mark this step complete (unlocks next step tab)
        markStepDone(currentStep);
        setCurrentStep(s => Math.min(s + 1, STEPS.length));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const goPrev = () => { setCurrentStep(s => Math.max(s - 1, 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); };
    const handleStepClick = (step) => {
        // Allow if: step is completed, currently active, step 1, or previous step is completed
        const unlocked = step === 1 || completedSteps.includes(step) || completedSteps.includes(step - 1) || step === currentStep;
        if (unlocked) setCurrentStep(step);
    };

    // ── Dynamic row helpers ────────────────────────────────────────────────
    // serializeDate ensures Date objects are never stored in row state.
    const makeRowUpdater = (setter) => (idx, key, val) =>
        setter(prev => prev.map((r, i) => i === idx ? { ...r, [key]: serializeDate(val) } : r));
    const makeRowAdder = (setter, template) => () => setter(prev => [...prev, { ...template }]);
    const makeRowRemover = (setter) => (idx) => setter(prev => prev.filter((_, i) => i !== idx));

    // ── Document Handlers ──────────────────────────────────────────────────
    const handleDocUpload = (docName, file) => setUploadedDocs(prev => ({ ...prev, [docName]: file }));
    const handleDocRemove = (docName) => setUploadedDocs(prev => { const n = { ...prev }; delete n[docName]; return n; });

    // ── Add-new handlers ───────────────────────────────────────────────────
    const handleAddDesignation = (vals) => {
        dispatch(saveDesignation({ action: 'New', designationName: vals.designationName, designationId: 0, createdBy: userName }));
    };
    const handleAddDepartment = (vals) => {
        dispatch(saveDepartment({ departmentName: vals.departmentName, createdBy: userName }));
    };
    const handleAddBank = (vals) => {
        dispatch(saveEmployeeBank({ action: 'New', bankName: vals.bankName, bankId: 0, createdBy: userName }));
    };

    // ── Rejoin Handlers ────────────────────────────────────────────────────
    const handleRejoinSearch = () => {
        if (!rejoinPrefix.trim()) { toast.error('Enter a prefix to search'); return; }
        const categoryName = empCategories.find(
            c => String(c.CategoryId || c.Id) === String(formik.values.category)
        )?.CategoryName || '';
        dispatch(fetchOldEmpForRejoin({
            category: categoryName,
            prefix: rejoinPrefix.trim(),
            groupId: formik.values.groupId,
        }));
    };

    const handleSelectRejoinEmp = async (emp) => {
        setRejoinSelectedEmp(emp);
        setRejoinEmpRefNo(emp.EmpRefNo || '');
        setRejoinDataLoading(true);
        const categoryName = empCategories.find(
            c => String(c.CategoryId || c.Id) === String(formik.values.category)
        )?.CategoryName || '';
        try {
            const result = await getStaffDataForRejoin({
                empRefNo: emp.EmpRefNo,
                roleId: roleId,
                groupId: formik.values.groupId,
                category: categoryName,
            });
            const data = result?.Data;
            if (data) {
                formik.setValues({
                    ...formik.values,
                    appointmentType: data.Appointmenttype || 'Normal',
                    firstName: data.FirstName || '',
                    middleName: data.MiddleName || '',
                    lastName: data.LastName || '',
                    dob: parseLegacyDate(data.DateofBirth),
                    empAge: data.EmpAge ? String(data.EmpAge) : '',
                    gender: data.Gender || '',
                    martialStatus: data.MartialStatus || '',
                    dateofMarriage: parseLegacyDate(data.DateofMarriage),
                    placeofBirth: data.PlaceofBirth || '',
                    contactMobile: data.ContactMobile || '',
                    contactWorkPhone: data.ContactWorkPhone || '',
                    workEmail: data.WorkEmail || '',
                    permanentAddress: data.PermanentAddress || '',
                    presentAddress: data.PresentAddress || '',
                    nomineeName: data.NomineeName || '',
                    nomineeRelation: data.NomineeRelation || '',
                    nomineeDob: parseLegacyDate(data.NomineeDateofBirth),
                    nomineeAge: data.NomineeAge ? String(data.NomineeAge) : '',
                    designationId: data.DesignationId ? String(data.DesignationId) : '',
                    departmentId: data.DepartmentId ? String(data.DepartmentId) : '',
                    joiningDate: parseLegacyDate(data.JoiningDate),
                    jobType: data.JobType || '',
                    joiningCostCenter: data.JoiningCostCenter || '',
                    transitDay: data.TransitDay ? String(data.TransitDay) : '0',
                    reportTo: data.ReportTo || '',
                    reportToRoleId: data.ReportToRoleId ? String(data.ReportToRoleId) : '',
                    bankName: data.BankName || '',
                    bankAccountNo: data.BankAccountNo || '',
                    ifscCode: data.IFSCcode || '',
                    bankAddress: data.BankAddress || '',
                    pfExist: data.PFExist || '',
                    esiExist: data.ESIExist || '',
                    uanExist: data.UANExist === true,
                    uanNumber: data.UANNumber || '',
                    esiNumber: data.ESINumber || '',
                    adharNo: data.AdharNo || '',
                    panNo: data.PanNo || '',
                    probationdays: data.Probationdays ? String(data.Probationdays) : '0',
                    contractStartDate: parseLegacyDate(data.ContractStartDate),
                    contractEndDate: parseLegacyDate(data.ContractEndDate),
                });
                if (data.Experience) {
                    setExperienceType(data.Experience.toLowerCase().includes('experience') ? 'experienced' : 'fresher');
                }
                toast.success(`Employee ${emp.EmpRefNo} data loaded — review and update before submitting.`);
            }
        } catch {
            toast.error('Failed to load employee data. Please try again.');
        } finally {
            setRejoinDataLoading(false);
        }
    };

    const degreeOptions = empDegrees.map(d => ({ value: d.DegreeName, label: d.DegreeName }));

    // ── Step Content Renderer ──────────────────────────────────────────────
    const renderStep = () => {
        const { values, errors, touched, handleChange, handleBlur, setFieldValue } = formik;

        switch (currentStep) {

            // ─── STEP 1: Setup ───────────────────────────────────────────────
            case 1: return (
                <div className="space-y-8">
                    <SectionHeader icon={Layers} title="Joining Configuration" subtitle="Select appointment type and joining mode to begin" />
                    <div>
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Appointment Type</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <OptionCard label="Normal" desc="Standard employment process" icon={UserPlus} selected={values.appointmentType === 'Normal'} color="blue" onClick={() => setFieldValue('appointmentType', 'Normal')} />
                            <OptionCard label="Direct" desc="Direct placement or referral" icon={ArrowRight} selected={values.appointmentType === 'Direct'} color="purple" onClick={() => setFieldValue('appointmentType', 'Direct')} />
                        </div>
                        {touched.appointmentType && errors.appointmentType && <p className="text-xs text-rose-500 mt-2 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.appointmentType}</p>}
                    </div>

                    {values.appointmentType === 'Normal' && (
                        <div>
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Joining Type</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <OptionCard label="New Join" desc="First-time employee joining" icon={Star} selected={values.joiningType === 'New Join'} color="blue" onClick={() => setFieldValue('joiningType', 'New Join')} />
                                <OptionCard label="Rejoin" desc="Previously employed returning" icon={RotateCcw} selected={values.joiningType === 'Rejoin'} color="purple" onClick={() => setFieldValue('joiningType', 'Rejoin')} />
                            </div>
                            {touched.joiningType && errors.joiningType && <p className="text-xs text-rose-500 mt-2 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.joiningType}</p>}
                        </div>
                    )}

                    {values.joiningType && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <FormField label="Employee Group" required error={errors.groupId} touched={touched.groupId}>
                                    <div className="relative">
                                        <select name="groupId" value={values.groupId} onChange={e => { formik.setFieldValue('groupId', e.target.value); }} onBlur={handleBlur}
                                            className={selectCls(errors.groupId, touched.groupId)}>
                                            <option value="">Select Group</option>
                                            {empGroups.map(g => <option key={g.GroupId || g.Id} value={g.GroupId || g.Id}>{g.GroupName || g.Name}</option>)}
                                        </select>
                                        {groupsLoading && <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-blue-500" />}
                                    </div>
                                </FormField>
                                <FormField label="Staff Category" required error={errors.category} touched={touched.category}>
                                    <div className="relative">
                                        <select name="category" value={values.category} onChange={handleChange} onBlur={handleBlur}
                                            disabled={!values.groupId}
                                            className={selectCls(errors.category, touched.category) + (!values.groupId ? ' opacity-50 cursor-not-allowed' : '')}>
                                            <option value="">{!values.groupId ? 'Select group first' : 'Select Category'}</option>
                                            {empCategories.map(c => <option key={c.CategoryId || c.Id} value={c.CategoryId || c.Id}>{c.CategoryName || c.Name}</option>)}
                                        </select>
                                        {catLoading && <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-blue-500" />}
                                    </div>
                                </FormField>
                            </div>

                            {/* ── Rejoin Employee Search Panel ───────────── */}
                            {values.joiningType === 'Rejoin' && values.groupId && values.category && (
                                <div className="rounded-2xl border-2 border-purple-200 dark:border-purple-800 bg-purple-50/40 dark:bg-purple-900/10 p-5 space-y-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <RotateCcw className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                        <p className="text-sm font-bold text-purple-700 dark:text-purple-300">Search Old Employee</p>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Enter a prefix (e.g. <span className="font-semibold">MS</span>) to find the employee by their old ID.
                                    </p>

                                    {/* Search input */}
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                            <input
                                                value={rejoinPrefix}
                                                onChange={e => setRejoinPrefix(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && handleRejoinSearch()}
                                                placeholder="Enter prefix (e.g. MS, SS, WS)"
                                                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 dark:focus:ring-purple-900/30 transition-all"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleRejoinSearch}
                                            disabled={oldEmpSearchLoading}
                                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-md disabled:opacity-60 transition-all">
                                            {oldEmpSearchLoading
                                                ? <><Loader2 className="h-4 w-4 animate-spin" /> Searching…</>
                                                : <><Search className="h-4 w-4" /> Search</>}
                                        </button>
                                    </div>

                                    {/* Selected employee badge */}
                                    {rejoinSelectedEmp && (
                                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-700">
                                            {rejoinDataLoading
                                                ? <Loader2 className="h-4 w-4 animate-spin text-green-500" />
                                                : <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />}
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-green-700 dark:text-green-300">
                                                    {rejoinDataLoading ? 'Loading employee data…' : 'Employee Selected'}
                                                </p>
                                                <p className="text-xs text-green-600 dark:text-green-400 truncate">
                                                    {rejoinSelectedEmp.FirstName || rejoinSelectedEmp.EmpRefNo}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => { setRejoinSelectedEmp(null); setRejoinEmpRefNo(''); dispatch(clearOldEmpForRejoin()); setRejoinPrefix(''); }}
                                                className="ml-auto w-7 h-7 rounded-lg bg-green-100 dark:bg-green-800 flex items-center justify-center text-green-600 hover:bg-green-200 dark:hover:bg-green-700 transition-colors">
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    )}

                                    {/* Search results */}
                                    {!rejoinSelectedEmp && oldEmpList.length > 0 && (
                                        <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                                            <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                {oldEmpList.length} result{oldEmpList.length !== 1 ? 's' : ''} found — click to select
                                            </div>
                                            {oldEmpList.map((emp, idx) => (
                                                <button
                                                    key={emp.EmpRefNo || idx}
                                                    type="button"
                                                    onClick={() => handleSelectRejoinEmp(emp)}
                                                    className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors
                                                        ${idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/60 dark:bg-gray-800/60'}
                                                        hover:bg-purple-50 dark:hover:bg-purple-900/20`}>
                                                    <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center shrink-0">
                                                        <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{emp.EmpRefNo}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{emp.FirstName || ''}</p>
                                                    </div>
                                                    <ChevronRight className="h-4 w-4 text-gray-300 ml-auto shrink-0" />
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* No results state */}
                                    {!oldEmpSearchLoading && !rejoinSelectedEmp && oldEmpList.length === 0 && rejoinPrefix && (
                                        <div className="flex flex-col items-center py-6 text-gray-400 dark:text-gray-500">
                                            <Search className="h-8 w-8 mb-2 opacity-30" />
                                            <p className="text-xs">No employees found. Try a different prefix.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            );

            // ─── STEP 2: Personal ────────────────────────────────────────────
            case 2: return (
                <div className="space-y-6">
                    <SectionHeader icon={User} title="Personal Information" subtitle="Employee's basic personal details" />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <FormField label="First Name" required error={errors.firstName} touched={touched.firstName}>
                            <input name="firstName" value={values.firstName} onChange={handleChange} onBlur={handleBlur} placeholder="e.g. Ramesh" className={inputCls(errors.firstName, touched.firstName)} />
                        </FormField>
                        <FormField label="Middle Name" error={errors.middleName} touched={touched.middleName} hint="Optional">
                            <input name="middleName" value={values.middleName} onChange={handleChange} onBlur={handleBlur} placeholder="e.g. Kumar" className={inputCls(errors.middleName, touched.middleName)} />
                        </FormField>
                        <FormField label="Last Name" required error={errors.lastName} touched={touched.lastName}>
                            <input name="lastName" value={values.lastName} onChange={handleChange} onBlur={handleBlur} placeholder="e.g. Sharma" className={inputCls(errors.lastName, touched.lastName)} />
                        </FormField>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* ── FIX: use handleDateChange instead of val => setFieldValue('dob', val) */}
                        <FormField label="Date of Birth" required error={errors.dob} touched={touched.dob}>
                            <CustomDatePicker
                                value={values.dob}
                                onChange={val => handleDateChange('dob', val)}
                                placeholder="Select DOB"
                            />
                        </FormField>
                        <FormField label="Age" hint="Auto-filled from DOB">
                            <div className="relative">
                                <input readOnly value={values.empAge} placeholder="—"
                                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-sm bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 cursor-not-allowed" />
                                <Calendar className="absolute right-3 top-3 h-4 w-4 text-gray-300" />
                            </div>
                        </FormField>
                        <FormField label="Gender" required error={errors.gender} touched={touched.gender}>
                            <select name="gender" value={values.gender} onChange={handleChange} onBlur={handleBlur} className={selectCls(errors.gender, touched.gender)}>
                                <option value="">Select</option>
                                {GENDER_OPTIONS.map(g => <option key={g}>{g}</option>)}
                            </select>
                        </FormField>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <FormField label="Marital Status" required error={errors.martialStatus} touched={touched.martialStatus}>
                            <select name="martialStatus" value={values.martialStatus} onChange={handleChange} onBlur={handleBlur} className={selectCls(errors.martialStatus, touched.martialStatus)}>
                                <option value="">Select</option>
                                {MARITAL_OPTIONS.map(m => <option key={m}>{m}</option>)}
                            </select>
                        </FormField>
                        {values.martialStatus === 'Married' && (
                            <FormField label="Date of Marriage" error={errors.dateofMarriage} touched={touched.dateofMarriage}>
                                {/* ── FIX */}
                                <CustomDatePicker
                                    value={values.dateofMarriage}
                                    onChange={val => handleDateChange('dateofMarriage', val)}
                                    placeholder="Select date"
                                />
                            </FormField>
                        )}
                        <FormField label="Place of Birth" required error={errors.placeofBirth} touched={touched.placeofBirth}>
                            <input name="placeofBirth" value={values.placeofBirth} onChange={handleChange} onBlur={handleBlur} placeholder="e.g. Chennai" className={inputCls(errors.placeofBirth, touched.placeofBirth)} />
                        </FormField>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField label="Aadhaar Number" required error={errors.adharNo} touched={touched.adharNo}>
                            <input name="adharNo" value={values.adharNo} onChange={handleChange} onBlur={handleBlur} maxLength={12} placeholder="12-digit Aadhaar" className={inputCls(errors.adharNo, touched.adharNo)} />
                        </FormField>
                        <FormField label="PAN Number" required error={errors.panNo} touched={touched.panNo}>
                            <input name="panNo" value={values.panNo.toUpperCase()} onChange={handleChange} onBlur={handleBlur} maxLength={10} placeholder="e.g. ABCDE1234F" className={inputCls(errors.panNo, touched.panNo)} />
                        </FormField>
                    </div>
                </div>
            );

            // ─── STEP 3: Contact ─────────────────────────────────────────────
            case 3: return (
                <div className="space-y-6">
                    <SectionHeader icon={Phone} title="Contact Information" subtitle="Phone, email and address details" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField label="Mobile Number" required error={errors.contactMobile} touched={touched.contactMobile}>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <input name="contactMobile" value={values.contactMobile} onChange={handleChange} onBlur={handleBlur} maxLength={10} placeholder="10-digit mobile" className={inputCls(errors.contactMobile, touched.contactMobile) + ' pl-10'} />
                            </div>
                        </FormField>
                        <FormField label="Work Phone" error={errors.contactWorkPhone} touched={touched.contactWorkPhone} hint="Optional">
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <input name="contactWorkPhone" value={values.contactWorkPhone} onChange={handleChange} onBlur={handleBlur} placeholder="Office landline" className={inputCls(errors.contactWorkPhone, touched.contactWorkPhone) + ' pl-10'} />
                            </div>
                        </FormField>
                    </div>
                    <FormField label="Work Email" required error={errors.workEmail} touched={touched.workEmail}>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <input name="workEmail" type="email" value={values.workEmail} onChange={handleChange} onBlur={handleBlur} placeholder="employee@company.com" className={inputCls(errors.workEmail, touched.workEmail) + ' pl-10'} />
                        </div>
                    </FormField>
                    <FormField label="Permanent Address" required error={errors.permanentAddress} touched={touched.permanentAddress}>
                        <textarea name="permanentAddress" value={values.permanentAddress} onChange={handleChange} onBlur={handleBlur} rows={3} placeholder="Full permanent address…" className={inputCls(errors.permanentAddress, touched.permanentAddress) + ' resize-none'} />
                    </FormField>
                    <FormField label="Present / Current Address" required error={errors.presentAddress} touched={touched.presentAddress}>
                        <textarea name="presentAddress" value={values.presentAddress} onChange={handleChange} onBlur={handleBlur} rows={3} placeholder="Full current address…" className={inputCls(errors.presentAddress, touched.presentAddress) + ' resize-none'} />
                    </FormField>
                </div>
            );

            // ─── STEP 4: Nominee ─────────────────────────────────────────────
            case 4: return (
                <div className="space-y-6">
                    <SectionHeader icon={Heart} title="Nominee Details" subtitle="Person to be notified in case of emergency" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField label="Nominee Name" required error={errors.nomineeName} touched={touched.nomineeName}>
                            <input name="nomineeName" value={values.nomineeName} onChange={handleChange} onBlur={handleBlur} placeholder="Full name of nominee" className={inputCls(errors.nomineeName, touched.nomineeName)} />
                        </FormField>
                        <FormField label="Relation" required error={errors.nomineeRelation} touched={touched.nomineeRelation}>
                            <select name="nomineeRelation" value={values.nomineeRelation} onChange={handleChange} onBlur={handleBlur} className={selectCls(errors.nomineeRelation, touched.nomineeRelation)}>
                                <option value="">Select</option>
                                {RELATION_OPTIONS.map(r => <option key={r}>{r}</option>)}
                            </select>
                        </FormField>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField label="Nominee Date of Birth" required error={errors.nomineeDob} touched={touched.nomineeDob}>
                            {/* ── FIX */}
                            <CustomDatePicker
                                value={values.nomineeDob}
                                onChange={val => handleDateChange('nomineeDob', val)}
                                placeholder="Select DOB"
                                position="auto"
                            />
                        </FormField>
                        <FormField label="Nominee Age" hint="Auto-filled from DOB">
                            <input readOnly value={values.nomineeAge} placeholder="—"
                                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-sm bg-gray-50 dark:bg-gray-900 text-gray-500 cursor-not-allowed" />
                        </FormField>
                    </div>
                </div>
            );

            // ─── STEP 5: Job ─────────────────────────────────────────────────
            case 5: return (
                <div className="space-y-6">
                    <SectionHeader icon={Briefcase} title="Job & Department" subtitle="Role, department and posting details" />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <DropdownWithAdd
                            label="Designation" required
                            error={errors.designationId} touched={touched.designationId}
                            value={values.designationId}
                            onChange={e => setFieldValue('designationId', e.target.value)}
                            onBlur={() => formik.setFieldTouched('designationId', true)}
                            options={designations}
                            valueKey="DesignationId" labelKey="DesignationName"
                            placeholder="Select Designation"
                            loading={designationsLoading}
                            onAddNew={() => setShowAddDesignation(true)}
                            addLabel="Add Designation"
                        />
                        <DropdownWithAdd
                            label="Department" required
                            error={errors.departmentId} touched={touched.departmentId}
                            value={values.departmentId}
                            onChange={e => setFieldValue('departmentId', e.target.value)}
                            onBlur={() => formik.setFieldTouched('departmentId', true)}
                            options={departments}
                            valueKey="DepartmentId" labelKey="DepartmentName"
                            placeholder="Select Department"
                            loading={departmentsLoading}
                            onAddNew={() => setShowAddDepartment(true)}
                            addLabel="Add Department"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField label="Joining Date" required error={errors.joiningDate} touched={touched.joiningDate}>
                            {/* ── FIX */}
                            <CustomDatePicker
                                value={values.joiningDate}
                                onChange={val => handleDateChange('joiningDate', val)}
                                placeholder="Select joining date"
                            />
                        </FormField>
                        <FormField label="Job Type" required error={errors.jobType} touched={touched.jobType}>
                            <select name="jobType" value={values.jobType} onChange={handleChange} onBlur={handleBlur} className={selectCls(errors.jobType, touched.jobType)}>
                                <option value="">Select</option>
                                {JOB_TYPES.map(j => <option key={j}>{j}</option>)}
                            </select>
                        </FormField>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField label="Joining Cost Center" required error={errors.joiningCostCenter} touched={touched.joiningCostCenter}>
                            <div className="relative">
                                <select
                                    name="joiningCostCenter"
                                    value={values.joiningCostCenter}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={selectCls(errors.joiningCostCenter, touched.joiningCostCenter)}
                                >
                                    <option value="">
                                        {costCenters.length === 0 ? 'Loading…' : 'Select Cost Center'}
                                    </option>
                                    {costCenters.map(cc => (
                                        <option key={cc.CC_Code} value={cc.CC_Code}>
                                            {cc.CC_Name}
                                        </option>
                                    ))}
                                </select>
                                {costCenters.length === 0 && (
                                    <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-blue-500" />
                                )}
                            </div>
                        </FormField>
                        <FormField label="Transit Days" hint="Number of travel days">
                            <input name="transitDay" type="number" value={values.transitDay} onChange={handleChange} onBlur={handleBlur} min={0} className={inputCls()} />
                        </FormField>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                    Report To <span className="text-rose-500 ml-0.5">*</span>
                                </label>
                            </div>
                            <div className="relative">
                                <select
                                    name="reportTo"
                                    value={values.reportTo}
                                    onChange={e => {
                                        const selected = reportToList.find(r => (r.EmpId || r.Id || r.Roleid)?.toString() === e.target.value);
                                        setFieldValue('reportTo', e.target.value);
                                        if (selected) setFieldValue('reportToRoleId', selected.RoleId || selected.roleId || '');
                                    }}
                                    onBlur={handleBlur}
                                    className={selectCls(errors.reportTo, touched.reportTo)}
                                >
                                    <option value="">
                                        {!values.category ? 'Select category first' : 'Select Reporting Manager'}
                                    </option>
                                    {reportToList.map(r => (
                                        <option key={r.EmpId || r.Id || r.RoleId} value={r.EmpId || r.Id || r.Roleid}>
                                            {r.RoleName || r.Name || r.DisplayName || `ID: ${r.EmpId || r.Id}`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {touched.reportTo && errors.reportTo && (
                                <p className="text-[10px] text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.reportTo}</p>
                            )}
                            <p className="text-[10px] text-gray-400 mt-1">Populated based on selected staff category</p>
                        </div>

                        <FormField label="Report To Role ID" hint="Auto-filled on selection">
                            <input readOnly value={values.reportToRoleId} placeholder="—"
                                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-sm bg-gray-50 dark:bg-gray-900 text-gray-500 cursor-not-allowed" />
                        </FormField>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField label="Probation Days">
                            <input name="probationdays" type="number" value={values.probationdays} onChange={handleChange} onBlur={handleBlur} min={0} className={inputCls()} />
                        </FormField>
                        <FormField label="Total Experience">
                            <input name="experience" value={values.experience} onChange={handleChange} onBlur={handleBlur} placeholder="e.g. 3 years" className={inputCls()} />
                        </FormField>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField label="Contract Start Date" hint="If applicable">
                            {/* ── FIX */}
                            <CustomDatePicker
                                value={values.contractStartDate}
                                onChange={val => handleDateChange('contractStartDate', val)}
                                placeholder="Select date"
                            />
                        </FormField>
                        <FormField label="Contract End Date" hint="If applicable">
                            {/* ── FIX */}
                            <CustomDatePicker
                                value={values.contractEndDate}
                                onChange={val => handleDateChange('contractEndDate', val)}
                                placeholder="Select date"
                            />
                        </FormField>
                    </div>
                </div>
            );

            // ─── STEP 6: Bank ────────────────────────────────────────────────
            case 6: return (
                <div className="space-y-6">
                    <SectionHeader icon={Landmark} title="Banking Details" subtitle="Salary disbursement account information" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <DropdownWithAdd
                            label="Bank Name" required
                            error={errors.bankName} touched={touched.bankName}
                            value={values.bankName}
                            onChange={e => setFieldValue('bankName', e.target.value)}
                            onBlur={() => formik.setFieldTouched('bankName', true)}
                            options={employeeBanks}
                            valueKey="Bank_Name" labelKey="Bank_Name"
                            placeholder="Select Bank"
                            loading={banksLoading}
                            onAddNew={() => setShowAddBank(true)}
                            addLabel="Add Bank"
                        />
                        <FormField label="Account Number" required error={errors.bankAccountNo} touched={touched.bankAccountNo}>
                            <input name="bankAccountNo" value={values.bankAccountNo} onChange={handleChange} onBlur={handleBlur} placeholder="Bank account number" className={inputCls(errors.bankAccountNo, touched.bankAccountNo)} />
                        </FormField>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField label="IFSC Code" required error={errors.ifscCode} touched={touched.ifscCode}>
                            <input name="ifscCode" value={values.ifscCode.toUpperCase()} onChange={handleChange} onBlur={handleBlur} maxLength={11} placeholder="e.g. SBIN0001234" className={inputCls(errors.ifscCode, touched.ifscCode)} />
                        </FormField>
                        <FormField label="Bank Address" hint="Optional">
                            <textarea name="bankAddress" value={values.bankAddress} onChange={handleChange} onBlur={handleBlur} rows={3} placeholder="Branch address…" className={inputCls() + ' resize-none'} />
                        </FormField>
                    </div>
                </div>
            );

            // ─── STEP 7: Education ───────────────────────────────────────────
            case 7: return (
                <div className="space-y-6">
                    <SectionHeader icon={GraduationCap} title="Education & Skills" subtitle="Academic qualifications and technical training" />
                    <CollapsibleSection title="Academic Qualifications" icon={BookOpen}>
                        <DynamicTable
                            label="Degrees & Certifications" icon={GraduationCap}
                            columns={[
                                { key: 'class', label: 'Class / Degree', type: degreeOptions.length ? 'apiSelect' : 'text', options: degreeOptions, placeholder: 'e.g. B.Tech' },
                                { key: 'university', label: 'University', placeholder: 'University name' },
                                { key: 'fromYear', label: 'From', type: 'number', placeholder: 'YYYY' },
                                { key: 'toYear', label: 'To', type: 'number', placeholder: 'YYYY' },
                                { key: 'percentage', label: '%', type: 'number', placeholder: '80' },
                            ]}
                            rows={academicRows}
                            onAdd={makeRowAdder(setAcademicRows, { class: '', university: '', fromYear: '', toYear: '', percentage: '' })}
                            onRemove={makeRowRemover(setAcademicRows)}
                            onChange={makeRowUpdater(setAcademicRows)}
                            addLabel="Add Qualification"
                        />
                    </CollapsibleSection>
                    <CollapsibleSection title="Technical Skills / Certifications" icon={Star}>
                        <DynamicTable
                            label="Technical Training" icon={Star}
                            columns={[
                                { key: 'skill', label: 'Skill / Course', placeholder: 'e.g. React, Java' },
                                { key: 'institution', label: 'Institution', placeholder: 'Training provider' },
                                { key: 'fromYear', label: 'From', type: 'number', placeholder: 'YYYY' },
                                { key: 'toYear', label: 'To', type: 'number', placeholder: 'YYYY' },
                                { key: 'percentage', label: '%', type: 'number', placeholder: '90' },
                            ]}
                            rows={techRows}
                            onAdd={makeRowAdder(setTechRows, { skill: '', institution: '', fromYear: '', toYear: '', percentage: '' })}
                            onRemove={makeRowRemover(setTechRows)}
                            onChange={makeRowUpdater(setTechRows)}
                            addLabel="Add Skill"
                        />
                    </CollapsibleSection>
                </div>
            );

            // ─── STEP 8: Experience ──────────────────────────────────────────
            case 8: return (
                <div className="space-y-6">
                    <SectionHeader icon={ClipboardList} title="Work Experience" subtitle="Select experience type and add employment history" />

                    <div>
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                            Experience Type <span className="text-rose-500">*</span>
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <OptionCard
                                label="Fresher"
                                desc="No prior work experience"
                                icon={Star}
                                selected={experienceType === 'fresher'}
                                color="green"
                                onClick={() => { setExperienceType('fresher'); setExpError(''); setExpRows([]); }}
                            />
                            <OptionCard
                                label="Experienced"
                                desc="Has previous employment history"
                                icon={Briefcase}
                                selected={experienceType === 'experienced'}
                                color="blue"
                                onClick={() => { setExperienceType('experienced'); setExpError(''); }}
                            />
                        </div>
                        {expError && (
                            <p className="text-xs text-rose-500 mt-2 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />{expError}
                            </p>
                        )}
                    </div>

                    {experienceType === 'fresher' && (
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700">
                            <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-green-700 dark:text-green-300 font-medium">
                                No work experience required for freshers. You can still add references below.
                            </p>
                        </div>
                    )}

                    {experienceType === 'experienced' && (
                        <div>
                            {expRows.length === 0 && (
                                <div className="flex items-start gap-3 p-3 mb-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700">
                                    <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                                    <p className="text-xs text-amber-700 dark:text-amber-300">
                                        Please add at least one work experience entry to proceed.
                                    </p>
                                </div>
                            )}
                            <DynamicTable
                                label="Previous Employers" icon={Briefcase}
                                columns={[
                                    { key: 'organisation', label: 'Organisation', placeholder: 'Company name' },
                                    { key: 'fromYear', label: 'From', type: 'number', placeholder: 'YYYY' },
                                    { key: 'toYear', label: 'To', type: 'number', placeholder: 'YYYY' },
                                    { key: 'role', label: 'Role', placeholder: 'Designation' },
                                    { key: 'mobile', label: 'Contact', placeholder: 'HR mobile' },
                                    { key: 'contactName', label: 'Contact Name', placeholder: 'HR name' },
                                    { key: 'remarks', label: 'Remarks', placeholder: 'Reason for leaving' },
                                ]}
                                rows={expRows}
                                onAdd={makeRowAdder(setExpRows, { organisation: '', fromYear: '', toYear: '', role: '', mobile: '', contactName: '', remarks: '' })}
                                onRemove={makeRowRemover(setExpRows)}
                                onChange={makeRowUpdater(setExpRows)}
                                addLabel="Add Experience"
                            />
                        </div>
                    )}

                    {experienceType && (
                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Contact className="h-4 w-4 text-blue-500" /> References
                            </p>
                            <DynamicTable
                                label="Professional References" icon={Contact}
                                columns={[
                                    { key: 'name', label: 'Name', placeholder: 'Reference name' },
                                    { key: 'relation', label: 'Relation', placeholder: 'Professional / Personal' },
                                    { key: 'mobile', label: 'Mobile', placeholder: '10-digit mobile' },
                                    { key: 'remarks', label: 'Remarks', placeholder: 'How do they know you?' },
                                ]}
                                rows={refRows}
                                onAdd={makeRowAdder(setRefRows, { name: '', relation: '', mobile: '', remarks: '' })}
                                onRemove={makeRowRemover(setRefRows)}
                                onChange={makeRowUpdater(setRefRows)}
                                addLabel="Add Reference"
                            />
                        </div>
                    )}
                </div>
            );

            // ─── STEP 9: Family ──────────────────────────────────────────────
            case 9: return (
                <div className="space-y-6">
                    <SectionHeader icon={Users} title="Family Details" subtitle="Family members and dependent children" />
                    <CollapsibleSection title="Family Members" icon={Users}>
                        <DynamicTable
                            label="Parents / Siblings / Spouse" icon={Users}
                            columns={[
                                { key: 'name', label: 'Name', placeholder: 'Full name' },
                                { key: 'dob', label: 'DOB', type: 'date' },
                                { key: 'age', label: 'Age', type: 'number', placeholder: 'Age' },
                                { key: 'gender', label: 'Gender', type: 'select', options: GENDER_OPTIONS },
                                { key: 'relation', label: 'Relation', placeholder: 'e.g. Mother' },
                                { key: 'mobile', label: 'Mobile', placeholder: 'Contact number' },
                            ]}
                            rows={familyRows}
                            onAdd={makeRowAdder(setFamilyRows, { name: '', dob: '', age: '', gender: '', relation: '', mobile: '' })}
                            onRemove={makeRowRemover(setFamilyRows)}
                            onChange={makeRowUpdater(setFamilyRows)}
                            addLabel="Add Member"
                        />
                    </CollapsibleSection>
                    <CollapsibleSection title="Children" icon={Baby}>
                        <DynamicTable
                            label="Dependent Children" icon={Baby}
                            columns={[
                                { key: 'name', label: 'Name', placeholder: 'Child name' },
                                { key: 'dob', label: 'DOB', type: 'date' },
                                { key: 'age', label: 'Age', type: 'number', placeholder: 'Age' },
                                { key: 'gender', label: 'Gender', type: 'select', options: GENDER_OPTIONS },
                                { key: 'maritalStatus', label: 'Status', type: 'select', options: MARITAL_OPTIONS },
                            ]}
                            rows={childRows}
                            onAdd={makeRowAdder(setChildRows, { name: '', dob: '', age: '', gender: '', maritalStatus: '' })}
                            onRemove={makeRowRemover(setChildRows)}
                            onChange={makeRowUpdater(setChildRows)}
                            addLabel="Add Child"
                        />
                    </CollapsibleSection>
                </div>
            );

            // ─── STEP 10: PF & ESI ───────────────────────────────────────────
            case 10: return (
                <div className="space-y-6">
                    <SectionHeader icon={Shield} title="PF & ESI Details" subtitle="Statutory benefit enrollment information" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField label="PF Applicable" required error={errors.pfExist} touched={touched.pfExist}>
                            <div className="flex gap-3">
                                {PF_OPTIONS.map(o => (
                                    <button key={o} type="button" onClick={() => formik.setFieldValue('pfExist', o)}
                                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all
                                            ${values.pfExist === o
                                                ? 'bg-linear-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-md'
                                                : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-blue-300'}`}>{o}</button>
                                ))}
                            </div>
                            {touched.pfExist && errors.pfExist && <p className="text-[10px] text-rose-500 mt-1">{errors.pfExist}</p>}
                        </FormField>
                        <FormField label="ESI Applicable" required error={errors.esiExist} touched={touched.esiExist}>
                            <div className="flex gap-3">
                                {PF_OPTIONS.map(o => (
                                    <button key={o} type="button" onClick={() => formik.setFieldValue('esiExist', o)}
                                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all
                                            ${values.esiExist === o
                                                ? 'bg-linear-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-md'
                                                : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-blue-300'}`}>{o}</button>
                                ))}
                            </div>
                            {touched.esiExist && errors.esiExist && <p className="text-[10px] text-rose-500 mt-1">{errors.esiExist}</p>}
                        </FormField>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField label="ESI Number" hint="If ESI is applicable">
                            <input name="esiNumber" value={values.esiNumber} onChange={handleChange} onBlur={handleBlur} placeholder="ESI number" className={inputCls()} />
                        </FormField>
                        <FormField label="UAN Number" hint="If UAN exists">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="uanExist" name="uanExist" checked={values.uanExist} onChange={handleChange}
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                    <label htmlFor="uanExist" className="text-xs text-gray-600 dark:text-gray-400 font-medium">UAN Already Exists</label>
                                </div>
                                {values.uanExist && (
                                    <input name="uanNumber" value={values.uanNumber} onChange={handleChange} onBlur={handleBlur} placeholder="Enter UAN number" className={inputCls()} />
                                )}
                            </div>
                        </FormField>
                    </div>

                    {/* Summary preview */}
                    <div className="mt-6 p-5 rounded-2xl bg-linear-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-100 dark:border-blue-800">
                        <div className="flex items-center gap-2 mb-4">
                            <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            <h4 className="text-sm font-bold text-blue-700 dark:text-blue-300">Registration Summary</h4>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                            {[
                                { label: 'Name', value: [values.firstName, values.middleName, values.lastName].filter(Boolean).join(' ') || '—' },
                                // ── FIX: serializeDate ensures no Date object leaks into the render tree
                                { label: 'DOB', value: serializeDate(values.dob) || '—' },
                                { label: 'Gender', value: values.gender || '—' },
                                { label: 'Mobile', value: values.contactMobile || '—' },
                                { label: 'Email', value: values.workEmail || '—' },
                                { label: 'Joining Date', value: serializeDate(values.joiningDate) || '—' },
                                { label: 'Cost Center', value: values.joiningCostCenter || '—' },
                                { label: 'Experience', value: experienceType ? (experienceType === 'experienced' ? `Experienced (${expRows.length} entries)` : 'Fresher') : '—' },
                                { label: 'PF', value: values.pfExist || '—' },
                                { label: 'ESI', value: values.esiExist || '—' },
                            ].map(({ label, value }) => (
                                <div key={label} className="bg-white dark:bg-gray-800 rounded-xl px-3 py-2 border border-blue-100 dark:border-blue-800">
                                    <p className="text-gray-400 dark:text-gray-500 text-[10px] uppercase tracking-wide">{label}</p>
                                    <p className="text-gray-800 dark:text-gray-200 font-semibold truncate mt-0.5">{value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );

            // ─── STEP 11: Documents ──────────────────────────────────────────
            case 11: {
                const apiDocs = empDocuments.map(d => d.DocumentName).filter(Boolean);
                const allDocs = Array.from(new Set([...MANDATORY_DOCS, ...apiDocs]));
                const uploadedCount = Object.keys(uploadedDocs).length;
                const mandatoryCount = MANDATORY_DOCS.filter(d => uploadedDocs[d]).length;
                return (
                    <div className="space-y-6">
                        <SectionHeader icon={FileText} title="Document Upload"
                            subtitle="Upload required documents for the employee record"
                            gradient="from-emerald-600 to-teal-600" />
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { label: 'Total Documents', value: allDocs.length, icon: FileText, color: 'blue' },
                                { label: 'Uploaded', value: uploadedCount, icon: FileCheck, color: 'green' },
                                { label: 'Required Done', value: `${mandatoryCount}/${MANDATORY_DOCS.length}`, icon: Shield, color: mandatoryCount === MANDATORY_DOCS.length ? 'green' : 'rose' },
                            ].map(s => (
                                <div key={s.label} className={`p-4 rounded-2xl border-2
                                    ${s.color === 'green' ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                                        : s.color === 'rose' ? 'border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20'
                                            : 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20'}`}>
                                    <p className="text-2xl font-black text-gray-800 dark:text-gray-100">{s.value}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
                                </div>
                            ))}
                        </div>
                        {mandatoryCount < MANDATORY_DOCS.length && (
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700">
                                <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-700 dark:text-amber-300">
                                    <span className="font-bold">Required documents missing: </span>
                                    {MANDATORY_DOCS.filter(d => !uploadedDocs[d]).join(', ')}. These must be uploaded before final submission.
                                </p>
                            </div>
                        )}
                        <div className="space-y-2.5">
                            {allDocs.map(docName => (
                                <DocumentRow
                                    key={docName}
                                    docName={docName}
                                    mandatory={MANDATORY_DOCS.includes(docName)}
                                    file={uploadedDocs[docName] || null}
                                    onUpload={handleDocUpload}
                                    onRemove={handleDocRemove}
                                    onPreview={setPreviewFile}
                                />
                            ))}
                        </div>
                        <p className="text-center text-[10px] text-gray-400 dark:text-gray-500">
                            Accepted formats: JPG, PNG, PDF • Max size: 5 MB per file
                        </p>
                    </div>
                );
            }

            default: return null;
        }
    };

    const isLastStep = currentStep === STEPS.length;
    const progressPct = Math.round((completedSteps.length / STEPS.length) * 100);

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 md:p-6">

            {/* Add-New Popups */}
            {showAddDesignation && (
                <AddNewPopup title="Add New Designation" icon={Briefcase}
                    fields={[{ key: 'designationName', label: 'Designation Name', required: true, placeholder: 'e.g. Site Engineer' }]}
                    saving={saveDesignationLoading} onSave={handleAddDesignation} onClose={() => setShowAddDesignation(false)} />
            )}
            {showAddDepartment && (
                <AddNewPopup title="Add New Department" icon={Building2}
                    fields={[{ key: 'departmentName', label: 'Department Name', required: true, placeholder: 'e.g. Engineering' }]}
                    saving={saveDepartmentLoading} onSave={handleAddDepartment} onClose={() => setShowAddDepartment(false)} />
            )}
            {showAddBank && (
                <AddNewPopup title="Add New Bank" icon={CreditCard}
                    fields={[{ key: 'bankName', label: 'Bank Name', required: true, placeholder: 'e.g. HDFC Bank' }]}
                    saving={saveEmployeeBankLoading} onSave={handleAddBank} onClose={() => setShowAddBank(false)} />
            )}

            {previewFile && <PreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />}

            {/* Header */}
            <div className="max-w-7xl mx-auto mb-6">
                <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-blue-600 via-blue-700 to-purple-700 shadow-xl shadow-blue-500/20 p-7 text-white">
                    <div className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                    <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500 rounded-full -translate-y-1/2 translate-x-1/4 opacity-20 blur-3xl" />
                    <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shadow-lg border border-white/20">
                                <UserPlus className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-blue-200 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full">HR Module</span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight">Staff Registration</h1>
                                <p className="text-blue-200 text-sm mt-0.5">New employee onboarding — Normal joining</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-xs text-blue-200">Progress</p>
                                <p className="text-2xl font-black">{progressPct}<span className="text-base font-normal text-blue-200">%</span></p>
                            </div>
                            <div className="w-16 h-16 relative shrink-0">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="white" strokeWidth="3" strokeDasharray={`${progressPct}, 100`} strokeLinecap="round" />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">{currentStep}/{STEPS.length}</span>
                            </div>
                        </div>
                    </div>
                    <div className="relative mt-5 h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="max-w-7xl mx-auto flex gap-6">
                <StepIndicator steps={STEPS} currentStep={currentStep} completedSteps={completedSteps} onStepClick={handleStepClick} />

                <div className="flex-1 min-w-0">
                    {/* Mobile step dots */}
                    <div className="lg:hidden mb-4 flex gap-1.5 overflow-x-auto pb-1">
                        {STEPS.map(s => {
                            const unlocked = s.id === 1 || completedSteps.includes(s.id) || completedSteps.includes(s.id - 1) || s.id === currentStep;
                            return (
                                <button key={s.id}
                                    onClick={() => unlocked && handleStepClick(s.id)}
                                    disabled={!unlocked}
                                    className={`shrink-0 w-8 h-8 rounded-lg text-xs font-bold transition-all
                                        ${s.id === currentStep
                                            ? 'bg-linear-to-r from-blue-600 to-purple-600 text-white shadow-md'
                                            : completedSteps.includes(s.id)
                                                ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 cursor-pointer'
                                                : unlocked
                                                    ? 'bg-white dark:bg-gray-800 text-gray-400 border border-gray-200 dark:border-gray-700 cursor-pointer'
                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 border border-gray-100 dark:border-gray-800 cursor-not-allowed opacity-50'}`}>
                                    {completedSteps.includes(s.id) && s.id !== currentStep ? '✓' : s.id}
                                </button>
                            );
                        })}
                    </div>

                    <form onSubmit={formik.handleSubmit} noValidate>
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            {/* Step title bar */}
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/60 dark:bg-gray-900/40">
                                <div className="flex items-center gap-3">
                                    {(() => { const Icon = STEPS[currentStep - 1].icon; return <Icon className="h-4 w-4 text-blue-500" />; })()}
                                    <div>
                                        <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">
                                            Step {currentStep} — {STEPS[currentStep - 1].label}
                                        </h2>
                                        <p className="text-xs text-gray-400 dark:text-gray-500">{STEPS[currentStep - 1].desc}</p>
                                    </div>
                                </div>
                                <span className="text-xs font-bold text-gray-400 dark:text-gray-500">{currentStep} / {STEPS.length}</span>
                            </div>

                            {/* Step content */}
                            <div className="p-6 md:p-8">{renderStep()}</div>

                            {/* Navigation */}
                            <div className="px-6 md:px-8 py-5 border-t border-gray-100 dark:border-gray-700 bg-gray-50/40 dark:bg-gray-900/20 flex items-center justify-between gap-4">
                                <button type="button" onClick={goPrev} disabled={currentStep === 1}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border-2 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                                    <ChevronDown className="h-4 w-4 rotate-90" /> Back
                                </button>

                                <div className="flex items-center gap-2">
                                    {[...Array(STEPS.length)].map((_, i) => (
                                        <div key={i} className={`rounded-full transition-all duration-300
                                            ${i + 1 === currentStep ? 'w-6 h-2 bg-blue-600' :
                                                completedSteps.includes(i + 1) ? 'w-2 h-2 bg-blue-400' : 'w-2 h-2 bg-gray-200 dark:bg-gray-700'}`} />
                                    ))}
                                </div>

                                {isLastStep ? (
                                    <button type="submit" disabled={saveLoading || updateRejoinLoading}
                                        className="flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-bold bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                                        {(saveLoading || updateRejoinLoading)
                                            ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
                                            : formik.values.joiningType === 'Rejoin'
                                                ? <><RotateCcw className="h-4 w-4" /> Update & Rejoin</>
                                                : <><Save className="h-4 w-4" /> Submit Registration</>}
                                    </button>
                                ) : (
                                    <button type="button" onClick={goNext}
                                        className="flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-bold bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25 transition-all">
                                        Next <ChevronRight className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default StaffJoinRegistration;