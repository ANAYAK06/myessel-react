import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

// Save General Payment from Bank (POST)
// SP: spGeneralPayment
export const saveGeneralPayment = async (params) => {
    try {
        const payload = {
            CCCode:            params.ccCode,
            DCACode:           params.dcaCode,
            SubDcaCode:        params.subDcaCode        || '',
            Name:              params.name,
            BankId:            parseInt(params.bankId)  || 0,
            ModeofPay:         params.modeOfPay,
            Number:            params.referenceNumber   || '',
            TransactionDate:   params.transactionDate,
            TransactionAmount: parseFloat(params.amount) || 0,
            Remarks:           params.remarks            || '',
            Createdby:         params.createdBy,
            Roleid:            parseInt(params.roleId)  || 0,
            Action:            'Save',
        };

        const response = await axios.post(
            `${API_BASE_URL}/Accounts/SaveGeneralPayment`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to save general payment';
    }
};
