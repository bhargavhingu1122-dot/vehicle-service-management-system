const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = 'mongodb://localhost:27017/vsms';

// Define User Schema inline for simplicity
const UserSchema = new mongoose.Schema({
    fullName: String,
    email: String,
    password: { type: String, required: true },
    role: String
});
const User = mongoose.model('User', UserSchema);

async function forceUpdateAdmin() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Delete all Admins
        const deleteRes = await User.deleteMany({ role: 'Admin' });
        console.log(`🗑️ Deleted ${deleteRes.deletedCount} old admin(s)`);

        // Create new Admin
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('2205', salt);
        const newAdmin = new User({
            fullName: 'Sneha Parmar',
            email: 'vehiclecare2354@gmail.com',
            password: hashedPassword,
            role: 'Admin'
        });

        await newAdmin.save();
        console.log('🚀 Created new Admin:');
        console.log('   Email: vehiclecare2354@gmail.com');
        console.log('   Pass:  2205');
        console.log('   Name:  Sneha Parmar');

        process.exit(0);
    } catch (err) {
        console.error('❌ Error during force update:', err);
        process.exit(1);
    }
}

forceUpdateAdmin();
