export const TOOLS = [
  { name: 'breathing.start', description: 'Guide a breathing exercise',
    parameters: { type: 'object', properties: {
      mode: { type: 'string', enum: ['478','box','paced'] },
      duration_sec: { type: 'number', minimum: 30, maximum: 600 }
    }, required: ['mode','duration_sec'] } },
  { name: 'journaling.prompt', description: 'Start a journaling exercise',
    parameters: { type: 'object', properties: {
      topic: { type: 'string' }, seed: { type: 'string' }
    }, required: ['topic'] } },
  { name: 'focus.start', description: 'Start a 5-minute focus sprint',
    parameters: { type: 'object', properties: { minutes: { type: 'number', minimum: 1, maximum: 30 } }, required: ['minutes'] } },
  { name: 'break.start', description: 'Start a short restorative break',
    parameters: { type: 'object', properties: { minutes: { type: 'number', minimum: 1, maximum: 10 } }, required: ['minutes'] } }
];
