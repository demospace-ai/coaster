ALTER TABLE time_slots ALTER COLUMN start_time DROP NOT NULL;

INSERT INTO time_slots (created_at, updated_at, availability_rule_id, day_of_week)
  SELECT NOW(), NOW(), availability_rules.id, CASE WHEN availability_rules.type = 'fixed_date' THEN NULL ELSE 1 END
    FROM availability_rules
    LEFT JOIN time_slots ON time_slots.availability_rule_id = availability_rules.id
WHERE time_slots.id IS NULL;