// components/Inbox/InboxRouter.js
import React from 'react';

// ============================================================================
// VERIFICATION COMPONENTS - Import only what you need
// ============================================================================
import VerifyStaffRegistration from '../../pages/HR/VerifyStaffRegistration';
import VerifyVendorPayment from '../../pages/VendorPayment/VerifyVendorPayment';
import VerifySupplierInvoice from '../../pages/VendorInvoice/VerifySupplierInvoice';
import VerifySupplierPO from '../../pages/SupplierPO/VerifySupplierPO';
import VerifySPPO from '../../pages/SPPO/VerifySPPO';
import InboxItemPlaceholder from './InboxItemPlaceholder';
import CostCenterApproval from '../../pages/CostCenter/CostCenterApproval';
import GeneralInvoiceApproval from '../../pages/GeneralInvoice/GeneralInvoiceApproval';
import VerifyCCBudgetAmendment from '../../pages/Budget/VerifyCCBudgetAmendment';
import VerifyDCABudgetAmendment from '../../pages/Budget/VerifyDCABudgetAmendment';
import VerifyClientPO from '../../pages/ClientPO/VerifyClientPO';
import LostDamagedItemsVerification from '../../pages/Stock/LostDamagedItemsVerification';
import VerifyDailyIssue from '../../pages/Stock/VerifyDailyIssue';
import VerifyScrapSale from '../../pages/Stock/VerifyScrapSale';
import VerifySPPOClose from '../../pages/SPPO/VerifySPPOClose';
import VerifySPPOAmend from '../../pages/SPPO/VerifySPPOAmend';
import VerifyExcelAttendance from '../../pages/HR/VerifyExcelAttendance';
import VerifyStaffDailyAttendance from '../../pages/HR/VerifyStaffDailyAttendance';
import VerifyLabourObjectivesGoals from '../../pages/HR/VerifyLabourObjectivesGoals';
import VerifyStaffObjectivesGoals from '../../pages/HR/VerifyStaffObjectivesGoals';
import VerifyEmployeeCTC from '../../pages/HR/VerifyEmployeeCTC';
import VerifyLabourCTC from '../../pages/HR/VerifyLabourCTC';
import VerifyLabourPayRevision from '../../pages/HR/VerifyLabourPayRevision';
import VerifyStaffPayRevision from '../../pages/HR/VerifyStaffPayRevision';
import VerifyEmployeeLeaveRequest from '../../pages/HR/VerifyEmployeeLeaveRequest';
import DividendDeclarationVerification from '../../pages/shares/DividendDeclarationVerification';
import DividendDistributionVerification from '../../pages/shares/DividendDistributionVerification';
import DividendBankPaymentVerification from '../../pages/shares/DividendBankPaymentVerification';
import VerifyStaffCMSPay from '../../pages/HR/VerifyStaffCMSPay';
import VerifyStaffPayroll from '../../pages/HR/VerifyStaffPayroll';
import VerifySalaryDeductionArear from '../../pages/HR/VerifySalaryDeductionArear';
import VerifyEmployeeTransfer from '../../pages/HR/VerifyEmployeeTransfer';
import VerifyEmployeeExit    from '../../pages/HR/VerifyEmployeeExit';
import VerifyStaffFullFinal from '../../pages/HR/VerifyStaffFullFinal';
import VerifyStaffAdvance from '../../pages/HR/VerifyStaffAdvance';
import VerifyStaffAppraisal from '../../pages/HR/VerifyStaffAppraisal';


// ============================================================================
// HELPER FUNCTIONS - Pure utility functions for route detection
// ============================================================================

const isStaffRegistrationVerification = (path) => {
    // Simple and direct path check - using lowercase
    const isMatch = path.includes('/hr/verifystaffregistration');

    if (isMatch) {
        console.log('✅ Staff Registration detected by path:', path);
    } else {
        console.log('❌ Staff Registration not detected. Path:', path);
    }

    return isMatch;
};

const isVendorPaymentVerification = (path, category, title, displayName, workflowType) => {
    // ✅ FIXED: Use lowercase strings for comparison since path is already lowercase
    const pathMatches = [
        '/purchase/verifyvendorpayment?paytype=bank',
        '/vendorpayment/verifyvendorpayment',
        'verifyvendorpayment',
        'vendor payment'
    ];

    const isMatch = pathMatches.some(match => path.includes(match)) ||
        category.includes('vendor payment') ||
        category.includes('vendorpayment') ||
        title.includes('vendor payment') ||
        title.includes('vendorpayment') ||
        displayName.includes('vendor payment') ||
        displayName.includes('vendorpayment') ||
        workflowType.includes('vendor payment') ||
        workflowType.includes('vendorpayment');

    if (isMatch) {
        console.log('✅ Vendor Payment detected by:', {
            path, category, title, displayName, workflowType
        });
    } else {
        console.log('❌ Vendor Payment not detected. Details:', {
            path, category, title, displayName, workflowType
        });
    }

    return isMatch;
};

const isSupplierInvoiceVerification = (path, category, title, displayName, workflowType) => {
    const pathMatches = [
        '/vendorinvoice/verifysupplierinvoice',
        '/purchase/verifysupplierinvoice',
        'verifysupplierinvoice',
        'supplier invoice'
    ];

    const isMatch = pathMatches.some(match => path.includes(match)) ||
        category.includes('supplier invoice') ||
        category.includes('verifysupplierinvoice') ||
        title.includes('supplier invoice') ||
        title.includes('verifysupplierinvoice') ||
        displayName.includes('supplier invoice') ||
        displayName.includes('verifysupplierinvoice') ||
        workflowType.includes('supplier invoice') ||
        workflowType.includes('verifysupplierinvoice');

    if (isMatch) {
        console.log('✅ Supplier Invoice detected by:', {
            path, category, title, displayName, workflowType
        });
    } else {
        console.log('❌ Supplier Invoice not detected. Details:', {
            path, category, title, displayName, workflowType
        });
    }

    return isMatch;
};

const isSupplierPOVerification = (path, category, title, displayName, workflowType) => {
    const pathMatches = [
        '/supplierpo/verifysupplierpo',
        '/purchase/verifysupplierpo',
        'verifysupplierpo',
        'supplier po'
    ];

    const isMatch = pathMatches.some(match => path.includes(match)) ||
        category.includes('supplier po') ||
        category.includes('verifysupplierpo') ||
        title.includes('supplier po') ||
        title.includes('verifysupplierpo') ||
        displayName.includes('supplier po') ||
        displayName.includes('verifysupplierpo') ||
        workflowType.includes('supplier po') ||
        workflowType.includes('verifysupplierpo');

    if (isMatch) {
        console.log('✅ Supplier PO detected by:', {
            path, category, title, displayName, workflowType
        });
    } else {
        console.log('❌ Supplier PO not detected. Details:', {
            path, category, title, displayName, workflowType
        });
    }

    return isMatch;
};

const isSPPOVerification = (path, category, title, displayName, workflowType) => {
    // ✅ Exact path matches for SPPO Verification only
    const pathMatches = [
        '/sppo/verifysppo',
        '/purchase/verifysppo'  // Without 'close'
    ];

    // ✅ Check for exact path match first (most reliable)
    const exactPathMatch = pathMatches.some(match => path === match);

    // ✅ If not exact match, check if path contains the pattern but NOT 'close'
    const partialPathMatch = pathMatches.some(match => path.includes(match)) && !path.includes('close');

    const isMatch = exactPathMatch ||
        partialPathMatch ||
        (category.includes('newsppo') && !category.includes('close')) ||
        (title.includes('newsppo') && !title.includes('close')) ||
        (displayName.includes('newsppo') && !displayName.includes('close')) ||
        (workflowType.includes('sppoverify') && !workflowType.includes('close'));

    if (isMatch) {
        console.log('✅ SPPO Verification detected by:', {
            path, category, title, displayName, workflowType
        });
    } else {
        console.log('❌ SPPO Verification not detected. Details:', {
            path, category, title, displayName, workflowType
        });
    }

    return isMatch;
};

const isCostCenterApproval = (path, category, title, displayName, workflowType) => {
    const pathMatches = [
        '/costcenter/approvecostcenter',
        '/accounts/approvecostcenter',
        'approvecostcenter',
        'cost center approval',
        'costcenterapproval'
    ];
    const isMatch = pathMatches.some(match => path.includes(match)) ||
        category.includes('cost center approval') ||
        category.includes('costcenterapproval') ||
        title.includes('cost center approval') ||
        title.includes('costcenterapproval') ||
        displayName.includes('cost center approval') ||
        displayName.includes('costcenterapproval') ||
        workflowType.includes('cost center approval') ||
        workflowType.includes('costcenterapproval');
    if (isMatch) {
        console.log('✅ Cost Center Approval detected by:', {
            path, category, title, displayName, workflowType
        });
    } else {
        console.log('❌ Cost Center Approval not detected. Details:', {
            path, category, title, displayName, workflowType
        });
    }
    return isMatch;
};

const isGeneralInvoiceApproval = (path, category, title, displayName, workflowType) => {
    const pathMatches = [
        '/accounts/approvegeneralinvoice',
        '/generalinvoice/approvegeneralinvoice',
        '/invoice/approvegeneralinvoice',
        'approvegeneralinvoice',
        'general invoice approval',
        'generalinvoiceapproval',
        'general invoice',
        'generalinvoice'
    ];

    const isMatch = pathMatches.some(match => path.includes(match)) ||
        category.includes('general invoice approval') ||
        category.includes('generalinvoiceapproval') ||
        category.includes('general invoice') ||
        category.includes('generalinvoice') ||
        title.includes('general invoice approval') ||
        title.includes('generalinvoiceapproval') ||
        title.includes('general invoice') ||
        title.includes('generalinvoice') ||
        displayName.includes('general invoice approval') ||
        displayName.includes('generalinvoiceapproval') ||
        displayName.includes('general invoice') ||
        displayName.includes('generalinvoice') ||
        workflowType.includes('general invoice approval') ||
        workflowType.includes('generalinvoiceapproval') ||
        workflowType.includes('general invoice') ||
        workflowType.includes('generalinvoice');

    if (isMatch) {
        console.log('✅ General Invoice Approval detected by:', {
            path, category, title, displayName, workflowType
        });
    } else {
        console.log('❌ General Invoice Approval not detected. Details:', {
            path, category, title, displayName, workflowType
        });
    }

    return isMatch;
};

const isCCBudgetAmendmentVerification = (path, category, title, displayName, workflowType) => {
    const pathMatches = [
        '/budget/verifyccbudgetamendment',
        '/accounts/verifyccbudgetamendment',
        '/accountsapproval/verifyccamendbudget',
        'verifyccbudgetamendment',
        'cc budget amendment'
    ];
    const isMatch = pathMatches.some(match => path.includes(match)) ||
        category.includes('cc budget amendment') ||
        category.includes('verifyccbudgetamendment') ||
        title.includes('cc budget amendment') ||
        title.includes('verifyccbudgetamendment') ||
        displayName.includes('cc budget amendment') ||
        displayName.includes('cost center budget amend(pcc)') ||
        workflowType.includes('cc budget amendment') ||
        workflowType.includes('verifyccbudgetamendment');
    if (isMatch) {
        console.log('✅ CC Budget Amendment detected by:', {
            path, category, title, displayName, workflowType
        });
    } else {
        console.log('❌ CC Budget Amendment not detected. Details:', {
            path, category, title, displayName, workflowType
        });
    }
    return isMatch;
};

const isDCABudgetAmendmentVerification = (path, category, title, displayName, workflowType) => {
    const pathMatches = [
        '/AccountsApproval/VerifyDCABudgetAmend',
        '/accountsapproval/verifydcabudgetamend',
        '/accountsapproval/verifydcaamendbudget',
        'verifydcabudgetamendment',
        'dca budget amendment'
    ];
    const isMatch = pathMatches.some(match => path.includes(match)) ||
        category.includes('dca budget amendment') ||
        category.includes('/accountsapproval/verifydcabudgetamend') ||
        title.includes('Account Head Amend') ||
        title.includes('account head amend') ||
        displayName.includes('dca budget amendment') ||
        displayName.includes('account head amend(pcc)') ||
        workflowType.includes('dca budget amendment') ||
        workflowType.includes('verifydcabudgetamendment');
    if (isMatch) {
        console.log('✅ DCA Budget Amendment detected by:', {
            path, category, title, displayName, workflowType
        });
    } else {
        console.log('❌ DCA Budget Amendment not detected. Details:', {
            path, category, title, displayName, workflowType
        });
    }
    return isMatch;
};

const isClientPOVerification = (path, category, title, displayName, workflowType) => {
    const pathMatches = [
        '/clientpo/verifyclientpo',
        '/sales/verifyclientpo',
        'verifyclientpo',
        'client po'
    ];
    const isMatch = pathMatches.some(match => path.includes(match)) ||
        category.includes('client po') ||
        category.includes('verifyclientpo') ||
        title.includes('client po') ||
        title.includes('verifyclientpo') ||
        displayName.includes('client po') ||
        displayName.includes('verifyclientpo') ||
        workflowType.includes('client po') ||
        workflowType.includes('verifyclientpo');
    if (isMatch) {
        console.log('✅ Client PO Verification detected by:', {
            path, category, title, displayName, workflowType
        });
    } else {
        console.log('❌ Client PO Verification not detected. Details:', {
            path, category, title, displayName, workflowType
        });
    }
    return isMatch;
};

const isLostDamagedItemsVerification = (path, category, title, displayName, workflowType) => {
    const pathMatches = [
        '/stock/verifylostdamageditems',
        '/Purchase/VerifyLostorDamagedItems',
        '/purchase/verifylostordamageditems',
        '/stock/lostordamageditemsverification',
        '/stock/lostdamageditemsverification',
        'Lost or Scrapped Items ',
        'lost or scrapped items',
    ];
    const isMatch = pathMatches.some(match => path.includes(match)) ||
        category.includes('lost damaged items') ||
        category.includes('verifylostdamageditems') ||
        title.includes('lost damaged items') ||
        title.includes('verifylostdamageditems') ||
        displayName.includes('lost damaged items') ||
        displayName.includes('verifylostdamageditems') ||
        workflowType.includes('lost damaged items') ||
        workflowType.includes('verifylostdamageditems');
    if (isMatch) {
        console.log('✅ Lost Damaged Items Verification detected by:', {
            path, category, title, displayName, workflowType
        });
    } else {
        console.log('❌ Lost Damaged Items Verification not detected. Details:', {
            path, category, title, displayName, workflowType
        });
    }
    return isMatch;
};

const isDailyIssueVerification = (path, category, title, displayName, workflowType) => {
    const pathMatches = [
        '/stock/verifydailyissue',
        '/purchase/verifydailyissue',
        'verifydailyissue',
        'daily issue'
    ];;
    const isMatch = pathMatches.some(match => path.includes(match)) ||
        category.includes('daily issue') ||
        category.includes('verifydailyissue') ||
        title.includes('daily issue') ||
        title.includes('verifydailyissue') ||
        displayName.includes('daily issue') ||
        displayName.includes('verifydailyissue') ||
        workflowType.includes('daily issue') ||
        workflowType.includes('verifydailyissue');
    if (isMatch) {
        console.log('✅ Daily Issue Verification detected by:', {
            path, category, title, displayName, workflowType
        });
    } else {
        console.log('❌ Daily Issue Verification not detected. Details:', {
            path, category, title, displayName, workflowType
        });
    }
    return isMatch;
};

const isScrapSaleVerification = (path, category, title, displayName, workflowType) => {
    const pathMatches = [
        '/stock/verifyscrapsale',
        '/purchase/verifyscrapsale',
        'verifyscrapsale',
        'scrap sale'
    ];;
    const isMatch = pathMatches.some(match => path.includes(match)) ||
        category.includes('scrap sale') ||
        category.includes('verifyscrapsale') ||
        title.includes('scrap sale') ||
        title.includes('verifyscrapsale') ||
        displayName.includes('scrap sale') ||
        displayName.includes('verifyscrapsale') ||
        workflowType.includes('scrap sale') ||
        workflowType.includes('verifyscrapsale');
    if (isMatch) {
        console.log('✅ Scrap Sale Verification detected by:', {
            path, category, title, displayName, workflowType
        });
    } else {
        console.log('❌ Scrap Sale Verification not detected. Details:', {
            path, category, title, displayName, workflowType
        });
    }
    return isMatch;
};

const isSPPOCloseVerification = (path, category, title, displayName, workflowType) => {
    // ✅ Exact path matches for SPPO Close Verification
    const pathMatches = [
        '/purchase/verifysppoclose',
        '/purchase/verifysppoclose?closetype=performing',
        '/purchase/verifysppoclose?closetype=nonperforming',
        '/sppo/verifysppoclose'
    ];

    // ✅ Check for exact path match (without query params) OR with query params
    const basePathMatch = path.startsWith('/purchase/verifysppoclose') ||
        path.startsWith('/sppo/verifysppoclose');

    const exactPathMatch = pathMatches.some(match => path === match || path.startsWith(match));

    const isMatch = basePathMatch ||
        exactPathMatch ||
        path.includes('verifysppoclose') ||
        category.includes('sppo close') ||
        title.includes('sppo close verification') ||
        displayName.includes('sppo close verification') ||
        workflowType.includes('sppoclose');

    if (isMatch) {
        console.log('✅ SPPO Close Verification detected by:', {
            path, category, title, displayName, workflowType
        });
    } else {
        console.log('❌ SPPO Close Verification not detected. Details:', {
            path, category, title, displayName, workflowType
        });
    }

    return isMatch;
};

const isSPPOAmendVerification = (path, category, title, displayName, workflowType) => {
    const pathMatches = [
        '/sppo/verifysppoamend',
        '/purchase/verifysppoamend',
        'verifysppoamend',
        'sppo amend'
    ];
    const isMatch = pathMatches.some(match => path.includes(match)) ||
        category.includes('sppo amend') ||
        category.includes('verifysppoamend') ||
        title.includes('sppo amend') ||
        title.includes('verifysppoamend') ||
        displayName.includes('sppo amend') ||
        displayName.includes('verifysppoamend') ||
        workflowType.includes('sppo amend') ||
        workflowType.includes('verifysppoamend');
    if (isMatch) {
        console.log('✅ SPPO Amend Verification detected by:', {
            path, category, title, displayName, workflowType
        });
    } else {
        console.log('❌ SPPO Amend Verification not detected. Details:', {
            path, category, title, displayName, workflowType
        });
    }
    return isMatch;
};

const isExcelAttendanceVerification = (path, category, title, displayName, workflowType) => {
    const pathMatches = [
        '/hr/verifyexcelattendance',    
        '/hr/verifyexcelattendanceinbox',
        'verifyexcelattendance',
        'excel attendance'
    ];
    const isMatch = pathMatches.some(match => path.includes(match)) ||
        category.includes('excel attendance') ||
        category.includes('verifyexcelattendance') ||
        title.includes('excel attendance') ||
        title.includes('verifyexcelattendance') ||
        displayName.includes('excel attendance') ||
        displayName.includes('verifyexcelattendance') ||
        workflowType.includes('excel attendance') ||
        workflowType.includes('verifyexcelattendance');     
    if (isMatch) {
        console.log('✅ Excel Attendance Verification detected by:', {
            path, category, title, displayName, workflowType
        });
    } else {
        console.log('❌ Excel Attendance Verification not detected. Details:', {
            path, category, title, displayName, workflowType
        });
    }
    return isMatch;
};

const isDailyAttendanceVerification = (path, category, title, displayName, workflowType) => {
    const pathMatches = [
        '/HR/VerifyStaffAttendance?Type=Staff', 
        '/hr/verifystaffattendance',
        'verifystaffattendance',
        'staff daily attendance'
    ];  
    const isMatch = pathMatches.some(match => path.includes(match)) ||
        category.includes('/HR/VerifyStaffAttendance?Type=Staff') ||
        category.includes('/HR/VerifyStaffAttendance') ||
        title.includes('Staff Attendance') ||
        title.includes('verifystaffattendance') ||
        displayName.includes('staff daily attendance') ||
        displayName.includes('verifystaffattendance') ||
        workflowType.includes('staff daily attendance') ||
        workflowType.includes('verifystaffattendance');
    if (isMatch) {
        console.log('✅ Staff Daily Attendance Verification detected by:', {
            path, category, title, displayName, workflowType
        });
    } else {
        console.log('❌ Staff Daily Attendance Verification not detected. Details:', {
            path, category, title, displayName, workflowType
        });
    }   
    return isMatch;
};

const isLabourObjectivesGoalsVerification = (path) => {
    // Simple and direct path check - using lowercase
    const isMatch = path.includes('/HR/VerifyLBObjectivesGoals') || path.includes('/hr/verifylbobjectivesgoals');

    if (isMatch) {
        console.log('✅ Labour Objectives & Goals detected by path:', path);
    } else {
        console.log('❌ Labour Objectives & Goals not detected. Path:', path);
    }

    return isMatch;
};

const isStaffObjectivesGoalsVerification = (path) => {
    // Simple and direct path check - using lowercase
    const isMatch = path.includes('/HR/VerifyObjectivesAndGoals') || path.includes('/hr/verifyobjectivesandgoals');

    if (isMatch) {
        console.log('✅ Staff Objectives & Goals detected by path:', path);
    } else {
        console.log('❌ Staff Objectives & Goals not detected. Path:', path);
    }
    return isMatch;
};

const isEmployeeCTCVerification = (path) => {
    // Simple and direct path check - using lowercase
    const isMatch = path.includes('/HR/VerifyPayRollStructureNew') || path.includes('/hr/verifypayrollstructurenew'); 
    if (isMatch) {
        console.log('✅ Employee CTC detected by path:', path);
    } else {
        console.log('❌ Employee CTC not detected. Path:', path);
    }   
    return isMatch;
};

const isLabourCTCVerification = (path) => {
    // Simple and direct path check - using lowercase
    const isMatch = path.includes('/HR/VerifyLabourPayRoll') || path.includes('/hr/verifylabourpayroll');   
    if (isMatch) {
        console.log('✅ Labour CTC detected by path:', path);
    } else {
        console.log('❌ Labour CTC not detected. Path:', path);
    }
    return isMatch;
};

const isLabourPayRevisionVerification = (path) => {
    // Simple and direct path check - using lowercase
    const isMatch = path.includes('/HR/VerifyLBPayRevision') || path.includes('/hr/verifylbpayrevision');
    if (isMatch) {
        console.log('✅ Labour Pay Revision detected by path:', path);
    } else {
        console.log('❌ Labour Pay Revision not detected. Path:', path);
    }
    return isMatch;
};


const isStaffPayRevisionVerification = (path) => {
    // Simple and direct path check - using lowercase
    const isMatch = path.includes('/HR/VerifyPayRevision') || path.includes('/hr/verifypayrevision'); 
    if (isMatch) {
        console.log('✅ Staff Pay Revision detected by path:', path);
    }
    else {
        console.log('❌ Staff Pay Revision not detected. Path:', path);
    }
    return isMatch;
};

const isEmployeeLeaveRequestVerification = (path) => {
    // Simple and direct path check - using lowercase
    const isMatch = path.includes('/HR/VerifyHRLeaveRequest') || path.includes('/hr/verifyhrleaverequest'); 
    if (isMatch) {
        console.log('✅ Employee Leave Request detected by path:', path);
    } else {
        console.log('❌ Employee Leave Request not detected. Path:', path);
    }
    return isMatch;
};
const isDividendDeclarationVerification = (path) => {
    // Simple and direct path check - using lowercase
    const isMatch = path.includes('/shares/dividenddeclarationverification') || path.includes('/Shares/DividendDeclarationVerification');

    if (isMatch) {
        console.log('✅ Dividend Declaration Verification detected by path:', path);
    } else {
        console.log('❌ Dividend Declaration Verification not detected. Path:', path);
    }
    return isMatch;
};

const isDividendDistributionVerification = (path) => {
    // Simple and direct path check - using lowercase
    const isMatch = path.includes('/shares/dividenddistributionverification') || path.includes('/Shares/DividendDistributionVerification'); 
    if (isMatch) {
        console.log('✅ Dividend Distribution Verification detected by path:', path);
    } else {
        console.log('❌ Dividend Distribution Verification not detected. Path:', path);
    }
    return isMatch;
};

const isDividendBankPaymentVerification = (path) => {
    // Simple and direct path check - using lowercase
    const isMatch = path.includes('/shares/DividendPaymentVerification') || path.includes('/Shares/DividendPaymentVerification')|| path.includes('/shares/dividendpaymentverification') || path.includes('/shares/dividendbankpaymentverification');

    if (isMatch) {
        console.log('✅ Dividend Bank Payment Verification detected by path:', path);
    } else {
        console.log('❌ Dividend Bank Payment Verification not detected. Path:', path); 
    }
    return isMatch;
};

const isStaffCMSPayVerification = (path) => {
    // Simple and direct path check - using lowercase
    const isMatch = path.includes('/hr/verifycmspaygeneration') || path.includes('/HR/VerifyCMSPayGeneration');
    if (isMatch) {
        console.log('✅ Staff CMS Pay Verification detected by path:', path);
    } else {
        console.log('❌ Staff CMS Pay Verification not detected. Path:', path);
    }
    return isMatch;
};

const isStaffPayrollVerification = (path) => {
    // Simple and direct path check - using lowercase
    const isMatch = path.includes('/hr/verifyccpayroll') || path.includes('/HR/VerifyCCPayRoll');
    if (isMatch) {
        console.log('✅ Staff Payroll Verification detected by path:', path);
    } else {
        console.log('❌ Staff Payroll Verification not detected. Path:', path);
    }
    return isMatch;
};

const isSalaryDeductionArearVerification = (path) => {
    
    const isMatch = path.includes('/hr/verifysalarydeduction') || path.includes('/HR/VerifySalaryDeduction');
    if (isMatch) {
        console.log('✅ Salary Deduction Arear Verification detected by path:', path);
    } else {
        console.log('❌ Salary Deduction Arear Verification not detected. Path:', path);
    }
    return isMatch;
};
const isEmployeeTransferVerification = (path) => {
    const isMatch = path.includes('/hr/verifyemployeetransfer') || path.includes('/HR/VerifyEmployeeTransfer');
    if (isMatch) {
        console.log('✅ Employee Transfer Verification detected by path:', path);
    } else {
        console.log('❌ Employee Transfer Verification not detected. Path:', path);
    }
    return isMatch;
};

const isAppraisalObjectiveVerification = (path) => {
    const isMatch = path.includes('/hr/verifyappraisalobjectives') ||
        path.includes('/hr/verifyempobjectivesgoals') ||
        path.includes('/hr/verifyempobjectandgoals') ||
        path.includes('/hr/verifyappraisa') ||
        path.includes('appraisalobjective') ||
        path.includes('verifyempobject');
    if (isMatch) {
        console.log('✅ Appraisal Objective & Goals Verification detected by path:', path);
    } else {
        console.log('❌ Appraisal Objective & Goals not detected. Path:', path);
    }
    return isMatch;
};


// ============================================================================
// MAIN COMPONENT
// ============================================================================

const InboxRouter = ({ notificationData, onNavigate }) => {
    console.log('🔍 InboxRouter received notification:', notificationData);

    // ========================================================================
    // MAIN ROUTING FUNCTION
    // ========================================================================
    const getVerificationComponent = (notification) => {
        // ✅ USAGE #1: When no notification data is provided
        if (!notification) {
            console.log('❌ No notification data provided');
            return <InboxItemPlaceholder notificationData={null} onNavigate={onNavigate} />;
        }

        const {
            ModuleDisplayName,
            ModuleCategory,
            NavigationPath,
            InboxTitle,
            MasterId,
            WorkflowType
        } = notification;

        // Convert to lowercase for easier matching
        const path = (NavigationPath || '').toLowerCase();
        const category = (ModuleCategory || '').toLowerCase();
        const title = (InboxTitle || '').toLowerCase();
        const displayName = (ModuleDisplayName || '').toLowerCase();
        const workflowType = (WorkflowType || '').toLowerCase();

        console.log('🎯 Routing inputs:', {
            path, category, title, displayName, workflowType, masterId: MasterId
        });

        // ====================================================================
        // STAFF REGISTRATION VERIFICATION
        // ====================================================================
        if (isStaffRegistrationVerification(path, category, title, displayName, workflowType)) {
            console.log('✅ Routing to VerifyStaffRegistration');
            return <VerifyStaffRegistration
                notificationData={notification}
                onNavigate={onNavigate}
            />;
        }

        // ====================================================================
        // VENDOR PAYMENT VERIFICATION
        // ====================================================================
        if (isVendorPaymentVerification(path, category, title, displayName, workflowType)) {
            console.log('✅ Routing to VerifyVendorPayment');
            return <VerifyVendorPayment
                notificationData={notification}
                onNavigate={onNavigate}
            />;
        }

        // ====================================================================
        // SUPPLIER INVOICE VERIFICATION
        // ====================================================================
        if (isSupplierInvoiceVerification(path, category, title, displayName, workflowType)) {
            console.log('✅ Routing to VerifySupplierInvoice');
            return <VerifySupplierInvoice
                notificationData={notification}
                onNavigate={onNavigate}
            />;
        }

        // ====================================================================
        // SUPPLIER PO VERIFICATION
        // ====================================================================
        if (isSupplierPOVerification(path, category, title, displayName, workflowType)) {
            console.log('✅ Routing to VerifySupplierPO');
            return <VerifySupplierPO
                notificationData={notification}
                onNavigate={onNavigate}
            />;
        }

     

        // ====================================================================
        // COST CENTER APPROVAL VERIFICATION
        // ==================================================================== 
        if (isCostCenterApproval(path, category, title, displayName, workflowType)) {
            console.log('✅ Routing to Cost Center Approval Component');
            return <CostCenterApproval
                notificationData={notification}
                onNavigate={onNavigate}
            />;
        }

        // ====================================================================
        // GENERAL INVOICE APPROVAL VERIFICATION
        // ====================================================================
        if (isGeneralInvoiceApproval(path, category, title, displayName, workflowType)) {
            console.log('✅ Routing to General Invoice Approval Component');
            return <GeneralInvoiceApproval
                notificationData={notification}
                onNavigate={onNavigate}
            />;
        }

        // ====================================================================
        // CC BUDGET AMENDMENT VERIFICATION
        // ====================================================================
        if (isCCBudgetAmendmentVerification(path, category, title, displayName, workflowType)) {
            console.log('✅ Routing to VerifyCCBudgetAmendment');
            return <VerifyCCBudgetAmendment
                notificationData={notification}
                onNavigate={onNavigate}
            />;
        }

        // ====================================================================
        // DCA BUDGET AMENDMENT VERIFICATION
        // ==================================================================== 
        if (isDCABudgetAmendmentVerification(path, category, title, displayName, workflowType)) {
            console.log('✅ Routing to VerifyDCABudgetAmendment');
            return <VerifyDCABudgetAmendment
                notificationData={notification}
                onNavigate={onNavigate}
            />;
        }
        // ====================================================================

        // CLIENT PO VERIFICATION
        // ==================================================================== 
        if (isClientPOVerification(path, category, title, displayName, workflowType)) {
            console.log('✅ Routing to VerifyClientPO');
            return <VerifyClientPO
                notificationData={notification}
                onNavigate={onNavigate}
            />;
        }
        // ====================================================================

        // LOST DAMAGED ITEMS VERIFICATION
        // ==================================================================== 
        if (isLostDamagedItemsVerification(path, category, title, displayName, workflowType)) {
            console.log('✅ Routing to VerifyLostDamagedItems');
            return <LostDamagedItemsVerification
                notificationData={notification}
                onNavigate={onNavigate}
            />;
        }
        // ====================================================================

        // DAILY ISSUE VERIFICATION
        // ==================================================================== 
        if (isDailyIssueVerification(path, category, title, displayName, workflowType)) {
            console.log('✅ Routing to VerifyDailyIssue');
            return <VerifyDailyIssue
                notificationData={notification}
                onNavigate={onNavigate}
            />;
        }
        // ====================================================================

        // SCRAP SALE VERIFICATION
        // ==================================================================== 
        if (isScrapSaleVerification(path, category, title, displayName, workflowType)) {
            console.log('✅ Routing to VerifyScrapSale');
            return <VerifyScrapSale
                notificationData={notification}
                onNavigate={onNavigate}
            />;
        }

        // EXCEL ATTENDANCE VERIFICATION
        // ==================================================================== 
        if (isExcelAttendanceVerification(path, category, title, displayName, workflowType)) {
            console.log('✅ Routing to VerifyExcelAttendance');
            return <VerifyExcelAttendance
                notificationData={notification}
                onNavigate={onNavigate}
            />; 
                
        }

        // ====================================================================
        // SPPO CLOSE VERIFICATION
        // ====================================================================
        if (isSPPOCloseVerification(path, category, title, displayName, workflowType)) {
            console.log('✅ Routing to VerifySPPOClose');
            return <VerifySPPOClose
                notificationData={notification}
                onNavigate={onNavigate}
            />;
        }

        // ====================================================================
        // SPPO AMEND VERIFICATION
        // ====================================================================
        if (isSPPOAmendVerification(path, category, title, displayName, workflowType)) {
            console.log('✅ Routing to VerifySPPOAmend');
            return <VerifySPPOAmend
                notificationData={notification}
                onNavigate={onNavigate}
            />;
        }

           // =====================================================================
        // SPPO VERIFICATION
        //=====================================================================
        if (isSPPOVerification(path, category, title, displayName, workflowType)) {
            console.log('✅ Routing to VerifySPPO');
            return <VerifySPPO
                notificationData={notification}
                onNavigate={onNavigate}
            />;
        }

        // ====================================================================
        // STAFF DAILY ATTENDANCE VERIFICATION
        // ====================================================================
        if (isDailyAttendanceVerification(path, category, title, displayName, workflowType)) {
            console.log('✅ Routing to VerifyStaffDailyAttendance');
            return <VerifyStaffDailyAttendance      
                notificationData={notification}
                onNavigate={onNavigate}
            />;
        }
        // ====================================================================

        // LABOUR OBJECTIVES & GOALS VERIFICATION
        // ====================================================================
        if (isLabourObjectivesGoalsVerification(path)) {
            console.log('✅ Routing to VerifyLabourObjectivesGoals');
            return <VerifyLabourObjectivesGoals
                notificationData={notification}
                onNavigate={onNavigate}
            />;
        }
        // ====================================================================

        // STAFF OBJECTIVES & GOALS VERIFICATION
        // ====================================================================
        if (isStaffObjectivesGoalsVerification(path)) {
            console.log('✅ Routing to VerifyStaffObjectivesGoals');
            return <VerifyStaffObjectivesGoals
                notificationData={notification}
                onNavigate={onNavigate}
            />;
        }
        // ====================================================================

        // EMPLOYEE CTC VERIFICATION
        // ====================================================================
        if (isEmployeeCTCVerification(path)) {
            console.log('✅ Routing to VerifyEmployeeCTC');
            return <VerifyEmployeeCTC
                notificationData={notification}
                onNavigate={onNavigate}
            />;
        }
        // ====================================================================

        // LABOUR CTC VERIFICATION
        // ====================================================================
        if (isLabourCTCVerification(path)) {
            console.log('✅ Routing to VerifyLabourCTC');
            return <VerifyLabourCTC
                notificationData={notification}
                onNavigate={onNavigate}
            />;
        }
        // ====================================================================
        // LABOUR PAY REVISION VERIFICATION
        // ====================================================================
        if (isLabourPayRevisionVerification(path)) {
            console.log('✅ Routing to VerifyLabourPayRevision');
            return <VerifyLabourPayRevision
                notificationData={notification}
                onNavigate={onNavigate}
            />;
        }
        // ====================================================================
        // STAFF PAY REVISION VERIFICATION
        // ====================================================================
        if (isStaffPayRevisionVerification(path)) {
            console.log('✅ Routing to VerifyStaffPayRevision');
            return <VerifyStaffPayRevision
                notificationData={notification}
                onNavigate={onNavigate}
            />;
        }
        // ====================================================================

        // EMPLOYEE LEAVE REQUEST VERIFICATION
        // ====================================================================
        if (isEmployeeLeaveRequestVerification(path)) {
            console.log('✅ Routing to VerifyEmployeeLeaveRequest');
            return <VerifyEmployeeLeaveRequest
                notificationData={notification} 
                onNavigate={onNavigate}
            />;
        }
        // ====================================================================

        // DIVIDEND DECLARATION VERIFICATION
        // ====================================================================
        if (isDividendDeclarationVerification(path)) {
            console.log('✅ Routing to DividendDeclarationVerification');
            return <DividendDeclarationVerification
                notificationData={notification}
                onNavigate={onNavigate}
            />; 
        }
        
        // ====================================================================
        // DIVIDEND DISTRIBUTION VERIFICATION
        // ====================================================================
        if (isDividendDistributionVerification(path)) {
            console.log('✅ Routing to DividendDistributionVerification');
            return <DividendDistributionVerification
                notificationData={notification}
                onNavigate={onNavigate}
            />;
        }
        // ====================================================================
        // DIVIDEND BANK PAYMENT VERIFICATION
        // ====================================================================
        if (isDividendBankPaymentVerification(path)) {
            console.log('✅ Routing to DividendBankPaymentVerification');
            return <DividendBankPaymentVerification
                notificationData={notification}
                onNavigate={onNavigate}
            />;
        }
        // ====================================================================
        // STAFF CMS PAY VERIFICATION
        // ====================================================================
        if (isStaffCMSPayVerification(path)) {
            console.log('✅ Routing to VerifyStaffCMSPay');
            return <VerifyStaffCMSPay
                notificationData={notification}
                onNavigate={onNavigate}
            />;
        }

        // ====================================================================
        // STAFF PAYROLL VERIFICATION
        // ====================================================================
        if (isStaffPayrollVerification(path)) {
            console.log('✅ Routing to VerifyStaffPayroll');
            return <VerifyStaffPayroll
                notificationData={notification}
                onNavigate={onNavigate}
            />;
        }

        // ====================================================================
        // SALARY DEDUCTION AREAR VERIFICATION
        // ====================================================================
        if (isSalaryDeductionArearVerification(path)) {
            console.log('✅ Routing to VerifySalaryDeductionArear');
            return <VerifySalaryDeductionArear
                notificationData={notification}
                onNavigate={onNavigate}
            />;
        }
        // ====================================================================
        // EMPLOYEE TRANSFER VERIFICATION
        if (isEmployeeTransferVerification(path)) {
            console.log('✅ Routing to EmployeeTransferVerify');
            return <VerifyEmployeeTransfer
                notificationData={notification}
                onNavigate={onNavigate}
            />;
        }
        // ====================================================================
        // EMPLOYEE EXIT VERIFICATION
        if (path.includes('/hr/verifyempexit') || path.includes('/HR/VerifyEmpExit')) {
            console.log('✅ Routing to EmployeeExitVerify');
            return <VerifyEmployeeExit
                notificationData={notification}
                onNavigate={onNavigate}
            />;
        }

        // ====================================================================
        // STAFF FULL & FINAL VERIFICATION
        // ====================================================================
        if (
            path.includes('finalsalary')   ||
            path.includes('fullfinal')     ||
            path.includes('full & final')  ||
            path.includes('full&final')    ||
            path.includes('fullfinalsalary') ||
            title.includes('full & final') ||
            title.includes('finalsalary')  ||
            displayName.includes('full & final') ||
            displayName.includes('finalsalary')  ||
            category.includes('finalsalary')
        ) {
            console.log('✅ Routing to VerifyStaffFullFinal');
            return <VerifyStaffFullFinal
                notificationData={notification}
                onNavigate={onNavigate}
            />;
        }

        // HR Advance Request Verification (LTA / SA)
        if (
            path.includes('advance')        ||
            path.includes('hradvance')      ||
            path.includes('lta')            ||
            path.includes('salaryadvance')  ||
            title.includes('advance')       ||
            displayName.includes('advance') ||
            category.includes('advance')
        ) {
            console.log('✅ Routing to VerifyStaffAdvance');
            return <VerifyStaffAdvance
                notificationData={notification}
                onNavigate={onNavigate}
            />;
        }

        // ====================================================================
        // APPRAISAL OBJECTIVE & GOALS VERIFICATION
        // ====================================================================
        if (
            isAppraisalObjectiveVerification(path) ||
            title.includes('appraisal')            ||
            title.includes('objective')            ||
            displayName.includes('appraisal')      ||
            displayName.includes('objective')      ||
            category.includes('appraisal')         ||
            category.includes('objective')
        ) {
            console.log('✅ Routing to VerifyStaffAppraisal');
            return <VerifyStaffAppraisal
                notificationData={notification}
                onNavigate={onNavigate}
            />;
        }


        // ✅ USAGE #2: When no specific component matches the notification
        console.log('⚠️ No specific component found, using placeholder');
        return <InboxItemPlaceholder
            notificationData={notification}
            onNavigate={onNavigate}
        />;
    };

    // ========================================================================
    // RENDER
    // ========================================================================
    return (
        <div className="inbox-router">
            {getVerificationComponent(notificationData)}
        </div>
    );
};

export default InboxRouter;