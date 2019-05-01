(function () {
    document.getElementById('SearchInput').addEventListener('input', function () {
        var menus = document.querySelectorAll('.sidebar li');
        var searches = this.value.toLowerCase().split(' ');

        for (var i = 0; i < menus.length; i++) {
            var isMatch = true;

            var menuWords = menus[i].innerText.toLowerCase().split(' ');
            for (var j = 0; j < searches.length; j++) {
                var hasMatch = false;
                for (var k = 0; k < menuWords.length; k++) {
                    if (menuWords[k].indexOf(searches[j]) >= 0) {
                        hasMatch = true;
                    }
                }

                if (!hasMatch) {
                    isMatch = false;
                }
            }

            if (isMatch) {
                menus[i].style.display = '';
            } else {
                menus[i].style.display = 'none';
            }
        }
    });

    [].forEach.call(document.querySelectorAll('form'), function (element) {
        new Wellidate(element);
    });
})();
