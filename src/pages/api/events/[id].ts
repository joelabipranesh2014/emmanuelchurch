import type { APIRoute } from 'astro';
import { db } from '../../../lib/firebase-admin';

// Mark this API route as server-rendered (not static)
export const prerender = false;

const EVENTS_COLLECTION = 'upcomingEvents';

// PUT - Update an upcoming event
export const PUT: APIRoute = async ({ params, request }) => {
    try {
        const id = params.id;
        if (!id) {
            return new Response(JSON.stringify({ error: 'Event ID is required' }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        const eventData = await request.json();
        const eventRef = db.collection(EVENTS_COLLECTION).doc(id);
        const eventSnap = await eventRef.get();

        if (!eventSnap.exists) {
            return new Response(JSON.stringify({ error: 'Event not found' }), {
                status: 404,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        const updateData: any = {
            ...eventData,
            updatedAt: new Date(),
        };

        // Convert date string to Date object if provided
        if (eventData.date) {
            updateData.date = new Date(eventData.date);
        }

        await eventRef.update(updateData);

        const updatedEvent = {
            id: eventSnap.id,
            ...eventSnap.data(),
            ...updateData,
            date: updateData.date?.toISOString() || eventSnap.data()?.date,
        };

        return new Response(JSON.stringify(updatedEvent), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error: any) {
        console.error('Error updating event:', error);
        return new Response(JSON.stringify({ error: 'Failed to update event' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
};

// DELETE - Delete an upcoming event
export const DELETE: APIRoute = async ({ params }) => {
    try {
        const id = params.id;
        if (!id) {
            return new Response(JSON.stringify({ error: 'Event ID is required' }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        const eventRef = db.collection(EVENTS_COLLECTION).doc(id);
        const eventSnap = await eventRef.get();

        if (!eventSnap.exists) {
            return new Response(JSON.stringify({ error: 'Event not found' }), {
                status: 404,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        await eventRef.delete();

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Error deleting event:', error);
        return new Response(JSON.stringify({ error: 'Failed to delete event' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
};

