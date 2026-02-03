export async function getMediaById(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/media/${id}`, {
    cache: 'no-store',
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(json?.message ?? 'Impossible de récupérer le media');
  }
  return json?.data ?? json;
}
