import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

const base = API_BASE_URL;

/** 1. GET CC types for general invoice */
export const getGeneralCCTypes = () =>
    axios.get(`${base}/Accounts/GetCostCenterTypesgeneral`);

/** 2. GET CC sub-types (Manufacturing / Service / Trading) */
export const getGeneralCCSubTypes = () =>
    axios.get(`${base}/Accounts/GetCostCenterSubTypes`);

/** 3. GET cost centers by type + subtype (subType = '' for non-Performing types) */
export const getGeneralCostCenters = ({ ccType, subType }) =>
    axios.get(`${base}/Accounts/GetCostCentersforGenInvoice`, { params: { CCType: ccType, SubType: subType } });

/** 4. GET PAN autocomplete (Pfx = first 3 chars, Typ = 'Name' | 'PAN') */
export const searchPANAutocomplete = ({ pfx, typ }) =>
    axios.get(`${base}/Accounts/GetAutoCompletepan`, { params: { Pfx: pfx, Typ: typ } });

/** 5. POST save new PAN */
export const saveNewPAN = (payload) =>
    axios.post(`${base}/Accounts/SaveNewPan`, payload);

/** 6. GET DCA codes by CC and final date */
export const getGeneralDCA = ({ ccCode, finalDate }) =>
    axios.get(`${base}/Accounts/GetDCAByCCNew`, { params: { CCCode: ccCode, Finaldate: finalDate } });

/** 7. GET sub-DCA codes by DCA code */
export const getGeneralSubDCA = (dcaCode) =>
    axios.get(`${base}/Accounts/GetSubDCAbyDCA`, { params: { DCACode: dcaCode } });

/** 8. GET deduction cost centers */
export const getGeneralDedCostCenters = () =>
    axios.get(`${base}/Accounts/GetGeneralDedCostCenter`);

/** 9. POST insert general invoice */
export const insertGeneralInvoice = (payload) =>
    axios.post(`${base}/Accounts/InsertGeneralInvoice`, payload);
