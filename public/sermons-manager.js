// ============================================
// SERMON MANAGEMENT SYSTEM
// ============================================

// Get YouTube video ID from various URL formats
function getYouTubeId(url) {
    if (!url) return null;
    
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }
    
    return null;
}

// Generate YouTube embed URL
function getYouTubeEmbedUrl(url) {
    const videoId = getYouTubeId(url);
    if (!videoId) return null;
    return `https://www.youtube.com/embed/${videoId}`;
}

// Generate YouTube thumbnail URL
function getYouTubeThumbnail(url) {
    const videoId = getYouTubeId(url);
    if (!videoId) return null;
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

// Cache for sermons to avoid repeated API calls
let sermonsCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5000; // 5 seconds

// Get all sermons from API
async function getAllSermons() {
    // Return cached data if available and fresh
    if (sermonsCache && cacheTimestamp && (Date.now() - cacheTimestamp) < CACHE_DURATION) {
        return sermonsCache;
    }

    try {
        const response = await fetch('/api/sermons');
        if (!response.ok) {
            throw new Error('Failed to fetch sermons');
        }
        const sermons = await response.json();
        sermonsCache = sermons;
        cacheTimestamp = Date.now();
        return sermons;
    } catch (error) {
        console.error('Error fetching sermons:', error);
        return [];
    }
}

// Clear cache (call after mutations)
function clearCache() {
    sermonsCache = null;
    cacheTimestamp = null;
}

// Add a new sermon
async function addSermon(sermonData) {
    try {
        const response = await fetch('/api/sermons', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sermonData),
        });

        if (!response.ok) {
            throw new Error('Failed to add sermon');
        }

        const newSermon = await response.json();
        clearCache(); // Clear cache so next getAllSermons() fetches fresh data
        return newSermon;
    } catch (error) {
        console.error('Error adding sermon:', error);
        throw error;
    }
}

// Update a sermon
async function updateSermon(id, sermonData) {
    try {
        const response = await fetch(`/api/sermons/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sermonData),
        });

        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }
            throw new Error('Failed to update sermon');
        }

        const updatedSermon = await response.json();
        clearCache(); // Clear cache so next getAllSermons() fetches fresh data
        return updatedSermon;
    } catch (error) {
        console.error('Error updating sermon:', error);
        throw error;
    }
}

// Delete a sermon
async function deleteSermon(id) {
    try {
        const response = await fetch(`/api/sermons/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            if (response.status === 404) {
                return false;
            }
            throw new Error('Failed to delete sermon');
        }

        clearCache(); // Clear cache so next getAllSermons() fetches fresh data
        return true;
    } catch (error) {
        console.error('Error deleting sermon:', error);
        return false;
    }
}

// Get a single sermon by ID
async function getSermonById(id) {
    const sermons = await getAllSermons();
    return sermons.find(s => s.id === id);
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// ============================================
// ADMIN PAGE FUNCTIONALITY
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Tab switching
    const tabs = document.querySelectorAll('.admin-tab');
    const tabContents = document.querySelectorAll('.admin-tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update active content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `tab-${targetTab}`) {
                    content.classList.add('active');
                }
            });
            
            // Reload lists if manage tabs
            if (targetTab === 'manage') {
                renderSermonsList();
            } else if (targetTab === 'manage-songs') {
                renderSongsList();
            } else if (targetTab === 'manage-services') {
                // Trigger services loading (handled by events-manager.js)
                setTimeout(() => {
                    if (window.loadServices) window.loadServices();
                }, 100);
            } else if (targetTab === 'manage-events') {
                // Trigger events loading (handled by events-manager.js)
                setTimeout(() => {
                    if (window.loadEvents) window.loadEvents();
                }, 100);
            }
        });
    });
    
    // YouTube URL preview
    const youtubeInput = document.getElementById('sermon-youtube');
    const youtubePreview = document.getElementById('youtube-preview');
    
    if (youtubeInput) {
        youtubeInput.addEventListener('input', () => {
            const url = youtubeInput.value;
            const embedUrl = getYouTubeEmbedUrl(url);
            
            if (embedUrl) {
                youtubePreview.innerHTML = `
                    <p style="margin-bottom: 0.5rem; font-weight: 600;">Preview:</p>
                    <iframe src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                `;
                youtubePreview.style.display = 'block';
            } else if (url) {
                youtubePreview.innerHTML = '<p style="color: #ef4444;">Invalid YouTube URL. Please check and try again.</p>';
                youtubePreview.style.display = 'block';
            } else {
                youtubePreview.style.display = 'none';
            }
        });
    }
    
    // Form submission
    const sermonForm = document.getElementById('sermon-form');
    let editingSermonId = null;
    
    if (sermonForm) {
        sermonForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(sermonForm);
            const sermonData = {
                title: formData.get('title'),
                speaker: formData.get('speaker'),
                date: formData.get('date'),
                series: formData.get('series') || '',
                description: formData.get('description'),
                youtube: formData.get('youtube'),
                audio: formData.get('audio') || '',
                download: formData.get('download') || ''
            };
            
            // Validate YouTube URL
            if (!getYouTubeId(sermonData.youtube)) {
                alert('Please enter a valid YouTube URL');
                return;
            }
            
            try {
                if (editingSermonId) {
                    // Update existing sermon
                    await updateSermon(editingSermonId, sermonData);
                    alert('Sermon updated successfully!');
                    editingSermonId = null;
                } else {
                    // Add new sermon
                    await addSermon(sermonData);
                    alert('Sermon added successfully!');
                }
                
                // Reset form
                sermonForm.reset();
                youtubePreview.style.display = 'none';
                
                // Switch to manage tab
                document.querySelector('[data-tab="manage"]').click();
            } catch (error) {
                alert('Error saving sermon. Please try again.');
                console.error('Error:', error);
            }
        });
    }
    
    // Reset form button
    const resetBtn = document.getElementById('reset-form');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            sermonForm.reset();
            youtubePreview.style.display = 'none';
            editingSermonId = null;
        });
    }
    
    // Render sermons list
    async function renderSermonsList() {
        const container = document.getElementById('sermons-list-container');
        if (!container) return;
        
        // Show loading state
        container.innerHTML = '<div class="empty-state"><p>Loading sermons...</p></div>';
        
        try {
            const sermons = await getAllSermons();
            
            if (sermons.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <p>No sermons added yet. Add your first sermon using the "Add New Sermon" tab.</p>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = sermons.map(sermon => `
                <div class="sermon-item">
                    <div class="sermon-item-info">
                        <h3>${sermon.title}</h3>
                        <p>${sermon.speaker} • ${formatDate(sermon.date)}</p>
                        ${sermon.series ? `<p style="color: var(--primary-color); font-size: 0.85rem;">Series: ${sermon.series}</p>` : ''}
                    </div>
                    <div class="sermon-item-actions">
                        <button class="btn btn-edit btn-small" onclick="editSermon('${sermon.id}')">Edit</button>
                        <button class="btn btn-danger btn-small" onclick="deleteSermonConfirm('${sermon.id}')">Delete</button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error rendering sermons list:', error);
            container.innerHTML = `
                <div class="empty-state">
                    <p>Error loading sermons. Please refresh the page.</p>
                </div>
            `;
        }
    }
    
    // Edit sermon function (global for onclick)
    window.editSermon = async function(id) {
        try {
            const sermon = await getSermonById(id);
            if (!sermon) {
                alert('Sermon not found');
                return;
            }
            
            // Populate form
            document.getElementById('sermon-title').value = sermon.title;
            document.getElementById('sermon-speaker').value = sermon.speaker;
            document.getElementById('sermon-date').value = sermon.date;
            document.getElementById('sermon-series').value = sermon.series || '';
            document.getElementById('sermon-description').value = sermon.description;
            document.getElementById('sermon-youtube').value = sermon.youtube;
            document.getElementById('sermon-audio').value = sermon.audio || '';
            document.getElementById('sermon-download').value = sermon.download || '';
            
            // Show preview
            const embedUrl = getYouTubeEmbedUrl(sermon.youtube);
            if (embedUrl) {
                youtubePreview.innerHTML = `
                    <p style="margin-bottom: 0.5rem; font-weight: 600;">Preview:</p>
                    <iframe src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                `;
                youtubePreview.style.display = 'block';
            }
            
            // Set editing mode
            editingSermonId = id;
            
            // Change submit button text
            const submitBtn = sermonForm.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Update Sermon';
            
            // Switch to add tab
            document.querySelector('[data-tab="add"]').click();
            
            // Scroll to form
            document.querySelector('.sermon-form').scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Error loading sermon for editing:', error);
            alert('Error loading sermon. Please try again.');
        }
    };
    
    // Delete sermon confirmation (global for onclick)
    window.deleteSermonConfirm = async function(id) {
        if (confirm('Are you sure you want to delete this sermon? This action cannot be undone.')) {
            try {
                const success = await deleteSermon(id);
                if (success) {
                    alert('Sermon deleted successfully!');
                    await renderSermonsList();
                } else {
                    alert('Error deleting sermon. Please try again.');
                }
            } catch (error) {
                console.error('Error deleting sermon:', error);
                alert('Error deleting sermon. Please try again.');
            }
        }
    };
    
    // Initial render
    renderSermonsList();

    // ============================================
    // SONG PDF MANAGEMENT
    // ============================================

    // Song PDF form submission with file upload
    const songForm = document.getElementById('song-form');
    const songFileInput = document.getElementById('song-pdf-file');
    const songSubmitBtn = document.getElementById('song-submit-btn');
    const songFilePreview = document.getElementById('song-file-preview');
    const songFileName = document.getElementById('song-file-name');

    // Show file name when selected
    if (songFileInput) {
        songFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                if (file.type !== 'application/pdf') {
                    alert('Please select a PDF file');
                    e.target.value = '';
                    songFilePreview.style.display = 'none';
                    return;
                }
                if (file.size > 10 * 1024 * 1024) {
                    alert('File size must be less than 10MB');
                    e.target.value = '';
                    songFilePreview.style.display = 'none';
                    return;
                }
                songFileName.textContent = file.name;
                songFilePreview.style.display = 'block';
            } else {
                songFilePreview.style.display = 'none';
            }
        });
    }

    if (songForm) {
        songForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const title = document.getElementById('song-title').value;
            const fileInput = document.getElementById('song-pdf-file');
            const file = fileInput.files[0];
            
            if (!title || !file) {
                alert('Please fill in all required fields and select a PDF file');
                return;
            }

            // Disable submit button during upload
            if (songSubmitBtn) {
                songSubmitBtn.disabled = true;
                songSubmitBtn.textContent = 'Uploading...';
            }
            
            try {
                // Step 1: Upload the file
                const uploadFormData = new FormData();
                uploadFormData.append('pdfFile', file);
                uploadFormData.append('title', title);

                const uploadResponse = await fetch('/api/upload-song-pdf', {
                    method: 'POST',
                    body: uploadFormData,
                });

                if (!uploadResponse.ok) {
                    const errorData = await uploadResponse.json();
                    throw new Error(errorData.error || 'Failed to upload file');
                }

                const uploadResult = await uploadResponse.json();

                // Step 2: Add the song PDF to the database
                const songData = {
                    title: title,
                    pdfUrl: uploadResult.url
                };

                await addSongPDF(songData);
                alert('Song PDF uploaded and added successfully!');
                
                // Reset form
                songForm.reset();
                songFilePreview.style.display = 'none';
                
                // Switch to manage tab
                document.querySelector('[data-tab="manage-songs"]').click();
            } catch (error) {
                alert('Error uploading song PDF: ' + error.message);
                console.error('Error:', error);
            } finally {
                // Re-enable submit button
                if (songSubmitBtn) {
                    songSubmitBtn.disabled = false;
                    songSubmitBtn.textContent = 'Upload & Add Song PDF';
                }
            }
        });
    }

    // Reset song form button
    const resetSongBtn = document.getElementById('reset-song-form');
    if (resetSongBtn) {
        resetSongBtn.addEventListener('click', () => {
            songForm.reset();
        });
    }

    // Render songs list
    async function renderSongsList() {
        const container = document.getElementById('songs-list-container');
        if (!container) return;
        
        // Show loading state
        container.innerHTML = '<div class="empty-state"><p>Loading song PDFs...</p></div>';
        
        try {
            const songs = await getAllSongPDFs();
            
            if (songs.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <p>No song PDFs added yet. Add your first song PDF using the "Add Song PDF" tab.</p>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = songs.map(song => `
                <div class="sermon-item">
                    <div class="sermon-item-info">
                        <h3>${song.title}</h3>
                        <p style="color: var(--text-light); font-size: 0.9rem;">Added: ${new Date(song.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div class="sermon-item-actions">
                        <a href="${song.pdfUrl}" target="_blank" class="btn btn-edit btn-small">View PDF</a>
                        <button class="btn btn-danger btn-small" onclick="deleteSongPDFConfirm('${song.id}')">Delete</button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error rendering songs list:', error);
            container.innerHTML = `
                <div class="empty-state">
                    <p>Error loading song PDFs. Please refresh the page.</p>
                </div>
            `;
        }
    }

    // Delete song PDF confirmation (global for onclick)
    window.deleteSongPDFConfirm = async function(id) {
        if (confirm('Are you sure you want to delete this song PDF? This action cannot be undone.')) {
            try {
                const success = await deleteSongPDF(id);
                if (success) {
                    alert('Song PDF deleted successfully!');
                    await renderSongsList();
                } else {
                    alert('Error deleting song PDF. Please try again.');
                }
            } catch (error) {
                console.error('Error deleting song PDF:', error);
                alert('Error deleting song PDF. Please try again.');
            }
        }
    };
});

// ============================================
// SONG PDF API FUNCTIONS
// ============================================

// Cache for song PDFs
let songsCache = null;
let songsCacheTimestamp = null;
const SONGS_CACHE_DURATION = 5000; // 5 seconds

// Get all song PDFs from API
async function getAllSongPDFs() {
    // Return cached data if available and fresh
    if (songsCache && songsCacheTimestamp && (Date.now() - songsCacheTimestamp) < SONGS_CACHE_DURATION) {
        return songsCache;
    }

    try {
        const response = await fetch('/api/song-pdfs');
        if (!response.ok) {
            throw new Error('Failed to fetch song PDFs');
        }
        const songs = await response.json();
        songsCache = songs;
        songsCacheTimestamp = Date.now();
        return songs;
    } catch (error) {
        console.error('Error fetching song PDFs:', error);
        return [];
    }
}

// Clear songs cache
function clearSongsCache() {
    songsCache = null;
    songsCacheTimestamp = null;
}

// Add a new song PDF
async function addSongPDF(songData) {
    try {
        const response = await fetch('/api/song-pdfs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(songData),
        });

        if (!response.ok) {
            throw new Error('Failed to add song PDF');
        }

        const newSong = await response.json();
        clearSongsCache(); // Clear cache so next getAllSongPDFs() fetches fresh data
        return newSong;
    } catch (error) {
        console.error('Error adding song PDF:', error);
        throw error;
    }
}

// Delete a song PDF
async function deleteSongPDF(id) {
    try {
        const response = await fetch(`/api/song-pdfs/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            if (response.status === 404) {
                return false;
            }
            throw new Error('Failed to delete song PDF');
        }

        clearSongsCache(); // Clear cache so next getAllSongPDFs() fetches fresh data
        return true;
    } catch (error) {
        console.error('Error deleting song PDF:', error);
        return false;
    }
}

// ============================================
// SERMONS PAGE FUNCTIONALITY
// ============================================
async function loadSermonsForDisplay() {
    const sermons = await getAllSermons();
    
    if (sermons.length === 0) {
        // Show default/empty state
        return [];
    }
    
    // Sort by date (newest first)
    const sortedSermons = [...sermons].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return sortedSermons;
}

// Render featured sermon (latest)
async function renderFeaturedSermon() {
    const featuredSection = document.querySelector('.featured-sermon') || document.getElementById('featured-sermon-container');
    
    if (!featuredSection) return;
    
    try {
        const sermons = await loadSermonsForDisplay();
        
        if (!sermons || sermons.length === 0) {
            featuredSection.innerHTML = `
                <div class="featured-sermon-content">
                    <div class="featured-badge">Latest Message</div>
                    <h2>No sermons available yet</h2>
                    <p class="sermon-meta">Check back soon for new messages</p>
                    <p class="sermon-description">We're preparing inspiring content for you.</p>
                </div>
                <div class="featured-sermon-video">
                    <div class="video-placeholder">
                        <div class="play-button">📖</div>
                        <p>Coming Soon</p>
                    </div>
                </div>
            `;
            return;
        }
        
        const featured = sermons[0];
        const embedUrl = getYouTubeEmbedUrl(featured.youtube);
        const thumbnailUrl = getYouTubeThumbnail(featured.youtube);
        
        featuredSection.innerHTML = `
            <div class="featured-sermon-content">
                <div class="featured-badge">Latest Message</div>
                <h2>${featured.title}</h2>
                <p class="sermon-meta">${featured.speaker} • ${formatDate(featured.date)}</p>
                <p class="sermon-description">${featured.description}</p>
                <div class="sermon-actions">
                    <button class="btn btn-primary" onclick="openVideoModal('${featured.id}')">Watch Now</button>
                    ${featured.audio ? `<a href="${featured.audio}" target="_blank" class="btn btn-outline">Listen</a>` : ''}
                    ${featured.download ? `<a href="${featured.download}" target="_blank" class="btn btn-outline">Download</a>` : ''}
                </div>
            </div>
            <div class="featured-sermon-video">
                ${embedUrl ? `
                    <iframe 
                        src="${embedUrl}" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen
                        style="width: 100%; height: 100%; min-height: 300px; border-radius: 15px;">
                    </iframe>
                ` : `
                    <div class="video-placeholder">
                        <div class="play-button">▶</div>
                        <p>No video available</p>
                    </div>
                `}
            </div>
        `;
    } catch (error) {
        console.error('Error rendering featured sermon:', error);
        featuredSection.innerHTML = `
            <div class="featured-sermon-content">
                <div class="featured-badge">Latest Message</div>
                <h2>Error loading sermons</h2>
                <p class="sermon-meta">Please refresh the page</p>
            </div>
        `;
    }
}

// Render sermons grid
async function renderSermonsGrid() {
    const grid = document.querySelector('.sermons-grid') || document.getElementById('sermons-grid-container');
    
    if (!grid) return;
    
    try {
        const sermons = await loadSermonsForDisplay();
        
        if (!sermons || sermons.length === 0) {
            grid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                    <p>No sermons available yet. Check back soon!</p>
                </div>
            `;
            return;
        }
        
        // Skip first sermon (it's featured)
        const gridSermons = sermons.slice(1);
        
        grid.innerHTML = gridSermons.map(sermon => {
            const thumbnailUrl = getYouTubeThumbnail(sermon.youtube);
            const embedUrl = getYouTubeEmbedUrl(sermon.youtube);
            
            return `
                <div class="sermon-card animate-on-scroll">
                    <div class="sermon-image" style="background-image: url('${thumbnailUrl}'); background-size: cover; background-position: center;">
                        <div class="play-overlay" onclick="openVideoModal('${sermon.id}')">
                            <div class="play-icon">▶</div>
                        </div>
                    </div>
                    <div class="sermon-info">
                        <h3>${sermon.title}</h3>
                        <p class="sermon-meta">${sermon.speaker} • ${formatDate(sermon.date)}</p>
                        <p>${sermon.description}</p>
                        <div class="sermon-links">
                            <a href="#" onclick="openVideoModal('${sermon.id}'); return false;">Watch</a>
                            ${sermon.audio ? `<a href="${sermon.audio}" target="_blank">Listen</a>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error rendering sermons grid:', error);
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <p>Error loading sermons. Please refresh the page.</p>
            </div>
        `;
    }
}

// Video modal
async function openVideoModal(sermonId) {
    const sermon = await getSermonById(sermonId);
    if (!sermon) {
        alert('Sermon not found');
        return;
    }
    
    const embedUrl = getYouTubeEmbedUrl(sermon.youtube);
    if (!embedUrl) {
        alert('Video not available');
        return;
    }
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'video-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
    `;
    
    modal.innerHTML = `
        <div style="position: relative; width: 100%; max-width: 900px;">
            <button onclick="this.closest('.video-modal').remove(); document.body.style.overflow = '';" 
                    style="position: absolute; top: -40px; right: 0; background: white; border: none; width: 40px; height: 40px; border-radius: 50%; font-size: 24px; cursor: pointer; z-index: 10001;">&times;</button>
            <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
                <iframe 
                    src="${embedUrl}?autoplay=1" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen
                    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 10px;">
                </iframe>
            </div>
            <div style="background: white; padding: 1.5rem; border-radius: 0 0 10px 10px; margin-top: -5px;">
                <h3 style="margin: 0 0 0.5rem 0; color: var(--text-dark);">${sermon.title}</h3>
                <p style="margin: 0; color: var(--text-light); font-size: 0.9rem;">${sermon.speaker} • ${formatDate(sermon.date)}</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    });
}

// Make functions globally available
window.openVideoModal = openVideoModal;

// Initialize on sermons page
if (document.querySelector('.sermons-grid') || document.querySelector('.featured-sermon')) {
    document.addEventListener('DOMContentLoaded', async () => {
        await renderFeaturedSermon();
        await renderSermonsGrid();
        
        // Re-observe animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                }
            });
        }, observerOptions);
        
        document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
    });
}

