import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    X, Banknote, Hash, ArrowRight, MapPin, Loader2,
    CreditCard, AlertCircle, ChevronDown
} from 'lucide-react';

import CustomDatePicker from '../../components/CustomDatePicker';

import {
    fetchEmployeeBanks,
    fetchEmpBankDetails,
    submitEmpBankChange,
    clearBankDetails,
    clearSubmitResult,
    selectEmployeeBanks,
    selectCurrentBank,
    selectSubmitResult,
    selectLoading,
    selectErrors,
} from '../../slices/HRSlice/empBankChangeSlice';

const cn = (...c) => c.filter(Boolean).join(' ');

const Label = ({ children, required }) => (
    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
        {children}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
);

const InfoRow = ({ label, value, mono }) => (
    <div className="flex items-start gap-3 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
        <span className="text-xs text-gray-500 dark:text-gray-400 w-32 shrink-0 pt-0.5">{label}</span>
        <span className={cn('text-sm font-medium text-gray-900 dark:text-white flex-1', mono && 'font-mono tracking-wide')}>
            {value || <span className="text-gray-400 italic">—</span>}
        </span>
    </div>
);

const emptyForm = {
    Bankid: 0,
    BankName: '',
    BankAccountNo: '',
    IFSCcode: '',
    BankAddress: '',
    ApplicableFrom: '',
};

// EditEmpBankModal — popup used from StaffReportPage's Bank Details section
// to submit a bank change request for a single employee (EmpRefNo already known).
const EditEmpBankModal = ({ empRefNo, empName, onClose, onSuccess }) => {
    const dispatch = useDispatch();

    const employeeBanks = useSelector(selectEmployeeBanks);
    const currentBank   = useSelector(selectCurrentBank);
    const submitResult  = useSelector(selectSubmitResult);
    const loading       = useSelector(selectLoading);
    const errors        = useSelector(selectErrors);

    const { userData } = useSelector((s) => s.auth);
    const roleId   = userData?.roleId || userData?.RID;
    const userName = userData?.userName || userData?.UserName || 'system';

    const [form, setForm] = useState(emptyForm);

    useEffect(() => {
        dispatch(fetchEmployeeBanks());
        dispatch(fetchEmpBankDetails({ empRefNo }));
        return () => {
            dispatch(clearBankDetails());
            dispatch(clearSubmitResult());
        };
    }, [dispatch, empRefNo]);

    useEffect(() => {
        if (!submitResult) return;
        const result = typeof submitResult === 'string' ? submitResult : JSON.stringify(submitResult);
        if (result.toLowerCase().includes('submit') || result.toLowerCase().includes('success')) {
            toast.success('Bank change request submitted successfully!');
            dispatch(clearSubmitResult());
            onSuccess?.();
        } else {
            toast.error(result || 'Submission failed. Please try again.');
            dispatch(clearSubmitResult());
        }
    }, [submitResult, dispatch, onSuccess]);

    const handleFormChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleBankSelect = (e) => {
        const bankId = e.target.value;
        const bank = employeeBanks.find((b) => String(b.Bank_Id) === bankId);
        setForm((prev) => ({
            ...prev,
            Bankid: parseInt(bankId, 10) || 0,
            BankName: bank?.Bank_Name || '',
        }));
    };

    const isBlocked = currentBank && currentBank.ErrorStatus && currentBank.ErrorStatus !== 'NoError';

    const handleSubmit = () => {
        if (!form.BankName.trim()) { toast.error('Please select a bank.'); return; }
        if (!form.BankAccountNo.trim()) { toast.error('Account Number is required.'); return; }
        if (!form.IFSCcode.trim()) { toast.error('IFSC Code is required.'); return; }
        if (!form.ApplicableFrom) { toast.error('Applicable From date is required.'); return; }

        const payload = {
            EmpRefNo:           empRefNo,
            BankId:             form.Bankid || 0,
            Bank:               form.BankName.trim(),
            AccountNo:          form.BankAccountNo.trim(),
            IFSC:               form.IFSCcode.trim().toUpperCase(),
            Address:            form.BankAddress.trim(),
            OldBankid:          currentBank?.Bankid || 0,
            Createdby:          userName,
            RoleId:             roleId,
            BankApplicableFrom: form.ApplicableFrom,
        };

        dispatch(submitEmpBankChange(payload));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden max-h-[90vh] flex flex-col">
                {/* Top accent stripe matching SL logo palette */}
                <div className="h-1.5 bg-gradient-to-r from-[#0d1b5e] via-orange-400 to-[#0d1b5e] shrink-0" />

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#0d1b5e] to-blue-900 flex items-center justify-center shadow-sm shrink-0">
                            <CreditCard className="h-4 w-4 text-orange-400" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-base font-semibold text-gray-900 dark:text-white truncate">Edit Bank Details</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{empName ? `${empName} · ${empRefNo}` : empRefNo}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 shrink-0"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5 overflow-y-auto">
                    {loading.bankDetails ? (
                        <div className="flex items-center gap-3 py-6 justify-center">
                            <Loader2 className="h-5 w-5 animate-spin text-[#0d1b5e] dark:text-orange-400" />
                            <span className="text-sm text-gray-500 dark:text-gray-400">Loading bank details...</span>
                        </div>
                    ) : (
                        <>
                            {/* Current bank details */}
                            <div>
                                <Label>Current Bank Details</Label>
                                <div className="rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 px-4 py-2">
                                    <InfoRow label="Bank Name"   value={currentBank?.BankName} />
                                    <InfoRow label="Account No." value={currentBank?.BankAccountNo} mono />
                                    <InfoRow label="IFSC Code"   value={currentBank?.IFSCcode} mono />
                                    <InfoRow label="Address"     value={currentBank?.BankAddress} />
                                </div>
                            </div>

                            {isBlocked ? (
                                <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl px-4 py-3 border border-amber-200 dark:border-amber-700">
                                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                                    <p className="text-xs text-amber-700 dark:text-amber-300">{currentBank.ErrorStatus}</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <Label>New Bank Details</Label>

                                    {/* Bank Name */}
                                    <div>
                                        <Label required>Bank Name</Label>
                                        <div className="relative">
                                            <select
                                                value={form.Bankid || ''}
                                                onChange={handleBankSelect}
                                                className="w-full appearance-none rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white pl-9 pr-10 py-2.5 text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-400/30"
                                            >
                                                <option value="">— Select bank —</option>
                                                {loading.employeeBanks && <option disabled>Loading...</option>}
                                                {employeeBanks.map((bank) => (
                                                    <option key={bank.Bank_Id} value={bank.Bank_Id}>
                                                        {bank.Bank_Name}
                                                    </option>
                                                ))}
                                            </select>
                                            <Banknote className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                            <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-gray-400" />
                                        </div>
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
                                                className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white pl-9 px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-400/30"
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
                                                className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white pl-9 px-4 py-2.5 text-sm font-mono tracking-wider uppercase focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-400/30"
                                            />
                                        </div>
                                    </div>

                                    {/* Bank Address */}
                                    <div>
                                        <Label>Bank Address / Branch</Label>
                                        <div className="relative">
                                            <MapPin className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                            <input
                                                type="text"
                                                value={form.BankAddress}
                                                onChange={(e) => handleFormChange('BankAddress', e.target.value)}
                                                placeholder="Branch name and address"
                                                className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white pl-9 px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-400/30"
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
                            )}

                            {errors.submit && (
                                <div className="rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-700 px-4 py-3 text-sm text-rose-700 dark:text-rose-400">
                                    {errors.submit}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                {!loading.bankDetails && !isBlocked && (
                    <div className="px-6 pb-6 pt-2 flex items-center justify-end gap-3 shrink-0 border-t border-gray-100 dark:border-gray-800">
                        <button
                            onClick={onClose}
                            disabled={loading.submit}
                            className="px-5 py-2.5 text-sm font-semibold rounded-xl border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading.submit || !form.BankName || !form.BankAccountNo || !form.IFSCcode || !form.ApplicableFrom}
                            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-[#0d1b5e] to-orange-500 hover:from-[#0a1545] hover:to-orange-600 text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99]"
                        >
                            {loading.submit && <Loader2 className="h-4 w-4 animate-spin" />}
                            <Banknote className="h-4 w-4" />
                            Submit Bank Change
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditEmpBankModal;
