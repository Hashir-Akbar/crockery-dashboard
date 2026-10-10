import React, { useState, useEffect } from 'react';
import { BusinessSettings } from '../types';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input, Label } from './ui/Input';
import { Building2, Check, MapPin, Phone, Mail, FileText, DollarSign } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: BusinessSettings;
  onSaveSettings: (settings: BusinessSettings) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}: SettingsModalProps) {
  const [formData, setFormData] = useState<BusinessSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Wholesale Business & Dashboard Settings"
      description="Update your crockery business name, depot address, contacts, and currency"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {savedSuccess && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 text-xs font-bold rounded-xl flex items-center justify-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" /> Settings updated successfully across dashboard and invoices!
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label>Wholesale Business / Store Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Asghar Crockery Wholesale"
              required
            />
          </div>

          <div>
            <Label>Currency Symbol</Label>
            <Input
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              placeholder="Rs. or PKR"
              required
            />
          </div>
        </div>

        <div>
          <Label>Business Tagline / Short Description</Label>
          <Input
            value={formData.tagline}
            onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
            placeholder="e.g. Bulk Crockery Importers & Regional Supply Hub"
          />
        </div>

        <div>
          <Label>Depot / Warehouse Address (Appears on Invoices)</Label>
          <Input
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="e.g. Commercial Crockery Central Depot, Shahi Bazaar Road, Sillanwali"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <Label>Desk Phone</Label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+92 300 8400011"
            />
          </div>

          <div>
            <Label>WhatsApp Number</Label>
            <Input
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              placeholder="+92 300 8400011"
            />
          </div>

          <div>
            <Label>Email Address</Label>
            <Input
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="supply@crowncrockery.com"
            />
          </div>
        </div>

        <div>
          <Label>Default Invoice Terms & Breakage Policy</Label>
          <textarea
            value={formData.terms}
            onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
            rows={3}
            placeholder="Goods once checked on delivery are not returnable..."
            className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer">
            Save Settings
          </Button>
        </div>
      </form>
    </Modal>
  );
}
