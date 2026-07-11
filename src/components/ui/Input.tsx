'use client'
import { cn } from '@/utils'
import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, ...props }, ref) => (
    <div className="w-full">
      {label && <label className="input-label">{label}</label>}
      <input
        ref={ref}
        className={cn('input', error && 'input-error', className)}
        {...props}
      />
      {error && <p className="input-error-msg">{error}</p>}
      {hint && !error && <p className="input-hint">{hint}</p>}
    </div>
  )
)
Input.displayName = 'Input'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, ...props }, ref) => (
    <div className="w-full">
      {label && <label className="input-label">{label}</label>}
      <textarea
        ref={ref}
        className={cn('textarea', error && 'input-error', className)}
        {...props}
      />
      {error && <p className="input-error-msg">{error}</p>}
      {hint && !error && <p className="input-hint">{hint}</p>}
    </div>
  )
)
Textarea.displayName = 'Textarea'

interface SelectProps extends InputHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  options: { value: string; label: string }[]
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, className, ...props }, ref) => (
    <div className="w-full">
      {label && <label className="input-label">{label}</label>}
      <select
        ref={ref}
        className={cn('select', error && 'input-error', className)}
        {...(props as any)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="input-error-msg">{error}</p>}
      {hint && !error && <p className="input-hint">{hint}</p>}
    </div>
  )
)
Select.displayName = 'Select'
