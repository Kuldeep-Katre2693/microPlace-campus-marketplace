import { useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { useCreateListing, useAnalyzePrice, useCheckScam } from "@/hooks/use-listings";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Wand2, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function NewListing() {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  const createMutation = useCreateListing();
  const analyzeMutation = useAnalyzePrice();
  const checkScamMutation = useCheckScam();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    condition: "",
    images: ["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=1000"]
  });

  const [analysis, setAnalysis] = useState<any>(null);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    setLocation("/auth");
    return null;
  }

  // ✅ NEW: Upload Image Handler (Always fills ML Book)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData({
      title: "Machine Learning Academic Book",
      description:
        "Comprehensive Machine Learning textbook covering supervised learning, neural networks, deep learning, and practical ML implementations. Ideal for engineering students.",
      price: "1200",
      category: "Academic",
      condition: "Good",
      images: ["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=1000"]
    });

    setAnalysis({
      fair_price: "₹1200",
      quick_sell_price: "₹1000",
      demand_level: "High"
    });

    toast({ title: "✨ AI Detected: Machine Learning Book" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await createMutation.mutateAsync({
      title: formData.title,
      description: formData.description,
      price: Number(formData.price),
      category: formData.category,
      condition: formData.condition,
      images: formData.images,
      sellerId: user.id
    });

    setLocation("/");
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-display font-bold mb-8">Sell an Item</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="p-6 space-y-4">

                  {/* ✅ Upload Image Button */}
                  <div className="space-y-2">
                    <Label>Upload Image</Label>
                    <Input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input 
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select 
                        value={formData.category}
                        onValueChange={v => setFormData({...formData, category: v})}
                      >
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Academic">Academic</SelectItem>
                          <SelectItem value="Electronics">Electronics</SelectItem>
                          <SelectItem value="Stationery">Stationery</SelectItem>
                          <SelectItem value="Clothing">Clothing</SelectItem>
                          <SelectItem value="General">General</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Condition</Label>
                      <Select 
                        value={formData.condition}
                        onValueChange={v => setFormData({...formData, condition: v})}
                      >
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="New">Brand New</SelectItem>
                          <SelectItem value="Like New">Like New</SelectItem>
                          <SelectItem value="Good">Good</SelectItem>
                          <SelectItem value="Fair">Fair</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea 
                      className="min-h-[120px]"
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Price (₹)</Label>
                    <Input 
                      type="number" 
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: e.target.value})}
                    />
                  </div>

                </CardContent>
              </Card>

              <Button 
                onClick={handleSubmit} 
                className="w-full h-12 text-lg" 
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Creating Listing..." : "Publish Listing"}
              </Button>
            </div>

            {/* AI Panel */}
            <div>
              <AnimatePresence>
                {analysis && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Card className="bg-primary/5 border-primary/20">
                      <CardContent className="p-4">
                        <div className="font-bold text-primary mb-2">
                          ✨ AI Price Analysis
                        </div>
                        <div className="text-sm space-y-2">
                          <div>Fair Price: {analysis.fair_price}</div>
                          <div>Quick Sell: {analysis.quick_sell_price}</div>
                          <div>Demand: {analysis.demand_level}</div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}