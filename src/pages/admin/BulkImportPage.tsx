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
    <div className="min-h-screen p-8 bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-3 rounded-xl shadow-lg">
              <Upload className="text-white" size={28} />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Bulk Import Questions
            </h1>
          </div>
          <p className="text-gray-600 ml-16">Upload CSV files to add multiple questions at once</p>
        </motion.div>

        {/* Quick Guide */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl p-6 mb-6 text-white"
        >
          <div className="flex items-start gap-4">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <Sparkles size={24} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-2">Quick Start Guide</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold mb-1">1</div>
                  <p className="text-sm">Download the CSV template</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold mb-1">2</div>
                  <p className="text-sm">Fill in your questions</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold mb-1">3</div>
                  <p className="text-sm">Upload and import</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Template Download */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-100 p-3 rounded-xl">
                <FileText className="text-green-600" size={24} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Download Template</h2>
            </div>
            
            <p className="text-gray-600 mb-6">
              Get the CSV template with correct format and example questions to guide you.
            </p>
            
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={downloadTemplate}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold"
            >
              <Download size={20} />
              Download CSV Template
            </motion.button>
            
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-start gap-2">
                <Info className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-amber-800">
                  <strong>Pro tip:</strong> Start with the template and modify it with your questions. This ensures proper formatting.
                </p>
              </div>
            </div>
          </motion.div>

          {/* File Upload */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-indigo-100 p-3 rounded-xl">
                <Upload className="text-indigo-600" size={24} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Upload File</h2>
            </div>

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative border-3 border-dashed rounded-2xl p-8 text-center transition-all ${
                dragActive
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
              }`}
            >
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="csv-upload"
              />

              <AnimatePresence mode="wait">
                {!file ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <div className="bg-gradient-to-br from-indigo-100 to-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Upload className="text-indigo-600" size={32} />
                    </div>
                    <label
                      htmlFor="csv-upload"
                      className="cursor-pointer text-indigo-600 hover:text-indigo-700 font-bold text-lg"
                    >
                      Choose file or drag here
                    </label>
                    <p className="text-sm text-gray-500 mt-2">CSV files only (max 10MB)</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="file"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl"
                  >
                    <FileText className="text-green-600 mx-auto mb-2" size={32} />
                    <p className="font-bold text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-600 mt-1">{(file.size / 1024).toFixed(2)} KB</p>
                    <button
                      onClick={() => setFile(null)}
                      className="mt-3 text-red-600 hover:text-red-700 text-sm font-semibold"
                    >
                      Remove file
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              whileHover={{ scale: file && !uploading ? 1.02 : 1 }}
              whileTap={{ scale: file && !uploading ? 0.98 : 1 }}
              onClick={handleUpload}
              disabled={!file || uploading}
              className="mt-6 w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-3 border-white border-t-transparent rounded-full"
                  />
                  Importing Questions...
                </span>
              ) : (
                'Import Questions'
              )}
            </motion.button>
          </motion.div>
        </div>

        {/* CSV Format Reference */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">CSV Format Reference</h2>
          <div className="overflow-x-auto">
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

          <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-bold text-yellow-900 mb-1">Important Notes</p>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Subject codes must match existing subjects (MATH, ENG, PHY, etc.)</li>
                  <li>• Topic names must exist in the selected subject</li>
                  <li>• Use UTF-8 encoding to preserve special characters</li>
                  <li>• Wrap text with commas in quotes</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`rounded-2xl shadow-2xl p-8 ${
                result.failed === 0
                  ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200'
                  : 'bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200'
              }`}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Import Results</h2>

              <div className="grid grid-cols-3 gap-6 mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="bg-white rounded-2xl p-6 text-center shadow-lg"
                >
                  <CheckCircle className="mx-auto text-green-500 mb-3" size={48} />
                  <p className="text-4xl font-bold text-green-600 mb-1">{result.imported}</p>
                  <p className="text-sm font-semibold text-gray-600">Imported</p>
                </motion.div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                  className="bg-white rounded-2xl p-6 text-center shadow-lg"
                >
                  <XCircle className="mx-auto text-red-500 mb-3" size={48} />
                  <p className="text-4xl font-bold text-red-600 mb-1">{result.failed}</p>
                  <p className="text-sm font-semibold text-gray-600">Failed</p>
                </motion.div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: 'spring' }}
                  className="bg-white rounded-2xl p-6 text-center shadow-lg"
                >
                  <AlertCircle className="mx-auto text-blue-500 mb-3" size={48} />
                  <p className="text-4xl font-bold text-blue-600 mb-1">{result.total}</p>
                  <p className="text-sm font-semibold text-gray-600">Total</p>
                </motion.div>
              </div>

              {result.errors.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white rounded-2xl p-6 shadow-lg"
                >
                  <h3 className="font-bold text-red-700 mb-4 flex items-center gap-2">
                    <XCircle size={20} />
                    Errors Found ({result.errors.length})
                  </h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {result.errors.map((error, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.05 }}
                        className="flex items-start gap-2 p-3 bg-red-50 rounded-lg border border-red-100"
                      >
                        <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {index + 1}
                        </div>
                        <p className="text-sm text-red-700">{error}</p>
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