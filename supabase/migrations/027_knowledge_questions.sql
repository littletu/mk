-- =====================
-- 問問老塞：師傅互相提問討論
-- =====================

CREATE TABLE knowledge_questions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id   UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  project_id  UUID REFERENCES projects(id) ON DELETE SET NULL,
  category_id UUID REFERENCES knowledge_categories(id) ON DELETE SET NULL,
  title       TEXT NOT NULL,
  content     TEXT,
  image_url   TEXT,
  status      TEXT NOT NULL DEFAULT 'open'
              CHECK (status IN ('open', 'resolved')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE knowledge_question_replies (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES knowledge_questions(id) ON DELETE CASCADE,
  worker_id   UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  image_url   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_kq_worker    ON knowledge_questions(worker_id);
CREATE INDEX idx_kq_created   ON knowledge_questions(created_at DESC);
CREATE INDEX idx_kqr_question ON knowledge_question_replies(question_id);

-- RLS
ALTER TABLE knowledge_questions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_question_replies  ENABLE ROW LEVEL SECURITY;

-- knowledge_questions
CREATE POLICY "kq_admin"         ON knowledge_questions FOR ALL    USING (is_admin());
CREATE POLICY "kq_worker_select" ON knowledge_questions FOR SELECT USING (TRUE);
CREATE POLICY "kq_worker_insert" ON knowledge_questions FOR INSERT
  WITH CHECK (worker_id = my_worker_id());
CREATE POLICY "kq_worker_update" ON knowledge_questions FOR UPDATE
  USING (worker_id = my_worker_id());

-- knowledge_question_replies
CREATE POLICY "kqr_admin"         ON knowledge_question_replies FOR ALL    USING (is_admin());
CREATE POLICY "kqr_worker_select" ON knowledge_question_replies FOR SELECT USING (TRUE);
CREATE POLICY "kqr_worker_insert" ON knowledge_question_replies FOR INSERT
  WITH CHECK (worker_id = my_worker_id());
