import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

const base = API_BASE_URL;

/** 1. GET invoice types */
export const getInvoiceTypes = () =>
    axios.get(`${base}/Accounts/GetInvoiceType`);

/** 2. GET cost centers by invoice sub-type */
export const getCostCentersBySubType = (subType) =>
    axios.get(`${base}/Accounts/GetCostCenterbySubType`, { params: { SubType: subType } });

/** 3. GET clients by cost center */
export const getClientsByCostCenter = ({ invType, ccCode }) =>
    axios.get(`${base}/Accounts/GetClientbyCostCenter`, { params: { InvType: invType, CcCode: ccCode } });

/** 4. GET sub-clients by client */
export const getSubClientsByClient = ({ invType, ccCode, clientcode }) =>
    axios.get(`${base}/Accounts/GetSubClientsbyClient`, { params: { InvType: invType, CcCode: ccCode, Clientcode: clientcode } });

/** 5. GET PO numbers for a sub-client */
export const getSubClientPO = ({ subClient, ccCode, clientcode }) =>
    axios.get(`${base}/Accounts/GetSubClientPOForInvoice`, { params: { SubClient: subClient, CcCode: ccCode, Clientcode: clientcode } });

/** 6. GET client GST numbers */
export const getClientGSTNos = ({ taxtype, taxfor }) =>
    axios.get(`${base}/Purchase/GetVendorClientGSTNos`, { params: { Taxtype: taxtype, Taxfor: taxfor } });

/** 7. GET company GST numbers */
export const getCompanyGSTNos = (taxtype) =>
    axios.get(`${base}/Purchase/GetCompanyGSTNos`, { params: { Taxtype: taxtype } });

/** 8. GET TCS DCA/SDCA defaults */
export const getTCSDCASDCAS = () =>
    axios.get(`${base}/Accounts/GetTCSDCASDCAS`);

/** 9. POST save client invoice */
export const saveClientInvoice = (payload) =>
    axios.post(`${base}/Accounts/SaveClientInvoiceCreation`, payload);
