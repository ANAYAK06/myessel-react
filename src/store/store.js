import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../slices/auth/authSlice";
import businesInfoReducer from "../slices/businessinfosetup/businessInfoSlice";
import workflowReducer from "../slices/workflowSlice/workflowSlice"
import budgetReducer from "../slices/budgetSlice/budgetSlice";
import budgetReportReducer from "../slices/budgetSlice/budgetReportSlice";
import accruedInterestReducer from "../slices/financialReportSlice/accruedInterestSlice"; 


const store = configureStore({
  
  reducer: {
    auth: authReducer,
    businessInfo: businesInfoReducer,
    workflow: workflowReducer,
    budget: budgetReducer,
    budgetreport: budgetReportReducer,
    accruedinterest: accruedInterestReducer
  }

});


export default store