// Course structure metadata: the three sections and the three license
// codes students can study for. Lessons live in Supabase; this file is
// the single place their grouping/labels/ordering are defined.

export const SECTIONS = [
  {
    key: 'road_rules',
    label: 'Road Rules',
    emoji: '🚦',
    tagline: 'Right of way, speed limits and the rules of the road.',
    accent: 'amber',
  },
  {
    key: 'signs',
    label: 'Signs',
    emoji: '🛑',
    tagline: 'Every sign, signal and road marking you must recognise.',
    accent: 'red',
  },
  {
    key: 'controls',
    label: 'Controls',
    emoji: '🚗',
    tagline: 'Vehicle controls and manoeuvres for your license code.',
    accent: 'blue',
  },
] as const;

export type SectionKey = (typeof SECTIONS)[number]['key'];

export const LICENSE_CODES = [
  {
    code: 8,
    name: 'Code 8',
    vehicle: 'Light motor vehicles',
    detail: 'Cars and bakkies up to 3 500 kg — the everyday driver’s license.',
  },
  {
    code: 10,
    name: 'Code 10',
    vehicle: 'Heavy motor vehicles',
    detail: 'Trucks and buses over 3 500 kg with a light trailer.',
  },
  {
    code: 14,
    name: 'Code 14',
    vehicle: 'Extra-heavy combinations',
    detail: 'Articulated trucks and combinations with heavy trailers.',
  },
] as const;

export type LicenseCode = (typeof LICENSE_CODES)[number]['code'];

export function isLicenseCode(value: number): value is LicenseCode {
  return LICENSE_CODES.some((c) => c.code === value);
}

export type Lesson = {
  id: string;
  section: SectionKey;
  title: string;
  description: string;
  sort_order: number;
  video_path?: string;
  license_codes: number[];
};

// Stable course order: section order as declared above, then sort_order.
export function orderLessons<T extends Lesson>(lessons: T[]): T[] {
  const sectionRank = new Map(SECTIONS.map((s, i) => [s.key as string, i]));
  return [...lessons].sort(
    (a, b) =>
      (sectionRank.get(a.section) ?? 0) - (sectionRank.get(b.section) ?? 0) ||
      a.sort_order - b.sort_order
  );
}
