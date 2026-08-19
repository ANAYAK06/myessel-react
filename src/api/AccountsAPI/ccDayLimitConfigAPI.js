import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

const base = API_BASE_URL;

/** 1. GET all cost centres with their currently configured day limit amount */
export const getConfigCCDetails = () =>
    axios.get(`${base}/Accounts/GetConfigCCdetails`);

/** 2. POST save/update the day limit amount for a cost centre */
export const saveCCDayLimitDetails = ({ code, value }) =>
    axios.post(`${base}/Accounts/SaveCCDayLimitDetails`, { code, value });
