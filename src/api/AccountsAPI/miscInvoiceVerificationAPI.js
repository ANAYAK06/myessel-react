import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

const base = API_BASE_URL;

/** 1. GET pending misc invoices for verification */
export const getMiscVerificationList = ({ roleId, type }) =>
    axios.get(`${base}/Accounts/GetMisc`, { params: { Roleid: roleId, Type: type } });

/** 2. GET misc invoice full detail by reference number */
export const getMiscVerificationById = (refNo) =>
    axios.get(`${base}/Accounts/GetmiscverificationbyId`, { params: { RefNo: refNo } });

/** 3. PUT approve / reject / return a misc invoice */
export const verifyMiscInvoice = (payload) =>
    axios.put(`${base}/Accounts/VerifyMisc`, payload);

/** 4. PUT edit a misc invoice at the approval/verification level */
export const updateMiscInvoice = (payload) =>
    axios.put(`${base}/Accounts/UpdateMisc`, payload);
