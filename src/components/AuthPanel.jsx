import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthPanel() {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    if (mode === 'signin') {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message)
      }

      setSubmitting(false)
      return
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError) {
      setError(signUpError.message)
    } else {
      setSuccess(
        'Cuenta creada correctamente. Revisa tu correo si tu proyecto requiere confirmación antes de iniciar sesión.',
      )
    }

    setSubmitting(false)
  }

  function handleModeChange(nextMode) {
    setMode(nextMode)
    setError('')
    setSuccess('')
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Lab Trainer
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            Inicia sesión o crea una cuenta para entrar a la plataforma.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => handleModeChange('signin')}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              mode === 'signin'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('signup')}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              mode === 'signup'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Registrarse
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-900"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-900"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={
                mode === 'signin' ? 'current-password' : 'new-password'
              }
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500"
            />
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Error: {error}
            </div>
          )}

          {success && (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className={`w-full rounded-xl px-4 py-3 text-sm font-medium text-white transition ${
              submitting
                ? 'cursor-not-allowed bg-slate-400'
                : 'bg-slate-900 hover:bg-slate-800'
            }`}
          >
            {submitting
              ? 'Procesando...'
              : mode === 'signin'
                ? 'Iniciar sesión'
                : 'Crear cuenta'}
          </button>
        </form>
      </div>
    </main>
  )
}
