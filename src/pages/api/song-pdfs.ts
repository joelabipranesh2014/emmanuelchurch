import type { APIRoute } from 'astro';
import { db } from '../../lib/firebase-admin';

// Mark this API route as server-rendered (not static)
export const prerender = false;

const SONGS_COLLECTION = 'songPdfs';
const MAX_SONGS = 7;

// Read song PDFs from Firestore
async function readSongPDFs() {
    try {
        const songsRef = db.collection(SONGS_COLLECTION);
        const snapshot = await songsRef
            .orderBy('createdAt', 'desc')
            .limit(MAX_SONGS)
            .get();
        
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt
        }));
    } catch (error) {
        console.error('Error reading song PDFs:', error);
        return [];
    }
}

// GET - Get all song PDFs
export const GET: APIRoute = async () => {
    try {
        const songs = await readSongPDFs();
        return new Response(JSON.stringify(songs), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch song PDFs' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
};

// POST - Add a new song PDF (after file upload)
export const POST: APIRoute = async ({ request }) => {
    try {
        const songData = await request.json();
        
        // Validate required fields
        if (!songData.title || !songData.pdfUrl) {
            return new Response(JSON.stringify({ error: 'Missing required fields: title and pdfUrl are required' }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        const songsRef = db.collection(SONGS_COLLECTION);
        const newSong = {
            title: songData.title,
            pdfUrl: songData.pdfUrl,
            createdAt: new Date(),
        };
        
        const docRef = await songsRef.add(newSong);
        
        const createdSong = {
            id: docRef.id,
            ...newSong,
            createdAt: newSong.createdAt.toISOString(),
        };

        return new Response(JSON.stringify(createdSong), {
            status: 201,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Error adding song PDF:', error);
        return new Response(JSON.stringify({ error: 'Failed to add song PDF' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
};

