/**
 * register a user
 * send ajax request and add to database if success
 */
function registerUser() {

    const form = $('#registerForm');
    const formObject = getFormObject(form);
    if (objectContainsEmpty(formObject)) {
        showMessage('error', 'Please fill all the fields.');
        return;
    }
    const input = JSON.stringify(formObject);

    // send ajax request
    $.ajax({
        url: '/register_user',
        data: input,
        contentType: 'application/json',
        type: 'POST',
        async: false,
        success: function (dataR) {
            // if success redirect to login page
            document.location.href = '/login';
        },
        // the request to the server has failed.
        error: function (xhr, status, error) {
            // clear the fields of the form
            document.getElementById("registerForm").reset();
            // show error message
            showMessage('error', error, 3000);
            const dvv = document.getElementById('offline_div');
            if (dvv != null)
                dvv.style.display = 'block';
        }
    });

}