import axios from "axios";
import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// STAFF REGISTRATION & APPROVAL RELATED APIs
// ==============================================

// 1. Get Verification Staff by Role ID
export const getVerificationStaff = async (roleId) => {
    try {
        console.log('👥 Getting Verification Staff for Role ID:', roleId); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/HR/GetVerificationStaff?Roleid=${roleId}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Verification Staff Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Verification Staff API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 2. Get Verification Staff Data by ID
export const getVerificationStaffDataById = async (params) => {
    try {
        const { empRefNo, roleId } = params;
        console.log('🔍 Getting Verification Staff Data for:', { empRefNo, roleId }); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/HR/GetStaffMainDatabyId?EmpRefNo=${empRefNo}&RoleId=${roleId}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Verification Staff Data Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Verification Staff Data API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 3. Approve Staff Registration
export const approveStaffRegistration = async (approvalData) => {
    try {
        console.log('🎯 Approving Staff Registration...');
        console.log('📊 Payload Summary:', {
            EmpRefNo: approvalData.EmpRefNo,
            Action: approvalData.Action,
            RoleId: approvalData.RoleId,
            Createdby: approvalData.Createdby,
            totalParameters: Object.keys(approvalData).length
        });
        
        // Build payload matching backend stored procedure parameters exactly
        const payload = {
            // Basic Employee Info
            EmpRefNo: approvalData.EmpRefNo?.toString().trim() || '',
            JoiningType: approvalData.JoiningType?.toString().trim() || '',
            Category: approvalData.Category?.toString().trim() || '', // Maps to @EmpCategory
            Appointmenttype: approvalData.Appointmenttype?.toString().trim() || '',
            
            // Personal Details
            FirstName: approvalData.FirstName?.toString().trim() || '',
            LastName: approvalData.LastName?.toString().trim() || '',
            MiddleName: approvalData.MiddleName?.toString().trim() || '',
            DateofBirth: approvalData.DateofBirth?.toString().trim() || '', // Maps to @DOB
            EmpAge: approvalData.EmpAge?.toString().trim() || '', // Maps to @Age
            Gender: approvalData.Gender?.toString().trim() || '',
            MartialStatus: approvalData.MartialStatus?.toString().trim() || '', // Maps to @Martialstatus
            DateofMarriage: approvalData.DateofMarriage?.toString().trim() || '', // Maps to @DOMarriage
            
            // Nominee Details
            NomineeName: approvalData.NomineeName?.toString().trim() || '',
            NomineeRelation: approvalData.NomineeRelation?.toString().trim() || '', // Maps to @Relation
            NomineeDateofBirth: approvalData.NomineeDateofBirth?.toString().trim() || '', // Maps to @NomineeDOB
            NomineeAge: approvalData.NomineeAge?.toString().trim() || '',
            
            // Contact Details
            ContactWorkPhone: approvalData.ContactWorkPhone?.toString().trim() || '', // Maps to @ContactWorkPhoneNo
            ContactMobile: approvalData.ContactMobile?.toString().trim() || '', // Maps to @Mobileno
            PlaceofBirth: approvalData.PlaceofBirth?.toString().trim() || '', // Maps to @PlaceOfBirth
            WorkEmail: approvalData.WorkEmail?.toString().trim() || '', // Maps to @MailId
            PermanentAddress: approvalData.PermanentAddress?.toString().trim() || '',
            PresentAddress: approvalData.PresentAddress?.toString().trim() || '',
            
            // Job Details
            Experience: approvalData.Experience?.toString().trim() || '',
            DesignationId: approvalData.DesignationId ? parseInt(approvalData.DesignationId) : 0,
            JoiningDate: approvalData.JoiningDate?.toString().trim() || '', // Maps to @Joiningdate
            JobType: approvalData.JobType?.toString().trim() || '',
            JoiningCostCenter: approvalData.JoiningCostCenter?.toString().trim() || '', // Maps to @JoiningCC
            TransitDay: approvalData.TransitDay ? parseInt(approvalData.TransitDay) : 0, // Maps to @Transitdays
            ReportTo: approvalData.ReportTo?.toString().trim() || '',
            DepartmentId: approvalData.DepartmentId ? parseInt(approvalData.DepartmentId) : 0,
            
            // Bank Details
            BankName: approvalData.BankName?.toString().trim() || '',
            BankAccountNo: approvalData.BankAccountNo?.toString().trim() || '',
            IFSCcode: approvalData.IFSCcode?.toString().trim() || '', // Maps to @IFSCCode
            BankAddress: approvalData.BankAddress?.toString().trim() || '',
            
            // Family Member Details (Comma-separated strings)
            FMName: approvalData.FMName?.toString().trim() || '', // Maps to @FMNames
            FMDateofBirth: approvalData.FMDateofBirth?.toString().trim() || '', // Maps to @FMDOBs
            FMAge: approvalData.FMAge?.toString().trim() || '', // Maps to @FMAges
            FMGender: approvalData.FMGender?.toString().trim() || '', // Maps to @FMGenders
            FMRelation: approvalData.FMRelation?.toString().trim() || '', // Maps to @FMRelations
            FMMobileNo: approvalData.FMMobileNo?.toString().trim() || '', // Maps to @FMMobilenos
            
            // Children Details (Comma-separated strings)
            ChildName: approvalData.ChildName?.toString().trim() || '', // Maps to @ChildNames
            ChildDateofBirth: approvalData.ChildDateofBirth?.toString().trim() || '', // Maps to @ChildDOBs
            ChildAge: approvalData.ChildAge?.toString().trim() || '', // Maps to @ChildAges
            ChildGender: approvalData.ChildGender?.toString().trim() || '', // Maps to @ChildGenders
            ChildMaritalStatus: approvalData.ChildMaritalStatus?.toString().trim() || '', // Maps to @ChildMaritals
            
            // Academic Details (Comma-separated strings)
            AcademicClass: approvalData.AcademicClass?.toString().trim() || '', // Maps to @AdClasses
            NameofUniversity: approvalData.NameofUniversity?.toString().trim() || '', // Maps to @AdUniversities
            FromYear: approvalData.FromYear?.toString().trim() || '', // Maps to @AdFromyears
            ToYear: approvalData.ToYear?.toString().trim() || '', // Maps to @AdToyears
            Percentage: approvalData.Percentage?.toString().trim() || '', // Maps to @AdPercents
            
            // Technical Skills (Comma-separated strings)
            TechnicalSkill: approvalData.TechnicalSkill?.toString().trim() || '', // Maps to @TechSkills
            TechInstitutionName: approvalData.TechInstitutionName?.toString().trim() || '',
            TechFromYear: approvalData.TechFromYear?.toString().trim() || '',
            TechToYear: approvalData.TechToYear?.toString().trim() || '',
            TechPercentage: approvalData.TechPercentage?.toString().trim() || '',
            
            // Work History (Comma-separated strings)
            OrganisationName: approvalData.OrganisationName?.toString().trim() || '', // Maps to @HTOrganisations
            ExpFromYear: approvalData.ExpFromYear?.toString().trim() || '', // Maps to @HTFromyears
            ExpToYear: approvalData.ExpToYear?.toString().trim() || '', // Maps to @HTToyears
            Role: approvalData.Role?.toString().trim() || '', // Maps to @HTRoles
            Mobilenos: approvalData.Mobilenos?.toString().trim() || '', // Maps to @HTMobilenos
            
            // Approval Details
            RoleId: approvalData.RoleId ? parseInt(approvalData.RoleId) : 0, // Maps to @Roleid
            Createdby: approvalData.Createdby?.toString().trim() || '',
            Action: approvalData.Action?.toString().trim() || '',
            ApprovalNote: approvalData.ApprovalNote?.toString().trim() || '', // Maps to @Note
            
            // Statutory Details
            UANExist: approvalData.UANExist === true || approvalData.UANExist === 'true', // Maps to @Uanexist (Boolean)
            UANNumber: approvalData.UANNumber?.toString().trim() || '', // Maps to @UANNo
            ESINumber: approvalData.ESINumber?.toString().trim() || '',
            UserName: approvalData.UserName?.toString().trim() || '', // Maps to @EmpUserName
            Pwd: approvalData.Pwd?.toString().trim() || '',
            AdharNo: approvalData.AdharNo?.toString().trim() || '', // Maps to @Aadharno
            PanNo: approvalData.PanNo?.toString().trim() || '', // Maps to @Panno
            ReportToRoleId: approvalData.ReportToRoleId ? parseInt(approvalData.ReportToRoleId) : 0,
            PFExist: approvalData.PFExist?.toString().trim() || '',
            ESIExist: approvalData.ESIExist?.toString().trim() || '',
            GroupId: approvalData.GroupId ? parseInt(approvalData.GroupId) : 0,
            Probationdays: approvalData.Probationdays ? parseFloat(approvalData.Probationdays) : 0, // Decimal
            
            // Contract Details
            ContractStartDate: approvalData.ContractStartDate?.toString().trim() || '',
            ContractEndDate: approvalData.ContractEndDate?.toString().trim() || '',
            
            // Reference Details (Comma-separated strings)
            RefName: approvalData.RefName?.toString().trim() || '', // Maps to @RefNames
            RefRelation: approvalData.RefRelation?.toString().trim() || '', // Maps to @RefRelations
            RefMobileNo: approvalData.RefMobileNo?.toString().trim() || '', // Maps to @RefMobileNos
            RefRemarks: approvalData.RefRemarks?.toString().trim() || '',
            
            // Experience Remarks
            ExpRemarks: approvalData.ExpRemarks?.toString().trim() || '', // Maps to @HTExpRemarks
            ExpContactNames: approvalData.ExpContactNames?.toString().trim() || '', // Maps to @HTExpContactNames
            
            // Document Data
            DocumentData: approvalData.DocumentData || []
        };
        
        console.log('📦 Complete Approval Payload prepared with', Object.keys(payload).length, 'parameters');
        
        const response = await axios.put(
            `${API_BASE_URL}/HR/ApproveStaffRegistration`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 30000 // 30 second timeout for complex operations
            }
        );
        
        console.log('✅ Staff Registration Approval Response:', {
            status: response.status,
            data: response.data
        });
        
        return response.data;
        
    } catch (error) {
        console.group('❌ Staff Registration Approval API Error');
        
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', error.response.data);
            
            if (error.response.status === 400) {
                console.error('🔍 400 Bad Request - Check payload field names and data types');
            }
        } else if (error.request) {
            console.error('No Response Received:', error.request);
        } else {
            console.error('Request Setup Error:', error.message);
        }
        
        console.groupEnd();
        
        if (error.response?.data) {
            throw error.response.data;
        } else if (error.response?.status === 400) {
            throw new Error('Bad Request: Invalid data format or missing required fields');
        } else if (error.response?.status === 500) {
            throw new Error('Server Error: Please contact administrator');
        }
        
        throw error;
    }
};

// 4. Get Employee Documents
export const getEmployeeDocuments = async (empRefNo) => {
    try {
        console.log('📄 Getting Employee Documents for EmpRefNo:', empRefNo); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/HR/GetEmployeeDocuments?EmpRefno=${empRefNo}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Employee Documents Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Employee Documents API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};