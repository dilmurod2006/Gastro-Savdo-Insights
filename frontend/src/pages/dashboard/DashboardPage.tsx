import { useBusinessKPIs } from '@/hooks/useAnalytics';
import { StatsCard } from '@/components/ui/StatsCard';
import { Loading } from '@/components/ui/Loading';
import { Card } from '@/components/ui/Card';
import { 
  ShoppingBag, 
  DollarSign, 
  Users, 
  Package, 
  TrendingUp, 
  Truck,
  AlertCircle 
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export function DashboardPage() {
  const { data: kpiData, loading, error } = useBusinessKPIs();

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
        Ma'lumotlarni yuklashda xatolik: {error}
      </div>
    );
  }

  // Placeholder data for charts
  const revenueData = [
    { name: 'Yan', value: 4000 },
    { name: 'Fev', value: 3000 },
    { name: 'Mar', value: 2000 },
    { name: 'Apr', value: 2780 },
    { name: 'May', value: 1890 },
    { name: 'Iyn', value: 2390 },
    { name: 'Iyl', value: 3490 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Biznes ko'rsatkichlari</h1>
          <p className="text-gray-500 dark:text-gray-400">Xush kelibsiz, bugungi holatni ko'rib chiqing.</p>
        </div>
      </div>

      {kpiData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Umumiy daromad"
            value={`$${kpiData.total_revenue?.toLocaleString()}`}
            icon={DollarSign}
            color="green"
          />
          <StatsCard
            title="Jami buyurtmalar"
            value={kpiData.total_orders?.toLocaleString()}
            icon={ShoppingBag}
            color="blue"
          />
          <StatsCard
            title="Faol mijozlar"
            value={kpiData.active_customers?.toLocaleString()}
            icon={Users}
            color="purple"
          />
          <StatsCard
            title="O'rtacha buyurtma qiymati"
            value={`$${Math.round(kpiData.avg_order_value || 0)}`}
            icon={TrendingUp}
            color="orange"
          />
          <StatsCard
            title="Yuk tashish xarajatlari"
            value={`$${kpiData.freight_costs?.toLocaleString()}`}
            icon={Truck}
            color="blue"
          />
          <StatsCard
            title="O'z vaqtida yetkazish"
            value={`${(kpiData.on_time_delivery_rate * 100).toFixed(1)}%`}
            icon={Truck}
            color="green"
          />
          <StatsCard
            title="Jami mahsulotlar"
            value={kpiData.total_products}
            icon={Package}
            color="purple"
          />
          <StatsCard
            title="To'xtatilgan"
            value={kpiData.discontinued_products}
            icon={AlertCircle}
            color="orange"
          />
        </div>
      )}

      {kpiData && (
        <div className="grid grid-cols-1 gap-6">
          <Card title="Daromad tendensiyasi" description="Oylik daromad ko'rsatkichlari">
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                              Oy: {label}
                            </p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              Daromad: <span className="text-emerald-500">${payload[0].value?.toLocaleString()}</span>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3b82f6" 
                    strokeWidth={3} 
                    dot={{ r: 4 }} 
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}