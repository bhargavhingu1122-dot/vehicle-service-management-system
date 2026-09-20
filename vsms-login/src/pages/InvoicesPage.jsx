import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './InvoicesPage.css';
import { fetchCustomerInvoices } from '../services/api';
import InvoiceView from '../components/InvoiceView';

const InvoicesPage = ({ onBook, userId }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [invoicesData, setInvoicesData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);

    useEffect(() => {
        const loadInvoices = async () => {
            if (!userId) return;
            setIsLoading(true);
            try {
                const { data } = await fetchCustomerInvoices(userId);
                const mapped = data.map(inv => ({
                    id: inv._id.substring(inv._id.length-8).toUpperCase(),
                    dbId: inv._id,
                    vehicle: inv.requestId?.vehicleId?.name || 'N/A',
                    type: inv.requestId?.serviceType || 'Service',
                    date: new Date(inv.generatedAt).toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' }),
                    amount: inv.amount,
                    status: inv.status
                }));
                setInvoicesData(mapped);
            } catch (err) {
                console.error("Error loading invoices:", err);
            } finally {
                setIsLoading(false);
            }
        };
        loadInvoices();
    }, [userId]);

    const filteredInvoices = invoicesData.filter(invoice => {
        const matchesSearch = invoice.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            invoice.id.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'All' || invoice.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    if (selectedInvoiceId) {
        return <InvoiceView invoiceId={selectedInvoiceId} onBack={() => setSelectedInvoiceId(null)} />;
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="invoices-page-wrapper"
        >
            <header className="invoices-header-v">
                <div className="header-text-v">
                    <h1>Invoices</h1>
                    <p>Manage and download your service invoices.</p>
                </div>
            </header>

            <div className="invoices-controls-v glass-panel-v">
                <div className="search-box-v">
                    <i className="ph-bold ph-magnifying-glass"></i>
                    <input 
                        type="text" 
                        placeholder="Search by vehicle name or invoice ID..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-pills-v">
                    {['All', 'Paid', 'Pending'].map(f => (
                        <button 
                            key={f} 
                            className={`filter-pill-v ${statusFilter === f ? 'active' : ''}`}
                            onClick={() => setStatusFilter(f)}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="invoices-table-container glass-panel-v">
                <AnimatePresence mode="wait">
                    {filteredInvoices.length > 0 ? (
                        <motion.table 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="billing-table-v"
                        >
                            <thead>
                                <tr>
                                    <th>Invoice ID</th>
                                    <th>Vehicle Name</th>
                                    <th>Service Type</th>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInvoices.map((invoice) => (
                                    <tr key={invoice.dbId}>
                                        <td className="invoice-id-v">{invoice.id}</td>
                                        <td className="vehicle-name-v">{invoice.vehicle}</td>
                                        <td className="service-type-v">{invoice.type}</td>
                                        <td className="date-v">{invoice.date}</td>
                                        <td className="amount-v">{invoice.amount}</td>
                                        <td>
                                            <span className={`status-badge-v ${invoice.status.toLowerCase()}`}>
                                                {invoice.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button 
                                                className="download-invoice-btn" 
                                                title="View / Download PDF"
                                                onClick={() => setSelectedInvoiceId(invoice.dbId)}
                                            >
                                                <i className="ph-bold ph-file-text"></i>
                                                View Invoice
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </motion.table>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="invoices-empty-state"
                        >
                            <i className="ph-bold ph-file-dashed"></i>
                            <h3>No invoices available</h3>
                            <p>We couldn't find any invoices matching your search or filters.</p>
                            {statusFilter === 'All' && searchTerm === '' && (
                                <button className="book-svc-cta" onClick={onBook}>Book Service</button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default InvoicesPage;
