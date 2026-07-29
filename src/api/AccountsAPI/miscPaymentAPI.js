import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

const base = `${API_BASE_URL}/Accounts`;

/** 1. GET ref numbers awaiting bank payment (creation dropdown source) */
export const getMiscPaymentRefnos = () =>
    axios.get(`${base}/GetMiscPaymentRefnos`);

/** 2. GET misc invoice detail by TranRefno (creation auto-fill) */
export const viewMiscPaymentDetails = (tranRefno) =>
    axios.get(`${base}/ViewMiscPaymentDetails`, { params: { TranRefno: tranRefno } });

/** 3. POST save the bank payment against a misc invoice ref no */
export const saveMiscPayment = (payload) =>
    axios.post(`${base}/Savemiscpayment`, payload);
