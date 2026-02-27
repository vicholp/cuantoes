import axios from 'axios';

const api = axios.create();

api.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

api.defaults.withCredentials = true;
api.defaults.withXSRFToken = true;

api.defaults.baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export function createReceipt(data) {
    return api.post('/receipts', data);
}

export function getReceiptItems(id) {
    return api.get(`/receipts/${id}/items`);
}

export function claim(receiptId, itemId, data) {
    return api.post(`/receipts/${receiptId}/items/${itemId}/claim`, data);
}

export function updateClaimant(claimantUuid, data) {
    return api.post(`/claimants/${claimantUuid}`, data);
}