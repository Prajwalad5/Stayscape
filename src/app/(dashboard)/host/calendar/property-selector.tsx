"use client";

import { useRouter } from "next/navigation";
import { ChangeEvent } from "react";

export function PropertySelector({ 
  properties, 
  selectedId 
}: { 
  properties: { id: string; title: string }[]; 
  selectedId?: string;
}) {
  const router = useRouter();

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value) {
      router.push(`/host/calendar?propertyId=${value}`);
    } else {
      router.push(`/host/calendar`);
    }
  };

  return (
    <select 
      name="propertyId" 
      defaultValue={selectedId}
      onChange={handleChange}
      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <option value="">All Properties (Combined)</option>
      {properties.map(p => (
        <option key={p.id} value={p.id}>{p.title}</option>
      ))}
    </select>
  );
}
