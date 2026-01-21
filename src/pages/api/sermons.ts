import type { APIRoute } from 'astro';
import { db } from '../../lib/firebase-admin';

// Mark this API route as server-rendered (not static)
export const prerender = false;

const SERMONS_COLLECTION = 'sermons';
const MAX_SERMONS = 7;

// Read sermons from Firestore
async function readSermons() {
    try {
        const sermonsRef = db.collection(SERMONS_COLLECTION);
        const snapshot = await sermonsRef
            .orderBy('createdAt', 'desc')
            .limit(MAX_SERMONS)
            .get();
        
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt
        }));
    } catch (error) {
        console.error('Error reading sermons:', error);
        return [];
    }
}

// GET - Get all sermons
export const GET: APIRoute = async () => {
    try {
        const sermons = await readSermons();
        return new Response(JSON.stringify(sermons), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error: any) {
        console.error('Error fetching sermons:', error);
        const errorMessage = error?.message || 'Failed to fetch sermons';
        return new Response(JSON.stringify({ 
            error: 'Failed to fetch sermons',
            details: errorMessage,
            hint: errorMessage.includes('credentials') || errorMessage.includes('Could not load')
                ? 'Firebase Admin SDK needs credentials. See FIREBASE_SETUP.md for setup instructions.'
                : undefined
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
};

// POST - Add a new sermon
export const POST: APIRoute = async ({ request }) => {
    try {
        const sermonData = await request.json();
        
        // Validate required fields
        if (!sermonData.title || !sermonData.speaker || !sermonData.date || !sermonData.youtube) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        const sermonsRef = db.collection(SERMONS_COLLECTION);
        const newSermon = {
            ...sermonData,
            createdAt: new Date(),
        };
        
        const docRef = await sermonsRef.add(newSermon);
        
        const createdSermon = {
            id: docRef.id,
            ...newSermon,
            createdAt: newSermon.createdAt.toISOString(),
        };

        return new Response(JSON.stringify(createdSermon), {
            status: 201,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error: any) {
        console.error('Error adding sermon:', error);
        const errorMessage = error?.message || 'Failed to add sermon';
        return new Response(JSON.stringify({ 
            error: 'Failed to add sermon',
            details: errorMessage,
            hint: errorMessage.includes('credentials') || errorMessage.includes('Could not load') 
                ? 'Firebase Admin SDK needs credentials. See FIREBASE_SETUP.md for setup instructions.'
                : undefined
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
};

