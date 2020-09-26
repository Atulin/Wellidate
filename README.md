Client side javascript validation library

[![License](https://img.shields.io/badge/license-MIT-green.svg?style=plastic)](https://opensource.org/licenses/MIT)
[![Semantic](https://img.shields.io/badge/sem-ver-lightgrey.svg?style=plastic)](https://semver.org/)
[![Npm](https://img.shields.io/npm/v/wellidate.svg?style=plastic)](https://www.npmjs.com/package/wellidate)
[![Tip](https://img.shields.io/badge/tip-paypal-blue.svg?style=plastic&logo=paypal)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=CGQTQRG8AADYE&source=url)
### Installation

Include wellidate in the page. Then initialize wellidate instance.
Validation can be defined through native html, data attributes or javascript code.

```html
<html>
    <body>
        <form>
            <input name="username" required maxlength="50">

            <input name="email" type="email">

            <input name="age" data-val-integer="Age must be an integer">

            <button>Submit</button>
        </form>

        <script src="/scripts/wellidate.js"></script>
        <script>
            [].forEach.call(document.getElementsByTagName("form"), form => {
                new Wellidate(form);
            });
        </script>
    </body>
</html>
```
