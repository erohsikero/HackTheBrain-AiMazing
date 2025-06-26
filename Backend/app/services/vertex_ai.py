"""
Vertex AI service for medical chatbot interactions.
"""
import json
import uuid
from typing import Optional, Dict, Any
from datetime import datetime

from google.cloud import aiplatform
from google.cloud.aiplatform.gapic.schema import predict

from ..core import get_settings, get_logger
from ..models import ChatMessage, ChatResponse

logger = get_logger(__name__)
settings = get_settings()


class VertexAIService:
    """Service for interacting with Vertex AI Med-PaLM model."""
    
    def __init__(self):
        """Initialize the Vertex AI service."""
        self._client = None
        self._model_name = settings.vertex_ai_model
        self._project_id = settings.project_id
        self._location = settings.location
        self._sessions: Dict[str, Dict[str, Any]] = {}
        
    async def initialize(self) -> None:
        """Initialize the Vertex AI client."""
        try:
            aiplatform.init(
                project=self._project_id,
                location=self._location
            )
            logger.info(f"Initialized Vertex AI client for project {self._project_id}")
        except Exception as e:
            logger.error(f"Failed to initialize Vertex AI client: {e}")
            raise
    
    def _get_dental_context(self) -> str:
        """Get dental-specific context for the Med-PaLM model."""
        return """You are enamAI, a helpful dental assistant AI for MH2 Dental Clinic. 
        You provide accurate information about dental services, costs, insurance, and appointments.
        
        Clinic Information:
        - Name: MH2 Dental Clinic
        - Hours: Monday-Friday 8:00 AM - 6:00 PM, Saturday 9:00 AM - 2:00 PM, Sunday Closed
        - Services: Cleanings, fillings, root canals, extractions, Invisalign, dentures, crowns, bridges, emergency care
        - Insurance: Accepts CDCP and most private insurance, does not accept provincial insurance
        - Pricing: Cleaning $235, Fillings $300-$600 depending on size/location
        
        Guidelines:
        - Be helpful, professional, and empathetic
        - Provide accurate information about dental procedures and costs
        - Encourage users to book appointments for specific concerns
        - For emergencies, direct to immediate care
        - Always maintain patient privacy and confidentiality
        """
    
    def _create_prompt(self, user_message: str, session_context: Optional[str] = None) -> str:
        """Create a prompt for the Med-PaLM model."""
        context = self._get_dental_context()
        
        if session_context:
            context += f"\n\nPrevious conversation context:\n{session_context}"
        
        prompt = f"""{context}

Patient Question: {user_message}

Please provide a helpful and accurate response as enamAI:"""
        
        return prompt
    
    def _get_session_context(self, session_id: str) -> Optional[str]:
        """Get conversation context for a session."""
        if session_id not in self._sessions:
            return None
        
        session = self._sessions[session_id]
        messages = session.get('messages', [])
        
        # Get last 5 messages for context
        recent_messages = messages[-5:] if len(messages) > 5 else messages
        context = ""
        
        for msg in recent_messages:
            role = "Patient" if msg['role'] == 'user' else "enamAI"
            context += f"{role}: {msg['content']}\n"
        
        return context if context else None
    
    def _update_session(self, session_id: str, user_message: str, bot_response: str) -> None:
        """Update session with new messages."""
        if session_id not in self._sessions:
            self._sessions[session_id] = {
                'created_at': datetime.utcnow(),
                'messages': []
            }
        
        session = self._sessions[session_id]
        session['messages'].extend([
            {'role': 'user', 'content': user_message, 'timestamp': datetime.utcnow()},
            {'role': 'assistant', 'content': bot_response, 'timestamp': datetime.utcnow()}
        ])
        
        # Keep only last 20 messages to prevent memory issues
        if len(session['messages']) > 20:
            session['messages'] = session['messages'][-20:]
    
    async def generate_response(self, chat_message: ChatMessage) -> ChatResponse:
        """Generate a response using Vertex AI Med-PaLM."""
        try:
            # Generate session ID if not provided
            session_id = chat_message.session_id or str(uuid.uuid4())
            
            # Get session context
            session_context = self._get_session_context(session_id)
            
            # Create prompt
            prompt = self._create_prompt(chat_message.message, session_context)
            
            # Get model endpoint
            model = aiplatform.Model(model_name=self._model_name)
            
            # Prepare prediction request
            instances = [{"content": prompt}]
            parameters = {
                "temperature": 0.3,
                "maxOutputTokens": 256,
                "topP": 0.8,
                "topK": 40
            }
            
            # Make prediction
            logger.info(f"Generating response for session {session_id}")
            prediction = await model.predict_async(
                instances=instances,
                parameters=parameters
            )
            
            # Extract response
            if prediction.predictions:
                response_text = prediction.predictions[0].get('content', 'I apologize, but I cannot provide a response at this time. Please try again or contact our clinic directly.')
            else:
                response_text = "I apologize, but I cannot provide a response at this time. Please try again or contact our clinic directly."
            
            # Update session
            self._update_session(session_id, chat_message.message, response_text)
            
            return ChatResponse(
                response=response_text,
                session_id=session_id
            )
            
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            
            # Fallback response
            fallback_response = self._get_fallback_response(chat_message.message)
            session_id = chat_message.session_id or str(uuid.uuid4())
            
            return ChatResponse(
                response=fallback_response,
                session_id=session_id
            )
    
    def _get_fallback_response(self, user_message: str) -> str:
        """Get fallback response when Vertex AI is unavailable."""
        message = user_message.lower()
        
        if any(word in message for word in ['insurance', 'coverage']):
            return "We accept CDCP and most private insurance plans, but we do not accept provincial insurance. Please contact our front desk to verify your specific coverage."
        
        elif any(word in message for word in ['cleaning', 'clean']):
            return "A dental cleaning costs $235 and includes a comprehensive examination. We recommend cleanings every 6 months for optimal oral health."
        
        elif any(word in message for word in ['filling', 'cavity', 'cavities']):
            return "Fillings for cavities cost between $300-$600 depending on the size and location. Our dentist will provide a detailed estimate during your consultation."
        
        elif any(word in message for word in ['hours', 'time', 'open']):
            return "Our clinic hours are Monday-Friday 8:00 AM - 6:00 PM, Saturday 9:00 AM - 2:00 PM, and we're closed on Sunday. We also offer emergency appointments."
        
        elif any(word in message for word in ['appointment', 'book', 'schedule']):
            return "I'd be happy to help you schedule an appointment! You can use our online booking system or call our front desk during business hours."
        
        elif any(word in message for word in ['emergency', 'urgent', 'pain']):
            return "For dental emergencies, please call our clinic immediately. If it's after hours, we have an emergency line available. Dental pain should not be ignored."
        
        else:
            return "Thank you for your question! I'm currently experiencing technical difficulties. Please contact our front desk at your convenience, and our staff will be happy to help you with any questions about our services, pricing, or appointments."


# Global service instance
vertex_ai_service = VertexAIService()
