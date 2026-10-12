'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { 
  Hash, 
  AlertOctagon, 
  Layers, 
  Zap, 
  Wrench, 
  Send, 
  Camera, 
  X, 
  Paperclip, 
  Image as ImageIcon, 
  User as UserIcon, 
  Clock, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink,
  Shield,
  HardHat,
  Search,
  RefreshCw
} from 'lucide-react';
import { User, ChatChannel, ChatMessage, ProductionLine, EventPhoto } from '@/types';
import { PhotoLightboxModal } from './PhotoLightboxModal';

interface IndustrialChatViewProps {
  currentUser: User;
  initialChannels: ChatChannel[];
  initialMessages: ChatMessage[];
  lines: ProductionLine[];
  initialChannelSlug?: string;
  initialTopic?: string;
}

export function IndustrialChatView({
  currentUser,
  initialChannels,
  initialMessages,
  lines,
  initialChannelSlug,
  initialTopic,
}: IndustrialChatViewProps) {
  const [channels, setChannels] = useState<ChatChannel[]>(initialChannels);
  const [activeChannelId, setActiveChannelId] = useState<string>(() => {
    if (initialChannelSlug) {
      const found = initialChannels.find((c) => c.slug === initialChannelSlug);
      if (found) return found.id;
    }
    return initialChannels[0]?.id || 'chan-ogolny';
  });

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputText, setInputText] = useState(initialTopic ? `W sprawie zgłoszenia: ${initialTopic} - ` : '');
  const [selectedMachineName, setSelectedMachineName] = useState<string>('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<EventPhoto | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeChannel = channels.find((c) => c.id === activeChannelId) || channels[0];

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Poll messages every 4 seconds for live chat feeling
  const fetchMessages = useCallback(async (channelId: string) => {
    try {
      const res = await fetch(`/api/chat/messages?channelId=${channelId}&limit=80`);
      if (res.ok) {
        const data = await res.json();
        if (data.messages) {
          setMessages(data.messages);
        }
      }
    } catch (err) {
      console.warn('Chat fetch poll error:', err);
    }
  }, []);

  useEffect(() => {
    fetchMessages(activeChannelId);
    const interval = setInterval(() => {
      fetchMessages(activeChannelId);
    }, 4000);
    return () => clearInterval(interval);
  }, [activeChannelId, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview('');
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !photoFile) return;

    setIsSending(true);
    try {
      let uploadedPhotoUrl = '';
      if (photoFile) {
        setIsUploadingPhoto(true);
        const formData = new FormData();
        formData.append('file', photoFile);
        formData.append('type', 'photos');

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok && uploadData.fileUrl) {
          uploadedPhotoUrl = uploadData.fileUrl;
        }
        setIsUploadingPhoto(false);
      }

      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelId: activeChannelId,
          content: inputText.trim(),
          photoUrl: uploadedPhotoUrl || undefined,
          relatedTargetName: selectedMachineName || undefined,
        }),
      });

      if (res.ok) {
        setInputText('');
        removePhoto();
        setSelectedMachineName('');
        await fetchMessages(activeChannelId);
      }
    } catch (err) {
      console.error('Send message error:', err);
    } finally {
      setIsSending(false);
    }
  };

  const getChannelIcon = (iconName?: string) => {
    switch (iconName) {
      case 'AlertOctagon':
        return <AlertOctagon className="w-4 h-4 text-rose-400" />;
      case 'Zap':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'Wrench':
        return <Wrench className="w-4 h-4 text-emerald-400" />;
      case 'Layers':
        return <Layers className="w-4 h-4 text-cyan-400" />;
      default:
        return <Hash className="w-4 h-4 text-slate-400" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
            Kierownik UR
          </span>
        );
      case 'MAINTENANCE':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
            Automatyk UR
          </span>
        );
      case 'OPERATOR':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
            Operator
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-[calc(100vh-8rem)] flex flex-col md:flex-row bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* LEFT SIDEBAR: Channels */}
      <div className="w-full md:w-72 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0">
        {/* Workspace Brand Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-sm shadow">
              OP
            </div>
            <div>
              <div className="text-xs font-black text-white leading-tight">
                OplastAsist Slack
              </div>
              <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Komunikator UR & Fabryki</span>
              </div>
            </div>
          </div>

          <Link
            href="/faults"
            className="text-[10px] font-bold text-rose-300 hover:text-rose-200 bg-rose-950/70 border border-rose-800/80 px-2 py-1 rounded-md transition"
            title="Przejdź do rejestru awarii"
          >
            Awarie →
          </Link>
        </div>

        {/* Channels List */}
        <div className="p-3 flex-1 overflow-y-auto space-y-1">
          <div className="text-[10px] font-black uppercase text-slate-500 tracking-wider px-2 py-1">
            Kanały Zakładowe
          </div>

          {channels.map((chan) => {
            const isActive = chan.id === activeChannelId;
            const isAlertChannel = chan.slug === 'awarie-krytyczne';

            return (
              <button
                key={chan.id}
                type="button"
                onClick={() => setActiveChannelId(chan.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition flex items-center justify-between gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-white font-bold shadow-sm ring-1 ring-slate-700'
                    : isAlertChannel
                    ? 'text-rose-300 hover:bg-rose-950/40'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {getChannelIcon(chan.icon)}
                  <span className="truncate">{chan.name}</span>
                </div>

                {isAlertChannel && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 animate-ping"></span>
                )}
              </button>
            );
          })}
        </div>

        {/* Current user card footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs border border-slate-700">
              {currentUser.name.charAt(0)}
            </div>
            <div className="text-[11px] leading-tight">
              <div className="font-bold text-white truncate max-w-[120px]">{currentUser.name}</div>
              <div className="text-slate-400 text-[10px]">{currentUser.role}</div>
            </div>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold border border-emerald-900">
            Online
          </span>
        </div>
      </div>

      {/* MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-900">
        {/* Active Channel Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            {getChannelIcon(activeChannel.icon)}
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2 truncate">
                <span>{activeChannel.name}</span>
              </h2>
              <p className="text-[11px] text-slate-400 truncate">
                {activeChannel.description || 'Kanał dyskusyjny'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsRefreshing(true);
                fetchMessages(activeChannelId).finally(() => setIsRefreshing(false));
              }}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Odśwież wiadomości"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
              <Hash className="w-10 h-10 text-slate-700" />
              <div className="text-sm font-bold text-slate-300">
                To jest początek kanału {activeChannel.name}
              </div>
              <p className="text-xs max-w-sm">
                Napisz pierwszą wiadomość lub zgłoś awarię, aby rozpocząć komunikację z zespołem.
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMe = msg.userId === currentUser.id;
              const hasAlert = msg.content.includes('🚨') || msg.content.includes('STOP LINII');

              return (
                <div
                  key={msg.id || idx}
                  className={`flex gap-3 text-xs ${
                    hasAlert
                      ? 'bg-rose-950/30 p-3 rounded-xl border border-rose-900/60'
                      : 'hover:bg-slate-800/30 p-2 rounded-xl transition'
                  }`}
                >
                  {/* User Avatar */}
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 shadow ${
                      msg.userRole === 'ADMIN'
                        ? 'bg-purple-900/70 text-purple-200 border border-purple-700'
                        : msg.userRole === 'MAINTENANCE'
                        ? 'bg-amber-900/70 text-amber-200 border border-amber-700'
                        : 'bg-emerald-900/70 text-emerald-200 border border-emerald-700'
                    }`}
                  >
                    {msg.userName ? msg.userName.charAt(0) : 'U'}
                  </div>

                  {/* Message Bubble */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-white text-xs">{msg.userName}</span>
                      {getRoleBadge(msg.userRole)}
                      <span className="text-[10px] text-slate-500 font-mono">
                        {msg.createdAt}
                      </span>
                    </div>

                    {/* Associated Machine Pill */}
                    {msg.relatedTargetName && (
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-semibold text-emerald-300 border border-slate-700">
                        <Layers className="w-3 h-3 text-emerald-400" />
                        <span>Dotyczy: {msg.relatedTargetName}</span>
                      </div>
                    )}

                    {/* Text content */}
                    <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </div>

                    {/* Photo attachment if any */}
                    {msg.photoUrl && (
                      <div className="pt-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setLightboxPhoto({
                              id: msg.id,
                              eventId: '',
                              photoType: 'GENERAL',
                              fileUrl: msg.photoUrl!,
                              caption: `Zdjęcie od ${msg.userName}`,
                              createdAt: msg.createdAt,
                            })
                          }
                          className="cursor-pointer group relative inline-block rounded-xl overflow-hidden border border-slate-700 shadow-md"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={msg.photoUrl}
                            alt="Załącznik"
                            className="max-w-xs max-h-48 object-cover rounded-xl group-hover:scale-105 transition duration-200"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[11px] font-bold">
                            Powiększ zdjęcie
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT COMPOSER AREA */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/90 space-y-2">
          {/* Machine tag indicator */}
          {selectedMachineName && (
            <div className="flex items-center justify-between text-[11px] bg-slate-900 border border-emerald-500/50 text-emerald-300 px-3 py-1 rounded-lg">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span>Oznaczasz maszynę: <b>{selectedMachineName}</b></span>
              </span>
              <button
                type="button"
                onClick={() => setSelectedMachineName('')}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Photo attachment preview */}
          {photoPreview && (
            <div className="relative inline-block border border-emerald-500 rounded-xl overflow-hidden bg-slate-900 p-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoPreview}
                alt="Do wysłania"
                className="w-20 h-16 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={removePhoto}
                className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-0.5 shadow"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="space-y-2">
            <div className="flex items-center gap-2">
              {/* Machine Tag Selector Dropdown */}
              <select
                value={selectedMachineName}
                onChange={(e) => setSelectedMachineName(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-[11px] text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 max-w-[150px] sm:max-w-[200px] truncate"
              >
                <option value="">+ Oznacz maszynę</option>
                {lines.map((l) => (
                  <option key={l.id} value={`${l.name} (${l.code})`}>
                    {l.code} - {l.name}
                  </option>
                ))}
              </select>

              {/* Photo Input (Camera on phone, file on desktop) */}
              <input
                type="file"
                accept="image/*"
                id="chat-photo-input"
                onChange={handlePhotoSelect}
                className="hidden"
              />
              <label
                htmlFor="chat-photo-input"
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white cursor-pointer transition"
                title="Dodaj zdjęcie z dysku lub aparatu"
              >
                <Camera className="w-4 h-4 text-emerald-400" />
              </label>

              {/* Main Text Input */}
              <input
                type="text"
                placeholder={`Napisz na kanale #${activeChannel.slug}... (Enter aby wysłać)`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isSending}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={isSending || (!inputText.trim() && !photoFile)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-950/40 cursor-pointer disabled:opacity-40"
              >
                {isSending ? (
                  <span className="text-[11px]">Wysyłam...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Wyślij</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Lightbox for attachments */}
      {lightboxPhoto && (
        <PhotoLightboxModal
          photo={lightboxPhoto}
          onClose={() => setLightboxPhoto(null)}
        />
      )}
    </div>
  );
}
