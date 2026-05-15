import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

const headers = { 'Content-Type': 'application/json' };

const handle = (err) => {
    if (err.response?.data) throw err.response.data;
    throw err;
};

export const getItemCodeVerificationGrid = async (roleId) => {
    try {
        const res = await axios.get(`${API_BASE_URL}/Purchase/VerifyItemCodeCreationGrid?Roleid=${roleId}`, { headers });
        return res.data;
    } catch (err) { handle(err); }
};

export const getVerificationItemCodeById = async (rowid) => {
    try {
        const res = await axios.get(`${API_BASE_URL}/Purchase/GetVerificationitemcodebyId?Rowid=${rowid}`, { headers });
        return res.data;
    } catch (err) { handle(err); }
};

export const verifyItemCode = async (payload) => {
    try {
        const res = await axios.put(`${API_BASE_URL}/Purchase/VerifyItemcode`, payload, { headers });
        return res.data;
    } catch (err) { handle(err); }
};

export const getItemCodeTradersGrid = async (tranNo) => {
    try {
        const res = await axios.get(`${API_BASE_URL}/Purchase/GetViewItemCodeTradersGrid?TranNo=${tranNo}`, { headers });
        return res.data;
    } catch (err) { handle(err); }
};

export const getItemCodeLinkDataGrid = async (tranNo) => {
    try {
        const res = await axios.get(`${API_BASE_URL}/Purchase/GetViewItemCodeLinkDataGrid?TranNo=${tranNo}`, { headers });
        return res.data;
    } catch (err) { handle(err); }
};

export const getItemCodeRemarks = async (tranNo) => {
    try {
        const res = await axios.get(`${API_BASE_URL}/Purchase/GetItemCodeRemarks?TranNo=${tranNo}`, { headers });
        return res.data;
    } catch (err) { handle(err); }
};
