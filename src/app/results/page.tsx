import { Suspense } from 'react';
import SearchResultsComponent from '../components/search-results/search-results.component';

type SearchParams = { [key: string]: string | string[] | undefined };

export const metadata = {
  title: 'Search Results | Virgin Atlantic Holidays',
  description: 'Compare holiday packages, flights, and hotels with Virgin Atlantic Holidays.',
};

export default async function Results({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedParams = await searchParams;

  return (
    <Suspense fallback={<div className="wrapper"><p>Loading holidays...</p></div>}>
      <SearchResultsComponent searchParams={resolvedParams} />
    </Suspense>
  );
}
