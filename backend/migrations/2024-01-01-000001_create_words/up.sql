CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE words (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    word VARCHAR NOT NULL,
    meaning TEXT NOT NULL,
    translation TEXT NOT NULL,
    category VARCHAR NOT NULL,
    part_of_speech VARCHAR NOT NULL,
    example TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_words_category ON words(category);
CREATE INDEX idx_words_word ON words(word);
CREATE INDEX idx_words_created_at ON words(created_at);

-- Trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_words_updated_at BEFORE UPDATE ON words 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();