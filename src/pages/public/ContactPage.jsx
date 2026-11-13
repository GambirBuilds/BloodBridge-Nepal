import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, MapPin, Phone } from 'lucide-react';
import { useForm } from 'react-hook-form';
import {
  Button,
  Field,
  SelectField,
  StatusNotice,
  Surface,
  TextareaField,
} from '../../components/common/ui';
import { usePlatformData } from '../../hooks/usePlatformData';
import { useToast } from '../../hooks/useToast';
import { contactSchema } from '../../validation/schemas';

export default function ContactPage() {
  const { submitContactInquiry } = usePlatformData();
  const { showToast } = useToast();
  const [submittedRef, setSubmittedRef] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '+977 ',
      category: 'Hospital Onboarding Inquiry',
      message: '',
    },
  });

  const onSubmit = (values) => {
    const entry = submitContactInquiry(values);
    setSubmittedRef(entry.id);
    reset();
    showToast({
      tone: 'success',
      title: 'Inquiry logged (Demo Mode)',
      description: `Reference ${entry.id} recorded in local preview storage.`,
    });
  };

  return (
    <div className="mx-auto max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="min-w-0 space-y-6 lg:col-span-5">
          <div>
            <h1 className="text-display text-foreground">Contact coordination support</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Reach out for hospital blood bank onboarding, donor privacy inquiries, or regional
              partnership questions across Nepal. For life-threatening medical emergencies, always
              contact your treating hospital emergency department or dial 102 directly.
            </p>
          </div>

          <Surface className="divide-y divide-border/60 p-6">
            <div className="flex items-start gap-3 pb-4">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div className="text-sm">
                <p className="font-semibold text-foreground">Kathmandu Coordination Office (Demo)</p>
                <p className="mt-0.5 text-muted">
                  Maharajgunj–Lazimpat Health Corridor, Kathmandu Metropolitan City, Bagmati Province
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 py-4">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div className="text-sm">
                <p className="font-semibold text-foreground">Coordination Desk Phone</p>
                <p className="mt-0.5 text-muted">
                  +977 01-4200100 · Sun–Fri, 08:00–18:00 NPT (Demonstration line)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-4">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div className="text-sm">
                <p className="font-semibold text-foreground">Institutional & Privacy Desk</p>
                <p className="mt-0.5 text-muted">support@demo.bloodbridge.np</p>
              </div>
            </div>
          </Surface>
        </div>

        <div className="min-w-0 lg:col-span-7">
          <Surface className="p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-foreground">Send a message</h2>
            <p className="mt-1 text-sm text-muted">
              Complete the form below and receive a confirmation reference immediately.
            </p>

            {submittedRef && (
              <div className="mt-4">
                <StatusNotice tone="success">
                  Message recorded under reference <span className="font-mono font-semibold">{submittedRef}</span>{' '}
                  in client demonstration mode.
                </StatusNotice>
              </div>
            )}

            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="mt-6 space-y-4 border-t border-border/60 pt-5"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  label="Full name"
                  required
                  placeholder="e.g. Pratiksha KC"
                  error={errors.fullName?.message}
                  {...register('fullName')}
                />
                <Field
                  label="Email address"
                  type="email"
                  required
                  placeholder="name@example.com.np"
                  error={errors.email?.message}
                  {...register('email')}
                />
                <Field
                  label="Phone number (Optional)"
                  type="tel"
                  placeholder="+977 9841xxxxxx"
                  error={errors.phone?.message}
                  {...register('phone')}
                />
                <SelectField
                  label="Inquiry topic"
                  required
                  options={[
                    'Hospital Onboarding Inquiry',
                    'Donor Account Support',
                    'Blood Request Coordination',
                    'Data Privacy Request',
                    'General Partnership',
                  ]}
                  error={errors.category?.message}
                  {...register('category')}
                />
              </div>

              <TextareaField
                label="Message"
                required
                rows={4}
                placeholder="Describe how our coordination or compliance team can assist..."
                error={errors.message?.message}
                {...register('message')}
              />

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={isSubmitting}>
                  Submit inquiry
                </Button>
              </div>
            </form>
          </Surface>
        </div>
      </div>
    </div>
  );
}
