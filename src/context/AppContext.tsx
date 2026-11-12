import React, { createContext, useContext, useState, useEffect } from 'react';
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
  const [ingredients, setIngredients] = useState<Ingredient[]>(() => {
    const data = storageService.getIngredients();
    // Remove definitivamente qualquer resquício de mão de obra do estoque
    const cleaned = data.filter(i => 
      i.id !== 'ing-mao-obra' && 
      !i.name.toLowerCase().includes('mão de obra') && 
      !i.name.toLowerCase().includes('mao de obra')
    );

    if (cleaned.length === 0) {
      storageService.saveIngredients(initialIngredients);
      return initialIngredients;
    }
    return cleaned;
  });

  const [brownies, setBrownies] = useState<BrownieRecipe[]>(() => {
    const data = storageService.getBrownies();
    // Limpa mão de obra dos items das receitas antigas e garante laborCost = 1
    const cleanedBrownies = data.map(b => ({
      ...b,
      laborCost: b.laborCost ?? 1.00,
      items: b.items.filter(it => it.ingredientId !== 'ing-mao-obra')
    }));

    if (cleanedBrownies.length === 0) {
      storageService.saveBrownies(initialBrownies);
      return initialBrownies;
    }
    return cleanedBrownies;
  });
  const [purchases, setPurchases] = useState<Purchase[]>(() => storageService.getPurchases());
  const [productions, setProductions] = useState<ProductionBatch[]>(() => storageService.getProductions());
  const [sales, setSales] = useState<Sale[]>(() => storageService.getSales());

  // Salvar no LocalStorage sempre que alterar
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
    const updatedIngredients = ingredients.map(ing => {
      if (ing.id === ingredient.id) {
        // Custo médio ponderado
        const currentTotalCost = ing.currentStock * ing.costPerBaseUnit;
        const newTotalCost = currentTotalCost + data.totalCost;
        const newTotalStock = ing.currentStock + baseQuantityAdded;
        const newAvgCost = newTotalStock > 0 ? (newTotalCost / newTotalStock) : calculatedCostPerBase;

        return {
          ...ing,
          currentStock: newTotalStock,
          costPerBaseUnit: Number(newAvgCost.toFixed(4)),
        };
      }
      return ing;
    });

    setPurchases([newPurchase, ...purchases]);
    setIngredients(updatedIngredients);
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
    const updatedIngredients = ingredients.map(ing => {
      const recipeItem = recipe.items.find(item => item.ingredientId === ing.id);
      if (recipeItem) {
        const consumed = recipeItem.quantity * batchesCount;
        return {
          ...ing,
          currentStock: Math.max(0, ing.currentStock - consumed)
        };
      }
      return ing;
    });

    // 4. Aumentar estoque de brownies prontos
    const updatedBrownies = brownies.map(b => {
      if (b.id === recipe.id) {
        return {
          ...b,
          currentStock: b.currentStock + unitsProduced
        };
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
    const updatedBrownies = brownies.map(b => {
      if (b.id === brownie.id) {
        return {
          ...b,
          currentStock: b.currentStock - data.quantity
        };
      }
      return b;
    });

    setBrownies(updatedBrownies);
    setSales([newSale, ...sales]);

    return { success: true };
  };

  /**
   * 4. BAIXA DE FIADO:
   * Converte a venda pendente em 'pago', somando à receita realizada.
   */
  const settlePendingSale = (saleId: string) => {
    const updatedSales = sales.map(s => {
      if (s.id === saleId && s.status === 'pendente') {
        return {
          ...s,
          status: 'pago' as const,
          paidAt: new Date().toISOString(),
        };
      }
      return s;
    });
    setSales(updatedSales);
  };

  // Cadastro e Atualização de Insumos
  const addIngredient = (data: Omit<Ingredient, 'id'>) => {
    const newIng: Ingredient = {
      ...data,
      id: 'ing-' + Date.now(),
    };
    setIngredients([...ingredients, newIng]);
  };

  const updateIngredient = (updated: Ingredient) => {
    setIngredients(ingredients.map(i => i.id === updated.id ? updated : i));
  };

  const deleteIngredient = (id: string): { success: boolean; message?: string } => {
    // Se estiver em receitas, remove o item das receitas automaticamente para não travar
    const updatedBrownies = brownies.map(b => ({
      ...b,
      items: b.items.filter(it => it.ingredientId !== id)
    }));
    setBrownies(updatedBrownies);

    // Remove do estoque
    setIngredients(ingredients.filter(i => i.id !== id));
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
  };

  const updateBrownieRecipe = (updated: BrownieRecipe) => {
    setBrownies(brownies.map(b => b.id === updated.id ? updated : b));
  };

  const deleteBrownieRecipe = (id: string) => {
    setBrownies(brownies.filter(b => b.id !== id));
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
      const updatedIngredients = ingredients.map(i => {
        if (i.id === ing.id) {
          return {
            ...i,
            currentStock: Math.max(0, i.currentStock - baseQtyToDeduct)
          };
        }
        return i;
      });
      setIngredients(updatedIngredients);
    }

    setPurchases(purchases.filter(p => p.id !== purchaseId));
  };

  /**
   * Excluir Venda:
   * (+) Devolve os brownies prontos vendidos de volta para o estoque
   * (-) Remove o faturamento (ou cancela a pendência de fiado)
   */
  const deleteSale = (saleId: string) => {
    const sale = sales.find(s => s.id === saleId);
    if (!sale) return;

    // Devolve os brownies ao estoque
    const updatedBrownies = brownies.map(b => {
      if (b.id === sale.brownieRecipeId) {
        return {
          ...b,
          currentStock: b.currentStock + sale.quantity
        };
      }
      return b;
    });

    setBrownies(updatedBrownies);
    setSales(sales.filter(s => s.id !== saleId));
  };

  // Reset total
  const resetAllData = () => {
    storageService.resetToFactoryDefaults();
    setIngredients(storageService.getIngredients());
    setBrownies(storageService.getBrownies());
    setPurchases([]);
    setProductions([]);
    setSales([]);
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
