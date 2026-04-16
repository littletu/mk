-- Recreate worker delete policy for time_entries
-- (Handles case where migration 002 was not applied or policy is misconfigured)
DROP POLICY IF EXISTS "te_worker_delete" ON time_entries;

CREATE POLICY "te_worker_delete" ON time_entries
  FOR DELETE
  USING (worker_id = my_worker_id());
