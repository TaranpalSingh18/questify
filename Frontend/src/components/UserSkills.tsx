import React, { useState, useEffect } from 'react';
import { Award, Download, BarChart2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import SkillChart from './SkillChart';

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
  const [skillData, setSkillData] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/users/certificates', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setCertificates(response.data);
        
        // Process skill data for the chart
        const skillCounts: { [key: string]: number } = {};
        response.data.forEach((cert: Certificate) => {
          cert.skills.forEach(skill => {
            skillCounts[skill] = (skillCounts[skill] || 0) + 1;
          });
        });
        
        const chartData = Object.entries(skillCounts).map(([name, value]) => ({
          name,
          value
        }));
        
        setSkillData(chartData);
      } catch (error) {
        console.error('Error fetching certificates:', error);
        setError('Failed to load certificates');
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  const handleDownload = (fileUrl: string) => {
    window.open(`http://localhost:5000${fileUrl}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Skills Chart Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">Skills Overview</h2>
        </div>
        {skillData.length > 0 ? (
          <SkillChart data={skillData} />
        ) : (
          <div className="text-center py-8 text-gray-500">
            No skill data available. Add certificates to see your skills distribution.
          </div>
        )}
      </div>

      {/* Certificates Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Award className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">Certificates</h2>
        </div>
        
        {certificates.length > 0 ? (
          <div className="space-y-4">
            {certificates.map((cert) => (
              <div
                key={cert._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-lg text-gray-900">{cert.name}</h3>
                    <p className="text-gray-600">{cert.issuer}</p>
                    <p className="text-sm text-gray-500">
                      Issued on: {new Date(cert.dateIssued).toLocaleDateString()}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {cert.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
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
                      onClick={() => handleDownload(cert.fileUrl)}
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
        ) : (
          <div className="text-center py-8 text-gray-500">
            No certificates found. Add your first certificate to get started.
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSkills; 