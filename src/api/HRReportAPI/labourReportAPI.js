import axios from "axios";
import { API_BASE_URL } from '../../config/apiConfig';

export const getLaboursForReport = async (labourType) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/HR/GetLaboursforReport`,
            {
                params: { labourType },
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};
