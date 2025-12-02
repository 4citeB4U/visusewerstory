export interface VoiceOption {
  name: string;
  lang?: string;
}

const DASH_VARIANTS = /[\u2010-\u2015\u2212]/g;

interface PreferredVoiceConfig {
  label: string;
  searchTerms: string[];
}

const PREFERRED_VOICE_CONFIG: PreferredVoiceConfig[] = [
  {
    label: 'Microsoft Aria Online (Natural) – English (United States)',
    searchTerms: [
      'Microsoft Aria Online (Natural) – English (United States)',
      'Microsoft Aria Online (Natural) - English (United States)',
      'Microsoft Aria Online (Natural)',
      'en-US-AriaNeural'
    ]
  },
  {
    label: 'Microsoft Brian Online (Natural) – English (United States)',
    searchTerms: [
      'Microsoft Brian Online (Natural) – English (United States)',
      'Microsoft Brian Online (Natural) - English (United States)',
      'Microsoft Brian Online (Natural)',
      'en-US-BrianNeural'
    ]
  },
  {
    label: 'Microsoft Christopher Online (Natural) – English (United States)',
    searchTerms: [
      'Microsoft Christopher Online (Natural) – English (United States)',
      'Microsoft Christopher Online (Natural) - English (United States)',
      'Microsoft Christopher Online (Natural)',
      'en-US-ChristopherNeural'
    ]
  },
  {
    label: 'Microsoft Emma Online (Natural) – English (United States)',
    searchTerms: [
      'Microsoft Emma Online (Natural) – English (United States)',
      'Microsoft Emma Online (Natural) - English (United States)',
      'Microsoft Emma Online (Natural)',
      'en-US-EmmaNeural'
    ]
  },
  {
    label: 'Microsoft EmmaMultilingual Online (Natural) – English (United States)',
    searchTerms: [
      'Microsoft EmmaMultilingual Online (Natural) – English (United States)',
      'Microsoft EmmaMultilingual Online (Natural) - English (United States)',
      'Microsoft EmmaMultilingual Online (Natural)',
      'en-US-EmmaMultilingualNeural'
    ]
  },
  {
    label: 'Microsoft Eric Online (Natural) – English (United States)',
    searchTerms: [
      'Microsoft Eric Online (Natural) – English (United States)',
      'Microsoft Eric Online (Natural) - English (United States)',
      'Microsoft Eric Online (Natural)',
      'en-US-EricNeural'
    ]
  },
  {
    label: 'Microsoft Jenny Online (Natural) – English (United States)',
    searchTerms: [
      'Microsoft Jenny Online (Natural) – English (United States)',
      'Microsoft Jenny Online (Natural) - English (United States)',
      'Microsoft Jenny Online (Natural)',
      'en-US-JennyNeural'
    ]
  },
  // Apple Enhanced (Safari/macOS) common high-quality voices
  {
    label: 'Samantha (Enhanced) – English (United States)',
    searchTerms: [
      'Samantha (Enhanced)',
      'Samantha',
      'en-US-Samantha'
    ]
  },
  {
    label: 'Ava (Enhanced) – English (United States)',
    searchTerms: [
      'Ava (Enhanced)',
      'Ava',
      'en-US-Ava'
    ]
  },
  {
    label: 'Allison (Enhanced) – English (United States)',
    searchTerms: [
      'Allison (Enhanced)',
      'Allison',
      'en-US-Allison'
    ]
  },
  {
    label: 'Alex – English (United States)',
    searchTerms: [
      'Alex',
      'en-US-Alex'
    ]
  },
  // Google voices (Chrome) common labels
  {
    label: 'Google US English – English (United States)',
    searchTerms: [
      'Google US English',
      'Google English (United States)',
      'en-US-google'
    ]
  },
  {
    label: 'Google en-US – English (United States)',
    searchTerms: [
      'en-US',
      'English (United States)'
    ]
  },
];

export const preferredVoiceLabels: string[] = PREFERRED_VOICE_CONFIG.flatMap((voice) => voice.searchTerms);

export const normalizeVoiceText = (value?: string) => {
  if (!value) return '';
  return value
    .replace(DASH_VARIANTS, '-')
    .toLowerCase()
    .replace(/[_\s()]+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export const preferredVoiceTokens = Array.from(
  new Set(preferredVoiceLabels.map((label) => normalizeVoiceText(label)).filter(Boolean))
);

const normalizeLang = (lang?: string) => normalizeVoiceText(lang);

export const filterPreferredVoices = (voices: VoiceOption[]): VoiceOption[] => {
  if (!voices?.length) return [];
  const scored = voices
    .map((voice) => {
      const nameToken = normalizeVoiceText(voice.name);
      const langToken = normalizeLang(voice.lang);
      const tokenIndex = preferredVoiceTokens.findIndex((token) => nameToken.includes(token));
      const langScore = langToken.startsWith('en-us') ? 0 : langToken.startsWith('en') ? 2 : 4;
      const score = tokenIndex >= 0 ? tokenIndex : preferredVoiceTokens.length + langScore;
      return { voice, score };
    })
    .sort((a, b) => a.score - b.score)
    .map((entry) => entry.voice);

  const curated = scored.filter((voice) => {
    const nameToken = normalizeVoiceText(voice.name);
    const langToken = normalizeLang(voice.lang);
    return preferredVoiceTokens.some((token) => nameToken.includes(token)) || langToken.startsWith('en-us');
  });

  const preferredList = curated.length ? curated : scored.filter((voice) => normalizeLang(voice.lang).startsWith('en'));
  const seen = new Set<string>();
  return preferredList.filter((voice) => {
    const key = voice.name || `${voice.lang}-${voice}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const pickPreferredVoiceName = (voices: VoiceOption[], desiredName?: string | null) => {
  if (!voices?.length) return '';
  if (desiredName && voices.some((voice) => voice.name === desiredName)) {
    return desiredName;
  }
  const filtered = filterPreferredVoices(voices);
  return filtered[0]?.name || voices[0]?.name || '';
};

export interface PreferredVoiceOption {
  label: string;
  actualName?: string;
  lang?: string;
  available: boolean;
}

export const mapVoicesToPreferred = (voices: VoiceOption[]) => {
  const remaining = [...voices];
  const preferred: PreferredVoiceOption[] = PREFERRED_VOICE_CONFIG.map((config) => {
    const matchIndex = remaining.findIndex((voice) => {
      const normalized = normalizeVoiceText(voice.name);
      return config.searchTerms.some((term) => normalized.includes(normalizeVoiceText(term)));
    });
    const match = matchIndex >= 0 ? remaining.splice(matchIndex, 1)[0] : undefined;
    return {
      label: config.label,
      actualName: match?.name,
      lang: match?.lang,
      available: Boolean(match)
    };
  });
  return { preferred, remaining };
};