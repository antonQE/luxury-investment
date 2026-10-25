const BADGES = {
  new: 'badge_new',
  exclusive: 'badge_exclusive',
  investment: 'badge_investment',
} as const;

const STAGES = {
  act_14: 'stage_act_14',
  act_16: 'stage_act_16',
} as const;

export type BadgeMessageKey = (typeof BADGES)[keyof typeof BADGES];
export type StageMessageKey = (typeof STAGES)[keyof typeof STAGES];

export function badgeMessageKey(badge: string): BadgeMessageKey | undefined {
  if (badge in BADGES) return BADGES[badge as keyof typeof BADGES];
  return undefined;
}

export function stageMessageKey(stage: string): StageMessageKey | undefined {
  if (stage in STAGES) return STAGES[stage as keyof typeof STAGES];
  return undefined;
}
