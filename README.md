# 🍫 Brownie Gestão — Sistema Integrado de Controle de Custos, Estoque e Vendas

Aplicação web profissional sob medida para gestão operacional e financeira de confeitaria artesanal focada na produção e venda de **Brownies**.

O sistema conecta automaticamente **Compras**, **Estoque**, **Produção (Ficha Técnica)**, **Vendas (à vista e fiado)** e **Dashboard Financeiro**.

---

## 🚀 Como Executar o Sistema no Seu Computador

### Pré-requisitos
- Node.js instalado (versão 18 ou superior).

### 1. Iniciar o servidor de desenvolvimento
Abra o terminal na pasta do projeto e execute:

```bash
npm run dev
```

O terminal exibirá o endereço local (geralmente `http://localhost:3000`). Basta abrir esse link no seu navegador Google Chrome, Edge ou Safari!

### 2. Gerar versão de produção (Build)
```bash
npm run build
```

---

## 🔄 Como Funciona a Integração do Sistema (Ciclo do Negócio)

Tudo no sistema é conectado em tempo real sem você precisar fazer contas de cabeça:

1. **📦 Estoque ([src/pages/Estoque](file:///src/pages/Estoque)):**
   - Cadastre ingredientes e embalagens informando a unidade de compra (kg, L, un) e preço pago.
   - O sistema converte automaticamente para gramas ou mililitros e calcula o preço por grama.
   - Alertas visuais avisam quando qualquer insumo estiver abaixo do estoque mínimo.
   - Mostra também a quantidade de brownies prontos para venda.

2. **🛒 Compras ([src/pages/Compras](file:///src/pages/Compras)):**
   - Registre suas idas ao mercado.
   - Ao lançar uma compra, o sistema:
     - (+) Aumenta o estoque do insumo no Estoque.
     - (=) Recalcula o custo médio ponderado por grama.
     - (-) Registra a despesa financeira no Dashboard.

3. **👩‍🍳 Produção & Ficha Técnica ([src/pages/Producao](file:///src/pages/Producao)):**
   - Cada receita tem sua ficha técnica cadastrada.
   - O sistema calcula na hora o **Custo Unitário** de fazer cada fatia de brownie com base no preço atual dos insumos.
   - Mostra o preço de venda sugerido e a margem de lucro real.
   - Ao clicar em **"Produzir"**:
     - Valida se há ingredientes suficientes na despensa.
     - (-) Desconta os insumos exatos do estoque.
     - (+) Adiciona as fatias produzidas ao estoque de brownies prontos.

4. **🛍️ Vendas & Gestão de Fiado ([src/pages/Vendas](file:///src/pages/Vendas)):**
   - Registre vendas de pronta-entrega por sabor e quantidade.
   - Formas de pagamento: **Dinheiro, Pix, Cartão ou Fiado**.
   - Se for **Fiado**: digite o nome do cliente. Fica registrado no painel de devedores.
   - Quando o cliente pagar, clique em **"Dar Baixa"** com um clique para creditar o dinheiro no caixa!
   - (-) Toda venda desconta automaticamente as fatias do estoque de brownies prontos.

5. **📊 Dashboard ([src/pages/Dashboard](file:///src/pages/Dashboard)):**
   - **Faturamento Realizado:** soma das vendas recebidas.
   - **Total em Compras:** despesas operacionais acumuladas.
   - **Lucro Líquido Real:** quanto sobrou no bolso (Faturamento - Compras).
   - **Fiados a Receber:** quanto dinheiro você tem na rua e lista de clientes.
   - **Valor Imobilizado:** quanto você tem parado em insumos na despensa.
   - **Barras de Estoque:** saldo de brownies prontos por sabor.

---

## 🌐 Opções Gratuitas para Colocar o Site na Internet (Deploy)

Caso queira acessar o sistema pelo seu celular ou em qualquer lugar:

### Opção 1: Vercel (Recomendado — 1 clique)
1. Crie uma conta gratuita em [vercel.com](https://vercel.com).
2. Conecte com o seu GitHub e importe este repositório.
3. O build é automático (`npm run build`). Seu site estará online com HTTPS gratuito!

### Opção 2: Netlify
1. Crie uma conta em [netlify.com](https://netlify.com).
2. Arraste a pasta `dist` gerada pelo `npm run build` ou conecte ao repositório Git.

---

## 🛠️ Tecnologias Utilizadas
- **React 18** com **TypeScript** (Strict Mode)
- **Vite** para compilação ultrarrápida
- **Vanilla CSS com Design Tokens** (tema dark chocolate artesanal)
- **Lucide Icons**
- **Persistência Local-First Resiliente** (LocalStorage com suporte para exportação e nuvem)

---

## 📁 Documentação Técnica
- [AGENTS.md](file:///AGENTS.md): Regras permanentes e diretrizes do projeto.
- [docs/ARQUITETURA.md](file:///docs/ARQUITETURA.md): Modelagem de dados e regras matemáticas.
- [docs/PLANO.md](file:///docs/PLANO.md): Roadmap de todas as fases.
- [docs/PROGRESSO.md](file:///docs/PROGRESSO.md): Histórico completo de desenvolvimento e validação.
- [docs/DECISOES.md](file:///docs/DECISOES.md): Registros de decisões de arquitetura (ADRs).
