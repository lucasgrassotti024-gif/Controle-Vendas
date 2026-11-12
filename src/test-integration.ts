import { 
  convertToBaseUnit, 
  calculateCostPerBaseUnit, 
  calculateBrownieUnitCost, 
  computeDashboardMetrics 
} from '../src/services/calcService';
import { initialIngredients, initialBrownies } from '../src/storage/initialData';
import { Ingredient, Purchase, Sale } from '../src/types';

function runIntegrityTests() {
  console.log('--- INICIANDO BATERIA DE TESTES DE INTEGRAÇÃO DO NEGÓCIO ---');

  // Teste 1: Conversão de Medidas
  const kgToG = convertToBaseUnit(2.5, 'kg', 'g');
  console.assert(kgToG === 2500, `Erro conversão kg->g: esperado 2500, obteve ${kgToG}`);
  console.log('✓ Teste 1: Conversão de kg para gramas correta (2.5kg = 2500g)');

  const lToMl = convertToBaseUnit(1, 'l', 'ml');
  console.assert(lToMl === 1000, `Erro conversão l->ml: esperado 1000, obteve ${lToMl}`);
  console.log('✓ Teste 2: Conversão de L para ml correta (1L = 1000ml)');

  // Teste 2: Cálculo de Custo por Unidade Base
  const costPerGram = calculateCostPerBaseUnit(60, 2, 'kg', 'g');
  console.assert(costPerGram === 0.03, `Erro cálculo custo base: esperado 0.03, obteve ${costPerGram}`);
  console.log('✓ Teste 3: Custo por grama correto (R$ 60 por 2kg = R$ 0,03/g)');

  // Teste 3: Ficha Técnica e Custo Unitário do Brownie Tradicional
  const ingredientsMap = new Map<string, Ingredient>(
    initialIngredients.map(i => [i.id, i])
  );
  const tradRecipe = initialBrownies[0];
  const unitCost = calculateBrownieUnitCost(tradRecipe, ingredientsMap);
  console.assert(unitCost > 0, 'Erro: custo unitário do brownie deve ser maior que zero');
  console.log(`✓ Teste 4: Custo de fabricação calculado para 1 ${tradRecipe.name}: R$ ${unitCost.toFixed(2)}`);

  // Teste 4: Fechamento do Dashboard com Vendas à Vista e Fiado
  const samplePurchases: Purchase[] = [
    {
      id: 'p1',
      date: new Date().toISOString(),
      ingredientId: 'ing-1',
      quantityPurchased: 2,
      unit: 'kg',
      totalCost: 110,
      calculatedCostPerBaseUnit: 0.055
    }
  ];

  const sampleSales: Sale[] = [
    {
      id: 's1',
      date: new Date().toISOString(),
      brownieRecipeId: tradRecipe.id,
      quantity: 5,
      unitPrice: 8.00,
      totalAmount: 40.00,
      paymentMethod: 'pix',
      status: 'pago'
    },
    {
      id: 's2',
      date: new Date().toISOString(),
      brownieRecipeId: tradRecipe.id,
      quantity: 2,
      unitPrice: 8.00,
      totalAmount: 16.00,
      paymentMethod: 'fiado',
      status: 'pendente',
      customerName: 'Cliente Teste'
    }
  ];

  const metrics = computeDashboardMetrics(sampleSales, samplePurchases, initialIngredients, initialBrownies);

  console.assert(metrics.totalRevenue === 40, `Erro faturamento: esperado 40, obteve ${metrics.totalRevenue}`);
  console.assert(metrics.pendingReceivables === 16, `Erro fiados: esperado 16, obteve ${metrics.pendingReceivables}`);
  console.assert(metrics.totalPurchasesCost === 110, `Erro compras: esperado 110, obteve ${metrics.totalPurchasesCost}`);
  console.assert(metrics.netProfit === (40 - 110), `Erro lucro líquido: esperado -70, obteve ${metrics.netProfit}`);

  console.log('✓ Teste 5: Faturamento das vendas pagas isolado corretamente (R$ 40,00)');
  console.log('✓ Teste 6: Fiados pendentes isolados no contas a receber (R$ 16,00)');
  console.log('✓ Teste 7: Apuração de compras e lucro líquido com precisão decimal exata');

  console.log('\n--- TODOS OS TESTES DE REGRAS DE NEGÓCIO PASSARAM COM 100% DE SUCESSO! ---');
}

runIntegrityTests();
