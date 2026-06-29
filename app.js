import { db, auth } from "./firebase.js";
import {
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
const saveBtn = document.getElementById("saveBtn");
const updateBtn = document.getElementById("updateBtn");
const welcomeUser = document.getElementById("welcomeUser");
const logoutBtn = document.getElementById("logoutBtn");
let currentInvoiceId = null;
let invoices = [];
saveBtn.addEventListener("click", saveInvoice);
document
    .getElementById("searchInput")
    .addEventListener("keyup", searchInvoices);
updateBtn.addEventListener("click", updateInvoice);

// Load invoices when page opens
window.addEventListener("userReady", async () => {

    welcomeUser.textContent =
        `Welcome back, ${auth.currentUser.email}`;

    await loadInvoices();

    await updateDashboard();

});
async function loadInvoices() {

    if (!auth.currentUser) {
        console.log("User not logged in yet.");
        return;
    }

    const table = document.getElementById("invoiceTable");


    try {

        const q = query(
            collection(db, "invoices"),
            where("uid", "==", auth.currentUser.uid),
            orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(q);
        invoices = [];

        querySnapshot.forEach((doc) => {

            invoices.push({
                id: doc.id,
                ...doc.data()
            });

        });

        console.log("Loaded invoices:", invoices);

        displayInvoices(invoices);

        await updateDashboard();

    } catch (error) {

        console.error("Load error:", error);

        table.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;">
                    Error loading invoices
                </td>
            </tr>
        `;
    }
}
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
        const invoiceNumber = "INV-" + Date.now();

await addDoc(collection(db, "invoices"), {

    invoiceNumber,
    uid: auth.currentUser.uid,
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
function isOverdue(invoice) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(invoice.dueDate);

    return invoice.status === "Pending" && due < today;
}
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
        <tr style="${isOverdue(invoice) ? 'background-color:#ffe5e5;' : ''}">
    <td>${invoice.invoiceNumber || invoice.id.substring(0,6)}</td>
    
    <td>${invoice.customerName}</td>
            <td>${invoice.customerPhone}</td>

            <td>KES ${invoice.amount}</td>

            <td>${invoice.dueDate}</td>

            <td>
                ${
                    invoice.status === "Paid"
? "<span class='status-paid'>🟢 Paid</span>"
: isOverdue(invoice)
    ? "<span class='status-overdue'>🔴 Overdue</span>"
    : "<span class='status-pending'>🟡 Pending</span>"
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
                    <button class="btn-whatsapp" onclick="sendWhatsApp('${invoice.id}')">
                    📱 WhatsApp
                     </button>
                     <button class="btn-pdf" onclick="downloadPDF('${invoice.id}')">
                     📄 PDF
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
    let overdue = 0;
    snapshot.forEach((doc) => {

        const invoice = doc.data();

        total++;

        if (invoice.status === "Pending") {
            pending++;
        }
        if (isOverdue(invoice)) {
    overdue++;
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
        document.getElementById("overdueInvoices").textContent = overdue;

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
async function sendWhatsApp(id) {

    const docSnap = await getDoc(doc(db, "invoices", id));

    if (!docSnap.exists()) return;

    const invoice = docSnap.data();
    const invoiceNumber = id.substring(0, 6).toUpperCase();
    const message =
`Hello ${invoice.customerName},

This is a friendly reminder from PataCash.

Your invoice of KES ${invoice.amount} is due on ${invoice.dueDate}.

Kindly make your payment.

Thank you!`;

    const phone = invoice.customerPhone.replace("+", "");

    const url =
`https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");
}
window.sendWhatsApp = sendWhatsApp;
async function downloadPDF(id) {

    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF();

    const docSnap = await getDoc(doc(db, "invoices", id));

    if (!docSnap.exists()) return;

    const invoice = docSnap.data();

    const invoiceNumber = invoice.invoiceNumber;

    // Title
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(22);
    pdf.text("PATACASH", 20, 20);

    pdf.setFontSize(15);
    pdf.text("INVOICE", 20, 30);

    // Divider
    pdf.line(20, 35, 190, 35);

    // Customer Details
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(12);

    pdf.text(`Invoice No: ${invoiceNumber}`, 20, 50);
    pdf.text(`Customer: ${invoice.customerName}`, 20, 60);
    pdf.text(`Phone: ${invoice.customerPhone}`, 20, 70);

    pdf.text(`Amount: KES ${invoice.amount}`, 20, 90);
    pdf.text(`Due Date: ${invoice.dueDate}`, 20, 100);
    pdf.text(`Status: ${invoice.status}`, 20, 110);

    // Divider
    pdf.line(20, 120, 190, 120);

    pdf.setFont("helvetica", "bold");
    pdf.text("PAYMENT DETAILS", 20, 135);

    pdf.setFont("helvetica", "normal");

    pdf.text("M-PESA", 20, 145);
    pdf.text("Paybill: 123456", 20, 155);
    pdf.text(`Account: ${invoiceNumber}`, 20, 165);

    pdf.line(20, 175, 190, 175);

    pdf.setFont("helvetica", "italic");
    pdf.text("Thank you for choosing PataCash.", 20, 190);

    pdf.save(`Invoice-${invoiceNumber}.pdf`);
}
window.downloadPDF = downloadPDF;
logoutBtn.addEventListener("click", async () => {

    await signOut(auth);

    window.location.href = "login.html";

});