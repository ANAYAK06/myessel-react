// api/purchaseSupplierAPI.js
import axios from "axios";

const API_BASE_URL = 'http://localhost:57771/api';

// Supplier PO Operations
// ---------------------

export const getSupplierIndent = async (roleId, userid, ccType) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetSupplierIndent?RoleId=${roleId}&Userid=${userid}&CCType=${ccType}`,
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

export const checkIfPartIndentExistForIndentNo = async (indentNo) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/CheckIfPartIndentExistForIndentNo?IndentNo=${indentNo}`,
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

export const getSupplierPOGridData = async (indentNo) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetSupplerPOGridData?IndentNo=${indentNo}`,
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

export const getSupplierVendors = async () => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetSupplierVendors`,
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

export const getPreviousPODetails = async (itemcode) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetPreviousePODetails?Itemcode=${itemcode}`,
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

export const saveSupplierPO = async (poData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Purchase/SaveSupplierPO`,
            poData,
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

export const cancelIndent = async (indentNo, createdby, roleid) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/CancelIndent?IndentNo=${indentNo}&Createdby=${createdby}&Roleid=${roleid}`,
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

export const getVerificationSupplierPO = async (roleid, userid, ccType) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetVerificationSupplierPO?Roleid=${roleid}&Userid=${userid}&CCType=${ccType}`,
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

export const getVerificationSupplierPOByPO = async (poNo, indentNo) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetVerificationSupplierPObyPO?PONo=${poNo}&IndentNo=${indentNo}`,
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

export const approveSupplierPO = async (poData) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/Purchase/ApproveSupplierPO`,
            poData,
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

// Supplier PO Amendment Operations
// -------------------------------

export const getAllSupplierPOForAmend = async (ccCode, userid, roleid) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetAllSupplierPOForAmend?CCCode=${ccCode}&Userid=${userid}&Roleid=${roleid}`,
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

export const getItemsForPOAmend = async (ccCode, pono) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetItemsForPOAmend?CCCode=${ccCode}&PONO=${pono}`,
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

export const saveSupplierPOAmend = async (amendData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Purchase/SaveSupplierPOAmend`,
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

export const approveSupplierPOAmend = async (amendData) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/Purchase/ApproveSupplierPOAmend`,
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

export const getVerifySupplierPOAmend = async (roleid, userid, ccType) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetVerifySupplierPOAmend?Roleid=${roleid}&Userid=${userid}&CCType=${ccType}`,
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

export const getSupplierPOAmendByPO = async (amendPONO, poNo, indentNo) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetSupplierPOAmendbyPO?AmendPONO=${amendPONO}&PONo=${poNo}&IndentNo=${indentNo}`,
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

// SPPO (Service Provider Purchase Order) Operations
// ------------------------------------------------

export const saveNewServiceProvider = async (sppoData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Purchase/SaveNewServiceProvider`,
            sppoData,
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

export const getVerificationSPPO = async (roleId, userid) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetVerificationSPPO?RoleId=${roleId}&Userid=${userid}`,
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

export const getSPPOByNo = async (sppono, ccCode, vendorCode) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetSPPObyNo?Sppono=${sppono}&CCCode=${ccCode}&VendorCode=${vendorCode}`,
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

export const approveSPPO = async (sppoData) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/Purchase/ApproveSPPO`,
            sppoData,
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

export const updateServiceProvider = async (sppoData) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/Purchase/UpdateServiceProvider`,
            sppoData,
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

export const getCloseSPPO = async (roleid, userId) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetCloseSPPO?Roleid=${roleid}&UserId=${userId}`,
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

export const closeSPPO = async (sppoData) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/Purchase/CloseSPPO`,
            sppoData,
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

// SPPO Amendment Operations
// ------------------------

export const getVendorsForSPPOAmend = async () => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetVendorsForSPPOAmend`,
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

export const getCCForSPPOAmendByVendor = async (vendorCode) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetCCForSPPOAmendbyVendor?VendorCode=${vendorCode}`,
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

export const getPOForSPPOAmend = async (vendorCode, ccCode) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetPOForSPPOAmend?VendorCode=${vendorCode}&CCCode=${ccCode}`,
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

export const checkSPPOAmendDescriptions = async (amendData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Purchase/CheckSPPOAmendDescriptions`,
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

export const saveNewSPPOAmend = async (amendData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Purchase/SaveNewSPPOAmend`,
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

export const getVerificationSPPOAmend = async (roleId, userid) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetVerificationSPPOAmend?RoleId=${roleId}&Userid=${userid}`,
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

export const getSPPOAmendById = async (roleId, amendId, userid) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetSPPOAmendbyId?RoleId=${roleId}&AmendId=${amendId}&Userid=${userid}`,
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

export const approveSPPOAmend = async (amendData) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/Purchase/ApproveSPPOAmemd`,
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

export const updateSPPOAmend = async (amendData) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/Purchase/UpdateSPPOAmemd`,
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

// SPPO Payment Operations
// ----------------------

export const getSPPOCCByUser = async (roleid, userid) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetSPPOCCbyUser?Roleid=${roleid}&Userid=${userid}`,
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

export const getSPPOPaymentTypes = async (vendorType) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetSPPOPaymentTypes?VendorType=${vendorType}`,
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

export const getSPPOPaymentVendor = async (vendorType, paymentType) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetSPPOPaymentVendor?VendorType=${vendorType}&PaymentType=${paymentType}`,
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

export const getPOForPayment = async (vendorCode, vendorType, paymentType, lcno) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetPOForPayment?VendorCode=${vendorCode}&VendorType=${vendorType}&PaymentType=${paymentType}&LCno=${lcno}`,
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

export const getInvoiceDataForPayment = async (vendorCode, poNo, payType) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetInvoiceDataForPayment?VendorCode=${vendorCode}&PONo=${poNo}&PayType=${payType}`,
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

export const getInvoiceTaxDeduction = async (invoiceNo) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetInvoiceTaxDeduction?InvoiceNo=${invoiceNo}`,
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

export const getAdvanceByPO = async (poNumber, invNumber) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetAdvancebyPO?PONumber=${poNumber}&InvNumber=${invNumber}`,
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

export const saveNewSPPOInvoicePayment = async (paymentData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Purchase/SaveNewSPPOInvoicePayment`,
            paymentData,
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

export const saveNewSPPOAdvancePayment = async (paymentData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Purchase/SaveNewSPPOAdvancePayment`,
            paymentData,
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

export const saveNewSPPORetentionPayment = async (paymentData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Purchase/SaveNewSPPORetentionPayment`,
            paymentData,
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

export const saveNewSPPOHoldPayment = async (paymentData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Purchase/SaveNewSPPOHoldPayment`,
            paymentData,
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

// Vendor Payment Verification Operations
// -------------------------------------

export const getVerificationInvoiceAdvancePay = async (roleid, paytype) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetVerificationInvoiceAdvancePay?Roleid=${roleid}&paytype=${paytype}`,
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

export const getSupplierPaymentTypes = async () => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetSupplierPaymentTypes`,
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

export const getVerificationVendorPayments = async (roleid) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetVerificationVendorPayments?Roleid=${roleid}`,
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

export const getVerificationVendorPayByRefno = async (refno, transtype, vendorcode) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetVerificationVendorPaybyRefno?Refno=${refno}&Transtype=${transtype}&Vendorcode=${vendorcode}`,
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

export const approveVendorPayment = async (paymentData) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/Purchase/ApproveVendorPayment`,
            paymentData,
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

export const getVendorPaymentCC = async (roleid, userid) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetVendorPaymentCC?Roleid=${roleid}&Userid=${userid}`,
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

export const getSPPOPaymentVendorByCC = async (vendorType, ccCode, paymentType) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetSPPOPaymentVendorbyCC?VendorType=${vendorType}&CCCode=${ccCode}&PaymentType=${paymentType}`,
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

export const getVendorPaymentOtherCC = async (currentCC) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetVendorPaymentOtherCC?CurrentCC=${currentCC}`,
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

// SPPO Helper Functions
// --------------------

export const getSPPOByNoForReport = async (sppono, ccCode, vendorCode) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetSPPObyNoForReport?Sppono=${sppono}&CCCode=${ccCode}&VendorCode=${vendorCode}`,
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

export const getSPPOByNoForAmend = async (sppono, ccCode, vendorCode) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetSPPObyNoForAmend?Sppono=${sppono}&CCCode=${ccCode}&VendorCode=${vendorCode}`,
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

export const getSPPOByNoForVerify = async (sppono, ccCode, vendorCode, amendId) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetSPPObyNoForVerify?Sppono=${sppono}&CCCode=${ccCode}&VendorCode=${vendorCode}&AmendId=${amendId}`,
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

export const getVerificationSPPOClose = async (roleid, userid, type) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetVerificationSPPOClose?Roleid=${roleid}&Userid=${userid}&Type=${type}`,
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

export const getBudgetForSPPO = async () => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetBudgetCCForSPPO`,
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

export const getFromCCForSPPO = async () => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetFromCCForSPPO`,
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