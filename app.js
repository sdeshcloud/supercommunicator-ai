const { useState, useEffect } = React;

// Fallback scenarios for testing in Claude.ai or when API is unavailable
const fallbackScenarios = [
  {
    id: 1,
    text: "During a virtual standup, your teammate Marcus says, 'I need to walk through the API authentication flow with someone. Can you help me understand the OAuth token refresh process? I keep getting 401 errors.'",
    correctType: "practical",
    explanation: "This is a request for technical information and problem-solving guidance. It requires a practical conversation with step-by-step technical details."
  },
  {
    id: 2,
    text: "Your colleague Jamie stops by your desk with a huge smile. 'Hey! I just heard you're a big fan of that new sci-fi series. What did you think of last night's episode? That plot twist was insane!'",
    correctType: "social",
    explanation: "This is casual social bonding over shared entertainment interests. It calls for a social conversation that strengthens workplace relationships through shared experiences."
  },
  {
    id: 3,
    text: "Your mentee sits down looking deflated. 'I just got feedback from the client presentation and they said my delivery was 'too technical.' I spent weeks preparing and I feel like I completely missed the mark. I don't know if I'm cut out for this role.'",
    correctType: "emotional",
    explanation: "Your mentee is expressing self-doubt and seeking emotional validation after disappointing feedback. This requires an emotional conversation with empathy and encouragement, not immediate solutions."
  },
  {
    id: 4,
    text: "In a project planning meeting, your product manager asks, 'What dependencies do we need to resolve before starting the mobile app development? I need a clear breakdown of technical requirements and timeline estimates.'",
    correctType: "practical",
    explanation: "This is a straightforward request for project planning information, technical requirements, and timeline data. It needs a practical conversation with organized, factual details."
  },
  {
    id: 5,
    text: "At the team lunch, your coworker Alex leans over and says, 'I noticed you have a photo of Yosemite on your desk! Have you done much hiking there? I'm planning a trip this summer and would love recommendations.'",
    correctType: "social",
    explanation: "This is friendly conversation building connection through shared outdoor interests and travel. It requires a social conversation that fosters rapport and camaraderie."
  },
  {
    id: 6,
    text: "During a retrospective, your team lead says, 'I've noticed tension between the frontend and backend teams. We need to identify the root causes and create an action plan to improve collaboration.'",
    correctType: "practical",
    explanation: "This is a problem-solving discussion requiring analysis of issues and concrete solutions. It needs a practical conversation focused on identifying problems and creating actionable steps."
  },
  {
    id: 7,
    text: "Your colleague stops by with coffee and says, 'Happy Friday! Did you see the office memo about the summer picnic? I'm thinking of organizing a volleyball team. Are you in?'",
    correctType: "social",
    explanation: "This is casual social interaction about workplace events and team activities. It requires a social conversation that builds camaraderie and community."
  },
  {
    id: 8,
    text: "Your direct report comes to your office and says quietly, 'I need to tell you something. My partner just got a job offer across the country and we're trying to figure out what to do. I love working here but I don't know if long-distance is sustainable. I'm really torn.'",
    correctType: "emotional",
    explanation: "Your report is sharing a personal dilemma involving conflicting priorities and seeking emotional support. This requires an emotional conversation with empathy and understanding, not problem-solving."
  }
];

const conversationTypes = [
  { id: "practical", label: "Practical/Information", color: "blue" },
  { id: "social", label: "Social", color: "green" },
  { id: "emotional", label: "Emotional", color: "purple" }
];

// SVG Icons
const CheckCircle = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const XCircle = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="15" y1="9" x2="9" y2="15"></line>
    <line x1="9" y1="9" x2="15" y2="15"></line>
  </svg>
);

const AlertCircle = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

const ArrowRight = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

const Sparkles = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 3l1.545 4.635L18.18 9.18l-4.635 1.545L12 15.36l-1.545-4.635L5.82 9.18l4.635-1.545L12 3z"></path>
  </svg>
);

const RefreshCw = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <polyline points="23 4 23 10 17 10"></polyline>
    <polyline points="1 20 1 14 7 14"></polyline>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
  </svg>
);

function SupercommunicatorTrainer() {
  const [scenarios, setScenarios] = useState([]);
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [selectedType, setSelectedType] = useState(null);
  const [userResponse, setUserResponse] = useState('');
  const [step, setStep] = useState('identify');
  const [identificationCorrect, setIdentificationCorrect] = useState(null);
  const [aiEvaluation, setAiEvaluation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generatingScenario, setGeneratingScenario] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState(null);
  const [useAI, setUseAI] = useState(true);

  const currentScenario = scenarios[currentScenarioIndex];

  useEffect(() => {
    generateNewScenario(true);
  }, []);

  const handleTypeSelection = () => {
    if (!currentScenario) return;
    const correct = selectedType === currentScenario.correctType;
    setIdentificationCorrect(correct);
    setStep('respond');
  };

  const generateNewScenario = async (isInitial = false) => {
    if (isInitial) {
      setInitializing(true);
    } else {
      setGeneratingScenario(true);
    }
    setError(null);

    try {
      let newScenario;
      
      if (useAI) {
        try {
          const response = await fetch('/.netlify/functions/generate-scenario', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            }
          });
          
          if (response.ok) {
            newScenario = await response.json();
          } else {
            throw new Error('Netlify function not available');
          }
        } catch (netlifyError) {
          console.log('Using fallback scenarios');
          setUseAI(false);
          const randomIndex = Math.floor(Math.random() * fallbackScenarios.length);
          newScenario = { ...fallbackScenarios[randomIndex] };
        }
      } else {
        const randomIndex = Math.floor(Math.random() * fallbackScenarios.length);
        newScenario = { ...fallbackScenarios[randomIndex] };
      }
      
      const scenarioWithId = {
        ...newScenario,
        id: scenarios.length + 1
      };
      
      setScenarios([...scenarios, scenarioWithId]);
      setCurrentScenarioIndex(scenarios.length);
      resetScenario();
    } catch (err) {
      setError('Failed to generate scenario. Please try again.');
      console.error('Generation error:', err);
    } finally {
      setGeneratingScenario(false);
      setInitializing(false);
    }
  };

  const evaluateResponse = async () => {
    if (!currentScenario) return;
    setLoading(true);
    setError(null);

    try {
      let evaluation;
      
      if (useAI) {
        try {
          const response = await fetch('/.netlify/functions/evaluate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              scenario: currentScenario.text,
              correctType: currentScenario.correctType,
              userResponse: userResponse
            })
          });
          
          if (response.ok) {
            evaluation = await response.json();
          } else {
            throw new Error('Netlify function not available');
          }
        } catch (netlifyError) {
          evaluation = {
            matches: true,
            feedback: "Your response has been recorded. Full AI evaluation is available when API is configured."
          };
        }
      } else {
        evaluation = {
          matches: true,
          feedback: "Your response has been recorded. Full AI evaluation is available when API is configured."
        };
      }

      setAiEvaluation(evaluation);
      setStep('results');
    } catch (err) {
      setError('Failed to evaluate response. Please try again.');
      console.error('Evaluation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const nextScenario = () => {
    if (currentScenarioIndex < scenarios.length - 1) {
      setCurrentScenarioIndex(currentScenarioIndex + 1);
      resetScenario();
    } else {
      generateNewScenario();
    }
  };

  const resetScenario = () => {
    setSelectedType(null);
    setUserResponse('');
    setStep('identify');
    setIdentificationCorrect(null);
    setAiEvaluation(null);
    setError(null);
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
          <RefreshCw size={48} className="animate-spin text-indigo-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Your Scenario</h2>
          <p className="text-gray-600">Preparing a workplace communication challenge...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Supercommunicator Training</h1>
              <p className="text-gray-600">Based on Charles Duhigg's "Supercommunicators"</p>
            </div>
            <button
              onClick={() => generateNewScenario()}
              disabled={generatingScenario}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {generatingScenario ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  New Scenario
                </>
              )}
            </button>
          </div>

          {!useAI && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
              <strong>Demo Mode:</strong> Using sample scenarios. AI generation will activate automatically when deployed with API key.
            </div>
          )}
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">
                Scenario {currentScenarioIndex + 1} of {scenarios.length}
              </span>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                {useAI ? 'AI Generated' : 'Sample Scenario'}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentScenarioIndex + 1) / scenarios.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-gray-50 border-l-4 border-indigo-500 p-6 mb-6 rounded">
            <p className="text-gray-800 leading-relaxed">{currentScenario?.text || 'Loading scenario...'}</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle />
              <span>{error}</span>
            </div>
          )}

          {step === 'identify' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Step 1: What type of conversation is this?
              </h2>
              <div className="space-y-3 mb-6">
                {conversationTypes.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`w-full p-4 rounded-lg border-2 transition-all ${
                      selectedType === type.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="font-medium text-gray-800">{type.label}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={handleTypeSelection}
                disabled={!selectedType || !currentScenario}
                className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                Continue <ArrowRight />
              </button>
            </div>
          )}

          {step === 'respond' && (
            <div>
              <div className={`mb-6 p-4 rounded-lg ${identificationCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-start gap-3">
                  {identificationCorrect ? (
                    <div className="text-green-600 flex-shrink-0 mt-1"><CheckCircle /></div>
                  ) : (
                    <div className="text-red-600 flex-shrink-0 mt-1"><XCircle /></div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">
                      {identificationCorrect ? 'Correct!' : 'Not quite.'}
                    </h3>
                    <p className="text-gray-700">{currentScenario.explanation}</p>
                  </div>
                </div>
              </div>

              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Step 2: How would you respond?
              </h2>
              <p className="text-gray-600 mb-4">
                Write your response using the <strong>{conversationTypes.find(t => t.id === currentScenario.correctType)?.label}</strong> conversation type:
              </p>
              <textarea
                value={userResponse}
                onChange={(e) => setUserResponse(e.target.value)}
                placeholder="Type your response here..."
                className="w-full h-32 p-4 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none resize-none"
              />
              <button
                onClick={evaluateResponse}
                disabled={!userResponse.trim() || loading}
                className="mt-4 w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? 'Evaluating...' : 'Evaluate My Response'} <ArrowRight />
              </button>
            </div>
          )}

          {step === 'results' && aiEvaluation && (
            <div>
              <div className={`mb-6 p-4 rounded-lg ${aiEvaluation.matches ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                <div className="flex items-start gap-3">
                  {aiEvaluation.matches ? (
                    <div className="text-green-600 flex-shrink-0 mt-1"><CheckCircle /></div>
                  ) : (
                    <div className="text-yellow-600 flex-shrink-0 mt-1"><AlertCircle /></div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">
                      {aiEvaluation.matches ? 'Great matching!' : 'Could be improved'}
                    </h3>
                    <p className="text-gray-700">{aiEvaluation.feedback}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">Your Response:</h3>
                <p className="text-gray-700 italic">"{userResponse}"</p>
              </div>

              <button
                onClick={nextScenario}
                disabled={generatingScenario}
                className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {generatingScenario ? (
                  <>
                    <RefreshCw className="animate-spin" />
                    Loading Next...
                  </>
                ) : (
                  <>
                    Next Scenario <ArrowRight />
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-gray-800 mb-2">The Three Conversation Types:</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li><strong className="text-blue-600">Practical/Information:</strong> Focus on facts, data, decisions, and problem-solving</li>
            <li><strong className="text-green-600">Social:</strong> Focus on building relationships, bonding, and connection</li>
            <li><strong className="text-purple-600">Emotional:</strong> Focus on feelings, empathy, and emotional validation</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

ReactDOM.render(<SupercommunicatorTrainer />, document.getElementById('root'));
