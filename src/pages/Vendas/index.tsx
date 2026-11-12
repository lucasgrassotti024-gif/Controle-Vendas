import React from 'react';
import { ShoppingBag, AlertCircle } from 'lucide-react';

export const VendasPage: React.FC = () => {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          <ShoppingBag color="var(--color-accent)" />
          Vendas de Brownies
        </h1>
        <p className="page-description">
          Registre saídas de brownies por tipo, acompanhe formas de pagamento (à vista ou fiado) e dê baixa em recebimentos.
        </p>
      </div>

      <div className="placeholder-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-accent)', marginBottom: '12px' }}>
          <AlertCircle size={20} />
          <strong>Módulo de Vendas Planejado</strong>
        </div>
        <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
          Aqui você registrará as vendas com seleção do sabor do brownie, quantidade, preço e cliente. 
          Ao registrar, o sistema descontará automaticamente os brownies prontos do <strong>Estoque</strong> e somará ao faturamento no <strong>Dashboard</strong>. 
          Se for <em>Fiado</em>, ficará registrado o nome do cliente para baixa posterior.
        </p>
      </div>
    </div>
  );
};
