const mongoose = require('mongoose');
const Vehicle = require('./models/Vehicle');
const ServiceRequest = require('./models/ServiceRequest');
const ServiceUpdate = require('./models/ServiceUpdate');
const Invoice = require('./models/Invoice');

const MONGO_URI = 'mongodb://localhost:27017/vsms';
const CUSTOMER_ID = '69c2ed0008fd15aa0558b10a'; // Bhargav Hingu

const seed = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Clear Existing related data (Optional, keeping it clean)
        await Vehicle.deleteMany({ ownerId: CUSTOMER_ID });
        await ServiceRequest.deleteMany({ customerId: CUSTOMER_ID });
        
        console.log('Cleared existing customer data...');

        // 2. Create Vehicles
        const cars = await Vehicle.insertMany([
            { ownerId: CUSTOMER_ID, name: 'BMW M4', plate: 'GJ-05-XY-5678', brand: 'BMW', model: 'M4 Competition', year: '2023', fuel: 'Petrol' },
            { ownerId: CUSTOMER_ID, name: 'Tesla Model S', plate: 'MH-01-AB-1234', brand: 'Tesla', model: 'Plaid', year: '2024', fuel: 'Electric' },
            { ownerId: CUSTOMER_ID, name: 'Swift', plate: 'GJ-01-AB-1234', brand: 'Maruti', model: 'VXI', year: '2022', fuel: 'Petrol' },
            { ownerId: CUSTOMER_ID, name: 'Activa 6H', plate: 'GJ-01-XY-5678', brand: 'Honda', model: 'STD', year: '2021', fuel: 'Petrol' },
        ]);
        console.log('Vehicles Seeded');

        // 3. Create Service Requests
        // Request 1: In Progress (Brake Service for BMW)
        const req1 = await ServiceRequest.create({
            customerId: CUSTOMER_ID,
            vehicleId: cars[0]._id,
            serviceType: 'Brake Service & Alignment',
            issueDescription: 'Strange noise while braking, pulling to the right.',
            appointmentDate: 'October 12, 2023',
            appointmentTime: '10:30 AM',
            status: 'In Service'
        });

        // Request 2: Pending (Periodic Maintenance for Tesla)
        const req2 = await ServiceRequest.create({
            customerId: CUSTOMER_ID,
            vehicleId: cars[1]._id,
            serviceType: 'Periodic Maintenance',
            issueDescription: 'Routine 24-point check and fluid replacement.',
            appointmentDate: 'October 14, 2023',
            appointmentTime: '09:00 AM',
            status: 'Pending'
        });

        // Request 3: Completed (Oil Change for Swift)
        const req3 = await ServiceRequest.create({
            customerId: CUSTOMER_ID,
            vehicleId: cars[2]._id,
            serviceType: 'Oil Change',
            issueDescription: 'Engine oil replacement and general checkup.',
            appointmentDate: 'October 10, 2023',
            appointmentTime: '04:15 PM',
            status: 'Completed'
        });
        console.log('Service Requests Seeded');

        // 4. Create Service Updates for Active Requests
        // Updates for req1 (In Service)
        await ServiceUpdate.insertMany([
            { requestId: req1._id, statusLabel: 'Booked', description: 'Service request received and confirmed', timestamp: new Date(Date.now() - 86400000) },
            { requestId: req1._id, statusLabel: 'Accepted', description: 'Mechanic Bhargav has been assigned', timestamp: new Date(Date.now() - 43200000) },
            { requestId: req1._id, statusLabel: 'In Service', description: 'Brake pad replacement and alignment calibration in progress', timestamp: new Date() },
        ]);

        // Updates for req2 (Pending)
        await ServiceUpdate.insertMany([
            { requestId: req2._id, statusLabel: 'Booked', description: 'Service request received and confirmed', timestamp: new Date() },
        ]);
        console.log('Service Updates Seeded');

        // 5. Create Invoices for Completed Requests
        await Invoice.create({
            requestId: req3._id,
            customerId: CUSTOMER_ID,
            amount: 4200,
            status: 'Paid',
            generatedAt: new Date(Date.now() - 172800000) // 2 days ago
        });
        console.log('Invoices Seeded');

        console.log('Database Seeding Completed Successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding Error:', err);
        process.exit(1);
    }
};

seed();
