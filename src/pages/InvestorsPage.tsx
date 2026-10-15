import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Loader2, Send } from 'lucide-react';
import { SEO, organizationSchema } from '../components/SEO';

export function InvestorsPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const seo = (
    <SEO
      title="Investor Relations | NeurusAGi"
      description="Connect with NeurusAGi about investment opportunities and the future of artificial general intelligence."
      path="/investors"
      keywords="NeurusAGi investors, AI investment, artificial general intelligence investment, investor relations"
      structuredData={organizationSchema()}
    />
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Insert into database
      const { error: dbError } = await supabase
        .from('investor_inquiries')
        .insert([formData]);

      if (dbError) throw dbError;

      // Send email notification
      const { error: emailError } = await supabase.functions.invoke('send-email', {
        body: {
          to: 'jt@naurusagi.com',
          subject: 'Investor Interested',
          html: `
            <h2>New Investor Inquiry</h2>
            <p><strong>Name:</strong> ${formData.name}</p>
            <p><strong>Email:</strong> ${formData.email}</p>
            <p><strong>Company:</strong> ${formData.company || 'N/A'}</p>
            <p><strong>Phone:</strong> ${formData.phone || 'N/A'}</p>
            <p><strong>Message:</strong></p>
            <p>${formData.message}</p>
          `,
        },
      });

      if (emailError) {
        console.error('Email error:', emailError);
      }

      setSubmitted(true);
      setFormData({ name: '', email: '', company: '', phone: '', message: '' });
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit inquiry');
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
          <h1 className="heading-lg text-3xl mb-4">Thank You!</h1>
          <p className="text-lg text-muted-foreground mb-8">
            We appreciate your interest in NeurusAGi. Our team will be in touch shortly to discuss investment opportunities.
          </p>
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="btn-primary"
          >
            Submit Another Inquiry
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
      <section className="section-container" aria-labelledby="investor-title">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 id="investor-title" className="heading-xl mb-4">Investor Relations</h1>
            <p className="text-lg text-muted-foreground">
              Join us in shaping the future of artificial general intelligence
            </p>
          </div>

          {/* Video Section */}
          <div className="glass-strong rounded-2xl p-8 neural-glow mb-12">
            <h2 className="heading-md text-center mb-6">NeurusAGi Investor Overview</h2>
            <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center">
              <div className="text-center space-y-2">
                <p className="text-xl gradient-text font-semibold">
                  Investor materials available by request
                </p>
                <p className="text-sm text-muted-foreground">
                  Contact our team for the current investor overview and supporting materials.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="glass-strong rounded-2xl p-8 neural-glow">
            <h2 className="heading-md text-2xl mb-6 text-center">Get In Touch</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6" aria-label="NeurusAGi investor inquiry form">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="input-container">
                  <label htmlFor="investor-name" className="input-label">Name *</label>
                  <input
                    id="investor-name"
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
                  <label htmlFor="investor-email" className="input-label">Email *</label>
                  <input
                    id="investor-email"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="input-container">
                  <label htmlFor="investor-company" className="input-label">Company</label>
                  <input
                    id="investor-company"
                    name="company"
                    autoComplete="organization"
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="input-field w-full"
                    placeholder="Company name (optional)"
                    disabled={loading}
                  />
                </div>

                <div className="input-container">
                  <label htmlFor="investor-phone" className="input-label">Phone</label>
                  <input
                    id="investor-phone"
                    name="phone"
                    autoComplete="tel"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-field w-full"
                    placeholder="Phone number (optional)"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="input-container">
                <label htmlFor="investor-message" className="input-label">Message *</label>
                <textarea
                  id="investor-message"
                  aria-describedby="investor-message-count"
                  name="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="input-field w-full min-h-[150px] resize-y"
                  placeholder="Tell us about your investment interests..."
                  required
                  disabled={loading}
                  maxLength={1000}
                />
                <p id="investor-message-count" className="text-xs text-muted-foreground mt-1" aria-live="polite">
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
                    <span>Submitting...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center space-x-2">
                    <Send className="w-5 h-5" />
                    <span>Submit Inquiry</span>
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
