// Utility to prevent duplicate API calls and add request debouncing
const activeRequests = new Map<string, Promise<any>>();

export async function fetchWithDeduplication(url: string, options?: RequestInit): Promise<Response> {
  const key = `${url}-${JSON.stringify(options)}`;
  
  // If there's already an active request for this URL, return it
  if (activeRequests.has(key)) {
    return activeRequests.get(key);
  }
  
  // Create new request
  const request = fetch(url, options).finally(() => {
    // Clean up after request completes
    activeRequests.delete(key);
  });
  
  // Store the request
  activeRequests.set(key, request);
  
  return request;
}

// Debounce utility for API calls
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Request cache to prevent unnecessary API calls
const requestCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds

export async function fetchWithCache(url: string, options?: RequestInit): Promise<any> {
  const key = `${url}-${JSON.stringify(options)}`;
  const cached = requestCache.get(key);
  
  // Return cached data if it's still fresh
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  // Fetch new data
  const response = await fetchWithDeduplication(url, options);
  const data = await response.json();
  
  // Cache the result
  requestCache.set(key, { data, timestamp: Date.now() });
  
  return data;
}