import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Screen } from '../Screen'
import s from '../Screen.module.css'
import o from './Onboarding.module.css'
import { BottomBar, TopBar } from '../../components/Bars'
import { Button, TextButton } from '../../components/Button'
import { TextField } from '../../components/TextField'
import { InlineAlert } from '../../components/InlineAlert'
import { GoogleLogo, NudgeMark } from '../../components/icons'
import { useStore } from '../../data/store'

/** Nudge mark (48) · "Nudge" · tagline — the centred brand block on Sign in and Create account. */
function Brand() {
  return (
    <div className={o.brand}>
      <NudgeMark size={48} />
      <p className={o.brandName}>Nudge</p>
      <p className={o.tagline}>Approve and answer your coding agents from anywhere.</p>
    </div>
  )
}

/** After signing in: setup the first time, Home if this browser is already set up. */
function useSignedIn() {
  const navigate = useNavigate()
  const signIn = useStore((x) => x.signIn)
  return (email?: string) => {
    signIn(email)
    navigate(useStore.getState().onboarded ? '/' : '/setup', { replace: true })
  }
}

/** SignIn / SignInError — /signin (01-onboarding.md) */
export function SignIn() {
  const navigate = useNavigate()
  const done = useSignedIn()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [wrong, setWrong] = useState(false)
  const ready = email.trim().length > 0 && password.length > 0

  const submit = (e?: FormEvent) => {
    e?.preventDefault()
    if (!ready) return
    // Prototype: any email and password work; "wrong" shows the error state.
    if (password === 'wrong') return setWrong(true)
    done(email)
  }

  return (
    <Screen>
      <Brand />
      <h1 className={o.authTitle}>Sign in</h1>
      <form id="signin" className={o.fields} onSubmit={submit} noValidate>
        <TextField label="Email" type="email" inputMode="email" autoComplete="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <TextField
          label="Password"
          password
          autoComplete="current-password"
          placeholder="Password"
          value={password}
          error={wrong ? 'Wrong email or password.' : undefined}
          onChange={(e) => {
            setPassword(e.target.value)
            setWrong(false)
          }}
        />
      </form>
      <div className={o.forgot}>
        <TextButton onClick={() => navigate('/forgot')}>Forgot password?</TextButton>
      </div>
      <p className={o.or}>or</p>
      <Button size="l" block variant="secondary" className={o.google} icon={<GoogleLogo size={20} />} onClick={() => done()}>
        Continue with Google
      </Button>
      <p className={o.switch}>
        New here?
        <TextButton className={o.inlineLink} onClick={() => navigate('/signup')}>
          Create account
        </TextButton>
      </p>
      <div className={s.fill} />
      <BottomBar>
        <Button size="l" type="submit" form="signin" disabled={!ready}>
          Sign in
        </Button>
      </BottomBar>
    </Screen>
  )
}

/** CreateAccount — /signup */
export function CreateAccount() {
  const navigate = useNavigate()
  const done = useSignedIn()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const valid = email.includes('@') && password.length >= 8

  const submit = (e?: FormEvent) => {
    e?.preventDefault()
    if (valid) done(email)
  }

  return (
    <Screen>
      <Brand />
      <h1 className={o.authTitle}>Create account</h1>
      <p className={o.authLead}>Use Google, or your email and a password.</p>
      <form id="signup" className={o.fields} onSubmit={submit} noValidate>
        <TextField label="Email" type="email" inputMode="email" autoComplete="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <TextField label="Password" password autoComplete="new-password" placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
      </form>
      <p className={o.or}>or</p>
      <Button size="l" block variant="secondary" className={o.google} icon={<GoogleLogo size={20} />} onClick={() => done()}>
        Continue with Google
      </Button>
      <p className={o.switch}>
        Already have an account?
        <TextButton className={o.inlineLink} onClick={() => navigate('/signin', { replace: true })}>
          Sign in instead
        </TextButton>
      </p>
      <div className={s.fill} />
      <BottomBar>
        <Button size="l" type="submit" form="signup" disabled={!valid}>
          Create account
        </Button>
      </BottomBar>
    </Screen>
  )
}

/** ForgotPassword — /forgot */
export function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const valid = email.includes('@')

  // Fake send: a short spinner, then the info alert (again on Resend, so it's announced each time).
  const send = (e?: FormEvent) => {
    e?.preventDefault()
    if (!valid || sending) return
    setSending(true)
    setSentTo(null)
    window.setTimeout(() => {
      setSending(false)
      setSentTo(email.trim())
    }, 700)
  }

  return (
    <Screen>
      <TopBar title="Nudge" onBack={() => navigate(-1)} />
      <h1 className={s.largeTitle}>Reset your password</h1>
      <p className={s.lead}>Enter your email and we’ll send a reset link.</p>
      <form className={[o.fields, o.fieldsAfterLead].join(' ')} onSubmit={send} noValidate>
        <TextField label="Email" type="email" inputMode="email" autoComplete="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Button size="l" block type="submit" disabled={!valid} loading={sending} className={o.inlineButton}>
          Send reset link
        </Button>
      </form>
      {sentTo && (
        <InlineAlert kind="info" live className={s.alertTop} action={{ label: 'Resend', onPress: () => send() }}>
          {`Link sent to ${sentTo}. Check your inbox and spam folder.`}
        </InlineAlert>
      )}
    </Screen>
  )
}
