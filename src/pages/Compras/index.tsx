import React, { useState } from 'react';
import { ShoppingCart, PlusCircle, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, calculateCostPerBaseUnit } from '../../services/calcService';
import { PurchaseUnit } from '../../types';
import './Compras.css';

export const ComprasPage: React.FC = () => {
  const { ingredients, purchases, addPurchase, deletePurchase, ingredientsMap } = useApp();

  const [selectedIngredientId, setSelectedIngredientId] = useState<string>(
    ingredients[0]?.id || ''
  );
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState<PurchaseUnit>(
    ingredients[0]?.purchaseUnit || 'kg'
  );
  const [totalCost, setTotalCost] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const selectedIngredient = ingredientsMap.get(selectedIngredientId);

  // Quando o usuário seleciona um ingrediente, puxa a unidade padrão de compra dele
  const handleSelectIngredient = (id: string) => {
    setSelectedIngredientId(id);
    const ing = ingredientsMap.get(id);
    if (ing) {
      setUnit(ing.purchaseUnit);
    }
  };

  const parsedQty = parseFloat(quantity.replace(',', '.')) || 0;
  const parsedCost = parseFloat(totalCost.replace(',', '.')) || 0;

  // Pré-visualização do custo por unidade base em tempo real
  const previewCostPerBase = selectedIngredient
    ? calculateCostPerBaseUnit(parsedCost, parsedQty, unit, selectedIngredient.baseUnit)
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIngredient || parsedQty <= 0 || parsedCost <= 0) return;

    addPurchase({
      date: new Date().toISOString(),
      ingredientId: selectedIngredient.id,
      quantityPurchased: parsedQty,
      unit,
      totalCost: parsedCost,
    });

    setSuccessMessage(`Compra de ${selectedIngredient.name} registrada com sucesso! Estoque atualizado.`);
    setQuantity('');
    setTotalCost('');

    setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);
  };

  const totalSpentAllTime = purchases.reduce((acc, p) => acc + p.totalCost, 0);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          <ShoppingCart color="var(--color-accent)" />
          Compras de Insumos
        </h1>
        <p className="page-description">
          Lance suas compras de mercado. O sistema recalcula o custo unitário e atualiza o estoque de matéria-prima automaticamente.
        </p>
      </div>

      <div className="purchases-layout">
        {/* Coluna 1: Formulário de Lançamento */}
        <div className="purchase-form-card">
          <h2 className="purchase-form-title">
            <PlusCircle size={20} color="var(--color-accent)" />
            Registrar Nova Compra
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Preencha os dados do que comprou no fornecedor ou supermercado.
          </p>

          {successMessage && (
            <div style={{
              backgroundColor: 'rgba(27, 135, 85, 0.15)',
              border: '1px solid var(--color-success)',
              borderRadius: 'var(--radius-md)',
              padding: '12px',
              color: '#2ed573',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <CheckCircle size={16} />
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Insumo Comprado</label>
              <select
                className="form-select"
                value={selectedIngredientId}
                onChange={(e) => handleSelectIngredient(e.target.value)}
              >
                {ingredients.map((ing) => (
                  <option key={ing.id} value={ing.id}>
                    {ing.name} ({ing.category === 'embalagem' ? 'Embalagem' : 'Ingrediente'})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Quantidade Comprada</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 2 ou 1.5"
                  className="form-input"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Unidade</label>
                <select
                  className="form-select"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as PurchaseUnit)}
                >
                  <option value="kg">Quilos (kg)</option>
                  <option value="g">Gramas (g)</option>
                  <option value="l">Litros (l)</option>
                  <option value="ml">Mililitros (ml)</option>
                  <option value="un">Unidades (un)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Valor Total Pago (R$)</label>
              <input
                type="text"
                required
                placeholder="Ex: 55.90"
                className="form-input"
                value={totalCost}
                onChange={(e) => setTotalCost(e.target.value)}
              />
            </div>

            {/* Prévia do cálculo do custo por grama */}
            {selectedIngredient && parsedQty > 0 && parsedCost > 0 && (
              <div className="unit-cost-preview">
                <div>
                  <span>Custo recalculado por {selectedIngredient.baseUnit}:</span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {parsedQty} {unit} equivalem à entrada de insumo no estoque
                  </div>
                </div>
                <strong>{formatCurrency(previewCostPerBase)}/{selectedIngredient.baseUnit}</strong>
              </div>
            )}

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Confirmar Entrada de Compra
            </button>
          </form>
        </div>

        {/* Coluna 2: Histórico de Compras */}
        <div className="purchases-history-card">
          <div className="history-header">
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Histórico de Compras</h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {purchases.length} lançamento(s) registrado(s)
              </span>
            </div>
            <div className="history-total-badge">
              Total Gasto: {formatCurrency(totalSpentAllTime)}
            </div>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Insumo</th>
                  <th>Qtd Comprada</th>
                  <th>Valor Total</th>
                  <th>Custo Base</th>
                  <th style={{ textAlign: 'right' }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((p) => {
                  const ing = ingredientsMap.get(p.ingredientId);
                  const dateStr = new Date(p.date).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  const handleDeletePurchase = () => {
                    if (window.confirm(`Deseja excluir esta compra de ${p.quantityPurchased} ${p.unit} de ${ing ? ing.name : 'insumo'}? O estoque de matéria-prima será estornado automaticamente.`)) {
                      deletePurchase(p.id);
                    }
                  };

                  return (
                    <tr key={p.id}>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} />
                          {dateStr}
                        </div>
                      </td>
                      <td>
                        <strong>{ing ? ing.name : 'Insumo Excluído'}</strong>
                      </td>
                      <td>
                        {p.quantityPurchased} {p.unit}
                      </td>
                      <td>
                        <strong style={{ color: 'var(--color-danger)' }}>
                          {formatCurrency(p.totalCost)}
                        </strong>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {formatCurrency(p.calculatedCostPerBaseUnit)}/{ing?.baseUnit || ''}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={handleDeletePurchase}
                          title="Excluir Compra e Estornar Estoque"
                          style={{ color: 'var(--color-danger)', padding: '4px' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {purchases.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                      Nenhuma compra registrada ainda. Lance sua primeira compra ao lado!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
