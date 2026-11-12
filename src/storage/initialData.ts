import { Ingredient, BrownieRecipe } from '../types';

export const initialIngredients: Ingredient[] = [
  {
    id: 'ing-ovos',
    name: 'Ovos',
    category: 'ingrediente',
    purchaseUnit: 'un',
    baseUnit: 'un',
    currentStock: 0,
    minStock: 10,
    costPerBaseUnit: 9.00 / 20, // R$ 0,45 por ovo (R$ 9,00 a cartela com 20)
  },
  {
    id: 'ing-achocolatado',
    name: 'Achocolatado',
    category: 'ingrediente',
    purchaseUnit: 'kg',
    baseUnit: 'g',
    currentStock: 0,
    minStock: 500,
    costPerBaseUnit: 37.00 / 1000, // R$ 0,037 por grama (R$ 37,00 o kg)
  },
  {
    id: 'ing-oleo',
    name: 'Óleo',
    category: 'ingrediente',
    purchaseUnit: 'ml',
    baseUnit: 'ml',
    currentStock: 0,
    minStock: 300,
    costPerBaseUnit: 7.89 / 900, // R$ 0,008767 por ml (R$ 7,89 por 900ml)
  },
  {
    id: 'ing-farinha',
    name: 'Farinha de Trigo',
    category: 'ingrediente',
    purchaseUnit: 'kg',
    baseUnit: 'g',
    currentStock: 0,
    minStock: 500,
    costPerBaseUnit: 3.00 / 1000, // R$ 0,003 por grama (R$ 3,00 o kg)
  },
  {
    id: 'ing-acucar',
    name: 'Açúcar',
    category: 'ingrediente',
    purchaseUnit: 'kg',
    baseUnit: 'g',
    currentStock: 0,
    minStock: 500,
    costPerBaseUnit: 4.00 / 1000, // R$ 0,004 por grama (R$ 4,00 o kg)
  },
  {
    id: 'ing-choc-tradicional',
    name: 'Chocolate Tradicional (Preto)',
    category: 'ingrediente',
    purchaseUnit: 'kg',
    baseUnit: 'g',
    currentStock: 0,
    minStock: 500,
    costPerBaseUnit: 33.00 / 1000, // R$ 0,033 por grama (R$ 33,00 o kg)
  },
  {
    id: 'ing-choc-branco',
    name: 'Chocolate do Brownie Branco',
    category: 'ingrediente',
    purchaseUnit: 'kg',
    baseUnit: 'g',
    currentStock: 0,
    minStock: 500,
    costPerBaseUnit: 30.00 / 1000, // R$ 0,030 por grama (R$ 30,00 o kg)
  },
  {
    id: 'ing-leite-po',
    name: 'Leite em Pó',
    category: 'ingrediente',
    purchaseUnit: 'g',
    baseUnit: 'g',
    currentStock: 0,
    minStock: 200,
    costPerBaseUnit: 12.00 / 400, // R$ 0,030 por grama (R$ 12,00 por 400g)
  },
  {
    id: 'ing-choc-ganache',
    name: 'Chocolate para Ganache',
    category: 'ingrediente',
    purchaseUnit: 'kg',
    baseUnit: 'g',
    currentStock: 0,
    minStock: 500,
    costPerBaseUnit: 37.00 / 1000, // R$ 0,037 por grama (R$ 37,00 o kg)
  },
  {
    id: 'ing-creme-leite',
    name: 'Creme de Leite',
    category: 'ingrediente',
    purchaseUnit: 'g',
    baseUnit: 'g',
    currentStock: 0,
    minStock: 200,
    costPerBaseUnit: 3.00 / 200, // R$ 0,015 por grama (R$ 3,00 por 200g)
  },
  {
    id: 'ing-embalagem',
    name: 'Embalagem',
    category: 'embalagem',
    purchaseUnit: 'un',
    baseUnit: 'un',
    currentStock: 0,
    minStock: 20,
    costPerBaseUnit: 0.29, // R$ 0,29 por unidade
  },
  {
    id: 'ing-adesivo',
    name: 'Adesivo',
    category: 'embalagem',
    purchaseUnit: 'un',
    baseUnit: 'un',
    currentStock: 0,
    minStock: 20,
    costPerBaseUnit: 0.22, // R$ 0,22 por unidade
  },
  {
    id: 'ing-garfos',
    name: 'Garfos',
    category: 'embalagem',
    purchaseUnit: 'un',
    baseUnit: 'un',
    currentStock: 0,
    minStock: 20,
    costPerBaseUnit: 7.00 / 50, // R$ 0,14 por garfo (R$ 7,00 por 50 un)
  },
  {
    id: 'ing-sacos-sacole',
    name: 'Sacos de Sacolé',
    category: 'embalagem',
    purchaseUnit: 'un',
    baseUnit: 'un',
    currentStock: 0,
    minStock: 30,
    costPerBaseUnit: 7.00 / 100, // R$ 0,07 por saco (R$ 7,00 por 100 un)
  },
  {
    id: 'ing-mao-obra',
    name: 'Mão de Obra',
    category: 'outro',
    purchaseUnit: 'un',
    baseUnit: 'un',
    currentStock: 999999, // Custo de serviço fixo não esgota
    minStock: 0,
    costPerBaseUnit: 1.00, // R$ 1,00 por brownie
  }
];

export const initialBrownies: BrownieRecipe[] = [
  {
    id: 'brownie-tradicional',
    name: 'Brownie Tradicional (Preto)',
    description: 'Massa com chocolate tradicional preto, casquinha crocante e embalagem com adesivo.',
    defaultSalePrice: 7.00,
    currentStock: 0,
    minStock: 8,
    yieldUnits: 8, // Fornada rende 8 unidades
    items: [
      { ingredientId: 'ing-choc-tradicional', quantity: 150 }, // 18.75g * 8
      { ingredientId: 'ing-achocolatado', quantity: 100 },     // 12.5g * 8
      { ingredientId: 'ing-ovos', quantity: 5 },               // 0.625 un * 8
      { ingredientId: 'ing-oleo', quantity: 200 },             // 25ml * 8
      { ingredientId: 'ing-farinha', quantity: 140 },          // 17.5g * 8
      { ingredientId: 'ing-acucar', quantity: 350 },           // 43.75g * 8
      { ingredientId: 'ing-embalagem', quantity: 8 },          // 1 un por brownie
      { ingredientId: 'ing-adesivo', quantity: 8 },            // 1 un por brownie
      { ingredientId: 'ing-mao-obra', quantity: 8 },           // R$ 1,00 por brownie
    ]
  },
  {
    id: 'brownie-branco',
    name: 'Brownie Branco',
    description: 'Massa suave com chocolate branco nobre, óleo equilibrado e toque de leite em pó.',
    defaultSalePrice: 8.00,
    currentStock: 0,
    minStock: 8,
    yieldUnits: 8,
    items: [
      { ingredientId: 'ing-choc-branco', quantity: 150 },      // 18.75g * 8
      { ingredientId: 'ing-achocolatado', quantity: 100 },     // 12.5g * 8
      { ingredientId: 'ing-ovos', quantity: 5 },               // 0.625 un * 8
      { ingredientId: 'ing-oleo', quantity: 150 },             // 18.75ml * 8
      { ingredientId: 'ing-farinha', quantity: 140 },          // 17.5g * 8
      { ingredientId: 'ing-acucar', quantity: 350 },           // 43.75g * 8
      { ingredientId: 'ing-leite-po', quantity: 80 },          // 10g por fatia (ajustável)
      { ingredientId: 'ing-embalagem', quantity: 8 },
      { ingredientId: 'ing-adesivo', quantity: 8 },
      { ingredientId: 'ing-mao-obra', quantity: 8 },
    ]
  },
  {
    id: 'brownie-ganache',
    name: 'Brownie de Ganache',
    description: 'Brownie tradicional com cobertura cremosa de ganache de chocolate, embalagem completa, garfo e saco plástico.',
    defaultSalePrice: 10.00,
    currentStock: 0,
    minStock: 8,
    yieldUnits: 8,
    items: [
      // Massa base
      { ingredientId: 'ing-choc-tradicional', quantity: 150 },
      { ingredientId: 'ing-achocolatado', quantity: 100 },
      { ingredientId: 'ing-ovos', quantity: 5 },
      { ingredientId: 'ing-oleo', quantity: 200 },
      { ingredientId: 'ing-farinha', quantity: 140 },
      { ingredientId: 'ing-acucar', quantity: 350 },
      // Cobertura Ganache
      { ingredientId: 'ing-choc-ganache', quantity: 150 },    // 18.75g * 8
      { ingredientId: 'ing-creme-leite', quantity: 70 },      // 8.75g * 8
      // Embalagem e talheres
      { ingredientId: 'ing-embalagem', quantity: 8 },
      { ingredientId: 'ing-adesivo', quantity: 8 },
      { ingredientId: 'ing-garfos', quantity: 8 },
      { ingredientId: 'ing-sacos-sacole', quantity: 8 },
      { ingredientId: 'ing-mao-obra', quantity: 8 },
    ]
  }
];
