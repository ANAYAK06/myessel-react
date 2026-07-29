import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

const base = `${API_BASE_URL}/Accounts`;

/** 1. GET pending retention payment transactions for verification */
export const getVerificationRetentionPeyments = (roleId) =>
    axios.get(`${base}/GetVerificationRetentionPeyments`, { params: { Roleid: roleId } });

/** 2. GET the invoices paid against a retention transaction (richer invoice-level detail) */
export const getTransactionInvoicebyRefno = (transRefno) =>
    axios.get(`${base}/GetTransactionInvoicebyRefno`, { params: { TransRefno: transRefno } });

/** 3. GET full transaction detail by TransactionRefNo, incl. RetInvDetailsList */
export const getVerificationRetentionDetailsbyRefno = (transRefno) =>
    axios.get(`${base}/GetVerificationRetentionDetailsbyRefno`, { params: { TransRefno: transRefno } });

/** 4. PUT approve / reject / return / verify a retention payment transaction */
export const approveRetentionPayment = (payload) =>
    axios.put(`${base}/ApproveRetentionPayment`, payload);

/** 5. PUT edit a returned retention payment transaction before re-approval */
export const updateClientRetentionPayment = (payload) =>
    axios.put(`${base}/UpdateClientRetentionPayment`, payload);
