// API utility functions for frontend
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`)
  }

  return response.json()
}

export const api = {
  services: {
    getAll: () => fetchAPI("/api/services"),
    getById: (id: string) => fetchAPI(`/api/services/${id}`),
  },
  availability: {
    getSlots: (serviceId: string, date: string, staffId?: string) => {
      const params = new URLSearchParams({ service_id: serviceId, date })
      if (staffId) params.append("staff_id", staffId)
      return fetchAPI(`/api/availability/slots?${params}`)
    },
  },
  bookings: {
    create: (data: any) => fetchAPI("/api/bookings", { method: "POST", body: JSON.stringify(data) }),
    getById: (id: string) => fetchAPI(`/api/bookings/${id}`),
    update: (id: string, data: any) => fetchAPI(`/api/bookings/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  },
  payments: {
    createIntent: (data: any) =>
      fetchAPI("/api/payments/create-intent", { method: "POST", body: JSON.stringify(data) }),
    confirm: (id: string, status: string) =>
      fetchAPI(`/api/payments/${id}/confirm`, { method: "POST", body: JSON.stringify({ transaction_status: status }) }),
  },
}
