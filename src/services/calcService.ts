import { 
  PurchaseUnit, 
  BaseUnit, 
  Ingredient, 
  BrownieRecipe, 
  Sale, 
  Purchase, 
  ProductionBatch,
  DashboardMetrics 
} from '../types';

/**
 * Converte a quantidade comprada para a unidade base usada nas receitas.
 * Exemplo: 2 kg -> 2000 g | 1.5 l -> 1500 ml | 10 un -> 10 un.
 */
export function convertToBaseUnit(quantity: number, purchaseUnit: PurchaseUnit, baseUnit: BaseUnit): number {
  if (purchaseUnit === 'kg' && baseUnit === 'g') {
    return quantity * 1000;
  }
  if (purchaseUnit === 'l' && baseUnit === 'ml') {
    return quantity * 1000;
  }
  return quantity;
}

/**
 * Calcula o custo por unidade base a partir da compra.
 * Exemplo: Comprou 1kg de chocolate por R$ 50,00 -> 1000g -> R$ 0,05 por grama.
 */
export function calculateCostPerBaseUnit(
  totalCost: number, 
  quantityPurchased: number, 
  purchaseUnit: PurchaseUnit, 
  baseUnit: BaseUnit
): number {
  const baseQuantity = convertToBaseUnit(quantityPurchased, purchaseUnit, baseUnit);
  if (baseQuantity <= 0) return 0;
  return totalCost / baseQuantity;
}

/**
 * Calcula o custo de fabricação de 1 brownie específico somando seus ingredientes atuais.
 * @param includeLabor Se true (padrão), soma a mão de obra de terceiros. Se false (produção própria), soma apenas insumos.
 */
export function calculateBrownieUnitCost(
  recipe: BrownieRecipe, 
  ingredientsMap: Map<string, Ingredient>,
  includeLabor: boolean = true
): number {
  if (!recipe.items || recipe.items.length === 0) return 0;

  let totalRecipeCost = 0;

  for (const item of recipe.items) {
    const ingredient = ingredientsMap.get(item.ingredientId);
    if (ingredient) {
      totalRecipeCost += item.quantity * ingredient.costPerBaseUnit;
    }
  }

  const yieldCount = recipe.yieldUnits > 0 ? recipe.yieldUnits : 1;
  const ingredientsUnitCost = totalRecipeCost / yieldCount;
  const labor = includeLabor ? (recipe.laborCost || 0) : 0;
  return ingredientsUnitCost + labor;
}

/**
 * Formata um valor numérico para Moeda Brasileira (R$ XX,XX).
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Formata números com unidades de medida (ex: "2.500 g", "10 un").
 */
export function formatStock(quantity: number, unit: string): string {
  const formatted = new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 2,
  }).format(quantity);
  return `${formatted} ${unit}`;
}

/**
 * Consolida todas as métricas do Dashboard em tempo real.
 */
export function computeDashboardMetrics(
  sales: Sale[],
  purchases: Purchase[],
  ingredients: Ingredient[],
  brownies: BrownieRecipe[],
  productions: ProductionBatch[] = []
): DashboardMetrics {
  // Faturamento das vendas pagas
  const totalRevenue = sales
    .filter(s => s.status === 'pago')
    .reduce((acc, s) => acc + s.totalAmount, 0);

  // Fiados em aberto
  const pendingSales = sales.filter(s => s.status === 'pendente');
  const pendingReceivables = pendingSales.reduce((acc, s) => acc + s.totalAmount, 0);
  const pendingSalesCount = pendingSales.length;

  // Total gasto em compras de insumos
  const totalPurchasesCost = purchases.reduce((acc, p) => acc + p.totalCost, 0);

  // Total pago com mão de obra terceirizada
  const totalLaborSpent = productions.reduce((acc, prod) => {
    return acc + (prod.laborCostTotal || 0);
  }, 0);

  // Lucro líquido real do negócio (Faturamento - Insumos - Mão de obra paga)
  const netProfit = totalRevenue - totalPurchasesCost - totalLaborSpent;

  // Saldo de brownies prontos
  const stockFinishedUnits = brownies.reduce((acc, b) => acc + (b.currentStock || 0), 0);

  // Valor imobilizado em insumos
  const stockInsumosValue = ingredients.reduce((acc, ing) => {
    return acc + (ing.currentStock * ing.costPerBaseUnit);
  }, 0);

  // Alerta de insumos com estoque baixo
  const lowStockIngredientsCount = ingredients.filter(
    ing => ing.currentStock <= ing.minStock
  ).length;

  return {
    totalRevenue,
    totalPurchasesCost,
    totalLaborSpent,
    netProfit,
    pendingReceivables,
    pendingSalesCount,
    stockFinishedUnits,
    stockInsumosValue,
    lowStockIngredientsCount,
  };
}

