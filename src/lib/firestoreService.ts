import {
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
  Unsubscribe,
  query,
  where,
} from 'firebase/firestore';
import { db, auth } from './firebase';
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
import {
  saveStoredSettings,
  saveStoredProducts,
  saveStoredCategories,
  saveStoredTags,
  saveStoredCoupons,
  saveStoredOrders,
  saveStoredFinance,
  saveStoredAdminUser,
} from './storage';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const COLLECTIONS = {
  SETTINGS: 'settings',
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  TAGS: 'tags',
  COUPONS: 'coupons',
  ORDERS: 'orders',
  FINANCE: 'financial_transactions',
  ADMIN_AUTH: 'admin_auth',
  CLIENTS: 'clients',
};

const SETTINGS_DOC_ID = 'store_settings';
const ADMIN_USER_DOC_ID = 'primary_admin';

/**
 * Multi-Tenant Helpers
 */
export const getCollectionRef = (baseCollectionName: string, clientId?: string) => {
  if (clientId) {
    return collection(db, `client_${clientId}_${baseCollectionName}`);
  }
  return collection(db, baseCollectionName);
};

export const getDocRef = (baseCollectionName: string, docId: string, clientId?: string) => {
  if (clientId) {
    return doc(db, `client_${clientId}_${baseCollectionName}`, docId);
  }
  return doc(db, baseCollectionName, docId);
};

/**
 * Initializes Firestore with initial sample data if the database has not been seeded yet.
 */
export const seedInitialDataIfEmpty = async (): Promise<void> => {
  try {
    const settingsRef = doc(db, COLLECTIONS.SETTINGS, SETTINGS_DOC_ID);
    let settingsSnap;
    try {
      settingsSnap = await getDoc(settingsRef);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      if (
        errMsg.includes('offline') ||
        errMsg.includes('unavailable') ||
        errMsg.includes('Could not reach') ||
        errMsg.includes('Connection failed')
      ) {
        console.warn('Firestore is offline/unavailable. Skipping seeding check; the application will fall back to local storage cache.', err);
        return;
      }
      throw err;
    }

    // If settings document already exists, the database is already initialized.
    // Do not re-seed empty collections so user deletions are preserved.
    if (settingsSnap && settingsSnap.exists()) {
      return;
    }

    console.log('First-time setup: Seeding initial data into Cloud Firestore...');
    const batch = writeBatch(db);

    // Seed settings
    batch.set(settingsRef, initialStoreSettings);

    // Seed products
    initialProducts.forEach((product) => {
      const prodRef = doc(db, COLLECTIONS.PRODUCTS, product.id);
      batch.set(prodRef, product);
    });

    // Seed categories
    initialCategories.forEach((category) => {
      const catRef = doc(db, COLLECTIONS.CATEGORIES, category.id);
      batch.set(catRef, category);
    });

    // Seed tags
    initialTags.forEach((tag) => {
      const tagRef = doc(db, COLLECTIONS.TAGS, tag.id);
      batch.set(tagRef, tag);
    });

    // Seed coupons
    initialCoupons.forEach((coupon) => {
      const couponRef = doc(db, COLLECTIONS.COUPONS, coupon.id);
      batch.set(couponRef, coupon);
    });

    // Seed orders
    initialOrders.forEach((order) => {
      const orderRef = doc(db, COLLECTIONS.ORDERS, order.id);
      batch.set(orderRef, order);
    });

    // Seed financial records
    initialFinancialRecords.forEach((finance) => {
      const finRef = doc(db, COLLECTIONS.FINANCE, finance.id);
      batch.set(finRef, finance);
    });

    // Seed admin auth credentials
    const adminRef = doc(db, COLLECTIONS.ADMIN_AUTH, ADMIN_USER_DOC_ID);
    batch.set(adminRef, initialAdminUser);

    await batch.commit();
    console.log('Initial data seeded successfully in Cloud Firestore!');
  } catch (error) {
    console.error('Error checking/seeding Firestore data:', error);
  }
};

/**
 * Subscribe to real-time store settings updates
 */
export const subscribeToSettings = (
  callback: (settings: StoreSettings) => void,
  clientId?: string,
  clientStoreName?: string
): Unsubscribe => {
  const settingsRef = getDocRef(COLLECTIONS.SETTINGS, SETTINGS_DOC_ID, clientId);
  return onSnapshot(
    settingsRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as StoreSettings;
        callback(data);
        if (!clientId) saveStoredSettings(data);
      } else {
        // Fallback: create settings doc
        const defaultSettings = { 
          ...initialStoreSettings, 
          storeName: clientStoreName || 'Minha Loja',
          isFirstSetupDone: false 
        };
        setDoc(settingsRef, defaultSettings).catch(console.error);
        callback(defaultSettings);
      }
    },
    (error) => {
      console.error('Error listening to settings in Firestore:', error);
    }
  );
};

export const saveSettingsToDb = async (settings: StoreSettings, clientId?: string): Promise<void> => {
  try {
    if (!clientId) saveStoredSettings(settings);
    const settingsRef = getDocRef(COLLECTIONS.SETTINGS, SETTINGS_DOC_ID, clientId);
    await setDoc(settingsRef, settings, { merge: true });
  } catch (error) {
    console.error('Error saving settings to Firestore:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time products updates
 */
export const subscribeToProducts = (
  callback: (products: Product[]) => void,
  clientId?: string
): Unsubscribe => {
  const prodCol = getCollectionRef(COLLECTIONS.PRODUCTS, clientId);
  return onSnapshot(
    prodCol,
    (snapshot) => {
      const items: Product[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as Product);
      });
      callback(items);
      if (!clientId) saveStoredProducts(items);
    },
    (error) => {
      console.error('Error listening to products in Firestore:', error);
    }
  );
};

export const saveProductToDb = async (product: Product, clientId?: string): Promise<void> => {
  try {
    const prodRef = getDocRef(COLLECTIONS.PRODUCTS, product.id, clientId);
    await setDoc(prodRef, product);
  } catch (error) {
    console.error('Error saving product to Firestore:', error);
    throw error;
  }
};

export const deleteProductFromDb = async (productId: string, clientId?: string): Promise<void> => {
  try {
    const prodRef = getDocRef(COLLECTIONS.PRODUCTS, productId, clientId);
    await deleteDoc(prodRef);
  } catch (error) {
    console.error('Error deleting product from Firestore:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time categories updates
 */
export const subscribeToCategories = (
  callback: (categories: TagCategory[]) => void,
  clientId?: string
): Unsubscribe => {
  const catCol = getCollectionRef(COLLECTIONS.CATEGORIES, clientId);
  return onSnapshot(
    catCol,
    (snapshot) => {
      const items: TagCategory[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as TagCategory);
      });
      callback(items);
      if (!clientId) saveStoredCategories(items);
    },
    (error) => {
      console.error('Error listening to categories in Firestore:', error);
    }
  );
};

export const saveCategoryToDb = async (category: TagCategory, clientId?: string): Promise<void> => {
  try {
    const catRef = getDocRef(COLLECTIONS.CATEGORIES, category.id, clientId);
    await setDoc(catRef, category);
  } catch (error) {
    console.error('Error saving category to Firestore:', error);
    throw error;
  }
};

export const deleteCategoryFromDb = async (categoryId: string, clientId?: string): Promise<void> => {
  try {
    const catRef = getDocRef(COLLECTIONS.CATEGORIES, categoryId, clientId);
    await deleteDoc(catRef);
  } catch (error) {
    console.error('Error deleting category from Firestore:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time tags updates
 */
export const subscribeToTags = (
  callback: (tags: TagCategory[]) => void,
  clientId?: string
): Unsubscribe => {
  const tagCol = getCollectionRef(COLLECTIONS.TAGS, clientId);
  return onSnapshot(
    tagCol,
    (snapshot) => {
      const items: TagCategory[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as TagCategory);
      });
      callback(items);
      if (!clientId) saveStoredTags(items);
    },
    (error) => {
      console.error('Error listening to tags in Firestore:', error);
    }
  );
};

export const saveTagToDb = async (tag: TagCategory, clientId?: string): Promise<void> => {
  try {
    const tagRef = getDocRef(COLLECTIONS.TAGS, tag.id, clientId);
    await setDoc(tagRef, tag);
  } catch (error) {
    console.error('Error saving tag to Firestore:', error);
    throw error;
  }
};

export const deleteTagFromDb = async (tagId: string, clientId?: string): Promise<void> => {
  try {
    const tagRef = getDocRef(COLLECTIONS.TAGS, tagId, clientId);
    await deleteDoc(tagRef);
  } catch (error) {
    console.error('Error deleting tag from Firestore:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time coupons updates
 */
export const subscribeToCoupons = (
  callback: (coupons: Coupon[]) => void,
  clientId?: string
): Unsubscribe => {
  const couponCol = getCollectionRef(COLLECTIONS.COUPONS, clientId);
  return onSnapshot(
    couponCol,
    (snapshot) => {
      const items: Coupon[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as Coupon);
      });
      callback(items);
      if (!clientId) saveStoredCoupons(items);
    },
    (error) => {
      console.error('Error listening to coupons in Firestore:', error);
    }
  );
};

export const saveCouponToDb = async (coupon: Coupon, clientId?: string): Promise<void> => {
  try {
    const couponRef = getDocRef(COLLECTIONS.COUPONS, coupon.id, clientId);
    await setDoc(couponRef, coupon);
  } catch (error) {
    console.error('Error saving coupon to Firestore:', error);
    throw error;
  }
};

export const deleteCouponFromDb = async (couponId: string, clientId?: string): Promise<void> => {
  try {
    const couponRef = getDocRef(COLLECTIONS.COUPONS, couponId, clientId);
    await deleteDoc(couponRef);
  } catch (error) {
    console.error('Error deleting coupon from Firestore:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time orders updates
 */
export const subscribeToOrders = (
  callback: (orders: Order[]) => void,
  clientId?: string
): Unsubscribe => {
  const ordersCol = getCollectionRef(COLLECTIONS.ORDERS, clientId);
  return onSnapshot(
    ordersCol,
    (snapshot) => {
      const items: Order[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as Order);
      });
      // Sort orders descending by creation timestamp
      items.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      callback(items);
      if (!clientId) saveStoredOrders(items);
    },
    (error) => {
      console.error('Error listening to orders in Firestore:', error);
    }
  );
};

export const saveOrderToDb = async (order: Order, clientId?: string): Promise<void> => {
  try {
    const orderRef = getDocRef(COLLECTIONS.ORDERS, order.id, clientId);
    await setDoc(orderRef, order);
  } catch (error) {
    console.error('Error saving order to Firestore:', error);
    throw error;
  }
};

export const deleteOrderFromDb = async (orderId: string, clientId?: string): Promise<void> => {
  try {
    const orderRef = getDocRef(COLLECTIONS.ORDERS, orderId, clientId);
    await deleteDoc(orderRef);
  } catch (error) {
    console.error('Error deleting order from Firestore:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time financial records updates
 */
export const subscribeToFinance = (
  callback: (finance: FinancialRecord[]) => void,
  clientId?: string
): Unsubscribe => {
  const finCol = getCollectionRef(COLLECTIONS.FINANCE, clientId);
  return onSnapshot(
    finCol,
    (snapshot) => {
      const items: FinancialRecord[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as FinancialRecord);
      });
      callback(items);
      if (!clientId) saveStoredFinance(items);
    },
    (error) => {
      console.error('Error listening to finance in Firestore:', error);
    }
  );
};

export const saveFinanceToDb = async (record: FinancialRecord, clientId?: string): Promise<void> => {
  try {
    const finRef = getDocRef(COLLECTIONS.FINANCE, record.id, clientId);
    await setDoc(finRef, record);
  } catch (error) {
    console.error('Error saving finance to Firestore:', error);
    throw error;
  }
};

export const deleteFinanceFromDb = async (recordId: string, clientId?: string): Promise<void> => {
  try {
    const finRef = getDocRef(COLLECTIONS.FINANCE, recordId, clientId);
    await deleteDoc(finRef);
  } catch (error) {
    console.error('Error deleting finance record from Firestore:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time admin credentials updates
 */
export const subscribeToAdminUser = (
  callback: (user: AdminUser) => void
): Unsubscribe => {
  const adminRef = doc(db, COLLECTIONS.ADMIN_AUTH, ADMIN_USER_DOC_ID);
  return onSnapshot(
    adminRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as AdminUser;
        callback(data);
        saveStoredAdminUser(data);
      } else {
        // Fallback: seed admin user
        setDoc(adminRef, initialAdminUser).catch(console.error);
        callback(initialAdminUser);
      }
    },
    (error) => {
      console.error('Error listening to admin auth in Firestore:', error);
    }
  );
};

export const saveAdminUserToDb = async (user: AdminUser): Promise<void> => {
  try {
    saveStoredAdminUser(user);
    const adminRef = doc(db, COLLECTIONS.ADMIN_AUTH, ADMIN_USER_DOC_ID);
    await setDoc(adminRef, user, { merge: true });
  } catch (error) {
    console.error('Error saving admin auth to Firestore:', error);
    throw error;
  }
};

/**
 * Reset all database collections to initial default values
 */
export const resetDatabaseToDefaults = async (): Promise<void> => {
  try {
    const batch = writeBatch(db);

    // Reset settings
    const settingsRef = doc(db, COLLECTIONS.SETTINGS, SETTINGS_DOC_ID);
    batch.set(settingsRef, initialStoreSettings);

    // Overwrite products
    initialProducts.forEach((prod) => {
      const pRef = doc(db, COLLECTIONS.PRODUCTS, prod.id);
      batch.set(pRef, prod);
    });

    // Overwrite categories
    initialCategories.forEach((cat) => {
      const cRef = doc(db, COLLECTIONS.CATEGORIES, cat.id);
      batch.set(cRef, cat);
    });

    // Overwrite tags
    initialTags.forEach((tag) => {
      const tRef = doc(db, COLLECTIONS.TAGS, tag.id);
      batch.set(tRef, tag);
    });

    // Overwrite coupons
    initialCoupons.forEach((coupon) => {
      const coupRef = doc(db, COLLECTIONS.COUPONS, coupon.id);
      batch.set(coupRef, coupon);
    });

    // Overwrite orders
    initialOrders.forEach((ord) => {
      const ordRef = doc(db, COLLECTIONS.ORDERS, ord.id);
      batch.set(ordRef, ord);
    });

    // Overwrite finance
    initialFinancialRecords.forEach((fin) => {
      const finRef = doc(db, COLLECTIONS.FINANCE, fin.id);
      batch.set(finRef, fin);
    });

    // Overwrite admin auth
    const adminRef = doc(db, COLLECTIONS.ADMIN_AUTH, ADMIN_USER_DOC_ID);
    batch.set(adminRef, initialAdminUser);

    await batch.commit();
    console.log('Database reset to defaults in Cloud Firestore!');
  } catch (error) {
    console.error('Error resetting database to defaults:', error);
    throw error;
  }
};

// ======================= CLIENTS (SAAS ADMIN) =======================

export const authenticateClient = async (username: string, password: string): Promise<any | null> => {
  try {
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    const clientsCol = collection(db, COLLECTIONS.CLIENTS);
    const snapshot = await getDocs(clientsCol);
    
    if (snapshot.empty) {
      return null;
    }
    
    const matchedDoc = snapshot.docs.find((docSnap) => {
      const data = docSnap.data();
      const u = (data.username || '').toString().trim().toLowerCase();
      const p = (data.password || '').toString().trim();
      return u === cleanUser && p === cleanPass;
    });

    if (matchedDoc) {
      return { id: matchedDoc.id, ...matchedDoc.data() };
    }

    return null;
  } catch (error) {
    console.error('Error authenticating client:', error);
    return null;
  }
};

export const getClients = (callback: (clients: any[]) => void) => {
  const clientsCol = collection(db, COLLECTIONS.CLIENTS);
  return onSnapshot(
    clientsCol,
    (snapshot) => {
      const items: any[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() });
      });
      callback(items);
    },
    (error) => {
      console.error('Error fetching clients:', error);
      callback([]);
    }
  );
};

export const saveClient = async (clientData: any) => {
  try {
    const clientsCol = collection(db, COLLECTIONS.CLIENTS);
    if (clientData.id) {
      const docRef = doc(db, COLLECTIONS.CLIENTS, clientData.id);
      await setDoc(docRef, clientData, { merge: true });
    } else {
      const newRef = doc(clientsCol);
      await setDoc(newRef, { ...clientData, id: newRef.id });
    }
  } catch (error) {
    console.error('Error saving client:', error);
    throw error;
  }
};

export const deleteClient = async (id: string) => {
  try {
    const docRef = doc(db, COLLECTIONS.CLIENTS, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting client:', error);
    throw error;
  }
};

export const getClientByUsername = async (slugOrUsername: string): Promise<any | null> => {
  try {
    const clean = slugOrUsername.trim().toLowerCase();
    const clientsCol = collection(db, COLLECTIONS.CLIENTS);
    const snapshot = await getDocs(clientsCol);

    if (snapshot.empty) {
      return null;
    }

    const matchedDoc = snapshot.docs.find((docSnap) => {
      const data = docSnap.data();
      const u = (data.username || '').toString().trim().toLowerCase();
      const s = (data.storeSlug || '').toString().trim().toLowerCase();
      return u === clean || s === clean;
    });

    if (matchedDoc) {
      return { id: matchedDoc.id, ...matchedDoc.data() };
    }

    return null;
  } catch (error) {
    console.error('Error fetching client by username/slug:', error);
    return null;
  }
};
