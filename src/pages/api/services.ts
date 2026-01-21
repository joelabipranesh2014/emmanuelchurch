import type { APIRoute } from 'astro';
import { db } from '../../lib/firebase-admin';

// Mark this API route as server-rendered (not static)
export const prerender = false;

const SERVICES_COLLECTION = 'weeklyServices';
const MAX_SERVICES = 10;

// Read weekly services from Firestore
async function readServices() {
    try {
        const servicesRef = db.collection(SERVICES_COLLECTION);
        const snapshot = await servicesRef
            .orderBy('time', 'asc')
            .get();
        
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt
        }));
    } catch (error) {
        console.error('Error reading services:', error);
        return [];
    }
}

// GET - Get all weekly services
export const GET: APIRoute = async () => {
    try {
        const services = await readServices();
        return new Response(JSON.stringify(services), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error: any) {
        console.error('Error fetching services:', error);
        const errorMessage = error?.message || 'Failed to fetch services';
        return new Response(JSON.stringify({ 
            error: 'Failed to fetch services',
            details: errorMessage,
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
};

// POST - Add a new weekly service
export const POST: APIRoute = async ({ request }) => {
    try {
        const serviceData = await request.json();
        
        // Validate required fields
        if (!serviceData.time || !serviceData.title || !serviceData.description) {
            return new Response(JSON.stringify({ error: 'Missing required fields: time, title, and description are required' }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        const servicesRef = db.collection(SERVICES_COLLECTION);
        const newService = {
            ...serviceData,
            createdAt: new Date(),
        };
        
        const docRef = await servicesRef.add(newService);
        
        const createdService = {
            id: docRef.id,
            ...newService,
            createdAt: newService.createdAt.toISOString(),
        };

        return new Response(JSON.stringify(createdService), {
            status: 201,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error: any) {
        console.error('Error adding service:', error);
        const errorMessage = error?.message || 'Failed to add service';
        return new Response(JSON.stringify({ 
            error: 'Failed to add service',
            details: errorMessage,
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
};

