import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../lib/api';
import type { Job, Application, WorkPlan, Invoice } from '../types';
import { WorkPlanStatus } from '../types';


const ContractorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'browse' | 'applications' | 'assigned'>('browse');
  const [openJobs, setOpenJobs] = useState<Job[]>([]);
  const [myApplications, setMyApplications] = useState<Application[]>([]);
  const [assignedJobs, setAssignedJobs] = useState<Job[]>([]);
  const [workPlans, setWorkPlans] = useState<Record<number, WorkPlan | null>>({});
  const [invoicesByJob, setInvoicesByJob] = useState<Record<number, Invoice | null>>({});
  const [workPlanForm, setWorkPlanForm] = useState<Record<number, { plan_description: string; start_date: string; end_date: string }>>({});
  const [workPlanStatusChoice, setWorkPlanStatusChoice] = useState<Record<number, WorkPlanStatus>>({});
  const [invoiceAmounts, setInvoiceAmounts] = useState<Record<number, string>>({});
  const [expandedJobId, setExpandedJobId] = useState<number | null>(null);
  const [loadingDetails, setLoadingDetails] = useState<Record<number, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState<number | null>(null);
  const [proposedCost, setProposedCost] = useState('');

  useEffect(() => {
    if (activeTab === 'browse') fetchOpenJobs();
    else if (activeTab === 'applications') fetchMyApplications();
    else if (activeTab === 'assigned') fetchAssignedJobs();
  }, [activeTab]);

  const fetchOpenJobs = async () => {
    try {
      const response = await api.get('/jobs/', { params: { search: searchTerm } });
      setOpenJobs(response.data);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    }
  };

  const fetchMyApplications = async () => {
    try {
      const response = await api.get('/applications/me');
      setMyApplications(response.data);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    }
  };

  const fetchAssignedJobs = async () => {
    try {
      const response = await api.get('/jobs/assigned/me');
      setAssignedJobs(response.data);
    } catch (error) {
      console.error('Failed to fetch assigned jobs:', error);
    }
  };

  const loadWorkPlan = async (jobId: number) => {
    try {
      const response = await api.get(`/work-plans/${jobId}`);
      setWorkPlans((prev) => ({ ...prev, [jobId]: response.data }));
      setWorkPlanStatusChoice((prev) => ({ ...prev, [jobId]: response.data.status }));
    } catch (error: any) {
      if (error?.response?.status === 404) {
        setWorkPlans((prev) => ({ ...prev, [jobId]: null }));
      } else {
        console.error('Failed to load work plan:', error);
      }
    }
  };

  const loadInvoice = async (jobId: number) => {
    try {
      const response = await api.get(`/invoices/job/${jobId}/me`);
      setInvoicesByJob((prev) => ({ ...prev, [jobId]: response.data }));
      setInvoiceAmounts((prev) => ({ ...prev, [jobId]: response.data.amount.toString() }));
    } catch (error: any) {
      if (error?.response?.status === 404) {
        setInvoicesByJob((prev) => ({ ...prev, [jobId]: null }));
      } else {
        console.error('Failed to load invoice:', error);
      }
    }
  };

  const loadJobDetails = async (jobId: number) => {
    setLoadingDetails((prev) => ({ ...prev, [jobId]: true }));
    await Promise.all([loadWorkPlan(jobId), loadInvoice(jobId)]);
    setLoadingDetails((prev) => ({ ...prev, [jobId]: false }));
  };

  const handleApply = async (jobId: number) => {
    try {
      await api.post(`/applications/apply/${jobId}`, {
        proposed_cost: parseFloat(proposedCost),
      });
      setSelectedJob(null);
      setProposedCost('');
      alert('Application submitted successfully!');
      fetchOpenJobs();
    } catch (error) {
      console.error('Failed to apply:', error);
      alert('Failed to submit application');
    }
  };

  const handleCreateWorkPlan = async (jobId: number) => {
    const form = workPlanForm[jobId] || { plan_description: '', start_date: '', end_date: '' };
    if (!form.plan_description.trim()) {
      alert('Please add a work plan description.');
      return;
    }

    try {
      const response = await api.post(`/work-plans/${jobId}`, {
        plan_description: form.plan_description,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
      });
      setWorkPlans((prev) => ({ ...prev, [jobId]: response.data }));
      setWorkPlanStatusChoice((prev) => ({ ...prev, [jobId]: response.data.status }));
    } catch (error) {
      console.error('Failed to create work plan:', error);
      alert('Unable to create work plan.');
    }
  };

  const handleUpdateWorkPlanStatus = async (jobId: number, status: WorkPlanStatus) => {
    try {
      const response = await api.patch(`/work-plans/${jobId}`, { status });
      setWorkPlans((prev) => ({ ...prev, [jobId]: response.data }));
      setWorkPlanStatusChoice((prev) => ({ ...prev, [jobId]: response.data.status }));
    } catch (error) {
      console.error('Failed to update work plan status:', error);
      alert('Could not update status.');
    }
  };

  const handleSubmitInvoice = async (jobId: number) => {
    const amountValue = parseFloat(invoiceAmounts[jobId] || '');
    if (Number.isNaN(amountValue) || amountValue <= 0) {
      alert('Enter a valid invoice amount.');
      return;
    }

    try {
      const response = await api.post(`/invoices/${jobId}`, { amount: amountValue });
      setInvoicesByJob((prev) => ({ ...prev, [jobId]: response.data }));
      fetchAssignedJobs();
    } catch (error) {
      console.error('Failed to submit invoice:', error);
      alert('Unable to submit invoice.');
    }
  };

  const toggleJobDetail = (jobId: number) => {
    if (expandedJobId === jobId) {
      setExpandedJobId(null);
      return;
    }
    setExpandedJobId(jobId);
    loadJobDetails(jobId);
  };

  return (
    <Layout>
      <div className="container" style={{ margin: 'var(--spacing-xl) auto' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)' }}>Contractor Dashboard</h1>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: 'var(--spacing-xl)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('browse')}
            className="btn"
            style={{
              backgroundColor: activeTab === 'browse' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'browse' ? 'white' : 'var(--text-muted)'
            }}
          >
            Browse Jobs
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className="btn"
            style={{
              backgroundColor: activeTab === 'applications' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'applications' ? 'white' : 'var(--text-muted)'
            }}
          >
            My Applications
          </button>
          <button
            onClick={() => setActiveTab('assigned')}
            className="btn"
            style={{
              backgroundColor: activeTab === 'assigned' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'assigned' ? 'white' : 'var(--text-muted)'
            }}
          >
            Assigned Jobs
          </button>
        </div>

        {activeTab === 'browse' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            <div className="input-group" style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input"
              />
              <button
                onClick={fetchOpenJobs}
                className="btn btn-primary"
              >
                Search
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--spacing-lg)' }}>
              {openJobs.map((job) => (
                <div key={job.id} className="card">
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{job.title}</h3>
                  <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>{job.description}</p>
                  <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold' }}>
                      $ ${job.budget?.toFixed(2) || 'N/A'}
                    </span>
                    <button
                      onClick={() => setSelectedJob(job.id)}
                      className="btn btn-primary"
                    >
                      Apply Now
                    </button>
                  </div>
                  {selectedJob === job.id && (
                    <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                      <label className="label">
                        Your Proposed Cost ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={proposedCost}
                        onChange={(e) => setProposedCost(e.target.value)}
                        className="input"
                        placeholder="Enter your price..."
                        style={{ marginBottom: '1rem' }}
                      />
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleApply(job.id)}
                          className="btn btn-primary"
                          style={{ flex: 1, backgroundColor: '#4caf50' }} // Greenish
                        >
                          Submit
                        </button>
                        <button
                          onClick={() => {
                            setSelectedJob(null);
                            setProposedCost('');
                          }}
                          className="btn btn-secondary"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
            {myApplications.map((app) => (
              <div key={app.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontWeight: 'bold' }}>Job ID: {app.job_id}</h3>
                    <p style={{ marginTop: '0.5rem' }}>
                      Proposed Cost: ${app.proposed_cost?.toFixed(2)}
                    </p>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                      Applied: {new Date(app.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span style={{
                    padding: '0.3rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}>
                    {app.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'assigned' && (
          <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
            {assignedJobs.map((job) => (
              <div key={job.id} className="card">
                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{job.title}</h3>
                <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>{job.description}</p>
                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold' }}>
                    Budget: ${job.budget?.toFixed(2) || 'N/A'}
                  </span>
                  <span style={{
                    padding: '0.3rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--color-tan)',
                    fontSize: '0.8rem'
                  }}>
                    {job.status}
                  </span>
                </div>
                <button
                  onClick={() => toggleJobDetail(job.id)}
                  className="btn btn-outline"
                  style={{ marginTop: '0.75rem' }}
                >
                  {expandedJobId === job.id ? 'Hide Details' : 'Manage Work Plan & Invoice'}
                </button>

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
                            <div style={{ display: 'grid', gap: '0.5rem' }}>
                              <p><strong>Description:</strong> {workPlans[job.id]?.plan_description}</p>
                              <p><strong>Start:</strong> {workPlans[job.id]?.start_date || 'N/A'} | <strong>End:</strong> {workPlans[job.id]?.end_date || 'N/A'}</p>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <label className="label" style={{ margin: 0 }}>Status</label>
                                <select
                                  value={workPlanStatusChoice[job.id] || WorkPlanStatus.NOT_STARTED}
                                  onChange={(e) => setWorkPlanStatusChoice((prev) => ({ ...prev, [job.id]: e.target.value as WorkPlanStatus }))}
                                  className="input"
                                  style={{ width: '200px', appearance: 'auto' }}
                                >
                                  {Object.values(WorkPlanStatus).map((status) => (
                                    <option key={status} value={status}>{status}</option>
                                  ))}
                                </select>
                                <button
                                  onClick={() => handleUpdateWorkPlanStatus(job.id, workPlanStatusChoice[job.id] || WorkPlanStatus.NOT_STARTED)}
                                  className="btn btn-primary"
                                >
                                  Update
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div style={{ display: 'grid', gap: '0.5rem' }}>
                              <textarea
                                placeholder="Outline your approach, milestones, and deliverables"
                                value={workPlanForm[job.id]?.plan_description || ''}
                                onChange={(e) => setWorkPlanForm((prev) => ({
                                  ...prev,
                                  [job.id]: {
                                    plan_description: e.target.value,
                                    start_date: prev[job.id]?.start_date || '',
                                    end_date: prev[job.id]?.end_date || '',
                                  },
                                }))}
                                className="input"
                                rows={3}
                                style={{ fontFamily: 'inherit' }}
                              />
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                  type="date"
                                  value={workPlanForm[job.id]?.start_date || ''}
                                  onChange={(e) => setWorkPlanForm((prev) => ({
                                    ...prev,
                                    [job.id]: {
                                      plan_description: prev[job.id]?.plan_description || '',
                                      start_date: e.target.value,
                                      end_date: prev[job.id]?.end_date || '',
                                    },
                                  }))}
                                  className="input"
                                  style={{ flex: 1 }}
                                />
                                <input
                                  type="date"
                                  value={workPlanForm[job.id]?.end_date || ''}
                                  onChange={(e) => setWorkPlanForm((prev) => ({
                                    ...prev,
                                    [job.id]: {
                                      plan_description: prev[job.id]?.plan_description || '',
                                      start_date: prev[job.id]?.start_date || '',
                                      end_date: e.target.value,
                                    },
                                  }))}
                                  className="input"
                                  style={{ flex: 1 }}
                                />
                              </div>
                              <button
                                onClick={() => handleCreateWorkPlan(job.id)}
                                className="btn btn-primary"
                                style={{ width: 'fit-content' }}
                              >
                                Create Work Plan
                              </button>
                            </div>
                          )}
                        </div>

                        <div style={{
                          backgroundColor: 'var(--bg-secondary)',
                          padding: 'var(--spacing-md)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-color)'
                        }}>
                          <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Invoice</h4>
                          {invoicesByJob[job.id] ? (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <p><strong>Amount:</strong> ${invoicesByJob[job.id]?.amount.toFixed(2)}</p>
                                <p><strong>Status:</strong> {invoicesByJob[job.id]?.status}</p>
                              </div>
                              <span style={{
                                padding: '0.3rem 0.6rem',
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor: 'var(--color-tan)',
                                fontSize: '0.85rem'
                              }}>
                                Submitted
                              </span>
                            </div>
                          ) : workPlans[job.id]?.status === WorkPlanStatus.COMPLETED ? (
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                              <div style={{ flex: 1 }}>
                                <label className="label" style={{ marginBottom: '0.3rem' }}>Invoice Amount ($)</label>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={invoiceAmounts[job.id] || ''}
                                  onChange={(e) => setInvoiceAmounts((prev) => ({ ...prev, [job.id]: e.target.value }))}
                                  className="input"
                                  placeholder="Enter amount"
                                />
                              </div>
                              <button
                                onClick={() => handleSubmitInvoice(job.id)}
                                className="btn btn-primary"
                                style={{ whiteSpace: 'nowrap' }}
                              >
                                Submit Invoice
                              </button>
                            </div>
                          ) : (
                            <p style={{ color: 'var(--text-muted)' }}>
                              Complete the work plan before submitting an invoice.
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ContractorDashboard;
