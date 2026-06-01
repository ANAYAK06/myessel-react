import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    Banknote, User, Building2, Search, CheckCircle2,
    Loader2, ChevronDown, X, CreditCard, Hash,
    MapPin, ArrowRight, RefreshCw, Users, Plus, AlertCircle
} from 'lucide-react';

import CustomDatePicker from '../../components/CustomDatePicker';

import {
    fetchActiveLBContractors,
    fetchLabourByType,
    fetchLabourBankDetails,
    submitLabourBankChange,
    fetchEmployeeBanks,
    saveNewBank,
    clearLabourSearch,
    clearSubmitResult,
    clearSaveNewBankResult,
    selectContractors,
    selectLabourResults,
    selectCurrentBank,
    selectSubmitResult,
    selectEmployeeBanks,
    selectSaveNewBankResult,
    selectLoading,
    selectErrors,
} from '../../slices/HRSlice/labourBankChangeSlice';

// ── Local UI helpers ──────────────────────────────────────────────────────────

const cn = (...c) => c.filter(Boolean).join(' ');

const Label = ({ children, required }) => (
    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
        {children}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
);

const SectionCard = ({ children, title, icon: Icon, className = '' }) => (
    <div className={cn('bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm', className)}>
        {title && (
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3 bg-gray-50/60 dark:bg-gray-900/40 rounded-t-2xl">
                {Icon && <Icon className="h-4 w-4 text-indigo-500" />}
                <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{title}</span>
            </div>
        )}
        {children}
    </div>
);

const Btn = ({ children, onClick, loading, disabled, variant = 'primary', size = 'md', type = 'button' }) => {
    const base = 'inline-flex items-center gap-2 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-5 py-2.5 text-sm', lg: 'px-7 py-3 text-base' };
    const variants = {
        primary: 'bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white focus:ring-indigo-500 shadow-sm',
        secondary: 'border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-gray-400',
        danger: 'bg-linear-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white focus:ring-rose-500 shadow-sm',
        success: 'bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white focus:ring-emerald-500 shadow-sm',
    };
    return (
        <button type={type} onClick={onClick} disabled={loading || disabled} className={cn(base, sizes[size], variants[variant])}>
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {children}
        </button>
    );
};

const InfoRow = ({ label, value, mono }) => (
    <div className="flex items-start gap-3 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
        <span className="text-xs text-gray-500 dark:text-gray-400 w-32 shrink-0 pt-0.5">{label}</span>
        <span className={cn('text-sm font-medium text-gray-900 dark:text-white flex-1', mono && 'font-mono tracking-wide')}>
            {value || <span className="text-gray-400 italic">—</span>}
        </span>
    </div>
);

// ── Add New Bank Modal ────────────────────────────────────────────────────────

const AddBankModal = ({ onClose, onSuccess, userName }) => {
    const dispatch = useDispatch();
    const loading = useSelector(selectLoading);
    const saveResult = useSelector(selectSaveNewBankResult);
    const saveError = useSelector((s) => s.labourBankChange.errors.saveNewBank);
    const [bankName, setBankName] = useState('');

    // Handle save result or error
    useEffect(() => {
        if (!saveResult && !saveError) return;

        if (saveError) {
            toast.error(typeof saveError === 'string' ? saveError : 'Failed to save bank.');
            dispatch(clearSaveNewBankResult());
            return;
        }

        const dataStr = typeof saveResult === 'string'
            ? saveResult
            : (saveResult?.Data ?? '');
        const isSuccess = saveResult?.IsSuccessful === true
            || saveResult?.ResponseCode === 200
            || dataStr.toLowerCase().includes('submit')
            || dataStr.toLowerCase().includes('insert');
        const isExist = dataStr.toLowerCase().includes('exist');

        if (isSuccess) {
            toast.success('Bank added successfully!');
            dispatch(clearSaveNewBankResult());
            onSuccess(bankName.trim().toUpperCase());
        } else if (isExist) {
            toast.warning('This bank already exists in the list.');
            dispatch(clearSaveNewBankResult());
        } else {
            toast.error(dataStr || 'Failed to save bank.');
            dispatch(clearSaveNewBankResult());
        }
    }, [saveResult, saveError, dispatch, bankName, onSuccess]);

    const handleSave = () => {
        const trimmed = bankName.trim();
        if (!trimmed) { toast.error('Please enter a bank name.'); return; }
        dispatch(saveNewBank({
            Action: 'New',
            BankName: trimmed.toUpperCase(),
            Bankid: 0,
            CreatedBy: userName,
        }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-linear-to-r from-indigo-600 to-violet-600">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                            <Plus className="h-4 w-4 text-white" />
                        </div>
                        <h2 className="text-base font-bold text-white">Add New Bank</h2>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={loading.saveNewBank}
                        className="text-white/70 hover:text-white transition-colors disabled:opacity-50"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-4">
                    <div className="flex items-start gap-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl px-4 py-3 border border-indigo-200 dark:border-indigo-700">
                        <AlertCircle className="h-4 w-4 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-indigo-700 dark:text-indigo-300">
                            The bank name will be added to the master list and will be available for selection.
                        </p>
                    </div>

                    <div>
                        <Label required>Bank Name</Label>
                        <input
                            type="text"
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                            placeholder="e.g. HDFC BANK"
                            autoFocus
                            className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
                            style={{ textTransform: 'uppercase' }}
                        />
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="px-6 pb-6 flex items-center justify-end gap-3">
                    <Btn variant="secondary" onClick={onClose} disabled={loading.saveNewBank}>
                        Cancel
                    </Btn>
                    <Btn
                        onClick={handleSave}
                        loading={loading.saveNewBank}
                        disabled={!bankName.trim()}
                        variant="success"
                    >
                        <Plus className="h-4 w-4" />
                        Add Bank
                    </Btn>
                </div>
            </div>
        </div>
    );
};

// ── Bank Selector Dropdown ────────────────────────────────────────────────────

const BankSelector = ({ value, bankId, onChange, banks, loading, onAddNew }) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef(null);
    const searchInputRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
                setSearch('');
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Focus search when opened
    useEffect(() => {
        if (open && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [open]);

    const filtered = banks.filter((b) =>
        b.Bank_Name.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelect = (bank) => {
        onChange({ BankName: bank.Bank_Name, Bankid: parseInt(bank.Bank_Id, 10) || 0 });
        setOpen(false);
        setSearch('');
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange({ BankName: '', Bankid: 0 });
    };

    return (
        <div ref={containerRef} className="relative">
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setOpen((p) => !p)}
                className={cn(
                    'w-full flex items-center justify-between gap-2 rounded-xl border px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500',
                    open
                        ? 'border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-800 bg-white dark:bg-gray-700'
                        : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-indigo-300',
                    value ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'
                )}
            >
                <div className="flex items-center gap-2 min-w-0">
                    <Banknote className="h-4 w-4 text-gray-400 shrink-0" />
                    <span className="truncate">{value || 'Select a bank...'}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-500" />}
                    {value && !open && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-0.5 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                    <ChevronDown className={cn('h-4 w-4 text-gray-400 transition-transform duration-200', open && 'rotate-180')} />
                </div>
            </button>

            {/* Dropdown panel */}
            {open && (
                <div className="absolute z-40 w-full mt-1.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden">
                    {/* Search inside dropdown */}
                    <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search bank..."
                                className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white pl-8 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Bank list */}
                    <div className="max-h-52 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-500">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Loading banks...
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                                {search ? `No banks matching "${search}"` : 'No banks available'}
                            </div>
                        ) : (
                            filtered.map((bank) => (
                                <button
                                    key={bank.Bank_Id}
                                    type="button"
                                    onMouseDown={() => handleSelect(bank)}
                                    className={cn(
                                        'w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/20 flex items-center gap-2 transition-colors border-b border-gray-50 dark:border-gray-700/50 last:border-0',
                                        bankId === parseInt(bank.Bank_Id, 10) && 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 font-semibold'
                                    )}
                                >
                                    <Banknote className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                    <span className="truncate">{bank.Bank_Name}</span>
                                    {bankId === parseInt(bank.Bank_Id, 10) && (
                                        <CheckCircle2 className="ml-auto h-3.5 w-3.5 text-indigo-500 shrink-0" />
                                    )}
                                </button>
                            ))
                        )}
                    </div>

                    {/* Add New Bank button */}
                    <div className="border-t border-gray-100 dark:border-gray-700 p-2">
                        <button
                            type="button"
                            onMouseDown={(e) => { e.preventDefault(); setOpen(false); setSearch(''); onAddNew(); }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                        >
                            <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                                <Plus className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            Add New Bank to List
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// ── Component ─────────────────────────────────────────────────────────────────

const LABOUR_TYPES = ['Own Labour', 'Contractor'];

const emptyForm = {
    Bankid: 0,
    BankName: '',
    BankAccountNo: '',
    IFSCcode: '',
    BankAddress: '',
    ApplicableFrom: '',
};

const LabourBankChange = () => {
    const dispatch = useDispatch();

    const contractors    = useSelector(selectContractors);
    const labourResults  = useSelector(selectLabourResults);
    const currentBank    = useSelector(selectCurrentBank);
    const submitResult   = useSelector(selectSubmitResult);
    const employeeBanks  = useSelector(selectEmployeeBanks);
    const loading        = useSelector(selectLoading);
    const errors         = useSelector(selectErrors);

    const { userData } = useSelector((s) => s.auth);
    const roleId   = userData?.roleId || userData?.RID;
    const userName = userData?.userName || userData?.UserName || 'system';

    // Selection state
    const [labourType,     setLabourType]     = useState('');
    const [contractor,     setContractor]     = useState('');
    const [searchText,     setSearchText]     = useState('');
    const [showDropdown,   setShowDropdown]   = useState(false);
    const [selectedLabour, setSelectedLabour] = useState(null);

    // Form state
    const [form, setForm] = useState(emptyForm);

    // Add bank modal state
    const [showAddBankModal, setShowAddBankModal] = useState(false);
    // Track which bank name was just added so we can auto-select it after refresh
    const pendingBankNameRef = useRef(null);

    const searchRef   = useRef(null);
    const dropdownRef = useRef(null);
    const debounceRef = useRef(null);

    // ── Effects ──────────────────────────────────────────────────────────────

    // Load the banks master list once on mount
    useEffect(() => {
        dispatch(fetchEmployeeBanks());
    }, [dispatch]);

    useEffect(() => {
        return () => {
            dispatch(clearLabourSearch());
            dispatch(clearSubmitResult());
        };
    }, [dispatch]);

    // Load contractors when Contractor type selected
    useEffect(() => {
        if (labourType === 'Contractor') {
            dispatch(fetchActiveLBContractors());
        } else {
            setContractor('');
        }
        setSelectedLabour(null);
        setSearchText('');
        dispatch(clearLabourSearch());
        setForm(emptyForm);
    }, [labourType, dispatch]);

    // Debounce labour search
    useEffect(() => {
        if (!labourType) return;
        if (labourType === 'Contractor' && !contractor) return;
        if (searchText.length < 2) {
            dispatch(clearLabourSearch());
            setShowDropdown(false);
            return;
        }
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            dispatch(fetchLabourByType({
                prefix: searchText,
                labourType,
                contractor: labourType === 'Contractor' ? contractor : '',
            }));
            setShowDropdown(true);
        }, 300);
        return () => clearTimeout(debounceRef.current);
    }, [searchText, labourType, contractor, dispatch]);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target) &&
                searchRef.current && !searchRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Fetch bank details when labour selected
    useEffect(() => {
        if (!selectedLabour) return;
        dispatch(fetchLabourBankDetails({
            labourId: selectedLabour.LabourId,
            labourType,
            contractor: labourType === 'Contractor' ? contractor : '',
        }));
    }, [selectedLabour, labourType, contractor, dispatch]);

    // ── Handlers ─────────────────────────────────────────────────────────────

    const handleReset = useCallback(() => {
        setLabourType('');
        setContractor('');
        setSearchText('');
        setSelectedLabour(null);
        setForm(emptyForm);
        dispatch(clearLabourSearch());
        dispatch(clearSubmitResult());
    }, [dispatch]);

    const handleLabourSelect = useCallback((labour) => {
        setSelectedLabour(labour);
        setSearchText(labour.LabourName || labour.Name || '');
        setShowDropdown(false);
        setForm(emptyForm);
    }, []);

    const handleFormChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleBankSelect = ({ BankName, Bankid }) => {
        setForm(prev => ({ ...prev, BankName, Bankid }));
    };

    // Handle submit result
    useEffect(() => {
        if (!submitResult) return;
        const result = typeof submitResult === 'string' ? submitResult : JSON.stringify(submitResult);
        if (result.toLowerCase().includes('submit') || result.toLowerCase().includes('success')) {
            toast.success('Bank change request submitted successfully!');
            handleReset();
        } else {
            toast.error(result || 'Submission failed. Please try again.');
        }
        dispatch(clearSubmitResult());
    }, [submitResult, dispatch, handleReset]);

    // After banks list refreshes, auto-select the newly added bank
    useEffect(() => {
        if (!pendingBankNameRef.current || employeeBanks.length === 0) return;
        const match = employeeBanks.find(
            (b) => b.Bank_Name.toUpperCase() === pendingBankNameRef.current.toUpperCase()
        );
        if (match) {
            setForm((prev) => ({ ...prev, BankName: match.Bank_Name, Bankid: parseInt(match.Bank_Id, 10) || 0 }));
            pendingBankNameRef.current = null;
        }
    }, [employeeBanks]);

    const handleSubmit = () => {
        if (!selectedLabour) { toast.error('Please select a labour.'); return; }
        if (!form.BankName.trim()) { toast.error('Bank Name is required.'); return; }
        if (!form.BankAccountNo.trim()) { toast.error('Account Number is required.'); return; }
        if (!form.IFSCcode.trim()) { toast.error('IFSC Code is required.'); return; }
        if (!form.ApplicableFrom) { toast.error('Applicable From date is required.'); return; }

        const payload = {
            LabourId:           selectedLabour.LabourId,
            Bankid:             form.Bankid || 0,
            BankName:           form.BankName.trim(),
            BankAccountNo:      form.BankAccountNo.trim(),
            IFSCcode:           form.IFSCcode.trim().toUpperCase(),
            BankAddress:        form.BankAddress.trim(),
            OldBankid:          currentBank?.BankId || currentBank?.Bankid || 0,
            Createdby:          userName,
            RoleId:             roleId,
            BankApplicableFrom: form.ApplicableFrom,
        };

        dispatch(submitLabourBankChange(payload));
    };

    // Called when the modal successfully adds a bank
    const handleBankAdded = (addedBankName) => {
        pendingBankNameRef.current = addedBankName;
        setShowAddBankModal(false);
        dispatch(fetchEmployeeBanks());
    };

    // ── Render: Labour Type cards ─────────────────────────────────────────────

    const renderLabourTypeStep = () => (
        <SectionCard title="Select Labour Type" icon={Users}>
            <div className="p-6 grid grid-cols-2 gap-4">
                {LABOUR_TYPES.map((type) => {
                    const isSelected = labourType === type;
                    return (
                        <button
                            key={type}
                            onClick={() => setLabourType(type)}
                            className={cn(
                                'relative flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-all duration-200 cursor-pointer group',
                                isSelected
                                    ? 'border-indigo-500 bg-linear-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/30 dark:to-violet-900/30 shadow-md'
                                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-indigo-300 hover:bg-indigo-50/40 dark:hover:bg-indigo-900/10'
                            )}
                        >
                            {isSelected && (
                                <CheckCircle2 className="absolute top-3 right-3 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            )}
                            <div className={cn(
                                'w-14 h-14 rounded-2xl flex items-center justify-center transition-all',
                                isSelected
                                    ? 'bg-linear-to-br from-indigo-500 to-violet-600 shadow-lg'
                                    : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30'
                            )}>
                                {type === 'Own Labour'
                                    ? <User className={cn('h-6 w-6', isSelected ? 'text-white' : 'text-gray-500 dark:text-gray-400')} />
                                    : <Building2 className={cn('h-6 w-6', isSelected ? 'text-white' : 'text-gray-500 dark:text-gray-400')} />
                                }
                            </div>
                            <span className={cn(
                                'text-sm font-bold',
                                isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'
                            )}>
                                {type}
                            </span>
                        </button>
                    );
                })}
            </div>
        </SectionCard>
    );

    // ── Render: Contractor dropdown ───────────────────────────────────────────

    const renderContractorStep = () => {
        if (labourType !== 'Contractor') return null;
        return (
            <SectionCard title="Select Contractor" icon={Building2}>
                <div className="p-6">
                    <Label required>Contractor</Label>
                    <div className="relative">
                        <select
                            value={contractor}
                            onChange={(e) => {
                                setContractor(e.target.value);
                                setSelectedLabour(null);
                                setSearchText('');
                                dispatch(clearLabourSearch());
                            }}
                            className="w-full appearance-none rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">— Select contractor —</option>
                            {loading.contractors && <option disabled>Loading...</option>}
                            {contractors.map((c) => (
                                <option key={c.Contractorcode} value={c.Contractorcode}>
                                    {c.ContractorName}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-gray-400" />
                    </div>
                    {errors.contractors && (
                        <p className="mt-1 text-xs text-rose-500">{errors.contractors}</p>
                    )}
                </div>
            </SectionCard>
        );
    };

    // ── Render: Labour search ─────────────────────────────────────────────────

    const canSearch = labourType === 'Own Labour' || (labourType === 'Contractor' && !!contractor);

    const renderSearchStep = () => {
        if (!labourType) return null;
        if (labourType === 'Contractor' && !contractor) return null;

        return (
            <SectionCard title="Search Labour" icon={Search}>
                <div className="p-6">
                    <Label required>Labour Name</Label>
                    <div className="relative" ref={searchRef}>
                        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchText}
                            onChange={(e) => {
                                setSearchText(e.target.value);
                                if (selectedLabour && e.target.value !== (selectedLabour.LabourName || selectedLabour.Name)) {
                                    setSelectedLabour(null);
                                    setForm(emptyForm);
                                }
                            }}
                            placeholder="Type at least 2 letters to search..."
                            className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white pl-9 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            disabled={!canSearch}
                        />
                        {searchText && (
                            <button
                                onClick={() => {
                                    setSearchText('');
                                    setSelectedLabour(null);
                                    setForm(emptyForm);
                                    dispatch(clearLabourSearch());
                                }}
                                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}

                        {/* Dropdown results */}
                        {showDropdown && labourResults.length > 0 && (
                            <div
                                ref={dropdownRef}
                                className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl max-h-64 overflow-y-auto"
                            >
                                {loading.labourSearch && (
                                    <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-500">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Searching...
                                    </div>
                                )}
                                {labourResults.map((labour) => (
                                    <button
                                        key={labour.LabourId}
                                        onMouseDown={() => handleLabourSelect(labour)}
                                        className="w-full text-left px-4 py-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center shrink-0">
                                            <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                {labour.LabourName || labour.Name}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {labour.LabourId}
                                                {labour.Designation ? ` • ${labour.Designation}` : ''}
                                                {labour.Category ? ` • ${labour.Category}` : ''}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {showDropdown && !loading.labourSearch && labourResults.length === 0 && searchText.length >= 2 && (
                            <div
                                ref={dropdownRef}
                                className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl px-4 py-3 text-sm text-gray-500"
                            >
                                No labour found for "{searchText}"
                            </div>
                        )}
                    </div>

                    {/* Selected labour badge */}
                    {selectedLabour && (
                        <div className="mt-3 flex items-center gap-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl px-4 py-3 border border-indigo-200 dark:border-indigo-700">
                            <CheckCircle2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                            <div>
                                <p className="text-sm font-bold text-indigo-800 dark:text-indigo-200">
                                    {selectedLabour.LabourName || selectedLabour.Name}
                                </p>
                                <p className="text-xs text-indigo-600 dark:text-indigo-400">
                                    {selectedLabour.LabourId}
                                    {selectedLabour.Designation ? ` · ${selectedLabour.Designation}` : ''}
                                    {selectedLabour.Category ? ` · ${selectedLabour.Category}` : ''}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </SectionCard>
        );
    };

    // ── Render: Current bank details ──────────────────────────────────────────

    const renderCurrentBank = () => {
        if (!selectedLabour) return null;

        return (
            <SectionCard title="Current Bank Details" icon={CreditCard}>
                <div className="p-6">
                    {loading.bankDetails ? (
                        <div className="flex items-center gap-3 py-4">
                            <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
                            <span className="text-sm text-gray-500">Loading bank details...</span>
                        </div>
                    ) : currentBank ? (
                        <div className="rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 px-4 py-2">
                            <InfoRow label="Bank Name"    value={currentBank.BankName} />
                            <InfoRow label="Account No."  value={currentBank.BankAccountNo || currentBank.AccountNo} mono />
                            <InfoRow label="IFSC Code"    value={currentBank.IFSCcode || currentBank.IFSC} mono />
                            <InfoRow label="Branch / Address" value={currentBank.BankAddress || currentBank.Address} />
                            {currentBank.ApplicableFrom && (
                                <InfoRow label="Applicable From" value={currentBank.ApplicableFrom} />
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 py-4 text-amber-600 dark:text-amber-400">
                            <Banknote className="h-5 w-5" />
                            <span className="text-sm">No bank record found for this labour.</span>
                        </div>
                    )}
                </div>
            </SectionCard>
        );
    };

    // ── Render: New bank form ─────────────────────────────────────────────────

    const renderBankForm = () => {
        if (!selectedLabour) return null;

        return (
            <SectionCard title="New Bank Details" icon={Banknote}>
                <div className="p-6 space-y-5">

                    {/* Bank Name — searchable dropdown from master list */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <Label required>Bank Name</Label>
                            <button
                                type="button"
                                onClick={() => setShowAddBankModal(true)}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                            >
                                <Plus className="h-3 w-3" />
                                Add New Bank
                            </button>
                        </div>
                        <BankSelector
                            value={form.BankName}
                            bankId={form.Bankid}
                            onChange={handleBankSelect}
                            banks={employeeBanks}
                            loading={loading.employeeBanks}
                            onAddNew={() => setShowAddBankModal(true)}
                        />
                        {errors.employeeBanks && (
                            <p className="mt-1 text-xs text-rose-500">{errors.employeeBanks}</p>
                        )}
                    </div>

                    {/* Account Number */}
                    <div>
                        <Label required>Account Number</Label>
                        <div className="relative">
                            <Hash className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                value={form.BankAccountNo}
                                onChange={(e) => handleFormChange('BankAccountNo', e.target.value)}
                                placeholder="Enter account number"
                                className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white pl-9 px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    {/* IFSC Code */}
                    <div>
                        <Label required>IFSC Code</Label>
                        <div className="relative">
                            <ArrowRight className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                value={form.IFSCcode}
                                onChange={(e) => handleFormChange('IFSCcode', e.target.value.toUpperCase())}
                                placeholder="e.g. SBIN0001234"
                                maxLength={11}
                                className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white pl-9 px-4 py-2.5 text-sm font-mono tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Bank Address / Branch */}
                    <div>
                        <Label>Bank Address / Branch</Label>
                        <div className="relative">
                            <MapPin className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                value={form.BankAddress}
                                onChange={(e) => handleFormChange('BankAddress', e.target.value)}
                                placeholder="Branch name and address"
                                className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white pl-9 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Applicable From */}
                    <div>
                        <Label required>Applicable From</Label>
                        <CustomDatePicker
                            value={form.ApplicableFrom}
                            onChange={(val) => handleFormChange('ApplicableFrom', val)}
                            format="DD-MMM-YYYY"
                            placeholder="Select date"
                        />
                    </div>
                </div>
            </SectionCard>
        );
    };

    // ── Render: Action row ────────────────────────────────────────────────────

    const renderActions = () => {
        if (!selectedLabour) return null;
        return (
            <div className="flex items-center justify-end gap-3 pt-2">
                <Btn variant="secondary" onClick={handleReset}>
                    <RefreshCw className="h-4 w-4" />
                    Reset
                </Btn>
                <Btn
                    onClick={handleSubmit}
                    loading={loading.submit}
                    disabled={!form.BankName || !form.BankAccountNo || !form.IFSCcode || !form.ApplicableFrom}
                >
                    <Banknote className="h-4 w-4" />
                    Submit Bank Change
                </Btn>
            </div>
        );
    };

    // ── Main render ───────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 md:p-6">

            {/* ── Page Header ── */}
            <div className="max-w-7xl mx-auto mb-6">
                <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-indigo-600 via-purple-600 to-violet-700 shadow-xl shadow-indigo-500/20 p-7 text-white">
                    <div className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                    <div className="absolute top-0 right-0 w-72 h-72 bg-violet-500 rounded-full -translate-y-1/2 translate-x-1/4 opacity-20 blur-3xl" />
                    <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shadow-lg border border-white/20">
                                <CreditCard className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full">HR Module</span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight">Labour Bank Change</h1>
                                <p className="text-indigo-200 text-sm mt-0.5">Update bank account details for a labour</p>
                            </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-3 text-indigo-200">
                            <div className="text-right">
                                <p className="text-xs uppercase tracking-wider">Module</p>
                                <p className="text-sm font-bold text-white">HR / Bank Change</p>
                            </div>
                            <Banknote className="h-5 w-5 opacity-60" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="max-w-7xl mx-auto space-y-6">
                {renderLabourTypeStep()}
                {renderContractorStep()}
                {renderSearchStep()}

                {selectedLabour && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {renderCurrentBank()}
                        {renderBankForm()}
                    </div>
                )}

                {errors.submit && (
                    <div className="rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-700 px-4 py-3 text-sm text-rose-700 dark:text-rose-400">
                        {errors.submit}
                    </div>
                )}

                {renderActions()}
            </div>

            {/* Add Bank Modal */}
            {showAddBankModal && (
                <AddBankModal
                    onClose={() => setShowAddBankModal(false)}
                    onSuccess={handleBankAdded}
                    userName={userName}
                />
            )}
        </div>
    );
};

export default LabourBankChange;
