import {
  StoreSettings,
  Product,
  Coupon,
  Order,
  FinancialRecord,
  TagCategory,
  AdminUser,
} from '../types';
import {
  initialStoreSettings,
  initialProducts,
  initialCategories,
  initialTags,
  initialCoupons,
  initialOrders,
  initialFinancialRecords,
  initialAdminUser,
} from '../data/initialData';

const KEYS = {
  SETTINGS: 'aura_store_settings_v1',
  PRODUCTS: 'aura_store_products_v1',
  CATEGORIES: 'aura_store_categories_v1',
  TAGS: 'aura_store_tags_v1',
  COUPONS: 'aura_store_coupons_v1',
  ORDERS: 'aura_store_orders_v1',
  FINANCE: 'aura_store_finance_v1',
  ADMIN_USER: 'vitrine_admin_user_v1',
  AUTH_SESSION: 'vitrine_auth_session_v1',
};

export const hasStoredSettings = (clientId?: string): boolean => {
  try {
    const key = clientId ? `${KEYS.SETTINGS}_${clientId}` : KEYS.SETTINGS;
    const item = localStorage.getItem(key);
    if (!item) return false;
    const parsed = JSON.parse(item);
    return Boolean(parsed && typeof parsed === 'object');
  } catch {
    return false;
  }
};

export const getStoredSettings = (clientId?: string): StoreSettings => {
  const tenantFallback: StoreSettings = {
    ...initialStoreSettings,
    storeName: '',
    logoUrl: '',
    bannerUrl: '',
    customDeliveryRates: [],
  };
  try {
    const key = clientId ? `${KEYS.SETTINGS}_${clientId}` : KEYS.SETTINGS;
    const item = localStorage.getItem(key);
    if (item) {
      const parsed = JSON.parse(item);
      if (parsed && typeof parsed === 'object') {
        return {
          ...(clientId ? tenantFallback : initialStoreSettings),
          ...parsed,
          logoUrl: parsed.logoUrl || '',
          bannerUrl: parsed.bannerUrl || '',
          customDeliveryRates: Array.isArray(parsed.customDeliveryRates)
            ? parsed.customDeliveryRates
            : clientId
            ? []
            : initialStoreSettings.customDeliveryRates,
        };
      }
    }
    return clientId ? tenantFallback : initialStoreSettings;
  } catch (e) {
    console.error('Failed to load settings', e);
    return clientId ? tenantFallback : initialStoreSettings;
  }
};

export const saveStoredSettings = (settings: StoreSettings, clientId?: string): void => {
  try {
    const key = clientId ? `${KEYS.SETTINGS}_${clientId}` : KEYS.SETTINGS;
    localStorage.setItem(key, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
};

export const getStoredProducts = (clientId?: string): Product[] => {
  try {
    const key = clientId ? `${KEYS.PRODUCTS}_${clientId}` : KEYS.PRODUCTS;
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : clientId ? [] : initialProducts;
  } catch (e) {
    console.error('Failed to load products', e);
    return clientId ? [] : initialProducts;
  }
};

export const saveStoredProducts = (products: Product[], clientId?: string): void => {
  try {
    const key = clientId ? `${KEYS.PRODUCTS}_${clientId}` : KEYS.PRODUCTS;
    localStorage.setItem(key, JSON.stringify(products));
  } catch (e) {
    // If localStorage 5MB quota is exceeded by Base64 photos, ignore silently since Cloud Firestore holds the source of truth
    console.warn('Could not mirror full product cache in localStorage (quota limit):', e);
  }
};

export const getStoredCategories = (): TagCategory[] => {
  try {
    const item = localStorage.getItem(KEYS.CATEGORIES);
    return item ? JSON.parse(item) : initialCategories;
  } catch (e) {
    console.error('Failed to load categories', e);
    return initialCategories;
  }
};

export const saveStoredCategories = (categories: TagCategory[]): void => {
  try {
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
  } catch (e) {
    console.error('Failed to save categories', e);
  }
};

export const getStoredTags = (): TagCategory[] => {
  try {
    const item = localStorage.getItem(KEYS.TAGS);
    return item ? JSON.parse(item) : initialTags;
  } catch (e) {
    console.error('Failed to load tags', e);
    return initialTags;
  }
};

export const saveStoredTags = (tags: TagCategory[]): void => {
  try {
    localStorage.setItem(KEYS.TAGS, JSON.stringify(tags));
  } catch (e) {
    console.error('Failed to save tags', e);
  }
};

export const getStoredCoupons = (): Coupon[] => {
  try {
    const item = localStorage.getItem(KEYS.COUPONS);
    return item ? JSON.parse(item) : initialCoupons;
  } catch (e) {
    console.error('Failed to load coupons', e);
    return initialCoupons;
  }
};

export const saveStoredCoupons = (coupons: Coupon[]): void => {
  try {
    localStorage.setItem(KEYS.COUPONS, JSON.stringify(coupons));
  } catch (e) {
    console.error('Failed to save coupons', e);
  }
};

export const getStoredOrders = (): Order[] => {
  try {
    const item = localStorage.getItem(KEYS.ORDERS);
    return item ? JSON.parse(item) : initialOrders;
  } catch (e) {
    console.error('Failed to load orders', e);
    return initialOrders;
  }
};

export const saveStoredOrders = (orders: Order[]): void => {
  try {
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
  } catch (e) {
    console.error('Failed to save orders', e);
  }
};

export const getStoredFinance = (): FinancialRecord[] => {
  try {
    const item = localStorage.getItem(KEYS.FINANCE);
    return item ? JSON.parse(item) : initialFinancialRecords;
  } catch (e) {
    console.error('Failed to load finance', e);
    return initialFinancialRecords;
  }
};

export const saveStoredFinance = (finance: FinancialRecord[]): void => {
  try {
    localStorage.setItem(KEYS.FINANCE, JSON.stringify(finance));
  } catch (e) {
    console.error('Failed to save finance', e);
  }
};

export const getStoredAdminUser = (): AdminUser => {
  try {
    const item = localStorage.getItem(KEYS.ADMIN_USER);
    return item ? JSON.parse(item) : initialAdminUser;
  } catch (e) {
    console.error('Failed to load admin user', e);
    return initialAdminUser;
  }
};

export const saveStoredAdminUser = (user: AdminUser): void => {
  try {
    localStorage.setItem(KEYS.ADMIN_USER, JSON.stringify(user));
  } catch (e) {
    console.error('Failed to save admin user', e);
  }
};

export const getAuthSession = (): boolean => {
  try {
    return localStorage.getItem(KEYS.AUTH_SESSION) === 'true';
  } catch (e) {
    return false;
  }
};

export const saveAuthSession = (isAuthenticated: boolean): void => {
  try {
    if (isAuthenticated) {
      localStorage.setItem(KEYS.AUTH_SESSION, 'true');
    } else {
      localStorage.removeItem(KEYS.AUTH_SESSION);
    }
  } catch (e) {
    console.error('Failed to save auth session', e);
  }
};

export const resetAllToDefault = (): void => {
  localStorage.removeItem(KEYS.SETTINGS);
  localStorage.removeItem(KEYS.PRODUCTS);
  localStorage.removeItem(KEYS.CATEGORIES);
  localStorage.removeItem(KEYS.TAGS);
  localStorage.removeItem(KEYS.COUPONS);
  localStorage.removeItem(KEYS.ORDERS);
  localStorage.removeItem(KEYS.FINANCE);
  localStorage.removeItem(KEYS.ADMIN_USER);
  localStorage.removeItem(KEYS.AUTH_SESSION);
};
