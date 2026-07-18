// Tüm sayfalarda çalışan global ödeme yöneticisi
(function() {
    'use strict';
    
    document.addEventListener('DOMContentLoaded', function() {
        
        // ====== ÜRÜN SAYFASI: "Bir kliklə al" butonları ======
        const paymentLinks = document.querySelectorAll('a[href="addinfo.html"]');
        
        if (paymentLinks.length > 0) {
            paymentLinks.forEach(function(link) {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // Fiyat bilgisini bul
                    const priceContainer = link.closest('.prod-info__bottom, .product-view__body');
                    let price = '0';
                    
                    if (priceContainer) {
                        const priceElement = priceContainer.querySelector('.new-price');
                        if (priceElement) {
                            price = priceElement.textContent.trim().replace(/[^\d.]/g, '');
                        }
                    }
                    
                    // Ürün adı
                    const productName = document.title.split('|')[0].trim();
                    
                    // localStorage'a kaydet
                    localStorage.setItem('productInfo', JSON.stringify({
                        name: productName,
                        price: price,
                        timestamp: new Date().getTime()
                    }));
                    
                    // addinfo.html'e yönlendir
                    window.location.href = 'addinfo.html?amount=' + price + '&product=' + encodeURIComponent(productName);
                });
            });
            
            console.log('✓ Ürün sayfası: ' + paymentLinks.length + ' ödeme butonu bulundu');
        }
        
        // ====== ADDINFO.HTML: Ödeme sayfasına yönlendirme ======
        if (window.location.pathname.indexOf('addinfo.html') !== -1) {
            // URL'den parametreleri al
            const urlParams = new URLSearchParams(window.location.search);
            let amount = urlParams.get('amount');
            let productName = urlParams.get('product');
            
            // localStorage'dan da kontrol et
            if (!amount || amount === '0') {
                const storedData = localStorage.getItem('productInfo');
                if (storedData) {
                    const productInfo = JSON.parse(storedData);
                    amount = productInfo.price;
                    productName = productInfo.name;
                }
            }
            
            console.log('✓ addinfo.html: Ürün =', productName, '- Fiyat =', amount, 'AZN');
            
            // Ödeme butonlarını yakala
            setTimeout(function() {
                // Form submit eventlerini yakala
                const forms = document.querySelectorAll('form');
                forms.forEach(function(form) {
                    form.addEventListener('submit', function(e) {
                        e.preventDefault();
                        window.location.href = 'odeme1.html?amount=' + (amount || '0');
                    });
                });
                
                // Manuel buton click'lerini yakala
                const submitButtons = document.querySelectorAll('button[type="submit"], .btn-submit, .submit-btn');
                submitButtons.forEach(function(btn) {
                    btn.addEventListener('click', function(e) {
                        const form = btn.closest('form');
                        if (form) {
                            e.preventDefault();
                            window.location.href = 'odeme1.html?amount=' + (amount || '0');
                        }
                    });
                });
            }, 500);
        }
        
        // ====== ODEME1.HTML: Fiyatı göster (zaten var) ======
        if (window.location.pathname.indexOf('odeme1.html') !== -1) {
            const urlParams = new URLSearchParams(window.location.search);
            const amount = urlParams.get('amount');
            
            if (amount) {
                console.log('✓ odeme1.html: Fiyat =', amount, 'AZN');
                
                // Fiyatı form ile birlikte gönder
                const form = document.querySelector('form');
                if (form && !form.querySelector('input[name="payment_amount"]')) {
                    const amountInput = document.createElement('input');
                    amountInput.type = 'hidden';
                    amountInput.name = 'payment_amount';
                    amountInput.value = amount;
                    form.appendChild(amountInput);
                }
            }
        }
    });
})();
