# LexiFlow - AI-Powered English Learning Application

LexiFlow is a hybrid vocabulary + AI conversation learning application built with modern technologies. It combines manual vocabulary collection with natural AI conversation practice, where AI intelligently suggests new vocabulary based on conversation analysis.

## 📦 Project Structure

This repository contains a unified Next.js codebase that can be built for two different targets:

- **Web Version (default)** - Next.js browser-based application with SSR/PPR support for Vercel deployment
- **Desktop Version (planned)** - Tauri desktop application with static export
- **`/desktop/`** - Tauri configuration and Rust backend (Phase 2)
- **`/backend/`** - Rust API Server (Phase 2) - Axum backend for future migration

### Single Codebase, Multiple Targets

Using the `BUILD_TARGET` environment variable, the same Next.js codebase can be configured for different deployment scenarios:

| Feature             | Web Version (`BUILD_TARGET=web`) | Desktop Version (`BUILD_TARGET=desktop`) |
| ------------------- | -------------------------------- | ---------------------------------------- |
| **Build Output**    | Dynamic (SSR/ISR/PPR)            | Static Export                            |
| **Cache Strategy**  | Server-side (Vercel KV/Redis)    | Local (SQLite/IndexedDB)                 |
| **Cache Sharing**   | ✅ Shared across users           | ❌ Per-user only                         |
| **API Cost**        | 💰 Lower (shared cache)          | 💰 Higher (no sharing)                   |
| **Database**        | Prisma + PostgreSQL              | Rust + SQLite (via Tauri commands)       |
| **Offline Mode**    | ❌ Limited                       | ✅ Full support                          |
| **Native Features** | ❌ Browser restricted            | ✅ Full OS integration                   |
| **Deployment**      | Vercel/Cloud                     | App Store/Direct                         |

**Key Design Decision**: Server-side caching in Web version allows multiple users to share API response caches, significantly reducing Gemini API costs. Desktop version requires local-only caching, resulting in higher API usage per user.

See desktop README for Tauri-specific implementation details:

- [Desktop Version README](./desktop/README.md)

## 🚀 Features

### Core Functionality

- ✅ **Manual Vocabulary Collection**: Rich metadata (definitions, phonetics, examples, translations)
- ✅ **AI Conversation Practice**: Free-form natural dialogue with AI (B2 English level)
- ✅ **AI Vocabulary Suggestions**: AI analyzes conversations and suggests relevant vocabulary
- ✅ **Post-Conversation Review**: Swipeable card interface for vocabulary collection
- ✅ **Mid-Conversation Help**: Ask vocabulary questions during conversation (tutor mode)
- ✅ **Conversation Analytics**: Topic progression, skills assessment, linguistic analysis

### Vocabulary Management

- **Rich Word Metadata**: Part of speech, phonetic symbols, example sentences, Japanese translation
- **Category Organization**: Organize words by custom categories
- **Real-time Search**: Search across words, meanings, and translations
- **CRUD Operations**: Full create, read, update, delete functionality

### AI Conversation Features

- **Natural Dialogue**: Free-form conversation practice (not vocabulary-focused)
- **Voice Input/Output**: Web Speech API for speaking and listening
- **Dual Input Modes**: Voice or text input during conversation
- **Vocabulary Detection**: AI suggests words based on conversation gaps
- **Contextual Learning**: Words presented with conversation context

### Analytics & Progress Tracking

- **Conversation Sessions**: Track duration, topics, and complexity
- **Skills Assessment**: Grammar accuracy, vocabulary appropriateness, fluency scores
- **Linguistic Analysis**: Sentence complexity, vocabulary level metrics
- **Learning Progress**: Visualize improvement over time

## 🛠 Technology Stack

### Phase 1 MVP (Current - Web版)

**Frontend:**

- **Framework**: Next.js 15.4.6 (App Router) with TypeScript 5+
- **Styling**: Tailwind CSS 4+ with Shadcn/ui components
- **State Management**: React Query (TanStack Query)
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: Radix UI primitives

**Backend:**

- **API**: Next.js API Routes (serverless)
- **Database**: Neon PostgreSQL (serverless)
- **ORM**: Prisma 6+
- **Authentication**: Auth.js (Next-Auth 5.0) with JWT
- **AI Provider**: Gemini API (gemini-2.5-flash-lite)
- **Caching**: In-memory cache → Vercel KV (production)

**Voice Features:**

- **Speech Recognition**: Web Speech API (browser-native)
- **Text-to-Speech**: Web Speech API

**Deployment:**

- **Frontend**: Vercel
- **Database**: Neon (managed PostgreSQL)

### Phase 2 (Planned - Rust Backend Migration)

**Backend:**

- **Language**: Rust
- **Framework**: Axum + Diesel
- **Database**: Same Neon PostgreSQL (no migration needed)
- **Authentication**: JWT (compatible with Auth.js tokens)
- **Deployment**: Shuttle.rs or similar

**Migration Strategy:**

- OpenAPI-first design for clean API contracts
- Frontend changes only `NEXT_PUBLIC_API_URL` environment variable
- Gradual endpoint migration (conversation API first)
- Same database, different API layer

## 📁 Project Structure

```
LexiFlow/
├── src/                         # Next.js Application (Web & Desktop)
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Authentication routes (login, signup)
│   │   ├── (main)/             # Main app routes
│   │   │   ├── page.tsx        # Home (word list)
│   │   │   ├── add/            # Add new word
│   │   │   ├── conversation/   # AI conversation
│   │   │   ├── quiz/           # Review/quiz
│   │   │   └── test/           # Test pages
│   │   └── api/                # Next.js API Routes (Web version only)
│   │       ├── words/
│   │       ├── conversation/
│   │       │   ├── session/    # Session management
│   │       │   ├── chat/       # AI chat endpoint
│   │       │   ├── analyze/    # Conversation analysis
│   │       │   └── suggestions/# Vocabulary suggestions
│   │       └── suggestion-word/
│   ├── features/               # Feature-based modules
│   │   ├── vocabulary/
│   │   │   ├── components/
│   │   │   ├── lib/
│   │   │   └── types/
│   │   ├── conversation/
│   │   │   ├── components/
│   │   │   ├── lib/
│   │   │   └── types/
│   │   └── suggestions/
│   ├── components/             # Shared UI components
│   │   └── ui/                 # Shadcn/ui components
│   ├── lib/                    # Shared utilities
│   ├── hooks/                  # Custom React hooks
│   ├── types/                  # Global TypeScript types
│   └── constants/
│
├── prisma/                     # Database configuration
│   ├── schema.prisma           # Database schema (8 tables)
│   └── migrations/
│
├── public/                     # Static assets
├── scripts/                    # Build and utility scripts
│
├── desktop/                    # Tauri Desktop App (Phase 2 - Planned)
│   ├── src-tauri/              # Rust backend (Tauri commands)
│   │   ├── src/
│   │   │   ├── commands/       # Tauri commands
│   │   │   ├── cache/          # Local SQLite cache
│   │   │   └── services/
│   │   └── Cargo.toml
│   └── README.md               # Desktop version documentation
│
├── backend/                    # Rust API Server (Phase 2 - Planned)
│   ├── src/
│   │   ├── routes/             # Axum routes
│   │   ├── models/             # Diesel models
│   │   ├── handlers/
│   │   └── services/
│   ├── migrations/             # Diesel migrations
│   └── Cargo.toml
│
├── .env.example                # Environment variables template
├── auth.config.ts              # Auth.js configuration
├── next.config.ts              # Next.js configuration (BUILD_TARGET support)
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── CLAUDE.md                   # Detailed requirements & architecture
└── README.md                   # This file
```

### Database Schema (8 Tables)

**Core Tables:**

- `users` - User management
- `words` - Vocabulary collection with rich metadata
- `categories` - Vocabulary categories

**AI Conversation Analytics Tables:**

- `conversation_sessions` - Conversation session tracking
- `conversation_topics` - Topic progression tracking
- `linguistic_analysis` - Linguistic complexity metrics
- `skills_assessments` - Grammar, vocabulary, fluency scores
- `vocabulary_suggestions` - Contextual word suggestions with conversation context

## 🚦 Getting Started (Web Version - Phase 1 MVP)

### Prerequisites

- **Node.js** 18+ and npm
- **Neon PostgreSQL** account (free tier available)
- **Gemini API** key (free tier available)
- **Git** for version control

### Quick Start

1. **Clone the repository:**

```bash
git clone https://github.com/yourusername/LexiFlow.git
cd LexiFlow
```

2. **Install dependencies:**

```bash
npm install
```

3. **Set up environment variables:**

Copy the example file and edit with your credentials:

```bash
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL, AUTH_SECRET, and GOOGLE_GEMINI_API_KEY
```

4. **Initialize database:**

```bash
npx prisma generate
npx prisma db push
```

5. **Start development server:**

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Development Commands

```bash
# Web version (default)
npm run dev              # Start dev server with Turbopack
npm run dev:web          # Explicitly start web version
npm run build            # Production build (web)
npm run build:web        # Explicitly build web version

# Desktop version (Tauri - Phase 2)
npm run dev:desktop      # Start desktop version dev server
npm run build:desktop    # Build static export for desktop

# Other commands
npm run start            # Start production server
npm run lint             # Run ESLint
npm run format           # Format with Prettier
npm run generate         # Generate Prisma Client + build
```

## 🔧 Configuration

### Environment Variables

**Required:**

```bash
# Build Target
BUILD_TARGET="web"                           # 'web' for Vercel, 'desktop' for Tauri

# Database (Web version only)
DATABASE_URL="postgresql://..."              # Neon PostgreSQL connection string

# Authentication
AUTH_SECRET="random-secret-key"              # Generate with: openssl rand -base64 32
AUTH_URL="http://localhost:3000"             # Your app URL

# AI Provider
GOOGLE_GEMINI_API_KEY="your-gemini-api-key" # Get from Google AI Studio
```

**Optional:**

```bash
# App Configuration
NEXT_PUBLIC_APP_NAME="LexiFlow"
NEXT_PUBLIC_API_URL="http://localhost:3000" # For Phase 2 Rust backend

# Caching (Production - Web version only)
KV_URL="redis://..."                         # Vercel KV for production caching
KV_REST_API_URL="https://..."
KV_REST_API_TOKEN="..."
```

### BUILD_TARGET Configuration

The `BUILD_TARGET` environment variable controls how Next.js is configured:

- **`BUILD_TARGET=web`** (default): Enables dynamic rendering, SSR, API Routes, Prisma
- **`BUILD_TARGET=desktop`**: Enables static export, disables image optimization for Tauri

See `.env.example` for a complete template with all available options.

## 📡 API Endpoints

### Vocabulary Management

```
GET    /api/words               # List user's vocabulary
POST   /api/words               # Add new word
GET    /api/words/:id           # Get specific word
PUT    /api/words/:id           # Update word
DELETE /api/words/:id           # Delete word
```

### AI Vocabulary Suggestions

```
POST   /api/suggestion-word/gemini  # Get AI vocabulary recommendations
                                     # (Uses intelligent caching)
```

### Conversation Management

```
POST   /api/conversation/session              # Create new session
GET    /api/conversation/session              # Get recent sessions
PUT    /api/conversation/session/:id          # End session
GET    /api/conversation/session/:id          # Get session details
```

### AI Chat

```
POST   /api/conversation/chat                 # Send message, get AI response
                                              # (Context-aware, B2 level)
```

### Conversation Analysis

```
POST   /api/conversation/analyze              # Analyze conversation
                                              # Returns: topics, skills, suggestions
GET    /api/conversation/suggestions/:id     # Get session suggestions
PUT    /api/conversation/suggestions/:id     # Update suggestion status
```

### Authentication

```
POST   /api/auth/signin                       # Sign in
POST   /api/auth/signup                       # Sign up
POST   /api/auth/signout                      # Sign out
GET    /api/auth/session                      # Get current session
```

## 🗄 Database Schema (8 Tables)

### Core Tables

**users**

- User authentication and profile management

**words**

- Vocabulary collection with rich metadata
- Fields: word, meaning, translation, category, part_of_speech, phonetic, example
- Foreign key: userId

**categories**

- Custom vocabulary categories per user
- Foreign key: userId

### AI Conversation Analytics Tables

**conversation_sessions**

- Track conversation sessions with start/end timestamps
- Foreign key: userId

**conversation_topics**

- Topic progression during conversations
- Fields: topic, order_sequence, complexity_level
- Foreign key: sessionId

**linguistic_analysis**

- Linguistic complexity metrics per session
- Fields: avg_sentence_length, vocabulary_level, grammar_complexity
- Foreign key: sessionId

**skills_assessments**

- Skills evaluation per session
- Fields: grammar_accuracy_score, vocabulary_appropriateness_score,
  sentence_complexity_score, flow_smoothness_score,
  response_timing_avg, natural_phrase_usage_score
- Foreign key: sessionId

**vocabulary_suggestions**

- AI-suggested vocabulary with conversation context
- Fields: suggested_word, user_word_used, conversation_context,
  suggestion_reason, status (pending/accepted/dismissed)
- Foreign key: sessionId

See [Prisma Schema](./web-apps/frontend/prisma/schema.prisma) for complete definitions.

## 🏗 Development

### Adding New Features

1. **Backend Changes**:
   - Add new models in `src/models/`
   - Create handlers in `src/handlers/`
   - Update routes in `src/main.rs`
   - Add migrations if needed

2. **Frontend Changes**:
   - Add new pages in `src/app/`
   - Create components in `src/components/`
   - Update API client in `src/lib/api.ts`
   - Add TypeScript types in `src/types/`

### Code Quality

- **Rust**: Use `cargo fmt` and `cargo clippy` for code formatting and linting
- **TypeScript**: Use `npm run lint` and `npm run type-check`
- **Database**: Always create migrations for schema changes

## 🚀 Deployment

### Backend (Shuttle.rs)

```bash
cd backend
cargo shuttle deploy
```

### Frontend (Vercel)

```bash
cd frontend
vercel deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with modern web technologies and best practices
- Powered by Google Gemini API for intelligent conversation practice
- Inspired by the need for natural, context-driven vocabulary learning
- Leverages Next.js for optimal user experience
- Future Rust backend for performance and type safety

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

---

**LexiFlow** - Learn English naturally through AI conversation! 🌟

**Current Status**: Phase 1 MVP (Web版) - Active Development ✅
**Next Steps**: Conversation analytics visualization, mid-conversation vocabulary mode
