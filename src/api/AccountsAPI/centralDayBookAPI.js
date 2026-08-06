import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

const base = `${API_BASE_URL}/Accounts`;

/** 1. GET current cost-centre-wise cash balances (also used to populate the CC dropdown) */
export const getCCCashBalance = (roleId, uid) =>
    axios.get(`${base}/ViewCCCashBalance`, { params: { Roleid: roleId, UID: uid } });

/** 2. POST save a new central day book transfer (spSaveCentralDayBook, Action=Add) */
export const saveCentralDayBook = (params) => {
    const payload = {
        TransferDate: params.transferDate,
        TransferType: params.transferType,
        Bankname:     params.transferType === 'Bank' ? (params.bankId || '') : '',
        CostCenter:   params.transferType === 'CostCenter' ? (params.ccCode || '') : '',
        Remarks:      params.remarks || '',
        Amount:       parseFloat(params.amount) || 0,
        RoleID:       parseInt(params.roleId, 10) || 0,
        Createdby:    params.createdBy,
    };
    return axios.post(`${base}/Savecentraldaybook`, payload);
};

/** 3. GET unassigned / total CC / pending balance summary */
export const getCashAmounts = () =>
    axios.get(`${base}/GetCashAmounts`);

/** 4. GET central day book entries pending verification for a role */
export const getCentralDayBookList = (roleId) =>
    axios.get(`${base}/Getcentraldaybook`, { params: { Roleid: roleId } });

/** 5. GET full central day book detail by row id, for verification view */
export const getCentralDayBookVerificationById = (rowid) =>
    axios.get(`${base}/GetcdbverificationbyId`, { params: { Rowid: rowid } });

/** 6. PUT approve / reject / return / verify a central day book entry (spVerifyCentraldaybook) */
export const verifyCentralDayBook = (payload) =>
    axios.put(`${base}/Verifycdb`, payload);

/** 7. GET a returned central day book entry by row id, for resubmission on the creation page */
export const getReturnedCentralDayBookById = (rowid) =>
    axios.get(`${base}/GetReturnCentraldaybookbyId`, { params: { Rowid: rowid } });

/** 8. PUT resubmit a previously-returned central day book entry (spSaveCentralDayBook, Action=Update) */
export const updateCentralDayBook = (params) => {
    const payload = {
        Rowid:     params.rowid,
        Remarks:   params.remarks || '',
        Amount:    parseFloat(params.amount) || 0,
        RoleID:    parseInt(params.roleId, 10) || 0,
        Createdby: params.createdBy,
    };
    return axios.put(`${base}/UpdateCentralDaybookData`, payload);
};
