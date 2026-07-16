import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

const base = API_BASE_URL;

/** 1. GET all cost centers (Misc invoice main section) */
export const getMiscCostCenters = () =>
    axios.get(`${base}/Accounts/GetAllCostCenters`);

/** 2. GET all clients (Interest from Client flow) */
export const getMiscClients = () =>
    axios.get(`${base}/Accounts/GetAllMiscClients`);

/** 3. GET sub-clients by client */
export const getMiscSubClients = (clientid) =>
    axios.get(`${base}/Accounts/GetMiscSubclient`, { params: { clientid } });

/** 4. GET DCA list by cost center + invoice date */
export const getMiscTaxDCA = ({ ccCode, invdate }) =>
    axios.get(`${base}/Accounts/GetmsicTaxDCA`, { params: { CcCode: ccCode, invdate } });

/** 5. GET sub-DCA list by DCA code */
export const getMiscTaxSubDCA = (dcaCode) =>
    axios.get(`${base}/Accounts/GetMiscTaxSDCA`, { params: { DCACode: dcaCode } });

/** 6. GET deduction cost centers (Value = 'Intrest From Clients' | 'Interest From Others') */
export const getMiscDedCC = (value) =>
    axios.get(`${base}/Accounts/GetMiscDedCC`, { params: { Value: value } });

/** 7. POST save miscellaneous (interest) invoice */
export const saveMiscellaneous = (payload) =>
    axios.post(`${base}/Accounts/Savemiscellaneous`, payload);
