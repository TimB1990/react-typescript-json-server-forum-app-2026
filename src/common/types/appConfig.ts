export interface AppConfig {
    messages: number,
    threads: number,
    categories: number,
    global: number,
    [key: string]: number,
}