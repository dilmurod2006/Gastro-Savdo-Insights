import { useState } from 'react';
import { useABCAnalysis } from '@/hooks';
import { Table } from '@/components/ui/Table';
import { Card } from '@/components/ui/Card';
import { ABCAnalysisProduct } from '@/types/analytics.types';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, Package, TrendingUp, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ABCAnalysisPage() {
  const navigate = useNavigate();
  const { data, loading, error } = useABCAnalysis();
  const [selectedClass, setSelectedClass] = useState<'all' | 'A' | 'B' | 'C'>('all');

  // Calculate summary stats - use startsWith to avoid "Bottom" matching "B"
  const classA = data?.filter((p: ABCAnalysisProduct) => p.abc_category.startsWith('A')) || [];
  const classB = data?.filter((p: ABCAnalysisProduct) => p.abc_category.startsWith('B')) || [];
  const classC = data?.filter((p: ABCAnalysisProduct) => p.abc_category.startsWith('C')) || [];

  const classARevenue = classA.reduce((sum, p) => sum + p.total_revenue, 0);
  const classBRevenue = classB.reduce((sum, p) => sum + p.total_revenue, 0);
  const classCRevenue = classC.reduce((sum, p) => sum + p.total_revenue, 0);
  const totalRevenue = classARevenue + classBRevenue + classCRevenue;

  // Filter data based on selected class
  const filteredData = selectedClass === 'all' 
    ? data 
    : data?.filter((p: ABCAnalysisProduct) => p.abc_category.startsWith(selectedClass)) || [];

  const columns = [
    {
      key: 'revenue_rank',
      header: '#',
      width: '5%',
      align: 'center' as const,
      render: (value: unknown) => (
        <span className="font-bold text-gray-500 dark:text-gray-400">{Number(value)}</span>
      )
    },
    {
      key: 'product_name',
      header: 'Product Name',
      width: '25%',
      render: (value: unknown) => (
        <span className="font-semibold text-gray-900 dark:text-white">{String(value)}</span>
      )
    },
    {
      key: 'category_name',
      header: 'Category',
      width: '15%',
      render: (value: unknown) => (
        <span className="text-gray-600 dark:text-gray-300">{String(value) || '—'}</span>
      )
    },
    {
      key: 'total_revenue',
      header: 'Revenue',
      width: '15%',
      align: 'right' as const,
      render: (value: unknown) => (
        <span className="font-bold text-emerald-500">
          ${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      )
    },
    {
      key: 'revenue_percentage',
      header: '% Share',
      width: '12%',
      align: 'right' as const,
      render: (value: unknown) => (
        <span className="font-medium text-gray-700 dark:text-gray-300">
          {Number(value).toFixed(2)}%
        </span>
      )
    },
    {
      key: 'cumulative_percentage',
      header: 'Cumulative',
      width: '15%',
      align: 'right' as const,
      render: (value: unknown) => {
        const percent = Number(value);
        return (
          <div className="flex items-center justify-end gap-2">
            <span className="text-gray-500 dark:text-gray-400 min-w-[50px] text-right">
              {percent.toFixed(1)}%
            </span>
            <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary-500 rounded-full transition-all duration-300" 
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      }
    },
    {
      key: 'abc_category',
      header: 'Class',
      width: '13%',
      align: 'center' as const,
      render: (value: unknown) => {
        const category = String(value);
        // Check start of string to avoid "Bottom" matching "B"
        const isA = category.startsWith('A');
        const isB = category.startsWith('B');
        const isC = category.startsWith('C');
        
        const variant = isA ? 'success' : isB ? 'warning' : 'default';
        const label = isA ? 'A' : isB ? 'B' : 'C';
        
        return (
          <Badge variant={variant} className="px-3">
            {label}
          </Badge>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ABC Analysis</h1>
            <p className="text-gray-500 dark:text-gray-400">Inventory classification based on revenue impact</p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="success">Class A</Badge>
                <span className="text-xs text-gray-500">Vital Few</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{classA.length} products</p>
              <p className="text-sm text-emerald-500 font-medium mt-1">
                ${(classARevenue / 1000).toFixed(0)}K ({totalRevenue > 0 ? ((classARevenue / totalRevenue) * 100).toFixed(1) : 0}%)
              </p>
            </div>
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl">
              <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
            High priority. Strict inventory control required.
          </p>
        </Card>

        <Card className="p-5 border-l-4 border-l-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="warning">Class B</Badge>
                <span className="text-xs text-gray-500">Moderate</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{classB.length} products</p>
              <p className="text-sm text-yellow-600 font-medium mt-1">
                ${(classBRevenue / 1000).toFixed(0)}K ({totalRevenue > 0 ? ((classBRevenue / totalRevenue) * 100).toFixed(1) : 0}%)
              </p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-xl">
              <BarChart3 className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
            Medium priority. Moderate controls needed.
          </p>
        </Card>

        <Card className="p-5 border-l-4 border-l-gray-400">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="default">Class C</Badge>
                <span className="text-xs text-gray-500">Trivial Many</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{classC.length} products</p>
              <p className="text-sm text-gray-600 font-medium mt-1">
                ${(classCRevenue / 1000).toFixed(0)}K ({totalRevenue > 0 ? ((classCRevenue / totalRevenue) * 100).toFixed(1) : 0}%)
              </p>
            </div>
            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
              <Package className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
            Low priority. Bulk ordering recommended.
          </p>
        </Card>
      </div>

      {/* Revenue Distribution Visual */}
      <Card className="p-5 overflow-visible">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-6">Revenue Distribution by Class</h3>
        <div className="flex h-10 rounded-full overflow-visible">
          {/* Class A */}
          <div 
            className="bg-emerald-500 flex items-center justify-center text-sm font-bold text-white cursor-pointer hover:bg-emerald-600 transition-colors relative group first:rounded-l-full"
            style={{ width: `${totalRevenue > 0 ? (classARevenue / totalRevenue) * 100 : 0}%` }}
          >
            A
            {/* Tooltip */}
            <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-3 bg-gray-900 dark:bg-gray-800 text-white text-sm rounded-xl shadow-2xl z-[100] min-w-[160px]">
              <div className="font-bold text-emerald-400 text-base mb-2">Class A</div>
              <div className="text-gray-400 text-xs mb-1">Vital Few</div>
              <div className="text-gray-300 text-sm">{classA.length} products</div>
              <div className="text-white font-semibold text-sm">${classARevenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
              <div className="text-emerald-400 font-bold text-xl mt-1">{((classARevenue / totalRevenue) * 100).toFixed(1)}%</div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
            </div>
          </div>
          {/* Class B */}
          <div 
            className="bg-yellow-500 flex items-center justify-center text-sm font-bold text-white cursor-pointer hover:bg-yellow-600 transition-colors relative group"
            style={{ width: `${totalRevenue > 0 ? (classBRevenue / totalRevenue) * 100 : 0}%` }}
          >
            B
            {/* Tooltip */}
            <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-3 bg-gray-900 dark:bg-gray-800 text-white text-sm rounded-xl shadow-2xl z-[100] min-w-[160px]">
              <div className="font-bold text-yellow-400 text-base mb-2">Class B</div>
              <div className="text-gray-400 text-xs mb-1">Moderate</div>
              <div className="text-gray-300 text-sm">{classB.length} products</div>
              <div className="text-white font-semibold text-sm">${classBRevenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
              <div className="text-yellow-400 font-bold text-xl mt-1">{((classBRevenue / totalRevenue) * 100).toFixed(1)}%</div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
            </div>
          </div>
          {/* Class C */}
          <div 
            className="bg-gray-400 flex items-center justify-center text-sm font-bold text-white cursor-pointer hover:bg-gray-500 transition-colors relative group last:rounded-r-full"
            style={{ width: `${totalRevenue > 0 ? (classCRevenue / totalRevenue) * 100 : 0}%` }}
          >
            C
            {/* Tooltip */}
            <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-3 bg-gray-900 dark:bg-gray-800 text-white text-sm rounded-xl shadow-2xl z-[100] min-w-[160px]">
              <div className="font-bold text-gray-300 text-base mb-2">Class C</div>
              <div className="text-gray-400 text-xs mb-1">Trivial Many</div>
              <div className="text-gray-300 text-sm">{classC.length} products</div>
              <div className="text-white font-semibold text-sm">${classCRevenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
              <div className="text-gray-300 font-bold text-xl mt-1">{((classCRevenue / totalRevenue) * 100).toFixed(1)}%</div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
            </div>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Product Classification</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selectedClass === 'all' 
                ? `All ${data?.length || 0} products ranked by revenue` 
                : `Class ${selectedClass}: ${filteredData?.length || 0} products`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Filter:</span>
            <div className="flex gap-1">
              <button
                onClick={() => setSelectedClass('all')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  selectedClass === 'all' 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedClass('A')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  selectedClass === 'A' 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
                }`}
              >
                A ({classA.length})
              </button>
              <button
                onClick={() => setSelectedClass('B')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  selectedClass === 'B' 
                    ? 'bg-yellow-500 text-white' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
                }`}
              >
                B ({classB.length})
              </button>
              <button
                onClick={() => setSelectedClass('C')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  selectedClass === 'C' 
                    ? 'bg-gray-500 text-white' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                C ({classC.length})
              </button>
            </div>
          </div>
        </div>
        {error ? (
          <div className="p-8 text-center text-red-500">
            Error loading data: {error}
          </div>
        ) : (
          <Table<ABCAnalysisProduct>
            columns={columns}
            data={filteredData || []}
            loading={loading}
            emptyMessage="No analysis data found"
          />
        )}
      </Card>
    </div>
  );
}
