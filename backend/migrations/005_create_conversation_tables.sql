-- Create conversation_sessions table
CREATE TABLE IF NOT EXISTS conversation_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    duration_minutes INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create conversation_topics table
CREATE TABLE IF NOT EXISTS conversation_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES conversation_sessions(id) ON DELETE CASCADE,
    topic VARCHAR(255) NOT NULL,
    order_sequence INTEGER NOT NULL,
    complexity_level VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create linguistic_analysis table
CREATE TABLE IF NOT EXISTS linguistic_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES conversation_sessions(id) ON DELETE CASCADE,
    avg_sentence_length DECIMAL(5,2),
    vocabulary_level VARCHAR(50),
    grammar_complexity VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create skills_assessments table
CREATE TABLE IF NOT EXISTS skills_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES conversation_sessions(id) ON DELETE CASCADE,
    grammar_accuracy_score INTEGER,
    vocabulary_appropriateness_score INTEGER,
    sentence_complexity_score INTEGER,
    flow_smoothness_score INTEGER,
    response_timing_avg DECIMAL(5,2),
    natural_phrase_usage_score INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create vocabulary_suggestions table
CREATE TABLE IF NOT EXISTS vocabulary_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES conversation_sessions(id) ON DELETE CASCADE,
    suggested_word VARCHAR(255) NOT NULL,
    user_word_used VARCHAR(255),
    conversation_context TEXT,
    suggestion_reason TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Status can be: pending, accepted, dismissed
    CHECK (status IN ('pending', 'accepted', 'dismissed'))
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_conversation_sessions_user_id ON conversation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_sessions_started_at ON conversation_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_topics_session_id ON conversation_topics(session_id);
CREATE INDEX IF NOT EXISTS idx_linguistic_analysis_session_id ON linguistic_analysis(session_id);
CREATE INDEX IF NOT EXISTS idx_skills_assessments_session_id ON skills_assessments(session_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_suggestions_session_id ON vocabulary_suggestions(session_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_suggestions_status ON vocabulary_suggestions(status);
