import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

const base = API_BASE_URL;

/** 1. GET manufacturing cost centers by CC type */
export const getManfCostCenters = (ccType) =>
    axios.get(`${base}/Accounts/GetmanfCostCenterbycctype`, { params: { ccType } });

/** 2. GET manufactured item codes by CC */
export const getManufacturingItemsByCC = (ccCode) =>
    axios.get(`${base}/Accounts/GetmanItemCodesbycc`, { params: { CCCode: ccCode } });

/** 3. POST save new manufacture item code (master) */
export const saveManufactureItemcode = (payload) =>
    axios.post(`${base}/Accounts/SaveManufactureItemcode`, payload);

/** 4. GET trade item temp issue details */
export const getTradeItemTempDetails = ({ itemcode, ccCode }) =>
    axios.get(`${base}/Accounts/NewTradeItemsIssueTempDetails`, { params: { itemcode, CCCode: ccCode } });

/** 5. POST save temp manufacturing new items issue */
export const saveTempManNewItemsIssue = (payload) =>
    axios.post(`${base}/Accounts/SaveTempManNewItemsIssue`, payload);

/** 6. POST delete manufacturing stock issue item */
export const deleteManStockIssueItems = (payload) =>
    axios.post(`${base}/Accounts/DeleteManStockIssueItems`, payload);

/** 7. GET trade item codes by CC */
export const getTradeItemsByCC = (ccCode) =>
    axios.get(`${base}/Accounts/GetTrademanItemCodesbycc`, { params: { CCCode: ccCode } });

/** 8. GET manufacturing clients by cost center */
export const getManClientsByCostCenter = (ccCode) =>
    axios.get(`${base}/Accounts/GetManClientbyCostCenter`, { params: { CcCode: ccCode } });

/** 9. GET manufacturing sub-clients by client */
export const getManSubClientsByClient = ({ ccCode, clientcode }) =>
    axios.get(`${base}/Accounts/GetManSubClientsbyClient`, { params: { CcCode: ccCode, Clientcode: clientcode } });

/** 10. GET manufacturing sub-client PO for invoice */
export const getManSubClientPO = ({ subClient, ccCode, clientcode }) =>
    axios.get(`${base}/Accounts/GetManSubClientPOForInvoice`, { params: { SubClient: subClient, CcCode: ccCode, Clientcode: clientcode } });

/** 11. POST save manufacture items (link item to invoice context) */
export const saveManufactureItems = (payload) =>
    axios.post(`${base}/Accounts/SaveManufactureItems`, payload);

/** 12. POST save client manufacture invoice */
export const saveClientManufactureInvoice = (payload) =>
    axios.post(`${base}/Accounts/SaveClientManufactureInvoiceCreation`, payload);
