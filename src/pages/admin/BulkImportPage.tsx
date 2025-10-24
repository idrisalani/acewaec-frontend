import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Download, CheckCircle, XCircle, AlertCircle, FileText, Sparkles, Info } from 'lucide-react';

interface ImportResult {
  imported: number;
  failed: number;
  total: number;
  errors: string[];
}

export default function BulkImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    setResult(null);

    // Simulate upload
    setTimeout(() => {
      setResult({
        imported: 245,
        failed: 12,
        total: 257,
        errors: [
          'Row 23: Invalid subject code "MATTH" - should be "MATH"',
          'Row 45: Missing required field "correctAnswer"',
          'Row 78: Topic "Advanced Calculus" not found in subject',
          'Row 89: Invalid difficulty level "EXTREME" - must be EASY, MEDIUM, or HARD',
        ],
      });
      setUploading(false);
    }, 2000);
  };

  const downloadTemplate = () => {
    const template = `content,explanation,type,difficulty,year,correctAnswer,subjectCode,topicName,optionA,optionB,optionC,optionD
"What is 2+2?","Simple addition",MULTIPLE_CHOICE,EASY,2024,C,MATH,Algebra,"2","3","4","5"
"Solve: 3x = 15","Divide both sides by 3",MULTIPLE_CHOICE,MEDIUM,2024,D,MATH,Algebra,"x=3","x=4","x=12","x=5"`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'acewaec-question-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const csvFields = [
    { name: 'content', required: true, desc: 'The question text', example: '"What is 2+2?"' },
    { name: 'explanation', required: false, desc: 'Explanation of answer', example: '"Simple addition"' },
    { name: 'type', required: true, desc: 'Question type', example: 'MULTIPLE_CHOICE' },
    { name: 'difficulty', required: true, desc: 'EASY, MEDIUM, or HARD', example: 'MEDIUM' },
    { name: 'year', required: false, desc: 'WAEC year', example: '2024' },
    { name: 'correctAnswer', required: true, desc: 'A, B, C, or D', example: 'C' },
    { name: 'subjectCode', required: true, desc: 'Subject code', example: 'MATH' },
    { name: 'topicName', required: true, desc: 'Exact topic name', example: 'Algebra' },
    { name: 'optionA-D', required: true, desc: 'Four answer options', example: '"2", "3", "4", "5"' },
  ];

  return (
    <div className="min-h-screen p-2 xs:p-3 sm:p-4 md:p-6 lg:p-8 bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50">
      <div className="w-full max-w-6xl mx-auto">
        {/* Header - Mobile Responsive */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 xs:mb-6 sm:mb-8"
        >
          <div className="flex items-center gap-2 xs:gap-3 mb-2 xs:mb-3">
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-2 xs:p-3 rounded-lg xs:rounded-xl shadow-lg flex-shrink-0">
              <Upload className="text-white w-5 h-5 xs:w-6 xs:h-6" />
            </div>
            <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent truncate">
              Bulk Import
            </h1>
          </div>
          <p className="text-xs xs:text-sm text-gray-600 ml-8 xs:ml-12">
            Upload CSV files to add multiple questions
          </p>
        </motion.div>

        {/* Quick Guide - Mobile Responsive */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg xs:rounded-xl md:rounded-2xl shadow-xl p-3 xs:p-4 sm:p-6 mb-4 xs:mb-6 text-white"
        >
          <div className="flex items-start gap-2 xs:gap-4">
            <div className="bg-white/20 p-2 xs:p-3 rounded-lg xs:rounded-xl backdrop-blur-sm flex-shrink-0">
              <Sparkles className="w-4.5 h-4.5 xs:w-5 xs:h-5 md:w-6 md:h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base xs:text-lg sm:text-xl font-bold mb-2 xs:mb-3">Quick Start</h2>
              <div className="grid grid-cols-1 xs:grid-cols-3 gap-2 xs:gap-3 sm:gap-4 mt-2 xs:mt-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg xs:rounded-xl p-2 xs:p-3 sm:p-4 border border-white/20">
                  <div className="text-lg xs:text-xl sm:text-2xl font-bold mb-0.5 xs:mb-1">1</div>
                  <p className="text-xs xs:text-sm">Download template</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg xs:rounded-xl p-2 xs:p-3 sm:p-4 border border-white/20">
                  <div className="text-lg xs:text-xl sm:text-2xl font-bold mb-0.5 xs:mb-1">2</div>
                  <p className="text-xs xs:text-sm">Fill questions</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg xs:rounded-xl p-2 xs:p-3 sm:p-4 border border-white/20">
                  <div className="text-lg xs:text-xl sm:text-2xl font-bold mb-0.5 xs:mb-1">3</div>
                  <p className="text-xs xs:text-sm">Upload & import</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content - Mobile Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xs:gap-6 mb-4 xs:mb-6">
          {/* Template Download */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg xs:rounded-xl md:rounded-2xl shadow-lg md:shadow-xl p-4 xs:p-6 hover:shadow-xl md:hover:shadow-2xl transition-shadow"
          >
            <div className="flex items-center gap-2 xs:gap-3 mb-3 xs:mb-4">
              <div className="bg-green-100 p-2 xs:p-3 rounded-lg xs:rounded-xl flex-shrink-0">
                <FileText className="text-green-600 w-5 h-5 xs:w-5.5 xs:h-5.5 md:w-6 md:h-6" />
              </div>
              <h2 className="text-base xs:text-lg sm:text-xl font-bold text-gray-900">Download Template</h2>
            </div>
            
            <p className="text-xs xs:text-sm text-gray-600 mb-4 xs:mb-6">
              Get the CSV template with correct format and example questions.
            </p>
            
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={downloadTemplate}
              className="w-full flex items-center justify-center gap-2 xs:gap-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 xs:px-6 py-2.5 xs:py-3 sm:py-4 rounded-lg xs:rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold text-sm xs:text-base"
            >
              <Download size={20} />
              <span className="truncate">Download CSV</span>
            </motion.button>
            
            <div className="mt-3 xs:mt-4 p-2 xs:p-4 bg-amber-50 border border-amber-200 rounded-lg xs:rounded-xl">
              <div className="flex items-start gap-2">
                <Info className="text-amber-600 flex-shrink-0 mt-0.5 w-4 h-4 xs:w-4.5 xs:h-4.5" />
                <p className="text-xs xs:text-sm text-amber-800">
                  <strong>Pro tip:</strong> Start with the template for proper formatting.
                </p>
              </div>
            </div>
          </motion.div>

          {/* File Upload Area */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg xs:rounded-xl md:rounded-2xl shadow-lg md:shadow-xl p-4 xs:p-6 hover:shadow-xl md:hover:shadow-2xl transition-shadow"
          >
            <h2 className="text-base xs:text-lg sm:text-xl font-bold text-gray-900 mb-3 xs:mb-4">Upload File</h2>

            {/* Drag and Drop Area - Mobile Responsive */}
            <motion.div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              animate={dragActive ? { scale: 0.98 } : { scale: 1 }}
              className={`relative rounded-lg xs:rounded-xl md:rounded-2xl border-2 border-dashed transition-all p-4 xs:p-6 sm:p-8 text-center cursor-pointer ${
                dragActive
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-300 bg-gray-50 hover:border-indigo-500 hover:bg-indigo-50/50'
              }`}
            >
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              
              <motion.div
                animate={dragActive ? { y: -8 } : { y: 0 }}
              >
                <Upload className={`mx-auto mb-2 xs:mb-3 w-6 h-6 xs:w-8 xs:h-8 ${dragActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                <p className="text-xs xs:text-sm font-semibold text-gray-900">
                  {dragActive ? 'Drop your file here' : 'Drag CSV file here'}
                </p>
                <p className="text-xs text-gray-600 mt-1">or click to browse</p>
              </motion.div>
            </motion.div>

            {/* File Info - Mobile Responsive */}
            <AnimatePresence>
              {file && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-3 xs:mt-4"
                >
                  <div className="p-3 xs:p-4 bg-green-50 border border-green-200 rounded-lg xs:rounded-xl">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <CheckCircle className="text-green-600 flex-shrink-0 w-4.5 h-4.5 xs:w-5 xs:h-5" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs xs:text-sm font-semibold text-green-900 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-green-700">
                            {(file.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setFile(null);
                          setResult(null);
                        }}
                        className="mt-2 xs:mt-0 text-red-600 hover:text-red-700 text-xs xs:text-sm font-semibold flex-shrink-0 whitespace-nowrap"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: file && !uploading ? 1.02 : 1 }}
              whileTap={{ scale: file && !uploading ? 0.98 : 1 }}
              onClick={handleUpload}
              disabled={!file || uploading}
              className="mt-4 xs:mt-6 w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 xs:py-3 sm:py-4 rounded-lg xs:rounded-xl font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm xs:text-base"
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 xs:w-5 xs:h-5 border-3 border-white border-t-transparent rounded-full"
                  />
                  <span className="truncate">Importing...</span>
                </span>
              ) : (
                'Import Questions'
              )}
            </motion.button>
          </motion.div>
        </div>

        {/* CSV Format Reference - Mobile Responsive */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg xs:rounded-xl md:rounded-2xl shadow-lg md:shadow-xl p-4 xs:p-6 mb-4 xs:mb-6"
        >
          <h2 className="text-base xs:text-lg sm:text-xl font-bold text-gray-900 mb-3 xs:mb-4">CSV Format</h2>
          
          {/* Mobile: Card View, Desktop: Table View */}
          <div className="md:hidden space-y-2 xs:space-y-3">
            {csvFields.map((field, index) => (
              <motion.div
                key={field.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                className="p-3 xs:p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="font-mono font-semibold text-indigo-600 text-xs xs:text-sm truncate">
                    {field.name}
                  </p>
                  {field.required ? (
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold flex-shrink-0">
                      Req
                    </span>
                  ) : (
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-bold flex-shrink-0">
                      Opt
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-700 mb-1">{field.desc}</p>
                <p className="text-xs font-mono text-gray-600">{field.example}</p>
              </motion.div>
            ))}
          </div>

          {/* Desktop: Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-indigo-50 to-purple-50">
                  <th className="px-4 py-3 text-left font-bold text-gray-900">Column</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-900">Required</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-900">Description</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-900">Example</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {csvFields.map((field, index) => (
                  <motion.tr
                    key={field.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono font-semibold text-indigo-600">{field.name}</td>
                    <td className="px-4 py-3">
                      {field.required ? (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">
                          Required
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-bold">
                          Optional
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{field.desc}</td>
                    <td className="px-4 py-3 font-mono text-sm text-gray-600">{field.example}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 xs:mt-4 sm:mt-6 p-3 xs:p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg xs:rounded-xl">
            <div className="flex items-start gap-2 xs:gap-3">
              <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5 w-4.5 h-4.5 xs:w-5 xs:h-5" />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-yellow-900 mb-1 xs:mb-2 text-sm xs:text-base">Important Notes</p>
                <ul className="text-xs xs:text-sm text-yellow-800 space-y-0.5 xs:space-y-1">
                  <li>• Subject codes must match existing subjects</li>
                  <li>• Topic names must exist in selected subject</li>
                  <li>• Use UTF-8 encoding for special characters</li>
                  <li>• Wrap text with commas in quotes</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Results - Mobile Responsive */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`rounded-lg xs:rounded-xl md:rounded-2xl shadow-xl md:shadow-2xl p-4 xs:p-6 sm:p-8 ${
                result.failed === 0
                  ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200'
                  : 'bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200'
              }`}
            >
              <h2 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900 mb-4 xs:mb-6">
                Import Results
              </h2>

              {/* Stats Cards - Mobile Responsive */}
              <div className="grid grid-cols-1 xs:grid-cols-3 gap-3 xs:gap-4 sm:gap-6 mb-6 xs:mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="bg-white rounded-lg xs:rounded-xl p-4 xs:p-6 text-center shadow-lg"
                >
                  <CheckCircle className="mx-auto text-green-500 mb-2 xs:mb-3 w-8 h-8 xs:w-10 xs:h-10 md:w-12 md:h-12" />
                  <p className="text-2xl xs:text-3xl sm:text-4xl font-bold text-green-600 mb-1">
                    {result.imported}
                  </p>
                  <p className="text-xs xs:text-sm font-semibold text-gray-600">Imported</p>
                </motion.div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                  className="bg-white rounded-lg xs:rounded-xl p-4 xs:p-6 text-center shadow-lg"
                >
                  <XCircle className="mx-auto text-red-500 mb-2 xs:mb-3 w-8 h-8 xs:w-10 xs:h-10 md:w-12 md:h-12" />
                  <p className="text-2xl xs:text-3xl sm:text-4xl font-bold text-red-600 mb-1">
                    {result.failed}
                  </p>
                  <p className="text-xs xs:text-sm font-semibold text-gray-600">Failed</p>
                </motion.div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: 'spring' }}
                  className="bg-white rounded-lg xs:rounded-xl p-4 xs:p-6 text-center shadow-lg"
                >
                  <AlertCircle className="mx-auto text-blue-500 mb-2 xs:mb-3 w-8 h-8 xs:w-10 xs:h-10 md:w-12 md:h-12" />
                  <p className="text-2xl xs:text-3xl sm:text-4xl font-bold text-blue-600 mb-1">
                    {result.total}
                  </p>
                  <p className="text-xs xs:text-sm font-semibold text-gray-600">Total</p>
                </motion.div>
              </div>

              {/* Errors Section - Mobile Responsive */}
              {result.errors.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white rounded-lg xs:rounded-xl p-4 xs:p-6 shadow-lg"
                >
                  <h3 className="font-bold text-red-700 mb-3 xs:mb-4 flex items-center gap-2 text-sm xs:text-base">
                    <XCircle size={20} />
                    Errors Found ({result.errors.length})
                  </h3>
                  <div className="space-y-2 xs:space-y-2.5 max-h-60 xs:max-h-80 overflow-y-auto">
                    {result.errors.map((error, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.05 }}
                        className="flex items-start gap-2 p-2 xs:p-3 bg-red-50 rounded-lg border border-red-100"
                      >
                        <div className="w-5 h-5 xs:w-6 xs:h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {index + 1}
                        </div>
                        <p className="text-xs xs:text-sm text-red-700">{error}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}