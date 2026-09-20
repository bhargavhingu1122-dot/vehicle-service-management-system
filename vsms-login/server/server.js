const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const path = require('path');
const User = require('./models/User'); 
const Customer = require('./models/Customer');
const Mechanic = require('./models/Mechanic');
const OTP = require('./models/OTP');
const Vehicle = require('./models/Vehicle');
const ServiceRequest = require('./models/ServiceRequest');
const ServiceUpdate = require('./models/ServiceUpdate');
const Invoice = require('./models/Invoice');
const Notification = require('./models/Notification');
const ServicePricing = require('./models/ServicePricing');
const Message = require('./models/Message');

// Load environment variables from the server directory
const envPath = path.join(__dirname, '.env');
dotenv.config({ path: envPath });

console.log('🔧 ENV CHECK:', {
    user: process.env.EMAIL_USER ? 'Found' : 'Missing',
    pass: process.env.EMAIL_PASS ? 'Found' : 'Missing',
    cwd: process.cwd(),
    envFile: envPath
});

const app = express();
app.use(cors());
app.use(express.json());

// Email Transporter Configuration (Simplified for Gmail)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'vehiclecare2354@gmail.com',
        pass: process.env.EMAIL_PASS
    }
});

// Helper: Send OTP Email (Premium Template)
const sendOTPEmail = async (email, otpCode, type = 'reset') => {
    const isRegistration = type === 'registration';
    const subject = isRegistration ? 'Verify Your Email - Vehicle Care' : 'Password Reset Code - Vehicle Care';
    const title = isRegistration ? 'Welcome to Vehicle Care!' : 'Vehicle Care - Password Reset';
    const desc = isRegistration 
        ? 'Please use the following code to verify your email address and complete your registration:' 
        : 'You requested a password reset. Use the following 4-digit code to verify your identity:';

    const mailOptions = {
        from: `"Vehicle Care Admin" <${process.env.EMAIL_USER || 'vehiclecare2354@gmail.com'}>`,
        to: email,
        subject: subject,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    .container { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f111a; color: #e2e8f0; padding: 40px; border-radius: 12px; max-width: 500px; margin: auto; border: 1px solid #1e293b; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .logo { font-size: 28px; font-weight: 800; color: #3b82f6; letter-spacing: -1px; margin-bottom: 10px; }
                    .content { background: #1a1d2d; padding: 30px; border-radius: 10px; border: 1px solid #334155; text-align: center; }
                    h2 { color: #f8fafc; margin-top: 0; font-size: 22px; }
                    p { color: #94a3b8; line-height: 1.6; font-size: 15px; }
                    .otp-box { font-size: 38px; font-weight: 900; color: #60a5fa; background: #1e3a8a33; padding: 25px; border-radius: 8px; margin: 25px 0; letter-spacing: 12px; border: 1px dashed #3b82f6; display: inline-block; min-width: 200px; }
                    .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #64748b; }
                    .warning { font-size: 12px; color: #ef4444; margin-top: 20px; font-style: italic; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo">VEHICLE CARE</div>
                        <h2>${title}</h2>
                    </div>
                    <div class="content">
                        <p>${desc}</p>
                        <div class="otp-box">${otpCode}</div>
                        <p>This code will expire in 5 minutes for your security.</p>
                        <p class="warning">If you did not request this code, please ignore this email or contact support if you have concerns.</p>
                    </div>
                    <div class="footer">
                        &copy; 2026 Vehicle Care Management System. All rights reserved.
                    </div>
                </div>
            </body>
            </html>
        `
    };

    return transporter.sendMail(mailOptions);
};

// Helper for real-time notifications
const createNotification = async (userId, role, title, message) => {
    try {
        const notif = new Notification({ userId, role, title, message });
        await notif.save();
        console.log(`🔔 Notification created for ${role}: ${title}`);
    } catch (err) {
        console.error("❌ Notification error:", err);
    }
};

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/vsms')
    .then(async () => {
        console.log('✅ MongoDB Connected');
        // --- Seed Admin User ---
        const adminEmail = 'vehiclecare2354@gmail.com';
        const adminPassword = '2205';

        // Clear all existing Admin users to ensure only our designated admin exists
        await User.deleteMany({ role: 'Admin' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);
        const admin = new User({
            fullName: 'Sneha Parmar',
            email: adminEmail,
            password: hashedPassword,
            role: 'Admin'
        });
        await admin.save();
        console.log(`🚀 Dedicated Admin reset: Sneha Parmar (${adminEmail})`);

        // --- Seed Service Pricing ---
        // Clear old ones first to avoid duplicates when names sync
        await ServicePricing.deleteMany({});

        const servicesToSeed = [
            { name: 'Full Vehicle Service', icon: 'ph-wrench', itemsCount: 12, price: 4999, category: 'Maintenance' },
            { name: 'Engine Diagnostics', icon: 'ph-activity', itemsCount: 15, price: 1599, category: 'Repair' },
            { name: 'Oil Change', icon: 'ph-drop', itemsCount: 5, price: 2499, category: 'Maintenance' },
            { name: 'Brake Service', icon: 'ph-shield-check', itemsCount: 8, price: 1899, category: 'Repair' },
            { name: 'Battery Check', icon: 'ph-battery-charging', itemsCount: 4, price: 799, category: 'Maintenance' },
            { name: 'AC Service', icon: 'ph-snowflake', itemsCount: 6, price: 1299, category: 'Repair' },
            { name: 'Wheel Alignment', icon: 'ph-arrows-out-cardinal', itemsCount: 2, price: 899, category: 'Alignment' },
            { name: 'Dent & Paint', icon: 'ph-paint-brush-broad', itemsCount: 3, price: 3499, category: 'Repair' },
            { name: 'Custom Issue', icon: 'ph-chat-teardrop-dots', itemsCount: 1, price: 500, category: 'Diagnostics' },
            { name: 'Express Wash', icon: 'ph-sparkle', itemsCount: 4, price: 599, category: 'Wash' },
            { name: 'Tire Rotation', icon: 'ph-arrows-clockwise', itemsCount: 4, price: 499, category: 'Maintenance' },
        ];

        for (const service of servicesToSeed) {
            await new ServicePricing(service).save();
        }
    })
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- API Endpoints ---

// 1. Register User (Role-Specific)
app.post('/api/register', async (req, res) => {
    try {
        let { fullName, email, password, role } = req.body;
        email = email.trim().toLowerCase();

        // Use specific model based on role
        const Model = role === 'Mechanic' ? Mechanic : Customer;
        
        const existingUser = await Model.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new Model({
            fullName,
            email,
            password: hashedPassword,
            role
        });

        await newUser.save();
        console.log(`✅ ${role} registered in ${role === 'Mechanic' ? 'mechanics' : 'customers'} table`);
        res.status(201).json({ message: 'User registered successfully', role: newUser.role });
    } catch (err) {
        console.error('❌ Registration error:', err);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// 1.5 Send Registration OTP
app.post('/api/send-registration-otp', async (req, res) => {
    let { email } = req.body;
    try {
        email = email.trim().toLowerCase();

        // Check if user already exists
        let user = await User.findOne({ email });
        if (!user) user = await Customer.findOne({ email });
        if (!user) user = await Mechanic.findOne({ email });

        if (user) {
            return res.status(400).json({ message: 'User with this email already exists. Please login instead.' });
        }

        const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

        await OTP.deleteMany({ email });
        const newOTP = new OTP({ email, code: otpCode });
        await newOTP.save();

        try {
            await sendOTPEmail(email, otpCode, 'registration');
            console.log(`✉️ Registration OTP sent to ${email}`);
            res.json({ message: 'Verification code sent to your email.' });
        } catch (mailErr) {
            console.error('❌ Registration email failure:', mailErr.message);
            // Fallback for developer convenience (terminal only)
            console.log('\n----------------------------------------');
            console.log(`🔑 [DEV-DEBUG] REGISTRATION CODE FOR ${email}: ${otpCode}`);
            console.log('----------------------------------------\n');
            
            res.status(500).json({ message: 'Failed to send email. Please check server configuration.' });
        }
    } catch (err) {
        console.error('❌ Send OTP error:', err);
        res.status(500).json({ message: 'Error processing registration request' });
    }
});

// 2. Login User (Cross-Collection)
app.post('/api/login', async (req, res) => {
    try {
        let { email, password } = req.body;
        email = email.trim().toLowerCase();

        // Try to find in all collections
        let user = await User.findOne({ email }); // Check Admin first
        if (!user) user = await Customer.findOne({ email });
        if (!user) user = await Mechanic.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        res.json({ 
            message: 'Login successful', 
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error('❌ Login error:', err);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// 3. Google OAuth Endpoint (Unified for Login/Register)
app.post('/api/google-auth', async (req, res) => {
    try {
        let { fullName, email, googleId, role } = req.body;
        email = email.trim().toLowerCase();

        // 1. Check if user already exists in ANY collection
        let user = await User.findOne({ email }); // Check Admin
        if (!user) user = await Customer.findOne({ email });
        if (!user) user = await Mechanic.findOne({ email });

        if (user) {
            console.log(`✅ Google User Logged in: ${email}`);
            return res.json({ 
                message: 'Login successful', 
                user: {
                    id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    role: user.role
                } 
            });
        }

        // 2. If not found, automatically register based on role (default to Customer)
        const targetRole = role || 'Customer';
        let newUser;

        if (targetRole === 'Mechanic') {
            newUser = new Mechanic({
                fullName,
                email,
                password: `google_${googleId}`,
                role: 'Mechanic'
            });
        } else {
            newUser = new Customer({
                fullName,
                email,
                password: `google_${googleId}`,
                role: 'Customer'
            });
        }

        await newUser.save();
        console.log(`🚀 New Google ${targetRole} registered: ${email}`);
        res.status(201).json({ 
            message: 'Google Registration successful', 
            user: {
                id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                role: newUser.role
            } 
        });
    } catch (err) {
        console.error('❌ Google Auth error:', err);
        res.status(500).json({ message: 'Server error during Google authentication' });
    }
});

// 4. Admin: Fetch All Users & Mechanics with real stats
app.get('/api/admin/users', async (req, res) => {
    try {
        const rawCustomers = await Customer.find({}, '-password').lean();
        const rawMechanics = await Mechanic.find({}, '-password').lean();

        // Enhance customers with real counts
        const customers = await Promise.all(rawCustomers.map(async (c) => {
            const vCount = await Vehicle.countDocuments({ ownerId: c._id });
            const sCount = await ServiceRequest.countDocuments({ customerId: c._id });
            return {
                ...c,
                vehiclesCount: vCount,
                servicesCount: sCount
            };
        }));

        // Enhance mechanics with active job counts
        const mechanics = await Promise.all(rawMechanics.map(async (m) => {
            const activeCount = await ServiceRequest.countDocuments({
                mechanicId: m._id,
                status: { $in: ['Accepted', 'In Service'] }
            });
            return {
                ...m,
                activeJobsCount: activeCount
            };
        }));

        res.json({ customers, mechanics });
    } catch (err) {
        console.error("Error fetching admin user data:", err);
        res.status(500).json({ message: 'Error fetching admin data' });
    }
});

// 4.1 Admin: Delete User (Customer or Mechanic)
app.delete('/api/admin/user/:id', async (req, res) => {
    try {
        let deletedUser = await Customer.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            deletedUser = await Mechanic.findByIdAndDelete(req.params.id);
        }

        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found in any collection' });
        }

        console.log(`🗑️ Admin deleted user: ${deletedUser.fullName} (${deletedUser.email})`);
        res.json({ message: 'User deleted successfully', deletedUser });
    } catch (err) {
        console.error('❌ Error deleting user:', err);
        res.status(500).json({ message: 'Error deleting user from database' });
    }
});

// 4.2 Admin: Fetch All Service Requests
app.get('/api/admin/service-requests', async (req, res) => {
    try {
        const requests = await ServiceRequest.find()
            .populate('customerId', 'fullName email phone')
            .populate('vehicleId', 'name plate brand model')
            .populate('mechanicId', 'fullName email phone skills exp')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (err) {
        console.error('❌ Error fetching requests:', err);
        res.status(500).json({ message: 'Error fetching service requests' });
    }
});

// 4.2b Admin: Fetch All Invoices (Records)
app.get('/api/admin/invoices', async (req, res) => {
    try {
        const invoices = await Invoice.find()
            .populate('customerId', 'fullName email phone')
            .populate({
                path: 'requestId',
                populate: [
                    { path: 'vehicleId', select: 'brand model plate' },
                    { path: 'mechanicId', select: 'fullName' }
                ]
            })
            .sort({ generatedAt: -1 });
        res.json(invoices);
    } catch (err) {
        console.error('❌ Error fetching admin invoices:', err);
        res.status(500).json({ message: 'Error fetching invoices' });
    }
});

// 4.3 Admin: Assign Mechanic to Service
app.put('/api/admin/service-requests/:id/assign', async (req, res) => {
    try {
        const { mechanicId } = req.body;

        // Check if the mechanic has 3 or more active requests (excluding this one if already assigned)
        const activeCount = await ServiceRequest.countDocuments({
            mechanicId,
            _id: { $ne: req.params.id },
            status: { $in: ['Accepted', 'In Service'] }
        });

        if (activeCount >= 3) {
            return res.status(400).json({ message: 'This mechanic has already reached the maximum limit of 3 active jobs.' });
        }

        const updatedRequest = await ServiceRequest.findByIdAndUpdate(
            req.params.id,
            { mechanicId, status: 'Accepted' }, // 'Accepted' acts as 'Assigned'
            { new: true }
        ).populate('mechanicId', 'fullName')
         .populate('vehicleId', 'name brand model plate');

        if (!updatedRequest) return res.status(404).json({ message: 'Request not found' });

        // Also add a service update log
        const newUpdate = new ServiceUpdate({
            requestId: updatedRequest._id,
            statusLabel: 'Mechanic Assigned',
            description: `Professional technician ${updatedRequest.mechanicId.fullName} has been assigned to your vehicle.`
        });
        await newUpdate.save();

        res.json({ message: 'Mechanic assigned successfully', updatedRequest });

        // --- Notifications ---
        // Build a readable vehicle label e.g. "Swift Dzire (GJ05 GW 7685)"
        const vehicle = updatedRequest.vehicleId;
        const vehicleLabel = vehicle
            ? `${vehicle.brand || ''} ${vehicle.model || vehicle.name || ''}`.trim() + (vehicle.plate ? ` (${vehicle.plate})` : '')
            : 'your assigned vehicle';

        // 1. Notify Mechanic
        await createNotification(
            mechanicId, 
            'Mechanic', 
            'New Job Assigned', 
            `You have been assigned to service a ${vehicleLabel}.`
        );
        // 2. Notify Customer (Optional but good)
        await createNotification(
            updatedRequest.customerId, 
            'Customer', 
            'Mechanic Assigned', 
            `Professional technician ${updatedRequest.mechanicId.fullName} is now working on your vehicle.`
        );

    } catch (err) {
        console.error('❌ Error assigning mechanic:', err);
        res.status(500).json({ message: 'Error assigning mechanic' });
    }
});

// --- SERVICE PRICING ROUTES ---

// 1. Fetch All Services
app.get('/api/admin/services', async (req, res) => {
    try {
        const services = await ServicePricing.find();
        res.json(services);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching services' });
    }
});

// 2. Update Service Price
app.put('/api/admin/services/:id/price', async (req, res) => {
    try {
        const { price } = req.body;
        const updatedService = await ServicePricing.findByIdAndUpdate(
            req.params.id,
            { price: Number(price) },
            { new: true }
        );
        if (!updatedService) return res.status(404).json({ message: 'Service not found' });
        
        console.log(`🏷️ Price updated for ${updatedService.name}: ₹${updatedService.price}`);
        res.json(updatedService);
    } catch (err) {
        res.status(500).json({ message: 'Error updating price' });
    }
});

// --- NOTIFICATION ROUTES ---

// 1. Fetch User Notifications
app.get('/api/notifications/:userId', async (req, res) => {
    try {
        const notifs = await Notification.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json(notifs);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching notifications' });
    }
});

// 2. Mark Notification as Read
app.patch('/api/notifications/:id/read', async (req, res) => {
    try {
        const notif = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
        res.json(notif);
    } catch (err) {
        res.status(500).json({ message: 'Error marking notification as read' });
    }
});

// 3. Clear All Notifications
app.delete('/api/notifications/:userId/clear', async (req, res) => {
    try {
        await Notification.deleteMany({ userId: req.params.userId });
        res.json({ message: 'Notifications cleared' });
    } catch (err) {
        res.status(500).json({ message: 'Error clearing notifications' });
    }
});

// --- CONTACT US MESSAGES ROUTES ---

// Submit new contact message
app.post('/api/messages', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        const newMessage = new Message({ name, email, message });
        await newMessage.save();
        res.status(201).json({ success: true, message: 'Message sent successfully' });
    } catch (err) {
        console.error('❌ Error saving message:', err);
        res.status(500).json({ success: false, message: 'Failed to send message' });
    }
});

// Fetch all messages (Admin)
app.get('/api/messages', async (req, res) => {
    try {
        const messages = await Message.find().sort({ createdAt: -1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching messages' });
    }
});

// Delete message (Admin)
app.delete('/api/messages/:id', async (req, res) => {
    try {
        await Message.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Message deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting message' });
    }
});

const PORT = process.env.PORT || 5000;
// 4. Forgot Password - Generate & Send OTP
app.post('/api/forgot-password', async (req, res) => {
    let { email } = req.body;
    try {
        email = email.trim().toLowerCase();

        // 1. Check if user exists in any collection
        let user = await User.findOne({ email });
        if (!user) user = await Customer.findOne({ email });
        if (!user) user = await Mechanic.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User with this email does not exist' });
        }

        // 2. Generate 4-digit OTP
        const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

        // 3. Save OTP to DB (replaces any existing OTP for this email)
        await OTP.deleteMany({ email });
        const newOTP = new OTP({ email, code: otpCode });
        await newOTP.save();

        // 4. Send Email via helper
        try {
            await sendOTPEmail(email, otpCode, 'reset');
            console.log(`✉️ Reset OTP sent to ${email}`);
            res.json({ message: 'Reset code sent to your email.' });
        } catch (mailErr) {
            console.error('❌ Reset email failure:', mailErr.message);
            // Fallback for developer convenience (terminal only)
            console.log('\n----------------------------------------');
            console.log(`🔑 [DEV-DEBUG] RESET CODE FOR ${email}: ${otpCode}`);
            console.log('----------------------------------------\n');
            
            res.status(500).json({ message: 'Failed to send email. Please check server configuration.' });
        }
    } catch (err) {
        console.error('❌ Forgot password error:', err);
        res.status(500).json({ message: 'Error processing forgot password request' });
    }
});

// 5. Verify OTP
app.post('/api/verify-otp', async (req, res) => {
    try {
        let { email, code } = req.body;
        email = email.trim().toLowerCase();

        const record = await OTP.findOne({ email, code });
        if (!record) {
            return res.status(400).json({ message: 'Invalid or expired reset code' });
        }

        res.json({ message: 'OTP verified successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error verifying code' });
    }
});

// 6. Reset Password
app.post('/api/reset-password', async (req, res) => {
    try {
        let { email, code, newPassword } = req.body;
        email = email.trim().toLowerCase();

        const record = await OTP.findOne({ email, code });
        if (!record) {
            return res.status(400).json({ message: 'Session expired. Please request a new code.' });
        }

        let user = await User.findOne({ email });
        let Model = User;
        
        if (!user) {
            user = await Customer.findOne({ email });
            Model = Customer;
        }
        if (!user) {
            user = await Mechanic.findOne({ email });
            Model = Mechanic;
        }

        if (!user) return res.status(404).json({ message: 'User not found' });

        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(newPassword, salt);

        await Model.findByIdAndUpdate(user._id, { password: hashedPass });
        await OTP.deleteMany({ email });

        console.log(`🔐 Password reset for ${email}`);
        res.json({ message: 'Password has been reset successfully.' });

    } catch (err) {
        console.error('❌ Reset password error:', err);
        res.status(500).json({ message: 'Error resetting password' });
    }
});

// --- VEHICLE ROUTES ---

// 7. Add Vehicle
app.post('/api/vehicles', async (req, res) => {
    try {
        const { ownerId, name, plate, brand, model, year, fuel } = req.body;
        
        // Ensure plate is stored consistently
        const normalizedPlate = plate.trim().toUpperCase();

        const newVehicle = new Vehicle({ 
            ownerId, 
            name, 
            plate: normalizedPlate, 
            brand, 
            model, 
            year: year ? Number(year) : undefined,
            fuel: fuel || 'Petrol'
        });

        await newVehicle.save();
        res.status(201).json(newVehicle);
    } catch (err) {
        console.error('❌ Error adding vehicle:', err);
        if (err.code === 11000) {
            return res.status(400).json({ message: 'This license plate is already registered.' });
        }
        res.status(500).json({ message: 'Error adding vehicle' });
    }
});

// 8. Fetch Customer Vehicles
app.get('/api/vehicles/:customerId', async (req, res) => {
    try {
        const vehicles = await Vehicle.find({ ownerId: req.params.customerId });
        res.json(vehicles);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching vehicles' });
    }
});

// --- SERVICE REQUEST ROUTES ---

// 9. Book Service
app.post('/api/service-requests', async (req, res) => {
    try {
        const { customerId, vehicleId, serviceType, issueDescription, appointmentDate, appointmentTime } = req.body;
        
        const newRequest = new ServiceRequest({
            customerId,
            vehicleId,
            serviceType,
            issueDescription,
            appointmentDate,
            appointmentTime,
            status: 'Pending'
        });

        await newRequest.save();

        // Initial Update Log
        const firstUpdate = new ServiceUpdate({
            requestId: newRequest._id,
            statusLabel: 'Service Booked',
            description: `Your ${serviceType} request has been received and is pending acceptance.`
        });
        await firstUpdate.save();

        res.status(201).json(newRequest);
    } catch (err) {
        res.status(500).json({ message: 'Error booking service' });
    }
});

// 10. Fetch Customer Services (Ongoing + History)
app.get('/api/service-requests/customer/:customerId', async (req, res) => {
    try {
        const services = await ServiceRequest.find({ customerId: req.params.customerId })
            .populate('vehicleId')
            .sort({ createdAt: -1 });
        res.json(services);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching customer services' });
    }
});

// 11. Fetch Service Timeline
app.get('/api/service-requests/:id/updates', async (req, res) => {
    try {
        const updates = await ServiceUpdate.find({ requestId: req.params.id }).sort({ timestamp: -1 });
        res.json(updates);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching timeline' });
    }
});

// 12. Update Service Status & Billing (Enhanced)
app.patch('/api/service-requests/:id/status', async (req, res) => {
    try {
        const { status, statusLabel, description, mechanicId, serviceCharges, partsCost, additionalCharges } = req.body;
        
        const updateFields = { status };
        if (mechanicId) updateFields.mechanicId = mechanicId;
        if (serviceCharges !== undefined) updateFields.serviceCharges = serviceCharges;
        if (partsCost !== undefined) updateFields.partsCost = partsCost;
        if (additionalCharges !== undefined) updateFields.additionalCharges = additionalCharges;

        const request = await ServiceRequest.findByIdAndUpdate(
            req.params.id, 
            updateFields, 
            { new: true }
        ).populate('vehicleId').populate('customerId');

        if (!request) return res.status(404).json({ message: 'Request not found' });

        // Log the update
        const update = new ServiceUpdate({
            requestId: request._id,
            statusLabel: statusLabel || `Status Updated: ${status}`,
            description: description || `Service status marked as ${status}`
        });
        await update.save();

        // --- Notifications ---
        // Notify Customer of status change
        await createNotification(
            request.customerId._id, 
            'Customer', 
            `Service Update: ${status}`, 
            `Your ${request.vehicleId.brand} ${request.vehicleId.model} service status is now: ${status}.`
        );

        // If completed, generate real invoice and notify Admin
        if (status === 'Completed') {
            const totalAmount = Number(serviceCharges || 0) + Number(partsCost || 0) + Number(additionalCharges || 0);
            
            // Delete existing invoice if any (to avoid duplicates on re-complete)
            await Invoice.deleteMany({ requestId: request._id });

            const newInvoice = new Invoice({
                requestId: request._id,
                customerId: request.customerId._id,
                amount: totalAmount,
                serviceCharges: Number(serviceCharges || 0),
                partsCost: Number(partsCost || 0),
                additionalCharges: Number(additionalCharges || 0),
                status: 'Paid'
            });
            await newInvoice.save();

            // Notify Admin
            const admin = await User.findOne({ role: 'Admin' });
            if (admin) {
                await createNotification(
                    admin._id,
                    'Admin',
                    'Service Completed',
                    `Mechanic has completed service for ${request.vehicleId.brand} (Owner: ${request.customerId.fullName}). Bill: ₹${totalAmount.toLocaleString()}`
                );
            }
        }

        res.json({ request, update });
    } catch (err) {
        console.error("❌ Status update error:", err);
        res.status(500).json({ message: 'Error updating status' });
    }
});

// 12b. Save Service Notes (Mechanic)
app.patch('/api/service-requests/:id/notes', async (req, res) => {
    try {
        const { notes } = req.body;
        const request = await ServiceRequest.findByIdAndUpdate(
            req.params.id,
            { notes },
            { new: true }
        );
        if (!request) return res.status(404).json({ message: 'Request not found' });
        res.json({ message: 'Notes saved successfully', notes: request.notes });
    } catch (err) {
        res.status(500).json({ message: 'Error saving notes' });
    }
});

// 12a. Fetch Assigned Mechanic Requests
app.get('/api/mechanic/:mechanicId/requests', async (req, res) => {
    try {
        const requests = await ServiceRequest.find({ mechanicId: req.params.mechanicId })
            .populate('customerId', 'fullName email phone')
            .populate('vehicleId')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching mechanic requests' });
    }
});

// --- INVOICE ROUTES ---

// 13. Fetch Customer Invoices
app.get('/api/invoices/customer/:customerId', async (req, res) => {
    try {
        const invoices = await Invoice.find({ customerId: req.params.customerId })
            .populate({
                path: 'requestId',
                populate: { path: 'vehicleId' }
            })
            .sort({ generatedAt: -1 });
        res.json(invoices);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching invoices' });
    }
});

// 13.b Fetch Single Detailed Invoice
app.get('/api/invoices/:invoiceId', async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.invoiceId)
            .populate('customerId', 'fullName email phone')
            .populate({
                path: 'requestId',
                populate: [
                    { path: 'vehicleId' },
                    { path: 'mechanicId', select: 'fullName' }
                ]
            });
        
        if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
        res.json(invoice);
    } catch (err) {
        console.error("❌ Error fetching detailed invoice:", err);
        res.status(500).json({ message: 'Error fetching invoice details' });
    }
});

// 13.c Fetch Single Detailed Invoice by Request ID
app.get('/api/invoices/request/:requestId', async (req, res) => {
    try {
        const invoice = await Invoice.findOne({ requestId: req.params.requestId })
            .populate('customerId', 'fullName email phone')
            .populate({
                path: 'requestId',
                populate: [
                    { path: 'vehicleId' },
                    { path: 'mechanicId', select: 'fullName' }
                ]
            });
        
        if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
        res.json(invoice);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching invoice details' });
    }
});

// --- USER PROFILE & VEHICLE ROUTES ---

// 14. Get User Profile
app.get('/api/user/:id', async (req, res) => {
    try {
        let user = await User.findById(req.params.id, '-password');
        if (!user) user = await Customer.findById(req.params.id, '-password');
        if (!user) user = await Mechanic.findById(req.params.id, '-password');
        
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching profile' });
    }
});

// 15. Update User Profile
app.put('/api/user/:id', async (req, res) => {
    try {
        const { fullName, email, phone, address, specialization, experience, role } = req.body;
        
        // Normalization
        let normalizedSpec = specialization;
        if (typeof specialization === 'string') {
            normalizedSpec = specialization ? [specialization] : [];
        } else if (!Array.isArray(specialization)) {
            normalizedSpec = [];
        }

        const updateData = { 
            fullName, 
            email, 
            phone, 
            address, 
            specialization: normalizedSpec, 
            experience 
        };
        
        console.log(`\n-----------------------------------------`);
        console.log(`👤 UPDATE ATTEMPT: ${role || 'Unknown Role'}`);
        console.log(`🆔 ID: ${req.params.id}`);
        console.log(`📝 DATA:`, updateData);
        
        // Diagnostic: Check schema type at runtime
        console.log(`🔍 Schema path type for specialization:`, Mechanic.schema.path('specialization')?.instance);
        
        let user = null;
        
        // Priority 1: Match by specific Role
        if (role === 'Mechanic') {
            user = await Mechanic.findByIdAndUpdate(req.params.id, updateData, { new: true, select: '-password' });
            console.log(user ? `✅ Found & Updated in Mechanic collection` : `❓ Not found in Mechanic collection`);
        } else if (role === 'Customer') {
            user = await Customer.findByIdAndUpdate(req.params.id, updateData, { new: true, select: '-password' });
            console.log(user ? `✅ Found & Updated in Customer collection` : `❓ Not found in Customer collection`);
        }
        
        // Priority 2: Fallback to all collections if not found yet
        if (!user) {
            console.log(`🔍 Falling back to full cross-collection search...`);
            user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true, select: '-password' });
            if (!user) user = await Customer.findByIdAndUpdate(req.params.id, updateData, { new: true, select: '-password' });
            if (!user) user = await Mechanic.findByIdAndUpdate(req.params.id, updateData, { new: true, select: '-password' });
        }
        
        if (!user) {
            console.log(`❌ FAILED: User not found in any collection (ID: ${req.params.id})`);
            console.log(`-----------------------------------------\n`);
            return res.status(404).json({ message: 'User not found in database. Please re-login.' });
        }

        console.log(`🎊 SUCCESS: Updated profile for ${user.fullName}`);
        console.log(`-----------------------------------------\n`);
        
        res.json({ message: 'Profile updated successfully', user });
    } catch (err) {
        console.error("❌ CRITICAL ERROR during profile update:", err);
        res.status(500).json({ message: 'Server error encountered while saving' });
    }
});

// 16. Change Password
app.put('/api/user/:id/password', async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        let user = await User.findById(req.params.id);
        let Model = User;
        if (!user) { user = await Customer.findById(req.params.id); Model = Customer; }
        if (!user) { user = await Mechanic.findById(req.params.id); Model = Mechanic; }
        
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' });
        
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(newPassword, salt);
        
        await Model.findByIdAndUpdate(req.params.id, { password: hashedPass });
        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error updating password' });
    }
});

// 17. Update Vehicle
app.put('/api/vehicles/:id', async (req, res) => {
    try {
        const { name, plate, brand, model, year, fuel } = req.body;
        const updatedVehicle = await Vehicle.findByIdAndUpdate(
            req.params.id,
            { name, plate, brand, model, year, fuel },
            { new: true }
        );
        if (!updatedVehicle) return res.status(404).json({ message: 'Vehicle not found' });
        res.json(updatedVehicle);
    } catch (err) {
        res.status(500).json({ message: 'Error updating vehicle' });
    }
});

// 18. Delete Vehicle
app.delete('/api/vehicles/:id', async (req, res) => {
    try {
        const deletedVehicle = await Vehicle.findByIdAndDelete(req.params.id);
        if (!deletedVehicle) return res.status(404).json({ message: 'Vehicle not found' });
        res.json({ message: 'Vehicle deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting vehicle' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
