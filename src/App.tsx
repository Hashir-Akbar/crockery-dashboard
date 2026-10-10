import React, { useState, useEffect } from 'react';
import { Area, Shop, Invoice, LedgerTransaction, InventoryProduct, BusinessSettings } from './types';
import {
  getStoredAreas,
  saveStoredAreas,
  getStoredShops,
  saveStoredShops,
  getStoredInvoices,
  saveStoredInvoices,
  getStoredTransactions,
  saveStoredTransactions,
  getStoredCatalog,
  saveStoredCatalog,
  getStoredBusinessSettings,
  saveStoredBusinessSettings,
  calculateShopCurrentBalance,
  recomputeShopRunningBalances,
  recomputeAllInvoiceStatuses,
  resetAllDataToDefault,
} from './data/storage';
import { formatCurrency, formatDate } from './lib/utils';
import {
  Building2,
  Store,
  FileText,
  BookOpen,
  Plus,
  Search,
  Filter,
  DollarSign,
  Share2,
  Phone,
  Printer,
  TrendingUp,
  MapPin,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Sparkles,
  CreditCard,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Lock,
  LogOut,
  KeyRound,
  Shield,
  Settings,
  ArrowDownLeft,
  ArrowUpRight,
  Package,
  Trash2,
} from 'lucide-react';
import { Button } from './components/ui/Button';
import { Badge } from './components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/Card';
import { ConfirmDeleteModal } from './components/ui/ConfirmDeleteModal';
import { CreateInvoiceModal } from './components/CreateInvoiceModal';
import { RecordPaymentModal } from './components/RecordPaymentModal';
import { InvoiceDetailModal } from './components/InvoiceDetailModal';
import { AddAreaModal } from './components/AddAreaModal';
import { AddShopModal } from './components/AddShopModal';
import { SharePortalModal } from './components/SharePortalModal';
import { ShopPortalView } from './components/ShopPortalView';
import { AdminLoginGate } from './components/AdminLoginGate';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { SettingsModal } from './components/SettingsModal';
import { InventoryManager } from './components/InventoryManager';

export default function App() {
  // Security & Authentication State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('wholesale_admin_auth') === 'true';
  });
  const [adminPassword, setAdminPassword] = useState<string>(() => {
    return localStorage.getItem('wholesale_admin_pass') || 'admin';
  });
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Business Settings State (Customizable Name, Tagline, Address, Phone, Currency)
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings>(() => {
    return getStoredBusinessSettings();
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Core state
  const [areas, setAreas] = useState<Area[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [transactions, setTransactions] = useState<LedgerTransaction[]>([]);
  const [catalog, setCatalog] = useState<InventoryProduct[]>([]);

  // Navigation & Selection state: added 'inventory'
  const [activeTab, setActiveTab] = useState<'areas' | 'inventory' | 'invoices' | 'ledger'>('areas');
  const [selectedAreaId, setSelectedAreaId] = useState<string>('area-sillanwali');
  const [selectedShopIdForLedger, setSelectedShopIdForLedger] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Invoices Tab specific search & status filter
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState('');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<'all' | 'unpaid' | 'partial' | 'paid'>('all');

  // Master Khata / Ledger specific search & filter state
  const [ledgerSearchQuery, setLedgerSearchQuery] = useState('');
  const [ledgerTypeFilter, setLedgerTypeFilter] = useState<'all' | 'invoice' | 'payment' | 'advance'>('all');

  // Modals state
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const [targetShopForInvoice, setTargetShopForInvoice] = useState<string | undefined>(undefined);
  const [targetAreaForInvoice, setTargetAreaForInvoice] = useState<string | undefined>(undefined);

  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [targetShopForPayment, setTargetShopForPayment] = useState<Shop | null>(null);

  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);

  const [isAddAreaOpen, setIsAddAreaOpen] = useState(false);
  const [isAddShopOpen, setIsAddShopOpen] = useState(false);

  const [shareModalShop, setShareModalShop] = useState<Shop | null>(null);

  // Deletion Confirmation Target States
  const [shopToDelete, setShopToDelete] = useState<Shop | null>(null);
  const [areaToDelete, setAreaToDelete] = useState<Area | null>(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);

  // Shop Portal direct client mode
  const [portalModeShopId, setPortalModeShopId] = useState<string | null>(null);
  const [isWholesalerPreviewMode, setIsWholesalerPreviewMode] = useState<boolean>(false);

  // Load data & URL query params on mount
  useEffect(() => {
    loadAllData();

    // Check if loaded with ?portal=true&shopId=xxx
    const params = new URLSearchParams(window.location.search);
    const portal = params.get('portal');
    const shopId = params.get('shopId');
    if (portal === 'true' && shopId) {
      setPortalModeShopId(shopId);
      setIsWholesalerPreviewMode(false); // External visitor (shop owner)! Cannot see dashboard!
    }
  }, []);

  const loadAllData = () => {
    const loadedAreas = getStoredAreas();
    const loadedShops = getStoredShops();
    const loadedInvoices = getStoredInvoices();
    const loadedTransactions = getStoredTransactions();
    const loadedCatalog = getStoredCatalog();
    const loadedSettings = getStoredBusinessSettings();

    // Automatically recalculate invoice statuses based on actual ledger payments
    const settledInvoices = recomputeAllInvoiceStatuses(loadedInvoices, loadedTransactions);
    saveStoredInvoices(settledInvoices);

    setAreas(loadedAreas);
    setShops(loadedShops);
    setInvoices(settledInvoices);
    setTransactions(loadedTransactions);
    setCatalog(loadedCatalog);
    setBusinessSettings(loadedSettings);

    // Default to Sillanwali if present
    const sillanwaliArea = loadedAreas.find(
      (a) => a.id === 'area-sillanwali' || a.name.toLowerCase().includes('sillanwali')
    );
    if (sillanwaliArea) {
      setSelectedAreaId(sillanwaliArea.id);
    } else if (loadedAreas.length > 0) {
      setSelectedAreaId(loadedAreas[0].id);
    }
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    localStorage.setItem('wholesale_admin_auth', 'true');
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('wholesale_admin_auth');
  };

  const handleSaveNewAdminPassword = (newPass: string) => {
    setAdminPassword(newPass);
    localStorage.setItem('wholesale_admin_pass', newPass);
  };

  const handleSaveSettings = (newSettings: BusinessSettings) => {
    setBusinessSettings(newSettings);
    saveStoredBusinessSettings(newSettings);
  };

  // Balance calculation helpers
  const getShopBalance = (shopId: string) => {
    return calculateShopCurrentBalance(shopId, transactions);
  };

  const getAreaTotalBalance = (areaId: string) => {
    const shopsInArea = shops.filter((s) => s.areaId === areaId);
    return shopsInArea.reduce((sum, s) => sum + getShopBalance(s.id), 0);
  };

  const totalWholesaleOutstanding = shops.reduce((sum, s) => sum + getShopBalance(s.id), 0);
  const totalInvoicesValue = invoices.reduce(
    (sum, inv) => {
      const customAdd = inv.priceAdjustments?.filter((a) => a.type === 'add').reduce((s, a) => s + a.amount, 0) || 0;
      const customDeduct = inv.priceAdjustments?.filter((a) => a.type === 'deduct').reduce((s, a) => s + a.amount, 0) || 0;
      return sum + (inv.subtotal + inv.freight - inv.discount + customAdd - customDeduct);
    },
    0
  );
  const totalCollections = transactions
    .filter((t) => t.type === 'payment' || t.type === 'advance')
    .reduce((sum, t) => sum + t.credit, 0);

  // Handler: Update Invoice Status (with immediate persistence)
  const handleUpdateInvoiceStatus = (invoiceId: string, newStatus: 'paid' | 'partial' | 'unpaid') => {
    const updated = invoices.map((inv) => (inv.id === invoiceId ? { ...inv, status: newStatus } : inv));
    saveStoredInvoices(updated);
    setInvoices(updated);

    if (viewInvoice && viewInvoice.id === invoiceId) {
      setViewInvoice({ ...viewInvoice, status: newStatus });
    }
  };

  // Handler: Save Invoice (with Price-Influencing Custom Fields & stock decrement)
  const handleSaveInvoice = (newInvoice: Invoice) => {
    const updatedInvoices = [newInvoice, ...invoices];
    saveStoredInvoices(updatedInvoices);
    setInvoices(updatedInvoices);

    // Auto decrement stock in warehouse inventory for invoiced items
    const updatedCatalog = catalog.map((catItem) => {
      const matchingLines = newInvoice.items.filter(
        (it) =>
          (it.productId && it.productId === catItem.id) ||
          (it.name && it.name.trim().toLowerCase() === catItem.name.trim().toLowerCase())
      );

      if (matchingLines.length > 0) {
        const totalDeductedQty = matchingLines.reduce(
          (sum, it) => sum + (Number(it.quantity) || 0),
          0
        );

        // Also decrement variation-specific stock if any line has a variation
        let updatedVariations = catItem.variations;
        if (updatedVariations && updatedVariations.length > 0) {
          updatedVariations = updatedVariations.map((v) => {
            const varLines = matchingLines.filter(
              (it) => it.variation && it.variation.toLowerCase() === v.name.toLowerCase()
            );
            if (varLines.length > 0) {
              const varQty = varLines.reduce(
                (sum, it) => sum + (Number(it.quantity) || 0),
                0
              );
              return {
                ...v,
                stock: Math.max(0, (v.stock || 0) - varQty),
              };
            }
            return v;
          });
        }

        return {
          ...catItem,
          stockQuantity: Math.max(0, catItem.stockQuantity - totalDeductedQty),
          variations: updatedVariations,
        };
      }
      return catItem;
    });
    saveStoredCatalog(updatedCatalog);
    setCatalog(updatedCatalog);

    // Calculate invoice bill taking into account items, freight, discount, AND price adjustments
    const customAdd = newInvoice.priceAdjustments?.filter((a) => a.type === 'add').reduce((s, a) => s + a.amount, 0) || 0;
    const customDeduct = newInvoice.priceAdjustments?.filter((a) => a.type === 'deduct').reduce((s, a) => s + a.amount, 0) || 0;
    const billAmount = newInvoice.subtotal + newInvoice.freight - newInvoice.discount + customAdd - customDeduct;

    // Build ledger description detailing custom price fields
    let adjDesc = '';
    if (newInvoice.priceAdjustments && newInvoice.priceAdjustments.length > 0) {
      adjDesc = ' | ' + newInvoice.priceAdjustments.map((a) => `${a.name}: ${a.type === 'add' ? '+' : '-'}${formatCurrency(a.amount, businessSettings.currency)}`).join(', ');
    }

    const invoiceTx: LedgerTransaction = {
      id: 'tx-' + Date.now(),
      shopId: newInvoice.shopId,
      date: newInvoice.date,
      type: 'invoice',
      reference: newInvoice.invoiceNumber,
      description: `Invoice #${newInvoice.invoiceNumber} (${newInvoice.items.length} items) + Freight: ${newInvoice.freight} - Disc: ${newInvoice.discount}${adjDesc}`,
      debit: billAmount,
      credit: 0,
      runningBalance: 0,
      invoiceId: newInvoice.id,
    };

    let newTransactionsList = [...transactions, invoiceTx];

    if (newInvoice.advancePaid > 0) {
      const advanceTx: LedgerTransaction = {
        id: 'tx-' + (Date.now() + 1),
        shopId: newInvoice.shopId,
        date: newInvoice.date,
        type: 'advance',
        reference: `ADV-${newInvoice.invoiceNumber}`,
        description: `Advance received on dispatch of Invoice #${newInvoice.invoiceNumber}`,
        debit: 0,
        credit: newInvoice.advancePaid,
        runningBalance: 0,
        invoiceId: newInvoice.id,
        paymentMethod: 'Cash',
      };
      newTransactionsList.push(advanceTx);
    }

    const recomputed = recomputeShopRunningBalances(newInvoice.shopId, newTransactionsList);
    saveStoredTransactions(recomputed);
    setTransactions(recomputed);

    // Automatically recalculate invoice statuses with new transaction list
    const settledInvoices = recomputeAllInvoiceStatuses(updatedInvoices, recomputed);
    saveStoredInvoices(settledInvoices);
    setInvoices(settledInvoices);

    const savedInv = settledInvoices.find((i) => i.id === newInvoice.id) || newInvoice;
    setViewInvoice(savedInv);
  };

  // Handler: Save Payment / Advance
  const handleSavePayment = (txData: Omit<LedgerTransaction, 'id' | 'runningBalance'>) => {
    const newTx: LedgerTransaction = {
      ...txData,
      id: 'tx-' + Date.now(),
      runningBalance: 0,
    };

    const updated = [...transactions, newTx];
    const recomputedTxs = recomputeShopRunningBalances(txData.shopId, updated);
    saveStoredTransactions(recomputedTxs);
    setTransactions(recomputedTxs);

    // Automatically settle invoice statuses based on this payment!
    const settledInvoices = recomputeAllInvoiceStatuses(invoices, recomputedTxs);
    saveStoredInvoices(settledInvoices);
    setInvoices(settledInvoices);
  };

  // Handler: Save Area
  const handleSaveArea = (newArea: Area) => {
    const updated = [...areas, newArea];
    saveStoredAreas(updated);
    setAreas(updated);
    setSelectedAreaId(newArea.id);
  };

  // Handler: Save Shop
  const handleSaveShop = (newShop: Shop) => {
    const updated = [...shops, newShop];
    saveStoredShops(updated);
    setShops(updated);

    if (newShop.openingBalance !== 0) {
      const obTx: LedgerTransaction = {
        id: 'tx-' + Date.now(),
        shopId: newShop.id,
        date: new Date().toISOString().split('T')[0],
        type: newShop.openingBalance > 0 ? 'opening_balance' : 'advance',
        reference: 'OB-START',
        description:
          newShop.openingBalance > 0
            ? 'Initial Opening Balance brought forward'
            : 'Initial Advance Booking Balance',
        debit: newShop.openingBalance > 0 ? newShop.openingBalance : 0,
        credit: newShop.openingBalance < 0 ? Math.abs(newShop.openingBalance) : 0,
        runningBalance: newShop.openingBalance,
      };
      const updatedTxs = [...transactions, obTx];
      saveStoredTransactions(updatedTxs);
      setTransactions(updatedTxs);
    }
  };

  // Inventory Management Handlers
  const handleSaveProduct = (product: InventoryProduct) => {
    const exists = catalog.some((p) => p.id === product.id);
    let updated: InventoryProduct[];
    if (exists) {
      updated = catalog.map((p) => (p.id === product.id ? product : p));
    } else {
      updated = [product, ...catalog];
    }
    saveStoredCatalog(updated);
    setCatalog(updated);
  };

  const handleDeleteProduct = (productId: string) => {
    const updated = catalog.filter((p) => p.id !== productId);
    saveStoredCatalog(updated);
    setCatalog(updated);
  };

  // Handler: Delete Shop (with associated invoices & ledger cleanup)
  const handleDeleteShop = (shopId: string) => {
    const updatedShops = shops.filter((s) => s.id !== shopId);
    saveStoredShops(updatedShops);
    setShops(updatedShops);

    // Also remove transactions and invoices for this deleted shop to keep ledger consistent
    const updatedTxs = transactions.filter((t) => t.shopId !== shopId);
    saveStoredTransactions(updatedTxs);
    setTransactions(updatedTxs);

    const updatedInvoices = invoices.filter((i) => i.shopId !== shopId);
    saveStoredInvoices(updatedInvoices);
    setInvoices(updatedInvoices);

    if (portalModeShopId === shopId) {
      setPortalModeShopId(null);
      setIsWholesalerPreviewMode(false);
    }
  };

  // Handler: Delete Area (reassigns shops to default or first area)
  const handleDeleteArea = (areaId: string) => {
    const updatedAreas = areas.filter((a) => a.id !== areaId);
    saveStoredAreas(updatedAreas);
    setAreas(updatedAreas);

    const fallbackAreaId = updatedAreas[0]?.id || '';
    // Reassign any shops in deleted area to remaining area
    const updatedShops = shops.map((s) => (s.areaId === areaId ? { ...s, areaId: fallbackAreaId } : s));
    saveStoredShops(updatedShops);
    setShops(updatedShops);

    if (selectedAreaId === areaId) {
      setSelectedAreaId('all');
    }
  };

  // Handler: Delete Invoice (restitutes stock and removes ledger debit)
  const handleDeleteInvoice = (invoiceId: string) => {
    const invToDelete = invoices.find((i) => i.id === invoiceId);
    if (!invToDelete) return;

    // Restitute stock for goods invoiced
    const updatedCatalog = catalog.map((catItem) => {
      const matchingLines = invToDelete.items.filter(
        (it) =>
          (it.productId && it.productId === catItem.id) ||
          (it.name && it.name.trim().toLowerCase() === catItem.name.trim().toLowerCase())
      );

      if (matchingLines.length > 0) {
        const totalRestoredQty = matchingLines.reduce(
          (sum, it) => sum + (Number(it.quantity) || 0),
          0
        );

        let updatedVariations = catItem.variations;
        if (updatedVariations && updatedVariations.length > 0) {
          updatedVariations = updatedVariations.map((v) => {
            const varLines = matchingLines.filter(
              (it) => it.variation && it.variation.toLowerCase() === v.name.toLowerCase()
            );
            if (varLines.length > 0) {
              const varQty = varLines.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);
              return {
                ...v,
                stock: (v.stock || 0) + varQty,
              };
            }
            return v;
          });
        }

        return {
          ...catItem,
          stockQuantity: catItem.stockQuantity + totalRestoredQty,
          variations: updatedVariations,
        };
      }
      return catItem;
    });
    saveStoredCatalog(updatedCatalog);
    setCatalog(updatedCatalog);

    // Remove invoice
    const updatedInvoices = invoices.filter((i) => i.id !== invoiceId);
    saveStoredInvoices(updatedInvoices);
    setInvoices(updatedInvoices);

    // Remove transactions linked to this invoice and recompute running balances
    const remainingTxs = transactions.filter(
      (t) => t.invoiceId !== invoiceId && t.reference !== invToDelete.invoiceNumber && t.reference !== `ADV-${invToDelete.invoiceNumber}`
    );
    const recomputed = recomputeShopRunningBalances(invToDelete.shopId, remainingTxs);
    saveStoredTransactions(recomputed);
    setTransactions(recomputed);

    // Recompute statuses for remaining invoices
    const settled = recomputeAllInvoiceStatuses(updatedInvoices, recomputed);
    saveStoredInvoices(settled);
    setInvoices(settled);

    if (viewInvoice && viewInvoice.id === invoiceId) {
      setViewInvoice(null);
    }
  };

  const handleAdjustStock = (productId: string, delta: number) => {
    const updated = catalog.map((p) => {
      if (p.id === productId) {
        const newStock = Math.max(0, p.stockQuantity + delta);
        return { ...p, stockQuantity: newStock };
      }
      return p;
    });
    saveStoredCatalog(updated);
    setCatalog(updated);
  };

  // Reset demo data
  const handleResetData = () => {
    if (window.confirm('Reset all wholesale data to initial Pakistani crockery supply demo data?')) {
      resetAllDataToDefault();
      loadAllData();
      alert('Data reset to default.');
    }
  };

  // Filtered Shops based on selected Area & Search
  const filteredShops = shops.filter((shop) => {
    const matchesArea = selectedAreaId === 'all' || shop.areaId === selectedAreaId;
    const matchesSearch =
      shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.phone.includes(searchQuery) ||
      shop.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesArea && matchesSearch;
  });

  // Filtered Invoices for Invoices tab
  const filteredInvoicesList = invoices.filter((inv) => {
    const shop = shops.find((s) => s.id === inv.shopId);
    const area = areas.find((a) => a.id === inv.areaId);
    const term = invoiceSearchQuery.toLowerCase();

    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(term) ||
      (shop && shop.name.toLowerCase().includes(term)) ||
      (shop && shop.ownerName.toLowerCase().includes(term)) ||
      (area && area.name.toLowerCase().includes(term)) ||
      inv.items.some((it) => it.name.toLowerCase().includes(term) || (it.nameUrdu && it.nameUrdu.toLowerCase().includes(term)));

    const matchesStatus = invoiceStatusFilter === 'all' || inv.status === invoiceStatusFilter;

    return matchesSearch && matchesStatus;
  });

  // Master Khata / Ledger search and filtering across shops, vouchers & descriptions
  const filteredTransactions = transactions.filter((tx) => {
    const shop = shops.find((s) => s.id === tx.shopId);
    const term = ledgerSearchQuery.toLowerCase().trim();

    // Search filter: matches shop name, owner name, voucher reference, payment method, or description
    const matchesSearch =
      term === '' ||
      tx.reference.toLowerCase().includes(term) ||
      tx.description.toLowerCase().includes(term) ||
      (tx.paymentMethod && tx.paymentMethod.toLowerCase().includes(term)) ||
      (shop && shop.name.toLowerCase().includes(term)) ||
      (shop && shop.ownerName.toLowerCase().includes(term)) ||
      (shop && shop.phone.includes(term));

    // Type filter
    let matchesType = true;
    if (ledgerTypeFilter !== 'all') {
      matchesType = tx.type === ledgerTypeFilter;
    }

    return matchesSearch && matchesType;
  });

  // =========================================================================
  // VIEW MODE 1: SHOP OWNER SHAREABLE PORTAL (ISOLATED CLIENT EXPERIENCE)
  // When a link is shared (?portal=true&shopId=xxx), the owner lands directly here.
  // =========================================================================
  if (portalModeShopId) {
    const matchedShop = shops.find((s) => s.id === portalModeShopId);
    if (matchedShop) {
      const matchedArea = areas.find((a) => a.id === matchedShop.areaId);
      return (
        <ShopPortalView
          shop={matchedShop}
          area={matchedArea}
          invoices={invoices}
          transactions={transactions}
          currentBalance={getShopBalance(matchedShop.id)}
          isWholesalerPreview={isWholesalerPreviewMode}
          onExitPreview={() => {
            setPortalModeShopId(null);
            setIsWholesalerPreviewMode(false);
          }}
          onAdminUnlock={() => {
            setPortalModeShopId(null);
            setIsWholesalerPreviewMode(false);
            setIsAdminAuthenticated(true);
            localStorage.setItem('wholesale_admin_auth', 'true');
          }}
          businessSettings={businessSettings}
        />
      );
    }
  }

  // =========================================================================
  // VIEW MODE 2: PRIVATE ADMIN LOGIN GATE
  // Only accessible by admin password.
  // =========================================================================
  if (!isAdminAuthenticated) {
    return (
      <AdminLoginGate
        savedAdminPassword={adminPassword}
        onLoginSuccess={handleAdminLoginSuccess}
      />
    );
  }

  // =========================================================================
  // VIEW MODE 3: WHOLESALER ADMIN DASHBOARD
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navigation & Status Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-blue-600 text-white font-black rounded-xl flex items-center justify-center text-base shadow-xs">
              CC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 font-heading">
                  {businessSettings.name.toUpperCase()}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold rounded-md font-mono">
                  <ShieldCheck className="w-3 h-3" /> ADMIN SECURE
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                {businessSettings.tagline}
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSettingsOpen(true)}
              className="text-xs h-8 text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 mr-1 text-slate-500" /> Settings
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsChangePasswordOpen(true)}
              className="text-xs h-8 text-slate-700 hover:bg-slate-100 hidden sm:flex cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 mr-1 text-slate-500" /> Password
            </Button>

            <Button
              size="sm"
              onClick={() => {
                setTargetShopForInvoice(undefined);
                setTargetAreaForInvoice(selectedAreaId === 'all' ? undefined : selectedAreaId);
                setIsCreateInvoiceOpen(true);
              }}
              className="text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> New Invoice
            </Button>

            <button
              onClick={handleAdminLogout}
              title="Lock Admin Dashboard"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Financial Overview */}
      <section className="bg-white border-b border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/90 hover:border-blue-200 transition-all">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block font-heading">
                Total Market Dues (Receivables)
              </span>
              <div className="text-xl sm:text-2xl font-mono font-black text-rose-600 mt-0.5">
                {formatCurrency(totalWholesaleOutstanding, businessSettings.currency)}
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Pending across all supply territories</span>
            </div>

            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/90 hover:border-blue-200 transition-all">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block font-heading">
                Total Invoiced Supply
              </span>
              <div className="text-xl sm:text-2xl font-mono font-black text-blue-900 mt-0.5">
                {formatCurrency(totalInvoicesValue, businessSettings.currency)}
              </div>
              <span className="text-[10px] text-slate-400 font-medium">{invoices.length} invoices generated to date</span>
            </div>

            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/90 hover:border-blue-200 transition-all">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block font-heading">
                Collections & Advances
              </span>
              <div className="text-xl sm:text-2xl font-mono font-black text-emerald-600 mt-0.5">
                {formatCurrency(totalCollections, businessSettings.currency)}
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Cleared via Cash, Cheques, Transfers</span>
            </div>

            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/90 hover:border-blue-200 transition-all">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block font-heading">
                Active Supply Network
              </span>
              <div className="text-xl sm:text-2xl font-mono font-black text-indigo-700 mt-0.5">
                {areas.length} Cities • {shops.length} Shops • {catalog.length} SKUs
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Sillanwali, Sargodha, FSD, Lahore</span>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-[57px] z-20 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex gap-1.5 py-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('areas')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer font-heading whitespace-nowrap ${
                activeTab === 'areas'
                  ? 'bg-blue-600 text-white shadow-xs font-extrabold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4" /> Cities & Shops ({shops.length})
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer font-heading whitespace-nowrap ${
                activeTab === 'inventory'
                  ? 'bg-blue-600 text-white shadow-xs font-extrabold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Package className="w-4 h-4" /> Inventory & Stock ({catalog.length})
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer font-heading whitespace-nowrap ${
                activeTab === 'invoices'
                  ? 'bg-blue-600 text-white shadow-xs font-extrabold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" /> All Invoices ({invoices.length})
            </button>
            <button
              onClick={() => setActiveTab('ledger')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer font-heading whitespace-nowrap ${
                activeTab === 'ledger'
                  ? 'bg-blue-600 text-white shadow-xs font-extrabold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" /> Master Khata / Ledger ({transactions.length})
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetData}
              title="Reset to fresh demo data"
              className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1 p-1.5 cursor-pointer whitespace-nowrap"
            >
              <RefreshCw className="w-3 h-3" /> Reset Demo
            </button>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full">
        {/* ================= TAB 1: CITIES & SHOPS DIRECTORY ================= */}
        {activeTab === 'areas' && (
          <div className="space-y-6">
            {/* AREA SELECTION BAR */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5 font-heading">
                    <MapPin className="w-4 h-4 text-blue-600" /> Select City / Area to View Shops
                  </h3>
                  <p className="text-xs text-slate-500">
                    Click any city (e.g. <strong>Sillanwali</strong>) to instantly see all shops and ledger dues in that territory
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddAreaOpen(true)}
                  className="text-xs border-dashed border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add New City / Area
                </Button>
              </div>

              {/* Area buttons list */}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={() => setSelectedAreaId('all')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer font-heading ${
                    selectedAreaId === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>All Supply Cities</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-mono">
                    {shops.length}
                  </span>
                </button>

                {areas.map((area) => {
                  const areaShops = shops.filter((s) => s.areaId === area.id);
                  const isSelected = selectedAreaId === area.id;
                  const areaBalance = getAreaTotalBalance(area.id);

                  return (
                    <div
                      key={area.id}
                      className={`inline-flex items-center rounded-xl text-xs font-bold transition-all font-heading ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedAreaId(area.id)}
                        className="px-3 py-2 flex items-center gap-2 cursor-pointer"
                      >
                        <span>{area.name}</span>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                            isSelected ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {areaShops.length} shops
                        </span>
                        {areaBalance > 0 && (
                          <span
                            className={`text-[10px] font-mono font-semibold ${
                              isSelected ? 'text-amber-200' : 'text-rose-600'
                            }`}
                          >
                            {formatCurrency(areaBalance, businessSettings.currency)}
                          </span>
                        )}
                      </button>

                      {/* Delete Area button (if more than 1 area exists) */}
                      {areas.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAreaToDelete(area);
                          }}
                          className={`p-1.5 mr-1 rounded-lg cursor-pointer transition-colors ${
                            isSelected
                              ? 'text-white/60 hover:text-white hover:bg-white/20'
                              : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                          }`}
                          title={`Delete City / Area (${area.name})`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SHOPS LIST SECTION */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="text-base font-black text-slate-900 font-heading">
                  {selectedAreaId === 'all'
                    ? 'All Retail Shops Across Pakistan'
                    : `Shops under ${areas.find((a) => a.id === selectedAreaId)?.name || 'Selected City'}`}
                </h2>
                <p className="text-xs text-slate-500">
                  Showing {filteredShops.length} stores with live ledger balances, invoice history, and private share links
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search shop, owner, phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <Button
                  size="sm"
                  onClick={() => setIsAddShopOpen(true)}
                  className="text-xs bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Shop
                </Button>
              </div>
            </div>

            {/* SHOPS GRID */}
            {filteredShops.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-200">
                <Store className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-700">No shops found</h4>
                <p className="text-xs text-slate-400 mt-1">
                  No retail stores match your filter or search query.
                </p>
                <Button
                  size="sm"
                  onClick={() => setIsAddShopOpen(true)}
                  className="mt-4 text-xs bg-blue-600 text-white"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Register Shop Now
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredShops.map((shop) => {
                  const balance = getShopBalance(shop.id);
                  const shopInvoicesCount = invoices.filter((i) => i.shopId === shop.id).length;
                  const shopArea = areas.find((a) => a.id === shop.areaId);

                  return (
                    <Card
                      key={shop.id}
                      className="bg-white border-slate-200/90 shadow-2xs hover:shadow-md transition-all rounded-2xl flex flex-col justify-between"
                    >
                      <CardContent className="p-5 space-y-4">
                        {/* Shop Header */}
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <Badge
                                variant="outline"
                                className="text-[10px] mb-1 font-mono uppercase border-blue-200 bg-blue-50 text-blue-700 font-bold"
                              >
                                {shopArea?.name || 'Supply Zone'}
                              </Badge>
                              <h3 className="font-extrabold text-slate-900 text-base font-heading">
                                {shop.name}
                              </h3>
                              <p className="text-xs font-semibold text-blue-700">
                                {shop.ownerName}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => setShareModalShop(shop)}
                              title="Share Online Khata Link to Shop Owner"
                              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer border border-blue-200"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="mt-2 space-y-1 text-xs text-slate-500">
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{shop.phone}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{shop.address}</span>
                            </div>
                          </div>
                        </div>

                        {/* Balance Card Section */}
                        <div
                          className={`p-3.5 rounded-xl border ${
                            balance > 0
                              ? 'bg-rose-50/70 border-rose-200'
                              : balance < 0
                              ? 'bg-emerald-50/70 border-emerald-200'
                              : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-wider font-heading">
                            <span className={balance > 0 ? 'text-rose-700' : 'text-emerald-700'}>
                              Ledger Balance:
                            </span>
                            <span className="text-slate-400 font-mono text-[10px]">
                              {shopInvoicesCount} invoices
                            </span>
                          </div>
                          <div
                            className={`text-xl font-mono font-black mt-0.5 ${
                              balance > 0
                                ? 'text-rose-700'
                                : balance < 0
                                ? 'text-emerald-700'
                                : 'text-slate-700'
                            }`}
                          >
                            {formatCurrency(balance, businessSettings.currency)}
                          </div>
                          <div className="text-[10px] font-medium mt-0.5">
                            {balance > 0 ? (
                              <span className="text-rose-600 font-semibold">Pending Payment Owed</span>
                            ) : balance < 0 ? (
                              <span className="text-emerald-600 font-semibold">Advance Surplus Credit</span>
                            ) : (
                              <span className="text-slate-500">Account Clear</span>
                            )}
                          </div>
                        </div>
                      </CardContent>

                      {/* Card Action Footer */}
                      <div className="p-3 bg-slate-50/80 border-t border-slate-100 rounded-b-2xl flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setTargetShopForInvoice(shop.id);
                              setTargetAreaForInvoice(shop.areaId);
                              setIsCreateInvoiceOpen(true);
                            }}
                            className="text-[11px] h-7 bg-white hover:bg-blue-50 hover:text-blue-700 cursor-pointer"
                          >
                            + Invoice
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setTargetShopForPayment(shop);
                              setIsRecordPaymentOpen(true);
                            }}
                            className="text-[11px] h-7 bg-white hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer"
                          >
                            + Payment
                          </Button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Button
                            size="sm"
                            onClick={() => {
                              setPortalModeShopId(shop.id);
                              setIsWholesalerPreviewMode(true);
                            }}
                            className="text-[11px] h-7 bg-slate-900 hover:bg-blue-600 text-white font-bold cursor-pointer"
                          >
                            View Khata / Portal <ChevronRight className="w-3 h-3 ml-0.5" />
                          </Button>
                          <button
                            type="button"
                            onClick={() => setShopToDelete(shop)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 border border-rose-200/60 hover:border-rose-300 cursor-pointer transition-colors"
                            title={`Delete Shop (${shop.name})`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: INVENTORY & STOCK MANAGEMENT ================= */}
        {activeTab === 'inventory' && (
          <InventoryManager
            catalog={catalog}
            onSaveProduct={handleSaveProduct}
            onDeleteProduct={handleDeleteProduct}
            onAdjustStock={handleAdjustStock}
            currency={businessSettings.currency}
            onOpenCreateInvoiceWithProduct={(product) => {
              setTargetShopForInvoice(undefined);
              setIsCreateInvoiceOpen(true);
            }}
          />
        )}

        {/* ================= TAB 3: INVOICES REPOSITORY ================= */}
        {activeTab === 'invoices' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h2 className="text-base font-black text-slate-900 font-heading">
                  All Wholesale Crockery Invoices ({invoices.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Update payment statuses (Paid / Partial / Unpaid) with one click, search consignments, and print bills.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  size="sm"
                  onClick={() => {
                    setTargetShopForInvoice(undefined);
                    setIsCreateInvoiceOpen(true);
                  }}
                  className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Create New Invoice
                </Button>
              </div>
            </div>

            {/* Filter toolbar */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by invoice #, shop name, city, or crockery product..."
                  value={invoiceSearchQuery}
                  onChange={(e) => setInvoiceSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Status:</span>
                {(['all', 'unpaid', 'partial', 'paid'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setInvoiceStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                      invoiceStatusFilter === st
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const settled = recomputeAllInvoiceStatuses(invoices, transactions);
                    saveStoredInvoices(settled);
                    setInvoices(settled);
                  }}
                  title="Recalculate all invoice statuses automatically from ledger payments"
                  className="px-2.5 py-1 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <Sparkles className="w-3 h-3 text-blue-600" />
                  Auto-Sync
                </button>
              </div>
            </div>

            {/* Invoices list */}
            <div className="grid grid-cols-1 gap-3">
              {filteredInvoicesList.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                  No invoices found matching your filter criteria.
                </div>
              ) : (
                filteredInvoicesList.map((inv) => {
                  const shop = shops.find((s) => s.id === inv.shopId);
                  const area = areas.find((a) => a.id === inv.areaId);

                  const customAdd = inv.priceAdjustments?.filter((a) => a.type === 'add').reduce((s, a) => s + a.amount, 0) || 0;
                  const customDeduct = inv.priceAdjustments?.filter((a) => a.type === 'deduct').reduce((s, a) => s + a.amount, 0) || 0;
                  const currentBill = inv.subtotal + inv.freight - inv.discount + customAdd - customDeduct;

                  return (
                    <div
                      key={inv.id}
                      className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 hover:border-blue-400 shadow-2xs transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 text-sm">
                            {inv.invoiceNumber}
                          </span>

                          {/* Automatic Status Badge */}
                          <span
                            className={`px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wide flex items-center gap-1 shadow-2xs ${
                              inv.status === 'paid'
                                ? 'bg-emerald-600 text-white'
                                : inv.status === 'partial'
                                ? 'bg-amber-500 text-white'
                                : 'bg-rose-600 text-white'
                            }`}
                          >
                            {inv.status === 'paid' && <CheckCircle2 className="w-3 h-3" />}
                            {inv.status === 'partial' && <Clock className="w-3 h-3" />}
                            {inv.status === 'unpaid' && <AlertCircle className="w-3 h-3" />}
                            {inv.status}
                          </span>

                          {/* Quick Interactive Status Switcher (Override if needed) */}
                          <div className="flex items-center gap-1 bg-slate-50 p-0.5 rounded-lg border border-slate-200">
                            {(['unpaid', 'partial', 'paid'] as const).map((st) => (
                              <button
                                key={st}
                                type="button"
                                onClick={() => handleUpdateInvoiceStatus(inv.id, st)}
                                title={`Set status to ${st}`}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${
                                  inv.status === st
                                    ? 'bg-slate-900 text-white shadow-2xs'
                                    : 'bg-transparent text-slate-500 hover:bg-slate-200'
                                }`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>

                          <span className="text-xs font-bold text-blue-700">
                            {shop?.name || 'Retail Shop'}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            ({area?.name || 'Area'})
                          </span>
                          <span className="text-xs text-slate-500">
                            • {formatDate(inv.date)}
                          </span>
                        </div>

                        <div className="text-xs text-slate-600 line-clamp-1">
                          <span className="font-semibold text-slate-700">Goods: </span>
                          {inv.items.map((it) => `${it.name} (${it.quantity} ${it.unit})`).join(' • ')}
                        </div>

                        {/* Custom fields & price adjustments pills */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {inv.priceAdjustments &&
                            inv.priceAdjustments.map((adj) => (
                              <span
                                key={adj.id}
                                className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                  adj.type === 'add'
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                }`}
                              >
                                {adj.type === 'add' ? '+' : '-'}{adj.name}: {formatCurrency(adj.amount, businessSettings.currency)}
                              </span>
                            ))}
                          {inv.customFields &&
                            inv.customFields.map((cf) => (
                              <span
                                key={cf.id}
                                className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-medium"
                              >
                                {cf.label}: <span className="font-semibold text-slate-900">{cf.value}</span>
                              </span>
                            ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                        <div className="text-left md:text-right">
                          <div className="text-[11px] text-slate-500">Current Bill</div>
                          <div className="font-mono font-bold text-slate-900 text-sm">
                            {formatCurrency(currentBill, businessSettings.currency)}
                          </div>
                          {inv.freight > 0 && (
                            <div className="text-[10px] text-blue-600 font-medium">
                              Freight: +{formatCurrency(inv.freight, businessSettings.currency)}
                            </div>
                          )}
                        </div>

                        <div className="text-right">
                          <div className="text-[11px] text-slate-500">Net Due</div>
                          <div className="font-mono font-black text-blue-900 text-base">
                            {formatCurrency(inv.netPayable, businessSettings.currency)}
                          </div>
                          {inv.advancePaid > 0 && (
                            <div className="text-[10px] text-emerald-600 font-medium">
                              Adv: -{formatCurrency(inv.advancePaid, businessSettings.currency)}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setViewInvoice(inv)}
                            className="text-xs h-8 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5 mr-1" /> View / Print
                          </Button>
                          <button
                            type="button"
                            onClick={() => setInvoiceToDelete(inv)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 border border-rose-200/60 hover:border-rose-300 cursor-pointer transition-colors"
                            title={`Delete Invoice #${inv.invoiceNumber}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 4: MASTER LEDGER / KHATA ================= */}
        {activeTab === 'ledger' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h2 className="text-base font-black text-slate-900 font-heading">
                    Wholesale Master Khata & Transactions Ledger
                  </h2>
                  <p className="text-xs text-slate-500">
                    Search by shop name, owner name, voucher reference, payment method, or particulars
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.print()}
                    className="text-xs h-8 no-print cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 mr-1" /> Print Ledger
                  </Button>
                </div>
              </div>

              {/* SEARCH & FILTER BAR */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
                <div className="sm:col-span-2 relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search master khata by shop name, owner, voucher #, particulars..."
                    value={ledgerSearchQuery}
                    onChange={(e) => setLedgerSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <select
                    value={ledgerTypeFilter}
                    onChange={(e) => setLedgerTypeFilter(e.target.value as any)}
                    className="w-full h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="all">All Vouchers / Records</option>
                    <option value="invoice">Invoices Only (Debits)</option>
                    <option value="payment">Collections Only (Credits)</option>
                    <option value="advance">Advances Only (Credits)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[750px]">
                  <thead>
                    <tr className="border-b-2 border-slate-200 text-slate-500 uppercase text-[11px] font-heading bg-slate-50/70">
                      <th className="py-3 px-4 font-bold">Date</th>
                      <th className="py-3 px-4 font-bold">Shop & Area</th>
                      <th className="py-3 px-4 font-bold">Voucher #</th>
                      <th className="py-3 px-4 font-bold">Particulars / Details</th>
                      <th className="py-3 px-4 text-right font-bold text-rose-700">Debit (Billed)</th>
                      <th className="py-3 px-4 text-right font-bold text-emerald-700">Credit (Received)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTransactions.map((tx) => {
                      const shop = shops.find((s) => s.id === tx.shopId);
                      const area = shop ? areas.find((a) => a.id === shop.areaId) : null;

                      return (
                        <tr key={tx.id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                            {formatDate(tx.date)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 font-heading">
                              {shop?.name || 'Retail Shop'}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {shop?.ownerName} • {area?.name}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-800">
                            {tx.reference}
                          </td>
                          <td className="py-3 px-4 text-slate-700">
                            <div>{tx.description}</div>
                            {tx.paymentMethod && (
                              <span className="text-[10px] text-slate-400 font-mono">
                                Via {tx.paymentMethod}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-rose-700">
                            {tx.debit > 0 ? formatCurrency(tx.debit, businessSettings.currency) : '-'}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                            {tx.credit > 0 ? formatCurrency(tx.credit, businessSettings.currency) : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODALS */}
      <CreateInvoiceModal
        isOpen={isCreateInvoiceOpen}
        onClose={() => setIsCreateInvoiceOpen(false)}
        areas={areas}
        shops={shops}
        catalog={catalog}
        defaultShopId={targetShopForInvoice}
        defaultAreaId={targetAreaForInvoice}
        onSaveInvoice={handleSaveInvoice}
        currency={businessSettings.currency}
      />

      <RecordPaymentModal
        isOpen={isRecordPaymentOpen}
        onClose={() => {
          setIsRecordPaymentOpen(false);
          setTargetShopForPayment(null);
        }}
        shop={targetShopForPayment}
        currentBalance={targetShopForPayment ? getShopBalance(targetShopForPayment.id) : 0}
        invoices={invoices}
        onSavePayment={handleSavePayment}
        onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
        currency={businessSettings.currency}
      />

      <InvoiceDetailModal
        isOpen={!!viewInvoice}
        onClose={() => setViewInvoice(null)}
        invoice={viewInvoice}
        shop={viewInvoice ? shops.find((s) => s.id === viewInvoice.shopId) || null : null}
        area={viewInvoice ? areas.find((a) => a.id === viewInvoice.areaId) || null : null}
        businessSettings={businessSettings}
        onUpdateStatus={handleUpdateInvoiceStatus}
        onDeleteInvoice={(id) => {
          handleDeleteInvoice(id);
          setViewInvoice(null);
        }}
        isAdmin={true}
      />

      {/* Shop Deletion Safety Modal */}
      {shopToDelete && (
        <ConfirmDeleteModal
          isOpen={!!shopToDelete}
          onClose={() => setShopToDelete(null)}
          onConfirm={() => {
            handleDeleteShop(shopToDelete.id);
            setShopToDelete(null);
          }}
          title="Delete Retail Shop & Khata"
          itemName={shopToDelete.name}
          itemType="Shop"
          warningMessage={`Are you sure you want to permanently delete "${shopToDelete.name}" (${shopToDelete.ownerName})? Deleting this shop will permanently remove the shop profile, all associated invoices, and clear its ledger transaction records.`}
          details={[
            { label: 'Shop Name', value: shopToDelete.name },
            { label: 'Proprietor', value: shopToDelete.ownerName },
            { label: 'City / Area', value: areas.find((a) => a.id === shopToDelete.areaId)?.name || 'Unknown' },
            { label: 'Current Khata Balance', value: formatCurrency(getShopBalance(shopToDelete.id), businessSettings.currency) },
            { label: 'Total Invoices', value: invoices.filter((i) => i.shopId === shopToDelete.id).length },
          ]}
          confirmButtonText="Delete Shop & All Records"
        />
      )}

      {/* Distribution Area / City Deletion Safety Modal */}
      {areaToDelete && (
        <ConfirmDeleteModal
          isOpen={!!areaToDelete}
          onClose={() => setAreaToDelete(null)}
          onConfirm={() => {
            handleDeleteArea(areaToDelete.id);
            setAreaToDelete(null);
          }}
          title="Delete Distribution Area / City"
          itemName={areaToDelete.name}
          itemType="City / Area"
          warningMessage={`Are you sure you want to delete "${areaToDelete.name}"? Any retail shops currently registered under this area will be safely reassigned to your remaining active distribution areas.`}
          details={[
            { label: 'Area / Route Name', value: areaToDelete.name },
            { label: 'City / Region', value: areaToDelete.city },
            { label: 'Area Code', value: areaToDelete.code },
            { label: 'Registered Shops', value: shops.filter((s) => s.areaId === areaToDelete.id).length },
          ]}
          confirmButtonText="Delete City / Area"
        />
      )}

      {/* Wholesale Invoice Deletion Safety Modal */}
      {invoiceToDelete && (
        <ConfirmDeleteModal
          isOpen={!!invoiceToDelete}
          onClose={() => setInvoiceToDelete(null)}
          onConfirm={() => {
            handleDeleteInvoice(invoiceToDelete.id);
            setInvoiceToDelete(null);
          }}
          title="Delete Wholesale Invoice"
          itemName={`Invoice #${invoiceToDelete.invoiceNumber}`}
          itemType="Invoice"
          warningMessage={`Are you sure you want to delete Invoice #${invoiceToDelete.invoiceNumber}? Stock quantities for all crockery items on this bill will be automatically RESTORED back into your warehouse inventory, and the billed debit will be removed from the shop's ledger balance.`}
          details={[
            { label: 'Invoice #', value: invoiceToDelete.invoiceNumber },
            { label: 'Retail Shop', value: shops.find((s) => s.id === invoiceToDelete.shopId)?.name || 'N/A' },
            { label: 'Invoice Date', value: formatDate(invoiceToDelete.date) },
            { label: 'Invoiced Items', value: `${invoiceToDelete.items.length} items` },
            { label: 'Total Billed Amount', value: formatCurrency(invoiceToDelete.netPayable, businessSettings.currency) },
            { label: 'Payment Status', value: invoiceToDelete.status.toUpperCase() },
          ]}
          confirmButtonText="Delete Invoice & Restore Stock"
        />
      )}

      <AddAreaModal
        isOpen={isAddAreaOpen}
        onClose={() => setIsAddAreaOpen(false)}
        onSaveArea={handleSaveArea}
      />

      <AddShopModal
        isOpen={isAddShopOpen}
        onClose={() => setIsAddShopOpen(false)}
        areas={areas}
        defaultAreaId={targetAreaForInvoice}
        onSaveShop={handleSaveShop}
      />

      <SharePortalModal
        isOpen={!!shareModalShop}
        onClose={() => setShareModalShop(null)}
        shop={shareModalShop}
        area={shareModalShop ? areas.find((a) => a.id === shareModalShop.areaId) : undefined}
        currentBalance={shareModalShop ? getShopBalance(shareModalShop.id) : 0}
        totalInvoicesCount={
          shareModalShop ? invoices.filter((i) => i.shopId === shareModalShop.id).length : 0
        }
        onOpenPortalDirectly={(shopId) => {
          setPortalModeShopId(shopId);
          setIsWholesalerPreviewMode(true);
        }}
      />

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        currentPassword={adminPassword}
        onSavePassword={handleSaveNewAdminPassword}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={businessSettings}
        onSaveSettings={handleSaveSettings}
      />
    </div>
  );
}
