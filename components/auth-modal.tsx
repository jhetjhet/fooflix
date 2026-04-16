"use client";

import React, { useEffect, useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { loginAction, registerAction } from "@/app/actions/auth";

interface AuthModalProps {
  open: boolean;
  setIsLoading: (loading: boolean) => void;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, setIsLoading, onOpenChange }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  const [isLoginPending, startLoginTransition] = useTransition();

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError("");

    const formData = new FormData();

    formData.append("username", username);
    formData.append("password", password);

    if (isLogin) {
      startLoginTransition(async () => {
        const res = await loginAction(formData);

        if (!res.ok) {
          setError(res.error?.message || "Login failed");
        } else {
          // Reset form and close modal
          setEmail("");
          setUsername("");
          setPassword("");
          setConfirmPassword("");
          onOpenChange(false);
        }
      });
    } else {
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      formData.append("email", email);

      const res = await registerAction(formData);

      if (!res.ok) {
        if (res.error.fields) {
          setError(Object.values(res.error.fields)
            .flat()
            .join(" ") || "Registration failed");
        }
        else {
          setError(res.error?.message || "Registration failed");
        }
        return;
      }

      setShowSuccessBanner(true);

      setTimeout(() => {
        setShowSuccessBanner(false);
        toggleMode();
      }, 2000);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setEmail("");
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setShowSuccessBanner(false);
  };

  useEffect(() => {
    setIsLoading?.(isLoginPending);
  }, [isLoginPending]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {isLogin ? "Welcome Back" : "Create Account"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {isLogin
              ? "Sign in to your FooFlix account"
              : "Join FooFlix and start streaming"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
          {!isLogin && (
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required={!isLogin}
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label htmlFor="username" className="text-sm font-medium">
              Username
            </label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {!isLogin && (
            <div className="flex flex-col gap-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required={!isLogin}
              />
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          {showSuccessBanner && (
            <Alert className="bg-green-50 border-green-200 text-green-800">
              <AlertDescription>Registration successful!</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full mt-2">
            {isLogin ? "Sign In" : "Create Account"}
          </Button>
        </form>

        <div className="flex items-center justify-center gap-2 mt-4 text-sm">
          <span className="text-muted-foreground">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
          </span>
          <button
            type="button"
            onClick={toggleMode}
            className="text-primary font-medium hover:underline"
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
