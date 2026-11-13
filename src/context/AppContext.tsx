import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  Ingredient, 
  BrownieRecipe, 
  Purchase, 
  ProductionBatch, 
  Sale, 
  DashboardMetrics 
} from '../types';
import { initialIngredients, initialBrownies } from '../storage/initialData';
import { storageService } from '../storage/storageService';
import { syncService } from '../services/syncService';
import { 
  convertToBaseUnit, 
  calculateCostPerBaseUnit, 
  calculateBrownieUnitCost, 
  computeDashboardMetrics 
} from '../services/calcService';

interface AppContextType {
  // Estados principais
  ingredients: Ingredient[];
  brownies: BrownieRecipe[];
  purchases: Purchase[];
  productions: ProductionBatch[];
  sales: Sale[];
  metrics: DashboardMetrics;

  // Status de sincronização
  isOnline: boolean;

  // Mapa rápido de ingredientes por ID
  ingredientsMap: Map<string, Ingredient>;

  // Métodos de Ação (Conexões do Sistema)
  addPurchase: (data: Omit<Purchase, 'id' | 'calculatedCostPerBaseUnit'>) => void;
  addProduction: (recipeId: string, batchesCount: number) => { success: boolean; message?: string };
  addSale: (data: Omit<Sale, 'id'>) => { success: boolean; message?: string };
  settlePendingSale: (saleId: string) => void; // Baixa de Fiado
  addIngredient: (ingredient: Omit<Ingredient, 'id'>) => void;
  updateIngredient: (ingredient: Ingredient) => void;
  deleteIngredient: (id: string) => { success: boolean; message?: string };
  addBrownieRecipe: (recipe: Omit<BrownieRecipe, 'id' | 'currentStock'>) => void;
  updateBrownieRecipe: (recipe: BrownieRecipe) => void;
  deleteBrownieRecipe: (id: string) => void;
  deletePurchase: (purchaseId: string) => void;
  deleteSale: (saleId: string) => void;
  getBrownieUnitCost: (recipe: BrownieRecipe) => number;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estados locais sincronizados
  const [ingredients, setIngredients] = useState<Ingredient[]>(() => {
    const data = storageService.getIngredients();
    const cleaned = data.filter(i => 
      i.id !== 'ing-mao-obra' && 
      !i.name.toLowerCase().includes('mão de obra') && 
      !i.name.toLowerCase().includes('mao de obra')
    );
    return cleaned.length > 0 ? cleaned : initialIngredients;
  });

  const [brownies, setBrownies] = useState<BrownieRecipe[]>(() => {
    const data = storageService.getBrownies();
    const cleanedBrownies = data.map(b => ({
      ...b,
      laborCost: b.laborCost ?? 1.00,
      items: b.items.filter(it => it.ingredientId !== 'ing-mao-obra')
    }));
    return cleanedBrownies.length > 0 ? cleanedBrownies : initialBrownies;
  });

  const [purchases, setPurchases] = useState<Purchase[]>(() => storageService.getPurchases());
  const [productions, setProductions] = useState<ProductionBatch[]>(() => storageService.getProductions());
  const [sales, setSales] = useState<Sale[]>(() => storageService.getSales());
  const [isOnline] = useState<boolean>(true);

  // Flag para evitar loops de re-upload ao receber snapshot do Firestore
  const isSyncingFromRemote = useRef(false);

  // 1. SINCRONIZAÇÃO EM TEMPO REAL VIA FIRESTORE (Celular <-> Computador)
  useEffect(() => {
    // Escuta alterações em ingredientes
    const unsubIngredients = syncService.subscribeIngredients((remoteIngredients) => {
      if (remoteIngredients && remoteIngredients.length > 0) {
        isSyncingFromRemote.current = true;
        setIngredients(remoteIngredients);
        storageService.saveIngredients(remoteIngredients);
        setTimeout(() => { isSyncingFromRemote.current = false; }, 100);
      } else {
        // Se a nuvem estiver vazia, sobe os dados iniciais
        syncService.seedInitialDataIfEmpty(ingredients, brownies);
      }
    });

    // Escuta alterações em brownies
    const unsubBrownies = syncService.subscribeBrownies((remoteBrownies) => {
      if (remoteBrownies && remoteBrownies.length > 0) {
        isSyncingFromRemote.current = true;
        // Garante que fotos oficiais de initialBrownies sejam mantidas caso ausentes no banco remoto
        const enriched = remoteBrownies.map(b => {
          const matchInitial = initialBrownies.find(ib => ib.id === b.id);
          return {
            ...b,
            imageUrl: b.imageUrl || matchInitial?.imageUrl,
            laborCost: b.laborCost ?? 1.00
          };
        });
        setBrownies(enriched);
        storageService.saveBrownies(enriched);
        setTimeout(() => { isSyncingFromRemote.current = false; }, 100);
      }
    });

    // Escuta alterações em compras
    const unsubPurchases = syncService.subscribePurchases((remotePurchases) => {
      isSyncingFromRemote.current = true;
      setPurchases(remotePurchases);
      storageService.savePurchases(remotePurchases);
      setTimeout(() => { isSyncingFromRemote.current = false; }, 100);
    });

    // Escuta alterações em produções
    const unsubProductions = syncService.subscribeProductions((remoteProductions) => {
      isSyncingFromRemote.current = true;
      setProductions(remoteProductions);
      storageService.saveProductions(remoteProductions);
      setTimeout(() => { isSyncingFromRemote.current = false; }, 100);
    });

    // Escuta alterações em vendas
    const unsubSales = syncService.subscribeSales((remoteSales) => {
      isSyncingFromRemote.current = true;
      setSales(remoteSales);
      storageService.saveSales(remoteSales);
      setTimeout(() => { isSyncingFromRemote.current = false; }, 100);
    });

    return () => {
      unsubIngredients();
      unsubBrownies();
      unsubPurchases();
      unsubProductions();
      unsubSales();
    };
  }, []);

  // Salvar no LocalStorage como cache offline
  useEffect(() => {
    storageService.saveIngredients(ingredients);
  }, [ingredients]);

  useEffect(() => {
    storageService.saveBrownies(brownies);
  }, [brownies]);

  useEffect(() => {
    storageService.savePurchases(purchases);
  }, [purchases]);

  useEffect(() => {
    storageService.saveProductions(productions);
  }, [productions]);

  useEffect(() => {
    storageService.saveSales(sales);
  }, [sales]);

  // Mapa indexado de ingredientes
  const ingredientsMap = new Map<string, Ingredient>(
    ingredients.map(ing => [ing.id, ing])
  );

  // Calcula custo de produção de um brownie
  const getBrownieUnitCost = (recipe: BrownieRecipe): number => {
    return calculateBrownieUnitCost(recipe, ingredientsMap);
  };

  /**
   * 1. COMPRA:
   * (+) Aumenta o estoque do insumo
   * (=) Atualiza o custo por unidade base do insumo
   * (-) Despesa entra no fechamento financeiro
   */
  const addPurchase = (data: Omit<Purchase, 'id' | 'calculatedCostPerBaseUnit'>) => {
    const ingredient = ingredients.find(i => i.id === data.ingredientId);
    if (!ingredient) return;

    const calculatedCostPerBase = calculateCostPerBaseUnit(
      data.totalCost,
      data.quantityPurchased,
      data.unit,
      ingredient.baseUnit
    );

    const baseQuantityAdded = convertToBaseUnit(
      data.quantityPurchased,
      data.unit,
      ingredient.baseUnit
    );

    const newPurchase: Purchase = {
      ...data,
      id: 'purch-' + Date.now(),
      calculatedCostPerBaseUnit: calculatedCostPerBase,
    };

    // Atualiza ingrediente com novo estoque e preço recalculado
    let updatedTargetIng: Ingredient | null = null;
    const updatedIngredients = ingredients.map(ing => {
      if (ing.id === ingredient.id) {
        const currentTotalCost = ing.currentStock * ing.costPerBaseUnit;
        const newTotalCost = currentTotalCost + data.totalCost;
        const newTotalStock = ing.currentStock + baseQuantityAdded;
        const newAvgCost = newTotalStock > 0 ? (newTotalCost / newTotalStock) : calculatedCostPerBase;

        const updated = {
          ...ing,
          currentStock: newTotalStock,
          costPerBaseUnit: Number(newAvgCost.toFixed(4)),
        };
        updatedTargetIng = updated;
        return updated;
      }
      return ing;
    });

    setPurchases([newPurchase, ...purchases]);
    setIngredients(updatedIngredients);

    // Salva na nuvem Firestore
    syncService.savePurchase(newPurchase);
    if (updatedTargetIng) {
      syncService.saveIngredient(updatedTargetIng);
    }
  };

  /**
   * 2. PRODUÇÃO:
   * Valida se há insumos suficientes.
   * (-) Deduz insumos consumidos do estoque de ingredientes.
   * (+) Adiciona as unidades de brownies produzidas ao estoque de prontos.
   */
  const addProduction = (recipeId: string, batchesCount: number): { success: boolean; message?: string } => {
    const recipe = brownies.find(b => b.id === recipeId);
    if (!recipe) return { success: false, message: 'Receita não encontrada.' };
    if (batchesCount <= 0) return { success: false, message: 'Quantidade de fornadas inválida.' };

    // 1. Validar disponibilidade de estoque para TODOS os insumos antes de deduzir
    for (const item of recipe.items) {
      const ing = ingredientsMap.get(item.ingredientId);
      const totalNeeded = item.quantity * batchesCount;
      if (!ing || ing.currentStock < totalNeeded) {
        return {
          success: false,
          message: `Estoque insuficiente de "${ing ? ing.name : 'Ingrediente'}". Necessário: ${totalNeeded} ${ing?.baseUnit || ''}, Disponível: ${ing?.currentStock || 0} ${ing?.baseUnit || ''}.`
        };
      }
    }

    // 2. Calcular custo unitário no momento exato
    const unitCost = getBrownieUnitCost(recipe);
    const unitsProduced = recipe.yieldUnits * batchesCount;
    const totalBatchCost = unitCost * unitsProduced;

    // 3. Deduzir insumos
    const changedIngredients: Ingredient[] = [];
    const updatedIngredients = ingredients.map(ing => {
      const recipeItem = recipe.items.find(item => item.ingredientId === ing.id);
      if (recipeItem) {
        const consumed = recipeItem.quantity * batchesCount;
        const updated = {
          ...ing,
          currentStock: Math.max(0, ing.currentStock - consumed)
        };
        changedIngredients.push(updated);
        return updated;
      }
      return ing;
    });

    // 4. Aumentar estoque de brownies prontos
    let changedBrownie: BrownieRecipe | null = null;
    const updatedBrownies = brownies.map(b => {
      if (b.id === recipe.id) {
        const updated = {
          ...b,
          currentStock: b.currentStock + unitsProduced
        };
        changedBrownie = updated;
        return updated;
      }
      return b;
    });

    const newProduction: ProductionBatch = {
      id: 'prod-' + Date.now(),
      date: new Date().toISOString(),
      brownieRecipeId: recipe.id,
      batchesCount,
      unitsProduced,
      unitProductionCost: Number(unitCost.toFixed(2)),
      totalCost: Number(totalBatchCost.toFixed(2))
    };

    setIngredients(updatedIngredients);
    setBrownies(updatedBrownies);
    setProductions([newProduction, ...productions]);

    // Salva na nuvem Firestore
    syncService.saveProduction(newProduction);
    changedIngredients.forEach(ing => syncService.saveIngredient(ing));
    if (changedBrownie) {
      syncService.saveBrownie(changedBrownie);
    }

    return { success: true };
  };

  /**
   * 3. VENDA:
   * Valida se há brownies prontos no estoque.
   * (-) Deduz brownies vendidos do estoque de prontos.
   * (+) Alimenta faturamento ou fiado a receber.
   */
  const addSale = (data: Omit<Sale, 'id'>): { success: boolean; message?: string } => {
    const brownie = brownies.find(b => b.id === data.brownieRecipeId);
    if (!brownie) return { success: false, message: 'Brownie não encontrado.' };

    if (data.quantity <= 0) return { success: false, message: 'Quantidade deve ser maior que zero.' };

    if (brownie.currentStock < data.quantity) {
      return { 
        success: false, 
        message: `Estoque insuficiente de ${brownie.name}. Disponível para entrega: ${brownie.currentStock} un.` 
      };
    }

    if (data.paymentMethod === 'fiado' && (!data.customerName || data.customerName.trim() === '')) {
      return { success: false, message: 'O nome do cliente é obrigatório para compras no Fiado.' };
    }

    const newSale: Sale = {
      ...data,
      id: 'sale-' + Date.now(),
      status: data.paymentMethod === 'fiado' ? 'pendente' : 'pago',
    };

    // Deduz do estoque de prontos
    let changedBrownie: BrownieRecipe | null = null;
    const updatedBrownies = brownies.map(b => {
      if (b.id === brownie.id) {
        const updated = {
          ...b,
          currentStock: b.currentStock - data.quantity
        };
        changedBrownie = updated;
        return updated;
      }
      return b;
    });

    setBrownies(updatedBrownies);
    setSales([newSale, ...sales]);

    // Sincroniza na nuvem
    syncService.saveSale(newSale);
    if (changedBrownie) {
      syncService.saveBrownie(changedBrownie);
    }

    return { success: true };
  };

  /**
   * 4. BAIXA DE FIADO:
   * Converte a venda pendente em 'pago', somando à receita realizada.
   */
  const settlePendingSale = (saleId: string) => {
    let updatedSaleObj: Sale | null = null;
    const updatedSales = sales.map(s => {
      if (s.id === saleId && s.status === 'pendente') {
        const updated = {
          ...s,
          status: 'pago' as const,
          paidAt: new Date().toISOString(),
        };
        updatedSaleObj = updated;
        return updated;
      }
      return s;
    });
    setSales(updatedSales);

    if (updatedSaleObj) {
      syncService.saveSale(updatedSaleObj);
    }
  };

  // Cadastro e Atualização de Insumos
  const addIngredient = (data: Omit<Ingredient, 'id'>) => {
    const newIng: Ingredient = {
      ...data,
      id: 'ing-' + Date.now(),
    };
    setIngredients([...ingredients, newIng]);
    syncService.saveIngredient(newIng);
  };

  const updateIngredient = (updated: Ingredient) => {
    setIngredients(ingredients.map(i => i.id === updated.id ? updated : i));
    syncService.saveIngredient(updated);
  };

  const deleteIngredient = (id: string): { success: boolean; message?: string } => {
    const updatedBrownies = brownies.map(b => ({
      ...b,
      items: b.items.filter(it => it.ingredientId !== id)
    }));
    setBrownies(updatedBrownies);
    setIngredients(ingredients.filter(i => i.id !== id));

    // Nuvem
    syncService.deleteIngredient(id);
    updatedBrownies.forEach(b => syncService.saveBrownie(b));
    return { success: true };
  };

  // Cadastro, Atualização e Exclusão de Receitas
  const addBrownieRecipe = (data: Omit<BrownieRecipe, 'id' | 'currentStock'>) => {
    const newRecipe: BrownieRecipe = {
      ...data,
      id: 'brownie-' + Date.now(),
      currentStock: 0,
    };
    setBrownies([...brownies, newRecipe]);
    syncService.saveBrownie(newRecipe);
  };

  const updateBrownieRecipe = (updated: BrownieRecipe) => {
    setBrownies(brownies.map(b => b.id === updated.id ? updated : b));
    syncService.saveBrownie(updated);
  };

  const deleteBrownieRecipe = (id: string) => {
    setBrownies(brownies.filter(b => b.id !== id));
    syncService.deleteBrownie(id);
  };

  /**
   * Excluir Compra:
   * (-) Estorna o insumo comprado do estoque de matéria-prima
   * (-) Remove a despesa do histórico e do Dashboard
   */
  const deletePurchase = (purchaseId: string) => {
    const purchase = purchases.find(p => p.id === purchaseId);
    if (!purchase) return;

    const ing = ingredientsMap.get(purchase.ingredientId);
    if (ing) {
      const baseQtyToDeduct = convertToBaseUnit(
        purchase.quantityPurchased,
        purchase.unit,
        ing.baseUnit
      );
      let updatedTargetIng: Ingredient | null = null;
      const updatedIngredients = ingredients.map(i => {
        if (i.id === ing.id) {
          const updated = {
            ...i,
            currentStock: Math.max(0, i.currentStock - baseQtyToDeduct)
          };
          updatedTargetIng = updated;
          return updated;
        }
        return i;
      });
      setIngredients(updatedIngredients);
      if (updatedTargetIng) {
        syncService.saveIngredient(updatedTargetIng);
      }
    }

    setPurchases(purchases.filter(p => p.id !== purchaseId));
    syncService.deletePurchase(purchaseId);
  };

  /**
   * Excluir Venda:
   * (+) Devolve os brownies prontos vendidos de volta para o estoque
   * (-) Remove o faturamento (ou cancela a pendência de fiado)
   */
  const deleteSale = (saleId: string) => {
    const sale = sales.find(s => s.id === saleId);
    if (!sale) return;

    let updatedBrownieTarget: BrownieRecipe | null = null;
    const updatedBrownies = brownies.map(b => {
      if (b.id === sale.brownieRecipeId) {
        const updated = {
          ...b,
          currentStock: b.currentStock + sale.quantity
        };
        updatedBrownieTarget = updated;
        return updated;
      }
      return b;
    });

    setBrownies(updatedBrownies);
    setSales(sales.filter(s => s.id !== saleId));

    syncService.deleteSale(saleId);
    if (updatedBrownieTarget) {
      syncService.saveBrownie(updatedBrownieTarget);
    }
  };

  // Reset total
  const resetAllData = () => {
    storageService.resetToFactoryDefaults();
    setIngredients(storageService.getIngredients());
    setBrownies(storageService.getBrownies());
    setPurchases([]);
    setProductions([]);
    setSales([]);
    syncService.seedInitialDataIfEmpty(storageService.getIngredients(), storageService.getBrownies());
  };

  // Métricas do Dashboard calculadas reativamente
  const metrics = computeDashboardMetrics(sales, purchases, ingredients, brownies);

  return (
    <AppContext.Provider
      value={{
        ingredients,
        brownies,
        purchases,
        productions,
        sales,
        metrics,
        isOnline,
        ingredientsMap,
        addPurchase,
        addProduction,
        addSale,
        settlePendingSale,
        addIngredient,
        updateIngredient,
        deleteIngredient,
        addBrownieRecipe,
        updateBrownieRecipe,
        deleteBrownieRecipe,
        deletePurchase,
        deleteSale,
        getBrownieUnitCost,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser utilizado dentro de um AppProvider');
  }
  return context;
};
