// Simple Gemini API integration for enhanced responses
// For now using local responses, but this can be enhanced with actual Gemini API

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export const generateSmartResponse = async (userMessage, context = 'addiction_recovery') => {
  // Enhanced local responses for addiction recovery support
  const responses = {
    greeting: [
      "Hello! I'm your recovery companion. I'm here to provide support, encouragement, and practical tools to help you on your journey. How are you feeling today?",
      "Hi there! I'm glad you reached out. Recovery is a brave journey, and I'm here to support you every step of the way. What's on your mind?",
      "Welcome! I'm your AI recovery assistant. I'm equipped with evidence-based strategies and motivational support. How can I help you right now?"
    ],
    
    craving: [
      "I understand you're experiencing cravings. This is completely normal and shows your brain is healing. Let's use the HALT technique: Are you Hungry, Angry, Lonely, or Tired? Address these needs first.",
      "Cravings are like waves - they rise, peak, and fall. You've survived 100% of your cravings so far. Let's ride this one out together. Try the 5-4-3-2-1 grounding technique: Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste.",
      "This craving is temporary, but your recovery is permanent. Remember your 'why' - the reasons you chose recovery. Would you like to practice some breathing exercises or call a support person?"
    ],
    
    motivation: [
      "Your commitment to recovery is inspiring. Every day you choose sobriety, you're rewiring your brain for health and happiness. You're literally becoming a new person, one day at a time.",
      "Recovery isn't just about stopping something - it's about starting everything. You're reclaiming your authentic self, your relationships, your dreams. That takes incredible courage.",
      "Remember: You are not your addiction. You are a person with infinite potential who happens to be in recovery. Your story is being rewritten with each healthy choice you make."
    ],
    
    anxiety: [
      "Anxiety in recovery is common as your nervous system adjusts. Try box breathing: Breathe in for 4 counts, hold for 4, exhale for 4, hold for 4. Repeat until you feel calmer.",
      "Your brain is learning new ways to cope without substances. This anxiety is temporary. Ground yourself: What are 3 things you can see right now? Focus on those details.",
      "Anxiety often carries important messages. What is yours telling you? Sometimes it's just your brain's old alarm system being overly cautious as you heal."
    ],
    
    depression: [
      "Depression in recovery is real and valid. You're not weak - you're healing. Consider reaching out to your support network or a mental health professional. Small steps count.",
      "Depression can make recovery feel impossible, but you've already done impossible things by choosing sobriety. Be gentle with yourself. What's one tiny thing you could do for yourself right now?",
      "Your brain chemistry is rebalancing, which can affect mood. This is temporary. Focus on basics: hydration, nutrition, sleep, and human connection. You don't have to feel better to get better."
    ],
    
    sleep: [
      "Sleep in recovery is crucial for healing. Create a bedtime routine: dim lights 1 hour before bed, avoid screens, try reading or meditation. Your brain repairs itself during sleep.",
      "Poor sleep can trigger cravings and mood issues. Try progressive muscle relaxation: tense and release each muscle group from toes to head. This signals your body it's time to rest.",
      "Sleep disturbances are common early in recovery. Your brain is learning to produce natural sleep chemicals again. Be patient with the process and maintain consistent sleep times."
    ],
    
    relationships: [
      "Recovery often means rebuilding relationships or setting new boundaries. This is challenging but necessary work. Start with being honest about your needs and limits.",
      "Some relationships may not survive your recovery, and that's okay. You're becoming your authentic self, and authentic relationships will follow. Focus on quality over quantity.",
      "Communication in recovery requires practice. Use 'I' statements, listen actively, and remember that you can only control your own actions and reactions."
    ],
    
    relapse_concern: [
      "Thinking about relapse doesn't mean you will relapse. It means you're human. Acknowledge the thought without judgment, then reconnect with your recovery tools and support system.",
      "Relapse starts in the mind before it happens physically. You recognizing these thoughts is actually a sign of strong recovery awareness. What triggered this feeling?",
      "Remember: relapse is not failure, it's information. But right now, you're not relapsing - you're reaching out for help. That's recovery in action."
    ],
    
    progress: [
      "Every milestone in recovery deserves celebration! Whether it's 1 day or 1000 days, you're proving to yourself that change is possible. What progress are you most proud of?",
      "Recovery isn't always linear, but you're moving forward. Even the difficult days are part of your healing journey. You're building resilience with each challenge you face.",
      "The person you're becoming through recovery is someone worth celebrating. You're not just getting your life back - you're creating a life worth living."
    ],
    
    emergency: [
      "I hear that you're in crisis. Your safety is the most important thing right now. Please reach out to emergency services (911), the 988 Suicide & Crisis Lifeline, or go to your nearest emergency room immediately.",
      "This sounds urgent. Please don't face this alone. Call 988 (Suicide & Crisis Lifeline), text HOME to 741741 (Crisis Text Line), or contact emergency services. You matter and help is available.",
      "You're brave for reaching out during a crisis. Please get immediate professional help: 911 for emergencies, 988 for crisis support, or SAMHSA's helpline at 1-800-662-4357. Your life has value."
    ],

    tools: [
      "Let me share some recovery tools: HALT check (Hungry, Angry, Lonely, Tired), grounding techniques, breathing exercises, calling a support person, or engaging in physical activity. Which sounds helpful right now?",
      "Here are some quick coping strategies: Take 10 deep breaths, splash cold water on your face, call someone in your support network, write in a journal, or listen to recovery podcasts. What resonates with you?",
      "Recovery toolbox options: Meditation apps, exercise, creative activities, service to others, attending meetings, reading recovery literature, or practicing gratitude. What tools have worked for you before?"
    ],

    default: [
      "I'm here to listen and support you through whatever you're experiencing. Recovery is a journey with ups and downs, and you don't have to navigate it alone. Can you tell me more about what's happening?",
      "Thank you for sharing with me. Every conversation about recovery is important and valuable. I'm equipped with evidence-based strategies and motivational support. How can I best help you right now?",
      "I hear you, and your feelings are valid. Recovery involves many different experiences and emotions. Would you like to explore some coping strategies, talk about your goals, or discuss what's challenging you today?"
    ]
  };

  // Enhanced command classification with more nuanced detection
  const classifyMessage = (message) => {
    const lowerMessage = message.toLowerCase();
    
    // Emergency keywords (highest priority)
    if (lowerMessage.includes('suicide') || lowerMessage.includes('kill myself') || 
        lowerMessage.includes('end it all') || lowerMessage.includes('hurt myself') ||
        lowerMessage.includes('emergency') || lowerMessage.includes('crisis')) {
      return 'emergency';
    }
    
    // Greetings
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || 
        lowerMessage.includes('hey') || lowerMessage.includes('good morning') ||
        lowerMessage.includes('good afternoon') || lowerMessage.includes('good evening')) {
      return 'greeting';
    }
    
    // Cravings and urges
    if (lowerMessage.includes('craving') || lowerMessage.includes('urge') || 
        lowerMessage.includes('want to use') || lowerMessage.includes('tempted') ||
        lowerMessage.includes('thinking about using') || lowerMessage.includes('relapse')) {
      return 'craving';
    }
    
    // Mental health
    if (lowerMessage.includes('anxious') || lowerMessage.includes('anxiety') || 
        lowerMessage.includes('panic') || lowerMessage.includes('worried')) {
      return 'anxiety';
    }
    
    if (lowerMessage.includes('depressed') || lowerMessage.includes('depression') || 
        lowerMessage.includes('sad') || lowerMessage.includes('hopeless') ||
        lowerMessage.includes('empty') || lowerMessage.includes('numb')) {
      return 'depression';
    }
    
    // Sleep issues
    if (lowerMessage.includes('sleep') || lowerMessage.includes('insomnia') || 
        lowerMessage.includes('tired') || lowerMessage.includes('exhausted') ||
        lowerMessage.includes('rest') || lowerMessage.includes('nightmares')) {
      return 'sleep';
    }
    
    // Relationships
    if (lowerMessage.includes('relationship') || lowerMessage.includes('family') || 
        lowerMessage.includes('friends') || lowerMessage.includes('partner') ||
        lowerMessage.includes('conflict') || lowerMessage.includes('lonely')) {
      return 'relationships';
    }
    
    // Motivation and encouragement
    if (lowerMessage.includes('motivat') || lowerMessage.includes('encourage') || 
        lowerMessage.includes('support') || lowerMessage.includes('inspiration') ||
        lowerMessage.includes('why am i doing this') || lowerMessage.includes('give up')) {
      return 'motivation';
    }
    
    // Progress and milestones
    if (lowerMessage.includes('progress') || lowerMessage.includes('milestone') || 
        lowerMessage.includes('celebrate') || lowerMessage.includes('achievement') ||
        lowerMessage.includes('days sober') || lowerMessage.includes('clean time')) {
      return 'progress';
    }
    
    // Relapse concerns
    if (lowerMessage.includes('might relapse') || lowerMessage.includes('going to use') || 
        lowerMessage.includes('losing control') || lowerMessage.includes('slipping')) {
      return 'relapse_concern';
    }
    
    // Tools and strategies
    if (lowerMessage.includes('tools') || lowerMessage.includes('strategies') || 
        lowerMessage.includes('coping') || lowerMessage.includes('help me') ||
        lowerMessage.includes('what should i do') || lowerMessage.includes('technique')) {
      return 'tools';
    }
    
    return 'default';
  };

  try {
    // If Gemini API is available and configured, use it for enhanced responses
    if (GEMINI_API_KEY && userMessage.length > 0) {
      console.log('🤖 Attempting Gemini API call with key:', GEMINI_API_KEY ? 'Present' : 'Missing');
      
      const prompt = `You are a compassionate AI recovery assistant specializing in addiction recovery support. 
      Respond to this message with empathy, evidence-based strategies, and hope. 
      Keep responses under 150 words and always prioritize safety.
      
      User message: "${userMessage}"
      
      Context: ${context}`;

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      console.log('📡 Gemini API response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('📥 Gemini API response data:', data);
        const generatedResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (generatedResponse) {
          console.log('✅ Using Gemini response:', generatedResponse);
          return generatedResponse.trim();
        }
      } else {
        console.warn('❌ Gemini API failed with status:', response.status);
        const errorText = await response.text();
        console.warn('Error details:', errorText);
      }
    } else {
      console.log('⚠️ Gemini API key not available, using fallback');
    }
  } catch (error) {
    console.log('❌ Gemini API error, using local responses:', error);
  }

  // Fallback to local responses
  const category = classifyMessage(userMessage);
  const categoryResponses = responses[category] || responses.default;
  const selectedResponse = categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
  
  console.log('🔄 Using fallback response:', {
    userMessage,
    category,
    selectedResponse: selectedResponse.substring(0, 50) + '...'
  });
  
  return selectedResponse;
};

export const getMotivationalQuote = () => {
  const quotes = [
    "Recovery is not a race. You don't have to feel guilty if it takes you longer than you thought it would.",
    "You are allowed to be both a masterpiece and a work in progress simultaneously.",
    "The fact that you aren't where you want to be should be enough motivation.",
    "Recovery is an acceptance that your life is in shambles and you must change it.",
    "What lies behind us and what lies before us are tiny matters compared to what lies within us.",
    "You didn't come this far to only come this far.",
    "Recovery is about progression, not perfection.",
    "The only person you are destined to become is the person you decide to be.",
    "Your current situation is not your final destination.",
    "Recovery is giving yourself permission to live."
  ];
  
  return quotes[Math.floor(Math.random() * quotes.length)];
};
