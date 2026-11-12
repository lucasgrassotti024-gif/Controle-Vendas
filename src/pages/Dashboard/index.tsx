import React from 'react';
import { LayoutDashboard, AlertCircle, TrendingUp, DollarSign, Clock, PackageCheck } from 'lucide-react';
import './Dashboard.css';

export const DashboardPage: React.FC = () => {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          <LayoutDashboard color="var(--color-accent)" />
          Dashboard & Indicadores
        </h1>
        <p className="page-description">
          Visão geral em tempo real de faturamento, despesas de compras, lucro líquido e valores de fiado a receber.
        </p>
      </div>

      <div className="metrics-grid-preview">
        <div className="metric-card-preview">
          <div className="metric-icon-preview" style={{ background: 'rgba(27, 135, 85, 0.15)', color: 'var(--color-success)' }}>
            <TrendingUp size={22} />
          </div>
          <div className="metric-data-preview">
            <span className="metric-label-preview">Faturamento Realizado</span>
            <strong className="metric-value-preview">R$ 0,00</strong>
          </div>
        </div>

        <div className="metric-card-preview">
          <div className="metric-icon-preview" style={{ background: 'rgba(201, 42, 42, 0.15)', color: 'var(--color-danger)' }}>
            <DollarSign size={22} />
          </div>
          <div className="metric-data-preview">
            <span className="metric-label-preview">Total em Compras</span>
            <strong className="metric-value-preview">R$ 0,00</strong>
          </div>
        </div>

        <div className="metric-card-preview">
          <div className="metric-icon-preview" style={{ background: 'rgba(224, 159, 62, 0.15)', color: 'var(--color-accent)' }}>
            <PackageCheck size={22} />
          </div>
          <div className="metric-data-preview">
            <span className="metric-label-preview">Lucro Líquido Real</span>
            <strong className="metric-value-preview">R$ 0,00</strong>
          </div>
        </div>

        <div className="metric-card-preview">
          <div className="metric-icon-preview" style={{ background: 'rgba(194, 120, 3, 0.15)', color: 'var(--color-warning)' }}>
            <Clock size={22} />
          </div>
          <div className="metric-data-preview">
            <span className="metric-label-preview">Fiados Pendentes</span>
            <strong className="metric-value-preview">R$ 0,00</strong>
          </div>
        </div>
      </div>

      <div className="placeholder-card" style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-accent)', marginBottom: '12px' }}>
          <AlertCircle size={20} />
          <strong>Consolidação Financeira Automática</strong>
        </div>
        <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
          Conforme você lançar compras, produções e vendas, estes indicadores serão recalculados instantaneamente. 
          Você saberá a qualquer momento seu lucro real, o valor total do seu estoque parado e quais clientes estão devendo fiado.
        </p>
      </div>
    </div>
  );
};
