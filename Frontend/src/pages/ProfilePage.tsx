import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit2, MapPin, Briefcase, Calendar, ExternalLink, Github as GitHub, Linkedin, X, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useQuests } from '../context/QuestContext';
import Navbar from '../components/Navbar';
import SkillSelector from '../components/SkillSelector';
import axios from 'axios';

const ProfilePage: React.FC = () => {
  const { currentUser, updateUserProfile } = useAuth();
  const { getSubmissionsByUserId } = useQuests();
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [title, setTitle] = useState(currentUser?.title || '');
  const [skills, setSkills] = useState<string[]>(currentUser?.skills || []);
  const [interests, setInterests] = useState<string[]>(currentUser?.interests || []);
  
  // Certificate upload states
  const [certName, setCertName] = useState('');
  const [issuer, setIssuer] = useState('');
  const [dateIssued, setDateIssued] = useState('');
  const [certSkills, setCertSkills] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  
  const submissions = currentUser ? getSubmissionsByUserId(currentUser.id) : [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf' || 
          selectedFile.type === 'application/msword' || 
          selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Please upload a PDF or Word document');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !certName || !issuer || !dateIssued) {
      setError('Please fill in all fields');
      return;
    }

    setIsUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('certificate', file);
    formData.append('name', certName);
    formData.append('issuer', issuer);
    formData.append('dateIssued', dateIssued);
    formData.append('skills', JSON.stringify(certSkills));

    try {
      const response = await axios.post('http://localhost:5000/api/users/certificates', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.coinsAdded > 0) {
        alert(`Certificate uploaded successfully! You earned ${response.data.coinsAdded} coins!`);
      } else {
        alert('Certificate uploaded successfully!');
      }

      // Reset form
      setFile(null);
      setCertName('');
      setIssuer('');
      setDateIssued('');
      setCertSkills([]);
      window.location.reload(); // Refresh to show new certificate
    } catch (error) {
      setError('Error uploading certificate. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Not Logged In</h2>
            <p className="text-gray-600 mb-6">Please log in to view your profile.</p>
            <Link
              to="/login"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSaveProfile = () => {
    updateUserProfile({
      name,
      title,
      skills,
      interests
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-blue-500 to-blue-600"></div>
            
            <div className="px-6 sm:px-8">
              <div className="flex flex-col sm:flex-row sm:items-end -mt-16 mb-6">
                <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-6">
                  {currentUser.profilePicture ? (
                    <img 
                      src={currentUser.profilePicture} 
                      alt={currentUser.name} 
                      className="h-32 w-32 rounded-full border-4 border-white object-cover"
                    />
                  ) : (
                    <div className="h-32 w-32 rounded-full border-4 border-white bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-4xl">{currentUser.name.charAt(0)}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      {isEditing ? (
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="text-2xl font-bold text-gray-900 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 mb-1"
                        />
                      ) : (
                        <h1 className="text-2xl font-bold text-gray-900">{currentUser.name}</h1>
                      )}
                      
                      {isEditing ? (
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Add your title"
                          className="text-lg text-gray-600 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-lg text-gray-600">{currentUser.title || 'No title added'}</p>
                      )}
                    </div>
                    
                    <div className="mt-4 sm:mt-0">
                      {isEditing ? (
                        <div className="flex space-x-3">
                          <button
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveProfile}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit Profile
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center text-sm text-gray-500 mt-4">
                    {currentUser.company && (
                      <div className="flex items-center mr-6 mb-2">
                        <Briefcase className="h-4 w-4 mr-1" />
                        <span>{currentUser.company}</span>
                      </div>
                    )}
                    <div className="flex items-center mr-6 mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>San Francisco, CA</span>
                    </div>
                    <div className="flex items-center mb-2">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>Joined {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                <div className="p-6 sm:p-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">About</h2>
                  <p className="text-gray-700 mb-6">
                    Passionate developer with a focus on creating intuitive and efficient solutions. 
                    Looking for opportunities to grow and contribute to meaningful projects.
                  </p>
                  
                  <h3 className="text-md font-semibold text-gray-900 mb-3">Connect</h3>
                  <div className="flex space-x-4">
                    <a href="#" className="text-gray-500 hover:text-gray-700">
                      <GitHub className="h-5 w-5" />
                    </a>
                    <a href="#" className="text-gray-500 hover:text-gray-700">
                      <Linkedin className="h-5 w-5" />
                    </a>
                    <a href="#" className="text-gray-500 hover:text-gray-700">
                      <ExternalLink className="h-5 w-5" />
                    </a>
                  </div>
                </div>
                
                <div className="p-6 sm:p-8">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Skills</h2>
                    {isEditing && (
                      <span className="text-xs text-gray-500">Select your skills</span>
                    )}
                  </div>
                  
                  {isEditing ? (
                    <div className="space-y-4">
                      <SkillSelector
                        selectedSkills={skills}
                        onChange={setSkills}
                      />
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => {
                            setSkills(currentUser?.skills || []);
                            setIsEditing(false);
                          }}
                          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              await updateUserProfile({
                                ...currentUser,
                                skills
                              });
                              setIsEditing(false);
                            } catch (error) {
                              console.error('Error updating skills:', error);
                              alert('Failed to update skills. Please try again.');
                            }
                          }}
                          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Save Skills
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {currentUser?.skills && currentUser.skills.length > 0 ? (
                          currentUser.skills.map((skill, index) => (
                            <span 
                              key={index} 
                              className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <p className="text-gray-500 text-sm">No skills added yet</p>
                        )}
                      </div>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        <Edit2 className="h-4 w-4 mr-1" />
                        Edit Skills
                      </button>
                    </div>
                  )}
                  
                  <div className="mt-8">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold text-gray-900">Interests</h2>
                      {isEditing && (
                        <span className="text-xs text-gray-500">Select your interests</span>
                      )}
                    </div>
                    
                    {isEditing ? (
                      <SkillSelector
                        selectedSkills={interests}
                        onChange={setInterests}
                        suggestions={[
                          'Web Development', 'Mobile Development', 'Data Science', 'Machine Learning',
                          'DevOps', 'Cloud Computing', 'Cybersecurity', 'Blockchain',
                          'Game Development', 'AR/VR', 'IoT', 'Artificial Intelligence',
                          'Frontend Development', 'Backend Development', 'Full Stack Development',
                          'UI/UX Design', 'Product Management', 'Project Management'
                        ]}
                      />
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {currentUser.interests && currentUser.interests.length > 0 ? (
                          currentUser.interests.map((interest, index) => (
                            <span 
                              key={index} 
                              className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                            >
                              {interest}
                            </span>
                          ))
                        ) : (
                          <p className="text-gray-500 text-sm">No interests added yet</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-6 sm:p-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Completed Quests</h2>
                  
                  {submissions.length > 0 ? (
                    <div className="space-y-4">
                      {submissions.map((submission) => (
                        <div key={submission.id} className="border border-gray-200 rounded-md p-4">
                          <h3 className="font-medium text-gray-900 mb-1">Quest Title</h3>
                          <p className="text-sm text-gray-500 mb-2">Submitted on {new Date(submission.submittedAt).toLocaleDateString()}</p>
                          <div className="flex space-x-2 mb-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              submission.status === 'approved' 
                                ? 'bg-green-100 text-green-800' 
                                : submission.status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                            </span>
                          </div>
                          <div className="flex space-x-3 text-sm">
                            <a href={submission.videoDemo} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                              Video Demo
                            </a>
                            <a href={submission.githubLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                              GitHub Repo
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">You haven't completed any quests yet</p>
                      <Link
                        to="/"
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                      >
                        Explore Quests
                      </Link>
                    </div>
                  )}

                  {/* Certificate Upload Section */}
                  <div className="mt-8 border-t border-gray-200 pt-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Certificate</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Certificate Name
                        </label>
                        <input
                          type="text"
                          value={certName}
                          onChange={(e) => setCertName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="e.g., AWS Certified Solutions Architect"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Issuing Organization
                        </label>
                        <input
                          type="text"
                          value={issuer}
                          onChange={(e) => setIssuer(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="e.g., Amazon Web Services"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date Issued
                        </label>
                        <input
                          type="date"
                          value={dateIssued}
                          onChange={(e) => setDateIssued(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Related Skills
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {currentUser?.skills?.map((skill: string) => (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => {
                                setCertSkills(prev => 
                                  prev.includes(skill) 
                                    ? prev.filter(s => s !== skill)
                                    : [...prev, skill]
                                );
                              }}
                              className={`px-3 py-1 rounded-full text-sm ${
                                certSkills.includes(skill)
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {skill}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Certificate File
                        </label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                          <div className="space-y-1 text-center">
                            {file ? (
                              <div className="flex items-center justify-center">
                                <span className="text-sm text-gray-500">{file.name}</span>
                                <button
                                  type="button"
                                  onClick={() => setFile(null)}
                                  className="ml-2 text-red-500 hover:text-red-700"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <>
                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex text-sm text-gray-600">
                                  <label
                                    htmlFor="file-upload"
                                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                                  >
                                    <span>Upload a file</span>
                                    <input
                                      id="file-upload"
                                      name="file-upload"
                                      type="file"
                                      className="sr-only"
                                      onChange={handleFileChange}
                                      accept=".pdf,.doc,.docx"
                                    />
                                  </label>
                                  <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500">PDF or Word documents up to 10MB</p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {error && (
                        <div className="bg-red-50 border-l-4 border-red-400 p-4">
                          <p className="text-red-700">{error}</p>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isUploading}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                      >
                        {isUploading ? 'Uploading...' : 'Upload Certificate'}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;