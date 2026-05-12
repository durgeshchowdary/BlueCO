'use client';

import { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, Download, FileCheck2, FileSpreadsheet, RefreshCw, Trash2, UploadCloud, XCircle } from 'lucide-react';
import api from '../lib/api';

type DocType = 'registration' | 'authorization';

type DltDocument = {
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: string | null;
  isUploaded: boolean;
};

type ComplianceResponse = {
  status: 'complete' | 'partial' | 'pending';
  documents: Record<DocType, DltDocument>;
};

type ToastFn = (toast: { message: string; type: 'success' | 'error' | 'info' }) => void;

const allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf', 'xlsx'];
const maxFileSize = 5 * 1024 * 1024;

const docLabels: Record<DocType, { title: string; description: string }> = {
  registration: {
    title: 'DLT registration proof',
    description: 'Upload the operator registration acknowledgement or certificate.',
  },
  authorization: {
    title: 'Sender ID authorization',
    description: 'Upload the approved sender ID or principal entity authorization.',
  },
};

const emptyDoc = {
  fileName: '',
  originalName: '',
  mimeType: '',
  size: 0,
  uploadedAt: null,
  isUploaded: false,
};

export default function DLTUploadBlock({ onToast }: { onToast?: ToastFn }) {
  const [compliance, setCompliance] = useState<ComplianceResponse>({
    status: 'pending',
    documents: { registration: emptyDoc, authorization: emptyDoc },
  });
  const [loading, setLoading] = useState(true);
  const [busyDoc, setBusyDoc] = useState<DocType | null>(null);
  const [dragDoc, setDragDoc] = useState<DocType | null>(null);
  const [error, setError] = useState('');
  const [lastUpload, setLastUpload] = useState<{ docType: DocType; file: File } | null>(null);
  const inputRefs = useRef<Record<DocType, HTMLInputElement | null>>({ registration: null, authorization: null });

  const notify: ToastFn = (toast) => onToast?.(toast);

  const fetchCompliance = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get<ComplianceResponse>('/academy/compliance/dlt-documents');
      setCompliance(response.data);
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Unable to load DLT compliance documents.';
      setError(message);
      notify({ message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompliance();
  }, []);

  const statusCopy = useMemo(() => {
    if (compliance.status === 'complete') return 'Complete';
    if (compliance.status === 'partial') return 'Partial';
    return 'Pending';
  }, [compliance.status]);

  const validateFile = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    if (!allowedExtensions.includes(extension)) return 'Upload jpg, jpeg, png, pdf, or xlsx files only.';
    if (file.size <= 0) return 'Empty files cannot be uploaded.';
    if (file.size > maxFileSize) return 'DLT documents must be 5MB or smaller.';
    return '';
  };

  const fileToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || '').split(',')[1] || '');
      reader.onerror = () => reject(new Error('Could not read file.'));
      reader.readAsDataURL(file);
    });

  const uploadFile = async (docType: DocType, file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      notify({ message: validationError, type: 'error' });
      return;
    }

    const previous = compliance;
    const optimisticDoc = {
      fileName: file.name,
      originalName: file.name,
      mimeType: file.type || 'application/octet-stream',
      size: file.size,
      uploadedAt: new Date().toISOString(),
      isUploaded: true,
    };

    setBusyDoc(docType);
    setError('');
    setLastUpload({ docType, file });
    setCompliance((prev) => ({
      ...prev,
      status: docType === 'registration' && prev.documents.authorization.isUploaded
        ? 'complete'
        : docType === 'authorization' && prev.documents.registration.isUploaded
          ? 'complete'
          : 'partial',
      documents: { ...prev.documents, [docType]: optimisticDoc },
    }));

    try {
      const contentBase64 = await fileToBase64(file);
      const response = await api.post<ComplianceResponse>(`/academy/compliance/dlt-documents/${docType}`, {
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        contentBase64,
      });
      setCompliance(response.data);
      notify({ message: `${docLabels[docType].title} uploaded.`, type: 'success' });
    } catch (err: any) {
      setCompliance(previous);
      const message = err?.response?.data?.message || 'Upload failed. Please retry.';
      setError(message);
      notify({ message, type: 'error' });
    } finally {
      setBusyDoc(null);
      if (inputRefs.current[docType]) inputRefs.current[docType]!.value = '';
    }
  };

  const deleteDoc = async (docType: DocType) => {
    const previous = compliance;
    setBusyDoc(docType);
    setCompliance((prev) => {
      const documents = { ...prev.documents, [docType]: emptyDoc };
      const uploaded = Object.values(documents).filter((doc) => doc.isUploaded).length;
      return { status: uploaded === 2 ? 'complete' : uploaded === 1 ? 'partial' : 'pending', documents };
    });

    try {
      const response = await api.delete<ComplianceResponse>(`/academy/compliance/dlt-documents/${docType}`);
      setCompliance(response.data);
      notify({ message: `${docLabels[docType].title} removed.`, type: 'success' });
    } catch (err: any) {
      setCompliance(previous);
      const message = err?.response?.data?.message || 'Delete failed. Please retry.';
      notify({ message, type: 'error' });
    } finally {
      setBusyDoc(null);
    }
  };

  const downloadDoc = async (docType: DocType) => {
    try {
      const response = await api.get(`/academy/compliance/dlt-documents/${docType}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = compliance.documents[docType].fileName || `${docType}-dlt-document`;
      link.click();
      window.URL.revokeObjectURL(url);
      notify({ message: 'Download started.', type: 'info' });
    } catch (err: any) {
      notify({ message: err?.response?.data?.message || 'Download failed.', type: 'error' });
    }
  };

  const onFileChange = (docType: DocType, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) uploadFile(docType, file);
  };

  const onDrop = (docType: DocType, event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragDoc(null);
    const file = event.dataTransfer.files?.[0];
    if (file) uploadFile(docType, file);
  };

  return (
    <section className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black uppercase tracking-widest text-orange-700">DLT</span>
            <h3 className="text-lg font-black text-slate-900">Compliance uploads</h3>
          </div>
          <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
            Tenant-scoped documents for communication relay compliance.
          </p>
        </div>
        <span className={`w-fit rounded-full px-3 py-1 text-xs font-black uppercase ${
          compliance.status === 'complete' ? 'bg-emerald-100 text-emerald-700' : compliance.status === 'partial' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
        }`}>
          {statusCopy}
        </span>
      </div>

      {loading ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {[1, 2].map((item) => <div key={item} className="h-44 animate-pulse rounded-2xl bg-slate-100" />)}
        </div>
      ) : (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {(Object.keys(docLabels) as DocType[]).map((docType) => {
            const doc = compliance.documents[docType];
            const busy = busyDoc === docType;
            return (
              <div
                key={docType}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragDoc(docType);
                }}
                onDragLeave={() => setDragDoc(null)}
                onDrop={(event) => onDrop(docType, event)}
                className={`rounded-2xl border p-4 transition ${
                  dragDoc === docType ? 'border-orange-300 bg-orange-50' : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-white p-3 text-orange-600 shadow-sm">
                    {docType === 'authorization' ? <FileSpreadsheet size={21} /> : <FileCheck2 size={21} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-black text-slate-900">{docLabels[docType].title}</p>
                    <p className="mt-1 text-sm font-medium leading-5 text-slate-500">{docLabels[docType].description}</p>
                  </div>
                </div>

                <input
                  ref={(node) => {
                    inputRefs.current[docType] = node;
                  }}
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf,.xlsx"
                  className="hidden"
                  onChange={(event) => onFileChange(docType, event)}
                />

                {doc.isUploaded ? (
                  <div className="mt-4 rounded-xl border border-emerald-100 bg-white p-3">
                    <p className="truncate text-sm font-black text-slate-900">{doc.fileName}</p>
                    <p className="mt-1 text-xs font-bold text-slate-400">
                      {(doc.size / 1024).toFixed(1)} KB • {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleString() : 'Uploaded'}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button type="button" onClick={() => downloadDoc(docType)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-50">
                        <Download size={15} /> Download
                      </button>
                      <button type="button" onClick={() => deleteDoc(docType)} disabled={busy} className="inline-flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-black text-red-700 disabled:opacity-60">
                        <Trash2 size={15} /> Delete
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => inputRefs.current[docType]?.click()}
                    disabled={busy}
                    className="mt-4 flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-orange-200 bg-white px-4 py-6 text-center transition hover:bg-orange-50 disabled:opacity-60"
                  >
                    {busy ? <RefreshCw className="animate-spin text-orange-600" /> : <UploadCloud className="text-orange-600" />}
                    <span className="mt-2 text-sm font-black text-slate-800">Drop file or browse</span>
                    <span className="mt-1 text-xs font-bold text-slate-400">jpg, jpeg, png, pdf, xlsx up to 5MB</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {error ? (
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-3 text-sm font-bold text-red-700">
          <AlertCircle size={18} className="mt-0.5" />
          <span className="flex-1">{error}</span>
          {lastUpload ? (
            <button type="button" onClick={() => uploadFile(lastUpload.docType, lastUpload.file)} className="inline-flex items-center gap-1 text-red-800 underline">
              <RefreshCw size={14} /> Retry
            </button>
          ) : null}
          <button type="button" onClick={() => setError('')} aria-label="Dismiss error">
            <XCircle size={17} />
          </button>
        </div>
      ) : null}
    </section>
  );
}
