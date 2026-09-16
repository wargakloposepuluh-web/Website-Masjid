"use client";

import React from "react";
import { X, Download, ExternalLink } from "lucide-react";

interface ModalBuktiFotoProps {
  imageUrl: string;
  keterangan: string;
  onClose: () => void;
}

export default function ModalBuktiFoto({
  imageUrl,
  keterangan,
  onClose,
}: ModalBuktiFotoProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative max-w-2xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/80">
          <div>
            <h3 className="font-bold text-sm text-slate-800">Bukti Nota / Kwitansi</h3>
            <p className="text-xs text-slate-500 truncate max-w-md">{keterangan}</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={imageUrl}
              target="_blank"
              rel="noreferrer"
              download
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              title="Buka / Unduh Gambar"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-4 flex items-center justify-center bg-slate-100/50 max-h-[70vh] overflow-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={keterangan}
            className="max-h-[60vh] max-w-full object-contain rounded-xl shadow-md"
          />
        </div>
      </div>
    </div>
  );
}
