import type { APIRoute } from 'astro';
import { db } from '../../../lib/firebase-admin';

// Mark this API route as server-rendered (not static)
export const prerender = false;

const SERVICES_COLLECTION = 'weeklyServices';

// PUT - Update a weekly service
export const PUT: APIRoute = async ({ params, request }) => {
    try {
        const id = params.id;
        if (!id) {
            return new Response(JSON.stringify({ error: 'Service ID is required' }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        const serviceData = await request.json();
        const serviceRef = db.collection(SERVICES_COLLECTION).doc(id);
        const serviceSnap = await serviceRef.get();

        if (!serviceSnap.exists) {
            return new Response(JSON.stringify({ error: 'Service not found' }), {
                status: 404,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        await serviceRef.update({
            ...serviceData,
            updatedAt: new Date(),
        });

        const updatedService = {
            id: serviceSnap.id,
            ...serviceSnap.data(),
            ...serviceData,
        };

        return new Response(JSON.stringify(updatedService), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error: any) {
        console.error('Error updating service:', error);
        return new Response(JSON.stringify({ error: 'Failed to update service' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
};

// DELETE - Delete a weekly service
export const DELETE: APIRoute = async ({ params }) => {
    try {
        const id = params.id;
        if (!id) {
            return new Response(JSON.stringify({ error: 'Service ID is required' }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        const serviceRef = db.collection(SERVICES_COLLECTION).doc(id);
        const serviceSnap = await serviceRef.get();

        if (!serviceSnap.exists) {
            return new Response(JSON.stringify({ error: 'Service not found' }), {
                status: 404,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        await serviceRef.delete();

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Error deleting service:', error);
        return new Response(JSON.stringify({ error: 'Failed to delete service' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
};

