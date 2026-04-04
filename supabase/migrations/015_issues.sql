CREATE TABLE IF NOT EXISTS issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES profiles(id)
);

ALTER TABLE issues ENABLE ROW LEVEL SECURITY;

-- Admin: full access
CREATE POLICY "issues_admin" ON issues FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Worker: can insert and view their own issues
CREATE POLICY "issues_worker_insert" ON issues FOR INSERT WITH CHECK (
  worker_id = (SELECT id FROM workers WHERE profile_id = auth.uid())
);
CREATE POLICY "issues_worker_select" ON issues FOR SELECT USING (
  worker_id = (SELECT id FROM workers WHERE profile_id = auth.uid())
);
