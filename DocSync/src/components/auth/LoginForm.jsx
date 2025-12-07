import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginForm({
  roleLabel = "User",
  subtitle = "Sign in to continue.",
  redirectTo = "/loading",
}) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (isSubmitting) return;

      // TODO: replace this with real API call
      setIsSubmitting(true);
      setTimeout(() => {
        navigate(redirectTo);
      }, 800);
    },
    [isSubmitting, navigate, redirectTo]
  );

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-1">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center">
            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
          </span>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            className="pl-9"
            required
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center">
            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
          </span>
          <Input
            id="password"
            type="password"
            className="pl-9"
            required
          />
        </div>
      </div>

      <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </Button>

      <p className="text-[11px] text-muted-foreground text-center mt-1">
        You&apos;re accessing the <span className="font-medium">{roleLabel}</span>{" "}
        area of DocSync.
      </p>
    </form>
  );
}
