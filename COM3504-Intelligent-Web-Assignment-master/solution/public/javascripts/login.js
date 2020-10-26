/**
 * take the login data from the form
 * and create an ajax request
 */
function checkLoginData() {
    const form = $('#loginForm');
    const formObject = getFormObject(form);
    if (objectContainsEmpty(formObject)) {
        showMessage('error', 'Please fill all the fields.');
        return;
    }

    const input = JSON.stringify(formObject);

    // create ajax request
    $.ajax({
        url: '/login_check',
        data: input,
        contentType: 'application/json',
        type: 'POST',
        async: false,
        success: function (dataR) {
            // if login was successful create a cookie with user's username
            // and redirect to the home page
            document.cookie = "username=" + dataR.username;
            document.location.href = '/';

        },
        // the request to the server has failed
        error: function (xhr, status, error) {
            // clear the fields of the form
            document.getElementById("loginForm").reset();
            //show error message
            showMessage('error', error, 3000);
            const dvv = document.getElementById('offline_div');
            if (dvv != null)
                dvv.style.display = 'block';
        }
    });
}