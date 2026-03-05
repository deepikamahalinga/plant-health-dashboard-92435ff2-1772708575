import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const stats: Array<{ label: string; value: string }> = [
    { label: 'Active Users', value: '1,000+' },
    { label: 'Plants Monitored', value: '50,000+' },
    { label: 'Data Points', value: '1M+' },
  ];

  const features: Array<{ title: string; description: string; icon: string }> = [
    {
      title: 'Real-time Monitoring',
      description: 'Track soil conditions and plant health metrics in real-time',
      icon: '📊'
    },
    {
      title: 'Data Analytics',
      description: 'Advanced analytics and insights for better decision making',
      icon: '📈'
    },
    {
      title: 'Smart Alerts',
      description: 'Receive notifications when attention is needed',
      icon: '🔔'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-32">
        <motion.div 
          className="text-center"
          initial="initial"
          animate="animate"
          variants={fadeIn}
        >
          <h1 className="text-5xl md:text-6xl font-bold text-green-800 mb-6">
            Plant Health Dashboard
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Empower your farming with data-driven insights. Monitor, analyze, and optimize your plant health in real-time.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/dashboard" className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors duration-300">
              Get Started
            </Link>
            <Link to="/demo" className="bg-white text-green-600 border-2 border-green-600 px-8 py-3 rounded-lg hover:bg-green-50 transition-colors duration-300">
              View Demo
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="bg-green-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
              >
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-green-200">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-16">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-shadow duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Entity Section */}
      <section className="py-20 bg-green-50">
        <div className="container mx-auto px-4">
          <motion.div
            className="p-8 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow duration-300"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="text-5xl mb-4">🌱</div>
            <h3 className="text-2xl font-bold mb-4 text-gray-800">Plants</h3>
            <p className="text-gray-600 mb-6">
              Monitor and track individual plant health metrics, growth patterns, and environmental conditions.
            </p>
            <Link
              to="/plants"
              className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors duration-300"
            >
              View Plants
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;