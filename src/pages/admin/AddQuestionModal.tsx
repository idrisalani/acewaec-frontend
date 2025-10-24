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
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 xs:p-3 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl xs:rounded-3xl w-full max-w-4xl max-h-[95vh] xs:max-h-[90vh] overflow-hidden shadow-2xl"
        >
          {/* Header - Mobile Responsive */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-3 xs:px-4 sm:px-6 md:px-8 py-3 xs:py-4 sm:py-5 md:py-6 flex items-center justify-between gap-2 xs:gap-3">
            <div className="flex items-center gap-2 xs:gap-3 sm:gap-4 min-w-0 flex-1">
              <div className="bg-white/20 p-2 xs:p-2.5 sm:p-3 rounded-lg xs:rounded-xl backdrop-blur-sm flex-shrink-0">
                <Sparkles className="text-white" size={18} />
              </div>
              <div className="min-w-0">
                <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold text-white truncate">
                  Add New Question
                </h2>
                <p className="text-xs xs:text-sm text-indigo-100">Step {step} of 3</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg xs:rounded-xl transition-colors flex-shrink-0"
            >
              <X size={20} />
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

          {/* Content - Mobile Responsive */}
          <div className="p-3 xs:p-4 sm:p-6 md:p-8 overflow-y-auto max-h-[calc(95vh-180px)] xs:max-h-[calc(90vh-180px)]">
            <AnimatePresence mode="wait">
              {/* Step 1: Question Content */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4 xs:space-y-5 sm:space-y-6"
                >
                  {/* Question Content */}
                  <div>
                    <label className="block text-xs xs:text-sm font-bold text-gray-700 mb-2 xs:mb-3">
                      Question Content <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="w-full px-3 xs:px-4 py-2 xs:py-3 border-2 border-gray-300 rounded-lg xs:rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none resize-none text-sm xs:text-base"
                      rows={5}
                      placeholder="Enter the question here..."
                    />
                    <p className="text-xs text-gray-500 mt-1 xs:mt-2">
                      {formData.content.length} characters
                    </p>
                  </div>

                  {/* Question Image */}
                  <div>
                    <label className="block text-xs xs:text-sm font-bold text-gray-700 mb-2 xs:mb-3">
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
                        <div className="border-2 border-dashed border-gray-300 rounded-lg xs:rounded-xl p-4 xs:p-6 hover:bg-gray-50 transition-colors text-center">
                          <Image className="mx-auto text-gray-400 mb-2 xs:mb-3" size={32} />
                          <p className="text-xs xs:text-sm font-medium text-gray-700">
                            Click to upload image
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG up to 10MB
                          </p>
                        </div>
                      </label>
                    ) : (
                      <div className="relative group">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-auto max-h-80 rounded-lg xs:rounded-xl object-cover"
                        />
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          onClick={() => setImageFile(null)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1.5 xs:p-2 rounded-lg hover:bg-red-600 transition-colors"
                        >
                          <X size={18} />
                        </motion.button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Subject, Topic, Difficulty, Year */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4 xs:space-y-5 sm:space-y-6"
                >
                  {/* Subject & Topic Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xs:gap-5">
                    {/* Subject */}
                    <div>
                      <label className="block text-xs xs:text-sm font-bold text-gray-700 mb-2 xs:mb-3">
                        Subject <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.subjectId}
                        onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                        className="w-full px-3 xs:px-4 py-2 xs:py-3 border-2 border-gray-300 rounded-lg xs:rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-sm xs:text-base"
                      >
                        <option value="">Select Subject</option>
                        {subjects.map((subj) => (
                          <option key={subj.id} value={subj.id}>
                            {subj.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Topic */}
                    <div>
                      <label className="block text-xs xs:text-sm font-bold text-gray-700 mb-2 xs:mb-3">
                        Topic <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.topicId}
                        onChange={(e) => setFormData({ ...formData, topicId: e.target.value })}
                        disabled={!formData.subjectId}
                        className="w-full px-3 xs:px-4 py-2 xs:py-3 border-2 border-gray-300 rounded-lg xs:rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-sm xs:text-base disabled:opacity-50 disabled:cursor-not-allowed"
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

                  {/* Difficulty & Year Row */}
                  <div className="space-y-4 xs:space-y-5 sm:space-y-6">
                    {/* Difficulty */}
                    <div>
                      <label className="block text-xs xs:text-sm font-bold text-gray-700 mb-2 xs:mb-3">
                        Difficulty <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-3 gap-2 xs:gap-3">
                        {['EASY', 'MEDIUM', 'HARD'].map((diff) => (
                          <motion.button
                            key={diff}
                            type="button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setFormData({ ...formData, difficulty: diff })}
                            className={`py-2 xs:py-3 px-2 xs:px-4 rounded-lg xs:rounded-xl font-bold text-xs xs:text-sm transition-all ${
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

                    {/* Year */}
                    <div>
                      <label className="block text-xs xs:text-sm font-bold text-gray-700 mb-2 xs:mb-3">
                        Year (Optional)
                      </label>
                      <input
                        type="number"
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                        className="w-full px-3 xs:px-4 py-2 xs:py-3 border-2 border-gray-300 rounded-lg xs:rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-sm xs:text-base"
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
                  className="space-y-4 xs:space-y-5 sm:space-y-6"
                >
                  {/* Answer Options */}
                  <div>
                    <label className="block text-xs xs:text-sm font-bold text-gray-700 mb-3 xs:mb-4">
                      Answer Options <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2 xs:space-y-3">
                      {formData.options.map((option, index) => (
                        <motion.div
                          key={option.label}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`flex items-center gap-2 xs:gap-3 p-2 xs:p-3 sm:p-4 rounded-lg xs:rounded-xl border-2 transition-all ${
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
                            className="w-4 h-4 xs:w-5 xs:h-5 text-indigo-600 cursor-pointer"
                          />
                          <div className={`w-8 h-8 xs:w-10 xs:h-10 rounded-lg xs:rounded-xl flex items-center justify-center font-bold text-xs xs:text-sm flex-shrink-0 ${
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
                            className="flex-1 px-2 xs:px-3 py-1.5 xs:py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none text-xs xs:text-sm"
                            placeholder={`Option ${option.label}`}
                          />
                          {formData.correctAnswer === option.label && (
                            <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                          )}
                        </motion.div>
                      ))}
                    </div>
                    <div className="mt-2 xs:mt-3 p-2 xs:p-3 bg-blue-50 border border-blue-200 rounded-lg xs:rounded-xl flex items-start gap-2">
                      <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
                      <p className="text-xs xs:text-sm text-blue-800">
                        Click the radio button to mark the correct answer
                      </p>
                    </div>
                  </div>

                  {/* Explanation */}
                  <div>
                    <label className="block text-xs xs:text-sm font-bold text-gray-700 mb-2 xs:mb-3">
                      Explanation (Optional)
                    </label>
                    <textarea
                      value={formData.explanation}
                      onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                      className="w-full px-3 xs:px-4 py-2 xs:py-3 border-2 border-gray-300 rounded-lg xs:rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none resize-none text-sm xs:text-base"
                      rows={4}
                      placeholder="Explain why this is the correct answer..."
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer - Mobile Responsive */}
          <div className="border-t border-gray-200 px-3 xs:px-4 sm:px-6 md:px-8 py-3 xs:py-4 sm:py-5 md:py-6 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 xs:gap-4 bg-gray-50">
            {/* Step Indicators */}
            <div className="flex gap-1.5 xs:gap-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-2 rounded-full transition-all ${
                    s === step ? 'w-6 xs:w-8 bg-indigo-600' : 'w-2 bg-gray-300'
                  }`}
                />
              ))}
            </div>
            
            {/* Buttons */}
            <div className="flex items-center gap-2 xs:gap-3 w-full xs:w-auto justify-end">
              {step > 1 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-4 xs:px-6 py-2 xs:py-2.5 border-2 border-gray-300 rounded-lg xs:rounded-xl hover:bg-gray-100 font-semibold transition-colors text-xs xs:text-sm"
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
                  className="px-5 xs:px-8 py-2 xs:py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg xs:rounded-xl font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs xs:text-sm"
                >
                  Next Step
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: loading ? 1 : 1.05 }}
                  whileTap={{ scale: loading ? 1 : 0.95 }}
                  onClick={handleSubmit}
                  disabled={loading || !isStepValid(3)}
                  className="px-5 xs:px-8 py-2 xs:py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg xs:rounded-xl font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 text-xs xs:text-sm"
                >
                  {loading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 xs:w-5 xs:h-5 border-3 border-white border-t-transparent rounded-full"
                      />
                      <span className="hidden xs:inline">Creating...</span>
                      <span className="xs:hidden">...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      <span className="hidden xs:inline">Create Question</span>
                      <span className="xs:hidden">Create</span>
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