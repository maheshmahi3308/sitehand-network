import { Construction, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <Construction className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">BuildConnect</span>
            </div>
            <p className="text-background/70 text-sm leading-relaxed">
              Connecting construction professionals and creating opportunities 
              in the building industry.
            </p>
            <div className="flex space-x-4 mt-4">
              <Facebook className="h-5 w-5 text-background/70 hover:text-primary cursor-pointer transition-colors" />
              <Twitter className="h-5 w-5 text-background/70 hover:text-primary cursor-pointer transition-colors" />
              <Instagram className="h-5 w-5 text-background/70 hover:text-primary cursor-pointer transition-colors" />
              <Linkedin className="h-5 w-5 text-background/70 hover:text-primary cursor-pointer transition-colors" />
            </div>
          </div>

          {/* For Workers */}
          <div>
            <h3 className="font-semibold mb-4">For Workers</h3>
            <ul className="space-y-2 text-sm text-background/70">
              <li><a href="#" className="hover:text-primary transition-colors">Find Jobs</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Create Profile</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Skill Verification</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Payment Protection</a></li>
            </ul>
          </div>

          {/* For Owners */}
          <div>
            <h3 className="font-semibold mb-4">For Owners</h3>
            <ul className="space-y-2 text-sm text-background/70">
              <li><a href="#" className="hover:text-primary transition-colors">Post Projects</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Find Workers</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Project Management</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Escrow Services</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-background/70">
              <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Safety Guidelines</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/20 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-background/70 text-sm">
            © 2024 BuildConnect. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-background/70 hover:text-primary text-sm transition-colors">Privacy Policy</a>
            <a href="#" className="text-background/70 hover:text-primary text-sm transition-colors">Terms of Service</a>
            <a href="#" className="text-background/70 hover:text-primary text-sm transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;