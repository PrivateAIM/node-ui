import type { UptimeBucket } from "~/utils/uptime-state";

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export const MAX_SPAN_MS = 7 * DAY;

const MAX_CELLS = 200; // too hard to see if higher than this

const SLICE_WIDTHS = [30, 60, 180, 720, 3600];

export interface UptimeRangePreset {
  label: string;
  spanMs: number;
}

export const SPAN_PRESETS: UptimeRangePreset[] = [
  { label: "1h", spanMs: 1 * HOUR },
  { label: "6h", spanMs: 6 * HOUR },
  { label: "24h", spanMs: 24 * HOUR },
  { label: "7d", spanMs: 7 * DAY },
];

export interface UptimeSlot {
  start: Date;
  end: Date;
}

export function resolutionFor(spanMs: number): number {
  const seconds = spanMs / 1000;
  const width = SLICE_WIDTHS.find(
    (candidate) => seconds / candidate <= MAX_CELLS,
  );

  return width ?? SLICE_WIDTHS[SLICE_WIDTHS.length - 1]!;
}

export function floorToGrid(date: Date, resolutionSeconds: number): Date {
  const width = resolutionSeconds * 1000;

  return new Date(Math.floor(date.getTime() / width) * width);
}

export function buildSlots(
  start: Date,
  end: Date,
  resolutionSeconds: number,
): UptimeSlot[] {
  const width = resolutionSeconds * 1000;
  if (width <= 0) return []; // gotta be positive otherwise weird things happen

  const last = end.getTime();
  const slots: UptimeSlot[] = [];

  for (
    let t = floorToGrid(start, resolutionSeconds).getTime();
    t < last;
    t += width
  ) {
    slots.push({
      start: new Date(t),
      end: new Date(Math.min(t + width, last)),
    });
  }

  return slots;
}

export function alignBuckets(
  slots: UptimeSlot[],
  buckets: UptimeBucket[],
): (UptimeBucket | null)[] {
  const ordered = buckets
    .map((bucket) => ({ bucket, time: new Date(bucket.start).getTime() }))
    .filter((entry) => Number.isFinite(entry.time))
    .sort((a, b) => a.time - b.time);

  let cursor = 0;

  return slots.map((slot) => {
    const slotStart = slot.start.getTime();
    const slotEnd = slot.end.getTime();

    while (cursor < ordered.length && ordered[cursor]!.time < slotStart)
      cursor++;

    const candidate = ordered[cursor];
    if (!candidate || candidate.time >= slotEnd) return null;

    cursor++;
    return candidate.bucket;
  });
}
