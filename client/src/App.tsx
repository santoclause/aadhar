import React, { useState, useEffect } from 'react';
import { Router, Route, Switch } from 'wouter';
import HomePage from './pages/HomePage';
import VoterPortal from './pages/VoterPortal';
import AdminPortal from './pages/AdminPortal';
import PublicPortal from './pages/PublicPortal';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from './components/ui/toaster';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/voter" component={VoterPortal} />
            <Route path="/admin" component={AdminPortal} />
            <Route path="/public" component={PublicPortal} />
            <Route>
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-800 mb-4">404 - Page Not Found</h1>
                  <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
                  <a href="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                    Go Home
                  </a>
                </div>
              </div>
            </Route>
          </Switch>
          <Toaster />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;