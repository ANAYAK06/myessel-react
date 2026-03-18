import axios from "axios";
import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// STAFF PAY REVISION VERIFICATION RELATED APIs
// ==============================================

// 1. Get Verify Staff Pay Revision Inbox (GET)
export const getVerifyPayRevision = async (params) => {
    try {
        const { roleId } = params;
        console.log('📊 Getting Verify Staff Pay Revision Inbox for RoleID:', roleId);
        if (!roleId) throw new Error('RoleID is required');
        const queryParams = new URLSearchParams({ RoleId: roleId.toString().trim() });
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetVerifyPayRevision?${queryParams.toString()}`);
        const response = await axios.get(
            `${API_BASE_URL}/HR/GetVerifyPayRevision?${queryParams}`,
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('✅ Verify Staff Pay Revision Inbox Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Verify Staff Pay Revision Inbox API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};

// 2. Get Staff Pay Revision by Reference Number (GET)
export const getPayRevisionbyRefno = async (params) => {
    try {
        const { transactionRefno } = params;
        console.log('📋 Getting Staff Pay Revision Details for TransactionRefno:', transactionRefno);
        if (!transactionRefno) throw new Error('TransactionRefno is required');
        const queryParams = new URLSearchParams({ TransactionRefno: transactionRefno.toString().trim() });
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetPayRevisionbyRefno?${queryParams.toString()}`);
        const response = await axios.get(
            `${API_BASE_URL}/HR/GetPayRevisionbyRefno?${queryParams}`,
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('✅ Staff Pay Revision Details Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Staff Pay Revision Details API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};

// 3. Approve Staff Pay Revision (PUT)
export const approvePayRevision = async (params) => {
    try {
        console.log('✅ Approving Staff Pay Revision for:', params);
        if (!params.EmpRefNo)        throw new Error('EmpRefNo is required');
        if (!params.TransactionRefNo) throw new Error('TransactionRefNo is required');
        if (!params.Roleid)          throw new Error('Roleid is required');
        if (!params.CreatedBy)       throw new Error('CreatedBy is required');
        if (!params.Action)          throw new Error('Action is required');
        const payload = {
            EmpRefNo:         params.EmpRefNo.toString().trim(),
            Month:            params.Month ? parseInt(params.Month) : 0,
            Year:             params.Year  ? parseInt(params.Year)  : 0,
            TransactionRefNo: params.TransactionRefNo.toString().trim(),
            RevisionNo:       params.RevisionNo ? parseInt(params.RevisionNo) : 0,
            HeadsJsonString:  params.HeadsJsonString?.toString().trim() || '',
            Roleid:           parseInt(params.Roleid),
            CreatedBy:        params.CreatedBy.toString().trim(),
            Action:           params.Action.toString().trim(),
            Note:             params.Note?.toString().trim() || '',
        };
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/ApprovePayRevision`);
        console.log('📦 Approval Payload:', payload);
        const response = await axios.put(
            `${API_BASE_URL}/HR/ApprovePayRevision`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('✅ Approve Staff Pay Revision Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Approve Staff Pay Revision API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};

// ==============================================
// STAFF PAY REVISION CREATION RELATED APIs
// ==============================================

// 4. Get Employees Eligible for Pay Revision (GET)
//    Returns list of employees who have an appraisal / are eligible for revision
export const getAppraisalEmp = async () => {
    try {
        console.log('🔍 Getting Appraisal Employees For Pay Revision');
        const response = await axios.get(
            `${API_BASE_URL}/HR/GetAppraisalEmp`,
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('✅ Get Appraisal Emp Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get Appraisal Emp API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to get employees for pay revision';
    }
};

// 5. Get Current CTC Data For Revision (GET)
//    Returns existing CTC snapshot — used to get TransactionRefNo, Month, Year, GroupId
export const getCTCDataForRevision = async (empRefNo) => {
    try {
        console.log('🔍 Getting CTC Data For Revision for:', empRefNo);
        const response = await axios.get(
            `${API_BASE_URL}/HR/GetCTCDataForRevision`,
            {
                params: { Emprefno: empRefNo },
                headers: { 'Content-Type': 'application/json' },
            }
        );
        console.log('✅ Get CTC Data For Revision Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get CTC Data For Revision API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to get CTC data for revision';
    }
};

// 6. Check CTC Access For Role (GET)
//    Returns NewCTCAccess and RevisionAccess flags for the given role
export const checkCTCAccess = async (roleId) => {
    try {
        console.log('🔍 Checking CTC Access for RoleId:', roleId);
        const response = await axios.get(
            `${API_BASE_URL}/HR/CheckCTCAccess`,
            {
                params: { Roleid: roleId },
                headers: { 'Content-Type': 'application/json' },
            }
        );
        console.log('✅ Check CTC Access Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Check CTC Access API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to check CTC access';
    }
};

// 7. Get Group Salary Type (GET)
//    Returns "Yes" or "No" — whether the group uses daily-wage salary
export const getGroupSalaryType = async (groupId) => {
    try {
        console.log('🔍 Getting Group Salary Type for GroupId:', groupId);
        const response = await axios.get(
            `${API_BASE_URL}/HR/GetGroupSalaryType`,
            {
                params: { GroupId: groupId },
                headers: { 'Content-Type': 'application/json' },
            }
        );
        console.log('✅ Get Group Salary Type Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get Group Salary Type API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to get group salary type';
    }
};

// 8. Get Pay Revision CTC Heads Data (GET)
//    Returns editable head list with existing + minimum amounts for a revision
export const getPayRevisionCTCHeadsData = async (empRefNo, groupId) => {
    try {
        console.log('🔍 Getting Pay Revision CTC Heads Data:', { empRefNo, groupId });
        const response = await axios.get(
            `${API_BASE_URL}/HR/GetPayRevisionCTCHeadsData`,
            {
                params: { Emprefno: empRefNo, GroupId: groupId },
                headers: { 'Content-Type': 'application/json' },
            }
        );
        console.log('✅ Get Pay Revision CTC Heads Data Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get Pay Revision CTC Heads Data API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to get pay revision CTC heads data';
    }
};

// ── Revision Head Payload Transformer ─────────────────────────────────────────
// Converts localRevisionHeads → JSON string for @Heads param in spInsertPayRevision.
// Includes both new (revised) amounts and existing amounts for the SP.
const TOTAL_HEAD_TYPES = ['GROSSSALARY', 'DEDUCTIONTOTAL', 'NETSALARY', 'BENEFITTOTAL', 'OTHERBENEFITTOTAL', 'CTCTOTAL'];

export const transformRevisionHeadsForPayload = (heads) => {
    return heads.map((h) => {
        const isTotal    = TOTAL_HEAD_TYPES.includes(h.HeadType);
        // HeadAmount is ALWAYS stored as monthly; compute yearly/daily from it
        const amount     = parseFloat(h.HeadAmount) || 0;
        const ctcAmtType = isTotal ? '' : (h.CTCAmounttype || h.ApplicableType || 'Monthly');

        const monthlyAmount = parseFloat(amount.toFixed(2));
        const yearlyAmount  = parseFloat((amount * 12).toFixed(2));
        const dailyAmount   = parseFloat((amount / 26).toFixed(2));

        // CTCAmount = what the user entered in their selected type
        const ctcRaw = ctcAmtType === 'Yearly' ? yearlyAmount : monthlyAmount;

        const existingMonthly = parseFloat(h.ExistingMonthlyAmount) || 0;
        const existingYearly  = parseFloat(h.ExistingYearlyAmount)  || 0;
        const existingDaily   = parseFloat(h.ExistingDailyAmount)   || 0;

        return {
            RowNo:              String(h.Rowno),
            HeadName:           h.HeadName,
            HeadType:           h.HeadType,
            CTCAmounttype:      ctcAmtType,
            CTCAmount:          isTotal ? '0' : ctcRaw.toFixed(2),
            YearlyAmount:       yearlyAmount.toFixed(2),
            MonthlyAmount:      monthlyAmount.toFixed(2),
            DailyAmount:        dailyAmount.toFixed(2),
            MinYearlyAmount:    isTotal ? '0' : (parseFloat(h.MinAnnualAmount) || 0).toFixed(2),
            MinMonthlyAmount:   isTotal ? '0' : (parseFloat(h.MinMonthAmount)  || 0).toFixed(2),
            MinDailyAmount:     isTotal ? '0' : (parseFloat(h.MinDialyAmount)  || 0).toFixed(2),
            MandatoryType:      isTotal ? h.HeadType : (h.MandatoryType || ''),
            RuleApplicableType: isTotal ? '' : (h.ApplicableType || ''),
            MonthlyDiff:        (monthlyAmount - existingMonthly).toFixed(2),
            DailyDiff:          (dailyAmount   - existingDaily).toFixed(2),
            YearlyDiff:         (yearlyAmount  - existingYearly).toFixed(2),
            HeadRevisedType:    isTotal ? 'Common' : (h.HeadReviseType || 'Old_New'),
        };
    });
};

// 9. Get Employee Data For Appraisal (GET)
//    Returns AppraisalData (Month, Year, EffectiveDate, GroupId, GroupName) + lstGroups
export const getEmpDataForAppraisal = async (empRefNo) => {
    try {
        console.log('🔍 Getting Emp Data For Appraisal:', empRefNo);
        const response = await axios.get(
            `${API_BASE_URL}/HR/GetEmpDataForAppraisal`,
            {
                params: { EmpRefNo: empRefNo },
                headers: { 'Content-Type': 'application/json' },
            }
        );
        console.log('✅ Get Emp Data For Appraisal Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get Emp Data For Appraisal API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to get employee appraisal data';
    }
};

// 10. Save Employee Pay Revision (POST)
//
// SP: spInsertAppraisalPayRevision
// Params: @EmpRefno, @Month, @Year, @Remarks, @Heads (JSON), @CreatedBy, @Roleid, @GroupId
// Output: @Addstatus → "Submited" on success
export const saveEmpPayRevision = async (params) => {
    try {
        console.log('💾 Saving Employee Pay Revision - raw params:', params);

        if (!params.empRefNo)   throw new Error('Employee Ref No is required');
        if (!params.createdBy)  throw new Error('Created By is required');
        if (!params.heads)      throw new Error('Heads data is required');

        const transformedHeads = transformRevisionHeadsForPayload(
            Array.isArray(params.heads) ? params.heads : JSON.parse(params.heads)
        );

        const payload = {
            EmpRefNo:        params.empRefNo.toString(),
            Month:           parseInt(params.month)  || 0,
            Year:            parseInt(params.year)   || 0,
            Remarks:         params.remarks?.toString() || '',
            HeadsJsonString: JSON.stringify(transformedHeads),
            CreatedBy:       params.createdBy.toString(),
            Roleid:          parseInt(params.roleId) || 0,
            GroupId:         parseInt(params.groupId) || 0,
        };

        console.log('🔗 API URL:', `${API_BASE_URL}/HR/SaveAppraisalPayRevision`);
        console.log('📦 Payload:', payload);
        console.log('📦 Transformed Heads:', transformedHeads);

        const response = await axios.post(
            `${API_BASE_URL}/HR/SaveAppraisalPayRevision`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('✅ Save Employee Pay Revision Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Save Employee Pay Revision API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to save employee pay revision';
    }
};
