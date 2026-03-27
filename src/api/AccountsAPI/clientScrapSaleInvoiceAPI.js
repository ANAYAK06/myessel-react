import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

const base = API_BASE_URL;

/** 1. GET scrap cost centers by sub-type */
export const getScrapCostCenters = (subType) =>
    axios.get(`${base}/Accounts/GetAllScrapCostCenters`, { params: { SubType: subType } });

/** 2. GET scrap clients by cost center */
export const getScrapClientsByCostCenter = ({ invType, ccCode }) =>
    axios.get(`${base}/Accounts/GetScrapClientbyCostCenter`, { params: { InvType: invType, CCCode: ccCode } });

/** 3. GET scrap sub-clients by client */
export const getScrapSubClientsByClient = ({ invType, ccCode, clientcode }) =>
    axios.get(`${base}/Accounts/GetSubClientsbyScrapClient`, { params: { InvType: invType, CcCode: ccCode, Clientcode: clientcode } });

/** 4. GET scrap request numbers for invoice */
export const getScrapRequestNumbers = ({ subClient, ccCode, clientcode }) =>
    axios.get(`${base}/Accounts/GetScrapRequestnoForInvoice`, { params: { SubClient: subClient, CcCode: ccCode, Clientcode: clientcode } });

/** 5. GET scrap sale request details (BasicValue) */
export const getScrapRequestDetails = (id) =>
    axios.get(`${base}/Accounts/GetScrapSaleRequestDetails`, { params: { Id: id } });

/** 6. POST save client scrap invoice */
export const saveClientScrapInvoice = (payload) =>
    axios.post(`${base}/Accounts/SaveClientScrapInvoiceCreation`, payload);
