-- Migrate remaining legacy operation types to ingreso/egreso.
-- dividend, transfer, buy → ingreso (credits / asset acquisitions treated as inflows)
-- sell → egreso (disposals treated as outflows)
UPDATE operations SET operation_type = 'ingreso' WHERE operation_type IN ('dividend', 'transfer', 'sell');
UPDATE operations SET operation_type = 'egreso'  WHERE operation_type IN ('buy');
