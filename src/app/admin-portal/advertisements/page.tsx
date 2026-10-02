export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminAdsPage() {
  const ads = await prisma.advertisement.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Advertisement Engine</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Campaign</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Placement</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Impressions</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Clicks</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {ads.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-muted-foreground">No advertisements found.</td>
                  </tr>
                )}
                {ads.map((ad) => (
                  <tr key={ad.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td className="p-4 align-middle font-medium">
                      {ad.title}
                      <div className="text-xs text-muted-foreground">{ad.targetAudience} audience</div>
                    </td>
                    <td className="p-4 align-middle">{ad.placement}</td>
                    <td className="p-4 align-middle">
                      <Badge variant={ad.status === 'ACTIVE' ? 'default' : 'secondary'}>{ad.status}</Badge>
                    </td>
                    <td className="p-4 align-middle text-right">{ad.impressions.toLocaleString()}</td>
                    <td className="p-4 align-middle text-right">{ad.clicks.toLocaleString()}</td>
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
