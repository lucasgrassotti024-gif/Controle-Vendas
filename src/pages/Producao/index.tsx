import React, { useState } from 'react';
import { 
  ChefHat, 
  Plus, 
  Flame, 
  PackageCheck, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  X,
  Trash2,
  Edit2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../services/calcService';
import { RecipeItem, BrownieRecipe } from '../../types';
import './Producao.css';

export const ProducaoPage: React.FC = () => {
  const { 
    brownies, 
    ingredients, 
    ingredientsMap, 
    productions, 
    addProduction, 
    getBrownieUnitCost,
    addBrownieRecipe,
    updateBrownieRecipe,
    deleteBrownieRecipe
  } = useApp();

  const [batchesToProduce, setBatchesToProduce] = useState<Record<string, number>>({});
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modal de Nova/Editar Receita
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<BrownieRecipe | null>(null);
  const [newRecipeName, setNewRecipeName] = useState('');
  const [newRecipeDesc, setNewRecipeDesc] = useState('');
  const [newSalePrice, setNewSalePrice] = useState('8.00');
  const [newYieldUnits, setNewYieldUnits] = useState('16');
  const [newLaborCost, setNewLaborCost] = useState('1.00');
  const [recipeItems, setRecipeItems] = useState<RecipeItem[]>([]);

  // Campos temporários para adicionar ingrediente no modal
  const [tempIngId, setTempIngId] = useState(ingredients[0]?.id || '');
  const [tempQty, setTempQty] = useState('');

  const handleBatchesChange = (recipeId: string, val: number) => {
    setBatchesToProduce(prev => ({
      ...prev,
      [recipeId]: Math.max(1, val)
    }));
  };

  const handleProduce = (recipeId: string) => {
    const batches = batchesToProduce[recipeId] || 1;
    const result = addProduction(recipeId, batches);

    if (result.success) {
      setFeedbackMessage({
        text: `Produção registrada com sucesso! Insumos deduzidos e brownies adicionados ao estoque.`,
        type: 'success'
      });
    } else {
      setFeedbackMessage({
        text: result.message || 'Erro ao registrar produção.',
        type: 'error'
      });
    }

    setTimeout(() => {
      setFeedbackMessage(null);
    }, 5000);
  };

  const handleAddItemToRecipe = () => {
    const qty = parseFloat(tempQty.replace(',', '.')) || 0;
    if (!tempIngId || qty <= 0) return;

    // Se já tiver na receita, atualiza a quantidade
    const existing = recipeItems.find(i => i.ingredientId === tempIngId);
    if (existing) {
      setRecipeItems(recipeItems.map(i => 
        i.ingredientId === tempIngId ? { ...i, quantity: i.quantity + qty } : i
      ));
    } else {
      setRecipeItems([...recipeItems, { ingredientId: tempIngId, quantity: qty }]);
    }

    setTempQty('');
  };

  const handleRemoveItemFromRecipe = (ingId: string) => {
    setRecipeItems(recipeItems.filter(i => i.ingredientId !== ingId));
  };

  const handleOpenCreateRecipe = () => {
    setEditingRecipe(null);
    setNewRecipeName('');
    setNewRecipeDesc('');
    setNewSalePrice('8.00');
    setNewYieldUnits('8');
    setNewLaborCost('1.00');
    setRecipeItems([]);
    setIsModalOpen(true);
  };

  const handleOpenEditRecipe = (recipe: BrownieRecipe) => {
    setEditingRecipe(recipe);
    setNewRecipeName(recipe.name);
    setNewRecipeDesc(recipe.description);
    setNewSalePrice(recipe.defaultSalePrice.toFixed(2));
    setNewYieldUnits(recipe.yieldUnits.toString());
    setNewLaborCost((recipe.laborCost ?? 1.00).toFixed(2));
    setRecipeItems([...recipe.items]);
    setIsModalOpen(true);
  };

  const handleDeleteRecipe = (recipe: BrownieRecipe) => {
    if (window.confirm(`Tem certeza de que deseja excluir a receita do brownie "${recipe.name}"?`)) {
      deleteBrownieRecipe(recipe.id);
      setFeedbackMessage({
        text: `Receita "${recipe.name}" excluída com sucesso.`,
        type: 'success'
      });
      setTimeout(() => setFeedbackMessage(null), 4000);
    }
  };

  const handleSaveRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecipeName.trim() || recipeItems.length === 0) return;

    const price = parseFloat(newSalePrice.replace(',', '.')) || 0;
    const yieldCount = parseInt(newYieldUnits, 10) || 8;
    const labor = parseFloat(newLaborCost.replace(',', '.')) || 0;

    if (editingRecipe) {
      updateBrownieRecipe({
        ...editingRecipe,
        name: newRecipeName.trim(),
        description: newRecipeDesc.trim(),
        defaultSalePrice: price,
        yieldUnits: yieldCount,
        laborCost: labor,
        items: recipeItems,
      });
      setFeedbackMessage({
        text: `Receita "${newRecipeName}" atualizada com sucesso!`,
        type: 'success'
      });
    } else {
      addBrownieRecipe({
        name: newRecipeName.trim(),
        description: newRecipeDesc.trim(),
        defaultSalePrice: price,
        minStock: 8,
        yieldUnits: yieldCount,
        laborCost: labor,
        items: recipeItems,
      });
      setFeedbackMessage({
        text: `Receita "${newRecipeName}" criada com sucesso!`,
        type: 'success'
      });
    }

    setTimeout(() => setFeedbackMessage(null), 4000);
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          <ChefHat color="var(--color-accent)" />
          Produção & Fichas Técnicas
        </h1>
        <p className="page-description">
          Gerencie o custo unitário por fatia com base no preço atual dos ingredientes e registre fornadas para abastecer o estoque de brownies prontos.
        </p>
      </div>

      {feedbackMessage && (
        <div style={{
          backgroundColor: feedbackMessage.type === 'success' ? 'rgba(27, 135, 85, 0.15)' : 'rgba(201, 42, 42, 0.15)',
          border: `1px solid ${feedbackMessage.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)'}`,
          color: feedbackMessage.type === 'success' ? '#2ed573' : '#ff6b6b',
          padding: '12px var(--spacing-md)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: 'var(--spacing-lg)',
          fontSize: '0.9rem'
        }}>
          {feedbackMessage.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      <div className="actions-bar">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
          Receitas Cadastradas ({brownies.length})
        </h2>
        <button className="btn-primary" onClick={handleOpenCreateRecipe}>
          <Plus size={18} />
          Nova Receita / Sabor
        </button>
      </div>

      {/* Grid de Fichas Técnicas */}
      <div className="production-recipes-grid">
        {brownies.map((recipe) => {
          const unitCost = getBrownieUnitCost(recipe);
          const batches = batchesToProduce[recipe.id] || 1;
          const grossProfit = recipe.defaultSalePrice - unitCost;
          const profitMargin = recipe.defaultSalePrice > 0 
            ? ((grossProfit / recipe.defaultSalePrice) * 100).toFixed(0) 
            : '0';

          return (
            <div key={recipe.id} className="recipe-card">
              <div>
                <div className="recipe-header">
                  <div>
                    <h3 className="recipe-title">{recipe.name}</h3>
                    <p className="recipe-desc">{recipe.description}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="badge badge-tag">
                      Rende {recipe.yieldUnits} un
                    </span>
                    <button
                      onClick={() => handleOpenEditRecipe(recipe)}
                      title="Editar Ficha Técnica"
                      style={{ color: 'var(--color-accent)', padding: '2px' }}
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDeleteRecipe(recipe)}
                      title="Excluir Receita"
                      style={{ color: 'var(--color-danger)', padding: '2px' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div className="financial-pill-row">
                  <div className="financial-pill">
                    <span className="pill-label">Custo Unitário</span>
                    <strong className="pill-value" style={{ color: 'var(--color-danger)' }}>
                      {formatCurrency(unitCost)}
                    </strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>por fatia</span>
                  </div>

                  <div className="financial-pill">
                    <span className="pill-label">Preço Sugerido</span>
                    <strong className="pill-value" style={{ color: 'var(--color-accent)' }}>
                      {formatCurrency(recipe.defaultSalePrice)}
                    </strong>
                    <span style={{ fontSize: '0.7rem', color: '#2ed573' }}>
                      Margem de {profitMargin}%
                    </span>
                  </div>
                </div>

                <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    Composição da Receita (1 fornada):
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-accent)' }}>
                    {recipe.items.length} insumos
                  </span>
                </div>

                <div className="ingredients-mini-list">
                  {recipe.items.map((item, idx) => {
                    const ing = ingredientsMap.get(item.ingredientId);
                    const costOfItem = ing ? item.quantity * ing.costPerBaseUnit : 0;
                    return (
                      <div key={idx} className="ingredient-mini-row">
                        <span>{ing ? ing.name : 'Insumo'}</span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <span style={{ color: 'var(--text-muted)' }}>
                            {item.quantity} {ing?.baseUnit || ''}
                          </span>
                          <strong style={{ color: 'var(--text-main)' }}>
                            {formatCurrency(costOfItem)}
                          </strong>
                        </div>
                      </div>
                    );
                  })}
                  {(recipe.laborCost ?? 0) > 0 && (
                    <div className="ingredient-mini-row" style={{ color: 'var(--color-accent)' }}>
                      <span>💼 Mão de Obra</span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>1 un/fat</span>
                        <strong>{formatCurrency(recipe.laborCost || 0)}/un</strong>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Caixa de Fabricação */}
              <div className="production-action-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Prontos em Estoque: <strong style={{ color: 'var(--text-main)' }}>{recipe.currentStock} un</strong>
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-accent)' }}>
                    Produzirá: {recipe.yieldUnits * batches} un
                  </span>
                </div>

                <div className="production-controls">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Fornadas:</label>
                    <input
                      type="number"
                      min="1"
                      className="form-input"
                      style={{ width: '64px', padding: '6px 8px', textAlign: 'center' }}
                      value={batches}
                      onChange={(e) => handleBatchesChange(recipe.id, parseInt(e.target.value, 10) || 1)}
                    />
                  </div>

                  <button
                    className="btn-produce"
                    onClick={() => handleProduce(recipe.id)}
                  >
                    <Flame size={16} />
                    Produzir
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Histórico de Produção */}
      <div className="placeholder-card" style={{ marginTop: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PackageCheck size={20} color="var(--color-accent)" />
            Histórico Recente de Produção
          </h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {productions.length} fornada(s) registrada(s)
          </span>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Brownie Produzido</th>
                <th>Fornadas</th>
                <th>Unidades Geradas</th>
                <th>Custo Total</th>
                <th>Custo por Fatia</th>
              </tr>
            </thead>
            <tbody>
              {productions.map((prod) => {
                const recipe = brownies.find(b => b.id === prod.brownieRecipeId);
                const dateStr = new Date(prod.date).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <tr key={prod.id}>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} />
                        {dateStr}
                      </div>
                    </td>
                    <td>
                      <strong>{recipe ? recipe.name : 'Receita'}</strong>
                    </td>
                    <td>{prod.batchesCount} fornada(s)</td>
                    <td>
                      <strong style={{ color: '#2ed573' }}>
                        +{prod.unitsProduced} brownies
                      </strong>
                    </td>
                    <td>{formatCurrency(prod.totalCost)}</td>
                    <td>{formatCurrency(prod.unitProductionCost)}/un</td>
                  </tr>
                );
              })}

              {productions.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    Nenhuma fornada registrada ainda. Clique em "Produzir" no card da receita para gerar brownies prontos!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Criação/Edição de Receita */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingRecipe ? 'Editar Ficha Técnica do Brownie' : 'Cadastrar Novo Sabor de Brownie'}
              </h2>
              <button onClick={() => setIsModalOpen(false)}>
                <X size={20} color="var(--text-muted)" />
              </button>
            </div>

            <form onSubmit={handleSaveRecipe}>
              <div className="form-group">
                <label className="form-label">Nome do Sabor</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Brownie de Doce de Leite com Nozes"
                  className="form-input"
                  value={newRecipeName}
                  onChange={(e) => setNewRecipeName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Descrição</label>
                <input
                  type="text"
                  placeholder="Ex: Brownie com recheio cremoso de doce de leite artesanal..."
                  className="form-input"
                  value={newRecipeDesc}
                  onChange={(e) => setNewRecipeDesc(e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Preço de Venda Sugerido (R$)</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={newSalePrice}
                    onChange={(e) => setNewSalePrice(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Rendimento (Fatias por Fornada)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="form-input"
                    value={newYieldUnits}
                    onChange={(e) => setNewYieldUnits(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Mão de Obra por Fatia (R$)</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 1.00"
                    className="form-input"
                    value={newLaborCost}
                    onChange={(e) => setNewLaborCost(e.target.value)}
                  />
                </div>
              </div>

              {/* Seletor dinâmico de Insumos da Receita */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Ingredientes & Embalagens consumidos na fornada:</span>
                  <span style={{ color: 'var(--color-accent)' }}>{recipeItems.length} adicionados</span>
                </label>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <select
                    className="form-select"
                    style={{ flex: 2 }}
                    value={tempIngId}
                    onChange={(e) => setTempIngId(e.target.value)}
                  >
                    {ingredients.map(ing => (
                      <option key={ing.id} value={ing.id}>
                        {ing.name} (unidade: {ing.baseUnit})
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="Qtd (g/ml/un)"
                    className="form-input"
                    style={{ flex: 1 }}
                    value={tempQty}
                    onChange={(e) => setTempQty(e.target.value)}
                  />

                  <button
                    type="button"
                    className="btn-primary"
                    style={{ padding: '0 16px' }}
                    onClick={handleAddItemToRecipe}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Lista dos insumos já adicionados na receita */}
                <div className="recipe-items-builder">
                  {recipeItems.map((item) => {
                    const ing = ingredientsMap.get(item.ingredientId);
                    return (
                      <div key={item.ingredientId} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '6px 0',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        fontSize: '0.85rem'
                      }}>
                        <span>{ing ? ing.name : 'Insumo'}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <strong>{item.quantity} {ing?.baseUnit || ''}</strong>
                          <button
                            type="button"
                            onClick={() => handleRemoveItemFromRecipe(item.ingredientId)}
                            style={{ color: 'var(--color-danger)' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {recipeItems.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      Adicione os ingredientes e a embalagem necessários para produzir 1 fornada.
                    </div>
                  )}
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
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={recipeItems.length === 0}
                >
                  {editingRecipe ? 'Salvar Alterações da Receita' : 'Salvar Nova Receita'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
