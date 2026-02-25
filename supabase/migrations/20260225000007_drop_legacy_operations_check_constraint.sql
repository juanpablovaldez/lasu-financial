-- Drop the original unnamed check constraint that still blocks gain/loss operation types.
-- The replacement constraint (operations_operation_type_check) was already added in a
-- previous migration but the original was never removed.
ALTER TABLE public.operations DROP CONSTRAINT IF EXISTS operations_check;
