import { Listing } from "@shared/schema";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Clock, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      whileHover={{ y: -8, rotateX: 2, scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Link href={`/listings/${listing.id}`}>
        <Card className="overflow-hidden h-full border border-transparent hover:border-primary/50 hover:shadow-2xl transition-all cursor-pointer group bg-card/80 backdrop-blur-sm">
          <div className="aspect-[4/3] overflow-hidden relative">
            <img 
              src={listing.images[0] || "https://via.placeholder.com/300"} 
              alt={listing.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://via.placeholder.com/300";
              }}
            />
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="backdrop-blur-md bg-white/80 font-bold text-primary">
                ₹{listing.price}
              </Badge>
            </div>
            {listing.sellerId === 1 && ( // Mock "Trusted Seller" logic
              <div className="absolute bottom-2 left-2">
                <Badge className="bg-green-500/90 hover:bg-green-600 text-white gap-1 text-[10px]">
                  <ShieldCheck className="w-3 h-3" /> Trusted Seller
                </Badge>
              </div>
            )}
          </div>
          
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {listing.category}
              </Badge>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {listing.createdAt ? formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true }) : 'Recently'}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 mb-1">
              <Badge variant="secondary" className="text-[10px] uppercase tracking-wider text-white bg-gradient-to-r from-primary to-secondary">
                {listing.condition || 'N/A'}
              </Badge>
              {listing.sellerId === 1 ? (
                <div className="text-[10px] font-semibold text-emerald-500 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Trusted Seller
                </div>
              ) : (
                <div className="text-[10px] font-medium text-muted-foreground">Verified marketplace member</div>
              )}
            </div>

            <h3 className="font-display font-bold text-lg leading-tight mb-2 line-clamp-1 group-hover:text-primary transition-colors">
              {listing.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
              {listing.description}
            </p>
          </CardContent>

          <CardFooter className="p-4 pt-0 mt-auto">
            <Button className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground gap-2 group-hover:bg-primary group-hover:text-white transition-all">
              <Eye className="w-4 h-4" /> View Details
            </Button>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
}
