import React, { useState } from 'react';
import { InventoryProduct } from '../types';
import { formatCurrency } from '../lib/utils';
import { getStoredCategories } from '../data/storage';
import {
  Package,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Layers,
  Edit2,
  Trash2,
  Tag,
  Palette,
  Minus,
  Sparkles,
  ArrowUpDown,
  Lock,
} from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import { Card, CardContent } from './ui/Card';
import { AddEditProductModal } from './AddEditProductModal';
import { ConfirmDeleteModal } from './ui/ConfirmDeleteModal';

interface InventoryManagerProps {
  catalog: InventoryProduct[];
  onSaveProduct: (product: InventoryProduct) => void;
  onDeleteProduct: (productId: string) => void;
  onAdjustStock: (productId: string, delta: number) => void;
  currency?: string;
  onOpenCreateInvoiceWithProduct?: (product: InventoryProduct) => void;
}

export function InventoryManager({
  catalog,
  onSaveProduct,
  onDeleteProduct,
  onAdjustStock,
  currency = 'Rs.',
  onOpenCreateInvoiceWithProduct,
}: InventoryManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<InventoryProduct | null>(null);
  const [productToDelete, setProductToDelete] = useState<InventoryProduct | null>(null);

  // Compute stats
  const totalSkus = catalog.length;
  const totalUnits = catalog.reduce((sum, p) => sum + p.stockQuantity, 0);
  const totalCostValuation = catalog.reduce((sum, p) => sum + p.purchasePrice * p.stockQuantity, 0);
  const totalWholesaleValuation = catalog.reduce((sum, p) => sum + p.wholesalePrice * p.stockQuantity, 0);
  const lowStockCount = catalog.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= (p.minAlertStock ?? 5)).length;
  const outOfStockCount = catalog.filter((p) => p.stockQuantity <= 0).length;

  const categories = ['all', ...Array.from(new Set([...getStoredCategories(), ...catalog.map((p) => p.category)]))];

  // Filtering
  const filteredProducts = catalog.filter((product) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      product.name.toLowerCase().includes(term) ||
      (product.nameUrdu && product.nameUrdu.toLowerCase().includes(term)) ||
      product.sku.toLowerCase().includes(term) ||
      product.category.toLowerCase().includes(term) ||
      (product.description && product.description.toLowerCase().includes(term));

    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;

    let matchesStock = true;
    if (stockFilter === 'in_stock') {
      matchesStock = product.stockQuantity > 0;
    } else if (stockFilter === 'low_stock') {
      matchesStock = product.stockQuantity > 0 && product.stockQuantity <= (product.minAlertStock ?? 5);
    } else if (stockFilter === 'out_of_stock') {
      matchesStock = product.stockQuantity <= 0;
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

  const handleOpenAdd = () => {
    setProductToEdit(null);
    setIsAddEditModalOpen(true);
  };

  const handleOpenEdit = (product: InventoryProduct) => {
    setProductToEdit(product);
    setIsAddEditModalOpen(true);
  };

  const handleRequestDelete = (product: InventoryProduct) => {
    setProductToDelete(product);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      onDeleteProduct(productToDelete.id);
      setProductToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 font-heading">
              Crockery Inventory & Warehouse Stock
            </h2>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold rounded-md font-mono">
              Bilingual (اردو / Eng)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage bone china, dinner sets, glassware, melamine, hotpots & Sillanwali woodenware with factory purchase costs, wholesale prices, color variations, and stock alerts.
          </p>
        </div>

        <Button
          size="sm"
          onClick={handleOpenAdd}
          className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold h-9 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" /> + Add New Product (نیا آئٹم شامل کریں)
        </Button>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Card className="bg-white border-slate-200 shadow-2xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-600 font-heading tracking-wide">
              <span>Total Items / SKUs</span>
              <Package className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono mt-1">
              {totalSkus}
            </div>
            <span className="text-xs font-semibold text-slate-600">Active product catalog</span>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-2xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-xs font-bold uppercase text-indigo-700 font-heading tracking-wide">
              <span>Total Warehouse Units</span>
              <Layers className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-black text-indigo-900 font-mono mt-1">
              {totalUnits}
            </div>
            <span className="text-xs font-bold text-indigo-700">Sets, cartons & crates</span>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-2xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-xs font-bold uppercase text-amber-800 font-heading tracking-wide">
              <span>Inventory Cost Value</span>
              <Lock className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="text-xl font-black text-amber-900 font-mono mt-1">
              {formatCurrency(totalCostValuation, currency)}
            </div>
            <span className="text-xs font-bold text-amber-800">At Factory Purchase Cost</span>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-2xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-xs font-bold uppercase text-emerald-800 font-heading tracking-wide">
              <span>Wholesale Market Value</span>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-xl font-black text-emerald-900 font-mono mt-1">
              {formatCurrency(totalWholesaleValuation, currency)}
            </div>
            <span className="text-xs font-bold text-emerald-800">At Wholesale Selling Rates</span>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-2xs col-span-2 lg:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-xs font-bold uppercase text-rose-700 font-heading tracking-wide">
              <span>Low Stock Alerts</span>
              <AlertTriangle className={`w-4 h-4 ${lowStockCount > 0 ? 'text-rose-500' : 'text-slate-400'}`} />
            </div>
            <div className={`text-2xl font-black font-mono mt-1 ${lowStockCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {lowStockCount + outOfStockCount}
            </div>
            <span className="text-xs font-bold text-rose-700">
              {lowStockCount} low • {outOfStockCount} out of stock
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Search & Category Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by English name, اردو نام (e.g. بون چائنا، ڈنر سیٹ), SKU, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-slate-50 border-slate-200 text-xs h-9"
            />
          </div>

          {/* Stock Filter Pills */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto shrink-0 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setStockFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                stockFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({catalog.length})
            </button>
            <button
              onClick={() => setStockFilter('in_stock')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                stockFilter === 'in_stock'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              In Stock
            </button>
            <button
              onClick={() => setStockFilter('low_stock')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                stockFilter === 'low_stock'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Low Stock ({lowStockCount})
            </button>
            <button
              onClick={() => setStockFilter('out_of_stock')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                stockFilter === 'out_of_stock'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Out of Stock ({outOfStockCount})
            </button>
          </div>
        </div>

        {/* Categories Bar (Clean wrap, no horizontal scrollbar) */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider shrink-0 mr-1">
            Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white font-bold shadow-2xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product List Cards */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Products Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No items matched your search criteria or category filter. You can add a new product using the button above.
          </p>
          <Button size="sm" onClick={handleOpenAdd} className="mt-4 text-xs bg-blue-600 text-white">
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Product Now
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProducts.map((product) => {
            const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= (product.minAlertStock ?? 5);
            const isOutStock = product.stockQuantity <= 0;
            const margin = product.wholesalePrice - product.purchasePrice;
            const marginPercent =
              product.purchasePrice > 0 ? ((margin / product.purchasePrice) * 100).toFixed(0) : '0';

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Card Header with image & top badges */}
                  <div className="relative h-44 bg-slate-100 overflow-hidden border-b border-slate-100">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                        <Package className="w-12 h-12" />
                        <span className="text-xs mt-1 font-mono font-medium">No Image</span>
                      </div>
                    )}

                    <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-1 rounded-md bg-slate-950/90 backdrop-blur-xs text-white text-xs font-mono font-black shadow-xs">
                        {product.sku}
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-white text-slate-900 text-xs font-bold border border-slate-300 shadow-xs">
                        {product.category}
                      </span>
                    </div>

                    <div className="absolute top-2.5 right-2.5">
                      <Badge
                        variant={isOutStock ? 'destructive' : isLowStock ? 'warning' : 'success'}
                        className="text-xs font-extrabold uppercase px-2.5 py-1 shadow-sm"
                      >
                        {isOutStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                      </Badge>
                    </div>

                    {/* Stock Count Pill */}
                    <div className="absolute bottom-2.5 right-2.5 bg-slate-950/90 backdrop-blur-xs text-white px-3 py-1.5 rounded-xl font-mono flex items-center gap-1.5 shadow-md border border-slate-800">
                      <span className="text-sm font-black text-white">{product.stockQuantity}</span>
                      <span className="text-xs font-bold text-emerald-400 font-sans">{product.unit} in Stock</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-black text-slate-950 text-base leading-snug font-heading">
                        {product.name}
                      </h3>
                      {product.nameUrdu && (
                        <p className="text-sm font-serif text-slate-900 mt-1 leading-snug text-right dir-rtl font-bold bg-amber-50/70 p-1.5 rounded-lg border border-amber-200/80">
                          {product.nameUrdu}
                        </p>
                      )}
                    </div>

                    {/* Product Description */}
                    {(product.description || product.descriptionUrdu) && (
                      <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-2.5 space-y-1">
                        {product.description && (
                          <p className="text-xs text-slate-800 font-medium leading-relaxed">
                            {product.description}
                          </p>
                        )}
                        {product.descriptionUrdu && (
                          <p className="text-xs font-serif text-slate-800 text-right dir-rtl font-semibold leading-relaxed">
                            {product.descriptionUrdu}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Pricing Grid */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                          <Lock className="w-3 h-3 text-amber-700" /> Purchase Cost
                        </span>
                        <span className="font-mono font-black text-base text-amber-950 block mt-0.5">
                          {formatCurrency(product.purchasePrice, currency)}
                        </span>
                        <span className="text-xs font-bold text-amber-800 block mt-0.5">Factory rate</span>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-blue-900 uppercase tracking-wider block">
                          Wholesale Rate
                        </span>
                        <span className="font-mono font-black text-base text-blue-900 block mt-0.5">
                          {formatCurrency(product.wholesalePrice, currency)}
                        </span>
                        <span className="text-xs font-bold text-emerald-700 block mt-0.5">
                          +{formatCurrency(margin, currency)} ({marginPercent}%)
                        </span>
                      </div>
                    </div>

                    {/* Variations Preview */}
                    {product.variations && product.variations.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                          Variations ({product.variations.length}):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {product.variations.map((v) => (
                            <span
                              key={v.id}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800"
                            >
                              {v.colorHex && (
                                <span
                                  className="w-2.5 h-2.5 rounded-full border border-slate-300 shrink-0"
                                  style={{ backgroundColor: v.colorHex }}
                                />
                              )}
                              <span>{v.name}</span>
                              <span className="font-mono text-slate-700 font-bold text-xs">({v.stock})</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Custom Specs Chips */}
                    {product.customFields && product.customFields.length > 0 && (
                      <div className="space-y-1.5 pt-0.5">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                          Packaging & Specs:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {product.customFields.map((f) => (
                            <span
                              key={f.id}
                              className="text-xs bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 font-medium flex items-center gap-1"
                            >
                              <span className="font-bold text-slate-900">{f.key}:</span>
                              <span>{f.value}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Controls: Quick Stock Adjust & Edit */}
                <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                  {/* Quick Stock adjustments */}
                  <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => onAdjustStock(product.id, -1)}
                      className="w-7 h-7 flex items-center justify-center rounded text-slate-700 hover:bg-slate-100 hover:text-slate-900 cursor-pointer text-xs font-bold"
                      title="Deduct 1 unit from stock"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono font-bold text-sm px-2 text-slate-900">
                      {product.stockQuantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onAdjustStock(product.id, 1)}
                      className="w-7 h-7 flex items-center justify-center rounded text-slate-700 hover:bg-slate-100 hover:text-slate-900 cursor-pointer text-xs font-bold"
                      title="Add 1 unit to stock"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(product)}
                      className="text-xs font-bold h-8 px-3 bg-white hover:bg-slate-100 text-slate-700 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5 mr-1 text-slate-500" /> Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRequestDelete(product)}
                      className="text-xs font-bold h-8 px-2.5 bg-rose-50/70 hover:bg-rose-600 hover:text-white text-rose-700 border-rose-200 hover:border-rose-600 cursor-pointer transition-colors"
                      title={`Permanently delete ${product.name} from catalog`}
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      <AddEditProductModal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        productToEdit={productToEdit}
        onSaveProduct={onSaveProduct}
        onDeleteProduct={onDeleteProduct}
        currency={currency}
      />

      {/* Product Deletion Warning Modal */}
      {productToDelete && (
        <ConfirmDeleteModal
          isOpen={!!productToDelete}
          onClose={() => setProductToDelete(null)}
          onConfirm={handleConfirmDelete}
          title="Delete Product From Warehouse"
          itemName={productToDelete.name}
          itemType="Product"
          warningMessage={`Are you sure you want to permanently delete "${productToDelete.name}" (SKU: ${productToDelete.sku})? This product will be removed from your catalog and inventory counters.`}
          details={[
            { label: 'Product Name', value: productToDelete.name },
            { label: 'SKU Code', value: productToDelete.sku },
            { label: 'Category', value: productToDelete.category },
            { label: 'Stock in Warehouse', value: `${productToDelete.stockQuantity} ${productToDelete.unit}` },
            { label: 'Wholesale Rate', value: formatCurrency(productToDelete.wholesalePrice, currency) },
            { label: 'Purchase Cost', value: formatCurrency(productToDelete.purchasePrice, currency) },
          ]}
          confirmButtonText="Delete Product"
        />
      )}
    </div>
  );
}
