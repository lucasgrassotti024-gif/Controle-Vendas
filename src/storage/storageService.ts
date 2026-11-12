import { Ingredient, BrownieRecipe, Purchase, ProductionBatch, Sale } from '../types';

const KEYS = {
  INGREDIENTS: '@brownie_gestao:ingredients',
  BROWNIES: '@brownie_gestao:brownies',
  PURCHASES: '@brownie_gestao:purchases',
  PRODUCTIONS: '@brownie_gestao:productions',
  SALES: '@brownie_gestao:sales',
};

export const storageService = {
  // Insumos
  getIngredients: (): Ingredient[] => {
    try {
      const data = localStorage.getItem(KEYS.INGREDIENTS);
      if (!data) {
        localStorage.setItem(KEYS.INGREDIENTS, JSON.stringify([]));
        return [];
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },
  saveIngredients: (ingredients: Ingredient[]): void => {
    localStorage.setItem(KEYS.INGREDIENTS, JSON.stringify(ingredients));
  },

  // Receitas / Brownies
  getBrownies: (): BrownieRecipe[] => {
    try {
      const data = localStorage.getItem(KEYS.BROWNIES);
      if (!data) {
        localStorage.setItem(KEYS.BROWNIES, JSON.stringify([]));
        return [];
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },
  saveBrownies: (brownies: BrownieRecipe[]): void => {
    localStorage.setItem(KEYS.BROWNIES, JSON.stringify(brownies));
  },

  // Compras
  getPurchases: (): Purchase[] => {
    try {
      const data = localStorage.getItem(KEYS.PURCHASES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  savePurchases: (purchases: Purchase[]): void => {
    localStorage.setItem(KEYS.PURCHASES, JSON.stringify(purchases));
  },

  // Produções
  getProductions: (): ProductionBatch[] => {
    try {
      const data = localStorage.getItem(KEYS.PRODUCTIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveProductions: (productions: ProductionBatch[]): void => {
    localStorage.setItem(KEYS.PRODUCTIONS, JSON.stringify(productions));
  },

  // Vendas
  getSales: (): Sale[] => {
    try {
      const data = localStorage.getItem(KEYS.SALES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveSales: (sales: Sale[]): void => {
    localStorage.setItem(KEYS.SALES, JSON.stringify(sales));
  },

  // Limpar e deixar sistema 100% zerado
  resetToFactoryDefaults: (): void => {
    localStorage.setItem(KEYS.INGREDIENTS, JSON.stringify([]));
    localStorage.setItem(KEYS.BROWNIES, JSON.stringify([]));
    localStorage.setItem(KEYS.PURCHASES, JSON.stringify([]));
    localStorage.setItem(KEYS.PRODUCTIONS, JSON.stringify([]));
    localStorage.setItem(KEYS.SALES, JSON.stringify([]));
  }
};
