import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchEquipments } from '@/api/equipments';
import type { EquipmentSearchResult } from '@/api/types';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Sparkles, Clock, Hash } from 'lucide-react';

const PAGE_SIZE = 20;

export default function EquipmentSearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [allResults, setAllResults] = useState<EquipmentSearchResult[]>([]);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Debounce the search term
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedTerm(searchTerm);
      setAllResults([]);
      setCursor(undefined);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchTerm]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['equipment-search', debouncedTerm, cursor],
    queryFn: () => searchEquipments(debouncedTerm, cursor, PAGE_SIZE),
    enabled: debouncedTerm.length > 0,
  });

  // Accumulate results for infinite scroll
  useEffect(() => {
    if (data?.data) {
      if (cursor) {
        setAllResults((prev) => [...prev, ...data.data]);
      } else {
        setAllResults(data.data);
      }
      setIsLoadingMore(false);
    }
  }, [data, cursor]);

  const handleLoadMore = useCallback(() => {
    if (data?.nextCursor) {
      setIsLoadingMore(true);
      setCursor(data.nextCursor);
    }
  }, [data?.nextCursor]);

  const results = allResults;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Busca de Equipamentos
        </h2>
        <p className="text-muted-foreground">
          Busca full-text com suporte a português, ranking por relevância e
          destaque de termos
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-10 text-base"
          placeholder="Buscar equipamentos... (ex: notebook, monitor, dell)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoFocus
        />
      </div>

      {/* Search Tips */}
      {!debouncedTerm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5" />
              Dicas de busca
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              A busca utiliza <strong>Full Text Search</strong> do PostgreSQL
              com configuração para <strong>português</strong>.
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <strong>Stemming:</strong> buscar "computadores" também encontra
                "computador"
              </li>
              <li>
                <strong>Prefix matching:</strong> buscar "note" encontra
                "notebook"
              </li>
              <li>
                <strong>Pesos:</strong> ID e Nome (peso A), Descrição (peso B),
                Tags (peso C)
              </li>
              <li>
                <strong>Ranking:</strong> resultados ordenados por relevância
                (ts_rank)
              </li>
              <li>
                <strong>Highlight:</strong> termos encontrados são destacados
                nos resultados
              </li>
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && debouncedTerm && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Results */}
      {debouncedTerm && !isLoading && (
        <>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Hash className="h-4 w-4" />
            <span>
              {data?.total || 0} resultado{(data?.total || 0) !== 1 ? 's' : ''}{' '}
              para "{debouncedTerm}"
            </span>
          </div>

          {results.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Search className="mb-4 h-12 w-12 opacity-30" />
                <p className="text-lg font-medium">
                  Nenhum resultado encontrado
                </p>
                <p className="text-sm">
                  Tente usar termos diferentes ou mais genéricos
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {results.map((item) => (
                <Card
                  key={item.id}
                  className="transition-shadow hover:shadow-md"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">
                          <span className="mr-2 font-mono text-sm text-muted-foreground">
                            {item.id}
                          </span>
                          {item.name || 'Sem nome'}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                          <span className="text-xs">
                            Relevância: {(item.rank * 100).toFixed(1)}%
                          </span>
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="text-xs shrink-0">
                        rank: {item.rank.toFixed(4)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {/* Headline with highlighted terms */}
                    {item.headline ? (
                      <div
                        className="text-sm [&_mark]:bg-yellow-200 [&_mark]:px-0.5 [&_mark]:rounded-sm"
                        dangerouslySetInnerHTML={{ __html: item.headline }}
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {item.description || 'Sem descrição'}
                      </p>
                    )}

                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {item.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs cursor-pointer"
                            onClick={() => setSearchTerm(tag)}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {/* Load More */}
              {data?.nextCursor && (
                <div className="flex justify-center pt-4">
                  <Button
                    variant="outline"
                    onClick={handleLoadMore}
                    disabled={isLoadingMore || isFetching}
                  >
                    {isLoadingMore
                      ? 'Carregando...'
                      : 'Carregar mais resultados'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
