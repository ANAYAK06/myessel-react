import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

const headers = { 'Content-Type': 'application/json' };

const handle = (err) => {
    if (err.response?.data) throw err.response.data;
    throw err;
};

// 1. Inbox — pending items for the role
export const getIndentVerificationGrid = async (roleId, created = '', userId = '') => {
    try {
        const res = await axios.get(
            `${API_BASE_URL}/Purchase/VerifyIndentCreationGrid?Roleid=${roleId}&Created=${created}&Userid=${userId}`,
            { headers }
        );
        return res.data;
    } catch (err) { handle(err); }
};

// 2. Level config for this role — returns IndentPresentLevel, IndentDefineLevel, NewItemDefineLevel
export const getIndentLevels = async (MOID, roleId) => {
    try {
        const res = await axios.get(
            `${API_BASE_URL}/Purchase/GetIndentLevels?MOID=${MOID}&Roleid=${roleId}`,
            { headers }
        );
        return res.data;
    } catch (err) { handle(err); }
};

// 3. Indent header — MOID, Rowid, IndentTypeDefine, Status
export const getVerificationIndentByCode = async (indentno, roleId) => {
    try {
        const res = await axios.get(
            `${API_BASE_URL}/Purchase/GetVerificationIndentbyCode?Indentno=${encodeURIComponent(indentno)}&RoleId=${roleId}`,
            { headers }
        );
        return res.data;
    } catch (err) { handle(err); }
};

// 4. Define types for a cost center code
export const getIndentDefineType = async (CCode) => {
    try {
        const res = await axios.get(
            `${API_BASE_URL}/Purchase/GetIndentDefineType?CCode=${CCode}`,
            { headers }
        );
        return res.data;
    } catch (err) { handle(err); }
};

// 5. Items — CSK role (PresentLevel == DefineLevel)
export const getItemCodesByCSKDetails = async (Indent, Role) => {
    try {
        const res = await axios.get(
            `${API_BASE_URL}/Purchase/GetItemCodesbyCSKDetails?Indent=${encodeURIComponent(Indent)}&Role=${Role}`,
            { headers }
        );
        return res.data;
    } catch (err) { handle(err); }
};

// 6. Items — PUM role (PresentLevel == NewItemDefineLevel)
export const getItemCodesByPUMDetails = async (Indent, CCCode = '', CType = '') => {
    try {
        const res = await axios.get(
            `${API_BASE_URL}/Purchase/GetItemCodesbyPUMDetails?Indent=${encodeURIComponent(Indent)}&CCCode=${CCCode}&CType=${CType}`,
            { headers }
        );
        return res.data;
    } catch (err) { handle(err); }
};

// 7. Items — Other roles (all remaining levels: CC early + higher mgmt)
export const getItemCodesByOtherDetails = async (Indent, Role) => {
    try {
        const res = await axios.get(
            `${API_BASE_URL}/Purchase/GetItemCodesbyOtherDetails?Indent=${encodeURIComponent(Indent)}&Role=${Role}`,
            { headers }
        );
        return res.data;
    } catch (err) { handle(err); }
};

// 8. Remarks history for indent
export const getRemarksByCCDetails = async (Indent) => {
    try {
        const res = await axios.get(
            `${API_BASE_URL}/Purchase/GetRemarksbyCCDetails?Indent=${encodeURIComponent(Indent)}`,
            { headers }
        );
        return res.data;
    } catch (err) { handle(err); }
};

// 9. Subtotal breakdown
export const getItemCodesSubtotalDetails = async (Indent) => {
    try {
        const res = await axios.get(
            `${API_BASE_URL}/Purchase/GetItemCodesSubtotalDetails?Indent=${encodeURIComponent(Indent)}`,
            { headers }
        );
        return res.data;
    } catch (err) { handle(err); }
};

// 10. Asset serial item codes for CSK issuance (serialised assets)
export const getAssetItemCodes = async (itemcode, cccode) => {
    try {
        const res = await axios.get(
            `${API_BASE_URL}/Purchase/GETAssetItemcodes?itemcode=${encodeURIComponent(itemcode)}&For=CSK&cccode=${encodeURIComponent(cccode)}`,
            { headers }
        );
        return res.data;
    } catch (err) { handle(err); }
};

// 11. Verify / Approve / Return / Reject
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
