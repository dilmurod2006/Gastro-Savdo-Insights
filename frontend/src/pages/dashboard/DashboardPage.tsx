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
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        Error loading dashboard data: {error}
      </div>
    );
  }

  // Placeholder data for charts
  const revenueData = [
    { name: 'Jan', value: 4000 },
    { name: 'Feb', value: 3000 },
    { name: 'Mar', value: 2000 },
    { name: 'Apr', value: 2780 },
    { name: 'May', value: 1890 },
    { name: 'Jun', value: 2390 },
    { name: 'Jul', value: 3490 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Business Overview</h1>
          <p className="text-gray-500 dark:text-gray-400">Welcome back, here's what's happening today.</p>
        </div>
      </div>

      {kpiData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Revenue"
            value={`$${kpiData.total_revenue?.toLocaleString()}`}
            icon={DollarSign}
            color="green"
            // trend={12} // Removed explicit trend as it's not in API
          />
          <StatsCard
            title="Total Orders"
            value={kpiData.total_orders?.toLocaleString()}
            icon={ShoppingBag}
            color="blue"
          />
          <StatsCard
            title="Active Customers"
            value={kpiData.active_customers?.toLocaleString()}
            icon={Users}
            color="purple"
          />
          <StatsCard
            title="Avg Order Value"
            value={`$${Math.round(kpiData.avg_order_value || 0)}`}
            icon={TrendingUp}
            color="orange"
          />
          <StatsCard
            title="Freight Costs"
            value={`$${kpiData.freight_costs?.toLocaleString()}`}
            icon={Truck}
            color="blue"
          />
           <StatsCard
            title="On-Time Delivery"
            value={`${(kpiData.on_time_delivery_rate * 100).toFixed(1)}%`}
            icon={Truck}
            color="green"
          />
          <StatsCard
            title="Total Products"
            value={kpiData.total_products}
            icon={Package}
            color="purple"
          />
           <StatsCard
            title="Discontinued"
            value={kpiData.discontinued_products}
            icon={AlertCircle}
            color="orange"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Revenue Trend" description="Monthly revenue performance">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Recent Activity" description="Latest transactions and events">
          <div className="h-[300px] flex items-center justify-center text-gray-500">
             <p>Activity Feed Component Coming Soon</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
