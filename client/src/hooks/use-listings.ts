import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { InsertListing, Listing } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useListings() {
  return useQuery<Listing[]>({
    queryKey: [api.listings.list.path],
    queryFn: async () => {
      const res = await fetch(api.listings.list.path, {
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Failed to fetch listings" }));
        throw new Error(err.message || "Failed to fetch listings");
      }
      return (await res.json()) as Listing[];
    },
  });
}

export function useCreateListing() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertListing) => {
      const validated = api.listings.create.input.parse(data);
      const res = await fetch(api.listings.create.path, {
        method: api.listings.create.method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(validated),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Failed to create listing" }));
        throw new Error(error.message || "Failed to create listing");
      }

      return (await res.json()) as Listing;
    },
    onSuccess: (newListing) => {
      queryClient.setQueryData<Listing[]>([api.listings.list.path], (old = []) => [newListing, ...old]);
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
    mutationFn: async (data: { title: string; condition: string; category: string }) => {
      const res = await fetch(api.listings.analyzePrice.path, {
        method: api.listings.analyzePrice.method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Price analysis failed" }));
        throw new Error(error.message || "Price analysis failed");
      }

      return await res.json();
    }
  });
}

export function useCheckScam() {
  return useMutation({
    mutationFn: async (data: { title: string; description: string; price: number }) => {
      const res = await fetch(api.listings.checkScam.path, {
        method: api.listings.checkScam.method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Scam check failed" }));
        throw new Error(error.message || "Scam check failed");
      }

      return await res.json();
    }
  });
}
