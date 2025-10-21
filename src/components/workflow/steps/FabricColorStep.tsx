import { useWorkflow } from '@/contexts/WorkflowContext';

const COLORS = ['#111827', '#6b7280', '#dc2626', '#16a34a', '#2563eb', '#f59e0b'];
const FABRICS = [
  { id: 'cotton', name: 'Cotton' },
  { id: 'linen', name: 'Linen' },
  { id: 'wool', name: 'Wool' },
  { id: 'silk', name: 'Silk' },
];

export function FabricColorStep() {
  const { selection, update, next } = useWorkflow();
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Fabric & Color</h2>
        <p className="text-muted-foreground mb-6">Choose the fabric composition and a color that complements your style.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border bg-card/60 backdrop-blur p-5 shadow-sm">
            <h3 className="font-semibold mb-3">Fabric</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {FABRICS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    update({ fabricId: f.id });
                    // advance only when both selected
                    if (selection.color) setTimeout(() => next(), 0);
                  }}
                  className={`group relative rounded-xl border p-3 text-left transition overflow-hidden ${
                    selection.fabricId === f.id
                      ? "border-primary ring-2 ring-primary/20"
                      : "hover:border-primary/40"
                  }`}
                >
                  <div className="relative h-24 rounded-lg mb-2 overflow-hidden">
                    <div
                      className="absolute inset-0 scale-105 group-hover:scale-100 transition-transform duration-500"
                      style={{
                        background: (
                          f.id === 'cotton' ? 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)' :
                          f.id === 'linen' ? 'linear-gradient(135deg, #f5f3e7 0%, #e7dfc8 100%)' :
                          f.id === 'wool' ? 'linear-gradient(135deg, #e5e7eb 0%, #cbd5e1 100%)' :
                          'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)'
                        ) as string,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{f.name}</span>
                    {selection.fabricId === f.id && (
                      <span className="text-xs text-primary">Selected</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border bg-card/60 backdrop-blur p-5 shadow-sm">
            <h3 className="font-semibold mb-3">Color</h3>
            <div className="flex flex-wrap gap-3">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    update({ color: c });
                    if (selection.fabricId) setTimeout(() => next(), 0);
                  }}
                  className={`size-10 rounded-full border transition relative shadow-sm ${
                    selection.color === c
                      ? "ring-2 ring-offset-2 ring-primary"
                      : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: c }}
                  title={`Pick color ${c}`}
                >
                  {selection.color === c && (
                    <span className="absolute inset-0 grid place-items-center text-background text-xs font-semibold">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
