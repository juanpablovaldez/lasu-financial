-- Step 1: Add new enum values.
-- Must be committed in its own transaction before the values can be used
-- in DML statements (PostgreSQL restriction on new enum values).
ALTER TYPE operation_type ADD VALUE IF NOT EXISTS 'ingreso';
ALTER TYPE operation_type ADD VALUE IF NOT EXISTS 'egreso';
