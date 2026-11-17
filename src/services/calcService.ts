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
  // Mapa de ingredientes para calcular custos dos brownies
  const ingredientsMap = new Map<string, Ingredient>(
    ingredients.map(ing => [ing.id, ing])
  );
  const browniesMap = new Map<string, BrownieRecipe>(
    brownies.map(b => [b.id, b])
  );

  // Faturamento das vendas pagas
  const paidSales = sales.filter(s => s.status === 'pago');
  const totalRevenue = paidSales.reduce((acc, s) => acc + s.totalAmount, 0);

  // Custo Real dos Produtos Vendidos (CPV): Insumos + Mão de obra da receita para cada unidade vendida
  const totalCostOfGoodsSold = paidSales.reduce((acc, s) => {
    const brownie = browniesMap.get(s.brownieRecipeId);
    if (!brownie) return acc;
    // Custo de fabricação de 1 brownie (ingredientes + mão de obra se houver)
    const unitCost = calculateBrownieUnitCost(brownie, ingredientsMap, true);
    return acc + (s.quantity * unitCost);
  }, 0);

  // Lucro Líquido Real das Vendas: Faturamento realizado menos o Custo real dos produtos vendidos
  const netProfit = totalRevenue - totalCostOfGoodsSold;

  // Fiados em aberto
  const pendingSales = sales.filter(s => s.status === 'pendente');
  const pendingReceivables = pendingSales.reduce((acc, s) => acc + s.totalAmount, 0);
  const pendingSalesCount = pendingSales.length;

  // Total gasto em compras de insumos
  const totalPurchasesCost = purchases.reduce((acc, p) => acc + p.totalCost, 0);

  // Total pago com mão de obra terceirizada de fornadas
  const totalLaborSpent = productions.reduce((acc, prod) => {
    return acc + (prod.laborCostTotal || 0);
  }, 0);

  // Saldo de Caixa Operacional (Entradas em dinheiro - Compras de insumos - Mão de obra paga)
  const cashFlowBalance = totalRevenue - totalPurchasesCost - totalLaborSpent;

  // Saldo de brownies prontos
  const stockFinishedUnits = brownies.reduce((acc, b) => acc + (b.currentStock || 0), 0);

  // Valor imobilizado em insumos da despensa (estoque * custo base)
  const stockInsumosValue = ingredients.reduce((acc, ing) => {
    return acc + (Math.max(0, ing.currentStock) * ing.costPerBaseUnit);
  }, 0);

  // Valor em dinheiro gasto nos brownies prontos no estoque
  const stockFinishedValue = brownies.reduce((acc, b) => {
    if (b.currentStock <= 0) return acc;
    const unitCost = calculateBrownieUnitCost(b, ingredientsMap, true);
    return acc + (b.currentStock * unitCost);
  }, 0);

  // Total geral de dinheiro gasto imobilizado no estoque (Insumos + Brownies prontos)
  const totalStockInvested = stockInsumosValue + stockFinishedValue;

  // Alerta de insumos com estoque baixo
  const lowStockIngredientsCount = ingredients.filter(
    ing => ing.currentStock <= ing.minStock
  ).length;

  return {
    totalRevenue,
    totalCostOfGoodsSold,
    netProfit,
    totalPurchasesCost,
    totalLaborSpent,
    cashFlowBalance,
    pendingReceivables,
    pendingSalesCount,
    stockFinishedUnits,
    stockInsumosValue,
    stockFinishedValue,
    totalStockInvested,
    lowStockIngredientsCount,
  };
}

export interface DailyProfitPoint {
  dateKey: string;      // YYYY-MM-DD
  dayLabel: string;     // ex: "13/11" ou "Qui"
  weekday: string;      // ex: "Qui"
  revenue: number;      // faturamento realizado
  cogs: number;         // custo dos brownies vendidos
  purchases: number;    // compras de insumos no dia
  labor: number;        // mão de obra paga no dia
  netProfit: number;    // lucro líquido real das vendas do dia
}

/**
 * Agrupa o histórico dos últimos N dias (padrão 7 dias) apurando faturamento, custo dos brownies vendidos e lucro por dia.
 */
export function getDailyProfitHistory(
  sales: Sale[],
  purchases: Purchase[],
  productions: ProductionBatch[],
  ingredients: Ingredient[] = [],
  brownies: BrownieRecipe[] = [],
  daysCount: number = 7
): DailyProfitPoint[] {
  const result: DailyProfitPoint[] = [];
  const now = new Date();

  const ingredientsMap = new Map<string, Ingredient>(
    ingredients.map(ing => [ing.id, ing])
  );
  const browniesMap = new Map<string, BrownieRecipe>(
    brownies.map(b => [b.id, b])
  );

  // Gera os últimos N dias em ordem cronológica
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);

    const nextD = new Date(d);
    nextD.setDate(nextD.getDate() + 1);

    const dateKey = d.toISOString().split('T')[0];
    const dayLabel = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
    const weekday = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');

    // Vendas pagas do dia
    const dayPaidSales = sales.filter(s => {
      if (s.status !== 'pago') return false;
      const sDate = new Date(s.paidAt || s.date);
      return sDate >= d && sDate < nextD;
    });

    const dayRevenue = dayPaidSales.reduce((acc, s) => acc + s.totalAmount, 0);

    // Custo real dos produtos vendidos no dia
    const dayCogs = dayPaidSales.reduce((acc, s) => {
      const brownie = browniesMap.get(s.brownieRecipeId);
      if (!brownie) return acc;
      const unitCost = calculateBrownieUnitCost(brownie, ingredientsMap, true);
      return acc + (s.quantity * unitCost);
    }, 0);

    // Compras realizadas no dia
    const dayPurchases = purchases
      .filter(p => {
        const pDate = new Date(p.date);
        return pDate >= d && pDate < nextD;
      })
      .reduce((acc, p) => acc + p.totalCost, 0);

    // Mão de obra paga de fornadas no dia
    const dayLabor = productions
      .filter(prod => {
        const prodDate = new Date(prod.date);
        return prodDate >= d && prodDate < nextD;
      })
      .reduce((acc, prod) => acc + (prod.laborCostTotal || 0), 0);

    // Lucro líquido diário baseado na margem real dos brownies vendidos
    // Se não tiver produtos cadastrados ainda, usa o fluxo de caixa clássico
    const netProfit = dayCogs > 0 || brownies.length > 0
      ? dayRevenue - dayCogs
      : dayRevenue - dayPurchases - dayLabor;

    result.push({
      dateKey,
      dayLabel,
      weekday,
      revenue: dayRevenue,
      cogs: dayCogs,
      purchases: dayPurchases,
      labor: dayLabor,
      netProfit,
    });
  }

  return result;
}

/**
 * Calcula o lucro líquido acumulado da semana atual (segunda até hoje).
 */
export function getWeeklyProfit(
  sales: Sale[],
  purchases: Purchase[],
  productions: ProductionBatch[],
  ingredients: Ingredient[] = [],
  brownies: BrownieRecipe[] = []
): { netProfit: number; revenue: number; cogs: number; purchases: number; labor: number } {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 domingo, 1 segunda ...
  const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - diffToMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  const ingredientsMap = new Map<string, Ingredient>(
    ingredients.map(ing => [ing.id, ing])
  );
  const browniesMap = new Map<string, BrownieRecipe>(
    brownies.map(b => [b.id, b])
  );

  const weeklySales = sales.filter(s => s.status === 'pago' && new Date(s.paidAt || s.date) >= startOfWeek);
  const revenue = weeklySales.reduce((acc, s) => acc + s.totalAmount, 0);

  const cogs = weeklySales.reduce((acc, s) => {
    const brownie = browniesMap.get(s.brownieRecipeId);
    if (!brownie) return acc;
    const unitCost = calculateBrownieUnitCost(brownie, ingredientsMap, true);
    return acc + (s.quantity * unitCost);
  }, 0);

  const purchasesCost = purchases
    .filter(p => new Date(p.date) >= startOfWeek)
    .reduce((acc, p) => acc + p.totalCost, 0);

  const laborCost = productions
    .filter(prod => new Date(prod.date) >= startOfWeek)
    .reduce((acc, prod) => acc + (prod.laborCostTotal || 0), 0);

  const netProfit = cogs > 0 || brownies.length > 0
    ? revenue - cogs
    : revenue - purchasesCost - laborCost;

  return {
    netProfit,
    revenue,
    cogs,
    purchases: purchasesCost,
    labor: laborCost,
  };
}

/**
 * Calcula o lucro líquido acumulado do mês atual (dia 1 até hoje).
 */
export function getMonthlyProfit(
  sales: Sale[],
  purchases: Purchase[],
  productions: ProductionBatch[],
  ingredients: Ingredient[] = [],
  brownies: BrownieRecipe[] = []
): { netProfit: number; revenue: number; cogs: number; purchases: number; labor: number } {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

  const ingredientsMap = new Map<string, Ingredient>(
    ingredients.map(ing => [ing.id, ing])
  );
  const browniesMap = new Map<string, BrownieRecipe>(
    brownies.map(b => [b.id, b])
  );

  const monthlySales = sales.filter(s => s.status === 'pago' && new Date(s.paidAt || s.date) >= startOfMonth);
  const revenue = monthlySales.reduce((acc, s) => acc + s.totalAmount, 0);

  const cogs = monthlySales.reduce((acc, s) => {
    const brownie = browniesMap.get(s.brownieRecipeId);
    if (!brownie) return acc;
    const unitCost = calculateBrownieUnitCost(brownie, ingredientsMap, true);
    return acc + (s.quantity * unitCost);
  }, 0);

  const purchasesCost = purchases
    .filter(p => new Date(p.date) >= startOfMonth)
    .reduce((acc, p) => acc + p.totalCost, 0);

  const laborCost = productions
    .filter(prod => new Date(prod.date) >= startOfMonth)
    .reduce((acc, prod) => acc + (prod.laborCostTotal || 0), 0);

  const netProfit = cogs > 0 || brownies.length > 0
    ? revenue - cogs
    : revenue - purchasesCost - laborCost;

  return {
    netProfit,
    revenue,
    cogs,
    purchases: purchasesCost,
    labor: laborCost,
  };
}


