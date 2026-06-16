import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

const headers = { 'Content-Type': 'application/json' };

const handle = (err) => {
    if (err.response?.data) throw err.response.data;
    throw err;
};

export const getIndentVerificationGrid = async (roleId, created = '', userId = '') => {
    try {
        const res = await axios.get(
            `${API_BASE_URL}/Purchase/VerifyIndentCreationGrid?Roleid=${roleId}&Created=${created}&Userid=${userId}`,
            { headers }
        );
        return res.data;
    } catch (err) { handle(err); }
};

export const viewIndentItemsDetails = async (indno) => {
    try {
        const res = await axios.get(
            `${API_BASE_URL}/Purchase/ViewIndentItemsDetails?Indno=${indno}`,
            { headers }
        );
        return res.data;
    } catch (err) { handle(err); }
};

export const viewIndentRemarks = async (indno) => {
    try {
        const res = await axios.get(
            `${API_BASE_URL}/Purchase/ViewIndentRemarks?Indno=${indno}`,
            { headers }
        );
        return res.data;
    } catch (err) { handle(err); }
};

export const verifyIndent = async (payload) => {
    try {
        const res = await axios.put(
            `${API_BASE_URL}/Purchase/VerifyIndent`,
            payload,
            { headers, timeout: 30000 }
        );
        return res.data;
    } catch (err) { handle(err); }
};
