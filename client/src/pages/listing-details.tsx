import { Layout } from "@/components/layout";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ArrowLeft, ShieldCheck, MapPin, Tag } from "lucide-react";
import type { Listing, User } from "@shared/schema";

export default function ListingDetails() {
  const { id } = useParams();
  
  const { data: listing, isLoading: isLoadingListing } = useQuery<Listing>({
    queryKey: [`/api/listings/${id}`],
  });

  const { data: seller, isLoading: isLoadingSeller } = useQuery<User>({
    queryKey: [`/api/users/${listing?.sellerId}`],
    enabled: !!listing?.sellerId,
  });

  if (isLoadingListing || isLoadingSeller) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!listing) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Listing not found</h1>
          <Link href="/">
            <Button>Back to Marketplace</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Search
          </Button>
        </Link>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square rounded-3xl overflow-hidden bg-muted border shadow-inner">
              <img 
                src={listing.images[0]} 
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Details */}
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary" className="rounded-full">{listing.category}</Badge>
                <Badge variant="outline" className="rounded-full">{listing.condition}</Badge>
              </div>
              <h1 className="text-4xl font-display font-bold mb-2">{listing.title}</h1>
              <p className="text-3xl font-bold text-primary">₹{listing.price}</p>
            </div>

            <Card className="bg-muted/30 border-none shadow-none">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {seller?.name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold">{seller?.name}</p>
                      {seller?.studentIdVerified && (
                        <ShieldCheck className="w-4 h-4 text-primary" title="Verified Student" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">Trust Score: {seller?.trustScore}/100</p>
                  </div>
                </div>
                <Button className="w-full" size="lg">Contact Seller</Button>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h3 className="text-xl font-bold font-display">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {listing.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>Priyadarshini Campus</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tag className="w-4 h-4" />
                <span>ID: {listing.id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}