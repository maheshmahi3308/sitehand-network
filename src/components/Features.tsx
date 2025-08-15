import { 
  MapPin, 
  CreditCard, 
  MessageCircle, 
  Star, 
  Shield, 
  Truck,
  Zap,
  Users
} from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: MapPin,
      title: "Real-Time Location Matching",
      description: "Find nearby workers and suppliers instantly with our advanced GPS-based matching system.",
      gradient: "from-primary to-blue-600"
    },
    {
      icon: CreditCard,
      title: "Secure Escrow Payments",
      description: "Milestone-based payments with built-in escrow protection for all parties involved.",
      gradient: "from-secondary to-orange-600"
    },
    {
      icon: MessageCircle,
      title: "In-App Communication",
      description: "Built-in chat and notification system to keep all stakeholders connected and informed.",
      gradient: "from-construction-safety to-yellow-500"
    },
    {
      icon: Star,
      title: "Ratings & Reviews",
      description: "Comprehensive review system ensuring quality and trust across the platform.",
      gradient: "from-primary to-purple-600"
    },
    {
      icon: Shield,
      title: "Verified Profiles",
      description: "All workers and suppliers are verified with credentials and background checks.",
      gradient: "from-green-500 to-emerald-600"
    },
    {
      icon: Truck,
      title: "Material Delivery Tracking",
      description: "Real-time tracking of material orders with estimated delivery times and updates.",
      gradient: "from-secondary to-red-500"
    },
    {
      icon: Zap,
      title: "Instant Bidding",
      description: "Fast project bidding system with automatic skill-based worker recommendations.",
      gradient: "from-primary to-indigo-600"
    },
    {
      icon: Users,
      title: "Team Management",
      description: "Organize teams, assign roles, and manage multiple projects from one dashboard.",
      gradient: "from-construction-steel to-slate-600"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Powerful Features for Modern Construction
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to streamline your construction projects and build lasting partnerships.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group p-6 rounded-2xl bg-gradient-card hover:shadow-card transition-all duration-300 transform hover:-translate-y-1 border border-border/50"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.gradient} p-3 mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              
              <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;