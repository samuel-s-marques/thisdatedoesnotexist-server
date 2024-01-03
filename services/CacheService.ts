import flatCache from 'flat-cache'

export default class CacheService {
  private static instance: CacheService
  private cache: flatCache.Cache

  constructor() {
    this.cache = flatCache.load('cache-server')
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService()
    }

    return CacheService.instance
  }

  public get(key: string): any {
    return this.cache.getKey(key)
  }

  public set(key: string, value: any): void {
    this.cache.setKey(key, value)
    this.cache.save()
  }

  public remove(key: string): void {
    this.cache.removeKey(key)
    this.cache.save()
  }

  public all(): any {
    return this.cache.all()
  }
}
