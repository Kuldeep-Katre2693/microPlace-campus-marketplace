import { Layout } from "@/components/layout";
import { useListings } from "@/hooks/use-listings";
import { ListingCard } from "@/components/listing-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Search, Filter, AlertCircle, X } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";

export default function Home() {
  const { data: listings, isLoading } = useListings();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredListings = useMemo(() => {
    if (!listings) return [];
    return listings.filter((listing) => {
      const matchesSearch = 
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = 
        selectedCategory === "All" || 
        listing.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [listings, searchQuery, selectedCategory]);

  const [isAiSearching, setIsAiSearching] = useState(false);

  const handleSearch = async (val: string) => {
    setSearchQuery(val);
    if (val.length > 10) { // Natural language threshold
      setIsAiSearching(true);
      try {
        const res = await fetch("/api/search/intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: val })
        });
        const data = await res.json();
        // Update search logic with keywords/categories from AI
        console.log("AI Intent:", data);
      } catch (e) {
        console.error("AI Search failed");
      } finally {
        setIsAiSearching(false);
      }
    }
  };

  const recommendations = [
    {
      id: 101,
      title: "Deep Learning Specialization Books",
      price: 2500,
      category: "Books",
      condition: "Like New",
      images: ["https://info.deeplearning.ai/hubfs/1645724689.png"],
      sellerId: 1,
      trustBadge: true
    },
    {
      id: 102,
      title: "Scientific Calculator Casio",
      price: 1200,
      category: "Electronics",
      condition: "Good",
      images: ["https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcSr-Azx7aTbgWgXbTnXLYT82Ob429FCx13wBXyblI9itHyDlm0XxkA_4FRN6YU3Z-5fO_ZB8d6s7E9enA49PD9zVHPCYm-G2OP5sSHBNFOfvBCeS7IMHVFDSfJQs9SEHMf4nn6aPZ0&usqp=CAc"],
      sellerId: 1,
      trustBadge: true
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-b from-secondary/50 to-background">
        <div className="absolute inset-0 bg-grid-slate-200 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
        
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-display font-extrabold text-4xl md:text-6xl tracking-tight mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Buy & Sell on Campus.
              <br />
              Safe. Simple. Student-Verified.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              MicroPlace is the exclusive marketplace for Priyadarshini College.
              Find textbooks, electronics, and gear from verified students.
            </p>
            
            <div className="max-w-2xl mx-auto relative flex items-center">
              <Search className={`absolute left-4 w-5 h-5 ${isAiSearching ? "text-primary animate-pulse" : "text-muted-foreground"}`} />
              <Input 
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Try: 'I have photoshoot tomorrow' or 'Engineering mechanics'" 
                className="pl-12 pr-12 h-14 rounded-full text-lg shadow-xl shadow-primary/5 border-primary/20 focus-visible:ring-primary/20"
              />
              <div className="absolute right-4 flex items-center gap-2">
                {isAiSearching && <span className="text-xs font-bold text-primary animate-pulse">✨ AI Thinking</span>}
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="p-1 hover:bg-muted rounded-full"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Fresh Recommendations */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold font-display mb-8 flex items-center gap-2">
            🔥 Fresh Recommendations <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full border border-primary/20">✨ AI Powered</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendations.map((item) => (
              <ListingCard key={item.id} listing={item as any} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-12 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-4 justify-center">
            {["All", "Academic", "Electronics", "Stationery", "Clothing", "Furniture", "Bicycles", "Hostel Essentials"].map((cat) => (
              <Button 
                key={cat} 
                variant={selectedCategory === cat ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat)}
                className="rounded-full transition-all"
              >
                {cat}
              </Button>
            ))}
            <Button variant="ghost" className="rounded-full gap-2">
              <Filter className="w-4 h-4" /> Filters
            </Button>
          </div>
        </div>
      </section>

      {/* Listings Grid */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold font-display">
              {searchQuery || selectedCategory !== "All" ? "Search Results" : "Fresh Recommendations"}
            </h2>
            <Link href="/listings/new">
              <Button variant="link" className="text-primary">List an Item &rarr;</Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-[400px] rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : filteredListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-muted/20 rounded-3xl">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No listings found</h3>
              <p className="text-muted-foreground mb-6">Try adjusting your search or category filters.</p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
              >
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
