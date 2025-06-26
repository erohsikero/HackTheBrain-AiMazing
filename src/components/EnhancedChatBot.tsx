import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Bot, User, AlertTriangle, Clock, DollarSign, Shield, Stethoscope, Camera, Upload, X, Image as ImageIcon } from 'lucide-react';
import { getChatbotResponse, analyzeSymptoms, TriageResult } from '../services/geminiService';
import { analyzeDentalImage, validateImageFile, ImageAnalysisResult } from '../services/imageAnalysisService';
import { saveChatMessage, getChatHistory } from '../services/firebaseService';
import { useAuth } from '../contexts/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  triageResult?: TriageResult;
  imageAnalysis?: ImageAnalysisResult;
  imageUrl?: string;
}

const EnhancedChatBot = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [isTriageMode, setIsTriageMode] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (user) {
      loadChatHistory();
      
      // Initial greeting for authenticated users
      const initialMessage: Message = {
        id: '1',
        text: `Hello ${user.displayName?.split(' ')[0] || 'there'}! I'm enamAI, your AI dental assistant at Dental AI Clinic. I'm here to help you with:\n\n• Symptom assessment and triage\n• Dental image analysis\n• Appointment booking guidance\n• Insurance and pricing questions\n• Clinic information\n\nHow can I assist you today?`,
        isBot: true,
        timestamp: new Date()
      };
      setMessages([initialMessage]);
    }
  }, [user]);

  const loadChatHistory = async () => {
    try {
      const history = await getChatHistory(sessionId);
      if (history.length > 0) {
        const formattedHistory = history.map((msg: any) => ({
          id: msg.id,
          text: msg.text,
          isBot: msg.isBot,
          timestamp: msg.timestamp.toDate(),
          triageResult: msg.triageResult,
          imageAnalysis: msg.imageAnalysis,
          imageUrl: msg.imageUrl
        }));
        setMessages(formattedHistory);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const saveMessage = async (message: Message) => {
    try {
      await saveChatMessage(sessionId, {
        text: message.text,
        isBot: message.isBot,
        triageResult: message.triageResult,
        imageAnalysis: message.imageAnalysis,
        imageUrl: message.imageUrl
      }, user?.uid);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.isValid) {
      toast.error(validation.error || 'Invalid image file');
      return;
    }

    setSelectedImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageAnalysis = async () => {
    if (!selectedImage) return;

    setIsAnalyzingImage(true);
    setIsTyping(true);

    try {
      // Add user message with image
      const userMessage: Message = {
        id: Date.now().toString(),
        text: "I've uploaded a dental image for analysis.",
        isBot: false,
        timestamp: new Date(),
        imageUrl: imagePreview || undefined
      };

      setMessages(prev => [...prev, userMessage]);
      await saveMessage(userMessage);

      // Analyze the image
      const analysisResult = await analyzeDentalImage(selectedImage);

      // Create bot response with analysis
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `I've analyzed your dental image. Here's what I found:\n\n**Image Assessment:**\n${analysisResult.imageType} - ${analysisResult.anatomicalRegion}\n\n**Key Findings:**\n${analysisResult.keyFindings.join('\n')}\n\n**Patient-Friendly Explanation:**\n${analysisResult.patientExplanation}\n\n**Recommendations:**\n${analysisResult.recommendations.join('\n')}\n\n**Urgency Level:** ${analysisResult.urgencyLevel.toUpperCase()}`,
        isBot: true,
        timestamp: new Date(),
        imageAnalysis: analysisResult
      };

      setMessages(prev => [...prev, botMessage]);
      await saveMessage(botMessage);

      // Show urgency notification
      if (analysisResult.urgencyLevel === 'emergency') {
        toast.error('🚨 Emergency detected! Please seek immediate dental care.', {
          duration: 8000,
          icon: '🚨'
        });
      } else if (analysisResult.urgencyLevel === 'urgent') {
        toast.error('⚠️ Urgent care needed. Please schedule an appointment soon.', {
          duration: 6000,
          icon: '⚠️'
        });
      }

      // Clear image selection
      setSelectedImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('Error analyzing image:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I'm having trouble analyzing your image right now. For your safety, please contact our clinic directly or seek immediate dental attention if you're experiencing severe symptoms.",
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error('Failed to analyze image. Please try again or contact our clinic.');
    } finally {
      setIsAnalyzingImage(false);
      setIsTyping(false);
    }
  };

  const clearImageSelection = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTriageAssessment = async (symptoms: string) => {
    setIsTyping(true);
    
    try {
      const triageResult = await analyzeSymptoms(symptoms);
      
      const triageMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Based on your symptoms, here's my assessment:\n\nPriority Level: ${triageResult.priority.toUpperCase()}\n\nRecommendation: ${triageResult.recommendedAction}\n\nEstimated Wait Time: ${triageResult.estimatedWaitTime} minutes\n\nSuggested Appointment Type: ${triageResult.appointmentType}\n\n${triageResult.priority === 'emergency' ? 'Please call our emergency line immediately or visit the nearest emergency dental service.' : 'Would you like me to help you book an appointment?'}`,
        isBot: true,
        timestamp: new Date(),
        triageResult
      };

      setMessages(prev => [...prev, triageMessage]);
      await saveMessage(triageMessage);

      // Show notification based on priority
      if (triageResult.priority === 'emergency') {
        toast.error('Emergency detected! Please seek immediate care.', {
          duration: 5000,
          icon: '🚨'
        });
      } else if (triageResult.priority === 'high') {
        toast.error('High priority case detected. Please book an urgent appointment.', {
          duration: 4000,
          icon: '⚠️'
        });
      }

    } catch (error) {
      console.error('Error in triage assessment:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I'm having trouble analyzing your symptoms right now. For your safety, please contact our clinic directly or seek immediate medical attention if you're experiencing severe symptoms.",
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
    
    setIsTyping(false);
    setIsTriageMode(false);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() && !selectedImage) return;

    // Handle image analysis if image is selected
    if (selectedImage) {
      await handleImageAnalysis();
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    await saveMessage(userMessage);

    const currentInput = inputText;
    setInputText('');
    setIsTyping(true);

    // Check if user is describing symptoms for triage
    const symptomsKeywords = ['pain', 'hurt', 'ache', 'swelling', 'bleeding', 'broken', 'emergency', 'urgent', 'severe', 'symptoms'];
    const hasSymptoms = symptomsKeywords.some(keyword => currentInput.toLowerCase().includes(keyword));

    if (hasSymptoms && !isTriageMode) {
      await handleTriageAssessment(currentInput);
      return;
    }

    try {
      const botResponse = await getChatbotResponse(currentInput);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        isBot: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      await saveMessage(botMessage);
    } catch (error) {
      console.error('Error getting bot response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I'm experiencing some technical difficulties. Please try again or contact our front desk for assistance.",
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startTriageAssessment = () => {
    setIsTriageMode(true);
    const triagePrompt: Message = {
      id: Date.now().toString(),
      text: "I'll help assess your symptoms. Please describe what you're experiencing in detail:\n\n• Type and location of pain or discomfort\n• How long you've been experiencing this\n• Severity level (1-10)\n• Any swelling, bleeding, or other symptoms\n\nThe more details you provide, the better I can help assess your situation.",
      isBot: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, triagePrompt]);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return 'text-red-600 bg-red-50 border-red-200';
      case 'urgent': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'routine': return 'text-green-600 bg-green-50 border-green-200';
      case 'follow-up': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex flex-col">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-all duration-200"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">enamAI</h1>
                <p className="text-sm text-green-600">🟢 AI-Powered Dental Assistant</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Welcome, {user?.displayName?.split(' ')[0] || 'User'}</p>
            <p className="text-xs text-gray-500">Session: {sessionId.slice(-8)}</p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 max-w-4xl mx-auto w-full p-4 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
            >
              <div className={`flex max-w-xs lg:max-w-2xl ${message.isBot ? 'flex-row' : 'flex-row-reverse'} items-end space-x-2`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.isBot ? 'bg-gradient-to-r from-blue-600 to-teal-600' : 'bg-blue-600'}`}>
                  {message.isBot ? (
                    <Bot className="w-4 h-4 text-white" />
                  ) : (
                    <User className="w-4 h-4 text-white" />
                  )}
                </div>
                <div
                  className={`px-4 py-3 rounded-2xl ${
                    message.isBot
                      ? 'bg-white text-gray-800 shadow-md border'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  {/* Image Display */}
                  {message.imageUrl && (
                    <div className="mb-3">
                      <img 
                        src={message.imageUrl} 
                        alt="Uploaded dental image" 
                        className="max-w-full h-auto rounded-lg border"
                        style={{ maxHeight: '200px' }}
                      />
                    </div>
                  )}
                  
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
                  
                  {/* Triage Result Display */}
                  {message.triageResult && (
                    <div className={`mt-3 p-3 rounded-lg border ${getPriorityColor(message.triageResult.priority)}`}>
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="font-semibold text-xs uppercase">
                          {message.triageResult.priority} Priority
                        </span>
                      </div>
                      <div className="text-xs space-y-1">
                        <p><strong>Wait Time:</strong> ~{message.triageResult.estimatedWaitTime} min</p>
                        <p><strong>Type:</strong> {message.triageResult.appointmentType}</p>
                      </div>
                    </div>
                  )}

                  {/* Image Analysis Result Display */}
                  {message.imageAnalysis && (
                    <div className={`mt-3 p-3 rounded-lg border ${getUrgencyColor(message.imageAnalysis.urgencyLevel)}`}>
                      <div className="flex items-center space-x-2 mb-2">
                        <ImageIcon className="w-4 h-4" />
                        <span className="font-semibold text-xs uppercase">
                          Image Analysis - {message.imageAnalysis.urgencyLevel}
                        </span>
                      </div>
                      <div className="text-xs space-y-1">
                        <p><strong>Region:</strong> {message.imageAnalysis.anatomicalRegion}</p>
                        <p><strong>Diagnosis:</strong> {message.imageAnalysis.diagnosticAssessment.primaryDiagnosis}</p>
                        <p><strong>Confidence:</strong> {message.imageAnalysis.diagnosticAssessment.confidenceLevel}</p>
                      </div>
                    </div>
                  )}
                  
                  <p className={`text-xs mt-1 ${message.isBot ? 'text-gray-500' : 'text-blue-100'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-end space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white px-4 py-3 rounded-2xl shadow-md border">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  {isAnalyzingImage && (
                    <p className="text-xs text-gray-500 mt-1">Analyzing dental image...</p>
                  )}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Image Preview */}
        {imagePreview && (
          <div className="bg-white rounded-2xl shadow-lg p-4 mb-4 border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Image Ready for Analysis</h3>
              <button
                onClick={clearImageSelection}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="w-20 h-20 object-cover rounded-lg border"
              />
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-2">
                  Click "Analyze Image" to get AI-powered dental image analysis
                </p>
                <button
                  onClick={handleImageAnalysis}
                  disabled={isAnalyzingImage}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                >
                  {isAnalyzingImage ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4" />
                      <span>Analyze Image</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="bg-white rounded-2xl shadow-lg p-4 border">
          <div className="flex space-x-4">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isTriageMode ? "Describe your symptoms in detail..." : selectedImage ? "Click 'Analyze Image' or add a message..." : "Ask me about symptoms, upload an image, or anything else..."}
              className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              disabled={isAnalyzingImage}
            />
            
            {/* Image Upload Button */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isTyping || isAnalyzingImage}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white p-3 rounded-xl transition-all duration-200 transform hover:scale-105"
              title="Upload dental image for AI analysis"
            >
              <Upload className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleSendMessage}
              disabled={(!inputText.trim() && !selectedImage) || isTyping || isAnalyzingImage}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-3 rounded-xl transition-all duration-200 transform hover:scale-105"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mt-4">
          <button
            onClick={startTriageAssessment}
            className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Symptom Check</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-purple-100 hover:bg-purple-200 text-purple-800 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
          >
            <Camera className="w-4 h-4" />
            <span>Image Analysis</span>
          </button>
          <button
            onClick={() => navigate('/booking')}
            className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
          >
            <Clock className="w-4 h-4" />
            <span>Book Appointment</span>
          </button>
          <button
            onClick={() => setInputText('What are your hours?')}
            className="bg-green-100 hover:bg-green-200 text-green-800 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
          >
            <Clock className="w-4 h-4" />
            <span>Hours</span>
          </button>
          <button
            onClick={() => setInputText('What insurance do you accept?')}
            className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
          >
            <Shield className="w-4 h-4" />
            <span>Insurance</span>
          </button>
          <button
            onClick={() => setInputText('How much does a cleaning cost?')}
            className="bg-orange-100 hover:bg-orange-200 text-orange-800 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
          >
            <DollarSign className="w-4 h-4" />
            <span>Pricing</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedChatBot;