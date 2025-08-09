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
    vendorpayment: VendorPaymentReducer
  }

});


export default store