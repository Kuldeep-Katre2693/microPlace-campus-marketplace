import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { InsertOrder, Order } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useCreateOrder() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertOrder) => {
      const validated = api.orders.create.input.parse(data);
      const res = await fetch(api.orders.create.path, {
        method: api.orders.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Failed to create order" }));
        throw new Error(error.message || "Failed to create order");
      }

      return (await res.json()) as Order;
    },
    onSuccess: () => {
      toast({
        title: "Order Initiated",
        description: "Proceeding to payment gateway...",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to initiate order",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  });
}

export function useVerifyPayment() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { orderId: number; razorpayPaymentId: string; razorpaySignature: string }) => {
      const res = await fetch(api.orders.verifyPayment.path, {
        method: api.orders.verifyPayment.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Payment verification failed" }));
        throw new Error(error.message || "Payment verification failed");
      }

      return (await res.json()) as { success: boolean };
    },
    onSuccess: () => {
      toast({
        title: "Payment Successful!",
        description: "Your order has been placed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Payment Verification Failed",
        description: "Please contact support if money was deducted.",
        variant: "destructive",
      });
    }
  });
}
