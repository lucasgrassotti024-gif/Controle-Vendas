import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Boxes, 
  Package, 
  RotateCcw,
  Sparkles,
  ArrowUpRight,
  Calendar,
  CalendarDays,
  BarChart3
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  formatCurrency, 
  getDailyProfitHistory,
  getWeeklyProfit,
  getMonthlyProfit
} from '../../services/calcService';
import './Dashboard.css';

export const DashboardPage: React.FC = () => {
  const { metrics, brownies, ingredients, sales, purchases, productions, resetAllData } = useApp();

  // Lucro da Semana e do Mês (baseado nas vendas reais e custo dos produtos vendidos)
  const weeklyProfit = getWeeklyProfit(sales, purchases, productions, ingredients, brownies);
  const monthlyProfit = getMonthlyProfit(sales, purchases, productions, ingredients, brownies);

  // Histórico Diário (últimos 7 dias)
  const dailyHistory = getDailyProfitHistory(sales, purchases, productions, ingredients, brownies, 7);
  const maxDayNetProfit = Math.max(...dailyHistory.map(d => Math.abs(d.netProfit)), 50);

  const handleReset = () => {
    if (window.confirm('Atenção: Deseja realmente restaurar os dados de fábrica? Isso recarregará os insumos e brownies padrão.')) {
      resetAllData();
    }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">
            <Sparkles color="var(--color-accent)" />
            Painel Geral de Controle
          </h1>
          <p className="page-description">
            Visão financeira e operacional integrada da produção e venda de brownies.
          </p>
        </div>
      </div>

      {/* 1. Grid dos KPIs Financeiros Centrais */}
      <div className="dashboard-kpi-grid">
        {/* KPI 1: Faturamento */}
        <div className="kpi-card revenue">
          <div className="kpi-icon-box" style={{ backgroundColor: 'rgba(27, 135, 85, 0.15)', color: '#2ed573' }}>
            <TrendingUp size={24} />
          </div>
          <div className="kpi-data">
            <span className="kpi-label">Faturamento Bruto</span>
            <strong className="kpi-value" style={{ color: '#2ed573' }}>
              {formatCurrency(metrics.totalRevenue)}
            </strong>
            <span className="kpi-subtext">Total arrecadado com vendas pagas</span>
          </div>
        </div>

        {/* KPI 2: Custo dos Brownies Vendidos (CPV) */}
        <div className="kpi-card purchases">
          <div className="kpi-icon-box" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
            <Package size={24} />
          </div>
          <div className="kpi-data">
            <span className="kpi-label">Custo dos Produtos Vendidos</span>
            <strong className="kpi-value" style={{ color: '#ef4444' }}>
              {formatCurrency(metrics.totalCostOfGoodsSold)}
            </strong>
            <span className="kpi-subtext">Custo de fabricação do que foi vendido</span>
          </div>
        </div>

        {/* KPI 3: Lucro Líquido Real das Vendas */}
        <div className="kpi-card profit">
          <div className="kpi-icon-box" style={{ backgroundColor: 'rgba(224, 159, 62, 0.15)', color: 'var(--color-accent)' }}>
            <DollarSign size={24} />
          </div>
          <div className="kpi-data">
            <span className="kpi-label">Lucro Líquido Real</span>
            <strong className="kpi-value" style={{ color: metrics.netProfit >= 0 ? 'var(--color-accent)' : '#ff6b6b' }}>
              {formatCurrency(metrics.netProfit)}
            </strong>
            <span className="kpi-subtext">
              Faturamento ({formatCurrency(metrics.totalRevenue)}) - Custo ({formatCurrency(metrics.totalCostOfGoodsSold)})
            </span>
          </div>
        </div>

        {/* KPI 4: Fiados Pendentes */}
        <div className="kpi-card receivables">
          <div className="kpi-icon-box" style={{ backgroundColor: 'rgba(194, 120, 3, 0.15)', color: 'var(--color-warning)' }}>
            <Clock size={24} />
          </div>
          <div className="kpi-data">
            <span className="kpi-label">Fiados a Receber</span>
            <strong className="kpi-value" style={{ color: 'var(--color-warning)' }}>
              {formatCurrency(metrics.pendingReceivables)}
            </strong>
            <span className="kpi-subtext">{metrics.pendingSalesCount} cliente(s) devendo</span>
          </div>
        </div>

        {/* KPI 5: Dinheiro Gasto em Estoque (Patrimônio Imobilizado) */}
        <div className="kpi-card inventory">
          <div className="kpi-icon-box" style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
            <Boxes size={24} />
          </div>
          <div className="kpi-data">
            <span className="kpi-label">Dinheiro Gasto em Estoque</span>
            <strong className="kpi-value" style={{ color: '#38bdf8' }}>
              {formatCurrency(metrics.totalStockInvested)}
            </strong>
            <span className="kpi-subtext">
              {formatCurrency(metrics.stockInsumosValue)} insumos + {formatCurrency(metrics.stockFinishedValue)} prontos
            </span>
          </div>
        </div>

        {/* KPI 6: Lucro da Semana Atual */}
        <div className="kpi-card week">
          <div className="kpi-icon-box" style={{ backgroundColor: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
            <Calendar size={24} />
          </div>
          <div className="kpi-data">
            <span className="kpi-label">Lucro da Semana</span>
            <strong className="kpi-value" style={{ color: weeklyProfit.netProfit >= 0 ? '#2ed573' : '#ff6b6b' }}>
              {formatCurrency(weeklyProfit.netProfit)}
            </strong>
            <span className="kpi-subtext">
              Vendas {formatCurrency(weeklyProfit.revenue)} - Custo {formatCurrency(weeklyProfit.cogs)}
            </span>
          </div>
        </div>

        {/* KPI 7: Lucro do Mês Atual */}
        <div className="kpi-card month">
          <div className="kpi-icon-box" style={{ backgroundColor: 'rgba(236, 72, 153, 0.15)', color: '#ec4899' }}>
            <CalendarDays size={24} />
          </div>
          <div className="kpi-data">
            <span className="kpi-label">Lucro do Mês</span>
            <strong className="kpi-value" style={{ color: monthlyProfit.netProfit >= 0 ? '#2ed573' : '#ff6b6b' }}>
              {formatCurrency(monthlyProfit.netProfit)}
            </strong>
            <span className="kpi-subtext">
              Vendas {formatCurrency(monthlyProfit.revenue)} - Custo {formatCurrency(monthlyProfit.cogs)}
            </span>
          </div>
        </div>
      </div>


      {/* 3. Gráfico de Tempo: Lucro Líquido Diário (Últimos 7 Dias) */}
      <div className="chart-panel">
        <div className="chart-header">
          <div>
            <div className="chart-title">
              <BarChart3 size={20} color="var(--color-accent)" />
              Evolução do Lucro Diário (Últimos 7 Dias)
            </div>
            <p className="chart-subtitle">
              Acompanhe o lucro líquido apurado a cada dia (Faturamento menos Custo dos brownies vendidos).
            </p>
          </div>
          <div className="chart-legend">
            <span className="legend-item"><span className="legend-dot profit"></span> Lucro Positivo</span>
            <span className="legend-item"><span className="legend-dot loss"></span> Sem Lucro / Negativo</span>
          </div>
        </div>

        {/* Gráfico de Barras Responsivo */}
        <div className="daily-chart-container">
          {dailyHistory.map((day) => {
            const isPositive = day.netProfit >= 0;
            const barHeightPct = Math.min(100, Math.max(12, Math.round((Math.abs(day.netProfit) / maxDayNetProfit) * 100)));
            const isZero = day.netProfit === 0 && day.revenue === 0 && day.purchases === 0;

            return (
              <div key={day.dateKey} className="chart-col">
                <div className="chart-bar-wrapper">
                  <span className={`chart-val-label ${isPositive ? 'positive' : 'negative'}`}>
                    {isZero ? 'R$ 0' : formatCurrency(day.netProfit)}
                  </span>
                  <div
                    className={`chart-bar ${isPositive ? 'positive' : 'negative'} ${isZero ? 'zero' : ''}`}
                    style={{ height: `${isZero ? 6 : barHeightPct}%` }}
                    title={`Data: ${day.dayLabel} | Vendas: ${formatCurrency(day.revenue)} | Custo de Fabricação: ${formatCurrency(day.cogs)} | Lucro Real: ${formatCurrency(day.netProfit)}`}
                  />
                </div>
                <div className="chart-label-day">
                  <strong>{day.weekday}</strong>
                  <span>{day.dayLabel}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Grid de Detalhes: Estoque de Prontos vs Insumos Críticos */}
      <div className="dashboard-details-grid">
        {/* Painel: Brownies Prontos para Entrega */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <div className="panel-title">
              <Package size={20} color="var(--color-accent)" />
              Brownies Prontos para Venda
            </div>
            <span className="badge badge-tag">
              {metrics.stockFinishedUnits} unidades prontas
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {brownies.map((b) => {
              const maxScale = Math.max(b.minStock * 2, 20);
              const percentage = Math.min(100, Math.round((b.currentStock / maxScale) * 100));
              const isLow = b.currentStock <= b.minStock;

              return (
                <div key={b.id} className="brownie-stock-row">
                  <div className="brownie-stock-info">
                    <strong>{b.name}</strong>
                    <span>
                      <strong style={{ color: isLow ? '#ffa502' : 'var(--text-main)' }}>
                        {b.currentStock} un
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}> (Mín: {b.minStock})</span>
                    </span>
                  </div>

                  <div className="progress-track">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${percentage}%`, 
                        backgroundColor: isLow ? 'var(--color-warning)' : 'var(--color-accent)' 
                      }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Rodapé com Opção de Reset e Informação */}
      <div className="reset-banner">
        <div>
          <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ArrowUpRight size={16} color="var(--color-accent)" />
            Sistema Integrado de Brownies Operando em Tempo Real
          </strong>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Todos os cálculos são atualizados automaticamente a cada compra, produção ou venda realizada.
          </span>
        </div>

        <button
          onClick={handleReset}
          className="btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}
          title="Restaura os dados originais de exemplo"
        >
          <RotateCcw size={14} /> Restaurar Dados de Fábrica
        </button>
      </div>
    </div>
  );
};
