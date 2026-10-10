import React, { useState } from 'react';
import {
  UserCheck,
  Phone,
  Mail,
  Calendar,
  MessageSquare,
  Copy,
  Check,
  Download,
  Trash2,
  ExternalLink,
  Search,
  MessageCircle,
} from 'lucide-react';
import { LeadContactItem } from '../types';

interface CapturedLeadsViewerProps {
  leads: LeadContactItem[];
  onDeleteLead?: (leadId: string) => Promise<void>;
  profileName?: string;
}

export function CapturedLeadsViewer({
  leads = [],
  onDeleteLead,
  profileName = 'Mi Perfil',
}: CapturedLeadsViewerProps) {
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredLeads = leads.filter((lead) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase().trim();
    return (
      lead.name.toLowerCase().includes(q) ||
      lead.phone.toLowerCase().includes(q) ||
      (lead.email && lead.email.toLowerCase().includes(q)) ||
      (lead.note && lead.note.toLowerCase().includes(q))
    );
  });

  const handleCopyPhone = async (phone: string, id: string) => {
    try {
      await navigator.clipboard.writeText(phone);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      // fallback
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (leads.length === 0) return;

    const headers = ['Nombre', 'Teléfono', 'Correo', 'Nota', 'Fecha'];
    const rows = leads.map((l) => [
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.phone.replace(/"/g, '""')}"`,
      `"${(l.email || '').replace(/"/g, '""')}"`,
      `"${(l.note || '').replace(/"/g, '""')}"`,
      `"${new Date(l.createdAt).toLocaleString()}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `contactos_capturados_${profileName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">
              Contactos Capturados ("Leads")
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {leads.length} recibidos
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Personas que escanearon tu tarjeta NFC y te dejaron sus datos de contacto
          </p>
        </div>

        {leads.length > 0 && (
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 text-xs font-bold transition-all shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar a Excel / CSV</span>
          </button>
        )}
      </div>

      {leads.length > 0 && (
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, teléfono o correo..."
            className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
          />
        </div>
      )}

      {/* Leads List */}
      {filteredLeads.length > 0 ? (
        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
          {filteredLeads.map((lead) => {
            const cleanPhone = lead.phone.replace(/[^0-9]/g, '');
            const waUrl = `https://wa.me/${cleanPhone}`;

            return (
              <div
                key={lead.id}
                className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white truncate">
                      {lead.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                    <span className="font-mono flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {lead.phone}
                    </span>

                    {lead.email && (
                      <span className="flex items-center gap-1 text-slate-400 truncate">
                        <Mail className="w-3 h-3" />
                        {lead.email}
                      </span>
                    )}
                  </div>

                  {lead.note && (
                    <p className="text-xs text-slate-400 italic pt-0.5">
                      "{lead.note}"
                    </p>
                  )}
                </div>

                {/* Quick actions for each lead */}
                <div className="flex items-center gap-2 flex-shrink-0 pt-2 sm:pt-0">
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>WhatsApp</span>
                  </a>

                  <a
                    href={`tel:${cleanPhone}`}
                    className="py-1.5 px-3 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <Phone className="w-3 h-3 text-sky-400" />
                    <span>Llamar</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => handleCopyPhone(lead.phone, lead.id)}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
                    title="Copiar teléfono"
                  >
                    {copiedId === lead.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {onDeleteLead && (
                    <button
                      type="button"
                      onClick={() => onDeleteLead(lead.id)}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-all"
                      title="Eliminar contacto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-10 text-center bg-slate-950/40 rounded-2xl border border-dashed border-slate-800">
          <UserCheck className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-300">
            Aún no hay contactos capturados
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Activa el módulo de <strong>"Captura de Prospectos"</strong> en la pestaña de módulos. Las personas que escaneen tu tarjeta NFC podrán dejarte su nombre y teléfono aquí.
          </p>
        </div>
      )}
    </div>
  );
}
