export class BankAccount {
    constructor(name, money) {
        this.name = name;
        this.money = money;
    }

    deposit(amount, callback){
        setTimeout(() =>{
            if (amount >= 5000) {
                this.money += amount;
                alert(`Deposit Saldo Berhasil, Saldo Saat Ini: ${this.money}`);
                alert(`Deposit Berhasil Setelah 2 Detik!!!`);
                callback();
            } else {
                alert("Minimal jumlah Deposit adalah Rp. 5.000");
                alert(`Deposit Gagal Setelah 2 Detik!!!`);
                callback();
            }
        }, 2000)
    }

    withdraw(amount, callback){
        setTimeout(() => {
            if (amount < 5000) {
                alert("Minimal jumlah Penarikan adalah Rp. 5.000");
                alert(`Penarikan Gagal Setelah 2 Detik!!!`);
                callback();
            } else if (amount > this.money){
                alert("Saldo Rekening Anda Tidak Mencukupi!");
                alert(`Penarikan Gagal Setelah 2 Detik!!!`);
                callback();
            } else {
                this.money -= amount;
                alert(`Penarikan Saldo Berhasil, Sisa Saldo Saat Ini: ${this.money}`);
                alert(`Penarikan Berhasil Setelah 2 Detik!!!`);
                callback();
            }
        }, 2000)
    }

    updateDisplayMoney(element){
        element.innerText = this.money;
    }

    updateDisplayName(element){
        element.innerText = this.name;
    }
}
