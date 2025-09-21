-- Initial table for words
CREATE TABLE IF NOT EXISTS words (
    id SERIAL PRIMARY KEY,
    english_word VARCHAR NOT NULL,
    japanese_translation VARCHAR NOT NULL,
    part_of_speech VARCHAR NOT NULL,
    example_sentence TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);