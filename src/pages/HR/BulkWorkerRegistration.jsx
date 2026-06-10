import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import {
    Upload, FileSpreadsheet, CheckCircle, XCircle, AlertTriangle,
    Users, FileText, Trash2, RotateCcw, Loader2, AlertCircle,
    ChevronDown, ChevronUp, Info, Send, Navigation, Download,
} from 'lucide-react';
import {
    validateWorkerData,
    saveWorkerRegistration,
    setWorkerList,
    setNote,
    setValidationResult,
    clearValidationResult,
    clearSaveResult,
    resetAll,
    selectWorkerListArray,
    selectNote,
    selectValidationResult,
    selectSaveResult,
    selectValidateLoading,
    selectSaveLoading,
    selectValidateError,
    selectSaveError,
    selectRegistrationSummary,
} from '../../slices/HRSlice/bulkWorkerRegistrationSlice';

// ─── Excel date helper ─────────────────────────────────────────────────────────
// Always outputs DD/MM/YYYY. Handles Date objects (cellDates:true), Excel serial
// numbers, DD/MM/YYYY strings, and legacy DD-Mon-YYYY strings.
const MONTH_ABBR_MAP = { Jan:'01',Feb:'02',Mar:'03',Apr:'04',May:'05',Jun:'06',Jul:'07',Aug:'08',Sep:'09',Oct:'10',Nov:'11',Dec:'12' };
const excelDateToString = (val) => {
    if (!val && val !== 0) return '';
    if (val instanceof Date) {
        // xlsx serial→Date has a known floating-point drift (23:59:50 instead of
        // midnight). Nudge +30 s to cross midnight safely — never changes the date.
        const d    = new Date(val.getTime() + 30 * 1000);
        const dd   = String(d.getDate()).padStart(2, '0');
        const mm   = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
    }
    if (typeof val === 'number' && val > 25569) {
        const d    = new Date(Math.round((val - 25569) * 86400 * 1000));
        const dd   = String(d.getUTCDate()).padStart(2, '0');
        const mm   = String(d.getUTCMonth() + 1).padStart(2, '0');
        const yyyy = d.getUTCFullYear();
        return `${dd}/${mm}/${yyyy}`;
    }
    const str = val?.toString().trim() || '';
    if (!str) return '';
    // Already DD/MM/YYYY
    const slash = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (slash) return `${slash[1].padStart(2,'0')}/${slash[2].padStart(2,'0')}/${slash[3]}`;
    // Legacy DD-Mon-YYYY (old template format)
    const legacy = str.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/);
    if (legacy) {
        const mm = MONTH_ABBR_MAP[legacy[2]] || legacy[2];
        return `${legacy[1].padStart(2,'0')}/${mm}/${legacy[3]}`;
    }
    return str;
};

// ─── Excel parser ──────────────────────────────────────────────────────────────
const parseExcelToWorkers = (rows) => {
    if (!rows || rows.length < 2) return [];
    return rows
        .slice(1)
        .filter(row => Array.isArray(row) && row.some(cell => cell !== null && cell !== undefined && cell !== ''))
        .map((row, idx) => ({
            serialNo:       parseInt(row[0]) || idx + 1,
            firstName:      row[1]?.toString().trim() || '',
            lastName:       row[2]?.toString().trim() || '',
            costCenter:     row[3]?.toString().trim() || '',
            labourType:     row[4]?.toString().trim() || '',
            contractorCode: row[5]?.toString().trim() || '',
            group:          row[6]?.toString().trim() || '',
            fatherName:     row[7]?.toString().trim() || '',
            dob:            excelDateToString(row[8]),
            joiningDate:    excelDateToString(row[9]),
            bankName:       row[10]?.toString().trim() || '',
            ifscCode:       row[11]?.toString().trim() || '',
            bankAddress:    row[12]?.toString().trim() || '',
            bankAccountNo:  row[13]?.toString().trim() || '',
            gender:         row[14]?.toString().trim() || '',
            mobileNo:       row[15]?.toString().trim() || '',
            jobType:        row[16]?.toString().trim() || '',
            department:     row[17]?.toString().trim() || '',
            aadharNo:       row[18]?.toString().trim() || '',
            probationDays:  parseInt(row[19]) || 0,
            isPFExist:      row[20]?.toString().trim() || '',
            isESIExist:     row[21]?.toString().trim() || '',
            uanNumber:      row[22]?.toString().trim() || '',
            reportToRole:   row[23]?.toString().trim() || '',
            esiNumber:      row[24]?.toString().trim() || '',
            designation:    row[25]?.toString().trim() || '',
        }));
};

const PREVIEW_COLUMNS = [
    { key: 'serialNo',       label: 'S.No' },
    { key: 'firstName',      label: 'First Name' },
    { key: 'lastName',       label: 'Last Name' },
    { key: 'costCenter',     label: 'Cost Center' },
    { key: 'labourType',     label: 'Labour Type' },
    { key: 'contractorCode', label: 'Contractor' },
    { key: 'group',          label: 'Group' },
    { key: 'dob',            label: 'DOB' },
    { key: 'joiningDate',    label: 'Joining Date' },
    { key: 'gender',         label: 'Gender' },
    { key: 'mobileNo',       label: 'Mobile' },
    { key: 'jobType',        label: 'Job Type' },
    { key: 'department',     label: 'Dept' },
    { key: 'aadharNo',       label: 'Aadhar' },
    { key: 'bankName',       label: 'Bank' },
    { key: 'ifscCode',       label: 'IFSC' },
    { key: 'bankAccountNo',  label: 'Acc No' },
    { key: 'isPFExist',      label: 'PF' },
    { key: 'isESIExist',     label: 'ESI' },
    { key: 'designation',    label: 'Designation' },
];

// ─── Excel template download ───────────────────────────────────────────────────
const TEMPLATE_HEADERS = [
    'S.No', 'First Name', 'Last Name', 'Cost Center', 'Labour Type',
    'Contractor Code', 'Group', 'Father Name', 'DOB (DD/MM/YYYY)', 'Joining Date (DD/MM/YYYY)',
    'Bank Name', 'IFSC Code', 'Bank Address', 'Bank Account No', 'Gender',
    'Mobile No', 'Job Type', 'Department', 'Aadhar No', 'Probation Days',
    'Is PF Exist', 'Is ESI Exist', 'UAN Number', 'Report To Role',
    'ESI Number', 'Designation',
];

// Labour Type:    Own Labour | Contractor
// Group:          SK | SSK | USK | HSK
// Gender:         Male | Female
// Job Type:       Permanent | Contract | Casual
// Is PF / ESI:    Yes | No
// ContractorCode: fill only if Labour Type = Contractor, leave blank for Own Labour
// Date columns (DOB & Joining Date): enter as DD/MM/YYYY — cells are pre-formatted
const TEMPLATE_SAMPLE_ROWS = [
    [
        1, 'Ramesh', 'Kumar', 'CC-01', 'Own Labour', '',
        'SK', 'Suresh Kumar', new Date(1990, 0, 1), new Date(2024, 5, 1),
        'State Bank of India', 'SBIN0001234', 'SBI Main Branch, Chennai', '1234567890123456', 'Male',
        '9876543210', 'Permanent', 'Civil', '123456789012', 90,
        'Yes', 'Yes', 'UAN123456789', 'Site Manager', 'ESI123456', 'Mason',
    ],
    [
        2, 'Priya', 'Sharma', 'CC-02', 'Contractor', 'CONT-002',
        'SSK', 'Ravi Sharma', new Date(1995, 2, 15), new Date(2024, 5, 15),
        'HDFC Bank', 'HDFC0002345', 'HDFC Branch, Hyderabad', '9876543210987654', 'Female',
        '8765432109', 'Contract', 'Electrical', '234567890123', 60,
        'No', 'Yes', '', 'Project Manager', 'ESI234567', 'Electrician',
    ],
    [
        3, 'Arun', 'Nair', 'CC-03', 'Own Labour', '',
        'USK', 'Vijayan Nair', new Date(1988, 6, 10), new Date(2024, 6, 1),
        'Canara Bank', 'CNRB0003456', 'Canara Branch, Kochi', '3456789012345678', 'Male',
        '7654321098', 'Casual', 'Mechanical', '345678901234', 0,
        'No', 'No', '', 'Foreman', '', 'Helper',
    ],
];

const downloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    const wsData = [TEMPLATE_HEADERS, ...TEMPLATE_SAMPLE_ROWS];
    const ws = XLSX.utils.aoa_to_sheet(wsData, { cellDates: true });

    // Apply DD/MM/YYYY format to DOB (col I = index 8) and Joining Date (col J = index 9)
    // for each sample data row (rows 2-4, 0-indexed rows 1-3)
    const dateFormat = 'DD/MM/YYYY';
    for (let r = 1; r <= TEMPLATE_SAMPLE_ROWS.length; r++) {
        const dobCell = XLSX.utils.encode_cell({ r, c: 8 });
        const joinCell = XLSX.utils.encode_cell({ r, c: 9 });
        if (ws[dobCell])  ws[dobCell].z  = dateFormat;
        if (ws[joinCell]) ws[joinCell].z = dateFormat;
    }

    // Column widths
    ws['!cols'] = [
        { wch: 6 },  // S.No
        { wch: 14 }, // First Name
        { wch: 14 }, // Last Name
        { wch: 12 }, // Cost Center
        { wch: 14 }, // Labour Type
        { wch: 16 }, // Contractor Code
        { wch: 10 }, // Group
        { wch: 16 }, // Father Name
        { wch: 12 }, // DOB
        { wch: 14 }, // Joining Date
        { wch: 22 }, // Bank Name
        { wch: 14 }, // IFSC Code
        { wch: 28 }, // Bank Address
        { wch: 20 }, // Bank Account No
        { wch: 8 },  // Gender
        { wch: 13 }, // Mobile No
        { wch: 12 }, // Job Type
        { wch: 14 }, // Department
        { wch: 14 }, // Aadhar No
        { wch: 14 }, // Probation Days
        { wch: 12 }, // Is PF Exist
        { wch: 12 }, // Is ESI Exist
        { wch: 14 }, // UAN Number
        { wch: 16 }, // Report To Role
        { wch: 14 }, // ESI Number
        { wch: 14 }, // Designation
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Worker Registration');
    XLSX.writeFile(wb, 'BulkWorkerRegistration_Template.xlsx');
    toast.success('Template downloaded successfully');
};

// ─── Parse error strings into structured table rows ───────────────────────────
// Handles both lstError arrays and the SP's $-delimited ErrorMsg string
const parseErrorStrings = (messages = []) =>
    messages.map((msg, i) => {
        const rowMatch   = msg.match(/row[:\s\-]+(\d+)/i);
        const rowNo      = rowMatch ? parseInt(rowMatch[1]) : null;
        const fieldMatch = msg.match(/:\s*([A-Za-z][A-Za-z\s]+?)\s+(is |are |already |must |not |invalid|required|exist|mismatch)/i);
        const field      = fieldMatch ? fieldMatch[1].trim() : null;
        const cleanMsg   = msg.replace(/^(row[:\s\-]+\d+[:\s\-]*)/i, '').trim();
        return { id: i, rowNo, field, message: cleanMsg || msg };
    });

// SP returns errors in ErrorMsg as comma/semicolon/newline-separated string
const parseSPErrorMsg = (errorMsg = '') =>
    errorMsg
        .split(/[,;\n]+/)
        .map(s => s.trim())
        .filter(Boolean);

// ─── Shared design helpers (mirrors EmployeeTransfer) ─────────────────────────
const inputCls =
    'w-full px-3.5 py-2.5 rounded-xl border-2 text-sm bg-white dark:bg-gray-800 ' +
    'text-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700 ' +
    'focus:outline-none focus:ring-2 focus:border-blue-700 focus:ring-blue-100 ' +
    'dark:focus:ring-blue-900/30 hover:border-gray-300 dark:hover:border-gray-600 transition-all';

const SectionHeader = ({ icon: Icon, title, subtitle, gradient = 'from-blue-900 to-orange-500' }) => (
    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 shadow-md`}>
            <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">{title}</h3>
            {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
    </div>
);

// ─── Shared error table ────────────────────────────────────────────────────────
const ErrorTable = ({ parsed, colorClass = 'rose' }) => (
    <div className="max-h-64 overflow-y-auto">
        <table className="w-full text-xs">
            <thead className={`sticky top-0 bg-${colorClass}-50 dark:bg-${colorClass}-900/30 border-b border-${colorClass}-200 dark:border-${colorClass}-800`}>
                <tr>
                    <th className={`px-4 py-2.5 text-left font-bold text-${colorClass}-600 dark:text-${colorClass}-400 uppercase tracking-wider w-16`}>Row</th>
                    <th className={`px-4 py-2.5 text-left font-bold text-${colorClass}-600 dark:text-${colorClass}-400 uppercase tracking-wider w-36`}>Field</th>
                    <th className={`px-4 py-2.5 text-left font-bold text-${colorClass}-600 dark:text-${colorClass}-400 uppercase tracking-wider`}>Error Detail</th>
                </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-rose-100 dark:divide-rose-900/30">
                {parsed.map(err => (
                    <tr key={err.id} className={`hover:bg-${colorClass}-50/60 dark:hover:bg-${colorClass}-900/10`}>
                        <td className="px-4 py-2.5">
                            {err.rowNo
                                ? <span className={`inline-flex items-center justify-center h-5 min-w-[1.5rem] px-1.5 rounded-md bg-${colorClass}-100 dark:bg-${colorClass}-900/40 text-${colorClass}-700 dark:text-${colorClass}-400 font-bold text-[10px]`}>{err.rowNo}</span>
                                : <span className="text-gray-400">—</span>
                            }
                        </td>
                        <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400 font-medium">
                            {err.field || <span className="text-gray-400 italic">General</span>}
                        </td>
                        <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300">
                            <div className="flex items-start gap-1.5">
                                <AlertTriangle className={`h-3 w-3 text-${colorClass}-400 mt-0.5 shrink-0`} />
                                {err.message}
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

// ─── Validation Result Panel (client-side + SP response) ──────────────────────
const ValidationPanel = ({ validationResult }) => {
    const [expanded, setExpanded] = useState(true);
    if (!validationResult) return null;

    const status  = validationResult.ErrorStatus;
    const isValid = status === 'Valid';

    // lstError populated by client-side validation or SP row-level errors
    const lstErrors = validationResult.lstError || [];
    const parsed    = parseErrorStrings(lstErrors);

    // ── 1. Valid — all good
    if (isValid && parsed.length === 0) {
        return (
            <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                <div>
                    <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Validation Passed</p>
                    <p className="text-xs text-emerald-600/80 dark:text-emerald-500 mt-0.5">
                        All records look good — proceed to Register Workers.
                    </p>
                </div>
            </div>
        );
    }

    // ── 2. System-level error from SP (InValidError) — show ErrorMsg
    if (status === 'InValidError') {
        const msg = validationResult.ErrorMsg || 'An unexpected error occurred during validation.';
        return (
            <div className="flex items-start gap-3 px-5 py-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-bold text-amber-700 dark:text-amber-400">Validation Error</p>
                    <p className="text-xs text-amber-600/80 dark:text-amber-500 mt-0.5">{msg}</p>
                </div>
            </div>
        );
    }

    // ── 3. No row-level errors to display
    if (parsed.length === 0) return null;

    // ── 4. Row-level validation failures (client or SP)
    return (
        <div className="rounded-xl border border-rose-200 dark:border-rose-800 overflow-hidden">
            <button
                onClick={() => setExpanded(p => !p)}
                className="w-full flex items-center justify-between px-5 py-4 bg-rose-50 dark:bg-rose-900/20 text-left"
            >
                <div className="flex items-center gap-3">
                    <XCircle className="h-5 w-5 text-rose-500 shrink-0" />
                    <div>
                        <p className="text-sm font-bold text-rose-700 dark:text-rose-400">
                            Validation Failed — {parsed.length} issue{parsed.length !== 1 ? 's' : ''} found
                        </p>
                        <p className="text-xs text-rose-500 mt-0.5">Fix the highlighted rows in your Excel file and re-upload</p>
                    </div>
                </div>
                {expanded
                    ? <ChevronUp className="h-4 w-4 text-rose-400 shrink-0" />
                    : <ChevronDown className="h-4 w-4 text-rose-400 shrink-0" />
                }
            </button>
            {expanded && <ErrorTable parsed={parsed} colorClass="rose" />}
        </div>
    );
};

// ─── Save / Registration Error Panel ──────────────────────────────────────────
// Shows SP-returned errors from @AddStatus (format: "InValid$error message")
const SaveErrorPanel = ({ saveResult }) => {
    const [expanded, setExpanded] = useState(true);
    if (!saveResult || saveResult.ErrorStatus === 'Submited') return null;

    const rawMessages = parseSPErrorMsg(saveResult.ErrorMsg || saveResult.ErrorStatus || 'Registration failed');
    const parsed      = parseErrorStrings(rawMessages);

    return (
        <div className="rounded-xl border border-amber-200 dark:border-amber-800 overflow-hidden">
            <button
                onClick={() => setExpanded(p => !p)}
                className="w-full flex items-center justify-between px-5 py-4 bg-amber-50 dark:bg-amber-900/20 text-left"
            >
                <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                    <div>
                        <p className="text-sm font-bold text-amber-700 dark:text-amber-400">
                            Registration Failed — {parsed.length > 1 ? `${parsed.length} issues` : 'see details below'}
                        </p>
                        <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
                            Returned by server: status <span className="font-mono">{saveResult.ErrorStatus}</span>
                        </p>
                    </div>
                </div>
                {expanded
                    ? <ChevronUp className="h-4 w-4 text-amber-400 shrink-0" />
                    : <ChevronDown className="h-4 w-4 text-amber-400 shrink-0" />
                }
            </button>
            {expanded && (
                parsed.length > 0
                    ? <ErrorTable parsed={parsed} colorClass="amber" />
                    : (
                        <div className="px-5 py-3 bg-white dark:bg-gray-800">
                            <p className="text-sm text-amber-700 dark:text-amber-400">{saveResult.ErrorMsg || 'An error occurred during registration.'}</p>
                        </div>
                    )
            )}
        </div>
    );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const BulkWorkerRegistration = () => {
    const dispatch = useDispatch();

    const { userData }    = useSelector(s => s.auth);
    const roleId          = userData?.roleId || userData?.RID;
    const uid             = userData?.UID || userData?.uid;
    const userName        = userData?.userName || userData?.UserName || '';

    const workerList       = useSelector(selectWorkerListArray);
    const note             = useSelector(selectNote);
    const validationResult = useSelector(selectValidationResult);
    const saveResult       = useSelector(selectSaveResult);
    const validateLoading  = useSelector(selectValidateLoading);
    const saveLoading      = useSelector(selectSaveLoading);
    const validateError    = useSelector(selectValidateError);
    const saveError        = useSelector(selectSaveError);
    const summary          = useSelector(selectRegistrationSummary);

    const [uploadedFile, setUploadedFile] = useState(null);
    const [isDragging,   setIsDragging]   = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => { return () => { dispatch(resetAll()); }; }, [dispatch]);

    useEffect(() => {
        if (!saveResult) return;
        // SP returns "Submited" (note: backend spelling) on success
        if (saveResult.ErrorStatus === 'Submited') {
            const txRef = saveResult.ErrorMsg || '';
            toast.success(`Workers submitted for approval!${txRef ? ' Ref: ' + txRef : ''} Awaiting HR verification.`);
            handleReset();
        }
        // else: SaveErrorPanel renders the persistent error — no toast needed
    }, [saveResult]);

    // ── Client-side validation (aligned with spValidateExcelWorkerData SP) ───────
    // Mandatory fields match the SP's @NOT NULL checks; duplicate MobileNo is
    // caught here as the SP also rejects in-sheet duplicates.
    // Aadhar validation (format + DB duplicate) is handled server-side by the SP.
    const runClientValidation = (workers) => {
        const REQUIRED = ['firstName', 'costCenter', 'labourType', 'gender',
            'department', 'jobType', 'dob', 'joiningDate'];
        const FIELD_LABELS = {
            firstName: 'First Name', costCenter: 'Cost Center', labourType: 'Labour Type',
            gender: 'Gender', department: 'Department', jobType: 'Job Type',
            dob: 'DOB', joiningDate: 'Joining Date', contractorCode: 'Contractor Code',
        };
        const errors = [];
        const mobileSeen = {};

        workers.forEach((w, idx) => {
            const row = w.serialNo || idx + 1;

            REQUIRED.forEach(f => {
                if (!w[f]?.toString().trim())
                    errors.push(`Row ${row}: ${FIELD_LABELS[f]} is required`);
            });

            // Contractor code required only when Labour Type = Contractor
            if (w.labourType?.toLowerCase() === 'contractor' && !w.contractorCode?.trim())
                errors.push(`Row ${row}: Contractor Code is required when Labour Type is Contractor`);

            if (w.mobileNo && !/^\d{10}$/.test(w.mobileNo.toString().trim()))
                errors.push(`Row ${row}: Mobile No must be exactly 10 digits`);

            // Duplicate mobile check (SP rejects in-sheet duplicates)
            if (w.mobileNo?.trim()) {
                if (mobileSeen[w.mobileNo.trim()])
                    errors.push(`Row ${row}: Mobile No ${w.mobileNo.trim()} is duplicate (also in row ${mobileSeen[w.mobileNo.trim()]})`);
                else
                    mobileSeen[w.mobileNo.trim()] = row;
            }

            const validGenders = ['male', 'female'];
            if (w.gender && !validGenders.includes(w.gender.toLowerCase()))
                errors.push(`Row ${row}: Gender must be Male or Female`);

            const validLabourTypes = ['own labour', 'contractor'];
            if (w.labourType && !validLabourTypes.includes(w.labourType.toLowerCase()))
                errors.push(`Row ${row}: Labour Type must be "Own Labour" or "Contractor"`);

            const validGroups = ['sk', 'ssk', 'usk', 'hsk'];
            if (w.group && !validGroups.includes(w.group.toLowerCase()))
                errors.push(`Row ${row}: Group must be SK, SSK, USK, or HSK`);

            // Joining date must not be a future date
            if (w.joiningDate?.trim()) {
                const MONTH_MAP = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };
                const parts = w.joiningDate.trim().split('-');
                if (parts.length === 3) {
                    const jd = new Date(parseInt(parts[2]), MONTH_MAP[parts[1]], parseInt(parts[0]));
                    const today = new Date(); today.setHours(0, 0, 0, 0);
                    if (!isNaN(jd.getTime()) && jd > today)
                        errors.push(`Row ${row}: Joining Date (${w.joiningDate}) must not be a future date`);
                }
            }
        });

        return errors;
    };

    const handleFileProcess = (file) => {
        if (!file) return;
        if (!file.name.match(/\.(xlsx|xls)$/i)) {
            toast.error('Please upload a valid Excel file (.xlsx or .xls)');
            return;
        }
        setUploadedFile(file);
        dispatch(clearValidationResult());
        dispatch(clearSaveResult());
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data     = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array', cellDates: true });
                const sheet    = workbook.Sheets[workbook.SheetNames[0]];
                const rows     = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: true });
                const workers  = parseExcelToWorkers(rows);
                if (!workers.length) { toast.warning('No worker data found in the Excel file'); return; }
                dispatch(setWorkerList(workers));
                toast.info(`${workers.length} worker record${workers.length !== 1 ? 's' : ''} loaded`);
            } catch (err) {
                toast.error('Failed to parse Excel file: ' + err.message);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleFileChange  = (e) => { const f = e.target.files[0]; if (f) handleFileProcess(f); e.target.value = ''; };
    const handleDragOver    = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave   = () => setIsDragging(false);
    const handleDrop        = (e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFileProcess(f); };

    const handleValidate = () => {
        if (!workerList.length) { toast.warning('Please upload an Excel file first'); return; }
        dispatch(clearValidationResult());
        dispatch(clearSaveResult());

        const clientErrors = runClientValidation(workerList);
        if (clientErrors.length > 0) {
            // Set validation result locally — no need to hit the API for obvious errors
            dispatch(setValidationResult({ ErrorStatus: 'InValid', ErrorMsg: 'Errors', lstError: clientErrors }));
            toast.error(`${clientErrors.length} validation issue${clientErrors.length !== 1 ? 's' : ''} found`);
            return;
        }
        // Client-side passed — call API (backend returns "Valid" for workers, enabling Register button)
        dispatch(validateWorkerData({ lstWorker: workerList, createdBy: uid || userName || '', userName, note }));
    };

    const handleRegister = () => {
        if (!workerList.length) { toast.warning('Please upload an Excel file first'); return; }
        if (!summary.isValidated) { toast.warning('Please validate the data before registering'); return; }
        dispatch(saveWorkerRegistration({ lstWorker: workerList, createdBy: uid || userName || '', userName, roleId, note }));
    };

    const handleReset = () => {
        dispatch(resetAll());
        setUploadedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-orange-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 md:p-6">

            {/* ── Page Header Banner ───────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto mb-6">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950 via-blue-900 to-blue-800 shadow-xl shadow-blue-900/20 p-7 text-white">
                    <div className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                    <div className="absolute top-0 right-0 w-72 h-72 bg-orange-400 rounded-full -translate-y-1/2 translate-x-1/4 opacity-20 blur-3xl" />
                    <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shadow-lg border border-white/20">
                                <Users className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-orange-200 uppercase tracking-wider bg-orange-500/25 px-2 py-0.5 rounded-full border border-orange-400/30">HR Module</span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight">Bulk Worker Registration</h1>
                                <p className="text-blue-200 text-sm mt-0.5">Upload an Excel file to register multiple workers at once</p>
                            </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-3 text-blue-200">
                            <div className="text-right">
                                <p className="text-xs uppercase tracking-wider">Module</p>
                                <p className="text-sm font-bold text-white">HR / Registration</p>
                            </div>
                            <Navigation className="h-5 w-5 opacity-60" />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Main Content ──────────────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto space-y-5">

                {/* Stats row (shown after file load) */}
                {workerList.length > 0 && (
                    <div className="grid grid-cols-3 gap-4">
                        {/* Workers count */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-900 to-orange-500 flex items-center justify-center shrink-0 shadow-md">
                                <Users className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Total Workers</p>
                                <p className="text-2xl font-black text-gray-800 dark:text-gray-100">{summary.workerCount}</p>
                            </div>
                        </div>

                        {/* Validation status */}
                        <div className={`bg-white dark:bg-gray-800 rounded-2xl border shadow-sm p-4 flex items-center gap-4 transition-colors ${
                            summary.isValidated
                                ? 'border-emerald-300 dark:border-emerald-700'
                                : validationResult
                                    ? 'border-rose-300 dark:border-rose-700'
                                    : 'border-gray-200 dark:border-gray-700'
                        }`}>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                                summary.isValidated
                                    ? 'bg-gradient-to-br from-emerald-500 to-teal-500'
                                    : validationResult
                                        ? 'bg-gradient-to-br from-rose-500 to-rose-600'
                                        : 'bg-gradient-to-br from-amber-400 to-orange-500'
                            }`}>
                                {summary.isValidated
                                    ? <CheckCircle className="h-5 w-5 text-white" />
                                    : validationResult
                                        ? <XCircle className="h-5 w-5 text-white" />
                                        : <AlertTriangle className="h-5 w-5 text-white" />
                                }
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Validation</p>
                                <p className={`text-sm font-bold ${
                                    summary.isValidated
                                        ? 'text-emerald-600 dark:text-emerald-400'
                                        : validationResult
                                            ? 'text-rose-600 dark:text-rose-400'
                                            : 'text-amber-600 dark:text-amber-400'
                                }`}>
                                    {summary.isValidated ? 'Passed' : validationResult ? 'Failed' : 'Pending'}
                                </p>
                            </div>
                        </div>

                        {/* File name */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-900 to-orange-500 flex items-center justify-center shrink-0 shadow-md">
                                <FileSpreadsheet className="h-5 w-5 text-white" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">File</p>
                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate" title={uploadedFile?.name}>
                                    {uploadedFile?.name || '—'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Main Card ──────────────────────────────────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">

                    {/* Card title bar */}
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/60 dark:bg-gray-900/40">
                        <div className="flex items-center gap-3">
                            <FileSpreadsheet className="h-4 w-4 text-blue-700" />
                            <div>
                                <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">
                                    {workerList.length > 0 ? 'Worker Data Preview' : 'Upload Worker Excel'}
                                </h2>
                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                    {workerList.length > 0
                                        ? `${workerList.length} records loaded from ${uploadedFile?.name}`
                                        : 'Upload your Excel file to begin registration'}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleReset}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600"
                        >
                            <RotateCcw className="h-3.5 w-3.5" /> Reset
                        </button>
                    </div>

                    <div className="p-6 md:p-8 space-y-8">

                        {/* ── Section 1: Upload / Preview ───────────────────────── */}
                        {!workerList.length ? (
                            <div>
                                <SectionHeader
                                    icon={Upload}
                                    title="Upload Excel File"
                                    subtitle="Drag and drop or click to browse — supports .xlsx and .xls"
                                    gradient="from-blue-900 to-orange-500"
                                />

                                <div
                                    className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-150 ${
                                        isDragging
                                            ? 'border-blue-700 bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-gray-50/60 dark:hover:bg-gray-900/20'
                                    }`}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleFileChange} className="hidden" />
                                    <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center ${
                                        isDragging
                                            ? 'bg-gradient-to-br from-blue-900 to-orange-500 shadow-lg shadow-blue-900/30'
                                            : 'bg-gray-100 dark:bg-gray-700'
                                    }`}>
                                        <Upload className={`h-7 w-7 ${isDragging ? 'text-white' : 'text-gray-400'}`} />
                                    </div>
                                    <h3 className="text-base font-bold text-gray-700 dark:text-gray-200 mb-1">
                                        {isDragging ? 'Drop your Excel file here' : 'Upload Worker Excel File'}
                                    </h3>
                                    <p className="text-sm text-gray-400 dark:text-gray-500">
                                        Drag &amp; drop or click to browse
                                    </p>
                                </div>

                                {/* Column hint + Download template */}
                                <div className="mt-4 flex items-start gap-3 px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                                    <Info className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-3 mb-1">
                                            <p className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Expected Column Order</p>
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); downloadTemplate(); }}
                                                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-blue-900 to-orange-500 hover:from-blue-950 hover:to-orange-600 text-white shadow-sm transition-all"
                                            >
                                                <Download className="h-3.5 w-3.5" /> Download Template
                                            </button>
                                        </div>
                                        <p className="text-xs text-blue-600/80 dark:text-blue-400/80 leading-relaxed">
                                            S.No &bull; First Name &bull; Last Name &bull; Cost Center &bull; Labour Type &bull; Contractor Code &bull; Group &bull; Father Name &bull; DOB &bull; Joining Date &bull; Bank Name &bull; IFSC Code &bull; Bank Address &bull; Bank Account No &bull; Gender &bull; Mobile No &bull; Job Type &bull; Department &bull; Aadhar No &bull; Probation Days &bull; Is PF Exist &bull; Is ESI Exist &bull; UAN Number &bull; Report To Role &bull; ESI Number &bull; Designation
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Preview Table */
                            <div>
                                <SectionHeader
                                    icon={FileSpreadsheet}
                                    title="Worker Data Preview"
                                    subtitle="Review the records before validating"
                                    gradient="from-blue-900 to-orange-500"
                                />

                                <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                    <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-gray-900/40 border-b border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-3.5 w-3.5 text-gray-400" />
                                            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{uploadedFile?.name}</span>
                                            <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                {workerList.length} workers
                                            </span>
                                        </div>
                                        <button
                                            onClick={handleReset}
                                            className="flex items-center gap-1 text-xs font-semibold text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 transition-colors"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" /> Remove
                                        </button>
                                    </div>
                                    <div className="overflow-x-auto max-h-72">
                                        <table className="w-full text-xs">
                                            <thead className="sticky top-0 bg-gray-50 dark:bg-gray-900/40 border-b border-gray-200 dark:border-gray-700">
                                                <tr>
                                                    {PREVIEW_COLUMNS.map(col => (
                                                        <th key={col.key} className="px-3 py-2.5 text-left font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                                            {col.label}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                                {workerList.map((w, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                                        {PREVIEW_COLUMNS.map(col => (
                                                            <td key={col.key} className={`px-3 py-2 whitespace-nowrap ${
                                                                col.key === 'firstName'
                                                                    ? 'font-semibold text-gray-800 dark:text-gray-100'
                                                                    : 'text-gray-600 dark:text-gray-300'
                                                            }`}>
                                                                {w[col.key]}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── Section 2: Validation Result ──────────────────────── */}
                        {(validationResult || (validateError && !validationResult)) && (
                            <div>
                                <SectionHeader
                                    icon={CheckCircle}
                                    title="Validation Result"
                                    subtitle="Review any issues found in the uploaded data"
                                    gradient="from-blue-900 to-orange-500"
                                />
                                {validationResult
                                    ? <ValidationPanel validationResult={validationResult} />
                                    : (
                                        <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
                                            <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
                                            <p className="text-sm text-rose-600 dark:text-rose-400">{validateError}</p>
                                        </div>
                                    )
                                }
                            </div>
                        )}

                        {/* ── Save Error Panel (SP returned non-Submited status) ─────── */}
                        {saveResult && saveResult.ErrorStatus !== 'Submited' && (
                            <div>
                                <SectionHeader
                                    icon={AlertTriangle}
                                    title="Registration Error"
                                    subtitle="The server rejected the registration — review the details below"
                                    gradient="from-amber-500 to-orange-500"
                                />
                                <SaveErrorPanel saveResult={saveResult} />
                            </div>
                        )}

                        {/* ── Save Network / Exception Error (thunk rejected) ────────── */}
                        {saveError && !saveResult && (
                            <div className="flex items-start gap-3 px-5 py-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
                                <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold text-rose-700 dark:text-rose-400">Registration Request Failed</p>
                                    <p className="text-xs text-rose-600/80 dark:text-rose-500 mt-0.5">{saveError}</p>
                                </div>
                            </div>
                        )}

                        {/* ── Section 3: Remarks ─────────────────────────────────── */}
                        {workerList.length > 0 && (
                            <div>
                                <SectionHeader
                                    icon={FileText}
                                    title="Remarks"
                                    subtitle="Optional notes or reason for this bulk registration"
                                    gradient="from-blue-900 to-orange-500"
                                />
                                <div className="relative">
                                    <FileText className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
                                    <textarea
                                        value={note}
                                        onChange={e => dispatch(setNote(e.target.value))}
                                        placeholder="Enter any additional notes or remarks for this registration batch…"
                                        rows={4}
                                        className={`${inputCls} pl-10 resize-none`}
                                    />
                                </div>
                                <div className="flex justify-between mt-1">
                                    <span className="text-[10px] text-gray-400 dark:text-gray-500">Optional</span>
                                    <span className="text-[10px] text-gray-400 dark:text-gray-500">{note.length} chars</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Footer Actions ────────────────────────────────────────── */}
                    {workerList.length > 0 && (
                        <div className="px-6 md:px-8 py-5 border-t border-gray-100 dark:border-gray-700 bg-gray-50/40 dark:bg-gray-900/20 flex items-center justify-between gap-4">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border-2 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                            >
                                <RotateCcw className="h-4 w-4" /> Clear
                            </button>

                            <div className="flex items-center gap-3">
                                {!summary.isValidated && (
                                    <p className="text-xs text-gray-400 dark:text-gray-500 hidden sm:block">
                                        Validate data first to enable registration
                                    </p>
                                )}

                                {/* Validate */}
                                <button
                                    type="button"
                                    onClick={handleValidate}
                                    disabled={validateLoading}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {validateLoading
                                        ? <><Loader2 className="h-4 w-4 animate-spin" /> Validating…</>
                                        : <><CheckCircle className="h-4 w-4" /> Validate</>
                                    }
                                </button>

                                {/* Register */}
                                <button
                                    type="button"
                                    onClick={handleRegister}
                                    disabled={saveLoading || !summary.isValidated}
                                    className="flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-900 to-orange-500 hover:from-blue-950 hover:to-orange-600 text-white shadow-lg shadow-blue-900/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {saveLoading
                                        ? <><Loader2 className="h-4 w-4 animate-spin" /> Registering…</>
                                        : <><Send className="h-4 w-4" /> Register Workers</>
                                    }
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BulkWorkerRegistration;
