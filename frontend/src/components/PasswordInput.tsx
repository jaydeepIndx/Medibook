import { useState, type InputHTMLAttributes } from 'react'

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>

export default function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <input
        {...props}
        type={visible ? 'text' : 'password'}
        className={`${className ?? ''} pr-12`}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-700"
      >
        <svg
          aria-hidden="true"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          viewBox="0 0 24 24"
        >
          {visible ? (
            <>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.9 5.2A10.7 10.7 0 0112 5c6.3 0 9.8 7 9.8 7a16 16 0 01-3 3.8M6.2 6.2A17.2 17.2 0 002.2 12s3.5 7 9.8 7a10.7 10.7 0 004.1-.8"
              />
            </>
          ) : (
            <>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.2 12s3.5-7 9.8-7 9.8 7 9.8 7-3.5 7-9.8 7-9.8-7-9.8-7z"
              />
              <circle cx="12" cy="12" r="3" />
            </>
          )}
        </svg>
      </button>
    </div>
  )
}
