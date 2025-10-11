import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface DifficultyData {
  easyCorrect: number;
  easyTotal: number;
  mediumCorrect: number;
  mediumTotal: number;
  hardCorrect: number;
  hardTotal: number;
}

interface Props {
  data: DifficultyData;
}

interface ChartDataItem {
  name: string;
  value: number;
  total: number;
  correct: number;
  [key: string]: string | number; // Add index signature for Recharts compatibility
}

export default function DifficultyBreakdown({ data }: Props) {
  const chartData: ChartDataItem[] = [
    {
      name: 'Easy',
      value: data.easyTotal > 0 ? (data.easyCorrect / data.easyTotal) * 100 : 0,
      total: data.easyTotal,
      correct: data.easyCorrect
    },
    {
      name: 'Medium',
      value: data.mediumTotal > 0 ? (data.mediumCorrect / data.mediumTotal) * 100 : 0,
      total: data.mediumTotal,
      correct: data.mediumCorrect
    },
    {
      name: 'Hard',
      value: data.hardTotal > 0 ? (data.hardCorrect / data.hardTotal) * 100 : 0,
      total: data.hardTotal,
      correct: data.hardCorrect
    }
  ].filter(item => item.total > 0);

  const COLORS = ['#10B981', '#F59E0B', '#EF4444'];

  if (chartData.length === 0) {
    return <p className="text-gray-600 text-sm">No difficulty data available</p>;
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(props) => {
              const { name, value } = props;
              return `${name}: ${Number(value).toFixed(0)}%`;
            }}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value, name, props) => {
              const payload = props.payload as ChartDataItem;
              return [
                `${Number(value).toFixed(1)}% (${payload.correct}/${payload.total})`,
                name
              ];
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      
      <div className="grid grid-cols-3 gap-2 mt-4">
        {chartData.map((item, idx) => (
          <div key={idx} className="text-center p-2 bg-gray-50 rounded">
            <p className="text-xs text-gray-600">{item.name}</p>
            <p className="text-sm font-bold" style={{ color: COLORS[idx] }}>
              {item.correct}/{item.total}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}