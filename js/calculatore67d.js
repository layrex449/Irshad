class Calculator
{
    static init(product) {
        if(product.monthly_payments?.length < 1 ) {
            return;
        }

        const count = parseInt($(`input.basket-counter[data-code="${product.code}"]`).val()) || 1;
        
        const min_total_price = product.monthly_payments?.reduce((prev, curr) => {
            const prevPrice = parseFloat(prev.price);
            const currPrice = parseFloat(curr.price);
            return prevPrice < currPrice ? prevPrice : currPrice
        }) * count;

        $('body').on('change', `.product__price__list__taksit > input[type="radio"][data-unique-attr="${product.unique_attr}"]`, function() {
            Calculator.update(product);
        });

        $('body').on('input', `#initial-price-${product.unique_attr}`, function() {
            this.value = this.value.replace(/[^0-9.]/g, '');

            if ((this.value.match(/\./g) || []).length > 1) {
                this.value = this.value.slice(0, -1);
            }

            // Restrict to 2 decimal places
            const parts = this.value.split('.');
            if (parts[1] && parts[1].length > 2) {
                this.value = parts[0] + '.' + parts[1].slice(0, 2);
            }

            this.value = this.value > min_total_price ? min_total_price : this.value;

            Calculator.update(product);
        });

        $('body').on('change', `#warranty-${product.unique_attr}`, function() {
            Calculator.update(product);
        });

        $(`input.basket-counter[data-code="${product.code}"]`).on('change', function() {
            Calculator.update(product);
        });

        Calculator.update(product);
    }

    static update(product) {
        const unique_attr = product.unique_attr;

        const mp_id = $(`.product__price__list__taksit > input[type="radio"][data-unique-attr="${unique_attr}"]:checked`).val();

        const warranty_id = $(`#warranty-${unique_attr}`).val();

        const initial_price = parseFloat($(`#initial-price-${unique_attr}`).val()) || 0;

        const count = parseInt($(`input.basket-counter[data-code="${product.code}"]`).val()) || 1;

        const warranty_percent = parseFloat(product.warranties.find(w => w.id == warranty_id)?.percent || 0)

        const mp = product.monthly_payments.find(mp => mp.id == mp_id);

        const {min_monthly_payments, monthly_payment} = Calculator.calculate(product, mp.month, initial_price, warranty_percent, count);

        $(`#ppltp-${product.unique_attr}`).text(function() {
            return monthly_payment.formatted_monthly_payment + " " + $(this).data('currency');
        });

        $(`#final-price-${product.unique_attr}`).text(monthly_payment.total_price);

        // Update commission label and class
        const $commissionLabel = $(`#commission_percent_label-${product.unique_attr}`);
        const $commissionIncluded = $(`#commission-included-${product.unique_attr}`);
        $commissionLabel.removeClass('text-success text-danger');
        $commissionLabel.addClass(`text-${mp.commission_class}`);
        $commissionLabel.text(mp.commission_percent_label);

        $(`.ppl-${unique_attr} ppl-input`).addClass('d-none');
        $(`.ppl-${unique_attr} .ppl-label`).addClass('d-none');
        $commissionIncluded.addClass('d-none');

        for(let i in min_monthly_payments) {
            const mmp = min_monthly_payments[i];

            $(`#taksit_${mmp.target}`).removeClass('d-none');
            $(`#taksit_label_${mmp.target}`).removeClass('d-none');

            if(mmp.month == mp.month) {
                $(`#taksit_${mmp.target}`).attr('checked', 'checked');

                if(mmp.commission_percent > 0) {
                    $commissionIncluded.removeClass('d-none');
                }
            }            
        }  
    }

    static calculate(product, month, initial_price = 0, warranty_percent = 0, count = 1) {
        initial_price = parseFloat(initial_price);

        const { monthly_payments } = product;

        const min_initial_price = monthly_payments.reduce((prev, curr) => {
            return Math.min(prev.initial_price_value, curr.initial_price_value);
        }) * count;

        if(min_initial_price > 0 && min_initial_price > initial_price) {
            $(`#initial-price-${product.unique_attr}`).val(min_initial_price);

            initial_price = min_initial_price;
        }

        const min_monthly_payments = monthly_payments.filter(mp => mp.initial_price_value <= initial_price)
            .reduce((acc, mp) => {
                if (!acc[mp.month]) {
                    acc[mp.month] = {};
                }

                const price = parseFloat(mp.price) * count;

                const percent = parseFloat(mp.percent);
                const percent_increment = (price - initial_price) * percent / 100;

                const commission_percent = parseFloat(mp.commission_percent || 0);
                // const commission_increment = (price - initial_price) * commission_percent / 100;
                const commission_increment = price * commission_percent / 100;

                const warranty_price = price * warranty_percent / 100;

                const total_price = price + percent_increment + commission_increment + warranty_price;
                const total_monthly_payment = this.round(total_price - initial_price);

                mp.total_price = total_price.toFixed(2);

                mp.monthly_payment = this.round(total_monthly_payment / mp.month);

                mp.formatted_monthly_payment = mp.monthly_payment.toFixed(2);

                acc[mp.month] = (acc[mp.month]?.monthly_payment || Number.MAX_VALUE) < mp.monthly_payment ? acc[mp.month] : mp;

                return acc;
            }, {});

        const monthly_payment = min_monthly_payments[month];

        return {
            min_monthly_payments,
            monthly_payment,
        }
    }

    static round(num) {
        return Math.round((num + Number.EPSILON) * 100) / 100;
    }
}

