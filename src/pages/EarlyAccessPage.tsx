import { Seo, JsonLd } from '../components/Seo';
import { EarlyAccessForm } from '../components/EarlyAccessForm';
import { breadcrumbSchema, faqSchema, productSchema, webPageSchema } from '../lib/schema';

const faqs = [
  {
    question: 'What is NeurusAGi early access?',
    answer:
      'Early access is a limited, reviewed program that gives a small number of organizations and individuals direct access to NeurusAGi, a quantum-powered artificial general intelligence agent built on an artificial superintelligence framework. Requests are reviewed personally by the founder.',
  },
  {
    question: 'How do I request early access to NeurusAGi?',
    answer:
      'Complete the Request Early Access form on this page with your name, email, organization and what you want to build. You will receive a confirmation that your request was received, and a follow-up email once your access is approved.',
  },
  {
    question: 'How long does approval take?',
    answer:
      'Access is granted in phases. Most requests receive a response within a few business days. Requests are prioritized by how clearly the use case fits the current onboarding phase.',
  },
  {
    question: 'Does requesting early access cost anything?',
    answer:
      'No. Submitting a request is free and does not create any payment obligation. Pricing only applies if you choose a plan after your access is approved.',
  },
  {
    question: 'What information is collected with my request?',
    answer:
      'We store the details you submit plus non-precise context your browser shares automatically, such as timezone region, language, referrer, device type and campaign parameters. We do not request precise location and we never sell your data.',
  },
];

const steps = [
  {
    title: 'Send the request',
    body: 'Tell us who you are and the first problem you want NeurusAGi to solve.',
  },
  {
    title: 'We review it',
    body: 'Every request is read by the founder. Access is granted in phases so onboarding stays deliberate.',
  },
  {
    title: 'You get access',
    body: 'Approved requests receive an invitation email with next steps and onboarding details.',
  },
];

export function EarlyAccessPage() {
  const title = 'Request Early Access to NeurusAGi';
  const description =
    'Request early access to NeurusAGi, the first quantum-powered artificial general intelligence agent. Reviewed personally, granted in phases. No cost to apply.';

  return (
    <div className="min-h-screen">
      <Seo title={title} description={description} path="/early-access" />
      <JsonLd
        data={[
          webPageSchema('/early-access', title, description),
          productSchema(),
          faqSchema(faqs),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Request Early Access', path: '/early-access' },
          ]),
        ]}
      />

      <section className="section-container">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary mb-4">Early access</p>
            <h1 className="heading-xl mb-4">Request Early Access to NeurusAGi</h1>
            <p className="text-lg text-muted-foreground mb-8">
              NeurusAGi is onboarding in phases. Tell us what you want to build and we will review
              your request personally. There is no cost to apply.
            </p>

            <ol className="space-y-5 mb-10">
              {steps.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <span
                    aria-hidden="true"
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-primary/30 text-sm font-semibold text-primary"
                  >
                    {index + 1}
                  </span>
                  <div>
                    <h2 className="text-base font-semibold text-foreground mb-1">{step.title}</h2>
                    <p className="text-sm text-muted-foreground">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="glass rounded-2xl p-5">
              <h2 className="text-base font-semibold mb-2">Already requested access?</h2>
              <p className="text-sm text-muted-foreground">
                Submitting again is safe. We recognise your email and keep your original request on
                file. Questions go to{' '}
                <a href="mailto:jt@neurusagi.com" className="text-primary hover:underline">
                  jt@neurusagi.com
                </a>
                .
              </p>
            </div>
          </div>

          <div className="glass-strong rounded-2xl p-6 sm:p-8 neural-glow">
            <h2 className="heading-md text-2xl mb-2">Request early access</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Fields marked with an asterisk are required.
            </p>
            <EarlyAccessForm idPrefix="early-access-page" />
          </div>
        </div>
      </section>

      <section className="section-container pt-0" aria-labelledby="early-access-faq">
        <div className="max-w-3xl mx-auto">
          <h2 id="early-access-faq" className="heading-lg text-2xl sm:text-3xl mb-6">
            Early access questions
          </h2>
          <dl className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.question} className="feature-block p-5">
                <dt className="text-base font-semibold text-foreground mb-2">{faq.question}</dt>
                <dd className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </div>
  );
}
