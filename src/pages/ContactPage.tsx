import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Loader2, Send } from 'lucide-react';
import { SEO, organizationSchema } from '../components/SEO';

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    inquiry_type: 'general' as 'general' | 'media' | 'support',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const seo = (
    <SEO
      title="Contact NeurusAGi | Artificial General Intelligence Platform"
      description="Contact NeurusAGi for general information, media inquiries, support, and questions about the artificial general intelligence platform."
      path="/contact"
      keywords="contact NeurusAGi, AI platform support, artificial general intelligence contact, media inquiry"
      structuredData={organizationSchema()}
    />
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Insert into database
      const { error: dbError } = await supabase
        .from('contact_submissions')
        .insert([formData]);

      if (dbError) throw dbError;

      // Map inquiry type to subject
      const subjectMap = {
        general: 'General Information',
        media: 'Media Inquiry',
        support: 'Support Request',
      };

      // Send email notification
      const { error: emailError } = await supabase.functions.invoke('send-email', {
        body: {
          to: 'neurusagi@gmail.com',
          subject: subjectMap[formData.inquiry_type],
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Type:</strong> ${subjectMap[formData.inquiry_type]}</p>
            <p><strong>Name:</strong> ${formData.name}</p>
            <p><strong>Email:</strong> ${formData.email}</p>
            <p><strong>Message:</strong></p>
            <p>${formData.message}</p>
          `,
        },
      });

      if (emailError) {
        console.error('Email error:', emailError);
      }

      setSubmitted(true);
      setFormData({ name: '', email: '', inquiry_type: 'general', message: '' });
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit message');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <>
        {seo}
        <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-strong rounded-2xl p-12 neural-glow text-center max-w-2xl">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Send className="w-8 h-8 text-primary" />
          </div>
          <h1 className="heading-lg text-3xl mb-4">Message Sent!</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Thank you for reaching out. We'll get back to you as soon as possible.
          </p>
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="btn-primary"
          >
            Send Another Message
          </button>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
      {seo}
      <div className="min-h-screen">
      <section className="section-container" aria-labelledby="contact-title">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 id="contact-title" className="heading-xl mb-4">Contact Us</h1>
            <p className="text-lg text-muted-foreground">
              Have questions? We're here to help.
            </p>
          </div>

          {/* Contact Form */}
          <div className="glass-strong rounded-2xl p-8 neural-glow">
            <form onSubmit={handleSubmit} className="space-y-6" aria-label="Contact NeurusAGi form">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="input-container">
                  <label htmlFor="contact-name" className="input-label">Name *</label>
                  <input
                    id="contact-name"
                    name="name"
                    autoComplete="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field w-full"
                    placeholder="Your full name"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="input-container">
                  <label htmlFor="contact-email" className="input-label">Email *</label>
                  <input
                    id="contact-email"
                    name="email"
                    autoComplete="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field w-full"
                    placeholder="your.email@example.com"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="input-container">
                <label htmlFor="contact-inquiry-type" className="input-label">Inquiry Type *</label>
                <select
                  id="contact-inquiry-type"
                  name="inquiry_type"
                  value={formData.inquiry_type}
                  onChange={(e) => setFormData({ ...formData, inquiry_type: e.target.value as 'general' | 'media' | 'support' })}
                  className="input-field w-full"
                  required
                  disabled={loading}
                >
                  <option value="general">General Information</option>
                  <option value="media">Media Inquiry</option>
                  <option value="support">Support</option>
                </select>
              </div>

              <div className="input-container">
                <label htmlFor="contact-message" className="input-label">Message *</label>
                <textarea
                  id="contact-message"
                  aria-describedby="contact-message-count"
                  name="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="input-field w-full min-h-[150px] resize-y"
                  placeholder="How can we help you?"
                  required
                  disabled={loading}
                  maxLength={1000}
                />
                <p id="contact-message-count" className="text-xs text-muted-foreground mt-1" aria-live="polite">
                  {formData.message.length}/1000 characters
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary"
              >
                {loading ? (
                  <span className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Sending...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center space-x-2">
                    <Send className="w-5 h-5" />
                    <span>Send Message</span>
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}
