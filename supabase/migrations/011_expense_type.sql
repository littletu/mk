-- Allow expenses without a project (company expenses)
ALTER TABLE expenses ALTER COLUMN project_id DROP NOT NULL;

-- Add expense_type to distinguish project vs company expenses
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS expense_type TEXT NOT NULL DEFAULT 'project'
  CHECK (expense_type IN ('project', 'company'));

-- Existing expenses are all project expenses
UPDATE expenses SET expense_type = 'project' WHERE expense_type IS NULL;
