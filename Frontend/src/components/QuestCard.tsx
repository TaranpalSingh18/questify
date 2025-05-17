import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, DollarSign, Users } from 'lucide-react';
import { Quest } from '../types';

interface QuestCardProps {
  quest: Quest;
}

const QuestCard: React.FC<QuestCardProps> = ({ quest }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300">
      <div className="p-5">
        <div className="flex items-center mb-4">
          {quest.companyLogo ? (
            <img 
              src={quest.companyLogo} 
              alt={quest.company} 
              className="w-12 h-12 rounded-md object-cover mr-4"
            />
          ) : (
            <div className="w-12 h-12 bg-blue-100 rounded-md flex items-center justify-center mr-4">
              <span className="text-blue-600 font-bold">{quest.company.charAt(0)}</span>
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{quest.title}</h3>
            <p className="text-sm text-gray-600">{quest.company}</p>
          </div>
        </div>
        
        <p className="text-gray-700 mb-4 line-clamp-2">{quest.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {quest.skills.slice(0, 3).map((skill, index) => (
            <span 
              key={index} 
              className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full"
            >
              {skill}
            </span>
          ))}
          {quest.skills.length > 3 && (
            <span className="bg-gray-50 text-gray-700 text-xs px-2 py-1 rounded-full">
              +{quest.skills.length - 3} more
            </span>
          )}
        </div>
        
        <div className="flex flex-wrap text-sm text-gray-500 mb-4">
          <div className="flex items-center mr-4 mb-2">
            <Calendar className="h-4 w-4 mr-1" />
            <span>Deadline: {formatDate(quest.deadline)}</span>
          </div>
          <div className="flex items-center mr-4 mb-2">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{quest.remote ? 'Remote' : quest.location}</span>
          </div>
          {quest.compensation && (
            <div className="flex items-center mr-4 mb-2">
              <DollarSign className="h-4 w-4 mr-1" />
              <span>{quest.compensation}</span>
            </div>
          )}
          <div className="flex items-center mb-2">
            <Users className="h-4 w-4 mr-1" />
            <span>{quest.applicants || 0} applicants</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">Posted {formatDate(quest.postedAt)}</span>
          <Link 
            to={`/quest/${quest._id}`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            View Quest
          </Link>
        </div>
      </div>
    </div>
  );
};

export default QuestCard;