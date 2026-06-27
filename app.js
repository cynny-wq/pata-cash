import { db } from "./firebase.js";
loadInvoices();
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const saveBtn = document.getElementById("saveBtn");

saveBtn.addEventListener("click", saveInvoice);

async function saveInvoice() {

    const customerName = document.getElementById("customerName").value.trim();

    const customerPhone = document.getElementById("customerPhone").value.trim();

    const amount = document.getElementById("invoiceAmount").value;

    const dueDate = document.getElementById("dueDate").value;

    if (
        !customerName ||
        !customerPhone ||
        !amount ||
        !dueDate
    ) {
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
        await loadInvoices();

        document.getElementById("customerName").value = "";

        document.getElementById("customerPhone").value = "";

        document.getElementById("invoiceAmount").value = "";

        document.getElementById("dueDate").value = "";

    } catch (error) {

        console.error(error);

        alert("Error saving invoice.");

    }
    async function loadInvoices() {

    const table = document.getElementById("invoiceTable");

    table.innerHTML = "";

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
                <td>${invoice.status}</td>
                <td>
                    <button disabled>Edit</button>
                </td>
            </tr>
        `;

    });

}

}
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";