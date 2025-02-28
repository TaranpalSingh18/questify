import React, { useState } from 'react';
import { X } from 'lucide-react';

interface SkillSelectorProps {
  selectedSkills: string[];
  onChange: (skills: string[]) => void;
  suggestions?: string[];
}

const defaultSuggestions = [
  'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular', 'Node.js',
  'Python', 'Java', 'C#', 'PHP', 'Ruby', 'Go', 'Rust',
  'HTML', 'CSS', 'Tailwind CSS', 'Bootstrap', 'SASS',
  'MongoDB', 'PostgreSQL', 'MySQL', 'Firebase', 'GraphQL',
  'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes',
  'Git', 'CI/CD', 'DevOps', 'Agile', 'Scrum',
  'UI/UX Design', 'Figma', 'Adobe XD', 'Sketch',
  'Mobile Development', 'React Native', 'Flutter', 'iOS', 'Android',
  'Machine Learning', 'Data Science', 'AI', 'Blockchain'
];

const SkillSelector: React.FC<SkillSelectorProps> = ({ 
  selectedSkills, 
  onChange, 
  suggestions = defaultSuggestions 
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setShowSuggestions(true);
  };

  const addSkill = (skill: string) => {
    if (skill.trim() && !selectedSkills.includes(skill)) {
      onChange([...selectedSkills, skill]);
    }
    setInputValue('');
    setShowSuggestions(false);
  };

  const removeSkill = (skillToRemove: string) => {
    onChange(selectedSkills.filter(skill => skill !== skillToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue) {
      e.preventDefault();
      addSkill(inputValue);
    }
  };

  const filteredSuggestions = suggestions.filter(
    skill => skill.toLowerCase().includes(inputValue.toLowerCase()) && 
    !selectedSkills.includes(skill)
  );

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedSkills.map((skill, index) => (
          <div 
            key={index} 
            className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full flex items-center"
          >
            <span>{skill}</span>
            <button 
              type="button"
              onClick={() => removeSkill(skill)}
              className="ml-1 text-blue-700 hover:text-blue-900 focus:outline-none"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="Add skills (e.g., React, Python, UI Design)"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
        
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {filteredSuggestions.slice(0, 8).map((suggestion, index) => (
              <div
                key={index}
                className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                onClick={() => addSkill(suggestion)}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillSelector;