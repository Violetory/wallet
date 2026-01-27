// lib/utils.ts
export function formatDate(date: string | number | Date) {
    const data = new Date(date);
    return data.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}