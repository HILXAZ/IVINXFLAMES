import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Upload, 
  Zap, 
  Download, 
  Trash2, 
  Copy, 
  Eye, 
  Brain,
  MessageSquare,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader,
  PlusCircle,
  BookOpen,
  HelpCircle,
  Share2,
  Save
} from 'lucide-react';
import { scriptAnalyzerService } from '../services/scriptAnalyzerService';
import { useAuth } from '../contexts/AuthContext';

const ScriptAnalyzer = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('analyze');
  const [inputText, setInputText] = useState('');
  const [scriptTitle, setScriptTitle] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [savedScripts, setSavedScripts] = useState([]);
  const [selectedScript, setSelectedScript] = useState(null);
  const [showQuizMode, setShowQuizMode] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && activeTab === 'history') {
      loadUserScripts();
    }
  }, [user, activeTab]);

  const loadUserScripts = async () => {
    setLoading(true);
    try {
      const scripts = await scriptAnalyzerService.getUserScripts(user.id);
      setSavedScripts(scripts);
    } catch (error) {
      setError('Failed to load your scripts');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to analyze');
      return;
    }

    setAnalyzing(true);
    setError('');
    
    try {
      const analysis = await scriptAnalyzerService.analyzeScript(
        inputText, 
        scriptTitle || 'Untitled Script'
      );
      setCurrentAnalysis(analysis);
    } catch (error) {
      setError('Failed to analyze script. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveAnalysis = async () => {
    if (!currentAnalysis || !user) return;

    try {
      await scriptAnalyzerService.saveScriptAnalysis(
        currentAnalysis.title,
        inputText,
        currentAnalysis.summary,
        currentAnalysis.questions,
        user.id
      );
      
      setError('');
      alert('Analysis saved successfully!');
      if (activeTab === 'history') {
        loadUserScripts();
      }
    } catch (error) {
      setError('Failed to save analysis');
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setInputText(e.target.result);
        setScriptTitle(file.name.replace('.txt', ''));
      };
      reader.readAsText(file);
    } else {
      setError('Please upload a .txt file');
    }
  };

  const handleDeleteScript = async (scriptId) => {
    if (!confirm('Are you sure you want to delete this script?')) return;

    try {
      await scriptAnalyzerService.deleteScript(scriptId, user.id);
      setSavedScripts(prev => prev.filter(s => s.id !== scriptId));
    } catch (error) {
      setError('Failed to delete script');
    }
  };

  const startQuiz = (script) => {
    setSelectedScript(script);
    setCurrentQuestionIndex(0);
    setShowQuizMode(true);
  };

  const AnalyzeTab = () => (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="h-5 w-5 mr-2 text-blue-600" />
          Script Input
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Script Title (Optional)
            </label>
            <input
              type="text"
              value={scriptTitle}
              onChange={(e) => setScriptTitle(e.target.value)}
              placeholder="Enter a title for your script..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Script Content
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your recovery content, therapy notes, articles, or any text you'd like to analyze and generate questions from..."
              rows={12}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <div className="mt-2 text-sm text-gray-500">
              {inputText.length} characters, ~{Math.ceil(inputText.split(/\s+/).length)} words
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors">
              <Upload className="h-4 w-4 mr-2" />
              Upload .txt file
              <input
                type="file"
                accept=".txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              onClick={() => {
                setScriptTitle('Recovery Journey Article');
                setInputText(`Recovery is a deeply personal journey that requires commitment, support, and understanding. The process of overcoming addiction involves multiple stages, each presenting unique challenges and opportunities for growth.

In the early stages of recovery, individuals often struggle with withdrawal symptoms and intense cravings. This is when having a strong support system becomes crucial. Family members, friends, and counselors play vital roles in providing encouragement and accountability.

Therapy sessions help individuals understand the root causes of their addiction. Cognitive behavioral therapy (CBT) is particularly effective in helping people identify triggers and develop healthy coping strategies. Group therapy sessions also provide valuable peer support and shared experiences.

Relapse prevention is an ongoing process that requires constant vigilance and self-awareness. Developing healthy routines, maintaining social connections, and practicing mindfulness techniques are essential components of long-term sobriety.

The journey to recovery is not linear, and setbacks should be viewed as learning opportunities rather than failures. With proper treatment, support, and commitment, individuals can achieve lasting recovery and rebuild meaningful lives.`);
              }}
              className="flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
            >
              <FileText className="h-4 w-4 mr-2" />
              Demo Text
            </button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAnalyze}
              disabled={analyzing || !inputText.trim()}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {analyzing ? (
                <Loader className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Zap className="h-4 w-4 mr-2" />
              )}
              {analyzing ? 'Analyzing...' : 'Analyze Script'}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start"
        >
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="text-red-800 font-medium">Error</h4>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Analysis Results */}
      {currentAnalysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Summary Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Brain className="h-5 w-5 mr-2 text-purple-600" />
                AI Summary
              </h3>
              <div className="flex items-center gap-2">
                {user && (
                  <button
                    onClick={handleSaveAnalysis}
                    className="flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </button>
                )}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(currentAnalysis.summary);
                    alert('Summary copied to clipboard!');
                  }}
                  className="flex items-center px-3 py-1 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </button>
              </div>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-gray-800 leading-relaxed">{currentAnalysis.summary}</p>
            </div>

            <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">
              <span className="flex items-center">
                <BarChart3 className="h-4 w-4 mr-1" />
                {currentAnalysis.wordCount} words
              </span>
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {Math.ceil(currentAnalysis.wordCount / 200)} min read
              </span>
            </div>
          </div>

          {/* Questions Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <HelpCircle className="h-5 w-5 mr-2 text-green-600" />
                Generated Questions ({currentAnalysis.questions.length})
              </h3>
              <button
                onClick={() => {
                  const questionsText = currentAnalysis.questions.map((q, i) => `${i + 1}. ${q}`).join('\n');
                  navigator.clipboard.writeText(questionsText);
                  alert('Questions copied to clipboard!');
                }}
                className="flex items-center px-3 py-1 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy All
              </button>
            </div>

            <div className="space-y-3">
              {currentAnalysis.questions.map((question, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-gray-800 leading-relaxed">{question}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Usage Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="text-blue-900 font-semibold mb-3 flex items-center">
          <Brain className="h-5 w-5 mr-2" />
          How to Use This Tool
        </h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div className="space-y-2">
            <p>• <strong>Recovery Content:</strong> Analyze therapy notes, recovery articles, or treatment materials</p>
            <p>• <strong>Study Materials:</strong> Generate questions from educational content about addiction</p>
            <p>• <strong>Personal Journals:</strong> Summarize and create reflection questions from journal entries</p>
          </div>
          <div className="space-y-2">
            <p>• <strong>Group Materials:</strong> Process support group materials and meeting notes</p>
            <p>• <strong>Research Papers:</strong> Extract key insights from addiction research</p>
            <p>• <strong>Free AI:</strong> Uses Hugging Face models - completely free to use!</p>
          </div>
        </div>
      </div>
    </div>
  );

  const HistoryTab = () => (
    <div className="space-y-6">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : savedScripts.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Saved Scripts</h3>
          <p className="text-gray-600 mb-4">Start analyzing scripts to build your library</p>
          <button
            onClick={() => setActiveTab('analyze')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Analyze Your First Script
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {savedScripts.map((script) => (
            <motion.div
              key={script.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{script.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date(script.created_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center">
                      <BarChart3 className="h-4 w-4 mr-1" />
                      {script.word_count} words
                    </span>
                    <span className="flex items-center">
                      <HelpCircle className="h-4 w-4 mr-1" />
                      {script.generated_questions?.length || 0} questions
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm line-clamp-3">{script.summary}</p>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => setSelectedScript(script)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => startQuiz(script)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Quiz Mode"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => scriptAnalyzerService.exportToText(script)}
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    title="Export"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteScript(script.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🤖 AI Script Analyzer
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Free AI-powered script summarization and question generation using Hugging Face models. 
          Perfect for analyzing recovery content, therapy materials, and educational resources.
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="flex bg-gray-100 rounded-lg p-1">
          {[
            { id: 'analyze', label: 'Analyze Script', icon: Zap },
            { id: 'history', label: 'My Scripts', icon: BookOpen }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'analyze' && <AnalyzeTab />}
        {activeTab === 'history' && <HistoryTab />}
      </AnimatePresence>

      {/* Script Detail Modal */}
      {selectedScript && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">{selectedScript.title}</h2>
              <button
                onClick={() => setSelectedScript(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Summary</h3>
                <p className="text-gray-700 bg-purple-50 p-4 rounded-lg">{selectedScript.summary}</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Questions ({selectedScript.generated_questions?.length || 0})</h3>
                <div className="space-y-2">
                  {selectedScript.generated_questions?.map((q, i) => (
                    <div key={i} className="bg-green-50 p-3 rounded-lg">
                      <span className="font-medium text-green-700">{i + 1}.</span> {q.question_text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Quiz Mode Modal */}
      {showQuizMode && selectedScript && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full"
          >
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Quiz Mode</h2>
              <button
                onClick={() => setShowQuizMode(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Question {currentQuestionIndex + 1} of {selectedScript.generated_questions?.length || 0}</span>
                  <span>{Math.round(((currentQuestionIndex + 1) / (selectedScript.generated_questions?.length || 1)) * 100)}% Complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / (selectedScript.generated_questions?.length || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  {selectedScript.generated_questions?.[currentQuestionIndex]?.question_text}
                </h3>
                <p className="text-blue-700 text-sm">
                  Think about your answer, then click next to continue.
                </p>
              </div>
              
              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <button
                  onClick={() => {
                    if (currentQuestionIndex < (selectedScript.generated_questions?.length || 0) - 1) {
                      setCurrentQuestionIndex(currentQuestionIndex + 1);
                    } else {
                      setShowQuizMode(false);
                      alert('Quiz completed! Great job reviewing the material.');
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {currentQuestionIndex < (selectedScript.generated_questions?.length || 0) - 1 ? 'Next' : 'Finish'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ScriptAnalyzer;
