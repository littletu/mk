-- =====================
-- 妙根老塞：師傅知識傳承
-- =====================

-- 知識條目
CREATE TABLE knowledge_tips (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id  UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  title      TEXT NOT NULL,
  content    TEXT NOT NULL,
  category   TEXT NOT NULL DEFAULT 'general'
             CHECK (category IN ('technique','material','quality','troubleshoot','safety','general')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 互動留言
CREATE TABLE knowledge_comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tip_id     UUID NOT NULL REFERENCES knowledge_tips(id) ON DELETE CASCADE,
  worker_id  UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================
-- INDEXES
-- =====================
CREATE INDEX idx_knowledge_tips_worker    ON knowledge_tips(worker_id);
CREATE INDEX idx_knowledge_tips_project   ON knowledge_tips(project_id);
CREATE INDEX idx_knowledge_tips_created   ON knowledge_tips(created_at DESC);
CREATE INDEX idx_knowledge_comments_tip   ON knowledge_comments(tip_id);

-- =====================
-- ROW LEVEL SECURITY
-- =====================
ALTER TABLE knowledge_tips     ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_comments ENABLE ROW LEVEL SECURITY;

-- knowledge_tips: admin 全權；所有師傅可讀；師傅可新增自己的
CREATE POLICY "kt_admin"         ON knowledge_tips FOR ALL    USING (is_admin());
CREATE POLICY "kt_worker_select" ON knowledge_tips FOR SELECT USING (TRUE);
CREATE POLICY "kt_worker_insert" ON knowledge_tips FOR INSERT
  WITH CHECK (worker_id = my_worker_id());

-- knowledge_comments: admin 全權；所有師傅可讀；師傅可新增自己的
CREATE POLICY "kc_admin"         ON knowledge_comments FOR ALL    USING (is_admin());
CREATE POLICY "kc_worker_select" ON knowledge_comments FOR SELECT USING (TRUE);
CREATE POLICY "kc_worker_insert" ON knowledge_comments FOR INSERT
  WITH CHECK (worker_id = my_worker_id());
