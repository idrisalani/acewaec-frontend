import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image, CheckCircle, Sparkles, AlertCircle } from 'lucide-react';

interface AddQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface Topic {
  id: string;
  name: string;
}

export default function AddQuestionModal({ isOpen, onClose, onSuccess }: AddQuestionModalProps) {
  const [subjects] = useState<Subject[]>([
    { id: '1', name: 'Mathematics', code: 'MATH' },
    { id: '2', name: 'English Language', code: 'ENG' },
    { id: '3', name: 'Physics', code: 'PHY' },
  ]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    content: '',
    explanation: '',
    subjectId: '',
    topicId: '',
    difficulty: 'MEDIUM',
    year: new Date().getFullYear(),
    correctAnswer: 'A',
    options: [
      { label: 'A', content: '' },
      { label: 'B', content: '' },
      { label: 'C', content: '' },
      { label: 'D', content: '' },
    ],
  });

  useEffect(() => {
    if (formData.subjectId) {
      setTopics([
        { id: '1', name: 'Algebra' },
        { id: '2', name: 'Geometry' },
        { id: '3', name: 'Calculus' },
      ]);
    }
  }, [formData.subjectId]);

  useEffect(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(imageFile);
    } else {
      setImagePreview('');
    }
  }, [imageFile]);

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess();
      onClose();
      resetForm();
    }, 1500);
  };

  const resetForm = () => {
    setFormData({
      content: '',
      explanation: '',
      subjectId: '',
      topicId: '',
      difficulty: 'MEDIUM',
      year: new Date().getFullYear(),
      correctAnswer: 'A',
      options: [
        { label: 'A', content: '' },
        { label: 'B', content: '' },
        { label: 'C', content: '' },
        { label: 'D', content: '' },
      ],
    });
    setImageFile(null);
    setStep(1);
  };

  const isStepValid = (stepNum: number) => {
    switch (stepNum) {
      case 1:
        return formData.content.trim().length > 0;
      case 2:
        return formData.subjectId && formData.topicId && formData.difficulty;
      case 3:
        return formData.options.every(opt => opt.content.trim().length > 0);
      default:
        return true;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <Sparkles className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Add New Question</h2>
                <p className="text-indigo-100 text-sm">Step {step} of 3</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-xl transition-colors"
            >
              <X size={24} />
            </motion.button>
          </div>

          {/* Progress Bar */}
          <div className="bg-gray-100 h-2">
            <motion.div
              initial={{ width: '33.33%' }}
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.3 }}
              className="h-full bg-gradient-to-r from-indigo-600 to-purple-600"
            />
          </div>

          {/* Content */}
          <div className="p-8 overflow-y-auto max-h-[calc(90vh-180px)]">
            <AnimatePresence mode="wait">
              {/* Step 1: Question Content */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Question Content <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none resize-none"
                      rows={6}
                      placeholder="Enter the question here..."
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      {formData.content.length} characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Question Image (Optional)
                    </label>
                    
                    {!imagePreview ? (
                      <label className="cursor-pointer block">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                          className="hidden"
                        />
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-400 hover:bg-indigo-50 transition-all">
                          <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Image className="text-indigo-600" size={28} />
                          </div>
                          <p className="text-gray-700 font-semibold">Click to upload image</p>
                          <p className="text-sm text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                        </div>
                      </label>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative border-2 border-indigo-300 rounded-xl overflow-hidden"
                      >
                        <img src={imagePreview} alt="Preview" className="w-full h-64 object-contain bg-gray-50" />
                        <button
                          type="button"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview('');
                          }}
                          className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                        >
                          <X size={18} />
                        </button>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Subject & Details */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        Subject <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.subjectId}
                        onChange={(e) => setFormData({ ...formData, subjectId: e.target.value, topicId: '' })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                      >
                        <option value="">Select Subject</option>
                        {subjects.map((subject) => (
                          <option key={subject.id} value={subject.id}>
                            {subject.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        Topic <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.topicId}
                        onChange={(e) => setFormData({ ...formData, topicId: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                        disabled={!formData.subjectId}
                      >
                        <option value="">Select Topic</option>
                        {topics.map((topic) => (
                          <option key={topic.id} value={topic.id}>
                            {topic.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        Difficulty <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {['EASY', 'MEDIUM', 'HARD'].map((diff) => (
                          <motion.button
                            key={diff}
                            type="button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setFormData({ ...formData, difficulty: diff })}
                            className={`py-3 px-4 rounded-xl font-bold transition-all ${
                              formData.difficulty === diff
                                ? diff === 'EASY'
                                  ? 'bg-green-500 text-white shadow-lg'
                                  : diff === 'MEDIUM'
                                  ? 'bg-yellow-500 text-white shadow-lg'
                                  : 'bg-red-500 text-white shadow-lg'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {diff}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        Year (Optional)
                      </label>
                      <input
                        type="number"
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                        min="2000"
                        max="2030"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Options & Explanation */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-4">
                      Answer Options <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-3">
                      {formData.options.map((option, index) => (
                        <motion.div
                          key={option.label}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                            formData.correctAnswer === option.label
                              ? 'border-green-400 bg-green-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <input
                            type="radio"
                            name="correctAnswer"
                            checked={formData.correctAnswer === option.label}
                            onChange={() => setFormData({ ...formData, correctAnswer: option.label })}
                            className="w-5 h-5 text-indigo-600 cursor-pointer"
                          />
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                            formData.correctAnswer === option.label
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-700'
                          }`}>
                            {option.label}
                          </div>
                          <input
                            type="text"
                            value={option.content}
                            onChange={(e) => {
                              const newOptions = [...formData.options];
                              newOptions[index].content = e.target.value;
                              setFormData({ ...formData, options: newOptions });
                            }}
                            className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                            placeholder={`Option ${option.label}`}
                          />
                          {formData.correctAnswer === option.label && (
                            <CheckCircle className="text-green-500" size={24} />
                          )}
                        </motion.div>
                      ))}
                    </div>
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2">
                      <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
                      <p className="text-sm text-blue-800">
                        Click the radio button to mark the correct answer
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Explanation (Optional)
                    </label>
                    <textarea
                      value={formData.explanation}
                      onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none resize-none"
                      rows={4}
                      placeholder="Explain why this is the correct answer..."
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-8 py-6 flex items-center justify-between bg-gray-50">
            <div className="flex gap-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`w-2 h-2 rounded-full transition-all ${
                    s === step ? 'w-8 bg-indigo-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            
            <div className="flex items-center gap-3">
              {step > 1 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-2.5 border-2 border-gray-300 rounded-xl hover:bg-gray-100 font-semibold transition-colors"
                >
                  Back
                </motion.button>
              )}
              
              {step < 3 ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setStep(step + 1)}
                  disabled={!isStepValid(step)}
                  className="px-8 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next Step
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: loading ? 1 : 1.05 }}
                  whileTap={{ scale: loading ? 1 : 0.95 }}
                  onClick={handleSubmit}
                  disabled={loading || !isStepValid(3)}
                  className="px-8 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 border-3 border-white border-t-transparent rounded-full"
                      />
                      Creating...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      Create Question
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}