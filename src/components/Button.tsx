import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Spinner } from './icons'
import s from './Button.module.css'

type Variant = 'primary' | 'secondary' | 'destructive'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: 'm' | 'l'
  /** Stretch to the container width. */
  block?: boolean
  icon?: ReactNode
  loading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'm',
  block,
  icon,
  loading,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={[s.button, s[size], s[variant], block && s.block, loading && s.loading, className]
        .filter(Boolean)
        .join(' ')}
      aria-busy={loading || undefined}
      {...rest}
    >
      {icon}
      <span>{children}</span>
      {loading && <Spinner size={20} className={s.spinner} />}
    </button>
  )
}

type TextButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { destructive?: boolean; icon?: ReactNode }

/** Text link: ink colour, 600 weight, no underline, 44-tall target. */
export function TextButton({ destructive, icon, className, children, type = 'button', ...rest }: TextButtonProps) {
  return (
    <button
      type={type}
      className={[s.text, destructive && s.textDestructive, className].filter(Boolean).join(' ')}
      {...rest}
    >
      {icon}
      {children}
    </button>
  )
}

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Required: icon buttons have no visible text. */
  label: string
  plain?: boolean
  children: ReactNode
}

export function IconButton({ label, plain, className, children, type = 'button', ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      className={[s.icon, plain ? s.iconPlain : s.iconRaised, className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </button>
  )
}
