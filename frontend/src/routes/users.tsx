import {
  createFileRoute,
  useLoaderData,
  useNavigate,
} from '@tanstack/react-router';
import { usersQueryOptions } from '@/utils/users';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';

export const Route = createFileRoute('/users')({
  component: RouteComponent,

  validateSearch: (
    search: Record<string, unknown>,
  ): { searchString: string } => {
    return {
      searchString: (search?.searchString as string) || '',
    };
  },

  loaderDeps: ({ search: { searchString } }) => ({
    searchString,
  }),

  loader: async ({ context, deps }) => {
    const BACKEND_URL = process.env.BACKEND_URL;
    return await context.queryClient.ensureQueryData(
      usersQueryOptions(BACKEND_URL, `?searchString=${deps.searchString}`),
    );
  },
});

function RouteComponent() {
  const data = useLoaderData({ from: '/users' });
  const { searchString } = Route.useSearch();
  const [userEmail, searchUserEmail] = useState(searchString);

  const searchQuery = new URLSearchParams({
    searchString: userEmail,
  });

  const usersQuery = useQuery({
    ...usersQueryOptions('', `?${searchQuery.toString()}`),
    initialData: data,
  });

  const navigate = useNavigate({ from: Route.fullPath });

  useEffect(() => {
    navigate({
      search: () => {
        return {
          searchString: userEmail,
        };
      },
    });
  }, [userEmail, navigate]);

  return (
    <div className="px-5">
      <Input
        defaultValue={userEmail}
        onChange={(e) => {
          searchUserEmail(e.target.value);
        }}
      />
      <h1>users</h1>
      {usersQuery.data.items.map((user) => (
        <div key={user.id}>{user.email}</div>
      ))}
    </div>
  );
}
