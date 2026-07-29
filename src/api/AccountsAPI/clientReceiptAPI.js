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

// ── Initial selection ────────────────────────────────────────────────────────

// Invoice Type (Invoice Service / Manufacturing / Trading)
export const getClientReceiptInvType = () => get(`${base}/GetClientRecieptInvType`);

// Payment types (PaymentTypeID / PaymentTypeDescription) — used to resolve the correct
// BankTransactions.TypeOfTransactionId per flow (Invoice Service / Advance / Retention / Hold)
export const getPaymentTypes = () => get(`${base}/GetPaymentTypes`);

// ── Invoice Service flow ─────────────────────────────────────────────────────

// 0. CC list by invoice sub-type (Invoice Service / Manufacturing / Trading) — shared with Client Invoice Creation
export const getCostCenterBySubType = ({ SubType }) => get(`${base}/GetCostCenterbySubType`, { SubType });

// 1. PO list by CC
export const getClientInvPOByCC = ({ CCCode }) => get(`${base}/GetClientInvPObyCC`, { CCCode });

// 2. Invoice numbers by CC + PO
export const getClientInvNoByCCPO = ({ CCCode, PONo }) => get(`${base}/GetClientInvNobyCCPO`, { CCCode, PONo });

// 3. Invoice details by invoice id (auto-fill)
export const getClientInvDetailsById = ({ InvId }) => get(`${base}/GetClientInvDetailsbyId`, { InvId });

// 4. Invoice tax breakup by invoice id
export const getClientInvTaxDetails = ({ InvId }) => get(`${base}/GetClientInvTaxDetails`, { InvId });

// ── Deduction (shared across all 4 branches) ─────────────────────────────────

// 5. CC list for deduction rows (blank CCCode = full list; pass main CC to get "other" CCs)
export const getCCForClientInvDeduction = ({ CCCode } = {}) => get(`${base}/GetCCForCleintInvDeduction`, { CCCode });

// 6. Account Head (DCA) list by CC
export const getDCAForClientInvDeduction = ({ CcCode }) => get(`${base}/GetDCAForCleintInvDeduction`, { CcCode });

// 7. Sub Account Head (SubDCA) list by DCA id
export const getSubDCAForClientInvDeduction = ({ DCAid }) => get(`${base}/GetSubDCAForCleintInvDeduction`, { DCAid });

// 8. Sub Account Head (SubDCA) list by DCA code (preferred)
export const getSubDCAForClientInvDeductionByCode = ({ DCACode }) => get(`${base}/GetSubDCAForCleintInvDeductionbycode`, { DCACode });

// 9. Save Invoice Service receipt
export const saveClientInvoiceRecievable = (payload) => post(`${base}/SaveClientInvoiceRecievable`, payload);

// ── Retention flow ────────────────────────────────────────────────────────────

// 16. Clients
export const getRetentPayInvClients = () => get(`${base}/GetRetentPayInvClients`);

// 17. Sub-clients by client
export const getRetentPayInvSubClients = ({ clientcode }) => get(`${base}/GetRetentPayInvSubClients`, { clientcode });

// 18. CC by client + sub-client
export const getRetentPayInvCCByClients = ({ ClientCode, SClientcode }) => get(`${base}/GetRetentPayInvCCbyClients`, { ClientCode, SClientcode });

// 19. PO list
export const getRetentPayInvPO = ({ ClientCode, SClientcode, CCCode }) => get(`${base}/GetRetentPayInvPO`, { ClientCode, SClientcode, CCCode });

// 20. PO/invoice detail (auto-fill RA / Amount / dates)
export const getRetentPayInvDetails = ({ ClientCode, SClientcode, CCCode, PO }) => get(`${base}/GetRetentPayInvDetails`, { ClientCode, SClientcode, CCCode, PO });

// 21. Save Retention payment
export const saveClientRetentionPayment = (payload) => post(`${base}/SaveClientRetentionPayment`, payload);

// ── Hold flow ─────────────────────────────────────────────────────────────────

// 22. Clients
export const getHoldPayInvClients = () => get(`${base}/GetHoldPayInvClients`);

// 23. Sub-clients by client
export const getHoldPayInvSubClients = ({ clientcode }) => get(`${base}/GetHoldPayInvSubClients`, { clientcode });

// 24. CC by client + sub-client
export const getHoldPayInvCCByClients = ({ ClientCode, SClientcode }) => get(`${base}/GetHoldPayInvCCbyClients`, { ClientCode, SClientcode });

// 25. PO list
export const getHoldPayInvPO = ({ ClientCode, SClientcode, CCCode }) => get(`${base}/GetHoldPayInvPO`, { ClientCode, SClientcode, CCCode });

// 26. PO/invoice detail (auto-fill RA / Amount / dates)
export const getHoldPayInvDetails = ({ ClientCode, SClientcode, CCCode, PO }) => get(`${base}/GetHoldPayInvDetails`, { ClientCode, SClientcode, CCCode, PO });

// 27. Save Hold payment
export const saveClientHoldPayment = (payload) => post(`${base}/SaveClientHoldPayment`, payload);

// ── Advance flow ──────────────────────────────────────────────────────────────

// 28. Clients
export const getAdvPayPOClients = () => get(`${base}/GetAdvPayPOClients`);

// 29. Sub-clients by client
export const getAdvPayPOSubClients = ({ ClientCode }) => get(`${base}/GetAdvPayPOSubClients`, { ClientCode });

// 30. CC by sub-client
export const getAdvPayPOCC = ({ SubClientCode }) => get(`${base}/GetAdvPayPOCC`, { SubClientCode });

// 31. PO list (rows carry detail fields — RA / Advance Request Date / Amount — used directly for auto-fill)
export const getAdvPayPO = ({ ClientCode, SubClientCode, CCcode }) => get(`${base}/GetAdvPayPO`, { ClientCode, SubClientCode, CCcode });

// 32. Save Advance payment
export const saveClientAdvancePayment = (payload) => post(`${base}/SaveClientAdvancePayment`, payload);
