import { useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { submitEarlyAccess } from '../lib/earlyAccess';

interface EarlyAccessFormProps {
  /** Compact layout for embedding in a page section. */
  compact?: boolean;
  idPrefix?: string;
}

export function EarlyAccessForm({ compact = false, idPrefix = 'early-access' }: EarlyAccessFormProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [teamSize, setTeamSize] = useState('');
  const [useCase, setUseCase] = useState('');
  const [website, setWebsite] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'duplicate' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!consent) {
      setStatus('error');
      setMessage('Please confirm we can email you about early access.');
      return;
    }

    setStatus('submitting');
    setMessage('');

    const result = await submitEarlyAccess({
      fullName,
      email,
      company,
      role,
      teamSize,
      useCase,
      website,
    });

    if (result.ok) {
      setStatus('duplicate' in result && result.duplicate ? 'duplicate' : 'success');
      setMessage(
        'duplicate' in result && result.duplicate
          ? 'You are already on the early access list. We will email you as soon as your seat opens.'
          : 'Your request is in. We review every request personally and will email you at ' + email + '.',
      );
      setFullName('');
      setEmail('');
      setCompany('');
      setRole('');
      setTeamSize('');
      setUseCase('');
      setConsent(false);
      return;
    }

    setStatus('error');
    setMessage(result.message);
  };

  if (status === 'success' || status === 'duplicate') {
    return (
      <div className="glass-strong rounded-2xl p-8 text-center" role="status" aria-live="polite">
        <CheckCircle2 aria-hidden="true" className="w-12 h-12 text-primary mx-auto mb-4" />
        <h3 className="heading-md text-2xl mb-2">
          {status === 'duplicate' ? 'You are already on the list' : 'Request received'}
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto">{message}</p>
      </div>
    );
  }

  const inputId = (name: string) => `${idPrefix}-${name}`;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={compact ? 'space-y-4' : 'space-y-5'}
      aria-describedby={`${idPrefix}-privacy`}
    >
      <div className={compact ? 'space-y-4' : 'grid grid-cols-1 sm:grid-cols-2 gap-5'}>
        <div className="input-container">
          <label className="input-label" htmlFor={inputId('name')}>
            Full name <span aria-hidden="true">*</span>
          </label>
          <input
            id={inputId('name')}
            name="name"
            type="text"
            autoComplete="name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="input-field w-full"
            placeholder="Your name"
            disabled={status === 'submitting'}
          />
        </div>

        <div className="input-container">
          <label className="input-label" htmlFor={inputId('email')}>
            Work email <span aria-hidden="true">*</span>
          </label>
          <input
            id={inputId('email')}
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field w-full"
            placeholder="you@company.com"
            disabled={status === 'submitting'}
          />
        </div>

        <div className="input-container">
          <label className="input-label" htmlFor={inputId('company')}>
            Company or organization
          </label>
          <input
            id={inputId('company')}
            name="organization"
            type="text"
            autoComplete="organization"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="input-field w-full"
            placeholder="Where you work or study"
            disabled={status === 'submitting'}
          />
        </div>

        <div className="input-container">
          <label className="input-label" htmlFor={inputId('role')}>
            Your role
          </label>
          <input
            id={inputId('role')}
            name="role"
            type="text"
            autoComplete="organization-title"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="input-field w-full"
            placeholder="Founder, researcher, engineer..."
            disabled={status === 'submitting'}
          />
        </div>

        <div className="input-container">
          <label className="input-label" htmlFor={inputId('team')}>
            Team size
          </label>
          <select
            id={inputId('team')}
            name="teamSize"
            value={teamSize}
            onChange={(e) => setTeamSize(e.target.value)}
            className="input-field w-full"
            disabled={status === 'submitting'}
          >
            <option value="">Select one</option>
            <option value="individual">Just me</option>
            <option value="2-10">2 to 10</option>
            <option value="11-50">11 to 50</option>
            <option value="51-200">51 to 200</option>
            <option value="201+">201 or more</option>
          </select>
        </div>
      </div>

      <div className="input-container">
        <label className="input-label" htmlFor={inputId('use-case')}>
          What do you want to build or solve first?
        </label>
        <textarea
          id={inputId('use-case')}
          name="useCase"
          rows={compact ? 3 : 4}
          value={useCase}
          onChange={(e) => setUseCase(e.target.value)}
          className="input-field w-full resize-y"
          placeholder="A sentence or two is plenty"
          disabled={status === 'submitting'}
        />
      </div>

      {/* Honeypot field, hidden from people and assistive tech */}
      <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
        <label htmlFor={inputId('website')}>Website</label>
        <input
          id={inputId('website')}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <div className="flex items-start gap-3">
        <input
          id={inputId('consent')}
          name="consent"
          type="checkbox"
          required
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1 h-4 w-4 accent-[hsl(180_100%_41%)]"
          disabled={status === 'submitting'}
        />
        <label htmlFor={inputId('consent')} className="text-xs text-muted-foreground leading-relaxed">
          Email me about early access and launch updates. No spam, and you can ask us to remove your
          details at any time.
        </label>
      </div>

      <p id={`${idPrefix}-privacy`} className="text-xs text-muted-foreground/80 leading-relaxed">
        We record the time of your request and general, non-precise context your browser shares
        automatically, such as timezone region, language, referrer and device type. We do not request
        precise location and we never sell data.
      </p>

      {status === 'error' && (
        <p role="alert" className="text-sm text-destructive">
          {message}
        </p>
      )}

      <button type="submit" disabled={status === 'submitting'} className="w-full btn-primary">
        {status === 'submitting' ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 aria-hidden="true" className="w-5 h-5 animate-spin" />
            <span>Sending request...</span>
          </span>
        ) : (
          'Request Early Access'
        )}
      </button>
    </form>
  );
}
