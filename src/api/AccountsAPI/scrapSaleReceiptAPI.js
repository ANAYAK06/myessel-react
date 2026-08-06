import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

const base = API_BASE_URL;

/** 1. GET scrap sale reference numbers for receipt creation */
export const getScrapSaleRefnos = () =>
    axios.get(`${base}/Accounts/GetScrapsaleRefnos`);

/** 2. GET scrap sale receipt details (client, CC, GST/TCS breakup, balance) by Refno id */
export const getScrapSaleReceiptDetails = (id) =>
    axios.get(`${base}/Accounts/GetScrapSaleRecieptDetails`, { params: { Id: id } });

/** 3. POST save receipt against scrap sale */
export const saveScrapSaleReceiptValue = (payload) =>
    axios.post(`${base}/Accounts/SaveScrapSaleRecieptValue`, payload);
