import { db } from "../src/database.js";


const getDate = () => {
    const date = new Date();
    return {
        createdDate: date.toISOString().slice(0, 10),
        createdTime: date.toLocaleTimeString('en-GB', { hour12: false }) // "HH:mm:ss"
    };
};

// Fetch four wheeler companies
export async function fetchAutomotiveCompanies(req, res) {
    try {
        const companies = await db.collection("automotive_companies").find({}).toArray();
        console.log("Fetched companies:", companies);
        res.status(200).send(companies);
    } catch (err) {
        console.error("Error fetching four wheeler companies:", err);
        res.status(500).send([]);
    }
}

// Fetch services data
export async function fetchWorkshopServices(req, res) {
    try {
        const services = await db.collection("workshop_services").find({}).toArray();
        console.log("Fetched services:", services);
        // Optionally add _id as id
        const result = services.map(service => ({ id: service._id, ...service }));
        res.status(200).send(result);
    } catch (err) {
        console.error("Error fetching services:", err);
        res.status(500).send([]);
    }
}

// Fetch last invoice
export async function fetchLastInvoice(req, res) {
    try {
        const today = new Date().toISOString().slice(0, 10);
        const lastInvoice = await db.collection("customer_invoices")
            .find({ createdDate: today })
            .sort({ createdTime: -1 }) // Sort by time descending
            .limit(1)
            .toArray();
        if (lastInvoice.length > 0) {
            res.status(200).send({ id: lastInvoice[0]._id, ...lastInvoice[0] });
        } else {
            res.status(200).send(null);
        }
    } catch (err) {
        console.error("Error fetching last invoice:", err);
        res.status(500).send(null);
    }
}

export const storeCustomerInvoices = async (req, res) => {
    console.log("Storing customer invoice...",req.body);
    const {
        customerName,
        customerPhone,
        company,
        carModel,
        workDone,
        prices,
        total,
        paymentMode
    } = req.body;

    if (
        !customerName ||
        !customerPhone ||
        !company ||
        !carModel ||
        !workDone ||
        !prices ||
        !total ||
        !paymentMode
    ) {
        return res.status(400).send({ error: "All fields are required" });
    }

    const {  createdDate, createdTime } = getDate();

    try {
        // Find invoices with the same createdDate
        const invoices = await db.collection("customer_invoices").find({ createdDate }).toArray();

        let matchedDoc = null;
        for (const invoice of invoices) {
            const isSameWorkDone =
                Array.isArray(invoice.workDone) &&
                workDone.length === invoice.workDone.length &&
                workDone.every((item, idx) => item === invoice.workDone[idx]);
            if (isSameWorkDone) {
                matchedDoc = invoice;
                break;
            }
        }

        if (matchedDoc) {
            // Prepare update payload
            const updatePayload = {};
            if (matchedDoc.customerName !== customerName) updatePayload.customerName = customerName;
            if (matchedDoc.customerPhone !== customerPhone) updatePayload.customerPhone = customerPhone;
            if (matchedDoc.company !== company) updatePayload.company = company;
            if (matchedDoc.carModel !== carModel) updatePayload.carModel = carModel;
            if (matchedDoc.paymentMode !== paymentMode) updatePayload.paymentMode = paymentMode;
            if (matchedDoc.total !== total) updatePayload.total = total;
            if (JSON.stringify(matchedDoc.prices) !== JSON.stringify(prices)) updatePayload.prices = prices;

            if (Object.keys(updatePayload).length === 0) {
                console.log("No changes found. Invoice already up-to-date.");
                return res.status(200).send({ success: true, id: matchedDoc._id });
            }

            await db.collection("customer_invoices").updateOne(
                { _id: matchedDoc._id },
                { $set: updatePayload }
            );
            console.log("Existing invoice updated:", matchedDoc._id);
            return res.status(200).send({ success: true, id: matchedDoc._id });
        } else {
            // No match — create new invoice
            const newInvoice = {
                customerName,
                customerPhone,
                company,
                carModel,
                workDone,
                prices,
                total,
                paymentMode,
                createdDate,
                createdTime,
            };
            const result = await db.collection("customer_invoices").insertOne(newInvoice);
            console.log("New invoice created with ID:", result.insertedId);
            return res.status(200).send({ success: true, id: result.insertedId });
        }
    } catch (err) {
        console.error("Error storing invoice:", err);
        return res.status(500).send({ error: "Internal Server Error" });
    }
};
