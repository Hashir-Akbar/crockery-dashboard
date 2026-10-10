import React, { useState, useEffect, useRef } from 'react';
import { InventoryProduct, ProductVariation, ProductCustomField } from '../types';
import { Modal } from './ui/Modal';
import { ConfirmDeleteModal } from './ui/ConfirmDeleteModal';
import { Button } from './ui/Button';
import { Input, Label } from './ui/Input';
import { Badge } from './ui/Badge';
import { formatCurrency } from '../lib/utils';
import { getStoredCategories, saveStoredCategories, getStoredUnits, saveStoredUnits } from '../data/storage';
import {
  Package,
  Plus,
  Trash2,
  Sparkles,
  Layers,
  Palette,
  Tag,
  DollarSign,
  TrendingUp,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Hash,
  Upload,
  X,
  FolderPlus,
  Scale,
} from 'lucide-react';

interface AddEditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: InventoryProduct | null;
  onSaveProduct: (product: InventoryProduct) => void;
  onDeleteProduct?: (productId: string) => void;
  currency?: string;
}

const PRESET_SAMPLE_IMAGES = [
  {
    label: 'Bone China Dinner Set',
    url: 'https://images.unsplash.com/photo-1614088445028-1b203c9eb38c?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Opalware / Ceramic Dinnerware',
    url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Fine Cut Crystal Glassware',
    url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Melamine Serving Platters',
    url: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Insulated Hotpot Casserole',
    url: 'https://images.unsplash.com/photo-1584990347449-39965d1b7029?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Stainless Steel Cutlery Set',
    url: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Afternoon Tea & Coffee Set',
    url: 'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Sillanwali Wooden Inlay Bowls',
    url: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&auto=format&fit=crop&q=80',
  },
];

export function AddEditProductModal({
  isOpen,
  onClose,
  productToEdit,
  onSaveProduct,
  onDeleteProduct,
  currency = 'Rs.',
}: AddEditProductModalProps) {
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  // Category & Unit dynamic lists
  const [categories, setCategories] = useState<string[]>(() => getStoredCategories());
  const [units, setUnits] = useState<string[]>(() => getStoredUnits());

  // Adding new category & unit inline states
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingNewUnit, setIsAddingNewUnit] = useState(false);
  const [newUnitName, setNewUnitName] = useState('');

  const [name, setName] = useState('');
  const [nameUrdu, setNameUrdu] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('');
  const [unit, setUnit] = useState('');
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [wholesalePrice, setWholesalePrice] = useState<number>(0);
  const [stockQuantity, setStockQuantity] = useState<number>(10);
  const [minAlertStock, setMinAlertStock] = useState<number>(5);
  const [description, setDescription] = useState('');
  const [descriptionUrdu, setDescriptionUrdu] = useState('');
  const [image, setImage] = useState('');

  // File upload input ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const varFileInputRef = useRef<HTMLInputElement | null>(null);

  // Variations State
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [newVarName, setNewVarName] = useState('');
  const [newVarColor, setNewVarColor] = useState('#D4AF37');
  const [newVarSku, setNewVarSku] = useState('');
  const [newVarStock, setNewVarStock] = useState<number>(0);
  const [newVarImage, setNewVarImage] = useState('');

  // Custom Fields State
  const [customFields, setCustomFields] = useState<ProductCustomField[]>([]);
  const [newFieldKey, setNewFieldKey] = useState('');
  const [newFieldValue, setNewFieldValue] = useState('');

  useEffect(() => {
    const loadedCats = getStoredCategories();
    const loadedUnits = getStoredUnits();
    setCategories(loadedCats);
    setUnits(loadedUnits);

    if (productToEdit) {
      setName(productToEdit.name);
      setNameUrdu(productToEdit.nameUrdu || '');
      setSku(productToEdit.sku || '');
      setCategory(productToEdit.category || loadedCats[0]);
      setUnit(productToEdit.unit || loadedUnits[0]);
      setPurchasePrice(productToEdit.purchasePrice || 0);
      setWholesalePrice(productToEdit.wholesalePrice || 0);
      setStockQuantity(productToEdit.stockQuantity || 0);
      setMinAlertStock(productToEdit.minAlertStock ?? 5);
      setDescription(productToEdit.description || '');
      setDescriptionUrdu(productToEdit.descriptionUrdu || '');
      setImage(productToEdit.image || '');
      setVariations(productToEdit.variations || []);
      setCustomFields(productToEdit.customFields || []);
    } else {
      // Defaults for brand new product
      const randomSku = `SLW-CRK-${Math.floor(100 + Math.random() * 900)}`;
      setName('');
      setNameUrdu('');
      setSku(randomSku);
      setCategory(loadedCats[0] || 'Dinner Sets');
      setUnit(loadedUnits[0] || 'Sets');
      setPurchasePrice(0);
      setWholesalePrice(0);
      setStockQuantity(20);
      setMinAlertStock(5);
      setDescription('');
      setDescriptionUrdu('');
      setImage(''); // Start blank for new product without any pre-filled image
      setVariations([]);
      setCustomFields([
        { id: 'f-1', key: 'Material', value: 'Fine Ceramic / Porcelain' },
        { id: 'f-2', key: 'Carton Packing', value: 'Master Corrugated Export Crate' },
      ]);
    }
  }, [productToEdit, isOpen]);

  // Margin calculation
  const marginPerUnit = wholesalePrice - purchasePrice;
  const marginPercent = purchasePrice > 0 ? ((marginPerUnit / purchasePrice) * 100).toFixed(1) : '0';

  // Handle Image File Upload (converts file to base64 Data URL)
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Variation Image File Upload
  const handleVarImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setNewVarImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Add New Category Handler
  const handleAddNewCategory = () => {
    const trimmed = newCategoryName.trim().replace(/\s{2,}/g, ' ');
    if (!trimmed) return;
    if (!categories.includes(trimmed)) {
      const updated = [...categories, trimmed];
      setCategories(updated);
      saveStoredCategories(updated);
    }
    setCategory(trimmed);
    setNewCategoryName('');
    setIsAddingNewCategory(false);
  };

  // Add New Unit Handler
  const handleAddNewUnit = () => {
    const trimmed = newUnitName.trim().replace(/\s{2,}/g, ' ');
    if (!trimmed) return;
    if (!units.includes(trimmed)) {
      const updated = [...units, trimmed];
      setUnits(updated);
      saveStoredUnits(updated);
    }
    setUnit(trimmed);
    setNewUnitName('');
    setIsAddingNewUnit(false);
  };

  const handleAddVariation = () => {
    if (!newVarName.trim()) return;
    const newVar: ProductVariation = {
      id: 'var-' + Date.now(),
      name: newVarName.trim(),
      colorHex: newVarColor,
      sku: newVarSku.trim() || `${sku}-${variations.length + 1}`,
      stock: Number(newVarStock) || 0,
      image: newVarImage.trim() || undefined,
    };
    setVariations([...variations, newVar]);
    setNewVarName('');
    setNewVarSku('');
    setNewVarStock(0);
    setNewVarImage('');
  };

  const handleRemoveVariation = (id: string) => {
    setVariations(variations.filter((v) => v.id !== id));
  };

  const handleAddCustomField = () => {
    if (!newFieldKey.trim()) return;
    const newField: ProductCustomField = {
      id: 'cf-' + Date.now(),
      key: newFieldKey.trim(),
      value: newFieldValue.trim(),
    };
    setCustomFields([...customFields, newField]);
    setNewFieldKey('');
    setNewFieldValue('');
  };

  const handleRemoveCustomField = (id: string) => {
    setCustomFields(customFields.filter((f) => f.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a product name in English or Urdu.');
      return;
    }
    if (wholesalePrice <= 0) {
      alert('Please set a valid wholesale selling price.');
      return;
    }

    const savedProduct: InventoryProduct = {
      id: productToEdit ? productToEdit.id : 'prod-' + Date.now(),
      name: name.trim(),
      nameUrdu: nameUrdu.trim() || undefined,
      sku: sku.trim() || `SKU-${Date.now()}`,
      category: category || categories[0] || 'General Tableware',
      unit: unit || units[0] || 'Sets',
      purchasePrice: Number(purchasePrice) || 0,
      wholesalePrice: Number(wholesalePrice) || 0,
      stockQuantity: Number(stockQuantity) || 0,
      minAlertStock: Number(minAlertStock) || 0,
      description: description.trim() || undefined,
      descriptionUrdu: descriptionUrdu.trim() || undefined,
      image: image.trim() || undefined,
      variations,
      customFields,
      createdAt: productToEdit ? productToEdit.createdAt : new Date().toISOString(),
    };

    onSaveProduct(savedProduct);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={productToEdit ? `Edit Product: ${productToEdit.name}` : 'Add New Crockery Product to Inventory'}
      description="Register wholesale stock with image upload, custom category/units, Urdu/English names, purchase cost, wholesale selling rate, colors/variations, and specs"
      maxWidth="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Identification: English & Urdu Names */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 font-heading">
            <Package className="w-4 h-4 text-blue-600" />
            <span>Product Identification (Bilingual Names & SKU)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="prod-name">Product Name (English) *</Label>
              <Input
                id="prod-name"
                placeholder="e.g. 72-Pc Royal Bone China Dinner Set"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 bg-white font-medium"
              />
            </div>

            <div>
              <Label htmlFor="prod-urdu" className="flex items-center justify-between">
                <span>Urdu Product Name (اردو نام)</span>
                <span className="text-xs text-blue-700 font-bold">اردو میں پروڈکٹ کا نام</span>
              </Label>
              <Input
                id="prod-urdu"
                dir="rtl"
                placeholder="مثال: 72 عدد رائل بون چائنا ڈنر سیٹ بمعہ سنہری کنارہ"
                value={nameUrdu}
                onChange={(e) => setNameUrdu(e.target.value)}
                className="mt-1 bg-white font-serif text-right text-slate-900 text-sm font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label htmlFor="prod-sku">SKU / Item Code</Label>
              <Input
                id="prod-sku"
                placeholder="e.g. SLW-BC-72"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="mt-1 bg-white font-mono uppercase font-bold"
              />
            </div>

            {/* Category with option to add new category */}
            <div>
              <div className="flex justify-between items-center">
                <Label htmlFor="prod-cat">Category</Label>
                <button
                  type="button"
                  onClick={() => setIsAddingNewCategory(!isAddingNewCategory)}
                  className="text-xs text-blue-700 hover:text-blue-900 font-bold flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> New
                </button>
              </div>

              {isAddingNewCategory ? (
                <div className="flex gap-1 mt-1">
                  <Input
                    placeholder="New category name..."
                    value={newCategoryName}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/^\s+/, '');
                      setNewCategoryName(clean);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddNewCategory();
                      }
                    }}
                    className="bg-white text-xs h-9"
                    autoFocus
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddNewCategory}
                    className="h-9 px-2.5 text-xs bg-blue-600 text-white shrink-0 cursor-pointer"
                  >
                    Add
                  </Button>
                  <button
                    type="button"
                    onClick={() => setIsAddingNewCategory(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <select
                    id="prod-cat"
                    value={category}
                    onChange={(e) => {
                      if (e.target.value === '__add_new__') {
                        setIsAddingNewCategory(true);
                      } else {
                        setCategory(e.target.value);
                      }
                    }}
                    className="w-full mt-1 h-9 rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="__add_new__">+ Add New Category...</option>
                  </select>
                  <div className="flex flex-wrap gap-1 mt-1.5 max-h-20 overflow-y-auto">
                    {categories.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCategory(c)}
                        className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                          category === c
                            ? 'bg-blue-600 text-white font-bold'
                            : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Unit with option to add new unit */}
            <div>
              <div className="flex justify-between items-center">
                <Label htmlFor="prod-unit">Wholesale Unit</Label>
                <button
                  type="button"
                  onClick={() => setIsAddingNewUnit(!isAddingNewUnit)}
                  className="text-xs text-blue-700 hover:text-blue-900 font-bold flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> New
                </button>
              </div>

              {isAddingNewUnit ? (
                <div className="flex gap-1 mt-1">
                  <Input
                    placeholder="New unit (e.g. Bags, Pallets)..."
                    value={newUnitName}
                    onChange={(e) => setNewUnitName(e.target.value)}
                    className="bg-white text-xs h-9"
                    autoFocus
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddNewUnit}
                    className="h-9 px-2.5 text-xs bg-blue-600 text-white shrink-0 cursor-pointer"
                  >
                    Add
                  </Button>
                  <button
                    type="button"
                    onClick={() => setIsAddingNewUnit(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <select
                  id="prod-unit"
                  value={unit}
                  onChange={(e) => {
                    if (e.target.value === '__add_new__') {
                      setIsAddingNewUnit(true);
                    } else {
                      setUnit(e.target.value);
                    }
                  }}
                  className="w-full mt-1 h-9 rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  {units.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                  <option value="__add_new__">+ Add New Unit...</option>
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Pricing & Stock Section */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 font-heading">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Purchase Cost, Wholesale Selling Rate & Warehouse Stock</span>
            </div>
            {purchasePrice > 0 && wholesalePrice > 0 && (
              <Badge
                variant={marginPerUnit >= 0 ? 'success' : 'destructive'}
                className="text-[11px] font-mono font-bold"
              >
                Margin: {marginPerUnit >= 0 ? '+' : ''}{formatCurrency(marginPerUnit, currency)} ({marginPercent}%)
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-amber-50/70 border border-amber-200/80 p-3.5 rounded-xl">
              <Label htmlFor="prod-purchase" className="text-amber-950 text-sm font-bold flex items-center justify-between">
                <span>Purchase / Factory Cost</span>
                <span className="text-xs text-amber-800 font-bold">(خرید قیمت)</span>
              </Label>
              <Input
                id="prod-purchase"
                type="number"
                min="0"
                step="50"
                value={purchasePrice || ''}
                onChange={(e) => setPurchasePrice(Number(e.target.value))}
                placeholder="0"
                className="mt-1.5 bg-white font-mono font-bold text-amber-950 border-amber-300 text-sm h-10"
              />
              <span className="text-xs font-bold text-amber-800 mt-1.5 block">
                Read-only reference during invoicing (never shown to customer)
              </span>
            </div>

            <div className="bg-blue-50/70 border border-blue-200/80 p-3.5 rounded-xl">
              <Label htmlFor="prod-wholesale" className="text-blue-950 text-sm font-bold flex items-center justify-between">
                <span>Wholesale Selling Rate *</span>
                <span className="text-xs text-blue-800 font-bold">(ہول سیل ریٹ)</span>
              </Label>
              <Input
                id="prod-wholesale"
                type="number"
                min="0"
                step="50"
                value={wholesalePrice || ''}
                onChange={(e) => setWholesalePrice(Number(e.target.value))}
                placeholder="0"
                required
                className="mt-1.5 bg-white font-mono font-bold text-blue-950 border-blue-300 text-sm h-10"
              />
              <span className="text-xs font-bold text-blue-800 mt-1.5 block">
                Standard rate charged per {unit} on invoice
              </span>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200/80 p-3.5 rounded-xl">
              <Label htmlFor="prod-stock" className="text-emerald-950 text-sm font-bold flex items-center justify-between">
                <span>Warehouse Stock Qty</span>
                <span className="text-xs text-emerald-800 font-bold">(موجودہ سٹاک)</span>
              </Label>
              <Input
                id="prod-stock"
                type="number"
                min="0"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(Number(e.target.value))}
                placeholder="0"
                className="mt-1.5 bg-white font-mono font-bold text-emerald-950 border-emerald-300 text-sm h-10"
              />
              <span className="text-xs font-bold text-emerald-800 mt-1.5 block">
                Total available {unit} in godown / warehouse
              </span>
            </div>

            <div className="bg-slate-100/80 border border-slate-200 p-3.5 rounded-xl">
              <Label htmlFor="prod-min-stock" className="text-slate-900 text-sm font-bold">
                Low Stock Warning Level
              </Label>
              <Input
                id="prod-min-stock"
                type="number"
                min="0"
                value={minAlertStock}
                onChange={(e) => setMinAlertStock(Number(e.target.value))}
                placeholder="5"
                className="mt-1.5 bg-white font-mono font-bold text-slate-900 text-sm h-10"
              />
              <span className="text-xs font-bold text-slate-700 mt-1.5 block">
                Alerts wholesaler when stock falls below this
              </span>
            </div>
          </div>
        </div>

        {/* Product Image: Direct File Upload & URL / Presets */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 font-heading">
              <ImageIcon className="w-4 h-4 text-purple-600" />
              <span>Product Image (Upload Photo or Paste URL)</span>
            </div>
            {image && (
              <button
                type="button"
                onClick={() => setImage('')}
                className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove Image
              </button>
            )}
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageFileUpload}
            className="hidden"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Upload Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-blue-300 hover:border-blue-500 rounded-2xl p-5 bg-blue-50/30 hover:bg-blue-50/60 transition-all flex flex-col items-center justify-center text-center cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-blue-900 block">
                Upload Product Photo from Device
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5">
                Click to browse PNG, JPG, or WebP from computer / mobile
              </span>
              <span className="mt-2 text-[10px] font-semibold text-blue-600 bg-white px-2 py-0.5 rounded-full border border-blue-200">
                Choose Image File
              </span>
            </div>

            {/* Preview Box & URL alternative */}
            <div className="flex flex-col justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="h-20 w-20 rounded-xl border border-slate-200 overflow-hidden bg-slate-100 shrink-0 shadow-2xs flex items-center justify-center">
                  {image ? (
                    <img
                      src={image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-slate-300" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-slate-800 block">
                    {image ? (image.startsWith('data:') ? 'Photo Uploaded from Device' : 'Image Selected') : 'No Image (Optional)'}
                  </span>
                  <span className="text-[11px] text-slate-500 block truncate mt-0.5">
                    {image ? (image.startsWith('data:') ? 'Image attached to product' : image) : 'Browse from computer/mobile or paste link below'}
                  </span>
                  {image && (
                    <button
                      type="button"
                      onClick={() => setImage('')}
                      className="mt-1.5 text-[11px] text-rose-600 hover:text-rose-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" /> Remove image
                    </button>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="prod-img" className="text-[11px] text-slate-600">Or Paste Image URL directly:</Label>
                <Input
                  id="prod-img"
                  placeholder="https://..."
                  value={image.startsWith('data:') ? '' : image}
                  onChange={(e) => setImage(e.target.value)}
                  className="bg-slate-50 text-xs font-mono h-8 mt-1"
                />
              </div>
            </div>
          </div>

          {/* Preset Crockery Photos */}
          <div>
            <span className="text-[11px] font-semibold text-slate-600 block mb-1.5">
              Or pick from preset crockery catalog photos:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRESET_SAMPLE_IMAGES.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setImage(preset.url)}
                  className={`flex items-center gap-2 p-1.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                    image === preset.url
                      ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <img src={preset.url} alt={preset.label} className="w-7 h-7 rounded object-cover shrink-0" />
                  <span className="truncate text-[11px]">{preset.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Variations (Colors, Patterns, Finishes, Individual Stocks & Images) */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 font-heading">
              <Palette className="w-4 h-4 text-amber-600" />
              <span>Product Variations (Colors, Patterns, Finishes & Variation Stock)</span>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {variations.length} variations
            </span>
          </div>

          {/* Hidden File Input for Variation */}
          <input
            type="file"
            ref={varFileInputRef}
            accept="image/*"
            onChange={handleVarImageFileUpload}
            className="hidden"
          />

          {/* List of current variations */}
          {variations.length > 0 && (
            <div className="space-y-2">
              {variations.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl text-xs gap-3"
                >
                  <div className="flex items-center gap-3">
                    {v.image ? (
                      <img src={v.image} alt={v.name} className="w-6 h-6 rounded object-cover border border-slate-200" />
                    ) : v.colorHex ? (
                      <span
                        className="w-5 h-5 rounded-full border border-slate-300 shadow-2xs shrink-0"
                        style={{ backgroundColor: v.colorHex }}
                      />
                    ) : null}
                    <div>
                      <span className="font-bold text-slate-900">{v.name}</span>
                      {v.sku && <span className="ml-2 font-mono text-[10px] text-slate-400">({v.sku})</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-mono font-semibold text-slate-700">
                      Stock: {v.stock} {unit}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveVariation(v.id)}
                      className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                      title="Remove variation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Variation input row */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-200/80">
            <div className="sm:col-span-2">
              <Input
                placeholder="Variation Name (e.g. Imperial Gold / سنہری کنارہ)"
                value={newVarName}
                onChange={(e) => setNewVarName(e.target.value)}
                className="bg-white text-xs h-9"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="color"
                value={newVarColor}
                onChange={(e) => setNewVarColor(e.target.value)}
                className="w-9 h-9 p-0.5 rounded-lg border border-slate-200 bg-white cursor-pointer shrink-0"
                title="Pick Color"
              />
              <Input
                type="number"
                min="0"
                placeholder="Stock"
                value={newVarStock || ''}
                onChange={(e) => setNewVarStock(Number(e.target.value))}
                className="bg-white text-xs h-9 font-mono"
              />
            </div>
            <div>
              <button
                type="button"
                onClick={() => varFileInputRef.current?.click()}
                className="w-full h-9 border border-dashed border-slate-300 hover:border-blue-400 rounded-lg text-[11px] font-semibold text-slate-600 bg-white flex items-center justify-center gap-1 cursor-pointer"
              >
                <Upload className="w-3 h-3" />
                {newVarImage ? 'Image Loaded' : 'Var Photo'}
              </button>
            </div>
            <div>
              <Button
                type="button"
                variant="outline"
                onClick={handleAddVariation}
                className="w-full text-xs h-9 bg-white hover:bg-slate-100 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add
              </Button>
            </div>
          </div>
        </div>

        {/* Custom Fields (Dynamic Extra Data for Product) */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 font-heading">
              <Tag className="w-4 h-4 text-blue-600" />
              <span>Custom Product Specifications & Warehouse Fields</span>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {customFields.length} custom attributes
            </span>
          </div>

          {/* List of custom fields */}
          {customFields.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {customFields.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-500">{f.key}:</span>{' '}
                    <span className="font-bold text-slate-900">{f.value}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCustomField(f.id)}
                    className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                    title="Remove custom field"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add custom field row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200/80">
            <Input
              placeholder="Field Label (e.g. Material, Crates/Pallet)"
              value={newFieldKey}
              onChange={(e) => setNewFieldKey(e.target.value)}
              className="bg-white text-xs h-9"
            />
            <Input
              placeholder="Value (e.g. 100% Pure Bone China, 18 kg)"
              value={newFieldValue}
              onChange={(e) => setNewFieldValue(e.target.value)}
              className="bg-white text-xs h-9"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleAddCustomField}
              className="text-xs h-9 bg-white hover:bg-slate-100 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Custom Field
            </Button>
          </div>
        </div>

        {/* Descriptions (English & Urdu) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="prod-desc" className="text-sm font-bold text-slate-900 block mb-1">
              English Details & Packing Description
            </Label>
            <textarea
              id="prod-desc"
              rows={3}
              placeholder="e.g. Includes soup tureen, salad bowls, 8-person complete dining set packed with heavy bubble lining"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed shadow-xs"
            />
          </div>

          <div>
            <Label htmlFor="prod-desc-urdu" className="flex items-center justify-between text-sm font-bold text-slate-900 block mb-1">
              <span>Urdu Description (اردو تفصیل)</span>
              <span className="text-xs text-blue-700 font-bold">تفصیل</span>
            </Label>
            <textarea
              id="prod-desc-urdu"
              rows={3}
              dir="rtl"
              placeholder="مثال: معیاری بون چائنا، 8 افراد کے لیے مکمل سیٹ، برآمدی پیکنگ"
              value={descriptionUrdu}
              onChange={(e) => setDescriptionUrdu(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm font-serif font-medium text-slate-900 text-right focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed shadow-xs"
            />
          </div>
        </div>

        {/* Modal Submit Actions */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-200">
          <div>
            {productToEdit && onDeleteProduct && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsConfirmDeleteOpen(true)}
                className="text-xs text-rose-600 hover:text-white hover:bg-rose-600 border-rose-300 hover:border-rose-600 cursor-pointer flex items-center gap-1.5 font-bold transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Product From Warehouse
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button type="submit" className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer">
              <Check className="w-4 h-4 mr-1.5" />
              {productToEdit ? 'Save Changes' : 'Add Product to Inventory'}
            </Button>
          </div>
        </div>
      </form>

      {/* Delete Confirmation Warning Modal */}
      {productToEdit && onDeleteProduct && (
        <ConfirmDeleteModal
          isOpen={isConfirmDeleteOpen}
          onClose={() => setIsConfirmDeleteOpen(false)}
          onConfirm={() => {
            onDeleteProduct(productToEdit.id);
            onClose();
          }}
          title="Delete Product From Warehouse"
          itemName={productToEdit.name}
          itemType="Product"
          warningMessage={`Are you sure you want to permanently remove "${productToEdit.name}" (SKU: ${productToEdit.sku}) from your wholesale inventory?`}
          details={[
            { label: 'Product Name', value: productToEdit.name },
            { label: 'SKU Code', value: productToEdit.sku },
            { label: 'Category', value: productToEdit.category },
            { label: 'Current Stock', value: `${productToEdit.stockQuantity} ${productToEdit.unit}` },
          ]}
          confirmButtonText="Yes, Delete Product"
        />
      )}
    </Modal>
  );
}
