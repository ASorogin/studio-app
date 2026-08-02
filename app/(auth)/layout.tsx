// app/(auth)/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-10 w-10 rounded-sm border-2 border-flash/40" />
          ))}
        </div>
        {children}
      </div>
    </div>
  );
}