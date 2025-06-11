// Firm Information Operations
// --------------------------

export const getFirmInfo = async () => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetFirmInfo`,
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

export const saveFirmInfo = async (firmData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Accounts/SaveFirmInfo`,
            firmData,
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