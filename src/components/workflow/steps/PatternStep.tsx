import { useWorkflow } from '@/contexts/WorkflowContext';

const PATTERNS = [
  { id: 'classic', name: 'Classic Fit', desc: 'Traditional proportions with comfort' },
  { id: 'slim', name: 'Slim Fit', desc: 'Tailored silhouette with tapered lines' },
  { id: 'relaxed', name: 'Relaxed Fit', desc: 'More ease for casual comfort' },
];

export function PatternStep() {
  const { selection, update, next } = useWorkflow();
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Choose your pattern</h2>
      <div className="grid md:grid-cols-3 gap-5 max-w-6xl">
        {PATTERNS.map((p) => (
          <button
            key={p.id}
            onClick={() => { update({ patternId: p.id }); setTimeout(() => next(), 0); }}
            className={`group rounded-2xl border p-5 text-left transition shadow-sm ${selection.patternId === p.id ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/40'}`}
          >
            <div className="h-24 rounded-xl mb-3 bg-gradient-to-br from-muted/40 to-muted group-hover:from-muted/30" />
            <div className="font-semibold">{p.name}</div>
            <div className="text-sm text-muted-foreground mt-1">{p.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
