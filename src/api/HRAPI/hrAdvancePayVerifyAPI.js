import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

const handle = (err) => {
    if (err.response?.data) throw err.response.data;
    throw err;
};

export const getHRAdvancePayForVerify = async (roleId) => {
    try {
        const res = await axios.get(`${API_BASE_URL}/HR/GetHRAdvancePayForVerify`, {
            params: { Roleid: roleId },
            headers: { 'Content-Type': 'application/json' },
        });
        return res.data;
    } catch (err) { handle(err); }
};

export const getHRAdvancePayData = async ({ transNo, empRefNo }) => {
    try {
        const res = await axios.get(`${API_BASE_URL}/HR/GetHRAdvancePayData`, {
            params: { TransNo: transNo, Emprefno: empRefNo },
            headers: { 'Content-Type': 'application/json' },
        });
        return res.data;
    } catch (err) { handle(err); }
};

export const approveHRAdvancePayment = async (payload) => {
    try {
        const res = await axios.put(`${API_BASE_URL}/HR/ApproveHRAdvancePayment`, payload, {
            headers: { 'Content-Type': 'application/json' },
        });
        return res.data;
    } catch (err) { handle(err); }
};
