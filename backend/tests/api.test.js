import supertest from 'supertest';
import app from '../src/app.js';

const req = supertest(app);

describe('Auth API', () => {
  const testUser = { email: 'test@example.com', password: 'testpassword123', username: 'testuser' };

  it('POST /auth/register – should create user and return tokens', async () => {
    const res = await req
      .post('/api/v1/auth/register')
      .send(testUser)
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });

  it('POST /auth/register – should reject duplicate email', async () => {
    await req.post('/api/v1/auth/register').send(testUser);

    const res = await req
      .post('/api/v1/auth/register')
      .send(testUser)
      .expect(409);

    expect(res.body.success).toBe(false);
  });

  it('POST /auth/login – should return tokens on valid credentials', async () => {
    await req.post('/api/v1/auth/register').send(testUser);

    const res = await req
      .post('/api/v1/auth/login')
      .send({ email: testUser.email, password: testUser.password })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });

  it('POST /auth/login – should reject invalid password', async () => {
    await req.post('/api/v1/auth/register').send(testUser);

    const res = await req
      .post('/api/v1/auth/login')
      .send({ email: testUser.email, password: 'wrongpassword' })
      .expect(401);

    expect(res.body.success).toBe(false);
  });

  it('GET /auth/me – should return user data with valid token', async () => {
    const registerRes = await req.post('/api/v1/auth/register').send(testUser);
    const token = registerRes.body.data.token;

    const res = await req
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.data.email).toBe(testUser.email);
  });

  it('GET /auth/me – should reject missing token', async () => {
    const res = await req.get('/api/v1/auth/me').expect(401);
    expect(res.body.success).toBe(false);
  });
});

describe('Recipe API', () => {
  let userToken;
  const testUser = { email: 'chef@example.com', password: 'chefpassword123', username: 'chef' };
  const testRecipe = {
    title: 'Test Recipe',
    description: 'A test recipe',
    ingredients: [{ name: 'flour', quantity: 2, unit: 'cups' }],
    instructions: ['Mix', 'Bake'],
  };

  beforeAll(async () => {
    const res = await supertest(app)
      .post('/api/v1/auth/register')
      .send(testUser);
    userToken = res.body.data.token;
  });

  it('POST /recipes – should create recipe with valid auth', async () => {
    const res = await req
      .post('/api/v1/recipes')
      .set('Authorization', `Bearer ${userToken}`)
      .send(testRecipe)
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe(testRecipe.title);
    expect(res.body.data.ingredients).toEqual(testRecipe.ingredients);
    expect(res.body.data.instructions).toEqual(testRecipe.instructions);
  });

  it('GET /recipes – should list user recipes', async () => {
    const res = await req
      .get('/api/v1/recipes')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.recipes)).toBe(true);
  });

  it('POST /recipes – should reject without auth', async () => {
    const res = await req
      .post('/api/v1/recipes')
      .send(testRecipe)
      .expect(401);

    expect(res.body.success).toBe(false);
  });
});

describe('Health API', () => {
  it('GET /health – should return healthy status', async () => {
    const res = await req.get('/api/v1/health').expect(200);
    expect(res.body.status).toBe('healthy');
  });
});
