import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { useQuery, useMutation } from '@tanstack/react-query';


class AbortControllerManager {
  // Store AbortControllers to manage requests
  static controllers: Map<string, AbortController> = new Map();

  /**
   * Add a new AbortController for a request.
   */
  static addController(key: string): AbortController {
    // Abort the previous request if it exists
    if (this.controllers.has(key)) {
      this.controllers.get(key)?.abort();
    }

    // Create and store a new controller
    const controller = new AbortController();
    this.controllers.set(key, controller);
    return controller;
  }

  /**
   * Remove an AbortController for a request.
   */
  static removeController(key: string): void {
    this.controllers.delete(key);
  }

  /**
   * Cancel all ongoing requests.
   */
  static cancelAllRequests(): void {
    this.controllers.forEach((controller) => controller.abort());
    this.controllers.clear();
  }
}

// Create an Axios instance with a timeout configuration
const axiosInstance: AxiosInstance = axios.create({
  baseURL: 'https://cgl1106.cinnagen.com:9020', 
  timeout: 20000, // 20 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true
  //maxRedirects: 0, // Prevent Axios from automatically following redirects
});

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response: any) => NexxFetch.nxHandleHTTPResponse(response), // Handle successful responses
  (error: AxiosError) => {
    // Process error response if available
    return NexxFetch.nxHandleHTTPResponse(error?.request);
  }
);

/**
 * NexxFetch class: Implements API interactions using React Query and Axios.
 */
class NexxFetch {
  /**
   * Handle HTTP responses
   */
  static nxHandleHTTPResponse = (response: any): any => {
    if (!response) return undefined;
    if (response.status === 200) {
      return response;
    } else if (response.status === 307) {
      // Log the redirect and return the "Location" URL for manual handling
      const redirectUrl = response.headers?.location;
      if (redirectUrl) {
        console.error(`Temporary Redirect: Redirect to ${redirectUrl}`);
        return Promise.reject({ status: 307, redirectUrl });
      }
      console.error('Temporary Redirect: No location header provided');
      return Promise.reject(new Error('Temporary Redirect without location'));
    } else if (response.status === 401) {
      console.error('Unauthorized: Status 401');
      return undefined;
    } else if (response.status === 404) {
      console.error('Page Not Found: Status 404');
      return undefined;
    } else if (response.status === 500) {
      console.error('Internal Server Error: Status 500');
      return undefined;
    }
    return undefined;
  };

  /**
   * GET request with React Query
   */
  static useGetData = <T>(
    url: string,
    queryKey: readonly any[],
    options = {}
  ) => {
    const queryResult = useQuery<AxiosResponse<T>, Error>({
      queryKey,
      queryFn: async (): Promise<AxiosResponse<T>> => {
        const response = await axiosInstance.get<T>(url); // Specify the generic type here
        console.log('Axios Response:', response);

        return response.data; // Return the full response object
      },
      ...options
    });

    return queryResult;
  };

  /**
   * POST request with React Query
   */
  /**
   * POST request with React Query
   */
  static usePostData = <T, U = unknown>(url: string, options = {}) => {
    return useMutation<AxiosResponse<T>, Error, U>({
      mutationFn: async (data: U) => {
        // Abort all ongoing requests before making a new one
        NexxFetch.cancelAllFetches();

        // Create a new AbortController for this request
        const controller = AbortControllerManager.addController(url);

        try {
          const response = await axiosInstance.post(url, JSON.stringify(data), {
            signal: controller.signal // Pass the abort signal to Axios
          });
          return response; 
        } finally {
          
          AbortControllerManager.removeController(url);
        }
      }
    });
  };

  /**
   * DELETE request with React Query
   */
  static useDeleteData = <T>(url: string) => {
    return useMutation<AxiosResponse<T>, Error, void>({
      mutationFn: async () => {
        const response = await axiosInstance.delete(url);
        return response; // Return the full response object
      }
    });
  };

  /**
   * WebSocket functionality (not managed by React Query)
   */
  static initiateWebSocket = (
    url: string,
    onMessageCallback?: (message: string) => void,
    onCloseCallback?: (event: CloseEvent) => void
  ): WebSocket => {
    const websocket = new WebSocket(url);

    // Handle WebSocket events
    websocket.onopen = () => console.log('WebSocket connection established');
    websocket.onmessage = (event) => {
      console.log('WebSocket message received:', event.data);
      if (onMessageCallback) onMessageCallback(event.data);
    };
    websocket.onclose = (event) => {
      console.log('WebSocket connection closed');
      if (onCloseCallback) onCloseCallback(event);
    };

    return websocket;
  };

  /**
   * Send a message through WebSocket
   */
  static sendWebSocketMessage = (
    websocket: WebSocket,
    message: string
  ): void => {
    websocket.send(message);
    console.log('Message sent over WebSocket:', message);
  };

  /**
   * Close a WebSocket connection
   */
  static closeWebSocket = (websocket: WebSocket): void => {
    websocket.close();
    console.log('WebSocket connection closed');
  };

  /**
   * Cancel all API requests
   */
  static cancelAllFetches = (): void => {
    AbortControllerManager.cancelAllRequests();
  };
}

export default NexxFetch;
