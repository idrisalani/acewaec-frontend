import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Target,
  Clock,
  Award,
  TrendingUp,
  Users,
  CheckCircle,
  Star,
  ArrowRight,
  Zap,
  Shield,
  BarChart3
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: BookOpen,
      title: 'Unlimited Practice',
      description: 'Access thousands of WAEC past questions across all subjects'
    },
    {
      icon: Target,
      title: 'Personalized Learning',
      description: 'AI-powered recommendations based on your performance'
    },
    {
      icon: Clock,
      title: 'Timed Sessions',
      description: 'Practice under real exam conditions with countdown timers'
    },
    {
      icon: BarChart3,
      title: 'Performance Analytics',
      description: 'Track your progress with detailed statistics and insights'
    },
    {
      icon: Award,
      title: '7-Day Mock Exam',
      description: 'Full WAEC simulation with certificate upon completion'
    },
    {
      icon: Users,
      title: 'Expert Tutors',
      description: 'Connect with qualified tutors for personalized support'
    }
  ];

  const testimonials = [
    {
      name: 'Chioma Okafor',
      category: 'Science',
      score: '95%',
      text: 'AceWAEC Pro helped me improve from 60% to 95% in just 3 months. The practice questions are exactly like the real exam!',
      image: null
    },
    {
      name: 'Ibrahim Yusuf',
      category: 'Commercial',
      score: '88%',
      text: 'The analytics feature showed me exactly where I was weak. Focused practice turned my weaknesses into strengths.',
      image: null
    },
    {
      name: 'Grace Adebayo',
      category: 'Art',
      score: '92%',
      text: 'The 7-day comprehensive exam prepared me perfectly. I felt so confident on exam day!',
      image: null
    }
  ];

  const stats = [
    { value: '50,000+', label: 'Students' },
    { value: '10,000+', label: 'Questions' },
    { value: '98%', label: 'Pass Rate' },
    { value: '15+', label: 'Subjects' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="text-white" size={24} />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                AceWAEC Pro
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/login')}
                className="text-gray-700 hover:text-indigo-600 font-medium transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-shadow font-medium"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 via-purple-50 to-white opacity-70"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Zap size={16} />
                <span>Trusted by 50,000+ Students</span>
              </div>
              <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Master Your
                <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  WAEC Journey
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Smart practice, detailed analytics, and expert guidance to help you excel in your WAEC examinations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/register')}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-lg hover:shadow-2xl transition-all font-semibold text-lg flex items-center justify-center gap-2 group"
                >
                  Start Free Trial
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                </button>
                <button
                  onClick={() => {
                    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="border-2 border-indigo-600 text-indigo-600 px-8 py-4 rounded-lg hover:bg-indigo-50 transition-colors font-semibold text-lg"
                >
                  Learn More
                </button>
              </div>
              <div className="flex items-center gap-8 mt-12">
                {stats.map((stat, idx) => (
                  <div key={idx}>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-3xl blur-3xl opacity-20 animate-pulse"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="text-green-500" size={24} />
                      <p className="text-gray-700">10,000+ Past WAEC Questions</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="text-green-500" size={24} />
                      <p className="text-gray-700">Smart Performance Analytics</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="text-green-500" size={24} />
                      <p className="text-gray-700">Expert Tutor Marketplace</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools and resources designed to help you ace your WAEC exams
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group p-6 bg-gradient-to-br from-white to-indigo-50 rounded-2xl border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="text-white" size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-b from-indigo-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">Simple steps to exam success</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Create Account', desc: 'Sign up and select your student category', icon: Users },
              { step: '2', title: 'Practice Smart', desc: 'Take timed practice tests and track your progress', icon: TrendingUp },
              { step: '3', title: 'Ace Your Exam', desc: 'Apply your knowledge and excel in WAEC', icon: Award }
            ].map((item, idx) => (
              <div key={idx} className="relative text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <item.icon className="text-white" size={32} />
                </div>
                <div className="absolute top-10 left-1/2 w-full h-0.5 bg-gradient-to-r from-indigo-200 to-purple-200 hidden md:block" style={{ transform: idx === 2 ? 'none' : 'translateX(50%)' }}></div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Student Success Stories
            </h2>
            <p className="text-xl text-gray-600">Real results from real students</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-white to-indigo-50 p-8 rounded-2xl shadow-lg border border-gray-100"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="text-yellow-400 fill-current" size={18} />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.category} • Score: {testimonial.score}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Shield className="mx-auto mb-6 text-white" size={64} />
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Ace Your WAEC Exams?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join thousands of students who have transformed their exam preparation with AceWAEC Pro
          </p>
          <button
            onClick={() => navigate('/register')}
            className="bg-white text-indigo-600 px-8 py-4 rounded-lg hover:shadow-2xl transition-all font-semibold text-lg inline-flex items-center gap-2 group"
          >
            Start Your Free Trial
            <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
          </button>
          <p className="text-indigo-100 mt-4 text-sm">No credit card required • Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="text-white" size={20} />
                </div>
                <span className="text-xl font-bold text-white">AceWAEC Pro</span>
              </div>
              <p className="text-sm">Master Your WAEC Journey with smart practice and analytics.</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => navigate('/register')} className="hover:text-white">Features</button></li>
                <li><button onClick={() => navigate('/register')} className="hover:text-white">Pricing</button></li>
                <li><button onClick={() => navigate('/login')} className="hover:text-white">Login</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">FAQs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2025 AceWAEC Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}