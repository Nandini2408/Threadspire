import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LabelList
} from 'recharts';

interface ThreadActivityGraphProps {
  data: { month: string; count: number }[];
}

const formatMonth = (month: string) => {
  const [year, m] = month.split('-');
  const date = new Date(Number(year), Number(m) - 1);
  return date.toLocaleString('default', { month: 'short', year: '2-digit' });
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow text-sm">
        <div className="font-semibold">{formatMonth(label)}</div>
        <div>Threads: <span className="font-bold text-yellow-600">{payload[0].value}</span></div>
      </div>
    );
  }
  return null;
};

const ThreadActivityGraph: React.FC<ThreadActivityGraphProps> = ({ data }) => {
  return (
    <div style={{ width: '100%', height: Math.max(200, data.length * 40) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 20, right: 30, left: 40, bottom: 30 }}
          barCategoryGap={20}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis type="number" tick={{ fill: '#888' }} axisLine={false} tickLine={false} />
          <YAxis
            dataKey="month"
            type="category"
            tick={{ fill: '#888' }}
            axisLine={false}
            tickLine={false}
            width={80}
            tickFormatter={formatMonth}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#fef9c3', opacity: 0.3 }} />
          <Bar
            dataKey="count"
            fill="url(#barGradient)"
            radius={[12, 12, 12, 12]}
            isAnimationActive={true}
            animationDuration={800}
          >
            <LabelList dataKey="count" position="right" fill="#b45309" fontWeight={700} fontSize={14} />
          </Bar>
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#fde68a" />
              <stop offset="100%" stopColor="#f59e42" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ThreadActivityGraph; 