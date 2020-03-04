Client side javascript validation library

![Semantic](https://img.shields.io/badge/sem-ver-lightgrey.svg?style=plastic)
![Npm](https://img.shields.io/npm/v/wellidate.svg?style=plastic)
![License](https://img.shields.io/badge/license-MIT-green.svg?style=plastic)

### Installation

Include wellidate in the page. Then initialize wellidate instance.

```html
<html>
    <body>
        <form>
            <input required>

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
