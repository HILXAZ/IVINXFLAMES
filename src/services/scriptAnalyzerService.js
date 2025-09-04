import { supabase } from '../lib/supabase';

class ScriptAnalyzerService {
  constructor() {
    this.hfApiKey = import.meta.env.VITE_HF_API_TOKEN || 'hf_your_free_token_here';
    this.baseUrl = 'https://api-inference.huggingface.co/models';
    
    // Free Hugging Face models
    this.models = {
      summarizer: 'facebook/bart-large-cnn',
      questionGenerator: 'iarfmoose/t5-base-question-generator',
      alternateQG: 'valhalla/t5-small-e2e-qg'
    };
  }

  // Summarize text using Hugging Face free API
  async summarizeText(text, maxLength = 150, minLength = 40) {
    try {
      const response = await fetch(`${this.baseUrl}/${this.models.summarizer}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.hfApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: text,
          parameters: {
            max_length: maxLength,
            min_length: minLength,
            do_sample: false,
            temperature: 0.7
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Summarization failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        console.warn('Hugging Face API error, using fallback:', data.error);
        return this.createFallbackSummary(text);
      }

      return data[0]?.summary_text || this.createFallbackSummary(text);
    } catch (error) {
      console.error('Summarization error:', error);
      return this.createFallbackSummary(text);
    }
  }

  // Generate questions using Hugging Face free API
  async generateQuestions(text, numQuestions = 5) {
    try {
      // First, try to extract key concepts and themes from the text
      const keyPhrases = this.extractKeyPhrases(text);
      const questions = [];

      // Try AI generation first
      const response = await fetch(`${this.baseUrl}/${this.models.questionGenerator}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.hfApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: text.substring(0, 512), // Limit input size for better processing
          parameters: {
            max_length: 64,
            num_return_sequences: Math.min(numQuestions, 3),
            temperature: 0.7,
            do_sample: true
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (!data.error && Array.isArray(data)) {
          const aiQuestions = data
            .map(item => item.generated_text?.trim())
            .filter(q => q && q.length > 10 && q.includes('?'));
          
          questions.push(...aiQuestions);
        }
      }

      // Fill remaining slots with content-specific questions
      const contentQuestions = this.generateContentSpecificQuestions(text, keyPhrases);
      questions.push(...contentQuestions);

      // Clean and deduplicate questions
      const uniqueQuestions = [...new Set(questions)]
        .filter(q => q && q.trim().length > 15)
        .slice(0, numQuestions);

      return uniqueQuestions.length > 0 ? uniqueQuestions : this.createFallbackQuestions(text);
    } catch (error) {
      console.error('Question generation error:', error);
      return this.generateContentSpecificQuestions(text);
    }
  }

  // Extract key phrases and concepts from the text
  extractKeyPhrases(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const words = text.toLowerCase().match(/\b\w{4,}\b/g) || [];
    
    // Count word frequency
    const wordFreq = {};
    words.forEach(word => {
      if (!this.isStopWord(word)) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });

    // Get most frequent words
    const keyWords = Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);

    // Extract important sentences (containing key words)
    const importantSentences = sentences.filter(sentence => 
      keyWords.some(word => sentence.toLowerCase().includes(word))
    ).slice(0, 5);

    return { keyWords, importantSentences, sentences };
  }

  // Check if word is a stop word
  isStopWord(word) {
    const stopWords = [
      'the', 'is', 'at', 'which', 'on', 'are', 'was', 'were', 'been', 'be',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
      'could', 'can', 'may', 'might', 'must', 'shall', 'this', 'that', 'these',
      'those', 'and', 'but', 'or', 'so', 'if', 'then', 'than', 'such', 'here',
      'there', 'where', 'when', 'why', 'how', 'what', 'who', 'whom', 'whose'
    ];
    return stopWords.includes(word) || word.length < 3;
  }

  // Generate content-specific questions based on the actual text
  generateContentSpecificQuestions(text, keyPhrases = null) {
    if (!keyPhrases) {
      keyPhrases = this.extractKeyPhrases(text);
    }

    const { keyWords, importantSentences } = keyPhrases;
    const questions = [];
    const lowerText = text.toLowerCase();

    // Generate questions based on key sentences
    importantSentences.forEach((sentence, index) => {
      if (index < 3) { // Limit to 3 sentence-based questions
        const words = sentence.split(' ');
        if (words.length > 5) {
          // Create "What", "How", "Why" questions based on sentence content
          if (sentence.includes('because') || sentence.includes('due to') || sentence.includes('result')) {
            questions.push(`Why ${sentence.split(' ').slice(1, 8).join(' ').toLowerCase()}?`);
          } else if (sentence.includes('process') || sentence.includes('method') || sentence.includes('way')) {
            questions.push(`How ${sentence.split(' ').slice(1, 8).join(' ').toLowerCase()}?`);
          } else {
            questions.push(`What ${sentence.split(' ').slice(1, 8).join(' ').toLowerCase()}?`);
          }
        }
      }
    });

    // Generate topic-specific questions based on content
    const topicQuestions = [];

    // Check for specific topics and generate relevant questions
    if (lowerText.includes('recovery') || lowerText.includes('addiction')) {
      if (keyWords.includes('treatment') || keyWords.includes('therapy')) {
        topicQuestions.push('What treatment approaches are discussed in this content?');
      }
      if (keyWords.includes('support') || keyWords.includes('group')) {
        topicQuestions.push('How important is support in the recovery process described?');
      }
      if (lowerText.includes('relapse') || lowerText.includes('setback')) {
        topicQuestions.push('What strategies are mentioned for preventing relapse?');
      }
    }

    if (lowerText.includes('therapy') || lowerText.includes('counseling')) {
      topicQuestions.push('What therapeutic techniques are highlighted in this text?');
    }

    if (lowerText.includes('family') || lowerText.includes('relationship')) {
      topicQuestions.push('How do relationships impact the situation described?');
    }

    if (lowerText.includes('medication') || lowerText.includes('treatment')) {
      topicQuestions.push('What treatment options are discussed?');
    }

    if (keyWords.includes('work') || keyWords.includes('job') || keyWords.includes('career')) {
      topicQuestions.push('How does work or career factor into this discussion?');
    }

    // Generate questions based on key words
    keyWords.slice(0, 3).forEach(word => {
      if (word.length > 4 && !['recovery', 'addiction', 'treatment'].includes(word)) {
        topicQuestions.push(`What role does ${word} play in this context?`);
      }
    });

    // Combine all questions
    questions.push(...topicQuestions);

    // Add comprehension questions
    if (importantSentences.length > 0) {
      questions.push('What are the main points discussed in this content?');
    }
    
    if (lowerText.length > 500) {
      questions.push('How can the information in this text be applied practically?');
    }

    // Clean and format questions
    const cleanedQuestions = questions
      .map(q => q.charAt(0).toUpperCase() + q.slice(1))
      .map(q => q.endsWith('?') ? q : q + '?')
      .filter(q => q.length > 15 && q.length < 120);

    return [...new Set(cleanedQuestions)].slice(0, 5);
  }

  // Create fallback summary when API fails
  createFallbackSummary(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    if (sentences.length === 0) {
      return 'Content analysis completed. The text contains information relevant to personal development and wellness.';
    }

    // Extract key concepts and create intelligent summary
    const keyPhrases = this.extractKeyPhrases(text);
    const { keyWords, importantSentences } = keyPhrases;
    
    // Use important sentences if available
    if (importantSentences.length > 0) {
      let summary = importantSentences.slice(0, 2).join('. ').trim();
      if (!summary.endsWith('.')) summary += '.';
      
      // Add context based on key words
      const contextualEnding = this.generateContextualEnding(keyWords, text);
      if (contextualEnding) {
        summary += ' ' + contextualEnding;
      }
      
      return summary;
    }

    // Fallback to first few sentences with context
    const summaryBase = sentences.slice(0, 2).join('. ').trim();
    let summary = summaryBase.endsWith('.') ? summaryBase : summaryBase + '.';
    
    // Add contextual information based on content
    const contextualEnding = this.generateContextualEnding(keyWords, text);
    if (contextualEnding) {
      summary += ' ' + contextualEnding;
    }
    
    return summary.length > 50 
      ? summary
      : 'This content focuses on important topics related to personal development, wellness, and practical life strategies.';
  }

  // Generate contextual ending for summaries
  generateContextualEnding(keyWords, text) {
    const lowerText = text.toLowerCase();
    
    if (keyWords.some(word => ['recovery', 'addiction', 'sobriety', 'treatment'].includes(word))) {
      return 'The content emphasizes key aspects of addiction recovery and treatment approaches.';
    } else if (keyWords.some(word => ['therapy', 'counseling', 'mental', 'health'].includes(word))) {
      return 'The discussion centers on mental health and therapeutic interventions.';
    } else if (keyWords.some(word => ['family', 'relationship', 'support'].includes(word))) {
      return 'The text highlights the importance of relationships and support systems.';
    } else if (keyWords.some(word => ['work', 'career', 'job', 'professional'].includes(word))) {
      return 'Professional and career-related aspects are key themes in this content.';
    } else if (keyWords.some(word => ['health', 'wellness', 'lifestyle', 'nutrition'].includes(word))) {
      return 'The content focuses on health, wellness, and lifestyle improvement strategies.';
    }
    
    return null;
  }

  // Create fallback questions when API fails
  createFallbackQuestions(text) {
    // Use the improved content-specific question generation
    const contentQuestions = this.generateContentSpecificQuestions(text);
    
    if (contentQuestions.length > 0) {
      return contentQuestions;
    }

    // Last resort: generic but relevant questions
    const lowerText = text.toLowerCase();
    const genericQuestions = [];

    // Tailor questions based on content type
    if (lowerText.includes('recovery') || lowerText.includes('addiction') || lowerText.includes('sobriety')) {
      genericQuestions.push(
        'What are the main recovery principles mentioned in this content?',
        'How can someone apply these strategies in their daily life?',
        'What support systems are recommended for maintaining sobriety?',
        'What challenges in the recovery process are discussed?',
        'How does this content suggest overcoming obstacles?'
      );
    } else if (lowerText.includes('therapy') || lowerText.includes('counseling') || lowerText.includes('treatment')) {
      genericQuestions.push(
        'What therapeutic approaches are discussed in this content?',
        'How can these treatment methods be beneficial?',
        'What are the key components of the therapy described?',
        'How might someone prepare for this type of treatment?',
        'What outcomes can be expected from this approach?'
      );
    } else if (lowerText.includes('health') || lowerText.includes('wellness') || lowerText.includes('lifestyle')) {
      genericQuestions.push(
        'What health and wellness strategies are mentioned?',
        'How can these lifestyle changes be implemented?',
        'What are the benefits of the approaches described?',
        'How might someone start incorporating these practices?',
        'What challenges might arise when making these changes?'
      );
    } else {
      // Very generic questions for any content
      genericQuestions.push(
        'What are the main points discussed in this content?',
        'How can this information be applied practically?',
        'What are the key takeaways from this text?',
        'How might someone use this information in their situation?',
        'What questions does this content raise for further exploration?'
      );
    }

    return genericQuestions.slice(0, 5);
  }

  // Save script analysis to database
  async saveScriptAnalysis(title, originalText, summary, questions, userId) {
    try {
      // Save main script record
      const { data: script, error: scriptError } = await supabase
        .from('analyzed_scripts')
        .insert({
          title,
          original_text: originalText,
          summary,
          user_id: userId,
          word_count: originalText.split(/\s+/).length,
          character_count: originalText.length
        })
        .select()
        .single();

      if (scriptError) throw scriptError;

      // Save generated questions
      const questionData = questions.map((question, index) => ({
        script_id: script.id,
        question_text: question,
        question_order: index + 1,
        user_id: userId
      }));

      const { error: questionsError } = await supabase
        .from('generated_questions')
        .insert(questionData);

      if (questionsError) throw questionsError;

      return script;
    } catch (error) {
      console.error('Error saving script analysis:', error);
      throw error;
    }
  }

  // Get user's analyzed scripts
  async getUserScripts(userId) {
    try {
      const { data, error } = await supabase
        .from('analyzed_scripts')
        .select(`
          *,
          generated_questions (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user scripts:', error);
      return [];
    }
  }

  // Get specific script with questions
  async getScriptWithQuestions(scriptId) {
    try {
      const { data, error } = await supabase
        .from('analyzed_scripts')
        .select(`
          *,
          generated_questions (*)
        `)
        .eq('id', scriptId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching script:', error);
      return null;
    }
  }

  // Delete script
  async deleteScript(scriptId, userId) {
    try {
      // Delete questions first (due to foreign key constraint)
      await supabase
        .from('generated_questions')
        .delete()
        .eq('script_id', scriptId);

      // Delete script
      const { error } = await supabase
        .from('analyzed_scripts')
        .delete()
        .eq('id', scriptId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting script:', error);
      throw error;
    }
  }

  // Analyze text completely (summary + questions)
  async analyzeScript(text, title = 'Untitled Script') {
    try {
      const [summary, questions] = await Promise.all([
        this.summarizeText(text),
        this.generateQuestions(text)
      ]);

      return {
        title,
        summary,
        questions,
        wordCount: text.split(/\s+/).length,
        characterCount: text.length,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error analyzing script:', error);
      throw error;
    }
  }

  // Export results to different formats
  exportToText(script) {
    const content = `
SCRIPT ANALYSIS REPORT
======================

Title: ${script.title}
Date: ${new Date(script.created_at).toLocaleDateString()}
Word Count: ${script.word_count}

SUMMARY:
--------
${script.summary}

GENERATED QUESTIONS:
-------------------
${script.generated_questions.map((q, i) => `${i + 1}. ${q.question_text}`).join('\n')}

ORIGINAL TEXT:
--------------
${script.original_text}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${script.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_analysis.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  exportToJSON(script) {
    const data = {
      title: script.title,
      summary: script.summary,
      questions: script.generated_questions.map(q => q.question_text),
      analysis_date: script.created_at,
      word_count: script.word_count,
      original_text: script.original_text
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${script.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_analysis.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

export const scriptAnalyzerService = new ScriptAnalyzerService();
export default scriptAnalyzerService;
