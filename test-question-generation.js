// Test script for verifying question generation improvements
import { scriptAnalyzerService } from '../services/scriptAnalyzerService.js';

const testText = `
Recovery is a deeply personal journey that requires commitment, support, and understanding. The process of overcoming addiction involves multiple stages, each presenting unique challenges and opportunities for growth.

In the early stages of recovery, individuals often struggle with withdrawal symptoms and intense cravings. This is when having a strong support system becomes crucial. Family members, friends, and counselors play vital roles in providing encouragement and accountability.

Therapy sessions help individuals understand the root causes of their addiction. Cognitive behavioral therapy (CBT) is particularly effective in helping people identify triggers and develop healthy coping strategies. Group therapy sessions also provide valuable peer support and shared experiences.

Relapse prevention is an ongoing process that requires constant vigilance and self-awareness. Developing healthy routines, maintaining social connections, and practicing mindfulness techniques are essential components of long-term sobriety.

The journey to recovery is not linear, and setbacks should be viewed as learning opportunities rather than failures. With proper treatment, support, and commitment, individuals can achieve lasting recovery and rebuild meaningful lives.
`;

// Test the improved question generation
console.log('Testing Question Generation:');
console.log('===========================');

// Test key phrase extraction
const keyPhrases = scriptAnalyzerService.extractKeyPhrases(testText);
console.log('Key Words:', keyPhrases.keyWords);
console.log('Important Sentences:', keyPhrases.importantSentences.length);

// Test content-specific question generation
const questions = scriptAnalyzerService.generateContentSpecificQuestions(testText, keyPhrases);
console.log('\nGenerated Questions:');
questions.forEach((q, i) => console.log(`${i + 1}. ${q}`));

// Test summary generation
const summary = scriptAnalyzerService.createFallbackSummary(testText);
console.log('\nGenerated Summary:');
console.log(summary);

export { testText, keyPhrases, questions, summary };
