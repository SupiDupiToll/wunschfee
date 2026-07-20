import type { AmazonProduct } from "@/lib/blog";
import { addAffiliateTag } from "@/lib/amazon";
import { Badge } from "@/components/ui/badge";

function amazonUrl(asin: string): string {
  return `https://www.amazon.de/dp/${asin}`;
}

export function ProductCard({ product }: { product: AmazonProduct }) {
  const url = addAffiliateTag(amazonUrl(product.asin));

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-4 rounded-xl border p-4 transition-all hover:border-primary/30 hover:shadow-sm"
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-muted text-lg">
        🎁
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-snug truncate">
          {product.title}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Preis: {product.price}
        </p>
      </div>
      <Badge variant="outline" className="shrink-0 text-xs">
        Bei Amazon
      </Badge>
    </a>
  );
}
