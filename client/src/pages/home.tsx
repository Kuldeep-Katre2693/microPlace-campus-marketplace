import { Layout } from "@/components/layout";
import { useListings } from "@/hooks/use-listings";
import { ListingCard } from "@/components/listing-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { data: listings, isLoading } = useListings();

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
              <Search className="absolute left-4 w-5 h-5 text-muted-foreground" />
              <Input 
                placeholder="Search for textbooks, calculators, lab coats..." 
                className="pl-12 pr-32 h-14 rounded-full text-lg shadow-xl shadow-primary/5 border-primary/20 focus-visible:ring-primary/20"
              />
              <Button className="absolute right-2 h-10 rounded-full px-6">
                Search
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-12 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-4 justify-center">
            {["All", "Textbooks", "Electronics", "Stationery", "Clothing", "Dorm Essentials"].map((cat) => (
              <Button 
                key={cat} 
                variant="outline" 
                className="rounded-full hover:border-primary hover:text-primary transition-all"
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
            <h2 className="text-2xl font-bold font-display">Fresh Recommendations</h2>
            <Link href="/listings/new">
              <Button variant="link" className="text-primary">View All &rarr;</Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-[400px] rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : listings && listings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-muted/20 rounded-3xl">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No listings found</h3>
              <p className="text-muted-foreground mb-6">Be the first to list something!</p>
              <Link href="/listings/new">
                <Button>Create Listing</Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
