import { notFound } from "next/navigation";
import OpnameDetailClient from "./OpnameDetailClient";

export default async function OpnameDetailPage({ params }: { params: { id: string } }) {
  // Tentukan base URL absolut
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/opname/${params.id}`, { cache: 'no-store' });
  if (!res.ok) return notFound();
  const data = await res.json();
  return <OpnameDetailClient data={data} opnameId={params.id} />;
} 