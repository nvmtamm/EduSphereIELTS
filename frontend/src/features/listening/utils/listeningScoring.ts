export function formatAudioTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function getAccentBadge(accent: string): { label: string; flag: string; bgClass: string; textClass: string } {
  switch (accent.toLowerCase()) {
    case 'british':
      return { label: 'British Accent', flag: '🇬🇧', bgClass: 'bg-blue-500/10 border-blue-500/20', textClass: 'text-blue-600 dark:text-blue-400' };
    case 'american':
      return { label: 'American Accent', flag: '🇺🇸', bgClass: 'bg-red-500/10 border-red-500/20', textClass: 'text-red-600 dark:text-red-400' };
    case 'australian':
      return { label: 'Australian Accent', flag: '🇦🇺', bgClass: 'bg-emerald-500/10 border-emerald-500/20', textClass: 'text-emerald-600 dark:text-emerald-400' };
    case 'canadian':
      return { label: 'Canadian Accent', flag: '🇨🇦', bgClass: 'bg-amber-500/10 border-amber-500/20', textClass: 'text-amber-600 dark:text-amber-400' };
    default:
      return { label: 'Mixed Accents', flag: '🌐', bgClass: 'bg-purple-500/10 border-purple-500/20', textClass: 'text-purple-600 dark:text-purple-400' };
  }
}

export function getSectionInfo(sectionNumber: number): { title: string; subtitle: string; iconName: string } {
  switch (sectionNumber) {
    case 1:
      return { title: 'Part 1: Social Dialogue', subtitle: 'Two speakers in everyday conversation', iconName: 'MessageSquare' };
    case 2:
      return { title: 'Part 2: Social Monologue', subtitle: 'One speaker giving community/visitor information', iconName: 'MapPin' };
    case 3:
      return { title: 'Part 3: Academic Discussion', subtitle: 'Two to four speakers discussing an assignment', iconName: 'Users' };
    case 4:
      return { title: 'Part 4: Academic Lecture', subtitle: 'University lecture on an academic subject', iconName: 'GraduationCap' };
    default:
      return { title: 'Full 4-Part Exam', subtitle: 'Complete Cambridge IELTS Listening Simulation (40 Qs)', iconName: 'Headphones' };
  }
}

export function getBandScoreColor(band: number): string {
  if (band >= 8.0) return 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  if (band >= 7.0) return 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/30';
  if (band >= 6.0) return 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30';
  if (band >= 5.0) return 'text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/30';
  return 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/30';
}

export function getBandScoreDescription(band: number): { tier: string; description: string } {
  if (band >= 8.5) return { tier: 'Expert User (C2)', description: 'Fully operational command of the language with complete comprehension.' };
  if (band >= 7.5) return { tier: 'Very Good User (C1)', description: 'Operational command with occasional unsystematic inaccuracies and misunderstandings in unfamiliar situations.' };
  if (band >= 6.5) return { tier: 'Competent User (B2)', description: 'Generally effective command with some inaccuracies and misunderstandings. Understands complex language well in familiar situations.' };
  if (band >= 5.5) return { tier: 'Modest User (B1)', description: 'Partial command of the language, coping with overall meaning in most situations with frequent errors.' };
  return { tier: 'Limited User (A2)', description: 'Basic competence is limited to familiar situations. Shows frequent problems in understanding and expression.' };
}
