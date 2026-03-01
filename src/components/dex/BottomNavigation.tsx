import { ArrowLeftRight, BarChart3, Target, Landmark, Coins, LayoutDashboard } from 'lucide-react';

export type Tab = 'swap' | 'perpetuals' | 'predictions' | 'bridge' | 'lend' | 'portfolio';

interface BottomNavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'swap', label: 'Swap', icon: <ArrowLeftRight className="w-5 h-5" /> },
  { id: 'perpetuals', label: 'Perps', icon: <BarChart3 className="w-5 h-5" /> },
  { id: 'predictions', label: 'Predict', icon: <Target className="w-5 h-5" /> },
  { id: 'bridge', label: 'Bridge', icon: <Landmark className="w-5 h-5" /> },
  { id: 'lend', label: 'Lend', icon: <Coins className="w-5 h-5" /> },
  { id: 'portfolio', label: 'Portfolio', icon: <LayoutDashboard className="w-5 h-5" /> },
];

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border z-50">
      <div className="flex items-center justify-around max-w-md mx-auto py-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
              activeTab === tab.id
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.icon}
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
