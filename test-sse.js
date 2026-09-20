const EventSource = require('eventsource');

const es = new EventSource('http://localhost:3000/api/v1/admin/events');

es.on('open', () => console.log('Connected!'));
es.on('connected', (e) => console.log('Initial connected event:', e.data));
es.on('admin_event', (e) => console.log('Received ADMIN EVENT:', e.data));
es.on('ping', (e) => console.log('Ping received'));
es.on('error', (e) => console.error('Error:', e));
