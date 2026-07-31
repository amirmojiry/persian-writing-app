import type { AudioCue, AudioCuePort, UiLocale } from '@persian-writing/core';
import { messages } from '@persian-writing/i18n';

export class BrowserSpeechAudioCue implements AudioCuePort {
  async play(cue: AudioCue, locale: UiLocale): Promise<void> {
    if (typeof speechSynthesis === 'undefined' || typeof SpeechSynthesisUtterance === 'undefined') {
      return;
    }
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cueText(cue, locale));
    utterance.lang = locale === 'fa' ? 'fa-IR' : locale === 'fi' ? 'fi-FI' : 'en-US';
    utterance.rate = 0.9;
    speechSynthesis.speak(utterance);
  }

  async stop(): Promise<void> {
    if (typeof speechSynthesis !== 'undefined') {
      speechSynthesis.cancel();
    }
  }
}

function cueText(cue: AudioCue, locale: UiLocale): string {
  const catalog = messages[locale];
  const text: Record<AudioCue, string> = {
    wizardPrompt: catalog.wizardQuestion,
    wizardSuccess: catalog.wizardSuccess,
    ready: `${catalog.readyTitle} ${catalog.readyBody}`,
    nextLetter: catalog.practiceTitle,
    complete: `${catalog.resultTitle} ${catalog.resultBody}`
  };
  return text[cue];
}
