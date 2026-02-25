-- Extend enum with gain and loss values.
-- Must be in its own migration (separate transaction) before they can be used
-- in constraints or function bodies.
ALTER TYPE operation_type ADD VALUE 'gain';
ALTER TYPE operation_type ADD VALUE 'loss';
