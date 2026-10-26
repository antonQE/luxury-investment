# EPIC-09: CRM: contacts, inquiries, viewings, tasks, offers and deal stages

- Status: Done
- Priority: P1
- Source: 04 CRM-001..CRM-004; 07 INT-003 (basic); 11 D-02..D-04; FLOW-007, FLOW-012

## Goal

Every inquiry from the site or entered manually lands in the CRM linked to the right property, agent, contact and source, with a next action; agents manage viewings in a calendar, tasks and offers; owners and co-owners are linked to their properties.

## Scope

- In (R1 basic): inquiries inbox — list/filter stored public form submissions, status workflow, optional email notification stub to the responsible agent.
- In (R2 rest): contacts (person or company) with multiple roles and duplicate detection with suggested merge; property owners and co-owners; brokerage agreements with dates; inquiries with source, campaign/UTM, funnel stages; assignment, reassignment, notifications and reminders; viewings with confirm / reschedule / decline / outcome and follow-up task; calendar day/week/month with overlap warning; CRM tasks with configurable rules; offers; deal stages; spam protection and rate limits on public forms.
- Out: commissions and full deal finance (EPIC-18); calendar sync (EPIC-18); marketing consent management details (EPIC-16).

## Tasks

- LI-038: Inquiry status fields + admin list API — Done
- LI-039: Admin inquiries inbox UI — Done
- LI-040: Transactional email ADR + notification stub — Done

## Notes

R1 inbox delivered. Full CRM (contacts, viewings, calendar, offers, deal stages) remains for R2 — create follow-up tasks when that release starts. Public form storage already existed from LI-017.
