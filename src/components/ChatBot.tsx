import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Bot, User, MapPin, Clock, DollarSign, Shield } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const ChatBot = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initial greeting
    const initialMessage: Message = {
      id: '1',
      text: "Hello! My name is enamAI. Welcome to AI dental! I'm here to answer any questions you may have about our clinic!",
      isBot: true,
      timestamp: new Date()
    };
    setMessages([initialMessage]);

    // Show quick options after greeting
    setTimeout(() => {
      const optionsMessage: Message = {
        id: '2',
        text: "Here are some common questions I can help you with:\n\n• What insurance does the clinic cover?\n• How much does a cleaning cost?\n• How much do fillings for cavities cost?\n• Clinic hours and location\n• Make an appointment\n\nFeel free to ask me anything!",
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, optionsMessage]);
    }, 1000);
  }, []);

  const getBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();

    if (message.includes('insurance') || message.includes('coverage')) {
      return "We cover CDCP and most insurances. However, we do not accept provincial insurance. Please check with a receptionist for your exact coverage details.";
    }

    if (message.includes('cleaning') && message.includes('cost')) {
      return "A dental cleaning costs $235. This includes a comprehensive cleaning and examination by our dental hygienist.";
    }

    if (message.includes('filling') || message.includes('cavities') || message.includes('cavity')) {
      return "Fillings for cavities cost between $300-$600, depending on the size and location of the cavity. Our dentist will provide a detailed estimate during your consultation.";
    }

    if (message.includes('hours') || message.includes('time') || message.includes('open')) {
      return "Our clinic hours are:\n\nMonday - Friday: 8:00 AM - 6:00 PM\nSaturday: 9:00 AM - 2:00 PM\nSunday: Closed\n\nWe also offer emergency appointments outside regular hours.";
    }

    if (message.includes('location') || message.includes('address') || message.includes('where')) {
      return "AI Dental Clinic is conveniently located in the heart of the city. For our exact address and directions, please contact our front desk at your convenience.";
    }

    if (message.includes('appointment') || message.includes('book') || message.includes('schedule')) {
      return "I'd be happy to help you schedule an appointment! You can:\n\n1. Use our online booking system by going back to the main menu\n2. Call our front desk during business hours\n3. Request a callback and we'll contact you\n\nWould you like me to direct you to our booking system?";
    }

    if (message.includes('emergency') || message.includes('urgent') || message.includes('pain')) {
      return "For dental emergencies, please call our clinic immediately. If it's after hours, we have an emergency line available. Dental pain should not be ignored - please seek immediate care.";
    }

    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return "Hello! I'm enamAI, your dental assistant. How can I help you today?";
    }

    if (message.includes('thank') || message.includes('thanks')) {
      return "You're very welcome! I'm here to help. Is there anything else you'd like to know about AI Dental Clinic?";
    }

    if (message.includes('services') || message.includes('treatment')) {
      return "We offer a wide range of dental services including:\n\n• Cleanings and exams\n• Fillings and restorations\n• Root canals\n• Extractions\n• Invisalign consultations\n• Denture consultations\n• Crown and bridge work\n• Emergency dental care\n\nWould you like more information about any specific service?";
    }

    // Default response
    return "I understand your question, but I might need more specific information to provide the best answer. Could you please rephrase or ask about:\n\n• Insurance coverage\n• Treatment costs\n• Clinic hours and location\n• Booking appointments\n• Our dental services\n\nOur front desk staff are also available to help with any detailed questions!";
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse = getBotResponse(inputText);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        isBot: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="max-w-4xl mx-auto flex items-center">
          <button
            onClick={() => navigate('/')}
            className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-all duration-200"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">enamAI</h1>
              <p className="text-sm text-green-600">Online • Ready to help</p>
            </div>
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
              <div className={`flex max-w-xs lg:max-w-md ${message.isBot ? 'flex-row' : 'flex-row-reverse'} items-end space-x-2`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.isBot ? 'bg-green-600' : 'bg-blue-600'}`}>
                  {message.isBot ? (
                    <Bot className="w-4 h-4 text-white" />
                  ) : (
                    <User className="w-4 h-4 text-white" />
                  )}
                </div>
                <div
                  className={`px-4 py-3 rounded-2xl ${
                    message.isBot
                      ? 'bg-white text-gray-800 shadow-md'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
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
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white px-4 py-3 rounded-2xl shadow-md">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <div className="flex space-x-4">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about insurance, costs, appointments, or anything else..."
              className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isTyping}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-3 rounded-xl transition-all duration-200 transform hover:scale-105"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
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
            className="bg-purple-100 hover:bg-purple-200 text-purple-800 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
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

export default ChatBot;