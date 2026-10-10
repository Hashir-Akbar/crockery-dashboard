import React, { useState, useEffect } from 'react';
import { AlertTriangle, Trash2, ShieldAlert, Lock, CheckSquare, Square, X } from 'lucide-react';
import { Button } from './Button';

export interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  itemName?: string;
  itemType?: 'Product' | 'Shop' | 'City / Area' | 'Invoice' | string;
  warningMessage?: string;
  details?: { label: string; value: string | number }[];
  confirmButtonText?: string;
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  itemType = 'Item',
  warningMessage,
  details,
  confirmButtonText,
}: ConfirmDeleteModalProps) {
  const [hasAcknowledged, setHasAcknowledged] = useState(false);

  // Reset acknowledgment whenever modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setHasAcknowledged(false);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const resolvedConfirmText =
    confirmButtonText || `Permanently Delete ${itemType}`;

  const handleExecuteDelete = () => {
    if (!hasAcknowledged) return;
    onConfirm();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border-2 border-rose-300 overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]"
      >
        {/* Top Danger Bar Header */}
        <div className="bg-gradient-to-r from-rose-600 via-rose-700 to-red-800 text-white p-4.5 px-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center text-white shrink-0 shadow-inner">
              <ShieldAlert className="w-6 h-6 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest bg-rose-950/60 text-rose-200 px-2 py-0.5 rounded-full border border-rose-400/30">
                  Critical Warning / خطرہ
                </span>
                <span className="text-[11px] font-bold text-rose-100 font-serif">
                  ناقابلِ واپسی کارروائی
                </span>
              </div>
              <h2 className="text-base font-black text-white font-heading mt-0.5 tracking-tight">
                {title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close / Cancel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Danger explanation banner */}
          <div className="flex items-start gap-3 p-3.5 bg-rose-50/90 border border-rose-200 rounded-xl text-rose-900">
            <div className="p-2 bg-rose-100 rounded-lg text-rose-600 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5 text-rose-700" />
            </div>
            <div className="text-xs space-y-1">
              <div className="font-black text-rose-950 text-sm font-heading">
                Permanent Deletion Notice
              </div>
              <p className="text-rose-800 leading-relaxed font-medium">
                {warningMessage ||
                  `You are about to permanently delete this ${itemType.toLowerCase()}${
                    itemName ? ` ("${itemName}")` : ''
                  }. This record will be permanently purged and cannot be recovered.`}
              </p>
            </div>
          </div>

          {/* Record Details Summary */}
          {details && details.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider font-heading">
                  Record Summary to be deleted:
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase px-1.5 py-0.5 bg-white rounded border border-slate-200">
                  {itemType}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {details.map((d, i) => (
                  <div
                    key={i}
                    className="flex flex-col bg-white p-2 rounded-lg border border-slate-200/80 shadow-2xs"
                  >
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">
                      {d.label}
                    </span>
                    <span className="font-bold text-slate-900 truncate mt-0.5 text-xs font-mono">
                      {d.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ACCIDENT-PREVENTION SAFETY CHECKBOX (Never deleted by mistake) */}
          <div
            onClick={() => setHasAcknowledged(!hasAcknowledged)}
            className={`cursor-pointer select-none rounded-xl p-3.5 border-2 transition-all flex items-start gap-3 ${
              hasAcknowledged
                ? 'bg-rose-50/70 border-rose-500 ring-2 ring-rose-300'
                : 'bg-amber-50/60 border-amber-300 hover:border-amber-400'
            }`}
          >
            <div className="mt-0.5 text-rose-600 shrink-0">
              {hasAcknowledged ? (
                <CheckSquare className="w-5 h-5 text-rose-700 fill-rose-100" />
              ) : (
                <Square className="w-5 h-5 text-amber-600" />
              )}
            </div>
            <div className="text-xs">
              <label className="font-black text-slate-900 cursor-pointer block text-xs font-heading">
                Safety Confirmation: I want to permanently delete this {itemType.toLowerCase()}.
              </label>
              <p className="text-slate-600 text-[11px] mt-0.5 leading-snug">
                I understand this action is immediate, permanent, and cannot be undone by accident.
              </p>
              <div className="text-[10px] text-rose-800 font-serif font-bold mt-1">
                (تصدیق: میں سمجھتا ہوں کہ یہ ریکارڈ مکمل ختم ہو جائے گا)
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 px-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            {!hasAcknowledged ? (
              <>
                <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="text-amber-800 font-semibold">
                  Check safety box to unlock delete
                </span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span className="text-rose-700 font-bold">
                  Safety lock unlocked • Ready to delete
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs font-bold text-slate-700 hover:bg-slate-100 h-9 px-4 cursor-pointer"
            >
              Cancel (منسوخ کریں)
            </Button>

            <button
              type="button"
              disabled={!hasAcknowledged}
              onClick={handleExecuteDelete}
              className={`h-9 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                hasAcknowledged
                  ? 'bg-rose-600 hover:bg-rose-700 active:scale-95 text-white shadow-rose-600/30 ring-2 ring-rose-500'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60 border border-slate-300'
              }`}
            >
              {hasAcknowledged ? (
                <Trash2 className="w-4 h-4 text-white" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>{resolvedConfirmText}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
