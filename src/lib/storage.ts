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

export const getStoredSettings = (): StoreSettings => {
  try {
    const item = localStorage.getItem(KEYS.SETTINGS);
    return item ? JSON.parse(item) : initialStoreSettings;
  } catch (e) {
    console.error('Failed to load settings', e);
    return initialStoreSettings;
  }
};

export const saveStoredSettings = (settings: StoreSettings): void => {
  try {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
};

export const getStoredProducts = (): Product[] => {
  try {
    const item = localStorage.getItem(KEYS.PRODUCTS);
    return item ? JSON.parse(item) : initialProducts;
  } catch (e) {
    console.error('Failed to load products', e);
    return initialProducts;
  }
};

export const saveStoredProducts = (products: Product[]): void => {
  try {
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
  } catch (e) {
    console.error('Failed to save products', e);
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
