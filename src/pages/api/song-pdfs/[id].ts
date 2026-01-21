import type { APIRoute } from 'astro';
import { db, storage } from '../../../lib/firebase-admin';

// Mark this API route as server-rendered (not static)
export const prerender = false;

const SONGS_COLLECTION = 'songPdfs';

// DELETE - Delete a song PDF
export const DELETE: APIRoute = async ({ params }) => {
    try {
        const id = params.id;
        if (!id) {
            return new Response(JSON.stringify({ error: 'Song ID is required' }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        const songRef = db.collection(SONGS_COLLECTION).doc(id);
        const songSnap = await songRef.get();

        if (!songSnap.exists) {
            return new Response(JSON.stringify({ error: 'Song PDF not found' }), {
                status: 404,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        const songData = songSnap.data();
        
        // Delete the PDF file from Firebase Storage if it's a Firebase Storage URL
        if (songData?.pdfUrl && songData.pdfUrl.startsWith('https://firebasestorage.googleapis.com')) {
            try {
                // Extract the file path from the Storage URL
                const url = new URL(songData.pdfUrl);
                const pathMatch = url.pathname.match(/\/o\/(.+)\?/);
                if (pathMatch) {
                    const filePath = decodeURIComponent(pathMatch[1]);
                    const bucket = storage.bucket();
                    const file = bucket.file(filePath);
                    await file.delete();
                }
            } catch (storageError) {
                console.error('Error deleting file from Storage:', storageError);
                // Continue with Firestore deletion even if Storage deletion fails
            }
        }

        // Delete the document from Firestore
        await songRef.delete();

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Error deleting song PDF:', error);
        return new Response(JSON.stringify({ error: 'Failed to delete song PDF' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
};

