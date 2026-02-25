-- Add scheduled_date for branch payment methods (when the user plans to visit the branch)
ALTER TABLE user_payment_methods ADD COLUMN scheduled_date DATE;
