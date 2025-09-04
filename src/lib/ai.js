// AI Service for generating motivational tips and support messages
const HF_API_URL = 'https://api-inference.huggingface.co/models/noelmathewisaac/inspirational-quotes-distilgpt2'
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Fallback motivational quotes for when AI is unavailable
const fallbackQuotes = [
  "Every day is a new opportunity to break free from what holds you back.",
// ... existing code ...
  "Recovery is not about being perfect; it's about being persistent."
]

async function generateMotivationalTipWithGemini(prompt) {
  if (!GEMINI_API_KEY) {
    console.warn('Gemini API key not found, using fallback quote');
    return aiService.getFallbackQuote();
  }

  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Generate a short, inspiring, and motivational quote (around 1-2 sentences) for someone trying to overcome ${prompt}. Focus on themes of strength, hope, and persistence.`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          maxOutputTokens: 60,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    return text?.trim().replace(/"/g, '') || aiService.getFallbackQuote();
  } catch (error) {
    console.error('Gemini API error:', error);
    return aiService.getFallbackQuote();
  }
}

// Emergency support messages
const emergencyMessages = [
// ... existing code ...
  "You are brave for fighting this battle. Keep going."
]

export const aiService = {
  async generateMotivationalTip(habitName = '', context = '') {
    const prompt = `${habitName || 'addiction'}. ${context}`;
    
    if (GEMINI_API_KEY) {
      return generateMotivationalTipWithGemini(prompt);
    }

    try {
      if (!HF_API_TOKEN) {
        console.warn('Hugging Face API token not found, using fallback quote');
        return this.getFallbackQuote();
      }

      const hfPrompt = `Overcoming ${habitName || 'addiction'} requires determination. ${context}`
      
      const response = await fetch(HF_API_URL, {
        headers: {
          'Authorization': `Bearer ${HF_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          inputs: hfPrompt,
          parameters: {
            max_length: 100,
            temperature: 0.7,
            do_sample: true,
            top_p: 0.9
          }
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result && result.length > 0 && result[0].generated_text) {
        let generatedText = result[0].generated_text
        
        // Clean up the generated text
        generatedText = generatedText.replace(hfPrompt, '').trim()
        
        // If the generated text is too short or doesn't make sense, use fallback
        if (generatedText.length < 20) {
          return this.getFallbackQuote()
        }
        
        return generatedText
      } else {
        return this.getFallbackQuote()
      }
    } catch (error) {
      console.error('Error generating AI tip:', error)
      return this.getFallbackQuote()
    }
  },

  getFallbackQuote() {
// ... existing code ...
    return fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)]
  },

  getEmergencyMessage() {
// ... existing code ...
    return emergencyMessages[Math.floor(Math.random() * emergencyMessages.length)]
  },

  async generatePersonalizedTip(user, habitData, streakCount) {
// ... existing code ...
    const context = `User has ${streakCount} days streak with ${habitData?.name || 'their goal'}.`
    return await this.generateMotivationalTip(habitData?.name, context)
  },

  async generateCravingSupport(habitName) {
// ... existing code ...
    const context = `Experiencing cravings for ${habitName}. Need immediate support and encouragement.`
    return await this.generateMotivationalTip(habitName, context)
  }
}

// Alternative OpenAI implementation (if user prefers)
// ... existing code ...

// Alternative OpenAI implementation (if user prefers)
export const openAIService = {
  async generateTip(prompt, apiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-davinci-003',
          prompt: `Generate a motivational quote for someone trying to overcome: ${prompt}`,
          max_tokens: 60,
          temperature: 0.7,
        }),
      })

      const data = await response.json()
      return data.choices[0]?.text?.trim() || aiService.getFallbackQuote()
    } catch (error) {
      console.error('OpenAI API error:', error)
      return aiService.getFallbackQuote()
    }
  }
}
