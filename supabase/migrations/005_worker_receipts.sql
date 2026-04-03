-- Worker receipts table
CREATE TABLE IF NOT EXISTS worker_receipts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  receipt_date DATE NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(10,2),
  file_url TEXT,
  file_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE worker_receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workers can manage own receipts"
  ON worker_receipts
  FOR ALL
  USING (
    worker_id IN (
      SELECT id FROM workers WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all receipts"
  ON worker_receipts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Storage bucket for receipts
INSERT INTO storage.buckets (id, name, public)
  VALUES ('receipts', 'receipts', false)
  ON CONFLICT DO NOTHING;

-- Storage RLS: workers can upload to their own folder
CREATE POLICY "Workers can upload receipts"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'receipts' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Workers can read own receipts"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'receipts' AND
    auth.uid() IS NOT NULL
  );
