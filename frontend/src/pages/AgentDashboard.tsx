import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../lib/api';
import type { Job, Application, WorkPlan, Invoice } from '../types';
import { JobStatus } from '../types';

const AgentDashboard: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<number | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [newJob, setNewJob] = useState({ title: '', description: '', budget: '' });
  const [workPlans, setWorkPlans] = useState<Record<number, WorkPlan | null>>({});
  const [invoices, setInvoices] = useState<Record<number, Invoice | null>>({});
  const [expandedJobId, setExpandedJobId] = useState<number | null>(null);
  const [loadingDetails, setLoadingDetails] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs/agent/me');
      setJobs(response.data);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    }
  };

  const fetchApplications = async (jobId: number) => {
    try {
      const response = await api.get(`/applications/job/${jobId}`);
      setApplications(response.data);
      setSelectedJob(jobId);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    }
  };

  const fetchWorkPlan = async (jobId: number) => {
    try {
      const response = await api.get(`/work-plans/agent-view/${jobId}`);
      setWorkPlans((prev) => ({ ...prev, [jobId]: response.data }));
    } catch (error: any) {
      if (error?.response?.status === 404) {
        setWorkPlans((prev) => ({ ...prev, [jobId]: null }));
      } else {
        console.error('Failed to fetch work plan:', error);
      }
    }
  };

  const fetchInvoice = async (jobId: number) => {
    try {
      const response = await api.get(`/invoices/job/${jobId}`);
      setInvoices((prev) => ({ ...prev, [jobId]: response.data }));
    } catch (error: any) {
      if (error?.response?.status === 404) {
        setInvoices((prev) => ({ ...prev, [jobId]: null }));
      } else {
        console.error('Failed to fetch invoice:', error);
      }
    }
  };

  const toggleJobDetails = async (jobId: number) => {
    if (expandedJobId === jobId) {
      setExpandedJobId(null);
      return;
    }
    setExpandedJobId(jobId);
    setLoadingDetails((prev) => ({ ...prev, [jobId]: true }));
    await Promise.all([fetchWorkPlan(jobId), fetchInvoice(jobId)]);
    setLoadingDetails((prev) => ({ ...prev, [jobId]: false }));
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/jobs/', {
        title: newJob.title,
        description: newJob.description || null,
        budget: newJob.budget ? parseFloat(newJob.budget) : null,
      });
      setNewJob({ title: '', description: '', budget: '' });
      setShowCreateJob(false);
      fetchJobs();
    } catch (error) {
      console.error('Failed to create job:', error);
    }
  };

  const handleApproveApplication = async (applicationId: number) => {
    try {
      await api.post(`/applications/approve/${applicationId}`);
      fetchJobs();
      if (selectedJob) fetchApplications(selectedJob);
    } catch (error) {
      console.error('Failed to approve application:', error);
    }
  };

  const handleRejectApplication = async (applicationId: number) => {
    try {
      await api.post(`/applications/reject/${applicationId}`);
      if (selectedJob) fetchApplications(selectedJob);
    } catch (error) {
      console.error('Failed to reject application:', error);
    }
  };

  return (
    <Layout>
      <div className="container" style={{ margin: 'var(--spacing-xl) auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
          <h1 style={{ fontSize: '2rem', color: 'var(--text-secondary)', flex: 1, margin: 0, alignSelf: 'center' }}>Agent Dashboard</h1>
          <button
            onClick={() => setShowCreateJob(!showCreateJob)}
            className="btn btn-primary"
            style={{ whiteSpace: 'nowrap', alignSelf: 'center' }}
          >
            {showCreateJob ? '× Cancel' : 'Create New Job'}
          </button>
        </div>

        {showCreateJob && (
          <div className="card" style={{ marginBottom: 'var(--spacing-xl)' }}>
            <h2 style={{ marginBottom: 'var(--spacing-md)' }}>Create New Job</h2>
            <form onSubmit={handleCreateJob} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              <div className="input-group">
                <label className="label">Title</label>
                <input
                  type="text"
                  required
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  className="input"
                  placeholder="e.g., Website Development"
                />
              </div>
              <div className="input-group">
                <label className="label">Description</label>
                <textarea
                  value={newJob.description}
                  onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                  className="input"
                  rows={4}
                  placeholder="Describe the job requirements..."
                  style={{ fontFamily: 'inherit' }}
                />
              </div>
              <div className="input-group">
                <label className="label">Budget ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newJob.budget}
                  onChange={(e) => setNewJob({ ...newJob, budget: e.target.value })}
                  className="input"
                  placeholder="5000.00"
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary w-full"
              >
                Create Job
              </button>
            </form>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-lg)' }}>
          <div className="card">
            <h2 style={{ marginBottom: 'var(--spacing-md)' }}>My Jobs</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              {jobs.map((job) => (
                <div key={job.id} style={{
                  border: '1px solid var(--border-color)',
                  padding: 'var(--spacing-md)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-secondary)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{job.title}</h3>
                      <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>{job.description}</p>
                      <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', fontSize: '0.9rem' }}>
                        <span style={{ fontWeight: 'bold' }}>
                          $ ${job.budget?.toFixed(2) || 'N/A'}
                        </span>
                        <span style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--color-tan)',
                          fontSize: '0.8rem'
                        }}>
                          {job.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  {job.status === JobStatus.OPEN && (
                    <button
                      onClick={() => fetchApplications(job.id)}
                      className="btn btn-outline"
                      style={{ marginTop: '1rem', fontSize: '0.9rem', padding: '0.4rem 0.8rem' }}
                    >
                      View Applications →
                    </button>
                  )}

                  {job.status !== JobStatus.OPEN && (
                    <button
                      onClick={() => toggleJobDetails(job.id)}
                      className="btn btn-outline"
                      style={{ marginTop: '1rem', fontSize: '0.9rem', padding: '0.4rem 0.8rem' }}
                    >
                      {expandedJobId === job.id ? 'Hide Progress' : 'View Work Plan & Invoice'}
                    </button>
                  )}

                  {expandedJobId === job.id && (
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'grid', gap: 'var(--spacing-md)' }}>
                      {loadingDetails[job.id] ? (
                        <p style={{ color: 'var(--text-muted)' }}>Loading details...</p>
                      ) : (
                        <>
                          <div style={{
                            backgroundColor: 'var(--bg-secondary)',
                            padding: 'var(--spacing-md)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-color)'
                          }}>
                            <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Work Plan</h4>
                            {workPlans[job.id] ? (
                              <div style={{ display: 'grid', gap: '0.35rem', fontSize: '0.95rem' }}>
                                <p><strong>Description:</strong> {workPlans[job.id]?.plan_description}</p>
                                <p>
                                  <strong>Start:</strong> {workPlans[job.id]?.start_date || 'N/A'} | <strong>End:</strong> {workPlans[job.id]?.end_date || 'N/A'}
                                </p>
                                <p><strong>Status:</strong> {workPlans[job.id]?.status}</p>
                              </div>
                            ) : (
                              <p style={{ color: 'var(--text-muted)' }}>No work plan submitted yet.</p>
                            )}
                          </div>

                          <div style={{
                            backgroundColor: 'var(--bg-secondary)',
                            padding: 'var(--spacing-md)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-color)'
                          }}>
                            <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Invoice</h4>
                            {invoices[job.id] ? (
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.95rem' }}>
                                <div>
                                  <p><strong>Amount:</strong> ${invoices[job.id]?.amount.toFixed(2)}</p>
                                  <p><strong>Status:</strong> {invoices[job.id]?.status}</p>
                                </div>
                                <span style={{
                                  padding: '0.3rem 0.6rem',
                                  borderRadius: 'var(--radius-sm)',
                                  backgroundColor: 'var(--color-tan)',
                                  fontSize: '0.85rem'
                                }}>
                                  Invoice Submitted
                                </span>
                              </div>
                            ) : (
                              <p style={{ color: 'var(--text-muted)' }}>No invoice submitted yet.</p>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {selectedJob && (
            <div className="card">
              <h2 style={{ marginBottom: 'var(--spacing-md)' }}>Applications</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                {applications.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No applications yet</p>
                ) : (
                  applications.map((app) => (
                    <div key={app.id} style={{
                      border: '1px solid var(--border-color)',
                      padding: 'var(--spacing-md)',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-secondary)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <p style={{ fontWeight: 'bold' }}>Contractor: {app.contractor?.name || `ID: ${app.contractor_id}`}</p>
                          {app.contractor && (
                            <div style={{ fontSize: '0.9rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>
                              <p>Email: {app.contractor.email || 'N/A'}</p>
                              <p>Phone: {app.contractor.contact_number || 'N/A'}</p>
                              <p>Skills: {app.contractor.skills || 'N/A'}</p>
                              <p>Education: {app.contractor.education || 'N/A'}</p>
                            </div>
                          )}
                          <p style={{ marginTop: '0.5rem', fontWeight: 'bold' }}>
                            Proposed: ${app.proposed_cost?.toFixed(2)}
                          </p>
                          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                            Status: <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{app.status}</span>
                          </p>
                        </div>
                        {app.status === 'SUBMITTED' && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <button
                              onClick={() => handleApproveApplication(app.id)}
                              className="btn"
                              style={{ backgroundColor: '#4caf50', color: 'white', padding: '0.3rem 0.8rem', fontSize: '0.9rem' }}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectApplication(app.id)}
                              className="btn"
                              style={{ backgroundColor: '#f44336', color: 'white', padding: '0.3rem 0.8rem', fontSize: '0.9rem' }}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AgentDashboard;
