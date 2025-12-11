-- Remove the failed migration record so it can be reapplied
DELETE FROM "_prisma_migrations" WHERE migration_name = '20251209_add_recipe_enhancements';
