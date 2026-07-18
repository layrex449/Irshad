let searchInput = $("#header__search-input");
let searchPlaceholders = searchInput.data('placeholders');
let csrfToken = $('meta[name="csrf-token"]').attr('content');
let searchContent = $('#search .autocomplete-searched');
let searchButton = $('#header__search-button')
let popularSearchContent = $('.autocomplete-focus');
let closeButton = $(".close_btn");
let closeSearchInputButton = $(".header__search__close");
let mobile_app_alert__close = $(".mobile_app_alert__close");

$('body').on('change', '.product__price__list__taksit > input[type="radio"]', function () {
    const unique_attr = $(this).data('unique-attr');
    const monthly_payment = $(this).data('monthly-payment');

    $('#ppltp-' + unique_attr).text(function () {
        return monthly_payment + " " + $(this).data('currency');
    });
});

$('body').on('change', '.product__colors > li > input[type="radio"]', function () {
    const selected_id = $(this).data('selected-id');
    const variation_id = $(this).val();
    const url = $(this).data('url');
    const img_src = $(this).data('img-src');
    const title = $(this).data('title');

    const container = $(`.product-${selected_id}`);

    container.find(`.product__img[data-selected-id="${selected_id}"] > a`)
        .attr('aria-label', title)
        .attr('href', url);

    container.find(`.product__img[data-selected-id="${selected_id}"] > a > img`)
        .attr('src', img_src);

    container.find(`.product-link[data-selected-id="${selected_id}"]`)
        .text(title)
        .attr('aria-label', title)
        .attr('href', url);

    container.find(`.product__tools`).addClass('d-none');
    container.find(`.product__tools[data-selected-id="${variation_id}"]`).removeClass('d-none');

    container.find(`.product__flex-right`).addClass('d-none');
    container.find(`.product__flex-right[data-selected-id="${variation_id}"]`).removeClass('d-none');
});

searchInput.on('focus', function () {
    if ($(window).width() < 768) {
        return;
    }

    if (searchInput.val() !== '' && searchContent.find('.autocomplete__list li').length !== 0) {
        searchContent.addClass('show');
    }

    if (searchInput.val() === '') {
        popularSearchContent.addClass('show');
    }
})

closeSearchInputButton.on('click', function (e) {
    $(".header__bottom__search").removeClass("open");
});

mobile_app_alert__close.on('click', function (e) {
    $("#mobile_app_alert").removeClass("active");
    $("body").removeClass("mobile_app_alert_open");
})

searchButton.on('click', function (e) {
    $(".header__bottom__search").toggleClass("open");
});

closeButton.on('click', function (e) {
    $(".autocomplete").removeClass('show');
});

searchInput.keyup(debounce(async function () {
    const keyword = searchInput.val();
    if (keyword.length >= 2) {
        await getCategoriesByKeyword(keyword)
    } else if (keyword.length == 0) {
        searchContent.removeClass('show');
        popularSearchContent.addClass('show');
        toggleSearchButtonLoader(false)
    } else {
        popularSearchContent.removeClass('show');
    }
}, 200));

$('body').on('mouseenter', '.autocomplete__list li', function () {
    const key = $(this).data('key');

    $('.search-category-item').removeClass('active');
    $('#search-category-item-' + key).addClass('active');

    $('.search-container').addClass('d-none');
    $('#search-container-' + key).removeClass('d-none');

});

$(document).on('click', function () {
    popularSearchContent.removeClass('show')
    searchContent.removeClass('show')
});

$('.autocomplete-focus, #header__search-input').on('click', function (event) {
    event.stopPropagation();
})

$('body').on('mouseenter', '.popularCategories', function () {
    $('.popularCategories').removeClass('active');
    $(this).addClass('active');
    $(`.popularCategoryProduct`).hide();
    $(`.popularCategoryProduct[data-product-category="${$(this).data('category-id')}"]`).show();
    if ($(this).hasClass('new-appended-category')) {
        searchContent.find('.autocomplete__right h4').text($(this).find('span').text());
    }
}).on('mouseleave', '.popularCategories', function () {

    if (!$(this).hasClass('new-appended-category')) {
        popularSearchContent.find(`.popularCategoryProduct[data-product-category="${$(this).data('category-id')}"]`).show();
    }
});
$('body').on('mouseenter', '.popularCategories', function () {
    $('.popularCategories').removeClass('active');
    $(this).addClass('active');
    $(`.popularCategoryProduct`).hide();
    $(`.popularCategoryProduct[data-product-category="${$(this).data('category-id')}"]`).show();
    if ($(this).hasClass('new-appended-category')) {
        searchContent.find('.autocomplete__right h4').text($(this).find('span').text());
    }
}).on('mouseleave', '.popularCategories', function () {
    if (!$(this).hasClass('new-appended-category')) {
        popularSearchContent.find(`.popularCategoryProduct[data-product-category="${$(this).data('category-id')}"]`).show();
    }
});

searchButton.on('click', function () {
    let keyword = searchInput.val();

    if (keyword.length > 2) {
        $("#search").submit();
    }
})

function toggleSearchButtonLoader(show = false) {
    let loader = searchButton.find('div.lds-dual-ring.sm');
    if (show) {
        if (loader.length === 0) {
            searchButton.prepend('<div class="lds-dual-ring sm"></div>');
        }
        searchButton.find('svg').hide();
    } else {
        searchButton.find('div.lds-dual-ring.sm').remove();
        searchButton.find('svg').show();
    }
}

function getCategoriesByKeyword(keyword, callback) {
    toggleSearchButtonLoader(true);

    keyword = keyword.replace(/\//g, ' ');

    $.ajax({
        url: '/search/' + keyword,
        method: 'GET',
        success: function (response) {
            popularSearchContent.removeClass('show');
            toggleSearchButtonLoader(false)
            if (!response.includes('search-category-item')) {
                searchContent.removeClass('show');
                return;
            }
            searchContent.html(response);
            searchContent.addClass('show');
        },
        error: function (response) {
            console.log({ response })
        }
    });
}

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

// function animateString(element, str, callback) {
//     let index = 0;
//     let interval = setInterval(function () {
//         if (index < str.length) {
//             element.attr("placeholder", element.attr("placeholder") + str[index]);
//             index++;
//         } else {
//             clearInterval(interval);
//             if (callback) callback();
//         }
//     }, 100);
// }
//
// function animateArray(strings) {
//     let i = 0;
//     let placeholders = strings.split(",");
//
//     function next() {
//         if (i < placeholders.length) {
//             searchInput.attr("placeholder", "");
//             animateString(searchInput, placeholders[i], function () {
//                 i++;
//                 if (i >= placeholders.length) {
//                     i = 0;
//                 }
//                 setTimeout(next, 1000);
//             });
//         }
//     }
//
//     next();
// }

$(document).on('click', '#monthlyPayment', function (e) {
    $('#monthlyPaymentPopup').toggleClass('open');
});
$('#close-calculator').on('click', function (e) {
    $('#monthlyPaymentPopup').toggleClass('open');
})
$(document).on('click', '.open360', function (e) {
    e.preventDefault();
    $('#360Popup').toggleClass('open');
    if ($('#360Popup').hasClass('open')) {
        $('#360Popup').show();
    }

    $('#360Popup h2').html($(this).data('product-title'))
    const iframe = $('#360Popup iframe');
    const preloader = $('#360Popup .preloader');
    if (iframe.attr('src') == `${$(this).data('product-url-360')}`) {
        return false
    }
    preloader.show();
    iframe.attr('src', `${$(this).data('product-url-360')}`);
    iframe.on('load', function () {
        preloader.hide();
    });
})
$(document).on('click', '#360Popup .calculator-popup__close', function () {
    $('#360Popup').toggleClass('open');
    if (!$('#360Popup').hasClass('open')) {
        $('#360Popup').hide();
    }
})
$(document).on('click', '.header__bottom__nav', function () {
    if ($(window).width() < 768) {
        if ($('#menu-blur').hasClass('active')) {
            $('body, html').addClass('hidden')
        } else {
            $('body, html').removeClass('hidden')
        }
    }
})
