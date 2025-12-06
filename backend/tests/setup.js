// Set test environment variables before importing modules
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/recipe_app_test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-tests-only';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret-key-for-tests-only';
process.env.NODE_ENV = 'test';
