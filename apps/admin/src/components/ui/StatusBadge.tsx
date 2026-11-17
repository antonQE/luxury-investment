import { Badge } from '@chakra-ui/react';

export type StatusTone = 'ok' | 'down' | 'warn' | 'neutral' | 'info';

const TONE_STYLES: Record<StatusTone, { bg: string; color: string }> = {
  ok: { bg: 'status.okMuted', color: 'status.ok' },
  down: { bg: 'status.downMuted', color: 'status.down' },
  warn: { bg: 'status.warnMuted', color: 'status.warn' },
  neutral: { bg: 'status.neutralMuted', color: 'status.neutral' },
  info: { bg: 'status.infoMuted', color: 'status.info' },
};

/** Maps common admin status/stage keys to a visual tone. */
export function toneForStatus(value: string): StatusTone {
  switch (value) {
    case 'published':
    case 'accepted':
    case 'confirmed':
    case 'completed':
    case 'closed':
    case 'ok':
      return 'ok';
    case 'archived':
    case 'rejected':
    case 'cancelled':
    case 'declined':
    case 'withdrawn':
    case 'expired':
    case 'removed':
    case 'down':
      return 'down';
    case 'draft':
    case 'paused':
    case 'new':
    case 'submitted':
    case 'scheduled':
    case 'rescheduled':
      return 'warn';
    case 'in_progress':
    case 'negotiation':
    case 'preliminary':
    case 'financing':
    case 'notary':
      return 'info';
    default:
      return 'neutral';
  }
}

export function StatusBadge({
  value,
  label,
  tone,
  testId,
}: {
  value: string;
  label: string;
  tone?: StatusTone;
  testId?: string;
}) {
  const resolved = tone ?? toneForStatus(value);
  const styles = TONE_STYLES[resolved];

  return (
    <Badge bg={styles.bg} color={styles.color} data-testid={testId} data-status={value}>
      {label}
    </Badge>
  );
}
