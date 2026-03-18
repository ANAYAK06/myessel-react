import axios from "axios";
import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// STAFF CTC CREATION APIs
// ==============================================

// 1. Get New Employees Eligible for CTC Creation (GET)
//    Returns employees who don't yet have a CTC defined
export const getNewEmpForCTC = async () => {
    try {
        console.log('🔍 Getting New Employees For CTC');
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetNewEmpForCTC`);

        const response = await axios.get(
            `${API_BASE_URL}/HR/GetNewEmpForCTC`,
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('✅ Get New Emp For CTC Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get New Emp For CTC API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to get employees for CTC';
    }
};

// 2. Get CTC Heads Data for an Employee (GET)
//    Returns lstEarnings, lstDeduction, HeadsList, EmpRuleStatus, EmpName, etc.
export const getCTCHeadsData = async (empRefNo) => {
    try {
        console.log('🔍 Getting CTC Heads Data for:', empRefNo);
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetCTCHeadsData`);

        const response = await axios.get(
            `${API_BASE_URL}/HR/GetCTCHeadsData`,
            {
                params: { Emprefno: empRefNo },
                headers: { 'Content-Type': 'application/json' },
            }
        );
        console.log('✅ Get CTC Heads Data Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get CTC Heads Data API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to get CTC heads data';
    }
};

// ── Head Payload Transformer ───────────────────────────────────────────────────
// Converts localHeads (internal Redux shape) → the exact JSON structure the
// backend SP (spInsertNewEmployeeCTC) expects for @Heads parameter.
//
// Old-app reference fields:
//   RowNo, HeadName, HeadType, CTCAmounttype, CTCAmount,
//   YearlyAmount, MonthlyAmount, Dailyamount,
//   MinYearlyAmount, MinMonthlyAmount, MinDailyAmount,
//   MandatoryType, RuleApplicableType
//
// Daily = Math.round(monthly / 26) → matches legacy rounding (e.g. 1000→38, 25000→962)
// Total rows have CTCAmount = "0"; their Y/M/D come from computed HeadAmount.
const TOTAL_HEAD_TYPES = ['GROSSSALARY', 'DEDUCTIONTOTAL', 'NETSALARY', 'BENEFITTOTAL', 'OTHERBENEFITTOTAL', 'CTCTOTAL'];

const transformHeadsForPayload = (heads) => {
    return heads.map((h) => {
        const isTotal   = TOTAL_HEAD_TYPES.includes(h.HeadType);
        const amount    = parseFloat(h.HeadAmount) || 0;
        const applicable = h.ApplicableType || '';

        let yearlyAmount  = 0;
        let monthlyAmount = 0;
        let dailyAmount   = 0;

        if (applicable === 'Monthly' || isTotal) {
            monthlyAmount = amount;
            yearlyAmount  = parseFloat((amount * 12).toFixed(2));
            dailyAmount   = Math.round(amount / 26);
        } else if (applicable === 'Yearly') {
            yearlyAmount  = amount;
            monthlyAmount = parseFloat((amount / 12).toFixed(2));
            dailyAmount   = Math.round(amount / 313);
        }

        return {
            RowNo:               String(h.Rowno),
            HeadName:            h.HeadName,
            HeadType:            h.HeadType,
            CTCAmounttype:       isTotal ? '' : (h.AmountType || ''),
            CTCAmount:           isTotal ? '0' : String(amount),
            YearlyAmount:        yearlyAmount.toFixed(2),
            MonthlyAmount:       monthlyAmount.toFixed(2),
            Dailyamount:         dailyAmount.toFixed(2),
            MinYearlyAmount:     isTotal ? '0' : String(parseFloat(h.MinAnnualAmount) || 0),
            MinMonthlyAmount:    isTotal ? '0' : String(parseFloat(h.MinMonthAmount)  || 0),
            MinDailyAmount:      isTotal ? '0' : String(parseFloat(h.MinDialyAmount)  || 0),
            MandatoryType:       isTotal ? h.HeadType : (h.MandatoryType || ''),
            RuleApplicableType:  isTotal ? '' : (h.ApplicableType || ''),
        };
    });
};

// 3. Save New Employee CTC (POST)
//
// ── FIELD NAME CONTRACT ───────────────────────────────────────────────────────
// SP: spInsertNewEmployeeCTC
// Params: @EmpRefno, @Remarks, @Heads (JSON string), @Createdby, @Roleid
// Output: @Addstatus → "Submited" on success
// ─────────────────────────────────────────────────────────────────────────────
export const saveNewEmployeeCTC = async (params) => {
    try {
        console.log('💾 Saving New Employee CTC - raw params:', params);

        if (!params.empRefNo)  throw new Error('Employee Ref No is required');
        if (!params.createdBy) throw new Error('Created By is required');
        if (!params.heads)     throw new Error('Heads data is required');

        const transformedHeads = transformHeadsForPayload(
            Array.isArray(params.heads) ? params.heads : JSON.parse(params.heads)
        );

        const payload = {
            Emprefno:        params.empRefNo?.toString()  || '',
            Remarks:         params.remarks?.toString()   || '',
            HeadsJsonString: JSON.stringify(transformedHeads),
            CreatedBy:       params.createdBy?.toString() || '',
            Roleid:          parseInt(params.roleId)      || 0,
        };

        console.log('🔗 API URL:', `${API_BASE_URL}/HR/SaveNewEmployeeCTC`);
        console.log('📦 Payload:', payload);
        console.log('📦 Transformed Heads:', transformedHeads);

        const response = await axios.post(
            `${API_BASE_URL}/HR/SaveNewEmployeeCTC`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('✅ Save New Employee CTC Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Save New Employee CTC API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to save new employee CTC';
    }
};
