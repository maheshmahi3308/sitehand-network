import { Button } from "@/components/ui/button";
import { Construction, Menu } from "lucide-react";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Construction className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-foreground">BuildConnect</span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#workers" className="text-muted-foreground hover:text-foreground transition-colors">
            For Workers
          </a>
          <a href="#owners" className="text-muted-foreground hover:text-foreground transition-colors">
            For Owners
          </a>
          <a href="#suppliers" className="text-muted-foreground hover:text-foreground transition-colors">
            For Suppliers
          </a>
          <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
            About
          </a>
        </nav>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" className="hidden md:inline-flex">
            Log In
          </Button>
          <Button variant="hero" size="sm">
            Get Started
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;