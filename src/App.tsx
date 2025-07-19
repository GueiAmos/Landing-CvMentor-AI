import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Header from './components/layout/Header';
import Home from './components/sections/Home';
import CVAnalysis from './components/sections/CVAnalysis';
import JobMatching from './components/sections/JobMatching';
import CoverLetter from './components/sections/CoverLetter';
import InterviewSimulation from './components/sections/InterviewSimulation';
import SkillsDevelopment from './components/sections/SkillsDevelopment';

function App() {
  const [currentSection, setCurrentSection] = useState('home');

  const handleNavigate = (section: string) => {
    setCurrentSection(section);
    window.scrollTo(0, 0);
  };

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'home':
        return <Home onNavigate={handleNavigate} />;
      case 'cv-analysis':
        return <CVAnalysis />;
      case 'job-matching':
        return <JobMatching onNavigate={handleNavigate} />;
      case 'cover-letter':
        return <CoverLetter />;
      case 'interview':
        return <InterviewSimulation />;
      case 'skills':
        return <SkillsDevelopment onNavigate={handleNavigate} />;
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header currentSection={currentSection} onNavigate={handleNavigate} />
        <main>
          {renderCurrentSection()}
        </main>
      </div>
    </Router>
  );
}

export default App;