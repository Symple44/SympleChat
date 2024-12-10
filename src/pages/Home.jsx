// src/pages/Home.jsx
import React from 'react';
import { MessageCircle } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <div className="flex justify-center mb-6">
            <MessageCircle className="w-16 h-16 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Assistant CM Manager
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Accédez instantanément à toute la documentation CM Manager
          </p>
          <a
            href="/chat"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            Lancer l'assistant
          </a>
        </div>
      </div>
    </div>
  );
};

export default Home;