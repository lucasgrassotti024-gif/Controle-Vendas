import React from 'react';
import { ChefHat, AlertCircle } from 'lucide-react';

export const ProducaoPage: React.FC = () => {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          <ChefHat color="var(--color-accent)" />
          Produção & Ficha Técnica
        </h1>
        <p className="page-description">
          Monte as receitas de cada brownie, calcule o custo unitário em tempo real e registre fornadas para alimentar o estoque.
        </p>
      </div>

      <div className="placeholder-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-accent)', marginBottom: '12px' }}>
          <AlertCircle size={20} />
          <strong>Módulo de Produção Planejado</strong>
        </div>
        <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
          Aqui você definirá quanto gasta de cada ingrediente (chocolate, manteiga, ovos, embalagem) por fornada/unidade. 
          O sistema buscará o preço de cada item no <strong>Estoque</strong> e dirá exatamente quanto custa produzir cada brownie. 
          Ao clicar em <em>Produzir</em>, descontará os ingredientes do estoque e adicionará as unidades aos brownies prontos.
        </p>
      </div>
    </div>
  );
};
