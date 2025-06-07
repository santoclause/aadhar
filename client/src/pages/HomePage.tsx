import React from 'react';
import { useLocation } from 'wouter';
import { Vote, Shield, Users, ChevronRight } from 'lucide-react';

export default function HomePage() {
  const [, setLocation] = useLocation();

  const portals = [
    {
      title: 'Voter Portal',
      description: 'Cast your vote securely and verify your voting status',
      icon: Vote,
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700',
      path: '/voter',
    },
    {
      title: 'Admin Portal',
      description: 'Manage elections, candidates, and monitor voting progress',
      icon: Shield,
      color: 'from-green-500 to-green-600',
      hoverColor: 'hover:from-green-600 hover:to-green-700',
      path: '/admin',
    },
    {
      title: 'Public Portal',
      description: 'View election results and public information',
      icon: Users,
      color: 'from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700',
      path: '/public',
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6">
            <Vote className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Digital Voting System
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Secure, transparent, and accessible democratic participation for all citizens
          </p>
        </div>

        {/* Portal Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {portals.map((portal) => {
            const IconComponent = portal.icon;
            return (
              <div
                key={portal.title}
                onClick={() => setLocation(portal.path)}
                className={`
                  bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 
                  cursor-pointer transform hover:-translate-y-2 group
                `}
              >
                <div className="p-8">
                  <div className={`
                    inline-flex items-center justify-center w-16 h-16 rounded-xl mb-6
                    bg-gradient-to-br ${portal.color} ${portal.hoverColor} transition-all duration-300
                  `}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">
                    {portal.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {portal.description}
                  </p>
                  
                  <div className="flex items-center text-blue-600 font-semibold group-hover:text-blue-700 transition-colors">
                    <span>Access Portal</span>
                    <ChevronRight className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Features */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Why Choose Our Platform?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Secure</h3>
              <p className="text-gray-600">
                Advanced encryption and blockchain technology ensure vote integrity
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Accessible</h3>
              <p className="text-gray-600">
                User-friendly interface designed for all citizens
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
                <Vote className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Transparent</h3>
              <p className="text-gray-600">
                Real-time results and complete audit trail
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}