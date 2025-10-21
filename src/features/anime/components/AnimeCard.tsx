import Link from 'next/link';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent } from '@/src/components/ui/card';
import { Play } from 'lucide-react';
import { AnimeSeries } from '@/src/entities/anime/type/anime';

interface AnimeCardProps {
    anime: AnimeSeries;
}

export function AnimeCard({ anime }: AnimeCardProps) {
    return (
        <Link href={`/products?animeId=${anime.id}&animeTitle=${encodeURIComponent(anime.title)}`}>
            <Card className="group overflow-hidden transition-all hover:shadow-lg cursor-pointer">
                <div className="relative aspect-video overflow-hidden">
                    <img
                        src={anime.imagePath || '/placeholder.jpg'}
                        alt={anime.title}
                        className="object-cover w-full h-full transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                        <h3 className="text-xl font-bold line-clamp-1">{anime.title}</h3>
                        {anime.releaseYear && (
                            <p className="text-sm opacity-80">{anime.releaseYear}</p>
                        )}
                    </div>
                </div>

                <CardContent className="p-4">
                    {anime.description && (
                        <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
                            {anime.description}
                        </p>
                    )}
                    <Button size="sm">
                        <Play className="mr-1 h-3 w-3" />
                        Các sản phẩm liên quan
                    </Button>
                </CardContent>
            </Card>
        </Link>
    );
}