export function MeasurementStep() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Capture measurements</h2>
        <div className="rounded-xl border bg-card/50 backdrop-blur p-4">
          <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
            <li>Stand 3–4 feet from the camera in good lighting</li>
            <li>Keep a T‑pose with arms slightly away from the body</li>
            <li>Wait until all quality indicators turn green, then auto-capture starts</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
