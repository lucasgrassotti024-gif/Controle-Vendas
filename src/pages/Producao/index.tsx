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
  Layers
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../services/calcService';
import { RecipeItem, BrownieRecipe } from '../../types';
import './Producao.css';

const DEFAULT_IMAGES: Record<string, string> = {
  'brownie-tradicional': '/images/brownie-tradicional.png',
  'brownie-branco': '/images/brownie-branco.png',
  'brownie-ganache': '/images/brownie-ganache.jpg',
};

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

  // Modal de Produzir Fornada (Quem fez: Eu ou Outra Pessoa)
  const [producingRecipe, setProducingRecipe] = useState<BrownieRecipe | null>(null);
  const [productionAuthor, setProductionAuthor] = useState<'proprio' | 'terceiro'>('proprio');
  const [productionBatches, setProductionBatches] = useState<number>(1);

  const handleOpenProduceModal = (recipe: BrownieRecipe) => {
    setProducingRecipe(recipe);
    setProductionAuthor('proprio'); // Padrão: Eu fiz (sem mão de obra)
    setProductionBatches(1);
  };

  const handleConfirmProduce = () => {
    if (!producingRecipe) return;

    const result = addProduction(producingRecipe.id, productionBatches, productionAuthor);

    if (result.success) {
      const units = producingRecipe.yieldUnits * productionBatches;
      const authorText = productionAuthor === 'proprio' ? 'Produção própria (sem custo de mão de obra)' : 'Feito por outra pessoa (+R$ 1,00/un mão de obra)';
      setFeedbackMessage({
        text: `Fornada de ${producingRecipe.name} registrada com sucesso! (+${units} brownies prontos). ${authorText}.`,
        type: 'success'
      });
      setProducingRecipe(null);
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
                {(() => {
                  const fallback = DEFAULT_IMAGES[recipe.id] || '/images/brownie-tradicional.png';
                  const initialSrc = recipe.imageUrl || fallback;
                  return (
                    <img 
                      src={initialSrc} 
                      alt={recipe.name} 
                      className="recipe-image"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.src.includes('brownie-tradicional.png')) {
                          target.src = '/images/brownie-tradicional.png';
                        }
                      }}
                    />
                  );
                })()}
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
                  <div className="recipe-actions-primary">
                    <button
                      className="btn-produce-clean"
                      onClick={() => handleOpenProduceModal(recipe)}
                      title="Produzir fornada"
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
                  </div>

                  <div className="recipe-actions-secondary">
                    <button
                      className="btn-action-icon"
                      onClick={() => handleOpenEditRecipe(recipe)}
                      title="Editar Ficha Técnica"
                    >
                      <Edit2 size={15} />
                      <span>Editar</span>
                    </button>

                    <button
                      className="btn-action-icon btn-action-delete"
                      onClick={() => handleDeleteRecipe(recipe)}
                      title="Excluir Sabor"
                    >
                      <Trash2 size={15} />
                      <span>Excluir</span>
                    </button>
                  </div>
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
                        const target = selectedRecipeForDetails;
                        setSelectedRecipeForDetails(null);
                        handleOpenProduceModal(target);
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
                <th>Feito Por</th>
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

                const isThirdParty = prod.producedBy === 'terceiro';

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
                      {isThirdParty ? (
                        <span style={{
                          backgroundColor: 'rgba(224, 159, 62, 0.15)',
                          color: 'var(--color-accent)',
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          💼 Outra Pessoa (+{formatCurrency(prod.laborCostTotal || 0)})
                        </span>
                      ) : (
                        <span style={{
                          backgroundColor: 'rgba(46, 213, 115, 0.15)',
                          color: '#2ed573',
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}>
                          👨‍🍳 Eu Mesmo (Sem mão de obra)
                        </span>
                      )}
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
                  <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    Nenhuma fornada registrada ainda. Clique em "Produzir" no card para fabricar brownies!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Produzir Fornada (Quem produziu: Eu ou Outra Pessoa) */}
      {producingRecipe && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Flame size={22} color="var(--color-accent)" />
                <h2 className="modal-title">Produzir {producingRecipe.name}</h2>
              </div>
              <button onClick={() => setProducingRecipe(null)}>
                <X size={20} color="var(--text-muted)" />
              </button>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Ao registrar a fornada, os ingredientes serão deduzidos da despensa e as unidades prontas entrarão no estoque.
            </p>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Quantidade de Fornadas:</label>
              <input
                type="number"
                min="1"
                className="form-input"
                value={productionBatches}
                onChange={(e) => setProductionBatches(Math.max(1, parseInt(e.target.value, 10) || 1))}
              />
              <span style={{ fontSize: '0.78rem', color: '#2ed573', marginTop: '4px' }}>
                Total a produzir: {producingRecipe.yieldUnits * productionBatches} unidades
              </span>
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label" style={{ fontWeight: 700 }}>
                Quem fez essa fornada?
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
                {/* Opção 1: Eu Fiz (Sem custo de mão de obra) */}
                <label 
                  onClick={() => setProductionAuthor('proprio')}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '12px var(--spacing-md)',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${productionAuthor === 'proprio' ? 'var(--color-accent)' : 'var(--border-subtle)'}`,
                    backgroundColor: productionAuthor === 'proprio' ? 'rgba(224, 159, 62, 0.08)' : 'var(--bg-app)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <input
                    type="radio"
                    name="author"
                    checked={productionAuthor === 'proprio'}
                    onChange={() => setProductionAuthor('proprio')}
                    style={{ marginTop: '3px' }}
                  />
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.92rem', color: 'var(--text-main)' }}>
                      👨‍🍳 Eu Mesmo Fiz
                    </strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Não gasta mão de obra. Custo = apenas ingredientes ({formatCurrency(getBrownieUnitCost(producingRecipe, false))}/un).
                    </span>
                  </div>
                </label>

                {/* Opção 2: Outra Pessoa Fez (+R$ 1,00/un mão de obra) */}
                <label 
                  onClick={() => setProductionAuthor('terceiro')}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '12px var(--spacing-md)',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${productionAuthor === 'terceiro' ? 'var(--color-accent)' : 'var(--border-subtle)'}`,
                    backgroundColor: productionAuthor === 'terceiro' ? 'rgba(224, 159, 62, 0.08)' : 'var(--bg-app)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <input
                    type="radio"
                    name="author"
                    checked={productionAuthor === 'terceiro'}
                    onChange={() => setProductionAuthor('terceiro')}
                    style={{ marginTop: '3px' }}
                  />
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.92rem', color: 'var(--text-main)' }}>
                      💼 Outra Pessoa Fez
                    </strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Gasta mão de obra de +{formatCurrency(producingRecipe.laborCost || 1.00)}/unidade (Total de mão de obra: {formatCurrency((producingRecipe.laborCost || 1.00) * producingRecipe.yieldUnits * productionBatches)}).
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Resumo financeiro da fornada */}
            <div style={{
              backgroundColor: 'var(--bg-app)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '12px var(--spacing-md)',
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Custo por Brownie
                </span>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-accent)' }}>
                  {formatCurrency(getBrownieUnitCost(producingRecipe, productionAuthor === 'terceiro'))}/un
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Custo Total da Fornada
                </span>
                <div style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                  {formatCurrency(getBrownieUnitCost(producingRecipe, productionAuthor === 'terceiro') * producingRecipe.yieldUnits * productionBatches)}
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setProducingRecipe(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleConfirmProduce}
              >
                <Flame size={16} />
                Confirmar Produção
              </button>
            </div>
          </div>
        </div>
      )}

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
