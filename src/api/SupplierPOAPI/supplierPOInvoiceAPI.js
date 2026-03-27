import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

const base = API_BASE_URL;

/** 1. GET MRR list for a user */
export const getMRRForUser = (roleId, userId) =>
    axios.get(`${base}/Purchase/GetMRRForUser`, { params: { Roleid: roleId, Userid: userId } });

/** 2. GET vendor + item details by MRR number */
export const getVendorDetailsByMRR = (mrrNo) =>
    axios.get(`${base}/Purchase/GetVendorDetailsbyMRR`, { params: { MRRNo: mrrNo } });

/** 3. GET company GST numbers (Taxtype = Creditable) */
export const getCompanyGSTNos = () =>
    axios.get(`${base}/Purchase/GetCompanyGSTNos`, { params: { Taxtype: 'Creditable' } });

/** 4. GET items by MRR number with GST analysis */
export const getItemsByMRRNo = ({ gstNo, vendorGstNo, mrrNo, vendorType }) =>
    axios.get(`${base}/Purchase/GetItemsbyMRRNo`, {
        params: { GSTNo: gstNo, VendorGstNo: vendorGstNo, MRRNo: mrrNo, VendorType: vendorType },
    });

/** 5. GET analyzed tax breakdown by MRR number */
export const getAnlyzeTaxByMRRNo = ({ gstNo, vendorGstNo, mrrNo }) =>
    axios.get(`${base}/Purchase/GetAnlyzeTaxbyMRRNo`, {
        params: { GSTNo: gstNo, VendorGstNo: vendorGstNo, MRRNo: mrrNo },
    });

/** 6. GET transport DCA list for supplier PO invoice */
export const getSupplierPOTransportDCA = () =>
    axios.get(`${base}/Purchase/GetSupplierPOTransportDCA`);

/** 7. GET other / deduction DCA list by MRR and tax type */
export const getSupplierOtherDeductionDCA = (mrrNo, taxType) =>
    axios.get(`${base}/Purchase/GetSupplierOtherDeductionDCA`, {
        params: { MRRNo: mrrNo, TaxType: taxType },
    });

/** 8. POST budget check */
export const checkSupplierInvoiceBudget = (payload) =>
    axios.post(`${base}/Purchase/CheckSuppleirInvoiceBudget`, payload);

/** 9. POST save new supplier PO invoice */
export const saveSupplierPOInvoice = (payload) =>
    axios.post(`${base}/Purchase/SaveSupplierPOInvoice`, payload);

/** 10. GET sub-DCA codes by DCA code */
export const getSubDCAByDCA = (dcaCode) =>
    axios.get(`${base}/Accounts/GetSubDCAbyDCA`, { params: { DCACode: dcaCode } });
