import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { InsertListing, Listing } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

// Mock data for listing response
const MOCK_LISTINGS: Listing[] = [
  {
    id: 1,
    sellerId: 2,
    title: "Engineering Mechanics Textbook (1st Year)",
    description: "Standard mechanics textbook, barely used. No highlighting.",
    price: 450,
    category: "Books",
    condition: "Like New",
    images: ["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=1000"],
    status: "active",
    createdAt: new Date("2024-02-20"),
  },
  {
    id: 2,
    sellerId: 3,
    title: "Scientific Calculator fx-991EX",
    description: "Classwiz series, essential for engineering exams. Includes cover.",
    price: 800,
    category: "Electronics",
    condition: "Good",
    images: ["https://images.unsplash.com/photo-1587145820266-a2651c463853?auto=format&fit=crop&q=80&w=1000"],
    status: "active",
    createdAt: new Date("2024-02-21"),
  },
  {
    id: 3,
    sellerId: 4,
    title: "Drafter + Drawing Board Combo",
    description: "Full set for engineering drawing. Mini drafter acts smooth.",
    price: 1200,
    category: "Stationery",
    condition: "Fair",
    images: ["https://images.unsplash.com/photo-1588619461336-68f5d9f430b8?auto=format&fit=crop&q=80&w=1000"],
    status: "active",
    createdAt: new Date("2024-02-19"),
  }
];

export function useListings() {
  return useQuery({
    queryKey: [api.listings.list.path],
    queryFn: async () => {
      // In a real app:
      // const res = await fetch(api.listings.list.path);
      // return await res.json();
      
      // For Hackathon/Demo:
      return MOCK_LISTINGS;
    },
  });
}

export function useCreateListing() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertListing) => {
      // Validate with Zod
      api.listings.create.input.parse(data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return { ...data, id: Math.random(), status: "active", createdAt: new Date() } as Listing;
    },
    onSuccess: (newListing) => {
      queryClient.setQueryData([api.listings.list.path], (old: Listing[] = []) => [newListing, ...old]);
      toast({
        title: "Listing Created!",
        description: "Your item is now visible to other students.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create listing",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  });
}

export function useAnalyzePrice() {
  return useMutation({
    mutationFn: async (data: { title: string, condition: string, category: string }) => {
      // Simulate AI Analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return {
        fair_price: "₹450 - ₹600",
        quick_sell_price: "₹400",
        premium_price: "₹700",
        demand_level: "High",
        confidence_score: "92%"
      };
    }
  });
}

export function useCheckScam() {
  return useMutation({
    mutationFn: async (data: { title: string, description: string, price: number }) => {
      // Simulate AI Scam Check
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const isRisky = data.price < 100; // Fake logic
      
      return {
        risk_level: isRisky ? "Medium" : "Low",
        scam_probability: isRisky ? "35%" : "2%",
        trust_score_adjustment: isRisky ? "-5" : "+2"
      };
    }
  });
}
