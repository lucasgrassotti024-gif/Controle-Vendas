import { Ingredient, BrownieRecipe } from '../types';

export const initialIngredients: Ingredient[] = [
  {
    id: 'ing-1',
    name: 'Chocolate Meio Amargo (Barra)',
    category: 'ingrediente',
    purchaseUnit: 'kg',
    baseUnit: 'g',
    currentStock: 3000, // 3000g (3kg)
    minStock: 1000,
    costPerBaseUnit: 0.055, // R$ 55,00/kg -> R$ 0,055/g
  },
  {
    id: 'ing-2',
    name: 'Manteiga sem Sal',
    category: 'ingrediente',
    purchaseUnit: 'kg',
    baseUnit: 'g',
    currentStock: 1500, // 1500g
    minStock: 500,
    costPerBaseUnit: 0.045, // R$ 45,00/kg -> R$ 0,045/g
  },
  {
    id: 'ing-3',
    name: 'Ovos (Cartela)',
    category: 'ingrediente',
    purchaseUnit: 'un',
    baseUnit: 'un',
    currentStock: 48, // 48 ovos
    minStock: 12,
    costPerBaseUnit: 0.85, // R$ 0,85 por ovo
  },
  {
    id: 'ing-4',
    name: 'Açúcar Cristal',
    category: 'ingrediente',
    purchaseUnit: 'kg',
    baseUnit: 'g',
    currentStock: 4000, // 4kg
    minStock: 1000,
    costPerBaseUnit: 0.005, // R$ 5,00/kg -> R$ 0,005/g
  },
  {
    id: 'ing-5',
    name: 'Farinha de Trigo',
    category: 'ingrediente',
    purchaseUnit: 'kg',
    baseUnit: 'g',
    currentStock: 3000, // 3kg
    minStock: 1000,
    costPerBaseUnit: 0.006, // R$ 6,00/kg -> R$ 0,006/g
  },
  {
    id: 'ing-6',
    name: 'Cacau em Pó 50%',
    category: 'ingrediente',
    purchaseUnit: 'kg',
    baseUnit: 'g',
    currentStock: 1000, // 1kg
    minStock: 400,
    costPerBaseUnit: 0.042, // R$ 42,00/kg -> R$ 0,042/g
  },
  {
    id: 'ing-7',
    name: 'Embalagem Plástica + Adesivo Lacrador',
    category: 'embalagem',
    purchaseUnit: 'un',
    baseUnit: 'un',
    currentStock: 150, // 150 unidades
    minStock: 30,
    costPerBaseUnit: 0.60, // R$ 0,60 por unidade
  },
  {
    id: 'ing-8',
    name: 'Nutella (Balde)',
    category: 'ingrediente',
    purchaseUnit: 'kg',
    baseUnit: 'g',
    currentStock: 1200, // 1,2kg
    minStock: 500,
    costPerBaseUnit: 0.075, // R$ 75,00/kg -> R$ 0,075/g
  }
];

export const initialBrownies: BrownieRecipe[] = [
  {
    id: 'brownie-1',
    name: 'Brownie Tradicional',
    description: 'Massa densa e molhadinha com casquinha crocante.',
    defaultSalePrice: 8.00,
    currentStock: 18,
    minStock: 10,
    yieldUnits: 16, // Rendimento de 16 fatias por fornada
    items: [
      { ingredientId: 'ing-1', quantity: 300 }, // 300g chocolate
      { ingredientId: 'ing-2', quantity: 200 }, // 200g manteiga
      { ingredientId: 'ing-3', quantity: 4 },   // 4 ovos
      { ingredientId: 'ing-4', quantity: 350 }, // 350g açúcar
      { ingredientId: 'ing-5', quantity: 150 }, // 150g farinha
      { ingredientId: 'ing-6', quantity: 60 },  // 60g cacau
      { ingredientId: 'ing-7', quantity: 16 },  // 16 embalagens (1 por fatia)
    ]
  },
  {
    id: 'brownie-2',
    name: 'Brownie com Recheio de Nutella',
    description: 'Brownie tradicional com generosa camada de Nutella pura.',
    defaultSalePrice: 12.00,
    currentStock: 12,
    minStock: 8,
    yieldUnits: 16,
    items: [
      { ingredientId: 'ing-1', quantity: 300 },
      { ingredientId: 'ing-2', quantity: 200 },
      { ingredientId: 'ing-3', quantity: 4 },
      { ingredientId: 'ing-4', quantity: 350 },
      { ingredientId: 'ing-5', quantity: 150 },
      { ingredientId: 'ing-6', quantity: 60 },
      { ingredientId: 'ing-8', quantity: 400 }, // 400g de Nutella
      { ingredientId: 'ing-7', quantity: 16 },
    ]
  }
];
