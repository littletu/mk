-- Single-row settings table for 妙根老塞
CREATE TABLE knowledge_settings (
  id            int  PRIMARY KEY DEFAULT 1 CHECK (id = 1),  -- enforce single row
  comment_points int  NOT NULL DEFAULT 2
);

INSERT INTO knowledge_settings (comment_points) VALUES (2);

-- RLS: read by all authenticated, write by admin only
ALTER TABLE knowledge_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ks_read"  ON knowledge_settings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "ks_admin" ON knowledge_settings FOR ALL    USING (is_admin());
