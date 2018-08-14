$(document).ready(() => {
    const requestUrl = window.location.origin;
    // categories
    // eslint-disable-next-line no-unused-vars
    window.deleteCategory = function (id) {
        fetch(`${requestUrl}/categories/${id}`,
            { method: 'delete' })
            .then((response) => {
                if (response.status === 200) {
                    return $(`#${id}`).remove();
                }
                alert('error !');
            })
            .catch(() => alert('error !'));
    };

    $('.change-user-role').on('change', function () {
        const conceptName = $(this).find(':selected').text().toLowerCase();

        $.post(`${requestUrl}/users/${this.id}`, { role: conceptName })
            .done(function( data ) {
                if (!data) alert('error !');
            });
    });

    $('#product-review-modal').on('show.bs.modal', () => {
        const formData = $('form').serializeArray();
        console.log(formData);
    })
});

function getFileParam() {
    try {
        var file = document.getElementById('image').files[0];

        if (file) {
            let fileSize = 0;

            if (file.size > 1024 * 1024) {
                fileSize = `${(Math.round(file.size * 100 / (1024 * 1024)) / 100).toString()}MB`;
            } else {
                fileSize = `${(Math.round(file.size * 100 / 1024) / 100).toString()}KB`;
            }

            // document.getElementById('file-name1').innerHTML = 'Имя: ' + file.name;
            // document.getElementById('file-size1').innerHTML = 'Размер: ' + fileSize;

            if (/\.(jpe?g|bmp|gif|png)$/i.test(file.name)) {
                const elPreview = document.getElementById('preview1');
                elPreview.innerHTML = '';
                const newImg = document.createElement('img');
                newImg.className = 'preview-img';

                if (typeof file.getAsDataURL === 'function') {
                    if (file.getAsDataURL().substr(0, 11) == 'data:image/') {
                        newImg.onload = function () {
                            // document.getElementById('file-name1').innerHTML+=' ('+newImg.naturalWidth+'x'+newImg.naturalHeight+' px)';
                        };
                        newImg.setAttribute('src', file.getAsDataURL());
                        elPreview.appendChild(newImg);
                    }
                } else {
                    const reader = new FileReader();
                    reader.onloadend = function (evt) {
                        if (evt.target.readyState == FileReader.DONE) {
                            newImg.onload = function () {
                                // document.getElementById('file-name1').innerHTML+=' ('+newImg.naturalWidth+'x'+newImg.naturalHeight+' px)';
                            };

                            newImg.setAttribute('src', evt.target.result);
                            elPreview.appendChild(newImg);
                        }
                    };

                    let blob;
                    if (file.slice) {
                        blob = file.slice(0, file.size);
                    } else if (file.webkitSlice) {
                        blob = file.webkitSlice(0, file.size);
                    } else if (file.mozSlice) {
                        blob = file.mozSlice(0, file.size);
                    }
                    reader.readAsDataURL(blob);
                }
            }
        }
    } catch (e) {
        var file = document.getElementById('image').value;
        file = file.replace(/\\/g, '/').split('/').pop();
    // document.getElementById('file-name1').innerHTML = 'Имя: ' + file;
    }
}
