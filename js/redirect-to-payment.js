// addinfo.html sayfasında çalışacak - ödeme sayfasına yönlendirir
document.addEventListener('DOMContentLoaded', function() {
    // URL'den parametreleri al
    const urlParams = new URLSearchParams(window.location.search);
    let amount = urlParams.get('amount');
    let productName = urlParams.get('product');
    
    // Eğer URL'de yoksa localStorage'dan al
    if (!amount || amount === '0' || amount === 'null') {
        const storedData = localStorage.getItem('productInfo');
        if (storedData) {
            const productInfo = JSON.parse(storedData);
            amount = productInfo.price;
            productName = productInfo.name;
        }
    }
    
    // Ödeme butonuna tıklandığında odeme1.html'e yönlendir
    // Sayfa içindeki form submit veya buton tıklama eventini yakala
    const forms = document.querySelectorAll('form');
    forms.forEach(function(form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // odeme1.html'e fiyat parametresi ile yönlendir
            window.location.href = 'odeme1.html?amount=' + (amount || '0');
        });
    });
    
    // Eğer direkt buton varsa
    const paymentButtons = document.querySelectorAll('button[type="submit"], .payment-btn, .pay-btn');
    paymentButtons.forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'odeme1.html?amount=' + (amount || '0');
        });
    });
    
    console.log('Ürün bilgileri:', { productName, amount });
});
