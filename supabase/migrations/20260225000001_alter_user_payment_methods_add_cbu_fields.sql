-- Rename routing_code to cbu (Argentine banking standard identifier)
ALTER TABLE user_payment_methods RENAME COLUMN routing_code TO cbu;

-- Add cbu_alias: the human-readable CBU alias (e.g., JPVALDEZ.STD, jpvaldez.br)
ALTER TABLE user_payment_methods ADD COLUMN cbu_alias TEXT;

-- Add document: DNI or CUIT of the account holder (e.g., DNI 45961426, CUIT 20-45961426-6)
ALTER TABLE user_payment_methods ADD COLUMN document TEXT;
