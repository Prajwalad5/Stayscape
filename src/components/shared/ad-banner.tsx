"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"

interface Ad {
  id: string
  title: string
  description: string
  imageUrl: string
  targetUrl: string
}

export function AdBanner({ placement }: { placement: string }) {
  const [ad, setAd] = useState<Ad | null>(null)
  
  useEffect(() => {
    // In a real app, this would fetch from /api/advertisements
    // For now, we simulate fetching an active ad for this placement
    fetch(`/api/ads?placement=${placement}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.ad) {
          setAd(data.ad)
        }
      })
      .catch(console.error)
  }, [placement])

  if (!ad) return null

  return (
    <div className="my-8 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 relative group">
      <Link href={ad.targetUrl} target="_blank" className="block p-4 sm:p-6 flex items-center justify-between">
        <div className="max-w-[70%]">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Advertisement</span>
          <h3 className="text-lg font-bold text-slate-900 mb-1">{ad.title}</h3>
          <p className="text-sm text-slate-600">{ad.description}</p>
        </div>
        {ad.imageUrl && (
          <div className="relative h-20 w-32 ml-4 flex-shrink-0 rounded bg-slate-200 overflow-hidden">
            <Image src={ad.imageUrl} alt={ad.title} fill className="object-cover" />
          </div>
        )}
      </Link>
    </div>
  )
}
