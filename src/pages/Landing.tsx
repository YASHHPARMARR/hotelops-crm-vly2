import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useNavigate } from "react-router";
import { useMemo, useState, useEffect, useRef } from "react";
import { ArrowRight, Bed, Calendar, Car, Globe, Package, Shield, Star, UtensilsCrossed, Zap, Phone, Mail, MapPin } from "lucide-react";

const diningIcons = [
  { Icon: UtensilsCrossed, className: "top-10 left-10" },
  { Icon: Star, className: "top-20 right-16" },
  { Icon: Zap, className: "bottom-16 left-1/3" },
];

const particleSeeds = Array.from({ length: 28 }).map((_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  size: Math.random() * 4 + 2,
  delay: Math.random() * 5,
  duration: 8 + Math.random() * 8,
}));

const heroImages = [
  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=2000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1568495248636-6432b97bd949?q=80&w=2000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1560448075-bb4caa6c1f2c?q=80&w=2000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1551776235-dde6d4829808?q=80&w=2000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=2000&auto=format&fit=crop",
];

const features = [
  {
    icon: Bed,
    title: "Luxury Suites",
    description: "Spacious, elegant suites crafted for sheer indulgence",
    color: "text-amber-300",
  },
  {
    icon: UtensilsCrossed,
    title: "Fine Dining",
    description: "Award-winning culinary experiences & curated wine lists",
    color: "text-orange-300",
  },
  {
    icon: Star,
    title: "Spa & Wellness",
    description: "Holistic therapies, sauna, steam & infinity pool access",
    color: "text-yellow-300",
  },
  {
    icon: Globe,
    title: "Prime Locations",
    description: "Central addresses with breathtaking skyline views",
    color: "text-blue-300",
  },
  {
    icon: Car,
    title: "Airport Transfers",
    description: "Luxury chauffeur services & private pick-up/drop",
    color: "text-cyan-300",
  },
  {
    icon: Shield,
    title: "Private & Safe",
    description: "Discreet security with world-class safety standards",
    color: "text-red-300",
  },
  {
    icon: Calendar,
    title: "Flexible Stays",
    description: "Early check-in, late check-out & extended stays",
    color: "text-green-300",
  },
  {
    icon: Package,
    title: "Tailored Experiences",
    description: "Romance, family, business & wellness packages",
    color: "text-pink-300",
  },
];

const roles = [
  { name: "Spa & Wellness", description: "Signature rituals & therapies", users: "Daily" },
  { name: "Fine Dining", description: "Chefs' tasting menus & pairings", users: "7 Venues" },
  { name: "Business Lounge", description: "Executive lounge & meeting rooms", users: "24/7" },
  { name: "Events & Weddings", description: "Grand ballrooms & terrace lawns", users: "Year-round" },
  { name: "Chauffeur", description: "Mercedes & BMW fleet access", users: "On-Demand" },
  { name: "Family Friendly", description: "Kids' club & family suites", users: "All Ages" },
  { name: "Romantic Escapes", description: "Private dining & curated stays", users: "Couples" },
  { name: "Infinity Pool", description: "Sunset skyline swims", users: "Heated" },
  { name: "Art & Culture", description: "Curated city experiences", users: "Concierge" },
];

// New datasets for premium sections
const rooms = [
  { name: "Deluxe King", category: "Deluxe", price: 220, img: "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1600&auto=format&fit=crop" },
  { name: "Executive Suite", category: "Suite", price: 420, img: "https://images.unsplash.com/photo-1560184897-ae75f418493e?q=80&w=1600&auto=format&fit=crop" },
  { name: "Presidential Suite", category: "Presidential", price: 950, img: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1600&auto=format&fit=crop" },
  { name: "Deluxe Twin", category: "Deluxe", price: 210, img: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=1600&auto=format&fit=crop" },
  { name: "Skyline Suite", category: "Suite", price: 480, img: "https://images.unsplash.com/photo-1600585154154-1e47a7c97a25?q=80&w=1600&auto=format&fit=crop" },
  { name: "Royal Presidential", category: "Presidential", price: 1200, img: "https://images.unsplash.com/photo-1578898887932-dce23f1d39f8?q=80&w=1600&auto=format&fit=crop" },
];

const restaurants = [
  { name: "Ivory Grill", img: "https://images.unsplash.com/photo-1541542684-4a6485c0c8c5?q=80&w=1600&auto=format&fit=crop", tagline: "Chef's tasting menus, aged steaks & rare wines", rating: 5 },
  { name: "Lotus Bar", img: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=1600&auto=format&fit=crop", tagline: "Signature cocktails, DJ nights & skyline views", rating: 5 },
  { name: "Marble Cafe", img: "https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=1600&auto=format&fit=crop", tagline: "Artisanal brews, patisserie & brunch classics", rating: 4 },
];

const testimonials = [
  {
    name: "Amelia Rhodes",
    quote: "An unforgettable stay. Every detail felt handcrafted—world-class luxury.",
    img: "https://images.unsplash.com/photo-1550525811-e5869dd03032?q=80&w=800&auto=format&fit=crop",
    rating: 5,
  },
  {
    name: "Rafael Mendes",
    quote: "Dining was sublime, and the suite overlooked the city in golden light.",
    img: "https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=800&auto=format&fit=crop",
    rating: 5,
  },
  {
    name: "Priya Shah",
    quote: "The spa, the service, the elegance—this is luxury redefined.",
    img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop",
    rating: 5,
  },
];

const events = [
  { title: "Grand Ballroom Wedding", img: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1600&auto=format&fit=crop", desc: "Lavish ceremonies with bespoke decor & orchestration" },
  { title: "Sky Terrace Reception", img: "https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?q=80&w=1600&auto=format&fit=crop", desc: "Sunset cityscapes, gourmet menus & craft cocktails" },
  { title: "Executive Conference", img: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1600&auto=format&fit=crop", desc: "State-of-the-art AV, concierge coordination & privacy" },
];

const amenitiesData = [
  {
    label: "Spa & Wellness",
    img: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1600&auto=format&fit=crop",
    Icon: Star,
    blurb: "Holistic rituals, sauna & infinity pool access",
  },
  {
    label: "Infinity Pool",
    img: "https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?q=80&w=1600&auto=format&fit=crop",
    Icon: Zap,
    blurb: "Sunset skyline swims with loungers & cabanas",
  },
  {
    label: "Business Lounge",
    img: "https://images.unsplash.com/photo-1507209696998-3c532be9b2b1?q=80&w=1600&auto=format&fit=crop",
    Icon: Globe,
    blurb: "Private meeting rooms, concierge & barista",
  },
  {
    label: "Events & Weddings",
    img: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1600&auto=format&fit=crop",
    Icon: Shield,
    blurb: "Grand ballrooms, terrace lawns & planning",
  },
  {
    label: "Private Dining",
    img: "https://images.unsplash.com/photo-1514512364185-4c2b4e9b7d89?q=80&w=1600&auto=format&fit=crop",
    Icon: UtensilsCrossed,
    blurb: "Curated menus in candlelit alcoves",
  },
  {
    label: "Chauffeur",
    img: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1600&auto=format&fit=crop",
    Icon: Car,
    blurb: "On-demand luxury fleet & airport transfers",
  },
  {
    label: "Kids Club",
    img: "https://images.unsplash.com/photo-1529078155058-5d716f45d604?q=80&w=1600&auto=format&fit=crop",
    Icon: Star,
    blurb: "Creative playrooms & family-friendly stays",
  },
  {
    label: "Gym & Salon",
    img: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1600&auto=format&fit=crop",
    Icon: Shield,
    blurb: "Personal trainers, stylists & treatment suites",
  },
];

export default function Landing() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [roomFilter, setRoomFilter] = useState<"All" | "Deluxe" | "Suite" | "Presidential">("All");
  const filteredRooms = rooms.filter((r) => roomFilter === "All" ? true : r.category === roomFilter);

  const [heroIndex, setHeroIndex] = useState(0);

  // cycle hero images every 2s
  useEffect(() => {
    const id = setInterval(() => {
      setHeroIndex((i) => (i + 1) % heroImages.length);
    }, 2000);
    return () => clearInterval(id);
  }, []);

  const handleScrollToAbout = () => {
    const el = document.getElementById("about");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleScrollToRooms = () => {
    const el = document.getElementById("rooms");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  // Parallax layers for subtle hotel visuals
  const parallax = useMemo(
    () => [
      { src: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1400&auto=format&fit=crop", className: "opacity-20 rotate-1" },
      { src: "https://images.unsplash.com/photo-1549880338-65ddcdfd017b?q=80&w=1400&auto=format&fit=crop", className: "opacity-25 -rotate-2" },
      { src: "https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?q=80&w=1400&auto=format&fit=crop", className: "opacity-20 rotate-3" },
    ],
    []
  );

  const [showLoader, setShowLoader] = useState(true);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [clickRipple, setClickRipple] = useState<{ x: number; y: number; id: number }[]>([]);
  const rippleId = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setShowLoader(false), 1200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const id = rippleId.current++;
      setClickRipple((prev) => [...prev, { x: e.clientX, y: e.clientY, id }]);
      setTimeout(() => {
        setClickRipple((prev) => prev.filter((r) => r.id !== id));
      }, 600);
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    setMouse({ x: e.clientX, y: e.clientY });
  };

  // Helper for small parallax shift
  const px = (f: number) => (mouse.x - window.innerWidth / 2) * f;
  const py = (f: number) => (mouse.y - window.innerHeight / 2) * f;

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
    <motion.div
      className="min-h-screen bg-background relative overflow-hidden"
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Custom cursor & click ripples overlay */}
      <div className="pointer-events-none fixed inset-0 z-[9999]">
        <div
          className="custom-cursor"
          style={{ left: mouse.x - 8, top: mouse.y - 8 } as any}
        />
        {clickRipple.map((r) => (
          <span
            key={r.id}
            className="click-ripple"
            style={{ left: r.x - 12, top: r.y - 12 } as any}
          />
        ))}
      </div>

      {/* Loader: logo line-draw → doors open */}
      {showLoader && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black">
          <div className="relative">
            <svg width="160" height="160" viewBox="0 0 200 200" className="drop-shadow-[0_0_24px_#818cf8]">
              <defs>
                <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
              </defs>
              <circle cx="100" cy="100" r="70" fill="none" stroke="url(#g)" strokeWidth="3" className="stroke-dash-animate" />
              <path d="M70 120 L100 60 L130 120 Z" fill="none" stroke="url(#g)" strokeWidth="3" className="stroke-dash-animate" />
              <text x="50%" y="54%" textAnchor="middle" fill="#e5e7eb" fontSize="28" fontWeight="800" letterSpacing="2">GH</text>
            </svg>
            <div className="absolute inset-0 animate-doors" />
          </div>
        </div>
      )}

      {/* 3D Parallax Background (subtle indigo/violet aura + layered images) */}
      <div className="absolute inset-0 pointer-events-none perspective-1000">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] rounded-full bg-indigo-500/10 blur-3xl" />
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
              translateX: px(0.01 + i * 0.004),
              translateY: py(0.01 + i * 0.003),
            } as any}
            initial={{ opacity: 0, y: 40, rotateX: -8, rotateY: 6, z: -50 }}
            whileInView={{ opacity: 0.35, y: 0, rotateX: 0, rotateY: 0, z: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 1.2, delay: i * 0.18 }}
          />
        ))}
        {particleSeeds.map((p) => (
          <span
            key={p.id}
            className="particle"
            style={{
              left: p.left,
              width: p.size,
              height: p.size,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            } as any}
          />
        ))}
      </div>

      {/* Navigation */}
      <nav className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-500 shadow-[0_0_24px_rgba(99,102,241,0.35)]">
                <span className="text-black font-bold text-lg">H</span>
              </div>
              <span className="text-2xl font-bold text-foreground">Grand Horizon</span>
              <div className="hidden md:flex items-center gap-6 ml-8 text-sm text-muted-foreground">
                <a href="#about" className="hover:text-indigo-300 transition-colors">About</a>
                <a href="#rooms" className="hover:text-indigo-300 transition-colors">Rooms</a>
                <a href="#dining" className="hover:text-indigo-300 transition-colors">Dining</a>
                <a href="#amenities" className="hover:text-indigo-300 transition-colors">Amenities</a>
                <a href="#events" className="hover:text-indigo-300 transition-colors">Events</a>
                <a href="#virtual-tour" className="hover:text-indigo-300 transition-colors">Virtual Tour</a>
                <a href="#contact" className="hover:text-indigo-300 transition-colors">Contact</a>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
              {!isLoading && (
                <Button
                  onClick={handleGetStarted}
                  className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-[0_0_24px_rgba(99,102,241,0.35)] hover:shadow-[0_0_36px_rgba(139,92,246,0.45)]"
                >
                  Book Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-28 lg:py-40">
        {/* Background slideshow: big hero image crossfade */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          {heroImages.map((src, i) => (
            <img
              key={i}
              src={src}
              alt="Grand Horizon background"
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out"
              style={{ opacity: heroIndex === i ? 1 : 0 } as any}
            />
          ))}
        </div>
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/45" />
        {/* subtle gradient tint to keep blue–purple brand */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-transparent to-background/30" />

        {/* restore background design */}
        <div className="absolute inset-0 pointer-events-none bokeh-bg" />
        {/* lens flares */}
        <div className="pointer-events-none absolute -top-10 -left-10 w-80 h-80 rounded-full bg-indigo-400/10 blur-[80px]" />
        <div className="pointer-events-none absolute top-20 right-10 w-72 h-72 rounded-full bg-violet-400/10 blur-[72px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="flex flex-col items-center text-center gap-6"
          >
            <Badge variant="outline" className="border-indigo-400/50 text-indigo-300">
              Signature Stays
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-wide">
              Experience Luxury Redefined
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl">
              Welcome to Grand Horizon, where exceptional service meets unparalleled comfort in the heart of the city.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={handleScrollToRooms}
                className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-lg px-8 shadow-[0_0_30px_rgba(99,102,241,0.35)] hover:shadow-[0_0_40px_rgba(139,92,246,0.45)]"
              >
                Explore Rooms
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8" onClick={handleGetStarted}>
                Book Now
              </Button>
            </div>
            <div className="flex items-center gap-6 pt-2 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-indigo-300" />
                4.9/5 Guest Satisfaction
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-indigo-300" />
                Secure & Private
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About / Legacy */}
      <section id="about" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, rotateY: -15, y: 20 }}
            whileInView={{ opacity: 1, rotateY: 0, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55 }}
            className="relative w-full aspect-square rounded-3xl bg-gradient-to-br from-indigo-300/10 to-violet-500/10 border border-indigo-400/30 preserve-3d flex items-center justify-center"
          >
            <div className="absolute inset-6 rounded-2xl border border-amber-300/30" />
            <motion.div
              whileHover={{ rotateX: 8, rotateY: -8, scale: 1.03 }}
              className="w-40 h-40 rounded-full border-4 border-indigo-400/60 shadow-xl flex items-center justify-center animate-spin"
              style={{ animationDuration: "8s" } as any}
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-violet-400 shadow" />
            </motion.div>
            <video
              className="absolute -z-10 inset-0 w-full h-full object-cover rounded-3xl opacity-20"
              autoPlay muted loop playsInline
              src="https://videos.pexels.com/video-files/6077857/6077857-uhd_2560_1440_25fps.mp4"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="outline" className="neon-border-emerald mb-3">Our Legacy</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Our Legacy of Timeless Hospitality</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Where heritage meets modern luxury. Crafted experiences, refined service,
              and a century-inspired ethos—brought to life in blue–purple opulence.
            </p>
            <div className="flex gap-3">
              <Button onClick={handleGetStarted} className="neon-glow-emerald">Book Your Escape</Button>
              <Button variant="outline">Our Story</Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Luxury Rooms & Suites */}
      <section id="rooms" className="py-20 bg-card/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold">Rooms & Suites</h2>
              <p className="text-muted-foreground">Cinematic carousel with 3D flip reveals</p>
            </div>
            <div className="flex gap-2">
              {(["All", "Deluxe", "Suite", "Presidential"] as const).map((f) => (
                <Button key={f} variant={roomFilter === f ? "default" : "outline"} size="sm" onClick={() => setRoomFilter(f)}>
                  {f}
                </Button>
              ))}
            </div>
          </motion.div>

          {/* 3D rotating carousel using existing shadcn Carousel */}
          <Carousel className="w-full">
            <CarouselContent>
              {filteredRooms.map((room) => (
                <CarouselItem key={room.name} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <div className="relative h-80 preserve-3d group [transform-style:preserve-3d] [perspective:1200px]">
                      {/* Card container with depth hover */}
                      <div className="absolute inset-0 rounded-2xl border border-border/50 gradient-card transition-transform duration-700 ease-out transition-[transform,box-shadow,filter] will-change-transform hover:shadow-2xl hover:shadow-indigo-700/25 hover:ring-2 hover:ring-indigo-400/40 group-hover:-rotate-y-180 [transform-style:preserve-3d]">
                        {/* Front */}
                        <div className="absolute inset-0 backface-hidden overflow-hidden rounded-2xl">
                          <img src={room.img} alt={room.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                          <div className="absolute bottom-0 p-4 w-full flex items-center justify-between">
                            <div>
                              <div className="text-lg font-semibold">{room.name}</div>
                              <div className="text-sm text-muted-foreground">{room.category}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-indigo-300 font-semibold">${room.price}/night</div>
                              <Button
                                size="sm"
                                className="mt-2 bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-[0_0_18px_rgba(99,102,241,0.35)] hover:shadow-[0_0_24px_rgba(139,92,246,0.45)]"
                                onClick={handleGetStarted}
                              >
                                Book
                              </Button>
                            </div>
                          </div>
                        </div>
                        {/* Back */}
                        <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl p-4 flex flex-col justify-between bg-black/60 backdrop-blur border border-indigo-500/20">
                          <div>
                            <div className="text-lg font-semibold">{room.name}</div>
                            <div className="text-sm text-muted-foreground mb-3">Premium amenities, skyline view, curated minibar, butler-on-call.</div>
                            <div className="text-sm text-indigo-300">360° Preview</div>
                            <div className="mt-2 aspect-video rounded-lg overflow-hidden border border-indigo-500/20">
                              <iframe
                                className="w-full h-full"
                                src="https://sketchfab.com/models/11fa3ac64ef64cc0a6208e54d792f2d3/embed"
                                title="Room 360 preview"
                                allow="autoplay; fullscreen; xr-spatial-tracking"
                                allowFullScreen
                                frameBorder={0}
                                {...{
                                  mozallowfullscreen: "true",
                                  webkitallowfullscreen: "true",
                                  "xr-spatial-tracking": "",
                                  "execution-while-out-of-viewport": "",
                                  "execution-while-not-rendered": "",
                                  "web-share": "",
                                } as any}
                              />
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-indigo-300 font-semibold">${room.price}/night</div>
                            <Button
                              className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-[0_0_18px_rgba(99,102,241,0.35)] hover:shadow-[0_0_24px_rgba(139,92,246,0.45)]"
                              onClick={handleGetStarted}
                            >
                              Reserve
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </section>

      {/* SVG wave divider */}
      <div className="wave-divider">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="w-full h-[80px]">
          <path d="M0,64 C240,96 480,0 720,32 C960,64 1200,128 1440,64 L1440,120 L0,120 Z" className="fill-indigo-900/20" />
        </svg>
      </div>

      {/* Fine Dining Experience */}
      <section id="dining" className="py-20 relative">
        <video
          className="absolute inset-0 w-full h-full object-cover opacity-10 -z-10"
          autoPlay muted loop playsInline
          src="https://videos.pexels.com/video-files/8713531/8713531-uhd_2560_1440_25fps.mp4"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl md:text-4xl font-bold">Fine Dining Experience</h2>
            <p className="text-muted-foreground">Immersive gastronomy with live ambience, tilts and glow</p>
          </motion.div>

          {/* Elevated cinematic dining cards */}
          <Carousel className="w-full">
            <CarouselContent>
              {restaurants.map((r, idx) => (
                <CarouselItem key={r.name} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <motion.div
                      initial={{ opacity: 0, y: 28, scale: 0.98 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      viewport={{ once: true, amount: 0.3 }}
                      whileHover={{ rotateX: 3, rotateY: -3, scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 200, damping: 18, delay: idx * 0.03 }}
                      className="relative overflow-hidden rounded-2xl border border-indigo-500/30 gradient-card shadow-xl group preserve-3d"
                    >
                      {/* Glow ring behind */}
                      <div className="absolute -inset-24 rounded-full bg-indigo-500/10 blur-3xl group-hover:bg-indigo-500/20 transition-colors duration-500" />
                      {/* Main image with subtle ken-burns on hover */}
                      <div className="relative h-64 overflow-hidden">
                        <img
                          src={r.img}
                          alt={r.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        {/* Floating deco icon */}
                        <UtensilsCrossed className="absolute top-3 left-3 h-5 w-5 text-indigo-300 drop-shadow-[0_0_8px_#6366f1] opacity-90" />
                        {/* Chef's pick ribbon */}
                        <div className="absolute top-3 right-3 px-2 py-1 rounded-md text-xs bg-indigo-500/20 border border-indigo-500/30 text-indigo-200">
                          Chef's Pick
                        </div>
                      </div>

                      {/* Content */}
                      <div className="relative p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-lg font-semibold">{r.name}</div>
                            <div className="text-sm text-muted-foreground">{r.tagline}</div>
                          </div>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: r.rating }).map((_, i) => (
                              <Star key={i} className="h-4 w-4 text-indigo-300" />
                            ))}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-4 flex items-center justify-between">
                          <Button variant="outline" size="sm">
                            View Menu
                          </Button>
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-[0_0_18px_rgba(99,102,241,0.35)] hover:shadow-[0_0_24px_rgba(139,92,246,0.45)]"
                            onClick={handleGetStarted}
                          >
                            Reserve
                          </Button>
                        </div>
                      </div>

                      {/* Hover shimmer accent */}
                      <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="absolute -inset-12 bg-gradient-to-r from-indigo-500/0 via-indigo-500/20 to-indigo-500/0 blur-2xl rotate-12" />
                      </div>
                    </motion.div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
        <div className="pointer-events-none absolute inset-0 -z-0">
          {diningIcons.map(({ Icon, className }, i) => (
            <Icon key={i} className={`absolute ${className} text-indigo-300/60 animate-slow-float drop-shadow-[0_0_12px_#6366f1]`} />
          ))}
        </div>
      </section>

      {/* Amenities & Experiences */}
      <section id="amenities" className="py-20 bg-card/20 relative">
        <div className="absolute inset-0 -z-10 pointer-events-none aurora-bg" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold">Amenities & Experiences</h2>
            <p className="text-muted-foreground">Immersive, visual, and interactive — beyond just icons</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {amenitiesData.map((a, i) => (
              <motion.div
                key={a.label}
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: i * 0.04, duration: 0.7 }}
                whileHover={{ scale: 1.02 }}
                className="relative rounded-2xl overflow-hidden border border-indigo-500/30 gradient-card group"
              >
                {/* Background image */}
                <div className="absolute inset-0">
                  <img
                    src={a.img}
                    alt={a.label}
                    className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                </div>

                {/* Content */}
                <div className="relative p-5 h-48 flex flex-col justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl neon-glass border border-indigo-500/30 flex items-center justify-center">
                      <a.Icon className="h-5 w-5 text-indigo-300" />
                    </div>
                    <div className="font-semibold">{a.label}</div>
                  </div>
                  <div className="text-sm text-indigo-200/90 opacity-90 group-hover:opacity-100 transition-opacity duration-300">
                    {a.blurb}
                  </div>
                  <div className="flex items-center justify-between">
                    <Button variant="outline" size="sm">Explore</Button>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-[0_0_18px_rgba(99,102,241,0.35)] hover:shadow-[0_0_24px_rgba(139,92,246,0.45)]"
                      onClick={handleGetStarted}
                    >
                      Book
                    </Button>
                  </div>
                </div>

                {/* Ambient halo on hover */}
                <div className="pointer-events-none absolute -inset-20 rounded-full bg-indigo-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Events & Weddings */}
      <section id="events" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl md:text-4xl font-bold">Events & Weddings</h2>
            <p className="text-muted-foreground">Grand venues, curated menus, and a dedicated planner</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {events.map((ev, i) => (
              <motion.div
                key={ev.title}
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: i * 0.06 }}
                className="rounded-2xl overflow-hidden border border-indigo-500/30 gradient-card group"
              >
                <div className="relative h-64">
                  <img src={ev.img} alt={ev.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 p-4">
                    <div className="text-lg font-semibold">{ev.title}</div>
                    <div className="text-sm text-muted-foreground">{ev.desc}</div>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">Signature</Badge>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white"
                    onClick={handleGetStarted}
                  >
                    Plan Your Event
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Virtual Tour */}
      <section id="virtual-tour" className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold">Virtual Tour</h2>
            <p className="text-muted-foreground">Interactive 3D globe and lobby walkthrough</p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-6">
            <motion.div whileHover={{ scale: 1.01 }} className="rounded-2xl overflow-hidden border border-indigo-500/30 gradient-card aspect-video group">
              <iframe
                title="3D Tour A"
                className="w-full h-full transition-transform duration-500 group-hover:scale-[1.02]"
                src="https://sketchfab.com/models/11fa3ac64ef64cc0a6208e54d792f2d3/embed"
                allow="autoplay; fullscreen; xr-spatial-tracking"
                allowFullScreen
                frameBorder={0}
                {...{
                  mozallowfullscreen: "true",
                  webkitallowfullscreen: "true",
                  "xr-spatial-tracking": "",
                  "execution-while-out-of-viewport": "",
                  "execution-while-not-rendered": "",
                  "web-share": "",
                } as any}
              />
            </motion.div>
            <motion.div whileHover={{ scale: 1.01 }} className="rounded-2xl overflow-hidden border border-indigo-500/30 gradient-card aspect-video group">
              <iframe
                title="3D Tour B"
                className="w-full h-full transition-transform duration-500 group-hover:scale-[1.02]"
                src="https://sketchfab.com/models/11fa3ac64ef64cc0a6208e54d792f2d3/embed"
                allow="autoplay; fullscreen; xr-spatial-tracking"
                allowFullScreen
                frameBorder={0}
                {...{
                  mozallowfullscreen: "true",
                  webkitallowfullscreen: "true",
                  "xr-spatial-tracking": "",
                  "execution-while-out-of-viewport": "",
                  "execution-while-not-rendered": "",
                  "web-share": "",
                } as any}
              />
            </motion.div>
          </div>
          <div className="text-center mt-4">
            <Button
              className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-[0_0_24px_rgba(99,102,241,0.35)] hover:shadow-[0_0_36px_rgba(139,92,246,0.45)]"
              onClick={handleGetStarted}
            >
              Enter Virtual Tour
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-card/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl md:text-4xl font-bold">Guest Testimonials</h2>
            <p className="text-muted-foreground">Stories from unforgettable stays</p>
          </motion.div>

          <Carousel className="w-full">
            <CarouselContent>
              {testimonials.map((t) => (
                <CarouselItem key={t.name} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <motion.div
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 220, damping: 18 }}
                      className="rounded-2xl border border-indigo-500/30 gradient-card p-4 h-full"
                    >
                      <div className="flex items-center gap-3">
                        <img src={t.img} alt={t.name} className="h-12 w-12 rounded-full border border-indigo-500/40 object-cover" />
                        <div>
                          <div className="font-semibold">{t.name}</div>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: t.rating }).map((_, i) => (
                              <Star key={i} className="h-4 w-4 text-indigo-300" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground mt-3">{t.quote}</div>
                    </motion.div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </section>

      {/* Booking CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-4">
        <div className="mx-auto max-w-5xl neon-glass border-t border-indigo-500/20">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-3">
            <Input type="date" aria-label="Check-in" placeholder="Check-in" />
            <Input type="date" aria-label="Check-out" placeholder="Check-out" />
            <Input type="number" min={1} aria-label="Guests" placeholder="Guests" />
            <Input type="number" min={1} aria-label="Rooms" placeholder="Rooms" />
            <Button
              className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white ripple-btn shadow-[0_0_24px_rgba(99,102,241,0.35)] hover:shadow-[0_0_36px_rgba(139,92,246,0.45)]"
              onClick={handleGetStarted}
            >
              Check Availability
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer id="contact" className="border-t border-border/50 py-12 bg-card/20 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1525362081669-2b476bb628c3?q=80&w=1600&auto=format&fit=crop"
          alt="Black marble"
          className="absolute inset-0 w-full h-full object-cover opacity-10 -z-10"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">H</span>
                </div>
                <span className="text-xl font-bold text-foreground">Grand Horizon</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Where luxury meets cinematic hospitality in the heart of the city.
              </p>
            </div>
            <div>
              <div className="font-semibold mb-3">Explore</div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#rooms" className="hover:text-indigo-300">Rooms & Suites</a></li>
                <li><a href="#dining" className="hover:text-indigo-300">Fine Dining</a></li>
                <li><a href="#amenities" className="hover:text-indigo-300">Amenities</a></li>
                <li><a href="#events" className="hover:text-indigo-300">Events & Weddings</a></li>
                <li><a href="#virtual-tour" className="hover:text-indigo-300">Virtual Tour</a></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold mb-3">Guests</div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-indigo-300" /> +1 (555) 012-3456</li>
                <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-indigo-300" /> concierge@grandhorizon.com</li>
                <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-indigo-300" /> 100 Skyline Ave, Downtown</li>
              </ul>
            </div>
            <div>
              <div className="font-semibold mb-3">Contact</div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-indigo-300" /> +1 (555) 012-3456</li>
                <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-indigo-300" /> concierge@grandhorizon.com</li>
                <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-indigo-300" /> 100 Skyline Ave, Downtown</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">H</span>
              </div>
              <span className="text-xl font-bold text-foreground">Grand Horizon</span>
            </div>
            <div className="text-muted-foreground">
              © 2024 Grand Horizon Hotels. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}