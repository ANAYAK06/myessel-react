// pages/Dashboard/RoleBasedApplication.js - UPDATED WITH CENTRALIZED FREQUENCY TRACKING
import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import TopNavbarLayout from '../../components/TopNavbarLayout';
import DashboardContent from './DashboardContent';
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
            menuData.path?.toLowerCase().includes('termloanreport') ||
            menuData.path?.toLowerCase().includes('termloan');
        const nameMatches = menuData.name?.toLowerCase().includes('termloanreport') ||
            menuData.name?.toLowerCase().includes('term loan report') ||
            menuData.name?.toLowerCase().includes('term loan') ||
            menuData.name?.toLowerCase().includes('loan report');
        const routeMatches = menuData.reactRoute?.toLowerCase().includes('termloanreport') ||
            menuData.reactRoute?.toLowerCase().includes('termloan');

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

        const pathMatches = menuData.path === '/Reports/AssetSaleReport'||
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
        const pathMatches = menuData.path === '/Reports/StockPurchaseConsolidateReport' ||  menuData.path === '/Inventory/StockPurchaseConsolidateReport' ||
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

    // Check if menu item should route to any Budget related functionality
    const isBudgetModule = (menuData) => {
        if (!menuData) return false;

        const pathMatches = menuData.path?.toLowerCase().includes('budget');
        const nameMatches = menuData.name?.toLowerCase().includes('budget');
        const sectionMatches = menuData.li?.toLowerCase().includes('budget') ||
            menuData.type?.toLowerCase().includes('budget');

        return pathMatches || nameMatches || sectionMatches;
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
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-300">Loading menu data...</p>
                </div>
            </div>
        );
    }

    return (
        <TopNavbarLayout
            currentPage={currentPage}
            onNavigate={handleNavigation}
        >
            {renderPageContent()}
        </TopNavbarLayout>
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
                        <div className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs rounded-full transition-colors">
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
                <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 transition-colors">
                    <h3 className="font-medium text-indigo-900 dark:text-indigo-300 mb-2">Implementation Notes</h3>
                    <ul className="text-sm text-indigo-800 dark:text-indigo-200 space-y-1">
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