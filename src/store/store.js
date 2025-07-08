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
    spporeport: spPOReportReducer
  }

});


export default store