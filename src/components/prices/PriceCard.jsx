import Badge from '../ui/Badge';

const PriceCard = ({ commodity, unit, mass, minPrice, maxPrice, avgPrice, category }) => {
  const fmt = (n) => `$${Number(n).toFixed(2)}`;

  const categoryVariant = {
    Vegetables: 'success',
    Fruits: 'gold',
    'Grains & Legumes': 'warning',
    'Livestock & Poultry': 'info',
  }[category] ?? 'default';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 flex flex-col gap-1 shadow-sm">
      <p className="font-bold text-green-primary text-sm leading-tight">{commodity}</p>
      <p className="text-xs text-gray-500">{unit} / {mass}</p>
      <p className="text-sm text-gray-700 mt-1">
        <span className="font-medium">{fmt(minPrice)}</span>
        <span className="mx-1 text-gray-400">—</span>
        <span className="font-medium">{fmt(maxPrice)}</span>
      </p>
      <p className="text-sm font-semibold" style={{ color: '#b99029' }}>
        Avg: {fmt(avgPrice)}
      </p>
      <div className="mt-1">
        <Badge variant={categoryVariant}>{category}</Badge>
      </div>
    </div>
  );
};

export default PriceCard;
