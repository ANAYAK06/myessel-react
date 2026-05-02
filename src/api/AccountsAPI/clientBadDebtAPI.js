import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

const base = `${API_BASE_URL}/Accounts`;

const get = async (url, params) => {
    try {
        const r = await axios.get(url, { params });
        return r.data;
    } catch (e) {
        if (e.response?.data) throw e.response.data;
        throw e.message || 'Request failed';
    }
};

const post = async (url, payload) => {
    try {
        const r = await axios.post(url, payload, { headers: { 'Content-Type': 'application/json' } });
        return r.data;
    } catch (e) {
        if (e.response?.data) throw e.response.data;
        throw e.message || 'Request failed';
    }
};

// 1. Payment types (Invoice Service / Retention / Hold)
export const getBadDebtPaymentTypes = () => get(`${base}/GetBadDebtPaymentTypes`);

// 2. Invoice types (for Invoice Service flow)
export const getClientBadDebtInvTypes = () => get(`${base}/GetClientBadDebtRecieptInvType`);

// 3. CC codes for Invoice Service flow (by InvType)
export const getInvServiceCCCodes = ({ InvType }) => get(`${base}/BindClientRec_Cccodesbaddebt`, { InvType });

// 4. CC codes for Retention flow
export const getRetentionCCCodes = ({ Userid, RoleId, Type }) => get(`${base}/GetRetentPayInvCCbyClientsnew`, { Userid, RoleId, Type });

// 5. Client by CC Code (Retention)
export const getClientByCC = ({ CCCode }) => get(`${base}/GetInvCCCodebyClientNew`, { CCCode });

// 6. CC codes for Hold flow
export const getHoldCCCodes = ({ Userid, RoleId, Type }) => get(`${base}/GetHoldPayInvCCbyClientsNew`, { Userid, RoleId, Type });

// 7. Client by CC Code (Hold)
export const getClientByCCHold = ({ CCCode }) => get(`${base}/GetInvCCCodebyClientHoldNew`, { CCCode });

// 8. Sub-client by Client + CC (Retention)
export const getRetentionSubClients = ({ ClientCode, CCcode }) => get(`${base}/GetRetSubClientbyClientNew`, { ClientCode, CCcode });

// 9. Sub-client by Client + CC (Hold)
export const getHoldSubClients = ({ clientcode, CCcode }) => get(`${base}/GetHoldPayInvSubClientsnew`, { clientcode, CCcode });

// 10. POs for Retention
export const getRetentionPOs = ({ ClientCode, SClientcode, CCCode }) => get(`${base}/GetRetentPayInvPOBadDebt`, { ClientCode, SClientcode, CCCode });

// 11. POs for Hold
export const getHoldPOs = ({ ClientCode, SClientcode, CCCode }) => get(`${base}/GetHoldPayInvPOBadDebt`, { ClientCode, SClientcode, CCCode });

// 12. Invoice details for Retention
export const getRetentionInvoices = ({ ClientCode, SClientcode, CCCode, PO }) => get(`${base}/GetRetentPayInvDetails`, { ClientCode, SClientcode, CCCode, PO });

// 13. Invoice details for Hold
export const getHoldInvoices = ({ ClientCode, SClientcode, CCCode, PO }) => get(`${base}/GetHoldPayInvDetails`, { ClientCode, SClientcode, CCCode, PO });

// 14. Save Invoice Service
export const saveInvoiceServiceBD = (payload) => post(`${base}/SaveClientInvoiceBDRecievable`, payload);

// 15. Save Retention
export const saveRetentionBD = (payload) => post(`${base}/SaveClientBDRetentionPayment`, payload);

// 16. Save Hold
export const saveHoldBD = (payload) => post(`${base}/SaveClientBDHoldPayment`, payload);
