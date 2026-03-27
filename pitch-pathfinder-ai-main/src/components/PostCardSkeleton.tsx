import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const PostCardSkeleton = () => {
  return (
    <Card className="mb-4 overflow-hidden border-border/40 shadow-sm max-w-2xl mx-auto animate-pulse">
      <CardContent className="p-4 sm:p-5">
        {/* Header Skeleton */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div>
              <Skeleton className="h-4 w-32 mb-1" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>

        {/* Content Skeleton */}
        <div className="space-y-2 mb-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* Media Skeleton */}
        <Skeleton className="h-48 w-full rounded-md mb-4" />

        {/* Actions Skeleton */}
        <div className="flex items-center justify-between pt-3 border-t border-border/30">
          <Skeleton className="h-8 w-16 rounded-md" />
          <Skeleton className="h-8 w-16 rounded-md" />
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCardSkeleton;