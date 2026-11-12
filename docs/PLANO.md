# Planejamento Geral de Fases do Projeto

Este documento orienta o desenvolvimento modular do sistema de Controle de Custos de Brownies.
Cada fase só deve ser iniciada após aprovação formal do usuário.

---

## FASE 0 — Fundação Documental e Inicialização (EM ANDAMENTO)
- [x] Inicialização do repositório Git local e `.gitignore`.
- [x] Criação do `AGENTS.md` com diretrizes permanentes.
- [x] Criação do `README.md`.
- [x] Estruturação da documentação em `docs/` (`PLANO.md`, `ARQUITETURA.md`, `PROGRESSO.md`, `DECISOES.md`, `PENDENCIAS.md`).
- [ ] Validação e primeiro commit Git.

---

## FASE 1 — Setup Técnico e Estrutura Base
- [ ] Criação do projeto base com Vite + React + TypeScript.
- [ ] Configuração de CSS global, Design Tokens (cores, fontes, espaçamentos, dark/light theme).
- [ ] Estrutura de navegação SPA com abas/páginas:
  - Vendas
  - Produção
  - Compras
  - Estoque
  - Dashboard
- [ ] Layout mestre responsivo com Header/Sidebar e feedback visual ativo.

---

## FASE 2 — Camada de Domínio, Tipagens e Camada de Armazenamento
- [ ] Definição de todos os tipos e interfaces TypeScript (`Ingredient`, `BrownieRecipe`, `Purchase`, `ProductionBatch`, `Sale`).
- [ ] Utilitário de conversão de unidades (kg <-> g, L <-> ml, un).
- [ ] Camada de repositório e persistência com LocalStorage / IndexedDB com carregamento assíncrono simulado.
- [ ] Mock de dados iniciais para testes de usabilidade imediatos.

---

## FASE 3 — Módulo de Estoque e Compras (Primeiro Elo do Negócio)
- [ ] **Estoque de Insumos:**
  - Cadastro de matérias-primas e embalagens.
  - Exibição de quantidade disponível, preço de custo por unidade de medida (preço/g, preço/ml, preço/un).
- [ ] **Compras:**
  - Registro de compras de insumos.
  - Atualização automática do estoque e recálculo de custo médio ponderado.
  - Histórico de compras com data e valor total.

---

## FASE 4 — Módulo de Produção e Ficha Técnica
- [ ] **Ficha Técnica de Brownies:**
  - Cadastro de tipos/sabores de brownies (Tradicional, Nutella, Ninho, etc.).
  - Adição de insumos e quantidades por receita/unidade.
  - Cálculo dinâmico do custo unitário do brownie baseado no preço atual dos insumos.
- [ ] **Registro de Produção:**
  - Lançamento de fornada/unidades produzidas.
  - Validação de saldo de insumos disponíveis.
  - Baixa automática no estoque de insumos.
  - Entrada automática no estoque de brownies prontos para venda.

---

## FASE 5 — Módulo de Vendas e Gestão de Fiado
- [ ] Registro de vendas por sabor de brownie e quantidade.
- [ ] Validação de estoque de brownies prontos.
- [ ] Formas de pagamento: Dinheiro, Pix, Cartão ou Fiado.
- [ ] Módulo de Fiado:
  - Registro de nome do cliente devedor.
  - Lista de contas a receber pendentes.
  - Ação de "Confirmar Pagamento" que converte fiado em receita realizada e limpa o débito.
- [ ] Baixa automática no estoque de brownies acabados.

---

## FASE 6 — Módulo de Dashboard e Indicadores Financeiros
- [ ] Cards de métricas principais:
  - Faturamento total realizado.
  - Total gasto com compras.
  - Lucro líquido real (Faturamento - Compras/Custos).
  - Total a receber em fiados.
- [ ] Indicadores operacionais:
  - Estoque de brownies prontos por sabor.
  - Alerta de insumos com estoque crítico.
- [ ] Gráficos visuais de distribuição e histórico de vendas.

---

## FASE 7 — Testes Integrados, Usabilidade e Refinamentos
- [ ] Validação de todo o ciclo ponta a ponta (Comprar -> Produzir -> Vender -> Apurar no Dashboard).
- [ ] Teste de responsividade em dispositivos móveis.
- [ ] Testes de validação de formulários e estados de erro/vazio.
- [ ] Exportação/Backup de dados (JSON/CSV).

---

## FASE 8 — Preparação para Produção e Publicação
- [ ] Build de produção sem warnings.
- [ ] Otimização de performance de carregamento.
- [ ] Instruções de hospedagem (Vercel/Netlify/GitHub Pages).
