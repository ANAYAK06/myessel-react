import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    User, FileText,
    CheckCircle, Clock, Download, Eye,
    Building2, IdCard, Users, Briefcase, GraduationCap,
    Globe, Zap, Target, CreditCard, FileCheck,
    Phone, Shield, ClipboardCheck, XCircle
} from 'lucide-react';

// ✅ REUSABLE COMPONENT IMPORTS
import ActionButtons from '../../components/Inbox/ActionButtons';
import InboxHeader from '../../components/Inbox/InboxHeader';
import LeftPanel from '../../components/Inbox/LeftPanel';
import RightDetailPanel from '../../components/Inbox/RightDetailPanel';
import VerificationInput from '../../components/Inbox/VerificationInput';
import AttachmentModal from '../../components/Inbox/AttachmentModal';

// ✅ STAFF REGISTRATION VERIFY SLICE IMPORTS
import {
    fetchVerificationStaff,
    fetchStaffMainDataById,
    fetchEmployeeDocuments,
    approveStaffRegistration,
    setSelectedEmpRefNo,
    clearStaffDetail,
    clearAllResults,
    selectVerificationStaffListArray,
    selectStaffMainData,
    selectEmployeeDocumentsArray,
    selectVerificationStaffListLoading,
    selectStaffMainDataLoading,
    selectApproveLoading,
    selectEmployeeDocumentsLoading,
    selectVerificationStaffListError,
    selectEmployeeDocumentsError,
    resetAll,
} from '../../slices/HRSlice/staffRegistrationVerifySlice';

// ✅ APPROVAL SLICE IMPORTS
import {
    fetchStatusList,
    selectEnabledActions,
    selectHasActions,
    selectStatusListLoading,
    selectStatusListError,
    resetApprovalData,
    setShowReturnButton
} from '../../slices/CommonSlice/getStatusSlice';

const VerifyStaffRegistration = ({ notificationData, onNavigate }) => {
    const dispatch = useDispatch();

    // ✅ SELECTORS
    const verificationStaff      = useSelector(selectVerificationStaffListArray);
    const selectedStaffData       = useSelector(selectStaffMainData);
    const staffLoading            = useSelector(selectVerificationStaffListLoading);
    const staffDataLoading        = useSelector(selectStaffMainDataLoading);
    const approvalLoading         = useSelector(selectApproveLoading);
    const staffError              = useSelector(selectVerificationStaffListError);
    const employeeDocuments       = useSelector(selectEmployeeDocumentsArray);
    const documentsLoading        = useSelector(selectEmployeeDocumentsLoading);
    const documentsError          = useSelector(selectEmployeeDocumentsError);

    const statusLoading           = useSelector(selectStatusListLoading);
    const statusError             = useSelector(selectStatusListError);
    const enabledActions          = useSelector(selectEnabledActions);
    const hasActions              = useSelector(selectHasActions);

    const { userData } = useSelector((state) => state.auth);
    const roleId = userData?.roleId || userData?.RID;
    const uid    = userData?.UID || userData?.uid;

    // ✅ LOCAL STATE
    const [selectedStaff, setSelectedStaff]                 = useState(null);
    const [isVerified, setIsVerified]                       = useState(false);
    const [verificationComment, setVerificationComment]     = useState('');
    const [searchQuery, setSearchQuery]                     = useState('');
    const [filterDepartment, setFilterDepartment]           = useState('All');
    const [filterCategory, setFilterCategory]               = useState('All');
    const [isLeftPanelCollapsed, setIsLeftPanelCollapsed]   = useState(false);
    const [isLeftPanelHovered, setIsLeftPanelHovered]       = useState(false);
    const [showDocumentModal, setShowDocumentModal]         = useState(false);
    const [selectedDocument, setSelectedDocument]           = useState(null);

    const { InboxTitle, ModuleDisplayName } = notificationData || {};

    // ✅ HELPER FUNCTIONS
    const getFullName = (staff) => {
        if (!staff) return 'Unknown';
        const parts = [staff.FirstName, staff.MiddleName, staff.LastName].filter(Boolean);
        return parts.length > 0 ? parts.join(' ') : 'Unknown';
    };

    const getPriority = (staff) => {
        if (!staff) return 'Low';
        const category     = staff.Category?.toLowerCase() || '';
        const joiningDate  = staff.JoiningDate ? new Date(staff.JoiningDate) : new Date();
        const today        = new Date();
        const daysUntilJoining = Math.ceil((joiningDate - today) / (1000 * 60 * 60 * 24));

        if (category.includes('management') || daysUntilJoining <= 7)  return 'High';
        if (category.includes('contract')   || daysUntilJoining <= 15) return 'Medium';
        return 'Low';
    };

    const getCurrentUser = () => userData?.userName || userData?.UID || 'system';

    const getCurrentRoleName = () =>
        userData?.roleName || notificationData?.InboxTitle || 'Staff Registration Verifier';

    const formatApprovalComment = (roleName, userName, comment) =>
        `${roleName} : ${userName} : ${comment}`;

    const updateRemarksHistory = (existingRemarks, newRoleName, newUserName, newComment) => {
        const formattedNewComment = formatApprovalComment(newRoleName, newUserName, newComment);
        if (!existingRemarks || existingRemarks.trim() === '') return formattedNewComment;
        return `${existingRemarks.trim()}||${formattedNewComment}`;
    };

    const formatArrayForSP = (array) => {
        if (!array || !Array.isArray(array) || array.length === 0) return '';
        const filtered = array.filter(item => item !== null && item !== undefined && item.toString().trim() !== '');
        if (filtered.length === 0) return '';
        return filtered.join(',') + ',';
    };

    const ensureStr = (value, fallback = '') => {
        if (value === null || value === undefined) return fallback;
        return value.toString();
    };

    // ✅ INITIALIZE
    useEffect(() => {
        if (roleId) {
            console.log('🎯 Initializing Staff Registration Verification with RoleID:', roleId);
            dispatch(fetchVerificationStaff(roleId));
        }
    }, [roleId, dispatch]);

    useEffect(() => {
        dispatch(setShowReturnButton('No'));
        return () => {
            dispatch(resetAll());
            dispatch(resetApprovalData());
        };
    }, [dispatch]);

    // ✅ FETCH STATUS LIST
    useEffect(() => {
        if (selectedStaffData?.MOID && roleId) {
            console.log('📊 Fetching Status List for MOID:', selectedStaffData.MOID);
            dispatch(fetchStatusList({
                MOID:    selectedStaffData.MOID,
                ROID:    roleId,
                ChkAmt:  0
            }));
        }
    }, [selectedStaffData?.MOID, roleId, dispatch]);

    // ✅ COLLAPSE PANEL WHEN ITEM SELECTED
    useEffect(() => {
        if (selectedStaff) setIsLeftPanelCollapsed(true);
    }, [selectedStaff]);

    // ✅ EVENT HANDLERS
    const handleBackToInbox = () => {
        if (onNavigate) onNavigate('dashboard', { name: 'Dashboard', type: 'dashboard' });
    };

    const handleRefresh = () => {
        if (roleId) {
            console.log('🔄 Refreshing Staff Registration list');
            dispatch(fetchVerificationStaff(roleId));
            if (selectedStaff?.EmpRefNo) {
                dispatch(fetchStaffMainDataById({ empRefNo: selectedStaff.EmpRefNo, roleId }));
            }
        }
    };

    const handleItemSelect = (staff) => {
        console.log('✅ Selected Staff:', staff);
        setSelectedStaff(staff);
        dispatch(setSelectedEmpRefNo(staff.EmpRefNo));
        dispatch(fetchStaffMainDataById({ empRefNo: staff.EmpRefNo, roleId }));
        dispatch(fetchEmployeeDocuments(staff.EmpRefNo));
        setIsVerified(false);
        setVerificationComment('');
    };

    // ✅ BUILD APPROVAL PAYLOAD
    const buildApprovalPayload = (actionValue) => {
    const d           = selectedStaffData || {};
    const currentUser = getCurrentUser();

    // ── Password: OLD MVC only generates on Approve ───────────────────
    let encodedPwd = '';
    if (actionValue === 'Approve') {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let pass = '';
        for (let i = 0; i < 8; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
        encodedPwd = btoa(pass);
    }

    // ── Documents ─────────────────────────────────────────────────────
    // Server-fetched docs from GetEmployeeDocuments arrive with DocBinaryData (not PDFBaseData).
    // Normalize before filtering so they are included in the approval payload.
    const safeDocuments = (employeeDocuments || []).map(doc => ({
        ...doc,
        PDFBaseData: doc.PDFBaseData || doc.DocBinaryData || '',
    })).filter(doc =>
        (doc.PDFBaseData && doc.PDFBaseData.trim() !== '') ||
        (doc.Path        && doc.Path.trim()        !== '')
    );

    // ── Family Members ────────────────────────────────────────────────
    const validFm = (d.FamilyMemberData || []).filter(fm => fm.FMName?.trim());
    const FMName        = validFm.map(fm => fm.FMName).join(',')        + (validFm.length > 0 ? ',' : '');
    const FMDateofBirth = validFm.map(fm => fm.FMDateofBirth).join(',') + (validFm.length > 0 ? ',' : '');
    const FMAge         = validFm.map(fm => fm.FMAge).join(',')         + (validFm.length > 0 ? ',' : '');
    const FMGender      = validFm.map(fm => fm.FMGender).join(',')      + (validFm.length > 0 ? ',' : '');
    const FMRelation    = validFm.map(fm => fm.FMRelation).join(',')    + (validFm.length > 0 ? ',' : '');
    const FMMobileNo    = validFm.map(fm => fm.FMMobileNo).join(',')    + (validFm.length > 0 ? ',' : '');

    // ── Children ──────────────────────────────────────────────────────
    const validChild = (d.ChildrensData || []).filter(c => c.ChildName?.trim());
    const ChildName          = validChild.map(c => c.ChildName).join(',')          + (validChild.length > 0 ? ',' : '');
    const ChildDateofBirth   = validChild.map(c => c.ChildDateofBirth).join(',')   + (validChild.length > 0 ? ',' : '');
    const ChildAge           = validChild.map(c => c.ChildAge).join(',')           + (validChild.length > 0 ? ',' : '');
    const ChildGender        = validChild.map(c => c.ChildGender).join(',')        + (validChild.length > 0 ? ',' : '');
    const ChildMaritalStatus = validChild.map(c => c.ChildMaritalStatus).join(',') + (validChild.length > 0 ? ',' : '');

    // ── Academic Qualifications ───────────────────────────────────────
    const validAq = (d.AcademicQualificationData || []).filter(aq => aq.AcademicClass?.trim());
    const AcademicClass    = validAq.map(aq => aq.AcademicClass).join(',')    + (validAq.length > 0 ? ',' : '');
    const NameofUniversity = validAq.map(aq => aq.NameofUniversity).join(',') + (validAq.length > 0 ? ',' : '');
    const FromYear         = validAq.map(aq => aq.FromYear).join(',')         + (validAq.length > 0 ? ',' : '');
    const ToYear           = validAq.map(aq => aq.ToYear).join(',')           + (validAq.length > 0 ? ',' : '');
    const Percentage       = validAq.map(aq => aq.Percentage).join(',')       + (validAq.length > 0 ? ',' : '');

    // ── Technical Skills ──────────────────────────────────────────────
    // FIX: fallback to InstitutionName (old MVC field name)
    const validTech = (d.TechnicalData || []).filter(t => t.TechnicalSkill?.trim());
    const TechnicalSkill      = validTech.map(t => t.TechnicalSkill).join(',')                                 + (validTech.length > 0 ? ',' : '');
    const TechInstitutionName = validTech.map(t => t.TechInstitutionName || t.InstitutionName || '').join(',') + (validTech.length > 0 ? ',' : '');
    const TechFromYear        = validTech.map(t => t.TechFromYear || t.FromYear || '').join(',')               + (validTech.length > 0 ? ',' : '');
    const TechToYear          = validTech.map(t => t.TechToYear   || t.ToYear   || '').join(',')               + (validTech.length > 0 ? ',' : '');
    const TechPercentage      = validTech.map(t => t.TechPercentage || t.Percentage || '').join(',')           + (validTech.length > 0 ? ',' : '');

    // ── Work Experience ───────────────────────────────────────────────
    // FIX: use ' ' (space) as placeholder — NEVER '' — so SQL CHARINDEX finds ','
    //      All 5 companion arrays MUST have identical token count as OrganisationName
    const validExp = (d.ExperienceData || []).filter(e => e.OrganisationName?.trim());
    const OrganisationName = validExp.map(e => e.OrganisationName).join(',')                                          + (validExp.length > 0 ? ',' : '');
    const ExpFromYear      = validExp.map(e => e.ExpFromYear  || e.FromYear  || ' ').join(',')                        + (validExp.length > 0 ? ',' : '');
    const ExpToYear        = validExp.map(e => e.ExpToYear    || e.ToYear    || ' ').join(',')                        + (validExp.length > 0 ? ',' : '');
    const Role             = validExp.map(e => e.Role         || ' ').join(',')                                       + (validExp.length > 0 ? ',' : '');
    const Mobilenos        = validExp.map(e => e.HistoryReferenceNo || e.Mobilenos || e.RefNo || ' ').join(',')       + (validExp.length > 0 ? ',' : '');
    const ExpContactNames  = validExp.map(e => e.ExpContactNames || e.HistoryContactName || e.ContactName || ' ').join(',') + (validExp.length > 0 ? ',' : '');
    const ExpRemarks       = validExp.map(e => e.ExpRemarks || e.HistoryRefRemark || e.Remarks || ' ').join(',')      + (validExp.length > 0 ? ',' : '');

    // ── References ────────────────────────────────────────────────────
    // FIX: fallback RefRelation → Relation (old MVC field name)
    // FIX: RefRemarks uses 'null' string placeholder (not empty) — matches old MVC
    const validRef = (d.EmpReferenceData || []).filter(r => r.RefName?.trim());
    const RefName     = validRef.map(r => r.RefName).join(',')                                     + (validRef.length > 0 ? ',' : '');
    const RefRelation = validRef.map(r => r.RefRelation || r.Relation || '').join(',')             + (validRef.length > 0 ? ',' : '');
    const RefMobileNo = validRef.map(r => r.RefMobileNo).join(',')                                 + (validRef.length > 0 ? ',' : '');
    const RefRemarks  = validRef.map(r => r.RefRemarks || r.FresherRefRemark || 'null').join(',')  + (validRef.length > 0 ? ',' : '');

    // ── Contract dates ────────────────────────────────────────────────
    // FIX: Old MVC NEVER sends empty string — non-contract staff gets JoiningDate
    //      Empty string causes SQL SUBSTRING crash
    const isContractCategory = d.Category === 'Contract Management Staff';
    const ContractStartDate  = isContractCategory && d.ContractStartDate
                                ? ensureStr(d.ContractStartDate)
                                : ensureStr(d.JoiningDate);
    const ContractEndDate    = isContractCategory && d.ContractEndDate
                                ? ensureStr(d.ContractEndDate)
                                : ensureStr(d.JoiningDate);

    const payload = {
        // ── Core ──────────────────────────────────────────────────────
        empRefNo:     ensureStr(selectedStaff?.EmpRefNo),
        roleId:       parseInt(roleId) || 0,   // auth role — stays number
        createdBy:    currentUser,
        action:       actionValue,
        approvalNote: verificationComment.trim(),
        userName:     d.UserName && d.UserName.trim() !== ''
                        ? d.UserName.trim()
                        : ensureStr(selectedStaff?.EmpRefNo).toLowerCase(),
        pwd: encodedPwd,   // ✅ FIX: '' when not Approve, btoa(pass) when Approve

        // ── Joining / Category ────────────────────────────────────────
        joiningType:     ensureStr(d.JoiningType, 'New Join'),
        category:        ensureStr(d.Category, 'Staff'),
        appointmentType: ensureStr(d.Appointmenttype, 'Normal'),

        // ── Personal ──────────────────────────────────────────────────
        firstName:      ensureStr(d.FirstName),
        lastName:       ensureStr(d.LastName),
        middleName:     ensureStr(d.MiddleName),
        dob:            ensureStr(d.DateofBirth),
        empAge:         ensureStr(d.EmpAge, '0'),
        gender:         ensureStr(d.Gender, 'Male'),
        martialStatus:  ensureStr(d.MartialStatus, 'Single'),
        dateofMarriage: ensureStr(d.DateofMarriage),
        adharNo:        ensureStr(d.AdharNo),
        panNo:          ensureStr(d.PanNo),
        placeofBirth:   ensureStr(d.PlaceofBirth),

        // ── Nominee ───────────────────────────────────────────────────
        nomineeName:        ensureStr(d.NomineeName),
        nomineeRelation:    ensureStr(d.NomineeRelation),
        nomineeDateofBirth: ensureStr(d.NomineeDateofBirth),
        nomineeAge:         ensureStr(d.NomineeAge, '0'),

        // ── Contact ───────────────────────────────────────────────────
        contactWorkPhone: ensureStr(d.ContactWorkPhone),
        contactMobile:    ensureStr(d.ContactMobile),
        workEmail:        ensureStr(d.WorkEmail || d.MailId),
        permanentAddress: ensureStr(d.PermanentAddress),
        presentAddress:   ensureStr(d.PresentAddress),

        // ── Family Members ────────────────────────────────────────────
        fmName:        FMName,
        fmDateofBirth: FMDateofBirth,
        fmAge:         FMAge,
        fmGender:      FMGender,
        fmRelation:    FMRelation,
        fmMobileNo:    FMMobileNo,

        // ── Children ──────────────────────────────────────────────────
        childName:          ChildName,
        childDateofBirth:   ChildDateofBirth,
        childAge:           ChildAge,
        childGender:        ChildGender,
        childMaritalStatus: ChildMaritalStatus,

        // ── Academic ──────────────────────────────────────────────────
        academicClass:    AcademicClass,
        nameofUniversity: NameofUniversity,
        fromYear:         FromYear,
        toYear:           ToYear,
        percentage:       Percentage,

        // ── Technical Skills ──────────────────────────────────────────
        technicalSkill:      TechnicalSkill,
        techInstitutionName: TechInstitutionName,
        techFromYear:        TechFromYear,
        techToYear:          TechToYear,
        techPercentage:      TechPercentage,

        // ── Work Experience ───────────────────────────────────────────
        experience:       ensureStr(d.Experience, 'Fresher'),
        organisationName: OrganisationName,
        expFromYear:      ExpFromYear,
        expToYear:        ExpToYear,
        role:             Role,
        mobilenos:        Mobilenos,
        expContactNames:  ExpContactNames,
        expRemarks:       ExpRemarks,

        // ── References ────────────────────────────────────────────────
        refName:     RefName,
        refRelation: RefRelation,
        refMobileNo: RefMobileNo,
        refRemarks:  RefRemarks,

        // ── Employment ────────────────────────────────────────────────
        // ✅ FIX: All IDs as STRINGS — old MVC dropdown .val() always returns string
        designationId:     ensureStr(d.DesignationId, '0'),
        joiningDate:       ensureStr(d.JoiningDate),
        jobType:           ensureStr(d.JobType, 'Permanent'),
        joiningCostCenter: ensureStr(d.JoiningCostCenter),
        transitDay:        ensureStr(d.TransitDay, '0'),       // ✅ STRING
        reportTo:          d.ReportTo && d.ReportTo.trim() !== ''
                            ? d.ReportTo.trim()
                            : ensureStr(selectedStaff?.EmpRefNo),
        departmentId:      ensureStr(d.DepartmentId, '0'),     // ✅ STRING
        reportToRoleId:    ensureStr(d.ReportToRoleId, '0'),   // ✅ STRING
        groupId:           ensureStr(d.GroupId, '0'),          // ✅ STRING
        probationdays:     ensureStr(d.Probationdays, '0'),    // ✅ STRING

        // ── Contract dates ────────────────────────────────────────────
        // ✅ FIX: NEVER empty — falls back to JoiningDate for non-contract staff
        contractStartDate: ContractStartDate,
        contractEndDate:   ContractEndDate,

        // ── Bank ──────────────────────────────────────────────────────
        bankName:      ensureStr(d.BankName),
        bankAccountNo: ensureStr(d.BankAccountNo),
        ifscCode:      ensureStr(d.IFSCcode),
        bankAddress:   ensureStr(d.BankAddress),

        // ── PF / ESI / UAN ────────────────────────────────────────────
        pfExist:   ensureStr(d.PFExist,  'No'),
        esiExist:  ensureStr(d.ESIExist, 'No'),
        uanExist:  d.UANExist === true || d.UANExist === 'true' || d.UANExist === 'True',
        uanNumber: ensureStr(d.UANNumber),
        esiNumber: ensureStr(d.ESINumber),

        // ── Compliance ────────────────────────────────────────────────
        policeVerification:          ensureStr(d.PoliceVerification),
        undertakingNoPoliceCaseAck:  ensureStr(d.UndertakingNoPoliceCaseAck),
        undertakingAuthenticDocsAck: ensureStr(d.UndertakingAuthenticDocsAck),
        undertakingMedicallyFitAck:  ensureStr(d.UndertakingMedicallyFitAck),

        // ── Documents ─────────────────────────────────────────────────
        documents: safeDocuments,
    };

    console.log('📤 Staff Approval Payload:', {
        empRefNo:          payload.empRefNo,
        action:            payload.action,
        roleId:            payload.roleId,
        designationId:     payload.designationId,     // ✅ should be "8" string
        departmentId:      payload.departmentId,      // ✅ should be "14" string
        groupId:           payload.groupId,           // ✅ should be "13" string
        reportToRoleId:    payload.reportToRoleId,    // ✅ should be "142" string
        transitDay:        payload.transitDay,        // ✅ should be "0" string
        probationdays:     payload.probationdays,     // ✅ should be "0" string
        contractStartDate: payload.contractStartDate, // ✅ should be JoiningDate when not Contract
        contractEndDate:   payload.contractEndDate,   // ✅ should be JoiningDate when not Contract
        pwd:               payload.pwd ? '[generated]' : '[empty - non-Approve]',
        fmCount:           validFm.length,
        expCount:          validExp.length,
        refCount:          validRef.length,
        docCount:          payload.documents.length,
    });

    return payload;
};

    const handleActionClick = async (action) => {
        if (!selectedStaff) {
            toast.error('No staff registration selected');
            return;
        }
        if (!verificationComment || verificationComment.trim() === '') {
            toast.error('Verification comment is mandatory. Please add your comments before proceeding.');
            return;
        }
        if (!isVerified) {
            toast.error('Please verify the staff registration details by checking the verification checkbox.');
            return;
        }

        let actionValue = action.value || action.text || action.type;
        if (!actionValue || actionValue.trim() === '') {
            const typeToValueMap = { approve: 'Approve', verify: 'Verify', reject: 'Reject' };
            actionValue = typeToValueMap[action.type?.toLowerCase()] || 'Verify';
        }

        try {
            const payload = buildApprovalPayload(actionValue);
            const result  = await dispatch(approveStaffRegistration(payload)).unwrap();

            if (result && typeof result === 'string') {
                if (result.includes('$')) {
                    const [, additionalInfo] = result.split('$');
                    toast.success(`${action.text || actionValue} completed successfully!`);
                    if (additionalInfo) setTimeout(() => toast.info(additionalInfo, { autoClose: 6000 }), 500);
                } else {
                    toast.success(result || `${action.text || actionValue} completed successfully!`);
                }
            } else {
                toast.success(`${action.text || actionValue} completed successfully!`);
            }

            setTimeout(() => {
                dispatch(fetchVerificationStaff(roleId));
                setSelectedStaff(null);
                setVerificationComment('');
                setIsVerified(false);
                setIsLeftPanelCollapsed(false);
                dispatch(clearStaffDetail());
                dispatch(clearAllResults());
                dispatch(resetApprovalData());
            }, 1000);

        } catch (error) {
            console.error('❌ Approval Error:', error);
            let errorMessage = `Failed to ${action.text?.toLowerCase() || actionValue.toLowerCase()}`;
            if (error && typeof error === 'string')           errorMessage = error;
            else if (error?.message)                          errorMessage = error.message;
            else if (error?.response?.data?.message)          errorMessage = error.response.data.message;
            toast.error(errorMessage, { autoClose: 10000 });
        }
    };

    // ✅ FILTER DATA
    const filteredStaff = verificationStaff.filter(staff => {
        const fullName = getFullName(staff).toLowerCase();
        const matchesSearch =
            fullName.includes(searchQuery.toLowerCase()) ||
            staff.EmpRefNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            staff.Department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            staff.DesignatedAs?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDepartment = filterDepartment === 'All' || staff.Department === filterDepartment;
        const matchesCategory   = filterCategory   === 'All' || staff.Category   === filterCategory;
        return matchesSearch && matchesDepartment && matchesCategory;
    });

    const departments = [...new Set(verificationStaff.map(s => s.Department).filter(Boolean))];
    const categories  = [...new Set(verificationStaff.map(s => s.Category).filter(Boolean))];

    // ✅ RENDER LEFT PANEL ITEM
    const renderItemCard = (staff, isSelected) => {
        const priority = getPriority(staff);
        const priorityColors = {
            'High':   'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200',
            'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200',
            'Low':    'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200'
        };
        return (
            <div className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-800/50 dark:to-purple-800/50 flex items-center justify-center">
                            <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{getFullName(staff)}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{staff.DesignatedAs}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full border ${priorityColors[priority]}`}>{priority}</span>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-1">
                            <Building2 className="w-3 h-3" />
                            <span className="truncate">{staff.Department}</span>
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-indigo-600 dark:text-indigo-400 font-medium">{staff.Category}</span>
                        <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded text-xs">{staff.EmpRefNo}</span>
                    </div>
                </div>
            </div>
        );
    };

    const renderCollapsedItem = (staff, isSelected) => (
        <div className="w-full h-full rounded-lg border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-800/50 dark:to-purple-800/50 flex items-center justify-center">
            <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        </div>
    );

    // ✅ DOCUMENT HELPERS
    const getDocumentUrl = (document) => {
        if (!document) return null;
        const base64Data = document.PDFBaseData || document.DocBinaryData;
        if (!base64Data) return null;
        if (base64Data.startsWith('http')) return base64Data;
        try {
            const byteCharacters = atob(base64Data);
            const byteNumbers    = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
            const byteArray = new Uint8Array(byteNumbers);
            let mimeType = 'application/octet-stream';
            if (document.FileType) {
                const ft = document.FileType.toUpperCase();
                if (ft === 'PDF') mimeType = 'application/pdf';
                else if (['IMAGE', 'JPG', 'JPEG'].includes(ft)) mimeType = 'image/jpeg';
                else if (ft === 'PNG') mimeType = 'image/png';
            }
            return URL.createObjectURL(new Blob([byteArray], { type: mimeType }));
        } catch (error) {
            console.error('Error creating document URL:', error);
            return null;
        }
    };

    const handleDocumentView = (document) => {
        const base64Data = document.PDFBaseData || document.DocBinaryData;
        if (!base64Data) { toast.error('Document data not available'); return; }
        setSelectedDocument(document);
        setShowDocumentModal(true);
    };

    const openDocumentInBrowser = (document) => {
        const base64Data = document.PDFBaseData || document.DocBinaryData;
        if (!base64Data) { toast.error('Document data not available'); return; }
        try {
            if (base64Data.startsWith('http')) {
                window.open(base64Data, '_blank');
                toast.success('Document opened in new tab');
                return;
            }
            const byteArray = new Uint8Array([...atob(base64Data)].map(c => c.charCodeAt(0)));
            let mimeType = 'application/pdf';
            if (document.FileType) {
                const ft = document.FileType.toUpperCase();
                if (['IMAGE', 'JPG', 'JPEG'].includes(ft)) mimeType = 'image/jpeg';
                else if (ft === 'PNG') mimeType = 'image/png';
            }
            const url = URL.createObjectURL(new Blob([byteArray], { type: mimeType }));
            window.open(url, '_blank');
            toast.success('Document opened in new tab');
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (error) {
            console.error('Error opening document:', error);
            toast.error('Error opening document. The file may be corrupted.');
        }
    };

    const handleDocumentDownload = (document) => {
        const base64Data = document.PDFBaseData || document.DocBinaryData;
        if (!base64Data) { toast.error('Document data not available'); return; }
        try {
            const fileName = `${document.DocName}.${document.FileType?.toLowerCase() || 'pdf'}`;
            if (base64Data.startsWith('http')) {
                const link = window.document.createElement('a');
                link.href = base64Data;
                link.download = fileName;
                link.target = '_blank';
                window.document.body.appendChild(link);
                link.click();
                window.document.body.removeChild(link);
                toast.success(`Document "${fileName}" download started`);
                return;
            }
            const byteArray = new Uint8Array([...atob(base64Data)].map(c => c.charCodeAt(0)));
            let mimeType = 'application/pdf';
            if (document.FileType) {
                const ft = document.FileType.toUpperCase();
                if (['IMAGE', 'JPG', 'JPEG'].includes(ft)) mimeType = 'image/jpeg';
                else if (ft === 'PNG') mimeType = 'image/png';
            }
            const url  = URL.createObjectURL(new Blob([byteArray], { type: mimeType }));
            const link = window.document.createElement('a');
            link.href = url;
            link.download = fileName;
            window.document.body.appendChild(link);
            link.click();
            window.document.body.removeChild(link);
            URL.revokeObjectURL(url);
            toast.success(`Document "${fileName}" downloaded successfully`);
        } catch (error) {
            console.error('Error downloading document:', error);
            toast.error('Error downloading document. The file may be corrupted.');
        }
    };

    // ✅ RENDER DETAIL CONTENT
    const renderDetailContent = (isPopup = false) => {
        if (!selectedStaff) return null;

        return (
            <div className="space-y-6">
                {staffDataLoading && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                        <div className="flex items-center space-x-3">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                            <span className="text-blue-700 dark:text-blue-400 text-sm">Loading staff registration details...</span>
                        </div>
                    </div>
                )}

                {selectedStaffData && (
                    <>
                        {/* HEADER */}
                        <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-indigo-900/20 p-6 rounded-2xl border-2 border-indigo-200 dark:border-indigo-700">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-4">
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                                            <User className="w-8 h-8 text-white" />
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                                            <CheckCircle className="w-4 h-4 text-white" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{getFullName(selectedStaff)}</h2>
                                        <p className="text-indigo-600 dark:text-indigo-400 font-semibold mb-3">
                                            {selectedStaffData.DesignatedAs} • {selectedStaffData.Department}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                                                {selectedStaffData.EmpRefNo}
                                            </span>
                                            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                                                {selectedStaffData.Category}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                                                getPriority(selectedStaff) === 'High'   ? 'bg-red-100 text-red-800 border-red-200' :
                                                getPriority(selectedStaff) === 'Medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                                'bg-green-100 text-green-800 border-green-200'
                                            }`}>
                                                {getPriority(selectedStaff)} Priority
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-indigo-200 dark:border-indigo-700">
                                {[
                                    { label: 'MOID',         value: selectedStaffData.MOID },
                                    { label: 'Joining Date', value: selectedStaffData.JoiningDate },
                                    { label: 'Job Type',     value: selectedStaffData.JobType },
                                    { label: 'Experience',   value: selectedStaffData.Experience }
                                ].map(({ label, value }) => (
                                    <div key={label} className="bg-white dark:bg-gray-800 rounded-lg p-3">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* INFO GRID */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            {/* Personal Information */}
                            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 p-5 rounded-xl border border-indigo-200 dark:border-indigo-700">
                                <h4 className="font-semibold text-indigo-800 dark:text-indigo-300 mb-4 flex items-center">
                                    <User className="w-5 h-5 mr-2" /> Personal Information
                                </h4>
                                <div className="space-y-3 text-sm">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-indigo-600 dark:text-indigo-400 block text-xs">Full Name</span>
                                            <span className="font-medium text-gray-800 dark:text-gray-200">
                                                {[selectedStaffData.FirstName, selectedStaffData.MiddleName, selectedStaffData.LastName].filter(Boolean).join(' ')}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-indigo-600 dark:text-indigo-400 block text-xs">Age</span>
                                            <span className="font-medium text-gray-800 dark:text-gray-200">{selectedStaffData.EmpAge} years</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-indigo-600 dark:text-indigo-400 block text-xs">Date of Birth</span>
                                            <span className="font-medium text-gray-800 dark:text-gray-200">{selectedStaffData.DateofBirth}</span>
                                        </div>
                                        <div>
                                            <span className="text-indigo-600 dark:text-indigo-400 block text-xs">Gender</span>
                                            <span className="font-medium text-gray-800 dark:text-gray-200">{selectedStaffData.Gender}</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-indigo-600 dark:text-indigo-400 block text-xs">Marital Status</span>
                                            <span className="font-medium text-gray-800 dark:text-gray-200">{selectedStaffData.MartialStatus}</span>
                                        </div>
                                        {selectedStaffData.MartialStatus !== 'Single' && selectedStaffData.DateofMarriage && !selectedStaffData.DateofMarriage.includes('1900') && (
                                            <div>
                                                <span className="text-indigo-600 dark:text-indigo-400 block text-xs">Marriage Date</span>
                                                <span className="font-medium text-gray-800 dark:text-gray-200">{selectedStaffData.DateofMarriage}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-indigo-600 dark:text-indigo-400 block text-xs">Place of Birth</span>
                                            <span className="font-medium text-gray-800 dark:text-gray-200">{selectedStaffData.PlaceofBirth}</span>
                                        </div>
                                        <div>
                                            <span className="text-indigo-600 dark:text-indigo-400 block text-xs">Mobile</span>
                                            <span className="font-medium text-gray-800 dark:text-gray-200">{selectedStaffData.ContactMobile}</span>
                                        </div>
                                    </div>
                                    {selectedStaffData.ContactWorkPhone && (
                                        <div>
                                            <span className="text-indigo-600 dark:text-indigo-400 block text-xs">Work Phone</span>
                                            <span className="font-medium text-gray-800 dark:text-gray-200">{selectedStaffData.ContactWorkPhone}</span>
                                        </div>
                                    )}
                                    {selectedStaffData.WorkEmail && (
                                        <div>
                                            <span className="text-indigo-600 dark:text-indigo-400 block text-xs">Email</span>
                                            <span className="font-medium text-gray-800 dark:text-gray-200">{selectedStaffData.WorkEmail}</span>
                                        </div>
                                    )}
                                    {selectedStaffData.PermanentAddress && (
                                        <div>
                                            <span className="text-indigo-600 dark:text-indigo-400 block text-xs mb-1">Permanent Address</span>
                                            <p className="font-medium text-gray-800 dark:text-gray-200 text-sm bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded">{selectedStaffData.PermanentAddress}</p>
                                        </div>
                                    )}
                                    {selectedStaffData.PresentAddress && (
                                        <div>
                                            <span className="text-indigo-600 dark:text-indigo-400 block text-xs mb-1">Present Address</span>
                                            <p className="font-medium text-gray-800 dark:text-gray-200 text-sm bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded">{selectedStaffData.PresentAddress}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Government IDs */}
                            <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-5 rounded-xl border border-red-200 dark:border-red-700">
                                <h4 className="font-semibold text-red-800 dark:text-red-300 mb-4 flex items-center">
                                    <IdCard className="w-5 h-5 mr-2" /> Government IDs & Documents
                                </h4>
                                <div className="space-y-3 text-sm">
                                    {[
                                        { label: 'Aadhar Number', value: selectedStaffData.AdharNo },
                                        { label: 'PAN Number',    value: selectedStaffData.PanNo },
                                        { label: 'PF Number',     value: selectedStaffData.PFNumber },
                                        { label: 'ESI Number',    value: selectedStaffData.ESINumber },
                                        { label: 'UAN Number',    value: selectedStaffData.UANNumber }
                                    ].filter(({ value }) => value).map(({ label, value }) => (
                                        <div key={label} className="flex items-center justify-between">
                                            <span className="text-red-600 dark:text-red-400">{label}</span>
                                            <span className="font-medium text-gray-800 dark:text-gray-200 font-mono">{value}</span>
                                        </div>
                                    ))}
                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded">
                                            <span className="text-red-600 dark:text-red-400 text-xs block">PF Status</span>
                                            <span className={`font-medium text-sm ${selectedStaffData.PFExist === 'Yes' ? 'text-green-600' : 'text-red-600'}`}>
                                                {selectedStaffData.PFExist === 'Yes' ? '✓ Eligible' : '✗ Not Eligible'}
                                            </span>
                                        </div>
                                        <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded">
                                            <span className="text-red-600 dark:text-red-400 text-xs block">ESI Status</span>
                                            <span className={`font-medium text-sm ${selectedStaffData.ESIExist === 'Yes' ? 'text-green-600' : 'text-red-600'}`}>
                                                {selectedStaffData.ESIExist === 'Yes' ? '✓ Eligible' : '✗ Not Eligible'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Employment Details */}
                            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-5 rounded-xl border border-green-200 dark:border-green-700">
                                <h4 className="font-semibold text-green-800 dark:text-green-300 mb-4 flex items-center">
                                    <Briefcase className="w-5 h-5 mr-2" /> Employment Details
                                </h4>
                                <div className="space-y-3 text-sm">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-green-600 dark:text-green-400 block text-xs">Joining Type</span>
                                            <span className="font-medium text-gray-800 dark:text-gray-200">{selectedStaffData.JoiningType}</span>
                                        </div>
                                        <div>
                                            <span className="text-green-600 dark:text-green-400 block text-xs">Appointment Type</span>
                                            <span className="font-medium text-gray-800 dark:text-gray-200">{selectedStaffData.Appointmenttype}</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-green-600 dark:text-green-400 block text-xs">Joining Date</span>
                                            <span className="font-medium text-gray-800 dark:text-gray-200">{selectedStaffData.JoiningDate}</span>
                                        </div>
                                        <div>
                                            <span className="text-green-600 dark:text-green-400 block text-xs">Job Type</span>
                                            <span className="font-medium text-gray-800 dark:text-gray-200">{selectedStaffData.JobType}</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-green-600 dark:text-green-400 block text-xs">Experience</span>
                                            <span className="font-medium text-gray-800 dark:text-gray-200">{selectedStaffData.Experience}</span>
                                        </div>
                                        <div>
                                            <span className="text-green-600 dark:text-green-400 block text-xs">Transit Days</span>
                                            <span className="font-medium text-gray-800 dark:text-gray-200">{selectedStaffData.TransitDay || 0}</span>
                                        </div>
                                    </div>
                                    {selectedStaffData.JoiningCCName && (
                                        <div>
                                            <span className="text-green-600 dark:text-green-400 block text-xs">Cost Center</span>
                                            <span className="font-medium text-gray-800 dark:text-gray-200">{selectedStaffData.JoiningCCName}</span>
                                        </div>
                                    )}
                                    {selectedStaffData.GroupName && (
                                        <div>
                                            <span className="text-green-600 dark:text-green-400 block text-xs">Group</span>
                                            <span className="font-medium text-gray-800 dark:text-gray-200">{selectedStaffData.GroupName}</span>
                                        </div>
                                    )}
                                    {selectedStaffData.ReportToName && (
                                        <div>
                                            <span className="text-green-600 dark:text-green-400 block text-xs">Reports To</span>
                                            <span className="font-medium text-gray-800 dark:text-gray-200">{selectedStaffData.ReportToName}</span>
                                        </div>
                                    )}
                                    {selectedStaffData.ReportToRole && (
                                        <div>
                                            <span className="text-green-600 dark:text-green-400 block text-xs">Reporting Role</span>
                                            <span className="font-medium text-gray-800 dark:text-gray-200">{selectedStaffData.ReportToRole}</span>
                                        </div>
                                    )}
                                    {selectedStaffData.Category === 'Contract Management Staff' && (selectedStaffData.ContractStartDate || selectedStaffData.ContractEndDate) && (
                                        <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded">
                                            <span className="text-green-600 dark:text-green-400 text-xs block">Contract Period</span>
                                            <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                                                {selectedStaffData.ContractStartDate} to {selectedStaffData.ContractEndDate}
                                            </p>
                                        </div>
                                    )}
                                    {selectedStaffData.Probationdays > 0 && (
                                        <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded">
                                            <span className="text-green-600 dark:text-green-400 text-xs block">Probation Period</span>
                                            <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">{selectedStaffData.Probationdays} days</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Bank Details */}
                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-5 rounded-xl border border-purple-200 dark:border-purple-700">
                                <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-4 flex items-center">
                                    <CreditCard className="w-5 h-5 mr-2" /> Bank Details
                                </h4>
                                <div className="space-y-3 text-sm">
                                    {selectedStaffData.BankAccountNo && (
                                        <div>
                                            <span className="text-purple-600 dark:text-purple-400 block text-xs">Account Number</span>
                                            <span className="font-medium text-gray-800 dark:text-gray-200 font-mono">{selectedStaffData.BankAccountNo}</span>
                                        </div>
                                    )}
                                    {selectedStaffData.BankName && (
                                        <div>
                                            <span className="text-purple-600 dark:text-purple-400 block text-xs">Bank Name</span>
                                            <span className="font-medium text-gray-800 dark:text-gray-200">{selectedStaffData.BankName}</span>
                                        </div>
                                    )}
                                    {selectedStaffData.IFSCcode && (
                                        <div>
                                            <span className="text-purple-600 dark:text-purple-400 block text-xs">IFSC Code</span>
                                            <span className="font-medium text-gray-800 dark:text-gray-200 font-mono">{selectedStaffData.IFSCcode}</span>
                                        </div>
                                    )}
                                    {selectedStaffData.BankAddress && (
                                        <div>
                                            <span className="text-purple-600 dark:text-purple-400 block text-xs mb-1">Bank Address</span>
                                            <p className="font-medium text-gray-800 dark:text-gray-200 text-sm bg-purple-100 dark:bg-purple-900/30 p-2 rounded">{selectedStaffData.BankAddress}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Nominee */}
                        {(selectedStaffData.NomineeName || selectedStaffData.NomineeRelation) && (
                            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-5 rounded-xl border border-yellow-200 dark:border-yellow-700">
                                <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-4 flex items-center">
                                    <Users className="w-5 h-5 mr-2" /> Nominee Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    {[
                                        { label: 'Nominee Name',  value: selectedStaffData.NomineeName },
                                        { label: 'Relation',      value: selectedStaffData.NomineeRelation },
                                        { label: 'Date of Birth', value: selectedStaffData.NomineeDateofBirth },
                                        { label: 'Age',           value: selectedStaffData.NomineeAge ? `${selectedStaffData.NomineeAge} years` : null }
                                    ].filter(({ value }) => value).map(({ label, value }) => (
                                        <div key={label}>
                                            <span className="text-yellow-600 dark:text-yellow-400 block text-xs">{label}</span>
                                            <span className="font-medium text-gray-800 dark:text-gray-200">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Family Members */}
                        {selectedStaffData.FamilyMemberData?.length > 0 && (
                            <div className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 p-5 rounded-xl border border-teal-200 dark:border-teal-700">
                                <h4 className="font-semibold text-teal-800 dark:text-teal-300 mb-4 flex items-center">
                                    <Users className="w-5 h-5 mr-2" /> Family Members ({selectedStaffData.FamilyMemberData.length})
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {selectedStaffData.FamilyMemberData.map((member, index) => (
                                        <div key={index} className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-teal-200 dark:border-teal-600">
                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium text-gray-900 dark:text-white">{member.FMName}</span>
                                                    <span className="text-xs bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 px-2 py-1 rounded-full">{member.FMRelation}</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                                                    <span>DOB: {member.FMDateofBirth}</span>
                                                    <span>Age: {member.FMAge} years</span>
                                                    <span>Gender: {member.FMGender}</span>
                                                    {member.FMMobileNo && <span>Mobile: {member.FMMobileNo}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Academic Qualifications */}
                        {selectedStaffData.AcademicQualificationData?.length > 0 && (
                            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 p-5 rounded-xl border border-indigo-200 dark:border-indigo-700">
                                <h4 className="font-semibold text-indigo-800 dark:text-indigo-300 mb-4 flex items-center">
                                    <GraduationCap className="w-5 h-5 mr-2" /> Academic Qualifications ({selectedStaffData.AcademicQualificationData.length})
                                </h4>
                                <div className="space-y-3">
                                    {selectedStaffData.AcademicQualificationData.map((aq, index) => (
                                        <div key={index} className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-indigo-200 dark:border-indigo-600">
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                                                <div><span className="text-indigo-600 dark:text-indigo-400 block text-xs">Qualification</span><span className="font-medium text-gray-900 dark:text-white">{aq.AcademicClass}</span></div>
                                                <div><span className="text-indigo-600 dark:text-indigo-400 block text-xs">University/Board</span><span className="font-medium text-gray-800 dark:text-gray-200">{aq.NameofUniversity}</span></div>
                                                <div><span className="text-indigo-600 dark:text-indigo-400 block text-xs">Duration</span><span className="font-medium text-gray-800 dark:text-gray-200">{aq.FromYear} - {aq.ToYear}</span></div>
                                                <div><span className="text-indigo-600 dark:text-indigo-400 block text-xs">Percentage</span><span className="font-medium text-green-600 dark:text-green-400">{aq.Percentage}</span></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Technical Skills */}
                        {selectedStaffData.TechnicalData?.length > 0 && (
                            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-5 rounded-xl border border-orange-200 dark:border-orange-700">
                                <h4 className="font-semibold text-orange-800 dark:text-orange-300 mb-4 flex items-center">
                                    <Zap className="w-5 h-5 mr-2" /> Technical Skills ({selectedStaffData.TechnicalData.length})
                                </h4>
                                <div className="space-y-3">
                                    {selectedStaffData.TechnicalData.map((tech, index) => (
                                        <div key={index} className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-orange-200 dark:border-orange-600">
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                                                <div><span className="text-orange-600 dark:text-orange-400 block text-xs">Skill</span><span className="font-medium text-gray-900 dark:text-white">{tech.TechnicalSkill}</span></div>
                                                <div><span className="text-orange-600 dark:text-orange-400 block text-xs">Institution</span><span className="font-medium text-gray-800 dark:text-gray-200">{tech.TechInstitutionName || tech.InstitutionName}</span></div>
                                                <div><span className="text-orange-600 dark:text-orange-400 block text-xs">Duration</span><span className="font-medium text-gray-800 dark:text-gray-200">{tech.TechFromYear || tech.FromYear} - {tech.TechToYear || tech.ToYear}</span></div>
                                                <div><span className="text-orange-600 dark:text-orange-400 block text-xs">Score</span><span className="font-medium text-green-600 dark:text-green-400">{tech.TechPercentage || tech.Percentage}</span></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Work Experience */}
                        {selectedStaffData.ExperienceData?.length > 0 && (
                            <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 p-5 rounded-xl border border-pink-200 dark:border-pink-700">
                                <h4 className="font-semibold text-pink-800 dark:text-pink-300 mb-4 flex items-center">
                                    <Target className="w-5 h-5 mr-2" /> Work Experience ({selectedStaffData.ExperienceData.length})
                                </h4>
                                <div className="space-y-3">
                                    {selectedStaffData.ExperienceData.map((exp, index) => {
                                        const fromYr = parseInt(exp.ExpFromYear || exp.FromYear);
                                        const toYr   = parseInt(exp.ExpToYear   || exp.ToYear);
                                        const yrs    = (!isNaN(fromYr) && !isNaN(toYr)) ? toYr - fromYr : null;
                                        return (
                                            <div key={index} className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-pink-200 dark:border-pink-600">
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                                                    <div><span className="text-pink-600 dark:text-pink-400 block text-xs">Organization</span><span className="font-medium text-gray-900 dark:text-white">{exp.OrganisationName}</span></div>
                                                    <div><span className="text-pink-600 dark:text-pink-400 block text-xs">Role</span><span className="font-medium text-gray-800 dark:text-gray-200">{exp.Role}</span></div>
                                                    <div><span className="text-pink-600 dark:text-pink-400 block text-xs">Duration</span><span className="font-medium text-gray-800 dark:text-gray-200">{exp.ExpFromYear || exp.FromYear} - {exp.ExpToYear || exp.ToYear}</span></div>
                                                    <div><span className="text-pink-600 dark:text-pink-400 block text-xs">Experience</span><span className="font-medium text-green-600 dark:text-green-400">{yrs !== null ? `${yrs} ${yrs === 1 ? 'year' : 'years'}` : '—'}</span></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* References */}
                        {selectedStaffData.EmpReferenceData?.length > 0 && (
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
                                <h4 className="font-semibold text-gray-800 dark:text-gray-300 mb-4 flex items-center justify-between">
                                    <span className="flex items-center"><Users className="w-5 h-5 mr-2" /> References ({selectedStaffData.EmpReferenceData.length})</span>
                                    {selectedStaffData.EmpReferenceData.length >= 5
                                        ? <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-green-100 text-green-700 border border-green-200">✓ 5 References Present</span>
                                        : <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-rose-100 text-rose-600 border border-rose-200">⚠ Only {selectedStaffData.EmpReferenceData.length} / 5</span>
                                    }
                                </h4>
                                <div className="space-y-3">
                                    {selectedStaffData.EmpReferenceData.map((ref, index) => (
                                        <div key={index} className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                                <div><span className="text-gray-600 dark:text-gray-400 block text-xs">Reference Name</span><span className="font-medium text-gray-900 dark:text-white">{ref.RefName}</span></div>
                                                <div><span className="text-gray-600 dark:text-gray-400 block text-xs">Relation</span><span className="font-medium text-gray-800 dark:text-gray-200">{ref.RefRelation || ref.Relation}</span></div>
                                                <div><span className="text-gray-600 dark:text-gray-400 block text-xs">Mobile</span><span className="font-medium text-gray-800 dark:text-gray-200 font-mono">{ref.RefMobileNo}</span></div>
                                            </div>
                                            {(ref.RefRemarks || ref.FresherRefRemark) && (
                                                <div className="mt-2">
                                                    <span className="text-gray-600 dark:text-gray-400 block text-xs">Remarks</span>
                                                    <p className="text-gray-800 dark:text-gray-200 text-sm">{ref.RefRemarks || ref.FresherRefRemark}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── ALL CONTACT NUMBERS SUMMARY ─────────────────────────────────── */}
                        {(() => {
                            const contacts = [];
                            if (selectedStaffData.ContactMobile) {
                                const empName = [selectedStaffData.FirstName, selectedStaffData.MiddleName, selectedStaffData.LastName].filter(Boolean).join(' ');
                                contacts.push({ type: 'Employee', name: empName, phone: selectedStaffData.ContactMobile, relation: 'Self', typeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' });
                            }
                            if (selectedStaffData.ContactWorkPhone) {
                                contacts.push({ type: 'Work Phone', name: selectedStaffData.FirstName, phone: selectedStaffData.ContactWorkPhone, relation: 'Office', typeColor: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300' });
                            }
                            (selectedStaffData.FamilyMemberData || []).forEach(fm => {
                                if (fm.FMMobileNo) contacts.push({ type: 'Family', name: fm.FMName || '—', phone: fm.FMMobileNo, relation: fm.FMRelation || '—', typeColor: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' });
                            });
                            (selectedStaffData.ExperienceData || []).forEach(exp => {
                                if (exp.HistoryReferenceNo || exp.Mobilenos) contacts.push({ type: 'Prev. Employer', name: exp.HistoryContactName || exp.OrganisationName || '—', phone: exp.HistoryReferenceNo || exp.Mobilenos || '—', relation: exp.OrganisationName || '—', typeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' });
                            });
                            (selectedStaffData.EmpReferenceData || []).forEach(ref => {
                                if (ref.RefMobileNo) contacts.push({ type: 'Reference', name: ref.RefName || '—', phone: ref.RefMobileNo, relation: ref.RefRelation || ref.Relation || '—', typeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' });
                            });
                            if (contacts.length === 0) return null;
                            return (
                                <div className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900/30 dark:to-blue-900/20 p-5 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-4 flex items-center justify-between">
                                        <span className="flex items-center"><Phone className="w-5 h-5 mr-2" /> All Contact Numbers ({contacts.length})</span>
                                        <span className="text-xs text-blue-500 dark:text-blue-400 font-normal">Consolidated view for verification</span>
                                    </h4>
                                    <div className="rounded-xl overflow-hidden border border-blue-200 dark:border-blue-700">
                                        <div className="grid text-xs font-bold text-white px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600"
                                            style={{ gridTemplateColumns: '120px 1fr 150px 1fr' }}>
                                            <div>Type</div><div>Name</div><div>Phone Number</div><div>Relation / Org</div>
                                        </div>
                                        {contacts.map((c, i) => (
                                            <div key={i}
                                                className={`grid items-center px-4 py-3 gap-2 border-b border-blue-100 dark:border-blue-800 last:border-0 ${i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-blue-50/40 dark:bg-blue-900/10'}`}
                                                style={{ gridTemplateColumns: '120px 1fr 150px 1fr' }}>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md w-fit ${c.typeColor}`}>{c.type}</span>
                                                <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{c.name}</span>
                                                <span className="text-sm font-mono font-semibold text-gray-900 dark:text-gray-100">{c.phone}</span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{c.relation}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Additional Information */}
                        <div className="bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-indigo-900/20 dark:to-purple-800/20 p-5 rounded-xl border border-indigo-200 dark:border-indigo-700">
                            <h4 className="font-semibold text-indigo-800 dark:text-indigo-300 mb-4 flex items-center">
                                <FileText className="w-5 h-5 mr-2" /> Additional Information
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                {[
                                    { label: 'MOID',             value: selectedStaffData.MOID },
                                    { label: 'Joining Category', value: selectedStaffData.joiningcategory },
                                    { label: 'Salary Access',    value: selectedStaffData.SalaryAccess },
                                    { label: 'Username Access',  value: selectedStaffData.UsernameAccess }
                                ].map(({ label, value }) => (
                                    <div key={label} className="bg-white dark:bg-gray-700 p-3 rounded-lg">
                                        <span className="text-indigo-600 dark:text-indigo-400 block text-xs">{label}</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{value}</span>
                                    </div>
                                ))}
                            </div>
                            {selectedStaffData.ExpRemarks && (
                                <div className="mt-4">
                                    <span className="text-indigo-600 dark:text-indigo-400 block text-xs mb-1">Experience Remarks</span>
                                    <p className="font-medium text-gray-800 dark:text-gray-200 text-sm bg-white dark:bg-gray-700 p-3 rounded-lg">{selectedStaffData.ExpRemarks}</p>
                                </div>
                            )}
                            {selectedStaffData.ExpContactNames && (
                                <div className="mt-3">
                                    <span className="text-indigo-600 dark:text-indigo-400 block text-xs mb-1">Experience Contact Names</span>
                                    <p className="font-medium text-gray-800 dark:text-gray-200 text-sm bg-white dark:bg-gray-700 p-3 rounded-lg">{selectedStaffData.ExpContactNames}</p>
                                </div>
                            )}
                        </div>

                        {/* ── COMPLIANCE & VERIFICATION STATUS ──────────────────────────────── */}
                        {(() => {
                            const d = selectedStaffData;
                            const policeVer = d.PoliceVerification;
                            const noPoliceCaseAck  = d.UndertakingNoPoliceCaseAck;
                            const authDocsAck      = d.UndertakingAuthenticDocsAck;
                            const medFitAck        = d.UndertakingMedicallyFitAck;
                            const hasBGVDoc        = (employeeDocuments || []).some(doc => doc.DocName === 'BackgroundVerification');
                            const hasUndertakingDoc = (employeeDocuments || []).some(doc => doc.DocName === 'PersonalUndertaking');
                            const allAcksYes = noPoliceCaseAck === 'Yes' && authDocsAck === 'Yes' && medFitAck === 'Yes';
                            if (!policeVer && !noPoliceCaseAck && !authDocsAck && !medFitAck && !hasBGVDoc && !hasUndertakingDoc) return null;
                            const AckRow = ({ label, value }) => (
                                <div className="flex items-center justify-between py-2 border-b border-rose-100 dark:border-rose-900/30 last:border-0">
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                                    {value === 'Yes'
                                        ? <span className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 dark:bg-green-900/40 dark:text-green-300 px-2.5 py-0.5 rounded-lg border border-green-200 dark:border-green-700"><CheckCircle className="w-3 h-3" /> Confirmed</span>
                                        : <span className="flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-100 dark:bg-rose-900/40 dark:text-rose-300 px-2.5 py-0.5 rounded-lg border border-rose-200 dark:border-rose-700"><XCircle className="w-3 h-3" /> Not Confirmed</span>
                                    }
                                </div>
                            );
                            const DocStatusRow = ({ label, exists }) => (
                                <div className="flex items-center justify-between py-2 border-b border-rose-100 dark:border-rose-900/30 last:border-0">
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                                    {exists
                                        ? <span className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 dark:bg-green-900/40 dark:text-green-300 px-2.5 py-0.5 rounded-lg border border-green-200"><CheckCircle className="w-3 h-3" /> Uploaded</span>
                                        : <span className="flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-100 dark:bg-rose-900/40 dark:text-rose-300 px-2.5 py-0.5 rounded-lg border border-rose-200"><XCircle className="w-3 h-3" /> Missing</span>
                                    }
                                </div>
                            );
                            return (
                                <div className="bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-900/20 dark:to-orange-900/10 p-5 rounded-xl border-2 border-rose-200 dark:border-rose-800">
                                    <h4 className="font-semibold text-rose-800 dark:text-rose-300 mb-5 flex items-center justify-between">
                                        <span className="flex items-center"><ClipboardCheck className="w-5 h-5 mr-2" /> Compliance & Verification Status</span>
                                        {allAcksYes && policeVer && hasBGVDoc && hasUndertakingDoc
                                            ? <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-green-100 text-green-700 border border-green-200">✓ All Compliant</span>
                                            : <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-amber-100 text-amber-700 border border-amber-200">⚠ Pending Items</span>
                                        }
                                    </h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {/* Police Verification */}
                                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-rose-200 dark:border-rose-700">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Shield className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                                                <p className="text-xs font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider">Police Verification</p>
                                            </div>
                                            {policeVer
                                                ? <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold border-2
                                                    ${policeVer === 'Yes'
                                                        ? 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700'
                                                        : 'bg-rose-100 text-rose-600 border-rose-300 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700'}`}>
                                                    {policeVer === 'Yes' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                                    {policeVer === 'Yes' ? 'Verified' : 'Not Yet Verified'}
                                                </span>
                                                : <span className="text-xs text-gray-400 italic">Not provided</span>
                                            }
                                        </div>

                                        {/* Personal Undertaking Acks */}
                                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-rose-200 dark:border-rose-700">
                                            <div className="flex items-center gap-2 mb-3">
                                                <FileCheck className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                                                <p className="text-xs font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider">Personal Undertaking Declarations</p>
                                            </div>
                                            <div>
                                                <AckRow label="No Police Case" value={noPoliceCaseAck} />
                                                <AckRow label="All Documents Authentic" value={authDocsAck} />
                                                <AckRow label="Medically Fit" value={medFitAck} />
                                            </div>
                                        </div>

                                        {/* Compliance Document Status */}
                                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-rose-200 dark:border-rose-700 md:col-span-2">
                                            <div className="flex items-center gap-2 mb-3">
                                                <FileText className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                                                <p className="text-xs font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider">Compliance Documents</p>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                                                <DocStatusRow label="Background Verification Document" exists={hasBGVDoc} />
                                                <DocStatusRow label="Signed Personal Undertaking Document" exists={hasUndertakingDoc} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Documents */}
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
                            <h4 className="font-semibold text-gray-800 dark:text-gray-300 mb-4 flex items-center justify-between">
                                <span className="flex items-center">
                                    <FileText className="w-5 h-5 mr-2" />
                                    Employee Documents ({employeeDocuments.length})
                                </span>
                                {documentsLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>}
                            </h4>
                            {documentsLoading ? (
                                <div className="text-center py-4"><p className="text-gray-500">Loading documents...</p></div>
                            ) : documentsError ? (
                                <div className="text-center py-4"><p className="text-red-500">Error loading documents: {documentsError}</p></div>
                            ) : employeeDocuments.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {employeeDocuments.map((doc, index) => (
                                        <div key={index} className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                                                        <FileText className="w-4 h-4 text-indigo-600" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{doc.DocName}</div>
                                                        <div className="text-xs text-gray-500">{doc.FileType}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-xs text-green-600 font-medium">✓ Available</span>
                                                    <button onClick={() => openDocumentInBrowser(doc)} className="text-indigo-600 hover:text-indigo-800 p-1 hover:bg-indigo-100 dark:hover:bg-indigo-900/20 rounded" title="Open in Browser">
                                                        <Globe className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDocumentView(doc)} className="text-purple-600 hover:text-purple-800 p-1 hover:bg-purple-100 dark:hover:bg-purple-900/20 rounded" title="View in Modal">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDocumentDownload(doc)} className="text-green-600 hover:text-green-800 p-1 hover:bg-green-100 dark:hover:bg-green-900/20 rounded" title="Download">
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4"><p className="text-gray-500">No documents available</p></div>
                            )}
                        </div>

                        {/* Previous Approval Notes */}
                        {selectedStaffData.ApprovalNote && (
                            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-5 rounded-xl border border-yellow-200 dark:border-yellow-700">
                                <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-3 flex items-center">
                                    <FileCheck className="w-5 h-5 mr-2" /> Previous Approval Notes
                                </h4>
                                <div className="bg-white dark:bg-gray-700 p-3 rounded-lg border border-yellow-200 dark:border-yellow-600">
                                    <p className="text-yellow-800 dark:text-yellow-200 text-sm">{selectedStaffData.ApprovalNote}</p>
                                </div>
                            </div>
                        )}

                        {/* VERIFICATION INPUT */}
                        <VerificationInput
                            isVerified={isVerified}
                            onVerifiedChange={setIsVerified}
                            comment={verificationComment}
                            onCommentChange={(e) => setVerificationComment(e.target.value)}
                            config={{
                                checkboxLabel: '✓ I have verified all staff registration details, contact numbers, compliance fields and documents',
                                checkboxDescription: 'Including personal information, employment details, qualifications, all contact numbers, police verification, personal undertaking declarations, and all uploaded documents',
                                commentLabel: 'Verification Comments',
                                commentPlaceholder: 'Please provide detailed comments about the staff registration verification...',
                                commentRequired: true,
                                commentRows: 4,
                                commentMaxLength: 1000,
                                showCharCount: true,
                                validationStyle: 'dynamic',
                                checkboxGradient: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
                                commentGradient: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20',
                                commentBorder: 'border-indigo-200 dark:border-indigo-700'
                            }}
                        />

                        {/* ACTION BUTTONS */}
                        <ActionButtons
                            actions={enabledActions}
                            onActionClick={handleActionClick}
                            loading={approvalLoading}
                            isVerified={isVerified}
                            comment={verificationComment}
                            showValidation={true}
                            excludeActions={['send back', 'return']}
                        />
                    </>
                )}
            </div>
        );
    };

    // ✅ MAIN RENDER
    return (
        <div className="space-y-6">
            <InboxHeader
                title={`${InboxTitle || 'Staff Registration Verification'} (${verificationStaff.length})`}
                subtitle={ModuleDisplayName}
                itemCount={verificationStaff.length}
                onBackClick={handleBackToInbox}
                HeaderIcon={Users}
                badgeText="HR Module"
                badgeCount={verificationStaff.length}
                searchConfig={{
                    enabled: true,
                    placeholder: 'Search by name, employee code, department, designation...',
                    value: searchQuery,
                    onChange: (e) => setSearchQuery(e.target.value)
                }}
                filters={[
                    {
                        value: filterDepartment,
                        onChange: (e) => setFilterDepartment(e.target.value),
                        defaultLabel: 'All Departments',
                        options: departments
                    },
                    {
                        value: filterCategory,
                        onChange: (e) => setFilterCategory(e.target.value),
                        defaultLabel: 'All Categories',
                        options: categories
                    }
                ]}
            />

            {/* Main Content */}
            <div
                className={`grid transition-all duration-300 ${
                    isLeftPanelCollapsed && !isLeftPanelHovered
                        ? 'grid-cols-1 lg:grid-cols-12 gap-2'
                        : 'grid-cols-1 lg:grid-cols-3 gap-6'
                }`}
                onMouseLeave={() => {
                    if (selectedStaff && isLeftPanelCollapsed) setIsLeftPanelHovered(false);
                }}
            >
                    <div className={isLeftPanelCollapsed && !isLeftPanelHovered ? 'lg:col-span-1' : 'lg:col-span-1'}>
                        <LeftPanel
                            items={filteredStaff}
                            selectedItem={selectedStaff}
                            onItemSelect={handleItemSelect}
                            renderItem={renderItemCard}
                            renderCollapsedItem={renderCollapsedItem}
                            isCollapsed={isLeftPanelCollapsed}
                            onCollapseToggle={setIsLeftPanelCollapsed}
                            isHovered={isLeftPanelHovered}
                            onHoverChange={setIsLeftPanelHovered}
                            loading={staffLoading}
                            error={staffError}
                            onRefresh={handleRefresh}
                            config={{
                                title: 'Pending Verification',
                                icon: Clock,
                                emptyMessage: 'No staff registrations found!',
                                itemKey: 'Id',
                                enableCollapse: true,
                                enableRefresh: true,
                                enableHover: true,
                                maxHeight: '100%',
                                headerGradient: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20'
                            }}
                            renderPopupContent={(_item) => renderDetailContent(true)}
                            popupConfig={{
                                title: 'Staff Registration',
                                icon: User,
                                headerGradient: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20',
                            }}
                        />
                    </div>

                    <div className={isLeftPanelCollapsed && !isLeftPanelHovered ? 'lg:col-span-11' : 'lg:col-span-2'}>
                        <RightDetailPanel
                            selectedItem={selectedStaff}
                            loading={staffDataLoading}
                            renderContent={renderDetailContent}
                            config={{
                                title: 'Staff Registration',
                                icon: User,
                                selectedTitle: 'Staff Registration Details',
                                emptyTitle: 'No Application Selected',
                                emptyMessage: 'Select a staff registration from the list to view details and verify.',
                                headerGradient: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20',
                                maxHeight: 'calc(100vh - 200px)',
                                sticky: true,
                                stickyTop: '1.5rem',
                            }}
                        />
                    </div>
                </div>

            {showDocumentModal && selectedDocument && (
                <AttachmentModal
                    isOpen={showDocumentModal}
                    onClose={() => { setShowDocumentModal(false); setSelectedDocument(null); }}
                    fileUrl={getDocumentUrl(selectedDocument)}
                    fileName={`${selectedDocument.DocName}.${selectedDocument.FileType?.toLowerCase() || 'pdf'}`}
                    title={selectedDocument.DocName}
                    subtitle={`Employee: ${getFullName(selectedStaff)} | Type: ${selectedDocument.FileType}`}
                    theme="indigo"
                    isImageFile={() => ['image', 'jpg', 'jpeg', 'png'].includes(selectedDocument.FileType?.toLowerCase())}
                    isPdfFile={() => selectedDocument.FileType?.toLowerCase() === 'pdf'}
                    onError={() => toast.error('Failed to load document')}
                />
            )}
        </div>
    );
};

export default VerifyStaffRegistration;