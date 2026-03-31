'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useEvents } from '@/contexts/EventsContext';
import Link from 'next/link';

type TabType = 'history' | 'templates';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  eventId: string | null;
  isActive: boolean;
  variables: { name: string; description: string }[];
  event?: {
    id: string;
    title: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

interface EmailEvent {
  id: string;
  recipientEmail: string;
  recipientName: string | null;
  subject: string;
  emailType: string;
  status: string;
  sentAt: string | null;
  deliveredAt: string | null;
  openedAt: string | null;
  clickedAt: string | null;
  bouncedAt: string | null;
  errorMessage: string | null;
  createdAt: string;
  event: {
    id: string;
    title: string;
  } | null;
  registration: {
    id: string;
    fullNameSnapshot: string;
  } | null;
  template: {
    id: string;
    name: string;
  } | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface EmailDetail extends EmailEvent {
  htmlContent: string;
  trackingId: string;
  messageId: string | null;
  bounceType: string | null;
  updatedAt: string;
}

const statusColors: Record<string, string> = {
  QUEUED: 'bg-gray-100 text-gray-700',
  SENT: 'bg-blue-100 text-blue-700',
  DELIVERED: 'bg-green-100 text-green-700',
  OPENED: 'bg-purple-100 text-purple-700',
  CLICKED: 'bg-indigo-100 text-indigo-700',
  BOUNCED: 'bg-red-100 text-red-700',
  FAILED: 'bg-red-100 text-red-700',
};

const emailTypeLabels: Record<string, string> = {
  REGISTRATION_CONFIRMATION: 'Registration',
  ORGANIZER_NOTIFICATION: 'Notification',
  PAYMENT_REMINDER: 'Payment',
  STATUS_UPDATE: 'Status',
  CUSTOM: 'Custom',
};

export default function EmailsPage() {
  const searchParams = useSearchParams();
  const { selectedEventId, selectedEvent } = useEvents();

  const [activeTab, setActiveTab] = useState<TabType>('history');
  const [emails, setEmails] = useState<EmailEvent[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<EmailDetail | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [resending, setResending] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || '');
  const [typeFilter, setTypeFilter] = useState<string>(searchParams.get('type') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  const fetchEmails = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedEventId) params.set('eventId', selectedEventId);
      if (statusFilter) params.set('status', statusFilter);
      if (typeFilter) params.set('emailType', typeFilter);
      params.set('page', page.toString());
      params.set('limit', '25');

      const response = await fetch(`/api/emails?${params.toString()}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setEmails(data.emails);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedEventId, statusFilter, typeFilter, page]);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  useEffect(() => {
    if (activeTab === 'templates') {
      fetchTemplates();
    }
  }, [activeTab]);

  async function fetchTemplates() {
    setTemplatesLoading(true);
    try {
      const response = await fetch('/api/email-templates', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setTemplatesLoading(false);
    }
  }

  async function deleteTemplate(templateId: string) {
    if (!confirm('Are you sure you want to delete this template?')) return;

    const response = await fetch(`/api/email-templates/${templateId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (response.ok) {
      setTemplates((prev) => prev.filter((t) => t.id !== templateId));
    }
  }

  async function toggleTemplateActive(template: EmailTemplate) {
    const response = await fetch(`/api/email-templates/${template.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...template, isActive: !template.isActive }),
      credentials: 'include',
    });

    if (response.ok) {
      fetchTemplates();
    }
  }

  async function viewEmailDetail(emailId: string) {
    try {
      const response = await fetch(`/api/emails/${emailId}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedEmail(data);
        setShowEmailModal(true);
      }
    } catch (error) {
      console.error('Error fetching email detail:', error);
    }
  }

  async function resendEmail(emailId: string) {
    setResending(emailId);
    try {
      const response = await fetch(`/api/emails/${emailId}`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        fetchEmails();
      }
    } catch (error) {
      console.error('Error resending email:', error);
    } finally {
      setResending(null);
    }
  }

  function formatDate(dateString: string | null): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  }

  function formatRelativeTime(dateString: string | null): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Emails</h1>
        <p className="text-gray-500 mt-1">
          {selectedEvent
            ? `Manage emails for ${selectedEvent.title}`
            : 'Manage emails and templates for your organization'}
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 text-sm font-medium border-b-2 transition ${
              activeTab === 'history'
                ? 'border-rose-500 text-rose-500'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Email History
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`py-3 text-sm font-medium border-b-2 transition ${
              activeTab === 'templates'
                ? 'border-rose-500 text-rose-500'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Templates
          </button>
        </nav>
      </div>

      {activeTab === 'history' && (
        <>
      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All statuses</option>
              <option value="QUEUED">Queued</option>
              <option value="SENT">Sent</option>
              <option value="DELIVERED">Delivered</option>
              <option value="OPENED">Opened</option>
              <option value="CLICKED">Clicked</option>
              <option value="BOUNCED">Bounced</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All types</option>
              <option value="REGISTRATION_CONFIRMATION">Registration</option>
              <option value="ORGANIZER_NOTIFICATION">Notification</option>
              <option value="PAYMENT_REMINDER">Payment Reminder</option>
              <option value="STATUS_UPDATE">Status Update</option>
              <option value="CUSTOM">Custom</option>
            </select>
          </div>

          {(statusFilter || typeFilter) && (
            <div className="flex items-end">
              <button
                onClick={() => {
                  setStatusFilter('');
                  setTypeFilter('');
                  setPage(1);
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Email list */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
          </div>
        ) : emails.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="w-12 h-12 text-gray-300 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <p className="text-gray-500">No emails found</p>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Recipient
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Subject
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Type
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Sent
                  </th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {emails.map((email) => (
                  <tr key={email.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {email.recipientName || email.recipientEmail}
                        </p>
                        {email.recipientName && (
                          <p className="text-xs text-gray-500">{email.recipientEmail}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 truncate max-w-xs">{email.subject}</p>
                      {email.event && (
                        <p className="text-xs text-gray-500">{email.event.title}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-gray-600">
                        {emailTypeLabels[email.emailType] || email.emailType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          statusColors[email.status] || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {email.status.toLowerCase()}
                        {email.openedAt && (
                          <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path
                              fillRule="evenodd"
                              d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                        {email.clickedAt && (
                          <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.414 1.415l.708-.708zm-7.072 7.07l.707-.706a1 1 0 00-1.414-1.414l-.707.707a1 1 0 101.414 1.414zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
                          </svg>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">
                        {formatRelativeTime(email.sentAt || email.createdAt)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => viewEmailDetail(email.id)}
                          className="text-gray-500 hover:text-gray-700"
                          title="View email"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => resendEmail(email.id)}
                          disabled={resending === email.id}
                          className="text-gray-500 hover:text-rose-500 disabled:opacity-50"
                          title="Resend email"
                        >
                          {resending === email.id ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-rose-500"></div>
                          ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} emails
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-1 border border-gray-200 rounded text-sm disabled:opacity-50 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === pagination.totalPages}
                    className="px-3 py-1 border border-gray-200 rounded text-sm disabled:opacity-50 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Email Detail Modal */}
      {showEmailModal && selectedEmail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{selectedEmail.subject}</h2>
                <p className="text-sm text-gray-500">
                  To: {selectedEmail.recipientName || selectedEmail.recipientEmail}
                </p>
              </div>
              <button
                onClick={() => setShowEmailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Status timeline */}
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-8 text-sm">
                  <div className={selectedEmail.sentAt ? 'text-green-600' : 'text-gray-400'}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${selectedEmail.sentAt ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span>Sent</span>
                    </div>
                    <p className="text-xs ml-4">{formatDate(selectedEmail.sentAt)}</p>
                  </div>
                  <div className={selectedEmail.deliveredAt ? 'text-green-600' : 'text-gray-400'}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${selectedEmail.deliveredAt ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span>Delivered</span>
                    </div>
                    <p className="text-xs ml-4">{formatDate(selectedEmail.deliveredAt)}</p>
                  </div>
                  <div className={selectedEmail.openedAt ? 'text-purple-600' : 'text-gray-400'}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${selectedEmail.openedAt ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
                      <span>Opened</span>
                    </div>
                    <p className="text-xs ml-4">{formatDate(selectedEmail.openedAt)}</p>
                  </div>
                  <div className={selectedEmail.clickedAt ? 'text-indigo-600' : 'text-gray-400'}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${selectedEmail.clickedAt ? 'bg-indigo-500' : 'bg-gray-300'}`}></div>
                      <span>Clicked</span>
                    </div>
                    <p className="text-xs ml-4">{formatDate(selectedEmail.clickedAt)}</p>
                  </div>
                  {selectedEmail.bouncedAt && (
                    <div className="text-red-600">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <span>Bounced</span>
                      </div>
                      <p className="text-xs ml-4">{formatDate(selectedEmail.bouncedAt)}</p>
                    </div>
                  )}
                </div>

                {selectedEmail.errorMessage && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{selectedEmail.errorMessage}</p>
                  </div>
                )}
              </div>

              {/* Email preview */}
              <div className="p-6">
                <iframe
                  srcDoc={selectedEmail.htmlContent}
                  className="w-full h-96 border border-gray-200 rounded-lg"
                  title="Email preview"
                  sandbox="allow-same-origin"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => {
                  resendEmail(selectedEmail.id);
                  setShowEmailModal(false);
                }}
                className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600"
              >
                Resend Email
              </button>
              <button
                onClick={() => setShowEmailModal(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <>
          <div className="flex items-center justify-between mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex-1 mr-4">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-blue-500 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm text-blue-800">
                  <strong>Templates</strong> let you create reusable email designs. Active templates are used
                  automatically for their email type.
                </p>
              </div>
            </div>
            <Link
              href="/settings/email-templates"
              className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-medium transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Template
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {templatesLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="w-12 h-12 text-gray-300 mx-auto mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-gray-500 mb-4">No custom templates yet</p>
                <p className="text-sm text-gray-400 mb-4">
                  Default templates are used when no custom template is defined
                </p>
                <Link
                  href="/settings/email-templates"
                  className="inline-flex px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-medium transition"
                >
                  Create Your First Template
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {templates.map((template) => (
                  <div key={template.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                          {template.isActive ? (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                              Inactive
                            </span>
                          )}
                          {template.event ? (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                              {template.event.title}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                              All Events
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-2">
                          <strong>Subject:</strong> {template.subject}
                        </p>
                        <p className="text-sm text-gray-500">
                          Last updated: {new Date(template.updatedAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedTemplate(template);
                            setShowTemplatePreview(true);
                          }}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                          title="Preview"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => toggleTemplateActive(template)}
                          className={`p-2 rounded-lg transition ${
                            template.isActive
                              ? 'text-green-500 hover:text-green-600 hover:bg-green-50'
                              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                          }`}
                          title={template.isActive ? 'Deactivate' : 'Activate'}
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                        <Link
                          href="/settings/email-templates"
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                          title="Edit"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => deleteTemplate(template.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Template Preview Modal */}
          {showTemplatePreview && selectedTemplate && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{selectedTemplate.name}</h2>
                    <p className="text-sm text-gray-500">Subject: {selectedTemplate.subject}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowTemplatePreview(false);
                      setSelectedTemplate(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  <iframe
                    srcDoc={selectedTemplate.htmlContent}
                    className="w-full h-96 border border-gray-200 rounded-lg"
                    title="Template preview"
                    sandbox="allow-same-origin"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
                  <Link
                    href="/settings/email-templates"
                    className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600"
                  >
                    Edit Template
                  </Link>
                  <button
                    onClick={() => {
                      setShowTemplatePreview(false);
                      setSelectedTemplate(null);
                    }}
                    className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
