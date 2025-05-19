import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { CheckCircle, XCircle, ExternalLink, Clock } from 'lucide-react';

interface Submission {
  _id: string;
  questTitle: string;
  submitterName: string;
  videoDemo: string;
  githubLink: string;
  description: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

const HirerSubmissionsPage: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/submissions', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setSubmissions(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch submissions');
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (submissionId: string, status: 'approved' | 'rejected') => {
    try {
      await axios.put(
        `http://localhost:5000/api/submissions/${submissionId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      // Update local state
      setSubmissions(prev =>
        prev.map(sub =>
          sub._id === submissionId ? { ...sub, status } : sub
        )
      );

      // Close modal if open
      setSelectedSubmission(null);
    } catch (err) {
      console.error('Error updating submission status:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4 mr-1" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-4 h-4 mr-1" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-4 h-4 mr-1" />
            Pending
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="text-red-500">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Quest Submissions
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Review and manage submissions for your quests
              </p>
            </div>
            <div className="border-t border-gray-200">
              {submissions.length === 0 ? (
                <div className="px-4 py-5 sm:p-6 text-center text-gray-500">
                  No submissions yet
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {submissions.map((submission) => (
                    <li
                      key={submission._id}
                      className="px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedSubmission(submission)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {submission.questTitle}
                          </p>
                          <p className="text-sm text-gray-500">
                            Submitted by {submission.submitterName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(submission.submittedAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          {getStatusBadge(submission.status)}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedSubmission.questTitle}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Submitted by {selectedSubmission.submitterName}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mt-6 space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Description</h4>
                  <p className="mt-2 text-sm text-gray-500">
                    {selectedSubmission.description}
                  </p>
                </div>

                <div className="flex space-x-4">
                  <a
                    href={selectedSubmission.videoDemo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Video Demo
                  </a>
                  <a
                    href={selectedSubmission.githubLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View GitHub Repository
                  </a>
                </div>

                {selectedSubmission.status === 'pending' && (
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleStatusUpdate(selectedSubmission._id, 'approved')}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedSubmission._id, 'rejected')}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HirerSubmissionsPage; 