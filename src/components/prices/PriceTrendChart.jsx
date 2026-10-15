import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

const PriceTrendChart = ({ allWeeksData, commodity }) => {
  const chartData = allWeeksData
    .slice()
    .sort((a, b) => a.dateOfIssue?.toMillis?.() - b.dateOfIssue?.toMillis?.())
    .map((week) => {
      const entry = week.prices?.find((p) => p.commodity === commodity);
      if (!entry) return null;
      return {
        label: week.weekLabel,
        avg: entry.avgPrice,
        min: entry.minPrice,
        max: entry.maxPrice,
        band: [entry.minPrice, entry.maxPrice],
      };
    })
    .filter(Boolean);

  if (chartData.length < 2) {
    return (
      <p className="text-sm text-gray-500 text-center py-6">
        More weeks needed to show price trends. Check back as more data is published.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <ComposedChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: '#6b7280' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#6b7280' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `$${v}`}
          label={{ value: 'Price (USD)', angle: -90, position: 'insideLeft', offset: 12, fontSize: 11, fill: '#6b7280' }}
        />
        <Tooltip
          formatter={(value, name) => {
            const labels = { avg: 'Avg', min: 'Min', max: 'Max' };
            return [`$${Number(value).toFixed(2)}`, labels[name] ?? name];
          }}
          labelStyle={{ fontWeight: 600 }}
        />
        <Area
          type="monotone"
          dataKey="max"
          fill="#294d2d"
          fillOpacity={0.12}
          stroke="none"
          legendType="none"
        />
        <Area
          type="monotone"
          dataKey="min"
          fill="#ffffff"
          fillOpacity={1}
          stroke="none"
          legendType="none"
        />
        <Line
          type="monotone"
          dataKey="avg"
          stroke="#b99029"
          strokeWidth={2.5}
          dot={{ r: 4, fill: '#b99029', strokeWidth: 0 }}
          activeDot={{ r: 6 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default PriceTrendChart;
