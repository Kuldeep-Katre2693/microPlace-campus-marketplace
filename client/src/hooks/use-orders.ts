import { useMutation } from "@tanstack/react-query";
import { InsertOrder } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useCreateOrder() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertOrder) => {
      // Simulate order creation
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true, orderId: Math.floor(Math.random() * 10000) };
    },
    onSuccess: () => {
      toast({
        title: "Order Initiated",
        description: "Proceeding to payment gateway...",
      });
    }
  });
}

export function useVerifyPayment() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { orderId: number, razorpayPaymentId: string }) => {
      // Simulate payment verification
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { success: true };
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
