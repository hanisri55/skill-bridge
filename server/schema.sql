-- SkillBridge AI Relational PostgreSQL Schema

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS profiles (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  degree VARCHAR(255) DEFAULT '',
  specialization VARCHAR(255) DEFAULT '',
  college VARCHAR(255) DEFAULT '',
  graduation_year VARCHAR(32) DEFAULT '',
  target_role VARCHAR(255) DEFAULT 'AI / ML Engineer',
  career_goal TEXT DEFAULT '',
  preferred_location VARCHAR(255) DEFAULT '',
  experience_level VARCHAR(64) DEFAULT 'Early career',
  resume_name VARCHAR(255) DEFAULT '',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_projects (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  technologies JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS resumes (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_size INT DEFAULT 0,
  raw_text TEXT DEFAULT '',
  parsed_skills JSONB DEFAULT '[]'::jsonb,
  parsed_projects JSONB DEFAULT '[]'::jsonb,
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS skills (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(128) DEFAULT 'Technical',
  description TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS user_skill_evidence (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  skill_id VARCHAR(64) REFERENCES skills(id) ON DELETE CASCADE,
  level VARCHAR(32) DEFAULT 'Beginner',
  confidence INT DEFAULT 0,
  assessment_score INT DEFAULT 0,
  evidence_resume BOOLEAN DEFAULT FALSE,
  evidence_project BOOLEAN DEFAULT FALSE,
  evidence_assessment BOOLEAN DEFAULT FALSE,
  verification_status VARCHAR(32) DEFAULT 'Claimed',
  summary TEXT DEFAULT '',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_user_skill UNIQUE(user_id, skill_id)
);

CREATE TABLE IF NOT EXISTS questions (
  id VARCHAR(64) PRIMARY KEY,
  skill_id VARCHAR(64) REFERENCES skills(id) ON DELETE CASCADE,
  topic VARCHAR(128) NOT NULL,
  difficulty VARCHAR(32) NOT NULL,
  question_type VARCHAR(64) NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  explanation TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS assessment_attempts (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  skill_id VARCHAR(64) REFERENCES skills(id) ON DELETE CASCADE,
  question_ids JSONB NOT NULL,
  current_question INT DEFAULT 0,
  score INT DEFAULT NULL,
  difficulty_state FLOAT DEFAULT 1.7,
  status VARCHAR(32) DEFAULT 'active',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS assessment_answers (
  id VARCHAR(64) PRIMARY KEY,
  attempt_id VARCHAR(64) REFERENCES assessment_attempts(id) ON DELETE CASCADE,
  question_id VARCHAR(64) REFERENCES questions(id) ON DELETE CASCADE,
  user_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  difficulty VARCHAR(32) NOT NULL,
  topic VARCHAR(128) NOT NULL,
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_attempt_question UNIQUE(attempt_id, question_id)
);

CREATE TABLE IF NOT EXISTS jobs (
  id VARCHAR(64) PRIMARY KEY,
  role VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  work_mode VARCHAR(32) NOT NULL,
  salary VARCHAR(128) NOT NULL,
  description TEXT NOT NULL,
  required_skills JSONB NOT NULL,
  experience_level VARCHAR(64) DEFAULT 'Early career'
);

CREATE TABLE IF NOT EXISTS user_roadmaps (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  stage INT NOT NULL,
  skill VARCHAR(128) NOT NULL,
  reason TEXT NOT NULL,
  difficulty VARCHAR(32) NOT NULL,
  effort VARCHAR(128) NOT NULL,
  progress INT DEFAULT 0,
  status VARCHAR(32) DEFAULT 'Queued',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  unread BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assistant_messages (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(16) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
