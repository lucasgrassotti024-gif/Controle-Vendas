import React, { useState } from 'react';
import { 
  Boxes, 
  Plus, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Package, 
  X,
  Layers,
  Edit2,
  Trash2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatStock, convertToBaseUnit } from '../../services/calcService';
import { PurchaseUnit, BaseUnit, IngredientCategory, Ingredient } from '../../types';
import './Estoque.css';

export const EstoquePage: React.FC = () => {
  const { ingredients, brownies, addIngredient, updateIngredient, deleteIngredient } = useApp();
  const [activeTab, setActiveTab] = useState<'insumos' | 'prontos'>('insumos');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Formulário de novo insumo
  const [name, setName] = useState('');
  const [category, setCategory] = useState<IngredientCategory>('ingrediente');
  const [purchaseUnit, setPurchaseUnit] = useState<PurchaseUnit>('kg');
  const [unitCostPrice, setUnitCostPrice] = useState('');
  const [minStock, setMinStock] = useState('500');

  const filteredIngredients = ingredients.filter(ing => 
    ing.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBrownies = brownies.filter(b =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenCreate = () => {
    setEditingIngredient(null);
    setName('');
    setCategory('ingrediente');
    setPurchaseUnit('kg');
    setUnitCostPrice('');
    setMinStock('500');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ing: Ingredient) => {
    setEditingIngredient(ing);
    setName(ing.name);
    setCategory(ing.category);
    setPurchaseUnit(ing.purchaseUnit);
    // Custo por quilo/litro/unidade original
    const factor = (ing.purchaseUnit === 'kg' || ing.purchaseUnit === 'l') ? 1000 : 1;
    setUnitCostPrice((ing.costPerBaseUnit * factor).toFixed(2));
    setMinStock(ing.minStock.toString());
    setIsModalOpen(true);
  };

  const handleDelete = (ing: Ingredient) => {
    if (window.confirm(`Tem certeza de que deseja excluir o insumo "${ing.name}"?`)) {
      const result = deleteIngredient(ing.id);
      if (result.success) {
        setFeedback({ text: `Insumo "${ing.name}" excluído com sucesso.`, type: 'success' });
      } else {
        setFeedback({ text: result.message || 'Erro ao excluir.', type: 'error' });
      }
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleSaveIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let baseUnit: BaseUnit = 'un';
    if (purchaseUnit === 'kg' || purchaseUnit === 'g') baseUnit = 'g';
    if (purchaseUnit === 'l' || purchaseUnit === 'ml') baseUnit = 'ml';

    const min = parseFloat(minStock.replace(',', '.')) || 0;
    const price = parseFloat(unitCostPrice.replace(',', '.')) || 0;

    // Se o preço foi informado por kg, divide por 1000 para saber o custo por grama
    const baseQuantityFactor = convertToBaseUnit(1, purchaseUnit, baseUnit);
    const costPerBase = baseQuantityFactor > 0 ? (price / baseQuantityFactor) : 0;

    if (editingIngredient) {
      updateIngredient({
        ...editingIngredient,
        name: name.trim(),
        category,
        purchaseUnit,
        baseUnit,
        minStock: min,
        costPerBaseUnit: costPerBase > 0 ? costPerBase : editingIngredient.costPerBaseUnit
      });

      setFeedback({ text: `Insumo "${name}" atualizado com sucesso!`, type: 'success' });
    } else {
      addIngredient({
        name: name.trim(),
        category,
        purchaseUnit,
        baseUnit,
        currentStock: 0, // Começa em 0 para ser abastecido via Compras
        minStock: min,
        costPerBaseUnit: costPerBase,
      });

      setFeedback({ text: `Insumo "${name}" cadastrado! O estoque inicial é 0. Lance as compras na página de Compras para abastecer o estoque.`, type: 'success' });
    }

    setTimeout(() => setFeedback(null), 5000);
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          <Boxes color="var(--color-accent)" />
          Controle de Estoque
        </h1>
        <p className="page-description">
          Gerencie o saldo de matérias-primas/embalagens e acompanhe a quantidade de brownies prontos para entrega.
        </p>
      </div>

      {/* Abas */}
      <div className="stock-tabs">
        <button
          className={`stock-tab-btn ${activeTab === 'insumos' ? 'active' : ''}`}
          onClick={() => setActiveTab('insumos')}
        >
          <Layers size={18} />
          Insumos & Embalagens ({ingredients.length})
        </button>
        <button
          className={`stock-tab-btn ${activeTab === 'prontos' ? 'active' : ''}`}
          onClick={() => setActiveTab('prontos')}
        >
          <Package size={18} />
          Brownies Prontos para Venda ({brownies.length})
        </button>
      </div>

      {feedback && (
        <div style={{
          backgroundColor: feedback.type === 'success' ? 'rgba(27, 135, 85, 0.15)' : 'rgba(201, 42, 42, 0.15)',
          border: `1px solid ${feedback.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)'}`,
          color: feedback.type === 'success' ? '#2ed573' : '#ff6b6b',
          padding: '12px var(--spacing-md)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--spacing-md)',
          fontSize: '0.9rem'
        }}>
          {feedback.text}
        </div>
      )}

      {/* Barra de Ações */}
      <div className="actions-bar">
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px' }} />
          <input
            type="text"
            className="search-input"
            style={{ paddingLeft: '36px' }}
            placeholder={`Buscar em ${activeTab === 'insumos' ? 'insumos' : 'brownies'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {activeTab === 'insumos' && (
          <button className="btn-primary" onClick={handleOpenCreate}>
            <Plus size={18} />
            Novo Insumo / Embalagem
          </button>
        )}
      </div>

      {/* Conteúdo da Aba 1: Insumos */}
      {activeTab === 'insumos' && (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Nome do Insumo</th>
                <th>Categoria</th>
                <th>Estoque Atual</th>
                <th>Custo Médio Base</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredIngredients.map((ing) => {
                const isLow = ing.currentStock <= ing.minStock;
                return (
                  <tr key={ing.id}>
                    <td>
                      <strong>{ing.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Comprado em: {ing.purchaseUnit.toUpperCase()} | Consumo: {ing.baseUnit}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-tag">
                        {ing.category === 'embalagem' ? 'Embalagem' : 'Ingrediente'}
                      </span>
                    </td>
                    <td>
                      <strong style={{ fontSize: '1rem' }}>
                        {formatStock(ing.currentStock, ing.baseUnit)}
                      </strong>
                    </td>
                    <td>
                      <span>{formatCurrency(ing.costPerBaseUnit)}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        /{ing.baseUnit}
                      </span>
                    </td>
                    <td>
                      {isLow ? (
                        <span className="badge badge-warning">
                          <AlertTriangle size={12} /> Estoque Baixo (&lt; {ing.minStock})
                        </span>
                      ) : (
                        <span className="badge badge-success">
                          <CheckCircle2 size={12} /> Normal
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          onClick={() => handleOpenEdit(ing)}
                          title="Editar Insumo"
                          style={{ color: 'var(--color-accent)', padding: '4px' }}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(ing)}
                          title="Excluir Insumo"
                          style={{ color: 'var(--color-danger)', padding: '4px' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredIngredients.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    Nenhum insumo encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Conteúdo da Aba 2: Brownies Prontos */}
      {activeTab === 'prontos' && (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Sabor do Brownie</th>
                <th>Preço de Venda</th>
                <th>Prontos em Estoque</th>
                <th>Rendimento por Fornada</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredBrownies.map((b) => {
                const isLow = b.currentStock <= b.minStock;
                return (
                  <tr key={b.id}>
                    <td>
                      <strong>{b.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {b.description}
                      </div>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--color-accent)' }}>
                        {formatCurrency(b.defaultSalePrice)}
                      </strong>
                    </td>
                    <td>
                      <strong style={{ fontSize: '1.1rem' }}>
                        {b.currentStock} unidades
                      </strong>
                    </td>
                    <td>{b.yieldUnits} un / fornada</td>
                    <td>
                      {isLow ? (
                        <span className="badge badge-warning">
                          <AlertTriangle size={12} /> Repor Produção (&lt; {b.minStock})
                        </span>
                      ) : (
                        <span className="badge badge-success">
                          <CheckCircle2 size={12} /> Pronta Entrega
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Cadastro/Edição de Insumo */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">
                {editingIngredient ? 'Editar Insumo' : 'Cadastrar Novo Insumo'}
              </h2>
              <button onClick={() => setIsModalOpen(false)}>
                <X size={20} color="var(--text-muted)" />
              </button>
            </div>

            <form onSubmit={handleSaveIngredient}>
              <div className="form-group">
                <label className="form-label">Nome do Insumo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Leite Ninho, Forminha Kraft..."
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Categoria</label>
                  <select
                    className="form-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as IngredientCategory)}
                  >
                    <option value="ingrediente">Ingrediente</option>
                    <option value="embalagem">Embalagem / Descartável</option>
                    <option value="outro">Outro Insumo</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Unidade de Compra</label>
                  <select
                    className="form-select"
                    value={purchaseUnit}
                    onChange={(e) => setPurchaseUnit(e.target.value as PurchaseUnit)}
                  >
                    <option value="kg">Quilo (kg)</option>
                    <option value="g">Grama (g)</option>
                    <option value="l">Litro (l)</option>
                    <option value="ml">Mililitro (ml)</option>
                    <option value="un">Unidade (un)</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    Preço de Custo (por {purchaseUnit.toUpperCase()})
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={purchaseUnit === 'kg' ? 'Ex: 5.50 (preço do kg)' : 'Ex: 0.60 (preço unitário)'}
                    className="form-input"
                    value={unitCostPrice}
                    onChange={(e) => setUnitCostPrice(e.target.value)}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {purchaseUnit === 'kg' && 'O sistema calculará automaticamente o custo por grama.'}
                    {purchaseUnit === 'l' && 'O sistema calculará automaticamente o custo por ml.'}
                    {purchaseUnit === 'un' && 'Preço de custo de cada unidade individual.'}
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">Estoque Mínimo para Alerta</label>
                  <input
                    type="text"
                    placeholder="Ex: 500 (em g/ml/un)"
                    className="form-input"
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value)}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Alerta no Dashboard quando o estoque estiver baixo.
                  </span>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingIngredient ? 'Salvar Alterações' : 'Cadastrar Insumo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
