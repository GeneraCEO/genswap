import { X } from 'lucide-react';

interface ChartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChartModal({ isOpen, onClose }: ChartModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-4xl bg-gray-900 border-2 border-indigo-500 rounded-2xl p-6 text-white max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Price Chart</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-800 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700 h-96 flex flex-col items-center justify-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-bold mb-2">Trading Chart</h3>
          <p className="text-gray-400 text-center max-w-md">
            Real-time price charts and advanced trading analytics coming soon.
            Track your favorite token pairs with technical indicators.
          </p>
        </div>

        <div className="mt-6 flex gap-2 flex-wrap">
          {['1H', '4H', '1D', '1W', '1M'].map((tf, i) => (
            <button
              key={tf}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                i === 0 ? 'bg-indigo-500 hover:bg-indigo-600' : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
