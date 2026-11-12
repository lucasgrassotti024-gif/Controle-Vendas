# AGENTS.md — REGRAS E DIRETRIZES PERMANENTES DO PROJETO

## 1. VISÃO GERAL DO PROJETO
Sistema integrado de Gestão Operacional e Financeira para Produção e Venda de Brownies (Controle de Custos).
O objetivo é fornecer controle preciso de insumos, ficha técnica por produto, controle de produção, compras, estoque em tempo real, vendas (à vista e fiado) e apuração financeira em dashboard.

## 2. STACK TECNOLÓGICA
- **Linguagem & Tipagem:** TypeScript (Strict Mode).
- **Frontend / Framework:** React 18+ com Vite.
- **Estilização:** Vanilla CSS moderno estruturado com Design Tokens (paleta premium, dark/light mode suave, tipografia legível, micro-interações).
- **Gerenciamento de Estado:** React Context + Hooks modulares ou Zustand.
- **Persistência Inicial:** Storage Local estruturado (LocalStorage / IndexedDB com camada de repositório desacoplada para suportar migração para nuvem/PostgreSQL sem refatoração de UI).
- **Controle de Versão:** Git com commits atômicos e semânticos.

## 3. ARQUITETURA E CONEXÕES DO NEGÓCIO

Todas as 5 áreas centrais do sistema comunicam-se de forma estrita e automática:

1. **Compras:**
   - Registra aquisição de insumos (ingredientes e embalagens).
   - (+) Aumenta o estoque de matéria-prima.
   - Atualiza o custo unitário do ingrediente (recalculando custo por grama, ml ou un).
   - (-) Contabiliza saída de caixa no Dashboard financeiro.

2. **Estoque (Matéria-prima & Produtos Acabados):**
   - Matéria-prima: quantidade em unidade fracionada (gramas, ml, un) e preço de custo por unidade de medida.
   - Produtos Acabados: quantidade em estoque de cada sabor/tipo de brownie pronto para entrega.

3. **Produção (Ficha Técnica & Fabricação):**
   - Cada tipo de brownie possui sua receita (insumos consumidos e proporções).
   - Calcula custo unitário do brownie em tempo real com base no custo atual dos insumos.
   - Ao registrar produção de X unidades:
     - (-) Deduz do estoque as quantidades exatas de cada ingrediente.
     - (+) Adiciona X unidades ao estoque de brownies prontos.

4. **Vendas:**
   - Registro de vendas por tipo de brownie, quantidade e valor.
   - Formas de pagamento: Dinheiro, Pix, Cartão ou Fiado.
   - Se Fiado: exige nome do devedor e status "Pendente", mantendo saldo devedor.
   - Baixa de fiado: funcionalidade explícita para registrar o recebimento posterior.
   - Ao registrar venda:
     - (-) Deduz do estoque de brownies prontos.
     - (+) Adiciona receita realizada (ou saldo a receber se fiado).

5. **Dashboard:**
   - Total faturado (Vendas realizadas).
   - Total em compras / custos operacionais.
   - Lucro líquido real do período.
   - Total de fiado a receber e lista de devedores.
   - Valor monetário imobilizado em estoque (insumos + produtos prontos).
   - Alertas visuais de estoque baixo.

## 4. CONVERSÃO DE MEDIDAS OBRIGATÓRIA
- Compras em Quilos (kg) -> Armazenamento e consumo em Gramas (g) [1 kg = 1000 g].
- Compras em Litros (L) -> Armazenamento e consumo em Mililitros (ml) [1 L = 1000 ml].
- Compras em Unidades / Caixas / Fardos -> Armazenamento e consumo em Unidades fracionadas.
- Todas as operações com valores monetários devem evitar problemas de ponto flutuante (utilizar arredondamento para 2 casas decimais consistente).

## 5. PADRÕES DE CÓDIGO E ORGANIZAÇÃO
- Estrutura modular em `src/`:
  - `src/components/`: Componentes reutilizáveis de UI.
  - `src/pages/`: As 5 páginas centrais (Vendas, Producao, Compras, Estoque, Dashboard).
  - `src/services/` ou `src/domain/`: Regras de cálculo, conversão de unidades e manipulação de estoque.
  - `src/storage/`: Camada de persistência.
  - `src/types/`: Interfaces e tipos de dados do TypeScript.
  - `src/styles/`: Variáveis CSS globais, reset e temas.

## 6. METODOLOGIA DE TRABALHO
- Toda alteração significativa deve seguir: **PLANEJAR → APROVAR → IMPLEMENTAR → TESTAR → VALIDAR → DOCUMENTAR**.
- Nenhuma alteração destrutiva ou funcionalidade fora de escopo pode ser executada sem autorização prévia.
