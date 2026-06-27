import { db } from "./firebase.js";

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

        document.getElementById("customerName").value = "";

        document.getElementById("customerPhone").value = "";

        document.getElementById("invoiceAmount").value = "";

        document.getElementById("dueDate").value = "";

    } catch (error) {

        console.error(error);

        alert("Error saving invoice.");

    }

}