'use client'
import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Avatar, OnlineIndicator } from '@/components/ui'
import { useAuthStore } from '@/store/auth.store'
import { Message, Conversation } from '@/types'
import { Send, Paperclip, Search, MoreVertical, ArrowLeft } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { timeAgo, formatDateTime } from '@/utils'
import { cn } from '@/utils'

export default function MessagesPage() {
  const searchParams = useSearchParams()
  const activeConvId = searchParams.get('conv')
  const { user } = useAuthStore()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConv, setActiveConv] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [msgLoading, setMsgLoading] = useState(false)
  const [input, setInput] = useState('')
  const [search, setSearch] = useState('')
  const [sending, setSending] = useState(false)
  const [showConvList, setShowConvList] = useState(!activeConvId)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    fetchConversations()
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [])

  useEffect(() => {
    if (activeConvId && conversations.length > 0) {
      const conv = conversations.find(c => c.id === activeConvId)
      if (conv) openConversation(conv)
    }
  }, [activeConvId, conversations])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchConversations = async () => {
    try {
      const res = await axios.get('/api/messages')
      setConversations(res.data.data || [])
    } catch {}
    setLoading(false)
  }

  const openConversation = async (conv: Conversation) => {
    setActiveConv(conv)
    setShowConvList(false)
    setMsgLoading(true)
    try {
      const res = await axios.get(`/api/messages/${conv.id}`)
      setMessages(res.data.data || [])
      // Mark as read
      await axios.patch(`/api/messages/${conv.id}/read`, {})
    } catch {}
    setMsgLoading(false)

    // Poll for new messages every 3 seconds
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(async () => {
      try {
        const res = await axios.get(`/api/messages/${conv.id}`)
        setMessages(res.data.data || [])
      } catch {}
    }, 3000)
  }

  const sendMessage = async () => {
    if (!input.trim() || !activeConv || sending) return
    const content = input.trim()
    setInput('')
    setSending(true)

    // Optimistic update
    const tempMsg: any = {
      id: `temp-${Date.now()}`,
      conversation_id: activeConv.id,
      sender_id: user?.id,
      content,
      message_type: 'text',
      created_at: new Date().toISOString(),
      sender: user,
    }
    setMessages(prev => [...prev, tempMsg])

    try {
      const res = await axios.post('/api/messages', { conversation_id: activeConv.id, content })
      if (res.data.data?.warning) {
        toast('⚠️ ' + res.data.data.warning, { duration: 5000 })
      }
      // Refresh messages
      const fresh = await axios.get(`/api/messages/${activeConv.id}`)
      setMessages(fresh.data.data || [])
    } catch (err: any) {
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id))
      toast.error(err?.response?.data?.error || 'Failed to send message')
    }
    setSending(false)
  }

  const filtered = conversations.filter(c => {
    if (!search) return true
    const other = (c as any).other_participants?.[0]?.user
    return other?.username?.toLowerCase().includes(search.toLowerCase()) ||
      other?.display_name?.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-1 overflow-hidden max-w-7xl mx-auto w-full">

        {/* ── CONVERSATION LIST ─────────────────────── */}
        <div className={cn(
          'w-full md:w-80 lg:w-96 border-r border-gray-100 bg-white flex flex-col flex-shrink-0',
          !showConvList && 'hidden md:flex'
        )}>
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-navy-900 mb-3">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search conversations..." className="input pl-9 text-sm" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-10 h-10 bg-gray-100 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-gray-100 rounded w-24" />
                      <div className="h-3 bg-gray-100 rounded w-40" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 px-4">
                <p className="text-3xl mb-2">💬</p>
                <p className="text-sm text-gray-400">No conversations yet</p>
              </div>
            ) : (
              filtered.map(conv => {
                const other = (conv as any).other_participants?.[0]?.user
                const lastMsg = (conv as any).last_message
                const unread = (conv as any).unread_count || 0
                const isActive = activeConv?.id === conv.id

                return (
                  <button key={conv.id} onClick={() => openConversation(conv)}
                    className={cn('w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left border-b border-gray-50',
                      isActive && 'bg-green-50 border-green-100')}>
                    <div className="relative flex-shrink-0">
                      <Avatar user={other} size="md" />
                      {other?.is_online && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-sm font-medium text-navy-900 truncate">{other?.display_name || other?.username}</span>
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{lastMsg ? timeAgo(lastMsg.created_at) : ''}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-400 truncate">
                          {lastMsg?.is_system_message ? '🔔 ' : lastMsg?.sender_id === user?.id ? 'You: ' : ''}
                          {lastMsg?.content || 'No messages yet'}
                        </p>
                        {unread > 0 && (
                          <span className="bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium flex-shrink-0 ml-2">
                            {unread > 9 ? '9+' : unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* ── CHAT AREA ─────────────────────────────── */}
        <div className={cn('flex-1 flex flex-col', showConvList && 'hidden md:flex')}>
          {!activeConv ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-5xl mb-4">💬</p>
                <h3 className="text-lg font-medium text-navy-900 mb-2">Select a conversation</h3>
                <p className="text-sm text-gray-400">Choose a conversation from the left to start messaging</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
                <button onClick={() => { setShowConvList(true); setActiveConv(null) }}
                  className="md:hidden w-8 h-8 flex items-center justify-center text-gray-400 hover:text-navy-900">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                {(() => {
                  const other = (activeConv as any).other_participants?.[0]?.user
                  return (
                    <>
                      <div className="relative">
                        <Avatar user={other} size="sm" />
                        {other?.is_online && <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border-2 border-white" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-navy-900">{other?.display_name || other?.username}</p>
                        <OnlineIndicator isOnline={other?.is_online} />
                      </div>
                    </>
                  )
                })()}
                {(activeConv as any).order && (
                  <a href={`/orders/${(activeConv as any).order?.order_number}`}
                    className="text-xs text-green-600 border border-green-200 rounded-lg px-3 py-1 hover:bg-green-50 transition-colors">
                    View order
                  </a>
                )}
                <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-navy-900">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {msgLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-sm text-gray-400">No messages yet. Say hello! 👋</p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, i) => {
                      const isMe = msg.sender_id === user?.id
                      const isSystem = msg.is_system_message
                      const showDate = i === 0 || (new Date(msg.created_at).toDateString() !== new Date(messages[i-1]?.created_at).toDateString())

                      return (
                        <div key={msg.id}>
                          {showDate && (
                            <div className="flex items-center justify-center my-4">
                              <span className="bg-gray-100 text-gray-400 text-xs px-3 py-1 rounded-full">
                                {new Date(msg.created_at).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          )}

                          {isSystem ? (
                            <div className="flex justify-center">
                              <span className="bg-navy-50 text-navy-600 text-xs px-4 py-2 rounded-full max-w-sm text-center">
                                {msg.content}
                              </span>
                            </div>
                          ) : (
                            <div className={cn('flex items-end gap-2', isMe && 'flex-row-reverse')}>
                              {!isMe && <Avatar user={(msg as any).sender} size="sm" />}
                              <div className={cn('max-w-xs lg:max-w-md', isMe ? 'items-end' : 'items-start', 'flex flex-col gap-1')}>
                                <div className={cn('px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
                                  isMe ? 'bg-green-500 text-white rounded-br-md' : 'bg-white border border-gray-100 text-navy-900 rounded-bl-md',
                                  msg.id.startsWith('temp-') && 'opacity-70')}>
                                  {msg.content}
                                </div>
                                <span className="text-xs text-gray-400 px-1">{timeAgo(msg.created_at)}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input Area */}
              <div className="bg-white border-t border-gray-100 p-4">
                {(activeConv as any).is_scout_to_business && (activeConv as any).scout_payment_available && (
                  <div className="mb-3 bg-green-50 border border-green-200 rounded-xl p-3 flex items-center justify-between">
                    <p className="text-xs text-green-700 font-medium">💳 Scout payment available for this conversation</p>
                    <button className="text-xs text-green-600 font-semibold hover:underline">Create payment request</button>
                  </div>
                )}
                <div className="flex items-end gap-2">
                  <button className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-navy-900 flex-shrink-0">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                    placeholder="Type a message... (Enter to send)"
                    rows={1}
                    className="flex-1 resize-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-500 transition-colors max-h-32 overflow-y-auto"
                  />
                  <button onClick={sendMessage} disabled={!input.trim() || sending}
                    className="w-9 h-9 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl flex items-center justify-center text-white transition-colors flex-shrink-0">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-300 mt-2 text-center">
                  All messages are monitored for security. Keep communication on Nolance.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
