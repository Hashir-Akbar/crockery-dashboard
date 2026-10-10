import React, { useState } from 'react';
import { Area, Shop } from '../types';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input, Label } from './ui/Input';

interface AddShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  areas: Area[];
  defaultAreaId?: string;
  onSaveShop: (shop: Shop) => void;
}

export function AddShopModal({
  isOpen,
  onClose,
  areas,
  defaultAreaId,
  onSaveShop,
}: AddShopModalProps) {
  const [name, setName] = useState('');
  const [areaId, setAreaId] = useState(defaultAreaId || (areas[0]?.id || ''));
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [shopNumber, setShopNumber] = useState('');
  const [creditLimit, setCreditLimit] = useState<number>(300000);
  const [openingBalance, setOpeningBalance] = useState<number>(0);
  const [notes, setNotes] = useState('');

  // Sync defaultAreaId if updated
  React.useEffect(() => {
    if (defaultAreaId) {
      setAreaId(defaultAreaId);
    } else if (areas.length > 0 && !areaId) {
      setAreaId(areas[0].id);
    }
  }, [defaultAreaId, areas, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !areaId) return;

    const newShop: Shop = {
      id: 'shop-' + Date.now(),
      areaId,
      name: name.trim(),
      ownerName: ownerName.trim() || 'Shop Owner',
      phone: phone.trim() || '+92 300 0000000',
      whatsapp: whatsapp.trim() || phone.trim(),
      address: address.trim() || 'Main Bazaar',
      shopNumber: shopNumber.trim(),
      creditLimit: Number(creditLimit) || 0,
      openingBalance: Number(openingBalance) || 0,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    };

    onSaveShop(newShop);
    // Reset
    setName('');
    setOwnerName('');
    setPhone('');
    setWhatsapp('');
    setAddress('');
    setShopNumber('');
    setOpeningBalance(0);
    setNotes('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Crockery Retail Shop"
      description="Register a shop under Sillanwali or any city to issue invoices and track ledger"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label>Select City / Area *</Label>
            <select
              value={areaId}
              onChange={(e) => setAreaId(e.target.value)}
              className="w-full h-9 text-xs rounded-lg border border-slate-300 bg-white px-2 focus:ring-2 focus:ring-amber-500"
              required
            >
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.city})
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>Shop Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Al-Madina Crockery Store"
              required
              autoFocus
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label>Owner / Proprietor Name *</Label>
            <Input
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="e.g. Haji Abdul Rasheed"
              required
            />
          </div>

          <div>
            <Label>Shop / Stall Number</Label>
            <Input
              value={shopNumber}
              onChange={(e) => setShopNumber(e.target.value)}
              placeholder="e.g. Shop #14, Main Shahi Bazaar"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label>Contact Phone *</Label>
            <Input
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (!whatsapp) setWhatsapp(e.target.value);
              }}
              placeholder="+92 300 1234567"
              required
            />
          </div>

          <div>
            <Label>WhatsApp Number (For Sending Invoices)</Label>
            <Input
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="+92 300 1234567"
            />
          </div>
        </div>

        <div>
          <Label>Complete Street Address in City</Label>
          <Input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. Railway Road, Sillanwali / Katchery Chowk"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div>
            <Label>Opening Balance ($)</Label>
            <Input
              type="number"
              value={openingBalance}
              onChange={(e) => setOpeningBalance(Number(e.target.value) || 0)}
              placeholder="0"
              className="font-mono text-xs"
            />
            <span className="text-[10px] text-slate-500">
              Positive = Shop owes us. Negative = Advance deposit.
            </span>
          </div>

          <div>
            <Label>Approved Credit Limit ($)</Label>
            <Input
              type="number"
              value={creditLimit}
              onChange={(e) => setCreditLimit(Number(e.target.value) || 0)}
              placeholder="500000"
              className="font-mono text-xs"
            />
          </div>
        </div>

        <div>
          <Label>Special Notes & Delivery Instructions</Label>
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Requires wooden crates for bone china, weekly Sillanwali delivery truck"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer">
            Add Shop
          </Button>
        </div>
      </form>
    </Modal>
  );
}
