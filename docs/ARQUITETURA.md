# Arquitetura e Modelagem de Dados

Este documento descreve as entidades e as regras matemáticas do sistema.

## 1. Entidades Principais

### Insumo (`Ingredient`)
Matéria-prima ou embalagem utilizada na confecção dos brownies.
- `id`: string (UUID)
- `name`: string (ex: "Chocolate Meio Amargo", "Embalagem Padrão")
- `category`: "ingrediente" | "embalagem" | "outro"
- `purchaseUnit`: "kg" | "g" | "l" | "ml" | "un" (unidade como é comprado)
- `baseUnit`: "g" | "ml" | "un" (unidade padrão de consumo)
- `currentStock`: number (em `baseUnit`)
- `minStock`: number (alerta de estoque baixo)
- `costPerBaseUnit`: number (custo por grama, ml ou unidade)

### Compra (`Purchase`)
Registro de aquisição de insumos que alimenta o estoque e as saídas financeiras.
- `id`: string (UUID)
- `date`: string (ISO)
- `ingredientId`: string (FK)
- `quantity`: number (na unidade comprada)
- `unit`: string
- `totalCost`: number (valor pago em R$)
- `unitCostCalculated`: number (custo convertido por `baseUnit`)

### Tipo de Brownie / Receita (`BrownieRecipe`)
Definição do produto final e sua composição técnica.
- `id`: string (UUID)
- `name`: string (ex: "Brownie Tradicional", "Brownie de Nutella")
- `description`: string
- `defaultSalePrice`: number (preço de venda sugerido)
- `currentStock`: number (quantos prontos existem para pronta-entrega)
- `minStock`: number (alerta de produção)
- `items`: Lista de itens consumidos por unidade ou fornada:
  - `ingredientId`: string (FK)
  - `quantity`: number (em `baseUnit` do insumo)

### Ordem de Produção (`ProductionBatch`)
Registro do ato de cozinhar/produzir.
- `id`: string (UUID)
- `date`: string (ISO)
- `brownieRecipeId`: string (FK)
- `quantityProduced`: number (número de brownies prontos)
- `calculatedUnitCost`: number (custo unitário no momento da produção)
- `totalCost`: number

### Venda (`Sale`)
Registro de saída para clientes.
- `id`: string (UUID)
- `date`: string (ISO)
- `brownieRecipeId`: string (FK)
- `quantity`: number
- `unitPrice`: number
- `totalAmount`: number
- `paymentMethod`: "dinheiro" | "pix" | "cartao" | "fiado"
- `status`: "pago" | "pendente" (para fiado)
- `customerName`?: string (obrigatório se fiado)
- `paidAt`?: string (quando o fiado for liquidado)

---

## 2. Fórmulas e Regras de Negócio

### Conversão de Unidades
- Se comprado em `kg`: `quantidade_base = quantidade_kg * 1000` (em gramas).
- Se comprado em `l`: `quantidade_base = quantidade_l * 1000` (em mililitros).
- `custo_por_unidade_base = valor_total_compra / quantidade_base`.

### Custo Unitário do Brownie
$$\text{Custo Brownie} = \sum (\text{Quantidade do Insumo na Receita} \times \text{Custo Base do Insumo})$$

### Fechamento do Dashboard
- **Faturamento Realizado:** Soma de todas as vendas com `status = 'pago'`.
- **Contas a Receber (Fiados Pendentes):** Soma de todas as vendas com `status = 'pendente'`.
- **Despesas em Compras:** Soma de todos os `totalCost` de `Purchase`.
- **Lucro Líquido:** $\text{Faturamento Realizado} - \text{Despesas em Compras}$.
