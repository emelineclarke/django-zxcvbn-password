$(function($) {
    var match_passwords = function(password_field, confirmation_fields) {
        // Optional parameter: if no specific confirmation field is given, check all
        if( confirmation_fields === undefined ) { confirmation_fields = $('.password_confirmation') }
        if( confirmation_fields === undefined ) { return; }

        var password = password_field.val();

        confirmation_fields.each(function(index, confirm_field) {
            var confirm_value = $(confirm_field).val();
            var confirm_with = $(confirm_field).data('confirm-with');

            if( confirm_with && confirm_with == password_field.attr('id')) {
                if( confirm_value && password ) {
                    if (confirm_value === password) {
                        $(confirm_field).parent().find('.password_strength_info').addClass('d-none');
                    } else {
                        $(confirm_field).parent().find('.password_strength_info').removeClass('d-none');
                    }
                } else {
                    $(confirm_field).parent().find('.password_strength_info').addClass('d-none');
                }
            }
        });

        // If a password field other than our own has been used, add the listener here
        if( !password_field.hasClass('password_strength') && !password_field.data('password-listener') ) {
            password_field.on('keyup', function() {
                match_passwords($(this));
            });
            password_field.data('password-listener', true);
        }
    };

    $('.password_strength').on('keyup', function() {
        var password_strength_bar = $(this).parent().find('.password_strength_bar');
        var password_strength_info = $(this).parent().find('.password_strength_info');

        var min_score = parseInt(password_strength_bar.attr('aria-valuemin'));

        if( $(this).val() ) {
            var result = zxcvbn($(this).val());
            var crack_time = result.crack_times_display.online_no_throttling_10_per_second;

            if (result.score < 1) {
                password_strength_bar.removeClass('bg-success bg-warning').addClass('bg-danger');
                password_strength_info.find('.label').removeClass('d-none');
            } else if (result.score < min_score) {
                password_strength_bar.removeClass('bg-success bg-danger').addClass('bg-warning');
                password_strength_info.find('.label').removeClass('d-none');
            } else {
                password_strength_bar.removeClass('bg-warning bg-danger').addClass('bg-success');
                password_strength_info.find('.label').addClass('d-none');
            }

            password_strength_bar.width( ((result.score+1)/5)*100 + '%' ).attr('aria-valuenow', result.score + 1);
            password_strength_info.find('.password_strength_time').html(crack_time);
            password_strength_info.removeClass('d-none');
        } else {
            password_strength_bar.removeClass('bg-success').addClass('bg-warning');
            password_strength_bar.width( '0%' ).attr('aria-valuenow', 0);
            password_strength_info.addClass('d-none');
        }
        match_passwords($(this));
    });

    var timer = null;
    $('.password_confirmation').on('keyup', function() {
        var password_field;
        var confirm_with = $(this).data('confirm-with');

        if( confirm_with ) {
            password_field = $('#' + confirm_with);
        } else {
            password_field = $('.password_strength');
        }

        if (timer !== null) clearTimeout(timer);

        timer = setTimeout(function(){
            match_passwords(password_field);
        }, 400);
    });
});
