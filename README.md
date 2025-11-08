# LexiFlow - AI-Powered English Vocabulary Learning Platform

LexiFlow is a comprehensive full-stack English learning application that combines vocabulary collection with AI-powered conversation practice. Built with modern technologies including Rust backend, Next.js frontend, and Tauri desktop integration.

## 🚀 Features

### Core Functionality

- **Vocabulary Management**: Complete CRUD operations for vocabulary entries with rich metadata
- **AI Word Suggestions**: Intelligent vocabulary recommendations using Google Gemini AI
- **GitHub OAuth Authentication**: Secure user authentication and session management
- **Real-time Search**: Advanced filtering and search across all word properties
- **Learning Analytics**: Comprehensive progress tracking and statistics dashboard
- **Cross-platform Support**: Web application with Tauri desktop integration

### Vocabulary Features

- **Rich Metadata**: Word, meaning, translation, category, part of speech, phonetics, examples
- **Smart Categorization**: Organize by Business, Technology, Academic, and custom categories
- **AI-Powered Suggestions**: Get contextual vocabulary recommendations based on your learning progress
- **Instant Search**: Real-time filtering across words, meanings, and translations
- **Bulk Operations**: Efficient management of large vocabulary collections

### AI Integration

- **Gemini AI Integration**: Powered by Google's Gemini API for intelligent word suggestions
- **Contextual Learning**: AI analyzes your current vocabulary to suggest relevant new words
- **Natural Language Processing**: Advanced text processing for meaningful vocabulary recommendations

## 🛠 Technology Stack

### Frontend

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS 3+ with Shadcn/ui components
- **State Management**: TanStack Query (React Query) for server state
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: Radix UI primitives with custom styling

### Backend

- **Language**: Rust with type safety and performance
- **Framework**: Axum 0.7+ web framework with async support
- **Database**: PostgreSQL 15+ with Diesel ORM for type-safe queries
- **AI Integration**: Google Gemini AI API for vocabulary suggestions
- **Authentication**: JWT-based authentication with GitHub OAuth
- **Deployment**: Shuttle.rs platform for Rust applications
- **Validation**: Comprehensive request validation and error handling

### Additional Technologies

- **Authentication**: GitHub OAuth 2.0 with JWT token management
- **AI Services**: Google Gemini AI for natural language processing
- **Desktop App**: Tauri 2.0 for cross-platform desktop application
- **Deployment**: Shuttle.rs (backend) and Vercel (frontend)

## 📁 Project Structure

```
LexiFlow/
├── frontend/                     # Next.js Frontend (Web & Desktop UI)
│   ├── src/
│   │   ├── app/                  # App Router pages and layouts
│   │   ├── components/           # Shared UI components (Button, Input, etc.)
│   │   ├── features/             # Feature-specific modules
│   │   │   └── words/
│   │   │       ├── components/   # Components specific to 'words' feature
│   │   │       └── hooks/        # Custom hooks for 'words' feature
│   │   ├── lib/                  # Utilities and API client
│   │   └── types/                # TypeScript definitions
│   │       └── generated.ts      # Auto-generated types from Rust backend
│   ├── src-tauri/                # Tauri core for desktop application
│   │   ├── src/
│   │   │   └── main.rs           # Desktop app entry point
│   │   ├── Cargo.toml
│   │   └── tauri.conf.json
│   ├── package.json
│   ├── next.config.js
│   └── tsconfig.json
├── backend/                      # Rust API Server
│   ├── src/
│   │   ├── main.rs               # Application entry point
│   │   ├── models/               # Data models (with ts-rs macros)
│   │   ├── handlers/             # API route handlers
│   │   ├── database/             # Database configuration
│   │   └── errors/               # Error handling
│   ├── migrations/               # Database migrations
│   ├── Cargo.toml
│   └── Shuttle.toml
├── CLAUDE.md                     # Project requirements and development progress
└── README.md                     # Project setup and usage documentation
```

## 🚦 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Rust** 1.70+ with Cargo
- **PostgreSQL** 15+ (or use Shuttle.rs managed database)
- **GitHub OAuth App** for authentication
- **Google Gemini API Key** for AI features

### Environment Setup

1. **GitHub OAuth Application**:
   - Create a GitHub OAuth App at https://github.com/settings/applications/new
   - Set callback URL to `http://localhost:3000/auth/callback/github`
   - Note your Client ID and Client Secret

2. **Google Gemini API**:
   - Get API key from Google AI Studio
   - Enable the Gemini API in your Google Cloud Console

3. **Database** (Optional for local development):
   - LexiFlow can use Shuttle.rs managed PostgreSQL
   - For local development, install PostgreSQL and create database

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Create environment file:

```bash
# .env
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your_jwt_secret_key_here
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

3. Run with Shuttle (recommended):

```bash
cargo shuttle run --port 8000
```

Or run locally:

```bash
cargo run
```

The API server will start on `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Create environment file:

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

3. Install dependencies:

```bash
npm install
```

4. Start the development server:

```bash
npm run dev
```

The web application will be available at `http://localhost:3000`

### Desktop App (Tauri)

To run as a desktop application:

```bash
cd frontend
npm run tauri dev
```

## 🔧 Key Features

### Authentication Flow

1. **GitHub OAuth**: Secure authentication using GitHub accounts
2. **JWT Tokens**: Stateless authentication with JWT token management
3. **Session Persistence**: Automatic session restoration and management
4. **Protected Routes**: Secure API endpoints with authentication middleware

### AI-Powered Learning

1. **Smart Suggestions**: AI analyzes your vocabulary to suggest relevant new words
2. **Contextual Learning**: Get word recommendations based on your learning patterns
3. **Natural Language Processing**: Advanced AI understanding of vocabulary context
4. **Personalized Experience**: Tailored suggestions for your English proficiency level

## 📡 API Endpoints

### Words Management

```
GET    /api/words               # List words with pagination and filtering
POST   /api/words               # Create new word
GET    /api/words/:id           # Get specific word
PUT    /api/words/:id           # Update word
DELETE /api/words/:id           # Delete word
GET    /api/categories          # List all categories
```

### AI Integration

```
POST   /api/ai/word-suggestions      # Get AI-powered vocabulary suggestions
POST   /api/ai/conversation-analysis # Analyze conversation for vocabulary gaps
POST   /api/ai/vocabulary-help       # Get help with specific vocabulary questions
```

### Authentication

```
POST   /api/auth/github         # GitHub OAuth authentication
GET    /api/auth/me            # Get current user information
POST   /api/auth/logout        # Logout and invalidate session
```

### Health Check

```
GET    /health                  # Health check endpoint
```

## 🎯 Current Implementation Status

### ✅ Fully Functional Features

- **Complete Authentication System**: GitHub OAuth with JWT token management
- **Vocabulary Management**: Full CRUD operations with rich metadata
- **AI Integration**: Google Gemini AI for intelligent word suggestions
- **Real-time Search**: Advanced filtering and search capabilities
- **Learning Analytics**: Progress tracking and statistics dashboard
- **Responsive UI**: Modern design with Tailwind CSS and Shadcn/ui
- **Cross-platform**: Web application with Tauri desktop support

### 🔧 Technical Achievements

- **Type-safe Architecture**: Rust backend with TypeScript frontend
- **Production-ready Deployment**: Shuttle.rs backend hosting
- **Modern Development Stack**: Latest versions of all frameworks
- **Comprehensive Error Handling**: Robust error management throughout
- **Performance Optimized**: Efficient database queries and caching

## 🚀 Quick Start

1. **Clone the repository**:
```bash
git clone <repository-url>
cd LexiFlow
```

2. **Set up environment variables** (see Environment Setup section above)

3. **Start the backend**:
```bash
cd backend
cargo shuttle run --port 8000
```

4. **Start the frontend**:
```bash
cd frontend
npm install
npm run dev
```

5. **Access the application**:
   - Web: http://localhost:3000
   - Desktop: `npm run tauri dev`

## 🛠 Development Commands

### Backend
```bash
cargo shuttle run --port 8000    # Run backend server
cargo check                      # Check code compilation
cargo clippy                     # Lint code
cargo fmt                        # Format code
```

### Frontend
```bash
npm run dev                       # Start development server
npm run build                     # Build for production
npm run lint                      # Lint TypeScript/React
npm run tauri dev                 # Run desktop app
```

## 📋 Project Features Overview

### Authentication & Security
- ✅ GitHub OAuth 2.0 integration
- ✅ JWT token-based authentication
- ✅ Secure session management
- ✅ Protected API endpoints

### Vocabulary Management
- ✅ Complete CRUD operations
- ✅ Rich word metadata (translation, phonetics, examples)
- ✅ Category-based organization
- ✅ Real-time search and filtering
- ✅ Data validation and error handling

### AI Integration
- ✅ Google Gemini AI integration
- ✅ Intelligent word suggestions
- ✅ Contextual vocabulary recommendations
- ✅ Natural language processing capabilities

### Technical Stack
- ✅ Rust backend with Axum framework
- ✅ Next.js frontend with TypeScript
- ✅ PostgreSQL database with type-safe queries
- ✅ Tauri desktop application support
- ✅ Modern UI with Tailwind CSS and Shadcn/ui

---

**LexiFlow** - Advanced AI-powered English vocabulary learning platform built with modern full-stack technologies! 🚀
