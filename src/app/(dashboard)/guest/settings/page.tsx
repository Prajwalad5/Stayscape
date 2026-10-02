export const dynamic = 'force-dynamic';
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/profile/settings-form";

export default async function GuestSettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    select: { name: true, email: true, image: true, bio: true }
  });

  if (!user) redirect("/login");

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your public profile and preferences.</p>
      </div>

      <SettingsForm user={user} />
    </div>
  );
}
