import Joi from 'joi';

export const schemas = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    username: Joi.string().alphanum().min(3).max(30).required(),
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  recipe: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().optional(),
    ingredients: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        quantity: Joi.number().required(),
        unit: Joi.string().required(),
      })
    ).min(1).required(),
    instructions: Joi.array().items(Joi.string()).required(),
    servings: Joi.number().optional(),
    prepTime: Joi.number().optional(),
    cookTime: Joi.number().optional(),
    tags: Joi.array().items(Joi.string()).optional(),
    imageUrl: Joi.string().optional(),
  }),

  mealPlan: Joi.object({
    date: Joi.date().required(),
    recipeId: Joi.number().optional().allow(null),
    notes: Joi.string().optional(),
  }),

  collection: Joi.object({
    name: Joi.string().required(),
  }),

  collectionRecipe: Joi.object({
    recipeId: Joi.number().required(),
  }),
};

export const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const messages = error.details.map(d => d.message);
    return res.status(400).json({ success: false, errors: messages });
  }

  req.validatedData = value;
  next();
};

// Export individual schemas for tests
export const registerSchema = schemas.register;
export const loginSchema = schemas.login;
export const recipeSchema = schemas.recipe;
export const mealPlanSchema = schemas.mealPlan;
export const collectionRecipeSchema = schemas.collectionRecipe;
export const collectionSchema = schemas.collection;
