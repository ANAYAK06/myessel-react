import axios from "axios";
import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// BULK WORKER REGISTRATION APIs
// ==============================================

// Shared mapper — camelCase frontend → PascalCase for SP JSON
const mapWorker = (w) => ({
    SerialNo:       parseInt(w.serialNo) || 0,
    FirstName:      w.firstName?.toString() || '',
    LastName:       w.lastName?.toString() || '',
    CostCenter:     w.costCenter?.toString() || '',
    LabourType:     w.labourType?.toString() || '',
    ContractorCode: w.contractorCode?.toString() || '',
    Group:          w.group?.toString() || '',
    FatherName:     w.fatherName?.toString() || '',
    DOB:            w.dob?.toString() || '',
    JoiningDate:    w.joiningDate?.toString() || '',
    BankName:       w.bankName?.toString() || '',
    IFSCCode:       w.ifscCode?.toString() || '',
    BankAddress:    w.bankAddress?.toString() || '',
    BankAccountNo:  w.bankAccountNo?.toString() || '',
    Gender:         w.gender?.toString() || '',
    MobileNo:       w.mobileNo?.toString() || '',
    JobType:        w.jobType?.toString() || '',
    Department:     w.department?.toString() || '',
    AadharNo:       w.aadharNo?.toString() || '',
    ProbationDays:  parseInt(w.probationDays) || 0,
    IsPFExist:      w.isPFExist?.toString() || '',
    IsESIExist:     w.isESIExist?.toString() || '',
    UANNumber:      w.uanNumber?.toString() || '',
    ReportToRole:   w.reportToRole?.toString() || '',
    ESINumber:      w.esiNumber?.toString() || '',
    Designation:    w.designation?.toString() || '',
});

// 1. Validate Worker Excel Data (POST)
export const validateWorkerExcelData = async (params) => {
    try {
        if (!params.lstWorker || params.lstWorker.length === 0) throw new Error('Worker list is required');
        if (!params.createdBy) throw new Error('Created By is required');

        const mappedWorkers = (params.lstWorker || []).map(mapWorker);
        const payload = {
            SheetData:        JSON.stringify(mappedWorkers),  // SP reads @EmpJsonData from this field
            lstWorker:        mappedWorkers,
            Createdby:        params.createdBy?.toString() || '',
            UserName:         params.userName?.toString() || '',
            RoleId:           parseInt(params.roleId) || 0,
            MOID:             parseInt(params.moid) || 0,
            Action:           'Validate',
            TransactionRefNo: params.transactionRefNo?.toString() || '',
            Id:               parseInt(params.id) || 0,
            WorkerCount:      params.lstWorker?.length || 0,
            Note:             params.note?.toString() || '',
        };

        const response = await axios.post(
            `${API_BASE_URL}/HR/ValidateWorkerExcelData`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        // Controller returns ResponseResult<BulkWorkerError> — unwrap the Data field
        return response.data?.Data ?? response.data;
    } catch (error) {
        console.error('❌ Validate Worker Excel API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};

// 2. Save Worker Staff Registration (POST)
export const saveWorkerStaffRegistration = async (params) => {
    try {
        if (!params.lstWorker || params.lstWorker.length === 0) throw new Error('Worker list is required');
        if (!params.createdBy) throw new Error('Created By is required');

        const mappedWorkers = (params.lstWorker || []).map(mapWorker);
        const payload = {
            SheetData:        JSON.stringify(mappedWorkers),  // SP reads @EmpJsonData from this field
            lstWorker:        mappedWorkers,
            Createdby:        params.createdBy?.toString() || '',
            UserName:         params.userName?.toString() || '',
            RoleId:           parseInt(params.roleId) || 0,
            MOID:             parseInt(params.moid) || 0,
            Action:           'Save',
            TransactionRefNo: params.transactionRefNo?.toString() || '',
            Id:               parseInt(params.id) || 0,
            WorkerCount:      params.lstWorker?.length || 0,
            Note:             params.note?.toString() || '',
        };

        const response = await axios.post(
            `${API_BASE_URL}/HR/WorkerStaffRegistration`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        // Controller returns ResponseResult<BulkWorkerError> — unwrap the Data field
        return response.data?.Data ?? response.data;
    } catch (error) {
        console.error('❌ Save Worker Registration API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};

// 3. Get Verify Bulk Worker List (GET)
export const getVerifyBulkWorker = async (roleId) => {
    try {
        console.log('📋 Getting Verify Bulk Worker List for RoleID:', roleId);
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetVerifyBulkWorker`);

        const response = await axios.get(
            `${API_BASE_URL}/HR/GetVerifyBulkWorker`,
            {
                params: { RoleID: roleId },
                headers: { 'Content-Type': 'application/json' }
            }
        );
        console.log('✅ Verify Bulk Worker List Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get Verify Bulk Worker API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};

// 4. Get Bulk Worker Data by ID (GET)
export const getBulkWorkerDataById = async ({ transRefno, id }) => {
    try {
        console.log('📋 Getting Bulk Worker Data - TransRefno:', transRefno, 'Id:', id);
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetBulkWorkerDatabyId`);

        const response = await axios.get(
            `${API_BASE_URL}/HR/GetBulkWorkerDatabyId`,
            {
                params: { TransRefno: transRefno, Id: id },
                headers: { 'Content-Type': 'application/json' }
            }
        );
        console.log('✅ Bulk Worker Data Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get Bulk Worker Data API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};

// 5. Approve / Return Bulk Worker (PUT)
export const approveBulkWorker = async (params) => {
    try {
        console.log('✅ Approving/Returning Bulk Worker - raw params:', params);

        if (!params.action) throw new Error('Action is required');
        if (!params.createdBy) throw new Error('Created By is required');
        if (!params.roleId) throw new Error('Role ID is required');

        const payload = {
            SheetData:        params.sheetData?.toString() || '',
            lstWorker:        (params.lstWorker || []).map(w => ({
                SerialNo:       parseInt(w.SerialNo ?? w.serialNo) || 0,
                FirstName:      (w.FirstName ?? w.firstName)?.toString() || '',
                LastName:       (w.LastName ?? w.lastName)?.toString() || '',
                CostCenter:     (w.CostCenter ?? w.costCenter)?.toString() || '',
                LabourType:     (w.LabourType ?? w.labourType)?.toString() || '',
                ContractorCode: (w.ContractorCode ?? w.contractorCode)?.toString() || '',
                Group:          (w.Group ?? w.group)?.toString() || '',
                FatherName:     (w.FatherName ?? w.fatherName)?.toString() || '',
                DOB:            (w.DOB ?? w.dob)?.toString() || '',
                JoiningDate:    (w.JoiningDate ?? w.joiningDate)?.toString() || '',
                BankName:       (w.BankName ?? w.bankName)?.toString() || '',
                IFSCCode:       (w.IFSCCode ?? w.ifscCode)?.toString() || '',
                BankAddress:    (w.BankAddress ?? w.bankAddress)?.toString() || '',
                BankAccountNo:  (w.BankAccountNo ?? w.bankAccountNo)?.toString() || '',
                Gender:         (w.Gender ?? w.gender)?.toString() || '',
                MobileNo:       (w.MobileNo ?? w.mobileNo)?.toString() || '',
                JobType:        (w.JobType ?? w.jobType)?.toString() || '',
                Department:     (w.Department ?? w.department)?.toString() || '',
                AadharNo:       (w.AadharNo ?? w.aadharNo)?.toString() || '',
                ProbationDays:  parseInt(w.ProbationDays ?? w.probationDays) || 0,
                IsPFExist:      (w.IsPFExist ?? w.isPFExist)?.toString() || '',
                IsESIExist:     (w.IsESIExist ?? w.isESIExist)?.toString() || '',
                UANNumber:      (w.UANNumber ?? w.uanNumber)?.toString() || '',
                ReportToRole:   (w.ReportToRole ?? w.reportToRole)?.toString() || '',
                ESINumber:      (w.ESINumber ?? w.esiNumber)?.toString() || '',
                Designation:    (w.Designation ?? w.designation)?.toString() || '',
            })),
            Createdby:        params.createdBy?.toString() || '',
            RoleId:           parseInt(params.roleId) || 0,
            MOID:             parseInt(params.moid) || 0,
            Action:           params.action?.toString() || '',
            TransactionRefNo: params.transactionRefNo?.toString() || '',
            Id:               parseInt(params.id) || 0,
            WorkerCount:      params.lstWorker?.length || 0,
            Note:             params.note?.toString() || '',
        };

        console.log('📋 Approve Payload:', payload);
        const response = await axios.put(
            `${API_BASE_URL}/HR/ApproveBulkWorker`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('✅ Approve Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Approve Bulk Worker API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};
