import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.warn('Gemini API key not found. Image analysis will not be available.');
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export interface ImageAnalysisResult {
  imageType: string;
  anatomicalRegion: string;
  imageQuality: string;
  keyFindings: string[];
  diagnosticAssessment: {
    primaryDiagnosis: string;
    confidenceLevel: string;
    differentialDiagnoses: string[];
    criticalFindings: string[];
  };
  patientExplanation: string;
  recommendations: string[];
  urgencyLevel: 'emergency' | 'urgent' | 'routine' | 'follow-up';
}

// Helper function to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix to get just the base64 string
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

// Resize image if needed (optional optimization)
const resizeImage = (file: File, maxWidth: number = 800): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const resizedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now(),
          });
          resolve(resizedFile);
        } else {
          resolve(file);
        }
      }, file.type, 0.8);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

export const analyzeDentalImage = async (imageFile: File): Promise<ImageAnalysisResult> => {
  if (!genAI) {
    throw new Error('Gemini API not available. Please check your API key configuration.');
  }

  try {
    // Resize image if it's too large
    const resizedImage = await resizeImage(imageFile, 800);
    
    // Convert to base64
    const base64Image = await fileToBase64(resizedImage);
    
    // Use Gemini 1.5 Flash for multimodal analysis
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `
    You are a highly skilled dental imaging expert with extensive knowledge in dental radiology and diagnostic imaging. Analyze this dental image and provide a comprehensive assessment.

    Please structure your response as a JSON object with the following format:

    {
      "imageType": "Description of imaging type (X-ray, intraoral photo, etc.)",
      "anatomicalRegion": "Specific teeth/area visible in the image",
      "imageQuality": "Assessment of image quality and technical adequacy",
      "keyFindings": ["List of primary observations", "Include any abnormalities", "Note normal structures"],
      "diagnosticAssessment": {
        "primaryDiagnosis": "Most likely diagnosis based on findings",
        "confidenceLevel": "High/Medium/Low confidence level",
        "differentialDiagnoses": ["Alternative possible diagnoses", "Ranked by likelihood"],
        "criticalFindings": ["Any urgent findings requiring immediate attention"]
      },
      "patientExplanation": "Clear, non-technical explanation for the patient using simple language",
      "recommendations": ["Specific treatment recommendations", "Follow-up care suggestions", "Preventive measures"],
      "urgencyLevel": "emergency|urgent|routine|follow-up"
    }

    Guidelines for urgency levels:
    - emergency: Severe infection, trauma, or conditions requiring immediate care
    - urgent: Significant issues needing attention within 24-48 hours
    - routine: Standard dental issues that can be scheduled normally
    - follow-up: Monitoring or preventive care

    IMPORTANT: 
    1. This is for educational/informational purposes only
    2. Always recommend professional dental evaluation
    3. Use clear, understandable language in patient explanations
    4. Be conservative in urgency assessment - when in doubt, recommend urgent care
    5. Include appropriate medical disclaimers in recommendations
    `;

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: imageFile.type
      }
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    
    try {
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysisResult = JSON.parse(jsonMatch[0]);
        
        // Add medical disclaimer to recommendations
        analysisResult.recommendations = [
          ...analysisResult.recommendations,
          "IMPORTANT: This AI analysis is for informational purposes only and does not constitute medical advice.",
          "Please consult with a qualified dental professional for proper diagnosis and treatment."
        ];
        
        return analysisResult;
      }
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
    }
    
    // Fallback response if parsing fails
    return getFallbackAnalysis();
    
  } catch (error) {
    console.error('Error analyzing dental image:', error);
    throw new Error('Failed to analyze image. Please try again or consult with a dental professional.');
  }
};

const getFallbackAnalysis = (): ImageAnalysisResult => {
  return {
    imageType: "Dental image uploaded",
    anatomicalRegion: "Unable to determine specific region",
    imageQuality: "Image received for analysis",
    keyFindings: ["Image analysis temporarily unavailable"],
    diagnosticAssessment: {
      primaryDiagnosis: "Professional evaluation required",
      confidenceLevel: "N/A",
      differentialDiagnoses: ["Multiple conditions possible"],
      criticalFindings: ["Unable to assess - seek professional evaluation"]
    },
    patientExplanation: "I'm currently unable to analyze your dental image. For your safety and to get an accurate assessment, please schedule an appointment with our dental team who can properly examine your image and provide appropriate care.",
    recommendations: [
      "Schedule an appointment with a dental professional immediately",
      "Bring this image to your appointment for professional analysis",
      "If experiencing pain or discomfort, seek urgent dental care",
      "IMPORTANT: This AI analysis is for informational purposes only and does not constitute medical advice."
    ],
    urgencyLevel: "urgent"
  };
};

// Validate image file before analysis
export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Please upload a valid image file (JPEG, PNG, or WebP)'
    };
  }
  
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'Image file is too large. Please upload an image smaller than 10MB'
    };
  }
  
  return { isValid: true };
};