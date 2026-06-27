import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
const saveBtn = document.getElementById("saveBtn");
const updateBtn = document.getElementById("updateBtn");
let currentInvoiceId = null;
let invoices = [];
saveBtn.addEventListener("click", saveInvoice);
document
    .getElementById("searchInput")
    .addEventListener("keyup", searchInvoices);
updateBtn.addEventListener("click", updateInvoice);

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
function displayInvoices(list) {

    const table = document.getElementById("invoiceTable");

    table.innerHTML = "";

    if (list.length === 0) {
        table.innerHTML = `
        <tr>
            <td colspan="6" style="text-align:center;">
                No invoices found
            </td>
        </tr>
        `;
        return;
    }

    list.forEach((invoice) => {

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

                <div class="action-buttons">

                    ${
                        invoice.status === "Pending"
                        ? `<button class="btn-paid" onclick="markPaid('${invoice.id}')">✅ Mark Paid</button>`
                        : `<span class="paid-label">✅ Paid</span>`
                    }

                    <button class="btn-edit" onclick="editInvoice('${invoice.id}')">
                        ✏️ Edit
                    </button>

                    <button class="btn-delete" onclick="deleteInvoice('${invoice.id}')">
                        🗑 Delete
                    </button>

                </div>

            </td>

        </tr>
        `;

    });

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
window.editInvoice = editInvoice;
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
async function editInvoice(id){

    const docRef = doc(db, "invoices", id);

    const docSnap = await getDoc(docRef);

    if(docSnap.exists()){

        const invoice = docSnap.data();

        document.getElementById("customerName").value = invoice.customerName;
        document.getElementById("customerPhone").value = invoice.customerPhone;
        document.getElementById("invoiceAmount").value = invoice.amount;
        document.getElementById("dueDate").value = invoice.dueDate;

        currentInvoiceId = id;

        saveBtn.style.display = "none";
        updateBtn.style.display = "block";

    }

}
async function updateInvoice(){

    if(!currentInvoiceId) return;

    await updateDoc(doc(db,"invoices",currentInvoiceId),{

        customerName:document.getElementById("customerName").value,

        customerPhone:document.getElementById("customerPhone").value,

        amount:Number(document.getElementById("invoiceAmount").value),

        dueDate:document.getElementById("dueDate").value

    });

    alert("✅ Invoice updated!");

    currentInvoiceId = null;

    saveBtn.style.display="block";
    updateBtn.style.display="none";

    document.getElementById("customerName").value="";
    document.getElementById("customerPhone").value="";
    document.getElementById("invoiceAmount").value="";
    document.getElementById("dueDate").value="";

    await loadInvoices();
    await updateDashboard();

}
function searchInvoices() {

    const keyword = document
        .getElementById("searchInput")
        .value
        .toLowerCase();

    const filtered = invoices.filter(invoice =>

        invoice.customerName.toLowerCase().includes(keyword) ||

        invoice.customerPhone.includes(keyword)

    );

    displayInvoices(filtered);

}
