-- Example SQL schema for storing emails
-- This works with PostgreSQL, MySQL, and similar databases

CREATE TABLE IF NOT EXISTS emails (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_verified BOOLEAN DEFAULT FALSE,
    source VARCHAR(100) DEFAULT 'coming_soon_signup',
    ip_address INET,
    user_agent TEXT
);

-- Create an index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_emails_email ON emails(email);

-- Create an index on created_at for time-based queries
CREATE INDEX IF NOT EXISTS idx_emails_created_at ON emails(created_at);

-- Create an index on source for analytics
CREATE INDEX IF NOT EXISTS idx_emails_source ON emails(source);
