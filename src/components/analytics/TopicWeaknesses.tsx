import { useState, useEffect } from 'react';
import { AlertTriangle, TrendingDown } from 'lucide-react';
import { analyticsService } from '../../services/analytics.service';

interface TopicAnalytics {
  id: string;
  topic: { name: string } | null;
  subject: { name: string };
  totalAttempts: number;
  correctAnswers: number;
  accuracyRate: number;
}

export default function TopicWeaknesses() {
  const [weakTopics, setWeakTopics] = useState<TopicAnalytics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWeakAreas();
  }, []);

  const loadWeakAreas = async () => {
    try {
      const response = await analyticsService.getWeakAreas();
      setWeakTopics(response);
    } catch (error) {
      console.error('Failed to load weak areas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-40 rounded"></div>;
  }

  if (weakTopics.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Great! No significant weak areas detected.</p>
        <p className="text-sm text-gray-500 mt-2">Keep practicing to maintain your performance.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {weakTopics.map((topic) => (
        <div 
          key={topic.id}
          className="p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-red-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <p className="font-semibold text-gray-900">
                  {topic.topic?.name || topic.subject.name}
                </p>
                <p className="text-sm text-gray-600">{topic.subject.name}</p>
                <div className="flex items-center gap-2 mt-2">
                  <TrendingDown className="text-red-600" size={16} />
                  <span className="text-sm text-red-700 font-medium">
                    {Number(topic.accuracyRate).toFixed(0)}% accuracy
                  </span>
                  <span className="text-xs text-gray-500">
                    ({topic.correctAnswers}/{topic.totalAttempts} questions)
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => window.location.href = '/practice/setup'}
              className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 whitespace-nowrap"
            >
              Practice
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}