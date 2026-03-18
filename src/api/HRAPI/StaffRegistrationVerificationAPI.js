import axios from "axios";
import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// STAFF REGISTRATION VERIFICATION APIs
// ==============================================

// 1. Get Verification Staff List by Role (GET)
//    GET api/HR/GetVerificationStaff?Roleid={Roleid}
export const getVerificationStaff = async (roleId) => {
    try {
        console.log('📋 Getting Verification Staff List');
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetVerificationStaff`);
        console.log('📦 Params:', { Roleid: roleId });

        const response = await axios.get(
            `${API_BASE_URL}/HR/GetVerificationStaff`,
            {
                params: { Roleid: roleId },
                headers: { 'Content-Type': 'application/json' },
            }
        );
        console.log('✅ Get Verification Staff Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get Verification Staff API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to get verification staff list';
    }
};

// 2. Get Staff Main Data by EmpRefNo (GET)
//    GET api/HR/GetStaffMainDatabyId?EmpRefNo={EmpRefNo}&RoleId={RoleId}
export const getStaffMainDataById = async ({ empRefNo, roleId }) => {
    try {
        console.log('🔍 Getting Staff Main Data by ID');
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetStaffMainDatabyId`);
        console.log('📦 Params:', { EmpRefNo: empRefNo, RoleId: roleId });

        const response = await axios.get(
            `${API_BASE_URL}/HR/GetStaffMainDatabyId`,
            {
                params: { EmpRefNo: empRefNo, RoleId: roleId },
                headers: { 'Content-Type': 'application/json' },
            }
        );
        console.log('✅ Get Staff Main Data Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get Staff Main Data API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to get staff main data';
    }
};

// 3. Get Employee Documents by EmpRefNo (GET)
//    GET api/HR/GetEmployeeDocuments?EmpRefno={EmpRefno}
export const getEmployeeDocuments = async (empRefNo) => {
    try {
        console.log('📄 Getting Employee Documents');
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetEmployeeDocuments`);
        console.log('📦 Params:', { EmpRefno: empRefNo });

        const response = await axios.get(
            `${API_BASE_URL}/HR/GetEmployeeDocuments`,
            {
                params: { EmpRefno: empRefNo },
                headers: { 'Content-Type': 'application/json' },
            }
        );
        console.log('✅ Get Employee Documents Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get Employee Documents API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to get employee documents';
    }
};

// 4. Approve / Reject Staff Registration (PUT)
//    PUT api/HR/ApproveStaffRegistration
//    Action: 'Approve' | 'Reject' | 'Forward' (whatever your SP supports)
export const approveStaffRegistration = async (params) => {
    try {
        console.log('✅ Approving/Rejecting Staff Registration - raw params:', params);

        // ── Validate required fields ──────────────────────────────────────────
        if (!params.empRefNo)   throw new Error('EmpRefNo is required');
        if (!params.roleId)     throw new Error('Role ID is required');
        if (!params.createdBy)  throw new Error('Created By is required');
        if (!params.action)     throw new Error('Action is required');

        // ── Build payload matching spApproveStaffRegistration SP params ────────
        // ⚠️  IMPORTANT: SP uses JSON_VALUE() which requires STRING types.
        //     Numeric fields (IDs, days) must be sent as strings — matching old MVC app behaviour.
        const payload = {
            EmpRefNo: params.empRefNo?.toString() || '',

            // ── Employment basics ───────────────────────────────────────────
            JoiningType:     params.joiningType?.toString() || '',
            Category:        params.category?.toString() || '',
            Appointmenttype: params.appointmentType?.toString() || '',

            // ── Personal info ───────────────────────────────────────────────
            FirstName:      params.firstName?.toString() || '',
            LastName:       params.lastName?.toString() || '',
            MiddleName:     params.middleName?.toString() || '',
            DateofBirth:    params.dob?.toString() || '',
            EmpAge:         params.empAge?.toString() || '',
            Gender:         params.gender?.toString() || '',
            MartialStatus:  params.martialStatus?.toString() || '',
            DateofMarriage: params.dateofMarriage?.toString() || '',
            PlaceofBirth:   params.placeofBirth?.toString() || '',

            // ── Nominee ─────────────────────────────────────────────────────
            NomineeName:        params.nomineeName?.toString() || '',
            NomineeRelation:    params.nomineeRelation?.toString() || '',
            NomineeDateofBirth: params.nomineeDateofBirth?.toString() || '',
            NomineeAge:         params.nomineeAge?.toString() || '',

            // ── Contact ─────────────────────────────────────────────────────
            ContactWorkPhone: params.contactWorkPhone?.toString() || '',
            ContactMobile:    params.contactMobile?.toString() || '',
            WorkEmail:        params.workEmail?.toString() || '',
            PermanentAddress: params.permanentAddress?.toString() || '',
            PresentAddress:   params.presentAddress?.toString() || '',

            // ── Job details ─────────────────────────────────────────────────
            // ✅ FIX: Send as strings (old MVC app sends "19", "2" etc — not numbers)
            Experience:       params.experience?.toString() || '',
            DesignationId:    (parseInt(params.designationId) || 0).toString(),
            JoiningDate:      params.joiningDate?.toString() || '',
            JobType:          params.jobType?.toString() || '',
            JoiningCostCenter: params.joiningCostCenter?.toString() || '',
            TransitDay:       (parseInt(params.transitDay) || 0).toString(),
            ReportTo:         params.reportTo?.toString() || '',
            DepartmentId:     (parseInt(params.departmentId) || 0).toString(),

            // ── Bank ────────────────────────────────────────────────────────
            BankName:      params.bankName?.toString() || '',
            BankAccountNo: params.bankAccountNo?.toString() || '',
            IFSCcode:      params.ifscCode?.toString() || '',
            BankAddress:   params.bankAddress?.toString() || '',

            // ── Family members (pipe-delimited strings) ─────────────────────
            FMName:        params.fmName?.toString() || '',
            FMDateofBirth: params.fmDateofBirth?.toString() || '',
            FMAge:         params.fmAge?.toString() || '',
            FMGender:      params.fmGender?.toString() || '',
            FMRelation:    params.fmRelation?.toString() || '',
            FMMobileNo:    params.fmMobileNo?.toString() || '',

            // ── Children (pipe-delimited strings) ───────────────────────────
            ChildName:          params.childName?.toString() || '',
            ChildDateofBirth:   params.childDateofBirth?.toString() || '',
            ChildAge:           params.childAge?.toString() || '',
            ChildGender:        params.childGender?.toString() || '',
            ChildMaritalStatus: params.childMaritalStatus?.toString() || '',

            // ── Academic details (pipe-delimited strings) ───────────────────
            AcademicClass:    params.academicClass?.toString() || '',
            NameofUniversity: params.nameofUniversity?.toString() || '',
            FromYear:         params.fromYear?.toString() || '',
            ToYear:           params.toYear?.toString() || '',
            Percentage:       params.percentage?.toString() || '',

            // ── Technical skills (pipe-delimited strings) ───────────────────
            TechnicalSkill:      params.technicalSkill?.toString() || '',
            TechInstitutionName: params.techInstitutionName?.toString() || '',
            TechFromYear:        params.techFromYear?.toString() || '',
            TechToYear:          params.techToYear?.toString() || '',
            TechPercentage:      params.techPercentage?.toString() || '',

            // ── Work history (pipe-delimited strings) ───────────────────────
            OrganisationName: params.organisationName?.toString() || '',
            ExpFromYear:      params.expFromYear?.toString() || '',
            ExpToYear:        params.expToYear?.toString() || '',
            Role:             params.role?.toString() || '',
            Mobilenos:        params.mobilenos?.toString() || '',
            ExpRemarks:       params.expRemarks?.toString() || '',
            ExpContactNames:  params.expContactNames?.toString() || '',

            // ── PF / ESI / UAN ──────────────────────────────────────────────
            UANExist:  params.uanExist === true || params.uanExist === 'true',
            UANNumber: params.uanNumber?.toString() || '',
            ESINumber: params.esiNumber?.toString() || '',
            PFExist:   params.pfExist?.toString() || '',
            ESIExist:  params.esiExist?.toString() || '',

            // ── Identity ────────────────────────────────────────────────────
            AdharNo: params.adharNo?.toString() || '',
            PanNo:   params.panNo?.toString() || '',

            // ── Login credentials (set during approve) ──────────────────────
            UserName: params.userName?.toString() || '',
            Pwd:      params.pwd?.toString() || '',

            // ── Org / role ──────────────────────────────────────────────────
            // ✅ FIX: Send as strings (old MVC app sends "102", "24" etc — not numbers)
            ReportToRoleId: (parseInt(params.reportToRoleId) || 0).toString(),
            GroupId:        (parseInt(params.groupId) || 0).toString(),
            RoleId:         parseInt(params.roleId),   // RoleId stays as number (it's the auth role, not a SP string param)

            // ── Contract / probation ─────────────────────────────────────────
            // ✅ FIX: Probationdays as "0.00" string (old MVC app format)
            Probationdays:     (parseFloat(params.probationdays) || 0).toFixed(2),
            ContractStartDate: params.contractStartDate?.toString() || '',
            ContractEndDate:   params.contractEndDate?.toString() || '',

            // ── References (pipe-delimited strings) ─────────────────────────
            RefName:     params.refName?.toString() || '',
            RefRelation: params.refRelation?.toString() || '',
            RefMobileNo: params.refMobileNo?.toString() || '',
            // ✅ FIX: Use 'null,' placeholder (old MVC app sends "null," not "")
            RefRemarks:  params.refRemarks?.toString() || '',

            // ── Approval meta ────────────────────────────────────────────────
            Createdby:    params.createdBy.toString(),
            Action:       params.action.toString(),   // 'Approve' | 'Reject' | 'Forward'
            ApprovalNote: params.approvalNote?.toString() || '',

            // ── Documents ───────────────────────────────────────────────────
            // Backend loops through DocumentData and calls SaveDocumentsVerify per item.
            // Handles both shapes:
            //   • Server-fetched docs from GetEmployeeDocuments → PascalCase fields (PDFBaseData, FileType, DocName, Path)
            //   • User-uploaded File docs converted in component  → camelCase fields (base64, fileType, docName)
            DocumentData: Array.isArray(params.documents)
                ? params.documents.map(doc => ({
                    DocName:     doc.DocName     || doc.docName    || '',
                    PDFBaseData: doc.PDFBaseData || doc.base64     || '',
                    FileType:    doc.FileType    || doc.fileType   || '',
                    Path:        doc.Path        || doc.path       || '',
                }))
                : [],
        };

        console.log('🔗 API URL:', `${API_BASE_URL}/HR/ApproveStaffRegistration`);
        console.log('📦 Full Approve Payload:', JSON.stringify(payload, null, 2));
        console.log('📦 Key fields check:', {
            EmpRefNo:      payload.EmpRefNo,
            RoleId:        payload.RoleId,
            Action:        payload.Action,
            Createdby:     payload.Createdby,
            DesignationId: payload.DesignationId,   // should be "8" not 8
            DepartmentId:  payload.DepartmentId,    // should be "14" not 14
            GroupId:       payload.GroupId,          // should be "13" not 13
            ReportToRoleId: payload.ReportToRoleId, // should be "142" not 142
            Probationdays: payload.Probationdays,   // should be "0.00" not 0
            TransitDay:    payload.TransitDay,       // should be "0" not 0
            JoiningType:   payload.JoiningType,
            Category:      payload.Category,
            FirstName:     payload.FirstName,
            LastName:      payload.LastName,
            DocCount:      payload.DocumentData?.length,
        });

        const response = await axios.put(
            `${API_BASE_URL}/HR/ApproveStaffRegistration`,
            payload,
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000,   // documents upload can be slow
            }
        );

        console.log('✅ Approve Staff Registration Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('🔴 Full error response:', JSON.stringify(error.response?.data, null, 2));
        console.error('🔴 Response body raw:', error.response?.request?.responseText);
        console.error('❌ Approve Staff Registration API Error:', error.response || error);
        console.error('❌ Error Details:', {
            message:      error.message,
            status:       error.response?.status,
            statusText:   error.response?.statusText,
            responseData: error.response?.data,
            responseBody: JSON.stringify(error.response?.data, null, 2),
        });
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to approve/reject staff registration';
    }
};

// ==============================================
// DOCUMENT HELPERS (re-exported for verify page)
// ==============================================

// Convert File object to pure base64 (no data URI prefix)
export const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload  = () => resolve(reader.result.split(',')[1]);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
};

// Determine FileType string from File object
export const getFileType = (file) => {
    if (file.type === 'application/pdf') return 'PDF';
    return 'Image'; // jpeg, png, etc.
};