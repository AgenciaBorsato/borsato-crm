import React from 'react';

const colorMap = {
  green:  { bg: 'bg-green-50',  icon: 'text-green-600',  border: 'border-green-100' },
  blue:   { bg: 'bg-blue-50',   icon: 'text-blue-600',   border: 'border-blue-100'  },
  yellow: { bg: 'bg-yellow-50', icon: 'text-yellow-600', border: 'border-yellow-100'},
  purple: { bg: 'bg-purple-50', icon: 'text-purple-600', border: 'border-purple-100'},
  red:    { bg: 'bg-red-50',    icon: 'text-red-600',    border: 'border-red-100'   },
};

export default function MetricCard({ title, value, icon, color = 'green' }) {
  const c = colorMap[color] || colorMap.green;

  return (
    <div className={`bg-white rounded-xl border ${c.border} shadow-sm p-4 flex items-center gap-4`}>
      <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center ${c.icon}`}>
        {React.cloneElement(icon, { className: 'w-5 h-5' })}
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium">{title}</p>
        <p className="text-lg font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}
