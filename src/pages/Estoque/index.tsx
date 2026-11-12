import React from 'react';
import { Boxes, AlertCircle } from 'lucide-react';

export const EstoquePage: React.FC = () => {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          <Boxes color="var(--color-accent)" />
          Estoque (Insumos & Brownies Prontos)
        </h1>
        <p className="page-description">
          Acompanhe o saldo dos ingredientes (gramas, ml, unidades) e a quantidade de brownies prontos para venda.
        </p>
      </div>

      <div className="placeholder-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-accent)', marginBottom: '12px' }}>
          <AlertCircle size={20} />
          <strong>Módulo de Estoque Planejado</strong>
        </div>
        <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
          Aqui você cadastrará seus insumos (chocolate, farinha, manteiga, ovos, embalagens) definindo o preço do quilo, litro ou unidade. 
          Você também verá o saldo de brownies prontos aguardando venda e alertas quando algum ingrediente estiver acabando.
        </p>
      </div>
    </div>
  );
};
