// frontend/src/components/analytics/StudyGoals.tsx
import { useEffect, useState } from 'react';
import { Target, Plus, Edit2, Check, AlertCircle, TrendingUp } from 'lucide-react';
import { analyticsService } from '../../services/analytics.service';

interface StudyGoal {
  id: string;
  name: string;
  description?: string;
  subjectId?: string;
  target: number; // Target accuracy percentage
  current: number; // Current accuracy percentage
  deadline: string;
  status: 'on_track' | 'at_risk' | 'completed';
  createdAt: string;
  daysRemaining: number;
}

interface NewGoalInput {
  name: string;
  description: string;
  target: number;
  deadline: string;
  subjectId?: string;
}

export default function StudyGoals() {
  const [goals, setGoals] = useState<StudyGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<NewGoalInput>({
    name: '',
    description: '',
    target: 80,
    deadline: '',
    subjectId: undefined
  });

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getStudyGoals();
      setGoals(data);
    } catch (error) {
      console.error('Failed to load goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = async () => {
    if (!formData.name || !formData.deadline) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const newGoal = await analyticsService.createStudyGoal(formData);
      setGoals([...goals, newGoal]);
      setFormData({
        name: '',
        description: '',
        target: 80,
        deadline: '',
        subjectId: undefined
      });
      setShowForm(false);
    } catch (error) {
      console.error('Failed to create goal:', error);
      alert('Failed to create goal. Please try again.');
    }
  };

  const getStatusColor = (status: StudyGoal['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'on_track':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'at_risk':
        return 'bg-red-50 border-red-200 text-red-700';
    }
  };

  const getStatusIcon = (status: StudyGoal['status']) => {
    switch (status) {
      case 'completed':
        return <Check className="text-green-600" size={20} />;
      case 'on_track':
        return <TrendingUp className="text-blue-600" size={20} />;
      case 'at_risk':
        return <AlertCircle className="text-red-600" size={20} />;
    }
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="text-indigo-600" size={24} />
          <h2 className="text-2xl font-bold text-gray-900">Study Goals</h2>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus size={18} />
            New Goal
          </button>
        )}
      </div>

      {/* Add Goal Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Create New Goal</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Goal Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Master Chemistry"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Accuracy (%) *
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add details about this goal..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deadline *
            </label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAddGoal}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Create Goal
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Goals List */}
      <div className="space-y-4">
        {goals.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <Target className="mx-auto text-gray-400 mb-3" size={32} />
            <p className="text-gray-600 mb-4">No goals yet. Set your first study goal!</p>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Plus size={18} />
                Create Goal
              </button>
            )}
          </div>
        ) : (
          goals.map((goal) => (
            <div
              key={goal.id}
              className={`p-6 rounded-lg border-2 ${getStatusColor(goal.status)}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  {getStatusIcon(goal.status)}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">{goal.name}</h3>
                    {goal.description && (
                      <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                    )}
                  </div>
                </div>

                <span className="text-xs font-medium px-3 py-1 rounded-full bg-white bg-opacity-60">
                  {goal.status === 'completed'
                    ? '✓ Completed'
                    : goal.status === 'on_track'
                    ? `${goal.daysRemaining} days left`
                    : 'At Risk'}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Current: {goal.current}%</span>
                  <span className="font-medium">Target: {goal.target}%</span>
                </div>
                <div className="w-full bg-white bg-opacity-40 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                    style={{ width: `${getProgressPercentage(goal.current, goal.target)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600">
                  {getProgressPercentage(goal.current, goal.target)}% of target achieved
                </p>
              </div>

              {/* Deadline */}
              <div className="mt-4 flex items-center justify-between text-xs text-gray-600">
                <span>
                  📅 Deadline: {new Date(goal.deadline).toLocaleDateString()}
                </span>
                {goal.status === 'at_risk' && (
                  <span className="text-red-600 font-medium">
                    ⚠️ Increase your practice pace!
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}