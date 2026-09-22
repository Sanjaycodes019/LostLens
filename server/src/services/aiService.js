import { AppError } from '../middleware/errorHandler.js';

function buildSimpleAnalysis(description, category) {
  const words = (description || '').toLowerCase();
  const colors = ['black', 'white', 'red', 'blue', 'green', 'brown', 'gray', 'grey', 'yellow', 'pink', 'purple', 'orange'];
  const detectedColor = colors.find((c) => words.includes(c)) || 'Unknown';

  const brands = ['apple', 'samsung', 'lenovo', 'dell', 'hp', 'sony', 'nike', 'adidas', 'canon', 'nikon'];
  const detectedBrand = brands.find((b) => words.includes(b)) || 'Unknown';

  return {
    category: category || 'Other',
    brand: detectedBrand,
    primaryColor: detectedColor,
    secondaryColors: [],
    visibleFeatures: [],
    objectType: category?.toLowerCase() || 'item',
    confidence: 0.5,
    source: 'RULE_BASED',
    analyzedAt: new Date(),
  };
}

export async function analyzeItem({ imageUrl, description, category }) {
  return buildSimpleAnalysis(description, category);
}

export async function analyzeItemEndpoint(req, res) {
  const { description, category } = req.body;
  const analysis = await analyzeItem({ description, category });
  res.json({ success: true, data: analysis });
}
