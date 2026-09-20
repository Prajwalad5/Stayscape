import { HostSidebar } from '@/components/layout/host-sidebar';
import { Navbar } from '@/components/layout/navbar';

export default function HostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <HostSidebar />
      <div className="flex flex-1 flex-col">
        <div className="lg:hidden">
          <Navbar />
        </div>
        <main className="flex-1 overflow-auto p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
