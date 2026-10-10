import React from 'react';
import { Invoice, Shop, Area, BusinessSettings } from '../types';
import { getStoredBusinessSettings } from '../data/storage';
import { formatCurrency, formatDate } from '../lib/utils';
import {
  Printer,
  Download,
  Share2,
  Check,
  Phone,
  MapPin,
  Truck,
  Calendar,
  FileText,
  Tag,
  PlusCircle,
  MinusCircle,
  Lock,
  Trash2,
} from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Modal } from './ui/Modal';
import { ConfirmDeleteModal } from './ui/ConfirmDeleteModal';

interface InvoiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  shop: Shop | null;
  area: Area | null;
  businessSettings?: BusinessSettings;
  onUpdateStatus?: (invoiceId: string, newStatus: 'paid' | 'partial' | 'unpaid') => void;
  onDeleteInvoice?: (invoiceId: string) => void;
  isAdmin?: boolean;
}

export function InvoiceDetailModal({
  isOpen,
  onClose,
  invoice,
  shop,
  area,
  businessSettings,
  onUpdateStatus,
  onDeleteInvoice,
  isAdmin = true,
}: InvoiceDetailModalProps) {
  const [copied, setCopied] = React.useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = React.useState(false);

  if (!invoice || !shop) return null;

  const settings = businessSettings || getStoredBusinessSettings();

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text =
      `*${settings.name.toUpperCase()} INVOICE*\n` +
      `Invoice #: ${invoice.invoiceNumber}\n` +
      `Date: ${formatDate(invoice.date)}\n` +
      `Shop: ${shop.name} (${area?.name || ''})\n` +
      `Status: ${invoice.status.toUpperCase()}\n` +
      `Subtotal: ${formatCurrency(invoice.subtotal, settings.currency)}\n` +
      `Freight: +${formatCurrency(invoice.freight, settings.currency)}\n` +
      `Discount: -${formatCurrency(invoice.discount, settings.currency)}\n` +
      (invoice.priceAdjustments && invoice.priceAdjustments.length > 0
        ? invoice.priceAdjustments
            .map(
              (a) =>
                `${a.name}: ${a.type === 'add' ? '+' : '-'}${formatCurrency(a.amount, settings.currency)}\n`
            )
            .join('')
        : '') +
      `Previous Balance: ${formatCurrency(invoice.prevBalance, settings.currency)}\n` +
      `Advance Paid: ${formatCurrency(invoice.advancePaid, settings.currency)}\n` +
      `*Net Balance Due: ${formatCurrency(invoice.netPayable, settings.currency)}*\n` +
      `\nThank you for doing business with ${settings.name}!`;
    const url = `https://wa.me/${(shop.whatsapp || shop.phone).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleCopySummary = () => {
    const summary = `Invoice #${invoice.invoiceNumber} for ${shop.name}: Total Net Payable ${formatCurrency(invoice.netPayable, settings.currency)} [Status: ${invoice.status.toUpperCase()}]. Balance due to ${settings.name}.`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Wholesale Invoice: ${invoice.invoiceNumber}`}
      description={`Billed to ${shop.name} on ${formatDate(invoice.date)}`}
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Modal Action Bar (No Print) */}
        <div className="no-print flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
          {/* Status switcher (instant update!) */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase text-slate-700 font-heading">
              Status:
            </span>
            <Badge
              variant={
                invoice.status === 'paid'
                  ? 'success'
                  : invoice.status === 'partial'
                  ? 'warning'
                  : 'destructive'
              }
              className="text-xs px-2.5 py-1 uppercase font-bold"
            >
              {invoice.status} (Auto)
            </Badge>

            {onUpdateStatus && isAdmin && (
              <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
                {(['unpaid', 'partial', 'paid'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => onUpdateStatus(invoice.id, st)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${
                      invoice.status === st
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-transparent text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            )}

            <span className="text-xs text-slate-500 font-medium ml-1">
              Due Date: {invoice.dueDate ? formatDate(invoice.dueDate) : 'On Receipt'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopySummary} className="text-xs">
              {copied ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 mr-1" />}
              {copied ? 'Copied' : 'Copy Summary'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShareWhatsApp}
              className="text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            >
              <Phone className="w-3.5 h-3.5 mr-1" /> WhatsApp Invoice
            </Button>
            <Button size="sm" onClick={handlePrint} className="text-xs bg-slate-900 hover:bg-slate-800 text-white">
              <Printer className="w-3.5 h-3.5 mr-1" /> Print Invoice / PDF
            </Button>
            {onDeleteInvoice && isAdmin && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsConfirmDeleteOpen(true)}
                className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 cursor-pointer"
                title="Delete this invoice"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
              </Button>
            )}
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div className="print-card border border-slate-200 rounded-xl p-6 sm:p-8 bg-white shadow-xs">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-200 pb-6">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <span className="p-2 bg-blue-600 text-white rounded-xl font-black text-xl tracking-wider font-heading">
                  CC
                </span>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-heading">
                    {settings.name.toUpperCase()}
                  </h1>
                  <p className="text-xs font-medium text-slate-500">
                    {settings.tagline}
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-600 mt-2 font-medium">
                {settings.address}
              </p>
              <p className="text-xs text-slate-600">
                Direct Supply Desk: {settings.phone} | Email: {settings.email}
              </p>
            </div>

            <div className="sm:text-right bg-slate-50 sm:bg-transparent p-4 sm:p-0 rounded-lg w-full sm:w-auto">
              <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 font-bold text-xs uppercase tracking-wider rounded border border-blue-200 mb-2 font-mono">
                Wholesale Tax Invoice
              </span>
              <div className="text-xl font-mono font-bold text-slate-900">
                {invoice.invoiceNumber}
              </div>
              <div className="text-xs text-slate-500 mt-1 flex sm:justify-end items-center gap-1">
                <Calendar className="w-3 h-3" /> Date: {formatDate(invoice.date)}
              </div>
              {invoice.dueDate && (
                <div className="text-xs text-slate-500 flex sm:justify-end items-center gap-1">
                  Due: {formatDate(invoice.dueDate)}
                </div>
              )}
              <div className="mt-1 flex sm:justify-end">
                <Badge
                  variant={
                    invoice.status === 'paid'
                      ? 'success'
                      : invoice.status === 'partial'
                      ? 'warning'
                      : 'destructive'
                  }
                  className="text-[10px] uppercase font-bold"
                >
                  Status: {invoice.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Bill To & Dispatch Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-b border-slate-200">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase block mb-1">
                Billed To (Retailer / Shop)
              </span>
              <h3 className="text-base font-bold text-slate-900 font-heading">{shop.name}</h3>
              <p className="text-xs font-semibold text-blue-700 mt-0.5">
                Proprietor: {shop.ownerName}
              </p>
              <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                {shop.address} ({area?.name || 'Area Supply Zone'})
              </p>
              <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
                <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                {shop.phone} {shop.shopNumber ? `• Stall #${shop.shopNumber}` : ''}
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase block mb-1">
                Logistics & Transport Records
              </span>
              {invoice.customFields && invoice.customFields.length > 0 ? (
                <div className="space-y-1.5 text-xs">
                  {invoice.customFields.map((cf) => (
                    <div key={cf.id} className="flex justify-between border-b border-slate-200/60 pb-1">
                      <span className="text-slate-500 font-medium">{cf.label}:</span>
                      <span className="text-slate-900 font-semibold">{cf.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Direct shop delivery / pickup</p>
              )}
              {invoice.paymentTerms && (
                <div className="mt-2 text-xs pt-2 border-t border-slate-200">
                  <span className="text-slate-500 font-medium">Terms:</span>{' '}
                  <span className="text-slate-800">{invoice.paymentTerms}</span>
                </div>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="py-6 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b-2 border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-heading">
                  <th className="py-2.5 px-2 font-bold">#</th>
                  <th className="py-2.5 px-3 font-bold">Item Description & Specification</th>
                  <th className="py-2.5 px-3 font-bold">Unit / Packaging</th>
                  <th className="py-2.5 px-3 font-bold text-center">Qty</th>
                  <th className="py-2.5 px-3 font-bold text-right">Wholesale Rate</th>
                  <th className="py-2.5 px-3 font-bold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-2 text-slate-400 font-mono">{index + 1}</td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-950 font-heading text-sm">{item.name}</div>
                      {item.nameUrdu && (
                        <div className="text-xs font-serif text-slate-800 font-semibold mt-0.5 text-right dir-rtl">
                          {item.nameUrdu}
                        </div>
                      )}
                      {item.variation && (
                        <span className="inline-block mt-1 text-xs bg-slate-100 text-slate-800 font-semibold px-2 py-0.5 rounded font-mono border border-slate-200">
                          {item.variation}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-800 rounded-md text-xs font-bold font-mono">
                        {item.unit}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-800">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-700">
                      {formatCurrency(item.unitPrice, settings.currency)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(item.total, settings.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Calculation Breakdown */}
          <div className="border-t-2 border-slate-200 pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-xs text-slate-600 space-y-2">
              <div className="font-bold uppercase tracking-wider text-slate-400 text-[11px] font-heading">
                Special Notes & Breakage Policy
              </div>
              <p className="text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed font-medium">
                {invoice.notes || settings.terms}
              </p>
              <div className="pt-8 flex justify-between gap-8 print-only">
                <div className="border-t border-slate-400 pt-1 text-center w-40">
                  <span className="text-[11px] font-semibold text-slate-700">Supplier Stamp & Sign</span>
                </div>
                <div className="border-t border-slate-400 pt-1 text-center w-40">
                  <span className="text-[11px] font-semibold text-slate-700">Receiver Stamp & Sign</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal:</span>
                <span className="font-mono font-semibold">{formatCurrency(invoice.subtotal, settings.currency)}</span>
              </div>

              {invoice.freight > 0 && (
                <div className="flex justify-between text-slate-700 font-medium">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-blue-600" /> Freight / Carriage Charges:
                  </span>
                  <span className="font-mono text-blue-700 font-bold">+{formatCurrency(invoice.freight, settings.currency)}</span>
                </div>
              )}

              {invoice.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Discount Allowed:</span>
                  <span className="font-mono font-bold">-{formatCurrency(invoice.discount, settings.currency)}</span>
                </div>
              )}

              {/* Display custom price adjustments that influenced total price! */}
              {invoice.priceAdjustments &&
                invoice.priceAdjustments.map((adj) => (
                  <div
                    key={adj.id}
                    className={`flex justify-between font-medium ${adj.type === 'add' ? 'text-blue-700' : 'text-emerald-700'}`}
                  >
                    <span className="flex items-center gap-1">
                      {adj.type === 'add' ? <PlusCircle className="w-3.5 h-3.5" /> : <MinusCircle className="w-3.5 h-3.5" />}
                      {adj.name}:
                    </span>
                    <span className="font-mono font-bold">
                      {adj.type === 'add' ? '+' : '-'}{formatCurrency(adj.amount, settings.currency)}
                    </span>
                  </div>
                ))}

              <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-slate-800 font-heading">
                <span>Current Invoice Net:</span>
                <span className="font-mono">
                  {formatCurrency(
                    invoice.subtotal +
                      invoice.freight -
                      invoice.discount +
                      (invoice.priceAdjustments?.filter((a) => a.type === 'add').reduce((s, a) => s + a.amount, 0) || 0) -
                      (invoice.priceAdjustments?.filter((a) => a.type === 'deduct').reduce((s, a) => s + a.amount, 0) || 0),
                    settings.currency
                  )}
                </span>
              </div>

              <div className="flex justify-between text-slate-700">
                <span className="text-slate-600">Previous Shop Balance:</span>
                <span className="font-mono font-medium">
                  {invoice.prevBalance >= 0
                    ? `+${formatCurrency(invoice.prevBalance, settings.currency)}`
                    : `-${formatCurrency(Math.abs(invoice.prevBalance), settings.currency)} (Adv)`}
                </span>
              </div>

              {invoice.advancePaid > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Advance / Received on Dispatch:</span>
                  <span className="font-mono font-bold">-{formatCurrency(invoice.advancePaid, settings.currency)}</span>
                </div>
              )}

              <div className="flex justify-between items-center border-t-2 border-slate-900 pt-3 text-sm font-bold text-slate-900 bg-blue-50/80 p-2.5 rounded-lg">
                <span className="text-blue-950 uppercase tracking-tight font-heading">Total Balance Due / Net Payable:</span>
                <span className="font-mono text-base text-blue-900 font-black">
                  {formatCurrency(invoice.netPayable, settings.currency)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Invoice Confirmation Modal */}
      {onDeleteInvoice && (
        <ConfirmDeleteModal
          isOpen={isConfirmDeleteOpen}
          onClose={() => setIsConfirmDeleteOpen(false)}
          onConfirm={() => {
            onDeleteInvoice(invoice.id);
            setIsConfirmDeleteOpen(false);
            onClose();
          }}
          title="Delete Wholesale Invoice"
          itemName={`Invoice #${invoice.invoiceNumber}`}
          itemType="Invoice"
          warningMessage={`Are you sure you want to delete Invoice #${invoice.invoiceNumber}? This will remove the billed debit from ${shop.name}'s ledger and restore the shop balance.`}
          details={[
            { label: 'Invoice #', value: invoice.invoiceNumber },
            { label: 'Shop Name', value: shop.name },
            { label: 'Invoice Date', value: formatDate(invoice.date) },
            { label: 'Total Billed', value: formatCurrency(invoice.netPayable, settings.currency) },
          ]}
          confirmButtonText="Delete Invoice"
        />
      )}
    </Modal>
  );
}
