'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface Note {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    fullName: string;
  };
}

interface Registration {
  id: string;
  registrationStatus: string;
  paymentStatus: string;
  paymentAmount: number | null;
  roleSnapshot: string;
  createdAt: string;
  event: {
    id: string;
    title: string;
    slug: string;
    startAt: string;
    endAt: string;
  };
}

interface DancerStats {
  totalRegistrations: number;
  confirmedRegistrations: number;
  totalSpent: number;
  firstRegistration: string | null;
}

interface Dancer {
  id: string;
  email: string;
  fullName: string;
  country: string | null;
  city: string | null;
  role: string | null;
  profilePictureUrl: string | null;
  bio: string | null;
  phoneNumber: string | null;
  websiteUrl: string | null;
  socialLinks: Record<string, string> | null;
  createdAt: string;
  auth: {
    provider: string | null;
    lastLoginAt: string | null;
    createdAt: string;
  } | null;
  tags: Tag[];
  registrations: Registration[];
  notes: Note[];
  stats: DancerStats;
}

interface EmailEvent {
  id: string;
  recipientEmail: string;
  recipientName: string | null;
  subject: string;
  emailType: string;
  status: string;
  sentAt: string | null;
  openedAt: string | null;
  clickedAt: string | null;
  bouncedAt: string | null;
  createdAt: string;
  event: {
    id: string;
    title: string;
  } | null;
}

type TabType = 'overview' | 'registrations' | 'notes' | 'emails';

export default function DancerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dancerId = params.id as string;

  const [dancer, setDancer] = useState<Dancer | null>(null);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [newNote, setNewNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState('');
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#6B7280');
  const [emails, setEmails] = useState<EmailEvent[]>([]);
  const [emailsLoading, setEmailsLoading] = useState(false);
  const [resendingEmail, setResendingEmail] = useState<string | null>(null);

  useEffect(() => {
    fetchDancer();
    fetchTags();
  }, [dancerId]);

  useEffect(() => {
    if (activeTab === 'emails' && dancer) {
      fetchEmails();
    }
  }, [activeTab, dancer]);

  async function fetchDancer() {
    try {
      const response = await fetch(`/api/dancers/${dancerId}`, { credentials: "include" });
      if (!response.ok) {
        if (response.status === 404) {
          router.push('/registrations');
          return;
        }
        throw new Error('Failed to fetch dancer');
      }
      const data = await response.json();
      setDancer(data);
    } catch (error) {
      console.error('Error fetching dancer:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchTags() {
    try {
      const response = await fetch('/api/dancers/tags', { credentials: "include" });
      if (response.ok) {
        const data = await response.json();
        setAllTags(data);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  }

  async function fetchEmails() {
    if (!dancer) return;
    setEmailsLoading(true);
    try {
      // Fetch emails for all registrations of this dancer
      const registrationIds = dancer.registrations.map(r => r.id);
      const emailPromises = registrationIds.map(regId =>
        fetch(`/api/emails?registrationId=${regId}`, { credentials: "include" })
          .then(res => res.ok ? res.json() : { emails: [] })
      );
      const results = await Promise.all(emailPromises);
      const allEmails = results.flatMap(r => r.emails || []);
      // Sort by date
      allEmails.sort((a: EmailEvent, b: EmailEvent) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setEmails(allEmails);
    } catch (error) {
      console.error('Error fetching emails:', error);
    } finally {
      setEmailsLoading(false);
    }
  }

  async function resendEmail(emailId: string) {
    setResendingEmail(emailId);
    try {
      const response = await fetch(`/api/emails/${emailId}`, {
        method: 'POST',
        credentials: "include",
      });
      if (response.ok) {
        fetchEmails();
      }
    } catch (error) {
      console.error('Error resending email:', error);
    } finally {
      setResendingEmail(null);
    }
  }

  async function handleAddNote() {
    if (!newNote.trim() || submittingNote) return;

    setSubmittingNote(true);
    try {
      const response = await fetch(`/api/dancers/${dancerId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newNote }),
        credentials: "include",
      });

      if (response.ok) {
        setNewNote('');
        fetchDancer();
      }
    } catch (error) {
      console.error('Error adding note:', error);
    } finally {
      setSubmittingNote(false);
    }
  }

  async function handleUpdateNote(noteId: string) {
    if (!editingNoteContent.trim()) return;

    try {
      const response = await fetch(`/api/dancers/${dancerId}/notes/${noteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editingNoteContent }),
        credentials: "include",
      });

      if (response.ok) {
        setEditingNoteId(null);
        setEditingNoteContent('');
        fetchDancer();
      }
    } catch (error) {
      console.error('Error updating note:', error);
    }
  }

  async function handleDeleteNote(noteId: string) {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      const response = await fetch(`/api/dancers/${dancerId}/notes/${noteId}`, {
        method: 'DELETE',
        credentials: "include",
      });

      if (response.ok) {
        fetchDancer();
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  }

  async function handleAssignTag(tagId: string) {
    try {
      const response = await fetch(`/api/dancers/${dancerId}/tags/${tagId}`, {
        method: 'POST',
        credentials: "include",
      });

      if (response.ok) {
        setShowTagDropdown(false);
        fetchDancer();
      }
    } catch (error) {
      console.error('Error assigning tag:', error);
    }
  }

  async function handleRemoveTag(tagId: string) {
    try {
      const response = await fetch(`/api/dancers/${dancerId}/tags/${tagId}`, {
        method: 'DELETE',
        credentials: "include",
      });

      if (response.ok) {
        fetchDancer();
      }
    } catch (error) {
      console.error('Error removing tag:', error);
    }
  }

  async function handleCreateTag() {
    if (!newTagName.trim()) return;

    try {
      const response = await fetch('/api/dancers/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTagName, color: newTagColor }),
        credentials: "include",
      });

      if (response.ok) {
        const newTag = await response.json();
        setAllTags([...allTags, newTag]);
        setNewTagName('');
        setNewTagColor('#6B7280');
        // Automatically assign the new tag
        handleAssignTag(newTag.id);
      }
    } catch (error) {
      console.error('Error creating tag:', error);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (!dancer) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Dancer not found</p>
      </div>
    );
  }

  const availableTags = allTags.filter(
    (tag) => !dancer.tags.some((t) => t.id === tag.id)
  );

  return (
    <div className="p-8 space-y-6">
      {/* Back button */}
      <Link
        href="/registrations"
        className="inline-flex items-center text-gray-600 hover:text-gray-900"
      >
        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Registrations
      </Link>

      {/* Dancer header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start gap-6">
          {/* Profile picture */}
          <div className="flex-shrink-0">
            {dancer.profilePictureUrl ? (
              <img
                src={dancer.profilePictureUrl}
                alt={dancer.fullName}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-3xl font-bold text-gray-500">
                  {dancer.fullName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{dancer.fullName}</h1>
            <p className="text-gray-600">{dancer.email}</p>
            {dancer.role && (
              <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${
                dancer.role === 'LEADER'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-pink-100 text-pink-700'
              }`}>
                {dancer.role}
              </span>
            )}
            {(dancer.city || dancer.country) && (
              <p className="text-gray-500 mt-1">
                {[dancer.city, dancer.country].filter(Boolean).join(', ')}
              </p>
            )}

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {dancer.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                  style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                >
                  {tag.name}
                  <button
                    onClick={() => handleRemoveTag(tag.id)}
                    className="hover:opacity-70"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
              <div className="relative">
                <button
                  onClick={() => setShowTagDropdown(!showTagDropdown)}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 border border-dashed border-gray-300 rounded-full hover:border-gray-400"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add tag
                </button>
                {showTagDropdown && (
                  <div className="absolute left-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-1">
                    {availableTags.map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() => handleAssignTag(tag.id)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                      >
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        ></span>
                        {tag.name}
                      </button>
                    ))}
                    <div className="border-t border-gray-200 mt-1 pt-1 px-3 py-2">
                      <p className="text-xs text-gray-500 mb-2">Create new tag</p>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={newTagColor}
                          onChange={(e) => setNewTagColor(e.target.value)}
                          className="w-6 h-6 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={newTagName}
                          onChange={(e) => setNewTagName(e.target.value)}
                          placeholder="Tag name"
                          className="flex-1 text-sm border border-gray-200 rounded px-2 py-1"
                          onKeyDown={(e) => e.key === 'Enter' && handleCreateTag()}
                        />
                        <button
                          onClick={handleCreateTag}
                          disabled={!newTagName.trim()}
                          className="text-rose-500 hover:text-rose-600 disabled:text-gray-300"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Member since */}
            <p className="text-sm text-gray-400 mt-3">
              Member since {new Date(dancer.createdAt).toLocaleDateString()}
              {dancer.auth?.provider && (
                <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded text-xs">
                  {dancer.auth.provider}
                </span>
              )}
            </p>
          </div>

          {/* Stats */}
          <div className="flex-shrink-0 text-right">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {dancer.stats.totalRegistrations}
                </p>
                <p className="text-sm text-gray-500">Registrations</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {dancer.stats.confirmedRegistrations}
                </p>
                <p className="text-sm text-gray-500">Confirmed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {(dancer.stats.totalSpent / 100).toFixed(0)}
                </p>
                <p className="text-sm text-gray-500">Total Spent</p>
              </div>
              <div>
                <p className="text-sm text-gray-900">
                  {dancer.stats.firstRegistration
                    ? new Date(dancer.stats.firstRegistration).toLocaleDateString()
                    : '-'}
                </p>
                <p className="text-sm text-gray-500">First Event</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          {(['overview', 'registrations', 'notes', 'emails'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 text-sm font-medium border-b-2 transition ${
                activeTab === tab
                  ? 'border-rose-500 text-rose-500'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'notes' && dancer.notes.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                  {dancer.notes.length}
                </span>
              )}
              {tab === 'emails' && emails.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                  {emails.length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-gray-500">Email</dt>
                  <dd className="text-gray-900">{dancer.email}</dd>
                </div>
                {dancer.phoneNumber && (
                  <div>
                    <dt className="text-sm text-gray-500">Phone</dt>
                    <dd className="text-gray-900">{dancer.phoneNumber}</dd>
                  </div>
                )}
                {dancer.websiteUrl && (
                  <div>
                    <dt className="text-sm text-gray-500">Website</dt>
                    <dd>
                      <a
                        href={dancer.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-rose-500 hover:underline"
                      >
                        {dancer.websiteUrl}
                      </a>
                    </dd>
                  </div>
                )}
                {dancer.socialLinks && Object.keys(dancer.socialLinks).length > 0 && (
                  <div>
                    <dt className="text-sm text-gray-500">Social</dt>
                    <dd className="flex gap-2">
                      {Object.entries(dancer.socialLinks).map(([platform, url]) => (
                        <a
                          key={platform}
                          href={url as string}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-gray-900"
                        >
                          {platform}
                        </a>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {dancer.bio && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Bio</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{dancer.bio}</p>
              </div>
            )}

            {dancer.auth?.lastLoginAt && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Account Activity</h3>
                <p className="text-gray-600">
                  Last login: {new Date(dancer.auth.lastLoginAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'registrations' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Registration History</h3>
            {dancer.registrations.length === 0 ? (
              <p className="text-gray-500">No registrations for your events</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left text-gray-600 font-medium px-4 py-2">Event</th>
                      <th className="text-left text-gray-600 font-medium px-4 py-2">Role</th>
                      <th className="text-left text-gray-600 font-medium px-4 py-2">Status</th>
                      <th className="text-left text-gray-600 font-medium px-4 py-2">Payment</th>
                      <th className="text-left text-gray-600 font-medium px-4 py-2">Amount</th>
                      <th className="text-left text-gray-600 font-medium px-4 py-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dancer.registrations.map((reg) => (
                      <tr key={reg.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <Link
                            href={`/events/${reg.event.id}`}
                            className="text-rose-500 hover:underline"
                          >
                            {reg.event.title}
                          </Link>
                          <p className="text-xs text-gray-500">
                            {new Date(reg.event.startAt).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            reg.roleSnapshot === 'LEADER'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-pink-100 text-pink-700'
                          }`}>
                            {reg.roleSnapshot}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(reg.registrationStatus)}`}>
                            {formatStatus(reg.registrationStatus)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getPaymentStatusColor(reg.paymentStatus)}`}>
                            {formatPaymentStatus(reg.paymentStatus)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {reg.paymentAmount ? `€${(reg.paymentAmount / 100).toFixed(2)}` : '-'}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {new Date(reg.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'notes' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Internal Notes</h3>

            {/* Add note form */}
            <div className="mb-6">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note about this dancer..."
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                rows={3}
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleAddNote}
                  disabled={!newNote.trim() || submittingNote}
                  className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingNote ? 'Adding...' : 'Add Note'}
                </button>
              </div>
            </div>

            {/* Notes list */}
            {dancer.notes.length === 0 ? (
              <p className="text-gray-500">No notes yet</p>
            ) : (
              <div className="space-y-4">
                {dancer.notes.map((note) => (
                  <div key={note.id} className="border border-gray-200 rounded-lg p-4">
                    {editingNoteId === note.id ? (
                      <div>
                        <textarea
                          value={editingNoteContent}
                          onChange={(e) => setEditingNoteContent(e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                          rows={3}
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            onClick={() => {
                              setEditingNoteId(null);
                              setEditingNoteContent('');
                            }}
                            className="px-3 py-1 text-gray-600 hover:text-gray-900"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleUpdateNote(note.id)}
                            className="px-3 py-1 bg-rose-500 text-white rounded hover:bg-rose-600"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-gray-900 whitespace-pre-wrap">{note.content}</p>
                        <div className="flex items-center justify-between mt-3 text-sm">
                          <p className="text-gray-500">
                            {note.createdBy.fullName} • {new Date(note.createdAt).toLocaleString()}
                            {note.updatedAt !== note.createdAt && ' (edited)'}
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingNoteId(note.id);
                                setEditingNoteContent(note.content);
                              }}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteNote(note.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'emails' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Email History</h3>
            {emailsLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
              </div>
            ) : emails.length === 0 ? (
              <p className="text-gray-500">No emails sent to this dancer</p>
            ) : (
              <div className="space-y-4">
                {emails.map((email) => (
                  <div key={email.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{email.subject}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getEmailStatusColor(email.status)}`}>
                            {email.status.toLowerCase()}
                            {email.openedAt && (
                              <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatEmailType(email.emailType)}
                          </span>
                          {email.event && (
                            <span className="text-xs text-gray-500">
                              {email.event.title}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">
                          {new Date(email.createdAt).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => resendEmail(email.id)}
                          disabled={resendingEmail === email.id}
                          className="text-gray-500 hover:text-rose-500 disabled:opacity-50"
                          title="Resend email"
                        >
                          {resendingEmail === email.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-rose-500"></div>
                          ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="flex items-center gap-4 mt-3 text-xs">
                      <div className={email.sentAt ? 'text-green-600' : 'text-gray-400'}>
                        <span className={`inline-block w-2 h-2 rounded-full mr-1 ${email.sentAt ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                        Sent {email.sentAt && `(${new Date(email.sentAt).toLocaleTimeString()})`}
                      </div>
                      <div className={email.openedAt ? 'text-purple-600' : 'text-gray-400'}>
                        <span className={`inline-block w-2 h-2 rounded-full mr-1 ${email.openedAt ? 'bg-purple-500' : 'bg-gray-300'}`}></span>
                        Opened {email.openedAt && `(${new Date(email.openedAt).toLocaleTimeString()})`}
                      </div>
                      <div className={email.clickedAt ? 'text-indigo-600' : 'text-gray-400'}>
                        <span className={`inline-block w-2 h-2 rounded-full mr-1 ${email.clickedAt ? 'bg-indigo-500' : 'bg-gray-300'}`}></span>
                        Clicked {email.clickedAt && `(${new Date(email.clickedAt).toLocaleTimeString()})`}
                      </div>
                      {email.bouncedAt && (
                        <div className="text-red-600">
                          <span className="inline-block w-2 h-2 rounded-full mr-1 bg-red-500"></span>
                          Bounced
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper functions
function getEmailStatusColor(status: string): string {
  switch (status) {
    case 'DELIVERED':
    case 'SENT':
      return 'bg-green-100 text-green-700';
    case 'OPENED':
      return 'bg-purple-100 text-purple-700';
    case 'CLICKED':
      return 'bg-indigo-100 text-indigo-700';
    case 'BOUNCED':
    case 'FAILED':
      return 'bg-red-100 text-red-700';
    case 'QUEUED':
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

function formatEmailType(type: string): string {
  switch (type) {
    case 'REGISTRATION_CONFIRMATION':
      return 'Registration';
    case 'ORGANIZER_NOTIFICATION':
      return 'Notification';
    case 'PAYMENT_REMINDER':
      return 'Payment';
    case 'STATUS_UPDATE':
      return 'Status';
    case 'CUSTOM':
    default:
      return 'Custom';
  }
}
function getStatusColor(status: string): string {
  switch (status) {
    case 'CONFIRMED':
    case 'CHECKED_IN':
      return 'bg-green-100 text-green-700';
    case 'APPROVED':
      return 'bg-blue-100 text-blue-700';
    case 'REGISTERED':
    case 'PENDING_REVIEW':
      return 'bg-yellow-100 text-yellow-700';
    case 'WAITLIST':
      return 'bg-orange-100 text-orange-700';
    case 'REJECTED':
    case 'CANCELLED':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

function getPaymentStatusColor(status: string): string {
  switch (status) {
    case 'PAID':
      return 'bg-green-100 text-green-700';
    case 'PARTIALLY_PAID':
      return 'bg-blue-100 text-blue-700';
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-700';
    case 'UNPAID':
      return 'bg-gray-100 text-gray-700';
    case 'PAYMENT_FAILED':
      return 'bg-red-100 text-red-700';
    case 'REFUNDED':
    case 'REFUND_PENDING':
      return 'bg-purple-100 text-purple-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

function formatStatus(status: string): string {
  switch (status) {
    case 'REGISTERED':
      return 'Pending';
    case 'PENDING_REVIEW':
      return 'In Review';
    case 'CHECKED_IN':
      return 'Checked In';
    default:
      return status.charAt(0) + status.slice(1).toLowerCase();
  }
}

function formatPaymentStatus(status: string): string {
  switch (status) {
    case 'PARTIALLY_PAID':
      return 'Partial';
    case 'PAYMENT_FAILED':
      return 'Failed';
    case 'REFUND_PENDING':
      return 'Refunding';
    default:
      return status.charAt(0) + status.slice(1).toLowerCase();
  }
}
