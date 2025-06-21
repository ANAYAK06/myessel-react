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
    assetdepreciationreport:assetDepreciationReportReducer
  }

});


export default store