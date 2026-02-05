import type { Beneficiary } from '@/types/beneficiaire/beneficiary';

export function bucketizeProgress(items: Beneficiary[]) {
  const buckets = [
    { label: '0-20%', value: 0, min: 0, max: 20 },
    { label: '21-40%', value: 0, min: 21, max: 40 },
    { label: '41-60%', value: 0, min: 41, max: 60 },
    { label: '61-80%', value: 0, min: 61, max: 80 },
    { label: '81-100%', value: 0, min: 81, max: 100 },
  ];

  for (const b of items) {
    const p = Math.max(0, Math.min(100, Number((b as any).progressPercent ?? 0)));
    const bucket = buckets.find(x => p >= x.min && p <= x.max);
    if (bucket) bucket.value += 1;
  }
  return buckets.map(({ label, value }) => ({ label, value }));
}

export function topPerformers(items: Beneficiary[], n = 5) {
  return [...items]
    .sort((a: any, b: any) => Number(b.progressPercent ?? 0) - Number(a.progressPercent ?? 0))
    .slice(0, n)
    .map((b: any) => ({
      name: `${b.firstName} ${b.lastName}`.trim(),
      percent: Math.round(Math.max(0, Math.min(100, Number(b.progressPercent ?? 0)))),
    }));
}

export function avgProgress(items: Beneficiary[]) {
  if (!items.length) return 0;
  const sum = items.reduce((acc, b: any) => acc + Number(b.progressPercent ?? 0), 0);
  return Math.round((sum / items.length) * 10) / 10; // 1 décimale
}

export function activeCount(items: Beneficiary[]) {
  return items.filter((b: any) => b.status === 'ACTIVE').length;
}
