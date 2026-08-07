-- ==============================================================================
-- 1. ADD DOCUMENT CATEGORIES CONSTRAINT
-- ==============================================================================
-- WARNING: Do not execute this if you have existing production rows with legacy
-- category names. The database will reject this constraint if existing data violates it.
-- You must manually clean up old rows before applying this.

ALTER TABLE personal_documents 
ADD CONSTRAINT personal_documents_category_check 
CHECK (category IN (
    'Identity & Government',
    'Education',
    'Professional & Employment',
    'Banking & Finance',
    'Health & Insurance',
    'Vehicle',
    'Property',
    'Travel',
    'Bills & Receipts',
    'Certificates',
    'Other'
));
