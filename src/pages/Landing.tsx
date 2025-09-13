import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router";
import { useMemo } from "react";
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

  // Parallax layers for subtle hotel visuals
  const parallax = useMemo(
    () => [
      { src: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1400&auto=format&fit=crop", className: "opacity-20 rotate-1" },
      { src: "https://images.unsplash.com/photo-1549880338-65ddcdfd017b?q=80&w=1400&auto=format&fit=crop", className: "opacity-25 -rotate-2" },
      { src: "https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?q=80&w=1400&auto=format&fit=crop", className: "opacity-20 rotate-3" },
    ],
    []
  );

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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* 3D Parallax Background */}
      <div className="absolute inset-0 pointer-events-none perspective-1000">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] rounded-full bg-primary/10 blur-3xl" />
        {parallax.map((l, i) => (
          <motion.img
            key={i}
            src={l.src}
            alt="luxury hotel"
            className={`absolute rounded-3xl shadow-2xl mix-blend-luminosity ${l.className}`}
            style={{
              width: i === 0 ? 520 : i === 1 ? 440 : 380,
              height: "auto",
              top: i === 0 ? 80 : i === 1 ? 320 : 160,
              left: i === 0 ? "8%" : i === 1 ? "68%" : "74%",
            }}
            initial={{ opacity: 0, y: 40, rotateX: -8, rotateY: 6, z: -50 }}
            whileInView={{ opacity: 0.35, y: 0, rotateX: 0, rotateY: 0, z: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.9, delay: i * 0.15 }}
          />
        ))}
      </div>

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
          <div className="grid lg:grid-cols-2 gap-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <Badge variant="outline" className="mb-2 neon-border">
                Award-Winning Luxury
              </Badge>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
                Experience
                <span className="block text-transparent bg-gradient-to-r from-primary via-blue-400 to-purple-400 bg-clip-text animate-glow">
                  Elevated Hospitality
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl">
                Seamless bookings, curated dining, serene stays, and impeccable service. 
                Crafted for premium hotels and resorts to delight every guest.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" onClick={handleGetStarted} className="neon-glow text-lg px-8">
                  {isAuthenticated ? "Go to Dashboard" : "Book Your Stay"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Explore Suites
                </Button>
              </div>
              <div className="flex items-center gap-6 pt-2 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  4.9/5 Guest Satisfaction
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Secure & Private
                </div>
              </div>
            </motion.div>

            {/* 3D Showcase Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="relative perspective-1000"
            >
              <div className="preserve-3d w-full h-full">
                <motion.div
                  whileHover={{ rotateX: 6, rotateY: -8, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 160, damping: 18 }}
                  className="rounded-2xl gradient-card border border-border/50 p-4 shadow-xl"
                >
                  <img
                    src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=1800&auto=format&fit=crop"
                    alt="Hotel Lobby"
                    className="rounded-xl object-cover w-full h-72 md:h-96"
                  />
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-semibold">Grand Atrium Lobby</div>
                      <Badge>5-Star</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Signature check-in, concierge, and lounge bar
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid with 3D tilt */}
      <section className="py-20 bg-card/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Tailored For Premium Hospitality
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From reservations to room service—everything to elevate every stay
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                whileHover={{ y: -4, rotateX: 2, rotateY: -2 }}
                className="perspective-1000"
              >
                <Card className="gradient-card border-border/50 h-full preserve-3d">
                  <CardContent className="p-6">
                    <feature.icon className={`h-12 w-12 ${feature.color} mb-4 float-slow`} />
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