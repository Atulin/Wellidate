Client side javascript validation library

![Semantic](https://img.shields.io/badge/sem-ver-lightgrey.svg?style=plastic)
![Npm](https://img.shields.io/npm/v/wellidate.svg?style=plastic)
![License](https://img.shields.io/badge/license-MIT-green.svg?style=plastic)

### Installation

Include wellidate in the page. Then initialize wellidate instance and call the `validate` method.

```html
<html>
    <body>
        ...

        <script src="/scripts/wellidate.js"></script>
        <script>
            [].forEach.call(document.getElementsByTagName('form'), function (form) {
                new Wellidate(form);
            });
        </script>
    </body>
</html>
```
