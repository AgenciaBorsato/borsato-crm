const colorMap = {
  green: 'text-green-400',
  blue: 'text-blue-400',
  yellow: 'text-yellow-400',
  purple: 'text-purple-400',
  red: 'text-red-400',
  zinc: 'text-zinc-400',
};

export default function MetricCard({ title, value, icon, color = 'zinc' }) {
  return (
    <div className="bg-zinc-900 rounded-xl p-4 flex items-center justify-between shadow-md hover:scale-[1.02] transition">
      <div>
        <p className="text-zinc-400 text-sm">{title}</p>
        <h2 className="text-white text-2xl font-bold">{value}</h2>
      </div>

      <div className={`${colorMap[color] || 'text-zinc-400'} text-2xl`}>
        {icon}
      </div>
    </div>
  );
}
