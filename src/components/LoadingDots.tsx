export const LoadingDots = ({ label }: { label?: string }) => (
  <div className="flex flex-col items-center gap-4 py-8">
    <div className="flex items-center gap-2">
      <span className="dot w-3 h-3 rounded-full bg-primary" />
      <span className="dot w-3 h-3 rounded-full bg-success" />
      <span className="dot w-3 h-3 rounded-full bg-warning" />
      <span className="dot w-3 h-3 rounded-full bg-danger" />
    </div>
    {label && <p className="text-sm text-muted-foreground animate-fade-in">{label}</p>}
  </div>
);
