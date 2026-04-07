-- Add question and reply points to knowledge_settings
ALTER TABLE knowledge_settings
  ADD COLUMN question_points int NOT NULL DEFAULT 3,
  ADD COLUMN reply_points    int NOT NULL DEFAULT 2;
