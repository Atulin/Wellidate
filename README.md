Client side javascript validation library

![Semantic](https://img.shields.io/badge/sem-ver-lightgrey.svg?style=plastic)
![Npm](https://img.shields.io/npm/v/wellidate.svg?style=plastic)
![License](https://img.shields.io/badge/license-MIT-green.svg?style=plastic)

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
