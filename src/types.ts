export interface Area {
  id: string;
  name: string;
  city: string;
  code: string;
  description?: string;
  createdAt: string;
}

export interface Shop {
  id: string;
  areaId: string;
  name: string;
  ownerName: string;
  phone: string;
  whatsapp?: string;
  address: string;
  shopNumber: string;
  creditLimit: number;
  openingBalance: number;
  notes?: string;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  productId?: string;
  name: string;
  nameUrdu?: string;
  category: string;
  unit: string; // Sets, Cartons, Dozens, Pcs, Crates, Boxes, or custom user added units
  quantity: number;
  purchasePrice?: number; // Cost price (read-only on invoice creation for wholesaler reference)
  unitPrice: number;     // Wholesale selling price
  total: number;
  variation?: string;
}

export interface InvoiceCustomField {
  id: string;
  label: string;
  value: string;
}

export interface InvoicePriceAdjustment {
  id: string;
  name: string;
  type: 'add' | 'deduct'; // 'add' increases total, 'deduct' decreases total
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  shopId: string;
  areaId: string;
  date: string;
  dueDate?: string;
  status: 'paid' | 'partial' | 'unpaid';
  items: InvoiceItem[];
  subtotal: number;
  freight: number;
  discount: number;
  discountType: 'fixed' | 'percentage';
  priceAdjustments?: InvoicePriceAdjustment[]; // Custom fields that directly influence total price!
  prevBalance: number;
  advancePaid: number;
  netPayable: number;
  customFields: InvoiceCustomField[];
  notes?: string;
  paymentTerms?: string;
  createdAt: string;
}

export type TransactionType = 'invoice' | 'payment' | 'advance' | 'discount_note' | 'opening_balance';

export interface LedgerTransaction {
  id: string;
  shopId: string;
  date: string;
  type: TransactionType;
  reference: string;
  description: string;
  debit: number;   // What the shop owes (items + freight + custom add charges - discount - custom deductions)
  credit: number;  // What the shop paid (Advance, Cash, Bank Transfer)
  runningBalance: number;
  paymentMethod?: 'Cash' | 'Bank Transfer' | 'Cheque' | 'Online/UPI' | 'Advance Credit';
  invoiceId?: string;
  receiptNumber?: string;
  notes?: string;
}

export interface ProductVariation {
  id: string;
  name: string;      // e.g. "Gold Trim" or "سنہری کنارہ"
  colorHex?: string;
  sku?: string;
  stock: number;
  image?: string;
}

export interface ProductCustomField {
  id: string;
  key: string;
  value: string;
}

export interface InventoryProduct {
  id: string;
  name: string;           // English product name
  nameUrdu?: string;      // Urdu product name (اردو نام)
  sku: string;            // Item code / SKU
  category: string;       // Dinner Sets, Tea Sets, Glassware, Melamine, Hotpots, Woodenware, Cutlery, etc.
  unit: string;           // Standard or custom user-defined wholesale units
  purchasePrice: number;  // Purchase/cost price from factory (Read-only during invoicing)
  wholesalePrice: number; // Wholesale selling rate
  stockQuantity: number;  // Current stock count in warehouse
  minAlertStock?: number; // Low stock threshold
  description?: string;
  descriptionUrdu?: string;
  image?: string;
  variations: ProductVariation[];
  customFields: ProductCustomField[];
  createdAt: string;
}

export type CatalogItem = InventoryProduct;

export interface BusinessSettings {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  currency: string;
  terms: string;
}
