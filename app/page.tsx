'use client';

import { useState, useEffect } from 'react';
import { Mail, Phone, Users, Clock, CheckCircle, XCircle, Loader } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'pending' | 'email_sent' | 'email_opened' | 'email_responded' | 'call_scheduled' | 'call_completed' | 'failed';
  emailSentAt?: Date;
  lastActivityAt: Date;
  callScheduledFor?: Date;
  notes: string[];
}

export default function Home() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [newLead, setNewLead] = useState({ name: '', email: '', phone: '', company: '' });
  const [activeTab, setActiveTab] = useState<'leads' | 'agent'>('leads');

  useEffect(() => {
    const interval = setInterval(() => {
      setLeads(prevLeads => {
        return prevLeads.map(lead => {
          if (lead.status === 'email_sent' && lead.emailSentAt) {
            const hoursSinceEmail = (Date.now() - lead.emailSentAt.getTime()) / (1000 * 60 * 60);

            if (hoursSinceEmail >= 24 && !lead.callScheduledFor) {
              return {
                ...lead,
                status: 'call_scheduled',
                callScheduledFor: new Date(Date.now() + 60000),
                notes: [...lead.notes, `No response after 24h. Call scheduled automatically.`]
              };
            }
          }

          if (lead.status === 'call_scheduled' && lead.callScheduledFor) {
            if (Date.now() >= lead.callScheduledFor.getTime()) {
              return {
                ...lead,
                status: 'call_completed',
                notes: [...lead.notes, `Voice call completed via AI agent.`]
              };
            }
          }

          return lead;
        });
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const addLead = () => {
    if (!newLead.name || !newLead.email) return;

    const lead: Lead = {
      id: Math.random().toString(36).substr(2, 9),
      name: newLead.name,
      email: newLead.email,
      phone: newLead.phone,
      company: newLead.company,
      status: 'pending',
      lastActivityAt: new Date(),
      notes: []
    };

    setLeads([...leads, lead]);
    setNewLead({ name: '', email: '', phone: '', company: '' });
  };

  const sendEmail = (leadId: string) => {
    setLeads(leads.map(lead => {
      if (lead.id === leadId) {
        return {
          ...lead,
          status: 'email_sent',
          emailSentAt: new Date(),
          lastActivityAt: new Date(),
          notes: [...lead.notes, `Cold email sent at ${new Date().toLocaleTimeString()}`]
        };
      }
      return lead;
    }));
  };

  const simulateResponse = (leadId: string) => {
    setLeads(leads.map(lead => {
      if (lead.id === leadId) {
        return {
          ...lead,
          status: 'email_responded',
          lastActivityAt: new Date(),
          notes: [...lead.notes, `Lead responded to email!`]
        };
      }
      return lead;
    }));
  };

  const getStatusIcon = (status: Lead['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-gray-400" />;
      case 'email_sent': return <Mail className="w-4 h-4 text-blue-500" />;
      case 'email_responded': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'call_scheduled': return <Loader className="w-4 h-4 text-yellow-500 animate-spin" />;
      case 'call_completed': return <Phone className="w-4 h-4 text-purple-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: Lead['status']) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'email_sent': return 'Email Sent';
      case 'email_responded': return 'Responded';
      case 'call_scheduled': return 'Call Scheduled';
      case 'call_completed': return 'Call Completed';
      case 'failed': return 'Failed';
      default: return status;
    }
  };

  const stats = {
    total: leads.length,
    emailsSent: leads.filter(l => ['email_sent', 'email_responded', 'call_scheduled', 'call_completed'].includes(l.status)).length,
    responded: leads.filter(l => l.status === 'email_responded').length,
    callsScheduled: leads.filter(l => l.status === 'call_scheduled').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Outreach Agent</h1>
          <p className="text-gray-600">Autonomous email and voice call outreach system</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Leads</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Users className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Emails Sent</p>
                <p className="text-3xl font-bold text-gray-900">{stats.emailsSent}</p>
              </div>
              <Mail className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Responded</p>
                <p className="text-3xl font-bold text-gray-900">{stats.responded}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Calls Pending</p>
                <p className="text-3xl font-bold text-gray-900">{stats.callsScheduled}</p>
              </div>
              <Phone className="w-10 h-10 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('leads')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'leads'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Lead Management
              </button>
              <button
                onClick={() => setActiveTab('agent')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'agent'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Agent Activity
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'leads' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4">Add New Lead</h2>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <input
                      type="text"
                      placeholder="Name"
                      value={newLead.name}
                      onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={newLead.email}
                      onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={newLead.phone}
                      onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Company"
                      value={newLead.company}
                      onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={addLead}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Add Lead
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl font-semibold mb-4">All Leads</h2>
                  {leads.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No leads yet. Add your first lead above.</p>
                  ) : (
                    leads.map(lead => (
                      <div key={lead.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              {getStatusIcon(lead.status)}
                              <h3 className="font-semibold text-lg">{lead.name}</h3>
                              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                {getStatusText(lead.status)}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1 mb-3">
                              <p><strong>Email:</strong> {lead.email}</p>
                              {lead.phone && <p><strong>Phone:</strong> {lead.phone}</p>}
                              {lead.company && <p><strong>Company:</strong> {lead.company}</p>}
                              <p><strong>Last Activity:</strong> {formatDistanceToNow(lead.lastActivityAt, { addSuffix: true })}</p>
                              {lead.callScheduledFor && (
                                <p className="text-yellow-600"><strong>Call Scheduled:</strong> {formatDistanceToNow(lead.callScheduledFor, { addSuffix: true })}</p>
                              )}
                            </div>
                            {lead.notes.length > 0 && (
                              <div className="bg-gray-50 rounded p-3 space-y-1">
                                <p className="text-xs font-semibold text-gray-700 mb-1">Activity Log:</p>
                                {lead.notes.map((note, idx) => (
                                  <p key={idx} className="text-xs text-gray-600">• {note}</p>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4">
                            {lead.status === 'pending' && (
                              <button
                                onClick={() => sendEmail(lead.id)}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-2"
                              >
                                <Mail className="w-4 h-4" />
                                Send Email
                              </button>
                            )}
                            {lead.status === 'email_sent' && (
                              <button
                                onClick={() => simulateResponse(lead.id)}
                                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                              >
                                Simulate Response
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'agent' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Agent Intelligence</h2>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
                  <h3 className="font-semibold text-lg mb-3">How the Agent Works:</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span><strong>Step 1:</strong> Agent sends personalized cold email to each lead</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span><strong>Step 2:</strong> Monitors for email responses for 24 hours</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span><strong>Step 3:</strong> If no response after 24h, automatically schedules voice call</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span><strong>Step 4:</strong> AI voice agent makes the call and logs the conversation</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Recent Agent Actions:</h3>
                  {leads.filter(l => l.notes.length > 0).length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No agent activity yet. Add leads and send emails to see the agent in action.</p>
                  ) : (
                    leads
                      .filter(l => l.notes.length > 0)
                      .sort((a, b) => b.lastActivityAt.getTime() - a.lastActivityAt.getTime())
                      .map(lead => (
                        <div key={lead.id} className="border-l-4 border-blue-500 bg-white rounded-r-lg p-4 shadow-sm">
                          <p className="font-semibold text-gray-900 mb-2">{lead.name} - {lead.company}</p>
                          <div className="space-y-1">
                            {lead.notes.map((note, idx) => (
                              <p key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                {note}
                              </p>
                            ))}
                          </div>
                          <p className="text-xs text-gray-400 mt-2">
                            {formatDistanceToNow(lead.lastActivityAt, { addSuffix: true })}
                          </p>
                        </div>
                      ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <footer className="text-center text-gray-600 text-sm">
          <p>AI Outreach Agent - Autonomous email and voice call system</p>
        </footer>
      </div>
    </div>
  );
}
