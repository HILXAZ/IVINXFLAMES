import React, { createContext, useContext, useEffect, useState } from 'react'

const ToastContext = createContext(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const push = (msg, type = 'info', ttl = 4000) => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, msg, type }])
    setTimeout(() => setToasts((t) => t.filter(x => x.id !== id)), ttl)
  }
  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed top-4 right-4 space-y-2 z-[1000]">
        {toasts.map(t => (
          <div key={t.id} className={`px-4 py-2 rounded-lg shadow text-white ${t.type==='error'?'bg-rose-600':'bg-gray-900'}`}>
            {t.msg}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
