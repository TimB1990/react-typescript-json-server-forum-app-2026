import type { ReactNode } from "react";

export interface RouteHandle {
    breadcrumb: string | ((data: any) => string)
}