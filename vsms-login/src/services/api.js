const BASE_URL = 'http://localhost:5000/api';

/**
 * Enhanced Fetch Wrapper (Mimics Axios Response Structure)
 */
async function request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    
    const defaultHeaders = {
        'Content-Type': 'application/json',
    };

    const response = await fetch(url, {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'API Request Failed');
    }

    const data = await response.json();
    return { data }; // Wrap in { data } to match existing component logic
}

// Vehicles
export const fetchVehicles = (customerId) => request(`/vehicles/${customerId}`);
export const addVehicle = (vehicleData) => request('/vehicles', {
    method: 'POST',
    body: JSON.stringify(vehicleData)
});
export const updateVehicle = (vehicleId, vehicleData) => request(`/vehicles/${vehicleId}`, {
    method: 'PUT',
    body: JSON.stringify(vehicleData)
});
export const deleteVehicle = (vehicleId) => request(`/vehicles/${vehicleId}`, {
    method: 'DELETE'
});

// User Profile
export const fetchUserProfile = (userId) => request(`/user/${userId}`);
export const updateUserProfile = (userId, userData) => request(`/user/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(userData)
});
export const changeUserPassword = (userId, passwordData) => request(`/user/${userId}/password`, {
    method: 'PUT',
    body: JSON.stringify(passwordData)
});

// Service Requests
export const bookService = (bookingData) => request('/service-requests', {
    method: 'POST',
    body: JSON.stringify(bookingData)
});

export const fetchCustomerServices = (customerId) => request(`/service-requests/customer/${customerId}`);
export const fetchMechanicRequests = (mechanicId) => request(`/mechanic/${mechanicId}/requests`);
export const fetchServiceUpdates = (requestId) => request(`/service-requests/${requestId}/updates`);
export const updateServiceStatus = (requestId, updateData) => request(`/service-requests/${requestId}/status`, {
    method: 'PATCH',
    body: JSON.stringify(updateData)
});
export const saveServiceNotes = (requestId, notes) => request(`/service-requests/${requestId}/notes`, {
    method: 'PATCH',
    body: JSON.stringify({ notes })
});

// Notifications
export const fetchNotifications = (userId) => request(`/notifications/${userId}`);
export const markNotificationAsRead = (notifId) => request(`/notifications/${notifId}/read`, {
    method: 'PATCH'
});
export const clearNotifications = (userId) => request(`/notifications/${userId}/clear`, {
    method: 'DELETE'
});

// Invoices
export const fetchCustomerInvoices = (customerId) => request(`/invoices/customer/${customerId}`);
export const fetchInvoiceDetail = (invoiceId) => request(`/invoices/${invoiceId}`);
export const fetchInvoiceByRequestId = (requestId) => request(`/invoices/request/${requestId}`);

const API = {
    get: (url) => request(url),
    post: (url, data) => request(url, { method: 'POST', body: JSON.stringify(data) }),
    patch: (url, data) => request(url, { method: 'PATCH', body: JSON.stringify(data) }),
};

export default API;
