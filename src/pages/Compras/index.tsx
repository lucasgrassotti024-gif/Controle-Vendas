import React from 'react';
import { ShoppingCart, AlertCircle } from 'lucide-react';

export const ComprasPage: React.FC = () => {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          <ShoppingCart color="var(--color-accent)" />
          Compras de Insumos
        </h1>
        <p className="page-description">
          Lance as compras de ingredientes e embalagens para atualizar os preços médios e abastecer o estoque.
        </p>
      </div>

      <div className="placeholder-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-accent)', marginBottom: '12px' }}>
          <AlertCircle size={20} />
          <strong>Módulo de Compras Planejado</strong>
        </div>
        <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
          Aqui você adicionará tudo o que comprou no mercado ou distribuidor (ex: 5kg de chocolate a R$ 120,00). 
          O sistema recalculará o custo por grama/unidade no <strong>Estoque</strong>, aumentará o saldo disponível de matéria-prima e registrará a saída de caixa no <strong>Dashboard</strong>.
        </p>
      </div>
    </div>
  );
};
