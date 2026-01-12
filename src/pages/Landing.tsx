import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Shield, TrendingUp, Zap, Lock, ArrowRight } from 'lucide-react';
import { AuthModal } from '@/components/auth/AuthModal';

export default function Landing() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      {/* Blurred Background Content - Fixed position to prevent scrolling */}
      <div className="absolute inset-0 overflow-hidden filter blur-md pointer-events-none select-none">
        <Layout>
          {/* Hero Section */}
          <section className="relative overflow-hidden">
            <div
              className="absolute inset-0 pointer-events-none bg-gradient-to-br from-primary/10 via-transparent to-transparent"
              aria-hidden="true"
            />
            <div className="container mx-auto px-4 py-24 lg:py-32">
              <div className="max-w-4xl mx-auto text-center space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-background shadow-sm text-sm">
                  <Zap className="h-4 w-4 text-primary" />
                  <span>Powered by Prediction Markets</span>
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                  Hedge Against{' '}
                  <span className="text-gradient">Real-World Risks</span>
                </h1>
                
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Use prediction markets to protect yourself and your business from uncertain outcomes. 
                  From weather to elections, we help you recover risk.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="gap-2 shadow-lg" asChild>
                    <span>Get Started</span>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-24 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold mb-4">Why Choose Hedge?</h2>
                <p className="text-muted-foreground max-w-xl mx-auto">
                  We combine AI-powered insights with prediction markets to give you unprecedented risk management capabilities.
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <div className="bg-background rounded-xl p-8 space-y-4 border border-border shadow-sm">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Risk Protection</h3>
                  <p className="text-muted-foreground">
                    Identify and hedge against potential risks before they impact your bottom line.
                  </p>
                </div>
                
                <div className="bg-background rounded-xl p-8 space-y-4 border border-border shadow-sm">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Market Insights</h3>
                  <p className="text-muted-foreground">
                    Access real-time prediction market data to make informed hedging decisions.
                  </p>
                </div>
                
                <div className="bg-background rounded-xl p-8 space-y-4 border border-border shadow-sm">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Lock className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Secure & Private</h3>
                  <p className="text-muted-foreground">
                    Your data and strategies are protected with enterprise-grade security.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </Layout>
      </div>

      {/* Auth Overlay */}
      <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-background/20 backdrop-blur-sm">
        <AuthModal />
      </div>
    </div>
  );
}
