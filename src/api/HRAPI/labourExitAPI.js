import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// LABOUR EXIT APIs
// ==============================================

// 1. Labour autocomplete search for exit
export const getLabourForExit = async (prefix, labourType, contractor) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/HR/GetLabourForExit`, {
            params: { Prefix: prefix, LabourType: labourType, Contractor: contractor || '' },
            headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
    } catch (error) {
        console.error('❌ GetLabourForExit Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to search labours';
    }
};

// 2. Get contractors for labour exit
export const getLBContractors = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/HR/GetLBContractors`, {
            headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
    } catch (error) {
        console.error('❌ GetLBContractors Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch contractors';
    }
};

// 3. Get labour data (details) for exit form
export const getLabourDataForExit = async (labourId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/HR/GetLabourDataForExit`, {
            params: { LabourId: labourId },
            headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
    } catch (error) {
        console.error('❌ GetLabourDataForExit Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to get labour data';
    }
};

// 4. Auto-calculate relieving date based on resignation date
export const getLBRelieveDate = async (resignDate, labourId, groupId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/HR/GetLBRelieveDate`, {
            params: { ResignDate: resignDate, LabourId: labourId, GroupId: groupId },
            headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
    } catch (error) {
        console.error('❌ GetLBRelieveDate Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to get relieving date';
    }
};

// 5. Save labour exit (POST → spInsertLabourExit)
// Payload fields: CostCenter, LabourId, GroupId, ResignationDate, RelievingDate,
//                 Remarks, DocName, DocBaseString, DocType, Createdby, RoleId
export const saveLabourExit = async (params) => {
    try {
        const payload = {
            CostCenter:      params.costCenter?.toString()      || '',
            LabourId:        params.labourId?.toString()        || '',
            GroupId:         parseInt(params.groupId)           || 0,
            ResignationDate: params.resignationDate?.toString() || '',
            RelievingDate:   params.relievingDate?.toString()   || '',
            Remarks:         params.remarks?.toString()         || '',
            DocName:         params.docName?.toString()         || '',
            DocBaseString:   params.docBaseString?.toString()   || '',
            DocType:         params.docType?.toString()         || '',
            Createdby:       params.createdBy?.toString()       || '',
            RoleId:          parseInt(params.roleId)            || 0,
        };

        const response = await axios.post(`${API_BASE_URL}/HR/SaveLabourExit`, payload, {
            headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
    } catch (error) {
        console.error('❌ SaveLabourExit Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to save labour exit';
    }
};

// 6. Get verification inbox list by role
export const getVerifyLBExit = async (roleId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/HR/GetVerifyLBExit`, {
            params: { RoleID: roleId },
            headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
    } catch (error) {
        console.error('❌ GetVerifyLBExit Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to get labour exit inbox';
    }
};

// 7. Get single labour exit record detail
export const getLBExitById = async (params) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/HR/GetLBExitbyId`, {
            params: { LabourId: params.labourId, Id: params.id, RoleId: params.roleId },
            headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
    } catch (error) {
        console.error('❌ GetLBExitbyId Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to get labour exit detail';
    }
};

// 8. Approve / Verify / Reject labour exit (PUT → spApproveLBExit)
export const approveLBExit = async (params) => {
    try {
        const payload = {
            Id:              parseInt(params.id)                || 0,
            CostCenter:      params.costCenter?.toString()      || '',
            LabourId:        params.labourId?.toString()        || '',
            GroupId:         parseInt(params.groupId)           || 0,
            ResignationDate: params.resignationDate?.toString() || '',
            RelievingDate:   params.relievingDate?.toString()   || '',
            RoleId:          parseInt(params.RoleId)            || 0,
            Createdby:       params.CreatedBy?.toString()       || '',
            Action:          params.Action?.toString()          || '',
            Note:            params.Note?.toString()            || '',
        };

        const response = await axios.put(`${API_BASE_URL}/HR/ApproveLBExit`, payload, {
            headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
    } catch (error) {
        console.error('❌ ApproveLBExit Error:', error.response || error);
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to approve labour exit';
    }
};
