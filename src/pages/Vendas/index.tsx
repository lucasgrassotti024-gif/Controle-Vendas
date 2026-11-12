import React, { useState } from 'react';
import { 
  ShoppingBag, 
  CreditCard, 
  Banknote, 
  QrCode, 
  UserX, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Check, 
  TrendingUp,
  UserCheck,
  Trash2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../services/calcService';
import { PaymentMethod } from '../../types';
import './Vendas.css';

export const VendasPage: React.FC = () => {
  const { brownies, sales, addSale, settlePendingSale, deleteSale } = useApp();

  const [selectedBrownieId, setSelectedBrownieId] = useState<string>(
    brownies[0]?.id || ''
  );
  const [quantity, setQuantity] = useState('1');
  const [unitPrice, setUnitPrice] = useState<string>(
    brownies[0]?.defaultSalePrice.toFixed(2) || '8.00'
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [customerName, setCustomerName] = useState('');
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const selectedBrownie = brownies.find(b => b.id === selectedBrownieId);

  const handleSelectBrownie = (id: string) => {
    setSelectedBrownieId(id);
    const b = brownies.find(item => item.id === id);
    if (b) {
      setUnitPrice(b.defaultSalePrice.toFixed(2));
    }
  };

  const parsedQty = parseInt(quantity, 10) || 0;
  const parsedPrice = parseFloat(unitPrice.replace(',', '.')) || 0;
  const totalSaleAmount = parsedQty * parsedPrice;

  const handleSubmitSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBrownie) return;

    const result = addSale({
      date: new Date().toISOString(),
      brownieRecipeId: selectedBrownie.id,
      quantity: parsedQty,
      unitPrice: parsedPrice,
      totalAmount: totalSaleAmount,
      paymentMethod,
      status: paymentMethod === 'fiado' ? 'pendente' : 'pago',
      customerName: paymentMethod === 'fiado' ? customerName.trim() : undefined,
    });

    if (result.success) {
      setFeedback({
        text: `Venda de ${parsedQty}x ${selectedBrownie.name} confirmada! Estoque atualizado.`,
        type: 'success'
      });
      setQuantity('1');
      if (paymentMethod === 'fiado') {
        setCustomerName('');
      }
    } else {
      setFeedback({
        text: result.message || 'Erro ao registrar venda.',
        type: 'error'
      });
    }

    setTimeout(() => {
      setFeedback(null);
    }, 4500);
  };

  const pendingSales = sales.filter(s => s.status === 'pendente');
  const totalPendingAmount = pendingSales.reduce((acc, s) => acc + s.totalAmount, 0);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          <ShoppingBag color="var(--color-accent)" />
          Vendas & Gestão de Fiado
        </h1>
        <p className="page-description">
          Lance vendas à pronta-entrega, acompanhe quem comprou fiado e realize a baixa de pagamentos com um clique.
        </p>
      </div>

      {feedback && (
        <div style={{
          backgroundColor: feedback.type === 'success' ? 'rgba(27, 135, 85, 0.15)' : 'rgba(201, 42, 42, 0.15)',
          border: `1px solid ${feedback.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)'}`,
          color: feedback.type === 'success' ? '#2ed573' : '#ff6b6b',
          padding: '12px var(--spacing-md)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: 'var(--spacing-lg)',
          fontSize: '0.9rem'
        }}>
          {feedback.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.text}</span>
        </div>
      )}

      <div className="sales-layout">
        {/* Formulário de Venda */}
        <div className="sale-form-card">
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>
            Registrar Venda
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Desconta os brownies prontos do estoque e contabiliza a receita.
          </p>

          <form onSubmit={handleSubmitSale}>
            <div className="form-group">
              <label className="form-label">Sabor do Brownie</label>
              <select
                className="form-select"
                value={selectedBrownieId}
                onChange={(e) => handleSelectBrownie(e.target.value)}
              >
                {brownies.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name} — ({b.currentStock} prontos no estoque)
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Quantidade</label>
                <input
                  type="number"
                  min="1"
                  required
                  className="form-input"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Preço Unitário (R$)</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                />
              </div>
            </div>

            {/* Seletor de Forma de Pagamento */}
            <div className="form-group">
              <label className="form-label">Forma de Pagamento</label>
              <div className="payment-options-grid">
                <button
                  type="button"
                  className={`payment-btn ${paymentMethod === 'pix' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('pix')}
                >
                  <QrCode size={16} /> Pix
                </button>

                <button
                  type="button"
                  className={`payment-btn ${paymentMethod === 'dinheiro' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('dinheiro')}
                >
                  <Banknote size={16} /> Dinheiro
                </button>

                <button
                  type="button"
                  className={`payment-btn ${paymentMethod === 'cartao' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('cartao')}
                >
                  <CreditCard size={16} /> Cartão
                </button>

                <button
                  type="button"
                  className={`payment-btn ${paymentMethod === 'fiado' ? 'active fiado' : ''}`}
                  onClick={() => setPaymentMethod('fiado')}
                >
                  <UserX size={16} /> Fiado
                </button>
              </div>
            </div>

            {/* Campo obrigatório de Devedor caso seja Fiado */}
            {paymentMethod === 'fiado' && (
              <div className="fiado-banner">
                <label className="form-label" style={{ color: 'var(--color-warning)' }}>
                  Nome do Cliente (Devedor) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos do 402, Amanda da academia..."
                  className="form-input"
                  style={{ marginTop: '4px' }}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                  A venda ficará marcada como Pendente até que o cliente realize o acerto.
                </span>
              </div>
            )}

            {/* Total da Venda */}
            <div className="sale-total-preview">
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Total a Pagar:
              </span>
              <strong>{formatCurrency(totalSaleAmount)}</strong>
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={!selectedBrownie || selectedBrownie.currentStock < parsedQty}
            >
              {selectedBrownie && selectedBrownie.currentStock < parsedQty
                ? `Estoque Insuficiente (${selectedBrownie.currentStock} un)`
                : `Confirmar Venda (${formatCurrency(totalSaleAmount)})`}
            </button>
          </form>
        </div>

        {/* Resumo Rápido de Fiados Pendentes */}
        <div className="fiados-pending-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock color="var(--color-warning)" size={20} />
                Fiados em Aberto
              </h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {pendingSales.length} cliente(s) com saldo a receber
              </span>
            </div>
            <div className="badge badge-warning" style={{ fontSize: '0.95rem', padding: '6px 12px' }}>
              A receber: {formatCurrency(totalPendingAmount)}
            </div>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Brownie / Qtd</th>
                  <th>Valor Devido</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {pendingSales.map((sale) => {
                  const b = brownies.find(item => item.id === sale.brownieRecipeId);
                  return (
                    <tr key={sale.id}>
                      <td>
                        <strong>{sale.customerName || 'Cliente'}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(sale.date).toLocaleDateString('pt-BR')}
                        </div>
                      </td>
                      <td>
                        {sale.quantity}x {b ? b.name : 'Brownie'}
                      </td>
                      <td>
                        <strong style={{ color: 'var(--color-warning)' }}>
                          {formatCurrency(sale.totalAmount)}
                        </strong>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            className="btn-settle"
                            onClick={() => settlePendingSale(sale.id)}
                            title="Clique para marcar como pago e creditar no caixa"
                          >
                            <Check size={14} /> Dar Baixa
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Deseja cancelar esta venda fiado de ${sale.customerName}? Os ${sale.quantity} brownies voltarão para o estoque.`)) {
                                deleteSale(sale.id);
                              }
                            }}
                            title="Cancelar Venda e Devolver Brownies ao Estoque"
                            style={{ color: 'var(--color-danger)', padding: '4px' }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {pendingSales.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                      🎉 Nenhum fiado pendente! Todas as vendas estão quitadas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Histórico Geral de Vendas */}
      <div className="placeholder-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={20} color="var(--color-accent)" />
            Histórico Geral de Vendas
          </h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {sales.length} venda(s) registrada(s)
          </span>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Sabor</th>
                <th>Qtd</th>
                <th>Total</th>
                <th>Pagamento</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => {
                const b = brownies.find(item => item.id === s.brownieRecipeId);
                const dateStr = new Date(s.date).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                const handleDeleteSale = () => {
                  if (window.confirm(`Deseja excluir esta venda de ${s.quantity}x ${b ? b.name : 'Brownie'}? As unidades vendidas serão devolvidas ao estoque.`)) {
                    deleteSale(s.id);
                  }
                };

                return (
                  <tr key={s.id}>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {dateStr}
                    </td>
                    <td>
                      <strong>{b ? b.name : 'Brownie'}</strong>
                    </td>
                    <td>{s.quantity} un</td>
                    <td>
                      <strong style={{ color: '#2ed573' }}>
                        {formatCurrency(s.totalAmount)}
                      </strong>
                    </td>
                    <td>
                      <span className="badge badge-tag" style={{ textTransform: 'uppercase' }}>
                        {s.paymentMethod}
                      </span>
                    </td>
                    <td>
                      {s.status === 'pago' ? (
                        <span className="badge badge-success">
                          <UserCheck size={12} /> Pago
                        </span>
                      ) : (
                        <span className="badge badge-warning">
                          <Clock size={12} /> Fiado ({s.customerName})
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={handleDeleteSale}
                        title="Excluir Venda e Devolver Brownies ao Estoque"
                        style={{ color: 'var(--color-danger)', padding: '4px' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {sales.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    Nenhuma venda registrada ainda. Realize a primeira venda no formulário acima!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
