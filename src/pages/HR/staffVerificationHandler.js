// staffVerificationHandler.js - Separate file for action handling logic
import { toast } from 'react-toastify';

// ✅ HELPER FUNCTIONS (EXPORTED)
const getCurrentUser = () => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    return userData.username || userData.employeeId || 'system';
};

const formatArrayForSP = (array) => {
    if (!array || !Array.isArray(array) || array.length === 0) {
        return '';
    }
    return array.filter(item => item && item.toString().trim() !== '').join(',') + ',';
};

// Prevent data corruption during transfer (not validation)
const ensureNotNull = (value, fallback = '') => {
    return (value === null || value === undefined) ? fallback : value;
};

// Enhanced email resolution with multiple fallback methods
const resolveEmailField = (selectedStaffData, selectedStaff) => {
    let emailValue = '';

    // Method 1: Try multiple possible field names
    const emailFields = ['WorkEmail', 'MailId', 'Email', 'EmailAddress'];
    for (const field of emailFields) {
        if (selectedStaffData && selectedStaffData[field] && selectedStaffData[field].toString().trim() !== '') {
            emailValue = selectedStaffData[field].toString().trim();
            console.log(`✅ Email found via field "${field}":`, emailValue);
            break;
        }
    }

    // Method 2: Generate email from name and employee ID if nothing found
    if (!emailValue || emailValue.trim() === '') {
        const firstName = (selectedStaffData?.FirstName || 'emp').toLowerCase();
        const lastName = (selectedStaffData?.LastName || '').toLowerCase();
        const empRef = selectedStaff?.EmpRefNo || 'unknown';

        if (lastName) {
            emailValue = `${firstName}.${lastName}.${empRef}@company.com`;
        } else {
            emailValue = `${firstName}.${empRef}@company.com`;
        }
        console.warn('⚠️ Generated fallback email:', emailValue);
    }

    return emailValue;
};

// ✅ BUILD VERIFICATION PAYLOAD FUNCTION (EXPORTED SEPARATELY)
export const buildVerificationPayload = (actionValue, selectedStaff, selectedStaffData, verificationComment, RoleId, selectedRoleId) => {
    console.group('🔧 Building Verification Payload');
    console.log('📋 Input Parameters:', {
        actionValue,
        empRefNo: selectedStaff?.EmpRefNo,
        hasStaffData: !!selectedStaffData,
        commentLength: verificationComment?.length || 0,
        roleId: RoleId || selectedRoleId
    });
    
    // ✅ FIXED: Handle reject action properly
    if (actionValue === 'Reject') {
        const rejectPayload = {
            EmpRefNo: selectedStaff.EmpRefNo,
            Roleid: RoleId || selectedRoleId,
            Createdby: getCurrentUser(),
            Action: actionValue,
            Note: verificationComment
        };
        console.log('✅ Reject payload built:', rejectPayload);
        console.groupEnd();
        return rejectPayload;
    }

    // For Verify/Approve - pass through existing data with proper field mapping
    const emailValue = resolveEmailField(selectedStaffData, selectedStaff);
    
    // ✅ ENHANCED: Email resolution logging
    console.log('📧 Email Resolution Analysis:', {
        WorkEmail: selectedStaffData?.WorkEmail,
        MailId: selectedStaffData?.MailId,
        Email: selectedStaffData?.Email,
        resolvedEmail: emailValue,
        emailSource: selectedStaffData?.WorkEmail ? 'WorkEmail' :
            selectedStaffData?.MailId ? 'MailId' :
                selectedStaffData?.Email ? 'Email' : 'Generated'
    });

    // ✅ BUILD COMPLETE PAYLOAD
    const payload = {
        // ✅ Core verification fields (mandatory for verification)
        EmpRefNo: selectedStaff.EmpRefNo,
        Roleid: RoleId || selectedRoleId,
        Createdby: getCurrentUser(),
        Action: actionValue,
        Note: verificationComment,

        // ✅ Field mapping (existing data - just map field names correctly)
        JoiningType: ensureNotNull(selectedStaffData?.JoiningType, 'New'),
        EmpCategory: ensureNotNull(selectedStaffData?.Category, 'Staff'),
        Appointmenttype: ensureNotNull(selectedStaffData?.Appointmenttype, 'Normal'),

        // Basic info (already validated during registration)
        FirstName: ensureNotNull(selectedStaffData?.FirstName),
        LastName: ensureNotNull(selectedStaffData?.LastName),
        MiddleName: ensureNotNull(selectedStaffData?.MiddleName),

        // Personal details (already stored)
        DOB: ensureNotNull(selectedStaffData?.DateofBirth),
        Age: ensureNotNull(selectedStaffData?.EmpAge, '25'),
        Gender: ensureNotNull(selectedStaffData?.Gender, 'Male'),
        Martialstatus: ensureNotNull(selectedStaffData?.MartialStatus, 'Single'),
        DOMarriage: ensureNotNull(selectedStaffData?.DateofMarriage),

        // Nominee (already stored)
        NomineeName: ensureNotNull(selectedStaffData?.NomineeName),
        Relation: ensureNotNull(selectedStaffData?.NomineeRelation),
        NomineeDOB: ensureNotNull(selectedStaffData?.NomineeDateofBirth),
        NomineeAge: ensureNotNull(selectedStaffData?.NomineeAge, '0'),

        // ✅ CRITICAL: Email field mapping (multiple possible field names)
        MailId: emailValue,

        // Contact info (already stored)
        ContactWorkPhoneNo: ensureNotNull(selectedStaffData?.ContactWorkPhone),
        Mobileno: ensureNotNull(selectedStaffData?.ContactMobile),
        PlaceOfBirth: ensureNotNull(selectedStaffData?.PlaceofBirth),
        PermanentAddress: ensureNotNull(selectedStaffData?.PermanentAddress),
        PresentAddress: ensureNotNull(selectedStaffData?.PresentAddress),

        // Employment details (already validated during registration)
        Experience: ensureNotNull(selectedStaffData?.Experience, 'Fresher'),
        DesignationId: ensureNotNull(selectedStaffData?.DesignationId, 1),
        Joiningdate: ensureNotNull(selectedStaffData?.JoiningDate),
        JobType: ensureNotNull(selectedStaffData?.JobType, 'Permanent'),
        JoiningCC: ensureNotNull(selectedStaffData?.JoiningCostCenter),
        Transitdays: ensureNotNull(selectedStaffData?.TransitDay, 0),
        ReportTo: ensureNotNull(selectedStaffData?.ReportTo),
        DepartmentId: ensureNotNull(selectedStaffData?.DepartmentId, 1),

        // Bank details (already stored)
        BankName: ensureNotNull(selectedStaffData?.BankName),
        BankAccountNo: ensureNotNull(selectedStaffData?.BankAccountNo),
        IFSCCode: ensureNotNull(selectedStaffData?.IFSCcode),
        BankAddress: ensureNotNull(selectedStaffData?.BankAddress),

        // ✅ Array data formatting (preserve existing arrays)
        FMNames: formatArrayForSP(selectedStaffData?.FamilyMemberData?.map(fm => fm.FMName)),
        FMDOBs: formatArrayForSP(selectedStaffData?.FamilyMemberData?.map(fm => fm.FMDateofBirth)),
        FMAges: formatArrayForSP(selectedStaffData?.FamilyMemberData?.map(fm => fm.FMAge)),
        FMGenders: formatArrayForSP(selectedStaffData?.FamilyMemberData?.map(fm => fm.FMGender)),
        FMRelations: formatArrayForSP(selectedStaffData?.FamilyMemberData?.map(fm => fm.FMRelation)),
        FMMobilenos: formatArrayForSP(selectedStaffData?.FamilyMemberData?.map(fm => fm.FMMobileNo)),

        ChildNames: formatArrayForSP(selectedStaffData?.ChildrensData?.map(child => child.ChildName)),
        ChildDOBs: formatArrayForSP(selectedStaffData?.ChildrensData?.map(child => child.ChildDateofBirth)),
        ChildAges: formatArrayForSP(selectedStaffData?.ChildrensData?.map(child => child.ChildAge)),
        ChildGenders: formatArrayForSP(selectedStaffData?.ChildrensData?.map(child => child.ChildGender)),
        ChildMaritals: formatArrayForSP(selectedStaffData?.ChildrensData?.map(child => child.ChildMaritalStatus)),

        AdClasses: formatArrayForSP(selectedStaffData?.AcademicQualificationData?.map(aq => aq.AcademicClass)),
        AdUniversities: formatArrayForSP(selectedStaffData?.AcademicQualificationData?.map(aq => aq.NameofUniversity)),
        AdFromyears: formatArrayForSP(selectedStaffData?.AcademicQualificationData?.map(aq => aq.FromYear)),
        AdToyears: formatArrayForSP(selectedStaffData?.AcademicQualificationData?.map(aq => aq.ToYear)),
        AdPercents: formatArrayForSP(selectedStaffData?.AcademicQualificationData?.map(aq => aq.Percentage)),

        TechSkills: formatArrayForSP(selectedStaffData?.TechnicalData?.map(tech => tech.TechnicalSkill)),
        TechInstitutionName: formatArrayForSP(selectedStaffData?.TechnicalData?.map(tech => tech.TechInstitutionName)),
        TechFromYear: formatArrayForSP(selectedStaffData?.TechnicalData?.map(tech => tech.TechFromYear)),
        TechToYear: formatArrayForSP(selectedStaffData?.TechnicalData?.map(tech => tech.TechToYear)),
        TechPercentage: formatArrayForSP(selectedStaffData?.TechnicalData?.map(tech => tech.TechPercentage)),

        HTOrganisations: formatArrayForSP(selectedStaffData?.ExperienceData?.map(exp => exp.OrganisationName)),
        HTFromyears: formatArrayForSP(selectedStaffData?.ExperienceData?.map(exp => exp.ExpFromYear)),
        HTToyears: formatArrayForSP(selectedStaffData?.ExperienceData?.map(exp => exp.ExpToYear)),
        HTRoles: formatArrayForSP(selectedStaffData?.ExperienceData?.map(exp => exp.Role)),
        HTMobilenos: formatArrayForSP(selectedStaffData?.ExperienceData?.map(exp => exp.Mobilenos)),

        // Government IDs (already stored during registration)
        Uanexist: ensureNotNull(selectedStaffData?.UANExist, false),
        UANNo: ensureNotNull(selectedStaffData?.UANNumber),
        ESINumber: ensureNotNull(selectedStaffData?.ESINumber),
        EmpUserName: ensureNotNull(selectedStaffData?.UserName),
        Pwd: ensureNotNull(selectedStaffData?.Pwd, 'temp123'),
        Aadharno: ensureNotNull(selectedStaffData?.AdharNo),
        Panno: ensureNotNull(selectedStaffData?.PanNo),
        ReportToRoleId: ensureNotNull(selectedStaffData?.ReportToRoleId, 0),
        PFExist: ensureNotNull(selectedStaffData?.PFExist, 'No'),
        ESIExist: ensureNotNull(selectedStaffData?.ESIExist, 'No'),
        GroupId: ensureNotNull(selectedStaffData?.GroupId, 1),
        Probationdays: ensureNotNull(selectedStaffData?.Probationdays, 90),
        ContractStartDate: ensureNotNull(selectedStaffData?.ContractStartDate),
        ContractEndDate: ensureNotNull(selectedStaffData?.ContractEndDate),

        // References
        RefNames: formatArrayForSP(selectedStaffData?.EmpReferenceData?.map(ref => ref.RefName)),
        RefRelations: formatArrayForSP(selectedStaffData?.EmpReferenceData?.map(ref => ref.RefRelation)),
        RefMobileNos: formatArrayForSP(selectedStaffData?.EmpReferenceData?.map(ref => ref.RefMobileNo)),
        RefRemarks: formatArrayForSP(selectedStaffData?.EmpReferenceData?.map(ref => ref.RefRemarks)),

        // Additional fields
        HTExpRemarks: ensureNotNull(selectedStaffData?.ExpRemarks),
        HTExpContactNames: ensureNotNull(selectedStaffData?.ExpContactNames)
    };

    // ✅ ENHANCED: Critical field validation logging
    const criticalFields = [
        'EmpRefNo', 'MailId', 'FirstName', 'LastName', 
        'DesignationId', 'DepartmentId', 'Joiningdate'
    ];
    
    console.log('🔍 Critical Fields Validation:');
    criticalFields.forEach(field => {
        const value = payload[field];
        const status = value && value !== null && value !== undefined ? '✅' : '❌';
        console.log(`${status} ${field}:`, value);
    });

    // ✅ CHECK FOR POTENTIAL ISSUES
    const nullFields = Object.keys(payload).filter(key => payload[key] === null);
    const undefinedFields = Object.keys(payload).filter(key => payload[key] === undefined);
    const emptyFields = Object.keys(payload).filter(key => payload[key] === '');

    if (nullFields.length > 0) {
        console.warn('⚠️ NULL fields detected:', nullFields);
    }
    if (undefinedFields.length > 0) {
        console.warn('⚠️ UNDEFINED fields detected:', undefinedFields);
    }
    if (emptyFields.length > 0) {
        console.warn('⚠️ EMPTY fields detected:', emptyFields);
    }

    // ✅ FINAL VALIDATION CHECK
    const criticalFieldIssues = criticalFields
        .filter(field => !payload[field] || payload[field] === null || payload[field] === undefined)
        .map(field => ({ field, value: payload[field] }));

    if (criticalFieldIssues.length > 0) {
        console.error('🚨 CRITICAL FIELD ISSUES DETECTED:', criticalFieldIssues);
    }

    console.log(`✅ Payload built successfully with ${Object.keys(payload).length} fields`);
    console.groupEnd();
    
    return payload;
};

/**
 * ✅ MAIN STAFF VERIFICATION HANDLER (EXPORTED)
 * Handles all verification actions (Verify, Approve, Reject) for staff registration
 */
export const createStaffVerificationHandler = (dispatch, actions) => {
    const {
        approveStaffRegistration,
        fetchVerificationStaff,
        resetVerificationStaffData,
        resetApprovalData
    } = actions;

    // Main handler function
    const handleStatusAction = async (
        action,
        selectedStaff,
        selectedStaffData,
        verificationComment,
        RoleId,
        selectedRoleId,
        getFullName,
        setSelectedStaff,
        setVerificationComment
    ) => {
        // Basic validations
        if (!selectedStaff) {
            toast.error('No staff selected');
            return;
        }

        if (!selectedStaff.EmpRefNo) {
            toast.error('Employee reference number missing');
            return;
        }

        // ✅ MANDATORY COMMENT VALIDATION
        if (!verificationComment || verificationComment.trim() === '') {
            toast.error('Verification comment is mandatory. Please add your comments before proceeding.');
            return;
        }

        // Ensure staff data is loaded
        if (!selectedStaffData && (action.type.toLowerCase() === 'verify' || action.type.toLowerCase() === 'approve')) {
            toast.error('Employee details not loaded yet. Please wait a moment and try again.');
            return;
        }

        // Map action value
        let actionValue = action.value;
        if (!actionValue || actionValue.trim() === '') {
            const typeToValueMap = {
                'approve': 'Approve',
                'verify': 'Verify',
                'reject': 'Reject'
            };
            actionValue = typeToValueMap[action.type.toLowerCase()] || action.type;
        }

        try {
            const actionData = buildVerificationPayload(
                actionValue,
                selectedStaff,
                selectedStaffData,
                verificationComment,
                RoleId,
                selectedRoleId
            );

            console.group(`🎯 Verification: ${actionValue}`);
            console.log('Employee:', selectedStaff.EmpRefNo, getFullName(selectedStaff));
            console.log('Comment provided:', !!verificationComment);
            console.log('Key fields check:', {
                EmpRefNo: actionData.EmpRefNo,
                Action: actionData.Action,
                Note: actionData.Note,
                MailId: actionData.MailId,
                FirstName: actionData.FirstName,
                LastName: actionData.LastName
            });
            console.groupEnd();

            const result = await dispatch(approveStaffRegistration(actionData)).unwrap();

            console.log('✅ Verification Response:', result);

            // Handle success
            if (result && typeof result === 'string') {
                if (result.includes('$')) {
                    const [status, additionalInfo] = result.split('$');

                    if (status === 'Submited') {
                        toast.success(`✅ ${action.text} completed successfully!`);

                        if (additionalInfo && actionValue === 'Approve') {
                            setTimeout(() => {
                                toast.info(`Employee Username Generated: ${additionalInfo}`, {
                                    autoClose: 6000
                                });
                            }, 500);
                        }
                    } else {
                        toast.success(`${action.text}: ${status}${additionalInfo ? ` - ${additionalInfo}` : ''}`);
                    }
                } else if (result.toLowerCase().includes('error') || result.toLowerCase().includes('failed')) {
                    throw new Error(result);
                } else {
                    toast.success(`✅ ${action.text} completed successfully!`);
                }
            } else {
                toast.success(`✅ ${action.text} completed successfully!`);
            }

            // Refresh after success
            setTimeout(() => {
                dispatch(fetchVerificationStaff(RoleId || selectedRoleId));
                setSelectedStaff(null);
                setVerificationComment('');
                dispatch(resetVerificationStaffData());
                dispatch(resetApprovalData());
            }, 1000);

        } catch (error) {
            console.group(`❌ Verification Error: ${action.type}`);
            console.error('Error details:', error);

            let errorMessage = `Failed to ${action.text.toLowerCase()}`;

            if (error && typeof error === 'string') {
                if (error.includes('Cannot insert the value NULL into column')) {
                    const columnMatch = error.match(/column '([^']+)'/);
                    const columnName = columnMatch ? columnMatch[1] : 'unknown';
                    errorMessage = `❌ Field '${columnName}' is missing. This indicates a data mapping issue.`;
                    console.error(`NULL column error for: ${columnName}`);
                    console.error('This suggests the frontend field name doesn\'t match the stored procedure parameter');
                } else if (error.includes('Username Already Exist')) {
                    errorMessage = '❌ Username already exists in the system';
                } else if (error.includes('AadharNo Already Exist')) {
                    errorMessage = '❌ Aadhar number already registered';
                } else {
                    errorMessage = `❌ ${error}`;
                }
            } else if (error?.message) {
                errorMessage = `❌ ${error.message}`;
            }

            toast.error(errorMessage, { autoClose: 10000 });
            console.groupEnd();
        }
    };

    // ✅ RETURN BOTH FUNCTIONS
    return { 
        handleStatusAction,
        buildVerificationPayload  // Include buildVerificationPayload in return
    };
};

// ✅ VERIFICATION COMMENTS SECTION COMPONENT (EXPORTED)
export const VerificationCommentsSection = ({ verificationComment, setVerificationComment, FileText }) => {
    return (
        <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 p-5 rounded-xl border-2 border-red-200 dark:border-red-700">
            <label className="text-sm font-bold text-red-800 dark:text-red-300 mb-3 flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                <span className="text-red-600">*</span> Verification Comments (Mandatory)
            </label>
            <p className="text-xs text-red-600 dark:text-red-400 mb-3">
                This field is required. Please provide your comments about the verification.
            </p>
            <textarea
                value={verificationComment}
                onChange={(e) => setVerificationComment(e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 transition-all ${verificationComment.trim() === ''
                    ? 'border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/10'
                    : 'border-green-400 dark:border-green-500 bg-green-50 dark:bg-green-900/10'
                    }`}
                rows="4"
                placeholder="Please provide detailed comments about your verification decision..."
                required
            />
            {verificationComment.trim() === '' && (
                <p className="text-xs text-red-500 mt-1 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                    Comment is required before you can proceed
                </p>
            )}
            {verificationComment.trim() !== '' && (
                <p className="text-xs text-green-600 mt-1 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                    Comment provided ({verificationComment.length} characters)
                </p>
            )}
        </div>
    );
};

// ✅ DATA MAPPING CHECK COMPONENT (EXPORTED)
export const DataMappingCheck = ({ selectedStaffData, FileCheck }) => {
    if (!selectedStaffData) return null;

    const fieldMappings = [
        { label: 'Email', frontend: 'WorkEmail/MailId', value: selectedStaffData.WorkEmail || selectedStaffData.MailId },
        { label: 'First Name', frontend: 'FirstName', value: selectedStaffData.FirstName },
        { label: 'Last Name', frontend: 'LastName', value: selectedStaffData.LastName },
        { label: 'DOB', frontend: 'DateofBirth', value: selectedStaffData.DateofBirth },
        { label: 'Designation ID', frontend: 'DesignationId', value: selectedStaffData.DesignationId },
        { label: 'Department ID', frontend: 'DepartmentId', value: selectedStaffData.DepartmentId }
    ];

    const hasIssues = fieldMappings.some(field => !field.value);

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 p-4 rounded-xl border border-indigo-200 dark:border-indigo-700">
            <h4 className="font-semibold text-indigo-800 dark:text-indigo-300 mb-3 flex items-center">
                <FileCheck className="w-4 h-4 mr-2" />
                Data Mapping Check {hasIssues && <span className="text-red-500 ml-2">⚠️ Issues Found</span>}
            </h4>

            <div className="space-y-2">
                {fieldMappings.map((field, index) => (
                    <div key={index} className={`flex items-center justify-between text-sm p-2 rounded ${field.value ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'
                        }`}>
                        <span className="font-medium">{field.label}:</span>
                        <span className={`${field.value ? 'text-green-700' : 'text-red-700'}`}>
                            {field.value ? '✓ Mapped' : '❌ Missing'}
                        </span>
                    </div>
                ))}
            </div>

            {hasIssues && (
                <div className="mt-3 p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded">
                    <p className="text-xs text-yellow-700 dark:text-yellow-300">
                        ⚠️ Some fields are missing. This may cause NULL insertion errors. Check your data fetching logic.
                    </p>
                </div>
            )}
        </div>
    );
};