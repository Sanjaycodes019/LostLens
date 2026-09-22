import { z } from 'zod';

export function validate(schema) {
  return (req, res, next) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      req.body = parsed.body ?? req.body;
      req.query = parsed.query ?? req.query;
      req.params = parsed.params ?? req.params;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: error.errors.map((e) => e.message).join(', '),
          code: 'VALIDATION_ERROR',
        });
      }
      next(error);
    }
  };
}

const emptyToUndefined = (val) => (val === '' ? undefined : val);

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    email: z.string().email(),
    password: z.string().min(6),
    studentId: z.preprocess(emptyToUndefined, z.string().min(3).max(30).optional()),
    phone: z.preprocess(emptyToUndefined, z.string().max(20).optional()),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

export const itemSchema = z.object({
  body: z.object({
    type: z.enum(['LOST', 'FOUND']),
    title: z.string().min(3).max(200),
    description: z.string().min(10).max(2000),
    category: z.string().min(1),
    subcategory: z.string().max(100).optional(),
    brand: z.string().max(100).optional(),
    color: z.string().max(50).optional(),
    secondaryColors: z.array(z.string()).optional(),
    images: z
      .array(
        z.object({
          url: z.string().url(),
          publicId: z.string().optional(),
          width: z.number().optional(),
          height: z.number().optional(),
        })
      )
      .max(5)
      .optional(),
    aiAnalysis: z.record(z.unknown()).optional(),
    location: z.object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
      address: z.string().max(300).optional(),
      placeName: z.string().max(200).optional(),
    }),
    eventDate: z.string().or(z.date()),
    eventTime: z.string().max(10).optional(),
    contactPreference: z.enum(['EMAIL', 'PHONE', 'IN_APP']).optional(),
  }),
});

export const claimSchema = z.object({
  body: z.object({
    matchId: z.string().min(1),
    hiddenDetails: z.string().min(10).max(1000),
    additionalDescription: z.string().max(2000).optional(),
    proofImages: z
      .array(
        z.object({
          url: z.string().url(),
          publicId: z.string().optional(),
        })
      )
      .max(3)
      .optional(),
  }),
});
