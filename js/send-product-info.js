// Ürün bilgilerini ödeme sayfasına gönder
document.addEventListener('DOMContentLoaded', function() {
    // Tüm "Bir kliklə al" linklerini bul
    const paymentLinks = document.querySelectorAll('a[href="addinfo.html"]');
    
    paymentLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // En yakın fiyat bilgisini bul
            const priceContainer = link.closest('.prod-info__bottom, .product-view__body, .price-info');
            let price = '0';
            let productName = document.title.split('|')[0].trim();
            
            if (priceContainer) {
                const priceElement = priceContainer.querySelector('.new-price, .price-info__price span');
                if (priceElement) {
                    price = priceElement.textContent.trim().replace(/[^\d.]/g, '');
                }
            }
            
            // localStorage'a kaydet (yedek olarak)
            localStorage.setItem('productInfo', JSON.stringify({
                name: productName,
                price: price
            }));
            
            // addinfo.html'e yönlendir (fiyatı URL'de gönder)
            window.location.href = 'addinfo.html?amount=' + price + '&product=' + encodeURIComponent(productName);
        });
    });
});
