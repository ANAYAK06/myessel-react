// components/Inbox/InboxRouter.js
import React from 'react';

// ============================================================================
// VERIFICATION COMPONENTS - Import only what you need
// ============================================================================
import VerifyStaffRegistration from '../../pages/HR/VerifyStaffRegistration';
import VerifyVendorPayment from '../../pages/VendorPayment/VerifyVendorPayment';
import VerifySupplierInvoice from '../../pages/VendorInvoice/VerifySupplierInvoice';
import VerifySupplierPO from '../../pages/SupplierPO/VerifySupplierPO';

// ============================================================================
// FALLBACK COMPONENT - For unimplemented verification types
// ============================================================================
import InboxItemPlaceholder from './InboxItemPlaceholder';

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
        // ADD MORE VERIFICATION TYPES HERE
        // ====================================================================
        // Example for future additions:
        // if (isPayrollApproval(path, category, title, displayName, workflowType)) {
        //     return <VerifyPayrollApproval notificationData={notification} onNavigate={onNavigate} />;
        // }

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