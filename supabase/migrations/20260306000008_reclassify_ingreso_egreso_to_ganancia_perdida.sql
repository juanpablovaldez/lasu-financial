-- All rows in the operations table are admin-generated performance entries.
-- User cash flows (deposits/withdrawals) live in the transactions table.
-- Therefore every 'ingreso' operation is semantically a gain (ganancia)
-- and every 'egreso' is semantically a loss (perdida).
--
-- Reclassifying the type column does NOT trigger the balance trigger because
-- that trigger only fires on status transitions (pending → completed), not
-- on type changes. Balances are already correct in user_balances.
UPDATE operations SET operation_type = 'ganancia' WHERE operation_type = 'ingreso';
UPDATE operations SET operation_type = 'perdida'  WHERE operation_type = 'egreso';
