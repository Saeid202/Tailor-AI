export function VisualStep() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto rounded-2xl border bg-card/60 backdrop-blur p-6 shadow-sm">
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Visual preview</h2>
        <p className="text-sm text-muted-foreground">A 2D fit visualization based on your measurements, fabric, and pattern will appear here.</p>
        <div className="mt-6 h-64 rounded-xl bg-gradient-to-br from-muted/40 to-muted flex items-center justify-center text-muted-foreground">
          Coming soon: Annotated size map and ease overlays
        </div>
      </div>
    </div>
  );
}
