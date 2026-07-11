'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Avatar, LevelBadge } from '@/components/ui'
import { Button } from '@/components/ui/Button'
import { timeAgo, formatCurrency } from '@/utils'
import { useAuthStore } from '@/store/auth.store'
import { Users, MessageCircle, Heart, Plus, Send, Briefcase, Link as LinkIcon, ChevronLeft, X } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function CommunityPage() {
  const { slug } = useParams<{ slug: string }>()
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [community, setCommunity] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'feed' | 'jobs'>('feed')
  const [showPostForm, setShowPostForm] = useState(false)
  const [postContent, setPostContent] = useState('')
  const [gigLink, setGigLink] = useState('')
  const [posting, setPosting] = useState(false)
  const [jobs, setJobs] = useState<any[]>([])

  useEffect(() => { fetchCommunity() }, [slug])
  useEffect(() => { if (activeTab === 'feed') fetchPosts(); else fetchJobs() }, [activeTab])

  const fetchCommunity = async () => {
    try {
      const res = await axios.get(`/api/community/${slug}`)
      setCommunity(res.data.data)
      fetchPosts()
    } catch { router.push('/community') }
    setLoading(false)
  }

  const fetchPosts = async () => {
    if (!community?.id) return
    try {
      const res = await axios.get(`/api/community/posts?community_id=${community.id}`)
      setPosts(res.data.data || [])
    } catch {}
  }

  const fetchJobs = async () => {
    if (!community?.id) return
    try {
      const res = await axios.get(`/api/scout/jobs?community_id=${community.id}`)
      setJobs(res.data.data || [])
    } catch {}
  }

  const handlePost = async () => {
    if (!postContent.trim()) { toast.error('Post cannot be empty'); return }
    if (!isAuthenticated) { router.push('/auth/login'); return }
    setPosting(true)
    try {
      await axios.post('/api/community/posts', {
        community_id: community.id,
        content: postContent.trim(),
        gig_link: gigLink.trim() || null,
        post_type: 'post',
      })
      setPostContent('')
      setGigLink('')
      setShowPostForm(false)
      fetchPosts()
      toast.success('Post published!')
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to post')
    }
    setPosting(false)
  }

  const handleLike = async (postId: string) => {
    try {
      await axios.post(`/api/community/posts/${postId}/like`, {})
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, is_liked: !p.is_liked, like_count: p.like_count + (p.is_liked ? -1 : 1) } : p))
    } catch {}
  }

  if (loading) return <div className="min-h-screen bg-gray-50"><Navbar /><div className="max-w-4xl mx-auto px-4 py-8 animate-pulse space-y-4"><div className="h-32 bg-gray-200 rounded-2xl"/><div className="h-64 bg-gray-200 rounded-2xl"/></div></div>
  if (!community) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Community Header */}
      <div className="bg-navy-900 py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <Link href="/community" className="flex items-center gap-1 text-sm text-gray-400 hover:text-white mb-4 transition-colors">
            <ChevronLeft className="w-4 h-4" /> All communities
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-white mb-1">{community.name}</h1>
              {community.description && <p className="text-gray-400 text-sm mb-3">{community.description}</p>}
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1"><Users className="w-3 h-3"/>{community.member_count.toLocaleString()} members</span>
                <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3"/>{community.post_count.toLocaleString()} posts</span>
              </div>
            </div>
            {!community.is_member && (
              <Button className="bg-green-500 hover:bg-green-600 flex-shrink-0">Join community</Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-5">
          {[{ id: 'feed', label: 'Feed' }, { id: 'jobs', label: `Jobs (${jobs.length})` }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-3 text-sm border-b-2 transition-colors ${activeTab === tab.id ? 'border-green-500 text-green-600 font-medium' : 'border-transparent text-gray-500 hover:text-navy-900'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          <div className="md:col-span-2 space-y-4">

            {/* Post composer */}
            {community.is_member && (
              <div className="bg-white rounded-xl border border-gray-100 p-4">
                {!showPostForm ? (
                  <button onClick={() => setShowPostForm(true)} className="w-full flex items-center gap-3 text-sm text-gray-400 hover:text-gray-600 transition-colors">
                    <Avatar user={user || undefined} size="sm" />
                    <span className="flex-1 bg-gray-50 rounded-xl px-4 py-2.5 text-left hover:bg-gray-100 transition-colors">Share something with the community...</span>
                  </button>
                ) : (
                  <div>
                    <div className="flex items-start gap-3 mb-3">
                      <Avatar user={user || undefined} size="sm" />
                      <textarea value={postContent} onChange={e => setPostContent(e.target.value)}
                        placeholder="Share insights, tips, or ask for help..." autoFocus
                        className="flex-1 text-sm text-navy-900 placeholder-gray-400 outline-none resize-none min-h-24 leading-relaxed" />
                    </div>
                    <div className="mb-3">
                      <div className="relative">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input value={gigLink} onChange={e => setGigLink(e.target.value)}
                          placeholder="Attach a gig link (optional) — nolance.com/gig/..." className="input pl-8 text-sm" />
                      </div>
                      <p className="input-hint">Max 3 gig shares per community per week</p>
                    </div>
                    <div className="flex justify-between">
                      <button onClick={() => { setShowPostForm(false); setPostContent(''); setGigLink('') }}
                        className="text-sm text-gray-400 hover:text-gray-600">Cancel</button>
                      <Button size="sm" loading={posting} onClick={handlePost} disabled={!postContent.trim()}>Post</Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Feed */}
            {activeTab === 'feed' && (
              posts.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                  <MessageCircle className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">No posts yet. Be the first to share something!</p>
                </div>
              ) : (
                posts.map(post => (
                  <div key={post.id} className="bg-white border border-gray-100 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar user={post.author} size="sm" />
                      <div>
                        <div className="flex items-center gap-2">
                          <Link href={`/seller/${post.author?.username}`} className="text-sm font-medium text-navy-900 hover:text-green-600">{post.author?.display_name || post.author?.username}</Link>
                          {post.author?.seller_profile?.level && <LevelBadge level={post.author.seller_profile.level} />}
                        </div>
                        <p className="text-xs text-gray-400">{timeAgo(post.created_at)}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed mb-3 whitespace-pre-line">{post.content}</p>
                    {post.gig_link && (
                      <a href={post.gig_link} className="flex items-center gap-2 text-sm text-green-600 hover:underline mb-3 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                        <Briefcase className="w-4 h-4" /> View gig
                      </a>
                    )}
                    <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                      <button onClick={() => handleLike(post.id)} className={`flex items-center gap-1.5 text-sm transition-colors ${post.is_liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}>
                        <Heart className={`w-4 h-4 ${post.is_liked ? 'fill-current' : ''}`} />{post.like_count}
                      </button>
                      <button className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-navy-900 transition-colors">
                        <MessageCircle className="w-4 h-4" />{post.comment_count}
                      </button>
                    </div>
                  </div>
                ))
              )
            )}

            {/* Jobs Board */}
            {activeTab === 'jobs' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-navy-900">Jobs in this community</h3>
                  <Link href={`/scout/post-job?community=${community.id}`}>
                    <Button size="sm"><Plus className="w-3.5 h-3.5" /> Post a job here</Button>
                  </Link>
                </div>
                {jobs.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                    <Briefcase className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm text-gray-400 mb-3">No jobs posted in this community yet</p>
                    <Link href={`/scout/post-job?community=${community.id}`}><Button size="sm">Post the first job</Button></Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {jobs.map(job => (
                      <Link key={job.id} href={`/scout/jobs/${job.id}`} className="block bg-white border border-gray-100 rounded-xl p-4 hover:border-green-300 transition-all">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-navy-900 mb-1 line-clamp-1">{job.title}</p>
                            <p className="text-xs text-gray-500 line-clamp-2 mb-2">{job.description}</p>
                            <div className="flex items-center gap-3 text-xs text-gray-400">
                              <span>{job.proposal_count} proposals</span>
                              <span>{timeAgo(job.created_at)}</span>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            {job.budget_min && <p className="text-sm font-bold text-navy-900">{formatCurrency(job.budget_min)}+</p>}
                            <span className={`badge text-xs ${job.budget_type === 'fixed' ? 'badge-green' : 'badge-blue'}`}>{job.budget_type}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h3 className="font-semibold text-navy-900 mb-3">About</h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-3">{community.description || 'A community for professionals in this field.'}</p>
              <div className="space-y-2 text-xs text-gray-400">
                <div className="flex justify-between"><span>Members</span><span className="font-medium text-navy-900">{community.member_count.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Posts</span><span className="font-medium text-navy-900">{community.post_count.toLocaleString()}</span></div>
              </div>
            </div>
            <div className="bg-green-50 border border-green-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-green-700 mb-2">Community rules</p>
              <ul className="space-y-1 text-xs text-green-600">
                <li>• Be respectful and professional</li>
                <li>• Max 3 gig link shares per week</li>
                <li>• No spam or repeated posts</li>
                <li>• Keep discussions relevant</li>
                <li>• Only Nolance gig links allowed</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
