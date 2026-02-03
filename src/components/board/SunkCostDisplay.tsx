export function SunkCostDisplay({ calculation }: { calculation: string | null | undefined }) {
  if (!calculation) {
    return (
      <div className="opacity-50">
        [AWAITING_CALCULATION]
        <p className="text-xs mt-1">// User must quantify time/money already lost</p>
      </div>
    );
  }

  return (
    <div className="bg-red-950 border border-red-800 p-3 rounded">
      <h4 className="text-red-400 text-sm mb-1">SUNK_COST_ANALYSIS</h4>
      <p className="text-red-300 font-bold text-lg">{calculation}</p>
    </div>
  );
}
