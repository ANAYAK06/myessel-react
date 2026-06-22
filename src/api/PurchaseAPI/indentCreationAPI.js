import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

const headers = { 'Content-Type': 'application/json' };

const handle = (err) => {
    if (err.response?.data) throw err.response.data;
    throw err;
};

// GET CCType for a cost center code
export const getCostCenterType = async (CCType) => {
    try {
        const res = await axios.get(
            `${API_BASE_URL}/Purchase/GetCostCenterTypeIT?CCType=${encodeURIComponent(CCType)}`,
            { headers }
        );
        return res.data;
    } catch (err) { handle(err); }
};

// GET list of capital master types allowed for a CC type
export const getCapitalMasterTypes = async (Type) => {
    try {
        const res = await axios.get(
            `${API_BASE_URL}/Purchase/GetCapitalMasterTypes?Type=${encodeURIComponent(Type)}`,
            { headers }
        );
        return res.data;
    } catch (err) { handle(err); }
};

// GET staged indent line items for the current CC + capital selection
export const getItemCodesByCC = async (CCode, CapitalItemcode, Materialtype) => {
    try {
        const params = new URLSearchParams({ CCode });
        if (CapitalItemcode) params.append('CapitalItemcode', CapitalItemcode);
        if (Materialtype)    params.append('Materialtype', Materialtype);
        const res = await axios.get(
            `${API_BASE_URL}/Purchase/GetItemCodesbyCC?${params.toString()}`,
            { headers }
        );
        return res.data;
    } catch (err) { handle(err); }
};

// GET item categories for a cost center (CType = CCCode)
export const getIndentCategories = async (CType) => {
    try {
        const res = await axios.get(
            `${API_BASE_URL}/Purchase/GetIndentcategoriesDetails?CType=${encodeURIComponent(CType)}`,
            { headers }
        );
        return res.data;
    } catch (err) { handle(err); }
};

// GET item search autocomplete (Typ: 'C' = by code, 'N' = by name)
export const getAutoComplete = async (Pfx, Typ, Cat) => {
    try {
        const res = await axios.get(
            `${API_BASE_URL}/Purchase/GetAutoComplete?Pfx=${encodeURIComponent(Pfx)}&Typ=${encodeURIComponent(Typ)}&Cat=${encodeURIComponent(Cat)}`,
            { headers }
        );
        return res.data;
    } catch (err) { handle(err); }
};

// POST — add one item to staging table
// payload: { ItemCode, Costcenter, CapitalMaterialType, CapitalMaterials }
export const saveIndentItems = async (payload) => {
    try {
        const res = await axios.post(
            `${API_BASE_URL}/Purchase/SaveIndentItems`,
            payload,
            { headers, timeout: 30000 }
        );
        return res.data;
    } catch (err) { handle(err); }
};

// POST — remove a staged line item
// payload: { IndentListId }
export const deleteIndentItem = async (payload) => {
    try {
        const res = await axios.post(
            `${API_BASE_URL}/Purchase/DeleteIndentItem`,
            payload,
            { headers, timeout: 30000 }
        );
        return res.data;
    } catch (err) { handle(err); }
};

// GET stock summary popup for a specific item at a CC
export const getIndentItemSummaryPopup = async (Itemcode, CCcode) => {
    try {
        const res = await axios.get(
            `${API_BASE_URL}/Purchase/IndentItemcodeSummaryPopup?Itemcode=${encodeURIComponent(Itemcode)}&CCcode=${encodeURIComponent(CCcode)}`,
            { headers }
        );
        return res.data;
    } catch (err) { handle(err); }
};

// POST — finalize and submit the indent
// payload: { IndentListIds, Quantitys, Amounts, TotalAmount, Date, Remarks, Costcenter, Createdby, RoleID }
export const saveIndent = async (payload) => {
    try {
        const res = await axios.post(
            `${API_BASE_URL}/Purchase/SaveIndent`,
            payload,
            { headers, timeout: 30000 }
        );
        return res.data;
    } catch (err) { handle(err); }
};
