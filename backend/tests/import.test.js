import supertest from 'supertest';
import axios from 'axios';
import app from '../src/app.js';

jest.mock('axios');

const req = supertest(app);

const sampleHtml = `
<!doctype html>
<html>
  <head>
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "Recipe",
        "name": "Chocolate Cake",
        "description": "Rich chocolate cake",
        "recipeIngredient": [
          "2 cups flour",
          "1 cup sugar"
        ],
        "recipeInstructions": [
          "Mix dry ingredients",
          "Bake for 30 minutes"
        ],
        "image": "https://example.com/cake.jpg",
        "recipeYield": "8"
      }
    </script>
  </head>
  <body></body>
</html>
`;

describe('Import URL API', () => {
  let token;

  beforeAll(async () => {
    const res = await req
      .post('/api/v1/auth/register')
      .send({ email: 'importer@example.com', password: 'importpass123', username: 'importer' });
    token = res.body.data.token;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('imports a recipe from a URL with JSON-LD data', async () => {
    axios.get.mockResolvedValue({ data: sampleHtml });

    const res = await req
      .post('/api/v1/imports/url')
      .set('Authorization', `Bearer ${token}`)
      .send({ url: 'https://example.com/cake' })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Chocolate Cake');
    expect(res.body.data.ingredients.length).toBeGreaterThan(0);
    expect(res.body.data.instructions[0]).toMatch(/Mix dry ingredients/);
    expect(res.body.data.sourceUrl).toBe('https://example.com/cake');
  });
});
