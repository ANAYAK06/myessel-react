import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// CASH VOUCHER CREATION — ACCOUNTS API
// ==============================================

// 1. Get Self CC List for logged-in user/role (GET)
//    Used to populate the "Self Cost Center" dropdown
export const getACCCCCode = async (uid, rid) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Accounts/GetACCCCCode`, {
            params: { UID: uid, RID: rid },
            headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch self CC list';
    }
};

// 2. Get Other CC List (GET)
//    Used to populate the "Other Cost Center" dropdown (Debit from Other CC mode)
export const getCashCCCode = async (id, type) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Accounts/GetCashCCCode`, {
            params: { id, Type: type },
            headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch other CC list';
    }
};

// 3. Get CC Cash Balance (GET)
//    Returns SelfCCBalance for the selected cost center
export const getCCCash = async (ccCode) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Accounts/GetCCCash`, {
            params: { id: ccCode },
            headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch CC cash balance';
    }
};

// 4. Get DCA (Account Head) codes for a CC (GET)
//    Pass CCCode as id
export const getCashDCACode = async (ccCode) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Accounts/GetCashDCACode`, {
            params: { id: ccCode },
            headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch DCA codes';
    }
};

// 5. Get Sub DCA (Sub Account Head) codes for a DCA (GET)
//    Pass DCA Code as id
export const getCashSDCACode = async (dcaCode) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Accounts/GetCashSDCACode`, {
            params: { id: dcaCode },
            headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch Sub DCA codes';
    }
};

// 6. Get Company GST Numbers (GET)
//    Taxtype = 'Creditable' for cash voucher GST
export const getCompanyGSTNos = async (taxtype = 'Creditable') => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Purchase/GetCompanyGSTNos`, {
            params: { Taxtype: taxtype },
            headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch GST numbers';
    }
};

// 8. Get pending cash vouchers for verification (GET)
//    Returns list pending for the given RoleId
export const getPendingCashVouchers = async (roleId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Accounts/GetgeneralpayablebycashFirst`, {
            params: { Roleid: roleId },
            headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch pending cash vouchers';
    }
};

// 9. Get cash voucher detail by Voucherno (GET)
//    Returns full detail including GST, CC names, DCA names, MOID
export const getCashVoucherById = async (tranno) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Accounts/GetgeneralpayablebycashverificationbyId`, {
            params: { Tranno: tranno },
            headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch cash voucher details';
    }
};

// 10. Verify / Approve / Reject cash voucher (PUT)
//     SP: spVerifyGeneralpayablebycash
//     Returns "Submitted,..." on success
export const verifyCashVoucher = async (payload) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/Accounts/VerifyGeneralpayablebycash`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to verify cash voucher';
    }
};

// 7. Save General Cash Payment (POST)
//    SP: SPGeneralCashPayment
//    Returns "Approved SuccessFully" on success via @AddCashPaymentStatus
export const saveGeneralCashPayment = async (params) => {
    try {
        const payload = {
            GPCash_TransactionMode: params.transactionMode,
            GPSessionCCCode:        params.selfCCCode,
            GPCash_CCCode:          params.otherCCCode   || '',
            GPCash_Date:            params.voucherDate,
            GPCash_PaidDate:        params.paidDate,
            GPCash_DCACode:         params.dcaCode,
            GPCash_SDCACode:        params.sdcaCode       || '',
            GPCash_Name:            params.name,
            GPCash_Remarks:         params.remarks        || '',
            GPCash_Amount:          parseFloat(params.totalAmount)   || 0,
            PaymentType:            params.paymentType,               // 'Normal' | 'GST'
            Invoice_Amount:         parseFloat(params.invoiceAmount)  || 0,
            CompanyGST:             params.companyGST     || '',
            IGST_Amount:            parseFloat(params.igstAmount)     || 0,
            CGST_Amount:            parseFloat(params.cgstAmount)     || 0,
            SGST_Amount:            parseFloat(params.sgstAmount)     || 0,
            RoleID:                 parseInt(params.roleId)           || 0,
            Createdby:              params.createdBy,
        };

        console.log('💾 Save General Cash Payment Payload:', payload);
        const response = await axios.post(
            `${API_BASE_URL}/Accounts/SaveGeneralCashPayment`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('✅ Save General Cash Payment Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Save General Cash Payment API Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to save cash payment';
    }
};
