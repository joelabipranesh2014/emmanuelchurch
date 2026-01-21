// Events and Services Manager
// Handles CRUD operations for weekly services and upcoming events

// ============================================
// WEEKLY SERVICES FUNCTIONS
// ============================================

// Cache for services
let servicesCache = null;
let servicesCacheTimestamp = null;
const SERVICES_CACHE_DURATION = 5000; // 5 seconds

// Get all weekly services
async function getAllServices() {
    if (servicesCache && servicesCacheTimestamp && (Date.now() - servicesCacheTimestamp) < SERVICES_CACHE_DURATION) {
        return servicesCache;
    }

    try {
        const response = await fetch('/api/services');
        if (!response.ok) {
            throw new Error('Failed to fetch services');
        }
        const services = await response.json();
        servicesCache = services;
        servicesCacheTimestamp = Date.now();
        return services;
    } catch (error) {
        console.error('Error fetching services:', error);
        return [];
    }
}

// Add a new service
async function addService(serviceData) {
    try {
        const response = await fetch('/api/services', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(serviceData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to add service');
        }

        servicesCache = null; // Clear cache
        return await response.json();
    } catch (error) {
        console.error('Error adding service:', error);
        throw error;
    }
}

// Update a service
async function updateService(id, serviceData) {
    try {
        const response = await fetch(`/api/services/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(serviceData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update service');
        }

        servicesCache = null; // Clear cache
        return await response.json();
    } catch (error) {
        console.error('Error updating service:', error);
        throw error;
    }
}

// Delete a service
async function deleteService(id) {
    try {
        const response = await fetch(`/api/services/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete service');
        }

        servicesCache = null; // Clear cache
        return true;
    } catch (error) {
        console.error('Error deleting service:', error);
        throw error;
    }
}

// ============================================
// UPCOMING EVENTS FUNCTIONS
// ============================================

// Cache for events
let eventsCache = null;
let eventsCacheTimestamp = null;
const EVENTS_CACHE_DURATION = 5000; // 5 seconds

// Get all upcoming events
async function getAllEvents() {
    if (eventsCache && eventsCacheTimestamp && (Date.now() - eventsCacheTimestamp) < EVENTS_CACHE_DURATION) {
        return eventsCache;
    }

    try {
        const response = await fetch('/api/events');
        if (!response.ok) {
            throw new Error('Failed to fetch events');
        }
        const events = await response.json();
        eventsCache = events;
        eventsCacheTimestamp = Date.now();
        return events;
    } catch (error) {
        console.error('Error fetching events:', error);
        return [];
    }
}

// Add a new event
async function addEvent(eventData) {
    try {
        const response = await fetch('/api/events', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(eventData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to add event');
        }

        eventsCache = null; // Clear cache
        return await response.json();
    } catch (error) {
        console.error('Error adding event:', error);
        throw error;
    }
}

// Update an event
async function updateEvent(id, eventData) {
    try {
        const response = await fetch(`/api/events/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(eventData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update event');
        }

        eventsCache = null; // Clear cache
        return await response.json();
    } catch (error) {
        console.error('Error updating event:', error);
        throw error;
    }
}

// Delete an event
async function deleteEvent(id) {
    try {
        const response = await fetch(`/api/events/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete event');
        }

        eventsCache = null; // Clear cache
        return true;
    } catch (error) {
        console.error('Error deleting event:', error);
        throw error;
    }
}

// Format date for display
function formatEventDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const month = months[date.getMonth()];
    return { day, month };
}

// ============================================
// ADMIN PAGE FUNCTIONALITY
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Note: Tab switching is handled by sermons-manager.js

    // Service form submission
    const serviceForm = document.getElementById('service-form');
    let editingServiceId = null;
    
    if (serviceForm) {
        serviceForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(serviceForm);
            const serviceData = {
                time: formData.get('time'),
                title: formData.get('title'),
                description: formData.get('description'),
                location: formData.get('location') || 'Main Sanctuary',
                duration: formData.get('duration') || '75 minutes',
                childcare: formData.get('childcare') || 'Available',
                featured: formData.get('featured') === 'on'
            };
            
            try {
                if (editingServiceId) {
                    await updateService(editingServiceId, serviceData);
                    alert('Service updated successfully!');
                    editingServiceId = null;
                } else {
                    await addService(serviceData);
                    alert('Service added successfully!');
                }
                
                serviceForm.reset();
                document.querySelector('[data-tab="manage-services"]')?.click();
            } catch (error) {
                alert('Error saving service. Please try again.');
                console.error('Error:', error);
            }
        });
    }

    // Event form submission
    const eventForm = document.getElementById('event-form');
    let editingEventId = null;
    
    if (eventForm) {
        eventForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(eventForm);
            const eventData = {
                title: formData.get('title'),
                date: formData.get('date'),
                time: formData.get('time') || '',
                location: formData.get('location') || '',
                description: formData.get('description'),
                linkText: formData.get('linkText') || 'Learn More',
                linkUrl: formData.get('linkUrl') || '#'
            };
            
            try {
                if (editingEventId) {
                    await updateEvent(editingEventId, eventData);
                    alert('Event updated successfully!');
                    editingEventId = null;
                } else {
                    await addEvent(eventData);
                    alert('Event added successfully!');
                }
                
                eventForm.reset();
                document.querySelector('[data-tab="manage-events"]')?.click();
            } catch (error) {
                alert('Error saving event. Please try again.');
                console.error('Error:', error);
            }
        });
    }

    // Load and display services (for admin page)
    window.loadServices = async function() {
        const container = document.getElementById('services-list-container');
        if (!container) return;

        const services = await getAllServices();
        
        if (services.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No services added yet. Add your first service using the "Add Service" tab.</p></div>';
            return;
        }

        container.innerHTML = services.map(service => {
            const timeDisplay = service.time ? new Date(`2000-01-01T${service.time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : service.time;
            return `
            <div class="sermon-item">
                <div class="sermon-item-info">
                    <h3>${service.title} - ${service.time}</h3>
                    <p>${service.description}</p>
                    <p style="font-size: 0.85rem; margin-top: 0.5rem;">
                        Location: ${service.location || 'N/A'} | Duration: ${service.duration || 'N/A'} | Childcare: ${service.childcare || 'N/A'}
                        ${service.featured ? ' | <strong style="color: var(--primary-color);">Featured</strong>' : ''}
                    </p>
                </div>
                <div class="sermon-item-actions">
                    <button class="btn btn-edit btn-small" onclick="editService('${service.id}')">Edit</button>
                    <button class="btn btn-danger btn-small" onclick="deleteServiceConfirm('${service.id}')">Delete</button>
                </div>
            </div>
        `;
        }).join('');
    };

    // Load and display events (for admin page)
    window.loadEvents = async function() {
        const container = document.getElementById('events-list-container');
        if (!container) return;

        const events = await getAllEvents();
        
        if (events.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No events added yet. Add your first event using the "Add Event" tab.</p></div>';
            return;
        }

        container.innerHTML = events.map(event => {
            const { day, month } = formatEventDate(event.date);
            return `
                <div class="sermon-item">
                    <div class="sermon-item-info">
                        <h3>${event.title}</h3>
                        <p><strong>Date:</strong> ${day} ${month} | ${event.time || 'All Day'}</p>
                        ${event.location ? `<p><strong>Location:</strong> ${event.location}</p>` : ''}
                        <p>${event.description}</p>
                    </div>
                    <div class="sermon-item-actions">
                        <button class="btn btn-edit btn-small" onclick="editEvent('${event.id}')">Edit</button>
                        <button class="btn btn-danger btn-small" onclick="deleteEventConfirm('${event.id}')">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    };

    // Edit service
    window.editService = async function(id) {
        const services = await getAllServices();
        const service = services.find(s => s.id === id);
        if (!service) return;

        editingServiceId = id;
        document.getElementById('service-time').value = service.time || '';
        document.getElementById('service-title').value = service.title || '';
        document.getElementById('service-description').value = service.description || '';
        document.getElementById('service-location').value = service.location || '';
        document.getElementById('service-duration').value = service.duration || '';
        document.getElementById('service-childcare').value = service.childcare || '';
        document.getElementById('service-featured').checked = service.featured || false;
        
        document.querySelector('[data-tab="add-service"]')?.click();
    };

    // Edit event
    window.editEvent = async function(id) {
        const events = await getAllEvents();
        const event = events.find(e => e.id === id);
        if (!event) return;

        editingEventId = id;
        const eventDate = new Date(event.date);
        document.getElementById('event-title').value = event.title || '';
        document.getElementById('event-date').value = eventDate.toISOString().split('T')[0];
        document.getElementById('event-time').value = event.time || '';
        document.getElementById('event-location').value = event.location || '';
        document.getElementById('event-description').value = event.description || '';
        document.getElementById('event-link-text').value = event.linkText || '';
        document.getElementById('event-link-url').value = event.linkUrl || '';
        
        document.querySelector('[data-tab="add-event"]')?.click();
    };

    // Delete service confirmation
    window.deleteServiceConfirm = function(id) {
        if (confirm('Are you sure you want to delete this service?')) {
            deleteService(id).then(() => {
                alert('Service deleted successfully!');
                loadServices();
            }).catch(error => {
                alert('Error deleting service. Please try again.');
                console.error('Error:', error);
            });
        }
    };

    // Delete event confirmation
    window.deleteEventConfirm = function(id) {
        if (confirm('Are you sure you want to delete this event?')) {
            deleteEvent(id).then(() => {
                alert('Event deleted successfully!');
                loadEvents();
            }).catch(error => {
                alert('Error deleting event. Please try again.');
                console.error('Error:', error);
            });
        }
    };


    // Reset service form
    document.getElementById('reset-service-form')?.addEventListener('click', () => {
        document.getElementById('service-form')?.reset();
        editingServiceId = null;
    });

    // Reset event form
    document.getElementById('reset-event-form')?.addEventListener('click', () => {
        document.getElementById('event-form')?.reset();
        editingEventId = null;
    });
});

// Export functions for use in events.astro and other pages
// Make sure these are available immediately, not just after DOMContentLoaded
if (typeof window !== 'undefined') {
    window.getAllServices = getAllServices;
    window.getAllEvents = getAllEvents;
    window.addService = addService;
    window.updateService = updateService;
    window.deleteService = deleteService;
    window.addEvent = addEvent;
    window.updateEvent = updateEvent;
    window.deleteEvent = deleteEvent;
}

