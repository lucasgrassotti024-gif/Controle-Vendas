# Planejamento Geral de Fases do Projeto

Este documento orienta o desenvolvimento modular do sistema de Controle de Custos de Brownies.
Cada fase só deve ser iniciada após aprovação formal do usuário.

---

## FASE 0 — Fundação Documental e Inicialização
- [x] Inicialização do repositório Git local e `.gitignore`.
- [x] Criação do `AGENTS.md` com diretrizes permanentes.
- [x] Criação do `README.md`.
- [x] Estruturação da documentação em `docs/` (`PLANO.md`, `ARQUITETURA.md`, `PROGRESSO.md`, `DECISOES.md`, `PENDENCIAS.md`).
- [x] Validação e primeiro commit Git.

---

## FASE 1 — Setup Técnico e Estrutura Base
- [x] Criação do projeto base com Vite + React + TypeScript.
- [x] Configuração de CSS global, Design Tokens (cores, fontes, espaçamentos, tema dark aveludado).
- [x] Estrutura de navegação SPA com abas/páginas:
  - Vendas
  - Produção
  - Compras
  - Estoque
  - Dashboard
- [x] Layout mestre responsivo com Header/Sidebar e feedback visual ativo.

---

## FASE 2 — Camada de Domínio, Tipagens e Camada de Armazenamento
- [x] Definição de todos os tipos e interfaces TypeScript (`Ingredient`, `BrownieRecipe`, `Purchase`, `ProductionBatch`, `Sale`).
- [x] Utilitário de conversão de unidades (kg <-> g, L <-> ml, un).
- [x] Camada de repositório e persistência com LocalStorage resiliente e reset de fábrica.
- [x] Mock de dados iniciais para testes de usabilidade imediatos.

---

## FASE 3 — Módulo de Estoque e Compras (Primeiro Elo do Negócio)
- [x] **Estoque de Insumos:**
  - Cadastro de matérias-primas e embalagens.
  - Exibição de quantidade disponível, preço de custo por unidade de medida (preço/g, preço/ml, preço/un).
- [x] **Compras:**
  - Registro de compras de insumos.
  - Atualização automática do estoque e recálculo de custo médio ponderado.
  - Histórico de compras com data e valor total.

---

## FASE 4 — Módulo de Produção e Ficha Técnica
- [x] **Ficha Técnica de Brownies:**
  - Cadastro de tipos/sabores de brownies (Tradicional, Nutella, etc.).
  - Adição de insumos e quantidades por receita/unidade.
  - Cálculo dinâmico do custo unitário do brownie baseado no preço atual dos insumos.
- [x] **Registro de Produção:**
  - Lançamento de fornada/unidades produzidas.
  - Validação de saldo de insumos disponíveis.
  - Baixa automática no estoque de insumos.
  - Entrada automática no estoque de brownies prontos para venda.

---

## FASE 5 — Módulo de Vendas e Gestão de Fiado
- [x] Registro de vendas por sabor de brownie e quantidade.
- [x] Validação de estoque de brownies prontos.
- [x] Formas de pagamento: Dinheiro, Pix, Cartão ou Fiado.
- [x] Módulo de Fiado:
  - Registro de nome do cliente devedor.
  - Lista de contas a receber pendentes.
  - Ação de "Confirmar Pagamento / Dar Baixa" que converte fiado em receita realizada e limpa o débito.
- [x] Baixa automática no estoque de brownies acabados.

---

## FASE 6 — Módulo de Dashboard e Indicadores Financeiros
- [x] Cards de métricas principais:
  - Faturamento total realizado.
  - Total gasto com compras.
  - Lucro líquido real (Faturamento - Compras/Custos).
  - Total a receber em fiados.
- [x] Indicadores operacionais:
  - Estoque de brownies prontos por sabor com barras de progresso.
  - Alerta de insumos com estoque crítico.
- [x] Recurso de restauração de dados de fábrica.

---

## FASE 7 — Testes Integrados, Usabilidade e Refinamentos
- [x] Validação de todo o ciclo ponta a ponta (Comprar -> Produzir -> Vender -> Apurar no Dashboard).
- [x] Bateria de testes de integridade em `src/test-integration.ts` via `tsx`.
- [x] Testes de validação de formulários e bloqueios impeditivos de falta de estoque.

---

## FASE 8 — Preparação para Produção e Publicação
- [x] Build de produção otimizado sem warnings (`dist/`).
- [x] Manual detalhado de execução e deploy no `README.md`.
- [x] Documentação final arquivada e versionada no Git.
