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
  Edit2,
  Info,
  Layers,
  Image as ImageIcon
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

  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modal de Detalhes da Ficha Técnica
  const [selectedRecipeForDetails, setSelectedRecipeForDetails] = useState<BrownieRecipe | null>(null);

  // Modal de Nova/Editar Receita
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<BrownieRecipe | null>(null);
  const [newRecipeName, setNewRecipeName] = useState('');
  const [newRecipeDesc, setNewRecipeDesc] = useState('');
  const [newSalePrice, setNewSalePrice] = useState('8.00');
  const [newYieldUnits, setNewYieldUnits] = useState('8');
  const [newLaborCost, setNewLaborCost] = useState('1.00');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [recipeItems, setRecipeItems] = useState<RecipeItem[]>([]);

  // Campos temporários para adicionar ingrediente no modal
  const [tempIngId, setTempIngId] = useState(ingredients[0]?.id || '');
  const [tempQty, setTempQty] = useState('');

  const handleProduce = (recipeId: string) => {
    const batches = 1;
    const result = addProduction(recipeId, batches);

    if (result.success) {
      setFeedbackMessage({
        text: `Produção de 1 fornada registrada! Brownies prontos adicionados ao estoque.`,
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
    }, 4500);
  };

  const handleAddItemToRecipe = () => {
    const qty = parseFloat(tempQty.replace(',', '.')) || 0;
    if (!tempIngId || qty <= 0) return;

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
    setNewImageUrl('');
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
    setNewImageUrl(recipe.imageUrl || '');
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
        imageUrl: newImageUrl.trim() || undefined,
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
        imageUrl: newImageUrl.trim() || undefined,
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
          Produção de Brownies
        </h1>
        <p className="page-description">
          Acompanhe o catálogo de sabores, produza fornadas e consulte a ficha técnica de custos detalhada.
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
          Sabores Cadastrados ({brownies.length})
        </h2>
        <button className="btn-primary" onClick={handleOpenCreateRecipe}>
          <Plus size={18} />
          Novo Sabor
        </button>
      </div>

      {/* Grid Clean de Cards dos Brownies */}
      <div className="production-recipes-grid">
        {brownies.map((recipe) => {
          return (
            <div key={recipe.id} className="recipe-card-clean">
              {/* Foto do Brownie */}
              <div className="recipe-image-wrapper">
                {recipe.imageUrl ? (
                  <img 
                    src={recipe.imageUrl} 
                    alt={recipe.name} 
                    className="recipe-image" 
                    onError={(e) => {
                      // Fallback visual se a imagem falhar
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                    <ImageIcon size={40} />
                  </div>
                )}
                <div className="recipe-stock-badge">
                  {recipe.currentStock} prontos
                </div>
              </div>

              {/* Corpo com apenas Nome e Preço */}
              <div className="recipe-body-clean">
                <div>
                  <h3 className="recipe-name-clean">{recipe.name}</h3>
                  <div className="recipe-price-clean">
                    {formatCurrency(recipe.defaultSalePrice)}
                  </div>
                </div>

                {/* Ações: Produzir e Ver Ficha Técnica */}
                <div className="recipe-actions-clean">
                  <button
                    className="btn-produce-clean"
                    onClick={() => handleProduce(recipe.id)}
                    title="Produzir 1 fornada"
                  >
                    <Flame size={15} />
                    Produzir
                  </button>

                  <button
                    className="btn-details-clean"
                    onClick={() => setSelectedRecipeForDetails(recipe)}
                    title="Ver detalhes da receita e custos"
                  >
                    <Info size={15} />
                    Detalhes
                  </button>

                  <button
                    className="btn-details-clean"
                    onClick={() => handleOpenEditRecipe(recipe)}
                    title="Editar Ficha"
                    style={{ padding: '8px 10px' }}
                  >
                    <Edit2 size={15} />
                  </button>

                  <button
                    className="btn-details-clean"
                    onClick={() => handleDeleteRecipe(recipe)}
                    title="Excluir Sabor"
                    style={{ padding: '8px 10px', color: 'var(--color-danger)' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Detalhes da Ficha Técnica */}
      {selectedRecipeForDetails && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={22} color="var(--color-accent)" />
                <h2 className="modal-title">{selectedRecipeForDetails.name}</h2>
              </div>
              <button onClick={() => setSelectedRecipeForDetails(null)}>
                <X size={20} color="var(--text-muted)" />
              </button>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              {selectedRecipeForDetails.description || 'Ficha técnica detalhada com custos unitários e proporções.'}
            </p>

            {(() => {
              const unitCost = getBrownieUnitCost(selectedRecipeForDetails);
              const grossProfit = selectedRecipeForDetails.defaultSalePrice - unitCost;
              const profitMargin = selectedRecipeForDetails.defaultSalePrice > 0 
                ? ((grossProfit / selectedRecipeForDetails.defaultSalePrice) * 100).toFixed(0) 
                : '0';

              return (
                <div>
                  <div className="details-modal-grid">
                    <div className="details-pill">
                      <span className="details-pill-label">Custo Unitário Total</span>
                      <strong className="details-pill-val" style={{ color: 'var(--color-danger)' }}>
                        {formatCurrency(unitCost)}
                      </strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>por fatia</span>
                    </div>

                    <div className="details-pill">
                      <span className="details-pill-label">Preço de Venda</span>
                      <strong className="details-pill-val" style={{ color: 'var(--color-accent)' }}>
                        {formatCurrency(selectedRecipeForDetails.defaultSalePrice)}
                      </strong>
                      <span style={{ fontSize: '0.72rem', color: '#2ed573' }}>
                        Margem: {profitMargin}% (Lucro: {formatCurrency(grossProfit)})
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    <strong>Composição da Fornada ({selectedRecipeForDetails.yieldUnits} fatias):</strong>
                    <span>{selectedRecipeForDetails.items.length} ingredientes</span>
                  </div>

                  <div className="details-items-table">
                    {selectedRecipeForDetails.items.map((item, idx) => {
                      const ing = ingredientsMap.get(item.ingredientId);
                      const costOfItem = ing ? item.quantity * ing.costPerBaseUnit : 0;
                      return (
                        <div key={idx} className="details-item-row">
                          <span>{ing ? ing.name : 'Insumo'}</span>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>
                              {item.quantity} {ing?.baseUnit || ''}
                            </span>
                            <strong>{formatCurrency(costOfItem)}</strong>
                          </div>
                        </div>
                      );
                    })}

                    {(selectedRecipeForDetails.laborCost ?? 0) > 0 && (
                      <div className="details-item-row" style={{ color: 'var(--color-accent)' }}>
                        <span>💼 Mão de Obra por fatia</span>
                        <strong>{formatCurrency(selectedRecipeForDetails.laborCost || 0)}/un</strong>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                    <button
                      className="btn-primary"
                      onClick={() => {
                        handleProduce(selectedRecipeForDetails.id);
                        setSelectedRecipeForDetails(null);
                      }}
                    >
                      <Flame size={16} />
                      Produzir Fornada Agora
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Histórico Recente de Produção */}
      <div className="placeholder-card" style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PackageCheck size={20} color="var(--color-accent)" />
            Histórico de Fornadas
          </h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {productions.length} fornada(s)
          </span>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Brownie</th>
                <th>Qtd Pronta</th>
                <th>Custo Total</th>
                <th>Custo/Fatia</th>
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
                    <td>
                      <strong style={{ color: '#2ed573' }}>
                        +{prod.unitsProduced} un
                      </strong>
                    </td>
                    <td>{formatCurrency(prod.totalCost)}</td>
                    <td>{formatCurrency(prod.unitProductionCost)}/un</td>
                  </tr>
                );
              })}

              {productions.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    Nenhuma fornada registrada ainda. Clique em "Produzir" no card para fabricar brownies!
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
                <label className="form-label">URL da Foto (opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: /images/brownie-tradicional.png ou link web"
                  className="form-input"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Descrição</label>
                <input
                  type="text"
                  placeholder="Ex: Brownie com recheio cremoso artesanal..."
                  className="form-input"
                  value={newRecipeDesc}
                  onChange={(e) => setNewRecipeDesc(e.target.value)}
                />
              </div>

              <div className="form-row form-row-three">
                <div className="form-group">
                  <label className="form-label">Preço de Venda (R$)</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={newSalePrice}
                    onChange={(e) => setNewSalePrice(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Rendimento (Fatias)</label>
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
                  <label className="form-label">
                    Mão de Obra/Fatia (R$)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="1.00"
                    className="form-input"
                    value={newLaborCost}
                    onChange={(e) => setNewLaborCost(e.target.value)}
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-accent)', marginTop: '2px' }}>
                    +R$ 1,00/un exclusivo do brownie
                  </span>
                </div>
              </div>

              {/* Seletor dinâmico de Insumos da Receita - sem estourar laterais */}
              <div className="form-group" style={{ marginTop: 'var(--spacing-sm)' }}>
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Ingredientes & Embalagens consumidos:</span>
                  <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>{recipeItems.length} adicionado(s)</span>
                </label>

                <div className="add-ingredient-box">
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label-sub">Insumo do Estoque:</label>
                    <select
                      className="form-select"
                      value={tempIngId}
                      onChange={(e) => setTempIngId(e.target.value)}
                    >
                      {ingredients.map(ing => (
                        <option key={ing.id} value={ing.id}>
                          {ing.name} ({ing.baseUnit})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="add-ingredient-action-row">
                    <div style={{ flex: 1 }}>
                      <label className="form-label-sub">Quantidade consumida:</label>
                      <input
                        type="text"
                        placeholder="Ex: 150"
                        className="form-input"
                        value={tempQty}
                        onChange={(e) => setTempQty(e.target.value)}
                      />
                    </div>

                    <button
                      type="button"
                      className="btn-primary btn-add-ingredient"
                      onClick={handleAddItemToRecipe}
                    >
                      <Plus size={16} />
                      Adicionar
                    </button>
                  </div>
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
