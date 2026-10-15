import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Search, ChevronUp, ChevronDown, ChevronsUpDown, X } from 'lucide-react';
import { db } from '../firebase';
import Spinner from '../components/ui/Spinner';
import Badge from '../components/ui/Badge';
import PriceTrendChart from '../components/prices/PriceTrendChart';

const MARKETS = [
  { id: 'mbare-musika',          label: 'Mbare Musika',      city: 'Harare' },
  { id: 'fifth-avenue-bulawayo', label: '5th Ave Bulawayo',  city: 'Bulawayo' },
  { id: 'chikwanha-chitungwiza', label: 'Chikwanha',         city: 'Chitungwiza' },
  { id: 'kudzanayi-gweru',       label: 'Kudzanayi',         city: 'Gweru' },
  { id: 'lusaka-market-harare',  label: 'Lusaka Market',     city: 'Harare' },
];

const CATEGORIES = ['All', 'Vegetables', 'Fruits', 'Grains & Legumes', 'Livestock & Poultry', 'Other'];

const COLS = [
  { key: 'commodity', label: 'Commodity' },
  { key: 'unit',      label: 'Unit' },
  { key: 'mass',      label: 'Mass' },
  { key: 'minPrice',  label: 'Min Price' },
  { key: 'maxPrice',  label: 'Max Price' },
  { key: 'avgPrice',  label: 'Avg Price' },
];

const PriceIndex = () => {
  const [markets, setMarkets] = useState([]);
  const [selectedMarket, setSelectedMarket] = useState('mbare-musika');
  const [allWeeks, setAllWeeks] = useState([]);
  const [selectedWeekId, setSelectedWeekId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCommodity, setSelectedCommodity] = useState('');
  const [loading, setLoading] = useState(true);
  const [weeksLoading, setWeeksLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState('commodity');
  const [sortDir, setSortDir] = useState('asc');

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const snap = await getDocs(collection(db, 'produce-markets'));
        setMarkets(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error('produce-markets fetch failed:', e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMarkets();
  }, []);

  useEffect(() => {
    const fetchWeeks = async () => {
      setWeeksLoading(true);
      setAllWeeks([]);
      setSelectedWeekId('');
      setSelectedCommodity('');
      setSearch('');
      try {
        const snap = await getDocs(
          query(collection(db, 'markets-prices', selectedMarket, 'weeks'), orderBy('dateOfIssue', 'desc'))
        );
        const weeks = snap.docs.map((d) => ({ weekId: d.id, ...d.data() }));
        setAllWeeks(weeks);
        if (weeks.length > 0) {
          setSelectedWeekId(weeks[0].weekId);
          setSelectedCommodity(weeks[0].prices?.[0]?.commodity ?? '');
        }
      } catch (e) {
        console.error('markets-prices fetch failed:', e.message);
      } finally {
        setWeeksLoading(false);
      }
    };
    fetchWeeks();
  }, [selectedMarket]);

  const selectedWeek = allWeeks.find((w) => w.weekId === selectedWeekId);
  const filteredPrices =
    selectedWeek?.prices?.filter(
      (p) => selectedCategory === 'All' || p.category === selectedCategory
    ) ?? [];

  const displayedPrices = (() => {
    let list = filteredPrices;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.commodity.toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => {
      const va = typeof a[sortCol] === 'string' ? a[sortCol].toLowerCase() : a[sortCol];
      const vb = typeof b[sortCol] === 'string' ? b[sortCol].toLowerCase() : b[sortCol];
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  })();

  const commodityList = [
    ...new Set(allWeeks.flatMap((w) => w.prices?.map((p) => p.commodity) ?? [])),
  ].sort();

  const marketInfo = markets.find((m) => m.id === selectedMarket);

  const handleSort = (col) => {
    if (sortCol === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortCol(col); setSortDir('asc'); }
  };

  const SortIcon = ({ col }) => {
    if (sortCol !== col) return <ChevronsUpDown size={11} className="opacity-40 shrink-0" />;
    return sortDir === 'asc' ? <ChevronUp size={11} className="shrink-0" /> : <ChevronDown size={11} className="shrink-0" />;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]" style={{ backgroundColor: 'var(--color-surface)' }}>
        <Spinner size="lg" color="green" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-surface)' }}>
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">

        <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Price Index
        </h1>

        {/* Market tabs */}
        <div className="overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex gap-2 min-w-max">
            {MARKETS.map((m) => (
              <button
                key={m.id}
                onClick={() => { setSelectedMarket(m.id); setSelectedCategory('All'); }}
                className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border"
                style={
                  selectedMarket === m.id
                    ? { background: 'var(--gradient-gold)', color: '#1a1a1a', border: 'none', boxShadow: '0 4px 12px rgba(200,168,75,0.3)' }
                    : { backgroundColor: 'var(--color-surface-2)', color: 'var(--color-text-secondary)', borderColor: 'var(--color-border)' }
                }
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Week selector */}
        <div className="flex items-center gap-3">
          {weeksLoading ? (
            <Spinner size="sm" color="green" />
          ) : allWeeks.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              No price data published for this market yet.
            </p>
          ) : (
            <>
              <label className="text-sm font-medium whitespace-nowrap" style={{ color: 'var(--color-text-secondary)' }}>
                Week:
              </label>
              <select
                value={selectedWeekId}
                onChange={(e) => setSelectedWeekId(e.target.value)}
                className="rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 border transition-colors"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                  borderColor: 'var(--color-border)',
                }}
              >
                {allWeeks.map((w, i) => (
                  <option key={w.weekId} value={w.weekId}>
                    {w.weekLabel}{i === 0 ? ' (latest)' : ''}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>

        {allWeeks.length > 0 && selectedWeek && (
          <>
            {/* Category filter pills */}
            <div className="overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="flex gap-2 min-w-max">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium transition-all border"
                    style={
                      selectedCategory === cat
                        ? { background: 'var(--gradient-gold)', color: '#1a1a1a', border: 'none' }
                        : { backgroundColor: 'var(--color-surface-2)', color: 'var(--color-text-secondary)', borderColor: 'var(--color-border)' }
                    }
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Search bar */}
            <div className="relative w-full sm:max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                placeholder="Search commodity..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                  borderColor: 'var(--color-border)',
                }}
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X size={13} style={{ color: 'var(--color-text-muted)' }} />
                </button>
              )}
            </div>

            {/* Price table */}
            {displayedPrices.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
                {search
                  ? `No commodities match "${search}".`
                  : `No ${selectedCategory !== 'All' ? `${selectedCategory} ` : ''}prices available for this week.`}
              </p>
            ) : (
              <div className="glass-card overflow-hidden overflow-x-auto">
                <table className="w-full text-sm min-w-[520px]">
                  <thead className="sticky top-0 z-20">
                    <tr style={{ background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary-light) 100%)' }}>
                      {COLS.map((col, i) => (
                        <th
                          key={col.key}
                          onClick={() => handleSort(col.key)}
                          className={`px-4 py-3 text-left text-xs font-semibold cursor-pointer select-none whitespace-nowrap text-cream/90 hover:text-cream transition-colors uppercase tracking-wide ${
                            i === 0 ? 'sticky left-0 z-30' : ''
                          }`}
                          style={i === 0 ? { backgroundColor: 'var(--color-primary)' } : undefined}
                        >
                          <span className="flex items-center gap-1">
                            {col.label} <SortIcon col={col.key} />
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {displayedPrices.map((p, i) => (
                      <tr
                        key={`${p.commodity}-${i}`}
                        className="border-b transition-colors hover:border-l-2 hover:border-l-gold/50"
                        style={{
                          backgroundColor: i % 2 === 0 ? 'var(--color-surface)' : 'var(--color-surface-2)',
                          borderColor: 'var(--color-border)',
                        }}
                      >
                        <td
                          className="sticky left-0 z-10 px-4 py-2.5 font-semibold text-sm"
                          style={{
                            backgroundColor: i % 2 === 0 ? 'var(--color-surface)' : 'var(--color-surface-2)',
                            color: 'var(--color-text-primary)',
                          }}
                        >
                          {p.commodity}
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap" style={{ color: 'var(--color-text-secondary)' }}>{p.unit}</td>
                        <td className="px-4 py-2.5 whitespace-nowrap" style={{ color: 'var(--color-text-secondary)' }}>{p.mass}</td>
                        <td className="px-4 py-2.5" style={{ color: 'var(--color-text-primary)' }}>${p.minPrice.toFixed(2)}</td>
                        <td className="px-4 py-2.5" style={{ color: 'var(--color-text-primary)' }}>${p.maxPrice.toFixed(2)}</td>
                        <td className="px-4 py-2.5 font-semibold gradient-text">${p.avgPrice.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Price trend chart */}
            <div className="glass-card p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <h2 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  Price History
                </h2>
                {commodityList.length > 0 && (
                  <select
                    value={selectedCommodity}
                    onChange={(e) => setSelectedCommodity(e.target.value)}
                    className="rounded-xl px-3 py-1.5 text-sm border focus:outline-none focus:ring-2 focus:ring-gold/50 transition-colors"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-text-primary)',
                      borderColor: 'var(--color-border)',
                    }}
                  >
                    {commodityList.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                )}
              </div>
              {selectedCommodity ? (
                <PriceTrendChart allWeeksData={allWeeks} commodity={selectedCommodity} />
              ) : (
                <p className="text-sm text-center py-6" style={{ color: 'var(--color-text-muted)' }}>
                  Select a commodity to view price history.
                </p>
              )}
            </div>
          </>
        )}

        {/* Market info footer */}
        {marketInfo && (
          <div className="glass-card p-5 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>
                {marketInfo.name}
              </h3>
              <Badge variant="info">{marketInfo.type?.replace(/-/g, ' ')}</Badge>
            </div>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {marketInfo.city}, {marketInfo.province}
            </p>
            {marketInfo.description && (
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {marketInfo.description}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceIndex;
