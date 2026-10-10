import { Area, Shop, Invoice, LedgerTransaction, InventoryProduct, BusinessSettings } from '../types';
import { INITIAL_AREAS, INITIAL_SHOPS, INITIAL_INVOICES, INITIAL_TRANSACTIONS, CROCKERY_CATALOG } from './mockData';

const STORAGE_KEYS = {
  AREAS: 'crockery_wholesale_areas_v3',
  SHOPS: 'crockery_wholesale_shops_v3',
  INVOICES: 'crockery_wholesale_invoices_v3',
  TRANSACTIONS: 'crockery_wholesale_transactions_v3',
  CATALOG: 'crockery_wholesale_catalog_v3',
  SETTINGS: 'crockery_wholesale_settings_v3',
  CATEGORIES: 'crockery_wholesale_categories_v3',
  UNITS: 'crockery_wholesale_units_v3',
};

export const DEFAULT_BUSINESS_SETTINGS: BusinessSettings = {
  name: 'Asghar Crockery Wholesale',
  tagline: 'Bulk Crockery Importers & Regional Supply Hub',
  address: 'Commercial Crockery Central Depot, Shahi Bazaar Road, Sillanwali / Sargodha',
  phone: '+92 300 8400011',
  whatsapp: '+92 300 8400011',
  email: 'supply@crowncrockery.com',
  currency: 'Rs.',
  terms: 'Goods once delivered and checked are not returnable. Breakage during goods carrier transport must be claimed via bilty within 48 hours.',
};

export const DEFAULT_CATEGORIES = [
  'Dinner Sets',
  'Tea & Coffee Sets',
  'Glassware',
  'Melamine Ware',
  'Hotpots & Casseroles',
  'Cutlery & Serving',
  'Handicrafts & Woodenware',
  'Cookware',
  'Bowls & Soup Sets',
  'General Tableware',
];

export const DEFAULT_UNITS = [
  'Sets',
  'Cartons',
  'Dozens',
  'Pcs',
  'Crates',
  'Boxes',
];

export function getStoredCategories(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading categories', e);
  }
  saveStoredCategories(DEFAULT_CATEGORIES);
  return DEFAULT_CATEGORIES;
}

export function saveStoredCategories(categories: string[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  } catch (e) {
    console.error('Error saving categories', e);
  }
}

export function getStoredUnits(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.UNITS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading units', e);
  }
  saveStoredUnits(DEFAULT_UNITS);
  return DEFAULT_UNITS;
}

export function saveStoredUnits(units: string[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.UNITS, JSON.stringify(units));
  } catch (e) {
    console.error('Error saving units', e);
  }
}

export function getStoredBusinessSettings(): BusinessSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading settings', e);
  }
  saveStoredBusinessSettings(DEFAULT_BUSINESS_SETTINGS);
  return DEFAULT_BUSINESS_SETTINGS;
}

export function saveStoredBusinessSettings(settings: BusinessSettings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings', e);
  }
}

export function getStoredAreas(): Area[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AREAS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading areas from localStorage', e);
  }
  saveStoredAreas(INITIAL_AREAS);
  return INITIAL_AREAS;
}

export function saveStoredAreas(areas: Area[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.AREAS, JSON.stringify(areas));
  } catch (e) {
    console.error('Error saving areas', e);
  }
}

export function getStoredShops(): Shop[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SHOPS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading shops from localStorage', e);
  }
  saveStoredShops(INITIAL_SHOPS);
  return INITIAL_SHOPS;
}

export function saveStoredShops(shops: Shop[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.SHOPS, JSON.stringify(shops));
  } catch (e) {
    console.error('Error saving shops', e);
  }
}

export function getStoredInvoices(): Invoice[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INVOICES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading invoices from localStorage', e);
  }
  saveStoredInvoices(INITIAL_INVOICES);
  return INITIAL_INVOICES;
}

export function saveStoredInvoices(invoices: Invoice[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  } catch (e) {
    console.error('Error saving invoices', e);
  }
}

export function getStoredTransactions(): LedgerTransaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading transactions from localStorage', e);
  }
  saveStoredTransactions(INITIAL_TRANSACTIONS);
  return INITIAL_TRANSACTIONS;
}

export function saveStoredTransactions(transactions: LedgerTransaction[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (e) {
    console.error('Error saving transactions', e);
  }
}

export function getStoredCatalog(): InventoryProduct[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CATALOG);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading catalog', e);
  }
  saveStoredCatalog(CROCKERY_CATALOG);
  return CROCKERY_CATALOG;
}

export function saveStoredCatalog(catalog: InventoryProduct[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.CATALOG, JSON.stringify(catalog));
  } catch (e) {
    console.error('Error saving catalog', e);
  }
}

/**
 * Updates status of an existing invoice and persists to localStorage.
 */
export function updateInvoiceStatusInStorage(invoiceId: string, status: 'paid' | 'partial' | 'unpaid'): Invoice[] {
  const current = getStoredInvoices();
  const updated = current.map((inv) => (inv.id === invoiceId ? { ...inv, status } : inv));
  saveStoredInvoices(updated);
  return updated;
}

/**
 * Calculates current ledger balance for a specific shop.
 * Positive value = Shop owes money to wholesaler (Debit balance).
 * Negative value = Shop has surplus advance credit with wholesaler (Credit balance).
 */
export function calculateShopCurrentBalance(shopId: string, transactions?: LedgerTransaction[]): number {
  const txs = transactions || getStoredTransactions();
  const shopTxs = txs
    .filter((t) => t.shopId === shopId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (shopTxs.length === 0) {
    const shop = getStoredShops().find((s) => s.id === shopId);
    return shop ? shop.openingBalance : 0;
  }

  let balance = 0;
  for (const t of shopTxs) {
    balance += (t.debit || 0) - (t.credit || 0);
  }
  return balance;
}

/**
 * Recalculates running balances for all transactions of a shop in chronological order
 */
export function recomputeShopRunningBalances(shopId: string, allTransactions: LedgerTransaction[]): LedgerTransaction[] {
  const shopTxs = allTransactions.filter((t) => t.shopId === shopId);
  const otherTxs = allTransactions.filter((t) => t.shopId !== shopId);

  shopTxs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let running = 0;
  const updatedShopTxs = shopTxs.map((t) => {
    running += (t.debit || 0) - (t.credit || 0);
    return {
      ...t,
      runningBalance: running,
    };
  });

  return [...otherTxs, ...updatedShopTxs];
}

/**
 * Automatically updates invoice statuses according to financial logic:
 * - If shop current balance is <= 0 (cleared or in advance credit surplus), all invoices are 'paid'
 * - Advances & payments are applied chronologically (FIFO) to settle invoices from oldest to newest
 * - Invoices explicitly linked to payments get credited directly
 * - If paid >= bill: 'paid'; if paid > 0: 'partial'; if paid == 0: 'unpaid'
 */
export function recomputeAllInvoiceStatuses(
  allInvoices: Invoice[],
  allTransactions: LedgerTransaction[]
): Invoice[] {
  const shopIds = Array.from(new Set(allInvoices.map((i) => i.shopId)));
  const updatedInvoicesMap = new Map<string, Invoice>();

  for (const shopId of shopIds) {
    const shopInvoices = allInvoices
      .filter((inv) => inv.shopId === shopId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const currentBal = calculateShopCurrentBalance(shopId, allTransactions);

    // If shop's overall ledger balance is <= 0, every invoice is completely cleared!
    if (currentBal <= 0) {
      shopInvoices.forEach((inv) => {
        updatedInvoicesMap.set(inv.id, { ...inv, status: 'paid' });
      });
      continue;
    }

    // Otherwise calculate available payments for this shop
    const paymentTxs = allTransactions
      .filter((tx) => tx.shopId === shopId && (tx.type === 'payment' || tx.type === 'advance'))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const explicitPaidMap = new Map<string, number>();
    let poolCredits = 0;

    for (const tx of paymentTxs) {
      if (tx.invoiceId) {
        explicitPaidMap.set(tx.invoiceId, (explicitPaidMap.get(tx.invoiceId) || 0) + tx.credit);
      } else {
        poolCredits += tx.credit;
      }
    }

    for (const inv of shopInvoices) {
      const customAdd = inv.priceAdjustments?.filter((a) => a.type === 'add').reduce((s, a) => s + a.amount, 0) || 0;
      const customDeduct = inv.priceAdjustments?.filter((a) => a.type === 'deduct').reduce((s, a) => s + a.amount, 0) || 0;
      const billAmount = inv.subtotal + inv.freight - inv.discount + customAdd - customDeduct;

      const explicit = (inv.advancePaid || 0) + (explicitPaidMap.get(inv.id) || 0);
      let totalPaidTowardsInv = explicit;

      const remainingNeeded = Math.max(0, billAmount - totalPaidTowardsInv);
      if (remainingNeeded > 0 && poolCredits > 0) {
        const allocated = Math.min(poolCredits, remainingNeeded);
        totalPaidTowardsInv += allocated;
        poolCredits -= allocated;
      }

      let newStatus: 'paid' | 'partial' | 'unpaid';
      if (totalPaidTowardsInv >= billAmount - 0.5) {
        newStatus = 'paid';
      } else if (totalPaidTowardsInv > 0.5) {
        newStatus = 'partial';
      } else {
        newStatus = 'unpaid';
      }

      updatedInvoicesMap.set(inv.id, { ...inv, status: newStatus });
    }
  }

  return allInvoices.map((inv) => updatedInvoicesMap.get(inv.id) || inv);
}

export function resetAllDataToDefault() {
  saveStoredAreas(INITIAL_AREAS);
  saveStoredShops(INITIAL_SHOPS);
  saveStoredInvoices(INITIAL_INVOICES);
  saveStoredTransactions(INITIAL_TRANSACTIONS);
  saveStoredCatalog(CROCKERY_CATALOG);
  saveStoredBusinessSettings(DEFAULT_BUSINESS_SETTINGS);
  saveStoredCategories(DEFAULT_CATEGORIES);
  saveStoredUnits(DEFAULT_UNITS);
}
