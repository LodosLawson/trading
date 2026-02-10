import React from 'react';

interface InsightProps {
  headline: string;
  impactScore: number; // -10 to +10
  chainReaction: string[];
  aiMentorAdvice: string;
}

const InsightModule: React.FC<InsightProps> = ({ headline, impactScore, chainReaction, aiMentorAdvice }) => {
  const isPositive = impactScore > 0;
  const scoreColor = isPositive ? 'text-green-400' : 'text-red-400';
  const borderColor = isPositive ? 'border-green-500/30' : 'border-red-500/30';

  return (
    <div className={`p-6 rounded-xl bg-slate-900 border ${borderColor} backdrop-blur-sm shadow-2xl max-w-md`}>
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-bold text-white tracking-tight">{headline}</h2>
        <div className={`text-2xl font-black ${scoreColor}`}>
          {impactScore > 0 ? '+' : ''}{impactScore}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-xs uppercase tracking-widest text-slate-400 mb-2 font-semibold">Zincirleme Etki Analizi</h3>
        <ul className="space-y-2">
          {chainReaction.map((item, index) => (
            <li key={index} className="flex items-center text-sm text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-slate-800/50 p-4 rounded-lg border-l-4 border-purple-500">
        <h3 className="text-xs uppercase tracking-widest text-purple-400 mb-1 font-bold flex items-center">
          <span className="mr-2">⚡</span> AI Mentor
        </h3>
        <p className="text-sm text-slate-200 italic">"{aiMentorAdvice}"</p>
      </div>
    </div>
  );
};

export default InsightModule;
