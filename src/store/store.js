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
import cmspaymentreportReducer from "../slices/HrReportSlice/cmsPaymentReportSlice";
import inboxNotificationReducer from "../slices/notificationSlice/userInboxNotificationSlice";
import staffRegistrationSlice from "../slices/HRSlice/staffRegistrationSlice";
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
    cmspaymentreport:cmspaymentreportReducer,
    inboxnotifications: inboxNotificationReducer,
    staffregistration: staffRegistrationSlice,
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

  }

});


export default store