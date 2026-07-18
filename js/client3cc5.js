/**
         * Initializes a Flickity carousel on the specified element with given options.
         *
         * @param {HTMLElement} carouselElement - The DOM element to initialize as a Flickity carousel.
         * @param {Object} options - Configuration options for the Flickity instance.
         * @returns {Flickity} - The initialized Flickity instance.
         */
function initializeCarousel(carouselElement, options, container) {
    let flkty = new Flickity(carouselElement, options);
    $(container).attr('data-is-flickity','true');
    let sliderContainer = carouselElement.closest(container);
    sliderContainer.querySelector(".button--previous").addEventListener("click", function() {
        flkty.previous();
    });
    sliderContainer.querySelector(".button--next").addEventListener("click", function() {
        flkty.next();
    });

    flkty.on("dragStart", () => flkty.slider.style.pointerEvents = "none");
    flkty.on("dragEnd", () => flkty.slider.style.pointerEvents = "auto");

    return flkty;
}
function loadClientDataFrom(url) {
    $.ajax({
        url: url,
        success: (data) => {
            if (typeof data === 'object') {
                const basket_count = data.in_basket?.length || 0;
                const favorite_count = data.in_favorite?.length || 0;
                const comparison_count = data.in_comparison?.length || 0;
                const client_name = data.client_name ? data.client_name : null;
                const last_searched_keywords_view = data.last_searched_keywords_view ? data.last_searched_keywords_view : null;
                const searched_products_view = data.searched_products_view ? data.searched_products_view : null;
                const searched_products_category_view = data.searched_products_category_view ? data.searched_products_category_view : null;
                const searched_products_count = data.searched_products_count ? data.searched_products_count : null;
                const cabinetUrl = data.cabinet_url;
                if (basket_count > 0) {
                    $('#basket-count').text(basket_count).removeClass('d-none');
                }
                if (favorite_count > 0) {
                    $('#favorite-count, #favorite-count-mobile').text(favorite_count).removeClass('d-none');
                }
                if (comparison_count > 0) {
                    $('#compared-item-count, #compared-item-count-mobile').text(comparison_count).removeClass('d-none');
                }

                $(".basket_button").filter((i, e) => data.in_basket.includes($(e).data('code')?.toString()))
                    .addClass('btn-orange')
                    .removeClass('btn-green')
                    .each(function () {
                        var $button = $(this);
                        if ($button.data('is-mini') !== 1) {
                            $button.text(function () {
                                return $button.data('go-to-basket');
                            });
                        }
                    });

                $(".to-wishlist").filter((i, e) => data.in_favorite.includes($(e).data('product-code')?.toString()))
                    .addClass('active');

                $(".to-compare").filter((i, e) => data.in_comparison.includes($(e).data('product-code')?.toString()))
                    .addClass('active');

                if (client_name) {
                    $('.cabinet__name').text(client_name)
                }

                if(cabinetUrl)
                {
                    $('.cabinet__name').closest("a").attr('href', cabinetUrl);
                }

                if (last_searched_keywords_view) {
                    $('#lastSearch').append(last_searched_keywords_view);
                }

                if (searched_products_view) {
                    $('#searchProductList').append(searched_products_view);
                }

                if(searched_products_category_view){
                    $("#searchedProducts").append(searched_products_category_view);
                    //
                    var carouselElement = document.getElementById('carousel-category_bottom_products');
                    if(carouselElement){
                        var options = {
                            cellAlign: 'left',
                            draggable: searched_products_count > 4,
                            contain: searched_products_count > 4,
                            pageDots: false,
                            wrapAround: true,
                            prevNextButtons: false,
                            autoPlay: searched_products_count > 4,
                            pauseAutoPlayOnHover: true
                        };

                        initializeCarousel(carouselElement, options,'.products-slider');
                    }
                }

            }
        }
    })
}
// Add/Remove Product To/Remove Basket
$(document).ready(function () {
    $(document).on('click', '.basket_button', function (e) {
        e.preventDefault();
        if ($(this).hasClass('btn-gray')) {
            return false;
        }

        if ($(this).hasClass('btn-orange')) {
            window.location.href = $(this).attr('data-basket-url');
            return false;
        }

        const isLoading = parseInt($(this).attr('data-loading'));

        if (isLoading) {
            return false;
        }

        const code = $(this).data('code');
        const icon = $(this).find('svg');
        const loader = $(this).find('.lds-dual-ring');
        const addToBasketUrl = $(this).data('add-to-basket-url');

        $(this).data('loading', 1);

        icon.addClass('d-none');
        loader.removeClass('d-none');
        
        $.ajax({
            url: addToBasketUrl,
            method: "POST",
            data: {
                product_code: code,
                count: 1,
            },
            xhrFields: {
                withCredentials: true
            },
            success: (data) => {            
                emitDataLayerEvent([data?.product], 'add_to_cart')
                if ($(this).data('is-mini') == 1) {
                    $(`[data-code="${$(this).data('code')}"]`).removeClass('btn-green')
                        .addClass('btn-orange');
                } else {
                    $(this).removeClass('btn-green')
                        .addClass('btn-orange')
                        .html($(this).data('go-to-basket'));
                }

                loadModal($(this).attr('href'));

                if (data?.count) {
                    $("#basket-count").html(data.count).removeClass('d-none');
                }
            },
            complete: function () {
                icon.removeClass('d-none');
                loader.addClass('d-none');
                $(this).data('loading', 0);
            },
        });
    });
    // Product Wishlist
    $(document).on('click', '.to-wishlist', function () {
        const product_code = $(this).data('product-code');
        const is_loading = parseInt($(this).attr('data-loading'));
        const loader = $(this).find('.lds-dual-ring');
        const icon = $(this).find('svg');

        if (is_loading) {
            return
        }

        $(this).attr('data-loading', 1);
        icon.addClass('d-none');
        loader.removeClass('d-none');

        if (!$(this).hasClass('active')) {
            $.ajax({
                type: "POST",
                url: $(this).data('add-url'),
                data: {product_code},
                success: (response) => {
                    $('#favorites .header__tools__count, #favorites-mobile .header__tools__count').text(response.count).removeClass('d-none');
                    $(this).addClass('active');
                },
                complete: () => {
                    $(this).attr('data-loading', 0);
                    loader.addClass('d-none');
                    icon.removeClass('d-none');
                }
            })
        } else {
            $.ajax({
                url: $(this).data('remove-url'),
                type: "DELETE",
                success: (response) => {
                    $(this).removeClass('active');
                    $('#favorites .header__tools__count, #favorites-mobile .header__tools__count').text(response.count);

                    if (response.count == 0) {
                        $('#favorites .header__tools__count, #favorites-mobile .header__tools__count').addClass('d-none')
                    }
                },
                complete: () => {
                    $(this).attr('data-loading', 0);
                    loader.addClass('d-none');
                    icon.removeClass('d-none');
                }
            })
        }
        $(this).toggleClass('active')
    });
    // Product Compare
    $(document).on('click', '.to-compare', function () {
        const product_code = $(this).data('product-code');
        const is_loading = parseInt($(this).attr('data-loading'));
        const loader = $(this).find('.lds-dual-ring');
        const icon = $(this).find('svg');

        if (is_loading) {
            return
        }

        $(this).attr('data-loading', 1);
        icon.addClass('d-none');
        loader.removeClass('d-none');

        if (!$(this).hasClass('active')) {
            $.ajax({
                url: $(this).data('add-url'),
                method: 'POST',
                data: {
                    product_code
                },
                success: (response) => {
                    $("#compared-item-count, #compared-item-count-mobile").text(response.count).removeClass('d-none');
                    $(this).addClass('active');
                },
                error: function (response) {
                    console.log({response})
                },
                complete: () => {
                    $(this).attr('data-loading', 0);
                    loader.addClass('d-none');
                    icon.removeClass('d-none');
                }
            });
        } else {
            removeFromCompareList($(this), loader, icon)
        }
    });
    $('.compare__delete').on('click', function () {
        removeFromCompareList($(this))
        window.location.reload()
    })

    function removeFromCompareList(element, loader = null, icon = null) {
        $.ajax({
            url: element.data('remove-url'),
            method: 'delete',
            success: (response) => {
                element.removeClass('active');
                $("#compared-item-count, #compared-item-count-mobile").text(response.count);

                if (response.count == 0) {
                    $("#compared-item-count, #compared-item-count-mobile").addClass('d-none');
                }
            },
            error: function (response) {
                console.log({response})
            },
            complete: () => {
                element.attr('data-loading', 0);
                if (loader != null)
                    loader.addClass('d-none');
                if (icon != null)
                    icon.removeClass('d-none');
            }
        });
    }

    // Compare filter
    $('.category-selector').on('change', function () {
        window.location = $(this).val();
    })

    // Product Feedback
    $(document).on('click', '.comment-count', function (e) {
        let productId = $(this).data('product');
        if ($(this).hasClass('closeRateForm')) {
            return false;
        }
        $('.ratingForm').removeClass('open');
        $(`#write-comment__popup${productId}`).addClass('open')
    })
    $(document).on('click', '.closeRateForm', function (e) {
        e.stopPropagation();
        let productId = $(this).data('product');
        $(`#write-comment__popup${productId}`).removeClass('open')
    })
    $(document).on('click', '.star', function (e) {
        var selectedStar = parseInt($(this).data('value'));
        var stars = $(this).parent().children('li.star');
        var productId = $(this).parent().data('product')
        $(`#write-comment__popup${productId} .write-comment__rating p span:first-child`).html(selectedStar)
        $(`#write-comment__popup${productId} .stars .star`).removeClass('on');
        for (i = 0; i < selectedStar; i++) {
            $(stars[i]).addClass('on')
        }
        $(`#write-comment__popup${productId} .rateInput`).attr('checked', false)
        $(`#write-comment__popup${productId} .rateInput[value="${selectedStar}"]`).attr('checked', true)
    })

    $(document).on('click', '.send', function (e) {
        e.preventDefault()
        var productId = $(this).data('product');
        var isUser = $('input[name="user"]').val();
        var feedbackUrl = $(this).data('feedback-url');
        let description = $(`#write-comment__popup${productId} textarea[name="description"]`);
        let fullName = $(`#write-comment__popup${productId} input[name="full_name"]`);
        let rate = $(`#write-comment__popup${productId} .rateInput`);
        let form = $(`#write-comment__popup${productId}`);

        const validateField = (field, condition) => {
            field.toggleClass('is-invalid', condition);
        };
        validateField(fullName, !isUser && !fullName.val());
        validateField(description, !description.val());
        validateField($(`#write-comment__popup${productId} .rateError`), !rate.is(':checked'));

        if ((!isUser && !fullName.val()) || !rate.is(':checked') || !description.val()) {
            return false;
        }
        let data = form.serializeArray()
        data.push({name: 'product_id', value: productId})
        $.ajax({
            type: "POST",
            cache: false,
            url: feedbackUrl,
            data: data,
            success: function (response) {
                if (response == 1) {
                    form.removeClass('open')
                    $(`#successFeedback${productId}`).css({display: 'block', opacity: 1})
                    form[0].reset();
                    rate.attr('checked', false)
                    $(`#write-comment__popup${productId} .stars .star`).removeClass('on');
                    $(`#write-comment__popup${productId} .write-comment__rating p span:first-child`).html(0)
                }
            }
        })
    })
    $(document).on('click', function () {
        $('.errorMessage').css({display: 'none', opacity: 0})
    });
    $(document).on('click', '.notify-open-button', function (e) {
        let buttonIdArray = e.currentTarget.id.split("_");
        buttonIdArray.shift();
        let buttonId = buttonIdArray.join("_");

        let notifyForm = $(`#notifyForm_${buttonId}`);

        if (notifyForm[0].reportValidity()) {
            $(this).find('.lds-dual-ring').show();
            $(this).find('svg').hide();
            submitFormViaAjax(notifyForm);
            return;
        }

        notifyForm.toggleClass('open');
    });
    $(document).on('click', '.notify-close-button', function (e) {
        e.preventDefault();
        let buttonIdArray = e.currentTarget.id.split("_");
        buttonIdArray.shift();
        let buttonId = buttonIdArray.join("_");
        let notifyForm = $(`#notifyForm_${buttonId}`);
        notifyForm.removeClass('open');
    });

    $("#close-popup").on('click', function(e){
        $(e.currentTarget).parents('.notify-popup').removeClass('open')
    });

    $(document).on('click', '.notify-send-button', function (e) {
        e.preventDefault();
        let formId = $(this).attr('form');
        let notifyForm = $(`#${formId}`);
        submitFormViaAjax(notifyForm);
    });

    function submitFormViaAjax(form) {
        let formData = new FormData(form[0]);

        $.ajax({
            url: form.attr('action'),
            method: form.attr('method'),
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                let formIdArray = form[0].id.split("_");
                formIdArray.shift();
                let buttonId = formIdArray.join("_");

                let notifyButon = $(`#notifyButton_${buttonId}`);

                notifyButon.find('.lds-dual-ring').hide();
                notifyButon.find('svg').show();
                form.removeClass('open');
                form.trigger('reset');
                $(".invalid-feedback").html('');
                $('.notify-popup').addClass('open');
            },
            error: function (xhr, status, error) {
                if(xhr.status == 422)
                {
                    const response = JSON.parse(xhr.responseText);
                    Object.entries(response.errors).map(item => {
                        const key = item[0];
                        $(form).find(`[id*="${key}"]`).parent().find('.invalid-feedback').html(`<h5 class="text-danger">${item[1]}</h5>`);
                    });
                    form.find('.lds-dual-ring').hide();
                    form.find('svg').show();
                }
            }
        })
    }
    if (localStorage.getItem('mobileAppAlertClosed') === 'true') {
        $('#mobile_app_alert').removeClass('active');
        $('body').removeClass('mobile_app_alert_open');
    }

    $('.mobile_app_alert__close').on('click', function () {
        localStorage.setItem('mobileAppAlertClosed', 'true');
    });
});

function emitDataLayerEvent(products, event, additional) {
    // window.dataLayer = window.dataLayer || [];
    // window.dataLayer.push({'ecommerce': null});
     const ecommerce = {
        value: products.reduce((sum, p) =>
            sum + Number(p.basket_count ? p.actualPrice * p.basket_count : p.actualPrice || 0),
        0),
        currency: 'AZN',        
        items: products.map((product) => {
            const item = {
                item_name: product.main_trans?.title,
                item_id: Number(product.id),
                price: Number(product.actualPrice),
                quantity: calculateQuantity(event, product),
                currency: 'AZN',
                item_brand: product.brand?.main_trans?.title,
                item_variant: product.color ?? '',
                item_list_name: '',
                id: Number(product.id),
                google_business_vertical: 'retail'
            };

            if (Array.isArray(product.categoryList)) {
                product.categoryList.forEach((cat, index) => {
                    if (index < 5) {
                        const key = index === 0 ? 'item_category' : `item_category${index + 1}`;
                        item[key] = cat;
                    }
                });
            }

            return item;
        }),
        ...(additional ?? {})
    };    

    window.dataLayer.push({
        event,
        ecommerce
    });
}

function calculateQuantity(event, product)
{
    if(event == "begin_checkout"){
        return product?.basket_count;
    }
    return 1;
}
