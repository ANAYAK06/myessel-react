import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

const base = API_BASE_URL;

/** 1. GET cost centers by CC type */
export const getTradingCostCenters = (ccType) =>
    axios.get(`${base}/Accounts/GetCostCenterbycctype`, { params: { ccType } });

/** 2. GET trade item codes by CC */
export const getTradingItemsByCC = (ccCode) =>
    axios.get(`${base}/Accounts/GetItemCodesbycc`, { params: { CCCode: ccCode } });

/** 3. GET temp issue details for a trade item */
export const getTradingItemTempDetails = ({ itemcode, ccCode }) =>
    axios.get(`${base}/Accounts/NewTradeItemsIssueTempDetails`, { params: { Itemcode: itemcode, CCcode: ccCode } });

/** 4. GET already-added trade items grid */
export const getTradingItemsGrid = (ccCode) =>
    axios.get(`${base}/Accounts/ViewNewTradeIssueItemsGridView`, { params: { CCcode: ccCode } });

/** 5. POST save temp trade items issue */
export const saveTempTradingItems = (payload) =>
    axios.post(`${base}/Accounts/SaveTempTradeNewItemsIssue`, payload);

/** 6. POST delete trade stock issue item */
export const deleteTradingStockItem = (payload) =>
    axios.post(`${base}/Accounts/DeleteTradeStockIssueItems`, payload);

/** 7. GET trade clients by cost center */
export const getTradingClientsByCC = (ccCode) =>
    axios.get(`${base}/Accounts/GetTradeClientbyCostCenter`, { params: { CcCode: ccCode } });

/** 8. GET trade sub-clients by client */
export const getTradingSubClientsByClient = ({ ccCode, clientcode }) =>
    axios.get(`${base}/Accounts/GetTradeSubClientsbyClient`, { params: { CcCode: ccCode, Clientcode: clientcode } });

/** 9. GET trade sub-client PO for invoice */
export const getTradingSubClientPO = ({ subClient, ccCode, clientcode }) =>
    axios.get(`${base}/Accounts/GetTradeSubClientPOForInvoice`, { params: { SubClient: subClient, CcCode: ccCode, Clientcode: clientcode } });

/** 10. POST save trading client invoice */
export const saveTradingClientInvoice = (payload) =>
    axios.post(`${base}/Accounts/SaveTradingClientInvoiceCreation`, payload);
