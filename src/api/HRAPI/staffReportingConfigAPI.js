import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

// 1. GET dropdown source — all approved employees (shared by every picker on this page)
export const getEmployeesForReportingConfig = async () => {
    const response = await axios.get(`${API_BASE_URL}/HR/GetEmployeesForReportingConfig`, {
        headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
};

// 2. GET the current org-wide default reporting person
export const getDefaultReportingPerson = async () => {
    const response = await axios.get(`${API_BASE_URL}/HR/GetDefaultReportingPerson`, {
        headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
};

// 3. POST set/update the default reporting person (upsert — single row)
// Payload: { EmployeeId, CreatedBy }
export const saveDefaultReportingPerson = async (data) => {
    const response = await axios.post(`${API_BASE_URL}/HR/SaveDefaultReportingPerson`, data, {
        headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
};

// 4. GET main configuration grid — every approved employee with their current
//    reporting person + notifying persons (null/empty falls back to default)
export const getEmployeesForReportingConnectionGrid = async () => {
    const response = await axios.get(`${API_BASE_URL}/HR/GetEmployeesForReportingConnectionGrid`, {
        headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
};

// 5. POST save/update one employee's reporting person + notifying persons (upsert;
//    NotifyingPersonIds is fully replaced each save)
// Payload: { EmpRefNo, ReportingPersonId, NotifyingPersonIds, CreatedBy }
export const saveEmployeeReportingConnection = async (data) => {
    const response = await axios.post(`${API_BASE_URL}/HR/SaveEmployeeReportingConnection`, data, {
        headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
};
