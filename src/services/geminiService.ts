import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.warn('Gemini API key not found. Using fallback responses.');
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export interface TriageResult {
  priority: 'emergency' | 'high' | 'medium' | 'low';
  recommendedAction: string;
  estimatedWaitTime: number;
  appointmentType: string;
}

// Helper function to clean markdown formatting from text
const cleanMarkdownFormatting = (text: string): string => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold formatting
    .replace(/\*(.*?)\*/g, '$1')     // Remove italic formatting
    .replace(/__(.*?)__/g, '$1')     // Remove underline formatting
    .replace(/_(.*?)_/g, '$1')       // Remove italic formatting
    .replace(/`(.*?)`/g, '$1')       // Remove code formatting
    .replace(/#{1,6}\s/g, '')        // Remove heading markers
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
    .replace(/^\s*[-*+]\s/gm, '')    // Remove bullet points
    .replace(/^\s*\d+\.\s/gm, '')    // Remove numbered lists
    .replace(/\n\s*\n/g, '\n')       // Remove extra line breaks
    .trim();
};

export const analyzeSymptoms = async (symptoms: string): Promise<TriageResult> => {
  if (!genAI) {
    return getFallbackTriage(symptoms);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `
    You are a dental triage AI assistant for Dental AI Clinic. Analyze the following patient symptoms and provide a JSON response with triage information.

    Patient symptoms: "${symptoms}"

    Please respond with ONLY a JSON object in this exact format (use plain text without any markdown formatting):
    {
      "priority": "emergency|high|medium|low",
      "recommendedAction": "specific recommendation for the patient in plain text",
      "estimatedWaitTime": number_in_minutes,
      "appointmentType": "Emergency|Urgent Care|Routine Cleaning|Consultation|Treatment"
    }

    Guidelines:
    - Emergency: Severe pain, swelling affecting breathing/swallowing, trauma, bleeding that won't stop
    - High: Moderate to severe pain, significant swelling, broken tooth with pain
    - Medium: Mild to moderate pain, sensitivity, minor swelling
    - Low: Routine cleaning, check-ups, cosmetic concerns

    Estimated wait times:
    - Emergency: 5-15 minutes
    - High: 15-30 minutes  
    - Medium: 30-60 minutes
    - Low: 60-120 minutes

    IMPORTANT: Use only plain text in your response, no bold, italic, or other formatting.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedResult = JSON.parse(jsonMatch[0]);
        // Clean any markdown formatting from the recommendedAction
        if (parsedResult.recommendedAction) {
          parsedResult.recommendedAction = cleanMarkdownFormatting(parsedResult.recommendedAction);
        }
        return parsedResult;
      }
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
    }
    
    return getFallbackTriage(symptoms);
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return getFallbackTriage(symptoms);
  }
};

const getFallbackTriage = (symptoms: string): TriageResult => {
  const lowerSymptoms = symptoms.toLowerCase();
  
  if (lowerSymptoms.includes('severe') || lowerSymptoms.includes('emergency') || 
      lowerSymptoms.includes('bleeding') || lowerSymptoms.includes('swelling face')) {
    return {
      priority: 'emergency',
      recommendedAction: 'Seek immediate dental care. This appears to be a dental emergency.',
      estimatedWaitTime: 10,
      appointmentType: 'Emergency'
    };
  }
  
  if (lowerSymptoms.includes('pain') || lowerSymptoms.includes('broken') || 
      lowerSymptoms.includes('swelling')) {
    return {
      priority: 'high',
      recommendedAction: 'Schedule an urgent appointment. You should be seen within 24-48 hours.',
      estimatedWaitTime: 25,
      appointmentType: 'Urgent Care'
    };
  }
  
  if (lowerSymptoms.includes('sensitivity') || lowerSymptoms.includes('discomfort')) {
    return {
      priority: 'medium',
      recommendedAction: 'Schedule an appointment within the next week for evaluation.',
      estimatedWaitTime: 45,
      appointmentType: 'Treatment'
    };
  }
  
  return {
    priority: 'low',
    recommendedAction: 'Schedule a routine appointment for evaluation and cleaning.',
    estimatedWaitTime: 90,
    appointmentType: 'Routine Cleaning'
  };
};

export const getChatbotResponse = async (userMessage: string): Promise<string> => {
  if (!genAI) {
    return getFallbackChatResponse(userMessage);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `
    You are enamAI, a helpful dental assistant chatbot for Dental AI Clinic. 
    
    Clinic Information:
    - Name: Dental AI Clinic
    - Hours: Monday-Friday 8:00 AM - 6:00 PM, Saturday 9:00 AM - 2:00 PM, Sunday Closed
    - Services: Cleanings ($235), Fillings ($300-600), Root canals, Extractions, Invisalign, Dentures, Crown/Bridge work
    - Insurance: Accepts CDCP and most insurances, but NOT provincial insurance
    - Emergency care available outside regular hours
    
    User message: "${userMessage}"
    
    Respond as enamAI in a helpful, professional, and friendly manner. Keep responses concise but informative.
    If the user describes symptoms, ask follow-up questions to better understand their condition.
    Always encourage users to book an appointment for proper evaluation when appropriate.
    
    IMPORTANT: Use only plain text in your response. Do not use any markdown formatting like bold, italic, bullet points, asterisks, or special characters for emphasis. Use simple line breaks for lists.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean any markdown formatting from the response
    return cleanMarkdownFormatting(text);
  } catch (error) {
    console.error('Error calling Gemini API for chat:', error);
    return getFallbackChatResponse(userMessage);
  }
};

const getFallbackChatResponse = (userMessage: string): string => {
  const message = userMessage.toLowerCase();

  if (message.includes('insurance') || message.includes('coverage')) {
    return "We cover CDCP and most insurances. However, we do not accept provincial insurance. Please check with a receptionist for your exact coverage details.";
  }

  if (message.includes('cleaning') && (message.includes('cost') || message.includes('price'))) {
    return "A dental cleaning costs $235. This includes a comprehensive cleaning and examination by our dental hygienist.";
  }

  if ((message.includes('filling') || message.includes('cavities')) && 
      (message.includes('cost') || message.includes('price'))) {
    return "Fillings for cavities cost between $300-$600, depending on the size and location of the cavity. Our dentist will provide a detailed estimate during your consultation.";
  }

  if (message.includes('hours') || message.includes('time') || message.includes('open')) {
    return "Our clinic hours are:\n\nMonday - Friday: 8:00 AM - 6:00 PM\nSaturday: 9:00 AM - 2:00 PM\nSunday: Closed\n\nWe also offer emergency appointments outside regular hours.";
  }

  if (message.includes('appointment') || message.includes('book') || message.includes('schedule')) {
    return "I'd be happy to help you schedule an appointment! You can use our online booking system by going back to the main menu, or call our front desk during business hours.";
  }

  return "I'm here to help with questions about Dental AI Clinic! You can ask me about our services, pricing, hours, insurance, or booking appointments. How can I assist you today?";
};