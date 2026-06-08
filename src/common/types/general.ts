import type { ReactNode } from "react";

// Define what a single dynamic crumb object looks like
export interface DynamicCrumb {
  label: string;
  path: string;
}

// Update your RouteHandle interface
export interface RouteHandle {
  breadcrumb: string | ((data: any) => DynamicCrumb[]);
}

export interface ResponseResult<T> {
  data: T[],
  totalCount: number,
  currentPage: number,
  totalPages: number
}