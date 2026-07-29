import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

const base = `${API_BASE_URL}/Accounts`;

/** 1. GET pending misc payments for verification */
export const getVerifyMiscPaymentList = ({ roleId, uid, pType }) =>
    axios.get(`${base}/VerifyMiscPayment`, { params: { Roleid: roleId, UID: uid, PType: pType } });

/** 2. GET misc payment full detail for verification view */
export const getVerifyMiscPaymentView = (refNo) =>
    axios.get(`${base}/VerifyMiscPaymentView`, { params: { RefNo: refNo } });

/** 3. PUT approve / reject / return a misc payment */
export const approveMiscPayment = (payload) =>
    axios.put(`${base}/ApproveMiscPayment`, payload);
