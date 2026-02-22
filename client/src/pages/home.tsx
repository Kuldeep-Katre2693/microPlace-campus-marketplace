import { Layout } from "@/components/layout";
import { useListings } from "@/hooks/use-listings";
import { ListingCard } from "@/components/listing-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, AlertCircle, X } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";

export default function Home() {
  const { data: listings, isLoading } = useListings();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const normalize = (text: string) =>
    text.toLowerCase().replace(/[^\w\s]/gi, "");

  // Detect category from search text
  const handleSearch = (val: string) => {
    setSearchQuery(val);

    const lower = val.toLowerCase();

    const categories = [
      "academic",
      "electronics",
      "stationery",
      "clothing",
      "furniture",
      "bicycles",
      "hostel essentials"
    ];

    const detectedCategory = categories.find(cat =>
      lower.includes(cat)
    );

    if (detectedCategory) {
      const formatted =
        detectedCategory === "hostel essentials"
          ? "Hostel Essentials"
          : detectedCategory.charAt(0).toUpperCase() +
            detectedCategory.slice(1);

      setSelectedCategory(formatted);
    } else {
      setSelectedCategory("All");
    }
  };

  // Smart keyword splitting
  const mapIntent = (query: string) => {
    const q = query.toLowerCase();
    return q.split(" ").filter(word => word.length > 2);
  };

  const filteredListings = useMemo(() => {
    if (!listings) return [];

    const keywords = searchQuery ? mapIntent(searchQuery) : [];

    return listings.filter((listing) => {
      const title = normalize(listing.title || "");
      const description = normalize(listing.description || "");
      const category = normalize(listing.category || "");

      const matchesSearch =
        searchQuery === "" ||
        keywords.some((kw) =>
          title.includes(kw) ||
          description.includes(kw) ||
          category.includes(kw)
        );

      const matchesCategory =
        selectedCategory === "All" ||
        listing.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [listings, searchQuery, selectedCategory]);

  const recommendations = [
    {
      id: 101,
      title: "Deep Learning Specialization Books",
      price: 2500,
      category: "Stationery",
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

  const filteredRecommendations =
    selectedCategory === "All"
      ? recommendations
      : recommendations.filter(
          (item) => item.category === selectedCategory
        );

  return (
    <Layout>

      {/* Hero */}
      <section className="py-20 bg-gradient-to-b from-secondary/50 to-background">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Buy & Sell on Campus.
            </h1>

            <div className="max-w-2xl mx-auto relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Try: 'i have ml stationery book'"
                className="pl-12 pr-12 h-14 rounded-full text-lg"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                  }}
                  className="absolute right-4"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 border-b">
        <div className="container mx-auto px-4 flex flex-wrap gap-4 justify-center">
          {[
            "All",
            "Academic",
            "Electronics",
            "Stationery",
            "Clothing",
            "Furniture",
            "Bicycles",
            "Hostel Essentials"
          ].map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat)}
              className="rounded-full"
            >
              {cat}
            </Button>
          ))}
          <Button variant="ghost" className="rounded-full gap-2">
            <Filter className="w-4 h-4" /> Filters
          </Button>
        </div>
      </section>

      {/* Fresh Recommendations */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">
            🔥 Fresh Recommendations
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredRecommendations.map((item) => (
              <ListingCard key={item.id} listing={item as any} />
            ))}
          </div>
        </div>
      </section>

      {/* Listings */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">
            {searchQuery
              ? `Results for "${searchQuery}"`
              : selectedCategory !== "All"
              ? `${selectedCategory} Listings`
              : "All Listings"}
          </h2>

          {isLoading ? (
            <div className="text-center py-20">Loading...</div>
          ) : filteredListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p>No listings found</p>
            </div>
          )}
        </div>
      </section>

    </Layout>
  );
}