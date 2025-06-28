CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_name ON categories(name);

-- Insert default categories
INSERT INTO categories (name, description) VALUES 
    ('General', 'General vocabulary words'),
    ('Business', 'Business and professional terms'),
    ('Technology', 'Technology and computer-related terms'),
    ('Academic', 'Academic and educational vocabulary'),
    ('Travel', 'Travel and tourism related words'),
    ('Daily Life', 'Everyday conversation words');