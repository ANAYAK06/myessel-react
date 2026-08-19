import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

const base = API_BASE_URL;

/** 1. GET all financial years */
export const getAllFinancialYears = () =>
    axios.get(`${base}/Accounts/GetAllFinancialYears`);

/** 2. GET the company depreciation config view for a financial year */
export const getCDConfigView = ({ FYear, PrevYear, Type }) =>
    axios.get(`${base}/Accounts/GetCDConfigview`, {
        params: { FYear, PrevYear, Type },
    });

/** 3. POST save the company depreciation config (bulk — comma-separated SubDCAs/Percentages) */
export const saveCompanyDepreciationConfig = (payload) =>
    axios.post(`${base}/Accounts/SaveCompanyDepreciationConfig`, payload);
