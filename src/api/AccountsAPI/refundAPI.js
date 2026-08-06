import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

const base = `${API_BASE_URL}/Accounts`;

/** 1. POST save a new refund (spRefundPayment). Field names mirror the SP params exactly. */
export const saveRefund = (params) => {
    const payload = {
        Date:                params.date,
        paymentcategory:     params.paymentCategory,
        Refund_CC_Code:      params.principleCCCode      || '',
        Refund_DCA_Code:     params.principleDCACode      || '',
        Refund_Sub_DCA_Code: params.principleSDCACode     || '',
        Amount:              parseFloat(params.principleAmount) || 0,
        RefIntCC:            params.intCCCode              || '',
        RefIntDCA:           params.intDCACode             || '',
        RefIntSDCA:          params.intSDCACode            || '',
        RefIntAmount:        parseFloat(params.intAmount)  || 0,
        Name:                params.name,
        BankId:              params.bankId,
        ModeofPay:           params.modeOfPay,
        No:                  params.refundNo,
        PaymentDate:         params.paymentDate,
        Remarks:             params.remarks               || '',
        TotalAmount:         parseFloat(params.finalAmount) || 0,
        CreatedBy:           params.createdBy,
        Roleid:              parseInt(params.roleId, 10)  || 0,
    };
    return axios.post(`${base}/Saverefund`, payload);
};

/** 2. GET refunds pending verification for a role */
export const getRefundVerificationList = (roleId) =>
    axios.get(`${base}/Getrefund`, { params: { Roleid: roleId } });

/** 3. GET full refund detail by transaction number, for verification view */
export const getRefundVerificationById = (tranno) =>
    axios.get(`${base}/GetrefverificationbyId`, { params: { Tranno: tranno } });

/** 4. GET a returned refund by its bank reference number, for resubmission on the creation page */
export const getReturnedRefundById = (bankRefno) =>
    axios.get(`${base}/GetReturnrefundbyId`, { params: { BankRefno: bankRefno } });

/** 5. PUT approve / reject / return / verify a refund (spVerifyrefund) */
export const verifyRefund = (payload) =>
    axios.put(`${base}/VerifyRefund`, payload);

/** 6. PUT resubmit a previously-returned refund (spRefundPayment update path) */
export const updateRefund = (params) => {
    const payload = {
        Refno:               params.refno,
        Date:                params.date,
        paymentcategory:     params.paymentCategory,
        Refund_CC_Code:      params.principleCCCode      || '',
        Refund_DCA_Code:     params.principleDCACode      || '',
        Refund_Sub_DCA_Code: params.principleSDCACode     || '',
        Amount:              parseFloat(params.principleAmount) || 0,
        RefIntCC:            params.intCCCode              || '',
        RefIntDCA:           params.intDCACode             || '',
        RefIntSDCA:          params.intSDCACode            || '',
        RefIntAmount:        parseFloat(params.intAmount)  || 0,
        Name:                params.name,
        BankId:              params.bankId,
        ModeofPay:           params.modeOfPay,
        No:                  params.refundNo,
        PaymentDate:         params.paymentDate,
        Remarks:             params.remarks               || '',
        TotalAmount:         parseFloat(params.finalAmount) || 0,
        CreatedBy:           params.createdBy,
        Roleid:              parseInt(params.roleId, 10)  || 0,
    };
    return axios.put(`${base}/UpdateRefund`, payload);
};
