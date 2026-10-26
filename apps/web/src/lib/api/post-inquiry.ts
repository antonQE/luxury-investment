export async function postInquiry(body: Record<string, unknown>): Promise<void> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
  const response = await fetch(`${base}/v1/public/inquiries`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`inquiry_failed_${String(response.status)}`);
  }
}
