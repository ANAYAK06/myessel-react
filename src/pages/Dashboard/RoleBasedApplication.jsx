// pages/Dashboard/RoleBasedApplication.js - UPDATED WITH CENTRALIZED FREQUENCY TRACKING
import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import TopNavbarLayout from '../../components/TopNavbarLayout';
import DashboardContent from './DashboardContent';
import InboxRouter from '../../components/Inbox/InboxRouter';
import LegacyPageWrapper from '../../components/LegacyPageWrapper'

// ============================================================================
// REPORT COMPONENTS 
// ============================================================================
import BasicBusinessInfoSetup from '../BusinessInfo/BusinessInfoSetup';
import BudgetReport from '../Budget/BudgetReport';
import AccruedInterestReport from '../FinancialReports/AccruedInterestReport';
import BankStatementPage from '../Bank/BankStatementPage';
import BankDetailsPage from '../Bank/BankDetailsPage';
import ClientPOReportPage from '../ClientPO/ClientPOReportPage';
import TransactionLogPage from '../FinancialReports/TransactionLogPage';
import TermLoanReportPage from '../TermLoan/TermLoanReport';
import AssetDepreciationReportPage from '../Assets/AssetDepreciationReportPage';
import AssetSalesReportPage from '../Assets/AssetSalesReport';
import ViewCurrentStockPage from '../Stock/ViewCurrentStockPage';
import SupplierPOStatusPage from '../Stock/SupplierPOStatusPage';
import ScrapWalletReportPage from '../Stock/ScrapWalletReportPage';
import ConsolidatedGSTReportPage from '../GST/ConsolidatedGSTReportPage';
import ItemWiseGSTReportPage from '../GST/ItemWiseGSTReportPage';
import SupplierPOReportPage from '../SupplierPO/SupplierPOReportPage';
import SPPOReportPage from '../SPPO/SPPOReportPage';
import CompanyOverallStatusPage from '../FinancialReports/CompanyOverallStatusPage';
import AccountStatusPage from '../FinancialReports/AccountStatusPage';
import StockReconciliationPage from '../Stock/StockReconciliationPage';
import StockTransferReportPage from '../Stock/StockTransferReportPage';
import ClosingStockReportPage from '../Stock/ClosingStockReportPage';
import ViewIndentsReportPage from '../Stock/ViewIndentsReportPage';
import DailyIssuedItemsReportPage from '../Stock/DailyIssuedItemsReportPage';
import ItemCodeReportPage from '../Stock/ItemCodeReportPage';
import LostScrapReportPage from '../Stock/LostScrapReportPage';
import LCBGStatusReportPage from '../FinancialReports/LCBGStatusReportPage';
import StockSummaryPage from '../FinancialReports/StockSummaryPage';
import UnsecuredLoanReportPage from '../TermLoan/UnsecuredLoanReportPage';
import StaffCMSPaymentReportPage from '../HRReports/StaffCMSPaymentReportPage';
import StaffAttendanceReportPage from '../HRReports/StaffAttendanceReportPage';
import EmployeeExitReportPage from '../HRReports/EmployeeExitReportPage';
import LeaveReportPage from '../HRReports/LeaveReportPage';
import StaffPFESIReportPage from '../HRReports/StaffPFESIReportPage';
import LabourPFESIReportPage from '../HRReports/LabourPFESIReportPage';
import StaffSalaryReportPage from '../HRReports/StaffSalaryReportPage';
import LabourSalaryReportPage from '../HRReports/LabourSalaryReportPage';
import StaffReportPage from '../HRReports/StaffReportPage';
import StaffCTCReportPage from '../HRReports/StaffCTCReportPage';
import LabourReportPage from '../HRReports/LabourReportPage';
import LabourAttendanceReportPage from '../HRReports/LabourAttendanceReportPage';
import LTAReportPage from '../HRReports/LTAReportPage';


//============================================================================
// MAIN WORKING COMPONENT
//============================================================================

import CostCenterCreationManagement from '../CostCenter/CostCenterCreationManagement';
import DividendDeclarationCreate from '../shares/DividendDeclarationCreate';
import DividendDistributionCreate from '../shares/DividendDistributionCreate';
import DividendBankPaymentCreate from '../shares/DividendBankPaymentCreate';
import StaffCMSPayCreation from '../HR/StaffCMSPayCreation';
import LabourCMSPayCreation from '../HR/LabourCMSPayCreation';
import StaffPayrollGeneration from '../HR/StaffPayrollGeneration';
import LabourPayrollGeneration from '../HR/LabourPayrollGeneration';
import LabourBankChange from '../HR/LabourBankChange';
import LabourTypeChange from '../HR/LabourTypeChange';
import StaffSalaryDeductionArrear from '../HR/StaffSalaryDeductionArrear';
import StaffJoinRegistration from '../HR/StaffJoinRegistration';
import BulkWorkerRegistration from '../HR/BulkWorkerRegistration';
import EmployeeTransfer from '../HR/EmployeeTransfer';
import EmployeeExit from '../HR/EmployeeExit';
import LabourExit from '../HR/LabourExit';
import StaffFullFinal from '../HR/StaffFullFinal';
import EmployeeLeaveRequest from '../HR/EmployeeLeaveRequest';
import StaffAdvanceRequest from '../HR/StaffAdvanceRequest';
import StaffAppraisalObjective from '../HR/StaffAppraisalObjective';
import StaffPayrollStructure from '../HR/StaffPayrollStructure';
import StaffAttendance from '../HR/StaffAttendance';
import StaffPayRevision from '../HR/StaffPayRevision';
import CashVoucherCreation from '../Accounts/CashVoucherCreation';
import GeneralPayment from '../Accounts/GeneralPayment';
import VendorCashPayment from '../Accounts/VendorCashPayment';
import CCCashTransfer from '../Accounts/CCCashTransfer';
import CCClosing from '../Accounts/CCClosing';
import ClientInvoiceCreation from '../Accounts/ClientInvoiceCreation';
import ClientManufacturingInvoiceCreation from '../Accounts/ClientManufacturingInvoiceCreation';
import ClientScrapSaleInvoiceCreation from '../Accounts/ClientScrapSaleInvoiceCreation';
import ClientTradingInvoiceCreation from '../Accounts/ClientTradingInvoiceCreation';
import GeneralInvoiceCreation from '../Accounts/GeneralInvoiceCreation';
import BankWithdrawal from '../Accounts/BankWithdrawal';
import BankTransfer from '../Accounts/BankTransfer';
import GeneralInvoicePayment from '../Accounts/GeneralInvoicePayment';
import CCSalEsiPfPayment from '../Accounts/CCSalEsiPfPayment';
import SPPOInvoiceCreation from '../SPPO/SPPOInvoiceCreation';
import SupplierPOInvoiceCreation from '../SupplierPO/SupplierPOInvoiceCreation';
import SupplierPOCreation from '../SupplierPO/SupplierPOCreation';
import LoadWallet from '../Accounts/LoadWallet';
import LCBGCreation from '../Accounts/LCBGCreation';
import IndentCreation from '../Purchase/IndentCreation';
import SPPOPayment from '../Purchase/SPPOPayment';
import VendorCMSPayment from '../Purchase/VendorCMSPayment';
import VendorTDSPayment from '../Purchase/VendorTDSPayment';
import BOESettlement from '../Purchase/BOESettlement';
import ClientBadDebtReceivables from '../Accounts/ClientBadDebtReceivables';
import JournalVoucherCreation from '../Accounts/JournalVoucherCreation';
import CreditDebitNote from '../Purchase/CreditDebitNote';
import LCBGAmend from '../Purchase/LCBGAmend';
import UnsecuredLoan from '../Accounts/UnsecuredLoan';
import TermLoanCreation from '../Accounts/TermLoanCreation';
import TermLoanPayment from '../Accounts/TermLoanPayment';
import AgencyCreation from '../Accounts/AgencyCreation';
import ChatBot from '../../components/ChatBot/ChatBot';
import LabourRuleConfig from '../HR/LabourRuleConfig';

const RoleBasedApplication = () => {
    const { roleData } = useSelector((state) => state.auth);

    const [currentPage, setCurrentPage] = useState('dashboard');
    const [currentMenuData, setCurrentMenuData] = useState(null);

    // Centralized frequency tracking state
    const [linkFrequency, setLinkFrequency] = useState({});

    // Load frequency data from sessionStorage on component mount
    useEffect(() => {
        const savedFrequency = sessionStorage.getItem('menuLinkFrequency');
        if (savedFrequency) {
            try {
                setLinkFrequency(JSON.parse(savedFrequency));
                console.log('🔄 Loaded frequency data:', JSON.parse(savedFrequency));
            } catch (error) {
                console.error('Error loading link frequency:', error);
                setLinkFrequency({});
            }
        }
    }, []);

    // Save frequency data to sessionStorage whenever it changes
    useEffect(() => {
        if (Object.keys(linkFrequency).length > 0) {
            sessionStorage.setItem('menuLinkFrequency', JSON.stringify(linkFrequency));
            console.log('💾 Saved frequency data:', linkFrequency);
        }
    }, [linkFrequency]);

    // Centralized function to track ALL navigation events
    const trackMenuUsage = useCallback((menuData) => {
        if (!menuData) return;

        // Create a unique key for the menu item
        // Use consistent key format across all navigation sources
        let linkKey;

        if (menuData.name === 'Dashboard' || menuData.type === 'dashboard') {
            linkKey = 'Dashboard_Dashboard';
        } else {
            // For menu items from API
            const section = menuData.li || menuData.section || 'Other';
            const name = menuData.name || menuData.subli || menuData.SUBLI || 'Unknown';
            linkKey = `${section}_${name}`;
        }

        // Update frequency count
        setLinkFrequency(prev => {
            const newFrequency = {
                ...prev,
                [linkKey]: (prev[linkKey] || 0) + 1
            };
            console.log('📊 Updated frequency for:', linkKey, 'New count:', newFrequency[linkKey]);
            return newFrequency;
        });

    }, []);

    // Enhanced navigation handler that tracks ALL navigation
    const handleNavigation = (route, menuData) => {
        console.log('🔗 Navigation:', route, menuData);

        // Track this navigation event
        trackMenuUsage(menuData);

        // Update current page state
        setCurrentPage(route);
        setCurrentMenuData(menuData);
    };

    const isInboxItem = (menuData) => {
        if (!menuData) return false;

        // Check for notification-specific properties
        const hasNotificationProps = !!(
            menuData.type === 'notification' ||
            menuData.type === 'inbox-item' ||
            menuData.masterId ||
            menuData.MasterId ||
            menuData.NavigationPath ||
            menuData.InboxTitle ||
            menuData.TotalPendingCount !== undefined
        );

        console.log('🔍 Inbox item detection:', {
            type: menuData.type,
            hasNotificationProps,
            navigationPath: menuData.NavigationPath,
            inboxTitle: menuData.InboxTitle,
            masterId: menuData.masterId || menuData.MasterId
        });

        return hasNotificationProps;
    };


    // Check if menu item should route to BasicBusinessInfoSetup
    const isBasicBusinessInfoSetup = (menuData) => {
        if (!menuData) return false;

        const pathMatches = menuData.path === '/Home/BasicBusinessInfoSetup';
        const nameMatches = menuData.name?.toLowerCase().includes('basicbusinessinfosetup') ||
            menuData.name?.toLowerCase().includes('basic business info setup');
        const routeMatches = menuData.reactRoute?.toLowerCase().includes('basicbusinessinfosetup');

        return pathMatches || nameMatches || routeMatches;
    };

    // Check if menu item should route to Accrued Interest Report
    const isAccruedInterestReport = (menuData) => {
        if (!menuData) return false;

        const pathMatches = menuData.path === '/Reports/AccruedInterestReport' ||
            menuData.path === '/Home/AccruedInterestReport' ||
            menuData.path?.toLowerCase().includes('accruedinterest')

        const nameMatches = menuData.name?.toLowerCase().includes('accruedinterest') ||
            menuData.name?.toLowerCase().includes('accrued interest') ||
            menuData.name?.toLowerCase().includes('liquidity status') ||
            menuData.name?.toLowerCase().includes('liquiditystatus')

        const routeMatches = menuData.reactRoute?.toLowerCase().includes('accruedinterest') ||
            menuData.reactRoute?.toLowerCase().includes('liquiditystatus');

        return pathMatches || nameMatches || routeMatches;
    };

    // Check if menu item should route to Budget Report
    const isBudgetReport = (menuData) => {
        if (!menuData) return false;

        const pathMatches = menuData.path === '/Home/BudgetReport' ||
            menuData.path === '/Accounts/BudgetReport' ||
            menuData.path?.toLowerCase().includes('budgetreport');
        const nameMatches = menuData.name?.toLowerCase().includes('budgetreport') ||
            menuData.name?.toLowerCase().includes('budget report');
        const routeMatches = menuData.reactRoute?.toLowerCase().includes('budgetreport');

        return pathMatches || nameMatches || routeMatches;
    };

    // Check if menu item should route to Bank Statement Page
    const isBankStatementPage = (menuData) => {
        if (!menuData) return false;

        const pathMatches = menuData.path === '/Home/BankStatement' ||
            menuData.path === '/Reports/BankStatement' ||
            menuData.path === '/Bank/BankStatement' ||
            menuData.path?.toLowerCase().includes('bankstatement');
        const nameMatches = menuData.name?.toLowerCase().includes('bankstatement') ||
            menuData.name?.toLowerCase().includes('bank statement') ||
            menuData.name?.toLowerCase().includes('bank transaction') ||
            menuData.name?.toLowerCase().includes('statement');
        const routeMatches = menuData.reactRoute?.toLowerCase().includes('bankstatement');

        return pathMatches || nameMatches || routeMatches;
    };

    // Check if menu item should route to Bank Details Page
    const isBankDetailsPage = (menuData) => {
        if (!menuData) return false;

        const pathMatches = menuData.path === '/Home/BankDetails' ||
            menuData.path === '/Reports/BankDetails' ||
            menuData.path === '/Bank/BankDetails' ||
            menuData.path?.toLowerCase().includes('bankdetails');
        const nameMatches = menuData.name?.toLowerCase().includes('bankdetails') ||
            menuData.name?.toLowerCase().includes('bank details') ||
            menuData.name?.toLowerCase().includes('bank info') ||
            menuData.name?.toLowerCase().includes('bank information');
        const routeMatches = menuData.reactRoute?.toLowerCase().includes('bankdetails');

        return pathMatches || nameMatches || routeMatches;
    };

    // Check if menu item should route to Client PO Report Page
    const isClientPOReportPage = (menuData) => {
        if (!menuData) return false;

        const pathMatches = menuData.path === '/Home/ClientPOReport' ||
            menuData.path === '/Reports/ClientPOReport' ||
            menuData.path === '/Reports/GetClientPOForReport' ||
            menuData.path?.toLowerCase().includes('clientporeport') ||
            menuData.path?.toLowerCase().includes('getclientpofor');
        const nameMatches = menuData.name?.toLowerCase().includes('clientporeport') ||
            menuData.name?.toLowerCase().includes('po report');


        const routeMatches = menuData.reactRoute?.toLowerCase().includes('clientpoReport') ||
            menuData.reactRoute?.toLowerCase().includes('getclientpofor');

        return pathMatches || nameMatches || routeMatches;
    };

    const isTransactionLogPage = (menuData) => {
        if (!menuData) return false;

        const pathMatches = menuData.path === '/Reports/TransactionLog' ||
            menuData.path === '/Home/TransactionLog' ||
            menuData.path === '/Reports/ViewTransactionLogGrid' ||
            menuData.path?.toLowerCase().includes('transactionlog');
        const nameMatches = menuData.name?.toLowerCase().includes('transactionlog') ||
            menuData.name?.toLowerCase().includes('transaction log') ||
            menuData.name?.toLowerCase().includes('transaction report') ||
            menuData.name?.toLowerCase().includes('viewtransactionlog');
        const routeMatches = menuData.reactRoute?.toLowerCase().includes('transactionlog');

        return pathMatches || nameMatches || routeMatches;
    };

    // Add this function with other route detection functions
    // Check if menu item should route to Term Loan Report Page
    const isTermLoanReportPage = (menuData) => {
        if (!menuData) return false;

        const pathMatches = menuData.path === '/Reports/TermLoanReport' ||
            menuData.path === '/Reports/ViewTermLoan' ||
            menuData.path === '/Purchase/GetTermLoanReportGrid' ||
            menuData.path?.toLowerCase().includes('termloanreport');
        const nameMatches = menuData.name?.toLowerCase().includes('termloanreport') ||
            menuData.name?.toLowerCase().includes('term loan report') ||
            menuData.name?.toLowerCase().includes('loan report');
        const routeMatches = menuData.reactRoute?.toLowerCase().includes('termloanreport');

        return pathMatches || nameMatches || routeMatches;
    };

    // Check if menu item should route to Asset Depreciation Report Page
    const isAssetDepreciationReportPage = (menuData) => {
        if (!menuData) return false;

        const pathMatches = menuData.path === '/Reports/AssetDepreciationReport' ||
            menuData.path === '/Assets/AssetDepreciationReport' ||
            menuData.path?.toLowerCase().includes('assetdepreciation') ||
            menuData.path?.toLowerCase().includes('assetsdepr');
        const nameMatches = menuData.name?.toLowerCase().includes('assetdepreciation') ||
            menuData.name?.toLowerCase().includes('asset depreciation') ||
            menuData.name?.toLowerCase().includes('depreciation report') ||
            menuData.name?.toLowerCase().includes('assets depreciation');
        const routeMatches = menuData.reactRoute?.toLowerCase().includes('assetdepreciation');

        return pathMatches || nameMatches || routeMatches;
    };

    // Check if menu item should route to Asset Sales Report Page
    const isAssetSalesReportPage = (menuData) => {
        if (!menuData) return false;

        const pathMatches = menuData.path === '/Reports/AssetSaleReport' ||
            menuData.path === '/Assets/AssetSalesReport' ||
            menuData.path === '/Purchase/ViewAssetSaleMainGrid' ||
            menuData.path?.toLowerCase().includes('assetsalesreport') ||
            menuData.path?.toLowerCase().includes('assetsales');
        const nameMatches = menuData.name?.toLowerCase().includes('assetsalesreport') ||
            menuData.name?.toLowerCase().includes('asset sales report') ||
            menuData.name?.toLowerCase().includes('asset sales') ||
            menuData.name?.toLowerCase().includes('viewassetsale');
        const routeMatches = menuData.reactRoute?.toLowerCase().includes('assetsalesreport') ||
            menuData.reactRoute?.toLowerCase().includes('assetsales');

        return pathMatches || nameMatches || routeMatches;
    };

    // Check if menu item should route to View Current Stock Page
    const isViewCurrentStockPage = (menuData) => {
        if (!menuData) return false;

        const pathMatches = menuData.path === '/Reports/ItemStockReport' ||
            menuData.path === '/Inventory/ViewCurrentStock' ||
            menuData.path === '/Purchase/ViewStockGrid' ||
            menuData.path?.toLowerCase().includes('viewcurrentstock') ||
            menuData.path?.toLowerCase().includes('viewstock') ||
            menuData.path?.toLowerCase().includes('currentstock');
        const nameMatches = menuData.name?.toLowerCase().includes('viewcurrentstock') ||
            menuData.name?.toLowerCase().includes('view current stock') ||
            menuData.name?.toLowerCase().includes('current stock') ||
            menuData.name?.toLowerCase().includes('inventory stock');
        const routeMatches = menuData.reactRoute?.toLowerCase().includes('viewcurrentstock') ||
            menuData.reactRoute?.toLowerCase().includes('viewstock');

        return pathMatches || nameMatches || routeMatches;
    };


    // Check if menu item should route to Supplier PO Status Page
    const isSupplierPOStatusPage = (menuData) => {
        if (!menuData) return false;

        const pathMatches = menuData.path === '/Reports/PurchaseStatus' ||
            menuData.path === '/Inventory/purchaseorderstatus' ||
            menuData.path === '/Purchase/purchaseorderstatus' ||
            menuData.path?.toLowerCase().includes('purchaseorderstatus');
        const nameMatches = menuData.name?.toLowerCase().includes('purchaseorderstatus') ||
            menuData.name?.toLowerCase().includes('purchase order status');
        const routeMatches = menuData.reactRoute?.toLowerCase().includes('purchaseorderstatus');

        return pathMatches || nameMatches || routeMatches;
    };

    // check if menu item should route to Scrap Wallet Report Page
    const isScrapWalletReportPage = (menuData) => {
        if (!menuData) return false;
        const pathMatches = menuData.path === '/Reports/ScrapWalletBalanceItemsReport' ||
            menuData.path === '/Inventory/ScrapWalletBalanceItemsReport' ||
            menuData.path?.toLowerCase().includes('scrapwalletbalanceitemsreport') ||
            menuData.path?.toLowerCase().includes('scrapwallet');
        const nameMatches = menuData.name?.toLowerCase().includes('scrapwalletbalanceitemsreport') ||
            menuData.name?.toLowerCase().includes('scrap wallet balance items report') ||
            menuData.name?.toLowerCase().includes('scrap wallet') ||
            menuData.name?.toLowerCase().includes('scrap wallet balance');
        const routeMatches = menuData.reactRoute?.toLowerCase().includes('scrapwalletbalanceitemsreport') ||
            menuData.reactRoute?.toLowerCase().includes('scrapwallet');
        return pathMatches || nameMatches || routeMatches;
    };

    // check if menu item should route to Gst consolidated purchase report Page
    const isGstConsolidatedPurchaseReportPage = (menuData) => {
        if (!menuData) return false;
        const pathMatches = menuData.path === '/Reports/StockPurchaseConsolidateReport' || menuData.path === '/Inventory/StockPurchaseConsolidateReport' ||
            menuData.path?.toLowerCase().includes('stockpurchaseconsolidatereport');
        const nameMatches = menuData.name?.toLowerCase().includes('stockpurchaseconsolidatereport') ||
            menuData.name?.toLowerCase().includes('stock purchase consolidate report');
        const routeMatches = menuData.reactRoute?.toLowerCase().includes('stockpurchaseconsolidatereport');

        return pathMatches || nameMatches || routeMatches;
    };

    // check if menu item should route to Item wise GST purchase report Page
    const isItemWiseGSTPurchaseReportPage = (menuData) => {
        if (!menuData) return false;
        const pathMatches = menuData.path === '/Reports/StockPurchaseReport' || menuData.path === '/Inventory/ItemWiseGSTPurchaseReport' ||
            menuData.path?.toLowerCase().includes('itemwisegstpurchasereport');
        const nameMatches = menuData.name?.toLowerCase().includes('itemwisegstpurchasereport') ||
            menuData.name?.toLowerCase().includes('item wise gst purchase report');
        const routeMatches = menuData.reactRoute?.toLowerCase().includes('itemwisegstpurchasereport');

        return pathMatches || nameMatches || routeMatches;
    };

    // check if menu item should route to Supplier PO Report Page

    const isSupplierPOReportPage = (menuData) => {
        if (!menuData) return false;
        const pathMatches = menuData.path === '/Reports/SupplierPOReport' || menuData.path === '/Inventory/SupplierPOReport' ||
            menuData.path?.toLowerCase().includes('supplierporeport');
        const nameMatches = menuData.name?.toLowerCase().includes('supplierporeport') ||
            menuData.name?.toLowerCase().includes('supplier po report');
        const routeMatches = menuData.reactRoute?.toLowerCase().includes('supplierporeport');

        return pathMatches || nameMatches || routeMatches;
    };

    // check if menu item should route to SPPO Report Page
    const isSPPOReportPage = (menuData) => {
        if (!menuData) return false;
        const pathMatches = menuData.path === '/Reports/SPPOReport' || menuData.path === '/Inventory/SPPOReport' ||
            menuData.path?.toLowerCase().includes('spporeport');
        const nameMatches = menuData.name?.toLowerCase().includes('spporeport') ||
            menuData.name?.toLowerCase().includes('sp po report');
        const routeMatches = menuData.reactRoute?.toLowerCase().includes('spporeport');

        return pathMatches || nameMatches || routeMatches;
    };

    // check if menu item should route to Company Overall Status Page
    const isCompanyOverallStatusPage = (menuData) => {
        if (!menuData) return false;
        const pathMatches = menuData.path === '/Reports/CompanyOverallStatus' || menuData.path === '/Inventory/CompanyOverallStatus' ||
            menuData.path?.toLowerCase().includes('companyoverallstatus');
        const nameMatches = menuData.name?.toLowerCase().includes('companyoverallstatus') ||
            menuData.name?.toLowerCase().includes('company overall status');
        const routeMatches = menuData.reactRoute?.toLowerCase().includes('companyoverallstatus');

        return pathMatches || nameMatches || routeMatches;
    };
    // check if menu item should route to account status page
    const isAccountStatusPage = (menuData) => {
        if (!menuData) return false;
        const pathMatches = menuData.path === '/Reports/ITStatus' || menuData.path === '/Inventory/AccountStatus' ||
            menuData.path?.toLowerCase().includes('accountstatus');
        const nameMatches = menuData.name?.toLowerCase().includes('accountstatus') ||
            menuData.name?.toLowerCase().includes('account status');
        const routeMatches = menuData.reactRoute?.toLowerCase().includes('accountstatus');

        return pathMatches || nameMatches || routeMatches;
    };

    // check if menu item should route to Stock Reconciliation Page
    const isStockReconciliationPage = (menuData) => {
        if (!menuData) return false;
        const pathMatches = menuData.path === '/Reports/StockReconcilation' || menuData.path === '/Inventory/StockReconciliation' ||
            menuData.path?.toLowerCase().includes('stockreconciliation');
        const nameMatches = menuData.name?.toLowerCase().includes('stockreconciliation') ||
            menuData.name?.toLowerCase().includes('stock reconciliation');
        const routeMatches = menuData.reactRoute?.toLowerCase().includes('stockreconciliation');

        return pathMatches || nameMatches || routeMatches;
    };

    // check if menu item should route to Stock transfer report page
    const isStockTransferReportPage = (menuData) => {
        if (!menuData) return false;
        const pathMatches = menuData.path === '/Reports/TransferReport' || menuData.path === '/Reports/StockTransferReport' ||
            menuData.path?.toLowerCase().includes('stocktransferreport');
        const nameMatches = menuData.name?.toLowerCase().includes('stocktransferreport') ||
            menuData.name?.toLowerCase().includes('stock transfer report');
        const routeMatches = menuData.reactRoute?.toLowerCase().includes('stocktransferreport');

        return pathMatches || nameMatches || routeMatches;
    };

    // check if menu item should route to Closing Stock Report Page
    const isClosingStockReportPage = (menuData) => {
        if (!menuData) return false;
        const pathMatches = menuData.path === '/Reports/UpdateStockCloseReport' || menuData.path === '/Inventory/ClosingStockReport' ||
            menuData.path?.toLowerCase().includes('closingstockreport');
        const nameMatches = menuData.name?.toLowerCase().includes('closingstockreport') ||
            menuData.name?.toLowerCase().includes('closing stock report');
        const routeMatches = menuData.reactRoute?.toLowerCase().includes('closingstockreport');

        return pathMatches || nameMatches || routeMatches;
    };

    // check if menu item should route to View Indents Report Page
    const isViewIndentsReportPage = (menuData) => {
        if (!menuData) return false;
        const pathMatches = menuData.path === '/Reports/ViewIndents' || menuData.path === '/Inventory/ViewIndentsReport' ||
            menuData.path?.toLowerCase().includes('viewindentsreport');
        const nameMatches = menuData.name?.toLowerCase().includes('viewindentsreport') ||
            menuData.name?.toLowerCase().includes('view indents report');
        const routeMatches = menuData.reactRoute?.toLowerCase().includes('viewindentsreport');

        return pathMatches || nameMatches || routeMatches;
    };

    // check if menu item should route to any daily issue items report
    const isDailyIssueItemsReportPage = (menuData) => {
        if (!menuData) return false;
        const pathMatches = menuData.path === '/Reports/ViewIssues' || menuData.path === '/Inventory/DailyIssuedItemsReport' ||
            menuData.path?.toLowerCase().includes('dailyissueditemsreport');
        const nameMatches = menuData.name?.toLowerCase().includes('dailyissueditemsreport') ||
            menuData.name?.toLowerCase().includes('daily issued items report');
        const routeMatches = menuData.reactRoute?.toLowerCase().includes('dailyissueditemsreport');

        return pathMatches || nameMatches || routeMatches;
    };

    // check if menu item should route to Item code report page
    const isItemCodeReportPage = (menuData) => {
        if (!menuData) return false;
        const pathMatches = menuData.path === '/Reports/ViewItemcodes' || menuData.path === '/Inventory/ItemCodeReport' ||
            menuData.path?.toLowerCase().includes('itemcodereport');
        const nameMatches = menuData.name?.toLowerCase().includes('itemcodereport') ||
            menuData.name?.toLowerCase().includes('item code report');
        const routeMatches = menuData.reactRoute?.toLowerCase().includes('itemcodereport');

        return pathMatches || nameMatches || routeMatches;
    };

    // check if menu item should route to Lost Scrap Report Page
    const isLostScrapReportPage = (menuData) => {
        if (!menuData) return false;
        const pathMatches = menuData.path === '/Reports/ViewLostandDamagedItems' || menuData.path === '/Inventory/LostScrapReport' ||
            menuData.path?.toLowerCase().includes('lostscrapreport');
        const nameMatches = menuData.name?.toLowerCase().includes('lostscrapreport') ||
            menuData.name?.toLowerCase().includes('lost scrap report');
        const routeMatches = menuData.reactRoute?.toLowerCase().includes('lostscrapreport');

        return pathMatches || nameMatches || routeMatches;
    };

    // Check if menu item should route to Vendor CMS Payment
    const isVendorCMSPaymentPage = (menuData) => {
        if (!menuData) return false;
        const path  = menuData.path?.toLowerCase()       || '';
        const name  = menuData.name?.toLowerCase()       || '';
        const route = menuData.reactRoute?.toLowerCase() || '';
        return (
            path === '/purchase/vendorcmspayment' ||
            path.includes('vendorcmspayment') ||
            path.includes('savecmsvendorpayment') ||
            path.includes('savendorcmspayment') ||
            name.includes('vendor cms payment') ||
            name.includes('cms vendor payment') ||
            name.includes('cms payment') ||
            route.includes('vendorcmspayment')
        );
    };

    // Check if menu item should route to Vendor TDS Payment
    const isVendorTDSPaymentPage = (menuData) => {
        if (!menuData) return false;
        const path  = menuData.path?.toLowerCase()       || '';
        const name  = menuData.name?.toLowerCase()       || '';
        const route = menuData.reactRoute?.toLowerCase() || '';
        return (
            path === '/purchase/vendortdspayment' ||
            path.includes('vendortdspayment') ||
            path.includes('savetdspayment') ||
            name.includes('vendor tds payment') ||
            name.includes('tds payment') ||
            route.includes('vendortdspayment')
        );
    };

    // Check if menu item should route to Client Bad Debt Receivables
    const isClientBadDebtPage = (menuData) => {
        if (!menuData) return false;
        const path  = menuData.path?.toLowerCase()       || '';
        const name  = menuData.name?.toLowerCase()       || '';
        const route = menuData.reactRoute?.toLowerCase() || '';
        return (
            path === '/accounts/clientbaddebtrecievables' ||
            path.includes('clientbaddebt') ||
            path.includes('baddebtreciev') ||
            name.includes('bad debt') ||
            name.includes('write-off') ||
            name.includes('writeoff') ||
            name.includes('write off receivable') ||
            route.includes('clientbaddebt')
        );
    };

    // Check if menu item should route to Credit / Debit Note
    const isCreditDebitNotePage = (menuData) => {
        if (!menuData) return false;
        const path  = menuData.path?.toLowerCase()       || '';
        const name  = menuData.name?.toLowerCase()       || '';
        const route = menuData.reactRoute?.toLowerCase() || '';
        return (
            path.includes('creditdebitnote') ||
            path.includes('credit debit note') ||
            path.includes('savecreditdebitnote') ||
            path.includes('creditnote') ||
            path.includes('debitnote') ||
            name.includes('credit note') ||
            name.includes('debit note') ||
            name.includes('credit/debit') ||
            name.includes('creditdebitnote') ||
            route.includes('creditdebitnote') ||
            route.includes('creditnote') ||
            route.includes('debitnote')
        );
    };

    // Check if menu item should route to Journal Voucher Creation
    const isJournalVoucherPage = (menuData) => {
        if (!menuData) return false;
        const path  = menuData.path?.toLowerCase()       || '';
        const name  = menuData.name?.toLowerCase()       || '';
        const route = menuData.reactRoute?.toLowerCase() || '';
        return (
            path.includes('journalvoucher') ||
            path.includes('journal voucher') ||
            path.includes('savejournal') ||
            name.includes('journal voucher') ||
            name.includes('journalvoucher') ||
            name.includes('journal entry') ||
            name.includes('jv creation') ||
            name.includes('jvcreation') ||
            route.includes('journalvoucher') ||
            route.includes('journal')
        );
    };

    // Check if menu item should route to BOE Settlement Payment
    const isBOESettlementPage = (menuData) => {
        if (!menuData) return false;
        const path  = menuData.path?.toLowerCase()       || '';
        const name  = menuData.name?.toLowerCase()       || '';
        const route = menuData.reactRoute?.toLowerCase() || '';
        return (
            path === '/purchase/boesettlement' ||
            path.includes('boesettlement') ||
            path.includes('saveboesettelment') ||
            name.includes('boe settlement') ||
            name.includes('bill of exchange settlement') ||
            route.includes('boesettlement')
        );
    };

    // Check if menu item should route to SPPO Vendor Bank Payment
    const isSPPOPaymentPage = (menuData) => {
        if (!menuData) return false;
        const path  = menuData.path?.toLowerCase()       || '';
        const name  = menuData.name?.toLowerCase()       || '';
        const route = menuData.reactRoute?.toLowerCase() || '';
        return (
            path === '/purchase/sppopayments' ||
            path.includes('purchase/sppopayment') ||
            path.includes('savenewsppoinvoice') ||
            name.includes('vendor bank payment') ||
            name.includes('sppo payment') ||
            name.includes('vendor payment from bank') ||
            route.includes('sppopayment')
        );
    };

    // Check if menu item should route to LC/BG Creation Page
    const isLCBGCreationPage = (menuData) => {
        if (!menuData) return false;
        const path = menuData.path?.toLowerCase() || '';
        const name = menuData.name?.toLowerCase() || '';
        const route = menuData.reactRoute?.toLowerCase() || '';
        return (
            path === '/purchase/lcbgcreation' ||
            path.includes('purchase/lcbgcreation') ||
            path.includes('savelcbgdata') || path.includes('lc bg') ||
            name.includes('lc creation') || name.includes('bg creation') ||
            name.includes('lcbg creation') || name.includes('letter of credit') ||
            name.includes('bank guarantee') || name.includes('lc/bg') ||
            route.includes('lcbgcreation') || route.includes('savelcbg')
        );
    };

    // Check if menu item should route to Unsecured Loan page
    const isUnsecuredLoanPage = (menuData) => {
        if (!menuData) return false;
        const path  = menuData.path?.toLowerCase()       || '';
        const name  = menuData.name?.toLowerCase()       || '';
        const route = menuData.reactRoute?.toLowerCase() || '';
        return (
            path === '/accounts/newunsecuredloan' ||
            path.includes('newunsecuredloan') ||
            path.includes('unsecuredloan') ||
            path.includes('saveunsecuredloan') ||
            name.includes('unsecured loan') ||
            name.includes('unsecuredloan') ||
            route.includes('newunsecuredloan') ||
            route.includes('unsecuredloan')
        );
    };

    // Check if menu item should route to Term Loan Creation page
    const isTermLoanCreationPage = (menuData) => {
        if (!menuData) return false;
        const path  = menuData.path?.toLowerCase()       || '';
        const name  = menuData.name?.toLowerCase()       || '';
        const route = menuData.reactRoute?.toLowerCase() || '';
        return (
            path === '/accounts/termloan' ||
            path === '/accounts/termloancreation' ||
            path.includes('termloancreation') ||
            path.includes('savetldetails') ||
            name === 'term loan creation' ||
            name.includes('termloancreation') ||
            route.includes('termloancreation')
        );
    };

    // Check if menu item should route to Term Loan Payment page
    const isTermLoanPaymentPage = (menuData) => {
        if (!menuData) return false;
        const path  = menuData.path?.toLowerCase()       || '';
        const name  = menuData.name?.toLowerCase()       || '';
        const route = menuData.reactRoute?.toLowerCase() || '';
        return (
            path === '/accounts/tlpayments' ||
            path.includes('tlpayments') ||
            path.includes('savetermloanpayment') ||
            name === 'term loan repayment' ||
            name === 'tl repayment' ||
            name === 'tl payment' ||
            name.includes('tlpayment') ||
            route.includes('tlpayments')
        );
    };

    // Check if menu item should route to Agency Creation page
    const isAgencyCreationPage = (menuData) => {
        if (!menuData) return false;
        const path  = menuData.path?.toLowerCase()       || '';
        const name  = menuData.name?.toLowerCase()       || '';
        const route = menuData.reactRoute?.toLowerCase() || '';
        return (
            path === '/accounts/saveagency' ||
            path === '/accounts/agencycreation' ||
            path.includes('saveagency') ||
            path.includes('agencycreation') ||
            name === 'term loan agency' ||
            name === 'agency creation' ||
            name.includes('tl agency') ||
            name.includes('loan agency') ||
            route.includes('agencycreation') ||
            route.includes('saveagency')
        );
    };

    // Check if menu item should route to Labour Rule Configuration page
    const isLabourRuleConfigPage = (menuData) => {
        if (!menuData) return false;
        const path  = menuData.path?.toLowerCase()       || '';
        const name  = menuData.name?.toLowerCase()       || '';
        const route = menuData.reactRoute?.toLowerCase() || '';
        return (
            path.includes('labourruleconfig') ||
            path.includes('labourconfig') ||
            path.includes('labourwageconfig') ||
            name.includes('labour rule config') ||
            name.includes('labourruleconfig') ||
            name.includes('labour config') ||
            name.includes('labour rule') ||
            name.includes('wage config') ||
            name.includes('min wage config') ||
            route.includes('labourruleconfig') ||
            route.includes('labourconfig')
        );
    };

    // Check if menu item should route to LC/BG Amendment/Closure page
    const isLCBGAmendPage = (menuData) => {
        if (!menuData) return false;
        const path  = menuData.path?.toLowerCase()       || '';
        const name  = menuData.name?.toLowerCase()       || '';
        const route = menuData.reactRoute?.toLowerCase() || '';
        return (
            path === '/purchase/lcbgamend' ||
            path.includes('lcbgamend') ||
            path.includes('savelcbgamenddata') ||
            name.includes('lc/bg amend') ||
            name.includes('lcbg amend') ||
            name.includes('lc bg amend') ||
            name.includes('lc/bg amendment') ||
            name.includes('lc/bg close') ||
            name.includes('lcbg amendment') ||
            name.includes('lcbg closure') ||
            route.includes('lcbgamend')
        );
    };

    // check if menu item should route to any LCBG status report
    const isLCBGStatusReportPage = (menuData) => {
        if (!menuData) return false;
        const pathMatches = menuData.path === '/Reports/LCBGStatusReport' || menuData.path === '/Inventory/LCBGStatusReport' ||
            menuData.path?.toLowerCase().includes('lcbgstatusreport');
        const nameMatches = menuData.name?.toLowerCase().includes('lcbgstatusreport') ||
            menuData.name?.toLowerCase().includes('lcbg status report');
        const routeMatches = menuData.reactRoute?.toLowerCase().includes('lcbgstatusreport');

        return pathMatches || nameMatches || routeMatches;
    };

    // check if menu item should route to stock summary page
    const isStockSummaryPage = (menuData) => {
        if (!menuData) return false;
        const pathMatches = menuData.path === '/Reports/StockSummary' || menuData.path === '/Inventory/StockSummary' ||
            menuData.path?.toLowerCase().includes('stocksummary');
        const nameMatches = menuData.name?.toLowerCase().includes('stocksummary') ||
            menuData.name?.toLowerCase().includes('stock summary');
        const routeMatches = menuData.reactRoute?.toLowerCase().includes('stocksummary');

        return pathMatches || nameMatches || routeMatches;
    };

    // check if menu item should route to any Unsecured Loan Report Page
    const isUnsecuredLoanReportPage = (menuData) => {
        if (!menuData) return false;
        const pathMatches = menuData.path === '/Reports/UnsecuredLoanReport' || menuData.path === '/Inventory/UnsecuredLoanReport' ||
            menuData.path?.toLowerCase().includes('unsecuredloanreport');
        const nameMatches = menuData.name?.toLowerCase().includes('unsecuredloanreport') ||
            menuData.name?.toLowerCase().includes('unsecured loan report');
        const routeMatches = menuData.reactRoute?.toLowerCase().includes('unsecuredloanreport');

        return pathMatches || nameMatches || routeMatches;
    };

    // check if menu item should route to any cms payment report page
    const isCMSPaymentReportPage = (menuData) => {
        if (!menuData) return false;
        const pathMatches = menuData.path === '/HR/CMSPayReport' || menuData.path === '/HR/CMSPayReport?Type=Staff' ||
            menuData.path?.toLowerCase().includes('cmspaymentreport');
        const nameMatches = menuData.name?.toLowerCase().includes('cmspaymentreport') ||
            menuData.name?.toLowerCase().includes('cms payment report');
        const routeMatches = menuData.reactRoute?.toLowerCase().includes('cmspaymentreport');

        return pathMatches || nameMatches || routeMatches;
    };


    // Staff Attendance Entry Page (/HR/StaffAttendance?Type=Staff)
    const isStaffAttendanceEntryPage = (menuData) => {
        if (!menuData) return false;
        const pathMatches = menuData.path === '/HR/StaffAttendance?Type=Staff' ||
            menuData.path === '/HR/StaffAttendance' ||
            (menuData.path?.toLowerCase().includes('staffattendance') &&
             !menuData.path?.toLowerCase().includes('view') &&
             !menuData.path?.toLowerCase().includes('report'));
        const nameMatches = menuData.name?.toLowerCase().includes('staff attendance entry') ||
            menuData.name?.toLowerCase() === 'staff attendance';
        const routeMatches = menuData.reactRoute?.toLowerCase().includes('staffattendanceentry');
        return pathMatches || nameMatches || routeMatches;
    };

    // check if menu item should route to any staff attendance report page
    const isStaffAttendanceReportPage = (menuData) => {
        if (!menuData) return false;
        const pathMatches = menuData.path === '/HR/StaffAttendenceView' ||
            menuData.path?.toLowerCase().includes('staffattendancereport');
        const nameMatches = menuData.name?.toLowerCase().includes('staffattendancereport') ||
            menuData.name?.toLowerCase().includes('staff attendance report');
        const routeMatches = menuData.reactRoute?.toLowerCase().includes('staffattendancereport');
        return pathMatches || nameMatches || routeMatches;
    };

    // check Payrollreport page  -- this is the testing of LeagcyPageWrapper page  


    // const isPayRollReportPage = (menuData) => {
    //     if (!menuData) return false;

    //     const pathMatches = menuData.path === '/HR/PayRollReport' ||
    //         menuData.path?.toLowerCase().includes('payrollreport');
    //     const nameMatches = menuData.name?.toLowerCase().includes('payrollreport') ||
    //         menuData.name?.toLowerCase().includes('payroll report') ||
    //         menuData.name?.toLowerCase().includes('pay roll');
    //     const routeMatches = menuData.reactRoute?.toLowerCase().includes('payrollreport');

    //     return pathMatches || nameMatches || routeMatches;
    // };

    // check Employee Exit Report Page
    const isEmployeeExitReportPage = (menuData) => {
        if (!menuData) return false;
        const pathMatches = menuData.path === '/HR/ExitReport?Type=Staff' ||
            menuData.path?.toLowerCase().includes('employeeexitreport');
        const nameMatches = menuData.name?.toLowerCase().includes('employeeexitreport') ||
            menuData.name?.toLowerCase().includes('employee exit report');
        const routeMatches = menuData.reactRoute?.toLowerCase().includes('employeeexitreport');


        return pathMatches || nameMatches || routeMatches;


    };


    // check Leave Report Page 
    const isLeaveReportPage = (menuData) => {
        if (!menuData) return false;
        const pathMatches = menuData.path === '/HR/LeaveReport' ||
            menuData.path?.toLowerCase().includes('leavereport');
        const nameMatches = menuData.name?.toLowerCase().includes('leavereport') ||
            menuData.name?.toLowerCase().includes('leave report');
        const routeMatches = menuData.reactRoute?.toLowerCase().includes('leavereport');
        return pathMatches || nameMatches || routeMatches;
    };



   // Main menu function link starts here

    const isIndentCreation = (menuData) => {
        if (!menuData) return false;
        return menuData.path === '/Purchase/IndentCreation' ||
            menuData.path?.toLowerCase().includes('indentcreation') ||
            menuData.name?.toLowerCase().includes('indent creation') ||
            menuData.name?.toLowerCase().includes('indentcreation') ||
            menuData.name?.toLowerCase().includes('create indent') ||
            menuData.reactRoute?.toLowerCase().includes('indentcreation');
    };

    const isSupplierPOCreation = (menuData) => {
        if (!menuData) return false;
        const path = menuData.path?.toLowerCase() || '';
        const name = menuData.name?.toLowerCase() || '';
        const route = menuData.reactRoute?.toLowerCase() || '';
        return path.includes('/purchase/supplierpocreation') ||
            path.includes('supplierpocreation') ||
            name.includes('supplier po creation') ||
            name.includes('supplierpocreation') ||
            name.includes('create supplier po') ||
            route.includes('supplierpocreation');
    };

   const costCenterCreation = (menuData) => {
        if (!menuData) return false;    
        const pathMatches = menuData.path === '/Home/CostCenter' ||
            menuData.path?.toLowerCase().includes('costcentercreationmanagement');
        const nameMatches = menuData.name?.toLowerCase().includes('costcentercreationmanagement') ||

            menuData.name?.toLowerCase().includes('cost center creation management');
        const routeMatches = menuData.reactRoute?.toLowerCase().includes('costcentercreationmanagement');
        return pathMatches || nameMatches || routeMatches;
    };


    const isDividedDeclarationPage = (menuData) => {
        if (!menuData) return false;    
        const pathMatches = menuData.path === '/Accounts/DividendDeclaration' ||
            menuData.path?.toLowerCase().includes('dividendeclaration');
        const nameMatches = menuData.name?.toLowerCase().includes('dividendeclaration') ||

            menuData.name?.toLowerCase().includes('dividend declaration');
        const routeMatches = menuData.reactRoute?.toLowerCase().includes('dividendeclaration');
        return pathMatches || nameMatches || routeMatches;
    };

    const isDividendDistributionPage = (menuData) => {
        if (!menuData) return false;
        const pathMatches = menuData.path === '/Accounts/DividendDistribution' ||
            menuData.path?.toLowerCase().includes('dividenddistribution');
        const nameMatches = menuData.name?.toLowerCase().includes('dividenddistribution') ||
            menuData.name?.toLowerCase().includes('dividend distribution');
        const routeMatches = menuData.reactRoute?.toLowerCase().includes('dividenddistribution');
        return pathMatches || nameMatches || routeMatches;
    };

    const isDividendBankPaymentPage = (menuData) => {
        if (!menuData) return false;
        const pathMatches = menuData.path === '/Accounts/DividendPayment' ||
            menuData.path?.toLowerCase().includes('dividendbankpayment');
        const nameMatches = menuData.name?.toLowerCase().includes('dividendbankpayment') ||
            menuData.name?.toLowerCase().includes('dividend bank payment');
        const routeMatches = menuData.reactRoute?.toLowerCase().includes('dividendbankpayment');
        return pathMatches || nameMatches || routeMatches;
    };

    const isStaffPFandESIReportPage = (menuData) => {
        if (!menuData) return false;
        const pathMatches = menuData.path === '/HR/PFESIReport?Type=Staff' ||
            menuData.path?.toLowerCase().includes('pfandesipaymentreport');
        const nameMatches = menuData.name?.toLowerCase().includes('pfandesipaymentreport') ||
            menuData.name?.toLowerCase().includes('pf and esi payment report');
        const routeMatches = menuData.reactRoute?.toLowerCase().includes('pfandesipaymentreport');
        return pathMatches || nameMatches || routeMatches;
    }

    const isLabourPFandESIReportPage = (menuData) => {
        if (!menuData) return false;
        const pathMatches = menuData.path === '/HR/PFESIReport?Type=Labour' ||
            menuData.path?.toLowerCase().includes('pfandesilabourreport');
        const nameMatches = menuData.name?.toLowerCase().includes('pfandesilabourreport') ||
            menuData.name?.toLowerCase().includes('pf and esi labour report');
        const routeMatches = menuData.reactRoute?.toLowerCase().includes('pfandesilabourreport');
        return pathMatches || nameMatches || routeMatches;
    }

    const isStaffSalaryReportPage = (menuData) => {
        if (!menuData) return false;
        const pathMatches = menuData.path === '/HR/PayRollReport?Type=Staff' ||
            menuData.path?.toLowerCase().includes('staffsalaryreport');
        const nameMatches = menuData.name?.toLowerCase().includes('staffsalaryreport') ||
            menuData.name?.toLowerCase().includes('staff salary report');
        const routeMatches = menuData.reactRoute?.toLowerCase().includes('staffsalaryreport');
        return pathMatches || nameMatches || routeMatches;
    }
    const isLabourSalaryReportPage = (menuData) => {
        if (!menuData) return false;
        const pathMatches = menuData.path === '/HR/PayRollReport?Type=Labour' ||
            menuData.path?.toLowerCase().includes('laboursalaryreport');
        const nameMatches = menuData.name?.toLowerCase().includes('laboursalaryreport') ||
            menuData.name?.toLowerCase().includes('labour salary report');
        const routeMatches = menuData.reactRoute?.toLowerCase().includes('laboursalaryreport');
        return pathMatches || nameMatches || routeMatches;
    }

    const isStaffReportPage = (menuData) => {
        if (!menuData) return false;
        const pathMatches = menuData.path === '/HR/StaffDetailsView' ||
            menuData.path?.toLowerCase().includes('staffreport');
        const nameMatches = menuData.name?.toLowerCase().includes('staffreport') ||
            menuData.name?.toLowerCase().includes('staff report');
        const routeMatches = menuData.reactRoute?.toLowerCase().includes('staffreport');
        return pathMatches || nameMatches || routeMatches;
    }

    const isLabourReportPage = (menuData) => {
        if (!menuData) return false;
        return menuData.path?.toLowerCase().includes('getlaboursfor') ||
            menuData.path?.toLowerCase().includes('labourreport') ||
            menuData.name?.toLowerCase().includes('labour report') ||
            menuData.name?.toLowerCase().includes('labourreport') ||
            menuData.reactRoute?.toLowerCase().includes('labourreport');
    }

    const isLabourAttendanceReportPage = (menuData) => {
        if (!menuData) return false;
        return menuData.path === '/HR/LabourAttendenceView' ||
            menuData.path?.toLowerCase().includes('labourattendancereport') ||
            menuData.path?.toLowerCase().includes('getlabourattdata') ||
            menuData.name?.toLowerCase().includes('labour attendance report') ||
            menuData.name?.toLowerCase().includes('labourattendancereport') ||
            menuData.reactRoute?.toLowerCase().includes('labourattendancereport');
    };

    const isLTAReportPage = (menuData) => {
        if (!menuData) return false;
        return menuData.path?.toLowerCase().includes('ltareport') ||
            menuData.path?.toLowerCase().includes('ltarequestror') ||
            menuData.name?.toLowerCase().includes('lta report') ||
            menuData.name?.toLowerCase().includes('ltareport') ||
            menuData.reactRoute?.toLowerCase().includes('ltareport');
    };

    const isStaffCTCReportPage = (menuData) => {
        if (!menuData) return false;
        const pathMatches = menuData.path === '/HR/PayRollStructureReport' ||
            menuData.path?.toLowerCase().includes('staffctcreport');
        const nameMatches = menuData.name?.toLowerCase().includes('staffctcreport') ||
            menuData.name?.toLowerCase().includes('staff ctc report');
        const routeMatches = menuData.reactRoute?.toLowerCase().includes('staffctcreport');
        return pathMatches || nameMatches || routeMatches;
    }

    const isStaffCMSPayCreationPage = (menuData) => {
        if (!menuData) return false;
        const pathMatches = menuData.path === '/HR/CMSPaymentFormat' ||
            menuData.path?.toLowerCase().includes('staffcmspaycreation');
        const nameMatches = menuData.name?.toLowerCase().includes('staffcmspaycreation') ||
            menuData.name?.toLowerCase().includes('staff cms pay creation');
        const routeMatches = menuData.reactRoute?.toLowerCase().includes('staffcmspaycreation');
        return pathMatches || nameMatches || routeMatches;
    }

    const isLabourCMSPayCreationPage = (menuData) => {
        if (!menuData) return false;
        return menuData.path === '/HR/LBCMSPayment' ||
            menuData.path?.toLowerCase().includes('lbcmspayment') ||
            menuData.name?.toLowerCase().includes('labour cms') ||
            menuData.name?.toLowerCase().includes('labourcms') ||
            menuData.reactRoute?.toLowerCase().includes('lbcmspayment');
    }

    const isStaffPayrollCreationPage = (menuData) => {
        if (!menuData) return false;
        const pathMatches = menuData.path === '/HR/EmployeeWisePayRollGenration' ||
            menuData.path?.toLowerCase().includes('staffpayrollcreation');
        const nameMatches = menuData.name?.toLowerCase().includes('staffpayrollcreation') ||
            menuData.name?.toLowerCase().includes('staff payroll creation');
        const routeMatches = menuData.reactRoute?.toLowerCase().includes('staffpayrollcreation');
        return pathMatches || nameMatches || routeMatches;
    }   

    const isLabourPayrollGenerationPage = (menuData) => {
        if (!menuData) return false;
        const pathMatches = menuData.path === '/HR/LabourPayRollGeneration' ||
            menuData.path?.toLowerCase().includes('labourpayrollgeneration');
        const nameMatches = menuData.name?.toLowerCase().includes('labourpayrollgeneration') ||
            menuData.name?.toLowerCase().includes('labour payroll generation');
        const routeMatches = menuData.reactRoute?.toLowerCase().includes('labourpayrollgeneration');
        return pathMatches || nameMatches || routeMatches;
    }

    const isLabourBankChangePage = (menuData) => {
        if (!menuData) return false;
        const pathMatches = menuData.path === '/HR/LabourBankChange' ||
            menuData.path?.toLowerCase().includes('labourbankchange');
        const nameMatches = menuData.name?.toLowerCase().includes('labourbankchange') ||
            menuData.name?.toLowerCase().includes('labour bank change');
        const routeMatches = menuData.reactRoute?.toLowerCase().includes('labourbankchange');
        return pathMatches || nameMatches || routeMatches;
    }

    const isLabourTypeChangePage = (menuData) => {
        if (!menuData) return false;
        const pathMatches = menuData.path === '/HR/LabourTypeChange' ||
            menuData.path?.toLowerCase().includes('labourtypechange');
        const nameMatches = menuData.name?.toLowerCase().includes('labourtypechange') ||
            menuData.name?.toLowerCase().includes('labour type change');
        const routeMatches = menuData.reactRoute?.toLowerCase().includes('labourtypechange');
        return pathMatches || nameMatches || routeMatches;
    }

    const isStaffSalaryDeductionandArrear = (menuData) => {
        if (!menuData) return false;
        const pathMatches = menuData.path === '/HR/SalaryDeductions?Type=Staff' ||  
            menuData.path?.toLowerCase().includes('staffsalarydeductionandarrear');
        const nameMatches = menuData.name?.toLowerCase().includes('staffsalarydeductionandarrear') ||
            menuData.name?.toLowerCase().includes('staff salary deduction and arrear');
        const routeMatches = menuData.reactRoute?.toLowerCase().includes('staffsalarydeductionandarrear');
        return pathMatches || nameMatches || routeMatches;
    }

    const isStaffRegistrationPage = (menuData) => {
        if (!menuData) return false;
        const pathMatches = menuData.path === '/HR/EmployeeRegistration' ||
            menuData.path?.toLowerCase().includes('staffregistration');
        const nameMatches = menuData.name?.toLowerCase().includes('staffregistration') ||
            menuData.name?.toLowerCase().includes('staff registration');
        const routeMatches = menuData.reactRoute?.toLowerCase().includes('staffregistration');
        return pathMatches || nameMatches || routeMatches;
    }

    const isBulkWorkerRegistrationPage = (menuData) => {
        if (!menuData) return false;
        const pathMatches = menuData.path === '/HR/WorkerStaffRegistration' ||
            menuData.path?.toLowerCase().includes('workerstaffregistration');
        const nameMatches = menuData.name?.toLowerCase().includes('bulk worker') ||
            menuData.name?.toLowerCase().includes('bulkworker') ||
            menuData.name?.toLowerCase().includes('bulk labour');
        const routeMatches = menuData.reactRoute?.toLowerCase().includes('workerstaffregistration');
        return pathMatches || nameMatches || routeMatches;
    }

    const isEmployeeTransferPage = (menuData) => {
        if (!menuData) return false;
        const pathMatches = menuData.path === '/HR/EmployeeTransfer' ||
            menuData.path?.toLowerCase().includes('employeetransfer');
        const nameMatches = menuData.name?.toLowerCase().includes('employeetransfer') ||
            menuData.name?.toLowerCase().includes('employee transfer');
        const routeMatches = menuData.reactRoute?.toLowerCase().includes('employeetransfer');
        return pathMatches || nameMatches || routeMatches;
    }











    // Check if this menu item should show PayRoll Report Page
    // if (currentMenuData && isPayRollReportPage(currentMenuData)) {
    //     console.log('✅ Rendering PayRollReportPage (Legacy) for:', currentMenuData.name);
    //     return <LegacyPageWrapper menuData={currentMenuData} onNavigate={handleNavigation} />;
    // }

    // Check if menu item should route to any Budget related functionality
    const isBudgetModule = (menuData) => {
        if (!menuData) return false;

        const pathMatches = menuData.path?.toLowerCase().includes('budget');
        const nameMatches = menuData.name?.toLowerCase().includes('budget');
        const sectionMatches = menuData.li?.toLowerCase().includes('budget') ||
            menuData.type?.toLowerCase().includes('budget');

        return pathMatches || nameMatches || sectionMatches;
    };


    const isLegacyPage = (menuData) => {
        if (!menuData) return false;

        // Mark as legacy if it has a specific flag or hasn't been implemented yet
        return menuData.isLegacy === true ||
            menuData.useLegacyPage === true ||
            menuData.reactRoute === null;
    };



    // Render content based on current page
    const renderPageContent = () => {
        if (currentPage === 'dashboard') {
            return (
                <DashboardContent
                    onNavigate={handleNavigation}
                    linkFrequency={linkFrequency}
                    trackMenuUsage={trackMenuUsage}
                />
            );
        }
        if (currentMenuData && isInboxItem(currentMenuData)) {
            console.log('✅ Routing to InboxRouter for notification:', {
                inboxTitle: currentMenuData.InboxTitle,
                moduleDisplayName: currentMenuData.ModuleDisplayName,
                navigationPath: currentMenuData.NavigationPath,
                type: currentMenuData.type
            });
            return <InboxRouter notificationData={currentMenuData} onNavigate={handleNavigation} />;
        }

        // Check if this menu item should show BasicBusinessInfoSetup
        if (currentMenuData && isBasicBusinessInfoSetup(currentMenuData)) {
            console.log('✅ Rendering BasicBusinessInfoSetup for:', currentMenuData.name);
            return <BasicBusinessInfoSetup menuData={currentMenuData} />;
        }

        // Check if this menu item should show Accrued Interest Report
        if (currentMenuData && isAccruedInterestReport(currentMenuData)) {
            console.log('✅ Rendering AccruedInterestReport for:', currentMenuData.name);
            return <AccruedInterestReport menuData={currentMenuData} />;
        }

        // Check if this menu item should show Budget Report
        if (currentMenuData && isBudgetReport(currentMenuData)) {
            console.log('✅ Rendering BudgetReport for:', currentMenuData.name);
            return <BudgetReport menuData={currentMenuData} />;
        }

        // Check if this menu item should show Bank Statement Page
        if (currentMenuData && isBankStatementPage(currentMenuData)) {
            console.log('✅ Rendering BankStatementPage for:', currentMenuData.name);
            return <BankStatementPage menuData={currentMenuData} />;
        }

        // Check if this menu item should show Bank Details Page
        if (currentMenuData && isBankDetailsPage(currentMenuData)) {
            console.log('✅ Rendering BankDetailsPage for:', currentMenuData.name);
            return <BankDetailsPage menuData={currentMenuData} />;
        }

        // Check if this menu item should show Client PO Report Page
        if (currentMenuData && isClientPOReportPage(currentMenuData)) {
            console.log('✅ Rendering ClientPOReportPage for:', currentMenuData.name);
            return <ClientPOReportPage menuData={currentMenuData} />;
        }

        // Check if this menu item should show Transaction Log Page
        if (currentMenuData && isTransactionLogPage(currentMenuData)) {
            console.log('✅ Rendering TransactionLogPage for:', currentMenuData.name);
            return <TransactionLogPage menuData={currentMenuData} />;
        }
        // Check if this menu item should show Term Loan Report Page
        if (currentMenuData && isTermLoanReportPage(currentMenuData)) {
            console.log('✅ Rendering TermLoanReportPage for:', currentMenuData.name);
            return <TermLoanReportPage menuData={currentMenuData} />;
        }
        // Check if this menu item should show Asset Depreciation Report Page
        if (currentMenuData && isAssetDepreciationReportPage(currentMenuData)) {
            console.log('✅ Rendering AssetDepreciationReportPage for:', currentMenuData.name);
            return <AssetDepreciationReportPage menuData={currentMenuData} />;
        }
        // Check if this menu item should show Asset Sales Report Page
        if (currentMenuData && isAssetSalesReportPage(currentMenuData)) {
            console.log('✅ Rendering AssetSalesReportPage for:', currentMenuData.name);
            return <AssetSalesReportPage menuData={currentMenuData} />;
        }

        // Check if this menu item should show View Current Stock Page
        if (currentMenuData && isViewCurrentStockPage(currentMenuData)) {
            console.log('✅ Rendering ViewCurrentStockPage for:', currentMenuData.name);
            return <ViewCurrentStockPage menuData={currentMenuData} />;
        }
        // Check if this menu item should show Supplier PO Status Page
        if (currentMenuData && isSupplierPOStatusPage(currentMenuData)) {
            console.log('✅ Rendering SupplierPOStatusPage for:', currentMenuData.name);
            return <SupplierPOStatusPage menuData={currentMenuData} />;
        }
        // Check if this menu item should show Scrap Wallet Report Page
        if (currentMenuData && isScrapWalletReportPage(currentMenuData)) {
            console.log('✅ Rendering ScrapWalletReportPage for:', currentMenuData.name);
            return <ScrapWalletReportPage menuData={currentMenuData} />;
        }
        // Check if this menu item should show Gst consolidated purchase report Page
        if (currentMenuData && isGstConsolidatedPurchaseReportPage(currentMenuData)) {
            console.log('✅ Rendering GstConsolidatedPurchaseReportPage for:', currentMenuData.name);
            return <ConsolidatedGSTReportPage menuData={currentMenuData} />;
        }
        // Check if this menu item should show Item wise GST purchase report Page
        if (currentMenuData && isItemWiseGSTPurchaseReportPage(currentMenuData)) {
            return <ItemWiseGSTReportPage menuData={currentMenuData} />;
        }

        // Check if this menu item should show Supplier PO Report Page
        if (currentMenuData && isSupplierPOReportPage(currentMenuData)) {
            console.log('✅ Rendering SupplierPOReportPage for:', currentMenuData.name);
            return <SupplierPOReportPage menuData={currentMenuData} />;
        }
        // Check if this menu item should show SPPO Report Page
        if (currentMenuData && isSPPOReportPage(currentMenuData)) {
            console.log('✅ Rendering SPPOReportPage for:', currentMenuData.name);
            return <SPPOReportPage menuData={currentMenuData} />;
        }
        // Check if this menu item should show Company Overall Status Page
        if (currentMenuData && isCompanyOverallStatusPage(currentMenuData)) {
            console.log('✅ Rendering CompanyOverallStatusPage for:', currentMenuData.name);
            return <CompanyOverallStatusPage menuData={currentMenuData} />;
        }
        // Check if this menu item should show Account Status Page
        if (currentMenuData && isAccountStatusPage(currentMenuData)) {
            console.log('✅ Rendering AccountStatusPage for:', currentMenuData.name);
            return <AccountStatusPage menuData={currentMenuData} />;
        }
        // Check if this menu item should show Stock Reconciliation Page
        if (currentMenuData && isStockReconciliationPage(currentMenuData)) {
            console.log('✅ Rendering StockReconciliationPage for:', currentMenuData.name);
            return <StockReconciliationPage menuData={currentMenuData} />;
        }
        // Check if this menu item should route to Stock Transfer Report Page
        if (currentMenuData && isStockTransferReportPage(currentMenuData)) {
            console.log('✅ Rendering StockTransferReportPage for:', currentMenuData.name);
            return <StockTransferReportPage menuData={currentMenuData} />;
        }
        // Check if this menu item should route to Closing Stock Report Page
        if (currentMenuData && isClosingStockReportPage(currentMenuData)) {
            console.log('✅ Rendering ClosingStockReportPage for:', currentMenuData.name);
            return <ClosingStockReportPage menuData={currentMenuData} />;
        }
        // Check if this menu item should route to View Indents Report Page
        if (currentMenuData && isViewIndentsReportPage(currentMenuData)) {
            console.log('✅ Rendering ViewIndentsReportPage for:', currentMenuData.name);
            return <ViewIndentsReportPage menuData={currentMenuData} />;
        }
        // Check if this menu item should route to Daily Issue Items Report Page
        if (currentMenuData && isDailyIssueItemsReportPage(currentMenuData)) {
            console.log('✅ Rendering DailyIssueItemsReportPage for:', currentMenuData.name);
            return <DailyIssuedItemsReportPage menuData={currentMenuData} />;
        }
        // Check if this menu item should route to Item Code Report Page
        if (currentMenuData && isItemCodeReportPage(currentMenuData)) {
            console.log('✅ Rendering ItemCodeReportPage for:', currentMenuData.name);
            return <ItemCodeReportPage menuData={currentMenuData} />;
        }
        // Check if this menu item should route to Lost Scrap Report Page
        if (currentMenuData && isLostScrapReportPage(currentMenuData)) {
            console.log('✅ Rendering LostScrapReportPage for:', currentMenuData.name);
            return <LostScrapReportPage menuData={currentMenuData} />;
        }
        // Check if this menu item should route to LCBG Status Report Page
        if (currentMenuData && isLCBGStatusReportPage(currentMenuData)) {
            console.log('✅ Rendering LCBGStatusReportPage for:', currentMenuData.name);
            return <LCBGStatusReportPage menuData={currentMenuData} />;
        }

        // Check if this menu item should route to Stock Summary Page
        if (currentMenuData && isStockSummaryPage(currentMenuData)) {
            console.log('✅ Rendering StockSummaryPage for:', currentMenuData.name);
            return <StockSummaryPage menuData={currentMenuData} />;
        }
        // Check if this menu item should route to Unsecured Loan Report Page
        if (currentMenuData && isUnsecuredLoanReportPage(currentMenuData)) {
            console.log('✅ Rendering UnsecuredLoanReportPage for:', currentMenuData.name);
            return <UnsecuredLoanReportPage menuData={currentMenuData} />;
        }
        // Check if this menu item should route to CMS Payment Report Page
        if (currentMenuData && isCMSPaymentReportPage(currentMenuData)) {
            console.log('✅ Rendering CMSPaymentReportPage for:', currentMenuData.name);
            return <StaffCMSPaymentReportPage menuData={currentMenuData} />;
        }
        // Staff Attendance Entry Page
        if (currentMenuData && isStaffAttendanceEntryPage(currentMenuData)) {
            console.log('✅ Rendering StaffAttendance Entry for:', currentMenuData.name);
            return <StaffAttendance menuData={currentMenuData} />;
        }

        // Check if this menu item should route to Staff Attendance Report Page
        if (currentMenuData && isStaffAttendanceReportPage(currentMenuData)) {
            console.log('✅ Rendering StaffAttendanceReportPage for:', currentMenuData.name);
            return <StaffAttendanceReportPage menuData={currentMenuData} />;
        }

        // Check if this menu item should show Employee Exit Report Page
        if (currentMenuData && isEmployeeExitReportPage(currentMenuData)) {
            console.log('✅ Rendering EmployeeExitReportPage for:', currentMenuData.name);
            return <EmployeeExitReportPage menuData={currentMenuData} />;
        }
        // Check if this menu item should show Leave Report Page
        if (currentMenuData && isLeaveReportPage(currentMenuData)) {
            console.log('✅ Rendering LeaveReportPage for:', currentMenuData.name);
            return <LeaveReportPage menuData={currentMenuData} />;
        }
        
        // Check if this menu item should show Cost Center Creation Management Page
        if (currentMenuData && costCenterCreation(currentMenuData)) {
            console.log('✅ Rendering CostCenterCreationManagementPage for:', currentMenuData.name);
            return <CostCenterCreationManagement   menuData={currentMenuData} />;
        }

        // check if the menu item should show divided declearation page
        if (currentMenuData && isDividedDeclarationPage(currentMenuData)) {
            console.log('✅ Rendering DividedDeclarationPage for:', currentMenuData.name);
            return <DividendDeclarationCreate menuData={currentMenuData} />;
        }
        // check if the menu item should show dividend distribution page
        if (currentMenuData && isDividendDistributionPage(currentMenuData)) {
            console.log('✅ Rendering DividendDistributionPage for:', currentMenuData.name);
            return <DividendDistributionCreate menuData={currentMenuData} />;
        }   

        // check if the menu item should show dividend bank payment page
        if (currentMenuData && isDividendBankPaymentPage(currentMenuData)) {
            console.log('✅ Rendering DividendBankPaymentPage for:', currentMenuData.name);
            return <DividendBankPaymentCreate menuData={currentMenuData} />;
        }

        // check if the menu item should show staff PF and ESI payment report page
        if (currentMenuData && isStaffPFandESIReportPage(currentMenuData)) {
            console.log('✅ Rendering StaffPFandESIPaymentReportPage for:', currentMenuData.name);
            return <StaffPFESIReportPage menuData={currentMenuData} />;
        }

        // check if the menu item should show labour PF and ESI payment report page
        if (currentMenuData && isLabourPFandESIReportPage(currentMenuData)) {
            console.log('✅ Rendering LabourPFandESIPaymentReportPage for:', currentMenuData.name);
            return <LabourPFESIReportPage menuData={currentMenuData} />;
        }

        // check if the menu item should show staff salary report page
        if (currentMenuData && isStaffSalaryReportPage(currentMenuData)) {
            console.log('✅ Rendering StaffSalaryReportPage for:', currentMenuData.name);
            return <StaffSalaryReportPage menuData={currentMenuData} />;
        }

        // check if the menu item should show labour salary report page
        if (currentMenuData && isLabourSalaryReportPage(currentMenuData)) {
            console.log('✅ Rendering LabourSalaryReportPage for:', currentMenuData.name);
            return <LabourSalaryReportPage menuData={currentMenuData} />;
        }
        // check if the menu item should show staff report page
        if (currentMenuData && isStaffReportPage(currentMenuData)) {
            console.log('✅ Rendering StaffReportPage for:', currentMenuData.name);
            return <StaffReportPage menuData={currentMenuData} />;
        }
        // check if the menu item should show labour report page
        if (currentMenuData && isLabourReportPage(currentMenuData)) {
            console.log('✅ Rendering LabourReportPage for:', currentMenuData.name);
            return <LabourReportPage menuData={currentMenuData} />;
        }
        // check if the menu item should show labour attendance report page
        if (currentMenuData && isLabourAttendanceReportPage(currentMenuData)) {
            console.log('✅ Rendering LabourAttendanceReportPage for:', currentMenuData.name);
            return <LabourAttendanceReportPage menuData={currentMenuData} />;
        }
        // check if the menu item should show LTA report page
        if (currentMenuData && isLTAReportPage(currentMenuData)) {
            console.log('✅ Rendering LTAReportPage for:', currentMenuData.name);
            return <LTAReportPage menuData={currentMenuData} />;
        }
        // check if the menu item should show staff CTC report page
        if (currentMenuData && isStaffCTCReportPage(currentMenuData)) {
            console.log('✅ Rendering StaffCTCReportPage for:', currentMenuData.name);
            return <StaffCTCReportPage menuData={currentMenuData} />;
        }
        // check if the menu item should show staff CMS Pay Creation page
        if (currentMenuData && isStaffCMSPayCreationPage(currentMenuData)) {
            console.log('✅ Rendering StaffCMSPayCreationPage for:', currentMenuData.name);
            return <StaffCMSPayCreation menuData={currentMenuData} />;
        }
        // check if the menu item should show Labour CMS Pay Creation page
        if (currentMenuData && isLabourCMSPayCreationPage(currentMenuData)) {
            console.log('✅ Rendering LabourCMSPayCreation for:', currentMenuData.name);
            return <LabourCMSPayCreation menuData={currentMenuData} />;
        }
        // check if the menu item should show staff Payroll Creation page
        if (currentMenuData && isStaffPayrollCreationPage(currentMenuData)) {
            console.log('✅ Rendering StaffPayrollGeneration for:', currentMenuData.name);
            return <StaffPayrollGeneration menuData={currentMenuData} />;
        }
        // check if the menu item should show Labour Payroll Generation page
        if (currentMenuData && isLabourPayrollGenerationPage(currentMenuData)) {
            console.log('✅ Rendering LabourPayrollGeneration for:', currentMenuData.name);
            return <LabourPayrollGeneration menuData={currentMenuData} />;
        }
        // check if the menu item should show Labour Bank Change page
        if (currentMenuData && isLabourBankChangePage(currentMenuData)) {
            console.log('✅ Rendering LabourBankChange for:', currentMenuData.name);
            return <LabourBankChange menuData={currentMenuData} />;
        }
        // check if the menu item should show Labour Type Change page
        if (currentMenuData && isLabourTypeChangePage(currentMenuData)) {
            console.log('✅ Rendering LabourTypeChange for:', currentMenuData.name);
            return <LabourTypeChange menuData={currentMenuData} />;
        }
        // check if the menu item should show staff Salary Deduction and Arrear page
        if (currentMenuData && isStaffSalaryDeductionandArrear(currentMenuData)) {
            console.log('✅ Rendering StaffSalaryDeductionAndArrearPage for:', currentMenuData.name);
            return <StaffSalaryDeductionArrear menuData={currentMenuData} />;
        }
        // check if the menu item should show bulk worker registration page
        if (currentMenuData && isBulkWorkerRegistrationPage(currentMenuData)) {
            console.log('✅ Rendering BulkWorkerRegistration for:', currentMenuData.name);
            return <BulkWorkerRegistration menuData={currentMenuData} />;
        }
        // check if the menu item should show staff registration page
        if (currentMenuData && isStaffRegistrationPage(currentMenuData)) {
            console.log('✅ Rendering StaffRegistrationPage for:', currentMenuData.name);
            return <StaffJoinRegistration menuData={currentMenuData} />;
        }
        // check if the menu item should show employee transfer page
        if (currentMenuData && isEmployeeTransferPage(currentMenuData)) {
            console.log('✅ Rendering EmployeeTransferPage for:', currentMenuData.name);
            return <EmployeeTransfer menuData={currentMenuData} />;
        }
        // check if the menu item should show employee exit page
        if (currentMenuData && (
            currentMenuData.path === '/HR/EmployeeExit' ||
            currentMenuData.path?.toLowerCase().includes('employeeexit') ||
            currentMenuData.name?.toLowerCase().includes('employee exit') ||
            currentMenuData.name?.toLowerCase().includes('employeeexit')
        )) {
            console.log('✅ Rendering EmployeeExitPage for:', currentMenuData.name);
            return <EmployeeExit menuData={currentMenuData} />;
        }
        // check if the menu item should show labour exit page
        if (currentMenuData && (
            currentMenuData.path === '/HR/LabourExit' ||
            currentMenuData.path?.toLowerCase().includes('labourexit') ||
            currentMenuData.name?.toLowerCase().includes('labour exit') ||
            currentMenuData.name?.toLowerCase().includes('labourexit')
        )) {
            console.log('✅ Rendering LabourExit for:', currentMenuData.name);
            return <LabourExit menuData={currentMenuData} />;
        }
        // check if the menu item should show staff full & final page
        if (currentMenuData && (
            currentMenuData.path === '/HR/StaffFullFinal' ||
            currentMenuData.path?.toLowerCase().includes('fullfinal') ||
            currentMenuData.path?.toLowerCase().includes('finalsalary') ||
            currentMenuData.name?.toLowerCase().includes('full & final') ||
            currentMenuData.name?.toLowerCase().includes('full and final') ||
            currentMenuData.name?.toLowerCase().includes('fullfinal') ||
            currentMenuData.name?.toLowerCase().includes('final salary')
        )) {
            console.log('✅ Rendering StaffFullFinal for:', currentMenuData.name);
            return <StaffFullFinal menuData={currentMenuData} />;
        }

        // Leave Request Creation Page
        if (currentMenuData && (
            currentMenuData.path === '/HR/LeaveRequest' ||
            currentMenuData.path?.toLowerCase().includes('leaverequest') ||
            currentMenuData.path?.toLowerCase().includes('leave-request') ||
            currentMenuData.name?.toLowerCase().includes('leave request') ||
            currentMenuData.name?.toLowerCase().includes('leaverequest')
        )) {
            console.log('✅ Rendering EmployeeLeaveRequest for:', currentMenuData.name);
            return <EmployeeLeaveRequest menuData={currentMenuData} />;
        }

        // Advance Request Creation Page (LTA / SA)
        if (currentMenuData && (
            currentMenuData.path?.toLowerCase().includes('advancerequest') ||
            currentMenuData.path?.toLowerCase().includes('advance-request') ||
            currentMenuData.path?.toLowerCase().includes('hradvance') ||
            currentMenuData.name?.toLowerCase().includes('advance request') ||
            currentMenuData.name?.toLowerCase().includes('advancerequest') ||
            currentMenuData.name?.toLowerCase().includes('lta') ||
            currentMenuData.name?.toLowerCase().includes('salary advance')
        )) {
            return <StaffAdvanceRequest menuData={currentMenuData} />;
        }

        // Appraisal Objective and Goals
        if (currentMenuData && (
            currentMenuData.path === '/HR/EmpObjectiveGoals' ||
            currentMenuData.path === '/HR/AppraisalObjectives' ||
            currentMenuData.path?.toLowerCase().includes('appraisal') ||
            currentMenuData.path?.toLowerCase().includes('objectivegoal') ||
            currentMenuData.path?.toLowerCase().includes('empobject') ||
            currentMenuData.name?.toLowerCase().includes('appraisal') ||
            currentMenuData.name?.toLowerCase().includes('objective') ||
            currentMenuData.name?.toLowerCase().includes('goals')
        )) {
            return <StaffAppraisalObjective menuData={currentMenuData} />;
        }

        // Payroll Structure / CTC Creation Page
        if (currentMenuData && (
            currentMenuData.path === '/HR/PayRollStructure' ||
            currentMenuData.path?.toLowerCase().includes('payrollstructure') ||
            currentMenuData.name?.toLowerCase().includes('payroll structure') ||
            currentMenuData.name?.toLowerCase().includes('payrollstructure') ||
            currentMenuData.name?.toLowerCase().includes('ctc creation') ||
            currentMenuData.name?.toLowerCase().includes('ctccreation')
        )) {
            console.log('✅ Rendering StaffPayrollStructure for:', currentMenuData.name);
            return <StaffPayrollStructure menuData={currentMenuData} />;
        }

        if (currentMenuData && (
            currentMenuData.path?.toLowerCase().includes('payrevision') ||
            currentMenuData.name?.toLowerCase().includes('pay revision') ||
            currentMenuData.name?.toLowerCase().includes('payrevision') ||
            currentMenuData.name?.toLowerCase().includes('staff pay revision')
        )) {
            console.log('✅ Rendering StaffPayRevision for:', currentMenuData.name);
            return <StaffPayRevision menuData={currentMenuData} />;
        }

        // Vendor Cash Payment 
        if (currentMenuData && (
            currentMenuData.path === '/Purchase/VedorPaymentByCash' ||
            currentMenuData.path?.toLowerCase().includes('vendorcashpayment') ||
            currentMenuData.path?.toLowerCase().includes('sppo/payments') ||
            currentMenuData.name?.toLowerCase().includes('vendor cash payment') ||
            currentMenuData.name?.toLowerCase().includes('vendorcashpayment') 
        )) {
            console.log('✅ Rendering VendorCashPayment for:', currentMenuData.name);
            return <VendorCashPayment menuData={currentMenuData} />;
        }

        // Supplier PO Invoice Creation
        if (currentMenuData && (
            currentMenuData.path?.toLowerCase().includes('supplierpoinvoice') ||
            currentMenuData.path?.toLowerCase().includes('supplier/invoice') ||
            currentMenuData.path?.toLowerCase().includes('savesupplierpomoice') ||
            currentMenuData.path?.toLowerCase().includes('newsupplierpo') ||
            currentMenuData.name?.toLowerCase().includes('supplier po invoice') ||
            currentMenuData.name?.toLowerCase().includes('supplier invoice creation') ||
            currentMenuData.name?.toLowerCase().includes('supplierpoinvoice')
        )) {
            return <SupplierPOInvoiceCreation menuData={currentMenuData} />;
        }

        // SPPO Invoice Creation
        if (currentMenuData && (
            currentMenuData.path?.toLowerCase().includes('sppoinvoice') ||
            currentMenuData.path?.toLowerCase().includes('sppo/invoice') ||
            currentMenuData.path?.toLowerCase().includes('savesppomoice') ||
            currentMenuData.path?.toLowerCase().includes('newsppoinvoice') ||
            currentMenuData.name?.toLowerCase().includes('sppo invoice') ||
            currentMenuData.name?.toLowerCase().includes('sppoinvoice') ||
            currentMenuData.name?.toLowerCase().includes('service provider invoice')
        )) {
            return <SPPOInvoiceCreation menuData={currentMenuData} />;
        }

        // CC SEP Payment (Salary / ESI / PF)
        if (currentMenuData && (
            currentMenuData.path === '/Accounts/CCSalEsiPfPayment' ||
            currentMenuData.name?.toLowerCase().includes('cc sal esi pf')
          
            
        )) {
            return <CCSalEsiPfPayment menuData={currentMenuData} />;
        }

        // General Invoice Payment by Bank (checked BEFORE creation to avoid name collision)
        if (currentMenuData && (
            currentMenuData.path === '/Accounts/GeneralInvoicePayment' ||
            currentMenuData.path?.toLowerCase().includes('generalinvoicepayment') ||
            currentMenuData.name?.toLowerCase().includes('general invoice payment') ||
            currentMenuData.name?.toLowerCase().includes('generalinvoicepayment')
        )) {
            return <GeneralInvoicePayment menuData={currentMenuData} />;
        }

        // General Invoice Creation
        if (currentMenuData && (
            currentMenuData.path === '/Accounts/GeneralInvoiceCreation' ||
            currentMenuData.path?.toLowerCase().includes('geninvoice') ||
            (currentMenuData.name?.toLowerCase().includes('general invoice') &&
             !currentMenuData.name?.toLowerCase().includes('payment')) ||
            currentMenuData.name?.toLowerCase().includes('gen invoice')
        )) {
            return <GeneralInvoiceCreation menuData={currentMenuData} />;
        }

        // Client Trading Invoice Creation
        if (currentMenuData && (
            currentMenuData.path?.toLowerCase().includes('clienttrading') ||
            currentMenuData.path?.toLowerCase().includes('tradinginvoice') ||
            currentMenuData.name?.toLowerCase().includes('trading invoice') ||
            currentMenuData.name?.toLowerCase().includes('clienttrading')
        )) {
            return <ClientTradingInvoiceCreation menuData={currentMenuData} />;
        }

        // Client Scrap Sale Invoice Creation
        if (currentMenuData && (
            currentMenuData.path?.toLowerCase().includes('clientscrap') ||
            currentMenuData.path?.toLowerCase().includes('scrapsaleinvoice') ||
            currentMenuData.path?.toLowerCase().includes('scrap sale invoice') ||
            currentMenuData.name?.toLowerCase().includes('scrap sale invoice') ||
            currentMenuData.name?.toLowerCase().includes('scrap invoice') ||
            currentMenuData.name?.toLowerCase().includes('clientscrap')
        )) {
            return <ClientScrapSaleInvoiceCreation menuData={currentMenuData} />;
        }

        // Client Manufacturing Invoice Creation
        if (currentMenuData && (
            currentMenuData.path?.toLowerCase().includes('clientmanufacturing') ||
            currentMenuData.path?.toLowerCase().includes('clientmanufactureinvoice') ||
            currentMenuData.path?.toLowerCase().includes('clientmanfinvoice') ||
            currentMenuData.name?.toLowerCase().includes('manufacturing invoice') ||
            currentMenuData.name?.toLowerCase().includes('manufacture invoice') ||
            currentMenuData.name?.toLowerCase().includes('clientmanufacturing')
        )) {
            return <ClientManufacturingInvoiceCreation menuData={currentMenuData} />;
        }

        // Client Invoice Creation
        if (currentMenuData && (
            currentMenuData.path?.toLowerCase().includes('clientinvoice') ||
            currentMenuData.path?.toLowerCase().includes('client invoice') ||
            currentMenuData.path?.toLowerCase().includes('saveclientinvoice') ||
            currentMenuData.name?.toLowerCase().includes('client invoice') ||
            currentMenuData.name?.toLowerCase().includes('clientinvoice')
        )) {
            console.log('✅ Rendering ClientInvoiceCreation for:', currentMenuData.name);
            return <ClientInvoiceCreation menuData={currentMenuData} />;
        }

        // CC Closing
        if (currentMenuData && (
            currentMenuData.path?.toLowerCase().includes('ccclosing') ||
            currentMenuData.path?.toLowerCase().includes('cc closing') ||
            currentMenuData.name?.toLowerCase().includes('cc closing') ||
            currentMenuData.name?.toLowerCase().includes('ccclosing') ||
            currentMenuData.name?.toLowerCase().includes('cc suspend') ||
            currentMenuData.name?.toLowerCase().includes('ccsuspend')
        )) {
            return <CCClosing menuData={currentMenuData} />;
        }

        // CC Cash Transfer
        if (currentMenuData && (
            currentMenuData.path?.toLowerCase().includes('cccashtransfer') ||
            currentMenuData.path?.toLowerCase().includes('cc cash transfer') ||
            currentMenuData.path?.toLowerCase().includes('cccash') ||
            currentMenuData.name?.toLowerCase().includes('cc cash transfer') ||
            currentMenuData.name?.toLowerCase().includes('cccashtransfer')
        )) {
            console.log('✅ Rendering CCCashTransfer for:', currentMenuData.name);
            return <CCCashTransfer menuData={currentMenuData} />;
        }

        // Bank Withdrawal
        if (currentMenuData && (
            currentMenuData.path === '/Accounts/Withdrawal' ||
            currentMenuData.path?.toLowerCase().includes('withdrawal') ||
            currentMenuData.name?.toLowerCase().includes('bank withdrawal') ||
            currentMenuData.name?.toLowerCase().includes('withdrawal')
        )) {
            return <BankWithdrawal menuData={currentMenuData} />;
        }

        // Bank to Bank Transfer
        if (currentMenuData && (
            currentMenuData.path === '/Accounts/Banktransfer' ||
            currentMenuData.path?.toLowerCase().includes('banktransfer') ||
            currentMenuData.path?.toLowerCase().includes('bank transfer') ||
            currentMenuData.name?.toLowerCase().includes('bank transfer') ||
            currentMenuData.name?.toLowerCase().includes('banktransfer') ||
            currentMenuData.name?.toLowerCase().includes('bank to bank')
        )) {
            return <BankTransfer menuData={currentMenuData} />;
        }

        // SPPO Vendor Bank Payment
        if (currentMenuData && isSPPOPaymentPage(currentMenuData)) {
            return <SPPOPayment menuData={currentMenuData} />;
        }

        // Vendor CMS Payment
        if (currentMenuData && isVendorCMSPaymentPage(currentMenuData)) {
            return <VendorCMSPayment menuData={currentMenuData} />;
        }

        // Vendor TDS Payment
        if (currentMenuData && isVendorTDSPaymentPage(currentMenuData)) {
            return <VendorTDSPayment menuData={currentMenuData} />;
        }

        // BOE Settlement Payment
        if (currentMenuData && isBOESettlementPage(currentMenuData)) {
            return <BOESettlement menuData={currentMenuData} />;
        }

        // Client Bad Debt Receivables / Write-off
        if (currentMenuData && isClientBadDebtPage(currentMenuData)) {
            return <ClientBadDebtReceivables menuData={currentMenuData} />;
        }

        // Journal Voucher Creation
        if (currentMenuData && isJournalVoucherPage(currentMenuData)) {
            return <JournalVoucherCreation menuData={currentMenuData} />;
        }

        // Credit / Debit Note
        if (currentMenuData && isCreditDebitNotePage(currentMenuData)) {
            return <CreditDebitNote menuData={currentMenuData} />;
        }

        // LC / BG Creation
        if (currentMenuData && isLCBGCreationPage(currentMenuData)) {
            return <LCBGCreation menuData={currentMenuData} />;
        }

        // LC / BG Amendment & Closure
        if (currentMenuData && isLCBGAmendPage(currentMenuData)) {
            return <LCBGAmend menuData={currentMenuData} />;
        }

        // Unsecured Loan (New / Topup / Repay)
        if (currentMenuData && isUnsecuredLoanPage(currentMenuData)) {
            return <UnsecuredLoan menuData={currentMenuData} />;
        }

        // Term Loan Creation
        if (currentMenuData && isTermLoanCreationPage(currentMenuData)) {
            return <TermLoanCreation menuData={currentMenuData} />;
        }

        // Term Loan Payment (Installment / Preclosure)
        if (currentMenuData && isTermLoanPaymentPage(currentMenuData)) {
            return <TermLoanPayment menuData={currentMenuData} />;
        }

        // Term Loan Agency Creation
        if (currentMenuData && isAgencyCreationPage(currentMenuData)) {
            return <AgencyCreation menuData={currentMenuData} />;
        }

        // Load Wallet (Bank → Wallet / Wallet → Wallet)
        if (currentMenuData && (
            currentMenuData.path === '/Accounts/LoadWallet' ||
            currentMenuData.path?.toLowerCase().includes('loadwallet') ||
            currentMenuData.path?.toLowerCase().includes('load wallet') ||
            currentMenuData.name?.toLowerCase().includes('load wallet') ||
            currentMenuData.name?.toLowerCase().includes('loadwallet')
        )) {
            return <LoadWallet menuData={currentMenuData} />;
        }

        // General Payment from Bank
        if (currentMenuData && (
            currentMenuData.path?.toLowerCase().includes('generalpayable') ||
            currentMenuData.name?.toLowerCase().includes('general payment') ||
            currentMenuData.name?.toLowerCase().includes('generalpayable')
        )) {
            return <GeneralPayment menuData={currentMenuData} />;
        }

        // Cash Voucher Creation Page
        if (currentMenuData && (
            currentMenuData.path === '/Accounts/CashVoucher' ||
            currentMenuData.path?.toLowerCase().includes('cashvoucher') ||
            currentMenuData.path?.toLowerCase().includes('generalcashpayment') ||
            currentMenuData.name?.toLowerCase().includes('cash voucher') ||
            currentMenuData.name?.toLowerCase().includes('cashvoucher') ||
            currentMenuData.name?.toLowerCase().includes('general cash payment')
        )) {
            console.log('✅ Rendering CashVoucherCreation for:', currentMenuData.name);
            return <CashVoucherCreation menuData={currentMenuData} />;
        }

        // Labour Rule Configuration
        if (currentMenuData && isLabourRuleConfigPage(currentMenuData)) {
            console.log('✅ Rendering LabourRuleConfig for:', currentMenuData.name);
            return <LabourRuleConfig menuData={currentMenuData} />;
        }

        // Supplier PO Creation
        if (currentMenuData && isSupplierPOCreation(currentMenuData)) {
            console.log('✅ Rendering SupplierPOCreation for:', currentMenuData.name);
            return <SupplierPOCreation menuData={currentMenuData} />;
        }

        // Indent Creation
        if (currentMenuData && isIndentCreation(currentMenuData)) {
            console.log('✅ Rendering IndentCreation for:', currentMenuData.name);
            return <IndentCreation menuData={currentMenuData} />;
        }

        // Check if this should load from legacy application
        if (currentMenuData && isLegacyPage(currentMenuData)) {
            console.log('✅ Rendering Legacy Page for:', currentMenuData.name);
            return <LegacyPageWrapper menuData={currentMenuData} />;
        }

        // For any other budget-related menu item, show a budget module placeholder
        if (currentMenuData && isBudgetModule(currentMenuData)) {
            console.log('✅ Rendering Budget Module placeholder for:', currentMenuData.name);
            return <BudgetModulePlaceholder menuData={currentMenuData} />;
        }

        // For any other menu item click, show the generic page
        return <MenuItemContent menuData={currentMenuData} currentPage={currentPage} />;
    };

    // Show loading if menu data is not yet available
    if (!roleData?.menuItems) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d1b5e] dark:border-orange-400 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-300">Loading menu data...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <TopNavbarLayout
                currentPage={currentPage}
                onNavigate={handleNavigation}
            >
                {renderPageContent()}
            </TopNavbarLayout>
            <ChatBot />
        </>
    );
};

// Budget Module Placeholder Component for other budget-related menu items
const BudgetModulePlaceholder = ({ menuData }) => {
    const getBudgetModuleType = (menuData) => {
        const name = menuData.name?.toLowerCase() || '';
        const path = menuData.path?.toLowerCase() || '';

        if (name.includes('assignment') || path.includes('assignment')) return 'Budget Assignment';
        if (name.includes('approval') || path.includes('approval')) return 'Budget Approval';
        if (name.includes('amendment') || path.includes('amendment')) return 'Budget Amendment';
        if (name.includes('verification') || path.includes('verification')) return 'Budget Verification';
        if (name.includes('transfer') || path.includes('transfer')) return 'Budget Transfer';
        if (name.includes('analysis') || path.includes('analysis')) return 'Budget Analysis';

        return 'Budget Management';
    };

    const moduleType = getBudgetModuleType(menuData);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{menuData.name}</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{moduleType} Module</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="px-3 py-1 bg-[#0d1b5e]/10 dark:bg-[#0d1b5e]/30 text-[#0d1b5e] dark:text-white text-xs rounded-full transition-colors">
                            Budget Module
                        </div>
                        <div className="px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-xs rounded-full transition-colors">
                            In Development
                        </div>
                    </div>
                </div>

                {/* Breadcrumb */}
                <nav className="text-sm text-gray-500 dark:text-gray-400">
                    <span>Dashboard</span>
                    <span className="mx-2">›</span>
                    <span>Budget Management</span>
                    <span className="mx-2">›</span>
                    <span className="text-gray-900 dark:text-white">{menuData.name}</span>
                </nav>
            </div>

            {/* Main Content Area */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {moduleType} - Implementation Required
                </h2>

                {/* Budget Module Information */}
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg mb-6 transition-colors">
                    <h3 className="font-medium text-indigo-900 dark:text-indigo-300 mb-3">Budget Module Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="font-medium text-indigo-700 dark:text-indigo-300">Module:</span>
                            <span className="ml-2 text-indigo-600 dark:text-indigo-400">{moduleType}</span>
                        </div>
                        <div>
                            <span className="font-medium text-indigo-700 dark:text-indigo-300">Original Path:</span>
                            <span className="ml-2 text-indigo-600 dark:text-indigo-400 font-mono text-xs">{menuData.path}</span>
                        </div>
                        <div>
                            <span className="font-medium text-indigo-700 dark:text-indigo-300">Function:</span>
                            <span className="ml-2 text-indigo-600 dark:text-indigo-400">{menuData.name}</span>
                        </div>
                        <div>
                            <span className="font-medium text-indigo-700 dark:text-indigo-300">Type:</span>
                            <span className="ml-2 text-indigo-600 dark:text-indigo-400">{menuData.type}</span>
                        </div>
                    </div>
                </div>

                {/* Budget-specific Implementation Notes */}
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 transition-colors">
                    <h3 className="font-medium text-green-900 dark:text-green-300 mb-2">Budget Implementation Notes</h3>
                    <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                        <li>• This component will use the budgetSlice Redux store we created</li>
                        <li>• The Budget Report component is already implemented as a reference</li>
                        <li>• Connect to your existing .NET Budget API endpoints</li>
                        <li>• Implement specific budget functionality like assignment, approval, amendments</li>
                        <li>• Follow the same patterns as BudgetReport.js for consistency</li>
                        <li>• Include proper loading states, error handling, and data validation</li>
                    </ul>
                </div>

                {/* Available Budget APIs */}
                <div className="mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 dark:text-gray-300 mb-2">Available Budget APIs</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <div>• fetchCCFinancialYear</div>
                        <div>• saveCCAssignedBudget</div>
                        <div>• fetchBudgetCostCenters</div>
                        <div>• saveDCAAssignedBudget</div>
                        <div>• fetchVerificationCCBudget</div>
                        <div>• approveCostCenterBudget</div>
                        <div>• fetchAmendedDCA</div>
                        <div>• checkBudgetForSupplierPO</div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        All budget APIs are available in the budgetSlice Redux store
                    </p>
                </div>

                {/* Quick Implementation Guide */}
                <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <h3 className="font-medium text-yellow-900 dark:text-yellow-300 mb-2">Quick Implementation Steps</h3>
                    <ol className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 list-decimal list-inside">
                        <li>Create component: <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded text-xs">{menuData.name.replace(/\s+/g, '')}.js</code></li>
                        <li>Import budgetSlice actions and selectors</li>
                        <li>Add routing logic in RoleBasedApplication.js</li>
                        <li>Implement forms/tables specific to {moduleType}</li>
                        <li>Connect to appropriate budget API endpoints</li>
                        <li>Add proper validation and error handling</li>
                    </ol>
                </div>

                {/* Placeholder Content */}
                <div className="mt-6 p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center transition-colors">
                    <div className="text-gray-400 dark:text-gray-500 text-4xl mb-4">💰</div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{moduleType} Interface</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                        Implement the {moduleType.toLowerCase()} functionality here. This could include:
                    </p>
                    <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 space-y-1">
                        <p>• Budget allocation forms and tables</p>
                        <p>• Approval workflows and status tracking</p>
                        <p>• Financial data visualization and reporting</p>
                        <p>• Real-time budget monitoring and alerts</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Menu Item Content Component with Dark Mode Support (Fallback for unimplemented pages)
const MenuItemContent = ({ menuData, currentPage }) => {
    if (!menuData) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 border border-gray-200 dark:border-gray-700 text-center transition-colors">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Page Not Found</h2>
                <p className="text-gray-600 dark:text-gray-300">The requested page could not be found.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{menuData.name}</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{menuData.li}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs rounded-full transition-colors">
                            {menuData.type}
                        </div>
                        <div className="px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-xs rounded-full transition-colors">
                            Not Implemented
                        </div>
                    </div>
                </div>

                {/* Breadcrumb */}
                <nav className="text-sm text-gray-500 dark:text-gray-400">
                    <span>Dashboard</span>
                    <span className="mx-2">›</span>
                    <span>{menuData.type}</span>
                    <span className="mx-2">›</span>
                    <span>{menuData.li}</span>
                    <span className="mx-2">›</span>
                    <span className="text-gray-900 dark:text-white">{menuData.name}</span>
                </nav>
            </div>

            {/* Main Content Area */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {menuData.name} - Implementation Required
                </h2>

                {/* Menu Information */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6 transition-colors">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">Menu Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Menu ID:</span>
                            <span className="ml-2 text-gray-600 dark:text-gray-400">{menuData.id}</span>
                        </div>
                        <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Original Path:</span>
                            <span className="ml-2 text-gray-600 dark:text-gray-400 font-mono text-xs">{menuData.path}</span>
                        </div>
                        <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Section:</span>
                            <span className="ml-2 text-gray-600 dark:text-gray-400">{menuData.li}</span>
                        </div>
                        <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Type:</span>
                            <span className="ml-2 text-gray-600 dark:text-gray-400">{menuData.type}</span>
                        </div>
                    </div>
                </div>

                {/* Implementation Notes */}
                <div className="bg-[#0d1b5e]/5 dark:bg-[#0d1b5e]/20 border border-[#0d1b5e]/20 dark:border-[#0d1b5e]/40 rounded-lg p-4 transition-colors">
                    <h3 className="font-medium text-[#0d1b5e] dark:text-white mb-2">Implementation Notes</h3>
                    <ul className="text-sm text-[#0d1b5e]/80 dark:text-white/80 space-y-1">
                        <li>• This is where you'll implement the functionality for "{menuData.name}"</li>
                        <li>• Original MVC path: {menuData.path}</li>
                        <li>• Connect to your existing .NET API endpoints</li>
                        <li>• Implement forms, tables, reports, or other functionality as needed</li>
                        <li>• Maintain the same business logic as your original MVC application</li>
                    </ul>
                </div>

                {/* Implementation Guide */}
                <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <h3 className="font-medium text-yellow-900 dark:text-yellow-300 mb-2">Quick Implementation Steps</h3>
                    <ol className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 list-decimal list-inside">
                        <li>Create component: <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded text-xs">{menuData.name.replace(/\s+/g, '')}.js</code></li>
                        <li>Import in RoleBasedApplication.js</li>
                        <li>Add routing logic for path: <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded text-xs">{menuData.path}</code></li>
                        <li>Connect to API endpoints and implement functionality</li>
                    </ol>
                </div>

                {/* Placeholder Content */}
                <div className="mt-6 p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center transition-colors">
                    <div className="text-gray-400 dark:text-gray-500 text-4xl mb-4">🚧</div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Content Area</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                        Replace this section with the actual functionality for {menuData.name}.
                        This could be forms, data tables, reports, or any other business logic.
                    </p>
                    <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                        <p>💡 Tip: Follow the same pattern as BasicBusinessInfoSetup or BudgetReport to implement this page</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoleBasedApplication;