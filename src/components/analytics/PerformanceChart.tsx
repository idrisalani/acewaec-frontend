import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { analyticsService } from '../../services/analytics.service';

interface ChartData {
  date: string;
  score: number;
}

interface SessionData {
  completedAt: string | Date;
  score?: number;
}

export default function PerformanceChart() {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrend();
  }, []);

  const loadTrend = async () => {
    try {
      const trend = await analyticsService.getPerformanceTrend();
      const chartData = trend.map((session: SessionData) => ({
        date: new Date(session.completedAt).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        score: Number(session.score || 0)
      }));
      setData(chartData);
    } catch (error) {
      console.error('Failed to load trend:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-64 rounded"></div>;
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        Complete more sessions to see your progress trend
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis 
          domain={[0, 100]}
          tick={{ fontSize: 12 }}
          label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip 
          contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
          formatter={(value: number) => [`${value.toFixed(1)}%`, 'Score']}
        />
        <Line 
          type="monotone" 
          dataKey="score" 
          stroke="#4F46E5" 
          strokeWidth={2}
          dot={{ fill: '#4F46E5', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}