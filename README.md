# AI Dental Clinic - AiMazing

![Dental AI Clinic Home Page](docs/images/HomePage.png)

A modern, AI-powered dental clinic management platform built with React, Vite, Firebase, and Google Gemini AI. This project streamlines patient management, appointment booking, real-time waitlists, and provides intelligent analytics and chatbot support for both patients and staff.

---

## 🚀 Project Overview

**AI Dental Clinic - AiMazing** is a web application designed to revolutionize dental clinic operations. It leverages AI and cloud technologies to provide:
- Seamless patient onboarding and authentication
- Smart appointment booking and waitlist management
- Real-time chat support powered by Google Gemini AI
- Impact analytics and dashboards for staff
- Secure, scalable, and serverless deployment on Google Cloud Run

---

## ✨ Features
- **User Authentication**: Secure sign-up, login, and session management with Firebase Auth
- **Appointment Booking**: Enhanced, AI-assisted scheduling and triage
- **Real-Time Waitlist**: Smart waitlist dashboard for staff and patients
- **Chatbot**: AI-powered chatbot for patient queries and triage (Google Gemini AI)
- **Impact Analytics**: Visual dashboards and charts (Recharts)
- **Image Analysis**: Upload and analyze images for triage
- **Responsive UI**: Modern, mobile-friendly design with Tailwind CSS

---

## 🛠️ Tech Stack

| Layer         | Technology/Service                |
|---------------|----------------------------------|
| UI            | React, Tailwind CSS, Lucide, Recharts, react-hot-toast |
| State/Context | React Context API                |
| Routing       | React Router DOM                 |
| Data/Backend  | Firebase (Firestore, Auth, Storage), Google Gemini AI |
| Build         | Vite, TypeScript, PostCSS, Autoprefixer |
| Linting       | ESLint, typescript-eslint, plugins |
| Container     | Docker (Node.js, serve)          |
| Cloud         | Google Cloud Build, Cloud Run, Artifact Registry |
| Deployment    | YAML manifests for Cloud Run, Cloud Build |
| Notification  | react-hot-toast                  |

---

## 📁 Project Structure

```
├── src/
│   ├── components/      # React UI components
│   ├── services/        # Firebase, Gemini AI, image analysis
│   ├── contexts/        # React context providers
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   ├── config/          # Configuration (e.g., Firebase)
│   └── main.tsx         # App entry point
├── Dockerfile           # Multi-stage Docker build
├── cloudbuild.yaml      # Cloud Build config
├── package.json         # Project dependencies
└── README.md            # Project documentation
```

---

## ⚙️ Setup & Development

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd <repo-folder>
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Set up environment variables:**
   Create a `.env` file or use Cloud Run/Build environment variables:
   ```env
   VITE_FIREBASE_API_KEY=your-firebase-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
   VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-firebase-messaging-sender-id
   VITE_FIREBASE_APP_ID=your-firebase-app-id
   VITE_GEMINI_API_KEY=your-gemini-api-key
   ```
4. **Run locally:**
   ```bash
   npm run dev
   ```

---

## 🐳 Docker & Cloud Deployment

### **Build & Push with Google Cloud Build**

Cloud Build uses `cloudbuild.yaml` to build and push the Docker image with all required environment variables as build args.

### **Deploy to Google Cloud Run**

After building and pushing the image, deploy using the Google Cloud Console or CLI:

```bash
gcloud run deploy <SERVICE_NAME> \
  --image <IMAGE_URL> \
  --region <REGION> \
  --platform managed \
  --set-env-vars VITE_FIREBASE_API_KEY=...,...
```

Or use a Cloud Run YAML manifest for advanced configuration.

---

## 🔑 Environment Variables

| Name                              | Description                       |
|----------------------------------- |-----------------------------------|
| VITE_FIREBASE_API_KEY             | Firebase API key                  |
| VITE_FIREBASE_AUTH_DOMAIN         | Firebase Auth domain              |
| VITE_FIREBASE_PROJECT_ID          | Firebase project ID               |
| VITE_FIREBASE_STORAGE_BUCKET      | Firebase storage bucket           |
| VITE_FIREBASE_MESSAGING_SENDER_ID | Firebase messaging sender ID      |
| VITE_FIREBASE_APP_ID              | Firebase app ID                   |
| VITE_GEMINI_API_KEY               | Google Gemini AI API key          |

---

## 📊 Demo & Usage
- **Live Demo:** [https://hackthebrain-aimazing-505286163804.europe-west1.run.app/](https://hackthebrain-aimazing-505286163804.europe-west1.run.app/)
- Register or log in as a patient or staff
- Book appointments, chat with the AI assistant, and view analytics
- Staff can manage waitlists and view real-time data

---

## 📽️ Presentation
- [Project Presentation (Canva PPT)](https://www.canva.com/design/DAGrdz7La3U/53W8o1kv8IaAMkRf6nay3A/view)

---

## 👥 Authors & Credits
Team AI Dental Clinic - AiMazing
   - [Kishore Suresh (Me)](https://github.com/erohsikero)
   - [shihabhasan0161](https://github.com/shihabhasan0161)
   - [edsontakei](https://github.com/edsontakei)
   - [yyjemily](https://github.com/yyjemily)

Built for [HackTheBrain](hackthebrain.ca) 2025

---

## 🏆 Why This Project?
- Demonstrates the power of AI and cloud in healthcare
- Real-world impact for clinics and patients
- Modern, scalable architecture

---

## 📄 License
MIT (or specify your license) 