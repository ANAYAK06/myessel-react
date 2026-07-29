import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

const base = `${API_BASE_URL}/Accounts`;

/** 1. GET pending hold payment transactions for verification */
export const getVerificationholdPeyments = (roleId) =>
    axios.get(`${base}/GetVerificationholdPeyments`, { params: { Roleid: roleId } });

/** 2. GET full transaction detail by TransactionRefNo, incl. HoldInvoiceList */
export const getVerificationHoldDetailsbyRefno = (transRefno) =>
    axios.get(`${base}/GetVerificationHoldDetailsbyRefno`, { params: { TransRefno: transRefno } });

/** 3. PUT approve / reject / return / verify a hold payment transaction */
export const approveHoldPayment = (payload) =>
    axios.put(`${base}/ApproveHoldPayment`, payload);

/** 4. PUT edit a returned hold payment transaction before re-approval */
export const updateClientHoldPayment = (payload) =>
    axios.put(`${base}/UpdateClientHoldPayment`, payload);
