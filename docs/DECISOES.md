# Registro de Decisões de Arquitetura (ADRs)

Registro formal das decisões técnicas adotadas para manter o projeto consistente e transparente.

---

## ADR 001: Stack Base (React + TypeScript + Vite)
- **Data:** 2026-11-12
- **Contexto:** Necessidade de construir um sistema interativo com 5 telas dinâmicas, cálculos monetários de precisão e controle de estoque bidirecional em tempo real.
- **Decisão:** Utilizar React com Vite e TypeScript no modo estrito.
- **Consequências:** Agilidade no desenvolvimento, tipagem estática que previne bugs de unidades e cálculos, e facilidade de compilação para produção sem overhead de servidor complexo.

---

## ADR 002: Persistência de Dados Local-First Abstraída
- **Data:** 2026-11-12
- **Contexto:** Permitir que o sistema funcione com rapidez imediata, sem custo de infraestrutura inicial e sem obrigar login obrigatório na fase de desenvolvimento.
- **Decisão:** Criar uma camada de Repositório desacoplada (Interface `StorageService`) que utiliza inicialmente `LocalStorage` / `IndexedDB`, mas mantém métodos assíncronos (`async/await`).
- **Consequências:** No futuro, caso o usuário queira sincronizar dados na nuvem (Supabase / Firebase), apenas a camada de repositório precisará ser alterada, sem tocar na lógica das páginas e componentes.

---

## ADR 003: Unificação de Embalagens e Insumos no Estoque
- **Data:** 2026-11-12
- **Contexto:** Embalagens, fitas e forminhas afetam diretamente o custo unitário do brownie.
- **Decisão:** Tratar embalagens e descartáveis como insumos regulares dentro do Estoque, permitindo que sejam adicionados à Ficha Técnica da mesma forma que os ingredientes comestíveis.
- **Consequências:** Cálculo realista e exato da margem de lucro por unidade de brownie.
