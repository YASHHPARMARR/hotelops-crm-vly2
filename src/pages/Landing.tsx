import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router";
import {
  Bed,
  Calendar,
  Shield,
  Wrench,
  Car,
  Package,
  UtensilsCrossed,
  Users,
  BarChart3,
  ArrowRight,
  CheckCircle,
  Star,
  Globe,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Smart Reservations",
    description: "AI-powered booking system with real-time availability and dynamic pricing",
    color: "text-blue-400",
  },
  {
    icon: Bed,
    title: "Room Management",
    description: "Comprehensive room status tracking with housekeeping integration",
    color: "text-green-400",
  },
  {
    icon: Users,
    title: "Guest Experience",
    description: "Personalized guest portal with concierge services and digital amenities",
    color: "text-purple-400",
  },
  {
    icon: UtensilsCrossed,
    title: "Restaurant POS",
    description: "Full-featured restaurant management with room service integration",
    color: "text-orange-400",
  },
  {
    icon: Shield,
    title: "Security & Safety",
    description: "Incident tracking, visitor management, and safety protocols",
    color: "text-red-400",
  },
  {
    icon: Wrench,
    title: "Maintenance Hub",
    description: "Preventive maintenance scheduling with asset management",
    color: "text-yellow-400",
  },
  {
    icon: Car,
    title: "Transport Services",
    description: "Fleet management with automated pickup/drop scheduling",
    color: "text-cyan-400",
  },
  {
    icon: Package,
    title: "Inventory Control",
    description: "Smart inventory tracking with automated reordering",
    color: "text-pink-400",
  },
];

const roles = [
  { name: "Admin", description: "Full system access", users: "1-5" },
  { name: "Front Desk", description: "Reservations & check-in", users: "5-15" },
  { name: "Housekeeping", description: "Room status & tasks", users: "10-30" },
  { name: "Restaurant", description: "Orders & menu", users: "5-20" },
  { name: "Security", description: "Incidents & badges", users: "3-10" },
  { name: "Maintenance", description: "Repairs & assets", users: "2-8" },
  { name: "Transport", description: "Vehicles & trips", users: "2-5" },
  { name: "Inventory", description: "Stock & suppliers", users: "1-3" },
  { name: "Guest", description: "Self-service portal", users: "Unlimited" },
];

export default function Landing() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isAuthenticated && user) {
      // Redirect based on user role
      switch (user.role) {
        case "admin":
          navigate("/admin");
          break;
        case "front_desk":
          navigate("/front-desk");
          break;
        case "housekeeping":
          navigate("/housekeeping");
          break;
        case "restaurant":
          navigate("/restaurant");
          break;
        case "security":
          navigate("/security");
          break;
        case "maintenance":
          navigate("/maintenance");
          break;
        case "transport":
          navigate("/transport");
          break;
        case "inventory":
          navigate("/inventory");
          break;
        case "guest":
          navigate("/guest");
          break;
        default:
          navigate("/auth");
      }
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/60 rounded-xl flex items-center justify-center neon-glow">
                <span className="text-primary-foreground font-bold text-lg">H</span>
              </div>
              <span className="text-2xl font-bold text-foreground">HotelOps</span>
              <Badge variant="secondary" className="ml-2">CRM</Badge>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              {!isLoading && (
                <Button onClick={handleGetStarted} className="neon-glow">
                  {isAuthenticated ? "Dashboard" : "Get Started"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-card/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge variant="outline" className="mb-6 neon-border">
                <Zap className="h-3 w-3 mr-1" />
                Next-Generation Hotel Management
              </Badge>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6">
                Complete Hotel
                <span className="block text-transparent bg-gradient-to-r from-primary via-blue-400 to-purple-400 bg-clip-text animate-glow">
                  Operations Suite
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                Streamline every aspect of your hotel operations with our comprehensive CRM platform. 
                From reservations to housekeeping, restaurant to maintenance - all in one powerful system.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={handleGetStarted} className="neon-glow text-lg px-8">
                  {isAuthenticated ? "Go to Dashboard" : "Start Free Trial"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Watch Demo
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-card/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Run Your Hotel
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive modules designed for modern hotel operations with role-based access control
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <Card className="gradient-card border-border/50 h-full">
                  <CardContent className="p-6">
                    <feature.icon className={`h-12 w-12 ${feature.color} mb-4`} />
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Role-Based Access */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Role-Based Access Control
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Secure, hierarchical permissions system designed for hotel operations
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.map((role, index) => (
              <motion.div
                key={role.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="gradient-card border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-foreground">
                        {role.name}
                      </h3>
                      <Badge variant="secondary">{role.users}</Badge>
                    </div>
                    <p className="text-muted-foreground">
                      {role.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-card/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { number: "500+", label: "Hotels Worldwide", icon: Globe },
              { number: "99.9%", label: "Uptime Guarantee", icon: CheckCircle },
              { number: "24/7", label: "Support Available", icon: Star },
              { number: "50+", label: "Integrations", icon: Zap },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <stat.icon className="h-8 w-8 text-primary mx-auto mb-4" />
                <div className="text-3xl font-bold text-foreground mb-2">
                  {stat.number}
                </div>
                <div className="text-muted-foreground">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Ready to Transform Your Hotel Operations?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join hundreds of hotels already using HotelOps to streamline their operations
            </p>
            <Button size="lg" onClick={handleGetStarted} className="neon-glow text-lg px-8">
              {isAuthenticated ? "Go to Dashboard" : "Start Your Free Trial"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 bg-card/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">H</span>
              </div>
              <span className="text-xl font-bold text-foreground">HotelOps</span>
            </div>
            <div className="text-muted-foreground">
              © 2024 HotelOps CRM. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}