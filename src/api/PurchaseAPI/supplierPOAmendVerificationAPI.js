import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

const base = `${API_BASE_URL}/Purchase`;

/** 1. GET pending Supplier PO amendments for verification */
export const getVerifySupplierPOAmend = (roleId, userId, ccType) =>
    axios.get(`${base}/GetVerifySupplierPOAmend`, {
        params: { Roleid: roleId, Userid: userId, CCType: ccType },
    });

/** 2. GET full Supplier PO amendment detail (incl. item list) by amend PO no / PO no / indent no */
export const getSupplierPOAmendByPO = (amendPONO, poNo, indentNo) =>
    axios.get(`${base}/GetSupplierPOAmendbyPO`, {
        params: { AmendPONO: amendPONO, PONo: poNo, IndentNo: indentNo },
    });

/** 3. PUT approve / reject a Supplier PO amendment */
export const approveSupplierPOAmend = (payload) =>
    axios.put(`${base}/ApproveSupplierPOAmend`, payload);

/** 4. GET uploaded documents (PO / amendment) for a PO number */
export const getPOUploadedDocs = (poNo, forType) =>
    axios.get(`${base}/POUploadedDocsView`, { params: { PONO: poNo, For: forType } });
