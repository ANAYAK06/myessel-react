import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

const base = API_BASE_URL;

/** 1. GET closing type options */
export const getCCClosingTypes = () =>
    axios.get(`${base}/Accounts/CCClosingType`);

/** 2. GET eligible CCs for a closing type */
export const getCCClosingCCs = ({ closingType, uid, rid }) =>
    axios.get(`${base}/Accounts/GetCCClosingCCS`, {
        params: { ClosingType: closingType, UID: uid, RID: rid },
    });

/** 3. GET pending transactions for a CC */
export const getCCStorePendings = ({ ccCode, type }) =>
    axios.get(`${base}/Accounts/GetCCStorePendings`, {
        params: { CCCode: ccCode, Type: type },
    });

/** 4. GET DCA budget report for a CC */
export const getDCABudgetReport = (ccCode) =>
    axios.get(`${base}/Accounts/ViewDCABudgetReportGridnew`, {
        params: { CCCode: ccCode },
    });

/** 5. GET CC closing status report */
export const getCCClosingStatusReport = (ccCode) =>
    axios.get(`${base}/Reports/CCClosingStatusRep`, {
        params: { CCCode: ccCode },
    });

/** 6. POST save CC closing data */
export const saveCCClosingData = (payload) =>
    axios.post(`${base}/Accounts/SaveCCClosingData`, payload);

/** 7. GET verification inbox list */
export const getVerifyCCClosingGrid = ({ roleId, created, userId }) =>
    axios.get(`${base}/Accounts/VerifyCCClosingGrid`, {
        params: { Roleid: roleId, Created: created, Userid: userId },
    });

/** 8. GET verification detail by transaction number */
export const getVerifyCCClosingView = ({ tranno, rid, typeid }) =>
    axios.get(`${base}/Accounts/VerifyCCClosingView`, {
        params: { Tranno: tranno, Rid: rid, Typeid: typeid },
    });

/** 9. PUT approve/verify CC closing */
export const approveCCClose = (payload) =>
    axios.put(`${base}/Accounts/ApproveCCClose`, payload);
