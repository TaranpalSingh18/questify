import React, { useState, useEffect } from 'react';
import { Award, Download } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface Certificate {
  _id: string;
  name: string;
  issuer: string;
  dateIssued: string;
  fileUrl: string;
  skills: string[];
  verified: boolean;
}

const UserSkills: React.FC = () => {
  const { currentUser } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/users/certificates', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setCertificates(response.data);
      } catch (error) {
        console.error('Error fetching certificates:', error);
        setError('Failed to load certificates');
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  const handleDownload = (fileUrl: string, fileName: string) => {
    window.open(`http://localhost:5000${fileUrl}`, '_blank');
  };

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Skills Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Skills</h2>
        <div className="flex flex-wrap gap-2">
          {currentUser?.skills?.map((skill) => (
            <span
              key={skill}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Certificates Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Certificates</h2>
        {certificates.length === 0 ? (
          <p className="text-gray-500">No certificates uploaded yet.</p>
        ) : (
          <div className="space-y-4">
            {certificates.map((cert) => (
              <div
                key={cert._id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-lg">{cert.name}</h3>
                    <p className="text-gray-600">{cert.issuer}</p>
                    <p className="text-sm text-gray-500">
                      Issued on: {new Date(cert.dateIssued).toLocaleDateString()}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {cert.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {cert.verified && (
                      <span className="text-green-600 flex items-center">
                        <Award className="h-5 w-5 mr-1" />
                        Verified
                      </span>
                    )}
                    <button
                      onClick={() => handleDownload(cert.fileUrl, cert.name)}
                      className="text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <Download className="h-5 w-5 mr-1" />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSkills; 