// Tipos de Unidades de Medida
export type PurchaseUnit = 'kg' | 'g' | 'l' | 'ml' | 'un';
export type BaseUnit = 'g' | 'ml' | 'un';

// Categoria do Insumo
export type IngredientCategory = 'ingrediente' | 'embalagem' | 'outro';

// 1. Insumo (Matéria-prima ou Embalagem)
export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  purchaseUnit: PurchaseUnit;      // como você compra (ex: kg, l, un)
  baseUnit: BaseUnit;              // como você usa na receita (ex: g, ml, un)
  currentStock: number;            // quantidade atual em baseUnit (ex: 2500g)
  minStock: number;                // alerta de estoque mínimo
  costPerBaseUnit: number;         // custo por g/ml/unidade (ex: 0.05 R$/g)
}

// Item de um Brownie (ingrediente e quantidade usada na receita)
export interface RecipeItem {
  ingredientId: string;
  quantity: number;                // quantidade na baseUnit do insumo (ex: 200g)
}

// 2. Brownie / Receita
export interface BrownieRecipe {
  id: string;
  name: string;                    // ex: "Brownie Tradicional", "Brownie Nutella"
  description: string;
  defaultSalePrice: number;        // preço de venda sugerido (ex: R$ 8,00)
  currentStock: number;            // quantos brownies prontos tem no estoque para venda
  minStock: number;                // alerta de estoque baixo de prontos
  yieldUnits: number;              // rendimento da receita em unidades (ex: 16 brownies por fornada)
  laborCost?: number;              // custo de mão de obra direta por unidade (ex: R$ 1,00)
  imageUrl?: string;               // foto oficial do brownie
  items: RecipeItem[];             // ingredientes que compõem 1 receita inteira
}

// 3. Compra de Insumo
export interface Purchase {
  id: string;
  date: string;                    // ISO date
  ingredientId: string;
  quantityPurchased: number;       // na purchaseUnit (ex: 2 kg)
  unit: PurchaseUnit;
  totalCost: number;               // valor total pago em R$ (ex: R$ 60,00)
  calculatedCostPerBaseUnit: number; // ex: R$ 0,03 por grama
}

// 4. Ordem de Produção (Fornada / Fabricação)
export interface ProductionBatch {
  id: string;
  date: string;                    // ISO date
  brownieRecipeId: string;
  batchesCount: number;            // quantas receitas/fornadas foram feitas (ex: 1, 2)
  unitsProduced: number;           // total de unidades prontas geradas (ex: 16)
  unitProductionCost: number;      // custo calculado de fazer cada brownie naquele momento
  totalCost: number;               // custo total da produção
}

// Formas de Pagamento
export type PaymentMethod = 'dinheiro' | 'pix' | 'cartao' | 'fiado';
export type SaleStatus = 'pago' | 'pendente';

// 5. Venda
export interface Sale {
  id: string;
  date: string;                    // ISO date
  brownieRecipeId: string;
  quantity: number;                // quantidade vendida
  unitPrice: number;               // preço cobrado por unidade
  totalAmount: number;             // quantidade * unitPrice
  paymentMethod: PaymentMethod;
  status: SaleStatus;              // 'pago' ou 'pendente' (fiado)
  customerName?: string;           // nome se for fiado
  paidAt?: string;                 // data em que o fiado foi pago
}

// Resumo Geral Financeiro / Operacional para o Dashboard
export interface DashboardMetrics {
  totalRevenue: number;            // Faturamento realizado (vendas pagas)
  totalPurchasesCost: number;      // Total gasto em compras de insumos
  netProfit: number;               // totalRevenue - totalPurchasesCost
  pendingReceivables: number;      // Total de fiados não recebidos
  pendingSalesCount: number;       // Quantas vendas fiado em aberto
  stockFinishedUnits: number;      // Total de brownies prontos para venda
  stockInsumosValue: number;       // Valor em R$ imobilizado em insumos
  lowStockIngredientsCount: number;// Quantos insumos estão abaixo do estoque mínimo
}
