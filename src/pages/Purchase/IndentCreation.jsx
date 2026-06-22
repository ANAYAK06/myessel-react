import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    ShoppingBag, Building2, Tag, Search, Package,
    SendHorizontal, ChevronDown, Loader2, Trash2,
    CheckCircle, Plus, RotateCcw, IndianRupee,
} from 'lucide-react';

import CustomDatePicker from '../../components/CustomDatePicker';

import {
    fetchCCType,
    fetchCapitalMasterTypes,
    fetchIndentCategories,
    fetchStagedItems,
    searchItems,
    addIndentItem,
    removeIndentItem,
    submitIndent,
    updateItemQty,
    updateItemAmount,
    clearSearchResults,
    clearAddItemError,
    clearSubmitResult,
    resetIndentCreation,
    selectCCType,
    selectCapitalMasterTypes,
    selectIndentCategories,
    selectSearchResults,
    selectStagedItems,
    selectSubmitResult,
    selectSubmitIndentNo,
    selectIndentCreationLoading,
    selectIndentCreationErrors,
} from '../../slices/purchaseSlice/indentCreationSlice';

// ── Shared UI ─────────────────────────────────────────────────────────────────

const inputCls =
    'w-full px-3.5 py-2.5 rounded-xl border-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 ' +
    'border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:border-indigo-500 ' +
    'focus:ring-indigo-100 dark:focus:ring-indigo-900/30 hover:border-gray-300 transition-all ' +
    'disabled:opacity-60 disabled:cursor-not-allowed';

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

const CardHeader = ({ icon: Icon, title, subtitle, action }) => (
    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/60 dark:bg-gray-900/40 rounded-t-xl">
        <div className="flex items-center gap-3">
            <Icon className="h-4 w-4 text-indigo-500" />
            <div>
                <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">{title}</h2>
                {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500">{subtitle}</p>}
            </div>
        </div>
        {action}
    </div>
);

// ── Helpers ───────────────────────────────────────────────────────────────────

const parseCCOptions = (ccCodeswithnames, ccCodes) => {
    if (ccCodeswithnames) {
        return ccCodeswithnames
            .split('| |')
            .map(s => s.trim())
            .filter(Boolean)
            .map(name => {
                const match = name.match(/^(CC-\d+)/);
                return { label: name, value: match ? match[1] : name };
            });
    }
    // Fallback: build plain options from ccCodes string
    if (ccCodes) {
        return ccCodes
            .split(',')
            .map(s => s.trim())
            .filter(Boolean)
            .map(code => ({ label: code, value: code }));
    }
    return [];
};

// Capital master type: { ID, Type }
const getCapitalLabel = (item) => item?.Type?.trim() || '';
const getCapitalCode  = (item) => item?.ID || '';

// Category: { Categoryid, CategoryValue }
const getCategoryLabel = (item) => item?.CategoryValue?.trim() || '';
const getCategoryCode  = (item) => item?.Categoryid || '';

// Fallback generic extractors (for CCType or other shapes)
const getItemLabel = (item) =>
    item?.Type || item?.CategoryValue || item?.TypeName || item?.CatName ||
    item?.Name || item?.Text || item?.Label || item?.Description ||
    (typeof item === 'string' ? item : '');

const getItemCode = (item) =>
    item?.ID || item?.Categoryid || item?.TypeCode || item?.CatCode ||
    item?.Code || item?.Value || item?.CategoryCode ||
    (typeof item === 'string' ? item : '');

// SearchItem format: "3SE00304 , HAND GLOVES | RUBBER FOR ELECTRICIAN"
const parseSearchItem = (searchItem = '') => {
    const idx = searchItem.indexOf(' , ');
    if (idx === -1) return { code: searchItem.trim(), name: '' };
    return {
        code: searchItem.substring(0, idx).trim(),
        name: searchItem.substring(idx + 3).trim(),
    };
};

const getSearchCode = (item) => {
    if (item?.SearchItem) return parseSearchItem(item.SearchItem).code;
    return item?.ItemCode || item?.Code || '';
};

const getSearchName = (item) => {
    if (item?.SearchItem) return parseSearchItem(item.SearchItem).name;
    return item?.ItemName || item?.ItemDesc || item?.Description || '';
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function IndentCreation() {
    const dispatch = useDispatch();
    const { userData } = useSelector(state => state.auth);

    const ccType            = useSelector(selectCCType);
    const capitalMasterTypes = useSelector(selectCapitalMasterTypes);
    const categories        = useSelector(selectIndentCategories);
    const searchResults     = useSelector(selectSearchResults);
    const stagedItems       = useSelector(selectStagedItems);
    const submitResult      = useSelector(selectSubmitResult);
    const submitIndentNo    = useSelector(selectSubmitIndentNo);
    const loading           = useSelector(selectIndentCreationLoading);
    const errors            = useSelector(selectIndentCreationErrors);

    // Local form state
    const [selectedCC, setSelectedCC]                     = useState('');
    const [selectedCapitalType, setSelectedCapitalType]   = useState('');
    const [selectedCapitalLabel, setSelectedCapitalLabel] = useState('');
    const [selectedCategory, setSelectedCategory]         = useState(null);
    const [searchType, setSearchType]                     = useState('1'); // '1' = by code, '2' = by name
    const [searchTerm, setSearchTerm]                     = useState('');
    const [date, setDate]                                 = useState('');
    const [remarks, setRemarks]                           = useState('');

    const ccOptions = parseCCOptions(userData?.ccCodeswithnames, userData?.ccCodes);

    // When ccType is loaded, auto-fetch capital master types
    useEffect(() => {
        if (!ccType) return;
        const typeVal =
            ccType?.CCType || ccType?.CcType || ccType?.Type ||
            ccType?.CType || (typeof ccType === 'string' ? ccType : null);
        if (typeVal) dispatch(fetchCapitalMasterTypes(typeVal));
    }, [ccType, dispatch]);

    // Show add-item error
    useEffect(() => {
        if (errors.addItem) {
            toast.error(errors.addItem);
            dispatch(clearAddItemError());
        }
    }, [errors.addItem, dispatch]);

    // Show submit error
    useEffect(() => {
        if (errors.submit) toast.error(errors.submit);
    }, [errors.submit]);

    // Handle successful submission
    useEffect(() => {
        if (submitResult !== 'Submited') return;
        const indentMsg = submitIndentNo ? ` — Indent No: ${submitIndentNo}` : '';
        toast.success(`Indent created successfully${indentMsg}`);
        setSelectedCC('');
        setSelectedCapitalType('');
        setSelectedCapitalLabel('');
        setSelectedCategory(null);
        setSearchTerm('');
        setDate('');
        setRemarks('');
        dispatch(clearSubmitResult());
        dispatch(resetIndentCreation());
    }, [submitResult, submitIndentNo, dispatch]);

    // ── Handlers ───────────────────────────────────────────────────────────────

    const handleCCChange = useCallback((ccCode) => {
        setSelectedCC(ccCode);
        setSelectedCapitalType('');
        setSelectedCapitalLabel('');
        setSelectedCategory(null);
        dispatch(resetIndentCreation());
        if (ccCode) dispatch(fetchCCType(ccCode));
    }, [dispatch]);

    const handleCapitalTypeSelect = useCallback((raw) => {
        // raw is a { ID, Type } object from capitalMasterTypes
        const code  = typeof raw === 'object' ? getCapitalCode(raw) : raw;
        const label = typeof raw === 'object' ? getCapitalLabel(raw) : raw;
        setSelectedCapitalType(code);
        setSelectedCapitalLabel(label);
        setSelectedCategory(null);
        dispatch(clearSearchResults());
        if (code && selectedCC) {
            dispatch(fetchIndentCategories(selectedCC));
            dispatch(fetchStagedItems({
                CCode: selectedCC,
                CapitalItemcode: code,
                Materialtype: code,
            }));
        }
    }, [selectedCC, dispatch]);

    const handleCategorySelect = useCallback((raw) => {
        // raw is a { Categoryid, CategoryValue } object from categories
        setSelectedCategory({ code: getCategoryCode(raw), name: getCategoryLabel(raw) });
        dispatch(clearSearchResults());
        setSearchTerm('');
    }, [dispatch]);

    // Live autocomplete — fires 300 ms after user stops typing (≥3 chars)
    useEffect(() => {
        if (!selectedCategory?.code) return;
        if (searchTerm.length < 3) {
            dispatch(clearSearchResults());
            return;
        }
        const timer = setTimeout(() => {
            dispatch(searchItems({ Pfx: searchTerm, Typ: searchType, Cat: selectedCategory.code }));
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, searchType, selectedCategory, dispatch]);

    const handleAddItem = useCallback((item) => {
        const itemCode = getSearchCode(item);
        if (!itemCode) { toast.error('Invalid item selected'); return; }
        if (stagedItems.some(si => si.ItemCode === itemCode)) {
            toast.warning('Item already in the list');
            return;
        }
        dispatch(addIndentItem({
            ItemCode: itemCode,
            ItemName: getSearchName(item),
            CategoryCode: selectedCategory?.code || '',
            CategoryName: selectedCategory?.name || '',
            Costcenter: selectedCC,
            CapitalMaterialType: selectedCapitalType,
            CapitalMaterials: selectedCapitalType,
        }));
        // Clear search after adding so the user can search for another item
        setSearchTerm('');
        dispatch(clearSearchResults());
    }, [stagedItems, selectedCC, selectedCapitalType, selectedCategory, dispatch]);

    const handleDelete = useCallback((item) => {
        dispatch(removeIndentItem({ IndentListId: item.IndentListId, tempId: item.tempId }));
    }, [dispatch]);

    const handleReset = useCallback(() => {
        setSelectedCC('');
        setSelectedCapitalType('');
        setSelectedCapitalLabel('');
        setSelectedCategory(null);
        setSearchTerm('');
        setDate('');
        setRemarks('');
        dispatch(resetIndentCreation());
    }, [dispatch]);

    // CustomDatePicker onChange fires with a Date object — format it before sending to SP
    const formatDateForSP = (d) => {
        if (!d) return '';
        if (d instanceof Date) {
            const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            return `${String(d.getDate()).padStart(2, '0')}-${months[d.getMonth()]}-${d.getFullYear()}`;
        }
        return String(d); // already a formatted string
    };

    const handleSubmit = () => {
        if (stagedItems.length === 0) { toast.error('Add at least one item'); return; }
        if (!date) { toast.error('Select a date'); return; }
        if (stagedItems.some(i => !i.Qty || i.Qty <= 0)) {
            toast.error('All items must have quantity > 0');
            return;
        }
        if (stagedItems.some(i => !i.IndentListId)) {
            toast.error('Some items are missing a valid indent list ID');
            return;
        }

        // SP WHILE loop requires trailing comma to process every item (including last)
        const ids  = stagedItems.map(i => i.IndentListId).join(',') + ',';
        const qtys = stagedItems.map(i => parseFloat(i.Qty  || 0).toFixed(2)).join(',') + ',';
        const amts = stagedItems.map(i => parseFloat(i.Amount || 0).toFixed(2)).join(',') + ',';
        const total = stagedItems.reduce((s, i) => s + (parseFloat(i.Amount) || 0), 0);

        dispatch(submitIndent({
            IndentListIds: ids,
            Quantitys: qtys,
            Amounts: amts,
            TotalAmount: total.toFixed(2),
            Date: formatDateForSP(date),
            Remarks: remarks,
            Costcenter: selectedCC,
            Createdby: userData?.employeeId || userData?.UID || '',
            RoleID: userData?.roleId || '',
        }));
    };

    // ── Derived values ─────────────────────────────────────────────────────────

    const ccTypeVal = ccType?.CCType || ccType?.CcType || ccType?.Type || ccType?.CType ||
        (typeof ccType === 'string' ? ccType : '');

    const totalAmount = stagedItems.reduce((s, i) => s + (i.Amount || 0), 0);

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <div className="space-y-5 pb-8">

            {/* ── Page Header ── */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                        <ShoppingBag className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-base font-bold text-gray-900 dark:text-white">Indent Creation</h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Purchase / New Indent</p>
                    </div>
                </div>
            </div>

            {/* ── Section 1: Selections ── */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <CardHeader icon={Building2} title="Selections" subtitle="Choose cost center, capital type, and category" />
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">

                    {/* Cost Center */}
                    <div>
                        <Label required>Cost Center</Label>
                        <div className="relative">
                            <select
                                className={inputCls + ' appearance-none pr-10'}
                                value={selectedCC}
                                onChange={e => handleCCChange(e.target.value)}
                                disabled={loading.ccType}
                            >
                                <option value="">Select Cost Center</option>
                                {ccOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            <SelectIcon loading={loading.ccType} />
                        </div>
                        {ccTypeVal && (
                            <p className="mt-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                                CC Type: <span className="font-semibold">{ccTypeVal}</span>
                            </p>
                        )}
                    </div>

                    {/* Capital Material Type — shape: { ID, Type } */}
                    <div>
                        <Label required>Capital Material Type</Label>
                        <div className="relative">
                            <select
                                className={inputCls + ' appearance-none pr-10'}
                                value={selectedCapitalType}
                                onChange={e => {
                                    const found = capitalMasterTypes.find(t => t.ID === e.target.value);
                                    handleCapitalTypeSelect(found || e.target.value);
                                }}
                                disabled={!selectedCC || capitalMasterTypes.length === 0 || loading.capitalTypes}
                            >
                                <option value="">
                                    {!selectedCC
                                        ? 'Select a cost center first'
                                        : loading.capitalTypes
                                        ? 'Loading...'
                                        : 'Select Capital Type'}
                                </option>
                                {capitalMasterTypes.map(t => (
                                    <option key={t.ID} value={t.ID}>{t.Type?.trim()}</option>
                                ))}
                            </select>
                            <SelectIcon loading={loading.capitalTypes} />
                        </div>
                        {selectedCapitalLabel && (
                            <p className="mt-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-medium truncate">
                                {selectedCapitalLabel}
                            </p>
                        )}
                    </div>

                    {/* Category — shape: { Categoryid, CategoryValue } */}
                    <div>
                        <Label required>Category</Label>
                        <div className="relative">
                            <select
                                className={inputCls + ' appearance-none pr-10'}
                                value={selectedCategory?.code || ''}
                                onChange={e => {
                                    const found = categories.find(c => c.Categoryid === e.target.value);
                                    if (found) handleCategorySelect(found);
                                }}
                                disabled={!selectedCapitalType || categories.length === 0 || loading.categories}
                            >
                                <option value="">
                                    {!selectedCapitalType
                                        ? 'Select capital type first'
                                        : loading.categories
                                        ? 'Loading...'
                                        : 'Select Category'}
                                </option>
                                {categories.map(c => (
                                    <option key={c.Categoryid} value={c.Categoryid}>{c.CategoryValue?.trim()}</option>
                                ))}
                            </select>
                            <SelectIcon loading={loading.categories} />
                        </div>
                        {stagedItems.length > 0 && (
                            <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
                                Switch category to add items from another category
                            </p>
                        )}
                    </div>

                </div>
            </div>

            {/* ── Section 2: Item Search ── */}
            {selectedCategory && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <CardHeader
                        icon={Search}
                        title="Search Items"
                        subtitle={`Category: ${selectedCategory.name || selectedCategory.code}`}
                    />
                    <div className="p-6 space-y-4">

                        {/* Search type toggle */}
                        <div className="flex items-center gap-6">
                            {[{ val: '1', label: 'By Item Code' }, { val: '2', label: 'By Item Name' }].map(opt => (
                                <label key={opt.val} className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="radio"
                                        name="searchType"
                                        value={opt.val}
                                        checked={searchType === opt.val}
                                        onChange={() => { setSearchType(opt.val); dispatch(clearSearchResults()); }}
                                        className="accent-indigo-600 h-4 w-4"
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{opt.label}</span>
                                </label>
                            ))}
                        </div>

                        {/* Search input — autocomplete triggers at 3 chars */}
                        <div className="relative">
                            <input
                                className={inputCls + ' pr-10'}
                                placeholder={
                                    searchType === '1'
                                        ? 'Type item code (min. 3 characters)…'
                                        : 'Type item name (min. 3 characters)…'
                                }
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                autoComplete="off"
                            />
                            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                {loading.search
                                    ? <Loader2 className="h-4 w-4 text-indigo-500 animate-spin" />
                                    : <Search className="h-4 w-4 text-gray-400" />}
                            </div>
                        </div>
                        {searchTerm.length > 0 && searchTerm.length < 3 && (
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                                Type {3 - searchTerm.length} more character{3 - searchTerm.length !== 1 ? 's' : ''}…
                            </p>
                        )}

                        {/* Search results */}
                        {searchResults.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    {searchResults.length} result(s) — click to add
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
                                    {searchResults.map((item, idx) => {
                                        const code    = getSearchCode(item);
                                        const name    = getSearchName(item);
                                        const already = stagedItems.some(si => si.ItemCode === code);
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => !already && handleAddItem(item)}
                                                disabled={already || loading.addItem}
                                                className={[
                                                    'w-full text-left p-3 rounded-xl border-2 transition-all',
                                                    already
                                                        ? 'border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700 cursor-default'
                                                        : 'border-gray-200 dark:border-gray-600 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 cursor-pointer',
                                                ].join(' ')}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0 flex-1">
                                                        <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm truncate">{code}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{name}</p>
                                                    </div>
                                                    {already
                                                        ? <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                                                        : loading.addItem
                                                        ? <Loader2 className="h-4 w-4 text-indigo-400 animate-spin shrink-0 mt-0.5" />
                                                        : <Plus className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {errors.search && (
                            <p className="text-sm text-red-500 dark:text-red-400">{errors.search}</p>
                        )}
                    </div>
                </div>
            )}

            {/* ── Section 3: Staged Items Table ── */}
            {(stagedItems.length > 0 || loading.stagedItems) && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <CardHeader
                        icon={Package}
                        title="Staged Items"
                        subtitle={loading.stagedItems ? 'Loading items…' : `${stagedItems.length} item(s) — enter quantity and amount`}
                        action={loading.stagedItems ? <Loader2 className="h-4 w-4 text-indigo-500 animate-spin" /> : null}
                    />
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/40 dark:bg-gray-900/20">
                                    {['#', 'Item Code', 'Description', 'DCA', 'Sub DCA', 'Unit', 'Basic Price', 'Qty', 'Amount (₹)', ''].map(h => (
                                        <th key={h} className="text-left py-3 px-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/40">
                                {stagedItems.map((item, idx) => (
                                    <tr key={item.tempId} className="hover:bg-gray-50/60 dark:hover:bg-gray-700/20 transition-colors">
                                        <td className="py-3 px-4 text-gray-400 dark:text-gray-500 font-medium">{idx + 1}</td>
                                        <td className="py-3 px-4">
                                            <span className="font-semibold text-gray-800 dark:text-gray-100">{item.ItemCode}</span>
                                        </td>
                                        <td className="py-3 px-4 max-w-[180px]">
                                            <span className="text-gray-600 dark:text-gray-300 truncate block" title={item.Specification ? `${item.ItemName} — ${item.Specification}` : item.ItemName}>
                                                {item.ItemName || '—'}
                                            </span>
                                            {item.Specification && (
                                                <span className="text-xs text-gray-400 dark:text-gray-500 truncate block" title={item.Specification}>
                                                    {item.Specification}
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300 whitespace-nowrap text-xs">
                                            {item.DcaCode || '—'}
                                        </td>
                                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300 whitespace-nowrap text-xs">
                                            {item.SubDcaCode || '—'}
                                        </td>
                                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                            {item.Units || '—'}
                                        </td>
                                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300 whitespace-nowrap text-right">
                                            {item.BasicPrice > 0
                                                ? item.BasicPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                                : '—'}
                                        </td>
                                        <td className="py-3 px-4 w-24">
                                            <input
                                                type="number"
                                                min="1"
                                                step="1"
                                                value={item.Qty || ''}
                                                onChange={e => dispatch(updateItemQty({ tempId: item.tempId, qty: e.target.value }))}
                                                className="w-full px-2.5 py-1.5 rounded-lg border-2 text-sm text-center bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-600 focus:outline-none focus:border-indigo-500 transition-all"
                                                placeholder="0"
                                            />
                                        </td>
                                        <td className="py-3 px-4 w-32">
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={item.Amount || ''}
                                                onChange={e => dispatch(updateItemAmount({ tempId: item.tempId, amount: e.target.value }))}
                                                className="w-full px-2.5 py-1.5 rounded-lg border-2 text-sm text-right bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-600 focus:outline-none focus:border-indigo-500 transition-all"
                                                placeholder="0.00"
                                            />
                                        </td>
                                        <td className="py-3 px-4">
                                            <button
                                                onClick={() => handleDelete(item)}
                                                disabled={loading.removeItem}
                                                title="Remove item"
                                                className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-40"
                                            >
                                                {loading.removeItem
                                                    ? <Loader2 className="h-4 w-4 animate-spin" />
                                                    : <Trash2 className="h-4 w-4" />}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="border-t-2 border-gray-200 dark:border-gray-600 bg-gray-50/60 dark:bg-gray-900/20">
                                    <td colSpan={8} className="py-3 px-4 text-right text-sm font-bold text-gray-700 dark:text-gray-300">
                                        Total Amount
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <span className="flex items-center justify-end gap-1 font-bold text-indigo-700 dark:text-indigo-300 text-base">
                                            <IndianRupee className="h-4 w-4" />
                                            {totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </td>
                                    <td />
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}

            {/* ── Section 4: Submit ── */}
            {stagedItems.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <CardHeader icon={SendHorizontal} title="Submit Indent" subtitle="Enter date and remarks, then submit" />
                    <div className="p-6 space-y-5">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <Label required>Indent Date</Label>
                                <CustomDatePicker
                                    value={date}
                                    onChange={setDate}
                                    format="DD-MMM-YYYY"
                                    maxDate={new Date()}
                                />
                            </div>
                            <div>
                                <Label>Remarks</Label>
                                <textarea
                                    className={inputCls + ' resize-none h-[82px]'}
                                    placeholder="Enter remarks (optional)..."
                                    value={remarks}
                                    onChange={e => setRemarks(e.target.value)}
                                    maxLength={500}
                                />
                            </div>
                        </div>

                        {/* Summary banner */}
                        <div className="flex flex-wrap items-center justify-between gap-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl px-5 py-3.5">
                            <div className="flex flex-wrap items-center gap-4 text-sm text-indigo-700 dark:text-indigo-300">
                                <span>
                                    <span className="font-bold">{stagedItems.length}</span> item(s)
                                </span>
                                <span className="text-indigo-300 dark:text-indigo-600">|</span>
                                <span>
                                    Cost Center: <span className="font-bold">{selectedCC}</span>
                                </span>
                                {selectedCapitalLabel && (
                                    <>
                                        <span className="text-indigo-300 dark:text-indigo-600">|</span>
                                        <span className="truncate max-w-[200px]" title={selectedCapitalLabel}>
                                            Type: <span className="font-bold">{selectedCapitalLabel}</span>
                                        </span>
                                    </>
                                )}
                            </div>
                            <span className="flex items-center gap-1 font-bold text-indigo-800 dark:text-indigo-200 text-base">
                                <IndianRupee className="h-4 w-4" />
                                {totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex justify-end gap-3 pt-1">
                            <button
                                onClick={handleReset}
                                disabled={loading.submit}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-semibold transition-colors disabled:opacity-50"
                            >
                                <RotateCcw className="h-4 w-4" />
                                Reset
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading.submit || stagedItems.length === 0}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors shadow-sm shadow-indigo-200 dark:shadow-none"
                            >
                                {loading.submit
                                    ? <Loader2 className="h-4 w-4 animate-spin" />
                                    : <SendHorizontal className="h-4 w-4" />}
                                Submit Indent
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {/* Empty state when nothing is selected */}
            {!selectedCC && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
                    <Tag className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Select a Cost Center to begin creating an indent</p>
                </div>
            )}

        </div>
    );
}
