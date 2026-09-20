const mongoose = require('mongoose');
const Invoice = require('./models/Invoice');
mongoose.connect('mongodb://localhost:27017/vsms').then(async () => {
    await Invoice.updateMany({}, {status: 'Paid'});
    console.log('Successfully updated all invoices to Paid status.');
    process.exit();
}).catch(err => {
    console.error(err);
    process.exit(1);
});
