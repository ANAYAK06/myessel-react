import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

const base = API_BASE_URL;

/** 1. GET all cost centres with their currently configured Client PO lock percent */
export const getClientPOLockPercentList = () =>
    axios.get(`${base}/Accounts/ViewClientpoLockPercent`);

/** 2. GET the current lock percent for a single cost centre */
export const getClientPOPercentageByCode = (code) =>
    axios.get(`${base}/Accounts/GetClientPoPercentage`, {
        params: { code },
    });

/** 3. POST save/update the lock percent for a cost centre */
export const saveCCClientPOPercentDetails = (payload) =>
    axios.post(`${base}/Accounts/SaveCCClientPOPercentDetails`, payload);

/** 4. GET all cost centres for a type/role, used to find CCs not yet configured with a limit */
export const getCostCentersByTypeByRole = ({ CCType, SubType, UID, RID, CCstatus }) =>
    axios.get(`${base}/Accounts/GetCostCentersbyTypebyrole`, {
        params: { CCType, SubType, UID, RID, CCstatus },
    });
