import type { APIRoute } from 'astro';
import { db } from '../../lib/firebase-admin';

// Mark this API route as server-rendered (not static)
export const prerender = false;

const EVENTS_COLLECTION = 'upcomingEvents';
const MAX_EVENTS = 20;

// Read upcoming events from Firestore
async function readEvents() {
    try {
        const eventsRef = db.collection(EVENTS_COLLECTION);
        const snapshot = await eventsRef
            .orderBy('date', 'asc')
            .get();
        
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date?.toDate?.()?.toISOString() || doc.data().date,
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt
        }));
    } catch (error) {
        console.error('Error reading events:', error);
        return [];
    }
}

// GET - Get all upcoming events
export const GET: APIRoute = async () => {
    try {
        const events = await readEvents();
        // Filter out past events
        const now = new Date();
        const upcomingEvents = events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= now;
        });
        return new Response(JSON.stringify(upcomingEvents), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error: any) {
        console.error('Error fetching events:', error);
        const errorMessage = error?.message || 'Failed to fetch events';
        return new Response(JSON.stringify({ 
            error: 'Failed to fetch events',
            details: errorMessage,
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
};

// POST - Add a new upcoming event
export const POST: APIRoute = async ({ request }) => {
    try {
        const eventData = await request.json();
        
        // Validate required fields
        if (!eventData.title || !eventData.date || !eventData.description) {
            return new Response(JSON.stringify({ error: 'Missing required fields: title, date, and description are required' }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        const eventsRef = db.collection(EVENTS_COLLECTION);
        const newEvent = {
            ...eventData,
            date: new Date(eventData.date),
            createdAt: new Date(),
        };
        
        const docRef = await eventsRef.add(newEvent);
        
        const createdEvent = {
            id: docRef.id,
            ...newEvent,
            date: newEvent.date.toISOString(),
            createdAt: newEvent.createdAt.toISOString(),
        };

        return new Response(JSON.stringify(createdEvent), {
            status: 201,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error: any) {
        console.error('Error adding event:', error);
        const errorMessage = error?.message || 'Failed to add event';
        return new Response(JSON.stringify({ 
            error: 'Failed to add event',
            details: errorMessage,
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
};

