// api/budgetAPI.js
import axios from "axios";

const API_BASE_URL = 'http://localhost:57771/api';

// Cost Center Budget Operations
// ----------------------------

export const getCCFinancialYear = async () => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetCCFinancialYear`,
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

export const saveCCAssignedBudget = async (budgetData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Accounts/SaveCCAssignedBudget`,
            budgetData,
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

export const getCCDetails = async (roleid, fnYear, ccSubType, ccType) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetCCDetails?Roleid=${roleid}&FnYear=${fnYear}&CCSubType=${ccSubType}&CCType=${ccType}`,
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

export const getBudgetCostCenters = async () => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetBudgetCostCenters`,
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

export const getBudgetAssignedCC = async () => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetBudgetAssignedCC`,
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

export const getBudgetAssignedCCByID = async (ccCode, year) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetBudgetAssignedCCByID?CCCode=${ccCode}&Year=${year}`,
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

export const getBudgetAssignedCCByCCType = async (cctypeId, subType, fnYear) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetBudgetAssignedCCByCCType?CCtypeId=${cctypeId}&SubType=${subType}&FnYear=${fnYear}`,
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

// DCA Budget Operations
// --------------------

export const getBudgetDCADetails = async (ccTypeID) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetBudgetDCADetails?CcTypeID=${ccTypeID}`,
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

export const saveDCAAssignedBudget = async (budgetData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Accounts/SaveDCAAssignedBudget`,
            budgetData,
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

export const updateDCAAssignedBudget = async (budgetData) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/Accounts/UpdateDCAAssignedBudget`,
            budgetData,
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

export const getDCABudgetDetails = async (ccCode, subtype, year, ccTypeId) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetDCABudgetDetails?CCCode=${ccCode}&Subtype=${subtype}&Year=${year}&CCTypeId=${ccTypeId}`,
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

// Budget Amendment Operations
// --------------------------

export const saveCCAmendBudget = async (amendData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Accounts/SaveCCAmendBudget`,
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

export const amendDCABudgetTemp = async (amendData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Accounts/AmendDCABudgetTemp`,
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

export const saveSingleDCAAmendBudget = async (amendData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Accounts/SaveSingleDCAAmendBudget`,
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

export const getAmendedDCA = async (ccCode) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetAmendedDCA?CCCode=${ccCode}`,
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

export const deleteDCAAmendBudget = async (amendData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Accounts/DeleteDCAAmendBudget`,
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

export const multipleDCAAmend = async (amendData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Accounts/MultipleDCAAmend`,
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

export const getUnAmendedDCAByCCID = async (ccCode, cctype, subType, fnYear) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetUnAmendedDCAByCCID?CCCode=${ccCode}&CCtype=${cctype}&SubType=${subType}&FnYear=${fnYear}`,
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

export const assignDCABudgetFromAmendment = async (assignData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Accounts/AssignDCABudgetFromAmendment`,
            assignData,
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

// Budget Verification Operations
// -----------------------------

export const getVerificationCCBudget = async (roleid, uid) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetVerificationCCBudget?Roleid=${roleid}&UID=${uid}`,
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

export const getCCBudgetById = async (budgetId) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetCCBudgetbyId?BudgetId=${budgetId}`,
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

export const getApprovalCBudgetById = async (budgetId) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetApprovalCBudgetbyid?BudgetId=${budgetId}`,
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

export const approveCostCenterBudget = async (budgetData) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/Accounts/ApproveCostCenterBudget`,
            budgetData,
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

export const updateCCBudget = async (budgetData) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/Accounts/UpdateCCBudget`,
            budgetData,
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

export const getApprovalCCAmendBudgetCDetails = async (roleid, uid) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetApprovalCCAmendBudgetCDetails?Roleid=${roleid}&UID=${uid}`,
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

export const getApprovalCCAmendBudgetById = async (amendId, amendType) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetApprovalCCAmendBudgetById?AmendId=${amendId}&AmendType=${amendType}`,
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

export const approveCostCenterBudgetAmend = async (amendData) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/Accounts/ApproveCostCenterBudgetAmend`,
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

export const updateCCAmendBudget = async (amendData) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/Accounts/UpdateCCAmendBudget`,
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

export const getVerificationDCABudgets = async (roleid, uid) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetVerificationDCABudgets?Roleid=${roleid}&Uid=${uid}`,
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

export const getVerifyDCABudgetById = async (ccCode, year, ccType, roleId) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetVerifyDCABudgetbyId?CCCode=${ccCode}&Year=${year}&CCType=${ccType}&RoleId=${roleId}`,
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

export const getDCABudgetUpdationById = async (ccCode, year, ccType) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetDCABudgetUpdationbyId?CCCode=${ccCode}&Year=${year}&CCType=${ccType}`,
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

export const approveDCABudget = async (budgetData) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/Accounts/ApproveDCABudget`,
            budgetData,
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

export const getVerificationDCAAmends = async (roleid, userid) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetVerificationDCAAmends?Roleid=${roleid}&Userid=${userid}`,
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

export const getVerifyDCABudgetAmendById = async (ccCode, fyear, ctype, status) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetVerifyDCABudgetAmendbyId?CCCode=${ccCode}&Fyear=${fyear}&Ctype=${ctype}&Status=${status}`,
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

export const getDCABudgetAmendGrid = async (ccCode, fyear, status) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetDCABudgetAmendgrid?CCCode=${ccCode}&Fyear=${fyear}&Status=${status}`,
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

export const approveDCABudgetAmend = async (amendData) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/Accounts/ApproveDCABudgetAmend`,
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

export const updateApprovalDCABudgetAmend = async (amendData) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/Accounts/UpdateApprovalDCABudgetAmend`,
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

// Budget Check Operations (From Purchase Module)
// ---------------------------------------------

export const checkBudgetForSupplierPO = async (budgetData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Purchase/CheckBudgetForSupplierPO`,
            budgetData,
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

export const checkBudgetForSupplierPOAmend = async (budgetData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Purchase/CheckBudgetForSuplrPOAmend`,
            budgetData,
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

export const checkSupplierInvoiceBudget = async (budgetData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Purchase/CheckSuppleirInvoiceBudget`,
            budgetData,
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

export const checkSPPOInvoiceBudget = async (budgetData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Purchase/CheckSPPOInvoiceBudget`,
            budgetData,
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

// Budget Reports Operations
// ------------------------

export const getCCBudgetDetailsByCodeForReport = async (ccCode, year) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetCCBudgetDetailsByCodeForReport?CCCode=${ccCode}&Year=${year}`,
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

export const getDCABudgetDetailsForReport = async (ccCode, year) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetDCABudgetDetailsForReport?CCCode=${ccCode}&Year=${year}`,
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

export const getDCABudgetDetailedSummary = async (role, ccType, ccCode, dcaCode, year, year1) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetDCABudgetDetailedSummary?Role=${role}&CCType=${ccType}&CCCode=${ccCode}&DCACode=${dcaCode}&Year=${year}&Year1=${year1}`,
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

export const getCostCenterBudgetReportTypes = async (roleid) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetCostCenterBudgetReportTypes?Roleid=${roleid}`,
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

export const viewDCABudgetReportGridNew = async (ccCode) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/ViewDCABudgetReportGridnew?CCCode=${ccCode}`,
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

// Client PO Budget Operations
// --------------------------

export const getClientPOBudgetCostCenters = async () => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetClientPOBudgetCostCenters`,
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

export const viewClientPOLockPercent = async () => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/ViewClientpoLockPercent`,
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

export const getClientPOPercentage = async (code) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetClientPoPercentage?code=${code}`,
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

export const saveCCClientPOPercentDetails = async (percentData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Accounts/SaveCCClientPOPercentDetails`,
            percentData,
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

// Other Budget Operations
// ----------------------

export const getOtherBudgetCCs = async (ccCode) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetOtherBudgetCCs?CCCode=${ccCode}`,
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

export const budgetTransferSummaryPopup = async (cccode) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/BudgetTransferSummaryPopup?CCcode=${cccode}`,
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

export const saveBudgetExcelRequest = async (excelData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Accounts/SaveBudgetExcelRequest`,
            excelData,
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

export const getBudgetUploadConfigUsers = async (actionType) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetBudgetUploadConfigUsers?ActionType=${actionType}`,
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

export const saveBudgetViewUploadAccessDetails = async (accessData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Accounts/SaveBudgetviewuploadaccessDetails`,
            accessData,
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

export const viewBudgetViewAttachmentConfigDetails = async () => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/ViewBudgetViewAttachmentConfigDetails`,
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