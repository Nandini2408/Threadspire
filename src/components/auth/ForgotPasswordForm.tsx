
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, ArrowLeft, Mail } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await forgotPassword(email);
      setIsSubmitted(true);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="w-full max-w-md space-y-6 p-6 bg-card rounded-lg shadow-sm border border-border">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-threadspire-gold/10 mb-4">
            <Mail className="h-6 w-6 text-threadspire-gold" />
          </div>
          <h1 className="text-2xl font-semibold font-playfair">Check your email</h1>
          <p className="text-muted-foreground mt-4">
            We've sent a password reset link to {email}. Check your inbox and follow the link to reset your password.
          </p>
        </div>
        
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Didn't receive an email? Check your spam folder or{" "}
            <button 
              onClick={() => setIsSubmitted(false)} 
              className="text-threadspire-gold hover:underline"
            >
              try again
            </button>
          </p>
          
          <Link to="/login" className="text-sm text-threadspire-navy flex items-center justify-center">
            <ArrowLeft size={16} className="mr-2" /> Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-6 p-6 bg-card rounded-lg shadow-sm border border-border">
      <div className="text-center">
        <h1 className="text-2xl font-semibold font-playfair">Reset Password</h1>
        <p className="text-muted-foreground mt-2">
          Enter your email address and we'll send you a link to reset your password
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
          {error}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-threadspire-gold/50"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-threadspire-navy hover:bg-threadspire-navy/90 text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-threadspire-navy"
        >
          {isSubmitting ? (
            <Loader2 className="h-5 w-5 animate-spin mx-auto" />
          ) : (
            "Send reset link"
          )}
        </button>
      </form>

      <div className="text-center text-sm">
        <Link to="/login" className="text-threadspire-gold hover:underline flex items-center justify-center">
          <ArrowLeft size={16} className="mr-2" /> Back to sign in
        </Link>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
