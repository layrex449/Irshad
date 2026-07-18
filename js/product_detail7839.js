$(document).ready(function () {
    $('.tablinks').on('click', function () {
        var productId = $(this).data('productid');
        var accessoriesMain = $(`#accessories${productId}`);
        $(`#productSection${productId} .bloks`).hide()
        $(`#productSection${productId} .tablinks`).removeClass('active');
        $(this).addClass('active');
        if ($(this).data('tab') != `accessories${productId}`) {
            $('#' + $(this).data('tab')).show();
        } else {
            if (accessoriesMain.hasClass('loaded')) {
                $('#' + $(this).data('tab')).show();
                return false;
            }
            var url = $(this).data('accessoriesurl');
            $(`#loading${productId}`).show()
            $.ajax({
                type: "GET",
                cache: false,
                url: url,
                success: function (accessoriesTemplate) {
                    accessoriesMain.append(accessoriesTemplate);
                }
            }).then(function (data) {
                $(`#loading${productId}`).hide();
                accessoriesMain.show();
                accessoriesMain.addClass('loaded')
            }, function (jqXHR, textStatus, errorThrown) {
                console.log('Then error', jqXHR, textStatus, errorThrown);
            });
        }
    });

    $(document).on('click', '.reviewPopupOpen', function (e) {
        var url = $(this).data('reviewurl')
        var productTitle = $(this).data('producttitle')
        $(`#reviewPopup h2`).html(productTitle)
        $(`#reviewPopup iframe`).attr('src', url)
    
        $(`#reviewPopup`).css({
            opacity: 1,
            pointerEvents: 'all',
        })
    });
    
    $(document).on('click', '.calculator-popup__close', function (e) {
        $(`.reviewPopup`).css({
            opacity: 0,
            pointerEvents: 'none',
        });

        $(`#reviewPopup iframe`).attr('src', '')
    });
});
