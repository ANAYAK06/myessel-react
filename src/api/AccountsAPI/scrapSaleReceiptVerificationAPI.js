import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

const base = `${API_BASE_URL}/Accounts`;

/** 1. GET pending receipt-against-scrap-sale transactions for verification */
export const getVerifyReceiptAgainstScrapSaleGrid = (roleId) =>
    axios.get(`${base}/VerifyReceiptAgainstScrapSaleGrid`, { params: { Roleid: roleId } });

/** 2. GET full transaction detail by Refno (BankTranNo) for verification view */
export const getVerifyReceiptAgainstScrapeSaleView = (refno) =>
    axios.get(`${base}/VerifyReceiptAgainstScrapeSaleView`, { params: { Refno: refno } });

/** 3. PUT approve / reject / return / verify a receipt against scrap sale */
export const approveReceiptAgainstScrapSale = (payload) =>
    axios.put(`${base}/ApproveReceiptAgainstScrapSale`, payload);
