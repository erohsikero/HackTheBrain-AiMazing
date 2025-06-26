import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Clock, Users, Brain, CheckCircle, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const ImpactAnalytics = () => {
  const navigate = useNavigate();

  // Simulated data showing the impact of AI implementation
  const waitTimeData = [
    { month: 'Jan', beforeAI: 45, afterAI: 32 },
    { month: 'Feb', beforeAI: 48, afterAI: 30 },
    { month: 'Mar', beforeAI: 52, afterAI: 28 },
    { month: 'Apr', beforeAI: 47, afterAI: 25 },
    { month: 'May', beforeAI: 50, afterAI: 22 },
    { month: 'Jun', beforeAI: 46, afterAI: 20 }
  ];

  const triageData = [
    { priority: 'Emergency', count: 15, color: '#ef4444' },
    { priority: 'High', count: 32, color: '#f97316' },
    { priority: 'Medium', count: 48, color: '#eab308' },
    { priority: 'Low', count: 65, color: '#22c55e' }
  ];

  const efficiencyMetrics = [
    { metric: 'Admin Time Saved', value: '18%', icon: Clock, color: 'text-blue-600' },
    { metric: 'Patient Satisfaction', value: '94%', icon: Users, color: 'text-green-600' },
    { metric: 'No-Show Reduction', value: '23%', icon: CheckCircle, color: 'text-purple-600' },
    { metric: 'Emergency Detection', value: '98%', icon: AlertTriangle, color: 'text-red-600' }
  ];

  const monthlyPatients = [
    { month: 'Jan', patients: 320 },
    { month: 'Feb', patients: 345 },
    { month: 'Mar', patients: 380 },
    { month: 'Apr', patients: 420 },
    { month: 'May', patients: 465 },
    { month: 'Jun', patients: 510 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="mr-4 p-2 rounded-full hover:bg-white hover:shadow-md transition-all duration-200"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">AI Impact Analytics</h1>
            <p className="text-gray-600">Demonstrating the transformative power of AI in healthcare access</p>
          </div>
        </div>

        {/* Key Impact Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {efficiencyMetrics.map((metric, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center`}>
                  <metric.icon className={`w-6 h-6 ${metric.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{metric.metric}</p>
                  <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Wait Time Reduction Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-2 mb-6">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-800">Wait Time Reduction</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={waitTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="beforeAI" fill="#ef4444" name="Before AI" />
                <Bar dataKey="afterAI" fill="#22c55e" name="After AI" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-green-600">36% average reduction</span> in wait times since AI implementation
              </p>
            </div>
          </div>

          {/* AI Triage Distribution */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Brain className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-800">AI Triage Distribution</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={triageData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ priority, count }) => `${priority}: ${count}`}
                >
                  {triageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-purple-600">160 patients</span> triaged by AI this month
              </p>
            </div>
          </div>
        </div>

        {/* Patient Volume Growth */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center space-x-2 mb-6">
            <Users className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-bold text-gray-800">Patient Volume Growth</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyPatients}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis label={{ value: 'Patients', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="patients" 
                stroke="#22c55e" 
                strokeWidth={3}
                dot={{ fill: '#22c55e', strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-green-600">59% increase</span> in patient capacity since implementing AI systems
            </p>
          </div>
        </div>

        {/* Impact Summary */}
        <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-xl shadow-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-6">Transformative Impact Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">2,840</div>
              <p className="text-blue-100">Patients served faster</p>
              <p className="text-sm text-blue-200 mt-1">Due to reduced wait times</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">156</div>
              <p className="text-blue-100">Hours saved weekly</p>
              <p className="text-sm text-blue-200 mt-1">In administrative tasks</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">98%</div>
              <p className="text-blue-100">Emergency detection rate</p>
              <p className="text-sm text-blue-200 mt-1">Critical cases identified immediately</p>
            </div>
          </div>
          
          <div className="mt-8 p-6 bg-white bg-opacity-10 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Key Achievements</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-300" />
                <span>Reduced median wait time from 47 minutes to 26 minutes (45% improvement)</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-300" />
                <span>Increased patient satisfaction scores from 78% to 94%</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-300" />
                <span>Automated triage correctly prioritized 98% of emergency cases</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-300" />
                <span>Reduced no-show rates by 23% through intelligent patient engagement</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-300" />
                <span>Enabled 59% increase in patient capacity without additional staff</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Future Projections */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Projected Impact at Scale</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">If deployed across Canada's healthcare system:</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <span><strong>2.8 million patients</strong> could receive care weeks or months earlier annually</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <span><strong>15,600 hours</strong> of administrative time saved daily across all clinics</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                  <span><strong>98% accuracy</strong> in identifying critical cases requiring immediate attention</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-orange-600 rounded-full mt-2"></div>
                  <span><strong>$2.4 billion</strong> in healthcare system efficiency gains over 5 years</span>
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Vision for the Future</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                This AI-powered healthcare access optimizer represents a paradigm shift from reactive to proactive healthcare delivery. 
                By demonstrating that intelligent systems can dramatically reduce wait times while ensuring the sickest patients receive 
                priority care, we're paving the way for a future where "waiting your turn" for healthcare is measured in days, not months.
              </p>
              <div className="mt-4 p-3 bg-white rounded border-l-4 border-blue-600">
                <p className="text-sm font-medium text-blue-800">
                  "Moving us toward a future where waiting your turn for care is measured in days, not months."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImpactAnalytics;