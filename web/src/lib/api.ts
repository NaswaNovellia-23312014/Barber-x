import { getAuthToken } from './auth'; 
import { Service, Booking, User } from '@/types'; 

export const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface MessageResponse {
  message: string;
}

// Interface untuk menangkap respon nested dari API 
interface ServiceResponse {
  service: Service;
}

async function authenticatedFetcher<T>(
  path: string, 
  options: RequestInit = {}, 
  requireAuth: boolean = false
): Promise<T> {
    if (!API_URL) {
        throw new Error('NEXT_PUBLIC_API_URL is not defined in .env.local');
    }

    const url = `${API_URL}${path}`;
    
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    };

    if (requireAuth) {
        const token = getAuthToken();
        if (!token) {
            throw new Error('UNAUTHENTICATED: No token found.');
        }
        headers['Authorization'] = `Bearer ${token}`; 
    }

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401 && requireAuth) {
        throw new Error('UNAUTHORIZED: Token expired.');
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error((errorData as MessageResponse).message || 'API Error');
    }

    if (response.status === 204) return null as T;

    return await response.json();
}

// ADMIN API FUNCTIONS

export async function loginAdmin(username: string, password: string): Promise<{ token: string, admin: User }> {
  return await authenticatedFetcher<{ token: string, admin: User }>('/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  }, false); 
}

export async function getAdminServices(): Promise<Service[]> {
  const response = await authenticatedFetcher<{ data: Service[] }>('/admin/services', {}, true);
  return response.data;
}

export async function createService(serviceData: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Promise<Service> {
  const response = await authenticatedFetcher<ServiceResponse>('/admin/services', {
    method: 'POST',
    body: JSON.stringify(serviceData),
  }, true);
  // Ambil service dari dalam objek { service: {...} }
  return response.service;
}

export async function updateService(id: string, serviceData: Partial<Service>): Promise<Service> {
  const response = await authenticatedFetcher<ServiceResponse>(`/admin/services?id=${id}`, {
    method: 'PUT',
    body: JSON.stringify(serviceData),
  }, true);
  return response.service || (response as Service);
}

// SERVICES - DELETE
export async function deleteService(id: string): Promise<void> {
  await authenticatedFetcher<MessageResponse>('/admin/services?id=' + id, {
    method: 'DELETE',
  }, true);
  return; 
}

// BOOKINGS - READ
export async function getAdminBookings(): Promise<Booking[]> {
    const response = await authenticatedFetcher<{ data: Booking[] }>('/admin/bookings', {
        cache: 'no-store'
    }, true);
    return response.data; 
}

// BOOKINGS - UPDATE STATUS
export async function updateBookingStatus(
    id: string, 
    data: { status: Booking['status'] }
): Promise<Booking> {
    const response = await authenticatedFetcher<{ booking: Booking }>('/admin/bookings?id=' + id, {
        method: 'PUT',
        body: JSON.stringify(data),
    }, true);
    return response.booking || (response as Booking);
}

// BOOKINGS - DELETE
export async function deleteBooking(id: string): Promise<void> {
    await authenticatedFetcher<MessageResponse>('/admin/bookings?id=' + id, {
        method: 'DELETE',
    }, true);
    return;
}