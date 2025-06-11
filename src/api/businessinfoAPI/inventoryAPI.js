// api/stockInventoryAPI.js
import axios from "axios";

const API_BASE_URL = 'http://localhost:57771/api';

// Indent Operations
// ----------------

export const saveIndent = async (indentData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Purchase/SaveIndent`,
            indentData,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const saveIndentCSK = async (indentData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Purchase/SaveIndentCSK`,
            indentData,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const saveIndentItems = async (itemsData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Purchase/SaveIndentItems`,
            itemsData,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const deleteIndentItem = async (itemData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Purchase/DeleteIndentItem`,
            itemData,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const verifyIndentCreationGrid = async (roleid, created, userid) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/VerifyIndentCreationGrid?Roleid=${roleid}&Created=${created}&Userid=${userid}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const getIndentDefineType = async (cCode) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetIndentDefineType?CCode=${cCode}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const getItemCodesByCCDetails = async (indent) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetItemCodesbyCCDetails?Indent=${indent}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const getRemarksByCCDetails = async (indent) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetRemarksbyCCDetails?Indent=${indent}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const getVerificationIndentByCode = async (indentno, roleId) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetVerificationIndentbyCode?Indentno=${indentno}&RoleId=${roleId}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const getItemCodesSubtotalDetails = async (indent) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetItemCodesSubtotalDetails?Indent=${indent}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const verifyIndent = async (indentData) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/Purchase/VerifyIndent`,
            indentData,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const getItemCodesByCSKDetails = async (indent, role) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetItemCodesbyCSKDetails?Indent=${indent}&Role=${role}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const getIndentLevels = async (moid, roleid) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetIndentLevels?MOID=${moid}&Roleid=${roleid}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const getIndentFirstLevelDetails = async (roleid) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetIndentFirstLevelDetails?Roleid=${roleid}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const getItemCodesByPUMDetails = async (indent, ccCode, cType) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetItemCodesbyPUMDetails?Indent=${indent}&CCCode=${ccCode}&CType=${cType}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const getItemCodesByOtherDetails = async (indent, role) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetItemCodesbyOtherDetails?Indent=${indent}&Role=${role}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const saveUpdateIndentItems = async (itemsData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Purchase/SaveUpdateIndentItems`,
            itemsData,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const deleteReturnIndentItem = async (itemData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Purchase/DeleteReturnIndentItem`,
            itemData,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const returnUpdateIndent = async (indentData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Purchase/ReturnUpdateIndent`,
            indentData,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// Indent Amendment Operations
// --------------------------

export const getAmendIndents = async (ccCode) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetAmendIndents?CCCode=${ccCode}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const getAmendIndentItems = async (ccCode, indentno) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GETAmendIndentItems?CCCode=${ccCode}&Indentno=${indentno}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const savePOIndentItems = async (itemsData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Purchase/SavePOIndentItems`,
            itemsData,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const saveIndentItemAmend = async (amendData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Purchase/SaveIndentItemAmend`,
            amendData,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const getVerifyIndentAmend = async (roleid, username) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetVerifyIndentAmend?Roleid=${roleid}&Username=${username}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const getIndentAmendByNo = async (ccCode, amendId, indentNo) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetIndentAmendbyNo?CCCode=${ccCode}&AmendId=${amendId}&IndentNo=${indentNo}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const approveIndentAmend = async (amendData) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/Purchase/ApproveIndentAmend`,
            amendData,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const checkIndentPOStatus = async (indentNo) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/CheckIndentPOStatus?IndentNo=${indentNo}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// Stock Issue Operations
// ---------------------

export const saveNewItemsIssue = async (issueData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Purchase/SaveNewItemsIssue`,
            issueData,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const getNewStockIssueCCS = async (uid, rid) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/Getnewstockissueccs?UID=${uid}&RID=${rid}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const getIssueIndentsByCC = async (ccCode) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetIssueIndentsbyCC?CCCode=${ccCode}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const getIssueItemCodesByCC = async (ccCode, indentNo) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetIssueitemcodesbyCC?CCCode=${ccCode}&IndentNo=${indentNo}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const getNewItemsIssueTempDetails = async (itemcode, cccode, indent) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetNewItemsIssueTempDetails?Itemcode=${itemcode}&CCcode=${cccode}&Indent=${indent}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const saveTempNewItemsIssue = async (issueData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Purchase/SaveTempNewItemsIssue`,
            issueData,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const getViewNewIssueItemsGridView = async (cccode, indentno) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetViewNewIssueItemsGridView?CCcode=${cccode}&Indentno=${indentno}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const deleteNewStockIssueItems = async (itemData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Purchase/DeleteNewStockIssueItems`,
            itemData,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const getVerifyNewStockIssueGrid = async (roleId, userid) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetVerifyNewStockIssueGrid?RoleId=${roleId}&Userid=${userid}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const getVerifyNewStockIssueView = async (rowid) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetVerifyNewStockIssueView?Rowid=${rowid}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const viewNewStockIssueGrid = async (trno) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/ViewNewStockIssueGrid?Trno=${trno}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const viewNewStockIssueRemarks = async (trno) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/ViewNewStockIssueRemarks?Trno=${trno}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const approveNewStockIssue = async (issueData) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/Purchase/ApproveNewStockIssue`,
            issueData,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// Stock Issue Received Operations
// ------------------------------

export const getNewStockIssueReceivedCCS = async (uid, rid) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetnewstockissueRecievedccs?UID=${uid}&RID=${rid}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const getIssueRecIndentsByCC = async (ccCode) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetIssueRecIndentsbyCC?CCCode=${ccCode}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const newItemsIssueReceivedDetails = async (cccode, indent) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/NewItemsIssueReceivedDetails?CCcode=${cccode}&Indent=${indent}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const saveNewItemsIssueReceived = async (receivedData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Purchase/SaveNewItemsIssueReceived`,
            receivedData,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const getVerifyNewStockReceivedGrid = async (roleId, userid) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetVerfiyNewStockReceivedGrid?RoleId=${roleId}&Userid=${userid}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const getVerifyNewStockReceivedView = async (rowid) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetVerifyNewStockReceivedView?Rowid=${rowid}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const viewNewStockReceivedGrid = async (trno) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/ViewNewStockReceivedGrid?Trno=${trno}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const approveNewStockIssueReceived = async (receivedData) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/Purchase/ApproveNewStockIssueRecieved`,
            receivedData,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// Old Stock Operations
// -------------------

export const getOldStockIssueCCS = async (uid, rid) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/Getoldstockissueccs?UID=${uid}&RID=${rid}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const getOldIssueIndentsByCC = async (ccCode) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetOldIssueIndentsbyCC?CCCode=${ccCode}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const getOldItemsIssueTempDetails = async (cccode, indent) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetOldItemsIssueTempDetails?CCcode=${cccode}&Indent=${indent}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const saveOldItemsIssue = async (issueData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Purchase/SaveOldItemsIssue`,
            issueData,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const getVerifyOldStockIssueGrid = async (roleId, userid) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetVerfiyOldStockIssueGrid?RoleId=${roleId}&Userid=${userid}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const getVerifyOldStockIssueView = async (rowid) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetVerifyOldStockIssueView?Rowid=${rowid}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const viewOldStockIssueGrid = async (trno) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/ViewOldStockIssueGrid?Trno=${trno}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const viewOldStockIssueRemarks = async (trno) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/ViewOldStockIssueRemarks?Trno=${trno}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const approveOldStockIssue = async (issueData) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/Purchase/ApproveOldStockIssue`,
            issueData,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// Old Stock Received Operations
// ----------------------------

export const getOldStockIssueReceivedCCS = async (uid, rid) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetoldstockissueRecievedccs?UID=${uid}&RID=${rid}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const getOldIssueRecIndentsByCC = async (ccCode) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetoldIssueRecIndentsbyCC?CCCode=${ccCode}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const oldItemsIssueReceivedDetails = async (cccode, indent) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/OldItemsIssueReceivedDetails?CCcode=${cccode}&Indent=${indent}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const saveOldItemsIssueReceived = async (receivedData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Purchase/SaveOldItemsIssueReceived`,
            receivedData,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const getVerifyOldStockReceivedGrid = async (roleId, userid) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetVerfiyOldStockReceivedGrid?RoleId=${roleId}&Userid=${userid}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const getVerifyOldStockReceivedView = async (rowid) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetVerifyOldStockReceivedView?Rowid=${rowid}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const viewOldStockReceivedGrid = async (trno) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/ViewOldStockReceivedGrid?Trno=${trno}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const approveOldStockIssueReceived = async (receivedData) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/Purchase/ApproveOldStockIssueRecieved`,
            receivedData,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// Stock View Operations
// --------------------

export const viewStockGrid = async (cCode, cattype) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/ViewStockGrid?CCode=${cCode}&Cattype=${cattype}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const viewStockGridNew = async (cCode, cattype) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/ViewStockGridNew?CCode=${cCode}&Cattype=${cattype}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const getStockCostCenterCodes = async (uid, rid) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetStockCostCenterCodes?UID=${uid}&RID=${rid}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const getCategoriesStock = async () => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/Getcategoriesstock`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const getAutoCompleteItemCode = async (pfx, cat) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetAutoCompleteitemcode?Pfx=${pfx}&Cat=${cat}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// Stock Helper Functions
// ---------------------

export const checkIndentQty = async (indentNo, ccCode) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/CheckIndentQty?IndentNo=${indentNo}&CCCode=${ccCode}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const getIndentType = async (indentno) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetIndentType?Indentno=${indentno}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const getNewIndentType = async (indentno) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetNewIndentType?Indentno=${indentno}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const indentItemCodeSummaryPopup = async (itemcode, cccode) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/IndentItemcodeSummaryPopup?Itemcode=${itemcode}&CCcode=${cccode}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const newStockTransferSummaryPopup = async (itemcode, refno) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/NewStockTransferSummaryPopup?Itemcode=${itemcode}&Refno=${refno}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const newStockIssueSummaryPopup = async (itemcode, refno) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/NewStockIssueSummaryPopup?Itemcode=${itemcode}&Refno=${refno}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const getIndentCategoriesDetails = async (cType) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetIndentcategoriesDetails?CType=${cType}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const getAutoComplete = async (pfx, typ, cat) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetAutoComplete?Pfx=${pfx}&Typ=${typ}&Cat=${cat}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const getItemCodesByCC = async (cCode, capitalItemcode, materialtype) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetItemCodesbyCC?CCode=${cCode}&CapitalItemcode=${capitalItemcode}&Materialtype=${materialtype}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};