// Ürün ödeme bilgilerini localStorage'a kaydetmek için script

document.addEventListener('DOMContentLoaded', function() {
    // "Bir kliklə al" butonlarını bul
    const paymentButtons = document.querySelectorAll('a[href="addinfo.html"]');
    
    paymentButtons.forEach(function(button) {
        button.addEventListener('click', function(e) {
            // Butona en yakın ürün bilgilerini bul
            const productContainer = button.closest('.prod-info__bottom, .product-view__body');
            
            if (productContainer) {
                // Fiyat bilgisini al
                const priceElement = productContainer.querySelector('.new-price');
                const price = priceElement ? priceElement.textContent.trim() : '0';
                
                // Ürün adını sayfanın title'ından al
                const productName = document.title.split('|')[0].trim();
                
                // Ürün bilgilerini localStorage'a kaydet
                const productData = {
                    name: productName,
                    price: price,
                    timestamp: new Date().getTime()
                };
                
                localStorage.setItem('selectedProduct', JSON.stringify(productData));
                console.log('Ürün bilgileri kaydedildi:', productData);
            }
        });
    });
});
