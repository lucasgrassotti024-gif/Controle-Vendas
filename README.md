# Sistema de Controle de Custos e Produção de Brownies

Aplicação web integrada para gestão operacional e financeira de confeitaria artesanal focada na produção e venda de brownies.

## 🎯 Objetivo
Proporcionar controle ponta a ponta: desde a compra de matéria-prima (ingredientes e embalagens), passando pela ficha técnica de custo de receitas e produção, até a venda final no balcão (à vista ou fiado) e fechamento do lucro real em tempo real.

## 🚀 Principais Módulos
1. **Compras:** Registro de compras de insumos com cálculo automático de custo por grama/unidade.
2. **Estoque:** Painel de matérias-primas e saldo de produtos prontos para entrega.
3. **Produção:** Cadastro de receitas/sabores com custo unitário automático e baixa proporcional de insumos.
4. **Vendas:** Lançamento de vendas, controle rigoroso de clientes fiados e baixa de recebimento.
5. **Dashboard:** Visão consolidada de faturamento, custos de insumos, lucro líquido e alertas operacionais.

## 🛠️ Tecnologias
- **React 18** + **TypeScript**
- **Vite** para desenvolvimento rápido e build otimizado
- **Vanilla CSS com Design Tokens**
- **Armazenamento:** Local-first persistente com abstração para nuvem

## 📋 Como Executar
```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Executar validação de tipos e testes
npm run build
```

Consulte a pasta `docs/` para obter informações completas sobre o planejamento e a arquitetura do sistema.
