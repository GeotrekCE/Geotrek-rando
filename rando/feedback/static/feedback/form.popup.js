// using jQuery
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
var csrftoken = getCookie('csrftoken');

function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

$.ajaxSetup({
    crossDomain: false, // obviates need for sameOrigin test
    beforeSend: function(xhr, settings) {
        if (!csrfSafeMethod(settings.type)) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    }
});

$(window).on("view:detail", function (e) {

    var feedbackUrl = $("#popup-feedback").data('url');

    $('.feedback').on('click', function(event) {

        event.preventDefault();

        $('#popup-feedback').on('hidden', function () {
            $(this).find('form').remove();
        });

        $.get(feedbackUrl, function(data) {
            $('#popup-feedback .modal-body').append(data);
            $("#popup-feedback").modal('show');
        });
    });

    $('#popup-feedback').on('click', 'button[type="submit"]', function(event) {

        event.preventDefault();

        var nameValue = $('#feedback-form [name="name"]').val();
        var emailValue = $('#feedback-form [name="email"]').val();
        var categoryValue = $('#feedback-form [name="category"]').val();
        var commentValue = $('#feedback-form [name="comment"]').val();

        var postValues = {'name': nameValue,
                          'email': emailValue,
                          'category': categoryValue,
                          'comment': commentValue}

        $.post(feedbackUrl, postValues, function(data) {
            if (data['status'] == 'NOK') {
                $('#popup-feedback .modal-body form').replaceWith(data['data']);
            }
            else {
                $("#popup-feedback").modal('hide');
            }
        });
    });

});
