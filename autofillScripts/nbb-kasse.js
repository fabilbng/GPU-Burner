const nbbStartAutofill = () => {
    getOptions().then(options => {
        $("[name='newbilling[firstname]']").attr("value", options.firstName)
        $("[name='newbilling[lastname]']").attr("value", options.lastName)
        $("[name='newbilling[street_address]']").attr("value", options.streetName)
        $("[name='newbilling[postcode]']").attr("value", options.postcode)
        $("[name='newbilling[city]']").attr("value", options.city)
        $("[name='newbilling[street_address_number]']").attr("value", options.streetNumber)
        $("[name='newbilling[email_address]']").attr("value", options.email)
        $("[name='newbilling[telephone]']").attr("value", options.phoneNumber)
    })
}


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        nbbStartAutofill()
    });
} else {  // `DOMContentLoaded` has already fired
    nbbStartAutofill()
}

