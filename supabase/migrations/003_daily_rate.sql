-- Change from hourly rate to daily rate

-- workers: hourly_rate → daily_rate
ALTER TABLE workers RENAME COLUMN hourly_rate TO daily_rate;

-- time_entries: regular_hours → regular_days
ALTER TABLE time_entries RENAME COLUMN regular_hours TO regular_days;

-- payroll_records: regular_hours → regular_days
ALTER TABLE payroll_records RENAME COLUMN regular_hours TO regular_days;
