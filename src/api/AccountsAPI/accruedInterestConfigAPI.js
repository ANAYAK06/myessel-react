import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

const base = API_BASE_URL;

/** 1. GET all cost centres currently configured with an accrued-interest rate */
export const getCCAccrueDetails = ({ Type }) =>
    axios.get(`${base}/Accounts/GetCCAccurateDetails`, { params: { Type } });

/** 2. GET all cost centres for a type/role, used to find CCs not yet configured with a rate */
export const getCostCentersByTypeByRole = ({ CCType, SubType, UID, RID, CCstatus }) =>
    axios.get(`${base}/Accounts/GetCostCentersbyTypebyrole`, {
        params: { CCType, SubType, UID, RID, CCstatus },
    });

/** 3. POST save/update the accrued-interest rate for a cost centre */
export const saveCCAccurateValues = (payload) =>
    axios.post(`${base}/Accounts/SaveCCAccurateValues`, payload);
