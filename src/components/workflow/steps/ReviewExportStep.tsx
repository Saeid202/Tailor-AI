import { useWorkflow } from '@/contexts/WorkflowContext';

export function ReviewExportStep() {
  const { selection } = useWorkflow();
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto rounded-2xl border bg-card/60 backdrop-blur p-6 shadow-sm">
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Review & Export</h2>
        <p className="text-sm text-muted-foreground">Confirm selections below. Use the bottom action to export to CNC.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border p-4">
            <div className="text-xs text-muted-foreground mb-1">Garment</div>
            <div className="font-medium capitalize">{selection.garmentType ?? '—'}</div>
          </div>
          <div className="rounded-xl border p-4">
            <div className="text-xs text-muted-foreground mb-1">Fabric</div>
            <div className="font-medium">{selection.fabricId ?? '—'}</div>
          </div>
          <div className="rounded-xl border p-4">
            <div className="text-xs text-muted-foreground mb-1">Color</div>
            <div className="font-medium"><span className="inline-block align-middle mr-2 h-3 w-3 rounded-full border" style={{ backgroundColor: selection.color }} />{selection.color ?? '—'}</div>
          </div>
          <div className="rounded-xl border p-4">
            <div className="text-xs text-muted-foreground mb-1">Pattern</div>
            <div className="font-medium">{selection.patternId ?? '—'}</div>
          </div>
        </div>

        <div className="mt-6 rounded-xl border p-4">
          <div className="text-sm font-semibold mb-2">Measurements</div>
          {selection.measurements && Object.keys(selection.measurements).length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(selection.measurements).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2 text-sm">
                  <span className="truncate mr-2">{k}</span>
                  <span className="font-medium">{v}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No measurements captured</div>
          )}
        </div>
      </div>
    </div>
  );
}
