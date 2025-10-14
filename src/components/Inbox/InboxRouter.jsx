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
    const pathMatches = [
        '/sppo/verifySppo',
        '/purchase/verifysppo',
        'verify sppo',
        'sppo'
    ];

    const isMatch = pathMatches.some(match => path.includes(match)) ||
        category.includes('sppo') ||
        title.includes('sppo') ||
        displayName.includes('sppo') ||
        workflowType.includes('sppo');

    if (isMatch) {
        console.log('✅ SPPO detected by:', {
            path, category, title, displayName, workflowType
        });
    } else {
        console.log('❌ SPPO not detected. Details:', {
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