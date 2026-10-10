import React, { useState, useEffect } from 'react';
import { Area, Shop, Invoice, InvoiceItem, InvoiceCustomField, InvoicePriceAdjustment, InventoryProduct } from '../types';
import { calculateShopCurrentBalance, getStoredUnits, getStoredCategories } from '../data/storage';
import { formatCurrency } from '../lib/utils';
import {
  Plus,
  Trash2,
  Tag,
  Truck,
  Percent,
  CreditCard,
  Sparkles,
  Search,
  Check,
  Package,
  Layers,
  ChevronDown,
  DollarSign,
  TrendingUp,
  MinusCircle,
  PlusCircle,
  Lock,
  Palette,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { Button } from './ui/Button';
import { Input, Label } from './ui/Input';
import { Modal } from './ui/Modal';
import { Badge } from './ui/Badge';

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  areas: Area[];
  shops: Shop[];
  catalog: InventoryProduct[];
  defaultShopId?: string;
  defaultAreaId?: string;
  onSaveInvoice: (invoice: Invoice) => void;
  currency?: string;
}

export function CreateInvoiceModal({
  isOpen,
  onClose,
  areas,
  shops,
  catalog,
  defaultShopId,
  defaultAreaId,
  onSaveInvoice,
  currency = 'Rs.',
}: CreateInvoiceModalProps) {
  const [selectedAreaId, setSelectedAreaId] = useState<string>(defaultAreaId || '');
  const [selectedShopId, setSelectedShopId] = useState<string>(defaultShopId || '');

  const [invoiceDate, setInvoiceDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split('T')[0];
  });
  const [invoiceNumber, setInvoiceNumber] = useState<string>(
    () => `CRK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
  );

  // Line items
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: 'item-' + Date.now(),
      productId: 'prod-1',
      name: '72-Pc Royal Bone China Dinner Set (24k Gold Trim)',
      nameUrdu: '72 عدد رائل بون چائنا ڈنر سیٹ (24 قیراط سنہری کنارہ)',
      category: 'Dinner Sets',
      unit: 'Sets',
      quantity: 2,
      purchasePrice: 14000,
      unitPrice: 18500,
      total: 37000,
      variation: 'Imperial 24k Gold Trim',
    },
  ]);

  // Standard Financial fields
  const [freight, setFreight] = useState<number>(1500);
  const [discount, setDiscount] = useState<number>(1000);
  const [discountType, setDiscountType] = useState<'fixed' | 'percentage'>('fixed');
  const [prevBalance, setPrevBalance] = useState<number>(0);
  const [advancePaid, setAdvancePaid] = useState<number>(0);
  const [paymentTerms, setPaymentTerms] = useState<string>('Standard 15-day wholesale credit terms');
  const [notes, setNotes] = useState<string>('Fragile glassware & ceramics packed with protective bubble wrap & wooden crate');

  // Status Selector (Automatic by financial logic: Paid / Partial / Unpaid)
  const [status, setStatus] = useState<'paid' | 'partial' | 'unpaid'>('unpaid');

  // Custom Fields (Text / Logistics)
  const [customFields, setCustomFields] = useState<InvoiceCustomField[]>([
    { id: 'cf-1', label: 'Bilty Number', value: '' },
    { id: 'cf-2', label: 'Goods Transport Carrier', value: '' },
    { id: 'cf-3', label: 'Total Wooden Crates / Cartons', value: '' },
  ]);
  const [newFieldLabel, setNewFieldLabel] = useState<string>('');

  // CUSTOM PRICE-INFLUENCING FIELDS (+ Charges / - Deductions that directly influence total price)
  // Started empty - NO default Mazdoori loading charges!
  const [priceAdjustments, setPriceAdjustments] = useState<InvoicePriceAdjustment[]>([]);
  const [newAdjustmentName, setNewAdjustmentName] = useState<string>('');
  const [newAdjustmentType, setNewAdjustmentType] = useState<'add' | 'deduct'>('add');
  const [newAdjustmentAmount, setNewAdjustmentAmount] = useState<number>(0);

  // Enhanced Catalog Product Search & Picker
  const [productSearchTerm, setProductSearchTerm] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [isCatalogDrawerOpen, setIsCatalogDrawerOpen] = useState<boolean>(false);

  // Auto configure area and shop on open
  useEffect(() => {
    if (defaultShopId) {
      setSelectedShopId(defaultShopId);
      const matchedShop = shops.find((s) => s.id === defaultShopId);
      if (matchedShop) {
        setSelectedAreaId(matchedShop.areaId);
      }
    } else if (defaultAreaId) {
      setSelectedAreaId(defaultAreaId);
      const filtered = shops.filter((s) => s.areaId === defaultAreaId);
      if (filtered.length > 0 && !selectedShopId) {
        setSelectedShopId(filtered[0].id);
      }
    } else if (areas.length > 0 && !selectedAreaId) {
      setSelectedAreaId(areas[0].id);
    }
  }, [defaultShopId, defaultAreaId, areas, shops, isOpen]);

  // When selected shop changes, auto-fetch current ledger previous balance!
  useEffect(() => {
    if (selectedShopId) {
      const liveBal = calculateShopCurrentBalance(selectedShopId);
      setPrevBalance(liveBal);
    }
  }, [selectedShopId, isOpen]);

  const handleShopChange = (shopId: string) => {
    setSelectedShopId(shopId);
    const shop = shops.find((s) => s.id === shopId);
    if (shop) {
      setSelectedAreaId(shop.areaId);
      const bal = calculateShopCurrentBalance(shopId);
      setPrevBalance(bal);
    }
  };

  const handleAreaChange = (areaId: string) => {
    setSelectedAreaId(areaId);
    const shopsInArea = shops.filter((s) => s.areaId === areaId);
    if (shopsInArea.length > 0) {
      setSelectedShopId(shopsInArea[0].id);
      setPrevBalance(calculateShopCurrentBalance(shopsInArea[0].id));
    } else {
      setSelectedShopId('');
      setPrevBalance(0);
    }
  };

  // Line item handlers
  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const updated = [...items];
    const current = { ...updated[index], [field]: value };

    if (field === 'name') {
      const match = catalog.find(
        (c) => c.name.toLowerCase() === String(value).trim().toLowerCase()
      );
      if (match) {
        current.productId = match.id;
        current.purchasePrice = match.purchasePrice;
        if (!current.unitPrice || current.unitPrice === 0) {
          current.unitPrice = match.wholesalePrice;
        }
        if (match.unit) current.unit = match.unit;
        if (match.nameUrdu && !current.nameUrdu) current.nameUrdu = match.nameUrdu;
      }
    }

    if (field === 'quantity' || field === 'unitPrice') {
      const qty = field === 'quantity' ? Number(value) || 0 : current.quantity;
      const rate = field === 'unitPrice' ? Number(value) || 0 : current.unitPrice;
      current.total = qty * rate;
    }
    updated[index] = current;
    setItems(updated);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: 'item-' + Date.now(),
        name: '',
        nameUrdu: '',
        category: 'General Tableware',
        unit: 'Sets',
        quantity: 1,
        purchasePrice: 0,
        unitPrice: 0,
        total: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleAddCatalogItem = (catItem: InventoryProduct) => {
    setItems([
      ...items,
      {
        id: 'item-' + Date.now(),
        productId: catItem.id,
        name: catItem.name,
        nameUrdu: catItem.nameUrdu,
        category: catItem.category,
        unit: catItem.unit,
        quantity: 1,
        purchasePrice: catItem.purchasePrice, // Read-only factory cost
        unitPrice: catItem.wholesalePrice,    // Selling rate
        total: catItem.wholesalePrice,
        variation: catItem.variations?.[0]?.name,
      },
    ]);
  };

  // Custom Informational Field Handlers
  const handleCustomFieldChange = (id: string, value: string) => {
    setCustomFields(
      customFields.map((cf) => (cf.id === id ? { ...cf, value } : cf))
    );
  };

  const handleAddNewCustomField = () => {
    if (!newFieldLabel.trim()) return;
    setCustomFields([
      ...customFields,
      {
        id: 'cf-' + Date.now(),
        label: newFieldLabel.trim(),
        value: '',
      },
    ]);
    setNewFieldLabel('');
  };

  const handleRemoveCustomField = (id: string) => {
    setCustomFields(customFields.filter((cf) => cf.id !== id));
  };

  // Custom Price-Influencing Adjustment Handlers
  const handleAddPriceAdjustment = () => {
    if (!newAdjustmentName.trim() || newAdjustmentAmount <= 0) return;
    setPriceAdjustments([
      ...priceAdjustments,
      {
        id: 'adj-' + Date.now(),
        name: newAdjustmentName.trim(),
        type: newAdjustmentType,
        amount: Number(newAdjustmentAmount),
      },
    ]);
    setNewAdjustmentName('');
    setNewAdjustmentAmount(0);
  };

  const handleRemovePriceAdjustment = (id: string) => {
    setPriceAdjustments(priceAdjustments.filter((adj) => adj.id !== id));
  };

  const handleUpdatePriceAdjustmentAmount = (id: string, amount: number) => {
    setPriceAdjustments(
      priceAdjustments.map((adj) => (adj.id === id ? { ...adj, amount } : adj))
    );
  };

  // Dynamic Calculations (Influencing Total Price)
  const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
  const discountAmount =
    discountType === 'percentage' ? (subtotal * (discount || 0)) / 100 : Number(discount) || 0;
  const freightAmount = Number(freight) || 0;

  // Sum of custom price additions (+) and custom price deductions (-)
  const customAdditionsTotal = priceAdjustments
    .filter((adj) => adj.type === 'add')
    .reduce((sum, adj) => sum + (adj.amount || 0), 0);

  const customDeductionsTotal = priceAdjustments
    .filter((adj) => adj.type === 'deduct')
    .reduce((sum, adj) => sum + (adj.amount || 0), 0);

  // Current bill (Subtotal + Freight - Discount + Custom Additions - Custom Deductions)
  const currentInvoiceBill =
    subtotal + freightAmount - discountAmount + customAdditionsTotal - customDeductionsTotal;

  // Final Net Payable (Current Bill + Prev Balance - Advance Paid Now)
  const netPayable = currentInvoiceBill + Number(prevBalance || 0) - Number(advancePaid || 0);

  // Total wholesaler profit margin preview
  const totalCost = items.reduce((sum, it) => sum + (it.purchasePrice || 0) * (it.quantity || 1), 0);
  const totalProfit = subtotal - totalCost;

  const availableUnits = Array.from(new Set([...getStoredUnits(), ...catalog.map((c) => c.unit)]));
  const categories = ['all', ...Array.from(new Set([...getStoredCategories(), ...catalog.map((c) => c.category)]))];

  // Automatic Status determination according to wholesale accounting logic
  const availableSurplusCredit = prevBalance < 0 ? Math.abs(prevBalance) : 0;
  const totalEffectivePayment = Number(advancePaid || 0) + availableSurplusCredit;

  let calculatedStatus: 'paid' | 'partial' | 'unpaid' = 'unpaid';
  if (totalEffectivePayment >= currentInvoiceBill - 0.5 && currentInvoiceBill > 0) {
    calculatedStatus = 'paid';
  } else if (totalEffectivePayment > 0.5) {
    calculatedStatus = 'partial';
  } else {
    calculatedStatus = 'unpaid';
  }

  useEffect(() => {
    setStatus(calculatedStatus);
  }, [calculatedStatus]);

  // Catalog filtering
  const filteredCatalog = catalog.filter((cat) => {
    const term = productSearchTerm.toLowerCase();
    const matchesSearch =
      cat.name.toLowerCase().includes(term) ||
      (cat.nameUrdu && cat.nameUrdu.toLowerCase().includes(term)) ||
      cat.sku.toLowerCase().includes(term) ||
      cat.category.toLowerCase().includes(term) ||
      (cat.description && cat.description.toLowerCase().includes(term));
    const matchesCat =
      selectedCategoryFilter === 'all' || cat.category === selectedCategoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShopId) {
      alert('Please select a recipient shop.');
      return;
    }
    if (items.some((item) => !item.name.trim() || item.quantity <= 0)) {
      alert('Please fill all item descriptions and ensure quantity > 0.');
      return;
    }

    const currentShop = shops.find((s) => s.id === selectedShopId);
    if (!currentShop) return;

    // Automatic status logic: calculated by advance paid, bill amount, and ledger credit
    const finalStatus: 'paid' | 'partial' | 'unpaid' = calculatedStatus;

    const newInvoice: Invoice = {
      id: 'inv-' + Date.now(),
      invoiceNumber: invoiceNumber.trim() || `CRK-${Date.now()}`,
      shopId: selectedShopId,
      areaId: currentShop.areaId,
      date: invoiceDate,
      dueDate,
      status: finalStatus,
      items,
      subtotal,
      freight: freightAmount,
      discount: discountAmount,
      discountType,
      priceAdjustments: priceAdjustments.filter((adj) => adj.amount > 0),
      prevBalance: Number(prevBalance) || 0,
      advancePaid: Number(advancePaid) || 0,
      netPayable,
      customFields: customFields.filter((f) => f.label.trim() !== ''),
      paymentTerms,
      notes,
      createdAt: new Date().toISOString(),
    };

    onSaveInvoice(newInvoice);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Wholesale Crockery Supply Invoice"
      description="Consignment bill with Urdu/English crockery items, read-only factory purchase cost, freight, discount, previous ledger balance, and custom price adjustments"
      maxWidth="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Top Shop & Area Selector Bar */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <Label htmlFor="inv-area">1. Select Supply Area / City</Label>
            <select
              id="inv-area"
              value={selectedAreaId}
              onChange={(e) => handleAreaChange(e.target.value)}
              className="w-full mt-1 h-9 rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name} ({area.city})
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="inv-shop">2. Select Crockery Retail Shop *</Label>
            <select
              id="inv-shop"
              value={selectedShopId}
              onChange={(e) => handleShopChange(e.target.value)}
              className="w-full mt-1 h-9 rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-bold text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">-- Choose Retail Shop --</option>
              {shops
                .filter((s) => !selectedAreaId || s.areaId === selectedAreaId)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.ownerName})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <Label htmlFor="inv-num">Invoice Number</Label>
            <Input
              id="inv-num"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="mt-1 text-xs h-9 font-mono font-bold"
              required
            />
          </div>

          <div>
            <Label htmlFor="inv-date">Dispatch Date</Label>
            <Input
              id="inv-date"
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              className="mt-1 text-xs h-9 font-mono"
              required
            />
          </div>
        </div>

        {/* Invoice Status Selector (Interactive Status updating) */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase text-slate-800 font-heading">
              Invoice Payment Status:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-3 py-1 rounded-lg text-xs font-black uppercase shadow-2xs flex items-center gap-1.5 ${
                  status === 'paid'
                    ? 'bg-emerald-600 text-white'
                    : status === 'partial'
                    ? 'bg-amber-500 text-white'
                    : 'bg-rose-600 text-white'
                }`}
              >
                {status === 'paid' && <Check className="w-3.5 h-3.5" />}
                {status === 'partial' && <Clock className="w-3.5 h-3.5" />}
                {status} (Auto)
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                {status === 'paid'
                  ? '• Fully cleared by advance / credit'
                  : status === 'partial'
                  ? `• Partial: ${formatCurrency(totalEffectivePayment, currency)} paid of ${formatCurrency(currentInvoiceBill, currency)}`
                  : '• 0 Advance — Added to unpaid Khata dues'}
              </span>
            </div>
          </div>

          {totalCost > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-mono">Wholesaler Margin:</span>
              <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-800 font-mono font-bold">
                Profit: +{formatCurrency(totalProfit, currency)} ({subtotal > 0 ? ((totalProfit / subtotal) * 100).toFixed(0) : 0}%)
              </Badge>
            </div>
          )}
        </div>

        {/* Quick Search Wholesale Catalog Items (Urdu / English with Stock & Read-only Cost) */}
        <div className="bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-slate-50 border border-blue-200 rounded-2xl p-4 space-y-3">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="p-1 bg-blue-600 text-white rounded-lg">
                <Sparkles className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 font-heading">
                  Quick Search Wholesale Warehouse Stock (اردو / English)
                </h4>
                <p className="text-[11px] text-slate-600">
                  Search bone china, opalware, crystal, hotpots, Sillanwali wooden bowls & catering wares
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsCatalogDrawerOpen(!isCatalogDrawerOpen)}
              className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              {isCatalogDrawerOpen ? 'Hide Catalog Browser' : 'Browse All Stock Items'}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isCatalogDrawerOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Search bar & filter chips */}
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="relative w-full flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-blue-600" />
              <input
                type="text"
                placeholder="Search products: e.g. بون چائنا, Bone China, Opalware, Crystal, Hotpot, Sillanwali Handcrafted Bowl..."
                value={productSearchTerm}
                onChange={(e) => {
                  setProductSearchTerm(e.target.value);
                  if (!isCatalogDrawerOpen) setIsCatalogDrawerOpen(true);
                }}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-blue-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs font-medium"
              />
            </div>

            {/* Category filter pills - wrapping cleanly, no scrollbar */}
            <div className="flex flex-wrap items-center gap-1.5 w-full py-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setSelectedCategoryFilter(cat);
                    setIsCatalogDrawerOpen(true);
                  }}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg capitalize transition-colors cursor-pointer ${
                    selectedCategoryFilter === cat
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-white border border-blue-200 text-slate-700 hover:bg-blue-50'
                  }`}
                >
                  {cat === 'all' ? 'All' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Results Grid */}
          {(isCatalogDrawerOpen || productSearchTerm.trim().length > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto p-1 border-t border-blue-100 pt-3">
              {filteredCatalog.map((catItem) => (
                <div
                  key={catItem.id}
                  className="bg-white p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 shadow-2xs flex flex-col justify-between transition-all"
                >
                  <div>
                    <div className="flex justify-between items-start gap-1">
                      <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-1.5 py-0.5 rounded font-mono">
                        {catItem.category}
                      </span>
                      <span className="text-xs font-mono font-black text-slate-900">
                        {formatCurrency(catItem.wholesalePrice, currency)}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-slate-900 mt-1 line-clamp-1 font-heading">
                      {catItem.name}
                    </div>
                    {catItem.nameUrdu && (
                      <div className="text-[10px] font-serif text-slate-600 line-clamp-1 text-right dir-rtl">
                        {catItem.nameUrdu}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1 font-mono">
                      <span>Stock: {catItem.stockQuantity} {catItem.unit}</span>
                      <span className="text-amber-700 font-semibold flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5" /> Cost: {formatCurrency(catItem.purchasePrice, currency)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400 font-medium">
                      Per {catItem.unit}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAddCatalogItem(catItem)}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Add to Bill
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Line Items Table with Read-Only Purchase Cost Reference */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs bg-white">
          <div className="bg-[#0b172a] text-white p-3 flex flex-wrap justify-between items-center gap-2">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5 font-heading">
                <Package className="w-3.5 h-3.5 text-blue-400" /> Crockery Line Items & Packaging ({items.length})
              </h4>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-950/70 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                ✓ Stock Auto-Deducts from Inventory
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddItem}
              className="text-xs h-7 bg-slate-800 border-slate-700 text-white hover:bg-slate-700 cursor-pointer"
            >
              <Plus className="w-3 h-3 mr-1" /> Add Custom Line
            </Button>
          </div>

          {/* Datalist for fast auto-complete of warehouse products */}
          <datalist id="inventory-catalog-list">
            {catalog.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.category} • Available: {cat.stockQuantity} {cat.unit}
              </option>
            ))}
          </datalist>

          <div className="p-3 overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[760px]">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600 uppercase text-xs font-bold font-heading">
                  <th className="pb-2.5 w-8">#</th>
                  <th className="pb-2.5">Crockery Item Description & Specification</th>
                  <th className="pb-2.5 w-24">Unit</th>
                  <th className="pb-2.5 w-20 text-center">Qty</th>
                  <th className="pb-2.5 w-36 text-center">Factory Cost (Read-Only)</th>
                  <th className="pb-2.5 w-32 text-right">Wholesale Rate</th>
                  <th className="pb-2.5 w-28 text-right">Line Total</th>
                  <th className="pb-2.5 w-8 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, index) => {
                  const lineCost = (item.purchasePrice || 0) * (item.quantity || 1);
                  const lineProfit = item.total - lineCost;

                  return (
                    <tr key={item.id} className="align-middle">
                      <td className="py-2.5 text-slate-500 font-mono font-bold">{index + 1}</td>
                      <td className="py-2.5 pr-2">
                        <Input
                          list="inventory-catalog-list"
                          value={item.name}
                          onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                          placeholder="Type or select from inventory products..."
                          className="text-xs h-8.5 font-bold text-slate-900"
                          required
                        />
                        {item.nameUrdu && (
                          <div className="text-xs font-serif text-slate-800 font-bold mt-1 text-right dir-rtl">
                            {item.nameUrdu}
                          </div>
                        )}
                        {item.variation && (
                          <span className="inline-block mt-1 text-xs bg-slate-100 text-slate-800 font-semibold px-2 py-0.5 rounded font-mono border border-slate-200">
                            Var: {item.variation}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 pr-2">
                        <select
                          value={item.unit}
                          onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                          className="w-full h-8.5 text-xs rounded-lg border border-slate-300 bg-white px-2 focus:ring-1 focus:ring-blue-500 font-bold text-slate-900"
                        >
                          {availableUnits.map((u) => (
                            <option key={u} value={u}>
                              {u}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2.5 pr-2">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          className="text-xs h-8.5 text-center font-black"
                          required
                        />
                      </td>

                      {/* Purchase Price: READ-ONLY for wholesaler reference */}
                      <td className="py-2.5 pr-2">
                        <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg px-2 py-1 text-center">
                          <div className="flex items-center justify-center gap-1 text-xs font-mono font-bold text-amber-950">
                            <Lock className="w-3 h-3 text-amber-700" />
                            {item.purchasePrice ? formatCurrency(item.purchasePrice, currency) : 'N/A'}
                          </div>
                          <span className="text-[10px] text-amber-800 font-bold block">Cost (Read-Only)</span>
                        </div>
                      </td>

                      {/* Wholesale Selling Rate */}
                      <td className="py-2.5 pr-2">
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                          className="text-xs h-8.5 text-right font-mono font-black text-blue-950"
                          required
                        />
                        {item.purchasePrice && item.purchasePrice > 0 ? (
                          <div className="text-xs text-right text-emerald-700 font-bold font-mono mt-0.5">
                            +{formatCurrency(item.unitPrice - item.purchasePrice, currency)} profit
                          </div>
                        ) : null}
                      </td>

                      <td className="py-2.5 text-right font-mono font-black text-slate-900">
                        {formatCurrency(item.total, currency)}
                      </td>
                      <td className="py-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          disabled={items.length <= 1}
                          className="text-slate-300 hover:text-rose-600 disabled:opacity-20 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* CUSTOM FIELDS THAT DIRECTLY INFLUENCE TOTAL PRICE (+ CHARGES / - DEDUCTIONS) */}
        {/* Mazdoori loading charges default example has been completely removed! */}
        <div className="border border-blue-200 bg-blue-50/40 rounded-2xl p-4 space-y-3">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-blue-950 font-heading flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-blue-700" /> Custom Fields That Directly Influence Total Bill (+ Charges / - Deductions)
              </h4>
              <p className="text-[11px] text-slate-600">
                Add custom fees (e.g. Wooden Crate Packing, Pallet Wrap, Inspection) or allowances to adjust final total
              </p>
            </div>
          </div>

          {/* Form to add a new price-influencing custom field */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-white p-3 rounded-xl border border-blue-200 shadow-2xs">
            <div className="sm:col-span-2">
              <Input
                placeholder="Field Name (e.g. Wooden Crate Packing, Pallet Wrap, Seasonal Rebate)"
                value={newAdjustmentName}
                onChange={(e) => setNewAdjustmentName(e.target.value)}
                className="text-xs h-8"
              />
            </div>
            <div>
              <select
                value={newAdjustmentType}
                onChange={(e) => setNewAdjustmentType(e.target.value as 'add' | 'deduct')}
                className="w-full h-8 text-xs font-bold rounded-lg border border-slate-300 bg-white px-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="add">+ Add to Total (Charge)</option>
                <option value="deduct">- Deduct from Total (Allowance)</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                min="0"
                placeholder="Amount (PKR)"
                value={newAdjustmentAmount || ''}
                onChange={(e) => setNewAdjustmentAmount(Number(e.target.value) || 0)}
                className="text-xs h-8 font-mono font-bold"
              />
              <Button
                type="button"
                size="sm"
                onClick={handleAddPriceAdjustment}
                className="text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add
              </Button>
            </div>
          </div>

          {/* Render Active Price Adjustments */}
          {priceAdjustments.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
              {priceAdjustments.map((adj) => (
                <div
                  key={adj.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs shadow-2xs ${
                    adj.type === 'add'
                      ? 'bg-blue-50/80 border-blue-200 text-blue-900'
                      : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {adj.type === 'add' ? (
                      <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
                    ) : (
                      <MinusCircle className="w-3.5 h-3.5 text-emerald-600" />
                    )}
                    <span className="font-bold">{adj.name}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      value={adj.amount}
                      onChange={(e) => handleUpdatePriceAdjustmentAmount(adj.id, Number(e.target.value) || 0)}
                      className="w-20 h-7 text-xs font-mono font-bold text-right bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePriceAdjustment(adj.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                      title="Remove field"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CUSTOM LOGISTICS / TEXT FIELDS */}
        <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-3">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-heading">
                Logistics & Informational Custom Fields
              </h4>
              <p className="text-[11px] text-slate-500">
                Bilty #, Goods Transport, Driver Phone, Carton packing notes
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                placeholder="New field label (e.g. Gate Pass #, Container #)"
                value={newFieldLabel}
                onChange={(e) => setNewFieldLabel(e.target.value)}
                className="text-xs h-8 w-48 bg-white"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddNewCustomField}
                className="text-xs h-8 bg-white shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Field
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {customFields.map((cf) => (
              <div key={cf.id} className="relative bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] font-bold text-slate-700">{cf.label}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCustomField(cf.id)}
                    className="text-slate-300 hover:text-rose-500 p-0.5 cursor-pointer"
                    title="Remove field"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <Input
                  value={cf.value}
                  onChange={(e) => handleCustomFieldChange(cf.id, e.target.value)}
                  placeholder={`Enter ${cf.label}...`}
                  className="text-xs h-7"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Financial Breakdown: Freight, Discount, Prev Balance, Advance & Price Adjustments */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-heading">
              Standard Charges & Balances
            </h4>

            {/* Freight */}
            <div>
              <Label className="flex items-center gap-1 text-slate-800">
                <Truck className="w-3.5 h-3.5 text-blue-600" /> Freight / Goods Carriage Charges (+)
              </Label>
              <Input
                type="number"
                min="0"
                value={freight}
                onChange={(e) => setFreight(Number(e.target.value) || 0)}
                placeholder="0"
                className="text-xs font-mono font-semibold"
              />
            </div>

            {/* Discount */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <Label className="flex items-center gap-1 mb-0 text-emerald-800">
                  <Tag className="w-3.5 h-3.5 text-emerald-600" /> Discount Allowed (-)
                </Label>
                <div className="flex items-center gap-2 text-xs">
                  <label className="flex items-center gap-1 text-[11px] cursor-pointer">
                    <input
                      type="radio"
                      name="discType"
                      checked={discountType === 'fixed'}
                      onChange={() => setDiscountType('fixed')}
                    />
                    Fixed (PKR)
                  </label>
                  <label className="flex items-center gap-1 text-[11px] cursor-pointer">
                    <input
                      type="radio"
                      name="discType"
                      checked={discountType === 'percentage'}
                      onChange={() => setDiscountType('percentage')}
                    />
                    Percent (%)
                  </label>
                </div>
              </div>
              <Input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                placeholder="0"
                className="text-xs font-mono font-semibold"
              />
            </div>

            {/* Previous Balance */}
            <div>
              <Label className="flex items-center justify-between">
                <span>Previous Shop Balance (+ / -)</span>
                <span className="text-[10px] text-blue-600 font-bold">
                  Auto-loaded from Khata
                </span>
              </Label>
              <Input
                type="number"
                value={prevBalance}
                onChange={(e) => setPrevBalance(Number(e.target.value) || 0)}
                className="text-xs font-mono font-bold"
              />
              <span className="text-[11px] text-slate-500">
                {prevBalance >= 0
                  ? `Shop previously owes ${formatCurrency(prevBalance, currency)}`
                  : `Shop has advance credit surplus of ${formatCurrency(Math.abs(prevBalance), currency)}`}
              </span>
            </div>

            {/* Advance Paid Right Now */}
            <div>
              <Label className="flex items-center gap-1 text-emerald-800 font-bold">
                <CreditCard className="w-3.5 h-3.5" /> Advance / Paid Now on Dispatch (-)
              </Label>
              <Input
                type="number"
                min="0"
                value={advancePaid}
                onChange={(e) => setAdvancePaid(Number(e.target.value) || 0)}
                placeholder="0"
                className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 border-emerald-300"
              />
            </div>
          </div>

          {/* Right Summary Card with all custom price adjustments itemized */}
          <div className="flex flex-col justify-between bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 font-heading">
                Live Calculation Breakdown
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Items Subtotal:</span>
                  <span className="font-mono font-semibold text-slate-900">{formatCurrency(subtotal, currency)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">+ Freight / Carriage:</span>
                  <span className="font-mono text-blue-600">+{formatCurrency(freightAmount, currency)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">- Discount:</span>
                  <span className="font-mono text-emerald-600">-{formatCurrency(discountAmount, currency)}</span>
                </div>

                {/* Itemize custom price additions */}
                {priceAdjustments.filter((adj) => adj.type === 'add' && adj.amount > 0).map((adj) => (
                  <div key={adj.id} className="flex justify-between py-1 border-b border-slate-100 text-blue-700">
                    <span>+ {adj.name}:</span>
                    <span className="font-mono font-semibold">+{formatCurrency(adj.amount, currency)}</span>
                  </div>
                ))}

                {/* Itemize custom price deductions */}
                {priceAdjustments.filter((adj) => adj.type === 'deduct' && adj.amount > 0).map((adj) => (
                  <div key={adj.id} className="flex justify-between py-1 border-b border-slate-100 text-emerald-700">
                    <span>- {adj.name}:</span>
                    <span className="font-mono font-semibold">-{formatCurrency(adj.amount, currency)}</span>
                  </div>
                ))}

                <div className="flex justify-between py-1.5 font-bold text-slate-900 border-b border-slate-200 font-heading">
                  <span>Current Bill Total:</span>
                  <span className="font-mono">{formatCurrency(currentInvoiceBill, currency)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">+ Previous Balance:</span>
                  <span className="font-mono">{formatCurrency(prevBalance, currency)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">- Advance Paid Now:</span>
                  <span className="font-mono text-emerald-700">-{formatCurrency(advancePaid, currency)}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t-2 border-blue-600 bg-blue-50/70 p-3.5 rounded-xl">
              <div className="text-[11px] uppercase tracking-wider font-extrabold text-blue-950 font-heading">
                Net Balance Due (Final Payable):
              </div>
              <div className="text-2xl font-mono font-black text-blue-950 mt-0.5">
                {formatCurrency(netPayable, currency)}
              </div>
              <div className="text-[11px] text-blue-800 mt-1 font-medium">
                {netPayable > 0
                  ? 'Shop will owe this balance after saving invoice.'
                  : netPayable < 0
                  ? 'Shop will have advance credit remaining.'
                  : 'Account fully settled (Zero balance).'}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 shadow-sm cursor-pointer"
          >
            Save Invoice & Update Khata
          </Button>
        </div>
      </form>
    </Modal>
  );
}
