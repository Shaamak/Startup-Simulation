'use client';

import { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import {
  Rocket, Building2, DollarSign, Target, Users,
  ImageIcon, Loader2, ChevronRight, Check, ArrowLeft
} from 'lucide-react';
import { api } from '@/lib/api';
import { INDUSTRIES, PRICING_MODELS } from '@/types/startup';
import Link from 'next/link';

const schema = z.object({
  name: z.string().min(2, 'At least 2 characters').max(100),
  tagline: z.string().max(255).optional(),
  industry: z.string().min(1, 'Select an industry'),
  category: z.string().min(2, 'Describe your category').max(50),
  pricingModel: z.string().min(1, 'Select a pricing model'),
  monthlyBudget: z.number().min(1000, 'Minimum $1,000').max(10_000_000),
  targetAudience: z.string().min(10, 'At least 10 characters').max(500),
});

type FormData = z.infer<typeof schema>;

const STEPS = [
  { id: 1, title: 'Basic Info', icon: Building2 },
  { id: 2, title: 'Business Model', icon: DollarSign },
  { id: 3, title: 'Target Market', icon: Target },
  { id: 4, title: 'Brand Assets', icon: ImageIcon },
];

export default function CreateStartupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    control,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { monthlyBudget: 10000 },
  });

  // Logo dropzone
  const onDrop = useCallback((files: File[]) => {
    const file = files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  const nextStep = async () => {
    const stepFields: Record<number, (keyof FormData)[]> = {
      1: ['name', 'tagline'],
      2: ['industry', 'category', 'pricingModel', 'monthlyBudget'],
      3: ['targetAudience'],
    };
    const valid = await trigger(stepFields[step] || []);
    if (valid) setStep((s) => Math.min(s + 1, 4));
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setServerError('');
    try {
      const { data: res } = await api.startups.create(data);
      const startupId = res.data.id;

      // Upload logo if provided
      if (logoFile) {
        try {
          await api.startups.uploadLogo(startupId, logoFile);
        } catch {}
      }

      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setServerError(msg || 'Failed to create startup. Please try again.');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard" className="btn-ghost p-2">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Create Your Startup</h1>
          <p className="text-white/40 text-sm">Configure your virtual company for AI simulation</p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2 flex-1">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              step === s.id
                ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                : step > s.id
                ? 'bg-accent-emerald/10 text-accent-emerald'
                : 'text-white/30'
            }`}>
              {step > s.id
                ? <Check className="w-3.5 h-3.5" />
                : <s.icon className="w-3.5 h-3.5" />
              }
              <span className="hidden sm:inline">{s.title}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-px ${step > s.id ? 'bg-accent-emerald/30' : 'bg-white/10'}`} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} id="create-startup-form">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="glass-card p-8 space-y-5"
        >
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-brand-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Basic Information</h2>
                  <p className="text-xs text-white/40">What are you building?</p>
                </div>
              </div>

              <div>
                <label className="label" htmlFor="startup-name">Startup Name *</label>
                <input
                  id="startup-name"
                  {...register('name')}
                  placeholder="e.g. NeuralNotes"
                  className="input-field"
                />
                {errors.name && <p className="mt-1.5 text-xs text-accent-rose">{errors.name.message}</p>}
              </div>

              <div>
                <label className="label" htmlFor="startup-tagline">Tagline</label>
                <input
                  id="startup-tagline"
                  {...register('tagline')}
                  placeholder="e.g. AI-powered note-taking for teams"
                  className="input-field"
                />
              </div>
            </>
          )}

          {/* Step 2: Business Model */}
          {step === 2 && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-accent-emerald/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-accent-emerald" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Business Model</h2>
                  <p className="text-xs text-white/40">Define how your startup generates revenue</p>
                </div>
              </div>

              <div>
                <label className="label" htmlFor="industry-select">Industry *</label>
                <Controller
                  name="industry"
                  control={control}
                  render={({ field }) => (
                    <select id="industry-select" {...field} className="input-field">
                      <option value="">Select industry...</option>
                      {INDUSTRIES.map((ind) => (
                        <option key={ind} value={ind}>{ind}</option>
                      ))}
                    </select>
                  )}
                />
                {errors.industry && <p className="mt-1.5 text-xs text-accent-rose">{errors.industry.message}</p>}
              </div>

              <div>
                <label className="label" htmlFor="category-input">Category *</label>
                <input
                  id="category-input"
                  {...register('category')}
                  placeholder="e.g. Productivity, Analytics, Developer Tools"
                  className="input-field"
                />
                {errors.category && <p className="mt-1.5 text-xs text-accent-rose">{errors.category.message}</p>}
              </div>

              <div>
                <label className="label" htmlFor="pricing-model-select">Pricing Model *</label>
                <Controller
                  name="pricingModel"
                  control={control}
                  render={({ field }) => (
                    <select id="pricing-model-select" {...field} className="input-field">
                      <option value="">Select pricing model...</option>
                      {PRICING_MODELS.map((m) => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  )}
                />
                {errors.pricingModel && <p className="mt-1.5 text-xs text-accent-rose">{errors.pricingModel.message}</p>}
              </div>

              <div>
                <label className="label" htmlFor="monthly-budget">Monthly Budget (USD) *</label>
                <Controller
                  name="monthlyBudget"
                  control={control}
                  render={({ field }) => (
                    <div className="relative">
                      <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        id="monthly-budget"
                        type="number"
                        min={1000}
                        max={10000000}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="input-field pl-10"
                        placeholder="10000"
                      />
                    </div>
                  )}
                />
                {errors.monthlyBudget && <p className="mt-1.5 text-xs text-accent-rose">{errors.monthlyBudget.message}</p>}
              </div>
            </>
          )}

          {/* Step 3: Target Market */}
          {step === 3 && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-accent-violet/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-accent-violet" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Target Market</h2>
                  <p className="text-xs text-white/40">Who is your ideal customer?</p>
                </div>
              </div>

              <div>
                <label className="label" htmlFor="target-audience">Target Audience *</label>
                <textarea
                  id="target-audience"
                  {...register('targetAudience')}
                  rows={5}
                  placeholder="Describe your ideal customer: e.g. B2B SaaS companies with 10-200 employees, focused on remote team productivity, primarily in North America..."
                  className="input-field resize-none"
                />
                {errors.targetAudience && <p className="mt-1.5 text-xs text-accent-rose">{errors.targetAudience.message}</p>}
              </div>
            </>
          )}

          {/* Step 4: Brand Assets */}
          {step === 4 && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-accent-amber/10 flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-accent-amber" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Brand Assets</h2>
                  <p className="text-xs text-white/40">Upload your logo (optional)</p>
                </div>
              </div>

              <div
                {...getRootProps()}
                id="logo-dropzone"
                className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 ${
                  isDragActive
                    ? 'border-brand-500/50 bg-brand-500/5'
                    : 'border-white/10 hover:border-white/20 hover:bg-white/2'
                }`}
              >
                <input {...getInputProps()} id="logo-file-input" />
                {logoPreview ? (
                  <div className="flex flex-col items-center gap-3">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-20 h-20 rounded-xl object-cover"
                    />
                    <p className="text-sm text-white/60">{logoFile?.name}</p>
                    <p className="text-xs text-white/30">Click to change</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <ImageIcon className="w-10 h-10 text-white/20 mb-2" />
                    <p className="text-sm font-medium text-white/60">
                      {isDragActive ? 'Drop here' : 'Drag logo here, or click to browse'}
                    </p>
                    <p className="text-xs text-white/30">PNG, JPG, WebP — max 5MB</p>
                  </div>
                )}
              </div>

              {serverError && (
                <div className="p-3 rounded-xl bg-accent-rose/10 border border-accent-rose/20 text-accent-rose text-sm">
                  {serverError}
                </div>
              )}
            </>
          )}
        </motion.div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-5">
          {step > 1 ? (
            <button
              type="button"
              id="prev-step"
              onClick={() => setStep((s) => s - 1)}
              className="btn-ghost flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              id="next-step"
              onClick={nextStep}
              className="btn-primary flex items-center gap-2"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              id="submit-startup"
              disabled={isSubmitting}
              className="btn-primary flex items-center gap-2"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Launching...</>
              ) : (
                <><Rocket className="w-4 h-4" /> Launch Startup</>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
