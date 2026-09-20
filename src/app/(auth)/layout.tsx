import Link from 'next/link';
import { Home } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4">
      <Link href="/" className="mb-8 flex items-center space-x-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
          <Home className="h-6 w-6 text-primary-foreground" />
        </div>
        <span className="text-2xl font-bold tracking-tight">
          Stay<span className="text-primary">Scape</span>
        </span>
      </Link>
      {children}
    </div>
  );
}
