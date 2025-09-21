-- Fix words table schema to match Rust model
DROP TABLE IF EXISTS words;

CREATE TABLE words (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    word VARCHAR NOT NULL,
    meaning TEXT NOT NULL,
    translation TEXT,
    part_of_speech JSONB NOT NULL DEFAULT '[]'::jsonb,
    phonetic TEXT,
    example TEXT,
    category TEXT,
    user_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX idx_words_user_id ON words(user_id);
CREATE INDEX idx_words_word ON words(word);
CREATE INDEX idx_words_category ON words(category);