import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

const base = `${API_BASE_URL}/Accounts`;

/** 1. GET pending advance payment transactions for verification */
export const getVerificationAdvancePeyments = (roleId) =>
    axios.get(`${base}/GetVerificationAdvancePeyments`, { params: { Roleid: roleId } });

/** 2. GET full transaction detail by BankTransactionId (verification view) */
export const getVerificationAdvancePaybyId = (transactionId) =>
    axios.get(`${base}/GetVerificationAdvancePaybyId`, { params: { TransactionId: transactionId } });

/** 3. PUT approve / reject / return / verify an advance payment transaction */
export const approveAdvancePayment = (payload) =>
    axios.put(`${base}/ApproveAdvancePayment`, payload);

/** 4. GET single transaction by BankTransactionId (edit view) */
export const getAdvancePaybyId = (transactionId) =>
    axios.get(`${base}/GetAdvancePaybyId`, { params: { TransactionId: transactionId } });

/** 5. PUT edit a returned advance payment transaction before re-approval */
export const updateClientAdvancePayment = (payload) =>
    axios.put(`${base}/UpdateClientAdvancePayment`, payload);

// Deductions on Advance transactions are also stored in ClientDeducations, keyed by the
// transaction's BankTransactionRefNo (used in place of ClientInvoiceNo) — same generic endpoint
// as the Invoice Service flow.
export const getClientDeductions = (invoiceNo) =>
    axios.get(`${base}/GetClientDeductions`, { params: { InvoiceNo: invoiceNo } });
