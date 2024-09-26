import { BankAccount } from "./bank_account.js";

let account = new BankAccount("Aldy Ramadhan Syahputra", 1000);

function useDeposit() {
    let total = window.prompt("Jumlah Saldo yang Mau Ditambah: ");

    if (total === null){
        return;
    }

    if (isNaN(total)) {
        alert("Input Tidak Valid, Harap Coba Lagi!");
        return;
    }

    total = parseFloat(total);

    account.deposit(total, ()=>{
        account.updateDisplayMoney(document.getElementById("displaySaldo"));
    });
}

function useWithdraw() {
    let total = window.prompt("Jumlah Saldo yang Mau Ditambah: ");
    
    if (total === null){
        return;
    }
    
    if (isNaN(total)) {
        alert("Input Tidak Valid, Harap Coba Lagi!");
        return;
    }
    
    total = parseFloat(total);
    
    account.withdraw(total, () =>{
        account.updateDisplayMoney(document.getElementById("displaySaldo"));
    });
}

account.updateDisplayMoney(document.getElementById("displaySaldo"));
account.updateDisplayName(document.getElementById("displayNama"));

//Penggunaan object window agar fungsi dapat dipanggil saat button diklik
window.useDeposit = useDeposit;
window.useWithdraw = useWithdraw;

