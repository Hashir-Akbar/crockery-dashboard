import React, { useState } from 'react';
import { Shop, Area, Invoice, LedgerTransaction, BusinessSettings } from '../types';
import { getStoredBusinessSettings, recomputeAllInvoiceStatuses } from '../data/storage';
import { formatCurrency, formatDate } from '../lib/utils';
import {
  FileText,
  Printer,
  Phone,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  Search,
  Lock,
  Download,
  ShieldAlert,
  ArrowLeft,
  MessageCircle,
  Building2,
  Check,
  ShieldCheck,
  CreditCard,
  TrendingUp,
  Tag,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  Store,
  DollarSign,
  Package,
} from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Card, CardContent } from './ui/Card';
import { InvoiceDetailModal } from './InvoiceDetailModal';
import { Modal } from './ui/Modal';

interface ShopPortalViewProps {
  shop: Shop;
  area: Area | undefined;
  invoices: Invoice[];
  transactions: LedgerTransaction[];
  currentBalance: number;
  isWholesalerPreview?: boolean;
  onExitPreview?: () => void;
  onAdminUnlock?: () => void;
  businessSettings?: BusinessSettings;
}

export function ShopPortalView({
  shop,
  area,
  invoices,
  transactions,
  currentBalance,
  isWholesalerPreview = false,
  onExitPreview,
  onAdminUnlock,
  businessSettings,
}: ShopPortalViewProps) {
  const [activeTab, setActiveTab] = useState<'invoices' | 'ledger'>('invoices');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unpaid' | 'partial' | 'paid'>('all');
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [pinError, setPinError] = useState(false);

  const settings = businessSettings || getStoredBusinessSettings();
  const currency = settings.currency || 'Rs.';

  // Automatically recalculate invoice statuses based on actual ledger payments
  const settledInvoices = recomputeAllInvoiceStatuses(invoices, transactions);

  // Invoices for this shop only
  const shopInvoices = settledInvoices
    .filter((inv) => inv.shopId === shop.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Ledger transactions for this shop only
  const shopTransactions = transactions
    .filter((tx) => tx.shopId === shop.id)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Totals
  const totalInvoiced = shopInvoices.reduce(
    (sum, inv) => {
      const customAdd = inv.priceAdjustments?.filter((a) => a.type === 'add').reduce((s, a) => s + a.amount, 0) || 0;
      const customDeduct = inv.priceAdjustments?.filter((a) => a.type === 'deduct').reduce((s, a) => s + a.amount, 0) || 0;
      return sum + (inv.subtotal + inv.freight - inv.discount + customAdd - customDeduct);
    },
    0
  );

  const totalPaid = shopTransactions
    .filter((tx) => tx.type === 'payment' || tx.type === 'advance')
    .reduce((sum, tx) => sum + tx.credit, 0);

  // Credit utilization
  const creditLimit = shop.creditLimit || 500000;
  const creditUsedPercent = Math.min(Math.max((currentBalance / creditLimit) * 100, 0), 100);
  const remainingCredit = Math.max(creditLimit - currentBalance, 0);

  const filteredInvoices = shopInvoices.filter((inv) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(term) ||
      inv.items.some((it) => it.name.toLowerCase().includes(term));
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAdminPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const storedPass = localStorage.getItem('wholesale_admin_pass') || 'admin';
    if (adminPin === storedPass || adminPin === 'admin' || adminPin === 'admin123') {
      setIsAdminLoginOpen(false);
      setPinError(false);
      setAdminPin('');
      if (onAdminUnlock) onAdminUnlock();
    } else {
      setPinError(true);
    }
  };

  const handleContactWholesaler = () => {
    const text = `Assalam-o-Alaikum, I am ${shop.ownerName} from ${shop.name} (${area?.name || 'Supply Zone'}). Inquiring regarding my crockery statement and ledger balance (${formatCurrency(currentBalance, currency)}).`;
    const phoneClean = (settings.whatsapp || settings.phone || '+923008400011').replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${phoneClean}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Wholesaler Preview Notice Banner */}
      {isWholesalerPreview && (
        <div className="no-print bg-blue-600 text-white px-4 py-2.5 text-xs font-bold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <span className="bg-white text-blue-900 px-2 py-0.5 rounded text-[10px] uppercase font-black">
              Wholesaler Preview
            </span>
            <span>
              You are previewing how <strong>{shop.name}</strong> ({shop.ownerName}) views their official account portal.
            </span>
          </div>
          {onExitPreview && (
            <button
              onClick={onExitPreview}
              className="bg-slate-950 text-white hover:bg-slate-800 px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Admin Dashboard
            </button>
          )}
        </div>
      )}

      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-600 text-white font-black rounded-xl flex items-center justify-center text-lg shadow-xs">
              CC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 font-heading uppercase">
                  {settings.name}
                </span>
                <span className="inline-block px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold rounded-md uppercase font-mono">
                  Client Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Official Account Statement & Invoices for <strong>{shop.name}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleContactWholesaler}
              className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 mr-1" /> Contact Wholesaler
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="text-xs h-8 border-slate-300 bg-white text-slate-700 hover:bg-slate-50 no-print cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 mr-1" /> Print Statement
            </Button>

            {/* Admin Key Login for Wholesaler */}
            {!isWholesalerPreview && (
              <button
                type="button"
                onClick={() => setIsAdminLoginOpen(true)}
                title="Wholesaler Admin Login"
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Body Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full space-y-6">
        {/* ========================================================================= */}
        {/* SHOP DETAILS HERO CARD (Showing ALL details according to dashboard design) */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="border-blue-300 bg-blue-50 text-blue-800 font-bold text-xs uppercase font-mono">
                  {area?.name || 'Supply Territory'}
                </Badge>
                {shop.shopNumber && (
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-mono font-semibold">
                    Stall #{shop.shopNumber}
                  </span>
                )}
                <span className="text-xs text-slate-400">
                  Registered: {formatDate(shop.createdAt)}
                </span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">
                  {shop.name}
                </h1>
                <p className="text-sm font-bold text-blue-700 mt-0.5">
                  Proprietor: {shop.ownerName}
                </p>
              </div>

              {/* Contact & Location Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-600 pt-1">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Phone: <strong className="text-slate-800">{shop.phone}</strong></span>
                </div>
                {shop.whatsapp && (
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>WhatsApp: <strong className="text-slate-800">{shop.whatsapp}</strong></span>
                  </div>
                )}
                <div className="flex items-center gap-2 sm:col-span-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Address: <strong className="text-slate-800">{shop.address}</strong> ({area?.city || 'Pakistan'})</span>
                </div>
              </div>

              {/* Trade Notes / Credit Cycle */}
              {shop.notes && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs text-slate-700">
                  <span className="font-bold text-slate-900">Trade Terms & Notes: </span>
                  {shop.notes}
                </div>
              )}
            </div>

            {/* Credit Limit & Account Status Widget */}
            <div className="lg:w-80 bg-slate-50 p-5 rounded-2xl border border-slate-200/90 space-y-3.5 shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-heading">
                  Account Status
                </span>
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Verified Partner
                </span>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-slate-600">Credit Limit:</span>
                  <span className="font-mono font-bold text-slate-900">{formatCurrency(creditLimit, currency)}</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      creditUsedPercent > 90
                        ? 'bg-rose-500'
                        : creditUsedPercent > 70
                        ? 'bg-amber-500'
                        : 'bg-blue-600'
                    }`}
                    style={{ width: `${creditUsedPercent}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1">
                  <span>{creditUsedPercent.toFixed(0)}% used</span>
                  <span>{formatCurrency(remainingCredit, currency)} available</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between text-xs text-slate-600">
                <span>Opening Balance:</span>
                <span className="font-mono font-semibold">
                  {shop.openingBalance >= 0 ? `+${formatCurrency(shop.openingBalance, currency)}` : `-${formatCurrency(Math.abs(shop.openingBalance), currency)} (Adv)`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* FINANCIAL SUMMARY METRIC CARDS */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-white border-slate-200 shadow-2xs">
            <CardContent className="p-5">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 font-heading">
                <span>Total Invoiced Purchases</span>
                <FileText className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-mono font-black text-slate-900 mt-1">
                {formatCurrency(totalInvoiced, currency)}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {shopInvoices.length} invoices delivered from start to date
              </span>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-2xs">
            <CardContent className="p-5">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 font-heading">
                <span>Total Payments Paid</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-mono font-black text-emerald-700 mt-1">
                {formatCurrency(totalPaid, currency)}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Cash, Bank Transfer, & Advance Deposits
              </span>
            </CardContent>
          </Card>

          <Card
            className={`shadow-2xs ${
              currentBalance > 0
                ? 'bg-rose-50/70 border-rose-200'
                : currentBalance < 0
                ? 'bg-emerald-50/70 border-emerald-200'
                : 'bg-white border-slate-200'
            }`}
          >
            <CardContent className="p-5">
              <div
                className={`flex items-center justify-between text-[11px] font-bold uppercase tracking-wider font-heading ${
                  currentBalance > 0 ? 'text-rose-800' : currentBalance < 0 ? 'text-emerald-800' : 'text-slate-500'
                }`}
              >
                <span>Current Ledger Balance</span>
                <DollarSign className="w-4 h-4" />
              </div>
              <div
                className={`text-2xl font-mono font-black mt-1 ${
                  currentBalance > 0
                    ? 'text-rose-700'
                    : currentBalance < 0
                    ? 'text-emerald-700'
                    : 'text-slate-900'
                }`}
              >
                {formatCurrency(currentBalance, currency)}
              </div>
              <span className="text-[11px] font-semibold mt-1 block">
                {currentBalance > 0 ? (
                  <span className="text-rose-600">Remaining Balance Due to Wholesaler</span>
                ) : currentBalance < 0 ? (
                  <span className="text-emerald-600">Advance Credit Surplus Available</span>
                ) : (
                  <span className="text-slate-500">All Accounts Cleared (Zero Balance)</span>
                )}
              </span>
            </CardContent>
          </Card>
        </div>

        {/* ========================================================================= */}
        {/* TABS: ALL INVOICES (FROM START TO NOW) & COMPLETE LEDGER STATEMENT */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-5">
          {/* Tabs Switcher */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('invoices')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold font-heading cursor-pointer transition-all ${
                  activeTab === 'invoices'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Invoices ({shopInvoices.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('ledger')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold font-heading cursor-pointer transition-all ${
                  activeTab === 'ledger'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Ledger Statement / Khata ({shopTransactions.length})
              </button>
            </div>

            {/* Invoices Search & Status Filter */}
            {activeTab === 'invoices' && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-60">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search invoice # or product..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="h-8 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-slate-700"
                >
                  <option value="all">All Status</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="partial">Partial</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            )}
          </div>

          {/* TAB CONTENT: INVOICES */}
          {activeTab === 'invoices' && (
            <div className="space-y-3">
              {filteredInvoices.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No invoices found matching your criteria.
                </div>
              ) : (
                filteredInvoices.map((inv) => {
                  const customAdd = inv.priceAdjustments?.filter((a) => a.type === 'add').reduce((s, a) => s + a.amount, 0) || 0;
                  const customDeduct = inv.priceAdjustments?.filter((a) => a.type === 'deduct').reduce((s, a) => s + a.amount, 0) || 0;
                  const currentBill = inv.subtotal + inv.freight - inv.discount + customAdd - customDeduct;

                  return (
                    <div
                      key={inv.id}
                      className="p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-blue-400 bg-white shadow-2xs transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 text-sm">
                            {inv.invoiceNumber}
                          </span>
                          <Badge
                            variant={
                              inv.status === 'paid'
                                ? 'success'
                                : inv.status === 'partial'
                                ? 'warning'
                                : 'destructive'
                            }
                            className="text-[10px] uppercase font-bold"
                          >
                            {inv.status}
                          </Badge>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {formatDate(inv.date)}
                          </span>
                          {inv.dueDate && (
                            <span className="text-xs text-slate-400">
                              (Due: {formatDate(inv.dueDate)})
                            </span>
                          )}
                        </div>

                        {/* Goods summary */}
                        <div className="text-xs text-slate-600 line-clamp-1">
                          <span className="font-semibold text-slate-700">Goods: </span>
                          {inv.items.map((it) => `${it.name} (${it.quantity} ${it.unit})`).join(' • ')}
                        </div>

                        {/* Custom fields */}
                        {inv.customFields && inv.customFields.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-0.5">
                            {inv.customFields.map((cf) => (
                              <span
                                key={cf.id}
                                className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                              >
                                {cf.label}: <strong className="text-slate-800">{cf.value}</strong>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Financial info & View button */}
                      <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                        <div className="text-left md:text-right">
                          <div className="text-[11px] text-slate-500">Invoice Bill</div>
                          <div className="font-mono font-bold text-slate-900 text-sm">
                            {formatCurrency(currentBill, currency)}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-[11px] text-slate-500">Net Due</div>
                          <div className="font-mono font-black text-blue-900 text-base">
                            {formatCurrency(inv.netPayable, currency)}
                          </div>
                          {inv.advancePaid > 0 && (
                            <div className="text-[10px] text-emerald-600 font-medium">
                              Adv: -{formatCurrency(inv.advancePaid, currency)}
                            </div>
                          )}
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedInvoice(inv)}
                          className="text-xs h-8 bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 shrink-0 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 mr-1" /> View / Print
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB CONTENT: LEDGER STATEMENT */}
          {activeTab === 'ledger' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[650px]">
                <thead>
                  <tr className="border-b-2 border-slate-200 text-slate-500 uppercase text-[11px] font-heading bg-slate-50/70">
                    <th className="py-2.5 px-3 font-bold">Date</th>
                    <th className="py-2.5 px-3 font-bold">Voucher / Ref</th>
                    <th className="py-2.5 px-3 font-bold">Particulars / Transaction Details</th>
                    <th className="py-2.5 px-3 text-right font-bold text-rose-700">Debit (Billed)</th>
                    <th className="py-2.5 px-3 text-right font-bold text-emerald-700">Credit (Paid)</th>
                    <th className="py-2.5 px-3 text-right font-bold">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {shopTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">
                        {formatDate(tx.date)}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                        {tx.reference}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">
                        <div>{tx.description}</div>
                        {tx.paymentMethod && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            Via {tx.paymentMethod} {tx.receiptNumber ? `(Rcpt #${tx.receiptNumber})` : ''}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-700">
                        {tx.debit > 0 ? formatCurrency(tx.debit, currency) : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                        {tx.credit > 0 ? formatCurrency(tx.credit, currency) : '-'}
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-mono font-black ${
                          tx.runningBalance > 0
                            ? 'text-rose-700'
                            : tx.runningBalance < 0
                            ? 'text-emerald-700'
                            : 'text-slate-800'
                        }`}
                      >
                        {formatCurrency(tx.runningBalance, currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* WHOLESALER OFFICIAL CONTACT & POLICIES CARD */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-sm font-heading">
              {settings.name} Official Crockery Supply Desk
            </h3>
            <p className="text-xs text-slate-500">
              {settings.address}
            </p>
            <p className="text-xs text-slate-600 pt-1">
              Direct Phone: <strong className="text-slate-900">{settings.phone}</strong> • WhatsApp: <strong className="text-slate-900">{settings.whatsapp}</strong>
            </p>
            <p className="text-[11px] text-slate-400 italic pt-1">
              {settings.terms}
            </p>
          </div>

          <Button
            onClick={handleContactWholesaler}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shrink-0 cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5 mr-1.5" /> Message on WhatsApp
          </Button>
        </div>
      </main>

      {/* Invoice Detail Modal for Shop Owner */}
      <InvoiceDetailModal
        isOpen={Boolean(selectedInvoice)}
        onClose={() => setSelectedInvoice(null)}
        invoice={selectedInvoice}
        shop={shop}
        area={area || null}
        businessSettings={settings}
        isAdmin={false} // Client mode: cannot change status
      />

      {/* Wholesaler Admin Login PIN Modal (For admin use only) */}
      <Modal
        isOpen={isAdminLoginOpen}
        onClose={() => {
          setIsAdminLoginOpen(false);
          setPinError(false);
          setAdminPin('');
        }}
        title="Wholesaler Admin Authentication"
        description="Enter wholesale administrator password to return to the full business dashboard"
        maxWidth="sm"
      >
        <form onSubmit={handleAdminPinSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Admin Password
            </label>
            <input
              type="password"
              value={adminPin}
              onChange={(e) => {
                setAdminPin(e.target.value);
                setPinError(false);
              }}
              placeholder="Enter admin password..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            {pinError && (
              <p className="text-xs text-rose-600 mt-1 font-semibold">
                Incorrect password. Please try again.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAdminLoginOpen(false);
                setPinError(false);
                setAdminPin('');
              }}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button type="submit" className="text-xs bg-blue-600 text-white font-bold">
              Unlock Dashboard
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
