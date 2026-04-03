-- Allow workers to delete their own unapproved time entries
CREATE POLICY "te_worker_delete" ON time_entries
  FOR DELETE
  USING (worker_id = my_worker_id() AND approved_by IS NULL);
