import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { Ingredient, BrownieRecipe, Purchase, ProductionBatch, Sale } from '../types';

/**
 * Serviço de sincronização em tempo real via Cloud Firestore.
 * Conecta todas as alterações simultaneamente no celular e no computador.
 */

// Coleções no Firestore
const COLLECTIONS = {
  INGREDIENTS: 'ingredients',
  BROWNIES: 'brownies',
  PURCHASES: 'purchases',
  PRODUCTIONS: 'productions',
  SALES: 'sales',
};

// Remove propriedades com valor undefined que o Firestore rejeita
function cleanData<T extends Record<string, any>>(obj: T): T {
  const result: any = {};
  for (const key of Object.keys(obj)) {
    if (obj[key] !== undefined) {
      if (Array.isArray(obj[key])) {
        result[key] = obj[key].map((item: any) => 
          typeof item === 'object' && item !== null ? cleanData(item) : item
        );
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        result[key] = cleanData(obj[key]);
      } else {
        result[key] = obj[key];
      }
    }
  }
  return result as T;
}

export const syncService = {
  // --- INGREDIENTES ---
  subscribeIngredients: (callback: (data: Ingredient[]) => void) => {
    return onSnapshot(collection(db, COLLECTIONS.INGREDIENTS), (snapshot) => {
      const items = snapshot.docs.map(doc => doc.data() as Ingredient);
      callback(items);
    }, (error) => {
      console.warn('Erro ao sincronizar ingredientes do Firestore:', error);
    });
  },

  saveIngredient: async (ingredient: Ingredient) => {
    try {
      await setDoc(doc(db, COLLECTIONS.INGREDIENTS, ingredient.id), cleanData(ingredient));
    } catch (e) {
      console.error('Falha ao salvar ingrediente no Firestore:', e);
    }
  },

  deleteIngredient: async (id: string) => {
    try {
      await deleteDoc(doc(db, COLLECTIONS.INGREDIENTS, id));
    } catch (e) {
      console.error('Falha ao deletar ingrediente no Firestore:', e);
    }
  },

  // --- BROWNIES (RECEITAS E ESTOQUE) ---
  subscribeBrownies: (callback: (data: BrownieRecipe[]) => void) => {
    return onSnapshot(collection(db, COLLECTIONS.BROWNIES), (snapshot) => {
      const items = snapshot.docs.map(doc => doc.data() as BrownieRecipe);
      callback(items);
    }, (error) => {
      console.warn('Erro ao sincronizar brownies do Firestore:', error);
    });
  },

  saveBrownie: async (brownie: BrownieRecipe) => {
    try {
      await setDoc(doc(db, COLLECTIONS.BROWNIES, brownie.id), cleanData(brownie));
    } catch (e) {
      console.error('Falha ao salvar brownie no Firestore:', e);
    }
  },

  deleteBrownie: async (id: string) => {
    try {
      await deleteDoc(doc(db, COLLECTIONS.BROWNIES, id));
    } catch (e) {
      console.error('Falha ao deletar brownie no Firestore:', e);
    }
  },

  // --- COMPRAS ---
  subscribePurchases: (callback: (data: Purchase[]) => void) => {
    return onSnapshot(collection(db, COLLECTIONS.PURCHASES), (snapshot) => {
      const items = snapshot.docs.map(doc => doc.data() as Purchase);
      callback(items);
    }, (error) => {
      console.warn('Erro ao sincronizar compras do Firestore:', error);
    });
  },

  savePurchase: async (purchase: Purchase) => {
    try {
      await setDoc(doc(db, COLLECTIONS.PURCHASES, purchase.id), cleanData(purchase));
    } catch (e) {
      console.error('Falha ao salvar compra no Firestore:', e);
    }
  },

  deletePurchase: async (id: string) => {
    try {
      await deleteDoc(doc(db, COLLECTIONS.PURCHASES, id));
    } catch (e) {
      console.error('Falha ao deletar compra no Firestore:', e);
    }
  },

  // --- PRODUÇÕES (FORNADAS) ---
  subscribeProductions: (callback: (data: ProductionBatch[]) => void) => {
    return onSnapshot(collection(db, COLLECTIONS.PRODUCTIONS), (snapshot) => {
      const items = snapshot.docs.map(doc => doc.data() as ProductionBatch);
      callback(items);
    }, (error) => {
      console.warn('Erro ao sincronizar produções do Firestore:', error);
    });
  },

  saveProduction: async (production: ProductionBatch) => {
    try {
      await setDoc(doc(db, COLLECTIONS.PRODUCTIONS, production.id), cleanData(production));
    } catch (e) {
      console.error('Falha ao salvar produção no Firestore:', e);
    }
  },

  deleteProduction: async (id: string) => {
    try {
      await deleteDoc(doc(db, COLLECTIONS.PRODUCTIONS, id));
    } catch (e) {
      console.error('Falha ao deletar produção no Firestore:', e);
    }
  },

  // --- VENDAS ---
  subscribeSales: (callback: (data: Sale[]) => void) => {
    return onSnapshot(collection(db, COLLECTIONS.SALES), (snapshot) => {
      const items = snapshot.docs.map(doc => doc.data() as Sale);
      callback(items);
    }, (error) => {
      console.warn('Erro ao sincronizar vendas do Firestore:', error);
    });
  },

  saveSale: async (sale: Sale) => {
    try {
      await setDoc(doc(db, COLLECTIONS.SALES, sale.id), cleanData(sale));
    } catch (e) {
      console.error('Falha ao salvar venda no Firestore:', e);
    }
  },

  deleteSale: async (id: string) => {
    try {
      await deleteDoc(doc(db, COLLECTIONS.SALES, id));
    } catch (e) {
      console.error('Falha ao deletar venda no Firestore:', e);
    }
  },


  /**
   * Inicializa o banco de dados do Firestore com os dados iniciais caso esteja vazio.
   */
  seedInitialDataIfEmpty: async (
    currentIngredients: Ingredient[],
    currentBrownies: BrownieRecipe[]
  ) => {
    try {
      for (const ing of currentIngredients) {
        await setDoc(doc(db, COLLECTIONS.INGREDIENTS, ing.id), ing, { merge: true });
      }
      for (const b of currentBrownies) {
        await setDoc(doc(db, COLLECTIONS.BROWNIES, b.id), b, { merge: true });
      }
    } catch (e) {
      console.warn('Seed inicial concluído ou já sincronizado.', e);
    }
  }
};
