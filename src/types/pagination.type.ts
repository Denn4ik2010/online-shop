export type Paginated<
  T extends object,
  F extends 'users' | 'products' | 'categories' | 'chat' | 'chats' | 'messages',
> = {
  total: number;
  pageSize: number;
  page: number;
  totalPages: number;
  prevPage: number;
  nextPage: number;
} & Record<F, T>;
