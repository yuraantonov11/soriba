function readURL(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();

        reader.onload = function (e) {
            $('.preview-image')
                .attr('src', e.target.result);
        };

        reader.readAsDataURL(input.files[0]);
    }
}
function formatDate(date) {
    const monthNames = [
        'January', 'February', 'March',
        'April', 'May', 'June', 'July',
        'August', 'September', 'October',
        'November', 'December'
    ];

    const day = date.getDate();
    const monthIndex = date.getMonth();
    const year = date.getFullYear();

    return `${day} ${monthNames[monthIndex]} ${year}`;
}

$(document)
    .ready(() => {
        $('[data-toggle="tooltip"]').tooltip();
        const requestUrl = window.location.origin;
        // categories
        // eslint-disable-next-line no-unused-vars
        window.deleteCategory = function (id) {
            fetch(`${requestUrl}/categories/${id}`,
                { method: 'delete' })
                .then((response) => {
                    if (response.status === 200) {
                        return $(`#${id}`)
                            .remove();
                    }
                    alert('error !');
                })
                .catch(() => alert('error !'));
        };
        window.deleteProduct = function (id) {
            $.post({
                url: '/delete-products',
                data: {
                    ids: [id]
                }
            })
                .done(() => {
                    $(`div[data-id=${id}]`)
                        .parent()
                        .parent()
                        .remove();
                })
                .fail(() => {
                    alert('error');
                });
        };
        window.exportProduct = function (id) {
            $.post({
                url: `/products/${id}/export`,
                data: {
                    ids: [id]
                }
            })
                .done(() => {
                    $(`div[data-id=${id}]`)
                        .parent()
                        .parent()
                        .remove();
                })
                .fail(() => {
                    alert('error');
                });
        };

        $('.change-user-role')
            .on('change', function () {
                const conceptName = $(this)
                    .find(':selected')
                    .text()
                    .toLowerCase();

                $.post(`${requestUrl}/users/${this.id}`, { role: conceptName })
                    .done((data) => {
                        if (!data) alert('error !');
                    });
            });


        $('#product-review-modal')
            .on('show.bs.modal', () => {
                const modal = $('#product-review-modal');
                const formData = $('form')
                    .serializeArray();

                const showChoice = formData.some(element => element.name === 'choice');
                modal.find('.bestProduct')
                    .toggle(showChoice);

                formData.forEach((element) => {
                    if (element.name === 'features' && element.value !== '') {
                        modal.find(`.${element.name}`)
                            .append(`<li>${element.value}</li>`);
                    } else if (element.name === 'link') {
                        modal.find(`.${element.name}`)
                            .attr('href', element.value);
                    } else if (element.name === 'price') {
                        modal.find(`.${element.name}`)
                            .text(`$ ${element.value}`);
                    } else if (element.name === 'rating') {
                        const stars = modal.find('.rating>span.fa-star');
                        stars.each(function (index) {
                            $(this)
                                .toggleClass('checked', index < element.value);
                        });
                    } else {
                        modal.find(`.${element.name}`)
                            .text(element.value);
                    }
                });
            });
        $('#product-review-modal')
            .on('hidden.bs.modal', () => {
                const modal = $('#product-review-modal');
                modal.find('.features')
                    .empty();
            });
        $('#imgInp')
            .change(function () {
                readURL(this);
            });
        $('.delete-products')
            .on('click', (e) => {
                e.preventDefault();
                const ids = $.map($('.editable-products .card.selected'), e => e.dataset.id);
                if (!ids.length) return;
                $.post({
                    url: '/delete-products',
                    data: { ids }
                })
                    .done(() => {
                        $('.editable-products .card.selected')
                            .each(function () {
                                $(this)
                                    .parent()
                                    .parent()
                                    .remove();
                            });
                    })
                    .fail(() => {
                        alert('error');
                    });
            });
        $('.editable-products .card')
            .on('click', function () {
                $(this)
                    .toggleClass('selected');
                const ids = $.map($('.editable-products .card.selected'), e => e.dataset.id);
                $('.delete-products')
                    .toggleClass('disabled', !ids.length);
                $('.selected-count')
                    .text(`(${$('.editable-products .card.selected').length})`);
            });


        function initjsGrid() {
            const controls = $('#all-products--actions');
            const MultiselectField = function (config) {
                jsGrid.Field.call(this, config);
            };

            MultiselectField.prototype = new jsGrid.Field({

                items: [],
                textField: '',
                valueField: '',

                _createSelect(selected) {
                    const textField = this.textField;
                    const valueField = this.valueField;
                    const $result = $('<select>')
                        .attr('multiple', '');

                    $.each(this.items, (_, item) => {
                        const text = item[textField];
                        const val = item[valueField];
                        const $opt = $('<option>')
                            .val(val)
                            .text(text);
                        if ($.inArray(val, selected) > -1) {
                            $opt.attr('selected', 'selected');
                        }

                        $result.append($opt);
                    });

                    return $result;
                },

                filterTemplate() {
                    const filterControl = this._filterControl = this._createSelect();

                    // setTimeout(() => {
                    //     filterControl.select({
                    //         allowClear: true
                    //     });
                    // });

                    return filterControl;
                },

                filterValue() {
                    console.log(this._filterControl.find('option:selected'));
                    return this._filterControl.find('option:selected')
                        .map(function () {
                            return this.selected ? $(this)
                                .val() : null;
                        });
                }
            });
            jsGrid.fields.multiselect = MultiselectField;

            let selectedItems = [];

            controls.find('.delete').on('click', function () {
                if ($(this).hasClass('disabled')) return;
                const confirmation = confirm('Do you really want to delete product?');
            });

            $('#jsGrid')
                .jsGrid({
                    height: '70%',
                    width: '100%',
                    selecting: true,
                    filtering: false,
                    inserting: false,
                    editing: false,
                    sorting: true,
                    paging: true,
                    autoload: true,
                    pageSize: 10,
                    pageButtonCount: 5,
                    deleteConfirm: 'Do you really want to delete product?',
                    editItem: (item) => {
                        window.location.href = `/products/${item._id}`;
                    },
                    controller: {
                        loadData(filter) {
                            return $.ajax({
                                type: 'GET',
                                url: '/products',
                                data: filter
                            });
                        },
                        deleteItem(item) {
                            return $.ajax({
                                type: 'POST',
                                url: '/delete-products',
                                data: { ids: [item] }
                            });
                        }
                    },
                    fields: [
                        {
                            itemTemplate(val, item) {
                                return $('<input>')
                                    .attr('type', 'checkbox')
                                    .on('change', function () {
                                        const buttons = controls.find('button');
                                        if ($(this).is(':checked')) {
                                            controls.find('form').append(`<input type="hidden" id=${item._id} value=${item._id} name="products">`);
                                            selectedItems.push(item);
                                            buttons.toggleClass('disabled', selectedItems.length === 0);
                                            if (selectedItems.length === 0) {
                                                buttons.attr('disabled', true);
                                            } else {
                                                buttons.removeAttr('disabled');
                                            }
                                        } else {
                                            controls.find(`#${item._id}`).remove();
                                            selectedItems = $.grep(selectedItems, i => i !== item);
                                            buttons.toggleClass('disabled', selectedItems.length === 0);
                                            if (selectedItems.length === 0) {
                                                buttons.attr('disabled', true);
                                            } else {
                                                buttons.removeAttr('disabled');
                                            }
                                        }
                                    });
                            },
                            align: 'center',
                            width: 30
                        },
                        {
                            name: '_id',
                            title: 'Id',
                            type: 'text',
                            width: 165
                        },
                        {
                            name: 'name',
                            title: 'Name',
                            type: 'text',
                            width: 100
                        },
                        {
                            name: 'price',
                            title: 'Price',
                            type: 'number',
                            align: 'center',
                            width: 50,
                            itemTemplate(value) {
                                return `$ ${value}`;
                            }
                        },
                        {
                            name: 'rating',
                            align: 'center',
                            title: 'Rating',
                            type: 'number',
                            width: 50
                        },
                        {
                            name: 'title',
                            title: 'Title',
                            type: 'text',
                            width: 100
                        },
                        {
                            name: 'createdAt',
                            title: 'Date',
                            itemTemplate(value) {
                                return formatDate(new Date(value));
                            }
                        },
                        {
                            name: 'link',
                            title: 'Link',
                            type: 'text',
                            width: 100,
                            itemTemplate(value) {
                                const $link = $('<a>')
                                    .attr('href', value)
                                    .text('Go To Item');
                                return $('<div>')
                                    .append($link);
                            }
                        },
                        {
                            name: 'categories',
                            title: 'Categories',
                            type: 'text',
                            width: 100,
                            itemTemplate(value) {
                                const names = value.map(i => i.name);
                                const re = new RegExp(',', 'g');
                                return $('<div>').append(names.toString().replace(re, ', '));
                            }
                        },
                        {
                            name: 'imported',
                            title: 'Import',
                            type: 'boolean',
                            width: 30,
                            itemTemplate(value, item) {
                                const inputValue = $('<input>')
                                    .attr({
                                        hidden: true,
                                        name: 'products',
                                        value: item._id
                                    });
                                const importButton = $('<button>')
                                    .attr({
                                        class: 'btn btn-info fas fa-file-import',
                                        disabled: value,
                                        title: 'Import',
                                        type: 'submit'
                                    });
                                return $('<form>')
                                    .attr({
                                        action: '/products/import',
                                        method: 'POST'
                                    })
                                    .append(importButton)
                                    .append(inputValue);
                            }
                        },
                        // {
                        //     name: 'categories',
                        //     title: 'Categories',
                        //     type: 'multiselect',
                        //     items: categories,
                        //     valueField: '_id',
                        //     textField: 'name',
                        //     itemTemplate(value) {
                        //         return 'return'
                        //         console.log(value);
                        //         console.log(categories.find(f => f._id == value.toString())
                        // .name);
                        //         return categories.find(f => f._id == value.toString()).name;
                        //     }
                        // },
                        {
                            type: 'control',
                            width: 50
                        }

                    ]
                });
        }

        initjsGrid();
    });
