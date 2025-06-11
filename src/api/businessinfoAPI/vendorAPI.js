// api/vendorAPI.js
import axios from "axios";

const API_BASE_URL = 'http://localhost:57771/api';

// Vendor Management Operations
// ---------------------------

export const saveNewVendor = async (vendorData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Purchase/SaveNewVendor`,
            vendorData,
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

export const getAllVendors = async () => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetAllVendors`,
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

export const getVerificationVendor = async (roleId) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetVerificationVendor?RoleId=${roleId}`,
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

export const getVerificationVendorByCode = async (vendorCode, roleId) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetVerificationVendorbyCode?VendorCode=${vendorCode}&RoleId=${roleId}`,
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

export const approveVendor = async (vendorData) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/Purchase/ApproveVendor`,
            vendorData,
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

export const updateVendor = async (vendorData) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/Purchase/UpdateVendor`,
            vendorData,
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

export const getVendorsForSPPO = async () => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetVendorsForSPPO`,
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

export const getDateByVendorCode = async (vendorCode) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetDatebyVendorCode?VendorCode=${vendorCode}`,
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

// CMS Vendor Operations
// --------------------

export const getCMSVendors = async (cmsVendorType, roleId, userid) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetCMSVendors?CMSVendorType=${cmsVendorType}&RoleId=${roleId}&Userid=${userid}`,
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

export const vendorCMSPaymentData = async (ventype, allVendors, userid) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/VendorCMSPaymentData?Ventype=${ventype}&AllVendors=${allVendors}&Userid=${userid}`,
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

export const vendorCMSPaymentInnerData = async (vendorcode, userid) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/VendorCMSPaymentInnerData?Vendorcode=${vendorcode}&Userid=${userid}`,
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

export const addCMSTempInvoices = async (invoiceData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Purchase/AddCMSTempInvoices`,
            invoiceData,
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

export const viewCMSPaymentAddedData = async (userid) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/ViewCMSPaymentAddedData?Userid=${userid}`,
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

export const removeCMSTempInvoices = async (invoiceData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Purchase/RemoveCMSTempInvoices`,
            invoiceData,
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

export const saveVendorCMSPayment = async (paymentData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Purchase/SaveVendorCMSPayment`,
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

export const vendorCMSPaymentVerificationGrid = async (roleid, created, userid) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/VendorCMSPaymentVerificationGrid?Roleid=${roleid}&Created=${created}&Userid=${userid}`,
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

export const vendorCMSPaymentVerificationView = async (tranNo, moid, rid) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/VendorCMSPaymentVerificationView?TranNo=${tranNo}&MOID=${moid}&RID=${rid}`,
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

export const viewCMSPaymentAddedVerificationData = async (trno) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/ViewCMSPaymentAddedVerificationData?Trno=${trno}`,
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

export const viewCMSPaymentAddedVerificationInnerData = async (vendorcode, tranNo) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/ViewCMSPaymentAddedVerificationInnerData?Vendorcode=${vendorcode}&TranNo=${tranNo}`,
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

export const removeCMSSingleVerInvoices = async (invoiceData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Purchase/RemoveCMSSingleVerInvoices`,
            invoiceData,
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

export const approveVendorCMSPayment = async (paymentData) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/Purchase/ApproveVendorCMSPayment`,
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

export const exportExcelVendorcmspayment = async (tranNo) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/ExportExcelVendorcmspayment?TranNo=${tranNo}`,
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

// BOE (Bill of Exchange) Operations
// --------------------------------

export const getBOELCNos = async () => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetBOELCNos`,
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

export const getBOETrans = async (boelcno) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetBOETrans?BOELCNO=${boelcno}`,
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

export const boePaymentData = async (boeLCval, tranID) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/BOEPaymentData?BOELCval=${boeLCval}&TranID=${tranID}`,
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

export const boePaymentInnerData = async (lcno, tranno) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/BOEPaymentInnerData?LCNO=${lcno}&Tranno=${tranno}`,
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

export const getLCDetails = async (lcNo, tranID) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetLCDetails?LCNo=${lcNo}&TranID=${tranID}`,
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

export const saveBOESettelmentPayment = async (paymentData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Purchase/SaveBOESettelmentPayment`,
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

export const boeSettelmentVerificationGrid = async (roleid, created, userid) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/BOESettelmentVerificationGrid?Roleid=${roleid}&Created=${created}&Userid=${userid}`,
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

export const boeSettelmentVerificationView = async (tranNo, moid, rid) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/BOESettelmentVerificationView?TranNo=${tranNo}&MOID=${moid}&RID=${rid}`,
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

export const viewBOEPaymentVerificationData = async (trno) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/ViewBOEPaymentVerificationData?Trno=${trno}`,
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

export const approveVendorBOEPayment = async (paymentData) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/Purchase/ApproveVendorBOEPayment`,
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

// Vendor Write-off Operations
// --------------------------

export const getPOPaymentVendorWO = async (vendorType, roleId, userid) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetPOPaymentVendorwo?VendorType=${vendorType}&RoleId=${roleId}&Userid=${userid}`,
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

export const getPOForWriteoff = async (vendorCode, vendorType) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetPOForwriteoff?VendorCode=${vendorCode}&VendorType=${vendorType}`,
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

export const getInvoiceDataForWOPayment = async (vendorCode, poNo) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetInvoiceDataForWOPayment?VendorCode=${vendorCode}&PONo=${poNo}`,
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

export const getInvoiceTaxDeductionWO = async (invoiceNo) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetInvoiceTaxDeductionwo?InvoiceNo=${invoiceNo}`,
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

export const saveWriteoffPOInvoicePayment = async (paymentData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Purchase/SaveWriteoffPOInvoicePayment`,
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

export const verifyVendorPayableWriteoffGrid = async (roleid, created, userid) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/VerifyVendorPayableWriteoffGrid?Roleid=${roleid}&Created=${created}&Userid=${userid}`,
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

export const viewVendorPayableWODetailsGridView = async (tranNo) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/ViewVendorPayablewoDetailsGridView?TranNo=${tranNo}`,
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

export const getVendorInvoiceTaxDeductionWOGridVerify = async (invoiceNo) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetVendorInvoiceTaxDeductionWOGridVerify?InvoiceNo=${invoiceNo}`,
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

export const approveVendorPayableWriteoff = async (paymentData) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/Purchase/ApproveVendorPayableWriteoff`,
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

// LC (Letter of Credit) Operations
// -------------------------------

export const getLCVendorCodes = async (roleId, userid) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetLCVendorCodes?RoleId=${roleId}&Userid=${userid}`,
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

export const getPOForLCVendor = async (vendorCode) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetPOForlcvendor?VendorCode=${vendorCode}`,
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

export const getVenLCCodes = async (vendorCode) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetVenLCCodes?VendorCode=${vendorCode}`,
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

export const getLCBalance = async (venLCNo) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetLCBalanceo?VenLCNo=${venLCNo}`,
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

// Vendor Transaction Checks
// -------------------------

export const checkSupplierTransactionType = async (transactionData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Purchase/ChecksupplierTransactiontype`,
            transactionData,
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