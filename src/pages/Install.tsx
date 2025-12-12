import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Smartphone, 
  Share, 
  PlusSquare, 
  CheckCircle2, 
  Globe2, 
  Users, 
  MessageCircle, 
  Sparkles,
  Heart,
  Zap,
  ArrowRight,
  Apple,
  Chrome
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const Install = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("ios");

  const betaFeatures = [
    {
      icon: Globe2,
      title: "Feed",
      description: "Share updates, stories, and connect with diaspora professionals worldwide"
    },
    {
      icon: Users,
      title: "Connect",
      description: "Discover and build meaningful connections with fellow Africans in the diaspora"
    },
    {
      icon: Heart,
      title: "Convey",
      description: "Share your diaspora story and inspire others through powerful storytelling"
    },
    {
      icon: MessageCircle,
      title: "Messaging",
      description: "Direct conversations with your network, complete with rich media sharing"
    }
  ];

  const iosSteps = [
    {
      step: 1,
      icon: Chrome,
      title: "Open in Safari",
      description: "Make sure you're viewing this page in Safari browser (not Chrome or another browser)"
    },
    {
      step: 2,
      icon: Share,
      title: "Tap the Share Button",
      description: "Look for the share icon at the bottom of Safari (square with an arrow pointing up)"
    },
    {
      step: 3,
      icon: PlusSquare,
      title: "Add to Home Screen",
      description: "Scroll down and tap 'Add to Home Screen' — you may need to scroll to find it"
    },
    {
      step: 4,
      icon: CheckCircle2,
      title: "Confirm & Launch",
      description: "Tap 'Add' in the top right corner. Find the DNA icon on your home screen and tap to launch!"
    }
  ];

  const androidSteps = [
    {
      step: 1,
      icon: Chrome,
      title: "Open in Chrome",
      description: "Make sure you're viewing this page in Chrome browser for the best experience"
    },
    {
      step: 2,
      icon: Share,
      title: "Tap the Menu",
      description: "Tap the three dots (⋮) in the top right corner of Chrome"
    },
    {
      step: 3,
      icon: PlusSquare,
      title: "Install App or Add to Home",
      description: "Look for 'Install app' or 'Add to Home screen' in the menu"
    },
    {
      step: 4,
      icon: CheckCircle2,
      title: "Confirm & Launch",
      description: "Tap 'Install' or 'Add'. Find the DNA icon on your home screen and tap to launch!"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-background to-amber-950/30 overflow-x-hidden">
      {/* Hero Section */}
      <div className="relative">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 px-4 pt-12 pb-8 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          {/* Logo and Beta Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <img 
                src="/icons/icon-192.png" 
                alt="DNA Logo" 
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl shadow-2xl"
              />
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 px-4 py-1.5 text-sm font-semibold">
                <Sparkles className="w-4 h-4 mr-1.5 inline" />
                BETA LAUNCHING
              </Badge>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
              Diaspora Network of Africa
            </h1>
            
            <p className="text-lg sm:text-xl text-emerald-100/80 max-w-2xl mx-auto leading-relaxed">
              Join the movement connecting Africa's global diaspora for 
              <span className="text-amber-400 font-semibold"> meaningful impact</span> through 
              capacity building, venture development, and ecosystem building.
            </p>
          </motion.div>

          {/* Install CTA Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl mb-12">
              <CardContent className="p-6 sm:p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 mb-4 shadow-lg shadow-emerald-500/30">
                  <Smartphone className="w-8 h-8 text-white" />
                </div>
                
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                  Install DNA on Your Phone
                </h2>
                
                <p className="text-emerald-100/70 mb-6 max-w-lg mx-auto">
                  Get the full app experience! Add DNA to your home screen and access it instantly — 
                  no app store needed. It's fast, beautiful, and always up-to-date.
                </p>

                <div className="flex items-center justify-center gap-4 text-sm text-emerald-200/60 mb-6">
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-400" />
                    Instant Access
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    No Download
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Always Fresh
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Installation Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-12"
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10 mb-6">
                <TabsTrigger 
                  value="ios" 
                  className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60 gap-2"
                >
                  <Apple className="w-4 h-4" />
                  iPhone / iPad
                </TabsTrigger>
                <TabsTrigger 
                  value="android" 
                  className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60 gap-2"
                >
                  <Smartphone className="w-4 h-4" />
                  Android
                </TabsTrigger>
              </TabsList>

              <TabsContent value="ios" className="space-y-4">
                {iosSteps.map((step, index) => (
                  <motion.div
                    key={step.step}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                      <CardContent className="p-4 sm:p-5 flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/20">
                          {step.step}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                            <step.icon className="w-5 h-5 text-emerald-400" />
                            {step.title}
                          </h3>
                          <p className="text-emerald-100/70 text-sm sm:text-base">
                            {step.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </TabsContent>

              <TabsContent value="android" className="space-y-4">
                {androidSteps.map((step, index) => (
                  <motion.div
                    key={step.step}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                      <CardContent className="p-4 sm:p-5 flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold shadow-lg shadow-amber-500/20">
                          {step.step}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                            <step.icon className="w-5 h-5 text-amber-400" />
                            {step.title}
                          </h3>
                          <p className="text-emerald-100/70 text-sm sm:text-base">
                            {step.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* What's in Beta Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-12"
          >
            <div className="text-center mb-8">
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 mb-4">
                Coming in Beta
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                What You'll Experience
              </h2>
              <p className="text-emerald-100/70 max-w-lg mx-auto">
                Our beta launch includes powerful features designed to connect and empower 
                Africa's diaspora community.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {betaFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                >
                  <Card className="bg-white/5 border-white/10 h-full hover:bg-white/10 transition-all duration-300 hover:scale-[1.02]">
                    <CardContent className="p-5">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-amber-500/20 flex items-center justify-center mb-4">
                        <feature.icon className="w-6 h-6 text-emerald-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-emerald-100/60 text-sm">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* About DNA Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-12"
          >
            <Card className="bg-gradient-to-br from-emerald-900/40 to-amber-900/20 border-emerald-500/20">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Heart className="w-6 h-6 text-amber-400" />
                  About DNA
                </h2>
                <div className="space-y-4 text-emerald-100/80">
                  <p>
                    <strong className="text-white">Diaspora Network of Africa (DNA)</strong> is a 
                    movement dedicated to uniting Africa's global diaspora — the millions of Africans 
                    and people of African descent living around the world.
                  </p>
                  <p>
                    We believe that by connecting our scattered strength, we can drive unprecedented 
                    change across the continent. Through <strong className="text-emerald-400">capacity building</strong>, 
                    <strong className="text-amber-400"> venture development</strong>, and 
                    <strong className="text-emerald-400"> ecosystem building</strong>, we're creating 
                    pathways for meaningful impact.
                  </p>
                  <p>
                    Whether you're a professional, entrepreneur, student, or simply passionate about 
                    Africa's future — there's a place for you here. Join us in building bridges 
                    across oceans and generations.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="text-center pb-12"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
              Ready to Join the Movement?
            </h2>
            <p className="text-emerald-100/70 mb-6 max-w-md mx-auto">
              Install the app using the instructions above, or continue in your browser.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button 
                size="lg"
                onClick={() => navigate("/auth")}
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-lg shadow-emerald-500/30 gap-2"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => navigate("/")}
                className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 gap-2"
              >
                Learn More
              </Button>
            </div>

            <p className="text-emerald-200/40 text-sm mt-8">
              © {new Date().getFullYear()} Diaspora Network of Africa. All rights reserved.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Install;
