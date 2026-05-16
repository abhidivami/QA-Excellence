/**
 * Unit Tests — Vendor Invoice Management Portal
 *
 * Tests the core business logic functions in complete isolation.
 * No database, no network, no external dependencies.
 * In a real project these functions would be imported from the source code.
 */

// ============================================================
// FUNCTIONS UNDER TEST
// (In a real project: import { validateInvoiceAmount } from '../src/invoiceUtils')
// ============================================================

function validateInvoiceAmount(amount) {
    if (typeof amount !== 'number') return { valid: false, error: 'Amount must be a number' };
    if (amount <= 0)                return { valid: false, error: 'Amount must be greater than zero' };
    if (amount > 10000000)          return { valid: false, error: 'Amount exceeds maximum limit' };
    return { valid: true, error: null };
}

function isValidFileType(filename) {
    if (!filename || !filename.includes('.')) return false;
    const allowed = ['pdf', 'jpg', 'jpeg', 'png'];
    const ext = filename.split('.').pop().toLowerCase();
    return allowed.includes(ext);
}

function isDuplicateInvoice(invoiceNumber, existingInvoices) {
    return existingInvoices.some(inv => inv.invoiceNumber === invoiceNumber);
}

const permissions = {
    AP:     ['view_invoices', 'approve_invoice', 'reject_invoice', 'view_reports'],
    Admin:  ['view_invoices', 'approve_invoice', 'reject_invoice', 'view_reports', 'manage_users'],
    Vendor: ['submit_invoice', 'view_own_invoices']
};

function hasPermission(role, action) {
    if (!permissions[role]) return false;
    return permissions[role].includes(action);
}

function calculateTax(amount, rate) {
    return (amount * rate) / 100;
}

function formatInvoiceStatus(status) {
    const map = {
        pending:   'Pending Review',
        approved:  'Approved',
        rejected:  'Rejected',
        paid:      'Payment Processed'
    };
    return map[status] || 'Unknown Status';
}

// ============================================================
// TEST SUITE 1 — validateInvoiceAmount
// ============================================================

describe('validateInvoiceAmount', () => {

    describe('Happy Path', () => {
        test('valid positive amount returns valid=true and no error', () => {
            const result = validateInvoiceAmount(50000);
            expect(result.valid).toBe(true);
            expect(result.error).toBeNull();
        });

        test('amount of 1 (minimum positive) is accepted', () => {
            const result = validateInvoiceAmount(1);
            expect(result.valid).toBe(true);
        });

        test('amount exactly at maximum limit is accepted', () => {
            const result = validateInvoiceAmount(10000000);
            expect(result.valid).toBe(true);
        });
    });

    describe('Boundary Values', () => {
        test('amount = 0 is rejected — must be greater than zero', () => {
            const result = validateInvoiceAmount(0);
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Amount must be greater than zero');
        });

        test('amount = 10000001 (one above max) is rejected', () => {
            const result = validateInvoiceAmount(10000001);
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Amount exceeds maximum limit');
        });
    });

    describe('Negative Inputs', () => {
        test('negative amount is rejected', () => {
            const result = validateInvoiceAmount(-100);
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Amount must be greater than zero');
        });

        test('string input is rejected with correct error', () => {
            const result = validateInvoiceAmount('fifty thousand');
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Amount must be a number');
        });

        test('null input is rejected', () => {
            const result = validateInvoiceAmount(null);
            expect(result.valid).toBe(false);
        });

        test('undefined input is rejected', () => {
            const result = validateInvoiceAmount(undefined);
            expect(result.valid).toBe(false);
        });

        test('array input is rejected', () => {
            const result = validateInvoiceAmount([50000]);
            expect(result.valid).toBe(false);
        });
    });
});

// ============================================================
// TEST SUITE 2 — isValidFileType
// ============================================================

describe('isValidFileType', () => {

    describe('Allowed File Types', () => {
        test('PDF file is accepted', () => {
            expect(isValidFileType('invoice.pdf')).toBe(true);
        });

        test('JPEG file is accepted', () => {
            expect(isValidFileType('receipt.jpeg')).toBe(true);
        });

        test('JPG file is accepted', () => {
            expect(isValidFileType('photo.jpg')).toBe(true);
        });

        test('PNG file is accepted', () => {
            expect(isValidFileType('scan.png')).toBe(true);
        });
    });

    describe('Blocked File Types — Security', () => {
        test('EXE file is blocked', () => {
            expect(isValidFileType('malware.exe')).toBe(false);
        });

        test('BAT file is blocked', () => {
            expect(isValidFileType('script.bat')).toBe(false);
        });

        test('JS file is blocked', () => {
            expect(isValidFileType('payload.js')).toBe(false);
        });

        test('ZIP file is blocked', () => {
            expect(isValidFileType('archive.zip')).toBe(false);
        });

        test('SVG file is blocked — can contain embedded scripts', () => {
            expect(isValidFileType('icon.svg')).toBe(false);
        });
    });

    describe('Edge Cases', () => {
        test('uppercase extension PDF is treated same as pdf', () => {
            expect(isValidFileType('INVOICE.PDF')).toBe(true);
        });

        test('mixed case extension is handled', () => {
            expect(isValidFileType('photo.Jpg')).toBe(true);
        });

        test('file with no extension returns false', () => {
            expect(isValidFileType('invoice')).toBe(false);
        });

        test('empty string returns false', () => {
            expect(isValidFileType('')).toBe(false);
        });

        test('null returns false', () => {
            expect(isValidFileType(null)).toBe(false);
        });

        test('file with only a dot returns false', () => {
            expect(isValidFileType('.')).toBe(false);
        });
    });
});

// ============================================================
// TEST SUITE 3 — isDuplicateInvoice
// ============================================================

describe('isDuplicateInvoice', () => {

    const existingInvoices = [
        { invoiceNumber: 'INV-2026-001', amount: 50000 },
        { invoiceNumber: 'INV-2026-002', amount: 30000 }
    ];

    describe('Happy Path', () => {
        test('new unique invoice number is not a duplicate', () => {
            expect(isDuplicateInvoice('INV-2026-003', existingInvoices)).toBe(false);
        });

        test('empty invoice list means nothing is a duplicate', () => {
            expect(isDuplicateInvoice('INV-2026-001', [])).toBe(false);
        });
    });

    describe('Duplicate Detection', () => {
        test('exact match of existing invoice number is detected', () => {
            expect(isDuplicateInvoice('INV-2026-001', existingInvoices)).toBe(true);
        });

        test('second existing invoice number is also detected', () => {
            expect(isDuplicateInvoice('INV-2026-002', existingInvoices)).toBe(true);
        });
    });

    describe('Edge Cases', () => {
        test('check is case-sensitive — INV-2026-001 and inv-2026-001 are different', () => {
            expect(isDuplicateInvoice('inv-2026-001', existingInvoices)).toBe(false);
        });

        test('partial match is not treated as duplicate', () => {
            expect(isDuplicateInvoice('INV-2026', existingInvoices)).toBe(false);
        });

        test('invoice number with trailing space is not a duplicate', () => {
            expect(isDuplicateInvoice('INV-2026-001 ', existingInvoices)).toBe(false);
        });
    });
});

// ============================================================
// TEST SUITE 4 — hasPermission
// ============================================================

describe('hasPermission', () => {

    describe('AP Role', () => {
        test('AP can view invoices', () => {
            expect(hasPermission('AP', 'view_invoices')).toBe(true);
        });

        test('AP can approve invoices', () => {
            expect(hasPermission('AP', 'approve_invoice')).toBe(true);
        });

        test('AP can reject invoices', () => {
            expect(hasPermission('AP', 'reject_invoice')).toBe(true);
        });

        test('AP cannot submit invoices', () => {
            expect(hasPermission('AP', 'submit_invoice')).toBe(false);
        });

        test('AP cannot manage users', () => {
            expect(hasPermission('AP', 'manage_users')).toBe(false);
        });
    });

    describe('Vendor Role', () => {
        test('Vendor can submit invoices', () => {
            expect(hasPermission('Vendor', 'submit_invoice')).toBe(true);
        });

        test('Vendor can view their own invoices', () => {
            expect(hasPermission('Vendor', 'view_own_invoices')).toBe(true);
        });

        test('Vendor cannot approve invoices', () => {
            expect(hasPermission('Vendor', 'approve_invoice')).toBe(false);
        });

        test('Vendor cannot view all invoices', () => {
            expect(hasPermission('Vendor', 'view_invoices')).toBe(false);
        });

        test('Vendor cannot access reports', () => {
            expect(hasPermission('Vendor', 'view_reports')).toBe(false);
        });
    });

    describe('Admin Role', () => {
        test('Admin can manage users', () => {
            expect(hasPermission('Admin', 'manage_users')).toBe(true);
        });

        test('Admin can approve invoices', () => {
            expect(hasPermission('Admin', 'approve_invoice')).toBe(true);
        });

        test('Admin can view reports', () => {
            expect(hasPermission('Admin', 'view_reports')).toBe(true);
        });
    });

    describe('Unknown Role', () => {
        test('unknown role is denied everything', () => {
            expect(hasPermission('Guest', 'view_invoices')).toBe(false);
        });

        test('empty string role is denied', () => {
            expect(hasPermission('', 'view_invoices')).toBe(false);
        });

        test('undefined role is denied', () => {
            expect(hasPermission(undefined, 'view_invoices')).toBe(false);
        });
    });
});

// ============================================================
// TEST SUITE 5 — calculateTax
// ============================================================

describe('calculateTax', () => {

    test('standard GST 18% on 100 returns 18', () => {
        expect(calculateTax(100, 18)).toBe(18);
    });

    test('zero amount returns zero tax', () => {
        expect(calculateTax(0, 18)).toBe(0);
    });

    test('zero rate returns zero tax', () => {
        expect(calculateTax(100, 0)).toBe(0);
    });

    test('negative amount produces negative tax', () => {
        expect(calculateTax(-100, 18)).toBe(-18);
    });

    test('decimal rate is handled correctly', () => {
        expect(calculateTax(200, 5.5)).toBeCloseTo(11);
    });

    test('large amount is calculated correctly', () => {
        expect(calculateTax(1000000, 18)).toBe(180000);
    });
});

// ============================================================
// TEST SUITE 6 — formatInvoiceStatus
// ============================================================

describe('formatInvoiceStatus', () => {

    test('pending maps to Pending Review', () => {
        expect(formatInvoiceStatus('pending')).toBe('Pending Review');
    });

    test('approved maps to Approved', () => {
        expect(formatInvoiceStatus('approved')).toBe('Approved');
    });

    test('rejected maps to Rejected', () => {
        expect(formatInvoiceStatus('rejected')).toBe('Rejected');
    });

    test('paid maps to Payment Processed', () => {
        expect(formatInvoiceStatus('paid')).toBe('Payment Processed');
    });

    test('unknown status returns Unknown Status', () => {
        expect(formatInvoiceStatus('cancelled')).toBe('Unknown Status');
    });

    test('empty string returns Unknown Status', () => {
        expect(formatInvoiceStatus('')).toBe('Unknown Status');
    });

    test('null returns Unknown Status', () => {
        expect(formatInvoiceStatus(null)).toBe('Unknown Status');
    });
});
