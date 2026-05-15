import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../slices/auth/authSlice";
import businesInfoReducer from "../slices/businessinfosetup/businessInfoSlice";
import workflowReducer from "../slices/workflowSlice/workflowSlice"
import budgetReducer from "../slices/budgetSlice/budgetSlice";
import budgetReportReducer from "../slices/budgetSlice/budgetReportSlice";
import accruedInterestReducer from "../slices/financialReportSlice/accruedInterestSlice"; 
import bankStatementReducer from "../slices/bankSlice/bankStatementSlice";
import clientPOReportReducer from "../slices/clientPOSlice/clientPOReportSlice";
import transactionLogReducer from "../slices/financialReportSlice/transactionLogSlice";
import termLoanReportReducer from "../slices/termLoanSlice/termLoanReportSlice";
import assetDepreciationReportReducer from "../slices/assetsSlice/assetDepreciationReportSlice";
import assetsalesreportReducer from "../slices/assetsSlice/assetSalesReportSlice";
import viewCurrentStockReducer from "../slices/stockSlice/viewCurrentStockSlice";
import supplierPOStatusReducer from "../slices/stockSlice/supplierPOStatusSlice";
import scrapWalletReportReducer from "../slices/stockSlice/scrapWalletReportSlice";
import gstReportReducer from "../slices/gstSlice/gstReportSlice";
import supplierReportReducer from "../slices/supplierPOSlice/supplierReportSlice";  
import spPOReportReducer from "../slices/spPOSlice/spPOReportSlice"; 
import companyOverallStatus from "../slices/financialReportSlice/companyOverallStatusSlice";
import accountStatus from "../slices/financialReportSlice/accountStatusSlice";
import stockReconciliationReducer from "../slices/stockSlice/stockReconciliationSlice";
import stockTransferReportReducer from "../slices/stockSlice/stockTransferReportSlice";
import closingStockReportReducer from "../slices/stockSlice/closingStockReportSlice";
import viewIndentsReportReducer from "../slices/stockSlice/viewIndentReportSlice";
import dailyIssuedItemsReportReducer from "../slices/stockSlice/dailyIssueItemsReportSlice";
import itemCodeReportReducer from "../slices/stockSlice/ItemCodeReportSlice";
import lostScrapReportReducer from "../slices/stockSlice/lostScrapReportSlice";
import lcbgReducer from "../slices/lcbgSlice/lcbgSlice";
import stockSummaryReducer from "../slices/financialReportSlice/stockSummarySlice";
import unsecuredLoanReportReducer from "../slices/termLoanSlice/unsecuredLoanReportSlice";
import cmsPaymentReportSlice from "../slices/HrReportSlice/cmsPaymentReportSlice";
import inboxNotificationReducer from "../slices/notificationSlice/userInboxNotificationSlice";

import approvalReducer from "../slices/CommonSlice/getStatusSlice";
import VendorPaymentReducer from "../slices/VendorPaymentSlice/vendorPaymentSlice"
import SuppplierInvoiceReducer from "../slices/vendorInvoiceSlice/supplierInvoiceSlice";
import SupplierPOReducer from "../slices/supplierPOSlice/supplierPOSlice";
import purchaseHelperReducer from "../slices/supplierPOSlice/purcahseHelperSlice";
import SppoReducer from "../slices/spPOSlice/spPoSlice"
import costCenterSlice from "../slices/costCenterSlice/costCenterAppprovalSlice";
import generalInvoiceSlice from "../slices/generalInvoiceSlice/genralInvoiceSlice";
import roleReducer from "../slices/userRolesSlice/userRolesSlice";
import empRoleAssignment from "../slices/userRolesSlice/userRoleAssignSlice";
import ccBudgetAmendment from "../slices/budgetSlice/ccBudgetAmendmentSlice";
import dcaBudgetAmendment from "../slices/budgetSlice/dcaBudgetAmendmentSlice";
import staffAttendanceReportReducer from "../slices/HrReportSlice/staffAttendanceReportSlice";
import employeeExitReportReducer from "../slices/HrReportSlice/employeeExitReportSlice";
import leaveReportSlice from "../slices/HrReportSlice/leaveReportSlice";
import costCenterCreationReducer from "../slices/costCenterSlice/costCenterCreationSlice";
import clientPOVerificationReducer from "../slices/clientPOSlice/clientPOVerificationSlice";
import lostDamagedItemsVerificationReducer from "../slices/stockSlice/lostDamagedItemsVerificationSlice";
import dailyIssuedItemsReducer from "../slices/stockSlice/dailyIssueSlice";
import scrapSaleReducer from "../slices/stockSlice/scrapSalesVerificationSlice";
import closeSPPOReducer from "../slices/spPOSlice/closeSPPOSlice";
import sppoAmend from "../slices/spPOSlice/sppoAmendSlice";
import monthlyattendance from "../slices/HRSlice/monthlyAttendanceSlice";
import staffdailyattendance from "../slices/HRSlice/staffDailyAttendanceSlice";
import labourobjectivesgoals from "../slices/HRSlice/labourObjectivesGoalsSlice";
import staffobjectivesgoals from "../slices/HRSlice/staffObjectivesandGoalsSlice";
import employeectc from "../slices/HRSlice/employeeCTCSlice";
import labourctc from "../slices/HRSlice/labourCTCSlice";
import labourpayrevision from "../slices/HRSlice/labourPayRevisionSlice";
import staffpayrevision from "../slices/HRSlice/staffPayRevisionSlice";
import employeeleave from "../slices/HRSlice/employeeLeaveSlice";
import dividendDeclaration from "../slices/capitalSlice/dividendDeclarationSlice";
import dividendDistribution from "../slices/capitalSlice/dividendDistributionSlice";
import dividendBankPayment from "../slices/capitalSlice/dividendBankPaymentSlice";
import bankDetails from "../slices/CommonSlice/bankDetailsSlice";
import chequeNumbers from "../slices/bankSlice/chequeNumbersSlice";
import pfesireport from "../slices/HrReportSlice/pfandesiReportSlice";
import salaryreport from "../slices/HrReportSlice/salaryReportSlice";
import staffreport from "../slices/HrReportSlice/staffReportSlice";
import staffctcreport from "../slices/HrReportSlice/staffCTCReportSlice";
import staffcmspay from "../slices/HRSlice/staffCMSPayCreationSlice";
import staffcmspayverification from "../slices/HRSlice/staffCMSPayVerificationSlice";
import staffpayroll from "../slices/HRSlice/staffPayrollGenerationSlice";
import staffpayrollverification from "../slices/HRSlice/staffPayrollVerificationSlice";
import salaryDeductionArrear from "../slices/HRSlice/staffSalaryDeductionArrearSlice";
import salaryDeductionArearVerification from "../slices/HRSlice/salaryDeductionArearVerificationSlice";
import staffJoin from "../slices/HRSlice/staffJoinSlice";
import staffVerify from "../slices/HRSlice/staffRegistrationVerifySlice";
import employeeTransfer from "../slices/HRSlice/employeeTransferSlice";
import employeeExitReducer from "../slices/HRSlice/employeeExitSlice";
import staffFullFinalReducer from "../slices/HRSlice/staffFullFinalSlice";
import staffAdvanceReducer from "../slices/HRSlice/staffAdvanceSlice";
import staffAppraisalReducer from "../slices/HRSlice/staffAppraisalSlice";
import staffCTCCreationReducer from "../slices/HRSlice/staffCTCCreationSlice";
import staffAttendanceEntryReducer from "../slices/HRSlice/staffAttendanceEntrySlice";
import cashVoucherReducer from "../slices/accountsSlice/cashVoucherSlice";
import vendorCashPaymentReducer from "../slices/accountsSlice/vendorCashPaymentSlice";
import ccCashTransferReducer from "../slices/accountsSlice/ccCashTransferSlice";
import ccClosingReducer from "../slices/accountsSlice/ccClosingSlice";
import clientInvoiceReducer from "../slices/accountsSlice/clientInvoiceSlice";
import clientManfInvoiceReducer from "../slices/accountsSlice/clientManufacturingInvoiceSlice";
import clientScrapInvoiceReducer from "../slices/accountsSlice/clientScrapSaleInvoiceSlice";
import clientTradingInvoiceReducer from "../slices/accountsSlice/clientTradingInvoiceSlice";
import genInvoiceCreationReducer from "../slices/accountsSlice/generalInvoiceCreationSlice";
import bankWithdrawalReducer from "../slices/accountsSlice/bankWithdrawalSlice";
import bankTransferReducer from "../slices/accountsSlice/bankTransferSlice";
import genInvPaymentReducer from "../slices/accountsSlice/generalInvoicePaymentSlice";
import ccSepPaymentReducer from "../slices/accountsSlice/ccSepPaymentSlice";
import sppoInvoiceReducer from "../slices/spPOSlice/sppoInvoiceSlice";
import supplierPOInvoiceReducer from "../slices/supplierPOSlice/supplierPOInvoiceSlice";
import loadWalletReducer from "../slices/accountsSlice/loadWalletSlice";
import lcbgCreationReducer from "../slices/accountsSlice/lcbgCreationSlice";
import sppoPaymentReducer from "../slices/purchaseSlice/sppoPaymentSlice";
import vendorCMSPaymentReducer from "../slices/purchaseSlice/vendorCMSPaymentSlice";
import vendorTDSPaymentReducer from "../slices/purchaseSlice/vendorTDSPaymentSlice";
import boeSettlementReducer from "../slices/purchaseSlice/boeSettlementSlice";
import clientBadDebtReducer from "../slices/accountsSlice/clientBadDebtSlice";
import journalVoucherReducer from "../slices/accountsSlice/journalVoucherSlice";
import creditDebitNoteReducer from "../slices/purchaseSlice/creditDebitNoteSlice";
import lcbgAmendReducer from "../slices/purchaseSlice/lcbgAmendSlice";
import unsecuredLoanReducer from "../slices/accountsSlice/unsecuredLoanSlice";
import termLoanCreationReducer from "../slices/accountsSlice/termLoanCreationSlice";
import termLoanPaymentReducer from "../slices/accountsSlice/termLoanPaymentSlice";
import agencyCreationReducer from "../slices/accountsSlice/agencyCreationSlice";
import rejectionAlertReducer from "../slices/rejectionAlertSlice/rejectionAlertSlice";
import labourConfigReducer from "../slices/labourConfigSlice/labourConfigSlice";
import labourPayrollReducer from "../slices/labourPayrollSlice/labourPayrollSlice";
import labourCMSPaymentReducer from "../slices/HRSlice/labourCMSPaymentSlice";
import labourCMSVerificationReducer from "../slices/HRSlice/labourCMSVerificationSlice";
import bulkWorkerRegReducer from "../slices/HRSlice/bulkWorkerRegistrationSlice";
import bulkWorkerVerifyReducer from "../slices/HRSlice/bulkWorkerVerificationSlice";
import generalPaymentReducer from "../slices/accountsSlice/generalPaymentSlice";
import labourReportReducer from "../slices/HrReportSlice/labourReportSlice";
import labourBankChangeReducer from "../slices/HRSlice/labourBankChangeSlice";
import itemCodeVerificationReducer from "../slices/purchaseSlice/itemCodeVerificationSlice";

const store = configureStore({
  
  reducer: {
    auth: authReducer,
    businessInfo: businesInfoReducer,
    workflow: workflowReducer,
    budget: budgetReducer,
    budgetreport: budgetReportReducer,
    accruedinterest: accruedInterestReducer,
    bankstatement: bankStatementReducer,
    clientporeport: clientPOReportReducer,
    transactionlog: transactionLogReducer,
    termloanreport: termLoanReportReducer,
    assetdepreciationreport:assetDepreciationReportReducer,
    assetsalesreport: assetsalesreportReducer,
    viewcurrentstock: viewCurrentStockReducer,
    supplierpostatus:supplierPOStatusReducer,
    scrapwalletreport:scrapWalletReportReducer,
    gstreport: gstReportReducer,
    supplierreport: supplierReportReducer,
    spporeport: spPOReportReducer,
    companyoverallstatus: companyOverallStatus,
    accountstatus: accountStatus,
    stockreconciliation: stockReconciliationReducer,
    stocktransferreport: stockTransferReportReducer,
    closingstockreport: closingStockReportReducer,
    viewindentsreport: viewIndentsReportReducer,
    dailyissueditemsreport: dailyIssuedItemsReportReducer,
    itemcodereport: itemCodeReportReducer,
    lostscrapreport: lostScrapReportReducer,
    lcbg: lcbgReducer,
    stocksummary: stockSummaryReducer,
    unsecuredloanreport: unsecuredLoanReportReducer,
    cmspaymentreport:cmsPaymentReportSlice,
    inboxnotifications: inboxNotificationReducer,
    approval: approvalReducer,
    vendorpayment: VendorPaymentReducer,
    supplierinvoice: SuppplierInvoiceReducer,
    supplierpo: SupplierPOReducer,
    purchaseHelper: purchaseHelperReducer,
    sppo: SppoReducer,
    costCenter: costCenterSlice,
    generalInvoice:generalInvoiceSlice,
    userrole: roleReducer,
    empRoleAssignment: empRoleAssignment,
    ccBudgetAmendment: ccBudgetAmendment,
    dcaBudgetAmendment: dcaBudgetAmendment,
    staffattendancereport: staffAttendanceReportReducer,
    employeeexitreport: employeeExitReportReducer,
    leavereport: leaveReportSlice,
    costCenterCreation: costCenterCreationReducer,
    clientPO: clientPOVerificationReducer,
    lostDamagedItems: lostDamagedItemsVerificationReducer,
    dailyIssue: dailyIssuedItemsReducer,
    scrapSale: scrapSaleReducer,
    closeSPPO: closeSPPOReducer,
    sppoAmend: sppoAmend,
    monthlyattendance: monthlyattendance,
    staffdailyattendance: staffdailyattendance,
    labourobjectivesgoals: labourobjectivesgoals,
    staffobjectivesgoals: staffobjectivesgoals,
    employeectc: employeectc,
    labourctc: labourctc,
    labourpayrevision: labourpayrevision,
    staffpayrevision: staffpayrevision,
    employeeleave: employeeleave,
    dividendDeclaration: dividendDeclaration,
    dividendDistribution: dividendDistribution,
    dividendBankPayment: dividendBankPayment,
    bankDetails: bankDetails,
    chequeNumbers: chequeNumbers,
    pfesireport: pfesireport,
    salaryreport: salaryreport,
    staffreport: staffreport,
    staffctcreport: staffctcreport,
    staffcmspay: staffcmspay,
    staffcmspayverification: staffcmspayverification,
    staffpayroll:staffpayroll,
    staffpayrollverification: staffpayrollverification,
    salaryDeductionArrear: salaryDeductionArrear,
    salarydeductionarearverification: salaryDeductionArearVerification,
    staffJoin:  staffJoin,
    staffVerify: staffVerify,
    employeeTransfer: employeeTransfer,
    employeeExit:    employeeExitReducer,
    staffFullFinal:  staffFullFinalReducer,
    staffadvance:    staffAdvanceReducer,
    staffappraisal:  staffAppraisalReducer,
    staffCTCCreation:      staffCTCCreationReducer,
    staffAttendanceEntry:  staffAttendanceEntryReducer,
    cashvoucher:           cashVoucherReducer,
    vendorCashPayment:     vendorCashPaymentReducer,
    ccCashTransfer:        ccCashTransferReducer,
    ccClosing:             ccClosingReducer,
    clientInvoice:         clientInvoiceReducer,
    clientManfInvoice:     clientManfInvoiceReducer,
    clientScrapInvoice:    clientScrapInvoiceReducer,
    clientTradingInvoice:  clientTradingInvoiceReducer,
    genInvoiceCreation:    genInvoiceCreationReducer,
    bankWithdrawal:        bankWithdrawalReducer,
    bankTransfer:          bankTransferReducer,
    genInvPayment:         genInvPaymentReducer,
    ccSepPayment:          ccSepPaymentReducer,
    sppoInvoice:           sppoInvoiceReducer,
    supplierPOInvoice:     supplierPOInvoiceReducer,
    loadWallet:            loadWalletReducer,
    lcbgCreation:          lcbgCreationReducer,
    sppoPayment:           sppoPaymentReducer,
    vendorCMSPayment:      vendorCMSPaymentReducer,
    vendorTDSPayment:      vendorTDSPaymentReducer,
    boeSettlement:         boeSettlementReducer,
    clientBadDebt:         clientBadDebtReducer,
    journalVoucher:        journalVoucherReducer,
    creditDebitNote:       creditDebitNoteReducer,
    lcbgAmend:             lcbgAmendReducer,
    unsecuredLoan:         unsecuredLoanReducer,
    termLoanCreation:      termLoanCreationReducer,
    termLoanPayment:       termLoanPaymentReducer,
    agencyCreation:        agencyCreationReducer,
    rejectionAlerts:       rejectionAlertReducer,
    labourConfig:          labourConfigReducer,
    labourPayroll:         labourPayrollReducer,
    labourCMSPayment:      labourCMSPaymentReducer,
    labourCMSVerification: labourCMSVerificationReducer,
    bulkWorkerReg:         bulkWorkerRegReducer,
    bulkWorkerVerify:      bulkWorkerVerifyReducer,
    generalPayment:        generalPaymentReducer,
    labourreport:          labourReportReducer,
    labourBankChange:      labourBankChangeReducer,
    itemCodeVerification:  itemCodeVerificationReducer,

  }

});


export default store