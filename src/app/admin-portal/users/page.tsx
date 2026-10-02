export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminUsersPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q || '';
  const users = await prisma.user.findMany({
    where: q ? {
      OR: [
        { name: { contains: q } },
        { email: { contains: q } },
        { id: { contains: q } }
      ]
    } : { deletedAt: null },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold">User Management</h1>
        <form className="flex gap-2">
          <input 
            type="text" 
            name="q" 
            defaultValue={q} 
            placeholder="Search name, email, ID..." 
            className="px-3 py-2 border rounded-md text-sm w-64" 
          />
          <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-medium">Search</button>
        </form>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Users (Top 50)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Role</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Joined</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {users.map((user) => (
                  <tr key={user.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td className="p-4 align-middle">
                      <div className="flex flex-col">
                        <span className="font-medium">{user.name || 'Unknown'}</span>
                        <span className="text-[10px] text-muted-foreground font-mono mt-0.5 border w-fit px-1 rounded bg-slate-50">ID: {user.id}</span>
                      </div>
                    </td>
                    <td className="p-4 align-middle">{user.email}</td>
                    <td className="p-4 align-middle">
                      {user.adminRole ? (
                        <Badge variant="destructive">{user.adminRole}</Badge>
                      ) : user.isHost ? (
                        <Badge variant="default" className="bg-blue-600">Host</Badge>
                      ) : (
                        <Badge variant="secondary">Guest</Badge>
                      )}
                    </td>
                    <td className="p-4 align-middle">
                      {user.suspendedAt ? (
                        <Badge variant="destructive">Suspended</Badge>
                      ) : (
                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Active</Badge>
                      )}
                    </td>
                    <td className="p-4 align-middle text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
