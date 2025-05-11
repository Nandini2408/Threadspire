
import React from "react";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border py-8 px-4 md:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="font-playfair text-lg font-semibold">ThreadSpire</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            A calm, thoughtful digital environment for connected ideas and meaningful content.
          </p>
          <p className="text-sm text-muted-foreground italic">
            Where stories begin with a single spark
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-8 md:gap-4">
          <div>
            <h4 className="font-semibold mb-3">Navigate</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link></li>
              <li><Link to="/explore" className="text-muted-foreground hover:text-foreground transition-colors">Explore</Link></li>
              <li><Link to="/library" className="text-muted-foreground hover:text-foreground transition-colors">My Library</Link></li>
              <li><Link to="/create" className="text-muted-foreground hover:text-foreground transition-colors">Create</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">About</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">Our Mission</Link></li>
              <li><Link to="/guidelines" className="text-muted-foreground hover:text-foreground transition-colors">Community Guidelines</Link></li>
              <li><Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold mb-3">Join Our Newsletter</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Stay updated with thoughtful content and community news.
          </p>
          <form className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              placeholder="Your email address"
              className="px-3 py-2 bg-background border border-input rounded-md text-sm"
              required
            />
            <button
              type="submit"
              className="bg-threadspire-gold hover:bg-threadspire-gold/90 text-threadspire-navy font-medium py-2 px-4 rounded-md text-sm transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} <span className="inline-flex items-center"><Sparkles className="h-3 w-3 text-primary mr-1" /> ThreadSpire</span>. All rights reserved.
        </p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Twitter</a>
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Instagram</a>
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">LinkedIn</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
