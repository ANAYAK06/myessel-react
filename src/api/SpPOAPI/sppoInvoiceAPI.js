import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

const base = API_BASE_URL;

/** 0. GET all service vendors */
export const getServiceVendors = () =>
    axios.get(`${base}/HR/GetServiceVendors`);

/** 1. GET PO list for a vendor */
export const getPOForSPPOInvoice = (vendorCode) =>
    axios.get(`${base}/Purchase/GetPOForSPPOInvoice`, { params: { VendorCode: vendorCode } });

/** 2. GET PO details */
export const getPODetailsForSPPOInvoice = (poNo) =>
    axios.get(`${base}/Purchase/GetPODetailsForSPPOInvoice`, { params: { PONo: poNo } });

/** 3. GET vendor GST numbers (Taxtype = Service Provider) */
export const getVendorGSTNos = (vendorCode) =>
    axios.get(`${base}/Purchase/GetVendorClientGSTNos`, {
        params: { Taxtype: 'Service Provider', Taxfor: vendorCode },
    });

/** 4. GET company GST numbers (Taxtype = Creditable) */
export const getCompanyGSTNos = () =>
    axios.get(`${base}/Purchase/GetCompanyGSTNos`, { params: { Taxtype: 'Creditable' } });

/** 5. GET GST DCA/SDCA config */
export const getInvoiceGSTConfig = (params) =>
    axios.get(`${base}/Purchase/GetInvoiceGSTConfigDCASDCA`, { params });

/** 6. GET other charge / deduction DCA list  (TaxType = 'Other' or 'Deduction') */
export const getOtherDeductionDCA = ({ ccCode, taxType, invDate }) =>
    axios.get(`${base}/Purchase/GetSPPOInvOtherDeductionDCA`, {
        params: { CCCode: ccCode, TaxType: taxType, Invdate: invDate },
    });

/** 6b. GET sub-DCA codes by DCA code (reuses shared endpoint) */
export const getSubDCAByDCA = (dcaCode) =>
    axios.get(`${base}/Accounts/GetSubDCAbyDCA`, { params: { DCACode: dcaCode } });

/** 7. POST budget check */
export const checkSPPOInvoiceBudget = (payload) =>
    axios.post(`${base}/Purchase/CheckSPPOInvoiceBudget`, payload);

/** 8. POST save new SPPO invoice */
export const saveNewSPPOInvoice = (payload) =>
    axios.post(`${base}/Purchase/SaveNewSPPOInvoice`, payload);


