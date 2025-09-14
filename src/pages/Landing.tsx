import { motion, useScroll, useTransform } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useNavigate } from "react-router";
import { useMemo, useState, useEffect, useRef } from "react";
import { ArrowRight, Bed, Calendar, Car, Globe, Package, Shield, Star, UtensilsCrossed, Zap } from "lucide-react";

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
  { name: "Ivory Grill", img: "https://images.unsplash.com/photo-1541542684-4a6485c0c8c5?q=80&w=1600&auto=format&fit=crop" },
  { name: "Lotus Bar", img: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=1600&auto=format&fit=crop" },
  { name: "Marble Cafe", img: "https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=1600&auto=format&fit=crop" },
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

export default function Landing() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [roomFilter, setRoomFilter] = useState<"All" | "Deluxe" | "Suite" | "Presidential">("All");
  const filteredRooms = rooms.filter((r) => roomFilter === "All" ? true : r.category === roomFilter);

  const handleScrollToAbout = () => {
    const el = document.getElementById("about");
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

  const { scrollYProgress } = useScroll();
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);
  const y = useTransform(scrollYProgress, [0, 1], [0, -120]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden" onMouseMove={handleMouseMove}>
      {/* Loader: logo line-draw → doors open */}
      {showLoader && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black">
          <div className="relative">
            <svg width="160" height="160" viewBox="0 0 200 200" className="drop-shadow-[0_0_24px_#34d399]">
              <defs>
                <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#fbbf24" />
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

      {/* Custom cursor + click ripples */}
      <div className="pointer-events-none fixed inset-0 z-[998]">
        <div
          className="custom-cursor"
          style={{ transform: `translate(${mouse.x - 8}px, ${mouse.y - 8}px)` }}
        />
        {clickRipple.map((r) => (
          <span
            key={r.id}
            className="click-ripple"
            style={{ left: r.x - 12, top: r.y - 12 }}
          />
        ))}
      </div>

      {/* 3D Parallax Background (subtle emerald aura + layered images) */}
      <div className="absolute inset-0 pointer-events-none perspective-1000">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] rounded-full bg-emerald-500/10 blur-3xl" />
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
            transition={{ duration: 0.9, delay: i * 0.15 }}
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

      {/* Navigation – emerald + gold accent */}
      <nav className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center neon-glow-emerald bg-gradient-to-br from-emerald-500 to-emerald-400">
                <span className="text-black font-bold text-lg">H</span>
              </div>
              <span className="text-2xl font-bold text-foreground">Grand Horizon</span>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
              {!isLoading && (
                <Button onClick={handleGetStarted} className="neon-glow-emerald">
                  Book Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section – cinematic parallax + glass booking form */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-card/10" />
        {/* lens flares */}
        <div className="pointer-events-none absolute -top-10 -left-10 w-80 h-80 rounded-full bg-emerald-400/10 blur-[80px]" />
        <div className="pointer-events-none absolute top-20 right-10 w-72 h-72 rounded-full bg-amber-300/10 blur-[72px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10">
            {/* Left: Cinematic heading */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-6">
              <Badge variant="outline" className="mb-2 neon-border-emerald">
                Emerald Luxury
              </Badge>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight tracking-wide">
                Where Luxury Meets
                <span className="block cinematic-streak">
                  Cinematic Hospitality
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl">
                Book immersive stays, savor fine dining, and explore curated experiences—crafted with emerald elegance and golden warmth.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" onClick={handleGetStarted} className="neon-glow-emerald text-lg px-8">
                  {isAuthenticated ? "Go to Dashboard" : "Book Now"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8" onClick={handleScrollToAbout}>
                  Explore Our World
                </Button>
              </div>
              <div className="flex items-center gap-6 pt-2 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-emerald-400" />
                  4.9/5 Guest Satisfaction
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-emerald-400" />
                  Secure & Private
                </div>
              </div>
            </motion.div>

            {/* Right: 3D showcase + glass booking form overlay */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.15 }} className="relative perspective-1000">
              <div className="preserve-3d w-full h-full">
                <motion.div
                  whileHover={{ rotateX: 6, rotateY: -8, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 160, damping: 18 }}
                  className="rounded-2xl gradient-card border border-border/50 p-4 shadow-xl"
                  style={{ translateX: px(0.015), translateY: py(0.01) } as any}
                >
                  <img
                    src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=1800&auto=format&fit=crop"
                    alt="Hotel Lobby"
                    className="rounded-xl object-cover w-full h-72 md:h-96"
                  />
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-semibold">Grand Atrium Lobby</div>
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">5-Star</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Signature check-in, concierge, and lounge bar
                    </div>
                  </div>
                </motion.div>

                {/* Glassmorphism booking form overlay */}
                <div className="absolute -bottom-6 left-6 right-6 md:left-auto md:right-0 md:w-[80%] neon-glass">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-4">
                    <Input type="date" aria-label="Check-in" placeholder="Check-in" />
                    <Input type="date" aria-label="Check-out" placeholder="Check-out" />
                    <Input type="number" min={1} aria-label="Guests" placeholder="Guests" />
                    <Input type="number" min={1} aria-label="Rooms" placeholder="Rooms" />
                    <Button className="neon-glow-emerald" onClick={handleGetStarted}>Search</Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About / Legacy */}
      <section id="about" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, rotateY: -15, y: 20 }}
            whileInView={{ opacity: 1, rotateY: 0, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative w-full aspect-square rounded-3xl bg-gradient-to-br from-amber-200/10 to-amber-500/10 border border-amber-400/20 preserve-3d flex items-center justify-center"
          >
            <div className="absolute inset-6 rounded-2xl border border-amber-300/30" />
            <motion.div
              whileHover={{ rotateX: 8, rotateY: -8, scale: 1.03 }}
              className="w-40 h-40 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 shadow-xl flex items-center justify-center text-3xl font-bold text-black"
            >
              GH
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
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="outline" className="neon-border-emerald mb-3">Our Legacy</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Grand Horizon Hotels</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Inspired by the timeless elegance of Taj and the modern sophistication of Hyatt,
              Grand Horizon blends heritage with innovation—delivering bespoke experiences and
              unrivaled hospitality at every turn.
            </p>
            <div className="flex gap-3">
              <Button onClick={handleGetStarted} className="neon-glow-emerald">Book Your Escape</Button>
              <Button variant="outline">Our Story</Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Luxury Rooms & Suites – 3D carousel + flip-on-hover */}
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
                      <div className="absolute inset-0 rounded-2xl border border-border/50 gradient-card transition-transform duration-500 group-hover:-rotate-y-180 [transform-style:preserve-3d]">
                        {/* Front */}
                        <div className="absolute inset-0 backface-hidden overflow-hidden rounded-2xl">
                          <img src={room.img} alt={room.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                          <div className="absolute bottom-0 p-4 w-full flex items-center justify-between">
                            <div>
                              <div className="text-lg font-semibold">{room.name}</div>
                              <div className="text-sm text-muted-foreground">{room.category}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-emerald-300 font-semibold">${room.price}/night</div>
                              <Button size="sm" className="mt-2 neon-glow-emerald" onClick={handleGetStarted}>Book</Button>
                            </div>
                          </div>
                        </div>
                        {/* Back */}
                        <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl p-4 flex flex-col justify-between bg-black/60 backdrop-blur border border-emerald-500/20">
                          <div>
                            <div className="text-lg font-semibold">{room.name}</div>
                            <div className="text-sm text-muted-foreground mb-3">Premium amenities, skyline view, curated minibar, butler-on-call.</div>
                            <div className="text-sm text-emerald-300">360° Preview</div>
                            <div className="mt-2 aspect-video rounded-lg overflow-hidden border border-emerald-500/20">
                              <iframe
                                className="w-full h-full"
                                src="https://sketchfab.com/models/7w7pAfK3LjjXNMTvEihQ7rC3q6d/embed"
                                title="Room 360 preview"
                                allow="autoplay; fullscreen; xr-spatial-tracking"
                                allowFullScreen
                              />
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-amber-300 font-semibold">${room.price}/night</div>
                            <Button className="neon-glow-emerald" onClick={handleGetStarted}>Reserve</Button>
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
          <path d="M0,64 C240,96 480,0 720,32 C960,64 1200,128 1440,64 L1440,120 L0,120 Z" className="fill-emerald-900/20" />
        </svg>
      </div>

      {/* Fine Dining Experience – video bg + floating icons */}
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
            className="text-center mb-10"
          >
            <h2 className="text-3xl md:text-4xl font-bold">Fine Dining Experience</h2>
            <p className="text-muted-foreground">Gourmet signatures with a modern twist</p>
          </motion.div>

          <Carousel className="w-full">
            <CarouselContent>
              {restaurants.map((r) => (
                <CarouselItem key={r.name} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <div className="rounded-2xl overflow-hidden border border-border/50 gradient-card">
                      <img src={r.img} alt={r.name} className="w-full h-64 object-cover" />
                      <div className="p-4 flex items-center justify-between">
                        <div className="text-lg font-semibold">{r.name}</div>
                        <Button size="sm" variant="outline">Reserve</Button>
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
        <div className="pointer-events-none absolute inset-0 -z-0">
          {diningIcons.map(({ Icon, className }, i) => (
            <Icon key={i} className={`absolute ${className} text-emerald-300/60 animate-slow-float drop-shadow-[0_0_12px_#34d399]`} />
          ))}
        </div>
      </section>

      {/* Amenities & Experiences – holographic glowing icons + aurora */}
      <section id="amenities" className="py-20 bg-card/20 relative">
        <div className="absolute inset-0 -z-10 pointer-events-none aurora-bg" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold">Amenities & Experiences</h2>
            <p className="text-muted-foreground">Spa, Wellness, Business Lounge, Events, and more</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[ "Spa", "Infinity Pool", "Wellness", "Business Lounge", "Events", "Safari", "Golf", "Kids Club", "Private Dining", "Chauffeur", "Gym", "Salon" ].map((a, i) => (
              <motion.div
                key={a}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="rounded-xl border border-emerald-500/30 p-4 text-center gradient-card hover:shadow-lg hover:scale-[1.03] transition-all hologram-card"
              >
                <div className="text-sm font-medium">{a}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Virtual Tour – 3D globe + smooth zoom */}
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
            <motion.div whileHover={{ scale: 1.01 }} className="rounded-2xl overflow-hidden border border-emerald-500/30 gradient-card aspect-video group">
              <iframe
                title="3D Globe"
                className="w-full h-full transition-transform duration-500 group-hover:scale-[1.02]"
                src="https://sketchfab.com/models/5c1b0a8f221b4c1a8dc25f861e9f952a/embed"
                allow="autoplay; fullscreen; xr-spatial-tracking"
                allowFullScreen
              />
            </motion.div>
            <motion.div whileHover={{ scale: 1.01 }} className="rounded-2xl overflow-hidden border border-emerald-500/30 gradient-card aspect-video group">
              <iframe
                title="Lobby 3D"
                className="w-full h-full transition-transform duration-500 group-hover:scale-[1.02]"
                src="https://sketchfab.com/models/7w7pAfK3LjjXNMTvEihQ7rC3q6d/embed"
                allow="autoplay; fullscreen; xr-spatial-tracking"
                allowFullScreen
              />
            </motion.div>
          </div>
          <div className="text-center mt-4">
            <Button className="neon-glow-emerald" onClick={handleGetStarted}>Enter Virtual Tour</Button>
          </div>
        </div>
      </section>

      {/* Guest Testimonials – hologram cards + bokeh */}
      <section id="testimonials" className="py-20 bg-card/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl md:text-4xl font-bold">Guest Testimonials</h2>
            <p className="text-muted-foreground">Stories etched in gold</p>
          </motion.div>

          <Carousel>
            <CarouselContent>
              {testimonials.map((t) => (
                <CarouselItem key={t.name} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-2">
                    <div className="rounded-2xl border border-border/50 gradient-card p-5 h-full flex flex-col">
                      <div className="flex items-center gap-3">
                        <img src={t.img} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                        <div>
                          <div className="font-semibold">{t.name}</div>
                          <div className="text-amber-300">{Array.from({ length: t.rating }).map((_, i) => "★").join("")}</div>
                        </div>
                      </div>
                      <div className="text-muted-foreground mt-3">" {t.quote} "</div>
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

      {/* Event & Wedding Showcase */}
      <section id="events" className="py-20 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=1600&auto=format&fit=crop"
          alt="Events"
          className="absolute inset-0 -z-10 w-full h-full object-cover opacity-20"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-3"
          >
            Where Moments Become Memories
          </motion.h2>
          <p className="text-muted-foreground mb-6">Grand celebrations, crafted to perfection</p>
          <Button variant="outline" className="neon-glow" onClick={handleGetStarted}>Plan Your Event</Button>
        </div>
      </section>

      {/* Booking CTA – sticky glass footer */}
      <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-4">
        <div className="mx-auto max-w-5xl neon-glass border-t border-emerald-500/20">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-3">
            <Input type="date" aria-label="Check-in" placeholder="Check-in" />
            <Input type="date" aria-label="Check-out" placeholder="Check-out" />
            <Input type="number" min={1} aria-label="Guests" placeholder="Guests" />
            <Input type="number" min={1} aria-label="Rooms" placeholder="Rooms" />
            <Button className="neon-glow-emerald ripple-btn" onClick={handleGetStarted}>Check Availability</Button>
          </div>
        </div>
      </div>

      {/* Footer – keep, aligns with theme */}
      <footer className="border-t border-border/50 py-12 bg-card/20 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1525362081669-2b476bb628c3?q=80&w=1600&auto=format&fit=crop"
          alt="Black marble"
          className="absolute inset-0 w-full h-full object-cover opacity-10 -z-10"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

      {/* Floating 3D emblem – already present; adjust color accents */}
      <motion.div
        className="fixed right-4 md:right-8 bottom-4 md:bottom-8 z-50 pointer-events-none"
        style={{ y, rotate, transformStyle: "preserve-3d" }}
      >
        <div className="relative w-20 h-28 md:w-24 md:h-32 rounded-2xl bg-gradient-to-br from-emerald-400 to-amber-400 shadow-2xl border border-white/20 will-change-transform">
          <div className="absolute inset-[6px] rounded-xl bg-black/20 backdrop-blur-sm border border-white/20" />
          <div className="absolute inset-0 flex items-center justify-center text-black font-extrabold tracking-wide">
            GH
          </div>
          <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-amber-300/80 blur-md" />
          <div className="absolute -bottom-3 -right-3 w-10 h-10 rounded-full bg-yellow-400/80 blur-lg" />
        </div>
      </motion.div>
    </div>
  );
}