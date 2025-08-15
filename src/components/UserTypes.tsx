import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Hammer, 
  Building2, 
  Truck, 
  ArrowRight,
  MapPin,
  Star,
  Clock,
  Shield
} from "lucide-react";

const UserTypes = () => {
  const userTypes = [
    {
      title: "Workers",
      description: "Skilled professionals ready for your next project",
      icon: Hammer,
      color: "primary",
      features: [
        { icon: MapPin, text: "Location-based matching" },
        { icon: Star, text: "Skills & experience profiles" },
        { icon: Clock, text: "Real-time availability" },
        { icon: Shield, text: "Verified credentials" }
      ],
      buttonText: "Find Work",
      buttonVariant: "hero" as const
    },
    {
      title: "Project Owners",
      description: "Connect with the right talent and materials",
      icon: Building2,
      color: "secondary",
      features: [
        { icon: MapPin, text: "Find nearby workers" },
        { icon: Star, text: "Post job requirements" },
        { icon: Clock, text: "Milestone tracking" },
        { icon: Shield, text: "Secure escrow payments" }
      ],
      buttonText: "Post Project",
      buttonVariant: "construction" as const
    },
    {
      title: "Material Suppliers",
      description: "Streamlined ordering and delivery management",
      icon: Truck,
      color: "construction-safety",
      features: [
        { icon: MapPin, text: "Delivery optimization" },
        { icon: Star, text: "Inventory management" },
        { icon: Clock, text: "Order tracking" },
        { icon: Shield, text: "Quality assurance" }
      ],
      buttonText: "List Materials",
      buttonVariant: "secondary" as const
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Built for Every Role in Construction
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Whether you're a skilled worker, project owner, or material supplier, 
            our platform has the tools you need to succeed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {userTypes.map((type, index) => (
            <Card 
              key={index} 
              className="relative overflow-hidden group hover:shadow-card transition-all duration-300 transform hover:-translate-y-2 bg-gradient-card border-0"
            >
              <CardHeader className="text-center pb-6">
                <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <type.icon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold text-foreground mb-2">
                  {type.title}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {type.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {type.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center space-x-3">
                    <feature.icon className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">{feature.text}</span>
                  </div>
                ))}

                <Button 
                  variant={type.buttonVariant} 
                  className="w-full mt-6 group"
                >
                  {type.buttonText}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardContent>

              {/* Decorative gradient */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UserTypes;