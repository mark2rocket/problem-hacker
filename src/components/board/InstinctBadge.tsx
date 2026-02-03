type InstinctType = 'Survival' | 'Mate' | 'Resource' | 'Status' | 'Kin Care';

const INSTINCT_COLORS: Record<InstinctType, string> = {
  'Survival': 'bg-red-900 text-red-200',
  'Mate': 'bg-pink-900 text-pink-200',
  'Resource': 'bg-yellow-900 text-yellow-200',
  'Status': 'bg-purple-900 text-purple-200',
  'Kin Care': 'bg-blue-900 text-blue-200',
};

export function InstinctBadge({ instinct }: { instinct: InstinctType | null | undefined }) {
  if (!instinct) return <span className="opacity-50">[NOT_IDENTIFIED]</span>;

  return (
    <span className={`px-2 py-1 rounded ${INSTINCT_COLORS[instinct]}`}>
      {instinct.toUpperCase()}
    </span>
  );
}
