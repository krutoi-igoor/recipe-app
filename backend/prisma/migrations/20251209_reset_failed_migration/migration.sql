-- Mark the failed migration as rolled back so migrations can continue
UPDATE "_prisma_migrations" 
SET rolled_back_at = NOW(), 
    finished_at = NULL 
WHERE migration_name = '20251209_add_recipe_enhancements' 
  AND rolled_back_at IS NULL;
