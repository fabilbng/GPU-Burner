const checkForCookie = () => {
    console.log(document.cookie)
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        checkForCookie()
    });
} else {  // `DOMContentLoaded` has already fired
    checkForCookie()
}