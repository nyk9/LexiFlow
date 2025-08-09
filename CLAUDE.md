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

1. **Initialize Next.js project with TypeScript**
2. **Setup Neon database and Prisma configuration**
3. **Implement Auth.js authentication system**
4. **Define OpenAPI contract for all endpoints**
5. **Create vocabulary management MVP**
6. **Integrate Gemini API for conversation features**
