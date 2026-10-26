import { z } from 'zod';

export const TEAM_MEMBER_KINDS = ['agent', 'staff', 'lawyer', 'partner'] as const;

export type TeamMemberKind = (typeof TEAM_MEMBER_KINDS)[number];

export const teamMemberKindSchema = z.enum(TEAM_MEMBER_KINDS);

export interface PublicTeamMember {
  id: string;
  slug: string;
  kind: TeamMemberKind;
  name: string;
  role: string;
  bio: string;
  photoUrl: string | null;
  email: string | null;
  phone: string | null;
  markets: string[];
  languages: string[];
  qualifications: string | null;
}

export interface PublicOffice {
  id: string;
  slug: string;
  name: string;
  address: string;
  phone: string | null;
  email: string | null;
  mapQuery: string;
  hours: string | null;
}

export interface PublicPartner {
  id: string;
  slug: string;
  name: string;
  logoUrl: string;
  websiteUrl: string | null;
}
