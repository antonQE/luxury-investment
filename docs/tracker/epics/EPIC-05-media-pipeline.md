# EPIC-05: Media pipeline

- Status: Backlog
- Priority: P1
- Source: 07 MEDIA-001, MEDIA-002, MEDIA-003; 11 G-01, G-02; MEDIA-ACCEPT 1, 2

## Goal

Photos, videos, plans and files are uploaded to properties (and later articles and pages); originals are kept untouched; optimized renditions, a social JPEG 1200x630 and optional watermarked renditions are generated automatically; private files are never publicly reachable.

## Scope

- In: storage and background jobs ADRs (analysis R4, R5); storage interface with local adapter; upload with type and size checks; renditions (web sizes, thumbnails, social JPEG) generated in a background job; watermark settings with the original logo; gallery ordering, primary image, captions, alt text per language; visibility (public, internal, brochure only); external video and 3D tour links.
- Out: brochures and marketing studio templates (EPIC-15).

## Tasks

Decomposed when the epic starts.
