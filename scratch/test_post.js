const http = require('http');

const payload = {
  title: "Test Property Title Here",
  description: "This is a valid description that is more than 20 characters long to pass validation.",
  propertyType: "APARTMENT",
  roomType: "ENTIRE_PLACE",
  address: "123 Main St",
  city: "CityName",
  country: "CountryName",
  latitude: 0,
  longitude: 0,
  pricePerNight: 0,
  pricePerMonth: 2500000,
  rentalType: "MONTHLY",
  maxGuests: 1,
  bedrooms: 1,
  bathrooms: 1,
  images: [{ url: "https://example.com/image.jpg" }]
};

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/properties',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => { console.log('STATUS:', res.statusCode); console.log('BODY:', data); });
});

req.on('error', (e) => { console.error('Problem with request:', e.message); });
req.write(JSON.stringify(payload));
req.end();
