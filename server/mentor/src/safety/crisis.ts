const CRISIS_TERMS = /(kill myself|suicide|self-harm|hurt myself|end it all)/i;
export function isCrisis(text: string) { return CRISIS_TERMS.test(text); }
