import React, { useState } from 'react';
import { Shop, LedgerTransaction, Invoice } from '../types';
import { formatCurrency } from '../lib/utils';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input, Label } from './ui/Input';
import { DollarSign, CheckCircle2 } from 'lucide-react';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  shop: Shop | null;
  currentBalance: number;
  invoices?: Invoice[];
  onSavePayment: (transaction: Omit<LedgerTransaction, 'id' | 'runningBalance'>) => void;
  onUpdateInvoiceStatus?: (invoiceId: string, newStatus: 'paid' | 'partial' | 'unpaid') => void;
  currency?: string;
}

export function RecordPaymentModal({
  isOpen,
  onClose,
  shop,
  currentBalance,
  invoices = [],
  onSavePayment,
  onUpdateInvoiceStatus,
  currency = 'Rs.',
}: RecordPaymentModalProps) {
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [isAdvance, setIsAdvance] = useState<boolean>(currentBalance <= 0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Bank Transfer' | 'Cheque' | 'Online/UPI' | 'Advance Credit'>('Cash');
  const [reference, setReference] = useState<string>(() => `RCPT-${Math.floor(1000 + Math.random() * 9000)}`);
  const [description, setDescription] = useState<string>('Payment received on account');
  const [notes, setNotes] = useState<string>('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');
  const [markInvoiceStatus, setMarkInvoiceStatus] = useState<'paid' | 'partial'>('paid');

  if (!shop) return null;

  // Unpaid or partial invoices for this shop
  const pendingInvoices = invoices.filter(
    (inv) => inv.shopId === shop.id && (inv.status === 'unpaid' || inv.status === 'partial')
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      alert('Please enter a valid amount greater than 0.');
      return;
    }

    onSavePayment({
      shopId: shop.id,
      date,
      type: isAdvance ? 'advance' : 'payment',
      reference: reference.trim() || `RCPT-${Date.now()}`,
      description: description.trim() || (isAdvance ? 'Advance deposit received' : 'Payment received'),
      debit: 0,
      credit: Number(amount),
      paymentMethod,
      invoiceId: selectedInvoiceId || undefined,
      receiptNumber: reference.trim(),
      notes,
    });

    // If an invoice was selected to settle, update its status automatically!
    if (selectedInvoiceId && onUpdateInvoiceStatus) {
      const linkedInv = invoices.find((i) => i.id === selectedInvoiceId);
      const isFull = linkedInv ? Number(amount) >= linkedInv.netPayable - 0.5 : false;
      const autoSt = isFull ? 'paid' : Number(amount) > 0 ? 'partial' : 'unpaid';
      onUpdateInvoiceStatus(selectedInvoiceId, autoSt);
    }

    onClose();
    setAmount(0);
    setSelectedInvoiceId('');
  };

  const remainingBalanceAfter = currentBalance - (Number(amount) || 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Receive Payment / Advance: ${shop.name}`}
      description={`Record collection from ${shop.ownerName}. Automatically updates ledger balance and invoice status.`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Balance Status Banner */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">
              Current Outstanding Balance
            </div>
            <div className={`text-lg font-mono font-black ${currentBalance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {formatCurrency(currentBalance, currency)}
              {currentBalance > 0 ? ' (Owed by Shop)' : currentBalance < 0 ? ' (Advance Surplus)' : ' (Clear)'}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-400 block">Phone</span>
            <span className="text-xs font-semibold text-slate-700">{shop.phone}</span>
          </div>
        </div>

        {/* Transaction Type Choice */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setIsAdvance(false);
              setDescription('Regular payment against outstanding invoices');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
              !isAdvance
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs font-bold'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Payment Against Dues
          </button>
          <button
            type="button"
            onClick={() => {
              setIsAdvance(true);
              setDescription('Advance deposit for upcoming bulk crockery order');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
              isAdvance
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs font-extrabold'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Advance Booking Deposit
          </button>
        </div>

        {/* Amount */}
        <div>
          <Label className="text-emerald-800">Amount Received *</Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <Input
              type="number"
              min="1"
              step="0.01"
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
              placeholder="Enter amount..."
              className="pl-9 text-base font-bold font-mono text-emerald-700"
              required
              autoFocus
            />
          </div>
        </div>

        {/* Quick Fill Buttons */}
        {currentBalance > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Quick fill:</span>
            <button
              type="button"
              onClick={() => setAmount(currentBalance)}
              className="text-[11px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-mono font-medium cursor-pointer"
            >
              Full Clear ({formatCurrency(currentBalance, currency)})
            </button>
            <button
              type="button"
              onClick={() => setAmount(Math.round(currentBalance / 2))}
              className="text-[11px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-mono font-medium cursor-pointer"
            >
              50% Partial ({formatCurrency(Math.round(currentBalance / 2), currency)})
            </button>
          </div>
        )}

        {/* Optional: Link payment to specific pending invoice to update its status */}
        {pendingInvoices.length > 0 && (
          <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 space-y-2">
            <Label className="text-blue-900 text-xs font-bold flex items-center justify-between">
              <span>Link Payment to Invoice (Optional)</span>
              <span className="text-[10px] text-blue-700 font-normal">Auto-updates invoice status</span>
            </Label>
            <select
              value={selectedInvoiceId}
              onChange={(e) => setSelectedInvoiceId(e.target.value)}
              className="w-full h-8 text-xs rounded-lg border border-blue-300 bg-white px-2 focus:ring-1 focus:ring-blue-500 font-mono"
            >
              <option value="">-- No specific invoice (General Payment) --</option>
              {pendingInvoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoiceNumber} - Bill: {formatCurrency(inv.netPayable, currency)} ({inv.status.toUpperCase()})
                </option>
              ))}
            </select>

            {selectedInvoiceId && (
              (() => {
                const linked = pendingInvoices.find((i) => i.id === selectedInvoiceId);
                const isFull = linked ? Number(amount) >= linked.netPayable - 0.5 : false;
                const autoSt = isFull ? 'paid' : Number(amount) > 0 ? 'partial' : 'unpaid';
                return (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-blue-200 text-xs mt-1">
                    <span className="text-slate-600 font-semibold">Automatic Status on Record:</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-black uppercase ${
                        autoSt === 'paid'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      {autoSt === 'paid' ? 'Fully Paid' : 'Partial Paid'}
                    </span>
                  </div>
                );
              })()
            )}
          </div>
        )}

        {/* Payment Method & Date */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Payment Mode</Label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="w-full h-9 text-xs rounded-lg border border-slate-300 bg-white px-2 focus:ring-2 focus:ring-amber-500 font-medium"
            >
              <option value="Cash">Cash in Hand</option>
              <option value="Bank Transfer">Bank Transfer (Online)</option>
              <option value="Cheque">Crossed Cheque</option>
              <option value="Online/UPI">Online / Digital Slip</option>
              <option value="Advance Credit">Advance Adjustment</option>
            </select>
          </div>

          <div>
            <Label>Receipt / Voucher #</Label>
            <Input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="text-xs font-mono font-semibold"
              required
            />
          </div>
        </div>

        <div>
          <Label>Transaction Date</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="text-xs"
            required
          />
        </div>

        <div>
          <Label>Description / Note</Label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Cleared via Cheque #3491 or Cash handed over"
            className="text-xs"
          />
        </div>

        {/* Balance Preview */}
        <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-xs">
          <div className="flex justify-between items-center text-slate-800">
            <span>New Balance After Transaction:</span>
            <span className={`font-mono font-bold ${remainingBalanceAfter > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
              {formatCurrency(remainingBalanceAfter, currency)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer">
            Record in Khata / Ledger
          </Button>
        </div>
      </form>
    </Modal>
  );
}
