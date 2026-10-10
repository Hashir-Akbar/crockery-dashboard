import React, { useState } from 'react';
import { Shop, Area } from '../types';
import { formatCurrency } from '../lib/utils';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Copy, Check, ExternalLink, Phone, ShieldCheck, Lock } from 'lucide-react';

interface SharePortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  shop: Shop | null;
  area: Area | undefined;
  currentBalance: number;
  totalInvoicesCount: number;
  onOpenPortalDirectly: (shopId: string) => void;
}

export function SharePortalModal({
  isOpen,
  onClose,
  shop,
  area,
  currentBalance,
  totalInvoicesCount,
  onOpenPortalDirectly,
}: SharePortalModalProps) {
  const [copied, setCopied] = useState(false);

  if (!shop) return null;

  const getPortalUrl = () => {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    return `${origin}${pathname}?portal=true&shopId=${shop.id}`;
  };

  const portalUrl = getPortalUrl();

  const handleCopy = () => {
    navigator.clipboard.writeText(portalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsApp = () => {
    const text =
      `*Assalam-o-Alaikum ${shop.ownerName}!*\n\n` +
      `Here is your online account & invoice portal for *${shop.name}* (${area?.name || 'Crockery Supply'}):\n\n` +
      `📦 *Account Summary:*\n` +
      `• Total Invoices: ${totalInvoicesCount}\n` +
      `• *Current Balance: ${formatCurrency(currentBalance)} ${
        currentBalance > 0 ? '(Pending Balance Due)' : currentBalance < 0 ? '(Advance Surplus)' : '(Clear)'
      }*\n\n` +
      `🔗 *View All Invoices & Ledger Online:*\n${portalUrl}\n\n` +
      `You can check all past invoices with item breakdowns, freight, discounts, and payment history at any time.`;

    const url = `https://wa.me/${(shop.whatsapp || shop.phone).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share Shop Owner Portal Link"
      description={`Generate client-only ledger & invoices link for ${shop.name}`}
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Security protection banner */}
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/25 rounded-2xl flex items-start gap-3">
          <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-950 leading-relaxed">
            <strong>Client-Only Protected Link:</strong> When the shop owner opens this link, they see <em>only their own store's invoices and khata</em>. They <strong>cannot access or view your wholesale dashboard</strong>.
          </div>
        </div>

        {/* Link copy box */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
            Permanent Shop Portal Link
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={portalUrl}
              className="flex-1 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 select-all focus:outline-none"
            />
            <Button
              type="button"
              onClick={handleCopy}
              className="shrink-0 text-xs h-9 bg-blue-600 hover:bg-blue-700 text-white font-bold"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1" /> Copy Link
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            type="button"
            onClick={handleWhatsApp}
            className="w-full text-xs h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
          >
            <Phone className="w-4 h-4 mr-1.5" /> Share on WhatsApp
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onClose();
              onOpenPortalDirectly(shop.id);
            }}
            className="w-full text-xs h-10 border-blue-200 text-blue-700 bg-blue-50/50 hover:bg-blue-100 font-bold cursor-pointer"
          >
            <ExternalLink className="w-4 h-4 mr-1.5" /> Preview Client Portal
          </Button>
        </div>

        <div className="text-[11px] text-slate-400 text-center pt-2 border-t border-slate-100">
          Syncs automatically in real time whenever you create an invoice or receive an advance.
        </div>
      </div>
    </Modal>
  );
}
