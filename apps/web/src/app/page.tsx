export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
      <h1 className="text-4xl font-bold mb-4">Welcome to Wisdomly</h1>
      <p className="text-lg text-muted-foreground mb-8">The monorepo is successfully running.</p>
      <div className="p-4 border border-border rounded-lg bg-card">
        <p className="font-mono text-sm">Next step: Wire up the Auth API</p>
      </div>
    </div>
  );
}