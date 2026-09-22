import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import ImageUpload, { getFileFromImage } from '../components/items/ImageUpload';
import LocationPicker from '../components/items/LocationPicker';
import { itemsApi } from '../services/endpoints';
import { useToast } from '../context/ToastContext';
import { CATEGORIES, COLORS } from '../utils/constants';
import type { ItemImage, AiAnalysis } from '../types';

const STEPS = ['Upload', 'Details', 'Location', 'Date/Time', 'AI Review', 'Submit'];

interface FormValues {
  title: string;
  description: string;
  category: string;
  brand: string;
  color: string;
  eventDate: string;
  eventTime: string;
}

export default function ReportItemPage() {
  const { type } = useParams<{ type: 'lost' | 'found' }>();
  const itemType = type === 'found' ? 'FOUND' : 'LOST';
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [step, setStep] = useState(0);
  const [images, setImages] = useState<(ItemImage & { _file?: File })[]>([]);
  const [location, setLocation] = useState({
    latitude: 31.1048,
    longitude: 77.1734,
    placeName: 'Central Library',
    address: 'Campus Area',
  });
  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<ItemImage[]>([]);

  const { register, handleSubmit, watch, setValue, getValues } = useForm<FormValues>({
    defaultValues: {
      title: '',
      description: '',
      category: 'Bags',
      brand: itemType === 'FOUND' ? 'Unknown' : '',
      color: 'Unknown',
      eventDate: new Date().toISOString().slice(0, 10),
      eventTime: new Date().toTimeString().slice(0, 5),
    },
  });

  const runAiAnalysis = async () => {
    setAnalyzing(true);
    try {
      const values = getValues();
      const formData = new FormData();
      const file = images[0] ? getFileFromImage(images[0]) : null;
      if (file) formData.append('image', file);
      formData.append('description', values.description);
      formData.append('category', values.category);

      const res = await itemsApi.analyze(formData);
      const { analysis, image } = res.data.data;
      setAiAnalysis(analysis);

      if (image) setUploadedImages([image]);
      else if (images.length) setUploadedImages(images.map(({ url, publicId }) => ({ url, publicId })));

      // Suggest values but never overwrite user input silently
      if (!values.title && analysis.objectType) {
        setValue('title', `${itemType === 'LOST' ? 'Lost' : 'Found'} ${analysis.objectType}`);
      }
      if (values.brand === '' || values.brand === 'Unknown') {
        if (analysis.brand && analysis.brand !== 'Unknown') setValue('brand', analysis.brand);
      }
      if (values.color === 'Unknown' && analysis.primaryColor) {
        setValue('color', analysis.primaryColor);
      }
      if (analysis.category && CATEGORIES.some((c) => c.toLowerCase().includes(analysis.category!.toLowerCase()))) {
        const match = CATEGORIES.find((c) => c.toLowerCase().includes(analysis.category!.toLowerCase()));
        if (match) setValue('category', match);
      }

      showToast('AI analysis complete — review and edit before submitting', 'success');
      setStep(4);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'AI analysis unavailable — continue manually', 'error');
      setAiAnalysis({ source: 'FALLBACK', confidence: 0 });
      setStep(4);
    } finally {
      setAnalyzing(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      let finalImages = uploadedImages;
      if (finalImages.length === 0 && images.length > 0) {
        const formData = new FormData();
        const file = getFileFromImage(images[0]);
        if (file) {
          formData.append('image', file);
          const uploadRes = await itemsApi.upload(formData);
          finalImages = [uploadRes.data.data];
        }
      }

      const res = await itemsApi.create({
        type: itemType,
        title: values.title,
        description: values.description,
        category: values.category,
        brand: values.brand || 'Unknown',
        color: values.color || 'Unknown',
        secondaryColors: aiAnalysis?.secondaryColors || [],
        images: finalImages,
        aiAnalysis: aiAnalysis ? { ...aiAnalysis, source: aiAnalysis.source || 'MANUAL' } : undefined,
        location,
        eventDate: values.eventDate,
        eventTime: values.eventTime,
      });

      showToast(`Report submitted! ${res.data.data.matchesFound} potential matches found.`, 'success');
      navigate(`/items/${res.data.data.item._id}`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to submit', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const next = () => {
    if (step === 3) {
      runAiAnalysis();
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const prev = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <div className="mx-auto max-w-2xl space-y-4 sm:space-y-6 px-4 sm:px-0">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Report {itemType === 'LOST' ? 'Lost' : 'Found'} Item</h1>
        <p className="text-sm sm:text-base text-slate-500">Step {step + 1} of {STEPS.length}: {STEPS[step]}</p>
      </div>

      <div className="flex gap-1">
        {STEPS.map((s, i) => (
          <div key={s} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-brand-600' : 'bg-slate-200'}`} />
        ))}
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)}>
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-lg">Upload item photo</h2>
              <ImageUpload images={images} onChange={setImages} />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <Input label="Title" {...register('title', { required: true })} />
              <div>
                <label className="label">Description</label>
                <textarea className="input min-h-[120px]" {...register('description', { required: true })} />
              </div>
              <div>
                <label className="label">Category</label>
                <select className="input" {...register('category')}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <Input label="Brand (use Unknown if unsure)" {...register('brand')} />
              <div>
                <label className="label">Color</label>
                <select className="input" {...register('color')}>
                  {COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-lg">Where was it {itemType === 'LOST' ? 'lost' : 'found'}?</h2>
              <LocationPicker value={location} onChange={setLocation} />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <Input label="Date" type="date" {...register('eventDate', { required: true })} />
              <Input label="Time" type="time" {...register('eventTime')} />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-brand-700">
                <Sparkles className="h-5 w-5" />
                <h2 className="font-semibold text-lg">Review Analysis</h2>
              </div>
              {analyzing ? (
                <p className="text-sm text-slate-500">Analyzing item...</p>
              ) : aiAnalysis ? (
                <div className="rounded-lg bg-slate-50 p-4 text-sm space-y-2">
                  <p><strong>Category:</strong> {aiAnalysis.category || watch('category')}</p>
                  <p><strong>Brand:</strong> {aiAnalysis.brand || watch('brand') || 'Unknown'}</p>
                  <p><strong>Color:</strong> {aiAnalysis.primaryColor || watch('color')}</p>
                  {aiAnalysis.visibleFeatures?.length ? (
                    <p><strong>Features:</strong> {aiAnalysis.visibleFeatures.join(', ')}</p>
                  ) : null}
                  <p className="text-xs text-slate-500">Source: {aiAnalysis.source || 'MANUAL'} · Confidence: {Math.round((aiAnalysis.confidence || 0) * 100)}%</p>
                </div>
              ) : (
                <p className="text-sm text-slate-500">Analysis unavailable — using your manual entries.</p>
              )}
              <p className="text-xs text-slate-500">You can edit all fields on the next step before submitting.</p>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-lg">Confirm & Submit</h2>
              <dl className="space-y-2 text-sm">
                <div><dt className="text-slate-500">Title</dt><dd className="font-medium">{watch('title')}</dd></div>
                <div><dt className="text-slate-500">Category</dt><dd>{watch('category')}</dd></div>
                <div><dt className="text-slate-500">Location</dt><dd>{location.placeName || location.address}</dd></div>
                <div><dt className="text-slate-500">Date</dt><dd>{watch('eventDate')} {watch('eventTime')}</dd></div>
              </dl>
            </div>
          )}

          <div className="mt-6 flex flex-col sm:flex-row justify-between gap-3">
            <Button type="button" variant="secondary" onClick={prev} disabled={step === 0} className="w-full sm:w-auto">
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button type="button" onClick={next} loading={analyzing} className="w-full sm:w-auto">
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" loading={submitting} className="w-full sm:w-auto">Submit Report</Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}
