import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

// 1. Get pending CC Cash Transfers for verification (by Role + UID)
export const getCCCashTransferList = async (roleId, uid) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Accounts/Getcccashtransfer`, {
            params: { Roleid: roleId, UID: uid },
            headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch CC cash transfer list';
    }
};

// 2. Get CC Cash Transfer detail by VoucherNo and Refno
export const getCCCashTransferById = async (voucherId, refno) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Accounts/GetcccashtransferverificationbyId`, {
            params: { voucherid: voucherId, Refno: refno },
            headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch CC cash transfer detail';
    }
};

// 3. Verify CC Cash Transfer (PUT)
// payload: { Refno, ApprovalRemarks, Approvalstatus (Action), RoleID, Createdby, UID }
export const verifyCCCashTransfer = async (payload) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/Accounts/VerifyCCCashTransfer`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to verify CC cash transfer';
    }
};

// 4. Save (create) new CC Cash Transfer (POST)
// payload: { GPSessionCCCode, CashTransferCCCode, CCTransferDate, CCTransferRemarks, CCTransferAmount, RoleID, Createdby }
export const saveCCCashTransfer = async (payload) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Accounts/Savecccashtransfer`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to save CC cash transfer';
    }
};
