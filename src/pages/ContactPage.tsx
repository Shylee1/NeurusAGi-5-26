import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Loader2, Send } from 'lucide-react';
import { Seo, JsonLd } from '../components/Seo';
import { breadcrumbSchema, webPageSchema } from '../lib/schema';

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    inquiry_type: 'general' as 'general' | 'media' | 'support',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit message');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-strong rounded-2xl p-12 neural-glow text-center max-w-2xl">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Send className="w-8 h-8 text-primary" />
          </div>
          <h2 className="heading-lg text-3xl mb-4">Message Sent!</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Thank you for reaching out. We'll get back to you as soon as possible.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="btn-primary"
          >
            Send Another Message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Seo
        title="Contact NeurusAGi"
        description="Contact the NeurusAGi team about early access, media, partnerships or support. Every message is read by a person."
        path="/contact"
      />
      <JsonLd
        data={[
          webPageSchema('/contact', 'Contact NeurusAGi', 'Contact the NeurusAGi team.'),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Contact', path: '/contact' },
          ]),
        ]}
      />

      <section className="section-container">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="heading-xl mb-4">Contact Us</h1>
            <p className="text-lg text-muted-foreground">
              Have questions? We're here to help.
            </p>
          </div>

          {/* Contact Form */}
          <div className="glass-strong rounded-2xl p-8 neural-glow">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="input-container">
                  <label className="input-label">Name *</label>
                  <input
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
                  <label className="input-label">Email *</label>
                  <input
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
                <label className="input-label" htmlFor="contact-inquiry-type">Inquiry Type *</label>
                <select
                  id="contact-inquiry-type"
                  name="inquiry_type"
                  value={formData.inquiry_type}
                  onChange={(e) => setFormData({ ...formData, inquiry_type: e.target.value as any })}
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
                <label className="input-label" htmlFor="contact-message">Message *</label>
                <textarea
                  id="contact-message"
                  name="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="input-field w-full min-h-[150px] resize-y"
                  placeholder="How can we help you?"
                  required
                  disabled={loading}
                  maxLength={1000}
                />
                <p className="text-xs text-muted-foreground mt-1">
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
  );
}
