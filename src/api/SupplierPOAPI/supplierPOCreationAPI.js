import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

const h = { headers: { 'Content-Type': 'application/json' } };

export const getSupplierIndents = (roleId, userId, ccType) =>
    axios.get(`${API_BASE_URL}/Purchase/GetSupplierIndent?RoleId=${roleId}&Userid=${userId}&CCType=${ccType}`, h);

export const checkIfPartIndentExist = (indentNo) =>
    axios.get(`${API_BASE_URL}/Purchase/CheckIfPartIndentExistForIndentNo?IndentNo=${encodeURIComponent(indentNo)}`, h);

export const getSupplierPOGridData = (indentNo) =>
    axios.get(`${API_BASE_URL}/Purchase/GetSupplerPOGridData?IndentNo=${encodeURIComponent(indentNo)}`, h);

export const getSupplierVendors = () =>
    axios.get(`${API_BASE_URL}/Purchase/GetSupplierVendors`, h);

export const checkBudgetForSupplierPO = (payload) =>
    axios.post(`${API_BASE_URL}/Purchase/CheckBudgetForSupplierPO`, payload, h);

export const saveSupplierPO = (payload) =>
    axios.post(`${API_BASE_URL}/Purchase/SaveSupplierPO`, payload, h);

export const cancelIndentAPI = (indentNo, createdBy, roleId) =>
    axios.get(`${API_BASE_URL}/Purchase/CancelIndent?IndentNo=${encodeURIComponent(indentNo)}&Createdby=${createdBy}&Roleid=${roleId}`, h);

export const getUploadDocSupplierValue = (indNo) =>
    axios.get(`${API_BASE_URL}/Purchase/UpdloadDocSupplierValue?Indno=${encodeURIComponent(indNo)}`, h);

export const getAllItemTermHeads = () =>
    axios.get(`${API_BASE_URL}/Purchase/GetAllItemTermHeads`, h);

export const getTermRemarksByHead = (headName, headId) =>
    axios.get(`${API_BASE_URL}/Purchase/GetTermRemarksByHead?HeadName=${encodeURIComponent(headName)}&HeadId=${headId}`, h);
