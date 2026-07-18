const elements = document.querySelectorAll('a[data-method]');

elements.forEach((e) => {
    e.addEventListener('click',(elem) => {
        let method = e.getAttribute('data-method').toLocaleLowerCase();
        let confirmText = e.getAttribute('data-confirm');

        method = method?method:'get';

        if(confirmText && !confirm(confirmText)){
            elem.preventDefault();
            return false;
        }

        let form = document.createElement('form');

        form.method = method == 'get'?'get':'POST';
        form.action = e.getAttribute('href');
        form.style.display = 'none';

        let csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = '_token';
        csrfInput.value = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

        form.appendChild(csrfInput);

        if(method != 'get' && method != 'post'){
            let methodInput = document.createElement('input');
            methodInput.type = 'hidden';
            methodInput.name = '_method';
            methodInput.value = method.toLocaleUpperCase();
            form.appendChild(methodInput);
        }

        document.querySelector('body').append(form);

        form.submit();

        elem.preventDefault();
        return false;
    })
})