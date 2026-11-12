import { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/layout/Layout';
import { PageId } from './components/layout/Navbar';
import { DashboardPage } from './pages/Dashboard';
import { VendasPage } from './pages/Vendas';
import { ProducaoPage } from './pages/Producao';
import { EstoquePage } from './pages/Estoque';
import { ComprasPage } from './pages/Compras';

export function App() {
  const [activePage, setActivePage] = useState<PageId>('dashboard');

  const renderCurrentPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'vendas':
        return <VendasPage />;
      case 'producao':
        return <ProducaoPage />;
      case 'estoque':
        return <EstoquePage />;
      case 'compras':
        return <ComprasPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <AppProvider>
      <Layout activePage={activePage} onPageChange={setActivePage}>
        {renderCurrentPage()}
      </Layout>
    </AppProvider>
  );
}

export default App;
