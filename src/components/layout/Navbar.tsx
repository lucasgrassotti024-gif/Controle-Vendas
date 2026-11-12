import React from 'react';
import { 
  ShoppingBag, 
  ChefHat, 
  ShoppingCart, 
  Boxes, 
  LayoutDashboard,
  Sparkles
} from 'lucide-react';
import './Navbar.css';

export type PageId = 'vendas' | 'producao' | 'compras' | 'estoque' | 'dashboard';

interface NavbarProps {
  activePage: PageId;
  onPageChange: (page: PageId) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activePage, onPageChange }) => {
  const navItems = [
    { id: 'dashboard' as PageId, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'vendas' as PageId, label: 'Vendas', icon: ShoppingBag },
    { id: 'producao' as PageId, label: 'Produção', icon: ChefHat },
    { id: 'estoque' as PageId, label: 'Estoque', icon: Boxes },
    { id: 'compras' as PageId, label: 'Compras', icon: ShoppingCart },
  ];

  return (
    <header className="header-container">
      <div className="header-brand">
        <div className="brand-logo-badge">
          <Sparkles size={20} color="var(--color-accent)" />
        </div>
        <div className="brand-info">
          <h1 className="brand-title">Brownie Gestão</h1>
          <span className="brand-subtitle">Controle & Custos</span>
        </div>
      </div>

      <nav className="header-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`nav-button ${isActive ? 'nav-button-active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
};
