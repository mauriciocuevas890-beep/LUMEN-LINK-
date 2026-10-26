import React, { useState } from 'react';
import { X, Send, CheckCircle2, User, Phone, Mail, MessageSquare, Sparkles } from 'lucide-react';
import { LeadContactItem } from '../types';

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitLead: (lead: Omit<LeadContactItem, 'id' | 'createdAt'>) => Promise<void>;
  recipientName: string;
  formTitle?: string;
  successMessage?: string;
}

export function LeadCaptureModal({
  isOpen,
  onClose,
  onSubmitLead,
  recipientName,
  formTitle = 'Comparte tus datos de contacto',
  successMessage = '¡Datos compartidos con éxito!',
}: LeadCaptureModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Por favor escribe tu nombre.');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Por favor escribe tu número de teléfono o WhatsApp.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);
      await onSubmitLead({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        note: note.trim() || undefined,
      });
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setName('');
        setPhone('');
        setEmail('');
        setNote('');
        onClose();
      }, 2500);
    } catch (err) {
      setErrorMsg('Hubo un error al enviar tus datos. Intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-extrabold text-white">{successMessage}</h3>
            <p className="text-xs text-slate-400">
              {recipientName} ha recibido tus datos de contacto correctamente.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-left pr-8">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded-full mb-1">
                <Sparkles className="w-3 h-3" /> Intercambiar Contacto
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white">{formTitle}</h3>
              <p className="text-xs text-slate-400">
                Envía tus datos a <strong className="text-slate-200">{recipientName}</strong> para mantenerse en comunicación.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                {errorMsg}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tu Nombre Completo *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Carlos Hernández"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-base sm:text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Teléfono / WhatsApp *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+52 33 1234 5678"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-base sm:text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Correo Electrónico (opcional)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="carlos@ejemplo.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-base sm:text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Mensaje o Nota (opcional)
                </label>
                <div className="relative">
                  <MessageSquare className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <textarea
                    rows={2}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ej. Nos conocimos en el evento de networking..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-base sm:text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-sky-500/20 disabled:opacity-50"
              >
                {submitting ? (
                  <span>Enviando contacto...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Enviar mis datos a {recipientName}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
