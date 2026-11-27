export const BROKER_EMPTY = '—';

/** Broker name for the properties list; blank or missing names show a dash. */
export function formatBrokerName(agentName: string | null | undefined): string {
  const name = (agentName ?? '').trim();
  return name.length > 0 ? name : BROKER_EMPTY;
}
