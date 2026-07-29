import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

const base = `${API_BASE_URL}/Accounts`;

/** 1. GET pending client receivable (Invoice Service) transactions for verification */
export const getVerificationClientRecievable = (roleId) =>
    axios.get(`${base}/GetVerificationClientRecievable`, { params: { Roleid: roleId } });

/** 2. GET full transaction detail by BankTransactionId (verification view) */
export const getVerificationClientRecievablebyTransId = (transactionId) =>
    axios.get(`${base}/GetVerificationClientRecievablebyTransId`, { params: { TransactionId: transactionId } });

/** 3. GET deduction rows already saved against an invoice (with DCA/SubDCA names) */
export const getClientDeductions = (invoiceNo) =>
    axios.get(`${base}/GetClientDeductions`, { params: { InvoiceNo: invoiceNo } });

/** 4. GET single transaction by BankTransactionId, incl. tax + deduction lists (edit view) */
export const getClientRecievablebyId = (transactionId) =>
    axios.get(`${base}/GetClientRecievablebyId`, { params: { TransactionId: transactionId } });

/** 5. PUT approve / reject / return / verify a client receivable transaction */
export const approveClientRecievable = (payload) =>
    axios.put(`${base}/ApproveClientRecievable`, payload);

/** 6. PUT edit a returned client receivable transaction before re-approval */
export const updateClientInvoiceRecievable = (payload) =>
    axios.put(`${base}/UpdateClientInvoiceRecievable`, payload);
