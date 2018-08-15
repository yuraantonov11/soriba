function readURL(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();

        reader.onload = function (e) {
            $('.preview-image').attr('src', e.target.result);
        };

        reader.readAsDataURL(input.files[0]);
    }
}
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
            .done((data) => {
                if (!data) alert('error !');
            });
    });

    $('#product-review-modal').on('show.bs.modal', () => {
        const modal = $('#product-review-modal');
        const formData = $('form').serializeArray();

        const showChoice = formData.some(element => element.name === 'choice');
        modal.find('.bestProduct').toggle(showChoice);

        formData.forEach((element) => {
            if (element.name === 'features' && element.value !== '') {
                modal.find(`.${element.name}`).append(`<li>${element.value}</li>`);
            } else if (element.name === 'link') {
                modal.find(`.${element.name}`).attr('href', element.value);
            } else if (element.name === 'rating') {
                const stars = modal.find('.rating>span.fa-star');
                stars.each(function (index) {
                    $(this).toggleClass('checked', index < element.value);
                });
            } else {
                modal.find(`.${element.name}:empty`).text(element.value);
            }
        });
    });
    $('#product-review-modal').on('hidden.bs.modal', () => {
        const modal = $('#product-review-modal');
        console.log(modal.find('.features'));
        modal.find('.features').empty();
    });
    $('#imgInp').change(function () {
        readURL(this);
    });
});
