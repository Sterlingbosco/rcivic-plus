let rate = 1;
export function stop() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}
export function setRate(value: number) {
  if (![0.8, 1, 1.2].includes(value)) throw new Error('Vitesse de lecture invalide.');
  rate = value;
}
export function speak(text: string) {
  if (!('speechSynthesis' in window)) return false;
  stop();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'fr-FR';
  utterance.rate = rate;
  window.speechSynthesis.speak(utterance);
  return true;
}
