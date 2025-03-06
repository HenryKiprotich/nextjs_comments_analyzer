"use client"; 

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// ✅ Define validation schema for Sign Up
const signUpSchema = z.object({
  email: z.string().email("Invalid email"), // Ensure email is valid
  password: z.string().min(6, "Password must be at least 6 characters"), // Minimum password length
  confirmPassword: z.string().min(6, "Confirm your password"), // Confirm password field
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match", // Ensure passwords match
  path: ["confirmPassword"],
});

// ✅ Define validation schema for Sign In
const signInSchema = z.object({
  email: z.string().email("Invalid email"), // Ensure email is valid
  password: z.string().min(6, "Password must be at least 6 characters"), // Minimum password length
});

// ✅ Define the form values type
type AuthFormValues = { email: string; password: string } & Partial<{ confirmPassword: string }>;

const AuthForm = () => {
  const [isSignUp, setIsSignUp] = useState(false); // State to toggle between Sign In and Sign Up
  const [loading, setLoading] = useState(false); // State for loading indicator
  const [error, setError] = useState(""); // State to handle errors
  const router = useRouter(); // Hook for navigation

  // ✅ Initialize react-hook-form with validation resolver
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AuthFormValues>({
    resolver: zodResolver(isSignUp ? signUpSchema : signInSchema) as any,
  });

  // ✅ Function to handle form submission
  const onSubmit = async (data: AuthFormValues) => {
    setLoading(true); // Start loading
    setError(""); // Clear previous errors
    
    try {
      const endpoint = isSignUp ? "/api/signup" : "/api/signin"; // API endpoint based on auth mode
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data), // Convert data to JSON
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Something went wrong"); // Show error if request fails
      } else {
        alert(result.message); // Show success message
        // ✅ Store session in sessionStorage
        sessionStorage.setItem("auth", "true");
        if (!isSignUp) {
          router.push("/authuser"); // Redirect to comment analyzer for authorized users
        }
        reset(); // Reset form fields
      }
    } catch (err) {
      setError("Network error. Try again."); // Handle network errors
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        {/* Form Title */}
        <h2 className="text-2xl font-bold text-center">{isSignUp ? "Sign Up" : "Sign In"}</h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          {isSignUp ? "Create a new account" : "Enter your credentials"}
        </p>

        {/* Display error message if any */}
        {error && <p className="text-red-500 text-center">{error}</p>}

        {/* Authentication Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Input */}
          <div>
            <label className="block text-gray-700">Email</label>
            <input type="email" {...register("email")} className="w-full p-2 border rounded" />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-gray-700">Password</label>
            <input type="password" {...register("password")} className="w-full p-2 border rounded" />
            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
          </div>

          {/* Confirm Password Input (Only for Sign Up) */}
          {isSignUp && (
            <div>
              <label className="block text-gray-700">Confirm Password</label>
              <input type="password" {...register("confirmPassword")} className="w-full p-2 border rounded" />
              {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}
            </div>
          )}

          {/* Submit Button */}
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded" disabled={loading}>
            {loading ? "Processing..." : isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        {/* Toggle between Sign In and Sign Up */}
        <p className="text-center text-sm mt-4">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}
          <button className="text-blue-500 hover:underline ml-1" onClick={() => { setIsSignUp(!isSignUp); reset(); }}>
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
