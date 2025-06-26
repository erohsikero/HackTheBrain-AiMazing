# Dental-AI Booking System

A modern dental booking system with AI-powered chatbot using Google Vertex AI and Med-PaLM.

## 🏗️ Architecture

- **Backend**: Python 3.11 + FastAPI + Vertex AI + Med-PaLM
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **AI Model**: Google Vertex AI with Med-PaLM for medical conversations
- **Deployment**: Google Cloud Run + Firebase Hosting
- **Database**: Google Firestore (future implementation)

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- Google Cloud SDK (for production deployment)
- Google Cloud Project with Vertex AI API enabled

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd HackTheBrain-AiMazing
   ```

2. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env with your Google Cloud credentials
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8001
   - API Documentation: http://localhost:8001/docs

## 🤖 AI Chatbot Features

### Current Implementation
- **Fallback Responses**: Intelligent fallback system when Vertex AI is unavailable
- **Session Management**: Maintains conversation context across messages
- **Dental-Specific Knowledge**: Pre-trained responses for common dental queries
- **Real-time Chat**: Instant responses with typing indicators

### Supported Queries
- Insurance coverage information
- Treatment costs (cleanings, fillings, etc.)
- Clinic hours and location
- Appointment booking guidance
- Emergency dental care instructions
- General dental health questions

### API Endpoints

#### Chat Endpoint
```http
POST /api/v1/chat/chat
Content-Type: application/json

{
  "message": "What are your hours?",
  "session_id": "optional-session-id"
}
```

Response:
```json
{
  "response": "Our clinic hours are Monday-Friday 8:00 AM - 6:00 PM...",
  "session_id": "4213f5da-961c-46e9-85cd-df8433c7e2dc",
  "timestamp": "2025-06-26T05:09:44.828391"
}
```

#### Health Check
```http
GET /api/v1/chat/health
```

## 🏥 Clinic Information

**MH2 Dental Clinic**
- **Hours**: Monday-Friday 8:00 AM - 6:00 PM, Saturday 9:00 AM - 2:00 PM, Sunday Closed
- **Services**: Cleanings, fillings, root canals, extractions, Invisalign, dentures, crowns, bridges, emergency care
- **Insurance**: Accepts CDCP and most private insurance, does not accept provincial insurance
- **Pricing**: 
  - Cleaning: $235
  - Fillings: $300-$600 (depending on size/location)

## 🔧 Configuration

### Environment Variables

```bash
# Backend (.env)
PROJECT_ID=your-gcp-project-id
LOCATION=us-central1
DEBUG=true
VERTEX_AI_MODEL=medpalm2-text-bison@001
```

### Google Cloud Setup

1. **Enable APIs**
   ```bash
   gcloud services enable aiplatform.googleapis.com
   gcloud services enable run.googleapis.com
   gcloud services enable cloudbuild.googleapis.com
   ```

2. **Set up authentication**
   ```bash
   gcloud auth application-default login
   ```

3. **Configure Vertex AI**
   ```bash
   gcloud config set project YOUR_PROJECT_ID
   gcloud auth application-default set-quota-project YOUR_PROJECT_ID
   ```

## 🚀 Deployment

### Using Cloud Build

1. **Deploy to Google Cloud**
   ```bash
   gcloud builds submit --config=cloudbuild.yaml
   ```

2. **Manual Docker Deployment**
   ```bash
   # Build and push Docker image
   cd backend
   docker build -t gcr.io/YOUR_PROJECT_ID/dental-ai-backend .
   docker push gcr.io/YOUR_PROJECT_ID/dental-ai-backend
   
   # Deploy to Cloud Run
   gcloud run deploy dental-ai-backend \
     --image gcr.io/YOUR_PROJECT_ID/dental-ai-backend \
     --region us-central1 \
     --platform managed \
     --allow-unauthenticated
   ```

## 📁 Project Structure

```
.
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── core/           # Configuration and logging
│   │   ├── models/         # Pydantic models
│   │   ├── services/       # Business logic (Vertex AI)
│   │   └── main.py         # FastAPI app
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   └── ChatBot.tsx # Main chatbot component
│   │   └── ...
│   └── package.json
├── cloudbuild.yaml         # Cloud Build configuration
└── README.md
```

## 🤝 Contributing

This project is part of the HackTheBrain 2025 hackathon.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

**Made with ❤️ for HackTheBrain 2025**
