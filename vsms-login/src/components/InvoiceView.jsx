import React, { useState, useEffect } from 'react';
import { fetchInvoiceDetail, fetchInvoiceByRequestId } from '../services/api';
import './InvoiceView.css';

const InvoiceView = ({ invoiceId, requestId, onBack, showDownload = true }) => {
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadInvoice = async () => {
            if (!invoiceId && !requestId) return;
            try {
                setLoading(true);
                let response;
                if (invoiceId) {
                    response = await fetchInvoiceDetail(invoiceId);
                } else if (requestId) {
                    response = await fetchInvoiceByRequestId(requestId);
                }
                setInvoice(response?.data);
            } catch (err) {
                console.error("Failed to load invoice:", err);
                setError("Could not load invoice details.");
            } finally {
                setLoading(false);
            }
        };
        loadInvoice();
    }, [invoiceId, requestId]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="invoice-loading">
                <i className="ph-bold ph-spinner ph-spin"></i>
                <p>Generating Invoice...</p>
            </div>
        );
    }

    if (error || !invoice) {
        return (
            <div className="invoice-error">
                <i className="ph-bold ph-warning-circle"></i>
                <p>{error || "Invoice not found"}</p>
                <button onClick={onBack} className="invoice-back-btn">Go Back</button>
            </div>
        );
    }

    const { customerId, requestId: refRequestId, amount, serviceCharges, partsCost, additionalCharges, generatedAt } = invoice;
    const vehicle = refRequestId?.vehicleId || {};
    const mechanic = refRequestId?.mechanicId || {};

    const formattedDate = new Date(generatedAt).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
    });
    const invNumber = `INV-${invoice._id.slice(-6).toUpperCase()}`;

    return (
        <div className="invoice-view-container">
            <div className="invoice-controls no-print">
                <button onClick={onBack} className="invoice-back-btn">
                    <i className="ph-bold ph-arrow-left"></i> Back
                </button>
            </div>

            <div className="invoice-paper">
                {/* Header */}
                <div className="invoice-header">
                    <div className="garage-info">
                        <h1>VEHICLE CARE</h1>
                        <p>123 Auto Service Hub, SG Highway</p>
                        <p>Ahmedabad, Gujarat 380015</p>
                        <p>Phone: +91 98765 43210</p>
                        <p>Email: support@vehiclecare.com</p>
                    </div>
                    <div className="invoice-meta">
                        <h2 className="invoice-title">INVOICE</h2>
                        <div className="meta-row">
                            <span className="meta-label">Invoice No:</span>
                            <span className="meta-value">{invNumber}</span>
                        </div>
                        <div className="meta-row">
                            <span className="meta-label">Date:</span>
                            <span className="meta-value">{formattedDate}</span>
                        </div>
                    </div>
                </div>

                <div className="invoice-divider"></div>

                {/* Details Section */}
                <div className="invoice-details-grid">
                    <div className="details-box">
                        <h3>Billed To</h3>
                        <p className="strong">{customerId?.fullName || 'Walk-in Customer'}</p>
                        <p>{customerId?.phone || 'N/A'}</p>
                        <p>{customerId?.email || 'N/A'}</p>
                    </div>
                    <div className="details-box">
                        <h3>Vehicle Details</h3>
                        <p><span className="label">Vehicle:</span> {vehicle.brand} {vehicle.model || vehicle.name}</p>
                        <p><span className="label">Reg No:</span> {vehicle.plate}</p>
                        <p><span className="label">Fuel Type:</span> {vehicle.fuel || 'Petrol'}</p>
                    </div>
                </div>

                {/* Service Details */}
                <div className="service-context">
                    <h3>Service Information</h3>
                    <p><strong>Type:</strong> {requestId?.serviceType}</p>
                    <p><strong>Reported Issue:</strong> {requestId?.issueDescription}</p>
                    <p><strong>Mechanic Assigned:</strong> {mechanic.fullName || 'N/A'}</p>
                </div>

                {/* Charges Table */}
                <table className="invoice-table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th className="text-right">Amount (₹)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Service & Labor Charges</td>
                            <td className="text-right">{(serviceCharges || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        </tr>
                        <tr>
                            <td>Parts & Materials Cost</td>
                            <td className="text-right">{(partsCost || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        </tr>
                        <tr>
                            <td>Additional Charges (Taxes/Fees)</td>
                            <td className="text-right">{(additionalCharges || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <td className="text-right strong total-label">Grand Total</td>
                            <td className="text-right strong total-value">₹ {(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        </tr>
                    </tfoot>
                </table>

                {/* Footer */}
                <div className="invoice-footer">
                    <p className="thank-you">Thank you for choosing Vehicle Care!</p>
                    <p className="footer-note">* This is a computer generated invoice and does not require a physical signature.</p>
                </div>
            </div>

            {/* Bottom-right Download/Print button — hidden in mechanic panel */}
            {showDownload && (
                <div className="invoice-bottom-actions no-print">
                    <button onClick={handlePrint} className="invoice-print-btn invoice-print-btn--large">
                        <i className="ph-bold ph-download-simple"></i> Download / Print
                    </button>
                </div>
            )}
        </div>
    );
};

export default InvoiceView;
