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
import { Loader2, Wand2, ShieldCheck, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function NewListing() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
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
    images: ["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=1000"] // Default mock image
  });

  const [analysis, setAnalysis] = useState<any>(null);
  const [scamCheck, setScamCheck] = useState<any>(null);

  if (!user) {
    setLocation("/auth");
    return null;
  }

  const handleAnalyze = async () => {
    if (!formData.title || !formData.category || !formData.condition) {
      toast({ title: "Please fill in basic details first", variant: "destructive" });
      return;
    }
    const result = await analyzeMutation.mutateAsync({
      title: formData.title,
      category: formData.category,
      condition: formData.condition
    });
    setAnalysis(result);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Check for scam
    const scamResult = await checkScamMutation.mutateAsync({
      title: formData.title,
      description: formData.description,
      price: Number(formData.price)
    });
    setScamCheck(scamResult);

    if (scamResult.risk_level === "High") {
      toast({ title: "High Risk Detected", description: "This listing violates our policies.", variant: "destructive" });
      return;
    }

    // 2. Create Listing
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
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input 
                      placeholder="e.g. Engineering Mechanics Textbook" 
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select onValueChange={v => setFormData({...formData, category: v})}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Books">Textbooks</SelectItem>
                          <SelectItem value="Electronics">Electronics</SelectItem>
                          <SelectItem value="Stationery">Stationery</SelectItem>
                          <SelectItem value="Clothing">Clothing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Condition</Label>
                      <Select onValueChange={v => setFormData({...formData, condition: v})}>
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
                      placeholder="Describe the item condition, history, etc."
                      className="min-h-[120px]"
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Price (₹)</Label>
                    <div className="flex gap-4 items-end">
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        value={formData.price}
                        onChange={e => setFormData({...formData, price: e.target.value})}
                      />
                      <Button 
                        type="button" 
                        variant="secondary" 
                        onClick={handleAnalyze}
                        disabled={analyzeMutation.isPending}
                      >
                        {analyzeMutation.isPending ? <Loader2 className="animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
                        AI Price Check
                      </Button>
                    </div>
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

            {/* AI Insights Panel */}
            <div className="space-y-6">
              <AnimatePresence>
                {analysis && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <Card className="bg-primary/5 border-primary/20">
                      <CardContent className="p-4 space-y-4">
                        <div className="flex items-center gap-2 text-primary font-bold border-b border-primary/10 pb-2">
                          <Wand2 className="w-4 h-4" /> AI Price Analysis
                        </div>
                        
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Fair Price:</span>
                            <span className="font-semibold">{analysis.fair_price}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Quick Sell:</span>
                            <span className="font-semibold text-green-600">{analysis.quick_sell_price}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Demand:</span>
                            <span className="font-semibold text-blue-600">{analysis.demand_level}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              <Card>
                <CardContent className="p-4">
                  <h4 className="font-bold flex items-center gap-2 mb-2">
                    <ShieldCheck className="w-4 h-4 text-green-600" /> Safe Selling Tips
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4">
                    <li>Meet in official Campus Zones</li>
                    <li>Verify buyer's student ID</li>
                    <li>Use MicroPlace payments</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
