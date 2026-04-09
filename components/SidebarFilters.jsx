export function SidebarFilters({ activeFilters, toggleFilter }) {
  const filters = [
    { id: 'Person', label: 'People', color: 'bg-blue-500' },
    { id: 'Institution', label: 'Institutions', color: 'bg-slate-500' },
    { id: 'Organization', label: 'Organizations', color: 'bg-purple-500' },
    { id: 'Place', label: 'Places', color: 'bg-yellow-500' },
  ];

  return (
    <div className="absolute top-6 left-6 z-10 w-64 bg-gray-800/90 backdrop-blur border border-gray-700 rounded-2xl shadow-2xl p-4 flex flex-col gap-3">
      <h3 className="text-white font-medium mb-1">Entity Filters</h3>
      {filters.map(f => {
        const isActive = activeFilters.includes(f.id);
        return (
          <button
            key={f.id}
            onClick={() => toggleFilter(f.id)}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
              isActive ? 'bg-gray-700/80 hover:bg-gray-600' : 'opacity-50 hover:opacity-100 hover:bg-gray-700'
            }`}
          >
            <div className={`w-3 h-3 rounded-full ${f.color} ${isActive ? 'shadow-[0_0_8px_currentColor]' : ''}`} />
            <span className="text-sm font-medium text-slate-200">{f.label}</span>
          </button>
        );
      })}
    </div>
  );
}
