import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data (all 13 phases, in FK-safe order)
  // Phase 13: External Integrations
  await prisma.webhookLog.deleteMany();
  await prisma.paymentProviderConfig.deleteMany();
  // Phase 12: System Infrastructure
  await prisma.job.deleteMany();
  await prisma.notificationQueue.deleteMany();
  // Phase 11: Analytics & Fraud
  await prisma.fraudEvent.deleteMany();
  await prisma.analyticsEvent.deleteMany();
  // Phase 10: Notifications
  await prisma.notificationPreference.deleteMany();
  // Phase 9: Admin & Management
  await prisma.moderationCase.deleteMany();
  await prisma.adminAction.deleteMany();
  await prisma.adminUser.deleteMany();
  // Phase 8: Support & Disputes
  await prisma.disputeEvidence.deleteMany();
  await prisma.supportMessage.deleteMany();
  await prisma.supportTicket.deleteMany();
  // Phase 7: Wishlists
  await prisma.wishlistItem.deleteMany();
  await prisma.wishlist.deleteMany();
  // Phase 6: Messaging
  await prisma.message.deleteMany();
  await prisma.conversationParticipant.deleteMany();
  await prisma.conversation.deleteMany();
  // Phase 5: Reviews
  await prisma.reviewRating.deleteMany();
  await prisma.reviewPhoto.deleteMany();
  // Phase 4: Payments & Transactions
  await prisma.transaction.deleteMany();
  await prisma.walletTransaction.deleteMany();
  await prisma.wallet.deleteMany();
  // Phase 3: Bookings
  await prisma.bookingStatusHistory.deleteMany();
  await prisma.bookingGuest.deleteMany();
  // Original cleanup
  await prisma.notification.deleteMany();
  await prisma.dispute.deleteMany();
  await prisma.refund.deleteMany();
  await prisma.paymentEvent.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.hostEarning.deleteMany();
  await prisma.payout.deleteMany();
  await prisma.payoutAccount.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.availability.deleteMany();
  // Phase 2: Listings
  await prisma.cancellationPolicyRule.deleteMany();
  await prisma.priceRule.deleteMany();
  await prisma.listingLocation.deleteMany();
  await prisma.propertyAmenity.deleteMany();
  await prisma.propertyImage.deleteMany();
  await prisma.property.deleteMany();
  await prisma.amenity.deleteMany();
  // Phase 1: Users & Security
  await prisma.passwordReset.deleteMany();
  await prisma.userVerification.deleteMany();
  await prisma.device.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.role.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.platformSetting.deleteMany();
  await prisma.commissionRule.deleteMany();
  await prisma.advertisement.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();

  console.log('  ✅ Cleaned existing data');

  // Create Roles
  const roles = [
    { name: 'ADMIN', description: 'Administrator' },
    { name: 'HOST', description: 'Property Host' },
    { name: 'GUEST', description: 'Guest User' }
  ];

  for (const role of roles) {
    await prisma.role.create({ data: role });
  }
  const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
  const hostRole = await prisma.role.findUnique({ where: { name: 'HOST' } });
  const guestRole = await prisma.role.findUnique({ where: { name: 'GUEST' } });

  console.log('  ✅ Created base roles');

  // Create users
  const passwordHash = await bcrypt.hash('Password123', 12);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@stayscape.com',
      passwordHash,
      role: "ADMIN",
      isHost: true,
      emailVerified: new Date(),
      phone: '+1234567890',
      profile: {
        create: {
          firstName: 'Admin',
          lastName: 'User',
          bio: 'Platform administrator',
          profilePhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        }
      },
      userRoles: {
        create: [{ roleId: adminRole!.id }]
      }
    },
  });

  const host1 = await prisma.user.create({
    data: {
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      passwordHash,
      role: "HOST",
      isHost: true,
      emailVerified: new Date(),
      phone: '+1987654321',
      profile: {
        create: {
          firstName: 'Sarah',
          lastName: 'Johnson',
          bio: 'Superhost with 5 years of experience. I love meeting new people and showing them around my beautiful properties.',
          profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
        }
      },
      userRoles: {
        create: [{ roleId: hostRole!.id }]
      }
    },
  });

  const host2 = await prisma.user.create({
    data: {
      name: 'Michael Chen',
      email: 'michael@example.com',
      passwordHash,
      role: "HOST",
      isHost: true,
      emailVerified: new Date(),
      phone: '+1555000111',
      profile: {
        create: {
          firstName: 'Michael',
          lastName: 'Chen',
          bio: 'Interior designer turned host. Each of my properties is carefully curated for comfort and style.',
          profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        }
      },
      userRoles: {
        create: [{ roleId: hostRole!.id }]
      }
    },
  });

  const guest1 = await prisma.user.create({
    data: {
      name: 'Emily Davis',
      email: 'emily@example.com',
      passwordHash,
      role: "USER",
      emailVerified: new Date(),
      profile: {
        create: {
          firstName: 'Emily',
          lastName: 'Davis',
          bio: 'Digital nomad and travel enthusiast. Always looking for unique stays!',
          profilePhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        }
      },
      userRoles: {
        create: [{ roleId: guestRole!.id }]
      }
    },
  });

  const guest2 = await prisma.user.create({
    data: {
      name: 'James Wilson',
      email: 'james@example.com',
      passwordHash,
      role: "USER",
      emailVerified: new Date(),
      profile: {
        create: {
          firstName: 'James',
          lastName: 'Wilson',
          bio: 'Weekend explorer who loves finding hidden gems.',
          profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
        }
      },
      userRoles: {
        create: [{ roleId: guestRole!.id }]
      }
    },
  });

  // Admin user record
  await prisma.adminUser.create({
    data: {
      userId: admin.id,
      role: 'SUPER_ADMIN',
      permissions: JSON.stringify(['*']),
    }
  });

  console.log('  ✅ Created 5 users (1 admin, 2 hosts, 2 guests)');

  // Create amenities
  const amenityData = [
    { name: 'WiFi', icon: 'Wifi', category: 'Essentials' },
    { name: 'Kitchen', icon: 'CookingPot', category: 'Essentials' },
    { name: 'Washer', icon: 'WashingMachine', category: 'Essentials' },
    { name: 'Dryer', icon: 'Wind', category: 'Essentials' },
    { name: 'Air conditioning', icon: 'Snowflake', category: 'Essentials' },
    { name: 'Heating', icon: 'Flame', category: 'Essentials' },
    { name: 'TV', icon: 'Tv', category: 'Essentials' },
    { name: 'Iron', icon: 'Shirt', category: 'Essentials' },
    { name: 'Workspace', icon: 'Monitor', category: 'Essentials' },
    { name: 'Free parking', icon: 'Car', category: 'Parking' },
    { name: 'Pool', icon: 'Waves', category: 'Outdoor' },
    { name: 'Hot tub', icon: 'Bath', category: 'Outdoor' },
    { name: 'Patio', icon: 'Fence', category: 'Outdoor' },
    { name: 'BBQ grill', icon: 'Flame', category: 'Outdoor' },
    { name: 'Garden', icon: 'Flower2', category: 'Outdoor' },
    { name: 'Beach access', icon: 'Umbrella', category: 'Location' },
    { name: 'Gym', icon: 'Dumbbell', category: 'Facilities' },
    { name: 'Elevator', icon: 'ArrowUpDown', category: 'Facilities' },
    { name: 'Smoke alarm', icon: 'Siren', category: 'Safety' },
    { name: 'Carbon monoxide alarm', icon: 'ShieldAlert', category: 'Safety' },
    { name: 'Fire extinguisher', icon: 'FireExtinguisher', category: 'Safety' },
    { name: 'First aid kit', icon: 'Cross', category: 'Safety' },
    { name: 'Pets allowed', icon: 'PawPrint', category: 'Policies' },
  ];

  const amenities = await Promise.all(
    amenityData.map((a) =>
      prisma.amenity.create({ data: a })
    )
  );

  console.log(`  ✅ Created ${amenities.length} amenities`);

  // Property images (using Unsplash)
  const propertyImages = [
    // Modern NYC Loft
    [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&h=600&fit=crop',
    ],
    // Beachfront Villa
    [
      'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
    ],
    // Mountain Cabin
    [
      'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop',
    ],
    // Luxury Apartment
    [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1560185007-5f0bb1866cab?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1560185008-b033106af5c8?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=800&h=600&fit=crop',
    ],
    // Cozy Cottage
    [
      'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop',
    ],
    // Tropical Villa
    [
      'https://images.unsplash.com/photo-1540541338287-41700ceea5db?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=600&fit=crop',
    ],
    // City Penthouse
    [
      'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800&h=600&fit=crop',
    ],
    // Lakeside Retreat
    [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600047509782-20d39509f26d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600585153490-76fb20a32601?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
    ],
    // Studio Apartment
    [
      'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1560448075-cbc16bb4af8e?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800&h=600&fit=crop',
    ],
    // Desert Oasis
    [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
    ],
  ];

  // Create 10 properties
  const propertiesData = [
    {
      hostId: host1.id,
      title: 'Modern Loft in the Heart of Manhattan',
      description: 'Experience the energy of New York City from this stunning modern loft in Midtown Manhattan. Floor-to-ceiling windows offer breathtaking city views. The open-concept living space features designer furniture, a fully equipped kitchen, and a luxurious king-size bed. Steps from Times Square, Central Park, and world-class dining.',
      propertyType: "LOFT",
      roomType: "ENTIRE_PLACE",
      status: "PUBLISHED",
      address: '350 W 42nd St',
      city: 'New York',
      state: 'NY',
      country: 'United States',
      postalCode: '10036',
      latitude: 40.7580,
      longitude: -73.9855,
      maxGuests: 4,
      bedrooms: 1,
      beds: 2,
      bathrooms: 1,
      pricePerNight: 25000, // $250
      cleaningFee: 7500,
      minNights: 2,
      maxNights: 30,
      cancellationPolicy: "MODERATE",
      isInstantBook: true,
      houseRules: 'No smoking. No parties. Quiet hours after 10 PM.',
      checkInTime: '15:00',
      checkOutTime: '11:00',
      averageRating: 4.8,
      reviewCount: 24,
    },
    {
      hostId: host1.id,
      title: 'Beachfront Villa with Infinity Pool',
      description: 'Wake up to the sound of waves at this spectacular beachfront villa. Featuring a private infinity pool overlooking the ocean, spacious living areas, and a gourmet kitchen. The property includes 4 bedrooms, each with ensuite bathrooms, perfect for families or groups. Direct beach access and sunset views that will take your breath away.',
      propertyType: "VILLA",
      roomType: "ENTIRE_PLACE",
      status: "PUBLISHED",
      address: '1200 Ocean Drive',
      city: 'Miami',
      state: 'FL',
      country: 'United States',
      postalCode: '33139',
      latitude: 25.7826,
      longitude: -80.1341,
      maxGuests: 8,
      bedrooms: 4,
      beds: 5,
      bathrooms: 4,
      pricePerNight: 55000, // $550
      cleaningFee: 15000,
      minNights: 3,
      maxNights: 60,
      cancellationPolicy: "STRICT",
      isInstantBook: false,
      houseRules: 'No smoking indoors. Pets welcome with prior approval. Pool hours 8 AM - 10 PM.',
      checkInTime: '16:00',
      checkOutTime: '11:00',
      averageRating: 4.9,
      reviewCount: 18,
    },
    {
      hostId: host2.id,
      title: 'Cozy Mountain Cabin with Hot Tub',
      description: 'Escape to this charming mountain cabin nestled among towering pines. Features include a stone fireplace, hot tub on the deck, fully equipped kitchen, and stunning mountain views. Perfect for a romantic getaway or a small family retreat. Hiking trails start right at your doorstep.',
      propertyType: "CABIN",
      roomType: "ENTIRE_PLACE",
      status: "PUBLISHED",
      address: '455 Pine Ridge Road',
      city: 'Aspen',
      state: 'CO',
      country: 'United States',
      postalCode: '81611',
      latitude: 39.1911,
      longitude: -106.8175,
      maxGuests: 6,
      bedrooms: 2,
      beds: 3,
      bathrooms: 2,
      pricePerNight: 32000, // $320
      cleaningFee: 10000,
      minNights: 2,
      maxNights: 14,
      cancellationPolicy: "FLEXIBLE",
      isInstantBook: true,
      houseRules: 'No smoking. Keep doors closed to prevent wildlife entry. Leave firewood for next guests.',
      checkInTime: '15:00',
      checkOutTime: '10:00',
      averageRating: 4.7,
      reviewCount: 32,
    },
    {
      hostId: host2.id,
      title: 'Luxury Apartment in Downtown SF',
      description: 'Sophisticated luxury apartment in the heart of San Francisco\'s Financial District. This beautifully designed space features high-end finishes, a chef\'s kitchen, and panoramic bay views. Walking distance to Fisherman\'s Wharf, Chinatown, and the Ferry Building. Building amenities include gym, rooftop terrace, and 24/7 concierge.',
      propertyType: "APARTMENT",
      roomType: "ENTIRE_PLACE",
      status: "PUBLISHED",
      address: '100 Market Street',
      city: 'San Francisco',
      state: 'CA',
      country: 'United States',
      postalCode: '94105',
      latitude: 37.7936,
      longitude: -122.3959,
      maxGuests: 4,
      bedrooms: 2,
      beds: 2,
      bathrooms: 2,
      pricePerNight: 28000, // $280
      cleaningFee: 8000,
      minNights: 2,
      maxNights: 30,
      cancellationPolicy: "MODERATE",
      isInstantBook: true,
      houseRules: 'No smoking. No pets. Quiet hours after 10 PM. Building requires ID for check-in.',
      checkInTime: '15:00',
      checkOutTime: '11:00',
      averageRating: 4.6,
      reviewCount: 15,
    },
    {
      hostId: host1.id,
      title: 'Charming Cottage in English Countryside',
      description: 'Step into a fairy tale at this beautifully restored 18th-century cottage. Features original stone walls, exposed wooden beams, a country kitchen, and a private garden with rose bushes. Located in the heart of the Cotswolds, surrounded by rolling hills and picturesque villages.',
      propertyType: "COTTAGE",
      roomType: "ENTIRE_PLACE",
      status: "PUBLISHED",
      address: '12 Church Lane',
      city: 'London',
      state: 'England',
      country: 'United Kingdom',
      postalCode: 'GL54 1AB',
      latitude: 51.5074,
      longitude: -0.1278,
      maxGuests: 4,
      bedrooms: 2,
      beds: 2,
      bathrooms: 1.5,
      pricePerNight: 18000, // $180
      cleaningFee: 5000,
      minNights: 2,
      maxNights: 21,
      cancellationPolicy: "FLEXIBLE",
      isInstantBook: true,
      houseRules: 'No smoking. Pets allowed with notice. Please remove shoes indoors.',
      checkInTime: '14:00',
      checkOutTime: '10:00',
      averageRating: 4.9,
      reviewCount: 28,
    },
    {
      hostId: host2.id,
      title: 'Tropical Paradise Villa with Ocean Views',
      description: 'Escape to paradise in this stunning tropical villa perched on a hillside with panoramic ocean views. Open-air living spaces blend seamlessly with lush tropical gardens. Features include a private plunge pool, outdoor shower, and yoga deck. Staff includes a personal chef and housekeeper.',
      propertyType: "VILLA",
      roomType: "ENTIRE_PLACE",
      status: "PUBLISHED",
      address: '88 Sunset Boulevard',
      city: 'Barcelona',
      state: 'Catalonia',
      country: 'Spain',
      postalCode: '08001',
      latitude: 41.3874,
      longitude: 2.1686,
      maxGuests: 6,
      bedrooms: 3,
      beds: 3,
      bathrooms: 3,
      pricePerNight: 42000, // $420
      cleaningFee: 12000,
      minNights: 4,
      maxNights: 28,
      cancellationPolicy: "STRICT",
      isInstantBook: false,
      houseRules: 'No parties. Respectful of staff and neighbors. Pool use during daylight hours only.',
      checkInTime: '15:00',
      checkOutTime: '11:00',
      averageRating: 5.0,
      reviewCount: 12,
    },
    {
      hostId: host1.id,
      title: 'Stunning Penthouse with Rooftop Terrace',
      description: 'Live like royalty in this spectacular penthouse with a private rooftop terrace featuring 360-degree city views. The apartment boasts designer interiors, a state-of-the-art kitchen, home cinema, and a master suite with a soaking tub. Perfect for those who want the ultimate urban luxury experience.',
      propertyType: "APARTMENT",
      roomType: "ENTIRE_PLACE",
      status: "PUBLISHED",
      address: '500 N Michigan Ave',
      city: 'Los Angeles',
      state: 'CA',
      country: 'United States',
      postalCode: '90001',
      latitude: 34.0522,
      longitude: -118.2437,
      maxGuests: 6,
      bedrooms: 3,
      beds: 4,
      bathrooms: 2.5,
      pricePerNight: 48000, // $480
      cleaningFee: 12000,
      minNights: 2,
      maxNights: 14,
      cancellationPolicy: "MODERATE",
      isInstantBook: true,
      houseRules: 'No smoking. No parties over 6 people. Building quiet hours 10 PM - 8 AM.',
      checkInTime: '16:00',
      checkOutTime: '11:00',
      averageRating: 4.8,
      reviewCount: 9,
    },
    {
      hostId: host2.id,
      title: 'Lakeside Retreat with Private Dock',
      description: 'Relax at this serene lakeside retreat with your own private dock. Wake up to misty morning lake views, spend afternoons kayaking or fishing, and end the day with a bonfire under the stars. The modern interior features an open floor plan, gourmet kitchen, and floor-to-ceiling windows framing the water.',
      propertyType: "HOUSE",
      roomType: "ENTIRE_PLACE",
      status: "PUBLISHED",
      address: '789 Lakeshore Drive',
      city: 'Paris',
      state: 'Île-de-France',
      country: 'France',
      postalCode: '75001',
      latitude: 48.8566,
      longitude: 2.3522,
      maxGuests: 8,
      bedrooms: 4,
      beds: 5,
      bathrooms: 3,
      pricePerNight: 35000, // $350
      cleaningFee: 10000,
      minNights: 2,
      maxNights: 14,
      cancellationPolicy: "FLEXIBLE",
      isInstantBook: true,
      houseRules: 'Life jackets must be worn on dock. No motor boats. Clean fish at cleaning station only.',
      checkInTime: '15:00',
      checkOutTime: '10:00',
      averageRating: 4.7,
      reviewCount: 21,
    },
    {
      hostId: host1.id,
      title: 'Stylish Studio in Arts District',
      description: 'Creative and stylish studio apartment in the vibrant Arts District. This artist-designed space features unique decor, local artwork, a compact but fully equipped kitchen, and a cozy sleeping loft. Walk to galleries, craft breweries, and some of the city\'s best restaurants.',
      propertyType: "ROOM",
      roomType: "PRIVATE_ROOM",
      status: "PUBLISHED",
      address: '200 Arts Way',
      city: 'Tokyo',
      state: 'Tokyo',
      country: 'Japan',
      postalCode: '100-0001',
      latitude: 35.6762,
      longitude: 139.6503,
      maxGuests: 2,
      bedrooms: 1,
      beds: 1,
      bathrooms: 1,
      pricePerNight: 9500, // $95
      cleaningFee: 3000,
      minNights: 1,
      maxNights: 30,
      cancellationPolicy: "FLEXIBLE",
      isInstantBook: true,
      houseRules: 'Quiet hours after 10 PM. No smoking. Shared laundry in building.',
      checkInTime: '14:00',
      checkOutTime: '11:00',
      averageRating: 4.5,
      reviewCount: 42,
    },
    {
      hostId: host2.id,
      title: 'Desert Oasis with Private Pool',
      description: 'A stunning mid-century modern home in the desert, featuring a private pool, outdoor fire pit, and mountain views. The home has been beautifully restored with period-appropriate furnishings while adding modern comforts. Floor-to-ceiling windows blur the line between indoor and outdoor living.',
      propertyType: "HOUSE",
      roomType: "ENTIRE_PLACE",
      status: "PUBLISHED",
      address: '1100 E Palm Canyon',
      city: 'San Francisco',
      state: 'CA',
      country: 'United States',
      postalCode: '92262',
      latitude: 37.7749,
      longitude: -122.4194,
      maxGuests: 6,
      bedrooms: 3,
      beds: 3,
      bathrooms: 2,
      pricePerNight: 38000, // $380
      cleaningFee: 10000,
      minNights: 2,
      maxNights: 21,
      cancellationPolicy: "MODERATE",
      isInstantBook: true,
      houseRules: 'Pool gate must remain closed. No glass near pool. Desert wildlife - keep doors closed.',
      checkInTime: '15:00',
      checkOutTime: '10:00',
      averageRating: 4.8,
      reviewCount: 16,
    },
  ];

  const properties = [];
  for (let i = 0; i < propertiesData.length; i++) {
    const data = propertiesData[i];
    const property = await prisma.property.create({
      data: {
        ...data,
        publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
        location: {
          create: {
            address: data.address,
            city: data.city,
            state: data.state,
            country: data.country,
            postalCode: data.postalCode,
            latitude: data.latitude,
            longitude: data.longitude,
          }
        }
      },
    });

    // Create images
    const images = propertyImages[i];
    for (let j = 0; j < images.length; j++) {
      await prisma.propertyImage.create({
        data: {
          propertyId: property.id,
          url: images[j],
          sortOrder: j,
          isCover: j === 0,
        },
      });
    }

    // Assign random amenities (5-12 per property)
    const shuffled = [...amenities].sort(() => Math.random() - 0.5);
    const numAmenities = 5 + Math.floor(Math.random() * 8);
    for (let k = 0; k < Math.min(numAmenities, shuffled.length); k++) {
      await prisma.propertyAmenity.create({
        data: {
          propertyId: property.id,
          amenityId: shuffled[k].id,
        },
      });
    }

    properties.push(property);
  }

  console.log(`  ✅ Created ${properties.length} properties with images, amenities and locations`);

  // Create bookings
  const now = new Date();
  const bookingsData = [
    {
      propertyId: properties[0].id,
      guestId: guest1.id,
      checkIn: new Date(now.getFullYear(), now.getMonth() - 1, 10),
      checkOut: new Date(now.getFullYear(), now.getMonth() - 1, 15),
      totalNights: 5,
      guestCount: 2,
      nightlyRate: 25000,
      subtotal: 125000,
      cleaningFee: 7500,
      serviceFee: 15000,
      totalPrice: 147500,
      hostPayoutAmount: 116875,
      status: "COMPLETED",
      paidAt: new Date(now.getFullYear(), now.getMonth() - 1, 8),
    },
    {
      propertyId: properties[2].id,
      guestId: guest1.id,
      checkIn: new Date(now.getFullYear(), now.getMonth() + 1, 5),
      checkOut: new Date(now.getFullYear(), now.getMonth() + 1, 10),
      totalNights: 5,
      guestCount: 4,
      nightlyRate: 32000,
      subtotal: 160000,
      cleaningFee: 10000,
      serviceFee: 19200,
      totalPrice: 189200,
      hostPayoutAmount: 149600,
      status: "CONFIRMED",
      paidAt: new Date(),
    },
    {
      propertyId: properties[1].id,
      guestId: guest2.id,
      checkIn: new Date(now.getFullYear(), now.getMonth() - 2, 20),
      checkOut: new Date(now.getFullYear(), now.getMonth() - 2, 27),
      totalNights: 7,
      guestCount: 6,
      nightlyRate: 55000,
      subtotal: 385000,
      cleaningFee: 15000,
      serviceFee: 46200,
      totalPrice: 446200,
      hostPayoutAmount: 352800,
      status: "COMPLETED",
      paidAt: new Date(now.getFullYear(), now.getMonth() - 2, 18),
    },
    {
      propertyId: properties[4].id,
      guestId: guest2.id,
      checkIn: new Date(now.getFullYear(), now.getMonth(), 25),
      checkOut: new Date(now.getFullYear(), now.getMonth(), 30),
      totalNights: 5,
      guestCount: 2,
      nightlyRate: 18000,
      subtotal: 90000,
      cleaningFee: 5000,
      serviceFee: 10800,
      totalPrice: 105800,
      hostPayoutAmount: 83600,
      status: "CONFIRMED",
      paidAt: new Date(),
    },
    {
      propertyId: properties[3].id,
      guestId: guest1.id,
      checkIn: new Date(now.getFullYear(), now.getMonth() - 3, 1),
      checkOut: new Date(now.getFullYear(), now.getMonth() - 3, 4),
      totalNights: 3,
      guestCount: 2,
      nightlyRate: 28000,
      subtotal: 84000,
      cleaningFee: 8000,
      serviceFee: 10080,
      totalPrice: 102080,
      hostPayoutAmount: 81040,
      status: "CANCELLED",
      cancelledAt: new Date(now.getFullYear(), now.getMonth() - 3, 0),
      cancellationReason: 'Change of travel plans',
    },
  ];

  const bookings = [];
  for (let i = 0; i < bookingsData.length; i++) {
    const data = bookingsData[i];
    const { status, ...validData } = data; // omit legacy 'status'
    const booking = await prisma.booking.create({
      data: {
        ...validData,
        bookingNumber: `AB-${now.getFullYear()}-${String(100000 + i).padStart(6, '0')}`,
        bookingStatus: status,
        paymentStatus: status === 'COMPLETED' || status === 'CONFIRMED' ? 'SUCCEEDED' : 'CANCELLED',
        bookingGuests: {
          create: [
            { guestType: 'adult', count: data.guestCount }
          ]
        },
        statusHistory: {
          create: [
            { status: 'PENDING', changedAt: data.checkIn }
          ]
        }
      }
    });
    bookings.push(booking);
  }

  console.log(`  ✅ Created ${bookings.length} bookings with guest breakdowns and statuses`);

  // Create reviews for completed bookings
  const reviewsData = [
    {
      bookingId: bookings[0].id,
      propertyId: properties[0].id,
      authorId: guest1.id,
      targetId: host1.id,
      overallRating: 5,
      cleanliness: 5,
      accuracy: 5,
      communication: 5,
      location: 5,
      checkIn: 5,
      value: 4,
      comment: 'Absolutely stunning loft! The views were incredible and the location was perfect. Sarah was an amazing host who thought of every detail. The kitchen was well-stocked and the bed was incredibly comfortable. Will definitely be back!',
    },
    {
      bookingId: bookings[2].id,
      propertyId: properties[1].id,
      authorId: guest2.id,
      targetId: host1.id,
      overallRating: 5,
      cleanliness: 5,
      accuracy: 5,
      communication: 5,
      location: 5,
      checkIn: 5,
      value: 5,
      comment: 'This villa exceeded all expectations! The infinity pool overlooking the ocean was like something out of a dream. The house was immaculately clean and beautifully decorated. Our family had the best vacation ever. Thank you, Sarah!',
      hostResponse: 'Thank you so much, James! It was a pleasure hosting your family. You were wonderful guests and we look forward to welcoming you back!',
    },
  ];

  for (const data of reviewsData) {
    await prisma.review.create({ data });
  }

  console.log(`  ✅ Created ${reviewsData.length} reviews`);

  // Create favorites
  await prisma.favorite.createMany({
    data: [
      { userId: guest1.id, propertyId: properties[1].id },
      { userId: guest1.id, propertyId: properties[3].id },
      { userId: guest1.id, propertyId: properties[5].id },
      { userId: guest2.id, propertyId: properties[0].id },
      { userId: guest2.id, propertyId: properties[2].id },
    ],
  });

  console.log('  ✅ Created favorites');

  // Create conversations and messages
  const conv1 = await prisma.conversation.create({
    data: {
      propertyId: properties[0].id,
      bookingId: bookings[0].id,
      participants: {
        create: [
          { userId: guest1.id },
          { userId: host1.id },
        ],
      },
      messages: {
        create: [
          {
            senderId: guest1.id,
            content: 'Hi Sarah! I\'m excited about my upcoming stay. Is there parking available near the building?',
            createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          },
          {
            senderId: host1.id,
            content: 'Hi Emily! Welcome! Yes, there\'s a parking garage in the building. I\'ll send you the access code before check-in. Let me know if you have any other questions!',
            createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000 + 3600000),
          },
          {
            senderId: guest1.id,
            content: 'That\'s great, thank you! Also, are there any good restaurants you\'d recommend nearby?',
            createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
          },
          {
            senderId: host1.id,
            content: 'Absolutely! I\'ve put together a guidebook with my favorite spots. You\'ll find it on the coffee table when you arrive. Some highlights: Italian place on 43rd St, rooftop bar on 44th, and an amazing brunch spot on 9th Ave.',
            createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000 + 7200000),
          },
        ],
      },
    },
  });

  console.log('  ✅ Created conversations and messages');

  // Create notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: guest1.id,
        type: "BOOKING_CONFIRMED",
        title: 'Booking Confirmed',
        message: 'Your booking at Modern Loft in the Heart of Manhattan has been confirmed!',
        link: `/guest/trips`,
        isRead: true,
        readAt: new Date(),
      },
      {
        userId: host1.id,
        type: "BOOKING_REQUEST",
        title: 'New Booking',
        message: 'Emily Davis has booked your Modern Loft in the Heart of Manhattan.',
        link: `/host/reservations`,
        isRead: true,
        readAt: new Date(),
      },
      {
        userId: guest1.id,
        type: "NEW_MESSAGE",
        title: 'New Message from Sarah',
        message: 'Sarah Johnson sent you a message about your upcoming stay.',
        link: `/messages`,
        isRead: false,
      },
      {
        userId: host1.id,
        type: "NEW_REVIEW",
        title: 'New Review',
        message: 'Emily Davis left a 5-star review for your Modern Loft.',
        link: `/host/reviews`,
        isRead: false,
      },
    ],
  });

  console.log('  ✅ Created notifications');

  // Platform settings
  await prisma.platformSetting.createMany({
    data: [
      { key: 'platform_fee_percent', value: '12', description: 'Platform service fee percentage' },
      { key: 'min_payout_amount', value: '1000', description: 'Minimum payout amount in cents' },
      { key: 'max_images_per_listing', value: '20', description: 'Maximum images per property listing' },
      { key: 'review_deadline_days', value: '14', description: 'Days after checkout to leave a review' },
      { key: 'support_email', value: 'support@stayscape.com', description: 'Support email address' },
    ],
  });

  console.log('  ✅ Created platform settings');

  console.log('');
  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('📧 Login credentials:');
  console.log('   Admin:  admin@stayscape.com / Password123');
  console.log('   Host 1: sarah@example.com / Password123');
  console.log('   Host 2: michael@example.com / Password123');
  console.log('   Guest:  emily@example.com / Password123');
  console.log('   Guest:  james@example.com / Password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
