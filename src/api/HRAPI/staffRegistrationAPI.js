import axios from "axios";
import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// STAFF REGISTRATION APIs
// ==============================================

// 1. Get All Employee Groups (GET)
export const getAllEmpGroups = async () => {
    try {
        console.log('📋 Getting All Employee Groups');
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetAllEmpGroups`);

        const response = await axios.get(
            `${API_BASE_URL}/HR/GetAllEmpGroups`,
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('✅ All Employee Groups Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get All Employee Groups API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};

// 2. Get All Employee Categories (GET)
export const getAllEmpCategories = async () => {
    try {
        console.log('📋 Getting All Employee Categories');
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetAllEmpCategories`);

        const response = await axios.get(
            `${API_BASE_URL}/HR/GetAllEmpCategories`,
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('✅ All Employee Categories Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get All Employee Categories API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};

// 3. Save Staff Registration (POST) - Calls spInsertStaffRegistration
export const saveStaffRegistration = async (params) => {
    try {
        console.log('💾 Saving Staff Registration - raw params:', params);

        // ── Validate required fields ──────────────────────────────────────────
        if (!params.joiningType) throw new Error('Joining Type is required');
        if (!params.category) throw new Error('Employee Category is required');
        if (!params.firstName) throw new Error('First Name is required');
        if (!params.lastName) throw new Error('Last Name is required');
        if (!params.dob) throw new Error('Date of Birth is required');
        if (!params.gender) throw new Error('Gender is required');
        if (!params.designationId) throw new Error('Designation ID is required');
        if (!params.joiningDate) throw new Error('Joining Date is required');
        if (!params.departmentId) throw new Error('Department ID is required');
        if (!params.roleId) throw new Error('Role ID is required');
        if (!params.createdBy) throw new Error('Created By is required');
        if (!params.groupId) throw new Error('Group ID is required');


        const payload = {
            JoiningType: params.joiningType?.toString() || '',
            Category: params.category?.toString() || '',
            Appointmenttype: params.appointmentType?.toString() || '',
            FirstName: params.firstName?.toString() || '',
            LastName: params.lastName?.toString() || '',
            MiddleName: params.middleName?.toString() || '',
            DateofBirth: params.dob?.toString() || '',
            EmpAge: params.empAge?.toString() || '',
            Gender: params.gender?.toString() || '',
            MartialStatus: params.martialStatus?.toString() || '',
            DateofMarriage: params.dateofMarriage?.toString() || '',
            NomineeName: params.nomineeName?.toString() || '',
            NomineeRelation: params.nomineeRelation?.toString() || '',
            NomineeDateofBirth: params.nomineeDateofBirth?.toString() || '',
            NomineeAge: params.nomineeAge?.toString() || '',
            ContactWorkPhone: params.contactWorkPhone?.toString() || '',
            ContactMobile: params.contactMobile?.toString() || '',
            PlaceofBirth: params.placeofBirth?.toString() || '',
            WorkEmail: params.workEmail?.toString() || '',
            PermanentAddress: params.permanentAddress?.toString() || '',
            PresentAddress: params.presentAddress?.toString() || '',
            Experience: params.experience?.toString() || '',
            DesignationId: parseInt(params.designationId),
            JoiningDate: params.joiningDate?.toString() || '',
            JobType: params.jobType?.toString() || '',
            JoiningCostCenter: params.joiningCostCenter?.toString() || '',
            TransitDay: parseInt(params.transitDay) || 0,
            ReportTo: params.reportTo?.toString() || '',
            DepartmentId: parseInt(params.departmentId),
            BankName: params.bankName?.toString() || '',
            BankAccountNo: params.bankAccountNo?.toString() || '',
            IFSCcode: params.ifscCode?.toString() || '',
            BankAddress: params.bankAddress?.toString() || '',
            FMName: params.fmName?.toString() || '',
            FMDateofBirth: params.fmDateofBirth?.toString() || '',
            FMAge: params.fmAge?.toString() || '',
            FMGender: params.fmGender?.toString() || '',
            FMRelation: params.fmRelation?.toString() || '',
            FMMobileNo: params.fmMobileNo?.toString() || '',
            ChildName: params.childName?.toString() || '',
            ChildDateofBirth: params.childDateofBirth?.toString() || '',
            ChildAge: params.childAge?.toString() || '',
            ChildGender: params.childGender?.toString() || '',
            ChildMaritalStatus: params.childMaritalStatus?.toString() || '',
            AcademicClass: params.academicClass?.toString() || '',
            NameofUniversity: params.nameofUniversity?.toString() || '',
            FromYear: params.fromYear?.toString() || '',
            ToYear: params.toYear?.toString() || '',
            Percentage: params.percentage?.toString() || '',
            TechnicalSkill: params.technicalSkill?.toString() || '',
            TechInstitutionName: params.techInstitutionName?.toString() || '',
            TechFromYear: params.techFromYear?.toString() || '',
            TechToYear: params.techToYear?.toString() || '',
            TechPercentage: params.techPercentage?.toString() || '',
            OrganisationName: params.organisationName?.toString() || '',
            ExpFromYear: params.expFromYear?.toString() || '',
            ExpToYear: params.expToYear?.toString() || '',
            Role: params.role?.toString() || '',
            Mobilenos: params.mobilenos?.toString() || '',
            UANExist: params.uanExist === true || params.uanExist === 'true',
            UANNumber: params.uanNumber?.toString() || '',
            ESINumber: params.esiNumber?.toString() || '',
            Createdby: params.createdBy.toString(),
            RoleId: parseInt(params.roleId),
            AdharNo: params.adharNo?.toString() || '',
            PanNo: params.panNo?.toString() || '',
            ReportToRoleId: parseInt(params.reportToRoleId) || 0,
            PFExist: params.pfExist?.toString() || '',
            ESIExist: params.esiExist?.toString() || '',
            GroupId: parseInt(params.groupId),
            Probationdays: parseFloat(params.probationdays) || 0,
            ContractStartDate: params.contractStartDate?.toString() || '',
            ContractEndDate: params.contractEndDate?.toString() || '',
            RefName: params.refName?.toString() || '',
            RefRelation: params.refRelation?.toString() || '',
            RefMobileNo: params.refMobileNo?.toString() || '',
            RefRemarks: params.refRemarks?.toString() || '',
            ExpRemarks: params.expRemarks?.toString() || '',
            ExpContactNames: params.expContactNames?.toString() || '',
            DocumentData: Array.isArray(params.documents)
                ? params.documents.map(doc => ({
                    DocName: doc.docName || '',
                    PDFBaseData: doc.base64 || '',   // pure base64, NO "data:image/..." prefix
                    FileType: doc.fileType || '',   // "Image" or "PDF"
                    Path: ''
                }))
                : [],
        };

        console.log('🔗 API URL:', `${API_BASE_URL}/HR/SaveStaffRegistration`);
        console.log('📦 Payload:', payload);

        const response = await axios.post(
            `${API_BASE_URL}/HR/SaveStaffRegistration`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );

        console.log('✅ Save Staff Registration Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Save Staff Registration API Error:', error.response || error);
        console.error('❌ Error Details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to save Staff Registration';
    }
};

// 4. Update Rejoin Staff Registration (PUT) - Calls UpdateRejoinStaffRegistration
export const updateRejoinStaffRegistration = async (params) => {
    try {
        console.log('🔄 Updating Rejoin Staff Registration - raw params:', params);

        // ── Validate required fields ──────────────────────────────────────────
        if (!params.joiningType) throw new Error('Joining Type is required');
        if (!params.firstName) throw new Error('First Name is required');
        if (!params.lastName) throw new Error('Last Name is required');
        if (!params.designationId) throw new Error('Designation ID is required');
        if (!params.joiningDate) throw new Error('Joining Date is required');
        if (!params.departmentId) throw new Error('Department ID is required');
        if (!params.roleId) throw new Error('Role ID is required');
        if (!params.createdBy) throw new Error('Created By is required');
        if (!params.groupId) throw new Error('Group ID is required');

        // ── Build payload matching UpdateRejoinStaffRegistration SP ───────────
        const payload = {
            JoiningType: params.joiningType?.toString() || '',
            Category: params.category?.toString() || '',
            Appointmenttype: params.appointmentType?.toString() || '',
            FirstName: params.firstName?.toString() || '',
            LastName: params.lastName?.toString() || '',
            MiddleName: params.middleName?.toString() || '',
            DateofBirth: params.dob?.toString() || '',
            EmpAge: params.empAge?.toString() || '',
            Gender: params.gender?.toString() || '',
            MartialStatus: params.martialStatus?.toString() || '',
            DateofMarriage: params.dateofMarriage?.toString() || '',
            NomineeName: params.nomineeName?.toString() || '',
            NomineeRelation: params.nomineeRelation?.toString() || '',
            NomineeDateofBirth: params.nomineeDateofBirth?.toString() || '',
            NomineeAge: params.nomineeAge?.toString() || '',
            ContactWorkPhone: params.contactWorkPhone?.toString() || '',
            ContactMobile: params.contactMobile?.toString() || '',
            PlaceofBirth: params.placeofBirth?.toString() || '',
            WorkEmail: params.workEmail?.toString() || '',
            PermanentAddress: params.permanentAddress?.toString() || '',
            PresentAddress: params.presentAddress?.toString() || '',
            Experience: params.experience?.toString() || '',
            DesignationId: parseInt(params.designationId),
            JoiningDate: params.joiningDate?.toString() || '',
            JobType: params.jobType?.toString() || '',
            JoiningCostCenter: params.joiningCostCenter?.toString() || '',
            TransitDay: parseInt(params.transitDay) || 0,
            ReportTo: params.reportTo?.toString() || '',
            DepartmentId: parseInt(params.departmentId),
            BankName: params.bankName?.toString() || '',
            BankAccountNo: params.bankAccountNo?.toString() || '',
            IFSCcode: params.ifscCode?.toString() || '',
            BankAddress: params.bankAddress?.toString() || '',
            FMName: params.fmName?.toString() || '',
            FMDateofBirth: params.fmDateofBirth?.toString() || '',
            FMAge: params.fmAge?.toString() || '',
            FMGender: params.fmGender?.toString() || '',
            FMRelation: params.fmRelation?.toString() || '',
            FMMobileNo: params.fmMobileNo?.toString() || '',
            ChildName: params.childName?.toString() || '',
            ChildDateofBirth: params.childDateofBirth?.toString() || '',
            ChildAge: params.childAge?.toString() || '',
            ChildGender: params.childGender?.toString() || '',
            ChildMaritalStatus: params.childMaritalStatus?.toString() || '',
            AcademicClass: params.academicClass?.toString() || '',
            NameofUniversity: params.nameofUniversity?.toString() || '',
            FromYear: params.fromYear?.toString() || '',
            ToYear: params.toYear?.toString() || '',
            Percentage: params.percentage?.toString() || '',
            TechnicalSkill: params.technicalSkill?.toString() || '',
            TechInstitutionName: params.techInstitutionName?.toString() || '',
            TechFromYear: params.techFromYear?.toString() || '',
            TechToYear: params.techToYear?.toString() || '',
            TechPercentage: params.techPercentage?.toString() || '',
            OrganisationName: params.organisationName?.toString() || '',
            ExpFromYear: params.expFromYear?.toString() || '',
            ExpToYear: params.expToYear?.toString() || '',
            Role: params.role?.toString() || '',
            Mobilenos: params.mobilenos?.toString() || '',
            UANExist: params.uanExist === true || params.uanExist === 'true',
            UANNumber: params.uanNumber?.toString() || '',
            ESINumber: params.esiNumber?.toString() || '',
            Createdby: params.createdBy.toString(),
            RoleId: parseInt(params.roleId),
            AdharNo: params.adharNo?.toString() || '',
            PanNo: params.panNo?.toString() || '',
            ReportToRoleId: parseInt(params.reportToRoleId) || 0,
            PFExist: params.pfExist?.toString() || '',
            ESIExist: params.esiExist?.toString() || '',
            GroupId: parseInt(params.groupId),
            Probationdays: parseFloat(params.probationdays) || 0,
            ContractStartDate: params.contractStartDate?.toString() || '',
            ContractEndDate: params.contractEndDate?.toString() || '',
            RefName: params.refName?.toString() || '',
            RefRelation: params.refRelation?.toString() || '',
            RefMobileNo: params.refMobileNo?.toString() || '',
            RefRemarks: params.refRemarks?.toString() || '',
            ExpRemarks: params.expRemarks?.toString() || '',
            ExpContactNames: params.expContactNames?.toString() || '',
            DocumentData: Array.isArray(params.documents)
                ? params.documents.map(doc => ({
                    DocName: doc.docName || '',
                    PDFBaseData: doc.base64 || '',   // pure base64, NO "data:image/..." prefix
                    FileType: doc.fileType || '',   // "Image" or "PDF"
                    Path: ''
                }))
                : [],
        };

        console.log('🔗 API URL:', `${API_BASE_URL}/HR/UpdateRejoinStaffRegistration`);
        console.log('📦 Payload:', payload);

        const response = await axios.put(
            `${API_BASE_URL}/HR/UpdateRejoinStaffRegistration`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );

        console.log('✅ Update Rejoin Staff Registration Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Update Rejoin Staff Registration API Error:', error.response || error);
        console.error('❌ Error Details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to update Rejoin Staff Registration';
    }
};

// 5. Update Staff Registration (PUT) - Calls UpdateStaffRegistration
export const updateStaffRegistration = async (params) => {
    try {
        console.log('✏️ Updating Staff Registration - raw params:', params);

        // ── Validate required fields ──────────────────────────────────────────
        if (!params.joiningType) throw new Error('Joining Type is required');
        if (!params.firstName) throw new Error('First Name is required');
        if (!params.lastName) throw new Error('Last Name is required');
        if (!params.designationId) throw new Error('Designation ID is required');
        if (!params.joiningDate) throw new Error('Joining Date is required');
        if (!params.departmentId) throw new Error('Department ID is required');
        if (!params.roleId) throw new Error('Role ID is required');
        if (!params.createdBy) throw new Error('Created By is required');
        if (!params.groupId) throw new Error('Group ID is required');

        // ── Build payload matching UpdateStaffRegistration SP ─────────────────
        const payload = {
            JoiningType: params.joiningType?.toString() || '',
            Category: params.category?.toString() || '',
            Appointmenttype: params.appointmentType?.toString() || '',
            FirstName: params.firstName?.toString() || '',
            LastName: params.lastName?.toString() || '',
            MiddleName: params.middleName?.toString() || '',
            DateofBirth: params.dob?.toString() || '',
            EmpAge: params.empAge?.toString() || '',
            Gender: params.gender?.toString() || '',
            MartialStatus: params.martialStatus?.toString() || '',
            DateofMarriage: params.dateofMarriage?.toString() || '',
            NomineeName: params.nomineeName?.toString() || '',
            NomineeRelation: params.nomineeRelation?.toString() || '',
            NomineeDateofBirth: params.nomineeDateofBirth?.toString() || '',
            NomineeAge: params.nomineeAge?.toString() || '',
            ContactWorkPhone: params.contactWorkPhone?.toString() || '',
            ContactMobile: params.contactMobile?.toString() || '',
            PlaceofBirth: params.placeofBirth?.toString() || '',
            WorkEmail: params.workEmail?.toString() || '',
            PermanentAddress: params.permanentAddress?.toString() || '',
            PresentAddress: params.presentAddress?.toString() || '',
            Experience: params.experience?.toString() || '',
            DesignationId: parseInt(params.designationId),
            JoiningDate: params.joiningDate?.toString() || '',
            JobType: params.jobType?.toString() || '',
            JoiningCostCenter: params.joiningCostCenter?.toString() || '',
            TransitDay: parseInt(params.transitDay) || 0,
            ReportTo: params.reportTo?.toString() || '',
            DepartmentId: parseInt(params.departmentId),
            BankName: params.bankName?.toString() || '',
            BankAccountNo: params.bankAccountNo?.toString() || '',
            IFSCcode: params.ifscCode?.toString() || '',
            BankAddress: params.bankAddress?.toString() || '',
            FMName: params.fmName?.toString() || '',
            FMDateofBirth: params.fmDateofBirth?.toString() || '',
            FMAge: params.fmAge?.toString() || '',
            FMGender: params.fmGender?.toString() || '',
            FMRelation: params.fmRelation?.toString() || '',
            FMMobileNo: params.fmMobileNo?.toString() || '',
            ChildName: params.childName?.toString() || '',
            ChildDateofBirth: params.childDateofBirth?.toString() || '',
            ChildAge: params.childAge?.toString() || '',
            ChildGender: params.childGender?.toString() || '',
            ChildMaritalStatus: params.childMaritalStatus?.toString() || '',
            AcademicClass: params.academicClass?.toString() || '',
            NameofUniversity: params.nameofUniversity?.toString() || '',
            FromYear: params.fromYear?.toString() || '',
            ToYear: params.toYear?.toString() || '',
            Percentage: params.percentage?.toString() || '',
            TechnicalSkill: params.technicalSkill?.toString() || '',
            TechInstitutionName: params.techInstitutionName?.toString() || '',
            TechFromYear: params.techFromYear?.toString() || '',
            TechToYear: params.techToYear?.toString() || '',
            TechPercentage: params.techPercentage?.toString() || '',
            OrganisationName: params.organisationName?.toString() || '',
            ExpFromYear: params.expFromYear?.toString() || '',
            ExpToYear: params.expToYear?.toString() || '',
            Role: params.role?.toString() || '',
            Mobilenos: params.mobilenos?.toString() || '',
            UANExist: params.uanExist === true || params.uanExist === 'true',
            UANNumber: params.uanNumber?.toString() || '',
            ESINumber: params.esiNumber?.toString() || '',
            Createdby: params.createdBy.toString(),
            RoleId: parseInt(params.roleId),
            AdharNo: params.adharNo?.toString() || '',
            PanNo: params.panNo?.toString() || '',
            ReportToRoleId: parseInt(params.reportToRoleId) || 0,
            PFExist: params.pfExist?.toString() || '',
            ESIExist: params.esiExist?.toString() || '',
            GroupId: parseInt(params.groupId),
            Probationdays: parseFloat(params.probationdays) || 0,
            ContractStartDate: params.contractStartDate?.toString() || '',
            ContractEndDate: params.contractEndDate?.toString() || '',
            RefName: params.refName?.toString() || '',
            RefRelation: params.refRelation?.toString() || '',
            RefMobileNo: params.refMobileNo?.toString() || '',
            RefRemarks: params.refRemarks?.toString() || '',
            ExpRemarks: params.expRemarks?.toString() || '',
            ExpContactNames: params.expContactNames?.toString() || '',
            DocumentData: Array.isArray(params.documents)
                ? params.documents.map(doc => ({
                    DocName: doc.docName || '',
                    PDFBaseData: doc.base64 || '',   // pure base64, NO "data:image/..." prefix
                    FileType: doc.fileType || '',   // "Image" or "PDF"
                    Path: ''
                }))
                : [],
        };

        console.log('🔗 API URL:', `${API_BASE_URL}/HR/UpdateStaffRegistration`);
        console.log('📦 Payload:', payload);

        const response = await axios.put(
            `${API_BASE_URL}/HR/UpdateStaffRegistration`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );

        console.log('✅ Update Staff Registration Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Update Staff Registration API Error:', error.response || error);
        console.error('❌ Error Details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to update Staff Registration';
    }
};

// ==============================================
// EMPLOYEE LOOKUP / DROPDOWN APIs
// ==============================================

// 6. Get Old Employee For Rejoin (GET)
export const getOldEmpForRejoin = async ({ category, prefix, groupId }) => {
    try {
        console.log('🔍 Getting Old Employee For Rejoin');
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetOldEmpForRejoin`);
        console.log('📦 Params:', { Category: category, Prefix: prefix, GroupId: groupId });

        const response = await axios.get(
            `${API_BASE_URL}/HR/GetOldEmpForRejoin`,
            {
                params: {
                    Category: category,
                    Prefix: prefix,
                    GroupId: groupId,
                },
                headers: { 'Content-Type': 'application/json' },
            }
        );
        console.log('✅ Get Old Employee For Rejoin Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get Old Employee For Rejoin API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to get old employee for rejoin';
    }
};

// 7. Get Employee Degrees (GET)
export const getEmpDegrees = async () => {
    try {
        console.log('🎓 Getting Employee Degrees');
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetEmpDegrees`);

        const response = await axios.get(
            `${API_BASE_URL}/HR/GetEmpDegrees`,
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('✅ Get Employee Degrees Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get Employee Degrees API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to get employee degrees';
    }
};

// 8. Get Employee Documents - Type of Documents (GET)
export const getEmpDocuments = async () => {
    try {
        console.log('📄 Getting Employee Document Types');
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetEmpDocuments`);

        const response = await axios.get(
            `${API_BASE_URL}/HR/GetEmpDocuments`,
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('✅ Get Employee Documents Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get Employee Documents API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to get employee document types';
    }
};

// 9. Get Report-To Role (GET)
export const getReportToRole = async (categoryId) => {
    try {
        console.log('👥 Getting Report-To Role');
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetReportToRole`);
        console.log('📦 Params:', { Categoryid: categoryId });

        const response = await axios.get(
            `${API_BASE_URL}/HR/GetReportToRole`,
            {
                params: { Categoryid: categoryId },
                headers: { 'Content-Type': 'application/json' },
            }
        );
        console.log('✅ Get Report-To Role Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get Report-To Role API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to get report-to role';
    }
};

// ==============================================
// DESIGNATION APIs
// ==============================================

// 10. Get All Designations (GET)
export const getAllDesignations = async () => {
    try {
        console.log('🏷️ Getting All Designations');
        console.log('🔗 API URL:', `${API_BASE_URL}/Accounts/GetAllDesignations`);

        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetAllDesignations`,
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('✅ Get All Designations Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get All Designations API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to get all designations';
    }
};

// 11. Save Designation (POST) - Calls spInsertDesignation
// Action: 'Insert' for new, 'Update' for existing
export const saveDesignation = async (params) => {
    try {
        console.log('💾 Saving Designation - raw params:', params);

        if (!params.action) throw new Error('Action is required');
        if (!params.designationName) throw new Error('Designation Name is required');
        if (!params.createdBy) throw new Error('Created By is required');

        const payload = {
            Action: params.action.toString(),
            DesignationName: params.designationName.toString(),
            DesignationId: parseInt(params.designationId) || 0,
            Createdby: params.createdBy.toString(),
        };

        console.log('🔗 API URL:', `${API_BASE_URL}/Accounts/SaveDesignation`);
        console.log('📦 Payload:', payload);

        const response = await axios.post(
            `${API_BASE_URL}/Accounts/SaveDesignation`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );

        console.log('✅ Save Designation Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Save Designation API Error:', error.response || error);
        console.error('❌ Error Details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
        });
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to save designation';
    }
};

// ==============================================
// DEPARTMENT APIs
// ==============================================

// 12. Get All Departments (GET)
export const getAllDepartments = async () => {
    try {
        console.log('🏢 Getting All Departments');
        console.log('🔗 API URL:', `${API_BASE_URL}/Accounts/GetAllDeparments`);

        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetAllDeparments`,
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('✅ Get All Departments Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get All Departments API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to get all departments';
    }
};

// 13. Save Department (POST) - Calls spInsertDepartment
export const saveDepartment = async (params) => {
    try {
        console.log('💾 Saving Department - raw params:', params);

        if (!params.departmentName) throw new Error('Department Name is required');
        if (!params.createdBy) throw new Error('Created By is required');

        const payload = {
            DepartmentName: params.departmentName.toString(),
            CreatedBy: params.createdBy.toString(),
        };

        console.log('🔗 API URL:', `${API_BASE_URL}/Accounts/SaveDepartment`);
        console.log('📦 Payload:', payload);

        const response = await axios.post(
            `${API_BASE_URL}/Accounts/SaveDepartment`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );

        console.log('✅ Save Department Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Save Department API Error:', error.response || error);
        console.error('❌ Error Details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
        });
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to save department';
    }
};

// ==============================================
// EMPLOYEE BANK APIs
// ==============================================

// 14. Get Employee Banks (GET)
export const getEmployeeBanks = async () => {
    try {
        console.log('🏦 Getting Employee Banks');
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetEmployeeBanks`);

        const response = await axios.get(
            `${API_BASE_URL}/HR/GetEmployeeBanks`,
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('✅ Get Employee Banks Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get Employee Banks API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to get employee banks';
    }
};

// 15. Get All Cost Centers (GET)
export const getAllCostCenters = async () => {
    try {
        console.log('🏗️ Getting All Cost Centers');
        console.log('🔗 API URL:', `${API_BASE_URL}/Accounts/GetAllCostCenters`);

        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetAllCostCenters`,
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('✅ Get All Cost Centers Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get All Cost Centers API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to get all cost centers';
    }
};

// 16. Save Employee Bank (POST) - Calls spInsertEmployeeBank
// Action: 'Insert' for new, 'Update' for existing
export const saveEmployeeBank = async (params) => {
    try {
        console.log('💾 Saving Employee Bank - raw params:', params);

        if (!params.action) throw new Error('Action is required');
        if (!params.bankName) throw new Error('Bank Name is required');
        if (!params.createdBy) throw new Error('Created By is required');

        const payload = {
            Action: params.action.toString(),
            BankName: params.bankName.toString(),
            Bankid: parseInt(params.bankId) || 0,
            CreatedBy: params.createdBy.toString(),
        };

        console.log('🔗 API URL:', `${API_BASE_URL}/HR/SaveEmployeeBank`);
        console.log('📦 Payload:', payload);

        const response = await axios.post(
            `${API_BASE_URL}/HR/SaveEmployeeBank`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );

        console.log('✅ Save Employee Bank Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Save Employee Bank API Error:', error.response || error);
        console.error('❌ Error Details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
        });
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to save employee bank';
    }
};

// ==============================================
// DOCUMENT HELPERS
// ==============================================

// Convert File object to pure base64 (no data URI prefix)
export const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result.split(',')[1]; // strip "data:image/jpeg;base64,"
            resolve(base64);
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
};

// Determine FileType string from File object
export const getFileType = (file) => {
    if (file.type === 'application/pdf') return 'PDF';
    return 'Image'; // jpeg, png, etc.
};