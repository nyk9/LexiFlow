# English Learning App Requirements Definition - Updated 2025-08-07

## IMPORTANT: Requirements Evolution Note

The project has evolved from the original LexiFlow vocabulary app concept to a focused English learning application with AI conversation features. See "Current Requirements Discussion" section below for latest requirements.

## App Concept Finalized (August 7, 2025)

### Core App Vision ✅

**Hybrid Vocabulary + AI Conversation Learning App**

The app combines manual vocabulary collection with natural AI conversation practice, where AI intelligently suggests new vocabulary based on conversation analysis.

#### What the App WILL Do:

- ✅ Manual vocabulary collection with rich metadata (definitions, phonetics, examples, translations)
- ✅ Free-form AI conversation practice for natural dialogue
- ✅ AI analyzes conversations and suggests relevant vocabulary to add based on user struggles or knowledge gaps
- ✅ Simple, focused integration between vocabulary management and conversation features

#### What the App Will NOT Do:

- ❌ Grammar/writing correction focus
- ❌ Structured course curriculum with lessons/modules
- ❌ Separate disconnected vocabulary and conversation systems
- ❌ Vocabulary-forced conversations (AI creating conversations around specific words)
- ❌ Overly complex bidirectional AI systems

### Current Requirements Discussion (August 5-7, 2025)

#### Finalized Requirements

##### Learning Objectives

- **Target Level**: B2 English proficiency
- **Learning Methods**:
  1. User-initiated word registration with rich metadata
  2. Real-time English conversation with AI
  3. AI-suggested vocabulary based on conversation analysis

##### Word Management Features

- **Word Card Metadata**:
  - Part of speech
  - Example sentences
  - Phonetic symbols
  - Detailed semantic definitions
  - Japanese translation

##### AI Conversation Features - FINALIZED ✅

- **Conversation Style**: Free-form natural dialogue (not vocabulary-focused)
- **AI Intelligence**: Analyzes user conversation for vocabulary gaps and suggests new words
- **Integration**: One-way learning flow (AI suggests → user adds to vocabulary collection)

**Vocabulary Detection System**:

- **Primary Method**: Post-conversation automatic analysis (non-disruptive)
- **Secondary Method**: User-controlled mid-conversation vocabulary queries

**Mid-Conversation Vocabulary Help**:

- **Trigger**: User explicitly asks vocabulary questions during conversation
- **Response Mode**: Full vocabulary tutor pause mode until user chooses to resume conversation
- **Features**: Detailed word explanations, usage examples, context tips, immediate add-to-collection option

**Post-Conversation Vocabulary Suggestions**:

- **Presentation**: Interactive swipeable cards interface
- **Content**: AI-suggested words based on conversation gap analysis
- **User Actions**: Swipe right to add to vocabulary collection, swipe left to dismiss
- **Word Data**: Each suggestion includes definition, pronunciation, example usage

**Complete User Experience Flow**:

1. **Natural AI Conversation** → Free-form dialogue practice
2. **Optional Vocabulary Pause** → Ask vocabulary questions anytime, AI switches to tutor mode
3. **Resume Conversation** → Return to natural dialogue when ready
4. **End Conversation** → AI presents vocabulary suggestion cards
5. **Swipe to Collect** → Build vocabulary collection from AI suggestions

##### Progress Indicators

- Number of logins
- Number of registered words
- Conversation session metrics (future consideration)

##### Project Constraints

- **Purpose**: Personal development (non-profit)
- **Budget**: Practically 0 yen
- **Development Time**:
  - Weekdays: 1 hour/day
  - Weekends: 1-7 hours/day

### Items Under Consideration

#### Technology Stack

- **Frontend**: Next.js for MVP (considering future Nuxt migration)
- **Cross-platform**: Considering Tauri 2.0 for mobile
- **Database Options**: Leapcell, Shuttle, Neon, Supabase
- **Voice Features**: Web Speech API + Gemini API

#### Unresolved Technical Decisions

- Database selection criteria
- Multi-device synchronization implementation
- Web API implementation for cross-platform
- AI conversation difficulty adjustment mechanisms
- Privacy and data management approach

## Technical Architecture - FINALIZED ✅ (August 7, 2025)

### Data Storage Strategy

**Conversation Data Approach**: Store meaningful learning data rather than raw transcripts

- ✅ **Conversation Flow**: Topic progression + Linguistic complexity analysis
- ✅ **Skills Assessment**: Accuracy metrics (grammar, vocabulary appropriateness, sentence complexity) + Fluency indicators (conversation flow smoothness, response timing, natural phrase usage)
- ✅ **Vocabulary Suggestions**: Contextual storage with conversation context where words were identified

### Complete Database Schema

**Legacy Tables** (from original requirements):

```sql
-- Core user management
users: id, email, password_hash, created_at, updated_at

-- User vocabulary collection
words: id, user_id, word, meaning, translation, category, part_of_speech, phonetic, example, created_at, updated_at

-- Vocabulary categories
categories: id, user_id, name, description, created_at
```

**New AI Conversation Tables**:

```sql
-- Conversation sessions
conversation_sessions: id, user_id, started_at, ended_at, duration_minutes

-- Topic progression tracking (conversation flow)
conversation_topics: id, session_id, topic, order_sequence, complexity_level, created_at

-- Linguistic complexity analysis (conversation flow)
linguistic_analysis: id, session_id, avg_sentence_length, vocabulary_level, grammar_complexity, created_at

-- Skills assessment (accuracy & fluency metrics)
skills_assessments: id, session_id, grammar_accuracy_score, vocabulary_appropriateness_score, sentence_complexity_score, flow_smoothness_score, response_timing_avg, natural_phrase_usage_score, created_at

-- Contextual vocabulary suggestions
vocabulary_suggestions: id, session_id, suggested_word, user_word_used, conversation_context, suggestion_reason, status, created_at
```

### Data Architecture Decisions

**What We Store**:

- ✅ Conversation flow patterns and topic progression
- ✅ Linguistic complexity metrics for learning assessment
- ✅ Vocabulary suggestions with conversation context
- ✅ Skills assessment scores (accuracy + fluency)

**What We Don't Store**:

- ❌ Complete conversation transcripts (privacy + storage efficiency)
- ❌ Interaction patterns or engagement metrics (not essential for B2 learning)
- ❌ Abstract skill categories or language functions (too complex for MVP)

## Platform Decision - FINALIZED ✅ (August 7, 2025)

### Development Path: Start Simple Evolution

**Decision Made**: Progressive development path starting with familiar technologies, evolving to Rust learning goals.

**Phase 1 - MVP (Immediate Focus)**:

- **Frontend**: Next.js 15+ (App Router) with TypeScript
- **Backend**: Next.js API Routes (familiar, fast development)
- **Database**: Web-friendly option (Supabase or Neon)
- **Voice**: Web Speech API (frontend) + Gemini API (via API Routes)
- **Deployment**: Vercel (frontend) + database hosting
- **Focus**: Get working conversation + vocabulary features quickly

**Phase 2 - Backend Migration (Future)**:

- **Frontend**: Keep existing Next.js frontend
- **Backend**: Migrate API Routes to Rust + Axum server
- **Database**: Migrate to PostgreSQL with Diesel
- **Focus**: Learn Rust backend development with working features

**Phase 3 - Platform Expansion (Optional)**:

- **Desktop**: Consider Tauri wrapper if desired
- **Mobile**: Progressive Web App capabilities
- **Focus**: Multi-platform access if needed

### Architecture Benefits

**Advantages of Evolution Path**:

- ✅ **Immediate productivity**: Start coding today with comfortable Next.js
- ✅ **Risk mitigation**: Working app first, then technology experiments
- ✅ **Incremental learning**: Rust practice when features are stable
- ✅ **Flexibility**: Can stop at any phase based on satisfaction
- ✅ **Time constraint friendly**: Matches 1-hour daily development limit

**What This Approach Avoids**:

- ❌ Complex setup blocking initial development
- ❌ Learning multiple new technologies simultaneously
- ❌ Abandoning incomplete projects due to complexity
- ❌ Analysis paralysis from too many technical choices

### Updated Technology Stack

**Phase 1 (MVP) Technology Stack**:

- **Frontend**: Next.js 15+ (App Router) + TypeScript 5+
- **Styling**: Tailwind CSS + Shadcn/ui
- **State Management**: React Query/TanStack Query
- **Backend**: Next.js API Routes
- **Database**: Supabase or Neon PostgreSQL
- **AI Integration**: Gemini API via backend
- **Voice**: Web Speech API (browser-based)
- **Authentication**: Next-Auth or custom simple auth
- **Deployment**: Vercel

**Phase 2 Migration Targets**:

- **Backend**: Rust + Axum + Diesel
- **Database**: Self-managed PostgreSQL
- **Authentication**: JWT + Argon2
- **Deployment**: Backend on Shuttle.rs or similar

## Final Technology Stack - FINALIZED ✅ (August 7, 2025)

### Technology Decisions Based on AI Analysis

**Core Stack (Phase 1 MVP)**:

- **Database**: **Neon PostgreSQL** (chosen for clean Rust migration path)
- **Authentication**: **Auth.js** with JWT (easily replicable in Rust)
- **ORM**: **Prisma** (excellent Next.js integration and Auth.js compatibility)
- **AI Provider**: **Gemini API** (free tier) with staged upgrade path
- **API Design**: **OpenAPI-first** for clean migration contracts

**Why Neon over Supabase**:

- ✅ **Rust Migration Ready**: Pure PostgreSQL, no vendor lock-in
- ✅ **Auth.js Compatibility**: JWT verification easily replicated in Rust
- ✅ **Portable Schema**: Same database works for Next.js and Rust phases
- ✅ **No Migration Overhead**: Same data, just different API endpoints

### Enhanced Database Schema (8 Tables)

**Core Tables**:

```sql
-- User management
users(id, email, created_at, updated_at)

-- User vocabulary collection with rich metadata
words(id, user_id, word, meaning, translation, category, part_of_speech, phonetic, example, created_at, updated_at)

-- Vocabulary categories
categories(id, user_id, name, description, created_at)
```

**AI Conversation Analytics Tables**:

```sql
-- Conversation sessions
conversation_sessions(id, user_id, started_at, ended_at, duration_minutes)

-- Topic progression tracking (conversation flow)
conversation_topics(id, session_id, topic, order_sequence, complexity_level, created_at)

-- Linguistic complexity analysis (conversation flow)
linguistic_analysis(id, session_id, avg_sentence_length, vocabulary_level, grammar_complexity, created_at)

-- Skills assessment (accuracy & fluency metrics)
skills_assessments(id, session_id, grammar_accuracy_score, vocabulary_appropriateness_score, sentence_complexity_score, flow_smoothness_score, response_timing_avg, natural_phrase_usage_score, created_at)

-- Contextual vocabulary suggestions with conversation context
vocabulary_suggestions(id, session_id, suggested_word, user_word_used, conversation_context, suggestion_reason, status, created_at)
```

### API Architecture Strategy

**Phase 1 (Next.js API Routes)**:

- OpenAPI contract definition from day one
- Provider interface for swappable AI models (Gemini → Local → Premium)
- JWT-based authentication with Auth.js
- Prisma ORM with excellent Next.js integration

**Phase 2 (Rust Migration)**:

- Implement identical API contracts in Axum
- Reuse same Neon PostgreSQL database
- Frontend changes only API base URL via environment variable
- Gradual endpoint migration (start with conversation API)

**Caching Strategy**:

To manage API costs and improve response times, especially for AI-related endpoints, a two-phase caching strategy will be implemented.

- **Phase 1 (MVP)**: **In-memory cache** using a simple `Map` object within the API route.
  - **Pros**: Zero cost, extremely fast, easy to implement for development.
  - **Cons**: Not persistent (cache is lost on server restart) and not shared across serverless instances. Suitable for initial development and testing.
- **Phase 2 (Production/Scale)**: **Vercel KV (Redis)** for a robust, persistent cache.
  - **Pros**: High performance, data persistence, and shared across all serverless functions, making it ideal for production.
  - **Cons**: Introduces a managed service dependency.

### AI Provider Evolution Strategy

- **Phase 1**: Gemini free tier (MVP)
- **Phase 2**: Local LLM option (offline/zero-cost)
- **Phase 3**: Premium APIs (GPT/Claude high-quality)
- **All providers**: Same response format, UI unchanged

### Development Timeline

**Week 1**: Next.js scaffold + Auth.js + Neon connection + Prisma schema + OpenAPI draft
**Week 2**: Vocabulary CRUD + UI (Chrome-first)
**Week 3**: Conversation API + TTS integration + Gemini connection
**Week 4**: Assessment logic + difficulty adjustment
**Week 5+**: Rust backend development + gradual migration

### Immediate Next Steps

1. ✅ **Initialize Next.js project with TypeScript**
2. ✅ **Setup Neon database and Prisma configuration**
3. **Implement Auth.js authentication system**
4. **Define OpenAPI contract for all endpoints**
5. ✅ **Create vocabulary management MVP**
6. ✅ **Integrate Gemini API for conversation features**

## Development Progress - Updated 2025-09-17

### Current Implementation Status

**Phase 2 Progress**: **Project has evolved to full Rust backend architecture with Tauri desktop application**. The implementation has progressed beyond the original Next.js MVP to a production-ready full-stack application.

#### ✅ Completed Features

**Full-Stack Architecture**:

- **Frontend**: Next.js 14+ with TypeScript and App Router
- **Backend**: Rust with Axum 0.7+ web framework
- **Database**: PostgreSQL 15+ with Diesel ORM
- **Desktop**: Tauri 2.0 integration for cross-platform desktop app
- **Deployment**: Shuttle.rs platform for Rust backend

**Core Vocabulary Management**:

- Complete CRUD operations for vocabulary entries
- Rich word metadata (word, meaning, translation, category, part_of_speech, phonetic, example)
- Advanced search and filtering across all word fields
- Category-based organization (Business, Technology, Academic, etc.)
- Real-time search functionality
- Pagination for large vocabulary collections
- Data validation on both frontend and backend

**Analytics & Progress Tracking**:

- Learning statistics dashboard with comprehensive metrics
- Daily activity tracking and learning streaks
- Progress visualization with charts and analytics
- Recent activity monitoring
- Category distribution analysis
- Total word count and learning insights

**Modern UI/UX**:

- Responsive design with mobile-first approach
- Tailwind CSS 3+ with Shadcn/ui component library
- Radix UI primitives with custom styling
- TanStack Query (React Query) for server state management
- React Hook Form with Zod validation
- Loading states and comprehensive error handling

**Backend Infrastructure**:

- Type-safe Rust backend with Axum framework
- PostgreSQL database with Diesel ORM
- Automated database migrations
- JWT token authentication (ready for implementation)
- Comprehensive API validation with Validator crate
- Health check endpoints for monitoring

**Project Structure**:

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
├── CLAUDE.md                     # Project requirements and progress
└── README.md                     # Project overview and setup
```

### Database Schema Implementation

**Implemented Database Tables (PostgreSQL)**:

**Core Tables**:
```sql
-- Words table with complete metadata
words (
  id UUID PRIMARY KEY,
  word VARCHAR NOT NULL,
  meaning TEXT NOT NULL,
  translation TEXT NOT NULL,
  category VARCHAR NOT NULL,
  part_of_speech VARCHAR NOT NULL,
  example TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)

-- Categories for word organization
categories (
  id UUID PRIMARY KEY,
  name VARCHAR UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
)

-- Learning activities tracking
learning_activities (
  id UUID PRIMARY KEY,
  activity_type VARCHAR NOT NULL,
  date DATE NOT NULL,
  count INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

### API Endpoints (Rust Backend)

**Words Management**:
```
GET    /api/words               # List words with pagination and filtering
POST   /api/words               # Create new word
GET    /api/words/:id           # Get specific word
PUT    /api/words/:id           # Update word
DELETE /api/words/:id           # Delete word
GET    /api/categories          # List all categories
```

**Statistics & Analytics**:
```
GET    /api/statistics          # Get learning statistics
POST   /api/statistics          # Record learning activity
```

**System**:
```
GET    /health                  # Health check endpoint
```

## Rust Backend Migration Plan - Updated 2025-09-17

### Frontend Analysis & Backend Design

**Migration Status**: Moving from Next.js MVP (completed) to full Rust backend implementation.

#### 🔍 Frontend Schema Analysis (Prisma → Rust)

**Existing Database Schema** (Neon PostgreSQL via Prisma):

```sql
-- Auth.js compatible user management  
users (
  id: String @id @default(cuid()),
  name: String?,
  email: String @unique,
  emailVerified: DateTime?,
  image: String?,
  createdAt: DateTime @default(now()),
  updatedAt: DateTime @updatedAt,
  accounts: Account[],
  sessions: Session[],
  words: Word[],
  dateRecords: DateRecord[]
)

-- Complete word metadata with user isolation
words (
  id: String @id @default(cuid()),
  word: String,
  meaning: String,
  translation: String?,
  partOfSpeech: String[],      # JSON array
  phonetic: String?,
  example: String?,
  category: String?,
  userId: String,              # Foreign key to users
  user: User,
  createdAt: DateTime @default(now()),
  updatedAt: DateTime @updatedAt
)

-- Daily learning activity tracking
date_records (
  id: String @id @default(cuid()),
  date: String,                # YYYY-MM-DD format
  add: Int @default(0),        # Words added count
  update: Int @default(0),     # Words updated count  
  quiz: Int @default(0),       # Quiz sessions count
  userId: String,
  user: User,
  createdAt: DateTime @default(now()),
  updatedAt: DateTime @updatedAt,
  @@unique([date, userId])     # One record per user per day
)
```

#### 🦀 Rust Backend API Design

**Complete API Specification**:

```rust
// === AUTHENTICATION ===
POST   /api/auth/login         // JWT authentication
POST   /api/auth/register      // User registration  
GET    /api/auth/me           // Current user info

// === VOCABULARY MANAGEMENT ===
GET    /api/words             // User's word list (paginated, filtered)
POST   /api/words             // Create new word
GET    /api/words/:id         // Get specific word details
PUT    /api/words/:id         // Update word
DELETE /api/words/:id         // Delete word

// === LEARNING ANALYTICS ===
GET    /api/statistics        // Learning stats & streaks
POST   /api/statistics/record // Record learning activity
GET    /api/statistics/daily  // Daily activity breakdown

// === AI FEATURES ===
POST   /api/ai/suggestions    // AI word suggestions (Claude/Gemini)
POST   /api/ai/quiz          // Generate vocabulary quiz
POST   /api/ai/conversation  // Conversation practice (future)

// === SYSTEM ===
GET    /health               // Health check
```

#### 🗄️ Rust Data Models

**Prisma-Compatible Rust Structs**:

```rust
// Auth.js compatible user model
#[derive(sqlx::FromRow, Serialize, Deserialize)]
pub struct User {
    pub id: String,                    // cuid
    pub email: String,        
    pub name: Option<String>,
    pub email_verified: Option<DateTime<Utc>>,
    pub image: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

// Complete word model with metadata
#[derive(sqlx::FromRow, Serialize, Deserialize)]
pub struct Word {
    pub id: String,                    // cuid
    pub word: String,
    pub meaning: String,
    pub translation: Option<String>,
    pub part_of_speech: Vec<String>,   // JSON array in PostgreSQL
    pub phonetic: Option<String>,
    pub example: Option<String>,
    pub category: Option<String>,
    pub user_id: String,               // Foreign key
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

// Learning activity tracking
#[derive(sqlx::FromRow, Serialize, Deserialize)]
pub struct DateRecord {
    pub id: String,                    // cuid
    pub date: String,                  // YYYY-MM-DD
    pub add: i32,                     // Words added today
    pub update: i32,                  // Words updated today
    pub quiz: i32,                    // Quiz sessions today
    pub user_id: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}
```

#### 🔧 Migration Strategy

**Phase 1: Data Preservation**
- ✅ **Disable migrations**: Comment out `sqlx::migrate!` to protect existing Neon data
- ✅ **Schema compatibility**: Ensure Rust models match existing Prisma schema exactly
- ✅ **Gradual rollout**: Implement endpoints one by one while keeping Next.js API active

**Phase 2: API Implementation**
- 🔄 **Authentication**: JWT token system compatible with Auth.js
- 🔄 **CRUD Operations**: Full vocabulary management with user isolation
- 🔄 **Statistics**: Learning analytics and progress tracking
- 🔄 **AI Integration**: Claude/Gemini API for suggestions and quiz generation

**Phase 3: Production Deployment**  
- 🔄 **Environment Config**: Frontend switches API base URL
- 🔄 **Data Validation**: Comprehensive input validation and error handling
- 🔄 **Performance**: Query optimization and response caching
- 🔄 **Monitoring**: Health checks and logging

#### 📊 Feature Completeness Analysis

**✅ Currently Implemented (Next.js)**:
- User authentication (Auth.js)
- Complete vocabulary CRUD
- Learning activity tracking  
- AI word suggestions (Claude)
- Statistics dashboard

**🔄 Missing for Rust Backend**:
- JWT authentication system
- User registration/login endpoints
- Vocabulary CRUD with user isolation
- Learning statistics API
- AI integration endpoints
- Quiz generation functionality

#### 📋 Next Development Priorities

**Phase 1: Core Backend (Week 1-2)**:
1. **Authentication System**: JWT-based auth compatible with existing users
2. **Vocabulary API**: Complete CRUD with user isolation and validation
3. **Statistics API**: Learning analytics and progress tracking

**Phase 2: AI Integration (Week 3-4)**:
1. **AI Suggestions**: Claude/Gemini integration for word recommendations
2. **Quiz Generation**: AI-powered vocabulary quizzes
3. **Conversation Features**: Basic conversation practice framework

**Phase 3: Production Ready (Week 5+)**:
1. **Performance Optimization**: Query optimization and caching
2. **Monitoring & Logging**: Health checks and error tracking  
3. **Deployment Pipeline**: Automated CI/CD with Shuttle.rs

### Technical Implementation Details

**Current Production Stack**:

- **Frontend**: Next.js 14+ with TypeScript 5+
- **Backend**: Rust with Axum 0.7+ framework
- **Database**: PostgreSQL 15+ with Diesel ORM
- **Styling**: Tailwind CSS 3+ with Shadcn/ui
- **State Management**: TanStack Query for server state
- **Form Handling**: React Hook Form with Zod validation
- **Desktop**: Tauri 2.0 for cross-platform application
- **Deployment**: Shuttle.rs (backend), Vercel (frontend)

**Development Workflow**:

1. **Full-Stack Development**: Rust backend with Next.js frontend
2. **Type Safety**: Auto-generated TypeScript types from Rust models
3. **Database Management**: Diesel migrations for schema changes
4. **Quality Assurance**: Comprehensive validation and error handling
5. **Performance**: Optimized queries with proper indexing
6. **User Experience**: Responsive design with real-time search and filtering

**Key Features Achieved**:

- ✅ Complete vocabulary CRUD operations
- ✅ Advanced search and filtering
- ✅ Learning progress tracking and analytics
- ✅ Category-based organization
- ✅ Responsive modern UI
- ✅ Type-safe full-stack architecture
- ✅ Production-ready deployment setup
