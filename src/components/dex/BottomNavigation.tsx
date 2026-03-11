import { ArrowLeftRight, TrendingUp, Target, Layers, Coins, LayoutDashboard } from 'lucide-react';

export type Tab = 'swap' | 'perpetuals' | 'predictions' | 'bridge' | 'lend' | 'portfolio';

interface BottomNavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const tabs: { id: Tab; label: string; icon: JSX.Element }[] = [
    { id: 'swap', label: 'Swap', icon: <ArrowLeftRight className="w-4 h-4" /> },
    { id: 'perpetuals', label: 'Perps', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'predictions', label: 'Predict', icon: <Target className="w-4 h-4" /> },
    { id: 'bridge', label: 'Bridge', icon: <Layers className="w-4 h-4" /> },
    { id: 'lend', label: 'Lend', icon: <Coins className="w-4 h-4" /> },
    { id: 'portfolio', label: 'Portfolio', icon: <LayoutDashboard className="w-4 h-4" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-3">
      <div className="bg-card/90 backdrop-blur-md rounded-2xl border border-border p-1 max-w-xl mx-auto shadow-lg">
        <div className="grid grid-cols-5 gap-0.5">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  relative flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl transition-all duration-200
                  ${isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  }
                `}
              >
                {tab.icon}
                <span className="text-xs font-medium">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
