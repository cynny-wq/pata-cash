import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
const saveBtn = document.getElementById("saveBtn");

saveBtn.addEventListener("click", saveInvoice);

// Load invoices when page opens
loadInvoices();
updateDashboard();

// ==========================
// SAVE INVOICE
// ==========================
async function saveInvoice() {

    const customerName = document.getElementById("customerName").value.trim();
    const customerPhone = document.getElementById("customerPhone").value.trim();
    const amount = document.getElementById("invoiceAmount").value;
    const dueDate = document.getElementById("dueDate").value;

    if (!customerName || !customerPhone || !amount || !dueDate) {
        alert("Please fill in all fields.");
        return;
    }

    try {

        await addDoc(collection(db, "invoices"), {

            customerName,
            customerPhone,
            amount: Number(amount),
            dueDate,
            status: "Pending",
            createdAt: serverTimestamp()

        });

        alert("✅ Invoice saved successfully!");

        document.getElementById("customerName").value = "";
        document.getElementById("customerPhone").value = "";
        document.getElementById("invoiceAmount").value = "";
        document.getElementById("dueDate").value = "";

        await loadInvoices();
        await updateDashboard();

    } catch (error) {

        console.error(error);
        alert("Error saving invoice.");

    }

}

// ==========================
// LOAD INVOICES
// ==========================
async function loadInvoices() {

    const table = document.getElementById("invoiceTable");

    if (!table) return;

    table.innerHTML = "";

    try {

        const querySnapshot = await getDocs(collection(db, "invoices"));

        if (querySnapshot.empty) {

            table.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center;">
                        No invoices found
                    </td>
                </tr>
            `;

            return;

        }

        querySnapshot.forEach((doc) => {

            const invoice = doc.data();

            table.innerHTML += `
                <tr>
                    <td>${invoice.customerName}</td>
                    <td>${invoice.customerPhone}</td>
                    <td>KES ${invoice.amount}</td>
                    <td>${invoice.dueDate}</td>
                    <td>
    ${
        invoice.status === "Paid"
        ? "<span style='color:green;font-weight:bold;'>🟢 Paid</span>"
        : "<span style='color:orange;font-weight:bold;'>🟡 Pending</span>"
    }
</td>
        <td>
    ${
        invoice.status === "Pending"
        ? `<button onclick="markPaid('${doc.id}')">✅ Mark Paid</button><br><br>`
        : `✅ Paid`
    }

    <button onclick="deleteInvoice('${doc.id}')">🗑 Delete</button>
</td>
                </tr>
            `;

        });

    } catch (error) {

        console.error(error);

    }

}
async function markPaid(id) {

    try {

        await updateDoc(doc(db, "invoices", id), {

            status: "Paid"

        });

        await loadInvoices();
        await updateDashboard();

    } catch (error) {

        console.error(error);

    }

}
window.markPaid = markPaid;
window.deleteInvoice = deleteInvoice;
async function deleteInvoice(id) {

    const confirmDelete = confirm("Delete this invoice?");

    if (!confirmDelete) return;

    try {

        await deleteDoc(doc(db, "invoices", id));

        await loadInvoices();
        await updateDashboard();

        alert("Invoice deleted successfully.");

    } catch (error) {

        console.error(error);

        alert("Failed to delete invoice.");

    }

}

async function updateDashboard() {

    const snapshot = await getDocs(collection(db, "invoices"));

    let total = 0;
    let pending = 0;
    let paid = 0;
    let collected = 0;

    snapshot.forEach((doc) => {

        const invoice = doc.data();

        total++;

        if (invoice.status === "Pending") {
            pending++;
        }

        if (invoice.status === "Paid") {
            paid++;
            collected += Number(invoice.amount);
        }

    });

    document.getElementById("totalInvoices").textContent = total;
    document.getElementById("pendingInvoices").textContent = pending;
    document.getElementById("paidInvoices").textContent = paid;
    document.getElementById("totalCollected").textContent =
        `KES ${collected.toLocaleString()}`;

}