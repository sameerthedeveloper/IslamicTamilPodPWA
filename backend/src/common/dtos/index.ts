export class ApiResponse<T> {
  statusCode: number;
  message: string;
  data?: T;
  error?: string;
}

export class PaginationDto {
  page: number = 1;
  limit: number = 20;
  offset: number = 0;
}

export class PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
